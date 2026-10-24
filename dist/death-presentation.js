import {fatalPresentationActive,clearFatalPresentation} from './death-state.js';
import * as T from './vendor/three.module.js';
import {makeCreature,animateCreature} from './characters.js';
import {filmEase} from './cinematic-blend.js';
export function fatalImpulse(t){const hit=Math.exp(-Math.max(0,t-.16)*2.2),pulse=t<.16?.28:1;return {x:(Math.sin(t*113)+Math.sin(t*57)*.45)*16*hit*pulse,y:(Math.cos(t*97)+Math.sin(t*43)*.4)*13*hit*pulse,roll:Math.sin(t*71)*1.7*hit*pulse};}
export function prepareFatalCreature(w,parent=w.scene){if(!w.fatalCreature){w.fatalCreature=makeCreature(parent,w.a,0,{id:'milo',night:3,formId:'crooked',human:false,camouflage:'leaky',revealStyle:'flesh'});fatalMaterial(w.fatalCreature.revealFace.material);w.fatalCreature.g.traverse(o=>{if(o.isMesh)o.castShadow=false;});}return w.fatalCreature;}
export function updateDeathPresentation(w,s){
 const d=s.deathCinematic,active=fatalPresentationActive(s);document.body.classList.toggle('fatal-scene',active);w.retro.material.uniforms.fatal.value=active?1:0;
 if(!active){clearFatalPresentation(w,document.body);return;}
 prepareFatalCreature(w);if(w.fatalCreature.g.parent!==w.scene)w.scene.add(w.fatalCreature.g);
 const c=w.fatalCreature,t=d.elapsed,shake=fatalImpulse(t);document.body.style.setProperty('--fatal-x',shake.x+'px');document.body.style.setProperty('--fatal-y',shake.y+'px');document.body.style.setProperty('--fatal-roll',shake.roll+'deg');const u=filmEase(t/.23),forward=new T.Vector3(0,0,-1).applyQuaternion(w.camera.quaternion),desired=w.camera.position.clone().addScaledVector(forward,1.45-1.10*u);
 c.g.visible=true;animateCreature(c,{x:s.player.x,z:s.player.z,yaw:s.player.yaw,mode:'chase',hp:2,stun:0},s,0);c.g.quaternion.copy(w.camera.quaternion);c.head.rotation.z=-.20+Math.sin(t*43)*.065*Math.exp(-t*1.1);c.head.rotation.x=-.04+Math.sin(t*31)*.035;c.head.scale.copy(c.headScale);c.head.scale.y*=1.035;c.head.scale.x*=1.02;c.skinChange.visible=false;c.sockets.visible=false;c.revealFace.material.color.setHex(0x7f8879);c.g.updateMatrixWorld(true);
 const face=c.head.getWorldPosition(new T.Vector3());c.g.position.add(desired.sub(face));c.g.updateMatrixWorld(true);
 w.camera.rotateZ(Math.sin(t*23)*.018*Math.exp(-t*2));w.camera.fov=71-13*u;w.camera.updateProjectionMatrix();w.hands.visible=false;
 w.flash.position.copy(w.camera.position);w.flash.target.position.copy(w.camera.position.clone().addScaledVector(forward,2));w.flash.intensity=5;w.flashFill.intensity=.12;
 if(!w.fatalVeil){const v=document.createElement('div');v.id='fatal-veil';v.setAttribute('aria-hidden','true');document.body.append(v);w.fatalVeil=v;}
 w.fatalVeil.style.opacity=String(filmEase((t-1.45)/.75));
}

// A soft, recessed socket belongs to the skin surface, not a round eye plate.
function fatalMaterial(material){material.onBeforeCompile=shader=>{shader.vertexShader='varying vec3 fatalPoint;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfatalPoint=position;');shader.fragmentShader='varying vec3 fatalPoint;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`vec2 eyeA=(fatalPoint.xy-vec2(-.031,.039))/vec2(.022,.016);
vec2 eyeB=(fatalPoint.xy-vec2(.031,.039))/vec2(.022,.016);
float shadow=smoothstep(.18,.74,max(exp(-dot(eyeA,eyeA)*1.5),exp(-dot(eyeB,eyeB)*1.5)))*smoothstep(.015,.045,fatalPoint.z);
outgoingLight=mix(outgoingLight,vec3(.0015,.002,.0015),shadow*.985);
vec2 mouth=(fatalPoint.xy-vec2(.004,-.063))/vec2(.019,.014);
float cavity=exp(-dot(mouth,mouth)*2.4)*smoothstep(.015,.045,fatalPoint.z);
outgoingLight=mix(outgoingLight,vec3(.004,.001,.001),smoothstep(.26,.84,cavity)*.55);
#include <opaque_fragment>`);};material.customProgramCacheKey=()=> 'fatal-sockets-mouth-v2';material.needsUpdate=true;}
