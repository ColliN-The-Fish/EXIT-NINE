import * as T from './vendor/three.module.js';
import {boxesOverlap,looseCargoBoxes} from './collision-system.js';
import {doorBoxes} from './door-system.js';
import {carBlocks} from './vehicle-flow.js';
import {freightGateBoxes} from './yard-layout.js';
import {DOORS} from './data.js';
// Bring held objects toward the chest when standing beside a wall. This does
// not expand the player's collider on pickup, so a narrow spot cannot trap them.
export function fitHeldProps(w,s){
 if(!w.hands.visible||s.hidden||w.tester?.noclip)return;
 const props=[];if(w.carried.visible)props.push({m:w.carried,base:[0,-.48,-.8],center:[0,0,0],w:.65,h:.52,d:.52});if(w.heldBoard.visible)props.push({m:w.heldBoard,base:[0,-.30,-.75],center:[0,0,0],w:.19,h:.085,d:1.45});if(w.handGun.visible)props.push({m:w.handGun,base:[0,0,0],center:[.25,-.44,-.57],w:.20,h:.43,d:.44});if(!props.length)return;
 const blockers=[...w.solids,...Object.keys(DOORS).flatMap(id=>doorBoxes(id,s)),...carBlocks(s),...freightGateBoxes(s),...looseCargoBoxes(s),...(s.actors||[]).filter(a=>!a.exited&&a.mode!=='dead').map(a=>({x:a.x,z:a.z,w:.48,d:.48,sightTop:2.1}))].filter(b=>Math.abs(b.x-w.camera.position.x)<(b.w+b.d)/2+2.5&&Math.abs(b.z-w.camera.position.z)<(b.w+b.d)/2+2.5),v=new T.Vector3();
 for(const p of props){let found=null;for(let back=0;back<=1.41&&!found;back+=.10)for(const side of[0,-.14,.14,-.28,.28,-.42,.42]){
   v.set(p.base[0]+p.center[0]+side,p.base[1]+p.center[1],p.base[2]+p.center[2]+back).applyQuaternion(w.camera.quaternion).add(w.camera.position);
   const box={x:v.x,z:v.z,w:p.w+Math.abs(Math.sin(s.player.pitch))*p.h,d:p.d,angle:s.player.yaw+(p.m.rotation.y||0)},lo=v.y-p.h/2,hi=v.y+p.h/2;
   if(!blockers.some(b=>hi>(b.sightBottom??0)+.008&&lo<(b.sightTop??3.5)-.008&&boxesOverlap(box,b,.025))){found={side,back};break;}
  }
  if(found){p.m.position.set(p.base[0]+found.side,p.base[1],p.base[2]+found.back);p.m.userData.retracted=found.back>.01||Math.abs(found.side)>.01;}else p.m.visible=false;
 }
}
