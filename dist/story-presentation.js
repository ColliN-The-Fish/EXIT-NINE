import {rescueBusPose} from './collision-system.js';
import {modelAttached} from './model-visibility.js';
import {updateEpilogueRoom} from './epilogue-room.js';
import {isHandover,handoverPlan} from './handover-director.js';
import {updateHandoverProps} from './handover-props.js';
import * as T from './vendor/three.module.js';
import {makePerson,animatePerson,makeCreature,animateCreature} from './characters.js';
import {makeArrivalBus} from './opening-props.js';
import {STORY_SCRIPTS,STORY_POINTS} from './story-data.js';
import {isNewStory} from './story-flow.js';
const ease=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);};
const look=(w,from,to,fov=57)=>{w.camera.position.set(...from);w.camera.lookAt(new T.Vector3(...to));w.camera.fov=fov;w.camera.updateProjectionMatrix();w.hands.visible=false;w.flash.position.copy(w.camera.position);w.flash.target.position.copy(new T.Vector3(...to));};
export function updateStoryPresentation(w,s,dt){
 if(!isNewStory(s))return;
 const n=s.narrative,q=n.sequence,l=q&&STORY_SCRIPTS[q.key]?.[Math.max(0,q.index)];
 updateHandoverProps(w,s,q);
 document.body.classList.toggle('story-film',!!q);document.body.classList.toggle('story-black',l?.shot==='black'&&!['transition2','transition3'].includes(q?.key));
 const label=document.getElementById('story-film-label');if(label)label.textContent=q?(['review1','review2'].includes(q.key)?'CCTV · 收尾录像回放':'第 '+s.night+' 晚 · '+(q.key==='encounter'?'谁还在上班':'最后三班')):'';
 for(const prop of Object.values(w.storyProps||{}))prop.visible=false;
 if(n.flags.busArrived||q?.key==='arrival')for(const t of s.threats)if(t.hp>0&&t.mode==='dead'&&w.monsters[t.id])w.monsters[t.id].g.visible=false;
 for(const g of w.floorEvents?.values()||[])if(g.children.some(o=>o.userData.target?.id==='coin'))g.visible=!s.businessClosed;
 if(n.worker){const m=w.people['story-worker'];if(m){m.item.visible=false;if(q?.key==='encounter'){const p=n.savedPlayer||s.player,targetYaw=Math.atan2(p.x-n.worker.x,p.z-n.worker.z),delta=Math.atan2(Math.sin(targetYaw-Math.PI/2),Math.cos(targetYaw-Math.PI/2));m.g.rotation.y=Math.PI/2+delta*Math.min(1,q.total/1.8);const beat=Math.sin(q.elapsed*1.2),humanReply=['hands','close'].includes(l?.shot),echo=q.index===5;
 m.head.rotation.y=(echo?0:Math.sin(q.total*.35)*.025);m.head.rotation.x=echo?-.045:.015*beat;m.upper.rotation.z=echo?.012:Math.sin(q.total*.48)*.008;
 if(l?.shot==='hands'){const settle=ease(q.elapsed/1.2);m.arms.forEach((a,i)=>{a.arm.rotation.x=-.12*settle;a.elbow.rotation.x=-.32-(i?.14:.25)*settle;a.hand.rotation.x=-.06+Math.sin(q.elapsed*.8+i)*.035;for(const {joint,tip}of a.fingers){joint.rotation.x=-.15-settle*.15;tip.rotation.x=-.26-settle*.08;}});}
 if(humanReply&&!echo)m.head.rotation.x+=Math.sin(q.elapsed*2.1)*.012;
 if(echo){m.head.rotation.z=.055*ease(q.elapsed/.45);m.torso.scale.y=1;m.arms.forEach(a=>a.hand.rotation.x=-.06);}
 }}
  if(n.worker.revealed){w.storyCreature??=makeCreature(w.scene,w.a,2,{id:'rowan',night:2,camouflage:'leaky',revealStyle:'flesh',anomaly:'joint'});const c=w.storyCreature;modelAttached(c,w.scene,!n.worker.exited);animateCreature(c,{...n.worker,hp:2,mode:l?.shot==='escape'?'chase':'search',sourceId:'rowan',stun:0},s,s.paused?0:dt);if(m)m.g.visible=false;}
 }else if(w.storyCreature)modelAttached(w.storyCreature,w.scene,false);
 const replay=q&&['review1','review2','coda'].includes(q.key);
 if(replay){w.storyReplay??=makePerson(w.scene,w.a,'cinematic-player');modelAttached(w.storyReplay,w.scene,true);const a={id:'cinematic-player',x:q.key==='review1'?-9.65:q.key==='coda'?-9.65:-6,z:q.key==='review1'?-3.35:q.key==='coda'?-2.0:17.4,yaw:q.key==='review1'?Math.PI/2:q.key==='coda'?Math.PI/2:-2.28,mode:'story',moving:false,spawnOrder:0};animatePerson(w.storyReplay,a,s,s.paused?0:dt);w.storyReplay.item.visible=false;w.storyReplay.head.rotation.y=q.key==='review2'?.25+Math.sin(q.total*1.4)*.10:0;
 }else if(w.storyReplay)modelAttached(w.storyReplay,w.scene,false);
 if(isHandover(q)){
  const plan=handoverPlan(q);if(!plan.pov)look(w,plan.from,plan.to,plan.fov);else{const u=ease(Math.max(0,q.elapsed-.6)/Math.max(1,(l.hold||4.2)-.6)),p=s.player;w.camera.position.set(p.x,1.7,p.z);w.camera.quaternion.setFromEuler(new T.Euler(p.pitch,p.yaw,0,'YXZ'));w.camera.translateZ(.14*(1-u));w.camera.fov=71;w.camera.updateProjectionMatrix();w.hands.visible=false;}
  if(label)label.textContent=plan.label;
  const soundKey=q.key+':'+Math.max(0,q.index);if(w.handoverSoundState!==s){w.handoverSoundState=s;w.handoverSoundKeys=new Set();}if(!w.handoverSoundKeys.has(soundKey)){w.handoverSoundKeys.add(soundKey);w.presentationSound?.(q.key==='transition2'?(q.index<=0?'paper':'foot'):(q.index<=0?'canopyCreak':'radioWhisper'));}
 }
 if(q?.key==='encounter'){
  const a=n.worker||STORY_POINTS.worker,p=n.savedPlayer||s.player;w.flash.intensity=Math.max(w.flash.intensity*.46,4.5);w.flashFill.intensity=Math.max(w.flashFill.intensity,.16);
  if(l?.shot==='hands')look(w,[a.x-.68+ease(q.elapsed/2)*.055,1.32,a.z-.28],[a.x-.03,1.13,a.z],43);
  else if(l?.shot==='transform')look(w,[a.x-1.25-ease(q.elapsed/1.8)*.14,1.7,a.z+1.6],[a.x,1.30,a.z],59);
  else if(l?.shot==='close')look(w,[a.x-.88+ease(q.elapsed/3)*.10,1.73,a.z-.64],[a.x,1.59,a.z],q.index===5?42:46);
  else if(l?.shot==='reverse'){
   w.storySelf??=makePerson(w.scene,w.a,'cinematic-player');modelAttached(w.storySelf,w.scene,true);animatePerson(w.storySelf,{id:'cinematic-player',...p,yaw:Math.atan2(a.x-p.x,a.z-p.z),mode:'story',moving:false},s,s.paused?0:dt);w.storySelf.item.visible=false;const d=Math.max(.1,Math.hypot(a.x-p.x,a.z-p.z)),u={x:(a.x-p.x)/d,z:(a.z-p.z)/d};let camera={x:a.x+u.x*.4-u.z*.55,z:a.z+u.z*.4+u.x*.55};if(!w.canMove(camera.x,camera.z,s,.08))camera={x:a.x+u.x*.4+u.z*.55,z:a.z+u.z*.4-u.x*.55};look(w,[camera.x,1.76,camera.z],[p.x,1.45,p.z],55);
  }else if(l?.shot==='escape')look(w,[-4.2,1.8,-1.8],[a.x,1.1,a.z],64);
  else look(w,[a.x-.78,1.72,a.z+1.36],[a.x,1.35,a.z],60);
  if(w.storySelf&&l?.shot!=='reverse')modelAttached(w.storySelf,w.scene,false);
 }else{
  if(w.storySelf)modelAttached(w.storySelf,w.scene,false);
  if(l?.shot==='rear'){if(q.key==='review1')look(w,[-6.1,2.5,-3.1],[-9.6,1.4,-3.35],54);else look(w,[-10,2.9,18],[-6,1.45,17.4],58);}
  if(l?.shot==='face')look(w,[-6.7,1.76,16.8],[-6,1.65,17.4],38);
  if(l?.shot==='counter')look(w,[-6.8,1.7,-2.3],[-9.65,1.4,-2],61);
  if(l?.shot==='front')look(w,[-.15,1.70,-3.3],[.5,1.55,-7.2],53);
 }
 const showBus=!!n.flags.busArrived||q?.key==='arrival';
 if(showBus){w.storyBus??=makeArrivalBus(w);w.storyBus.visible=true;const u=n.flags.busArrivalAt==null?1:Math.min(1,(s.time-n.flags.busArrivalAt)/8),ease=1-(1-u)*(1-u);const busPose=rescueBusPose(s);w.storyBus.position.set(busPose.x,0,busPose.z);for(const wheel of w.storyBus.userData.wheels||[]){wheel.roll.rotation.z=-31.5*ease/.52;}for(const {leaf,side}of w.storyBus.userData.doors||[])leaf.rotation.y=-side*1.2;w.arrival.busLight.position.set(-13,2,-17);w.arrival.busLight.intensity=9;}
 else if(w.storyBus){w.storyBus.visible=false;w.arrival.busLight.intensity=0;}
 updateEpilogueRoom(w,s,q,label);
 if(!q&&!s.finished&&!w.dialogueShot&&w.camera.fov!==71&&!w.device&&!s.binocularActive){w.camera.fov=71;w.camera.updateProjectionMatrix();}
}
