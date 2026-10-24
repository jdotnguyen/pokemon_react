import { typeDefenses, formatName } from './format';
import { createStore } from './storage';
import { ALL_TYPES } from './types';

export const MAX_TEAM = 6;

// Several named teams, one of them active. Saved to disk.
const DEFAULT_ID = 'team-1';
const initialState = () => ({ teams: [{ id: DEFAULT_ID, name: 'My Team', members: [] }], activeId: DEFAULT_ID });
const store = createStore('teams', initialState());

const activeTeam = (state) => state.teams.find((t) => t.id === state.activeId) ?? state.teams[0];

function updateActive(change) {
  const state = store.get();
  const active = activeTeam(state);
  const members = change(active.members);
  if (members === active.members) return;
  store.set({ ...state, teams: state.teams.map((t) => (t.id === active.id ? { ...t, members } : t)) });
}

export function addToTeam(id) {
  updateActive((m) => (m.length >= MAX_TEAM || m.includes(id) ? m : [...m, id]));
}

export function removeFromTeam(id) {
  updateActive((m) => (m.includes(id) ? m.filter((x) => x !== id) : m));
}

/** Swap the member at `index` (or append if the slot is empty). No duplicates. */
export function replaceInTeam(index, id) {
  updateActive((m) => {
    if (m.includes(id)) return m;
    if (index >= m.length) return m.length >= MAX_TEAM ? m : [...m, id];
    const next = [...m];
    next[index] = id;
    return next;
  });
}

export function createTeam(name) {
  const state = store.get();
  const id = `team-${Date.now().toString(36)}`;
  const label = name?.trim() || `Team ${state.teams.length + 1}`;
  store.set({ teams: [...state.teams, { id, name: label, members: [] }], activeId: id });
  return id;
}

export function renameTeam(id, name) {
  const label = name?.trim();
  if (!label) return;
  const state = store.get();
  store.set({ ...state, teams: state.teams.map((t) => (t.id === id ? { ...t, name: label } : t)) });
}

export function deleteTeam(id) {
  const state = store.get();
  const teams = state.teams.filter((t) => t.id !== id);
  if (teams.length === 0) return store.set(initialState());
  store.set({ teams, activeId: state.activeId === id ? teams[0].id : state.activeId });
}

export function setActiveTeam(id) {
  const state = store.get();
  if (state.teams.some((t) => t.id === id)) store.set({ ...state, activeId: id });
}

/** Every saved team plus which is active. */
export function useTeams() {
  const state = store.use();
  return { teams: state.teams, activeId: activeTeam(state).id };
}

/** The active team's Pokémon ids (same array until the team changes). */
export function useTeam() {
  return store.use((s) => activeTeam(s).members);
}

export function useActiveTeamName() {
  return store.use((s) => activeTeam(s).name);
}

export function useIsInTeam(id) {
  return store.use((s) => activeTeam(s).members.includes(id));
}

export function useTeamIsFull() {
  return store.use((s) => activeTeam(s).members.length >= MAX_TEAM);
}

/**
 * Plain-text version of a team for sharing.
 * `members` is [{ name, types? }] in team order.
 */
export function teamToText(teamName, members = []) {
  const lines = members.map((m, i) => {
    const types = m.types?.length ? ` (${m.types.map(formatName).join(' / ')})` : '';
    return `${i + 1}. ${formatName(m.name)}${types}`;
  });
  return [teamName, ...(lines.length ? lines : ['(empty team)'])].join('\n');
}

/**
 * One row per attacking type: the multiplier it deals to each member, and how many
 * members are weak to / resist it (immunity counts as resisting).
 * `memberTypes` is string[][]; `typeMap` maps type name -> /type response.
 */
export function teamDefense(memberTypes, typeMap) {
  const perMember = memberTypes.map((types) => typeDefenses(types.map((t) => typeMap[t]), ALL_TYPES));
  return ALL_TYPES.map((type) => {
    const cells = perMember.map((m) => m[type] ?? 1);
    return {
      type,
      cells,
      weak: cells.filter((m) => m > 1).length,
      resist: cells.filter((m) => m < 1).length,
    };
  });
}

/** Types hitting at least two members that the team resists less often than it is weak to. */
export function sharedWeaknesses(rows) {
  return rows
    .filter((r) => r.weak >= 2 && r.weak > r.resist)
    .sort((a, b) => b.weak - b.resist - (a.weak - a.resist) || b.weak - a.weak);
}

/** Which defending types the team's own types hit super effectively (STAB only). */
export function teamCoverage(memberTypes, typeMap) {
  const covered = new Set();
  for (const attacker of new Set(memberTypes.flat())) {
    for (const d of typeMap[attacker]?.damage_relations?.double_damage_to ?? []) covered.add(d.name);
  }
  return ALL_TYPES.map((type) => ({ type, covered: covered.has(type) }));
}
