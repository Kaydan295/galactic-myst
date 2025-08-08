import Phaser from 'phaser'

export default class MainMenuScene extends Phaser.Scene {
  private t = 0
  private pressKey!: Phaser.GameObjects.Text

  constructor() { super('MainMenu') }

  preload() {}

  create() {
    const w = this.scale.width
    const h = this.scale.height

    // Make a tiny white texture for particles
    const g = this.make.graphics({x:0,y:0,add:false})
    g.fillStyle(0xffffff, 1); g.fillRect(0,0,2,2)
    g.generateTexture('_white', 2, 2)

    // Simple "cosmic" background
    const stars = this.add.particles(0,0,'_white', {
      x: { min: 0, max: w },
      y: { min: 0, max: h },
      speedX: { min: -10, max: 10 },
      speedY: { min: -5, max: 5 },
      lifespan: 6000,
      scale: { min: 0.2, max: 0.8 },
      quantity: 2,
      blendMode: 'ADD'
    })
    stars.setDepth(-1)

    this.add.text(w/2, h/2 - 40, 'GALACTIC MYST', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#b6b0ff'
    }).setOrigin(0.5).setShadow(1,1,'#432b8f')

    this.pressKey = this.add.text(w/2, h/2 + 20, 'Press Enter / Start', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#cde'
    }).setOrigin(0.5)

    this.input.keyboard!.on('keydown-ENTER', () => this.start())
  }

  update(_time: number, dt: number) {
    this.t += dt
    const alpha = 0.5 + Math.sin(this.t/400) * 0.5
    this.pressKey.setAlpha(alpha)

    // Controller "Start" or "A"
    if (this.input.gamepad.total) {
      const pad = this.input.gamepad.getPad(0)
      if (pad && (pad.buttons[9]?.pressed || pad.buttons[0]?.pressed)) {
        this.start()
      }
    }
  }

  private start() {
    this.scene.start('CharacterSelect')
  }
}
