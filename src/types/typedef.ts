import { MOVE_KEYS } from '@/battle/move/move-keys'

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

export interface BattlePKMConfig {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container
  pkm: Pokemon
  shadowAssetKey?: string
  baseAssetKey: string
  skipBattleAnimations?: boolean
}

export interface Coordinate {
  x: number
  y: number
}

export interface Move {
  id: number
  name: string
  animationName: MOVE_KEYS
}

export interface Animation {
  key: string
  assetKey: string
  frames?: number[]
  frameRate: number
  repeat: number
  delay?: number
  yoyo?: boolean
}
