/* Service worker for the Pokédex PWA.
 *
 * This is a template: scripts/build-pwa.js copies it to dist/sw.js after `expo export` and
 * fills in the three placeholder values below (version, base path, precache list).
 *
 *  - App shell (HTML, JS, fonts, icons): precached on install, served cache-first, so the app
 *    opens with no connection.
 *  - PokeAPI JSON, artwork/sprites and cries: cached the first time you view them and then
 *    served cache-first. PokeAPI data is effectively static, so there is no revalidation.
 */
const VERSION = '__VERSION__';
const BASE = '__BASE__'; // '' at the site root, or e.g. '/pokemon_react' on GitHub Pages
const PRECACHE = __PRECACHE__;

const SHELL_CACHE = `shell-${VERSION}`;
// Bump a suffix to throw that cache away on the next deploy.
const API_CACHE = 'pokedex-api-v1';
const IMAGE_CACHE = 'pokedex-img-v1';
const AUDIO_CACHE = 'pokedex-audio-v1';
// Sized so a full "Download everything" (src/lib/offline.js) fits with room to spare.
const MAX_ENTRIES = { [API_CACHE]: 20000, [IMAGE_CACHE]: 8000, [AUDIO_CACHE]: 2000 };
const RUNTIME = new Set([API_CACHE, IMAGE_CACHE, AUDIO_CACHE]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // cache: 'reload' skips the browser's HTTP cache so we never precache a stale file.
      await cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys(); // oldest first
      // Keep this version's shell and the one before it: a page that is still open on the old
      // version keeps asking for the old version's lazy-loaded route chunks.
      const previous = names.filter((n) => n.startsWith('shell-') && n !== SHELL_CACHE).slice(-1);
      const keep = new Set([SHELL_CACHE, ...previous]);
      for (const name of names) {
        const isShell = name.startsWith('shell-');
        if (isShell ? !keep.has(name) : !RUNTIME.has(name)) await caches.delete(name);
      }
      await self.clients.claim();
    })()
  );
});

/** Which runtime cache (if any) a cross-origin URL belongs to. */
function runtimeCacheFor(url) {
  if (url.hostname === 'pokeapi.co' && url.pathname.startsWith('/api/')) return API_CACHE;
  if (url.hostname === 'raw.githubusercontent.com' && url.pathname.startsWith('/PokeAPI/')) {
    return /\.(ogg|mp3|wav|m4a)$/i.test(url.pathname) ? AUDIO_CACHE : IMAGE_CACHE;
  }
  return null;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(request.mode === 'navigate' ? appShell(request) : sameOrigin(request));
    return;
  }
  const cacheName = runtimeCacheFor(url);
  if (cacheName) event.respondWith(cacheFirst(event, cacheName));
});

function urlVariants(url) {
  const literal = url.replace(/%5B/gi, '[').replace(/%5D/gi, ']');
  const encoded = url.replace(/\[/g, '%5B').replace(/\]/g, '%5D');
  return [...new Set([url, literal, encoded])];
}

/** Look a URL up in the app-shell caches only (current version first), not the large data caches. */
async function matchShell(url) {
  const names = (await caches.keys()).filter((n) => n.startsWith('shell-'));
  const ordered = [SHELL_CACHE, ...names.reverse().filter((n) => n !== SHELL_CACHE)].filter((n) => names.includes(n));
  for (const name of ordered) {
    const cache = await caches.open(name);
    for (const variant of urlVariants(url)) {
      const hit = await cache.match(variant);
      if (hit) return hit;
    }
  }
  return undefined;
}

/** Every in-scope page load gets the single-page app's index.html. */
async function appShell(request) {
  const cached = await matchShell(new URL(`${BASE}/index.html`, self.location.origin).href);
  if (cached) return cached;
  try {
    return await fetch(request);
  } catch {
    return new Response('Offline, and the app has not finished installing yet.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function sameOrigin(request) {
  const cached = await matchShell(request.url);
  return cached || fetch(request);
}

async function cacheFirst(event, cacheName) {
  const { request } = event;
  const cache = await caches.open(cacheName);
  // Key on the bare URL so Range headers and the like never create duplicate entries.
  const key = request.url;
  const wantsRange = request.headers.has('range');

  const hit = await cache.match(key);
  if (hit) return wantsRange ? sliceForRange(request, hit) : hit;

  let response;
  try {
    // CORS fetch (PokeAPI and GitHub raw both allow it) gives a normal, inspectable response
    // instead of an opaque one, and always the full body even if the page asked for a range.
    response = await fetch(key, { mode: 'cors', credentials: 'omit' });
  } catch {
    try {
      return await fetch(request); // not CORS-enabled after all: pass through, uncached
    } catch {
      return Response.error();
    }
  }

  if (response.status === 200) {
    event.waitUntil(
      cache.put(key, response.clone()).then(() => {
        // Counting entries is slow on a big cache, so only check now and then.
        if (Math.random() < 0.01) return trim(cache, MAX_ENTRIES[cacheName]);
      })
    );
  }
  return wantsRange && response.status === 200 ? sliceForRange(request, response) : response;
}

/** Oldest entries go first once a cache grows past its limit. */
async function trim(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

/** Safari insists on a proper 206 for audio/video, so answer Range requests from a full body. */
async function sliceForRange(request, response) {
  const body = await response.clone().arrayBuffer();
  const total = body.byteLength;
  const match = /bytes=(\d*)-(\d*)/.exec(request.headers.get('range') || '');
  if (!match) return response;
  let start = match[1] === '' ? 0 : Number(match[1]);
  let end = match[2] === '' ? total - 1 : Math.min(Number(match[2]), total - 1);
  if (match[1] === '' && match[2] !== '') {
    start = Math.max(0, total - Number(match[2])); // "last N bytes"
    end = total - 1;
  }
  if (start > end || start >= total) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
  }
  return new Response(body.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Content-Length': String(end - start + 1),
    },
  });
}
