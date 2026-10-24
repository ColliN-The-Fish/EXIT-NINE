// A named identity keeps the same voice across nights, including impersonators.
export const SELECTED_VOICES=Object.freeze({driver:'D21',ben:'B21',alex:'A21'});
export const CUSTOMER_VOICES=Object.freeze({june:'N25',wade:'N22',nora:'N24',rowan:'N21',leon:'N21',milo:'N23',edith:'N26',owen:'N23',ruth:'N25',cal:'N22'});
export const voiceText=text=>String(text||'').replace(/\s+/gu,' ').trim().replace(/^「([\s\S]*)」$/u,'$1');
export const lineKey=(actorId,text)=>actorId+'|'+voiceText(text);
