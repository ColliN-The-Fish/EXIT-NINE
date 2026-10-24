import {lineKey,voiceText} from './voice-roster.js';

// Dialogue is requested by a displayed line, never by a character's hidden identity.
export class CharacterVoice{
 constructor(audio,{getState,fetcher=(...args)=>fetch(...args),now=()=>performance.now()}={}){this.audio=audio;this.getState=getState;this.fetcher=fetcher;this.now=now;this.catalog=null;this.catalogPromise=null;this.buffers=new Map();this.maxBuffers=12;this.events=[];this.generation=0;this.cancelVersion=0;this.waiting=null;this.catalogWaiters=[];this.source=null;this.current=null;this.pending=null;this.resume=null;this.queue=[];this.lastState=null;this.recent=null;this.conversationId=null;}
 get speaking(){return !!this.source;}
 get caption(){return this.current?.signature||'';}
 async load(){if(this.catalog)return this.catalog;if(this.catalogPromise)return this.catalogPromise;this.catalogPromise=(async()=>{try{const r=await this.fetcher(new URL('./assets/voice/v14/catalog.json',import.meta.url));if(!r.ok)throw Error('voice catalog HTTP '+r.status);const catalog=await r.json();this.catalog=catalog;this.lines=new Map(catalog.lines.map(line=>[lineKey(line.actorId,line.text),line]));return catalog;}catch(error){this.event({error:error.message});return null;}finally{this.catalogPromise=null;}})();return this.catalogPromise;}
 event(value){this.events.push(value);if(this.events.length>150)this.events.shift();}
 stop(reason='stop'){this.generation++;if(reason!=='new-line')this.cancelVersion++;this.waiting=null;this.catalogWaiters=[];this.controller?.abort();this.controller=null;this.pending=null;this.resume=null;this.queue=[];const source=this.source;this.source=null;this.current=null;if(source){try{source.stop();}catch{}source.disconnect();}this.event({type:'stop',reason});}
 bind(state){if(state!==this.lastState){this.stop('state-change');this.recent=null;this.lastState=state;}}
 resolve(text,actorId){if(!this.catalog)return null;let body=String(text),id=actorId;for(const [candidate,speaker] of Object.entries(this.catalog.speakers)){const prefix=speaker+'：';if(body.startsWith(prefix)){id=id||candidate;body=body.slice(prefix.length);break;}}if(actorId&&body===String(text)&&body.indexOf('：')>0&&body.indexOf('：')<24)body=body.slice(body.indexOf('：')+1);if(!id)return null;return this.lines.get(lineKey(id,body))||null;}
 async speak(text,{actorId=null,scope='game'}={}){
  const state=this.getState?.();if(!state||state.paused||state.finished)return false;this.bind(state);
  const waiting={state,scope,actorId,signature:voiceText(text)},cancelVersion=this.cancelVersion;this.catalogWaiters.push(waiting);this.waiting=this.catalogWaiters[0];
  const catalog=await this.load();this.catalogWaiters=this.catalogWaiters.filter(r=>r!==waiting);this.waiting=this.catalogWaiters[0]||null;if(!catalog||cancelVersion!==this.cancelVersion||state!==this.getState?.()||state.paused||state.finished)return false;
  const line=this.resolve(text,actorId);if(!line)return false;
  const signature=voiceText(text),time=this.now();
  // A second click or the rule/UI double hook must never restart a live line.
  const active=[this.current,this.pending,...this.queue].find(r=>r?.state===state&&r.line.clipId===line.clipId&&r.actorId===line.actorId);
  if(active){if(scope==='conversation')active.scope=scope;return false;}
  if(this.recent?.text===signature&&time-this.recent.time<450)return false;
  this.recent={text:signature,time};const request={state,scope,signature,actorId:line.actorId,line};
  if(this.current||this.pending){this.queue.push(request);return true;}
  return this.play(request);
 }
 async play(request){
  const {state,line}=request,generation=++this.generation;this.pending=request;
  this.audio.start();const context=this.audio.context;if(!context)return false;
  try{
   let buffer=this.buffers.get(line.src);
   if(buffer){this.buffers.delete(line.src);this.buffers.set(line.src,buffer);}else{
    const controller=new AbortController();this.controller=controller;const r=await this.fetcher(new URL(line.src,import.meta.url),{signal:controller.signal});if(!r.ok)throw Error('dialogue HTTP '+r.status);
    const bytes=await r.arrayBuffer();if(generation!==this.generation)return false;buffer=await context.decodeAudioData(bytes);
    if(generation!==this.generation)return false;if(buffer.duration<.1)throw Error('empty dialogue');this.buffers.set(line.src,buffer);while(this.buffers.size>this.maxBuffers)this.buffers.delete(this.buffers.keys().next().value);
   }
   if(generation!==this.generation||state!==this.getState?.()||state.paused||state.finished)return false;
   this.pending=null;this.controller=null;this.begin(request,buffer,0);return true;
  }catch(error){if(error.name!=='AbortError'&&generation===this.generation){this.pending=null;this.event({id:line.clipId,error:error.message});this.drain();}return false;}
 }
 begin(request,buffer,offset){
  const context=this.audio.context,node=context.createBufferSource(),gain=context.createGain(),pan=context.createStereoPanner();node.buffer=buffer;node.connect(gain);gain.connect(pan);pan.connect(this.audio.master);
  const current={...request,buffer,node,gain,pan,offset,startedAt:context.currentTime};this.current=current;this.source=node;let cleaned=false;
  node.onended=()=>{if(!cleaned){cleaned=true;gain.disconnect();pan.disconnect();node.disconnect();}if(this.source===node){this.source=null;this.current=null;this.event({type:'end',id:request.line.clipId,at:context.currentTime});this.drain();}};
  gain.gain.value=.92;this.spatial(current,request.state);node.start(0,offset);this.event({type:'play',id:request.line.clipId,actorId:request.line.actorId,profile:request.line.profile,offset,at:context.currentTime});
 }
 drain(){if(this.source||this.pending)return;const state=this.getState?.();if(!state||state.paused||state.finished)return;let next;while((next=this.queue.shift())){if(this.relevant(next,state)){this.play(next);return;}}}
 spatial(current,state){const actor=state.actors?.find(a=>a.id===current.line.actorId);if(!actor){current.pan.pan.value=0;return;}const dx=actor.x-state.player.x,dz=actor.z-state.player.z,distance=Math.hypot(dx,dz),angle=Math.atan2(dx,-dz)+state.player.yaw;current.pan.pan.value=Math.max(-.65,Math.min(.65,Math.sin(angle)*.7));current.gain.gain.value=.92*Math.max(.3,1/(1+Math.max(0,distance-2)*.11));}
 relevant(request,state){if(request.state!==state)return false;if(request.scope==='conversation'&&this.conversationId!==request.actorId)return false;const actor=state.actors?.find(a=>a.id===request.actorId);return request.scope==='story'||request.actorId==='alex'||!!actor&&actor.mode!=='dead';}
 sync(state,{conversationId=null}={}){
  this.conversationId=conversationId;this.bind(state);if(state.finished||state.phase==='settlement'){if(this.source||this.pending||this.resume||this.waiting)this.stop('finished');return;}
  if(state.paused){if(this.current){const current=this.current,offset=current.offset+this.audio.context.currentTime-current.startedAt,queue=this.queue;this.stop('pause');if(offset<current.buffer.duration)this.resume={request:current,buffer:current.buffer,offset,queue};}else if(this.pending){const request=this.pending,queue=this.queue;this.stop('pause-pending');this.resume={request,buffer:null,offset:0,queue};}else if(this.waiting){const waitings=[...this.catalogWaiters];this.stop('pause-catalog');this.resume={waitings};}return;}
  if(this.resume){const saved=this.resume;this.resume=null;if(saved.waitings){for(const r of saved.waitings)if(r.state===state&&(r.scope!=='conversation'||r.actorId===conversationId))this.speak(r.signature,r);}else if(this.relevant(saved.request,state)){if(saved.buffer)this.begin(saved.request,saved.buffer,saved.offset);else this.play(saved.request);this.queue=saved.queue.filter(r=>this.relevant(r,state));}}
  if(this.current){if(!this.relevant(this.current,state)){const queue=this.queue.filter(r=>this.relevant(r,state));this.stop('conversation-closed');this.queue=queue;this.drain();return;}this.spatial(this.current,state);}
  if(this.pending?.scope==='conversation'&&this.pending.actorId&&conversationId!==this.pending.actorId){const queue=this.queue.filter(r=>this.relevant(r,state));this.stop('pending-conversation-closed');this.queue=queue;this.drain();}
  this.queue=this.queue.filter(r=>this.relevant(r,state));this.drain();
  if(this.waiting?.scope==='conversation'&&conversationId!==this.waiting.actorId)this.stop('catalog-conversation-closed');
 }
}
