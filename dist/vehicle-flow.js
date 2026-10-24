import {circleHitsBox} from './spatial.js';
import {rescueBusBoxes} from './collision-system.js';
import {freightBlocks} from './freight-flow.js';
import {distance} from './rules.js';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export const PUMP_PARK={x:11,z:-12,yaw:Math.PI/2};
export const CAR_DOOR_OUT={x:10.5,z:-10.65};
export const CAR_SEAT={x:10.5,z:-11.55};
function bezier(t,reverse=false){const pts=reverse?[[11,-12],[17,-12],[17,-18.5],[23,-18.5]]:[[23,-18.5],[17,-18.5],[17,-12],[11,-12]],u=1-t;return{x:u*u*u*pts[0][0]+3*u*u*t*pts[1][0]+3*u*t*t*pts[2][0]+t*t*t*pts[3][0],z:u*u*u*pts[0][1]+3*u*u*t*pts[1][1]+3*u*t*t*pts[2][1]+t*t*t*pts[3][1]};}
export function pumpDoorBox(v,door=v.door||0){const a=-1.12*door,x=-.94+Math.sin(a)*.53,z=-.78+Math.cos(a)*.53,c=Math.cos(v.yaw),sn=Math.sin(v.yaw);return {x:v.x+c*x+sn*z,z:v.z-sn*x+c*z,w:.10,d:1.10,angle:v.yaw+a};}
const pedestrians=(s,driver)=>[s.player,...(s.actors||[]).filter(b=>b.id!==driver.id&&b.mode!=='dead'&&!b.mode.startsWith('vehicle')),...(s.threats||[]).filter(t=>t.mode!=='dead')];
export function beginPumpVisit(s,a){a.mode='vehicleArrive';a.x=23;a.z=-18.5;a.vehicleStage=0;s.visitCar={actorId:a.id,phase:'arrive',progress:0,x:23,z:-18.5,yaw:Math.PI/2,door:0,parked:false};}
export function tickVehicle(g,a,dt){const s=g.s,v=s.visitCar;if(!v||v.actorId!==a.id)return false;
 if(a.mode==='vehicleArrive'||a.mode==='vehicleDepart'){const reverse=a.mode==='vehicleDepart',next=Math.min(1,v.progress+dt/10),p=bezier(smooth(next),reverse);const target=Math.atan2(-(p.x-v.x),-(p.z-v.z)),delta=Math.atan2(Math.sin(target-v.yaw),Math.cos(target-v.yaw)),yaw=Math.hypot(p.x-v.x,p.z-v.z)>.0001?v.yaw+Math.max(-dt*1.3,Math.min(dt*1.3,delta)):v.yaw;if(pedestrians(s,a).some(b=>circleHitsBox(b.x,b.z,.35,{...p,w:2,d:4.4,angle:yaw}))){a.moving=false;if(!v.blocked){v.blocked=true;g.notice('司机在等行人让开车道；退开一点让车辆继续。');}return true;}v.blocked=false;v.progress=next;v.x=p.x;v.z=p.z;v.yaw=yaw;a.x=v.x-Math.cos(v.yaw)*.45-Math.sin(v.yaw)*.5;a.z=v.z+Math.sin(v.yaw)*.45-Math.cos(v.yaw)*.5;a.yaw=v.yaw+Math.PI;a.vehiclePose=1;a.moving=false;
  if(next===1){if(reverse){v.phase='gone';v.parked=false;a.exited=true;}else{Object.assign(v,{...PUMP_PARK,phase:'exit',progress:0,parked:true});Object.assign(a,{...CAR_SEAT,mode:'vehicleExit',vehicleStage:0});g.sound('carDoor',{pos:v});}}return true;
 }
 if(a.mode==='vehicleExit'||a.mode==='vehicleEnter'){const entering=a.mode==='vehicleEnter',next=Math.min(1,v.progress+dt/3),nextDoor=smooth(next/.24)*(entering?1-smooth((next-.75)/.25):1);if(pedestrians(s,a).some(b=>Array.from({length:5},(_,i)=>v.door+(nextDoor-v.door)*(i+1)/5).some(u=>circleHitsBox(b.x,b.z,.28,pumpDoorBox(v,u))))){if(!v.doorBlocked)g.notice('车门旁有人，司机在等安全的开关门空间。');v.doorBlocked=true;return true;}v.doorBlocked=false;v.progress=next;const t=v.progress;v.door=nextDoor;const u=entering?1-smooth(t/.78):smooth((t-.20)/.78);a.x=CAR_SEAT.x+(CAR_DOOR_OUT.x-CAR_SEAT.x)*u;a.z=CAR_SEAT.z+(CAR_DOOR_OUT.z-CAR_SEAT.z)*u;a.yaw=entering?Math.PI+Math.PI/2*(1-u):-Math.PI/2*(1-u);a.vehiclePose=1-u;a.moving=false;
  if(t===1){if(entering){a.mode='vehicleDepart';a.vehiclePose=1;v.phase='depart';v.progress=0;g.sound('engineStart',{pos:v});}else{a.mode='arrive';a.step=0;a.route=null;a.vehiclePose=0;v.phase='parked';v.door=0;g.sound('carDoor',{pos:v});g.sound('pumpCall',{pos:{x:8.4,z:-9.3}});g.say('里昂：能来帮我看一下吗？');}}return true;
 }
 if(a.mode==='leave'&&v.phase!=='gone'){const goal=CAR_DOOR_OUT;if(distance(a,goal)<.14){a.mode='vehicleEnter';v.phase='enter';v.progress=0;g.sound('carDoor',{pos:v});}else g.walk(a,goal,dt,1.55);return true;}return false;
}
export function carBlocks(s){const v=s.visitCar;return [...freightBlocks(s),...rescueBusBoxes(s),...(v&&v.phase!=='gone'?[{x:v.x,z:v.z,w:2,d:4.4,angle:v.yaw},...(v.door>.01?[pumpDoorBox(v)]:[])]:[])];}
