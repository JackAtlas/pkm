import { BattlePKMConfig } from '@/types/typedef'
import { BattlePKM } from './battle-pkm'
import { DATABOX_ASSET_KEYS } from '@/assets/asset-keys'
import { HealthBar } from '../ui/health-bar'

const FOE_POSITION = Object.freeze({
  x: 760,
  y: 360
})

export class FoeBattlePKM extends BattlePKM {
  constructor(config: BattlePKMConfig) {
    super(config)
    this._createDataBox()
  }

  get pkmCenterPosition(): { x: number; y: number } {
    return {
      x: this._pkmGameObject.x,
      y: this._pkmGameObject.y - this._pkmGameObject.height / 2
    }
  }

  _paintBase(): void {
    const baseImageObj = this._scene.add
      .image(FOE_POSITION.x, FOE_POSITION.y - 40, this._base)
      .setOrigin(0.5)
    this._container.add(baseImageObj)
  }

  _paintShadow() {
    if (!this._shadow) return
    const shadow = this._scene.add
      .image(FOE_POSITION.x, FOE_POSITION.y - 40, this._shadow)
      .setOrigin(0.5)
    this._container.add(shadow)
  }

  _paintPkm() {
    this._pkmGameObject = this._scene.add
      .image(
        FOE_POSITION.x,
        FOE_POSITION.y,
        this._pkm.assetKey,
        this._pkm.assetFrame || 0
      )
      .setOrigin(0.5, 1)
      .setAlpha(0)

    this._container.add(this._pkmGameObject)
  }

  _createDataBox(): void {
    const dataBoxImageObj = this._scene.add
      .image(0, 0, DATABOX_ASSET_KEYS.DATABOX_NORMAL_FOE)
      .setOrigin(0)

    const pkmNameTextObj = this._scene.add.text(
      20,
      22,
      this._pkm.name,
      {
        color: '#484848',
        fontSize: '36px',
        fontFamily: 'Power Green'
      }
    )

    this._healthBar = new HealthBar(this._scene, 236, 80)

    const levelTextObj = this._scene.add.text(
      0,
      32,
      `Lv.${this.level}`,
      {
        color: '#484848',
        fontSize: '28px',
        fontFamily: 'Power Green',
        fontStyle: 'bold'
      }
    )
    levelTextObj.setX(dataBoxImageObj.width - levelTextObj.width - 84)

    const objArr = [
      dataBoxImageObj,
      pkmNameTextObj,
      this._healthBar.container,
      levelTextObj
    ]

    this._dataBoxContainer = this._scene.add.container(0, 20, objArr)
    this._dataBoxContainer.width = dataBoxImageObj.width
    this._dataBoxContainer.height = dataBoxImageObj.height
    this._dataBoxContainer.setAlpha(0)

    this._container.add(this._dataBoxContainer)
  }

  playPkmAppearAnimation(callback: () => void): void {
    const startXPos = this._container.width + 30
    const endXPos = FOE_POSITION.x
    this._pkmGameObject.setPosition(startXPos, FOE_POSITION.y)
    this._pkmGameObject.setAlpha(1)

    if (this._skipBattleAnimations) {
      this._pkmGameObject.setX(endXPos)
      callback()
      return
    }

    this._scene.tweens.add({
      delay: 0,
      duration: 1600,
      x: {
        from: startXPos,
        start: startXPos,
        to: endXPos
      },
      targets: this._pkmGameObject,
      onComplete: () => {
        callback()
      }
    })
  }

  playDataBoxAnimation(callback: () => void): void {
    const startXPos = -600
    const endXPos = 0
    this._dataBoxContainer.setPosition(
      startXPos,
      this._dataBoxContainer.y
    )
    this._dataBoxContainer.setAlpha(1)

    if (this._skipBattleAnimations) {
      this._dataBoxContainer.setX(endXPos)
      callback()
      return
    }

    this._scene.tweens.add({
      delay: 0,
      duration: 1500,
      x: {
        from: startXPos,
        start: startXPos,
        to: endXPos
      },
      targets: this._dataBoxContainer,
      onComplete: () => {
        callback()
      }
    })
  }

  playFaintedAnimation(callback: () => void): void {
    const startYPos = this._pkmGameObject.y
    const endYPos = startYPos - 500

    if (this._skipBattleAnimations) {
      this._pkmGameObject.setY(endYPos)
      callback()
      return
    }

    this._scene.tweens.add({
      delay: 0,
      duration: 1600,
      y: {
        from: startYPos,
        start: startYPos,
        to: endYPos
      },
      targets: this._pkmGameObject,
      onComplete: () => {
        this._pkmGameObject.setAlpha(0)
        callback()
      }
    })
  }
}
