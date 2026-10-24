import {SITE} from './site-layout.js';
import {DOORS} from './data.js';
import {circleHitsBox} from './spatial.js';
import {doorBoxes} from './door-system.js';
import {carBlocks} from './vehicle-flow.js';
import {freightGateBoxes} from './yard-layout.js';
import {looseCargoBoxes} from './collision-system.js';
export function canMoveAt(solids,x,z,s,r=.25){const b=SITE.bounds;if(x<b.x0+r||x>b.x1-r||z<b.z0+r||z>b.z1-r)return false;for(const q of solids)if(Math.abs(x-q.x)<q.w/2+r&&Math.abs(z-q.z)<q.d/2+r)return false;for(const id of Object.keys(DOORS))for(const q of doorBoxes(id,s))if(circleHitsBox(x,z,r,q))return false;for(const q of [...carBlocks(s),...freightGateBoxes(s),...looseCargoBoxes(s)])if(circleHitsBox(x,z,r,q))return false;return true;}
