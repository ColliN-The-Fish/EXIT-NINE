import {handoverDaylight} from './handover-director.js';
import * as T from './vendor/three.module.js';
import {siteZone} from './site-layout.js';
import {winterProfile,snowDrift} from './story-clock.js';
// Snow is an independent visual layer: it adds no solid or navigation obstacles.
export class WinterWeather{
 constructor(w){
  this.w=w;this.root=new T.Group();this.root.name='weather-layer';w.scene.add(this.root);this.banks=[];this.roofSnow=[];
  const count=9500,positions=new Float32Array(count*3);let seed=4317;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<count;i++){positions[i*3]=(random()-.5)*95;positions[i*3+1]=random()*16;positions[i*3+2]=(random()-.5)*90;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));
  this.material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uDrift:{value:new T.Vector3()},uStrength:{value:0},uHeight:{value:480},uDawn:{value:0}},vertexShader:`uniform float uTime;uniform vec3 uDrift;uniform float uStrength;uniform float uHeight;varying float vAlpha;
  void main(){vec3 p=position;p.x=mod(p.x+uDrift.x+47.5,95.)-47.5;p.z=mod(p.z+uDrift.z+45.,90.)-45.;p.y=mod(p.y-uDrift.y,16.);p.x+=sin(p.y+position.z+uTime*.7)*.35;
  bool roof=(p.x>-11.5&&p.x<11.5&&p.z>-5.5&&p.z<19.5)||(p.x>10.8&&p.x<18.3&&p.z>8.7&&p.z<17.3);bool canopy=p.x>-12.5&&p.x<12.5&&p.z>-17.&&p.z<-7.;vAlpha=(roof&&p.y<3.85)||(canopy&&p.y<4.65)?0.:uStrength*.77;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(uHeight*.06/max(2.,-mv.z),1.,5.);gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform float uDawn;varying float vAlpha;void main(){float r=length(gl_PointCoord-.5);if(r>.5||vAlpha<.01)discard;gl_FragColor=vec4(mix(vec3(.60,.67,.72),vec3(.84,.91,.94),uDawn+.15),vAlpha*(1.-r*1.6));}`});
  this.flakes=new T.Points(geo,this.material);this.flakes.frustumCulled=false;this.root.add(this.flakes);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#bbc7cd';c.fillRect(0,0,128,128);for(let i=0;i<1800;i++){const v=180+Math.floor(random()*65);c.fillStyle=`rgba(${v},${v+3},${v+4},.23)`;c.fillRect(random()*128,random()*128,1+random()*4,1+random()*2);}const texture=new T.CanvasTexture(canvas);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(14,8);texture.colorSpace=T.SRGBColorSpace;
  this.groundMaterial=new T.MeshStandardMaterial({map:texture,color:0xd6dce0,transparent:true,opacity:0,roughness:1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  this.groundMaterial.onBeforeCompile=shader=>{shader.vertexShader='varying vec2 snowWorld;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsnowWorld=(modelMatrix*vec4(transformed,1.)).xz;');shader.fragmentShader='varying vec2 snowWorld;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <alphamap_fragment>',`#include <alphamap_fragment>
   float drift=.18*sin(snowWorld.x*1.6+snowWorld.y*.4)+.10*sin(snowWorld.y*3.+snowWorld.x);
   // One continuous outdoor sheet: no coplanar overlaps or rectangular seams.
   float shop=max(abs(snowWorld.x)-11.08,max(-5.08-snowWorld.y,snowWorld.y-19.08));
   float office=max(max(10.92-snowWorld.x,snowWorld.x-18.08),max(8.92-snowWorld.y,snowWorld.y-17.08));
   float outdoors=smoothstep(0.,.24,min(shop,office)+drift*.2);
   float edge=min(22.-abs(snowWorld.x),min(snowWorld.y+20.,31.-snowWorld.y));
   diffuseColor.a*=outdoors*smoothstep(0.,.65,edge+drift);
   float roofEdge=min(12.5-abs(snowWorld.x),min(snowWorld.y+17.,-7.-snowWorld.y));
   float canopy=smoothstep(-.55,1.2,roofEdge+drift);
   float cleared=1.-smoothstep(.5,1.15,abs(snowWorld.x-.5));cleared*=step(-7.2,snowWorld.y)*step(snowWorld.y,-5.3);
   float tyres=(1.-smoothstep(.13,.29,abs(snowWorld.y+18.1)))+(1.-smoothstep(.13,.29,abs(snowWorld.y+16.7)));
   diffuseColor.a*=mix(1.,.22,canopy)*mix(1.,.28,cleared)*(1.-min(1.,tyres)*.5);`);};
  this.ground=new T.Mesh(new T.PlaneGeometry(44,51),this.groundMaterial);this.ground.rotation.x=-Math.PI/2;this.ground.position.set(0,.024,5.5);this.ground.receiveShadow=true;this.ground.userData.decorative=true;this.root.add(this.ground);
  const bankMap=texture.clone();bankMap.repeat.set(2,5);bankMap.needsUpdate=true;this.bankMaterial=new T.MeshStandardMaterial({map:bankMap,color:0xc4d0d7,roughness:1,flatShading:false});
  // Irregular ploughed shoulders; the front entrance, truck ramp, bus stop and
  // breaker approach stay unobstructed. Their shape, not extra lights, gives depth.
  for(const[x,z,width,length,angle]of [[-21,5,2,45,0],[21.3,-2,1.3,31,0],[0,29.7,2.4,40,Math.PI/2],[-15,19.8,1.2,9,Math.PI/2],[3.8,19.65,1.05,13,Math.PI/2],[18.6,3.1,.7,9,0],[-13,-18.8,.8,8,Math.PI/2]]){
   const g=new T.PlaneGeometry(width,length,5,30);g.rotateX(-Math.PI/2);const a=g.attributes.position;for(let i=0;i<a.count;i++){const x0=a.getX(i),z0=a.getZ(i),edge=Math.max(0,1-Math.pow(x0/(width*.5),2)),ends=Math.min(1,Math.max(0,(length*.5-Math.abs(z0))/.9)),ridge=.24+.16*(.5+.5*Math.sin(z0*1.7))+random()*.08;a.setY(i,edge*ends*ridge);}g.computeVertexNormals();const m=new T.Mesh(g,this.bankMaterial);m.position.set(x,.025,z);m.rotation.y=angle;m.receiveShadow=true;m.userData.decorative=true;this.root.add(m);this.banks.push(m);
  }
  // Snow sits directly on existing roof tops, never as floating white slabs.
  for(const[x,z,width,depth,y]of [[0,2,22.5,14.5,3.713],[0,14,22.5,10.1,3.713],[14.5,13,7.1,8.1,3.513],[0,-12,24.8,9.8,4.608]]){const m=new T.Mesh(new T.BoxGeometry(width,.055,depth),this.bankMaterial);m.position.set(x,y,z);m.userData.decorative=true;this.root.add(m);this.roofSnow.push(m);}
  this.skyFill=new T.HemisphereLight(0x8babc3,0x253342,0);w.scene.add(this.skyFill);
  this.nightSky=new T.Color(0x0d1015);this.dawnSky=new T.Color(0x354650);this.nightFog=new T.Color(0x141923);this.dawnFog=new T.Color(0x47535e);
 }
 update(s,dt){const active=s.storyVersion===14;this.root.visible=active;this.skyFill.visible=active&&!this.w.tester?.night;if(!active)return;
  const p=winterProfile(s),handover=s.narrative?.sequence;if(handover&&['transition2','transition3'].includes(handover.key))p.dawn=handoverDaylight(handover);this.strength=p.strength;this.accumulation=p.accumulation;this.daylight=p.dawn;
  const drift=snowDrift(s);this.material.uniforms.uDrift.value.set(drift.x,drift.y,drift.z);this.material.uniforms.uTime.value=s.time;this.material.uniforms.uStrength.value=p.strength;this.material.uniforms.uHeight.value=this.w.renderHeight||480;this.material.uniforms.uDawn.value=p.dawn;
  this.groundMaterial.opacity=p.accumulation;for(const m of this.banks)m.scale.y=.06+p.accumulation*1.7;for(const m of this.roofSnow){m.visible=p.accumulation>.16;m.scale.y=p.accumulation;}
  const brightness=Math.min(1,p.dawn*3);this.w.scene.background.copy(this.nightSky).lerp(this.dawnSky,brightness);this.w.scene.fog.color.copy(this.nightFog).lerp(this.dawnFog,brightness);
  this.skyFill.intensity=p.dawn*2.4;
  const outside=siteZone(s.player)==='outside',target=outside?.019+p.strength*.028:.018;this.w.scene.fog.density=T.MathUtils.damp(this.w.scene.fog.density,target,3,dt||.016);
 }
}
