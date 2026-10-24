export const MAX_HP=100,PISTOL_CAPACITY=8,HIT_DAMAGE=18,HIT_INTERVAL=.8;
export const REST_FOOD={water:{name:'饮用水',heal:24,duration:1.15},snack:{name:'员工零食',heal:16,duration:.95}};
export const HIDE_CABINETS={staff:{x:12.5,z:15.5,w:1.3,d:.8},rest:{x:14.6,z:16.35,w:1.3,d:.7}};
export function initSurvival(s){s.ammo=PISTOL_CAPACITY;s.ammoCapacity=PISTOL_CAPACITY;s.restFood={water:2,snack:2};s.nextHitAt=0;s.recovery=null;return s;}
export function damagePlayer(g,source){const s=g.s;if(s.finished||s.deathCinematic||s.hidden||s.time<(s.nextHitAt||0))return false;s.nextHitAt=s.time+HIT_INTERVAL;s.health=Math.max(0,s.health-HIT_DAMAGE);s.lastAttacker=source?.sourceId||source?.id||'milo';g.sound('hurt');if(s.health===0)g.finishError('你没能离开第九出口');return true;}
export function useRestFood(g,key){const s=g.s,f=REST_FOOD[key];if(!f||s.narrative?.sequence||s.finished||s.hidden||s.recovery||s.deathCinematic||s.health>=MAX_HP||!(s.restFood?.[key]>0)||!g.hands())return false;s.restFood[key]--;s.recovery={key,elapsed:0,duration:f.duration};s.gunDrawn=false;s.binocularActive=false;g.sound(key==='water'?'drink':'snack');g.notice(f.name+' · 补充体力中');return true;}
export function tickRecovery(g,dt){const s=g.s,r=s.recovery;if(!r)return;if(s.health<=0||s.deathCinematic){s.recovery=null;return;}r.elapsed+=dt;if(r.elapsed>=r.duration){const f=REST_FOOD[r.key],before=s.health;s.health=Math.min(MAX_HP,s.health+f.heal);s.recovery=null;g.notice(f.name+' · HP +'+(s.health-before)+' / '+s.health);}}
const activeThreat=t=>t.hp>0&&!['dead','retreat','outside'].includes(t.mode);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const cabinetApproach=key=>{const c=HIDE_CABINETS[key]||HIDE_CABINETS.staff;return {x:c.x,z:c.z-c.d/2-.55};};
export function enterCabinet(g,key='staff'){
 const s=g.s,c=HIDE_CABINETS[key]||HIDE_CABINETS.staff;if(s.narrative?.sequence||s.recovery||s.hidden||s.finished||s.deathCinematic||!g.hands())return false;
 const entry={...s.player},approach=cabinetApproach(key);let witnessed=false;
 for(const t of s.threats){if(!activeThreat(t))continue;const sees=dist(t,entry)<12&&(g.canSee?g.canSee(t,entry,s):true);
  if(sees){const old=t.cabinetMemory;t.cabinetMemory=old?.key===key&&s.time-(old.lastSeenAt??old.knownAt)<24?old:{key,approach,knownAt:s.time,inspect:0,warned:false};t.cabinetMemory.lastSeenAt=s.time;witnessed=true;t.last={...approach};t.search=18;}
  else if(t.cabinetMemory?.key===key&&s.time-(t.cabinetMemory.lastSeenAt??t.cabinetMemory.knownAt)<24)witnessed=true;
  if(t.mode==='chase')t.mode='search';t.route=null;t.repath=0;
 }
 s.hideReturn=entry;s.hideCabinet=key;s.hideEnteredAt=s.time;s.hidden=true;s.hideExposed=witnessed;s.scannerActive=false;s.binocularActive=false;s.gunDrawn=false;s.torch=false;s.noise=0;s.heat=0;
 s.player.x=c.x;s.player.z=c.z-.04;s.player.yaw=0;s.player.pitch=0;g.sound('cabinet');g.notice(witnessed?'它看见你进柜子了，正在靠近。E 可立刻离开。':'柜门合上了。保持安静；它仍会搜索最后看见你的位置。');return true;
}
export function leaveCabinet(g){const s=g.s;if(!s.hidden)return false;const c=HIDE_CABINETS[s.hideCabinet]||HIDE_CABINETS.staff;const exit=s.hideReturn||{x:c.x,z:c.z-c.d/2-.6,yaw:0,pitch:0},spots=[[0,0],[.75,0],[-.75,0],[0,-.75],[.75,-.75],[-.75,-.75]].map(([x,z])=>({...exit,x:exit.x+x,z:exit.z+z})),valid=q=>(!g.canOccupy||g.canOccupy(q,s)),clear=q=>!s.threats.some(t=>activeThreat(t)&&dist(t,q)<.6);Object.assign(s.player,spots.find(q=>valid(q)&&clear(q))||spots.find(valid)||exit);s.hidden=false;s.hideExposed=false;s.hideReturn=null;g.sound('cabinet');return true;}
// Each pursuer remembers only what it actually saw. Re-entering cannot reset a search.
export function tickCabinetSearch(g,t,dt){
 const s=g.s,m=t.cabinetMemory;if(!m)return;
 if(s.time-(m.lastSeenAt??m.knownAt)>=24){delete t.cabinetMemory;return;}
 if(t.mode==='chase'&&!s.hidden)return;
 t.last={...m.approach};t.search=Math.max(t.search||0,2);
 if(dist(t,m.approach)>1.25||g.canSee&&!g.canSee(t,m.approach,s))return;
 if(!m.warned){m.warned=true;g.sound('doorLatch',{pos:m.approach});if(s.hidden&&s.hideCabinet===m.key)g.notice('脚步停在柜门外，门把手正在转动。E 离开！');}
 m.inspect+=dt;if(m.inspect<1.3)return;
 delete t.cabinetMemory;t.last=null;t.search=0;
 if(s.hidden&&s.hideCabinet===m.key){g.leaveHide();t.mode='chase';t.last={x:s.player.x,z:s.player.z};t.search=18;t.route=null;g.notice('柜门被拉开了！拉开距离，或用枪解围。');damagePlayer(g,t);}
}

