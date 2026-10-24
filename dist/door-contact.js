import {DOORS} from './data.js';
import {doorPose,circleHitsBox} from './spatial.js';
// Normal operation refuses an occupied swing. Forced breaches must also clear
// the final leaf, otherwise a customer can remain trapped inside a newly open door.
export function resolveDoorContacts(w,s,previous){
 if(!previous)return;
 const people=[...(!s.hidden?[s.player]:[]),...(s.actors||[]).filter(a=>a.mode!=='dead'&&!a.mode.startsWith('vehicle')),...(s.threats||[]).filter(t=>t.hp>0&&t.mode!=='dead')],cargo=(s.crates||[]).filter(c=>['floor','warehouse'].includes(c.place));
 for(const [key,p]of Object.entries(DOORS)){
  if(key==='front'||p.rolling||previous[key]===s.doors[key])continue;
  const b=doorPose(p,s.doors[key]),c=Math.cos(b.angle),sn=Math.sin(b.angle),vertical=p.d>p.w,n=vertical?{x:c,z:-sn}:{x:sn,z:c},t=vertical?{x:sn,z:c}:{x:c,z:-sn};
  for(const entity of[...people,...cargo]){
   const box=cargo.includes(entity),r=box?.46:.25;if(!circleHitsBox(entity.x,entity.z,r,b))continue;
   const thickness=(vertical?p.w:p.d)/2+r+.045,length=(vertical?p.d:p.w)/2+r+.045,spots=[];
   for(const sign of[-1,1]){spots.push({x:b.x+n.x*thickness*sign,z:b.z+n.z*thickness*sign},{x:b.x+t.x*length*sign,z:b.z+t.z*length*sign});}
   for(let radius=.35;radius<2.6;radius+=.3)for(let i=0;i<24;i++){const angle=i*Math.PI/12;spots.push({x:entity.x+Math.cos(angle)*radius,z:entity.z+Math.sin(angle)*radius});}
   spots.sort((a,b)=>Math.hypot(a.x-entity.x,a.z-entity.z)-Math.hypot(b.x-entity.x,b.z-entity.z));
   const state=box?{...s,crates:s.crates.filter(c=>c!==entity)}:s,spot=spots.find(q=>w.canMove(q.x,q.z,state,box?.36:.25)&&!people.some(other=>other!==entity&&Math.hypot(q.x-other.x,q.z-other.z)<(box?.64:.52)));
   if(spot){Object.assign(entity,spot);if(!box&&entity!==s.player){entity.route=null;entity.repath=0;entity.moving=false;entity.blocked=false;}}
  }
 }
}
