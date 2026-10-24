import * as T from './vendor/three.module.js';
import {person} from './night-data.js';
// Stay at the player's feet: a gentle lens/eyeline change, never a teleport.
// Mouse offsets remain relative to the initial look, allowing hands to be watched.
export function updateDialogueCamera(w,s,interaction,dt){
 const id=interaction.actorId,a=s.actors?.find(a=>a.id===id);
 if(!a||s.narrative?.sequence||w.device){w.dialogueShot=null;document.body.classList.remove('dialogue-film');return;}
 if(w.dialogueShot?.id!==id)w.dialogueShot={id,yaw:s.player.yaw,pitch:s.player.pitch,mix:0};
 const shot=w.dialogueShot;if(!s.paused)shot.mix=T.MathUtils.damp(shot.mix,1,5,dt||.016);
 const c=person(s,id),distance=Math.hypot(s.player.x-a.x,s.player.z-a.z),height=parseFloat(c?.height||'180')/180;
 const aim=new T.Vector3(a.x,1.38*height,a.z),q=w.camera.quaternion.clone();w.camera.lookAt(aim);
 const offset=new T.Quaternion().setFromEuler(new T.Euler(Math.max(-.3,Math.min(.3,s.player.pitch-shot.pitch)),Math.max(-.45,Math.min(.45,s.player.yaw-shot.yaw)),0,'YXZ'));
 w.camera.quaternion.multiply(offset);const framed=w.camera.quaternion.clone();w.camera.quaternion.slerpQuaternions(q,framed,shot.mix);
 const fov=T.MathUtils.clamp(2*Math.atan(1.13/Math.max(.8,distance))*180/Math.PI,50,70);w.camera.fov=T.MathUtils.lerp(71,fov,shot.mix);w.camera.updateProjectionMatrix();w.hands.visible=false;document.body.classList.add('dialogue-film');
}
