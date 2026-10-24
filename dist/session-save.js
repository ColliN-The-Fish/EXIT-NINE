// Exit saves capture the live transaction as one snapshot, including escrow.
// Opening previews, untouched menus and developer fixtures never replace a save.
export function persistSession(g,{openingActive=false}={}){
 const s=g.s;if(openingActive||s.deathCinematic||s.health<=0||s.debugUsed||!(s.time>0))return false;
 const snapshot=JSON.parse(JSON.stringify(s));
 Object.assign(snapshot,{paused:true,moving:false,boardBuild:null,sessionResume:true});
 snapshot.checkpointLabel='退出前进度 · 第 '+s.night+' 晚';
 for(const a of snapshot.actors||[])a.pausedByTalk=false;
 g.checkpoint(snapshot);return true;
}
