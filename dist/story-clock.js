// One persisted story clock drives the HUD, dawn sky and snow illumination.
// Story minutes are compressed; speech, movement, survival and input use real dt.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function legacyMinute(s){const anchor=s.narrative?.timeAnchor;return anchor?anchor.minute+Math.max(0,s.time-anchor.time)*.12:(s.night===3?1335:8)+(s.time||0)*.12;}
function workProgress(s){const stock=(s.crates||[]).filter(c=>c.place==='shelf').length/Math.max(1,s.crates?.length||6),customers=(s.completed||[]).length/Math.max(1,s.cast?.length||8),clean=(s.clean||[]).length/3;return clamp(stock*.28+customers*.62+clean*.1,0,1);}
export function clockTarget(s){const n=s.narrative||{},stage=n.stage;
 if(s.night===3){const targets={waitingBrief:1340,prepare3:1375,checkFront:1400,pickup:1420,verifyPickup:1440,confrontPickup:1450,arrival:1825,checkArrival:1825,boardBus:1830,epilogue:1840,coda:1840,complete:1840};if(s.phase==='siege')return 1450+(1-clamp((s.rescue??210)/210,0,1))*365;return targets[stage]??1335;}
 const end=s.night===1?360:390;
 if(['dawn','settlement'].includes(s.phase))return end;
 const closing=s.night===1?{callback:330,review1:345,report1:359,settle:360}:{findWorker:265,restorePower:285,report2:315,review2:389,settle:390};
 if(closing[stage]!=null)return closing[stage];
 const cap=s.night===1?320:255;
 return Math.min(cap,Math.max(8+(s.time||0)*.18,8+(cap-8)*workProgress(s)));
}
export function advanceStoryClock(s,dt){if(!s.narrative||s.paused||s.finished)return;const n=s.narrative;
 n.clockMinutes??=clamp(legacyMinute(s),s.night===3?1335:8,s.night===3?1840:s.night===1?360:390);
 const target=clockTarget(s),current=n.clockMinutes,ceiling=s.night===3?Math.max(target,current):s.narrative.stage==='working'?(s.night===1?329:264):target;
 n.clockMinutes=Math.max(current,Math.min(ceiling,Math.max(current+Math.max(0,dt)*.12,current+clamp(target-current,0,Math.max(0,dt)*2.5))));
 if(['dawn','settlement'].includes(s.phase)&&s.night<3)n.clockMinutes=s.night===1?360:390;
}
export function storyClockValue(s){
 if(s.night===1&&['dawn','settlement'].includes(s.phase))return 360;
 if(s.night===2&&['dawn','settlement'].includes(s.phase))return 390;
 if(s.night===3&&['epilogue','coda','complete'].includes(s.narrative?.stage))return 400;
 const value=s.narrative?.clockMinutes??clamp(legacyMinute(s),s.night===3?1335:8,s.night===3?1840:s.night===1?360:390),bounded=s.night===1?Math.min(360,value):value;
 return ((bounded%1440)+1440)%1440;
}
export function storyClockMinutes(s){return Math.floor(storyClockValue(s));}
const smooth=(a,b,x)=>{const u=clamp((x-a)/(b-a),0,1);return u*u*(3-2*u);};
export function dawnLevel(minute){const m=((minute%1440)+1440)%1440;if(m<240||m>=1080)return 0;if(m<300)return .045*smooth(240,300,m);if(m<360)return .045+.115*smooth(300,360,m);if(m<420)return .16+.12*smooth(360,420,m);return .28;}
export function winterProfile(s){const strength=s.night===1?.13:s.night===2?.30+Math.min(.55,(s.time||0)/1100):.88;return {strength,accumulation:s.night===1?.06:s.night===2?.38+Math.min(.49,(s.time||0)/1300):.96,dawn:dawnLevel(storyClockValue(s))};}

// Integrate wind/fall speed: changing snowfall intensity must not teleport flakes.
export function snowDrift(s){const t=Math.max(0,s.time||0),ramp=Math.min(t,605),integral=s.night===1?.13*t:s.night===2?.30*t+ramp*ramp/2200+.55*Math.max(0,t-605):.88*t;return {x:1.4*t+3*integral,y:1.1*t+1.2*integral,z:.5*t};}
