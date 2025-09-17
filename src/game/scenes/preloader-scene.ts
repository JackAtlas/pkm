import { SCENE_KEYS } from './scene-keys'
import {
  BATTLE_BACKGROUND_ASSET_KEYS,
  CHARACTER_ASSET_KEYS,
  DATA_ASSET_KEYS,
  DATABOX_ASSET_KEYS,
  GENERAL_ASSET_KEYS,
  MOVE_ASSET_KEYS,
  POKEMON_BACK_ASSET_KEYS,
  POKEMON_FRONT_ASSET_KEYS,
  POKEMON_SHADOW_ASSET_KEYS,
  TILE_ASSET_KEYS,
  TITLE_ASSET_KEYS,
  WORLD_ASSET_KEYS
} from '@/assets/asset-keys'
import { DataUtils } from '@/utils/data-utils'
import { Animation } from '@/types/typedef'
import { dataManager } from '@/utils/data-manager'
import { BaseScene } from './base-scene'
import { SPEED_MULTIPLIER } from '@/config'

const suffix = '@2x'

export class PreloaderScene extends BaseScene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOADER_SCENE
    })
  }

  // init() {
  //   //  We loaded this image in our Boot Scene, so we can display it here
  //   this.add.image(512, 384, 'background')

  //   //  A simple progress bar. This is the outline of the bar.
  //   this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff)

  //   //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
  //   const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff)

  //   //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
  //   this.load.on('progress', (progress: number) => {
  //     //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
  //     bar.width = 4 + 460 * progress
  //   })
  // }

  preload() {
    super.preload()
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets')

    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.FOREST,
      `Graphics/Battlebacks/forest_bg${suffix}.png`
    )
    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.FOREST_BASE,
      `Graphics/Battlebacks/forest_base0${suffix}.png`
    )
    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.FOREST_BASE_FOE,
      `Graphics/Battlebacks/forest_base1${suffix}.png`
    )
    this.load.image(
      DATABOX_ASSET_KEYS.DATABOX_NORMAL,
      `Graphics/UI/Battle/databox_normal${suffix}.png`
    )
    this.load.image(
      DATABOX_ASSET_KEYS.DATABOX_NORMAL_FOE,
      `Graphics/UI/Battle/databox_normal_foe${suffix}.png`
    )
    this.load.spritesheet(
      DATABOX_ASSET_KEYS.OVERLAY_HP,
      `Graphics/UI/Battle/overlay_hp${suffix}.png`,
      {
        frameWidth: 192,
        frameHeight: 12
      }
    )
    this.load.image(
      DATABOX_ASSET_KEYS.OVERLAY_EXP,
      `Graphics/UI/Battle/overlay_exp${suffix}.png`
    )
    this.load.spritesheet(
      GENERAL_ASSET_KEYS.PAUSE_ARROW,
      `Graphics/pause_arrow${suffix}.png`,
      {
        frameWidth: 40,
        frameHeight: 56
      }
    )
    this.load.image(
      POKEMON_FRONT_ASSET_KEYS.HERACROSS,
      `Graphics/Pokemon/Front/HERACROSS${suffix}.png`
    )
    this.load.image(
      POKEMON_BACK_ASSET_KEYS.CHANDELURE,
      `Graphics/Pokemon/Back/CHANDELURE${suffix}.png`
    )
    this.load.image(
      POKEMON_SHADOW_ASSET_KEYS.SHADOW_SMALL,
      `Graphics/Pokemon/Shadow/1${suffix}.png`
    )
    this.load.image(
      POKEMON_SHADOW_ASSET_KEYS.SHADOW_MEDIUM,
      `Graphics/Pokemon/Shadow/2${suffix}.png`
    )
    this.load.image(
      POKEMON_SHADOW_ASSET_KEYS.SHADOW_LARGE,
      `Graphics/Pokemon/Shadow/3${suffix}.png`
    )

    this.load.json(DATA_ASSET_KEYS.ANIMATIONS, 'data/animations.json')
    this.load.json(DATA_ASSET_KEYS.MOVES, 'data/moves.json')

    this.load.spritesheet(
      MOVE_ASSET_KEYS.ICE_SHARD,
      'Graphics/Animations/icewater.png',
      {
        frameWidth: 192,
        frameHeight: 192
      }
    )

    this.load.spritesheet(
      MOVE_ASSET_KEYS.SCRATCH,
      `Graphics/Animations/scratchbattle${suffix}.png`,
      {
        frameWidth: 384,
        frameHeight: 384
      }
    )

    this.load.image(
      TILE_ASSET_KEYS.RED_TILE,
      'Graphics/Tilesets/Red.png'
    )
    this.load.image(
      TILE_ASSET_KEYS.YELLOW_TILE,
      'Graphics/Tilesets/Yellow.png'
    )

    this.load.tilemapTiledJSON(
      WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL,
      'data/HUB_ISLAND_PC.json'
    )
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_BACKGROUND,
      'Graphics/Map/HUB_Island_PC_Background.png'
    )
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_FOREGROUND,
      'Graphics/Map/HUB_Island_PC_Foreground.png'
    )

    this.load.spritesheet(
      CHARACTER_ASSET_KEYS.PLAYER,
      `Graphics/Characters/Player 01.png`,
      {
        frameWidth: 32,
        frameHeight: 32
      }
    )

    this.load.spritesheet(
      CHARACTER_ASSET_KEYS.NPC_01,
      `Graphics/Characters/NPC_01.png`,
      {
        frameWidth: 32,
        frameHeight: 32
      }
    )
    this.load.spritesheet(
      CHARACTER_ASSET_KEYS.NPC_02,
      `Graphics/Characters/NPC_02.png`,
      {
        frameWidth: 32,
        frameHeight: 32
      }
    )
    this.load.spritesheet(
      CHARACTER_ASSET_KEYS.NPC_03,
      `Graphics/Characters/NPC_03.png`,
      {
        frameWidth: 32,
        frameHeight: 32
      }
    )
    this.load.spritesheet(
      CHARACTER_ASSET_KEYS.NPC_51,
      `Graphics/Characters/NPC_51.png`,
      {
        frameWidth: 32,
        frameHeight: 32
      }
    )
    this.load.spritesheet(
      CHARACTER_ASSET_KEYS.NPC_52,
      `Graphics/Characters/NPC_52.png`,
      {
        frameWidth: 32,
        frameHeight: 32
      }
    )

    this.load.image(
      TITLE_ASSET_KEYS.BACKGROUND,
      'Graphics/Titles/Background.png'
    )
  }

  create() {
    super.create()
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    this._createAnimations()

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    const fontPowerClear = new FontFace(
      'Power Clear',
      'url("/assets/Fonts/power clear.ttf")'
    )
    const fontPowerClearBold = new FontFace(
      'Power Clear Bold',
      'url("/assets/Fonts/power clear bold.ttf")'
    )
    const fontPowerGreen = new FontFace(
      'Power Green',
      'url("/assets/Fonts/power green.ttf")'
    )
    const fontPowerGreenNarrow = new FontFace(
      'Power Green Narrow',
      'url("/assets/Fonts/power green narrow.ttf")'
    )
    const fontPowerGreenSmall = new FontFace(
      'Power Green Small',
      'url("/assets/Fonts/power green small.ttf")'
    )
    const fontPowerRedAndBlue = new FontFace(
      'Power Red and Blue',
      'url("/assets/Fonts/power red and blue.ttf")'
    )
    const fontPowerRedAndBlueIntl = new FontFace(
      'Power Red and Blue intl',
      'url("/assets/Fonts/power red and blue intl.ttf")'
    )
    const fontPowerRedAndGreen = new FontFace(
      'Power Red and Green',
      'url("/assets/Fonts/power red and green.ttf")'
    )
    const boldPixels = new FontFace(
      'Bold Pixels',
      'url("/assets/Fonts/BoldPixels.ttf")'
    )
    Promise.all([
      fontPowerClear.load(),
      fontPowerClearBold.load(),
      fontPowerGreen.load(),
      fontPowerGreenNarrow.load(),
      fontPowerGreenSmall.load(),
      fontPowerRedAndBlue.load(),
      fontPowerRedAndBlueIntl.load(),
      fontPowerRedAndGreen.load(),
      boldPixels.load()
    ]).then((loadedFonts) => {
      loadedFonts.forEach((loadedFont) => {
        document.fonts.add(loadedFont)
      })
      dataManager.loadData()
      this.scene.start(SCENE_KEYS.WORLD_SCENE)
    })
  }

  _createAnimations() {
    const animations = DataUtils.getAnimations(this)
    animations.forEach((animation: Animation) => {
      const frames = animation.frames
        ? this.anims.generateFrameNumbers(animation.assetKey, {
            frames: animation.frames
          })
        : this.anims.generateFrameNumbers(animation.assetKey)
      this.anims.create({
        key: animation.key,
        frames,
        frameRate: animation.frameRate * SPEED_MULTIPLIER,
        repeat: animation.repeat,
        delay: animation.delay || 0,
        yoyo: animation.yoyo || false
      })
    })
  }
}
