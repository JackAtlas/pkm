import {
  Base,
  BattlePKMConfig,
  Coordinate,
  MOVE,
  Pokemon,
  Shadow
} from '@/types/typedef'
import { HealthBar } from '@/battle/ui/health-bar'
import { DataUtils } from '@/utils/data-utils'

export class BattlePKM {
  protected _scene: Phaser.Scene
  protected _container: Phaser.GameObjects.Container
  protected _pkmGameObject: Phaser.GameObjects.Image
  protected _pkm: Pokemon
  protected _healthBar: HealthBar
  protected _currentHp: number
  protected _maxHp: number
  protected _pkmMoves: MOVE[]
  protected _base: Base
  protected _shadow: Shadow | undefined

  constructor(config: BattlePKMConfig) {
    this._scene = config.scene
    this._container = config.container
    this._pkm = config.pkm
    this._currentHp = this._pkm.currentHp
    this._maxHp = this._pkm.maxHp
    this._pkmMoves = []

    this._base = config.base
    this._shadow = config.shadow

    this._paintBase()
    this._paintShadow()
    this._paintPkm()

    this._pkm.moveIds.forEach((moveId) => {
      const pkmMove = DataUtils.getPkmMove(this._scene, moveId)
      if (pkmMove !== undefined) {
        this._pkmMoves.push(pkmMove)
      }
    })
  }

  get isFainted(): boolean {
    return this._currentHp <= 0
  }

  get name(): string {
    return this._pkm.name
  }

  get level(): number {
    return this._pkm.currentLevel
  }

  get moves(): MOVE[] {
    return [...this._pkmMoves]
  }

  get baseAttack(): number {
    return this._pkm.baseAttack
  }

  set healthBar(value: HealthBar) {
    this._healthBar = value
  }

  _paintBase(): void {}

  _paintShadow() {}

  _paintPkm() {
    throw new Error('_paintPkm is not implemented.')
  }

  _createDataBox() {
    throw new Error('_createDataBox is not implemented.')
  }

  takeDamage(damage: number, callback: () => void) {
    this._currentHp -= damage
    if (this._currentHp < 0) {
      this._currentHp = 0
    }
    this._healthBar.setMeterPercentageAnimated(
      this._currentHp / this._maxHp,
      { callback }
    )
  }
}
