import Phaser from 'phaser'
import MainMenuScene from './scenes/MainMenuScene'
import CharacterSelectScene from './scenes/CharacterSelectScene'
import CutsceneScene from './scenes/CutsceneScene'
import ArenaScene from './scenes/ArenaScene'

const WIDTH = 1280
const HEIGHT = 720
const PIXEL_SCALE = 2

export const GameState = {
  chosenClass: 'Vanguard' as 'Vanguard'|'Voidcaller'|'Gunner-Priest'|'Starbreaker',
  playerName: 'Axeion'
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH/PIXEL_SCALE,
  height: HEIGHT/PIXEL_SCALE,
  zoom: PIXEL_SCALE,
  backgroundColor: '#0a0b1a',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [MainMenuScene, CharacterSelectScene, CutsceneScene, ArenaScene],
  render: { pixelArt: true, antialias: false }
}

new Phaser.Game(config)
