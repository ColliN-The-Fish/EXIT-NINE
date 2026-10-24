import * as T from './vendor/three.module.js';
// Render the 3D scene at its chosen resolution, then dither in display space.
// HTML text and physical screen textures keep their original resolution.
export class RetroRender{
 constructor(renderer){this.renderer=renderer;this.target=new T.WebGLRenderTarget(1,1,{minFilter:T.NearestFilter,magFilter:T.NearestFilter,depthBuffer:true});this.scene=new T.Scene();this.camera=new T.OrthographicCamera(-1,1,1,-1,0,1);this.material=new T.ShaderMaterial({uniforms:{image:{value:this.target.texture},clock:{value:0},testerNight:{value:0},fatal:{value:0}},depthTest:false,depthWrite:false,toneMapped:true,vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`uniform sampler2D image;uniform float clock;uniform float testerNight;uniform float fatal;varying vec2 uv0;
 float bayer(vec2 p){vec2 a=mod(floor(p),2.);vec2 b=mod(floor(p/2.),2.);return (mod(a.x+a.y,2.)*2.+a.y+4.*(mod(b.x+b.y,2.)*2.+b.y)+.5)/16.;}
 void main(){gl_FragColor=texture2D(image,uv0);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 vec2 grid=gl_FragCoord.xy;float d=bayer(grid)-.5;float grain=fract(sin(dot(grid+floor(clock*8.),vec2(12.9898,78.233)))*43758.5453)-.5;
 if(testerNight>.5){float l=dot(gl_FragColor.rgb,vec3(.21,.72,.07));gl_FragColor.rgb=vec3(.22,1.,.40)*sqrt(l);}
 gl_FragColor.rgb=clamp(floor(gl_FragColor.rgb*48.+d*.65+.5)/48.+grain*.005,0.,1.);float grey=dot(gl_FragColor.rgb,vec3(.2126,.7152,.0722));vec3 fatalColour=(mix(vec3(grey),gl_FragColor.rgb,.55)-.5)*1.15+.5;gl_FragColor.rgb=mix(gl_FragColor.rgb,clamp(fatalColour,0.,1.),fatal);}`});this.scene.add(new T.Mesh(new T.PlaneGeometry(2,2),this.material));}
 resize(width,height){this.target.setSize(width,height);}
 render(scene,camera,time=0){this.material.uniforms.clock.value=time;this.renderer.setRenderTarget(this.target);this.renderer.render(scene,camera);this.lastSceneInfo={calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles};this.renderer.setRenderTarget(null);this.renderer.render(this.scene,this.camera);}
}
