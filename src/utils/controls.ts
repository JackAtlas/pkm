import { Direction, DIRECTION } from '@/common/direction'

export class Controls {
  readonly _scene: Phaser.Scene
  protected _cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys
  protected _lockPlayerInput: boolean
  protected _menuKey: Phaser.Input.Keyboard.Key | undefined

  constructor(scene: Phaser.Scene) {
    this._scene = scene
    this._cursorKeys = this._scene.input.keyboard!.createCursorKeys()
    this._lockPlayerInput = false

    this._menuKey = this._scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    )
  }

  get isInputLocked(): boolean {
    return this._lockPlayerInput
  }

  set lockInput(val: boolean) {
    this._lockPlayerInput = val
  }

  wasSpaceKeyPressed(): boolean {
    if (this._cursorKeys === undefined) {
      return false
    }
    return Phaser.Input.Keyboard.JustDown(this._cursorKeys.space)
  }

  wasMenuKeyPressed(): boolean {
    if (this._cursorKeys === undefined || !this._menuKey) {
      return false
    }
    return Phaser.Input.Keyboard.JustDown(this._menuKey)
  }

  wasBackKeyPressed(): boolean {
    if (this._cursorKeys === undefined) {
      return false
    }
    return Phaser.Input.Keyboard.JustDown(this._cursorKeys.shift)
  }

  getDirectionKeyJustPressed(): Direction {
    if (this._cursorKeys === undefined) {
      return DIRECTION.NONE
    }

    if (Phaser.Input.Keyboard.JustDown(this._cursorKeys.left)) {
      return DIRECTION.LEFT
    } else if (
      Phaser.Input.Keyboard.JustDown(this._cursorKeys.right)
    ) {
      return DIRECTION.RIGHT
    } else if (Phaser.Input.Keyboard.JustDown(this._cursorKeys.up)) {
      return DIRECTION.UP
    } else if (
      Phaser.Input.Keyboard.JustDown(this._cursorKeys.down)
    ) {
      return DIRECTION.DOWN
    } else {
      return DIRECTION.NONE
    }
  }

  getDirectionKeyPressedDown(): Direction {
    if (this._cursorKeys === undefined) {
      return DIRECTION.NONE
    }

    let selectedDirection: Direction = DIRECTION.NONE
    if (this._cursorKeys.left.isDown) {
      selectedDirection = DIRECTION.LEFT
    } else if (this._cursorKeys.right.isDown) {
      selectedDirection = DIRECTION.RIGHT
    } else if (this._cursorKeys.up.isDown) {
      selectedDirection = DIRECTION.UP
    } else if (this._cursorKeys.down.isDown) {
      selectedDirection = DIRECTION.DOWN
    }

    return selectedDirection
  }
}
