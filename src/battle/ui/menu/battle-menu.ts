import { PKM_NAME_KEYS } from '../../../assets/asset-keys'
import { DIRECTION } from '../../../common/direction'
import { exhaustiveGuard } from '../../../utils/guard'
import { BATTLE_UI_TEXT_STYLE } from './battle-menu-config'
import {
  ACTIVE_BATTLE_MENU,
  ATTACK_MOVE_OPTIONS,
  BATTLE_MENU_OPTIONS
} from './battle-menu-options'

const infoPaneBorderWidth = 4

export class BattleMenu {
  _scene: Phaser.Scene
  _activeBattleMenu: ACTIVE_BATTLE_MENU
  _container: Phaser.GameObjects.Container
  _mainBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container
  _moveSelectionSubBattleMenuPhaserGameObject: Phaser.GameObjects.Container
  _battleTextGameObjectLine1: Phaser.GameObjects.Text
  _battleTextGameObjectLine2: Phaser.GameObjects.Text
  _mainBattleMenuCursorPhaserGameObject: Phaser.GameObjects.Arc
  _moveSelectMenuCursorPhaserGameObject: Phaser.GameObjects.Arc
  _selectedBattleMenuOption: BATTLE_MENU_OPTIONS
  _selectedMoveMenuOption: ATTACK_MOVE_OPTIONS

  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container
  ) {
    this._scene = scene
    this._activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN
    this._container = container
    this._selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
    this._selectedMoveMenuOption = ATTACK_MOVE_OPTIONS.MOVE_1

    this._createBackground()
    this._createMainBattleMenu()
    this._createPkmAttackSubMenu()

    container.add(this._mainBattleMenuPhaserContainerGameObject)
    container.add(this._moveSelectionSubBattleMenuPhaserGameObject)
  }

  showMainBattleMenu() {
    this._activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MAIN
    this._battleTextGameObjectLine1.setText(`What should`)
    this._mainBattleMenuPhaserContainerGameObject.setVisible(true)
    this._battleTextGameObjectLine1.setVisible(true)
    this._battleTextGameObjectLine2.setVisible(true)
    this._selectedBattleMenuOption = BATTLE_MENU_OPTIONS.FIGHT
    this._mainBattleMenuCursorPhaserGameObject.setY(
      this._mainBattleMenuPhaserContainerGameObject.height / 8 -
        2 +
        infoPaneBorderWidth
    )
  }

  hideMainBattleMenu() {
    this._mainBattleMenuPhaserContainerGameObject.setVisible(false)
    this._battleTextGameObjectLine1.setVisible(false)
    this._battleTextGameObjectLine2.setVisible(false)
  }

  showPkmAttackSubMenu() {
    this._activeBattleMenu = ACTIVE_BATTLE_MENU.BATTLE_MOVE_SELECT
    this._moveSelectionSubBattleMenuPhaserGameObject.setVisible(true)
  }

  hidePkmAttackSubMenu() {
    this._moveSelectionSubBattleMenuPhaserGameObject.setVisible(false)
  }

  handlePlayerInput(input: DIRECTION | 'OK' | 'CANCEL') {
    if (input === 'OK') {
      this.hideMainBattleMenu()
      this.showPkmAttackSubMenu()
      return
    } else if (input === 'CANCEL') {
      this.hidePkmAttackSubMenu()
      this.showMainBattleMenu()
      return
    }

    this._updateSelectedBattleMenuOptionFromInput(input)
    this._moveMainBattleMenuCursor()
    this._updateSelectedMoveMenuOptionFromInput(input)
    this._moveMoveSelectMenuCursor()
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

  _createMainBattleMenu() {
    this._battleTextGameObjectLine1 = this._scene.add.text(
      this._container.width / 2 + 20,
      20,
      'What should',
      { ...BATTLE_UI_TEXT_STYLE, color: '_a9b4b8' }
    )
    // TODO: update to use pkm data that is passed into this class instance
    this._battleTextGameObjectLine2 = this._scene.add.text(
      this._container.width / 2 + 20,
      76,
      `${PKM_NAME_KEYS.CHANDELURE} do next?`,
      { ...BATTLE_UI_TEXT_STYLE, color: '_a9b4b8' }
    )
    this._container.add(this._battleTextGameObjectLine1)
    this._container.add(this._battleTextGameObjectLine2)

    this._mainBattleMenuPhaserContainerGameObject =
      this._scene.add.container(0, 0)
    this._mainBattleMenuPhaserContainerGameObject.width =
      this._container.width / 2
    this._mainBattleMenuPhaserContainerGameObject.height =
      this._container.height
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

  _createPkmAttackSubMenu() {
    this._moveSelectionSubBattleMenuPhaserGameObject =
      this._scene.add.container(this._container.width / 2, 0)
    this._moveSelectionSubBattleMenuPhaserGameObject.width =
      this._container.width / 2
    this._moveSelectionSubBattleMenuPhaserGameObject.height =
      this._container.height
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
    this._moveSelectionSubBattleMenuPhaserGameObject.add(
      this._scene.add.text(
        50,
        mainInfoSubPane.height / 8 - 18 + infoPaneBorderWidth,
        'slash',
        BATTLE_UI_TEXT_STYLE
      )
    )
    this._moveSelectionSubBattleMenuPhaserGameObject.add(
      this._scene.add.text(
        50,
        (mainInfoSubPane.height / 8) * 3 - 18 + infoPaneBorderWidth,
        'growl',
        BATTLE_UI_TEXT_STYLE
      )
    )
    this._moveSelectionSubBattleMenuPhaserGameObject.add(
      this._scene.add.text(
        50,
        (mainInfoSubPane.height / 8) * 5 - 18 + infoPaneBorderWidth,
        '-',
        BATTLE_UI_TEXT_STYLE
      )
    )
    this._moveSelectionSubBattleMenuPhaserGameObject.add(
      this._scene.add.text(
        50,
        (mainInfoSubPane.height / 8) * 7 - 18 + infoPaneBorderWidth,
        '-',
        BATTLE_UI_TEXT_STYLE
      )
    )

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

    this.hidePkmAttackSubMenu()
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

  _updateSelectedBattleMenuOptionFromInput(direction: DIRECTION) {
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

  _updateSelectedMoveMenuOptionFromInput(direction: DIRECTION) {
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
}
