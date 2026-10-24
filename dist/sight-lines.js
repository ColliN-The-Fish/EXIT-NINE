import {circleHitsBox} from './spatial.js';
// Collision footprints still stop feet. Eyes can see above low solid furniture.
export function clearSight(a,b,{bounds,solids=[],blockers=[]}={}){
 const distance=Math.hypot(a.x-b.x,a.z-b.z);if(distance>12)return false;
 const steps=Math.ceil(distance/.15),fromY=a.y??1.45,toY=b.y??1.45;
 for(let i=1;i<steps;i++){const u=i/steps,x=a.x+(b.x-a.x)*u,z=a.z+(b.z-a.z)*u,y=fromY+(toY-fromY)*u;
  if(bounds&&(x<bounds.x0||x>bounds.x1||z<bounds.z0||z>bounds.z1))return false;
  for(const q of solids){if(q.sightTop!=null&&(y>q.sightTop+.015||y<q.sightBottom-.015))continue;if(Math.abs(x-q.x)<q.w/2+.015&&Math.abs(z-q.z)<q.d/2+.015)return false;}
  if(blockers.some(q=>circleHitsBox(x,z,.015,q)))return false;
 }
 return true;
}
