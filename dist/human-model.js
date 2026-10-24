import * as T from './vendor/three.module.js';
import {NPC_SCALE} from './site-layout.js';
import {CUSTOMERS} from './data.js';

const atlas=new T.TextureLoader().load(new URL('./assets/character-atlas-v2.png',import.meta.url).href);
atlas.colorSpace=T.SRGBColorSpace;atlas.magFilter=T.LinearFilter;atlas.minFilter=T.LinearMipmapLinearFilter;atlas.anisotropy=4;
const faces=new T.TextureLoader().load(new URL('./assets/faces-v3.png',import.meta.url).href);faces.colorSpace=T.SRGBColorSpace;faces.magFilter=T.LinearFilter;faces.minFilter=T.LinearMipmapLinearFilter;faces.anisotropy=4;
const RECT={male:[.002,.502,.496,.496],female:[.502,.502,.496,.496],front:[.002,.002,.496,.496],back:[.502,.002,.496,.496],hair:[.06,.95,.12,.035],skin:[.07,.69,.03,.04],sleeve:[.68,.12,.12,.30]};
const group=(p,x=0,y=0,z=0)=>{const g=new T.Group();g.position.set(x,y,z);p.add(g);return g;};
function mesh(p,geo,mat,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;p.add(m);return m;}
const box=(p,m,x,y,z,w,h,d)=>mesh(p,new T.BoxGeometry(w,h,d),m,x,y,z);
const ellipsoid=(p,m,x,y,z,r,sx=1,sy=1,sz=1)=>{const o=mesh(p,new T.SphereGeometry(r,12,8),m,x,y,z);o.scale.set(sx,sy,sz);return o;};
const cylinder=(p,m,x,y,z,rt,rb,h,n=12)=>mesh(p,new T.CylinderGeometry(rt,rb,h,n),m,x,y,z);
const uv=(rect,u,v)=>[rect[0]+u*rect[2],rect[1]+v*rect[3]];

