(function(){"use strict";const m={k_hue:`
vec4 k_hue(vec4 color, float shift) {
  float I = dot(color, vec4(0.596, -0.275, -0.321, 0.0));
  float Q = dot(color, vec4(0.212, -0.523, 0.311, 0.0));
  float hue = atan(Q, I);
  float chroma = sqrt(I * I + Q * Q);
  hue += shift;
  Q = chroma * sin(hue);
  I = chroma * cos(hue);
  vec4 yIQ = vec4(dot(color, vec4(0.299, 0.587, 0.114, 0.0)), I, Q, 0.0);
  color.r = dot(yIQ, vec4(1.0, 0.956, 0.621, 0.0));
  color.g = dot(yIQ, vec4(1.0, -0.272, -0.647, 0.0));
  color.b = dot(yIQ, vec4(1.0, -1.107, 1.704, 0.0));
  return color;
}
`,k_kale:`
vec2 k_kale(vec2 uv, vec2 offset, float sides) {
  float angle = atan(uv.y, uv.x);
  angle = ((angle / 3.14159265359) + 1.0) * 0.5;
  angle = mod(angle, 1.0 / sides) * sides;
  angle = -abs(2.0 * angle - 1.0) + 1.0;
  angle = angle;
  float y = length(uv);
  angle = angle * (y);
  return vec2(angle, y) - offset;
}
`,k_orb:`
vec4 k_orb(vec2 uv, float size, vec2 position, vec3 color, float contrast) {
  return pow(vec4(size / length(uv + position) * color, 1.), vec4(contrast));
}
`,k_rainbow:`
vec3 k_rainbow(float progress, float stretch, float offset) {
  return vec3(cos(vec3(-2, 0, -1) * 3.14159265359 * 2. / 3. + (2. * 3.14159265359) * (progress * stretch) + offset) * 0.5 + 0.5);
}
`,k_rotate2d:`
mat2 k_rotate2d(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}
`,k_swap:`
vec2 k_swap(vec2 uv, vec2 uv2, bool val, bool valTween, float valTweenProgress) {
  return valTween
    ? (val ? mix(uv, uv2, valTweenProgress) : mix(uv2, uv, valTweenProgress))
    : (val ? uv2 : uv);
}
`,k_uv:`
vec2 k_uv (vec4 fragCoord) {
  vec2 uv = -1. + 2. * fragCoord.xy / resolution.xy;
  uv.x *= resolution.x / resolution.y;
  return uv;
}
`},_=Object.keys(m).reduce((o,r)=>(o+=`${m[r]}`,o),`
`),F=`
attribute vec2 position;

void main() {
  gl_Position = vec4(position, 0, 1);
}
`,U=[["time",0,[0,0,1,.001]],["stream",0,[0,0,1,.001]],["resolution",2,[1920,1080]],["volume",0,[1,0,1,.001]],["scroll",0,[0,0,1,.001]]],u={0:"float",1:"bool",2:"vec2",3:"vec3",4:"vec4"},x={0:"1f",1:"1f",2:"2fv",3:"3fv",4:"4fv"},k=["precision mediump float;","#define PI 3.14159265359","#define TWO_PI 2. * PI","#define iTime time","#define iResolution resolution","#define iMouse vec2(0., 0.)"].join(`
`);`${U.reduce((o,r)=>{const t=r[0],n=r[1];return o+=`uniform ${u[n]} ${t};
`,o},"")}`;const S=[["time",0,[0,0,1,.001]],["stream",0,[0,0,1,.001]],["resolution",2,[1920,1080]],["volume",0,[1,0,1,.001]],["scroll",0,[0,0,1,.001]]],p=S.reduce((o,r)=>{const t=r[0],n=r[1];return o+=`uniform ${u[n]} ${t};
`,o},"");let e=null,a=null,c={},g={},f=null,d=!1,w=0,A=1,E=null;self.addEventListener("message",async o=>{const r=o.data;try{switch(r.type){case"init":await M(r);break;case"update-uniforms":N(r);break;case"update-stream-volume":w=r.stream,A=r.volume;break;case"resize":O(r);break;case"start":y();break;case"stop":Q();break}}catch(t){self.postMessage({type:"error",id:r.id,error:t instanceof Error?t.message:"Unknown error"})}});function I(o){return o.reduce((r,[t,n])=>(r+=`uniform ${u[n]} ${t};
`,n===1&&(r+=`uniform ${u[1]} ${t}Tween;
`,r+=`uniform ${u[0]} ${t}TweenProgress;
`),r),"")}function W(o,r){return`
${k}
${p}
${I(r)}
${_}
${o}`}function D(o){return`
${k}
${p}
${I(o)}
${_}
${F}`}function T(o,r){if(!e)return null;const t=e.createShader(o);if(!t)return null;if(e.shaderSource(t,r),e.compileShader(t),!e.getShaderParameter(t,e.COMPILE_STATUS)){const n=e.getShaderInfoLog(t);return console.error("[ShaderWorker] Shader compilation failed:",n),e.deleteShader(t),null}return t}async function M(o){const{id:r,canvas:t,shader:n,uniforms:s,width:l,height:h,dpr:R}=o;if(e=t.getContext("webgl2"),!e)throw new Error("WebGL2 not supported in worker");if(a=e.createProgram(),!a)throw new Error("Failed to create program");const $=T(e.VERTEX_SHADER,D(s)),P=T(e.FRAGMENT_SHADER,W(n,s));if(!$||!P)throw new Error("Shader compilation failed");if(e.attachShader(a,$),e.attachShader(a,P),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS)){const i=e.getProgramInfoLog(a);throw new Error(`Program linking failed: ${i}`)}e.useProgram(a),E=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,E),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);const L=e.getAttribLocation(a,"position");e.enableVertexAttribArray(L),e.vertexAttribPointer(L,2,e.FLOAT,!1,0,0);const C=[...S,...s];c={},g={},C.forEach(([i])=>{c[i]=e.getUniformLocation(a,i),c[i]||console.warn(`[ShaderWorker] Could not find uniform: ${i}`)}),s.forEach(([i,B,V])=>{g[i]={type:B,value:V}}),e.viewport(0,0,l*R,h*R),console.log("[ShaderWorker] Initialized successfully"),self.postMessage({type:"ready",id:r}),y()}function N(o){o.uniforms.forEach(([r,t,n])=>{c[r]!==void 0&&(g[r]={type:t,value:n})})}function O(o){if(!e)return;const{width:r,height:t,dpr:n}=o;e.viewport(0,0,r*n,t*n)}function v(o,r,t){if(!e||!c[o])return;const n=c[o],l=`uniform${x[r]}`;try{e[l](n,t)}catch(h){console.warn(`[ShaderWorker] Error setting uniform ${o}:`,h)}}function b(o){if(!e||!a||!d)return;const r=o/1e3;v("resolution",2,[e.canvas.width,e.canvas.height]),v("time",0,r),v("stream",0,w||r),v("volume",0,A),Object.entries(g).forEach(([t,{type:n,value:s}])=>{const l=n===0&&Array.isArray(s)?s[0]:s;v(t,n,l)}),e.drawArrays(e.TRIANGLE_STRIP,0,4),d&&(f=requestAnimationFrame(b))}function y(){d||(d=!0,f=requestAnimationFrame(b),console.log("[ShaderWorker] Started rendering loop"))}function Q(){d=!1,f!==null&&(cancelAnimationFrame(f),f=null),console.log("[ShaderWorker] Stopped rendering loop")}self.postMessage({type:"ready"})})();
