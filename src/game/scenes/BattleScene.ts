import { Scene } from 'phaser'
import { SCENE_KEYS } from './scene-keys'
import {
  BATTLE_BACKGROUND_ASSET_KEYS,
  POKEMON_FRONT_ASSET_KEYS,
  POKEMON_BACK_ASSET_KEYS,
  DATABOX_ASSET_KEYS,
  PKM_NAME_KEYS,
  POKEMON_SHADOW_ASSET_KEYS
} from '../../assets/asset-keys'

export class BattleScene extends Scene {
  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE
    })
  }

  create() {
    console.log(`[${BattleScene.name}: create] invoked`)

    // 场景背景
    const battleBackgroundImageObj = this.add
      .image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST)
      .setOrigin(0)
    const battleSceneContainer = this.add.container(0, 0, [
      battleBackgroundImageObj
    ])
    battleSceneContainer.width = battleBackgroundImageObj.width
    battleSceneContainer.height = battleBackgroundImageObj.height

    // 敌方精灵场地
    const baseFoeImageObj = this.add
      .image(0, 180, BATTLE_BACKGROUND_ASSET_KEYS.FOREST_BASE_FOE)
      .setOrigin(0)
    battleSceneContainer.add(baseFoeImageObj)
    baseFoeImageObj.setX(
      battleSceneContainer.width - baseFoeImageObj.width + 2
    )

    // 我方精灵场地
    const baseImageObj = this.add
      .image(0, 0, BATTLE_BACKGROUND_ASSET_KEYS.FOREST_BASE)
      .setOrigin(0)
    battleSceneContainer.add(baseImageObj)
    baseImageObj
      .setX(-320)
      .setY(battleSceneContainer.height - (baseImageObj.height - 10))
      .setCrop(
        Math.abs(baseImageObj.x),
        0,
        baseImageObj.width,
        baseImageObj.height - 10
      )

    // 敌方精灵脚下阴影
    const foeShadowImageObj = this.add.image(
      battleSceneContainer.width - 250,
      310,
      POKEMON_SHADOW_ASSET_KEYS.SHADOW_MEDIUM
    )
    battleSceneContainer.add(foeShadowImageObj)

    // 敌方精灵
    const foePkmImageObj = this.add.image(
      760,
      190,
      POKEMON_FRONT_ASSET_KEYS.HERACROSS
    )
    battleSceneContainer.add(foePkmImageObj)

    // 我方精灵
    const pkmImageObj = this.add
      .image(80, 0, POKEMON_BACK_ASSET_KEYS.CHANDELURE)
      .setOrigin(0)
    battleSceneContainer.add(pkmImageObj)
    pkmImageObj.setY(battleSceneContainer.height - pkmImageObj.height)

    // 我方数据栏
    const dataBoxContainerObj = this.#createDataBox({
      player: {
        box: DATABOX_ASSET_KEYS.DATABOX_NORMAL,
        pkm: PKM_NAME_KEYS.CHANDELURE
      }
    })
    battleSceneContainer.add(dataBoxContainerObj)
    dataBoxContainerObj.setX(
      battleSceneContainer.width - dataBoxContainerObj.width
    )
    dataBoxContainerObj.setY(
      battleSceneContainer.height - dataBoxContainerObj.height - 50
    )

    // 敌方数据栏
    const dataBoxFoeContainerObj = this.#createDataBox({
      foe: {
        box: DATABOX_ASSET_KEYS.DATABOX_NORMAL_FOE,
        pkm: PKM_NAME_KEYS.HERACROSS
      }
    })
    battleSceneContainer.add(dataBoxFoeContainerObj)
    dataBoxFoeContainerObj.setY(20)

    // 设置场景居中
    battleSceneContainer.setX(
      (this.scale.width - battleSceneContainer.width) / 2
    )
    battleSceneContainer.setY(
      (this.scale.height - battleSceneContainer.height) / 2
    )
  }

  #createDataBox(options: {
    foe?: { box: string; pkm: string }
    player?: { box: string; pkm: string }
  }) {
    let dataBox = ''
    let pkmName = 'MissingNo.'
    let pkmNameX = 0
    let overlayHpX = 0
    let levelOffsetX = 0
    if (options.player) {
      dataBox = options.player.box
      pkmName = options.player.pkm
      pkmNameX = 80
      overlayHpX = 272
      levelOffsetX = -48
    } else if (options.foe) {
      dataBox = options.foe.box
      pkmName = options.foe.pkm
      pkmNameX = 20
      overlayHpX = 236
      levelOffsetX = -84
    } else {
      console.error('No player or foe option provided')
    }

    const dataBoxImageObj = this.add.image(0, 0, dataBox).setOrigin(0)

    const pkmNameTextObj = this.add.text(pkmNameX, 22, pkmName, {
      color: '#484848',
      fontSize: '36px',
      fontFamily: 'Power Green'
    })

    const overlayHPTextureSourceImage = this.textures
      .get(DATABOX_ASSET_KEYS.OVERLAY_HP)
      .getSourceImage()
    const overlayHPImageObj = this.add
      .tileSprite(
        overlayHpX,
        80,
        overlayHPTextureSourceImage.width,
        overlayHPTextureSourceImage.height / 3,
        DATABOX_ASSET_KEYS.OVERLAY_HP
      )
      .setOrigin(0)

    const levelTextObj = this.add.text(0, 32, 'Lv.14', {
      color: '#484848',
      fontSize: '28px',
      fontFamily: 'Power Green',
      fontStyle: 'bold'
    })
    levelTextObj.setX(
      dataBoxImageObj.width - levelTextObj.width + levelOffsetX
    )

    const objArr = [
      dataBoxImageObj,
      pkmNameTextObj,
      overlayHPImageObj,
      levelTextObj
    ]

    if (options.player) {
      objArr.push(
        this.add
          .tileSprite(80, 148, 0, 0, DATABOX_ASSET_KEYS.OVERLAY_EXP)
          .setOrigin(0)
      )
      objArr.push(
        this.add.text(280, 106, '25 / 25', {
          color: '#484848',
          fontSize: '32px',
          fontStyle: 'bold'
        })
      )
    }

    const container = this.add.container(0, 0, objArr)
    container.width = dataBoxImageObj.width
    container.height = dataBoxImageObj.height
    return container
  }
}
