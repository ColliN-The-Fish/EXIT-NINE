export const fatalPresentationActive=s=>!!s.deathCinematic&&!s.finished&&!s.paused;
export function clearFatalPresentation(w,body){for(const key of ['--fatal-x','--fatal-y','--fatal-roll'])body.style.removeProperty(key);if(w.fatalCreature){w.fatalCreature.g.visible=false;w.fatalCreature.g.removeFromParent();}if(w.fatalVeil)w.fatalVeil.style.opacity='0';}
