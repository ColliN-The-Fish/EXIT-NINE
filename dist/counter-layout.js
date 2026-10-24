export const COUNTER={x:-8.65,z:-1.5,angle:-Math.PI/2,lower:.12};
export function counterPoint(x,y,z){return{x:COUNTER.x-(z+1.9),y:y-COUNTER.lower,z:COUNTER.z+(x+8)};}
export function counterXZ(p){const q=counterPoint(p.x,0,p.z);return{x:q.x,z:q.z};}
export function counterPlayer(p){return{...p,...counterXZ(p),yaw:(p.yaw||0)+COUNTER.angle};}
export function atCounterTarget(id,key){return ['phone','torch','binocularPickup','scannerPickup','gun','securityDrawer','doorKey','doorControl','register','drawer','tender','receipt','cashReset','terminal','idTray'].includes(id)||id==='storyItem'&&Number(key)===1;}
export const CHECKOUT_LINE=[{x:-7.5,z:-3.3},{x:-5.6,z:-3.5},{x:-4.1,z:-3.5}].map(counterXZ);
