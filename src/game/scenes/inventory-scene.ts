import { INVENTORY_ASSET_KEYS } from '@/asset-keys'
import { BaseScene } from './base-scene'
import { SCENE_KEYS } from './scene-keys'
import { DEBUG } from '@/config'
import { dataManager } from '@/utils/data-manager'
import { InventoryItem } from '@/types/typedef'

const itemTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
  color: '#000000'
}

interface GameObjects {
  gameObjects: {
    container?: Phaser.GameObjects.Container
    itemText?: Phaser.GameObjects.Text
    qtyText?: Phaser.GameObjects.Text
  }
}

type InventoryItemWithGameObjects = InventoryItem & GameObjects

export class InventoryScene extends BaseScene {
  protected _inventory: InventoryItemWithGameObjects[]
  protected _selectedItemIndex: number = 0

  protected _bagUIContainer: Phaser.GameObjects.Container
  protected _bottomUIContainer: Phaser.GameObjects.Container

  protected _cursor: Phaser.GameObjects.Image
  protected _descriptionTextObject: Phaser.GameObjects.Text

  constructor() {
    super({
      key: SCENE_KEYS.INVENTORY_SCENE
    })
  }

  preload() {
    super.preload()

    if (
      !this.textures.exists(INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND)
    ) {
      this.load.image(
        INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND,
        `assets/Graphics/UI/Bag/bg_1.png`
      )
    }

    if (!this.textures.exists(INVENTORY_ASSET_KEYS.INVENTORY_BAG)) {
      this.load.image(
        INVENTORY_ASSET_KEYS.INVENTORY_BAG,
        `assets/Graphics/UI/Bag/bag_1.png`
      )
    }

    if (
      !this.textures.exists(INVENTORY_ASSET_KEYS.INVENTORY_CURSOR)
    ) {
      this.load.image(
        INVENTORY_ASSET_KEYS.INVENTORY_CURSOR,
        `assets/Graphics/UI/Bag/cursor.png`
      )
    }
  }

  init() {
    super.init()

    const inventory = dataManager.getInventory(this)
    // this._inventory = [
    //   {
    //     name: '伤药',
    //     description: '回复 20 HP',
    //     quantity: 10,
    //     maxQuantity: 999
    //   },
    //   {
    //     name: '好伤药',
    //     description: '回复 50 HP',
    //     quantity: 5,
    //     maxQuantity: 999
    //   }
    // ]
    this._inventory = inventory.map((inventoryItem) => {
      return {
        item: inventoryItem.item,
        quantity: inventoryItem.quantity,
        gameObjects: {}
      }
    })
  }

  create() {
    super.create()

    const bg = this.add
      .image(0, 0, INVENTORY_ASSET_KEYS.INVENTORY_BACKGROUND)
      .setOrigin(0)
    const bag = this.add
      .image(30, 30, INVENTORY_ASSET_KEYS.INVENTORY_BAG)
      .setOrigin(0)

    const listContainer = this.add.container(184, 0)

    this._inventory.forEach((inventoryItem) => {
      const itemBg = this.add
        .rectangle(0, 0, 282, 40, 0x22ffff, 0)
        .setOrigin(0)
      const itemText = this.add
        .text(10, 20, inventoryItem.item.name, itemTextStyle)
        .setOrigin(0, 0.5)
      const qtyText = this.add
        .text(
          itemBg.width - 10,
          20,
          `${inventoryItem.quantity}`,
          itemTextStyle
        )
        .setOrigin(1, 0.5)
      const inventoryContainer = this.add.container(0, 14, [
        itemBg,
        itemText,
        qtyText
      ])
      listContainer.add(inventoryContainer)
      inventoryItem.gameObjects = {
        container: inventoryContainer,
        itemText,
        qtyText
      }
    })

    this._cursor = this.add
      .image(0, 0, INVENTORY_ASSET_KEYS.INVENTORY_CURSOR)
      .setOrigin(0)
    listContainer.add(this._cursor)

    this._updateListLayout()

    this._descriptionTextObject = this.add.text(100, 300, '')

    this._updateDescriptionText()

    const container = this.add.container(0, 0, [
      bg,
      bag,
      listContainer,
      this._descriptionTextObject
    ])
    container.setSize(bg.width, bg.height)
    container.setPosition(
      this.scale.width / 2 - container.width / 2,
      this.scale.height / 2 - container.height / 2
    )
    this._bagUIContainer = container

    this._createBottomUI()

    this._setCameras()
  }

  _createBottomUI() {
    const UIBg = this.add
      .rectangle(
        0,
        0,
        this.scale.width - 80 * 2,
        100,
        0x0077b6,
        DEBUG ? 1 : 0
      )
      .setOrigin(0)
    this._bottomUIContainer = this.add.container(
      80,
      this.scale.height - 100,
      [UIBg]
    )
  }

  _updateListLayout() {
    this._inventory.forEach((inventoryItem, index) => {
      inventoryItem.gameObjects.container?.setY(14 + index * 40)
    })
    this._cursor.setY(this._selectedItemIndex * 40)
  }

  _updateDescriptionText() {
    console.log(
      JSON.stringify(
        this._inventory[this._selectedItemIndex],
        null,
        2
      )
    )

    this._descriptionTextObject.setText(
      this._inventory[this._selectedItemIndex]?.item.description
    )
  }

  _setCameras() {
    const cam = this.cameras.main
    cam.ignore(this._bottomUIContainer)
    cam.setZoom(2)
    cam.centerOn(this.scale.width / 2, this.scale.height / 2)

    const uiCam = this.cameras.add(
      0,
      0,
      this.scale.width,
      this.scale.height
    )
    uiCam.ignore(this._bagUIContainer)
  }
}
