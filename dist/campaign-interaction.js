import {heardAnswer} from './service-pacing.js';
import {receptionGreeting} from './conversation-flow.js';
import {storyAct} from './story-flow.js';
import {counterXZ} from './counter-layout.js';
import {SceneInteraction} from './conversation.js';
import {person,openConversationModes,DENOMINATIONS,PRODUCTS} from './night-data.js';
import {distance,current} from './rules.js';
const $=id=>document.getElementById(id);
export class CampaignInteraction extends SceneInteraction{
 close(){const wasCash=this.world.device==='register';const s=this.game.s;if(s.campaign){const a=s.actors.find(a=>a.id===this.actorId);if(a)a.pausedByTalk=false;if(this.world.device==='monitor')this.game.sound('cctvOff',{pos:{x:-10.2,z:2.3}});}super.close();this.topicPage=false;this.line='';document.body.classList.remove('cash-focus','dialogue-film');if(wasCash)window.dispatchEvent(new Event('cash-view-closed'));}
 open(id,key=null){const s=this.game.s;if(!s.campaign)return super.open(id);
  if(id==='actor'&&this.actorId&&(!key||key===this.actorId)){this.refresh();return true;}this.close();if(id==='monitor'){const handled=storyAct(this.game,'monitor');if(handled===true)return true;if(s.night===3&&s.narrative?.flags.busArrived)this.world.cameraIndex=3;}s.gunDrawn=false;s.scannerActive=false;s.binocularActive=false;
  if(id==='actor'){if(key)this.game.focus(key);const a=s.actor,c=person(s,a?.id);if(!c||!openConversationModes.includes(a.mode))return false;this.actorId=c.id;a.pausedByTalk=true;const greeting=receptionGreeting(s,a,c);if(greeting)this.speak(greeting);else this.line='选择要询问的事项；Q 结束交谈。';window.dispatchEvent(new Event('scene-focus-opened'));this.refresh();return true;}
  if(id==='radio'&&(s.storyVersion===14||s.incidentStep<2||s.dispatch))return this.game.act('radio');
  if(['terminal','monitor','pump','register','radio'].includes(id)){
   if(id==='pump'){const a=s.actors.find(a=>person(s,a.id)?.pump&&a.mode==='wait');if(a)this.game.focus(a.id);}
   window.dispatchEvent(new Event('scene-focus-opened'));if(id==='terminal')this.game.readIdentity();this.world.device=id;this.world.deviceResult='';this.world.documentSelection=0;this.world.documentPage=0;this.world.cashSelection=0;this.world.radioSelection=0;
   if(id==='monitor')this.game.sound('cctvOn',{pos:{x:-10.2,z:2.3}});
   if(id==='terminal')this.game.sound('keyboard',{pos:counterXZ({x:-5.65,z:-1.9})});
   if(id==='register'&&!s.drawerOpen){if(s.transaction?.stage==='change')this.game.openDrawer();else if(s.transaction?.stage==='receipt'){s.drawerOpen=true;this.game.sound('drawerOpen');}}
   document.body.classList.add('device-focus');if(id==='register'){s.moving=false;document.body.classList.add('cash-focus');document.exitPointerLock?.();s.paused=false;window.dispatchEvent(new Event('cash-view-opened'));if(s.transaction?.tender===s.transaction?.total){if(this.game.giveChange())this.close();}}return true;
  }return false;
 }
 refresh(){const s=this.game.s;if(!s.campaign)return super.refresh();const c=person(s,this.actorId),a=s.actors.find(a=>a.id===this.actorId);if(!c||!a||!openConversationModes.includes(a.mode)){this.close();return;}
  let actions=[];
  if(this.topicPage){actions=c.questions.map(([question,answer],i)=>({text:(s.questioned?.[c.id]?.includes(i)?'回看 · ':heardAnswer(s,c,i)?'昨晚已问 · ':'')+question,run:()=>{if(s.questioned?.[c.id]?.includes(i)||heardAnswer(s,c,i)){this.line=c.cn+'：'+answer;return;}this.game.focus(c.id);const reply=this.game.ask(i);if(reply)this.speak(c.cn+'：'+reply);}}));actions.push({text:'回到接待',run:()=>{this.topicPage=false;}});}
  else{actions=[{text:s.talked.includes(c.id)?'回看来意':'听来意',run:()=>{if(s.talked.includes(c.id)){this.line=c.cn+'：'+c.talk;return;}this.game.focus(c.id);this.game.query('talk');this.speak(c.cn+'：'+c.talk);}},
   {text:s.heldId===c.id?'交还证件':s.trayId===c.id?'取回证件':'请出示证件',run:()=>{this.game.focus(c.id);if(s.heldId===c.id){if(this.game.returnDocument())this.speak('你把证件交还给 '+c.cn+'。');}else if(s.trayId===c.id){this.game.notice('拿着证件对电脑读取，面对本人 Q 归还。');this.close();}else if(this.game.query('id'))this.speak('你接过 '+c.name+' 的证件。Q 结束交谈后，拿着证件对柜台电脑按 E 读取；读完面对本人 Q 归还。');}},
   {text:'追问线索',run:()=>{this.topicPage=true;}}];
   if(c.rear)actions.push({text:'拒绝后仓通行',run:()=>{this.game.focus(c.id);if(this.game.decide('deny'))this.close();}},{text:'允许进入帮忙',run:()=>{this.game.focus(c.id);if(this.game.decide('allow'))this.close();}});
   else actions.push({text:c.pump?'去处理三号泵':a.mode==='browse'?'让他继续挑选':'去操作实体收银机',run:()=>this.close()},{text:'拒绝服务，请对方离开',run:()=>{this.game.focus(c.id);if(this.game.decide('deny'))this.close();}});
  }
  this.actions=actions;const root=$('talk-options');root.replaceChildren();actions.forEach((action,i)=>{const b=document.createElement('button');const k=document.createElement('kbd');k.textContent=String(i+1);b.append(k,document.createTextNode(' '+action.text));b.onclick=()=>this.choose(i);root.append(b);});$('talk-name').textContent=c.cn+' / '+c.name;$('talk-line').textContent=this.game.dialogueCaption?.()||this.line;$('conversation').hidden=false;document.body.classList.add('talking');
 }
 key(code){const s=this.game.s;if(!s.campaign)return super.key(code);if(!this.active)return false;if(code==='KeyQ'||code==='Escape'){this.close();return true;}
  if(this.actorId){if(/^Digit[1-5]$/.test(code)){this.choose(Number(code.at(-1))-1);return true;}return code==='KeyE';}
  const w=this.world;if(w.device==='terminal'){if(code==='KeyE')this.game.readIdentity();return true;}
  if(w.device==='register'){if(code==='Backspace')this.game.resetMoney();return true;}
  if(w.device==='radio'){
   if(['KeyW','KeyS','ArrowUp','ArrowDown'].includes(code)){w.radioSelection=1-(w.radioSelection||0);return true;}if(code==='KeyE'){if(this.game.chooseEnding(w.radioSelection?'escape':'evidence'))this.close();return true;}
  }
  if(w.device==='monitor'&&/^Digit[1234]$/.test(code)){w.cameraIndex=Number(code.at(-1))-1;w.feedPending=w.cameraIndex;w.feedTime=-99;if(s.night>=2&&w.cameraIndex===2&&!s.eventFlags.cctvRear){s.eventFlags.cctvRear=true;s.shadow={x:1.2,z:21.2,until:s.time+3.5};this.game.sound('rearScratch',{pos:{x:1.2,z:21.2}});}this.game.sound('cctvSwitch',{pos:{x:-10.2,z:2.3}});return true;}
  if(w.device==='pump'&&code==='KeyE'){if(this.game.helpPump())this.close();return true;}
  return true;
 }
 clickMoney(x,y){if(this.world.device!=='register'||this.game.s.paused)return false;const tag=this.world.cashAt(x,y);if(tag){if(tag.id==='cashReset'){this.game.resetMoney();return true;}this.game.deliverMoney(Number(tag.key));if(!this.game.s.transaction||this.game.s.transaction.stage==='complete')this.close();return true;}return false;}
 tick(){const s=this.game.s;if(!s.campaign)return super.tick();if(this.actorId){const a=s.actors.find(a=>a.id===this.actorId);if(!a||!openConversationModes.includes(a.mode)||distance(s.player,a)>4.2||s.finished||s.hidden){this.close();return;}a.pausedByTalk=true;$('talk-line').textContent=this.game.dialogueCaption?.()||this.line;}
  if(this.world.device==='register'&&(!s.transaction||!['change'].includes(s.transaction.stage)))this.close();
  if(this.world.device&&(!s.power||s.finished||s.hidden||s.phase==='settlement'))this.close();
 }
}
