export interface Pokemon {
  name: string
  assetKey: string
  assetFrame: number
  currentLevel: number
  maxHp: number
  currentHp: number
  baseAttack: number
  attackIds: number[]
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
}

export interface Coordinate {
  x: number
  y: number
}

export interface Attack {
  id: number
  name: string
  animationName: string
}
