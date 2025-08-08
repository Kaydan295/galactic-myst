import Phaser from 'phaser'

export default class HUD {
  private hpBar!: Phaser.GameObjects.Rectangle
  private manaBar!: Phaser.GameObjects.Rectangle
  private cd1Text!: Phaser.GameObjects.Text
  private cd2Text!: Phaser.GameObjects.Text
  private nameText!: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, hp: number, mana: number, cd1: number, cd2: number, cls: string, name: string) {
    const w = scene.scale.width
    scene.add.rectangle(6, 6, w-12, 24, 0x000000, 0.35).setOrigin(0)

    scene.add.text(10, 8, 'HP', { fontFamily: 'monospace', fontSize: '10px', color: '#fbb' })
    this.hpBar = scene.add.rectangle(30, 12, (w-100)* (hp/100), 6, 0xff6b6b).setOrigin(0,0)

    scene.add.text(10, 18, 'MP', { fontFamily: 'monospace', fontSize: '10px', color: '#bbf' })
    this.manaBar = scene.add.rectangle(30, 22, (w-100)* (mana/50), 4, 0x6ed0ff).setOrigin(0,0)

    this.cd1Text = scene.add.text(w-120, 8, 'S1: 0', { fontFamily: 'monospace', fontSize: '10px', color: '#cfe' })
    this.cd2Text = scene.add.text(w-60, 8, 'S2: 0', { fontFamily: 'monospace', fontSize: '10px', color: '#cfe' })

    this.nameText = scene.add.text(w/2, 6, `${name} — ${cls}`, { fontFamily: 'monospace', fontSize: '10px', color: '#fff' }).setOrigin(0.5,0)
  }

  set(hp: number, mana: number, cd1: number, cd2: number) {
    const w = 640
    this.hpBar.width = (w-100) * (hp/100)
    this.manaBar.width = (w-100) * (mana/50)
    this.cd1Text.setText('S1: ' + Math.ceil(cd1/1000))
    this.cd2Text.setText('S2: ' + Math.ceil(cd2/1000))
  }
}
