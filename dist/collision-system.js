import {truckRise} from './site-layout.js';
import {freightPoint} from './freight-flow.js';
import {groundLevel} from './locomotion.js';
import {circleHitsBox} from './spatial.js';
// Shared horizontal footprints: mesh placement, navigation and movement use
// the same dimensions. These tests intentionally ignore joined construction seams.
export const PERSON_CLEARANCE=.55;
export function cargoBaseY(c,s){return c.place==='truck'?1.025:truckRise(c,s)>.999?1.025:groundLevel(c.x,c.z,s);}
export function looseCargoBoxes(s){return (s.crates||[]).filter(c=>['floor','warehouse'].includes(c.place)||c.place==='truck'&&s.freight?.phase==='ready').map(c=>{const p=c.place==='truck'?freightPoint(s,c.x,c.z):c,base=cargoBaseY(c,s);return {x:p.x,z:p.z,w:.64,d:.64,sightBottom:base,sightTop:base+.65,fixture:'loose-crate-'+c.id};});}
export function canStepPastPeople(from,to,s,r=PERSON_CLEARANCE){
 if(s.hidden)return true;
 return ![...(s.actors||[]),...(s.threats||[]).filter(t=>t.hp>0&&!t.withdrawn)].some(a=>!a.exited&&!['dead','vehicleArrive','vehicleDepart','vehicleExit','vehicleEnter'].includes(a.mode)&&Math.hypot(to.x-a.x,to.z-a.z)<r&&Math.hypot(to.x-a.x,to.z-a.z)<Math.hypot(from.x-a.x,from.z-a.z)-1e-7);
}
export function rescueBusPose(s){const n=s.narrative;if(!n||!(n.flags?.busArrived||n.sequence?.key==='arrival'))return null;const u=n.flags?.busArrivalAt==null?1:Math.max(0,Math.min(1,(s.time-n.flags.busArrivalAt)/8)),ease=1-(1-u)*(1-u);return {x:-48+31.5*ease,z:-18.3,yaw:0};}
export function rescueBusBoxes(s){const p=rescueBusPose(s);return p?[{...p,w:8.9,d:2.78,angle:0}]:[];}
export function boxesOverlap(a,b,padding=0){
 const ca=Math.cos(a.angle||0),sa=Math.sin(a.angle||0),cb=Math.cos(b.angle||0),sb=Math.sin(b.angle||0),c=Math.abs(ca*cb+sa*sb),sn=Math.abs(sa*cb-ca*sb),dx=a.x-b.x,dz=a.z-b.z,aw=a.w/2,ad=a.d/2,bw=b.w/2,bd=b.d/2,eps=padding-1e-7;
 if(Math.abs(ca*dx-sa*dz)>=aw+c*bw+sn*bd+eps)return false;
 if(Math.abs(sa*dx+ca*dz)>=ad+sn*bw+c*bd+eps)return false;
 if(Math.abs(cb*dx-sb*dz)>=bw+c*aw+sn*ad+eps)return false;
 if(Math.abs(sb*dx+cb*dz)>=bd+sn*aw+c*ad+eps)return false;
 return true;
}
export function pointClearOfBoxes(p,boxes,r=.25){return !boxes.some(b=>circleHitsBox(p.x,p.z,r,b));}

export function flatCargoSpot(p,s){const rise=truckRise(p,s);return rise<.01||rise>1.0;}
// The arrival is a fixed shot: step a player who camped in the bus lane onto
// the existing stop apron before the coach enters, including resumed shots.
export function clearRescueBusLane(s){let moved=false;for(const p of[s.player,s.narrative?.savedPlayer]){if(p&&p.x< -11.75&&p.z> -20&&p.z< -16.6){p.x=-13.15;p.z=-16.2;moved=true;}}return moved;}
