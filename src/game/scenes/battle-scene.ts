import { Scene } from 'phaser'
import { SCENE_KEYS } from '@/game/scenes/scene-keys'
import {
  BATTLE_BACKGROUND_ASSET_KEYS,
  POKEMON_FRONT_ASSET_KEYS,
  POKEMON_BACK_ASSET_KEYS,
  PKM_NAME_KEYS,
  POKEMON_SHADOW_ASSET_KEYS
} from '@/assets/asset-keys'
import { BattleMenu } from '@/battle/ui/menu/battle-menu'
import { DIRECTION } from '@/common/direction'
import { Background } from '@/battle/background'
import { FoeBattlePKM } from '@/battle/pkm/foe-battle-pkm'
import { PlayerBattlePKM } from '@/battle/pkm/player-battle-pkm'

export class BattleScene extends Scene {
  _battleMenu: BattleMenu
  _cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys

  /** 我方精灵 */
  _activePlayerPkm: PlayerBattlePKM
  /** 我方精灵出招下标 */
  _activePlayerMoveIndex: number

  /** 敌方精灵 */
  _activeFoePkm: FoeBattlePKM

  constructor() {
    super({
      key: SCENE_KEYS.BATTLE_SCENE
    })
  }

  init() {
    this._activePlayerMoveIndex = -1
  }

  create() {
    console.log(`[${BattleScene.name}: create] invoked`)

    // 场景背景
    const battleSceneContainer = this.add.container(0, 0)
    const background = new Background(this, battleSceneContainer)
    background.showForest()

    // 敌方精灵
    this._activeFoePkm = new FoeBattlePKM({
      scene: this,
      container: battleSceneContainer,
      base: {
        assetKey: BATTLE_BACKGROUND_ASSET_KEYS.FOREST_BASE_FOE,
        x: 0,
        y: 180
      },
      shadow: {
        assetKey: POKEMON_SHADOW_ASSET_KEYS.SHADOW_MEDIUM,
        x: battleSceneContainer.width - 250,
        y: 310
      },
      pkm: {
        name: PKM_NAME_KEYS.HERACROSS,
        assetKey: POKEMON_FRONT_ASSET_KEYS.HERACROSS,
        assetFrame: 0,
        currentLevel: 5,
        maxHp: 100,
        currentHp: 100,
        baseAttack: 10,
        moveIds: [1]
      }
    })

    // 我方精灵
    this._activePlayerPkm = new PlayerBattlePKM({
      scene: this,
      container: battleSceneContainer,
      base: {
        assetKey: BATTLE_BACKGROUND_ASSET_KEYS.FOREST_BASE,
        x: 0,
        y: 0
      },
      shadow: {
        assetKey: POKEMON_SHADOW_ASSET_KEYS.SHADOW_MEDIUM,
        x: battleSceneContainer.width - 250,
        y: 310
      },
      pkm: {
        name: PKM_NAME_KEYS.CHANDELURE,
        assetKey: POKEMON_BACK_ASSET_KEYS.CHANDELURE,
        assetFrame: 0,
        currentLevel: 5,
        maxHp: 100,
        currentHp: 100,
        baseAttack: 10,
        moveIds: [2]
      }
    })

    const midTopContainer = this.add.container(0, 0)
    const midBottomContainer = this.add.container(0, 0)
    midTopContainer.width = midBottomContainer.width =
      battleSceneContainer.width
    midTopContainer.height = midBottomContainer.height =
      (this.scale.height - battleSceneContainer.height) / 2

    const midContainer = this.add.container(0, 0, [
      midTopContainer,
      battleSceneContainer,
      midBottomContainer
    ])
    midContainer.width = battleSceneContainer.width
    midContainer.height = this.scale.height
    battleSceneContainer.setY(midTopContainer.height)
    midBottomContainer.setY(
      midTopContainer.height + battleSceneContainer.height
    )

    // 战斗菜单
    this._battleMenu = new BattleMenu(
      this,
      midBottomContainer,
      this._activePlayerPkm
    )
    this._battleMenu.showMainBattleMenu()

    // 设置场景居中
    midContainer.setX((this.scale.width - midContainer.width) / 2)

    this._cursorKeys = this.input.keyboard!.createCursorKeys()
  }

