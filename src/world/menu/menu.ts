import { DIRECTION, Direction } from '@/common/direction'
import { exhaustiveGuard } from '@/utils/guard'

export type MenuOption =
  (typeof MENU_OPTIONS)[keyof typeof MENU_OPTIONS]

export const MENU_OPTIONS = Object.freeze({
  POKEDEX: 'POKEDEX',
  PARTY: 'PARTY',
  BAG: 'BAG',
  SAVE: 'SAVE',
  OPTIONS: 'OPTIONS',
  EXIT: 'EXIT'
})

const MENU_TEXT_STYLE = Object.freeze({
  fontFamily: 'Power Green',
  fontSize: '12px',
  color: '#ffffff'
})

export class Menu {
  protected _scene: Phaser.Scene
  protected _width: number = 300
  protected _height: number
  protected _padding: number = 4

  protected _container: Phaser.GameObjects.Container
  protected _graphics: Phaser.GameObjects.Graphics
  protected _userInputCursor: Phaser.GameObjects.Arc

  protected _isVisible: boolean = false

  protected _availableMenuOptions: MenuOption[] = [
    MENU_OPTIONS.PARTY,
    MENU_OPTIONS.SAVE,
    MENU_OPTIONS.EXIT
  ]
  protected _menuOptionsTextGameObjects: Phaser.GameObjects.Text[] =
    []
  protected _selectedMenuOptionIndex: number = 0
  protected _selectedMenuOption: MenuOption

  constructor(scene: Phaser.Scene) {
    this._scene = scene

    this._height =
      10 + this._padding * 2 + 20 * this._availableMenuOptions.length

    this._graphics = this._createGraphics()
    this._container = this._scene.add.container(0, 0, [
      this._graphics
    ])

    for (let i = 0; i < this._availableMenuOptions.length; i++) {
      const y = 10 + 20 * i + this._padding
      const textObj = this._scene.add.text(
        40 + this._padding,
        y,
        this._availableMenuOptions[i],
        MENU_TEXT_STYLE
      )
      this._menuOptionsTextGameObjects.push(textObj)
      this._container.add(textObj)
    }

    this._userInputCursor = this._scene.add
      .circle(10, this._padding, 2, 0xffffff, 1)
      .setOrigin(0, 0.5)
    this._container.add(this._userInputCursor)

    this.hide()
  }

  create() {
    this.show()
  }

  get isVisible(): boolean {
    return this._isVisible
  }

  get selectedMenuOption(): MenuOption {
    return this._selectedMenuOption
  }

  show() {
    const { bottom, centerX } = this._scene.cameras.main.worldView
    const startX = centerX - this._width / 2
    const startY = bottom - this._height - this._padding * 2

    this._container.setPosition(startX, startY)
    this._container.setAlpha(1)
    this._isVisible = true
  }

  hide() {
    this._container.setAlpha(0)
    this._moveMenuCursor(DIRECTION.NONE)
    this._isVisible = false
    this._selectedMenuOptionIndex = 0
    this._setCursorPosition()
  }

  handlePlayerInput(input: Direction | 'OK' | 'CANCEL') {
    if (input === 'CANCEL') {
      this.hide()
      return
    }
    if (input === 'OK') {
      this._handleSelectMenuOption()
      return
    }

    this._moveMenuCursor(input)
  }

  _createGraphics(): Phaser.GameObjects.Graphics {
    const g = this._scene.add.graphics()

    g.fillStyle(0x32454c, 0.5)
    g.fillRect(0, 0, this._width, this._height)
    g.lineStyle(2, 0x6d9aa8, 1)
    g.strokeRect(0, 0, this._width, this._height)

    return g
  }

  _moveMenuCursor(input: Direction) {
    switch (input) {
      case DIRECTION.UP:
        this._selectedMenuOptionIndex -= 1
        if (this._selectedMenuOptionIndex < 0) {
          this._selectedMenuOptionIndex =
            this._availableMenuOptions.length - 1
        }
        break
      case DIRECTION.DOWN:
        this._selectedMenuOptionIndex += 1
        if (
          this._selectedMenuOptionIndex >
          this._availableMenuOptions.length - 1
        ) {
          this._selectedMenuOptionIndex = 0
        }
        break
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
        return
      case DIRECTION.NONE:
        break
      default:
        exhaustiveGuard(input)
    }

    this._setCursorPosition()
  }

  _setCursorPosition() {
    const y = 16 + this._padding + this._selectedMenuOptionIndex * 20
    this._userInputCursor.setY(y)
  }

  _handleSelectMenuOption() {
    this._selectedMenuOption =
      this._availableMenuOptions[this._selectedMenuOptionIndex]
  }
}
