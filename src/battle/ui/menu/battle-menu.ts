import { Direction, DIRECTION } from '@/common/direction'
import { exhaustiveGuard } from '@/utils/guard'
import { BATTLE_UI_TEXT_STYLE } from './battle-menu-config'
import {
  ACTIVE_BATTLE_MENU,
  ATTACK_MOVE_OPTIONS,
  BATTLE_MENU_OPTIONS
} from './battle-menu-options'
import { PlayerBattlePKM } from '@/battle/pkm/player-battle-pkm'
import { GENERAL_ASSET_KEYS } from '@/assets/asset-keys'
import { animateText } from '@/utils/text-utils'
import { SKIP_TEXT_ANIMATIONS } from '@/config'

const infoPaneBorderWidth = 4

export class BattleMenu {
  _scene: Phaser.Scene
  _activeBattleMenu: ACTIVE_BATTLE_MENU
  _container: Phaser.GameObjects.Container
  _messagePanePhaserContainerObject: Phaser.GameObjects.Container
  _mainBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container
  _moveSelectionSubBattleMenuPhaserGameObject: Phaser.GameObjects.Container
  _battleTextGameObjectLine: Phaser.GameObjects.Text
  _mainBattleMenuCursorPhaserGameObject: Phaser.GameObjects.Arc
  _moveSelectMenuCursorPhaserGameObject: Phaser.GameObjects.Arc
  _selectedBattleMenuOption: BATTLE_MENU_OPTIONS
  _selectedMoveMenuOption: ATTACK_MOVE_OPTIONS
  _queuedInfoPaneMessages: string[]
  _queuedInfoPaneCallback: (() => void) | undefined
  _queuedMessagesSkipAnimation: boolean
  _queuedMessageAnimationPlaying: boolean
  _waitingForPlayerInput: boolean
  _selectedMoveIndex: number | undefined

  /** 玩家精灵 */
  _activePlayerPkm: PlayerBattlePKM

  /** 消息栏的箭头 */
  _userInputCursorPhaserSpriteGameObject: Phaser.GameObjects.Sprite

