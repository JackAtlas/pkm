import { AUTO, Game } from 'phaser'
import {
  BattleScene,
  BootScene,
  OptionsScene,
  PKMPartyScene,
  PreloaderScene,
  TitleScene,
  WorldScene
} from './scenes'

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
  scale: {
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    mode: Phaser.Scale.ScaleModes.FIT
  },
  parent: 'game-container',
  backgroundColor: '0x000000',
  scene: [
    BootScene,
    PreloaderScene,
    TitleScene,
    OptionsScene,
    BattleScene,
    WorldScene,
    PKMPartyScene
  ]
}

const StartGame = (parent: string) => {
  return new Game({ ...config, parent })
}

export default StartGame
