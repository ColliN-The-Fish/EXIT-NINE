import {hasBodyLeak} from './mimicry.js';
// Match the visible peak/recovery of the existing anomalyPose, not its ending.
export function bodyCueVisible(c,a){return hasBodyLeak(c)&&!!a?.animation&&!a.shoppingPose&&!a.moving&&a.animation.t>=.68&&a.animation.t<=1.10;}
export function recordBodyObservation(g,id){const s=g.s,a=s.actors.find(a=>a.id===id),c=s.cast.find(c=>c.id===id);if(!bodyCueVisible(c,a)||s.observed.includes(id))return false;s.observed.push(id);g.note(id+':body',c.id==='cal'?'他抬手时，肘部向身体外侧反折，袖口没有随之转动。':c.normal);return true;}
export function saleKnownUnsafe(s,c){return !c.human&&s.observed.includes(c.id);}