  update() {
    const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(
      this._cursorKeys.space
    )
    if (wasSpaceKeyPressed) {
      this._battleMenu.handlePlayerInput('OK')

      // check if the player selected a move, and update display text
      if (this._battleMenu.selectedMove === undefined) {
        return
      }
      this._activePlayerMoveIndex = this._battleMenu.selectedMove

      if (!this._activePlayerPkm.moves[this._activePlayerMoveIndex])
        return

      this._battleMenu.hidePkmMoveSubMenu()
      this._handleBattleSequence()
    }

    if (Phaser.Input.Keyboard.JustDown(this._cursorKeys.shift)) {
      this._battleMenu.handlePlayerInput('CANCEL')
      return
    }

    let selectedDirection: DIRECTION = DIRECTION.NONE
    if (Phaser.Input.Keyboard.JustDown(this._cursorKeys.left)) {
      selectedDirection = DIRECTION.LEFT
    } else if (
      Phaser.Input.Keyboard.JustDown(this._cursorKeys.right)
    ) {
      selectedDirection = DIRECTION.RIGHT
    } else if (Phaser.Input.Keyboard.JustDown(this._cursorKeys.up)) {
      selectedDirection = DIRECTION.UP
    } else if (
      Phaser.Input.Keyboard.JustDown(this._cursorKeys.down)
    ) {
      selectedDirection = DIRECTION.DOWN
    }

    if (selectedDirection !== DIRECTION.NONE) {
      this._battleMenu.handlePlayerInput(selectedDirection)
    }
  }

  _handleBattleSequence() {
    this._playerAttack()
  }

  _playerAttack() {
    if (this._activePlayerPkm.isFainted) {
      this._postBattleSequenceCheck()
      return
    }

    this._battleMenu.updateInfoPaneMessagesAndWaitForInput(
      [
        `${this._activePlayerPkm.name} used ${
          this._activePlayerPkm.moves[this._activePlayerMoveIndex]
            .name
        }`
      ],
      () => {
        this.time.delayedCall(500, () => {
          this._activeFoePkm.takeDamage(
            this._activePlayerPkm.baseAttack,
            () => {
              this._foeAttack()
            }
          )
        })
      }
    )
  }

  _foeAttack() {
    if (this._activeFoePkm.isFainted) {
      this._postBattleSequenceCheck()
      return
    }

    this._battleMenu.updateInfoPaneMessagesAndWaitForInput(
      [
        `foe ${this._activeFoePkm.name} used ${this._activeFoePkm.moves[0].name}`
      ],
      () => {
        this.time.delayedCall(500, () => {
          this._activePlayerPkm.takeDamage(
            this._activeFoePkm.baseAttack,
            () => {
              this._postBattleSequenceCheck()
            }
          )
        })
      }
    )
  }

  _postBattleSequenceCheck() {
    if (this._activeFoePkm.isFainted) {
      this._battleMenu.updateInfoPaneMessagesAndWaitForInput(
        [
          `Wild ${this._activeFoePkm.name} fainted`,
          `You have gained some experience`
        ],
        () => {
          this._transitionToNextScene()
        }
      )
      return
    }

    if (this._activePlayerPkm.isFainted) {
      this._battleMenu.updateInfoPaneMessagesAndWaitForInput(
        [
          `${this._activePlayerPkm.name} fainted`,
          `You have no more pokemons, escaping to safty...`
        ],
        () => {
          this._transitionToNextScene()
        }
      )
      return
    }

    this._battleMenu.showMainBattleMenu()
  }

  _transitionToNextScene() {
    this.cameras.main.fadeOut(600, 0, 0, 0)
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start(SCENE_KEYS.BATTLE_SCENE)
      }
    )
  }
}
