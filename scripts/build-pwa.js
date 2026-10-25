#!/usr/bin/env node
/**
 * Turns the output of `expo export -p web` into an installable, offline-capable PWA.
 *
 *   EXPO_BASE_URL=/pokemon_react npx expo export -p web && node scripts/build-pwa.js
 *
 * (or just `yarn build:web` / `npm run build:web`). EXPO_BASE_URL must be the same value for both
 * steps: empty for a site served at the domain root, "/repo-name" for GitHub Pages.
 *
 * It adds to dist/: the web manifest, icons, iOS home-screen meta tags and the service worker
 * (pwa/sw.js with the list of files to precache filled in), plus .nojekyll and a 404.html copy
 * of index.html so deep links work on GitHub Pages.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.resolve(process.argv[2] || path.join(ROOT, 'dist'));
const PWA = path.join(ROOT, 'pwa');

const THEME = '#6C79DB'; // app accent (splash wordmark dot)
// Status bar + browser chrome colour. Matches the screens' white background so iOS doesn't paint a
// tinted, blurred band above the app.
const CHROME = '#ffffff';
const NAME = 'Nguyendex';
const TAGLINE = 'Gotta Nguyen ’em all';

function normaliseBase(raw = '') {
  const trimmed = raw.trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}` : '';
}
const BASE = normaliseBase(process.env.EXPO_BASE_URL);

function fail(message) {
  console.error(`build-pwa: ${message}`);
  process.exit(1);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const indexPath = path.join(DIST, 'index.html');
if (!fs.existsSync(indexPath)) fail(`${indexPath} not found. Run "expo export -p web" first.`);

// 1. Icons
fs.cpSync(path.join(PWA, 'icons'), path.join(DIST, 'icons'), { recursive: true });

// 2. Manifest
const manifest = {
  id: `${BASE}/`,
  name: NAME,
  short_name: NAME,
  description: `${TAGLINE}. A Pokédex built on PokeAPI that works offline.`,
  start_url: `${BASE}/`,
  scope: `${BASE}/`,
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#ffffff',
  theme_color: CHROME,
  icons: [
    { src: `${BASE}/icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: `${BASE}/icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: `${BASE}/icons/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
fs.writeFileSync(path.join(DIST, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));

// Splash screen: plain HTML/CSS in index.html so it paints on the first frame, before any JavaScript
// has loaded. The app calls window.__hideSplash() once it has mounted (src/app/_layout.js), and a
// timeout hides it regardless so it can never get stuck.
const POKEBALL_SVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
        <path d="M50 4a46 46 0 0 1 46 46H4A46 46 0 0 1 50 4z" fill="#EE4B4B"/>
        <path d="M4 50h92a46 46 0 0 1-92 0z" fill="#fff"/>
        <circle cx="50" cy="50" r="46" fill="none" stroke="#1F2A37" stroke-width="7"/>
        <path d="M4 50h92" stroke="#1F2A37" stroke-width="7"/>
        <circle cx="50" cy="50" r="15" fill="#1F2A37"/>
        <circle cx="50" cy="50" r="8.5" fill="#fff"/>
      </svg>`;
const SPLASH_HEAD = `<style data-pwa>
      html, body { background: ${CHROME}; }
      #pwa-splash {
        position: fixed; inset: 0; z-index: 2147483647;
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px;
        background: ${CHROME};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        transition: opacity 320ms ease;
      }
      #pwa-splash.is-hiding { opacity: 0; pointer-events: none; }
      #pwa-splash svg { width: 84px; height: 84px; transform-origin: 50% 85%; animation: pwa-wobble 1.8s ease-in-out infinite; }
      #pwa-splash p { margin: 0; font-size: 22px; font-weight: 800; color: #1F2A37; letter-spacing: 0.2px; }
      #pwa-splash p span { color: ${THEME}; }
      #pwa-splash small { margin-top: -12px; font-size: 14px; font-weight: 500; color: #8A94A1; }
      @keyframes pwa-wobble {
        0%, 50%, 100% { transform: rotate(0); }
        8% { transform: rotate(-14deg); } 18% { transform: rotate(11deg); }
        28% { transform: rotate(-7deg); } 38% { transform: rotate(3deg); }
      }
      @media (prefers-reduced-motion: reduce) { #pwa-splash svg { animation: none; } }
    </style>`;
const SPLASH_BODY = `<div id="pwa-splash" role="status" aria-label="Loading ${NAME}">
      ${POKEBALL_SVG}
      <p>${NAME}<span>.</span></p>
      <small>${TAGLINE}</small>
    </div>
    <script data-pwa>
      (function () {
        var shownAt = Date.now();
        window.__hideSplash = function () {
          var el = document.getElementById('pwa-splash');
          if (!el || el.getAttribute('data-hiding')) return;
          el.setAttribute('data-hiding', '1');
          // Stay up at least 450 ms so a fast (cached) launch doesn't flash, then fade out.
          setTimeout(function () {
            requestAnimationFrame(function () {
              el.classList.add('is-hiding');
              setTimeout(function () { el.remove(); }, 360);
            });
          }, Math.max(0, 450 - (Date.now() - shownAt)));
        };
        setTimeout(window.__hideSplash, 10000);
      })();
    </script>`;

// 3. index.html: manifest link, iOS home-screen tags, full-screen viewport, service worker registration
let html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes('data-pwa')) {
  const headTags = [
    `<link data-pwa rel="manifest" href="${BASE}/manifest.webmanifest" />`,
    `<link data-pwa rel="apple-touch-icon" href="${BASE}/icons/apple-touch-icon.png" />`,
    `<meta data-pwa name="apple-mobile-web-app-capable" content="yes" />`,
    `<meta data-pwa name="mobile-web-app-capable" content="yes" />`,
    `<meta data-pwa name="apple-mobile-web-app-title" content="${NAME}" />`,
    `<meta data-pwa name="apple-mobile-web-app-status-bar-style" content="default" />`,
    `<meta data-pwa name="theme-color" content="${CHROME}" />`,
    `<link data-pwa rel="icon" type="image/svg+xml" href="${BASE}/icons/favicon.svg" />`,
    SPLASH_HEAD,
  ].join('\n    ');

  // viewport-fit=cover lets the app draw under the notch; safe-area-context then insets it.
  if (/<meta[^>]+name="viewport"[^>]*>/i.test(html)) {
    html = html.replace(/(<meta[^>]+name="viewport"[^>]*content=")([^"]*)(")/i, (m, a, content, c) =>
      /viewport-fit/.test(content) ? m : `${a}${content}, viewport-fit=cover${c}`
    );
  } else {
    html = html.replace('</head>', `    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />\n  </head>`);
  }

  const register = `<script data-pwa>
      if ('serviceWorker' in navigator) {
        // When a new version takes over, reload so the page and its route chunks match.
        var hadController = !!navigator.serviceWorker.controller;
        var reloading = false;
        navigator.serviceWorker.addEventListener('controllerchange', function () {
          if (!hadController || reloading) return;
          reloading = true;
          window.location.reload();
        });
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('${BASE}/sw.js', { scope: '${BASE}/' }).catch(function (e) {
            console.warn('Service worker registration failed', e);
          });
          // Ask the browser not to evict the offline cache under storage pressure.
          if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
        });
      }
    </script>`;

  if (!html.includes('</head>') || !html.includes('</body>')) fail('index.html has no </head> or </body>.');
  html = html.replace('</head>', `    ${headTags}\n  </head>`).replace('</body>', `    ${register}\n  </body>`);
  html = html.replace(/<body[^>]*>/i, (m) => `${m}\n    ${SPLASH_BODY}`);
  fs.writeFileSync(indexPath, html);
}

// 4. Service worker with the precache list filled in
const SKIP = new Set(['sw.js', '404.html', '.nojekyll']);
const files = walk(DIST)
  .map((full) => ({ rel: path.relative(DIST, full).split(path.sep).join('/'), size: fs.statSync(full).size }))
  .filter(({ rel }) => !SKIP.has(rel) && !rel.endsWith('.map'))
  .sort((a, b) => a.rel.localeCompare(b.rel));

// Brackets stay literal: Expo requests route chunks as /[id]-hash.js and the cache is keyed by URL.
const encodeSegment = (s) => encodeURIComponent(s).replace(/%5B/g, '[').replace(/%5D/g, ']');
const toUrl = (rel) => `${BASE}/${rel.split('/').map(encodeSegment).join('/')}`;
const precache = files.map(({ rel }) => toUrl(rel));

// The version changes whenever any file name or size does (Expo hashes its bundle names).
const version = crypto
  .createHash('sha1')
  .update(files.map((f) => `${f.rel}:${f.size}`).join('\n'))
  .digest('hex')
  .slice(0, 10);

const sw = fs
  .readFileSync(path.join(PWA, 'sw.js'), 'utf8')
  .replace('__VERSION__', () => version)
  .replace('__BASE__', () => BASE)
  .replace('__PRECACHE__', () => JSON.stringify(precache, null, 2));
fs.writeFileSync(path.join(DIST, 'sw.js'), sw);

// 5. Hosting niceties (harmless elsewhere)
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
fs.copyFileSync(indexPath, path.join(DIST, '404.html'));

// Netlify (and Cloudflare Pages): send unknown paths to the single-page app. Only for root hosting.
// /_expo/* comes first so a missing script is a real 404 rather than index.html served as JavaScript.
if (!BASE) fs.writeFileSync(path.join(DIST, '_redirects'), '/_expo/*  /404.html  404\n/*  /index.html  200\n');

const totalMb = files.reduce((n, f) => n + f.size, 0) / 1024 / 1024;
console.log(
  `build-pwa: ${files.length} files (${totalMb.toFixed(1)} MB) precached, version ${version}, base "${BASE || '/'}"`
);
