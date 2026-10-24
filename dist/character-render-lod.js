// Finger joints remain fully animated in the rig. Sub-pixel phalanges are only
// drawn within observation/grabbing distance; palms and body motion stay visible.
export function characterDetail(distance){return distance<3.8;}
export function applyCharacterLod(w){for(const m of [...Object.values(w.people),...Object.values(w.monsters)]){if(!m.g.visible)continue;const full=characterDetail(Math.hypot(m.g.position.x-w.camera.position.x,m.g.position.z-w.camera.position.z));for(const a of m.arms||[])for(const f of a.fingers||[])f.joint.visible=full;}}
