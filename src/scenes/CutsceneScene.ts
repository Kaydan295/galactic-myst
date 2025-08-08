import Phaser from 'phaser'
import { GameState } from '../main'

export default class CutsceneScene extends Phaser.Scene {
  private timer = 0
  private duration = 3000 // short for first-playable
  private line!: Phaser.GameObjects.Text

  constructor() { super('Cutscene') }

  create() {
    const w = this.scale.width
    const h = this.scale.height

    this.add.rectangle(0,0,w,h,0x0e0e2a).setOrigin(0)
    this.add.text(w/2, 30, GameState.chosenClass + ' — Prologue', { fontFamily: 'monospace', fontSize: '14px', color: '#cfe' }).setOrigin(0.5)

    this.line = this.add.text(w/2, h/2, `"They exiled the mystics... not me."`, {
      fontFamily: 'monospace', fontSize: '12px', color: '#cff', wordWrap: { width: w-20 }
    }).setOrigin(0.5)

    // No skip: ignore inputs
  }

  update(_time: number, dt: number) {
    this.timer += dt
    if (this.timer >= this.duration) {
      this.scene.start('Arena')
    }
  }
}
