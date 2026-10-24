import {
  cryUrl,
  heldItems,
  pickArtwork,
  speciesBadges,
  speciesVarieties,
  varietyLabel,
} from '../format';

describe('varietyLabel', () => {
  it('labels the default form Normal', () => {
    expect(varietyLabel('raichu', 'raichu', true)).toBe('Normal');
  });
  it('strips the species prefix', () => {
    expect(varietyLabel('raichu', 'raichu-alola')).toBe('Alola');
    expect(varietyLabel('charizard', 'charizard-mega-x')).toBe('Mega X');
  });
});

describe('speciesVarieties', () => {
  it('puts the default first and resolves ids', () => {
    const species = {
      name: 'raichu',
      varieties: [
        { is_default: false, pokemon: { name: 'raichu-alola', url: 'https://pokeapi.co/api/v2/pokemon/10100/' } },
        { is_default: true, pokemon: { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' } },
      ],
    };
    const result = speciesVarieties(species);
    expect(result.map((v) => v.id)).toEqual([26, 10100]);
    expect(result.map((v) => v.label)).toEqual(['Normal', 'Alola']);
  });
  it('handles missing species', () => {
    expect(speciesVarieties(undefined)).toEqual([]);
  });
});

describe('pickArtwork', () => {
  const pokemon = {
    sprites: { other: { 'official-artwork': { front_default: 'a.png', front_shiny: 's.png' } } },
  };
  it('uses payload urls', () => {
    expect(pickArtwork(pokemon, 1)).toBe('a.png');
    expect(pickArtwork(pokemon, 1, true)).toBe('s.png');
  });
  it('returns null when a loaded form has no shiny art', () => {
    expect(pickArtwork({ sprites: { other: {} } }, 1, true)).toBeNull();
  });
  it('falls back to conventional urls before the payload loads', () => {
    expect(pickArtwork(undefined, 25)).toContain('/official-artwork/25.png');
    expect(pickArtwork(undefined, 25, true)).toContain('/official-artwork/shiny/25.png');
  });
});

describe('heldItems / speciesBadges / cryUrl', () => {
  it('uses the latest version rarity', () => {
    const held = [{ item: { name: 'oran-berry' }, version_details: [{ rarity: 50 }, { rarity: 5 }] }];
    expect(heldItems(held)).toEqual([{ name: 'oran-berry', rarity: 5 }]);
    expect(heldItems(undefined)).toEqual([]);
  });
  it('lists species badges', () => {
    expect(speciesBadges({ is_legendary: true, is_baby: true })).toEqual(['Legendary', 'Baby']);
    expect(speciesBadges(undefined)).toEqual([]);
  });
  it('prefers latest cry', () => {
    expect(cryUrl({ cries: { latest: 'l.ogg', legacy: 'o.ogg' } })).toBe('l.ogg');
    expect(cryUrl({ cries: { legacy: 'o.ogg' } })).toBe('o.ogg');
    expect(cryUrl({})).toBeNull();
  });
});
