// ===== Utility state =====
const GameState = {
  chosenClass: 'Vanguard',
  playerName: 'Axeion'
};

// ===== Main Menu =====
class MainMenuScene extends Phaser.Scene {
  constructor(){ super('MainMenu'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    // tiny white particle texture
    const g=this.make.graphics({x:0,y:0,add:false}); g.fillStyle(0xffffff,1); g.fillRect(0,0,2,2); g.generateTexture('_white',2,2);
    const stars=this.add.particles(0,0,'_white',{x:{min:0,max:w},y:{min:0,max:h},speedX:{min:-10,max:10},speedY:{min:-5,max:5},lifespan:6000,scale:{min:0.2,max:0.8},quantity:2,blendMode:'ADD'}); stars.setDepth(-1);
    this.add.text(w/2,h/2-40,'GALACTIC MYST',{fontFamily:'monospace',fontSize:'24px',color:'#b6b0ff'}).setOrigin(0.5).setShadow(1,1,'#432b8f');
    this.press=this.add.text(w/2,h/2+20,'Press Enter / Start',{fontFamily:'monospace',fontSize:'12px',color:'#cde'}).setOrigin(0.5);
    this.input.keyboard.on('keydown-ENTER',()=>this.scene.start('CharacterSelect'));
  }
  update(_t,dt){ this._t=(this._t||0)+dt; const a=0.5+Math.sin(this._t/400)*0.5; this.press.setAlpha(a);
    if (this.input.gamepad.total){ const pad=this.input.gamepad.getPad(0); if (pad&&(pad.buttons[9]?.pressed||pad.buttons[0]?.pressed)) this.scene.start('CharacterSelect'); }
  }
}

// ===== Character Select =====
class CharacterSelectScene extends Phaser.Scene {
  constructor(){ super('CharacterSelect'); this.idx=0; }
  create(){
    const w=this.scale.width, h=this.scale.height;
    this.add.text(w/2,20,'Choose Your Path',{fontFamily:'monospace',fontSize:'16px',color:'#cfe'}).setOrigin(0.5);
    this.classText=this.add.text(w/2,h/2-20,'',{fontFamily:'monospace',fontSize:'14px',color:'#bff'}).setOrigin(0.5);
    this.descText=this.add.text(w/2,h/2+4,'',{fontFamily:'monospace',fontSize:'10px',color:'#cde',wordWrap:{width:w-20}}).setOrigin(0.5);
    this.nameText=this.add.text(w/2,h-40,'Name: '+GameState.playerName,{fontFamily:'monospace',fontSize:'12px',color:'#fff'}).setOrigin(0.5);
    this.input.keyboard.on('keydown-LEFT',()=>this.move(-1));
    this.input.keyboard.on('keydown-RIGHT',()=>this.move(1));
    this.input.keyboard.on('keydown-ENTER',()=>this.confirm());
    this.input.keyboard.on('keydown-BACKSPACE',()=>{ if(GameState.playerName.length){ GameState.playerName=GameState.playerName.slice(0,-1); this.refresh(); }});
    this.input.keyboard.on('keydown',(e)=>{ if(e.key?.length===1 && GameState.playerName.length<12){ GameState.playerName+=e.key; this.refresh(); }});
    this.refresh();
  }
  classes(){ return [
    {key:'Vanguard',desc:'Tanky melee fighter with teleport dash & shield.'},
    {key:'Voidcaller',desc:'Void magic caster. Spikes, pulses, blink.'},
    {key:'Gunner-Priest',desc:'Ranged support with sanctified firearms.'},
    {key:'Starbreaker',desc:'Bruiser channeling stellar energy.'},
  ]; }
  move(d){ const list=this.classes(); this.idx=(this.idx+d+list.length)%list.length; this.refresh(); }
  confirm(){ GameState.chosenClass=this.classes()[this.idx].key; this.scene.start('Cutscene'); }
  refresh(){ const c=this.classes()[this.idx]; this.classText.setText(c.key); this.descText.setText(c.desc); this.nameText.setText('Name: '+GameState.playerName); }
}

// ===== Cutscene =====
class CutsceneScene extends Phaser.Scene {
  constructor(){ super('Cutscene'); this.timer=0; }
  create(){
    const w=this.scale.width,h=this.scale.height;
    this.add.rectangle(0,0,w,h,0x0e0e2a).setOrigin(0);
    this.add.text(w/2,30,`${GameState.chosenClass} — Prologue`,{fontFamily:'monospace',fontSize:'14px',color:'#cfe'}).setOrigin(0.5);
    this.add.text(w/2,h/2,`"They exiled the mystics... not me."`,{fontFamily:'monospace',fontSize:'12px',color:'#cff',wordWrap:{width:w-20}}).setOrigin(0.5);
  }
  update(_t,dt){ this.timer+=dt; if(this.timer>=3000) this.scene.start('Arena'); }
}

// ===== HUD =====
class HUD {
  constructor(scene,hp,mana,cd1,cd2,cls,name){
    const w=scene.scale.width;
    scene.add.rectangle(6,6,w-12,24,0x000000,0.35).setOrigin(0);
    scene.add.text(10,8,'HP',{fontFamily:'monospace',fontSize:'10px',color:'#fbb'});
    this.hpBar=scene.add.rectangle(30,12,(w-100)*(hp/100),6,0xff6b6b).setOrigin(0,0);
    scene.add.text(10,18,'MP',{fontFamily:'monospace',fontSize:'10px',color:'#bbf'});
    this.manaBar=scene.add.rectangle(30,22,(w-100)*(mana/50),4,0x6ed0ff).setOrigin(0,0);
    this.cd1Text=scene.add.text(w-120,8,'S1: 0',{fontFamily:'monospace',fontSize:'10px',color:'#cfe'});
    this.cd2Text=scene.add.text(w-60,8,'S2: 0',{fontFamily:'monospace',fontSize:'10px',color:'#cfe'});
    this.nameText=scene.add.text(w/2,6,`${name} — ${cls}`,{fontFamily:'monospace',fontSize:'10px',color:'#fff'}).setOrigin(0.5,0);
    this.w=640;
  }
  set(hp,mana,cd1,cd2){
    this.hpBar.width=(this.w-100)*(hp/100);
    this.manaBar.width=(this.w-100)*(mana/50);
    this.cd1Text.setText('S1: '+Math.ceil(cd1/1000));
    this.cd2Text.setText('S2: '+Math.ceil(cd2/1000));
  }
}

// ===== Arena =====
class ArenaScene extends Phaser.Scene {
  constructor(){ super('Arena'); this.speed=120; this.hp=100; this.mana=50; this.cd1=0; this.cd2=0; }
  create(){
    const w=this.scale.width,h=this.scale.height;
    this.add.rectangle(0,0,w,h,0x11162a).setOrigin(0);
    for(let i=0;i<60;i++){ const x=Math.random()*w,y=Math.random()*h; this.add.rectangle(x,y,1,1,0x223355).setAlpha(0.6); }
    // player sprite
    const g=this.make.graphics({x:0,y:0,add:false}); g.fillStyle(0x6ee7ff,1); g.fillRect(0,0,6,8); g.generateTexture('_p',6,8);
    this.player=this.physics.add.sprite(w/2,h/2,'_p');
    // enemy sprite
    const g2=this.make.graphics({x:0,y:0,add:false}); g2.fillStyle(0xff4d6d,1); g2.fillRect(0,0,8,8); g2.generateTexture('_e',8,8);
    this.enemy=this.physics.add.sprite(w/2+80,h/2,'_e');
    this.physics.add.collider(this.player,this.enemy);
    // input
    this.cursors=this.input.keyboard.createCursorKeys();
    this.keys=this.input.keyboard.addKeys({W:'W',A:'A',S:'S',D:'D',J:'J',K:'K',L:'L',SPACE:'SPACE'});
    this.input.gamepad.once('connected',pad=>{ this.pad=pad; });
    // HUD
    this.hud=new HUD(this,this.hp,this.mana,this.cd1,this.cd2,GameState.chosenClass,GameState.playerName);
  }
  update(_t,dt){
    const move=new Phaser.Math.Vector2(0,0);
    if(this.keys.A.isDown||this.cursors.left?.isDown) move.x-=1;
    if(this.keys.D.isDown||this.cursors.right?.isDown) move.x+=1;
    if(this.keys.W.isDown||this.cursors.up?.isDown) move.y-=1;
    if(this.keys.S.isDown||this.cursors.down?.isDown) move.y+=1;
    if(this.pad){ move.x+=this.pad.axes.length?this.pad.axes[0].getValue():0; move.y+=this.pad.axes.length>1?this.pad.axes[1].getValue():0; }
    if(move.length()>1) move.normalize();
    this.player.setVelocity(move.x*this.speed, move.y*this.speed);

    // enemy chase
    const dir=new Phaser.Math.Vector2(this.player.x-this.enemy.x,this.player.y-this.enemy.y);
    if(dir.length()>1) dir.normalize();
    this.enemy.setVelocity(dir.x*60, dir.y*60);

    // basic attack (J or A)
    const basic=this.keys.J.isDown || (this.pad?.buttons[0]?.pressed??false);
    if(basic) this.basicHit();

    // skills + cooldowns
    if(this.cd1>0) this.cd1-=dt; if(this.cd2>0) this.cd2-=dt;
    const s1=this.keys.K.isDown || (this.pad?.buttons[2]?.pressed??false);
    const s2=this.keys.L.isDown || (this.pad?.buttons[3]?.pressed??false);
    if(s1 && this.cd1<=0) this.skill(1);
    if(s2 && this.cd2<=0) this.skill(2);

    this.hud.set(this.hp,this.mana,Math.max(0,this.cd1),Math.max(0,this.cd2));
  }
  basicHit(){
    const hit=new Phaser.Geom.Circle(this.player.x,this.player.y,14);
    if(Phaser.Geom.Intersects.CircleToRectangle(hit,this.enemy.getBounds())) this.hitFX();
  }
  skill(n){
    if(n===1){
      const dash=new Phaser.Math.Vector2(this.player.body.velocity.x,this.player.body.velocity.y);
      if(dash.length()<0.1) dash.x=1; dash.normalize().scale(80);
      this.player.x+=dash.x; this.player.y+=dash.y;
      this.cd1=1800; this.mana=Math.max(0,this.mana-5);
    } else {
      const ring=this.add.circle(this.player.x,this.player.y,24,0x66ccff,0.2);
      this.tweens.add({targets:ring,alpha:0,duration:200,onComplete:()=>ring.destroy()});
      const area=new Phaser.Geom.Circle(this.player.x,this.player.y,24);
      if(Phaser.Geom.Intersects.CircleToRectangle(area,this.enemy.getBounds())) this.hitFX();
      this.cd2=3000; this.mana=Math.max(0,this.mana-10);
    }
  }
  hitFX(){
    this.cameras.main.shake(50,0.002);
    const flash=this.add.rectangle(this.enemy.x,this.enemy.y,10,10,0xffffff,0.35);
    this.time.delayedCall(60,()=>flash.destroy());
  }
}

// ===== Boot the game =====
const WIDTH=1280, HEIGHT=720, SCALE=2;
const config={
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH/SCALE,
  height: HEIGHT/SCALE,
  zoom: SCALE,
  backgroundColor: '#0a0b1a',
  physics: { default:'arcade', arcade:{ gravity:{y:0}, debug:false } },
  scene: [MainMenuScene, CharacterSelectScene, CutsceneScene, ArenaScene],
  render: { pixelArt:true, antialias:false }
};
new Phaser.Game(config);
