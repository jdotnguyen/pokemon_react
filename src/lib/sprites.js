// Image and sound URLs for PokeAPI resources (official artwork, item sprites, cries).

export function artworkUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

// Shiny official artwork lives under a /shiny subfolder, keyed by the same id.
export function shinyArtworkUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
}

export function itemSpriteUrl(name) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${name}.png`;
}

/**
 * Pick the artwork for a Pokémon payload, preferring what the API says it has
 * and falling back to the conventional sprite URL. Returns null for shiny when
 * the form has no shiny artwork.
 */
export function pickArtwork(pokemon, id, shiny = false) {
  const art = pokemon?.sprites?.other?.['official-artwork'];
  if (shiny) return art?.front_shiny ?? (pokemon ? null : shinyArtworkUrl(id));
  return art?.front_default ?? artworkUrl(id);
}

// Pick the cry URL: current games first, falling back to the legacy recording.
export function cryUrl(pokemon) {
  return pokemon?.cries?.latest ?? pokemon?.cries?.legacy ?? null;
}
