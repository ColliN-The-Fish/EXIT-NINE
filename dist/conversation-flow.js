// Per-visit greeting memory. Browsing and checkout are different moments;
// reopening a question menu is not a new conversation greeting.
export function receptionGreeting(s,a,c){
 s.receptionHeard??={};const stage=c.rear?'rear':c.pump?'pump':a.mode==='browse'?'browse':'checkout';
 const key=c.id+':'+stage;if(s.receptionHeard[key])return null;
 s.receptionHeard[key]=true;
 return c.cn+'：'+(stage==='browse'?'我还在挑东西。有什么事吗？':c.rear||c.pump?c.want:'这些就是我挑的商品。麻烦你了。');
}
