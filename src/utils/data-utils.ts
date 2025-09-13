import { DATA_ASSET_KEYS } from '@/assets/asset-keys'
import { Move } from '@/types/typedef'

export class DataUtils {
  static getPkmMove(scene: Phaser.Scene, moveId: number) {
    const data = scene.cache.json.get(DATA_ASSET_KEYS.MOVES)

    return data.find((move: Move) => move.id === moveId)
  }
}
