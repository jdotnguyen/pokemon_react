import {
  areaLabel,
  generationLabel,
  levelRange,
  locationLabel,
  summarizeEncounters,
  versionGroupLabel,
} from '../regions';

describe('region helpers', () => {
  it('labels generations and version groups', () => {
    expect(generationLabel('generation-iv')).toBe('Generation IV');
    expect(versionGroupLabel('gold-silver')).toBe('Gold & Silver');
    expect(versionGroupLabel('firered-leafgreen')).toBe('FireRed & LeafGreen');
    expect(versionGroupLabel('crystal')).toBe('Crystal');
  });

  it('strips region and location prefixes', () => {
    expect(locationLabel('kanto-route-1', 'kanto')).toBe('Route 1');
    expect(locationLabel('pallet-town', 'kanto')).toBe('Pallet Town');
    expect(areaLabel('mt-moon-b1f', 'mt-moon')).toBe('B1F');
    expect(areaLabel('kanto-route-1-area', 'kanto-route-1')).toBe('Main area');
  });

  it('formats level ranges', () => {
    expect(levelRange(2, 5)).toBe('Lv. 2–5');
    expect(levelRange(3, 3)).toBe('Lv. 3');
    expect(levelRange(null, null)).toBe('');
  });

  it('collapses encounters into one row per Pokémon', () => {
    const area = {
      pokemon_encounters: [
        {
          pokemon: { name: 'rattata', url: 'https://pokeapi.co/api/v2/pokemon/19/' },
          version_details: [
            {
              version: { name: 'red' },
              max_chance: 45,
              encounter_details: [
                { min_level: 2, max_level: 3, method: { name: 'walk' } },
                { min_level: 4, max_level: 4, method: { name: 'walk' } },
              ],
            },
            { version: { name: 'blue' }, max_chance: 30, encounter_details: [{ min_level: 2, max_level: 2, method: { name: 'walk' } }] },
          ],
        },
        {
          pokemon: { name: 'pidgey', url: 'https://pokeapi.co/api/v2/pokemon/16/' },
          version_details: [{ version: { name: 'red' }, max_chance: 55, encounter_details: [{ min_level: 2, max_level: 5, method: { name: 'walk' } }] }],
        },
      ],
    };
    expect(summarizeEncounters(area)).toEqual([
      { id: 16, name: 'pidgey', versions: ['red'], methods: ['walk'], minLevel: 2, maxLevel: 5, chance: 55 },
      { id: 19, name: 'rattata', versions: ['red', 'blue'], methods: ['walk'], minLevel: 2, maxLevel: 4, chance: 45 },
    ]);
  });
});
