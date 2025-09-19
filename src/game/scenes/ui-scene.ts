import {
  DATA_MANAGER_STORE_KEYS,
  dataManager
} from '@/utils/data-manager'
import { BaseScene } from './base-scene'
import { SCENE_KEYS } from './scene-keys'
import { Pokemon } from '@/types/typedef'
import { PKM_ICON_KEYS } from '@/assets/asset-keys'

const sideRingPrefix = 'Side_Ring_'
const strokeWidth = 2
const padding = 20

const CLOSE_SIZE = Object.freeze({
  WIDTH: 160,
  HEIGHT: 160
})

const OPEN_SIZE = Object.freeze({
  WIDTH: 400,
  HEIGHT: 160
})

export class UIScene extends BaseScene {
  protected _fpsText: Phaser.GameObjects.Text
  protected _topbarBg: Phaser.GameObjects.Rectangle
  protected _partyContainer: Phaser.GameObjects.Container

  protected _isPartyOpen: boolean = false

  protected _sideCanvasArray: Phaser.Textures.CanvasTexture[] = []

  constructor() {
    super({
      key: SCENE_KEYS.UI_SCENE
    })
  }

  init() {
    super.init()
  }

  create() {
    super.create()

    for (let i = 0; i < 6; i++) {
      const canvas = this.textures.createCanvas(
        `${sideRingPrefix}${i}`,
        CLOSE_SIZE.WIDTH,
        CLOSE_SIZE.HEIGHT
      )
      if (canvas) this._sideCanvasArray.push(canvas)
    }

    this._createTopbar()

    this._createPartyContainer()

    this._updateParty()

    this.scene
      .get(SCENE_KEYS.WORLD_SCENE)
      .events.on('party', (val: boolean) => {
        this._isPartyOpen = val
        this._updatePartyLayout()
      })
  }

  update(time: DOMHighResTimeStamp) {
    super.update(time)

    const fps = this.game.loop.actualFps.toFixed(1)
    this._fpsText.setText(`FPS: ${fps}`)
  }

  _createTopbar() {
    this._fpsText = this.add
      .text(this.scale.width - 10, 10, '', {
        fontFamily: 'sans-serif',
        color: '#ffffff'
      })
      .setOrigin(1, 0)

    this._topbarBg = this.add
      .rectangle(
        0,
        0,
        this.scale.width,
        this._fpsText.height + 20,
        0x000000,
        0.3
      )
      .setOrigin(0)

    this.add.container(0, 0, [this._topbarBg, this._fpsText])
  }

  _updateTexture(
    idx: number,
    hpPercentage: number = 1,
    expPercentage: number = 1
  ) {
    const canvas = this._sideCanvasArray[idx]
    if (canvas) {
      canvas.clear()
      const ctx = this._sideCanvasArray[idx].getContext()

      if (ctx) {
        const startAngle = -Math.PI / 2
        const hpEndAngle = startAngle + hpPercentage * Math.PI * 2
        const expEndAngle = startAngle + expPercentage * Math.PI * 2

        ctx.lineWidth = strokeWidth * 2
        ctx.strokeStyle = '#3060d8' // EXP
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 1
        ctx.shadowOffsetX = 3
        ctx.shadowOffsetY = 3
        ctx.beginPath()
        ctx.arc(
          CLOSE_SIZE.WIDTH / 2,
          CLOSE_SIZE.HEIGHT / 2,
          CLOSE_SIZE.WIDTH / 4,
          startAngle,
          expEndAngle
        )
        ctx.stroke()

        ctx.strokeStyle = '#18c020' // HP
        ctx.beginPath()
        ctx.arc(
          CLOSE_SIZE.WIDTH / 2,
          CLOSE_SIZE.HEIGHT / 2,
          (CLOSE_SIZE.WIDTH * 3) / 8,
          startAngle,
          hpEndAngle
        )
        ctx.stroke()
      }
    }

    const texture = this.textures.get(`${sideRingPrefix}${idx}`)
    if (texture instanceof Phaser.Textures.CanvasTexture) {
      texture.refresh()
    }
  }

  _createPartyContainer() {
    this._partyContainer = this.add.container(
      this.scale.width,
      this._topbarBg.height
    )
    for (let i = 0; i < 6; i++) {
      const bg = this.add.graphics({
        fillStyle: {
          alpha: 0.3,
          color: 0xffffff
        },
        lineStyle: {
          color: 0xffffff,
          width: strokeWidth * 2
        }
      })
      bg.fillRect(0, 0, CLOSE_SIZE.WIDTH, CLOSE_SIZE.HEIGHT)
      this._partyContainer.add(
        this.add.container(
          -CLOSE_SIZE.WIDTH - padding,
          (padding + CLOSE_SIZE.HEIGHT) * i,
          bg
        )
      )
    }

    // this._updatePartyLayout()
  }

