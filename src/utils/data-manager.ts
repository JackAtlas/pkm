import { Direction, DIRECTION } from '@/common/direction'
import {
  BATTLE_SCENE_OPTIONS,
  BATTLE_STYLE_OPTIONS,
  BattleSceneOptions,
  BattleStyleOptions,
  TEXT_SPEED_OPTIONS,
  TextSpeedOptions
} from '@/common/options'
import { TEXT_SPEED, TILE_SIZE } from '@/config'
import { exhaustiveGuard } from './guard'
import { Pokemon } from '@/types/typedef'
import {
  PKM_NAME_KEYS,
  POKEMON_BACK_ASSET_KEYS
} from '@/assets/asset-keys'

interface PKMData {
  inParty: Pokemon[]
}

interface GlobalState {
  gameStarted: boolean
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
  pkm: PKMData
}

const initialState: GlobalState = {
  gameStarted: false,
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
      x: 25 * TILE_SIZE,
      y: 20 * TILE_SIZE
    }
  },
  pkm: {
    inParty: [
      {
        id: 1,
        pkmId: 1,
        name: PKM_NAME_KEYS.CHANDELURE,
        assetKey: POKEMON_BACK_ASSET_KEYS.CHANDELURE,
        assetFrame: 0,
        currentLevel: 5,
        maxHp: 100,
        currentHp: 100,
        baseAttack: 45,
        moveIds: [2]
      }
    ]
  }
}

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
  GAME_STARTED: 'GAME_STARTED',
  OPTIONS_BATTLE_SCENE_ANIMATION: 'OPTIONS_BATTLE_SCENE_ANIMATION',
  OPTIONS_BATTLE_STYLE: 'OPTIONS_BATTLE_STYLE',
  OPTIONS_BGM_VOLUME: 'OPTIONS_BGM_VOLUME',
  OPTIONS_SE_VOLUME: 'OPTIONS_SE_VOLUME',
  OPTIONS_TEXT_SPEED: 'OPTIONS_TEXT_SPEED',
  PLAYER_DIRECTION: 'PLAYER_DIRECTION',
  PLAYER_POSITION: 'PLAYER_POSITION',
  PKM_IN_PARTY: 'PKM_IN_PARTY'
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
      const parsedData: GlobalState = JSON.parse(
        savedData
      ) as GlobalState
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

  startNewGame() {
    const existingData = {
      ...this._dataManagerDataToGlobalStateObject()
    }
    existingData.gameStarted = initialState.gameStarted
    existingData.player.direction = initialState.player.direction
    existingData.player.position = { ...initialState.player.position }
    existingData.pkm = { inParty: [...initialState.pkm.inParty] }

    this._store.reset()
    this._updateDataManager(existingData)
    this.saveData()
  }

  getAnimatedTextSpeed(): number {
    const chosenTextSpeed: TextSpeedOptions | undefined =
      this._store.get(DATA_MANAGER_STORE_KEYS.OPTIONS_TEXT_SPEED)

    if (chosenTextSpeed === undefined) return TEXT_SPEED.MEDIUM

    switch (chosenTextSpeed) {
      case TEXT_SPEED_OPTIONS.SLOW:
        return TEXT_SPEED.SLOW
      case TEXT_SPEED_OPTIONS.MID:
        return TEXT_SPEED.MEDIUM
      case TEXT_SPEED_OPTIONS.FAST:
        return TEXT_SPEED.FAST
      default:
        exhaustiveGuard(chosenTextSpeed)
        return TEXT_SPEED.MEDIUM
    }
  }

  _updateDataManager(data: GlobalState) {
    this._store.set({
      [DATA_MANAGER_STORE_KEYS.GAME_STARTED]: data.gameStarted,
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
      [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: data.player.position,
      [DATA_MANAGER_STORE_KEYS.PKM_IN_PARTY]: data.pkm.inParty
    })
  }

  _dataManagerDataToGlobalStateObject(): GlobalState {
    return {
      gameStarted: this._store.get(
        DATA_MANAGER_STORE_KEYS.GAME_STARTED
      ),
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
      },
      pkm: {
        inParty: this._store.get(DATA_MANAGER_STORE_KEYS.PKM_IN_PARTY)
      }
    } as GlobalState
  }
}

export const dataManager = new DataManager()
