// Text search used by the Pokémon pickers/grids and by the Explore lists.
import { formatName } from './format';

// Name ("char") or number ("4", "#004") search over { name, id } entries.
export function matchesQuery(item, query) {
  const q = query.trim().toLowerCase().replace(/^#/, '');
  if (!q) return true;
  if (/^\d+$/.test(q)) return String(item.id).startsWith(String(Number(q)));
  return item.name.includes(q.replace(/\s+/g, '-')) || formatName(item.name).toLowerCase().includes(q);
}

/** Filter { label, search? } items by a free-text query (every word must match). */
export function filterByQuery(items = [], query = '') {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return items;
  return items.filter((item) => {
    const hay = `${item.label} ${item.search ?? ''}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
