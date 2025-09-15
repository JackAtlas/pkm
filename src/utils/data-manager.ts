import { Direction, DIRECTION } from '@/common/direction'
import {
  BATTLE_SCENE_OPTIONS,
  BATTLE_STYLE_OPTIONS,
  BattleSceneOptions,
  BattleStyleOptions,
  TEXT_SPEED_OPTIONS,
  TextSpeedOptions
} from '@/common/options'
import { TILE_SIZE } from '@/config'

interface GoldenState {
  options: {
    battleSceneAnimations: BattleSceneOptions
    battleStyle: BattleStyleOptions
    bgmVolume: number
    seVolume: number
    textSpeed: TextSpeedOptions
  }
  player: {
    direction: Direction
    position: {
      x: number
      y: number
    }
  }
}

const initialState: GoldenState = {
  options: {
    battleSceneAnimations: BATTLE_SCENE_OPTIONS.ON,
    battleStyle: BATTLE_STYLE_OPTIONS.SHIFT,
    bgmVolume: 100,
    seVolume: 100,
    textSpeed: TEXT_SPEED_OPTIONS.MID
  },
  player: {
    direction: DIRECTION.DOWN,
    position: {
      x: 15 * TILE_SIZE,
      y: 20 * TILE_SIZE
    }
  }
}

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
  OPTIONS_BATTLE_SCENE_ANIMATION: 'OPTIONS_BATTLE_SCENE_ANIMATION',
  OPTIONS_BATTLE_STYLE: 'OPTIONS_BATTLE_STYLE',
  OPTIONS_BGM_VOLUME: 'OPTIONS_BGM_VOLUME',
  OPTIONS_SE_VOLUME: 'OPTIONS_SE_VOLUME',
  OPTIONS_TEXT_SPEED: 'OPTIONS_TEXT_SPEED',
  PLAYER_DIRECTION: 'PLAYER_DIRECTION',
  PLAYER_POSITION: 'PLAYER_POSITION'
})

const LOCAL_STORAGE_KEY = 'PKM_DATA'

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

  loadData() {
    if (typeof Storage === 'undefined') {
      console.warn(
        `[${DataManager.name}:loadData] localStorage is not supported, will not be able to save and load data`
      )
      return
    }

    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedData === null) return
    try {
      const parsedData: GoldenState = JSON.parse(
        savedData
      ) as GoldenState
      this._updateDataManager(parsedData)
    } catch (error) {
      console.warn(
        `[${DataManager.name}:loadData] encountered an error while atempting to load and parse saved data`
      )
    }
  }

  saveData() {
    if (typeof Storage === 'undefined') {
      console.warn(
        `[${DataManager.name}:saveData] localStorage is not supported, will not be able to save and load data`
      )
      return
    }

    const dataToSave = this._dataManagerDataToGlobalStateObject()
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(dataToSave)
    )
  }

  _updateDataManager(data: GoldenState) {
    this._store.set({
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATION]:
        data.options.battleSceneAnimations,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE]:
        data.options.battleStyle,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_BGM_VOLUME]:
        data.options.bgmVolume,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_SE_VOLUME]:
        data.options.seVolume,
      [DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED]:
        data.options.textSpeed,
      [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION]:
        data.player.direction,
      [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: data.player.position
    })
  }

  _dataManagerDataToGlobalStateObject(): GoldenState {
    return {
      options: {
        battleSceneAnimations: this._store.get(
          DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_SCENE_ANIMATION
        ),
        battleStyle: this._store.get(
          DATA_MANAGER_STORE_KEYS.OPTIONS_BATTLE_STYLE
        ),
        bgmVolume: this._store.get(
          DATA_MANAGER_STORE_KEYS.OPTIONS_BGM_VOLUME
        ),
        seVolume: this._store.get(
          DATA_MANAGER_STORE_KEYS.OPTIONS_SE_VOLUME
        ),
        textSpeed: this._store.get(
          DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED
        )
      },
      player: {
        direction: this._store.get(
          DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION
        ),
        position: {
          x: this._store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION)
            .x,
          y: this._store.get(DATA_MANAGER_STORE_KEYS.PLAYER_POSITION)
            .y
        }
      }
    } as GoldenState
  }
}

export const dataManager = new DataManager()
