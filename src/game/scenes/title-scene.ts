import { TITLE_ASSET_KEYS } from '@/assets/asset-keys'
import { SCENE_KEYS } from './scene-keys'
import { Controls } from '@/utils/controls'
import { Direction, DIRECTION } from '@/common/direction'
import { exhaustiveGuard } from '@/utils/guard'
import {
  DATA_MANAGER_STORE_KEYS,
  dataManager
} from '@/utils/data-manager'

type MainMenuOptions =
  (typeof MAIN_MENU_OPTIONS)[keyof typeof MAIN_MENU_OPTIONS]

const MAIN_MENU_OPTIONS = Object.freeze({
  CONTINUE: 'CONTINUE',
  NEW_GAME: 'NEW GAME',
  LOAD: 'LOAD',
  OPTIONS: 'OPTIONS',
  CREDITS: 'CREDITS'
})

export class TitleScene extends Phaser.Scene {
  protected _constrols: Controls
  protected _selectedMenuOption: MainMenuOptions

  protected _text_0: Phaser.GameObjects.Text // Continue
  protected _text_1: Phaser.GameObjects.Text // New Game
  protected _text_2: Phaser.GameObjects.Text // Load
  protected _text_3: Phaser.GameObjects.Text // Options
  protected _text_4: Phaser.GameObjects.Text // Credits

  protected _isContinueAble: boolean

  protected _cursor: Phaser.GameObjects.Rectangle

  constructor() {
    super({
      key: SCENE_KEYS.TITLE_SCENE
    })
  }

  create() {
    console.log(`[${TitleScene.name}:create] invoked`)

    this._isContinueAble =
      dataManager.store.get(DATA_MANAGER_STORE_KEYS.GAME_STARTED) ||
      false

    this.add
      .image(
        this.scale.width / 2,
        this.scale.height / 2,
        TITLE_ASSET_KEYS.BACKGROUND
      )
      .setScale(3)

    const menuBackground = this.add.rectangle(
      0,
      0,
      400,
      600,
      0x000000,
      0.5
    )

    const titleText = this.add
      .text(0, -400, 'Pokémon Demo', {
        fontFamily: 'Power Green',
        fontSize: '96px'
      })
      .setOrigin(0.5)

    this._text_0 = this.add
      .text(0, -200, MAIN_MENU_OPTIONS.CONTINUE, {
        color: this._isContinueAble ? '#ffffff' : '#aaaaaa',
        fontFamily: 'Power Green',
        fontSize: '48px'
      })
      .setOrigin(0.5)
    this._text_1 = this.add
      .text(0, -100, MAIN_MENU_OPTIONS.NEW_GAME, {
        fontFamily: 'Power Green',
        fontSize: '48px'
      })
      .setOrigin(0.5)
    this._text_2 = this.add
      .text(0, 0, MAIN_MENU_OPTIONS.LOAD, {
        fontFamily: 'Power Green',
        fontSize: '48px'
      })
      .setOrigin(0.5)
    this._text_3 = this.add
      .text(0, 100, MAIN_MENU_OPTIONS.OPTIONS, {
        fontFamily: 'Power Green',
        fontSize: '48px'
      })
      .setOrigin(0.5)
    this._text_4 = this.add
      .text(0, 200, MAIN_MENU_OPTIONS.CREDITS, {
        fontFamily: 'Power Green',
        fontSize: '48px'
      })
      .setOrigin(0.5)

    this._cursor = this.add
      .rectangle(0, 0, 200, 60)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5)

    this.add.container(this.scale.width / 2, this.scale.height / 2, [
      menuBackground,
      titleText,
      this._text_0,
      this._text_1,
      this._text_2,
      this._text_3,
      this._text_4,
      this._cursor
    ])
    if (this._isContinueAble) {
      this._selectedMenuOption = MAIN_MENU_OPTIONS.CONTINUE
    } else {
      this._selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME
    }
    this._setCursorY()

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        if (this._selectedMenuOption === MAIN_MENU_OPTIONS.OPTIONS) {
          this.scene.start(SCENE_KEYS.OPTIONS_SCENE)
        }

        if (this._selectedMenuOption === MAIN_MENU_OPTIONS.NEW_GAME) {
          dataManager.startNewGame()
        }

        this.scene.start(SCENE_KEYS.WORLD_SCENE)
      }
    )

    this._constrols = new Controls(this)
  }

  update() {
    if (this._constrols.isInputLocked) return

    const wasSpaceKeyPressed = this._constrols.wasSpaceKeyPressed()
    if (wasSpaceKeyPressed) {
      this.cameras.main.fadeOut(500, 0, 0, 0)
      this._constrols.lockInput = true

      return
    }

    const selectedDirection =
      this._constrols.getDirectionKeyJustPressed()
    if (selectedDirection !== DIRECTION.NONE) {
      this._moveMenuCursor(selectedDirection)
    }
  }

  _setCursorY() {
    switch (this._selectedMenuOption) {
      case MAIN_MENU_OPTIONS.CONTINUE:
        this._cursor.setY(this._text_0.y)
        break
      case MAIN_MENU_OPTIONS.NEW_GAME:
        this._cursor.setY(this._text_1.y)
        break
      case MAIN_MENU_OPTIONS.LOAD:
        this._cursor.setY(this._text_2.y)
        break
      case MAIN_MENU_OPTIONS.OPTIONS:
        this._cursor.setY(this._text_3.y)
        break
      case MAIN_MENU_OPTIONS.CREDITS:
        this._cursor.setY(this._text_4.y)
        break
    }
  }

  _moveMenuCursor(direction: Direction) {
    switch (this._selectedMenuOption) {
      case MAIN_MENU_OPTIONS.CONTINUE:
        if (direction === DIRECTION.DOWN) {
          this._selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME
        } else if (direction === DIRECTION.UP) {
          this._selectedMenuOption = MAIN_MENU_OPTIONS.CREDITS
        }
        break
      case MAIN_MENU_OPTIONS.NEW_GAME:
        if (direction === DIRECTION.DOWN) {
          this._selectedMenuOption = MAIN_MENU_OPTIONS.LOAD
        } else if (direction === DIRECTION.UP) {
          if (this._isContinueAble) {
            this._selectedMenuOption = MAIN_MENU_OPTIONS.CONTINUE
          } else {
            this._selectedMenuOption = MAIN_MENU_OPTIONS.CREDITS
          }
        }
        break
      case MAIN_MENU_OPTIONS.LOAD:
        if (direction === DIRECTION.DOWN) {
          this._selectedMenuOption = MAIN_MENU_OPTIONS.OPTIONS
        } else if (direction === DIRECTION.UP) {
          this._selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME
        }
        break
      case MAIN_MENU_OPTIONS.OPTIONS:
        if (direction === DIRECTION.DOWN) {
          this._selectedMenuOption = MAIN_MENU_OPTIONS.CREDITS
        } else if (direction === DIRECTION.UP) {
          this._selectedMenuOption = MAIN_MENU_OPTIONS.LOAD
        }
        break
      case MAIN_MENU_OPTIONS.CREDITS:
        if (direction === DIRECTION.DOWN) {
          if (this._isContinueAble) {
            this._selectedMenuOption = MAIN_MENU_OPTIONS.CONTINUE
          } else {
            this._selectedMenuOption = MAIN_MENU_OPTIONS.NEW_GAME
          }
        } else if (direction === DIRECTION.UP) {
          this._selectedMenuOption = MAIN_MENU_OPTIONS.OPTIONS
        }
        break
      default:
        exhaustiveGuard(this._selectedMenuOption)
    }
    this._setCursorY()
  }
}