// Shared ring vertices form a continuous surface; the face has real depth rather
// than a flat portrait card. UVs use the generated atlas without altering it.
function loft(rings,{front=RECT.front,back=RECT.back,head=false,headHair=RECT.hair,headSkin=RECT.skin}={}){
 const vertices=[],tex=[],indices=[],N=head?48:24,min=rings[0][0],max=rings.at(-1)[0];
 for(let row=0;row<rings.length;row++){
  const [y,rx,rz]=rings[row];
  for(let j=0;j<=N;j++){
   const t=-Math.PI/2+j*Math.PI*2/N,x=Math.sin(t)*rx,cos=Math.cos(t);let z=cos*rz;
   if(head&&cos>0){
    const nose=Math.exp(-((x/.012)**2))*Math.exp(-(((y+.006)/.033)**2))*.031;
    const bridge=Math.exp(-((x/.010)**2))*Math.exp(-(((y-.027)/.038)**2))*.012;
    const cheeks=Math.exp(-(((Math.abs(x)-.048)/.021)**2))*Math.exp(-(((y+.004)/.027)**2))*.006;
    const chin=Math.exp(-((x/.028)**2))*Math.exp(-(((y+.091)/.018)**2))*.006;
    const eyeSocket=Math.exp(-(((Math.abs(x)-.031)/.016)**2))*Math.exp(-(((y-.035)/.014)**2))*.006;
    const lip=Math.exp(-((x/.027)**2))*Math.exp(-(((y+.058)/.012)**2))*.005;
    z+=nose+bridge+cheeks+chin-eyeSocket+lip;
   }
   vertices.push(x,y,z);let rect=cos>=0?front:back;
   if(head&&cos<0)rect=y<-.065?headSkin:headHair;
   const u=cos>=0?(x/rx+1)/2:(1-x/rx)/2,v=(y-min)/(max-min);tex.push(...uv(rect,u,v));
   if(row<rings.length-1&&j<N){const k=row*(N+1)+j;indices.push(k,k+1,k+N+2,k,k+N+2,k+N+1);}
  }
 }
 for(const end of [0,rings.length-1]){const base=end*(N+1),center=vertices.length/3;vertices.push(0,rings[end][0],0);tex.push(...uv(front,.5,end?1:0));for(let j=0;j<N;j++)if(end)indices.push(center,base+j,base+j+1);else indices.push(center,base+j+1,base+j);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(tex,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
function mapped(geo,rect){const u=geo.attributes.uv;for(let i=0;i<u.count;i++){const p=uv(rect,u.getX(i),u.getY(i));u.setXY(i,...p);}return geo;}
function fabric(a,color=0xffffff){return new T.MeshStandardMaterial({map:atlas,color,roughness:.94,metalness:0,flatShading:false});}
function sleeveGeo(length,r1,r2){return loft([[-length,r2,r2*.92],[-length*.76,r2*1.02,r2],[-length*.38,r1*1.05,r1*.95],[0,r1,r1*.94]],{front:RECT.sleeve,back:RECT.sleeve});}

export function createHuman(scene,a,character){
 const c=CUSTOMERS.find(v=>v.id===character),id=c?.model||character,female=c?.gender==='女'||['june','nora'].includes(character)||id==='martha';
 const palette={june:0xffaa68,nora:0x8cafd2,wade:0xb2bbb0,reed:0xb2bbb0,rowan:0xc7bf86,milo:0x899395,leon:0xc59585,edith:0x9aa69a,owen:0xa3bb8a,ruth:0x788daf,cal:0xa28c66};
 const variants={june:[1.12,.94,1.08,0xc3a28b,0x624333],wade:[1.08,.98,.98,0xad9b86,0x252a25],nora:[1,1,.91,0xaf8b6d,0x292925],rowan:[1.14,.97,1.16,0xbaa58e,0x786344],leon:[1.18,.96,1.11,0x8a624b,0x262923],milo:[1.04,1.0,.91,0xad9987,0x252925]};
 variants.edith=[1.0,.98,.93,0xb19a81,0x6c6c63];variants.owen=[1.04,1.0,.96,0xb19d83,0x43382d];variants.ruth=[1.03,.98,1.0,0xb09d86,0x39392c];variants.cal=[1.14,.97,1.13,0xa78e72,0x34352b];const profile=variants[character]||variants.wade,index=c?.portraitIndex??Math.max(0,CUSTOMERS.findIndex(v=>v.id===character))%6,faceRect=[(index%3)/3+.002,index<3?.502:.002,1/3-.004,.496],portrait=new T.MeshStandardMaterial({map:faces,roughness:1});
 const cloth=fabric(a,palette[character]||0xa5aaa3),face=fabric(a),skin=new T.MeshStandardMaterial({color:profile[3],map:a.map('skin'),roughness:1,flatShading:false}),dark=a.plain(0x292b29),steel=a.plain(0x7c796b,.65,.25),trousers=a.get('cloth',0x383c3b,{flatShading:false});
 const g=group(scene),upper=group(g,0,1.10,0),torso=group(upper);
 mesh(torso,loft([[-.33,.178,.108],[-.15,.19,.124],[.08,.211,.127],[.25,.215,.111],[.30,.238,.102],[.345,.233,.090],[.385,.14,.066],[.42,.072,.055]]),cloth);
 torso.scale.x=profile[2];
 const hips=mesh(g,loft([[.71,.172,.102],[.82,.179,.11]],{front:RECT.sleeve,back:RECT.sleeve}),trousers);
 const neck=mesh(upper,mapped(new T.CylinderGeometry(.045,.051,.10,16),RECT.skin),skin,0,.435,0);const head=group(upper,0,.57,.005);head.scale.set(profile[0],profile[1],1);
 const faceRings=[[-.118,.032,.041],[-.101,.047,.055],[-.080,.060,.060],[-.057,.065,.066],[-.030,.071,.067],[-.012,.074,.067],[.015,.077,.067],[.039,.078,.066],[.060,.080,.064],[.090,.080,.059],[.118,.073,.051],[.14,.052,.037],[.149,.019,.014]];
 for(const y of [-.094,-.068,-.049,-.022,0,.027,.049,.075]){let i=faceRings.findIndex(r=>r[0]>y),a0=faceRings[i-1],b0=faceRings[i],f=(y-a0[0])/(b0[0]-a0[0]);faceRings.splice(i,0,[y,a0[1]+(b0[1]-a0[1])*f,a0[2]+(b0[2]-a0[2])*f]);}
 const faceMesh=mesh(head,loft(faceRings,{front:faceRect,back:faceRect,head:true,headHair:[faceRect[0]+.04,faceRect[1]+.46,.05,.025],headSkin:[faceRect[0]+.04,faceRect[1]+.05,.02,.035]}),portrait);
 const horror=group(head,0,-.06,.075),mouth=ellipsoid(horror,a.plain(0x1b1212),0,0,0,.026,1.25,.75,.16);
 for(let tooth=0;tooth<7;tooth++)box(horror,a.plain(0xc2b69b),(tooth-3)*.007,.014,.006,.004,.014,.004);horror.visible=false;
 const sockets=group(head);for(const sign of [-1,1])ellipsoid(sockets,a.plain(0x131513),sign*.030,.034,.069,.019,1.17,.72,.14);sockets.visible=false;
 const hairMat=a.get('cloth',profile[4],{flatShading:false});if(!female&&character!=='leon'){const cap=mesh(head,new T.SphereGeometry(.082,16,8,0,Math.PI*2,0,Math.PI*.46),hairMat,0,.088,-.008);cap.scale.set(1.04,.95,1.04);}
 for(const sign of [-1,1]){const ear=ellipsoid(head,skin,sign*.081,-.003,-.003,.018,.38,1.5,.8);ear.rotation.z=sign*.07;ellipsoid(head,a.plain(0x806a59),sign*.085,-.002,.007,.008,.3,1.2,.7);}
 // Thin eyelid covers appear only during a blink; all other facial detail is UV texture.
 const eyes=group(head,0,.039,0);for(const sign of [-1,1]){const lid=mesh(eyes,new T.SphereGeometry(.018,10,5),skin,sign*.030,0,.064);lid.scale.set(1,.28,.11);}eyes.visible=false;
 if(female){const hair=a.get('cloth',profile[4],{flatShading:false});ellipsoid(head,hair,0,.035,-.055,.071,1.04,1.5,.75);if(character==='june')ellipsoid(head,hair,-.04,-.07,-.072,.032,.75,1.5,.85);}
 // Small inset eyes sit beneath the UV eyelids. Their wet highlights respond to
 // light; nostrils and ear folds stay millimetric rather than drawn-on circles.
 const features=group(head),eyeSurfaces=[],eyeMat=new T.MeshPhysicalMaterial({color:0xb5ad91,transparent:true,opacity:.16,depthWrite:false,roughness:.18,clearcoat:.75,clearcoatRoughness:.18});
 for(const sign of [-1,1]){const e=ellipsoid(features,eyeMat,sign*.0305,.038,.0658,.009,.98,.30,.27);eyeSurfaces.push(e);ellipsoid(features,a.plain(0x594b3c),sign*.009,-.025,.089,.0039,1,.38,.25);}
 const arms=[],legs=[];
 for(const sign of [-1,1]){
  const arm=group(upper,sign*.19*profile[2],.29,0);mesh(arm,sleeveGeo(.27,.073,.060),cloth);
  const elbow=group(arm,0,-.27,0);mesh(elbow,sleeveGeo(.268,.060,.044),cloth);cylinder(elbow,dark,0,-.266,0,.044,.042,.025);
  const hand=group(elbow,0,-.313,.008);ellipsoid(hand,skin,0,0,0,.034,.80,1.35,.45);
  const fingers=[];for(let finger=0;finger<4;finger++){const x=(finger-1.5)*.012,length=[.028,.032,.031,.025][finger],middle=[.021,.023,.022,.018][finger],last=[.017,.018,.017,.014][finger],f=group(hand,x,-.030,.003);cylinder(f,skin,0,-length/2,0,.0058,.0050,length,7);const tip=group(f,0,-length,0);cylinder(tip,skin,0,-middle/2,0,.0050,.0045,middle,7);const distal=group(tip,0,-middle,0);cylinder(distal,skin,0,-last/2,0,.0045,.0035,last,7);const nail=box(distal,a.plain(0xa18b76),0,-.007,-.0039,.006,.007,.001);fingers.push({joint:f,tip,distal,nail});}
  const thumb=group(hand,-sign*.025,.008,.013);thumb.rotation.z=-sign*.45;const t=cylinder(thumb,skin,0,-.018,0,.009,.006,.034,7);t.rotation.x=-.3;
  arms.push({arm,elbow,hand,fingers,thumb});
  const leg=group(g,sign*.094,.89,0);mesh(leg,loft([[-.40,.070,.080],[-.25,.079,.091],[0,.090,.100]],{front:RECT.sleeve,back:RECT.sleeve}),trousers);
  const knee=group(leg,0,-.40,0);mesh(knee,loft([[-.395,.058,.067],[-.23,.065,.075],[0,.070,.080]],{front:RECT.sleeve,back:RECT.sleeve}),trousers);
  const ankle=group(knee,0,-.43,0),shoe=ellipsoid(ankle,a.plain(0x292722),0,0,.042,.083,.82,.65,1.65);box(ankle,a.plain(0x161916),0,-.046,.04,.142,.025,.264);legs.push({leg,knee,ankle,shoe});
 }
 if(character==='leon'){const cap=a.get('cloth',0x3e433a,{flatShading:false});const hat=mesh(head,new T.SphereGeometry(.086,16,8,0,Math.PI*2,0,Math.PI*.47),cap,0,.073,-.008);hat.scale.set(1,1.0,1.05);}
 const item=group(arms[0].hand,0,-.007,.055),itemRest=[0,-.007,.055];
 if(character==='rowan'){
  const material=new T.MeshStandardMaterial({map:a.package('HALE / RETURN','#57594c'),roughness:.9});box(item,material,0,0,.10,.27,.25,.26);box(item,a.plain(0x6b7063),0,.127,.10,.06,.006,.26);
 }else if(character==='nora'){
  const card=box(item,a.plain(0xa4a58d),0,-.01,.035,.085,.055,.008);card.rotation.x=-.2;
 }else if(character==='leon')box(item,a.plain(0xa4a58d),0,-.01,.035,.085,.055,.008);
 else{cylinder(item,a.plain(0xc4b99c),0,0,.043,.044,.040,.135,10);cylinder(item,dark,0,.071,.043,.047,.047,.012,10);}
 let cane=null;
 if(c?.appearance==='cap'){const cap=a.get('cloth',0x3e5446);ellipsoid(head,cap,0,.103,-.005,.087,1.04,.68,1.07);const brim=cylinder(head,cap,0,.106,.074,.083,.083,.015,12);brim.scale.set(1.18,1,.7);}
 if(c?.appearance==='beanie'){const cap=a.get('cloth',0x424735);ellipsoid(head,cap,0,.11,-.008,.087,1.03,.96,1.02);const cuff=cylinder(head,cap,0,.079,-.005,.086,.087,.035,16);}
 if(c?.appearance==='glasses'){const rim=a.plain(0x30372f);for(const sign of[-1,1]){const lens=mesh(head,new T.TorusGeometry(.020,.0025,5,12),rim,sign*.031,.038,.079);lens.scale.y=.75;box(head,rim,sign*.067,.039,.033,.003,.004,.09);}box(head,rim,0,.039,.080,.024,.003,.003);}
 if(c?.appearance==='cane'){mesh(g,loft([[.39,.27,.15],[.65,.21,.12],[.85,.17,.105]],{front:RECT.sleeve,back:RECT.sleeve}),a.get('cloth',0x414b45));cane=group(arms[1].hand,0,-.01,.025);cylinder(cane,a.get('wood',0x4f4130),0,-.39,0,.011,.014,.78,8);box(cane,a.plain(0x40372b),.018,.012,0,.11,.028,.032);cylinder(cane,dark,0,-.79,0,.017,.017,.025,8);}
 g.scale.setScalar(c?parseInt(c.height)/181.5*NPC_SCALE:1);
 g.traverse(o=>{if(o.isMesh)o.userData.actor=character;});
 return {appearance:c?.appearance,cane,art:a,g,upper,torso,hips,head,neck,eyes,features,eyeSurfaces,arms,legs,item,itemRest,horror,mouth,sockets,faceMesh,faceRings,portrait,faceRect,skin,variant:character,phase:(CUSTOMERS.findIndex(v=>v.id===character)+1)*1.3,realistic:true,headRest:.57,neckRest:.435};
}

// A separate, original diffuse atlas replaces drawn-on eye circles and tooth
// blocks. It is only shown after exposure; human/disguised faces remain intact.
const uncannyFaces=new T.TextureLoader().load(new URL('./assets/faces-uncanny-v6.png',import.meta.url).href);uncannyFaces.colorSpace=T.SRGBColorSpace;uncannyFaces.magFilter=T.LinearFilter;uncannyFaces.minFilter=T.LinearMipmapLinearFilter;uncannyFaces.anisotropy=4;
export function installRevealFace(m,a,style='intact'){
 const female=['june','nora'].includes(m.variant),tile=female?2:style==='flesh'?3:m.variant==='milo'?1:0,rect=[(tile%2)*.5+.004,tile<2?.504:.004,.492,.492],geometry=loft(m.faceRings,{front:rect,back:rect,head:true,headHair:[rect[0]+.05,rect[1]+.46,.04,.02],headSkin:[rect[0]+.03,rect[1]+.03,.04,.03]}),material=new T.MeshStandardMaterial({map:uncannyFaces,color:0xa3ac9b,roughness:.97,transparent:true,opacity:0,depthWrite:false}),face=mesh(m.head,geometry,material,0,0,.0008);face.renderOrder=3;face.visible=false;
 const landmarks=[[-.118,.985],[-.058,tile===3?.74:.76],[-.014,tile===3?.45:.51],[.039,tile===3?.21:.27],[.08,.12],[.149,.005]],coords=geometry.attributes.uv,points=geometry.attributes.position;for(let i=0;i<points.count;i++){if(points.getZ(i)<-.001)continue;const y=points.getY(i);let lo=landmarks[0],hi=landmarks.at(-1);for(let j=1;j<landmarks.length;j++)if(y<=landmarks[j][0]){lo=landmarks[j-1];hi=landmarks[j];break;}const f=Math.max(0,Math.min(1,(y-lo[0])/(hi[0]-lo[0]))),imageY=lo[1]+(hi[1]-lo[1])*f;coords.setY(i,rect[1]+(1-imageY)*rect[3]);}coords.needsUpdate=true;
 m.revealFace=face;m.revealBase=geometry.attributes.position.array.slice();m.revealStyle=style;m.revealAmount=0;m.horror.visible=false;m.sockets.visible=false;
 m.skinChange=group(m.head);m.skinChange.visible=false;const veinMat=a.plain(0x514e49);
 if(style==='flesh')for(const sign of [-1,1])for(let i=0;i<3;i++){const x=sign*(.052+i*.006),curve=new T.CatmullRomCurve3([new T.Vector3(x,.020,.060),new T.Vector3(x+sign*.005,-.018,.064),new T.Vector3(x-sign*.004,-.055-i*.006,.060)]);mesh(m.skinChange,new T.TubeGeometry(curve,5,.00065,4,false),veinMat);}
 // Small folds and skin tone changes replace an exaggerated open-mouth mask.
 const fold=ellipsoid(m.skinChange,a.plain(0x7b7567),-.055,-.049,.061,.013,.32,1.4,.19);fold.rotation.z=-.18;
}
export function updateRevealFace(m,amount,time){
 if(!m.revealFace)return;m.revealAmount=amount;m.faceMesh.visible=amount<.995;m.faceMesh.material.transparent=amount>.005&&amount<.995;m.faceMesh.material.opacity=1-amount;m.faceMesh.material.depthWrite=amount<.005;
 m.revealFace.visible=amount>.005;m.revealFace.material.opacity=amount;m.revealFace.material.depthWrite=amount>.995;m.revealFace.material.transparent=amount<.995;m.skinChange.visible=amount>.82;
 const form=m.form,position=m.revealFace.geometry.attributes.position,base=m.revealBase,fleshy=m.revealStyle==='flesh';for(let i=0;i<position.count;i++){const x=base[i*3],y=base[i*3+1],z=base[i*3+2],lower=Math.max(0,Math.min(1,(-y-.015)/.10)),side=x>0?1:.25,front=z>0?1:0;const brow=y>.025&&y<.075?Math.sin((y-.025)/.05*Math.PI)*front:0;const j=form?.jaw||[fleshy?.009:.002,fleshy?.017:.003,fleshy?.006:.0015],eye=Math.exp(-(((Math.abs(x)-.031)/.020)**2)-(((y-.039)/.018)**2))*front;
 position.setXYZ(i,x+j[0]*lower*side*amount,y-j[1]*lower*amount-.0035*brow*amount,z+j[2]*lower*front*amount-.022*(form?.eye||0)*eye*amount-.001*brow*amount-(form?.id==='withered'?.012*Math.exp(-(((absX(x)-.05)/.02)**2)-(((y+.02)/.03)**2))*front*amount:0));}
 position.needsUpdate=true;m.revealFace.geometry.computeVertexNormals();m.horror.visible=false;m.sockets.visible=false;
}

const absX=Math.abs;
