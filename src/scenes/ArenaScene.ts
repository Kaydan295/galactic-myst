import Phaser from 'phaser'
import { GameState } from '../main'
import HUD from '../ui/HUD'

type ClassKey = 'Vanguard'|'Voidcaller'|'Gunner-Priest'|'Starbreaker'

export default class ArenaScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private keys!: any
  private pad?: Phaser.Input.Gamepad.Gamepad
  private speed = 120

  private enemy!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private hp = 100
  private mana = 50
  private cd1 = 0
  private cd2 = 0

  private hud!: HUD

  constructor() { super('Arena') }

  create() {
    const w = this.scale.width
    const h = this.scale.height

    // Floor
    this.add.rectangle(0,0,w,h,0x11162a).setOrigin(0)
    for (let i=0;i<60;i++) {
      const x = Math.random()*w; const y = Math.random()*h
      this.add.rectangle(x,y,1,1,0x223355).setAlpha(0.6)
    }

    // Player
    const g = this.make.graphics({x:0,y:0,add:false})
    g.fillStyle(0x6ee7ff, 1); g.fillRect(0,0,6,8)
    g.generateTexture('_p', 6, 8)
    this.player = this.physics.add.sprite(w/2, h/2, '_p')

    // Enemy
    const g2 = this.make.graphics({x:0,y:0,add:false})
    g2.fillStyle(0xff4d6d, 1); g2.fillRect(0,0,8,8)
    g2.generateTexture('_e', 8, 8)
    this.enemy = this.physics.add.sprite(w/2 + 80, h/2, '_e')

    this.physics.add.collider(this.player, this.enemy)

    // Controls
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.keys = this.input.keyboard!.addKeys({
      W: 'W', A: 'A', S: 'S', D: 'D', J: 'J', K: 'K', L: 'L', SPACE: 'SPACE'
    })
    this.input.gamepad.once('connected', pad => { this.pad = pad })

    // HUD
    this.hud = new HUD(this, this.hp, this.mana, this.cd1, this.cd2, GameState.chosenClass as ClassKey, GameState.playerName)
  }

  update(_time: number, dt: number) {
    // Movement
    const move = new Phaser.Math.Vector2(0,0)
    if (this.keys.A.isDown || this.cursors.left?.isDown) move.x -= 1
    if (this.keys.D.isDown || this.cursors.right?.isDown) move.x += 1
    if (this.keys.W.isDown || this.cursors.up?.isDown) move.y -= 1
    if (this.keys.S.isDown || this.cursors.down?.isDown) move.y += 1

    if (this.pad) {
      move.x += this.pad.axes.length ? this.pad.axes[0].getValue() : 0
      move.y += this.pad.axes.length > 1 ? this.pad.axes[1].getValue() : 0
    }

    if (move.length() > 1) move.normalize()
    this.player.setVelocity(move.x * this.speed, move.y * this.speed)

    // Enemy chases player
    const dir = new Phaser.Math.Vector2(this.player.x - this.enemy.x, this.player.y - this.enemy.y)
    if (dir.length() > 1) dir.normalize()
    this.enemy.setVelocity(dir.x * 60, dir.y * 60)

    // Basic attack (J or A)
    const basicPressed = this.keys.J.isDown || (this.pad?.buttons[0]?.pressed ?? false)
    if (basicPressed) this.basicAttack()

    // Skills with cooldowns
    if (this.cd1 > 0) this.cd1 -= dt
    if (this.cd2 > 0) this.cd2 -= dt
    const can1 = this.cd1 <= 0
    const can2 = this.cd2 <= 0

    const skill1Pressed = this.keys.K.isDown || (this.pad?.buttons[2]?.pressed ?? false)
    const skill2Pressed = this.keys.L.isDown || (this.pad?.buttons[3]?.pressed ?? false)
    if (skill1Pressed && can1) this.castSkill(1)
    if (skill2Pressed && can2) this.castSkill(2)

    this.hud.set(this.hp, this.mana, Math.max(0, this.cd1), Math.max(0, this.cd2))
  }

  private basicAttack() {
    const hit = new Phaser.Geom.Circle(this.player.x, this.player.y, 14)
    if (Phaser.Geom.Intersects.CircleToRectangle(hit, this.enemy.getBounds())) {
      this.tinyHit(6)
    }
  }

  private castSkill(n: 1|2) {
    if (n === 1) {
      // short dash
      const dash = new Phaser.Math.Vector2(this.player.body.velocity.x, this.player.body.velocity.y)
      if (dash.length() < 0.1) dash.x = 1
      dash.normalize().scale(80)
      this.player.x += dash.x
      this.player.y += dash.y
      this.cd1 = 1800
      this.mana = Math.max(0, this.mana - 5)
    } else {
      // AoE pulse
      const ring = this.add.circle(this.player.x, this.player.y, 24, 0x66ccff, 0.2)
      this.tweens.add({ targets: ring, alpha: 0, duration: 200, onComplete: () => ring.destroy() })
      if (Phaser.Geom.Intersects.CircleToRectangle(new Phaser.Geom.Circle(this.player.x, this.player.y, 24), this.enemy.getBounds())) {
        this.tinyHit(15)
      }
      this.cd2 = 3000
      this.mana = Math.max(0, this.mana - 10)
    }
  }

  private tinyHit(_dmg: number) {
    this.cameras.main.shake(50, 0.002)
    const flash = this.add.rectangle(this.enemy.x, this.enemy.y, 10, 10, 0xffffff, 0.35)
    this.time.delayedCall(60, () => flash.destroy())
  }
}
