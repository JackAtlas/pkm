import { PKM_NAME_KEYS } from '@/asset-keys'
import { MOVE_KEYS } from '@/battle/move/move-keys'

export interface Pokemon {
  id: number
  pkmId: number
  name: string
  assetKey: (typeof PKM_NAME_KEYS)[keyof typeof PKM_NAME_KEYS]
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

const ITEM_EFFECT = Object.freeze({
  HEAL_30: 'HEAL_30'
})

export interface Item {
  id: number
  name: string
  description: string
  effect: (typeof ITEM_EFFECT)[keyof typeof ITEM_EFFECT]
}

export interface BaseInventoryItem {
  item: {
    id: number
  }
  quantity: number
}

export interface InventoryItem {
  item: Item
  quantity: number
}
