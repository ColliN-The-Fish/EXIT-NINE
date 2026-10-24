import {homeSequence,endingFade} from './epilogue-director.js';
import {handoverFade} from './handover-director.js';
import * as T from './vendor/three.module.js';
import {STORY_SCRIPTS} from './story-data.js';
export const filmEase=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function handoffFade(t){return t<.32?filmEase(t/.32):1-filmEase((t-.32)/.48);}
// Blend a nearby eyeline; use a short shutter fade for distant camera returns.
// This avoids flying through furniture when a cinematic ends across the shop.
export function updateCinematicBlend(w,s,dt){
 const q=s.narrative?.sequence,l=q&&STORY_SCRIPTS[q.key]?.[Math.max(0,q.index)],key=q?.key||null,black=l?.shot==='black',camera=w.camera;
 let c=w.cinematicBlend;if(!c)c=w.cinematicBlend={key,last:camera.position.clone(),rotation:camera.quaternion.clone(),fov:camera.fov,black:false};
 const elapsed=s.paused?0:Math.max(0,dt);
 if(c.key&&!key&&!c.black&&!s.finished){const distance=c.last.distanceTo(camera.position);c.returning={time:0,fade:distance>1.1||!w.segmentFree(c.last,camera.position,s,.10),from:c.last.clone(),rotation:c.rotation.clone(),fov:c.fov};}
 if(key)c.returning=null;
 let opacity=0;w.controlTransition=false;
 if(black){const hold=l.hold||4.5;if(['transition2','transition3'].includes(q.key)){opacity=handoverFade(q,hold);}else opacity=1-filmEase((q.elapsed-(hold-.9))/.9);}
 if(q&&(homeSequence(q.key)||q.key==='coda'))opacity=endingFade(q,l.hold||4.5);
 const r=c.returning;
 if(r){w.hands.visible=false;r.time+=elapsed;const u=Math.min(1,r.time/.8);w.controlTransition=u<1;
  if(r.fade){opacity=handoffFade(r.time);if(r.time<.32){camera.position.copy(r.from);camera.quaternion.copy(r.rotation);camera.fov=r.fov;}}
  else{const blend=filmEase(u);camera.position.lerpVectors(r.from,camera.position.clone(),blend);camera.quaternion.slerpQuaternions(r.rotation,camera.quaternion.clone(),blend);camera.fov=T.MathUtils.lerp(r.fov,camera.fov,blend);}
  if(u>=1)c.returning=null;
 }
 let veil=w.cinematicVeil;if(!veil){veil=document.createElement('div');veil.id='cinematic-veil';veil.setAttribute('aria-hidden','true');document.body.append(veil);w.cinematicVeil=veil;}
 veil.style.opacity=String(Math.max(0,Math.min(1,opacity)));document.body.classList.toggle('control-handoff',w.controlTransition);
 camera.updateProjectionMatrix();c.key=key;c.black=black;c.last.copy(camera.position);c.rotation.copy(camera.quaternion);c.fov=camera.fov;
}
