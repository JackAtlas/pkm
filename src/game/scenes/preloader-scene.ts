import { Scene } from 'phaser'
import { SCENE_KEYS } from './scene-keys'
import {
  BATTLE_BACKGROUND_ASSET_KEYS,
  DATA_ASSET_KEYS,
  DATABOX_ASSET_KEYS,
  POKEMON_BACK_ASSET_KEYS,
  POKEMON_FRONT_ASSET_KEYS,
  POKEMON_SHADOW_ASSET_KEYS
} from '@/assets/asset-keys'

export class PreloaderScene extends Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOADER_SCENE
    })
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, 'background')

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff)

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff)

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress
    })
  }

  preload() {
    console.log(`[${PreloaderScene.name}: preload] invoked`)
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath('assets')

    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.FOREST,
      'Graphics/Battlebacks/forest_bg@2x.png'
    )
    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.FOREST_BASE,
      'Graphics/Battlebacks/forest_base0@2x.png'
    )
    this.load.image(
      BATTLE_BACKGROUND_ASSET_KEYS.FOREST_BASE_FOE,
      'Graphics/Battlebacks/forest_base1@2x.png'
    )
    this.load.image(
      DATABOX_ASSET_KEYS.DATABOX_NORMAL,
      'Graphics/UI/Battle/databox_normal@2x.png'
    )
    this.load.image(
      DATABOX_ASSET_KEYS.DATABOX_NORMAL_FOE,
      'Graphics/UI/Battle/databox_normal_foe@2x.png'
    )
    this.load.spritesheet(
      DATABOX_ASSET_KEYS.OVERLAY_HP,
      'Graphics/UI/Battle/overlay_hp@2x.png',
      {
        frameWidth: 192,
        frameHeight: 12
      }
    )
    this.load.image(
      DATABOX_ASSET_KEYS.OVERLAY_EXP,
      'Graphics/UI/Battle/overlay_exp@2x.png'
    )
    this.load.image(
      POKEMON_FRONT_ASSET_KEYS.HERACROSS,
      'Graphics/Pokemon/Front/HERACROSS@2x.png'
    )
    this.load.image(
      POKEMON_BACK_ASSET_KEYS.CHANDELURE,
      'Graphics/Pokemon/Back/CHANDELURE@2x.png'
    )
    this.load.image(
      POKEMON_SHADOW_ASSET_KEYS.SHADOW_SMALL,
      'Graphics/Pokemon/Shadow/1@2x.png'
    )
    this.load.image(
      POKEMON_SHADOW_ASSET_KEYS.SHADOW_MEDIUM,
      'Graphics/Pokemon/Shadow/2@2x.png'
    )
    this.load.image(
      POKEMON_SHADOW_ASSET_KEYS.SHADOW_LARGE,
      'Graphics/Pokemon/Shadow/3@2x.png'
    )

    this.load.json(DATA_ASSET_KEYS.MOVES, 'data/moves.json')
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    console.log(`[${PreloaderScene.name}: create] invoked`)
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
    Promise.all([
      fontPowerClear.load(),
      fontPowerClearBold.load(),
      fontPowerGreen.load(),
      fontPowerGreenNarrow.load(),
      fontPowerGreenSmall.load(),
      fontPowerRedAndBlue.load(),
      fontPowerRedAndBlueIntl.load(),
      fontPowerRedAndGreen.load()
    ]).then((loadedFonts) => {
      loadedFonts.forEach((loadedFont) => {
        document.fonts.add(loadedFont)
      })
      this.scene.start(SCENE_KEYS.BATTLE_SCENE)
    })
  }
}
