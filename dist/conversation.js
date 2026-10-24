import {current,distance} from './rules.js';
import {registryEntries} from './diegetic-world.js';
const $=id=>document.getElementById(id);
export class SceneInteraction{
 constructor(game,world){this.game=game;this.world=world;this.actorId=null;this.line='';this.actions=[];this.readUntil=0;}
 get active(){return !!(this.actorId||this.world.device);}
 close(){const c=current(this.game.s);if(this.actorId&&c&&this.game.s.subtitle.startsWith(c.cn+'：'))this.game.s.subtitleUntil=0;this.actorId=null;this.world.device=null;this.world.focusMix=0;this.actions=[];$('conversation').hidden=true;document.body.classList.remove('talking','device-focus');}
 speak(text){this.line=text;this.readUntil=this.game.s.time+Math.max(5,text.length*.15);this.game.dialogue?.(text,{actorId:this.actorId,scope:'conversation'});}
 open(id){const s=this.game.s,c=current(s);this.close();s.gunDrawn=false;s.scannerActive=false;
  if(id==='actor'&&c&&s.actor.mode==='wait'){this.actorId=c.id;this.speak(c.cn+'：'+c.want);this.refresh();return true;}
  if(['terminal','monitor','pump'].includes(id)){this.world.device=id;this.world.deviceSelection=0;this.world.deviceResult='';document.body.classList.add('device-focus');return true;}return false;
 }
 refresh(){const s=this.game.s,c=current(s);if(!c||c.id!==this.actorId){this.close();return;}
  const actions=[{text:'听来意',run:()=>{this.game.query('talk');this.speak(c.cn+'：'+c.talk);}},
   {text:'出示证件',run:()=>{this.game.query('id');this.speak(`证件 · ${c.name}  /  ${c.badge}\n${c.birth}  /  ${c.height}  /  ${c.address}\n${c.job}  /  车辆 ${c.plate}`);}}];
  if(c.rear){actions.push({text:'不授予后仓权限',run:()=>{this.game.decide('deny');this.close();}},{text:'允许进入帮忙',run:()=>{this.game.decide('allow');this.close();}});}
  else if(c.pump){actions.push({text:'去核对订单',run:()=>this.close()},{text:'拒绝处理',run:()=>{this.game.decide('deny');this.close();}});}
  else actions.push({text:'结账 $'+c.sale.toFixed(2),run:()=>{if(this.game.decide('sale'))this.close();}},{text:'拒绝交易',run:()=>{this.game.decide('deny');this.close();}});
  this.actions=actions;const root=$('talk-options');root.replaceChildren();actions.forEach((action,i)=>{const b=document.createElement('button');b.innerHTML=`<kbd>${i+1}</kbd> `;b.append(document.createTextNode(action.text));b.onclick=()=>this.choose(i);root.append(b);});$('talk-name').textContent=c.cn+' / '+c.name;$('talk-line').textContent=this.game.dialogueCaption?.()||this.line;$('conversation').hidden=false;document.body.classList.add('talking');
 }
 choose(i){if(this.game.s.paused||this.game.s.finished)return;const a=this.actions[i];if(a){a.run();if(this.actorId)this.refresh();}}
 key(code){
  if(!this.active)return false;if(code==='KeyQ'||code==='Escape'){this.close();return true;}
  if(this.actorId){const n=Number(code.replace('Digit',''));if(code.startsWith('Digit')&&n>=1&&n<=4){this.choose(n-1);return true;}if(code==='KeyE')return true;return false;}
  const w=this.world,s=this.game.s;
  if(w.device==='terminal'){
   const entries=registryEntries(s);if(['ArrowUp','KeyW','ArrowDown','KeyS'].includes(code)){w.deviceResult='';w.deviceSelection=(w.deviceSelection+(['ArrowUp','KeyW'].includes(code)?-1:1)+Math.max(1,entries.length))%Math.max(1,entries.length);return true;}
   if(code==='KeyE'){if(w.deviceResult)w.deviceResult='';else{const c=entries[w.deviceSelection];if(c&&this.game.lookup(c.id))w.deviceResult=c.registry;}return true;}
  }
  if(w.device==='monitor'&&/^Digit[1234]$/.test(code)){w.cameraIndex=Number(code.at(-1))-1;w.feedPending=w.cameraIndex;w.feedTime=-99;return true;}
  if(w.device==='pump'&&code==='KeyE'){if(this.game.helpPump())this.close();return true;}
  // Device focus stays in the world; Q and Escape release it immediately.
  return ['KeyW','KeyA','KeyS','KeyD','KeyE','KeyX','KeyG','KeyR'].includes(code);
 }
 tick(){const s=this.game.s,c=current(s);if(this.actorId){if(!c||c.id!==this.actorId||s.actor.mode!=='wait'||distance(s.player,s.actor)>4.2||s.finished||s.hidden){this.close();return;}
   // Reading is not a race against the customer's patience. Bodies keep moving.
   if(s.time<this.readUntil)s.actor.wait=Math.min(s.actor.wait,220);
   $('talk-line').textContent=this.game.dialogueCaption?.()||this.line;
  }
  if(this.world.device&&(!s.power||s.finished||s.hidden))this.close();
 }
}
