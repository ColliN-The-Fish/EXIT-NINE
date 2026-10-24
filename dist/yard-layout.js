import {circleHitsBox} from './spatial.js';
// A physically enclosed loading yard. No opening connects it to the breaker
// side passage: the player returns indoors and uses the shop's front entrance.
export const YARD_FENCES=[
 {x:-12.7,z:19,w:3.4,d:.18},
 {x:-14.3,z:25.2,w:.18,d:12.6},
 {x:11.1,z:19.65,w:.18,d:1.5},
 {x:16.75,z:20.35,w:11.5,d:.20},
 {x:21.5,z:23.25,w:.18,d:5.9}
];
export const FREIGHT_GATE={x:21.5,z:30.1,width:8,height:2.85};
export const REAR_VISITOR_START={x:19.5,z:28.5};
export function yardGateAmount(s){const f=s.freight;if(!f||f.phase==='gone')return 0;if(f.phase==='approach')return 1;if(f.phase==='depart')return 1;return 0;}
export function freightGateBoxes(s){const u=s.yardGateOpen??yardGateAmount(s),g=FREIGHT_GATE,half=g.width/2;return[-1,1].map(side=>({x:g.x-.14,z:g.z+side*(half/2+half*u),w:.16,d:half,angle:0}));}
// Each wheel leaves a continuous world-space ribbon, saved with the vehicle.
export function recordFreightTracks(s){const f=s.freight;if(!f||!['approach','reverse','depart'].includes(f.phase))return;const tracks=s.freightTracks??=([]),last=tracks.at(-1);if(last&&Math.hypot(f.x-last.x,f.z-last.z)<.40)return;tracks.push({x:f.x,z:f.z,yaw:f.yaw});if(tracks.length>420)tracks.shift();}

export function freightGateOccupied(s,amount){const boxes=freightGateBoxes({...s,yardGateOpen:amount}),positions=[s.player,...(s.actors||[]).filter(a=>a.mode!=='dead'),...(s.threats||[]).filter(a=>a.mode!=='dead'),...(s.crates||[]).filter(c=>['floor','warehouse'].includes(c.place))].filter(Boolean);return positions.some(p=>boxes.some(b=>circleHitsBox(p.x,p.z,p.place?.36:.28,b)));}
