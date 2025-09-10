import { BattlePKMConfig } from '@/types/typedef'
import { BattlePKM } from './battle-pkm'
import { DATABOX_ASSET_KEYS } from '@/assets/asset-keys'
import { HealthBar } from '../ui/health-bar'

const FOE_POSITION = Object.freeze({
  x: 600,
  y: 40
})

export class FoeBattlePKM extends BattlePKM {
  constructor(config: BattlePKMConfig) {
    super(config, FOE_POSITION)
  }

  _paintBase(): void {
    const baseImageObj = this._scene.add
      .image(this._base.x, this._base.y, this._base.assetKey)
      .setOrigin(0)
    this._container.add(baseImageObj)
    baseImageObj.setX(this._container.width - baseImageObj.width + 2)
  }

  _paintShadow() {
    if (!this._shadow) return
    const shadow = this._scene.add.image(
      this._shadow.x,
      this._shadow.y,
      this._shadow.assetKey
    )
    this._container.add(shadow)
  }

  _createDataBox(): void {
    const dataBoxImageObj = this._scene.add
      .image(0, 0, DATABOX_ASSET_KEYS.DATABOX_NORMAL_FOE)
      .setOrigin(0)

    const pkmNameTextObj = this._scene.add.text(
      20,
      22,
      this._details.name,
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

    const container = this._scene.add.container(0, 20, objArr)
    container.width = dataBoxImageObj.width
    container.height = dataBoxImageObj.height

    this._container.add(container)
  }
}
