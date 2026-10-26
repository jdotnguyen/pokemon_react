import { formatHeight, formatName, formatWeight, genderRatio, idFromUrl, padId } from '../format';
import { evolutionPairs } from '../species';
import { levelUpMoves } from '../moves';
import { typeDefenses } from '../typeInfo';

const species = (name, id) => ({ name, url: `https://pokeapi.co/api/v2/pokemon-species/${id}/` });

describe('format helpers', () => {
  it('pads ids and parses resource urls', () => {
    expect(padId(1)).toBe('#001');
    expect(padId(1025)).toBe('#1025');
    expect(idFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
  });

  it('formats names', () => {
    expect(formatName('bulbasaur')).toBe('Bulbasaur');
    expect(formatName('nidoran-f')).toBe('Nidoran♀');
    expect(formatName('solar-beam')).toBe('Solar Beam');
  });

  it('converts Bulbasaur height and weight', () => {
    expect(formatHeight(7)).toBe('2\'4" (0.70 m)');
    expect(formatWeight(69)).toBe('15.2 lbs (6.9 kg)');
  });

  it('computes gender ratios', () => {
    expect(genderRatio(1)).toEqual({ male: 87.5, female: 12.5 });
    expect(genderRatio(-1)).toBeNull();
  });

  it('combines dual-type defenses', () => {
    const grass = {
      damage_relations: {
        double_damage_from: [{ name: 'fire' }, { name: 'ice' }, { name: 'flying' }, { name: 'poison' }, { name: 'bug' }],
        half_damage_from: [{ name: 'ground' }, { name: 'water' }, { name: 'grass' }, { name: 'electric' }],
        no_damage_from: [],
      },
    };
    const poison = {
      damage_relations: {
        double_damage_from: [{ name: 'ground' }, { name: 'psychic' }],
        half_damage_from: [{ name: 'fighting' }, { name: 'poison' }, { name: 'bug' }, { name: 'grass' }, { name: 'fairy' }],
        no_damage_from: [],
      },
    };
    const m = typeDefenses([grass, poison], ['fire', 'grass', 'poison', 'ground', 'normal']);
    expect(m).toMatchObject({ fire: 2, grass: 0.25, poison: 1, ground: 1, normal: 1 });
  });

  it('flattens branching evolution chains', () => {
    const chain = {
      species: species('eevee', 133),
      evolves_to: [
        { species: species('vaporeon', 134), evolution_details: [{ item: { name: 'water-stone' } }], evolves_to: [] },
        { species: species('jolteon', 135), evolution_details: [{ item: { name: 'thunder-stone' } }], evolves_to: [] },
      ],
    };
    expect(evolutionPairs(chain)).toEqual([
      { from: { name: 'eevee', id: 133 }, to: { name: 'vaporeon', id: 134 }, trigger: 'Water Stone' },
      { from: { name: 'eevee', id: 133 }, to: { name: 'jolteon', id: 135 }, trigger: 'Thunder Stone' },
    ]);
  });

  it('picks level-up moves from the newest version group', () => {
    const vg = (id) => ({ name: `vg${id}`, url: `https://pokeapi.co/api/v2/version-group/${id}/` });
    const levelUp = { name: 'level-up' };
    const moves = [
      { move: { name: 'vine-whip' }, version_group_details: [{ level_learned_at: 3, move_learn_method: levelUp, version_group: vg(25) }] },
      { move: { name: 'tackle' }, version_group_details: [{ level_learned_at: 1, move_learn_method: levelUp, version_group: vg(25) }] },
      { move: { name: 'old-move' }, version_group_details: [{ level_learned_at: 5, move_learn_method: levelUp, version_group: vg(1) }] },
    ];
    expect(levelUpMoves(moves).map((m) => m.name)).toEqual(['tackle', 'vine-whip']);
  });
});
