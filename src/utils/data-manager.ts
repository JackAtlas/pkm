import { Direction, DIRECTION } from '@/common/direction'
import { TILE_SIZE } from '@/config'

interface GoldenState {
  player: {
    direction: Direction
    position: {
      x: number
      y: number
    }
  }
}

const initialState: GoldenState = {
  player: {
    direction: DIRECTION.DOWN,
    position: {
      x: 20 * TILE_SIZE,
      y: 25 * TILE_SIZE
    }
  }
}

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
  PLAYER_DIRECTION: 'PLAYER_DIRECTION',
  PLAYER_POSITION: 'PLAYER_POSITION'
})

class DataManager extends Phaser.Events.EventEmitter {
  protected _store: Phaser.Data.DataManager

  constructor() {
    super()
    this._store = new Phaser.Data.DataManager(this)
    this._updateDataManager(initialState)
  }

  get store(): Phaser.Data.DataManager {
    return this._store
  }

  _updateDataManager(data: GoldenState) {
    this._store.set({
      [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION]:
        data.player.direction,
      [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: data.player.position
    })
  }
}

export const dataManager = new DataManager()
