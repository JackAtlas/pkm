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
import { StateMachine } from '@/utils/state-machine'
import {
  SKIP_BATTLE_ANIMATIONS,
  SKIP_TEXT_ANIMATIONS
} from '@/config'

const BATTLE_STATES = Object.freeze({
  INTRO: 'INTRO',
  PRE_BATTLE_INFO: 'PRE_BATTLE_INFO',
  BRING_OUT_PKM: 'BRING_OUT_PKM',
  PLAYER_INPUT: 'PLAYER_INPUT',
  FOE_INPUT: 'FOE_INPUT',
  BATTLE: 'BATTLE',
  POST_ATTACK_CHECK: 'POST_ATTACK_CHECK',
  FINISHED: 'FINISHED',
  FLEE_ATTEMPT: 'FLEE_ATTEMPT'
})

export class BattleScene extends Scene {
  _battleMenu: BattleMenu
  _cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys

  /** 我方精灵 */
  _activePlayerPkm: PlayerBattlePKM
  /** 我方精灵出招下标 */
  _activePlayerMoveIndex: number

  _battleStateMachine: StateMachine

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
      baseAssetKey: BATTLE_BACKGROUND_ASSET_KEYS.FOREST_BASE_FOE,
      shadowAssetKey: POKEMON_SHADOW_ASSET_KEYS.SHADOW_MEDIUM,
      pkm: {
        name: PKM_NAME_KEYS.HERACROSS,
        assetKey: POKEMON_FRONT_ASSET_KEYS.HERACROSS,
        assetFrame: 0,
        currentLevel: 5,
        maxHp: 100,
        currentHp: 100,
        baseAttack: 5,
        moveIds: [1]
      },
      skipBattleAnimations: SKIP_BATTLE_ANIMATIONS
    })

    // 我方精灵
    this._activePlayerPkm = new PlayerBattlePKM({
      scene: this,
      container: battleSceneContainer,
      baseAssetKey: BATTLE_BACKGROUND_ASSET_KEYS.FOREST_BASE,
      shadowAssetKey: POKEMON_SHADOW_ASSET_KEYS.SHADOW_MEDIUM,
      pkm: {
        name: PKM_NAME_KEYS.CHANDELURE,
        assetKey: POKEMON_BACK_ASSET_KEYS.CHANDELURE,
        assetFrame: 0,
        currentLevel: 5,
        maxHp: 100,
        currentHp: 100,
        baseAttack: 45,
        moveIds: [2]
      },
      skipBattleAnimations: SKIP_BATTLE_ANIMATIONS
    })

    const midTopContainer = this.add.container(0, 0)
    const midBottomContainer = this.add.container(0, 0)
    midTopContainer.width = midBottomContainer.width =
      battleSceneContainer.width
    midTopContainer.height =
      (this.scale.height - battleSceneContainer.height) / 8
    midBottomContainer.height =
      ((this.scale.height - battleSceneContainer.height) / 8) * 7

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

    // 设置场景居中
    midContainer.setX((this.scale.width - midContainer.width) / 2)

    this._createBattleStateMachine()

    this._cursorKeys = this.input.keyboard!.createCursorKeys()
  }

  update() {
    this._battleStateMachine.update()
    const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(
      this._cursorKeys.space
    )

    if (
      wasSpaceKeyPressed &&
      (this._battleStateMachine.currentStateName ===
        BATTLE_STATES.PRE_BATTLE_INFO ||
        this._battleStateMachine.currentStateName ===
          BATTLE_STATES.POST_ATTACK_CHECK ||
        this._battleStateMachine.currentStateName ===
          BATTLE_STATES.FLEE_ATTEMPT)
    ) {
      this._battleMenu.handlePlayerInput('OK')
      return
    }

    if (
      this._battleStateMachine.currentStateName !==
      BATTLE_STATES.PLAYER_INPUT
    ) {
      return
    }

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
      this._battleStateMachine.setState(BATTLE_STATES.FOE_INPUT)
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

  _playerAttack() {
    if (this._activePlayerPkm.isFainted) {
      this._postBattleSequenceCheck()
      return
    }

    this._battleMenu.updateInfoPaneMessageNoInputRequired(
      `${this._activePlayerPkm.name} used ${
        this._activePlayerPkm.moves[this._activePlayerMoveIndex].name
      }`,
      () => {
        this.time.delayedCall(500, () => {
          this._activeFoePkm.playTakeDamageAnimation(() => {
            this._activeFoePkm.takeDamage(
              this._activePlayerPkm.baseAttack,
              () => {
                this._foeAttack()
              }
            )
          })
        })
      },
      SKIP_TEXT_ANIMATIONS
    )
  }

  _foeAttack() {
    if (this._activeFoePkm.isFainted) {
      this._battleStateMachine.setState(
        BATTLE_STATES.POST_ATTACK_CHECK
      )
      return
    }

    this._battleMenu.updateInfoPaneMessageNoInputRequired(
      `foe ${this._activeFoePkm.name} used ${this._activeFoePkm.moves[0].name}`,
      () => {
        this.time.delayedCall(500, () => {
          this._activePlayerPkm.playTakeDamageAnimation(() => {
            this._activePlayerPkm.takeDamage(
              this._activeFoePkm.baseAttack,
              () => {
                this._battleStateMachine.setState(
                  BATTLE_STATES.POST_ATTACK_CHECK
                )
              }
            )
          })
        })
      },
      SKIP_TEXT_ANIMATIONS
    )
  }

  _postBattleSequenceCheck() {
    if (this._activeFoePkm.isFainted) {
      this._activeFoePkm.playFaintedAnimation(() => {
        this._battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [
            `Wild ${this._activeFoePkm.name} fainted`,
            `You have gained some experience`
          ],
          () => {
            this._battleStateMachine.setState(BATTLE_STATES.FINISHED)
          },
          SKIP_TEXT_ANIMATIONS
        )
      })
      return
    }

    if (this._activePlayerPkm.isFainted) {
      this._activePlayerPkm.playFaintedAnimation(() => {
        this._battleMenu.updateInfoPaneMessagesAndWaitForInput(
          [
            `${this._activePlayerPkm.name} fainted`,
            `You have no more pokemons, escaping to safty...`
          ],
          () => {
            this._battleStateMachine.setState(BATTLE_STATES.FINISHED)
          },
          SKIP_TEXT_ANIMATIONS
        )
      })
      return
    }

    this._battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT)
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

  _createBattleStateMachine() {
    this._battleStateMachine = new StateMachine('battle', this)

    this._battleStateMachine.addState({
      name: BATTLE_STATES.INTRO,
      onEnter: () => {
        // 等待场景设置和动画
        this.time.delayedCall(500, () => {
          this._battleStateMachine.setState(
            BATTLE_STATES.PRE_BATTLE_INFO
          )
        })
      }
    })

    this._battleStateMachine.addState({
      name: BATTLE_STATES.PRE_BATTLE_INFO,
      onEnter: () => {
        // 等待敌方精灵出现并通知玩家
        this._activeFoePkm.playPkmAppearAnimation(() => {
          this._activeFoePkm.playDataBoxAnimation(() => undefined)
          this._battleMenu.updateInfoPaneMessagesAndWaitForInput(
            [`A wild ${this._activeFoePkm.name} appeared!`],
            () => {
              this.time.delayedCall(500, () => {
                this._battleStateMachine.setState(
                  BATTLE_STATES.BRING_OUT_PKM
                )
              })
            },
            SKIP_TEXT_ANIMATIONS
          )
        })
      }
    })

    this._battleStateMachine.addState({
      name: BATTLE_STATES.BRING_OUT_PKM,
      onEnter: () => {
        // 等待己方精灵出现
        this._activePlayerPkm.playPkmAppearAnimation(() => {
          this._activePlayerPkm.playDataBoxAnimation(() => undefined)
          this._battleMenu.updateInfoPaneMessageNoInputRequired(
            `go ${this._activePlayerPkm.name}!`,
            () => {
              this.time.delayedCall(1200, () => {
                this._battleStateMachine.setState(
                  BATTLE_STATES.PLAYER_INPUT
                )
              })
            },
            SKIP_TEXT_ANIMATIONS
          )
        })
      }
    })

    this._battleStateMachine.addState({
      name: BATTLE_STATES.PLAYER_INPUT,
      onEnter: () => {
        this._battleMenu.showMainBattleMenu()
      }
    })

    this._battleStateMachine.addState({
      name: BATTLE_STATES.FOE_INPUT,
      onEnter: () => {
        // TODO: 敌方 AI
        // 敌方选择随机技能
        this._battleStateMachine.setState(BATTLE_STATES.BATTLE)
      }
    })

    this._battleStateMachine.addState({
      name: BATTLE_STATES.BATTLE,
      onEnter: () => {
        this._playerAttack()
      }
    })

    this._battleStateMachine.addState({
      name: BATTLE_STATES.POST_ATTACK_CHECK,
      onEnter: () => {
        this._postBattleSequenceCheck()
      }
    })

    this._battleStateMachine.addState({
      name: BATTLE_STATES.FINISHED,
      onEnter: () => {
        this._transitionToNextScene()
      }
    })

    this._battleStateMachine.addState({
      name: BATTLE_STATES.FLEE_ATTEMPT,
      onEnter: () => {
        this._battleMenu.updateInfoPaneMessagesAndWaitForInput(
          ['You got away safely!'],
          () => {
            this._battleStateMachine.setState(BATTLE_STATES.FINISHED)
          },
          SKIP_TEXT_ANIMATIONS
        )
      }
    })

    this._battleStateMachine.setState('INTRO')
  }
}
