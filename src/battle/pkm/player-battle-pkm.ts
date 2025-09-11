import { BattlePKMConfig } from '@/types/typedef'
import { BattlePKM } from './battle-pkm'
import { DATABOX_ASSET_KEYS } from '@/assets/asset-keys'
import { HealthBar } from '../ui/health-bar'

const PLAYER_POSITION = Object.freeze({
  x: 80,
  y: 0
})

export class PlayerBattlePKM extends BattlePKM {
  protected _hpTextObj: Phaser.GameObjects.Text

  constructor(config: BattlePKMConfig) {
    super(config, PLAYER_POSITION)
    this._createDataBox()
  }

  _paintBase(): void {
    const baseImageObj = this._scene.add
      .image(this._base.x, this._base.y, this._base.assetKey)
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

  _paintPkm(x: number, y: number) {
    this._phaserGameObject = this._scene.add
      .image(x, y, this._pkm.assetKey, this._pkm.assetFrame || 0)
      .setOrigin(0)

    this._container.add(this._phaserGameObject)
    this._phaserGameObject.setY(
      this._container.height - this._phaserGameObject.height
    )
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

    const container = this._scene.add.container(0, 0, objArr)
    container.width = dataBoxImageObj.width
    container.height = dataBoxImageObj.height

    container.setPosition(
      this._container.width - container.width,
      this._container.height - container.height - 50
    )

    this._container.add(container)
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
}
