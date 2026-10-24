import {guidanceStrength,workCuePlan} from './guidance.js';
import {available} from './rules.js';
import {canRecallChange} from './checkout.js';
import * as T from './vendor/three.module.js';
import {DENOMINATIONS} from './night-data.js';
export function checkoutCuePlan(s,device=null){
 const t=s.transaction;if(s.refusal||!s.campaign||!t||s.paused||s.finished||!s.power||s.hidden||s.carry||s.boardCarry||s.trapCarry||s.gunDrawn||s.scannerActive||s.binocularActive)return[];
 if(t.stage==='scan')return t.items.flatMap((_,i)=>t.scanned.includes(i)?[]:[{id:'checkoutItem',key:i}]);
 if(t.stage==='cash')return[{id:'tender'}];
 if(t.stage==='receipt')return[];
 if(t.stage==='change'){if(device!=='register')return[{id:'register'},{id:'drawer'}];return [...(canRecallChange(t)?[{id:'cashReset'}]:[]),...DENOMINATIONS.filter(v=>(s.ledger.till[v]||0)-(t.selected[v]||0)>0).map(v=>({id:'cashNote',key:v}))];}
 return[];
}
export function installCheckoutCues(w){w.checkoutOutlines=new Map();w.checkoutCueState=[];}
function inScene(mesh,scene){for(let p=mesh;p;p=p.parent)if(p===scene)return true;return false;}
function outline(w,mesh){let o=w.checkoutOutlines.get(mesh);if(o)return o;const material=new T.LineBasicMaterial({color:0xdfc991,transparent:true,opacity:.34,depthTest:true,depthWrite:false,toneMapped:false});o=new T.LineSegments(new T.EdgesGeometry(mesh.geometry,36),material);o.scale.setScalar(1.025);o.renderOrder=2;o.userData.decorative=true;mesh.add(o);const fill=new T.Mesh(mesh.geometry,new T.MeshBasicMaterial({color:0xd6ba73,transparent:true,opacity:0,depthTest:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1}));fill.scale.setScalar(1.008);fill.renderOrder=1;fill.userData.decorative=true;mesh.add(fill);o.userData.fill=fill;w.checkoutOutlines.set(mesh,o);return o;}
function rendered(mesh,scene){for(let p=mesh;p;p=p.parent){if(!p.visible)return false;if(p===scene)return true;}return false;}
function fixedCueMesh(w,tag){
 if(tag.id==='phone')return w.phoneGroup.children.find(m=>m.isMesh);if(tag.id==='terminal')return w.screens.terminal.mesh;if(tag.id==='crate')return w.crates[tag.key];if(tag.id==='clean')return w.spills[tag.key];if(tag.id==='shelf')return null;
 if(tag.id==='actor')return w.people[tag.key]?.torso;if(tag.id==='restFood')return w.restProps?.find(p=>p.key===tag.key&&p.m.visible)?.m;if(tag.id==='evacuate')return w.storyBus?.children.find(m=>m.isMesh);
 const key=tag.id+':'+(tag.key??''),index=fixedIndex(w);let list=index.get(key)||[];if(!list.some(m=>rendered(m,w.scene))){list=[];w.scene.traverse(m=>{const t=m.userData.target;if(m.isMesh&&t&&!m.userData.decorative&&t.id===tag.id&&t.key===tag.key)list.push(m);});index.set(key,list);}if(tag.id==='receiving')list=[...list].sort((a,b)=>b.getWorldPosition(new T.Vector3()).y-a.getWorldPosition(new T.Vector3()).y);return list.find(m=>rendered(m,w.scene));
}
function fixedIndex(w){if(w.guidanceMeshIndex)return w.guidanceMeshIndex;const index=new Map();w.scene.traverse(m=>{const t=m.userData.target;if(!m.isMesh||!t||m.userData.decorative)return;const key=t.id+':'+(t.key??'');if(!index.has(key))index.set(key,[]);index.get(key).push(m);});w.guidanceMeshIndex=index;return index;}
export function interactionCuePlan(s,hover=null,device=null){
 if(s.paused||s.finished||s.hidden||s.deathCinematic||s.binocularActive)return[];
 const list=[...checkoutCuePlan(s,device),...workCuePlan(s)];
 if(s.carry){list.length=0;const c=s.crates[s.carry.id];list.push(c.received?{id:'shelf',key:c.shelf}:{id:'receiving'});}
 if(s.night===1&&s.time<180&&!s.carry){if(!s.torchOwned)list.push({id:'torch'});if(!s.gunOwned)list.push(s.securityOpen?{id:'gun'}:{id:'securityDrawer'});}
 const stage=s.narrative?.stage;
 if(['callback','waitingBrief'].includes(stage)&&s.phone)list.push({id:'phone'});
 if(['review1','review2','checkFront','checkArrival'].includes(stage))list.push({id:'monitor'});
 if(['report1','report2','prepare3','verifyPickup'].includes(stage))list.push({id:'radio'});
 if(stage==='restorePower')list.push({id:'breaker'});
 if(s.phase==='dawn')list.push({id:'finish'});
 if(stage==='boardBus'){if(s.barricades.front)list.push({id:'unbrace',key:'front'});else if(s.frontLocked)list.push(s.securityOpen?{id:s.doorKeyOwned?'doorControl':'doorKey'}:{id:'securityDrawer'});else list.push({id:'evacuate'},{id:'door',key:'front'});}
 if(hover)list.push({id:hover.id,key:hover.key});
 const seen=new Set();return list.filter(t=>{const k=t.id+':'+(t.key??'');if(seen.has(k)||!available(s,t))return false;seen.add(k);return true;});
}
export function updateCheckoutCues(w,s){
 for(const o of w.checkoutOutlines.values()){o.visible=false;o.userData.fill.visible=false;}const plan=interactionCuePlan(s,w.hoverTarget,w.device),active=[],strength=guidanceStrength(s),pulse=.92+.08*Math.sin(s.time*3.1);
 // Glow is an inexpensive surface overlay, never a new light or a floating label.
 // Only the current valid action is shown; all available cash faces share intensity.
 for(const tag of plan){if(!available(s,tag))continue;let mesh;
  if(tag.id==='checkoutItem')mesh=w.counterGoods[tag.key]?.children.find(o=>o.isMesh);
  else if(tag.id==='cashReset')mesh=w.cashReset;else if(tag.id==='tender')mesh=w.tender;
  else if(tag.id==='register')mesh=w.screens.register.mesh;else if(tag.id==='drawer')mesh=w.drawer.children[0];
  else if(tag.id==='cashNote')mesh=w.moneyBins[DENOMINATIONS.indexOf(tag.key)]?.children[0];
  else mesh=fixedCueMesh(w,tag);
  if(!mesh||!rendered(mesh,w.scene))continue;const pos=mesh.getWorldPosition(new T.Vector3());if(w.device!=='register'&&Math.hypot(s.player.x-pos.x,s.player.z-pos.z)>(tag.id==='manifest'||tag.id==='breaker'?14:8))continue;
  const o=outline(w,mesh),hover=tag.id==='cashNote'?DENOMINATIONS[w.cashHover]===tag.key:w.hoverTarget?.id===tag.id&&(tag.key==null||w.hoverTarget.key===tag.key);
  o.visible=true;o.material.opacity=(hover?.88:.64)+strength*(hover?.12:.22);o.material.color.setHex(hover?0xf2ddb0:0xdfc991);const fill=o.userData.fill;fill.visible=true;fill.material.opacity=Math.max(tag.id==='receiving'?.23:0,(.085+strength*.13)*(hover?1.30:pulse));active.push({...tag,bright:!!hover,strength,fillOpacity:fill.material.opacity});
 }
 w.checkoutCueState=active;if(!s.power)w.cue.visible=false;if(w.cue.visible){w.cue.material.opacity=.14+.10*strength;w.cue.children[0].material.opacity=.70+.25*strength;}
 // Basket meshes can retain detached parents. Release our overlays by ancestry.
 for(const[mesh,o]of w.checkoutOutlines)if(!inScene(mesh,w.scene)){o.geometry.dispose();o.material.dispose();o.userData.fill.material.dispose();mesh.remove(o,o.userData.fill);w.checkoutOutlines.delete(mesh);}
}
