import { dexPokemonOfType, typeMatchups } from '../typeInfo';

const ref = (name, id, kind = 'pokemon') => ({ name, url: `https://pokeapi.co/api/v2/${kind}/${id}/` });

describe('type helpers', () => {
  it('lists National Dex Pokémon of a type in order, without alternate forms', () => {
    const data = {
      pokemon: [
        { slot: 1, pokemon: ref('charmeleon', 5) },
        { slot: 1, pokemon: ref('charizard-mega-y', 10035) },
        { slot: 1, pokemon: ref('charmander', 4) },
      ],
    };
    expect(dexPokemonOfType(data)).toEqual([
      { id: 4, name: 'charmander' },
      { id: 5, name: 'charmeleon' },
    ]);
  });

  it('groups matchups and drops non-battle types', () => {
    const data = {
      damage_relations: {
        double_damage_to: [{ name: 'grass' }, { name: 'stellar' }],
        half_damage_to: [{ name: 'water' }],
        no_damage_to: [],
        double_damage_from: [{ name: 'water' }],
        half_damage_from: [{ name: 'fire' }],
        no_damage_from: [],
      },
    };
    const m = typeMatchups(data);
    expect(m.attacking[0]).toEqual({ title: 'Super effective against', multiplier: '2×', types: ['grass'] });
    expect(m.defending.map((g) => g.types)).toEqual([['water'], ['fire'], []]);
  });
});
