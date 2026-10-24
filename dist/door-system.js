import {doorPose,circleHitsBox} from './spatial.js';
import {DOORS} from './data.js';
export const FRONT_LEAF_OFFSET=.18;
export function doorBoxes(id,s){const d=DOORS[id];if(!d)return[];if(d.rolling)return(s.loadingLift??(s.doors.loading?1:0))>.74?[]:[{x:d.x,z:d.z,w:d.w,d:d.d,angle:0}];if(id!=='front')return[doorPose(d,s.doors[id])];const u=s.frontSlide??(s.doors.front?1:0),half=d.w/2;return[-1,1].map(sign=>({x:d.x+sign*(half/2+half*u),z:d.z+FRONT_LEAF_OFFSET,w:half,d:d.d,angle:0}));}
export function frontOccupied(s){const d=DOORS.front;return[s.player,...(s.actors||[]).filter(a=>a.mode!=='dead'),...(s.threats||[]).filter(a=>a.mode!=='dead'),...(s.crates||[]).filter(c=>['floor','warehouse'].includes(c.place))].some(a=>Math.abs(a.x-d.x)<d.w/2+.40&&Math.abs(a.z-d.z)<.65);}
export function tickFrontDoor(s,dt,sound=()=>{}){const last=s.frontSlide??0;let want=false;
 if(s.frontLocked||s.barricades.front)want=false;
 else if(!s.power)want=!!s.frontManual;
 else want=s.frontManual||(['opening','customers'].includes(s.phase)&&s.briefed&&[s.player,...(s.actors||[]).filter(a=>a.mode!=='dead')].some(a=>Math.abs(a.x-DOORS.front.x)<2.2&&Math.abs(a.z-DOORS.front.z)<3.0));
 if(!want&&frontOccupied(s))want=true;
 s.frontSlide=Math.max(0,Math.min(1,last+(want?1:-1)*dt*1.65));s.doors.front=s.frontSlide>.83;
 if((last===0&&s.frontSlide>0)||(last===1&&s.frontSlide<1))sound('slidingDoor',{pos:DOORS.front});
}
export function startBlackout(s){s.power=false;s.blackoutAt=s.time;s.frontManual=false;s.frontLocked=true;s.frontBatteryUsed=true;}
export function fixturePowerLevel(s,i=0){if(s.power)return 1;const age=s.time-(s.blackoutAt??-99);if(i%3===0||age>1.15+(i%3)*.2)return 0;if(age<0)return 0;return Math.sin(age*(31+i*3))>.08?1:.05;}
export function canLockFront(s){return s.doorKeyOwned&&!frontOccupied(s);}
