export function perfectDisguise(c){return !!c&&!c.human&&(c.camouflage==='perfect'||c.camouflage==null&&c.id==='milo');}
export function hasBodyLeak(c){return !!c&&!c.human&&!perfectDisguise(c);}
export function revealStyle(c){return c?.revealStyle||(c?.id==='wade'?'flesh':'intact');}

