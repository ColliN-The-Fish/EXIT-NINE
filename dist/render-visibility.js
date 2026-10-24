import {siteZone} from './site-layout.js';
// The solid shop/warehouse walls fully occlude the rear service alley from
// the sales floor. CCTV and outdoor cinematic cameras use their own position.
export function applyRenderVisibility(w,camera=w.camera){const rearVisible=siteZone({x:camera.position.x,z:camera.position.z})!=='shop';if(w.exterior)w.exterior.visible=rearVisible;const westVisible=siteZone({x:camera.position.x,z:camera.position.z})==='outside';for(const root of[w.westExteriorBatch,w.siteSurroundings,w.siteParkedCar])if(root)root.visible=westVisible;}
