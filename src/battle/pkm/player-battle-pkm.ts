import { BattlePKMConfig } from '@/types/typedef'
import { BattlePKM } from './battle-pkm'
import { DATABOX_ASSET_KEYS } from '@/assets/asset-keys'
import { HealthBar } from '../ui/health-bar'

const PLAYER_POSITION = Object.freeze({
  x: 200,
  y: 0
})

export class PlayerBattlePKM extends BattlePKM {
  protected _hpTextObj: Phaser.GameObjects.Text

  constructor(config: BattlePKMConfig) {
    super(config)
    this._createDataBox()
  }

  get pkmCenterPosition(): { x: number; y: number } {
    return {
      x: this._pkmGameObject.x,
      y: this._pkmGameObject.y - this._pkmGameObject.height / 4
    }
  }

  _paintBase(): void {
    const baseImageObj = this._scene.add
      .image(0, 0, this._base)
      .setOrigin(0)
    this._container.add(baseImageObj)
    baseImageObj
      .setX(-320)
      .setY(this._container.height - (baseImageObj.height - 10))
      .setCrop(
        Math.abs(baseImageObj.x),
        0,
        baseImageObj.width,
        baseImageObj.height - 10
      )
  }

  _paintPkm() {
    this._pkmGameObject = this._scene.add
      .image(
        PLAYER_POSITION.x,
        PLAYER_POSITION.y,
        this._pkm.assetKey,
        this._pkm.assetFrame || 0
      )
      .setOrigin(0.5, 1)
      .setAlpha(0)

    this._container.add(this._pkmGameObject)
    this._pkmGameObject.setY(this._container.height)
  }

  _createDataBox(): void {
    const dataBoxImageObj = this._scene.add
      .image(0, 0, DATABOX_ASSET_KEYS.DATABOX_NORMAL)
      .setOrigin(0)

    const pkmNameTextObj = this._scene.add.text(
      80,
      22,
      this._pkm.name,
      {
        color: '#484848',
        fontSize: '36px',
        fontFamily: 'Power Green'
      }
    )

    this._healthBar = new HealthBar(this._scene, 272, 80)
    this._healthBar.setMeterPercentageAnimated(
      this._currentHp / this._maxHp,
      { skipBattleAnimations: true }
    )

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
    levelTextObj.setX(dataBoxImageObj.width - levelTextObj.width - 48)

    const objArr = [
      dataBoxImageObj,
      pkmNameTextObj,
      this._healthBar.container,
      levelTextObj
    ]

    objArr.push(
      this._scene.add
        .image(80, 148, DATABOX_ASSET_KEYS.OVERLAY_EXP)
        .setOrigin(0)
    )

    this._hpTextObj = this._scene.add
      .text(280, 106, `${this._currentHp} / ${this._maxHp}`, {
        color: '#484848',
        fontSize: '32px',
        fontStyle: 'bold'
      })
      .setOrigin(0)
    objArr.push(this._hpTextObj)

    this._dataBoxContainer = this._scene.add.container(0, 0, objArr)
    this._dataBoxContainer.width = dataBoxImageObj.width
    this._dataBoxContainer.height = dataBoxImageObj.height
    this._dataBoxContainer.setAlpha(0)

    this._dataBoxContainer.setPosition(
      this._container.width - this._dataBoxContainer.width,
      this._container.height - this._dataBoxContainer.height - 50
    )

    this._container.add(this._dataBoxContainer)
  }

  _setHpText() {
    this._hpTextObj.setText(`${this._currentHp} / ${this._maxHp}`)
  }

  _setAnimatedHpText(formerHp: number) {
    const hpObj = { value: formerHp }

    this._scene.tweens.add({
      targets: hpObj,
      value: this._currentHp,
      duration: 1000,
      onUpdate: () => {
        this._hpTextObj.setText(
          `${Math.floor(hpObj.value)} / ${this._maxHp}`
        )
      },
      onComplete: () => {
        this._setHpText()
      }
    })
  }

  takeDamage(damage: number, callback: () => void): void {
    const formerHp = this._currentHp
    super.takeDamage(damage, callback)
    this._setAnimatedHpText(formerHp)
  }

  playPkmAppearAnimation(callback: () => void): void {
    const startXPos = -30
    const endXPos = PLAYER_POSITION.x
    this._pkmGameObject.setPosition(startXPos, this._pkmGameObject.y)
    this._pkmGameObject.setAlpha(1)

    if (this._skipBattleAnimations) {
      this._pkmGameObject.setX(endXPos)
      callback()
      return
    }

    this._scene.tweens.add({
      delay: 0,
      duration: 800,
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
    const startXPos = 800
    const endXPos = this._dataBoxContainer.x
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
      duration: 800,
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
    const endYPos = startYPos + 400

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
