export type OptionMenuOptions =
  (typeof OPTION_MENU_OPTIONS)[keyof typeof OPTION_MENU_OPTIONS]

export const OPTION_MENU_OPTIONS = Object.freeze({
  BGM_VOLUME: 'BGM_VOLUME',
  SE_VOLUME: 'SE_VOLUME',
  TEXT_SPEED: 'TEXT_SPEED',
  BATTLE_SCENE: 'BATTLE_SCENE',
  BATTLE_STYLE: 'BATTLE_STYLE',
  CONFIRM: 'CONFIRM'
})

export type TextSpeedOptions =
  (typeof TEXT_SPEED_OPTIONS)[keyof typeof TEXT_SPEED_OPTIONS]

export const TEXT_SPEED_OPTIONS = Object.freeze({
  SLOW: 'SLOW',
  MID: 'MID',
  FAST: 'FAST'
})

export type BattleSceneOptions =
  (typeof BATTLE_SCENE_OPTIONS)[keyof typeof BATTLE_SCENE_OPTIONS]

export const BATTLE_SCENE_OPTIONS = Object.freeze({
  ON: 'ON',
  OFF: 'OFF'
})

export type BattleStyleOptions =
  (typeof BATTLE_STYLE_OPTIONS)[keyof typeof BATTLE_STYLE_OPTIONS]

export const BATTLE_STYLE_OPTIONS = Object.freeze({
  SET: 'SET',
  SHIFT: 'SHIFT'
})
