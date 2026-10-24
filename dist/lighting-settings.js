const KEY='exit-nine:player:settings:dynamic-lights';
export function loadDynamicLighting(storage=globalThis.localStorage){try{return storage.getItem(KEY)!=='off';}catch{return true;}}
export function saveDynamicLighting(on,storage=globalThis.localStorage){try{storage.setItem(KEY,on?'on':'off');}catch{}}
export function installLightingSettings(w){w.dynamicLighting=true;w.localLightSettings=[];w.scene.traverse(o=>{if(o.isPointLight||o.isSpotLight)w.localLightSettings.push({light:o,visible:o.visible,shadow:o.castShadow});});}
export function setDynamicLighting(w,on){w.dynamicLighting=!!on;for(const q of w.localLightSettings){const keep=q.light===w.flash;q.light.visible=on?q.visible:keep;q.light.castShadow=!!on&&q.shadow;}w.renderer.shadowMap.enabled=!!on&&(w.renderHeight||480)>=480;w.renderer.shadowMap.needsUpdate=true;w.shadowTime=-99;}
export function applyLightingSettings(w,s){if(w.dynamicLighting!==false)return;if(!w.tester?.night){const indoors=w.zone(s.player)!=='outside';w.ambient.intensity=s.power?(indoors?.88:.29):(indoors?.19:.13);}w.renderer.shadowMap.enabled=false;}