// Six distinct intruders enter in waves, with at most two active at a time.
export function tickSiegeWaves(g,dt){const s=g.s;if(s.night!==3||s.phase!=='siege')return false;s.siegeWaves??={elapsed:0,next:22,spawned:0};const wave=s.siegeWaves;wave.elapsed+=dt;
 for(const t of s.threats){if(t.waveBorn==null||t.mode==='dead')continue;const age=wave.elapsed-t.waveBorn;if(age>57&&t.mode!=='chase'){const seen=!s.hidden&&(g.canSee?g.canSee(t,s.player,s):Math.hypot(t.x-s.player.x,t.z-s.player.z)<10);if(seen){t.mode='chase';t.last={x:s.player.x,z:s.player.z};continue;}t.mode='retreat';const goal=t.side==='loading'?{x:-6,z:25}:{x:.5,z:-18};g.walk(t,goal,dt,2);if(Math.hypot(t.x-goal.x,t.z-goal.z)<.8||age>72){t.mode='dead';t.withdrawn=true;}}}
 const active=s.threats.filter(t=>t.hp>0&&t.mode!=='dead').length;
 if(wave.elapsed>=wave.next&&wave.spawned<6&&active<2){const i=wave.spawned++,side=i%2?'loading':'front',pos=side==='front'?{x:.5,z:-8}:{x:-6,z:20.7};s.threats.push({id:'wave-'+i,sourceId:['wade','rowan','milo','cal','june','wade'][i],formId:['stalker','folded','jawbound','backturned','withered','reacher'][i],...pos,yaw:0,hp:2,mode:'outside',side,stun:0,bash:0,route:null,repath:0,search:0,waveBorn:wave.elapsed});wave.next=wave.elapsed+29;g.sound('growl',{pos});g.notice(side==='front'?'前门外又出现了一道不同的人影。':'卸货门外传来新的撞击。');}
 return true;
}
