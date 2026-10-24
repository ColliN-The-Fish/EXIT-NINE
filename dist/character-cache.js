import * as T from './vendor/three.module.js';
import {makePerson,makeCreature} from './characters.js';
import {updateRevealFace} from './human-model.js';
import {prepareFatalCreature} from './death-presentation.js';
import {CUSTOMERS} from './data.js';
export const SIEGE_CAST=[['wade','stalker'],['rowan','folded'],['milo','jawbound'],['cal','backturned'],['june','withered'],['wade','reacher']];
export {modelAttached} from './model-visibility.js';
// Construction and shader compilation belong to loading, never a chase or hit.
// Inactive rigs stay detached so the scene does not update thousands of hidden joints.
export function installCharacterCache(w){const staging=new T.Scene(),models=[];staging.name='character-warmup';
 for(const id of [...CUSTOMERS.map(c=>c.id),'story-worker']){const m=makePerson(staging,w.a,id);w.people[id]=m;models.push(m);}
 SIEGE_CAST.forEach(([id,formId],i)=>{const source={...CUSTOMERS.find(c=>c.id===id),formId,night:3},m=makeCreature(staging,w.a,i,source);m.g.traverse(o=>{if(o.isMesh){o.userData.actor=null;o.userData.threat='wave-'+i;}});w.monsters['wave-'+i]=m;models.push(m);});
 w.storyReplay=makePerson(staging,w.a,'cinematic-player');w.storySelf=makePerson(staging,w.a,'cinematic-player');w.storyCreature=makeCreature(staging,w.a,2,{id:'rowan',night:2,camouflage:'leaky',revealStyle:'flesh',anomaly:'joint'});models.push(w.storyReplay,w.storySelf,w.storyCreature);
 const fatal=prepareFatalCreature(w,staging);models.push(fatal);w.characterWarmup={ready:false,count:models.length,error:null};
 const compile=(root=staging)=>{const previous=w.renderer.getRenderTarget();w.renderer.setRenderTarget(w.retro.target);try{return w.renderer.compileAsync?.(root,w.camera,w.scene)||Promise.resolve();}finally{w.renderer.setRenderTarget(previous);}};
 // Both partial disguise and fully exposed faces have a different opaque shader.
 let pending;try{const first=compile(),staticPrograms=compile(w.scene);for(const m of models)if(m.revealFace)updateRevealFace(m,1,0);const second=compile();for(const m of models)if(m.revealFace)updateRevealFace(m,.25,0);const third=compile();pending=Promise.all([first,second,third,staticPrograms]);}catch(e){pending=Promise.reject(e);}
 staging.traverse(o=>{for(const material of Array.isArray(o.material)?o.material:[o.material])if(material)for(const value of Object.values(material))if(value?.isTexture)w.renderer.initTexture(value);});
 // Use the same fixed light/shadow layout and render-target colour space as gameplay.
 staging.fog=w.scene.fog.clone();w.scene.traverseVisible(o=>{if(o.isLight){const light=o.clone();staging.add(light);if(light.isSpotLight){light.target=o.target.clone();light.position.set(0,3,3);light.target.position.set(0,1.2,0);staging.add(light.target);}}});
 w.characterWarmup.promise=pending.then(()=>{const renderer=w.renderer,previous=renderer.getRenderTarget(),shadowUpdate=renderer.shadowMap.needsUpdate,target=new T.WebGLRenderTarget(8,8),camera=new T.PerspectiveCamera(71,1,.05,15);camera.position.set(0,1.5,4);camera.lookAt(0,1.1,0);renderer.setRenderTarget(target);renderer.shadowMap.needsUpdate=true;
  try{for(const m of models)staging.add(m.g);for(const amount of [0,.25,1]){for(const m of models){m.g.visible=true;if(m.revealFace)updateRevealFace(m,amount,0);}renderer.render(staging,camera);}renderer.render(w.endingRoom.scene,camera);}
  finally{renderer.setRenderTarget(previous);renderer.shadowMap.needsUpdate=shadowUpdate;target.dispose();for(const m of models){m.g.removeFromParent();m.g.visible=false;}}
  w.characterWarmup.ready=true;
 },error=>{for(const m of models){m.g.removeFromParent();m.g.visible=false;}w.characterWarmup.error=String(error);w.characterWarmup.ready=true;});
}
