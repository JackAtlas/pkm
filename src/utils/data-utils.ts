import { DATA_ASSET_KEYS } from '@/assets/asset-keys'
import { Animation, Item, Move } from '@/types/typedef'

export class DataUtils {
  static getPkmMove(scene: Phaser.Scene, moveId: number) {
    const data = scene.cache.json.get(DATA_ASSET_KEYS.MOVES)

    return data.find((move: Move) => move.id === moveId)
  }

  static getAnimations(scene: Phaser.Scene): Animation[] {
    return scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS)
  }

  static getItem(scene: Phaser.Scene, itemId: number) {
    const data = scene.cache.json.get(DATA_ASSET_KEYS.ITEMS)
    return data.find((item: Item) => item.id === itemId)
  }

  static getItems(scene: Phaser.Scene, itemIds: number[]) {
    const data = scene.cache.json.get(DATA_ASSET_KEYS.ITEMS)
    return data.filter((item: Item) => {
      return itemIds.some((id) => id === item.id)
    })
  }
}
