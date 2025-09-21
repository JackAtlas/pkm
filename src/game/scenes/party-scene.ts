import { Move, Pokemon } from '@/types/typedef'
import { BaseScene } from './base-scene'
import { SCENE_KEYS, SceneKeys } from './scene-keys'
import {
  DATA_MANAGER_STORE_KEYS,
  dataManager
} from '@/utils/data-manager'
import { DataUtils } from '@/utils/data-utils'
import { PKM_FRONT_ASSET_KEYS } from '@/asset-keys'
import { DEBUG } from '@/config'
import { Direction, DIRECTION } from '@/common/direction'
import { SCENE_COMMUNICATE_FLAGS } from '@/utils/scene-manager'
import { exhaustiveGuard } from '@/utils/guard'

interface Layout {
  boxHeight: number
  boxWidth: number
  gapX: number
  gapY: number
  UIHeight: number
}
export class PartyScene extends BaseScene {
  protected _party: Pokemon[]
  protected _layout: Layout
  protected _selectedPKMIndex: number = 0
  protected _boxWaitingToSwapIndex: number | undefined
  protected _boxList: Phaser.GameObjects.Container[]

  constructor() {
    super({
      key: SCENE_KEYS.PARTY_SCENE
    })
  }

  preload() {
    super.preload()
    this._party = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.PKM_IN_PARTY
    )
    this._party.forEach((pkm) => {
      const assetKey = PKM_FRONT_ASSET_KEYS[pkm.assetKey]
      const imgLoaded = this.textures.exists(assetKey)
      const imgInLoadList = this.load.list.entries.find(
        (l) => l.key === assetKey
      )

      if (!imgLoaded && !imgInLoadList) {
        this.load.image(
          assetKey,
          `assets/Graphics/Pokemon/Front/${pkm.name}.webp`
        )
      }
    })
  }

  init() {
    super.init()
  }

  update(time: DOMHighResTimeStamp) {
    if (this._sceneManager.activeScene !== this.scene.key) return

    super.update(time)

    this._boxList.forEach((b) => {
      if (
        b.list[0] &&
        b.list[0] instanceof Phaser.GameObjects.Rectangle
      ) {
        b.list[0].fillColor = 0x0077b6
      }
    })

    if (this._boxWaitingToSwapIndex !== undefined) {
      const boxWaitingBg = this._boxList[this._boxWaitingToSwapIndex]
        .list[0] as Phaser.GameObjects.Rectangle
      boxWaitingBg.fillColor = 0x123456
    }

    const selectedBoxBg = this._boxList[this._selectedPKMIndex]
      .list[0] as Phaser.GameObjects.Rectangle
    selectedBoxBg.fillColor = 0x123456

    if (this._controls.isInputLocked) return

    if (this._controls.wasBackKeyPressed()) {
      this.events.emit(SCENE_COMMUNICATE_FLAGS.BACK_FROM_PARTY_TO_UI)
      this.scene.stop()
      return
    }

    const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed()
    const selectedDirectionPressedOne =
      this._controls.getDirectionKeyJustPressed()

    if (wasSpaceKeyPressed) {
      // TODO
      this.events.emit(SCENE_COMMUNICATE_FLAGS.BACK_FROM_PARTY_TO_UI)
      this.scene.stop()
      return
    }

    if (selectedDirectionPressedOne !== DIRECTION.NONE) {
      this._movePlayerInputCursor(selectedDirectionPressedOne)
    }
  }

  create() {
    super.create()
    this._sceneManager.activeScene = this.scene.key as SceneKeys
    this.scene.bringToTop(this.scene.key)

    const UIHeight = 100
    const gapX = 80
    const gapY = 50
    const boxWidth = Math.floor((this.scale.width - gapX * 4) / 3)
    const boxHeight = Math.floor(
      (this.scale.height - UIHeight - gapY * 3) / 2
    )
    this._layout = { boxHeight, boxWidth, gapX, gapY, UIHeight }

    this.add
      .rectangle(
        0,
        0,
        this.scale.width,
        this.scale.height,
        0x03045e,
        0.3
      )
      .setOrigin(0)

    this._createUI()

    this._createList()
  }

  _createUI() {
    const UIBg = this.add
      .rectangle(
        0,
        0,
        this.scale.width - this._layout.gapX * 2,
        this._layout.UIHeight,
        0x0077b6,
        DEBUG ? 1 : 0
      )
      .setOrigin(0)
    this.add.container(
      this._layout.gapX,
      this.scale.height - this._layout.UIHeight,
      [UIBg]
    )
  }

  _createList() {
    this._boxList = []

    this._party.forEach((pkm, idx) => {
      let x: number = 0
      if (idx % 3 === 0) {
        // 左列
        x =
          this.scale.width / 2 -
          (this._layout.boxWidth * 3) / 2 -
          this._layout.gapX
      } else if (idx % 3 === 1) {
        // 中列
        x = this.scale.width / 2 - this._layout.boxWidth / 2
      } else {
        // 右列
        x =
          this.scale.width / 2 +
          this._layout.boxWidth / 2 +
          this._layout.gapX
      }
      let y: number = 0
      if (idx < 3) {
        // 上排
        y =
          (this.scale.height - this._layout.UIHeight) / 2 -
          this._layout.boxHeight -
          this._layout.gapY / 2
      } else {
        // 下排
        y =
          (this.scale.height - this._layout.UIHeight) / 2 +
          this._layout.gapY / 2
      }
      this._createPKM(x, y, pkm)
    })
  }

  _createPKM(x: number, y: number, pkm: Pokemon) {
    const moves: Move[] = []
    pkm.moveIds.forEach((id) => {
      const move = DataUtils.getPkmMove(this, id)
      if (move !== undefined) moves.push(move)
    })
    const bg = this.add
      .rectangle(
        0,
        0,
        this._layout.boxWidth,
        this._layout.boxHeight,
        0x0077b6
      )
      .setOrigin(0)
    const avatar = this.add
      .image(
        this._layout.boxWidth / 2,
        this._layout.boxHeight / 2,
        PKM_FRONT_ASSET_KEYS[pkm.assetKey]
      )
      .setScale(2)
    const moveBox = this._createMoveBox(moves)
    const name = this.add.text(10, 10, pkm.name).setOrigin(0)
    const level = this.add
      .text(this._layout.boxWidth - 10, 10, `Lv.${pkm.currentLevel}`)
      .setOrigin(1, 0)
    this._boxList.push(
      this.add.container(x, y, [bg, avatar, moveBox, name, level])
    )
  }

  _createMoveBox(moves: Move[]): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0)

    const mBoxWidth = (this._layout.boxWidth - 30) / 2

    moves.forEach((m, i) => {
      const mText = this.add.text(5, 5, m.name).setOrigin(0)
      let x: number = 0
      let y: number = 0
      if (i % 2 === 0) {
        x = 10
      } else {
        x = mBoxWidth + 20
      }
      if (i > 1) {
        y = mText.height + 20
      }
      const mRect = this.add
        .rectangle(0, 0, mBoxWidth, mText.height + 10, 0x234567)
        .setOrigin(0)
      const mContainer = this.add.container(x, y, [mRect, mText])
      container.add(mContainer)
      container.setY(this._layout.boxHeight - 40 - mText.height * 2)
    })

    return container
  }

  _movePlayerInputCursor(direction: Direction) {
    switch (direction) {
      case DIRECTION.UP:
      case DIRECTION.DOWN:
        if (this._selectedPKMIndex === 0) {
          this._selectedPKMIndex = 3
        } else if (this._selectedPKMIndex === 1) {
          this._selectedPKMIndex = 4
        } else if (this._selectedPKMIndex === 2) {
          this._selectedPKMIndex = 5
        } else if (this._selectedPKMIndex === 3) {
          this._selectedPKMIndex = 0
        } else if (this._selectedPKMIndex === 4) {
          this._selectedPKMIndex = 1
        } else if (this._selectedPKMIndex === 5) {
          this._selectedPKMIndex = 2
        }
        break
      case DIRECTION.LEFT:
        this._selectedPKMIndex -= 1
        if (this._selectedPKMIndex < 0) {
          this._selectedPKMIndex = this._party.length - 1
        }
        break
      case DIRECTION.RIGHT:
        this._selectedPKMIndex += 1
        if (this._selectedPKMIndex > this._party.length - 1) {
          this._selectedPKMIndex = 0
        }
        break
      case DIRECTION.NONE:
        break
      default:
        exhaustiveGuard(direction)
    }
  }
}
