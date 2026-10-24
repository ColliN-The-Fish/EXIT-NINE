import {mimicForm,headTwitch} from './mimic-forms.js';
import {animateHuman,setLegPose,groundedBodyHeight} from './person-animation.js';
import {gaitProfile,solveArm,stepMotion,damp,smooth,groundLevel} from './locomotion.js';
import {anomalyPose} from './motion.js';
import {person} from './night-data.js';
import * as T from './vendor/three.module.js';
import {CUSTOMERS} from './data.js';
import {worldUV,decal} from './materials.js';
import {createHuman,installRevealFace,updateRevealFace} from './human-model.js';
import {perfectDisguise,revealStyle} from './mimicry.js';

function mesh(parent,geometry,material,x=0,y=0,z=0){const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(parent,m,x,y,z,w,h,d){return mesh(parent,new T.BoxGeometry(w,h,d),m,x,y,z);}
function sphere(parent,m,x,y,z,r,sx=1,sy=1,sz=1){const o=mesh(parent,new T.SphereGeometry(r,8,6),m,x,y,z);o.scale.set(sx,sy,sz);return o;}
function cylinder(parent,m,x,y,z,r1,r2,h,n=8){return mesh(parent,new T.CylinderGeometry(r1,r2,h,n),m,x,y,z);}
function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g;}
function panel(parent,m,points){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));geo.setIndex([0,1,2,0,2,3]);geo.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));geo.computeVertexNormals();return mesh(parent,geo,m);}
function packageMaterial(a,kind,color){return new T.MeshStandardMaterial({map:a.package(kind,color),roughness:.85,flatShading:true});}

export function makePerson(scene,a,character){return createHuman(scene,a,character);}
export function animatePerson(m,a,s,dt){animateHuman(m,a,s,dt);}

export function makeCar(scene,a,x,z,color,plate){
 const g=group(scene,x,0,z),paint=a.plain(color,.33,.42),steel=a.plain(0x6a777b,.4,.7),rubber=a.plain(0x171e23),glass=new T.MeshStandardMaterial({color:0x182b34,roughness:.23,metalness:.52,flatShading:true,side:T.DoubleSide});
 // A six-sided, sloped saloon profile rather than a stack of boxes.
 const cross=[[-.94,.48],[.94,.48],[.99,.79],[.84,1.0],[-.84,1.0],[-.99,.79]],geo=new T.BufferGeometry(),positions=[],indices=[];
 for(const zz of [-2.10,2.10])for(const[xx,yy]of cross)positions.push(xx,yy,zz);for(let i=0;i<6;i++){const j=(i+1)%6;indices.push(i,j,j+6,i,j+6,i+6);}indices.push(0,2,1,0,3,2,0,4,3,0,5,4,6,7,8,6,8,9,6,9,10,6,10,11);geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(g,geo,paint);
 box(g,paint,0,1.04,0,1.67,.16,2.35);box(g,paint,0,1.5,.15,1.43,.10,1.18);
 panel(g,glass,[[-.82,1.1,-1.14],[.82,1.1,-1.14],[.69,1.47,-.47],[-.69,1.47,-.47]]);
 panel(g,glass,[[.82,1.1,1.19],[-.82,1.1,1.19],[-.69,1.47,.76],[.69,1.47,.76]]);
 for(const sign of [-1,1]){panel(g,glass,[[sign*.83,1.09,-1.08],[sign*.83,1.09,1.13],[sign*.70,1.47,.74],[sign*.70,1.47,-.44]]);box(g,paint,sign*.81,1.31,.14,.034,.37,.055);box(g,steel,sign*.89,.98,.2,.04,.025,.20);box(g,paint,sign*1.02,1.14,-.81,.15,.10,.21);for(const zz of [-1.4,1.4]){const tyre=cylinder(g,rubber,sign*.94,.4,zz,.35,.35,.19,12);tyre.rotation.z=Math.PI/2;const hub=cylinder(g,steel,sign*1.042,.4,zz,.19,.19,.012,8);hub.rotation.z=Math.PI/2;}box(g,a.glow(0x7e877b,.15,false),sign*.63,.81,-2.12,.43,.16,.025);box(g,a.plain(0x712f28),sign*.65,.82,2.12,.4,.15,.025);}
 box(g,steel,0,.53,-2.14,1.76,.10,.09);box(g,steel,0,.53,2.14,1.76,.10,.09);box(g,rubber,0,.76,-2.12,.5,.17,.02);
 decal(g,a.sign(plate,{bg:'#d0c6a2',fg:'#24312c',accent:'#253c34',size:128}),0,.65,-2.192,.60,.17,[0,Math.PI,0]);
 decal(g,a.sign(plate,{bg:'#c2b697',fg:'#23312a',size:128}),0,.65,2.192,.60,.17);
 return g;
}