  _updatePartyLayout() {
    if (!this._partyContainer) return

    const childArray: {
      container: Phaser.GameObjects.Container
      graphic: Phaser.GameObjects.Graphics
      ring: Phaser.GameObjects.Image
      avatar: Phaser.GameObjects.Sprite
    }[] = []
    this._partyContainer.list.forEach((childContainer) => {
      if (childContainer instanceof Phaser.GameObjects.Container) {
        const childBg = childContainer.list[0]
        const childRing = childContainer.list[1]
        const childAvatar = childContainer.list[2]
        if (
          childBg instanceof Phaser.GameObjects.Graphics &&
          childRing instanceof Phaser.GameObjects.Image &&
          childAvatar instanceof Phaser.GameObjects.Sprite
        ) {
          childArray.push({
            container: childContainer,
            graphic: childBg,
            ring: childRing,
            avatar: childAvatar
          })
        }
      }
    })

    if (this._isPartyOpen) {
      this.tweens.add({
        targets: {
          progress: 1,
          w: CLOSE_SIZE.WIDTH,
          h: CLOSE_SIZE.HEIGHT
        },
        progress: { from: 0, to: 1 },
        w: { from: CLOSE_SIZE.WIDTH, to: OPEN_SIZE.WIDTH },
        h: { from: CLOSE_SIZE.HEIGHT, to: OPEN_SIZE.HEIGHT },
        ease: 'Linear',
        duration: 300,
        onUpdate: (
          tween,
          target: { progress: number; w: number; h: number }
        ) => {
          for (let i = 0; i < childArray.length; i++) {
            const { container, graphic, ring, avatar } = childArray[i]
            graphic.clear()
            graphic.fillRect(0, 0, target.w, target.h)
            container.setPosition(
              -target.w - padding,
              (padding + target.h) * i
            )
            ring.setAlpha(1 - target.progress)
            const avatarX =
              CLOSE_SIZE.WIDTH / 2 -
              (CLOSE_SIZE.WIDTH / 4) * target.progress
            const avatarY =
              CLOSE_SIZE.HEIGHT / 2 -
              (CLOSE_SIZE.HEIGHT / 4) * target.progress
            avatar.setPosition(avatarX, avatarY)
          }
        }
      })
    } else {
      this.tweens.add({
        targets: {
          progress: 0,
          w: OPEN_SIZE.WIDTH,
          h: OPEN_SIZE.HEIGHT
        },
        progress: { from: 1, to: 0 },
        w: { from: OPEN_SIZE.WIDTH, to: CLOSE_SIZE.WIDTH },
        h: { from: OPEN_SIZE.HEIGHT, to: CLOSE_SIZE.HEIGHT },
        ease: 'Linear',
        duration: 300,
        onUpdate: (tween, target) => {
          for (let i = 0; i < childArray.length; i++) {
            const { container, graphic, ring, avatar } = childArray[i]
            graphic.clear()
            graphic.fillRect(0, 0, target.w, target.h)
            container.setPosition(
              -target.w - padding,
              (padding + target.h) * i
            )
            ring.setAlpha(1 - target.progress)
            const avatarX =
              CLOSE_SIZE.WIDTH / 2 -
              (CLOSE_SIZE.WIDTH / 4) * target.progress
            const avatarY =
              CLOSE_SIZE.HEIGHT / 2 -
              (CLOSE_SIZE.HEIGHT / 4) * target.progress
            avatar.setPosition(avatarX, avatarY)
          }
        }
      })
    }
  }

  _updateParty() {
    const party = dataManager.store.get(
      DATA_MANAGER_STORE_KEYS.PKM_IN_PARTY
    )
    if (!party || !this._partyContainer) return

    party.forEach((pkm: Pokemon, index: number) => {
      const child = this._partyContainer.list[index]
      if (child instanceof Phaser.GameObjects.Container) {
        child.add(
          this.add.image(
            CLOSE_SIZE.WIDTH / 2,
            CLOSE_SIZE.HEIGHT / 2,
            `${sideRingPrefix}${index}`
          )
        )
        this._updateTexture(index, pkm.currentHp / pkm.maxHp)
        const sprite = this.add
          .sprite(
            CLOSE_SIZE.WIDTH / 2,
            CLOSE_SIZE.HEIGHT / 2,
            PKM_ICON_KEYS[pkm.assetKey],
            0
          )
          .play(PKM_ICON_KEYS[pkm.assetKey])
        child.add(sprite)
      }
    })
  }
}
