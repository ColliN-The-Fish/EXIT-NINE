import {circleHitsBox} from './spatial.js';
import {recordFreightTracks} from './yard-layout.js';
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export const FREIGHT_PARK={x:-6,z:24.05,yaw:0};
export function initFreight(s){s.freight=s.night===3?{...FREIGHT_PARK,phase:'gone',time:0,open:0}:{x:35,z:30,yaw:-Math.PI/2,phase:'approach',time:0,open:0};return s;}
export function freightPoint(s,x,z){const f=s.freight||FREIGHT_PARK,c=Math.cos(f.yaw||0),sn=Math.sin(f.yaw||0),dx=x+6,dz=z-24.05;return{x:f.x+c*dx+sn*dz,z:f.z-sn*dx+c*dz};}
function curve(u,points){const a=1-u;const x=a*a*a*points[0][0]+3*a*a*u*points[1][0]+3*a*u*u*points[2][0]+u*u*u*points[3][0],z=a*a*a*points[0][1]+3*a*a*u*points[1][1]+3*a*u*u*points[2][1]+u*u*u*points[3][1],dx=3*a*a*(points[1][0]-points[0][0])+6*a*u*(points[2][0]-points[1][0])+3*u*u*(points[3][0]-points[2][0]),dz=3*a*a*(points[1][1]-points[0][1])+6*a*u*(points[2][1]-points[1][1])+3*u*u*(points[3][1]-points[2][1]);return{x,z,yaw:Math.atan2(dx,dz)};}
export function freightReady(s){return !s.freight||s.freight.phase==='ready';}
export function freightBlocks(s){const f=s.freight;if(!f||f.phase==='gone')return[];const c=Math.cos(f.yaw),sn=Math.sin(f.yaw),part=(x,z,w,d)=>({x:f.x+c*x+sn*z,z:f.z-sn*x+c*z,w,d,angle:f.yaw});return [part(-1.66,0,.16,6.6),part(1.66,0,.16,6.6),part(0,3.3,3.4,.16),part(0,4.4,2.9,2.1),...[-1,1].map(sign=>{const a=-sign*Math.PI*1.5*(f.open||0),b=part(sign*1.80-sign*.99*Math.cos(a),-3.00+sign*.99*Math.sin(a),1.58,.08);b.angle+=a;return b;}),...(!freightReady(s)?[part(0,-3.3,3.4,.16)]:[])];}
function rearOccupied(s){const positions=[s.player,...s.actors,...s.threats.filter(t=>t.mode!=='dead')].filter(p=>Math.abs(p.x+6)<4.0&&p.z>18.8&&p.z<23.0);if(!positions.length)return false;
 if(positions.some(p=>Math.abs(p.x+6)<1.84&&p.z>19.1&&p.z<21.0))return true;
 for(let i=0;i<=48;i++){const leaves=freightBlocks({...s,freight:{...s.freight,open:i/48}}).slice(4,6);if(positions.some(p=>leaves.some(b=>circleHitsBox(p.x,p.z,.28,b))))return true;}return false;}
export function freightBodyBox(p){return {x:p.x+Math.sin(p.yaw||0)*.95,z:p.z+Math.cos(p.yaw||0)*.95,w:3.8,d:8.9,angle:p.yaw||0};}
function blocked(s,p){const b=freightBodyBox(p);return [s.player,...s.actors,...s.threats.filter(t=>t.mode!=='dead')].some(a=>circleHitsBox(a.x,a.z,.35,b));}
export function tickFreight(g,dt){const s=g.s,f=s.freight;if(!f||f.phase==='gone')return;const advance=(phase)=>{f.phase=phase;f.time=0;};
 if(f.phase==='ready'){if(s.manifest&&s.crates.every(c=>c.place!=='truck')){if(rearOccupied(s)||s.crates.some(c=>['floor','warehouse'].includes(c.place)&&Math.abs(c.x+6)<1.8&&c.z>19.35&&c.z<27.5))return;if(s.carry?.id!=null&&s.crates[s.carry.id]?.place==='carried'&&Math.abs(s.player.x+6)<2&&s.player.z>19.1)return;if(Math.abs(s.player.x+6)<2.1&&s.player.z>19.1&&s.player.z<30)return;advance('closing');g.sound('truckAir',{pos:f});}return;}
 if(f.phase==='opening'){if(rearOccupied(s)){if(!f.blocked)g.notice('尾门下方有人，请退回仓库内，等尾门和踏板完全展开。');f.blocked=true;return;}f.blocked=false;f.time+=dt;f.open=smooth(f.time/2.6);if(f.time>=2.6){advance('ready');f.open=1;g.notice('货车已停稳，尾门与踏板已放下。可签单卸货。');}return;}
 if(f.phase==='closing'){if(rearOccupied(s)||s.crates.some(c=>['floor','warehouse'].includes(c.place)&&Math.abs(c.x+6)<2&&c.z>19.3)||Math.abs(s.player.x+6)<2.1&&s.player.z>19.1&&s.player.z<30){g.notice('司机在等卸货区域清空。');return;}f.time+=dt;f.open=1-smooth(f.time/2.6);if(f.time>=2.6){f.open=0;advance('depart');g.sound('engineStart',{pos:f});}return;}
 const total=f.phase==='approach'?9:f.phase==='reverse'?10:14,next=Math.min(total,f.time+dt),u=smooth(next/total);let p;
 if(f.phase==='approach')p=curve(u,[[35,30],[15,30],[-6,22],[-6,31]]);
 else if(f.phase==='reverse')p={...FREIGHT_PARK,z:31-(31-FREIGHT_PARK.z)*u};
 else{p=next<7?{x:-6,z:24.05+(31-24.05)*smooth(next/7),yaw:0}:curve(smooth((next-7)/7),[[-6,31],[-6,35],[17,30.5],[38,30]]);}
 if(blocked(s,p)){if(!f.blocked)g.notice('货车等待通道清空，请离开车道。');f.blocked=true;return;}f.blocked=false;f.time=next;Object.assign(f,p);recordFreightTracks(s);
 if(next===total){if(f.phase==='approach')advance('reverse');else if(f.phase==='reverse'){advance('opening');g.sound('truckAir',{pos:f});}else advance('gone');}
}