export function shelfProducts(a,shelf,chunk){
 const g=new T.Group(),x=[-2,1.3,4.6][shelf],y=.55+(chunk%3)*.55,z=2.1+Math.floor(chunk/3)*1.1;
 const labels=[['PINE WATER','#658f98'],['TRAIL MIX','#aa6c3d'],['SOUP','#898450']][shelf],mat=packageMaterial(a,...labels),top=a.plain(shelf===0?0xb8c8c0:0x89968b,.5,.3);
 const baseGeo=shelf===0?new T.CylinderGeometry(.045,.060,.27,6):shelf===1?new T.BoxGeometry(.12,.28,.17):new T.CylinderGeometry(.074,.074,.20,8),capGeo=shelf===0?new T.CylinderGeometry(.035,.035,.035,6):new T.CylinderGeometry(.076,.076,.012,8),count=8;
 const row=new T.InstancedMesh(baseGeo,mat,count),caps=shelf===1?null:new T.InstancedMesh(capGeo,top,count);let i=0,m=new T.Matrix4();
 for(const sign of [-1,1])for(let j=0;j<4;j++){const xx=x+sign*.33,zz=z-.30+j*.20;m.makeTranslation(xx,y,zz);row.setMatrixAt(i,m);if(caps){m.makeTranslation(xx,y+(shelf===0?.15:.107),zz);caps.setMatrixAt(i,m);}i++;}
 row.castShadow=true;row.receiveShadow=true;row.userData.interaction={id:'shelf',shelf};g.add(row);if(caps){caps.castShadow=true;caps.userData.interaction={id:'shelf',shelf};g.add(caps);}return g;
}

export function dressCrate(a,m,c){
 m.material=a.get('paper',[0xc8bc98,0xbbb995,0xaab9b0][c.shelf]);
 const tape=a.plain(0xb79e65,.95),crease=a.plain(0x6f6247);
 box(m,tape,0,.329,0,.075,.008,.645);
 for(const sign of [-1,1]){box(m,tape,0,0,sign*.324,.075,.645,.006);box(m,crease,sign*.302,.318,0,.005,.006,.60);}
 decal(m,a.sign(['HALE','HANDLE WITH CARE'],{bg:'#a58e62',fg:'#394237',accent:'#695d45',size:128}),.324,-.02,0,.35,.20,[0,Math.PI/2,0]);
 m.traverse(o=>{if(o.isMesh)o.userData.crate=c.id;});
}

