import {siteZone} from './site-layout.js';
import * as T from './vendor/three.module.js';
// Fixed-size light pools keep the shader small and avoid shader recompilation
// as cars, torches and room fixtures switch on and off.
export function installLightBudget(w){
 w.budgetSources=[];w.scene.traverse(o=>{if(o.isPointLight||o.isSpotLight)w.budgetSources.push(o);});
 w.lightPool={point:[],spot:[]};for(const[type,count]of[['point',6],['spot',3]])for(let i=0;i<count;i++){const l=type==='point'?new T.PointLight():new T.SpotLight();l.intensity=0;l.userData.pool=true;if(type==='spot'){w.scene.add(l.target);l.castShadow=i<2;l.shadow.mapSize.set(512,512);l.shadow.bias=-.0003;l.shadow.normalBias=.025;}w.scene.add(l);w.lightPool[type].push(l);}
 for(const l of w.budgetSources)l.visible=false;
}
export function applyLightBudget(w,camera=w.camera){
 if(!w.lightPool)return;const point=[],spot=[],origin=camera===w.camera&&w.openingLightOrigin?w.openingLightOrigin:camera.position;
 for(const l of w.budgetSources){l.visible=false;if(l.userData.westExterior&&siteZone({x:camera.position.x,z:camera.position.z})!=='outside')continue;if(l.intensity<=.001||w.dynamicLighting===false&&l!==w.flash)continue;const priority=camera===w.camera&&l===w.openingPriorityLight;const d=l.position.distanceTo(origin);if(!priority&&l.distance&&d>l.distance+9)continue;const score=l===w.flash||priority?1e6:l.intensity/(1+d*d*.12);(l.isSpotLight?spot:point).push({l,score});}
 for(const [type,list]of[['point',point],['spot',spot]]){list.sort((a,b)=>b.score-a.score);w.lightPool[type].forEach((pool,i)=>{const src=list[i]?.l;pool.visible=true;pool.intensity=src?.intensity||0;if(!src)return;pool.position.copy(src.position);pool.color.copy(src.color);pool.distance=src.distance;pool.decay=src.decay;if(type==='spot'){pool.target.position.copy(src.target.position);pool.angle=src.angle;pool.penumbra=src.penumbra;} });}
}
