export interface Pokemon {
  name: string
  assetKey: string
  assetFrame: number
  currentLevel: number
  maxHp: number
  currentHp: number
  baseAttack: number
  moveIds: number[]
}

export interface Shadow {
  assetKey: string
  x: number
  y: number
}

export interface Base {
  assetKey: string
  x: number
  y: number
}

export interface BattlePKMConfig {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container
  pkm: Pokemon
  shadow?: Shadow
  base: Base
  skipBattleAnimations?: boolean
}

export interface Coordinate {
  x: number
  y: number
}

export interface MOVE {
  id: number
  name: string
  animationName: string
}
