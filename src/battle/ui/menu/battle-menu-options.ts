export type BATTLE_MENU_OPTIONS =
  (typeof BATTLE_MENU_OPTIONS)[keyof typeof BATTLE_MENU_OPTIONS]

export const BATTLE_MENU_OPTIONS = Object.freeze({
  FIGHT: 'Fight',
  BAG: 'Bag',
  POKEMON: 'Pokémon',
  RUN: 'Run'
})

export type ATTACK_MOVE_OPTIONS =
  (typeof ATTACK_MOVE_OPTIONS)[keyof typeof ATTACK_MOVE_OPTIONS]

export const ATTACK_MOVE_OPTIONS = Object.freeze({
  MOVE_1: 'Move 1',
  MOVE_2: 'Move 2',
  MOVE_3: 'Move 3',
  MOVE_4: 'Move 4'
})

export type ACTIVE_BATTLE_MENU =
  (typeof ACTIVE_BATTLE_MENU)[keyof typeof ACTIVE_BATTLE_MENU]

export const ACTIVE_BATTLE_MENU = Object.freeze({
  BATTLE_MAIN: 'BATTLE_MAIN',
  BATTLE_MOVE_SELECT: 'BATTLE_MOVE_SELECT',
  BATTLE_POKEMON: 'BATTLE_POKEMON',
  BATTLE_BAG: 'BATTLE_BAG',
  BATTLE_RUN: 'BATTLE_RUN'
})
