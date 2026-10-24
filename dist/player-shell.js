import * as T from './vendor/three.module.js';
import {terminalPose,buildMenuJourney,menuJourneyPose,LANDING_POSITION,LANDING_TARGET} from './player-menu-journey.js';
const $=id=>document.getElementById(id);
const PREFS='exit-nine:player:preferences:v1';
export function readPreferences(){try{const value=JSON.parse(localStorage.getItem(PREFS)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}}
export function writePreferences(value){try{localStorage.setItem(PREFS,JSON.stringify(value));}catch{}}
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const money=v=>'$'+((v||0)/100).toFixed(2);
// Maps the interactive HTML into the existing terminal's four physical corners.
// The scene and the user's saved position are never moved or edited.
function planeTransform(p,width,height){
 const dx1=p[1].x-p[2].x,dx2=p[3].x-p[2].x,dx3=p[0].x-p[1].x+p[2].x-p[3].x;
 const dy1=p[1].y-p[2].y,dy2=p[3].y-p[2].y,dy3=p[0].y-p[1].y+p[2].y-p[3].y;
 const det=dx1*dy2-dx2*dy1;
 if(Math.abs(det)<.00001)return null;
 const g=(dx3*dy2-dx2*dy3)/det,h=(dx1*dy3-dx3*dy1)/det;
 const a=p[1].x-p[0].x+g*p[1].x,b=p[3].x-p[0].x+h*p[3].x;
 const d=p[1].y-p[0].y+g*p[1].y,e=p[3].y-p[0].y+h*p[3].y;
 return `matrix3d(${a/width},${d/width},0,${g/width},${b/height},${e/height},0,${h/height},0,0,1,0,${p[0].x},${p[0].y},0,1)`;
}
export class PlayerShell{
 constructor({onEnter=()=>{}}={}){this.current='home';this.pending=null;this.mode='landing';this.enteredTerminal=false;this.transition=null;this.onEnter=onEnter;this.v=new T.Vector3();this.q=new T.Quaternion();this.lastTask='';this.lastInventory='';this.taskUntil=0;this.inventoryUntil=0;this.menuScreenMaterial=new T.MeshBasicMaterial({color:0x08110d,toneMapped:false});
  for(const b of document.querySelectorAll('[data-menu-page]')){b.onclick=()=>this.page(b.dataset.menuPage);b.disabled=false;}
  $('enter-terminal').onclick=()=>this.travelTo('terminal');$('terminal-back').onclick=()=>this.travelTo('landing');
  $('confirm-new').onclick=()=>{const action=this.pending;this.pending=null;action?.();};$('cancel-new').onclick=()=>{this.pending=null;this.page('home');};
 }
 page(name){this.current=name;$('screen').dataset.page=name;for(const p of document.querySelectorAll('[data-menu-view]'))p.hidden=p.dataset.menuView!==name;const heading=document.querySelector(`[data-menu-view="${name}"] h2`);heading?.focus({preventScroll:true});if(name==='home')document.querySelector('#menu-actions button:not(:disabled)')?.focus({preventScroll:true});}
 home({ongoing,checkpoint,night,state,task}){
  this.mode=ongoing?'paper':this.enteredTerminal?'terminal':'landing';$('screen').dataset.mode=this.mode;
  const info=ongoing?state:(checkpoint||state),n=info?.night||night||1;
  $('menu-title').textContent=ongoing?'暂离岗位':'值班登记';$('menu-context').textContent=ongoing?'员工留存 / 已暂停':'第九出口 · 值班终端';
  $('menu-eyebrow').textContent='班次 0'+n+' / 1996';
  $('menu-copy').textContent=ongoing?'待办：'+(task?.title||'继续当班工作'):checkpoint?'已有当班记录，继续上次的夜班。':'亚历克斯 · 夜班店员';
  $('desk-balance').textContent='租房基金 '+money(info?.rentFund)+'　店铺备用金 '+money(info?.wallet);
  $('save-status').textContent=checkpoint?'本机进度已保存':'进度自动保存在此浏览器';
  $('landing-save').textContent=checkpoint?'已有存档 · 第 '+(checkpoint.night||night||1)+' 晚':'进度自动保存在此浏览器';
  this.page('home');
 }
 confirmNew(action){this.pending=action;this.page('confirm');}
 escape(){if(this.transition)return true;if(this.current!=='home'){this.pending=null;this.page('home');return true;}if(this.mode==='terminal'){this.travelTo('landing');return true;}return false;}
 travelTo(to){
  if(this.transition||!this.world?.characterWarmup?.ready||to===this.mode)return;
  this.onEnter();this.page('home');const route=buildMenuJourney(this.world.screens.terminal.mesh,this.world.camera.aspect);
  this.transition={from:this.mode,to,route,elapsed:0,last:performance.now(),moveSeconds:route.seconds,revealSeconds:.30};
  $('screen').dataset.transition='active';$('screen').setAttribute('aria-busy','true');document.body.classList.add('menu-journey');
 }
 projectTerminal(w){
  const surface=$('terminal-surface'),mesh=w.screens.terminal.mesh,{width,height}=mesh.geometry.parameters;
  w.camera.updateMatrixWorld();
  const points=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([x,y])=>{const p=mesh.localToWorld(new T.Vector3(x*width/2,y*height/2,.001)).project(w.camera);return{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2};});
  const transform=planeTransform(points,900,654);if(transform)surface.style.transform=transform;
  $('screen').dataset.ready=transform?'true':'false';
 }
 drawBackdrop(w){
  const screen=$('screen'),surface=$('terminal-surface');this.world=w;w.hands.visible=false;
  const ready=!!w.characterWarmup?.ready;$('enter-terminal').disabled=!ready;const entryLabel=ready?'进入游戏 ':'正在准备场景… ';if($('enter-terminal').firstChild.nodeValue!==entryLabel)$('enter-terminal').firstChild.nodeValue=entryLabel;
  if(this.mode==='paper'){surface.style.removeProperty('transform');screen.dataset.ready='true';return;}
  this.presentationScene=w.presentationScene;w.presentationScene=null;
  const mesh=w.screens.terminal.mesh;this.screenMaterial=mesh.material;mesh.material=this.menuScreenMaterial;
  const journey=this.transition,now=performance.now();
  if(journey){
   const dt=document.hidden?0:Math.min(.05,Math.max(0,(now-journey.last)/1000));journey.last=now;journey.elapsed+=dt;
   const reverse=journey.to==='landing',moving=journey.elapsed<journey.moveSeconds;
   const pose=menuJourneyPose(journey.route,Math.min(journey.elapsed,journey.moveSeconds),reverse);
   w.camera.position.copy(pose.position);w.camera.quaternion.copy(pose.rotation);w.camera.fov=pose.fov;w.camera.updateProjectionMatrix();
   this.mode=journey.elapsed<.20?journey.from:journey.to;screen.dataset.mode=this.mode;
   const opacity=journey.elapsed<.20?1-ease(journey.elapsed/.16):moving?0:ease((journey.elapsed-journey.moveSeconds-.03)/.27);
   screen.style.setProperty('--menu-content-opacity',String(opacity));
   if(this.mode==='terminal'&&!moving)this.projectTerminal(w);else screen.dataset.ready='true';
   if(journey.elapsed>=journey.moveSeconds+journey.revealSeconds){this.transition=null;this.mode=journey.to;this.enteredTerminal=this.mode==='terminal';screen.dataset.mode=this.mode;delete screen.dataset.transition;screen.removeAttribute('aria-busy');screen.style.removeProperty('--menu-content-opacity');document.body.classList.remove('menu-journey');if(this.mode==='terminal')document.querySelector('#menu-actions button:not(:disabled)')?.focus({preventScroll:true});else $('enter-terminal').focus({preventScroll:true});}
   return;
  }
  if(this.mode==='landing'){surface.style.removeProperty('transform');w.camera.position.set(...LANDING_POSITION);w.camera.lookAt(...LANDING_TARGET);w.camera.fov=71;w.camera.updateProjectionMatrix();screen.dataset.ready='true';}
  else{const pose=terminalPose(mesh,w.camera.aspect);w.camera.position.copy(pose.position);w.camera.quaternion.copy(pose.rotation);w.camera.fov=pose.fov;w.camera.updateProjectionMatrix();this.projectTerminal(w);}
 }
 afterBackdrop(w){
  if(this.mode==='paper')return;
  w.presentationScene=this.presentationScene;
  if(this.screenMaterial)w.screens.terminal.mesh.material=this.screenMaterial;
 }
 updateHUD({state:s,task,now,device}){
  if(this.lastState!==s){this.lastState=s;this.lastTask='';this.lastInventory='';this.taskUntil=s.time+12;this.inventoryUntil=s.time+5;}
  const signature=task.title+'|'+task.detail;
  if(signature!==this.lastTask){this.lastTask=signature;this.taskUntil=s.time+12;}
  $('task-detail').hidden=s.time>this.taskUntil;
  const inventory=$('inventory').innerHTML;
  if(inventory!==this.lastInventory){this.lastInventory=inventory;this.inventoryUntil=s.time+5;}
  $('inventory').hidden=!(s.carry||s.boardCarry||s.heldId||s.gunDrawn||s.binocularActive||s.time<this.inventoryUntil);
  document.body.classList.toggle('journal-open',!$('modal').hidden);
  document.body.classList.toggle('hud-orientation',s.time<40);
  document.body.classList.toggle('hud-speaking',!!document.querySelector('#subtitle')?.textContent&&$('subtitle').style.display!=='none');
 }
}
