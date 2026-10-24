import * as T from './vendor/three.module.js';
export const clamp=x=>Math.max(0,Math.min(1,x));
export const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export const LANDING_POSITION=[6.2,2.15,-13.7];
export const LANDING_TARGET=[-1.8,1.65,1.6];
const UP=new T.Vector3(0,1,0);
function look(position,target){return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(position,target,UP));}
export function terminalPose(mesh,aspect){
 mesh.updateWorldMatrix(true,false);
 const centre=mesh.getWorldPosition(new T.Vector3()),rotation=mesh.getWorldQuaternion(new T.Quaternion());
 const normal=new T.Vector3(0,0,1).applyQuaternion(rotation),right=new T.Vector3(1,0,0).applyQuaternion(rotation);
 const position=centre.clone().addScaledVector(normal,.88*Math.max(1,1.2/aspect)).addScaledVector(right,.07);position.y+=.12;
 return {position,rotation:look(position,centre),fov:42,centre};
}
// One uninterrupted arc through the facade glass. No doorway detour, staged
// look targets or locally retimed turns: position and rotation share one clock.
export function buildMenuJourney(mesh,aspect){
 const end=terminalPose(mesh,aspect),start=new T.Vector3(...LANDING_POSITION);
 const controls=[LANDING_POSITION,[-.8,2.05,-11.7],[-10.5,1.70,-6.0],end.position.toArray()];
 const curve=new T.CubicBezierCurve3(...controls.map(v=>new T.Vector3(...v)));curve.arcLengthDivisions=1600;curve.updateArcLengths();
 const startRotation=look(start,new T.Vector3(...LANDING_TARGET)),seconds=2.0,samples=[];
 for(let i=0;i<=1000;i++){
  const u=i/1000,position=curve.getPointAt(u),rotation=startRotation.clone().slerp(end.rotation,smooth(u));
  samples.push({position,rotation,fov:71-29*smooth(u),seconds:u*seconds,u});
 }
 return {samples,seconds,end,length:curve.getLength(),controls};
}
// Smooth acceleration/deceleration while retaining a steady middle section.
function clock(t){const a=.14,b=.22,v=1/(1-(a+b)/2);t=clamp(t);if(t<a)return v*(t/2-a*Math.sin(Math.PI*t/a)/(2*Math.PI));if(t<=1-b)return v*(t-a/2);const q=t-(1-b);return v*(1-b-a/2+q/2+b*Math.sin(Math.PI*q/b)/(2*Math.PI));}
export function menuJourneyPose(route,elapsed,reverse=false){
 const fraction=clock(clamp(elapsed/route.seconds)),at=(reverse?1-fraction:fraction)*route.seconds,list=route.samples;
 let lo=0,hi=list.length-1;while(lo+1<hi){const m=(lo+hi)>>1;if(list[m].seconds<at)lo=m;else hi=m;}
 const a=list[lo],b=list[hi],u=clamp((at-a.seconds)/Math.max(.000001,b.seconds-a.seconds));
 return {position:a.position.clone().lerp(b.position,u),rotation:a.rotation.clone().slerp(b.rotation,u),fov:T.MathUtils.lerp(a.fov,b.fov,u),fraction};
}
