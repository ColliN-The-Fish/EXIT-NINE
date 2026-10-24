export function guidanceSales(s){return Math.max(0,Number(s.guidance?.sales)||0,s.ledger?.transactions?.length||0);}
export function guidanceStrength(s){return Math.max(.16,.95*Math.pow(.62,guidanceSales(s)));}
export function recordGuidanceSale(s){const prior=Math.max(0,Number(s.guidance?.sales)||0,(s.ledger?.transactions?.length||1)-1);s.guidance={sales:prior+1};}
export function workCuePlan(s){
 if(!s.campaign||s.paused||s.finished||!s.power||s.hidden||s.gunDrawn||s.scannerActive||s.binocularActive||s.refusal)return[];
 if(s.heldId&&s.idScanned!==s.heldId)return[{id:'terminal'}];
 if(!s.briefed)return s.phone?[{id:'phone'}]:[];
 if(s.transaction||s.boardCarry||s.trapCarry||!['opening','customers'].includes(s.phase))return[];
 if(s.carry){const c=s.crates[s.carry.id];return c.received?[{id:'shelf',key:c.shelf}]:[{id:'receiving'}];}
 if(!s.manifest)return[{id:'manifest'}];
 const crates=s.crates.filter(c=>!['carried','shelf'].includes(c.place)).sort((a,b)=>Math.hypot(s.player.x-a.x,s.player.z-a.z)-Math.hypot(s.player.x-b.x,s.player.z-b.z));
 if(crates.length)return[{id:'crate',key:crates[0].id}];
 const clean=[0,1,2].find(i=>!s.clean.includes(i));return clean==null?[]:[{id:'clean',key:clean}];
}
