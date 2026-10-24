export function modelAttached(model,scene,visible){model.g.visible=visible;if(visible&&model.g.parent!==scene)scene.add(model.g);else if(!visible&&model.g.parent===scene)model.g.removeFromParent();}
