// Tuning only: no new characters, events, props or story branches.
export const stockGoal=s=>Math.max(1,s.crates?.length||6);
export const deliveryManifest=(s,text)=>text.replace(/六箱|三箱/,stockGoal(s)===3?'三箱':'六箱');
export function admissionReady(s){return !(s.night===1&&s.admitted===1&&!s.completed.includes(s.cast[0]?.id));}
export function browseDuration(a){return a.browseIndex===0?5.1+(a.spawnOrder%3)*.65:2.8+(a.spawnOrder%3)*.25+(a.browseIndex%2)*.35;}
export function rememberVisit(s,c,outcome){s.visitHistory??=[];if(!s.visitHistory.some(v=>v.night===s.night&&v.id===c.id))s.visitHistory.push({night:s.night,id:c.id,name:c.cn,outcome});}
export function previousVisit(s,c){const v=s.visitHistory?.filter(v=>v.id===c.id&&v.night<s.night).at(-1);return v?' 本站接待记录：第'+v.night+'晚，'+v.name+'，'+(v.outcome==='sale'?'已完成购物结账':v.outcome==='pump'?'已处理加油订单':'接待后离开')+'。':'';}
export function previousAnswers(s){const answers={...(s.priorAnswers||{})};for(const c of s.cast||[])for(const i of s.questioned?.[c.id]||[]){answers[c.id]??={};answers[c.id][c.questions[i][0]]=c.questions[i][1];}return answers;}
export const heardAnswer=(s,c,i)=>s.priorAnswers?.[c.id]?.[c.questions[i]?.[0]]===c.questions[i]?.[1];
