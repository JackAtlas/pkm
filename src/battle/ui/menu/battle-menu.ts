import { PKM_NAME_KEYS } from '../../../assets/asset-keys'

const BATTLE_MENU_OPTIONS = Object.freeze({
  FIGHT: 'Fight',
  BAG: 'Bag',
  POKEMON: 'Pokémon',
  RUN: 'Run'
})

const battleMenuTextStyle = {
  color: '#484848',
  fontSize: '36px',
  fontFamily: 'Power Red'
}

const infoPaneBorderWidth = 4

export class BattleMenu {
  #scene: Phaser.Scene
  #container: Phaser.GameObjects.Container
  #mainBattleMenuPhaserContainerGameObject: Phaser.GameObjects.Container
  #moveSelectionSubBattleMenuPhaserGameObject: Phaser.GameObjects.Container
  #battleTextGameObjectLine1: Phaser.GameObjects.Text
  #battleTextGameObjectLine2: Phaser.GameObjects.Text

  constructor(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container
  ) {
    this.#scene = scene
    this.#container = container

    this.#createBackground()
    this.#createMainBattleMenu()
    this.#createPkmAttackSubMenu()

    container.add(this.#mainBattleMenuPhaserContainerGameObject)
    container.add(this.#moveSelectionSubBattleMenuPhaserGameObject)
  }

  showMainBattleMenu() {
    this.#battleTextGameObjectLine1.setText(`What should`)
    this.#mainBattleMenuPhaserContainerGameObject.setVisible(true)
    this.#battleTextGameObjectLine1.setVisible(true)
    this.#battleTextGameObjectLine2.setVisible(true)
  }

  hideMainBattleMenu() {
    this.#mainBattleMenuPhaserContainerGameObject.setVisible(false)
    this.#battleTextGameObjectLine1.setVisible(false)
    this.#battleTextGameObjectLine2.setVisible(false)
  }

  showPkmAttackSubMenu() {
    this.#moveSelectionSubBattleMenuPhaserGameObject.setAlpha(1)
  }

  hidePkmAttackSubMenu() {
    this.#moveSelectionSubBattleMenuPhaserGameObject.setAlpha(0)
  }

  #createBackground() {
    this.#container.add(
      this.#scene.add
        .rectangle(
          0,
          0,
          this.#container.width,
          this.#container.height,
          0x182023
        )
        .setOrigin(0)
    )
  }

  #createMainBattleMenu() {
    this.#battleTextGameObjectLine1 = this.#scene.add.text(
      this.#container.width / 2 + 20,
      20,
      'What should',
      { ...battleMenuTextStyle, color: '#a9b4b8' }
    )
    // TODO: update to use pkm data that is passed into this class instance
    this.#battleTextGameObjectLine2 = this.#scene.add.text(
      this.#container.width / 2 + 20,
      76,
      `${PKM_NAME_KEYS.CHANDELURE} do next?`,
      { ...battleMenuTextStyle, color: '#a9b4b8' }
    )
    this.#container.add(this.#battleTextGameObjectLine1)
    this.#container.add(this.#battleTextGameObjectLine2)
    this.#mainBattleMenuPhaserContainerGameObject =
      this.#scene.add.container(0, 0)
    this.#mainBattleMenuPhaserContainerGameObject.width =
      this.#container.width / 2
    this.#mainBattleMenuPhaserContainerGameObject.height =
      this.#container.height
    const mainInfoPane = this.#createInfoPane(
      this.#mainBattleMenuPhaserContainerGameObject,
      {
        borderColor: 0xe4434a,
        borderWidth: infoPaneBorderWidth
      }
    )
    this.#mainBattleMenuPhaserContainerGameObject.add(mainInfoPane)
    this.#mainBattleMenuPhaserContainerGameObject.add(
      this.#scene.add.text(
        50,
        mainInfoPane.height / 8 - 18 + infoPaneBorderWidth,
        BATTLE_MENU_OPTIONS.FIGHT,
        battleMenuTextStyle
      )
    )
    this.#mainBattleMenuPhaserContainerGameObject.add(
      this.#scene.add.text(
        50,
        (mainInfoPane.height / 8) * 3 - 18 + infoPaneBorderWidth,
        BATTLE_MENU_OPTIONS.BAG,
        battleMenuTextStyle
      )
    )
    this.#mainBattleMenuPhaserContainerGameObject.add(
      this.#scene.add.text(
        50,
        (mainInfoPane.height / 8) * 5 - 18 + infoPaneBorderWidth,
        BATTLE_MENU_OPTIONS.POKEMON,
        battleMenuTextStyle
      )
    )
    this.#mainBattleMenuPhaserContainerGameObject.add(
      this.#scene.add.text(
        50,
        (mainInfoPane.height / 8) * 7 - 18 + infoPaneBorderWidth,
        BATTLE_MENU_OPTIONS.RUN,
        battleMenuTextStyle
      )
    )

    this.hideMainBattleMenu()
  }

  #createPkmAttackSubMenu() {
    this.#moveSelectionSubBattleMenuPhaserGameObject =
      this.#scene.add.container(this.#container.width / 2, 0)
    this.#moveSelectionSubBattleMenuPhaserGameObject.width =
      this.#container.width / 2
    this.#moveSelectionSubBattleMenuPhaserGameObject.height =
      this.#container.height
    const mainInfoSubPane = this.#createInfoPane(
      this.#moveSelectionSubBattleMenuPhaserGameObject,
      {
        borderColor: 0x905ac2,
        borderWidth: infoPaneBorderWidth
      }
    )
    this.#moveSelectionSubBattleMenuPhaserGameObject.add(
      mainInfoSubPane
    )
    this.#moveSelectionSubBattleMenuPhaserGameObject.add(
      this.#scene.add.text(
        50,
        mainInfoSubPane.height / 8 - 18 + infoPaneBorderWidth,
        'slash',
        battleMenuTextStyle
      )
    )
    this.#moveSelectionSubBattleMenuPhaserGameObject.add(
      this.#scene.add.text(
        50,
        (mainInfoSubPane.height / 8) * 3 - 18 + infoPaneBorderWidth,
        'growl',
        battleMenuTextStyle
      )
    )
    this.#moveSelectionSubBattleMenuPhaserGameObject.add(
      this.#scene.add.text(
        50,
        (mainInfoSubPane.height / 8) * 5 - 18 + infoPaneBorderWidth,
        '-',
        battleMenuTextStyle
      )
    )
    this.#moveSelectionSubBattleMenuPhaserGameObject.add(
      this.#scene.add.text(
        50,
        (mainInfoSubPane.height / 8) * 7 - 18 + infoPaneBorderWidth,
        '-',
        battleMenuTextStyle
      )
    )

    this.hidePkmAttackSubMenu()
  }

  #createInfoPane(
    container: Phaser.GameObjects.Container,
    options: {
      borderColor: number
      borderWidth: number
    }
  ) {
    const { borderColor, borderWidth } = options
    return this.#scene.add
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
}
