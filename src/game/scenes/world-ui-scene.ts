import {
  DATA_MANAGER_STORE_KEYS,
  dataManager
} from '@/utils/data-manager'
import { BaseScene } from './base-scene'
import { SCENE_KEYS, SceneKeys } from './scene-keys'
import { Pokemon } from '@/types/typedef'
import {
  PKM_FRONT_ASSET_KEYS,
  PKM_ICON_ASSET_KEYS
} from '@/asset-keys'
import { Menu } from '@/world/menu/menu'
import { DIRECTION } from '@/common/direction'
import { SCENE_COMMUNICATE_FLAGS } from '@/utils/scene-manager'

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

export class WorldUIScene extends BaseScene {
  protected _fpsText: Phaser.GameObjects.Text
  protected _topbarBg: Phaser.GameObjects.Rectangle
  protected _partyContainer: Phaser.GameObjects.Container

  protected _menu: Menu

  protected _isPartyOpen: boolean = false

  protected _sideCanvasArray: Phaser.Textures.CanvasTexture[] = []

  constructor() {
    super({
      key: SCENE_KEYS.WORLD_UI_SCENE
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

    this._menu = new Menu(this)

    this.scene
      .get(SCENE_KEYS.WORLD_SCENE)
      .events.on(SCENE_COMMUNICATE_FLAGS.SHOW_WORLD_MENU, () => {
        this._showWorldMenu()
      })
  }

  update(time: DOMHighResTimeStamp) {
    super.update(time)

    const fps = this.game.loop.actualFps.toFixed(1)
    this._fpsText.setText(`FPS: ${fps}`)

    if (this._sceneManager.activeScene === this.scene.key) {
      const wasSpaceKeyPressed = this._controls.wasSpaceKeyPressed()
      const selectedDirectionPressedOne =
        this._controls.getDirectionKeyJustPressed()

      if (this._menu.isVisible) {
        if (selectedDirectionPressedOne !== DIRECTION.NONE) {
          this._menu.handlePlayerInput(selectedDirectionPressedOne)
        }

        if (wasSpaceKeyPressed) {
          this._menu.handlePlayerInput('OK')

          if (this._menu.selectedMenuOption === 'PARTY') {
            this.scene.start(SCENE_KEYS.PARTY_SCENE)
          }

          if (this._menu.selectedMenuOption === 'SAVE') {
            dataManager.saveData()
            this._hideWorldMenu()

            // TODO 做一个 Toast 功能
            console.log('Game progress has been saved')
          } else if (this._menu.selectedMenuOption === 'EXIT') {
            this._hideWorldMenu()
          }
        }

        if (this._controls.wasBackKeyPressed()) {
          this._hideWorldMenu()
        }
      }
    }
  }

  _showWorldMenu() {
    this._sceneManager.activeScene = this.scene.key as SceneKeys
    this._isPartyOpen = true
    this._menu.show()
    this._updatePartyLayout()
  }

  _hideWorldMenu() {
    this._sceneManager.activeScene = SCENE_KEYS.WORLD_SCENE
    this._isPartyOpen = false
    this._menu.hide()
    this._updatePartyLayout()
    this.events.emit(SCENE_COMMUNICATE_FLAGS.HIDE_WORLD_MENU)
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
        if (hpPercentage < 0.5) {
          ctx.strokeStyle = '#f8b000'
        }
        if (hpPercentage < 0.25) {
          ctx.strokeStyle = '#f85828'
        }
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
      avatar: Phaser.GameObjects.Image
      name: Phaser.GameObjects.Text
    }[] = []
    this._partyContainer.list.forEach((childContainer) => {
      if (childContainer instanceof Phaser.GameObjects.Container) {
        const childBg = childContainer.list[0]
        const childRing = childContainer.list[1]
        const childAvatar = childContainer.list[2]
        const childName = childContainer.list[3]
        if (
          childBg instanceof Phaser.GameObjects.Graphics &&
          childRing instanceof Phaser.GameObjects.Image &&
          childAvatar instanceof Phaser.GameObjects.Image &&
          childName instanceof Phaser.GameObjects.Text
        ) {
          childArray.push({
            container: childContainer,
            graphic: childBg,
            ring: childRing,
            avatar: childAvatar,
            name: childName
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
        progress: { from: 1, to: 0 },
        w: { from: CLOSE_SIZE.WIDTH, to: OPEN_SIZE.WIDTH },
        h: { from: CLOSE_SIZE.HEIGHT, to: OPEN_SIZE.HEIGHT },
        ease: 'Linear',
        duration: 300,
        onUpdate: (
          tween,
          target: { progress: number; w: number; h: number }
        ) => {
          for (let i = 0; i < childArray.length; i++) {
            const { container, graphic, ring, avatar, name } =
              childArray[i]
            graphic.clear()
            graphic.fillRect(0, 0, target.w, target.h)
            container.setPosition(
              -target.w - padding,
              (padding + target.h) * i
            )
            ring.setAlpha(target.progress)
            const avatarX =
              (CLOSE_SIZE.WIDTH / 2 - avatar.width / 2) *
                target.progress +
              (CLOSE_SIZE.WIDTH / 10) * (1 - target.progress)
            const avatarY =
              (CLOSE_SIZE.HEIGHT / 2 - avatar.height / 2) *
                target.progress +
              (CLOSE_SIZE.HEIGHT / 10) * (1 - target.progress)
            avatar.setPosition(avatarX, avatarY)
            name.setAlpha(1 - target.progress)
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
        progress: { from: 0, to: 1 },
        w: { from: OPEN_SIZE.WIDTH, to: CLOSE_SIZE.WIDTH },
        h: { from: OPEN_SIZE.HEIGHT, to: CLOSE_SIZE.HEIGHT },
        ease: 'Linear',
        duration: 300,
        onUpdate: (tween, target) => {
          for (let i = 0; i < childArray.length; i++) {
            const { container, graphic, ring, avatar, name } =
              childArray[i]
            graphic.clear()
            graphic.fillRect(0, 0, target.w, target.h)
            container.setPosition(
              -target.w - padding,
              (padding + target.h) * i
            )
            ring.setAlpha(target.progress)
            const avatarX =
              (CLOSE_SIZE.WIDTH / 2 - avatar.width / 2) *
                target.progress +
              (CLOSE_SIZE.HEIGHT / 10) * (1 - target.progress)
            const avatarY =
              (CLOSE_SIZE.HEIGHT / 2 - avatar.height / 2) *
                target.progress +
              (CLOSE_SIZE.HEIGHT / 10) * (1 - target.progress)
            avatar.setPosition(avatarX, avatarY)
            name.setAlpha(1 - target.progress)
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
        const avatar = this.add.image(
          0,
          0,
          PKM_FRONT_ASSET_KEYS[pkm.assetKey]
        )
        avatar
          .setPosition(
            CLOSE_SIZE.WIDTH / 2 - avatar.width / 2,
            CLOSE_SIZE.HEIGHT / 2 - avatar.height / 2
          )
          .setOrigin(0)
        child.add(avatar)
        const name = this.add
          .text(
            (CLOSE_SIZE.WIDTH * 3) / 4,
            CLOSE_SIZE.HEIGHT / 8,
            pkm.name,
            {
              fontFamily: 'Power Green',
              fontSize: 16
            }
          )
          .setAlpha(0)
        child.add(name)
      }
    })
  }
}
