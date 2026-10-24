import * as T from './vendor/three.module.js';
// Merge only immutable geometry; tagged batches keep their target identity. Doors, drawers, stock, screens,
// interactive props and their children retain their original objects and targets.
export function installRenderBatches(w){
 const dynamic=new Set(),keep=o=>{if(o?.isObject3D){o.traverse(q=>dynamic.add(q));}};
 for(const key of ['camera','tyreTracks','safetySlide','gunPickup','keyPickup','documentHand','trayCard','idReader','phoneGroup','torchProp','binocularProp','spinner','hidingCabinets','drawer','tender','receiptPaper','phoneLamp','radioLamp','cue','freightTruck','pumpVisitorCar','uniformLocker','arrivalBus','bus','monitorFeed']){const o=w[key];if(Array.isArray(o))o.forEach(keep);else keep(o);}
 for(const key of ['yardGateLeaves','arrival','hideCabinets','restProps','doorMeshes','boardMeshes','stock','spills','screens','storyProps','spinners','counterGoods','rattleBins','mainsFixtures']){for(const v of Object.values(w[key]||{})){keep(v?.root||v?.mesh||v?.g||v?.m||v);if(v?.glow)keep(v.glow);}}
 for(const car of w.highwayCars||[])keep(car);
 // Moving cabinet leaves and food meshes are captured by reference as well.
 for(const v of Object.values(w)){if(v?.isMesh)dynamic.add(v);}
 const belongs=(o,root)=>{for(let p=o;p;p=p.parent)if(p===root)return true;return false;};const groups=new Map();w.westExteriorBatch=new T.Group();w.westExteriorBatch.name='west-exterior-batches';w.scene.add(w.westExteriorBatch);w.scene.updateMatrixWorld(true);
 w.scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||dynamic.has(o)||!o.visible||!o.geometry?.attributes.position||o.geometry.attributes.color||Array.isArray(o.material)||o.material.transparent||o.material.isShaderMaterial||o.userData.actor||o.userData.threat)return;
  for(let p=o.parent;p&&p!==w.scene;p=p.parent)if(!p.visible||dynamic.has(p)||p.userData.target||p.name.startsWith('hiding-cabinet'))return;
  const p=o.getWorldPosition(new T.Vector3()),cell=Math.floor(p.x/10)+','+Math.floor(p.z/10),key=o.material.uuid+':'+cell+':'+!!o.userData.wall+':'+!!o.userData.decorative+':'+JSON.stringify(o.userData.target||null)+':'+belongs(o,w.exterior)+':'+!!o.userData.westExterior;
  if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);
 });
 w.pickOccluders=[];let before=0,after=0;for(const meshes of groups.values()){if(meshes.length<3)continue;const parts=[];for(const m of meshes){const src=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();src.applyMatrix4(m.matrixWorld);parts.push(src);}
  const attrs=['position','normal','uv'],g=new T.BufferGeometry();for(const key of attrs){if(!parts.every(p=>p.attributes[key]))continue;const size=key==='uv'?2:3,total=parts.reduce((n,p)=>n+p.attributes[key].array.length,0),a=new Float32Array(total);let offset=0;for(const p of parts){a.set(p.attributes[key].array,offset);offset+=p.attributes[key].array.length;}g.setAttribute(key,new T.BufferAttribute(a,size));}
  g.computeBoundingBox();const center=g.boundingBox.getCenter(new T.Vector3());g.translate(-center.x,-center.y,-center.z);g.computeBoundingSphere();const merged=new T.Mesh(g,meshes[0].material);merged.position.copy(center);merged.name='static-batch';merged.userData={...meshes[0].userData,batched:true,sensorOnly:true};merged.castShadow=meshes.some(m=>m.castShadow);merged.receiveShadow=true;(meshes[0].userData.westExterior?w.westExteriorBatch:belongs(meshes[0],w.exterior)?w.exterior:w.scene).add(merged);for(const m of meshes){if(w.validMesh(m)){if(!m.geometry.boundingSphere)m.geometry.computeBoundingSphere();w.pickOccluders.push({mesh:m,sphere:m.geometry.boundingSphere.clone().applyMatrix4(m.matrixWorld)});}m.removeFromParent();}for(const p of parts)p.dispose();before+=meshes.length;after++;
 }
 w.batchInfo={before,after,savedCalls:before-after};
}
export function interactionMeshes(w,range=4){
 // A single flattened list per rendered frame also serves fall-back target rays.
 const key=w.pickGeneration+':'+range;if(w.pickFrame===key)return w.pickMeshes;w.pickFrame=key;
 const meshes=[];w.scene.traverseVisible(o=>{if(o.isMesh&&w.validMesh(o)&&!(o.isInstancedMesh&&o.userData.slots)){if(range<=4&&(o.userData.actor||o.userData.threat)){if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();if(o.geometry.boundingSphere.radius<.055)return;}meshes.push(o);}});for(const p of w.pickOccluders||[]){const limit=p.sphere.radius+range;if(p.sphere.center.distanceToSquared(w.camera.position)<=limit*limit)meshes.push(p.mesh);}w.pickMeshes=meshes;return meshes;
}
