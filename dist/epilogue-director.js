const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export const homeSequence=key=>['epilogueHome','epilogueRoom'].includes(key);
export function endingRoomActive(s){const q=s.narrative?.sequence;return homeSequence(q?.key)||q?.key==='coda'&&q.index>=1||s.narrative?.stage==='complete';}
export function endingShot(q){const t=q.elapsed||0,u=ease(t/9);
 if(q.key==='coda')return{from:[-.18,1.66,1.65-u*.16],to:[.65,1.49,-3.5],fov:59,label:'新住处 · 入夜',night:true,beat:'window'};
 const home=q.key==='epilogueHome',place=home?'新住处':'暂住旅馆';
 if(q.index<=0&&t<3.7)return{from:[-.50+ease(t/3.7)*.12,1.66,3.12],to:[-.10,1.05,-.65],fov:60,label:'白天 · '+place,beat:'room'};
 if(q.index<=0&&t<7.2)return{from:[1.23,1.12,1.80],to:[1.62,.80,.74],fov:39,label:home?'首笔房款已付清':'把钱收好',beat:'keys'};
 if(q.index<=0)return{from:[-2.65,1.28,.35],to:[-1.90,.79,-1.14],fov:47,label:'终于可以拆开行李',beat:'luggage'};
 return{from:[-.18,1.66,1.65-u*.12],to:[.65,1.49,-3.5],fov:59,label:place+' · 至少今晚',beat:'window'};
}
export function endingFade(q,hold){const t=q.elapsed||0;if(q.key==='coda'&&q.index<1)return Math.max(1-ease(t/.65),ease((t-(hold-.5))/.5));let fade=1-ease(t/.7);if(homeSequence(q.key)&&q.index<=0)for(const cut of[3.7,7.2])fade=Math.max(fade,1-ease(Math.abs(t-cut)/.15));return Math.max(fade,ease((t-(hold-.65))/.65));}