export function makeCreature(scene,a,variant=0,source=null){
 const id=source?.id||['wade','milo','rowan'][variant%3],m=createHuman(scene,a,id);m.item.visible=false;m.creature=true;m.form=mimicForm(source,variant);m.creatureVariant=m.form.id;m.disguisePerfect=perfectDisguise(source||{id,human:false});m.source=source;installRevealFace(m,a,revealStyle(source||{id}));m.headScale=m.head.scale.clone();m.torsoScale=m.torso.scale.clone();m.shoulderRest=m.arms.map(l=>l.arm.position.clone());
 m.g.traverse(o=>{if(o.isMesh&&o!==m.faceMesh&&o!==m.revealFace){o.material=o.material.clone();if(o.material.color)o.material.color.multiplyScalar(.89);}});
 // Distinct structural additions remain completely concealed on high mimics.
 const deform=group(m.upper),fold=a.get('cloth',0x555b4d,{flatShading:false});deform.visible=false;m.deform=deform;
 if(m.form.id==='folded'||m.form.id==='stalker')for(let n=0;n<5;n++){const rib=sphere(deform,fold,0,.29-n*.065,-.13,.058,.82,.50,1.3);rib.rotation.x=.3;}
 if(m.form.id==='jawbound'){const cavity=sphere(m.skinChange,a.plain(0x211e1b),0,-.105,.091,.026,.70,1.05,.11);cavity.rotation.z=.04;}
 if(m.form.id==='crooked')m.skinChange.rotation.z=.11;
 return m;
}
export function animateCreature(m,t,s,dt=.016){
 const dead=t.mode==='dead',snap=!m.motion||m.motion.actor!==t,elapsed=s.paused?0:Math.min(.1,Math.max(0,dt)),f=m.form,baseProfile=gaitProfile(m.variant),reveal=t.mode==='chase'||t.mode==='search'?1:(m.revealAmount||0),profile={...baseProfile,...Object.fromEntries(Object.entries(f.motion||{}).map(([key,v])=>[key,(baseProfile[key]??baseProfile.lift??.085)+(v-(baseProfile[key]??baseProfile.lift??.085))*reveal]))},time=s.time+profile.phase;
 if(dead){if(!m.deadPose){m.deadPose=true;m.g.position.set(t.x,.20,t.z);m.g.rotation.set(Math.PI/2,t.yaw,.13);}return;}m.deadPose=false;
 m.groundY=groundLevel(t.x,t.z,s);m.motion=stepMotion(m.motion,t,elapsed,profile);const motion=m.motion,walking=motion.blend,engaged=t.mode==='chase'||t.mode==='search',targetReveal=engaged?1:m.disguisePerfect?0:.24;
 m.revealAmount=snap?targetReveal:damp(m.revealAmount,targetReveal,2.8,elapsed);const r=m.revealAmount,phase=motion.phase,tw=headTwitch(f,time),blend=(a,b)=>a+(b-a)*r;
 m.g.position.set(t.x,groundedBodyHeight(m,phase,walking,profile,m.groundY-.075*walking+f.body*r),t.z);m.g.rotation.set(0,snap?t.yaw:motion.yaw,0);m.upper.position.set(f.id==='lopsided'?-.05*r:0,1.10,0);
 m.upper.rotation.set(f.chest[0]*r,f.chest[1]*r+Math.sin(phase)*.025*walking,f.chest[2]*r);const waistOffset=new T.Vector3(0,.30,0).applyEuler(m.upper.rotation);m.upper.position.set(waistOffset.x+(f.id==='lopsided'?-.05*r:0),.80+waistOffset.y,waistOffset.z);m.deform.visible=r>.78;
 m.torso.scale.set(m.torsoScale.x*blend(1,f.id==='withered'?.69:f.id==='reacher'?.89:1),blend(1,f.id==='withered'?1.08:f.id==='folded'?.92:1),blend(1,f.id==='hollow'?.84:1));
 m.head.scale.set(m.headScale.x*blend(1,f.head[0]),m.headScale.y*blend(1,f.head[1]),m.headScale.z*blend(1,f.head[2]));
 const slow=Math.sin(time*.7),jawLag=f.id==='crooked'?Math.sin(time*1.1)*.035:0;
 m.head.rotation.set(f.headPose[0]*r+tw.x*r,f.headPose[1]*r+tw.y*r+ (f.id==='hollow'?0:slow*.018*r),f.headPose[2]*r+tw.z*r+jawLag*r);
 m.head.position.y=m.headRest+f.neck*r;m.neck.position.y=m.neckRest+f.neck*r*.5;m.neck.scale.set(blend(1,f.id==='withered'?.78:1),1+f.neck*r/.10,1);
 m.arms.forEach(({arm,elbow,hand,fingers,thumb},i)=>{arm.position.copy(m.shoulderRest[i]);if(f.id==='withered')arm.position.x*=blend(1,.70);if(f.id==='lopsided')arm.position.y+=(i?.07:-.15)*r;const sign=i?1:-1,swing=Math.sin(phase+i*Math.PI)*profile.arm*walking,reach=f.id==='reacher'?-.48-.20*Math.sin(time*.53+i*.8):f.id==='stalker'?-1.90:f.id==='jawbound'?-.28:f.id==='folded'?-1.05:-.08;
  arm.rotation.order='YXZ';arm.rotation.set(-swing+reach*r,(f.id==='backturned'?(i?.35:-.45):f.id==='jawbound'?sign*-.58:0)*r,sign*(-.04+(f.id==='lopsided'?(i?-.20:.06):f.id==='jawbound'?.17:0)*r));
  elbow.scale.y=blend(1,f.arms[i]);elbow.rotation.set(-.15+((f.id==='jawbound'?-1.65:f.elbows[i])+.15)*r,0,(f.id==='watcher'&&!i?-.73:f.id==='backturned'&&i?.48:0)*r);
  hand.scale.set(blend(1,f.id==='reacher'?1.08:1),blend(1,['reacher','withered'].includes(f.id)?1.55:1),1);hand.rotation.set((i?.10:-.16)*r,0,(f.id==='jawbound'?sign*.28:0)*r);
  fingers?.forEach(({joint,tip,distal},j)=>{const flex=.27+Math.max(0,Math.sin(time*(f.id==='withered'?1.6:.65)+j*.9+i))*r*.65; joint.rotation.x=-flex;tip.rotation.x=-.32-flex*.6;distal.rotation.x=-.20-flex*.45;});if(thumb)thumb.rotation.x=-.2-r*.5;});
 // A pursuer opens its hands before reaching the player, then closes each
 // phalanx around the attempted grip; it does not keep its walking arm pose.
 const near=engaged&&!s.hidden?Math.hypot(t.x-s.player.x,t.z-s.player.z):99,attack=r*smooth((1.65-near)/.80);m.attackReach=attack;
 if(attack>.001){m.g.updateMatrixWorld(true);const target=m.upper.worldToLocal(new T.Vector3(s.player.x,1.48,s.player.z));m.arms.forEach(({arm,elbow,hand,fingers,thumb},i)=>{const dx=target.x-arm.position.x+(i?-.08:.08),dz=target.z-arm.position.z,dy=target.y-arm.position.y,ik=solveArm(dy,Math.hypot(dx,dz),.27,.313*elbow.scale.y);arm.rotation.order='YXZ';arm.rotation.x=blendArm(arm.rotation.x,ik.shoulder,attack);arm.rotation.y=blendArm(arm.rotation.y,Math.atan2(dx,dz),attack);arm.rotation.z*=1-attack;elbow.rotation.x=blendArm(elbow.rotation.x,ik.elbow,attack);elbow.rotation.z*=1-attack;hand.rotation.x=blendArm(hand.rotation.x,-ik.shoulder-ik.elbow-.12,attack);const close=smooth((1.15-near)/.30);fingers.forEach(({joint,tip,distal},j)=>{joint.rotation.x=blendArm(joint.rotation.x,-.12-close*(.8+j*.05),attack);tip.rotation.x=blendArm(tip.rotation.x,-.1-close*1.2,attack);distal.rotation.x=blendArm(distal.rotation.x,-.1-close*.7,attack);joint.rotation.z=(j-1.5)*.06*(1-close)*attack;});thumb.rotation.x=blendArm(thumb.rotation.x,-.22-close*.8,attack);});}
 setLegPose(m,phase,walking,m.g.position.y,profile,elapsed,snap);m.item.visible=false;const blink=Math.exp(-(((time%5.5-5.3)/.06)**2));m.eyes.visible=r<.1&&blink>.08;m.eyes.children.forEach(lid=>lid.scale.y=.12+blink*.78);m.features.visible=r<.85;updateRevealFace(m,r,time);
}

function blendArm(a,b,t){return a+(b-a)*t;}