  /**
   *
   * @param {Phaser.Scene} scene Battle Menu 所在的 Scene 对象
   * @param {Phaser.GameObjects.Container} container Battle Menu 所在的 Container 对象
   * @param {BattlePKM} activePlayerPkm 玩家精灵
   */
  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
    activePlayerPkm: PlayerBattlePKM
  ) {
    this._scene = scene
    this._activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN
    this._container = container
    this._activePlayerPkm = activePlayerPkm
    this._selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
    this._selectedMoveMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1

    this._queuedInfoPaneMessages = []
    this._queuedInfoPaneCallback = () => undefined
    this._queuedMessagesSkipAnimation = false
    this._queuedMessageAnimationPlaying = false
    this._waitingForPlayerInput = false
    this._selectedMoveIndex = undefined

    this._createBackground()
    this._createMessagePane()
    this._createMainBattleMenu()
    this._createPkmMoveSubMenu()

    container.add(this._mainBattleMenuPhaserContainerGameObject)
    container.add(this._moveSelectionSubBattleMenuPhaserGameObject)
  }

  get selectedMove(): number | undefined {
    if (
      this._activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT
    ) {
      return this._selectedMoveIndex
    }
    return undefined
  }

  showMainBattleMenu() {
    this._activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN
    this._battleTextGameObjectLine.setText(
      `What should ${this._activePlayerPkm.name} do next?`
    )
    this._mainBattleMenuPhaserContainerGameObject.setVisible(true)
    this._selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
    this._mainBattleMenuCursorPhaserGameObject.setY(
      this._mainBattleMenuPhaserContainerGameObject.height / 8 -
        2 +
        infoPaneBorderWidth
    )
    this._selectedMoveIndex = undefined
  }

  hideMainBattleMenu() {
    this._mainBattleMenuPhaserContainerGameObject.setVisible(false)
  }

  showPkmMoveSubMenu() {
    this._activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT
    this._moveSelectionSubBattleMenuPhaserGameObject.setVisible(true)
  }

  hidePkmMoveSubMenu() {
    this._activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN
    this._moveSelectionSubBattleMenuPhaserGameObject.setVisible(false)
  }

  playInputCursorAnimation() {
    this._userInputCursorPhaserSpriteGameObject.setPosition(
      this._battleTextGameObjectLine.displayWidth +
        this._userInputCursorPhaserSpriteGameObject.displayWidth +
        20,
      this._userInputCursorPhaserSpriteGameObject.y
    )
    this._userInputCursorPhaserSpriteGameObject.setVisible(true)
  }

  hideInputCursor() {
    this._userInputCursorPhaserSpriteGameObject.setVisible(false)
  }

  _switchToMainBattleMenu() {
    this._waitingForPlayerInput = false
    this.hideInputCursor()
    this.hidePkmMoveSubMenu()
    this.showMainBattleMenu()
  }

  handlePlayerInput(input: Direction | 'OK' | 'CANCEL') {
    if (this._queuedMessageAnimationPlaying) return

    if (
      this._waitingForPlayerInput &&
      (input === 'OK' || input === 'CANCEL')
    ) {
      this._updateInfoPaneWithMessage()
      return
    }

    if (input === 'OK') {
      if (this._activeBattleMenu === ACTIVE_BATTLE_MENU.BATTLE_MAIN) {
        this._handlePlayerChooseMainBattleOption()
        return
      }
      if (
        this._activeBattleMenu ===
        ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT
      ) {
        this._handlePlayerChooseAttack()
        return
      }
      this.hideMainBattleMenu()
      this.showPkmMoveSubMenu()
      return
    } else if (input === 'CANCEL') {
      this.hidePkmMoveSubMenu()
      this.showMainBattleMenu()
      return
    }

    this._updateSelectedBattleMenuOptionFromInput(input)
    this._moveMainBattleMenuCursor()
    this._updateSelectedMoveMenuOptionFromInput(input)
    this._moveMoveSelectMenuCursor()
  }

  updateInfoPaneMessageNoInputRequired(
    message: string,
    callback?: () => void,
    skipAnimation = false
  ) {
    this._battleTextGameObjectLine.setText('').setVisible(true)

    if (skipAnimation) {
      this._battleTextGameObjectLine.setText(message)
      this._waitingForPlayerInput = false
      if (callback) callback()
      return
    } else {
      animateText(
        this._scene,
        this._battleTextGameObjectLine,
        message,
        {
          callback: () => {
            this._waitingForPlayerInput = false
            if (callback) callback()
          },
          delay: 50
        }
      )
    }
  }

  updateInfoPaneMessagesAndWaitForInput(
    messages: string[],
    callback?: () => void,
    skipAnimation = false
  ) {
    this._queuedInfoPaneMessages = messages
    this._queuedInfoPaneCallback = callback
    this._queuedMessagesSkipAnimation = skipAnimation
    this._updateInfoPaneWithMessage()
  }

  _updateInfoPaneWithMessage() {
    this._waitingForPlayerInput = false
    this._battleTextGameObjectLine.setText('').setVisible(true)
    this.hideInputCursor()

    // check if all messages have been displayed from the queue and call the callback
    if (this._queuedInfoPaneMessages.length === 0) {
      if (this._queuedInfoPaneCallback) {
        this._queuedInfoPaneCallback()
        this._queuedInfoPaneCallback = undefined
      }
      return
    } else {
      // get first message from queue and animate message
      const messageToDisplay = this._queuedInfoPaneMessages.shift()
      if (messageToDisplay) {
        if (this._queuedMessagesSkipAnimation) {
          this._battleTextGameObjectLine.setText(messageToDisplay)
          this._queuedMessageAnimationPlaying = false
          this._waitingForPlayerInput = true
          this.playInputCursorAnimation()
          return
        }

        this._queuedMessageAnimationPlaying = true
        animateText(
          this._scene,
          this._battleTextGameObjectLine,
          messageToDisplay,
          {
            callback: () => {
              this.playInputCursorAnimation()
              this._waitingForPlayerInput = true
              this._queuedMessageAnimationPlaying = false
            },
            delay: 50
          }
        )
      }
    }
  }

  _createBackground() {
    this._container.add(
      this._scene.add
        .rectangle(
          0,
          0,
          this._container.width,
          this._container.height,
          0x182023
        )
        .setOrigin(0)
    )
  }

  _createMessagePane() {
    this._messagePanePhaserContainerObject =
      this._scene.add.container(0, 0)
    this._messagePanePhaserContainerObject.width =
      this._container.width
    this._messagePanePhaserContainerObject.height =
      this._container.height / 7
    // TODO: update to use pkm data that is passed into this class instance
    this._battleTextGameObjectLine = this._scene.add.text(
      20,
      20,
      '',
      { ...BATTLE_UI_TEXT_STYLE, color: '#a9b4b8' }
    )
    this._messagePanePhaserContainerObject.add(
      this._battleTextGameObjectLine
    )
    this._userInputCursorPhaserSpriteGameObject =
      this._scene.add.sprite(
        0,
        this._messagePanePhaserContainerObject.height / 2,
        GENERAL_ASSET_KEYS.PAUSE_ARROW
      )
    this._userInputCursorPhaserSpriteGameObject.setVisible(false)
    this._messagePanePhaserContainerObject.add(
      this._userInputCursorPhaserSpriteGameObject
    )
    this._scene.anims.create({
      key: 'pause-arrow',
      frames: this._scene.anims.generateFrameNumbers(
        GENERAL_ASSET_KEYS.PAUSE_ARROW,
        {
          start: 0,
          end: 3
        }
      ),
      frameRate: 6,
      repeat: -1
    })
    this._userInputCursorPhaserSpriteGameObject.play('pause-arrow')
    this._container.add(this._messagePanePhaserContainerObject)
  }

  _createMainBattleMenu() {
    this._mainBattleMenuPhaserContainerGameObject =
      this._scene.add.container(
        0,
        this._messagePanePhaserContainerObject.height
      )
    this._mainBattleMenuPhaserContainerGameObject.width =
      this._container.width / 2
    this._mainBattleMenuPhaserContainerGameObject.height =
      this._container.height -
      this._messagePanePhaserContainerObject.height
    const mainInfoPane = this._createInfoPane(
      this._mainBattleMenuPhaserContainerGameObject,
      {
        borderColor: 0xe4434a,
        borderWidth: infoPaneBorderWidth
      }
    )
    this._mainBattleMenuPhaserContainerGameObject.add(mainInfoPane)
    this._mainBattleMenuPhaserContainerGameObject.add(
      this._scene.add.text(
        50,
        mainInfoPane.height / 8 - 18 + infoPaneBorderWidth,
        BATTLE_MENU_OPTIONS.FIGHT,
        BATTLE_UI_TEXT_STYLE
      )
    )
    this._mainBattleMenuPhaserContainerGameObject.add(
      this._scene.add.text(
        50,
        (mainInfoPane.height / 8) * 3 - 18 + infoPaneBorderWidth,
        BATTLE_MENU_OPTIONS.POKEMON,
        BATTLE_UI_TEXT_STYLE
      )
    )
    this._mainBattleMenuPhaserContainerGameObject.add(
      this._scene.add.text(
        50,
        (mainInfoPane.height / 8) * 5 - 18 + infoPaneBorderWidth,
        BATTLE_MENU_OPTIONS.BAG,
        BATTLE_UI_TEXT_STYLE
      )
    )
    this._mainBattleMenuPhaserContainerGameObject.add(
      this._scene.add.text(
        50,
        (mainInfoPane.height / 8) * 7 - 18 + infoPaneBorderWidth,
        BATTLE_MENU_OPTIONS.RUN,
        BATTLE_UI_TEXT_STYLE
      )
    )

    this._mainBattleMenuCursorPhaserGameObject = this._scene.add
      .circle(
        25,
        mainInfoPane.height / 8 - 2 + infoPaneBorderWidth,
        4,
        0x484848
      )
      .setOrigin(0)
    this._mainBattleMenuPhaserContainerGameObject.add(
      this._mainBattleMenuCursorPhaserGameObject
    )

    this.hideMainBattleMenu()
  }

  _createPkmMoveSubMenu() {
    this._moveSelectionSubBattleMenuPhaserGameObject =
      this._scene.add.container(
        this._container.width / 2,
        this._messagePanePhaserContainerObject.height
      )
    this._moveSelectionSubBattleMenuPhaserGameObject.width =
      this._container.width / 2
    this._moveSelectionSubBattleMenuPhaserGameObject.height =
      this._container.height -
      this._messagePanePhaserContainerObject.height
    const mainInfoSubPane = this._createInfoPane(
      this._moveSelectionSubBattleMenuPhaserGameObject,
      {
        borderColor: 0x905ac2,
        borderWidth: infoPaneBorderWidth
      }
    )
    this._moveSelectionSubBattleMenuPhaserGameObject.add(
      mainInfoSubPane
    )

    /** 招式名称 */
    const moveNames: string[] = []
    for (let i = 0; i < 4; i++) {
      moveNames.push(this._activePlayerPkm.moves[i]?.name || '-')
    }
    moveNames.forEach((move, idx) => {
      this._moveSelectionSubBattleMenuPhaserGameObject.add(
        this._scene.add.text(
          50,
          (mainInfoSubPane.height / 8) * (idx * 2 + 1) -
            18 +
            infoPaneBorderWidth,
          move,
          BATTLE_UI_TEXT_STYLE
        )
      )
    })

    // 光标
    this._moveSelectMenuCursorPhaserGameObject = this._scene.add
      .circle(
        25,
        mainInfoSubPane.height / 8 - 2 + infoPaneBorderWidth,
        4,
        0x484848
      )
      .setOrigin(0)
    this._moveSelectionSubBattleMenuPhaserGameObject.add(
      this._moveSelectMenuCursorPhaserGameObject
    )

    this.hidePkmMoveSubMenu()
  }

  _createInfoPane(
    container: Phaser.GameObjects.Container,
    options: {
      borderColor: number
      borderWidth: number
    }
  ) {
    const { borderColor, borderWidth } = options
    return this._scene.add
      .rectangle(
        borderWidth,
        borderWidth,
        container.width - borderWidth * 2,
        container.height - borderWidth * 2,
        0xede4f3,
        1
      )
      .setOrigin(0)
      .setStrokeStyle(8, borderColor, 1)
  }

  _updateSelectedBattleMenuOptionFromInput(direction: Direction) {
    if (this._activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN)
      return

    if (
      this._selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT
    ) {
      switch (direction) {
        case DIRECTION.UP:
          this._selectedBattleMenuOption = BATTLE_MENU_OPTIONS.RUN
          return
        case DIRECTION.DOWN:
          this._selectedBattleMenuOption = BATTLE_MENU_OPTIONS.POKEMON
          return
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }
    if (
      this._selectedBattleMenuOption === BATTLE_MENU_OPTIONS.POKEMON
    ) {
      switch (direction) {
        case DIRECTION.UP:
          this._selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
          return
        case DIRECTION.DOWN:
          this._selectedBattleMenuOption = BATTLE_MENU_OPTIONS.BAG
          return
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }
    if (this._selectedBattleMenuOption === BATTLE_MENU_OPTIONS.BAG) {
      switch (direction) {
        case DIRECTION.UP:
          this._selectedBattleMenuOption = BATTLE_MENU_OPTIONS.POKEMON
          return
        case DIRECTION.DOWN:
          this._selectedBattleMenuOption = BATTLE_MENU_OPTIONS.RUN
          return
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }
    if (this._selectedBattleMenuOption === BATTLE_MENU_OPTIONS.RUN) {
      switch (direction) {
        case DIRECTION.UP:
          this._selectedBattleMenuOption = BATTLE_MENU_OPTIONS.BAG
          return
        case DIRECTION.DOWN:
          this._selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
          return
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    exhaustiveGuard(this._selectedBattleMenuOption)
  }

  _moveMainBattleMenuCursor() {
    if (this._activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MAIN)
      return

    switch (this._selectedBattleMenuOption) {
      case BATTLE_MENU_OPTIONS.FIGHT:
        this._mainBattleMenuCursorPhaserGameObject.setY(
          this._mainBattleMenuPhaserContainerGameObject.height / 8 -
            2 +
            infoPaneBorderWidth
        )
        break
      case BATTLE_MENU_OPTIONS.POKEMON:
        this._mainBattleMenuCursorPhaserGameObject.setY(
          (this._mainBattleMenuPhaserContainerGameObject.height / 8) *
            3 -
            2 +
            infoPaneBorderWidth
        )
        break
      case BATTLE_MENU_OPTIONS.BAG:
        this._mainBattleMenuCursorPhaserGameObject.setY(
          (this._mainBattleMenuPhaserContainerGameObject.height / 8) *
            5 -
            2 +
            infoPaneBorderWidth
        )
        break
      case BATTLE_MENU_OPTIONS.RUN:
        this._mainBattleMenuCursorPhaserGameObject.setY(
          (this._mainBattleMenuPhaserContainerGameObject.height / 8) *
            7 -
            2 +
            infoPaneBorderWidth
        )
        break
      default:
        exhaustiveGuard(this._selectedBattleMenuOption)
        break
    }
  }

  _updateSelectedMoveMenuOptionFromInput(direction: Direction) {
    if (
      this._activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT
    )
      return

    if (this._selectedMoveMenuOption === ATTACK_MOVE_OPTIONS.MOVE_1) {
      switch (direction) {
        case DIRECTION.UP:
          this._selectedMoveMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4
          return
        case DIRECTION.DOWN:
          this._selectedMoveMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2
          return
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }
    if (this._selectedMoveMenuOption === ATTACK_MOVE_OPTIONS.MOVE_2) {
      switch (direction) {
        case DIRECTION.UP:
          this._selectedMoveMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1
          return
        case DIRECTION.DOWN:
          this._selectedMoveMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3
          return
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }
    if (this._selectedMoveMenuOption === ATTACK_MOVE_OPTIONS.MOVE_3) {
      switch (direction) {
        case DIRECTION.UP:
          this._selectedMoveMenuOption = ATTACK_MOVE_OPTIONS.MOVE_2
          return
        case DIRECTION.DOWN:
          this._selectedMoveMenuOption = ATTACK_MOVE_OPTIONS.MOVE_4
          return
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }
    if (this._selectedMoveMenuOption === ATTACK_MOVE_OPTIONS.MOVE_4) {
      switch (direction) {
        case DIRECTION.UP:
          this._selectedMoveMenuOption = ATTACK_MOVE_OPTIONS.MOVE_3
          return
        case DIRECTION.DOWN:
          this._selectedMoveMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1
          return
        case DIRECTION.LEFT:
        case DIRECTION.RIGHT:
        case DIRECTION.NONE:
          return
        default:
          exhaustiveGuard(direction)
      }
      return
    }

    exhaustiveGuard(this._selectedMoveMenuOption)
  }

  _moveMoveSelectMenuCursor() {
    if (
      this._activeBattleMenu !== ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT
    )
      return

    switch (this._selectedMoveMenuOption) {
      case ATTACK_MOVE_OPTIONS.MOVE_1:
        this._moveSelectMenuCursorPhaserGameObject.setY(
          this._moveSelectionSubBattleMenuPhaserGameObject.height /
            8 -
            2 +
            infoPaneBorderWidth
        )
        return
      case ATTACK_MOVE_OPTIONS.MOVE_2:
        this._moveSelectMenuCursorPhaserGameObject.setY(
          (this._moveSelectionSubBattleMenuPhaserGameObject.height /
            8) *
            3 -
            2 +
            infoPaneBorderWidth
        )
        return
      case ATTACK_MOVE_OPTIONS.MOVE_3:
        this._moveSelectMenuCursorPhaserGameObject.setY(
          (this._moveSelectionSubBattleMenuPhaserGameObject.height /
            8) *
            5 -
            2 +
            infoPaneBorderWidth
        )
        return
      case ATTACK_MOVE_OPTIONS.MOVE_4:
        this._moveSelectMenuCursorPhaserGameObject.setY(
          (this._moveSelectionSubBattleMenuPhaserGameObject.height /
            8) *
            7 -
            2 +
            infoPaneBorderWidth
        )
        return
      default:
        exhaustiveGuard(this._selectedMoveMenuOption)
    }
  }

  _handlePlayerChooseMainBattleOption() {
    this.hideMainBattleMenu()
    if (
      this._selectedBattleMenuOption === BATTLE_MENU_OPTIONS.FIGHT
    ) {
      this.showPkmMoveSubMenu()
      return
    } else if (
      this._selectedBattleMenuOption === BATTLE_MENU_OPTIONS.POKEMON
    ) {
      this._activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_POKEMON
      this.updateInfoPaneMessagesAndWaitForInput(
        ['没有后备宝可梦了'],
        () => this._switchToMainBattleMenu(),
        SKIP_TEXT_ANIMATIONS
      )
      return
    } else if (
      this._selectedBattleMenuOption === BATTLE_MENU_OPTIONS.BAG
    ) {
      this._activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_BAG
      this.updateInfoPaneMessagesAndWaitForInput(
        ['背包空', 'test', '123'],
        () => this._switchToMainBattleMenu(),
        SKIP_TEXT_ANIMATIONS
      )
      return
    } else if (
      this._selectedBattleMenuOption === BATTLE_MENU_OPTIONS.RUN
    ) {
      this._activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_RUN
      this.updateInfoPaneMessagesAndWaitForInput(
        ['不能逃跑'],
        () => this._switchToMainBattleMenu(),
        SKIP_TEXT_ANIMATIONS
      )
      return
    } else {
      exhaustiveGuard(this._selectedBattleMenuOption)
    }
  }

  _handlePlayerChooseAttack() {
    let selectedMoveIndex = 0
    switch (this._selectedMoveMenuOption) {
      case ATTACK_MOVE_OPTIONS.MOVE_1:
        selectedMoveIndex = 0
        break
      case ATTACK_MOVE_OPTIONS.MOVE_2:
        selectedMoveIndex = 1
        break
      case ATTACK_MOVE_OPTIONS.MOVE_3:
        selectedMoveIndex = 2
        break
      case ATTACK_MOVE_OPTIONS.MOVE_4:
        selectedMoveIndex = 3
        break
      default:
        exhaustiveGuard(this._selectedMoveMenuOption)
    }

    this._selectedMoveIndex = selectedMoveIndex
  }
}
