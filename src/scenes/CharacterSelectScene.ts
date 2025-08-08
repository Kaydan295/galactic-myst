import Phaser from 'phaser'
import { GameState } from '../main'

type ClassKey = 'Vanguard'|'Voidcaller'|'Gunner-Priest'|'Starbreaker'

const CLASSES: {key: ClassKey, desc: string}[] = [
  { key: 'Vanguard', desc: 'Tanky melee fighter with teleport dash & shield.' },
  { key: 'Voidcaller', desc: 'Void magic caster. Spikes, pulses, blink.' },
  { key: 'Gunner-Priest', desc: 'Ranged support with sanctified firearms.' },
  { key: 'Starbreaker', desc: 'Bruiser channeling stellar energy.' },
]

export default class CharacterSelectScene extends Phaser.Scene {
  private idx = 0
  private nameText!: Phaser.GameObjects.Text
  private descText!: Phaser.GameObjects.Text
  private classText!: Phaser.GameObjects.Text

  constructor() { super('CharacterSelect') }

  create() {
    const w = this.scale.width
    const h = this.scale.height

    this.add.text(w/2, 20, 'Choose Your Path', { fontFamily: 'monospace', fontSize: '16px', color: '#cfe' }).setOrigin(0.5)

    this.classText = this.add.text(w/2, h/2 - 20, '', { fontFamily: 'monospace', fontSize: '14px', color: '#bff' }).setOrigin(0.5)
    this.descText = this.add.text(w/2, h/2 + 4, '', { fontFamily: 'monospace', fontSize: '10px', color: '#cde', wordWrap: { width: w - 20 } }).setOrigin(0.5)

    this.nameText = this.add.text(w/2, h - 40, 'Name: ' + GameState.playerName, { fontFamily: 'monospace', fontSize: '12px', color: '#fff' }).setOrigin(0.5)

    this.input.keyboard!.on('keydown-LEFT', () => this.move(-1))
    this.input.keyboard!.on('keydown-RIGHT', () => this.move(1))
    this.input.keyboard!.on('keydown-ENTER', () => this.confirm())
    this.input.keyboard!.on('keydown-BACKSPACE', () => this.backspace())
    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      if (e.key.length === 1 && this.getVisibleLength(GameState.playerName) < 12) {
        GameState.playerName += e.key
        this.refresh()
      }
    })

    this.refresh()
  }

  private getVisibleLength(s: string) { return s.length }

  private move(delta: number) {
    this.idx = (this.idx + delta + CLASSES.length) % CLASSES.length
    this.refresh()
  }

  private confirm() {
    GameState.chosenClass = CLASSES[this.idx].key
    this.scene.start('Cutscene')
  }

  private backspace() {
    if (GameState.playerName.length > 0) {
      GameState.playerName = GameState.playerName.slice(0, -1)
      this.refresh()
    }
  }

  private refresh() {
    const c = CLASSES[this.idx]
    this.classText.setText(c.key)
    this.descText.setText(c.desc)
    this.nameText.setText('Name: ' + GameState.playerName)
  }
}
