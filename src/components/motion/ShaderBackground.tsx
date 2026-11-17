"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Brand shader: slow flowing indigo→purple field with an ordered (Bayer) dither,
 * matching the dither texture from the design system. Reacts to the pointer.
 */
const frag = /* glsl */ `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;
float bayer(vec2 p){ // 4x4 ordered dither
  int x=int(mod(p.x,4.)), y=int(mod(p.y,4.)); int i=x+y*4;
  float m[16]; m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;
  m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
  for(int k=0;k<16;k++){ if(k==i) return m[k]/16.; } return 0.;
}
float n(vec2 p){ return sin(p.x)*sin(p.y); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 m = uMouse;
  float t = uTime*0.08;
  float f = 0.;
  vec2 p = uv*3.;
  for(int i=0;i<4;i++){ p += vec2(n(p*1.3+t), n(p.yx*1.1-t)); f += n(p)*0.5; }
  f = f*0.5+0.5;
  float glow = smoothstep(0.55, 0.0, distance(uv, m));
  vec3 night = vec3(0.118,0.129,0.267);   // #1E2144
  vec3 blue  = vec3(0.282,0.310,0.639);   // #484FA3
  vec3 purp  = vec3(0.329,0.141,0.463);   // #542476
  vec3 col = mix(night, blue, f*0.55 + glow*0.35);
  col = mix(col, purp, smoothstep(0.35,1.0,uv.x*0.7+f*0.4)*0.6);
  float d = bayer(gl_FragCoord.xy/2.);
  float lum = dot(col, vec3(0.299,0.587,0.114));
  col += (step(d, fract(lum*6.0)) - 0.5) * 0.035;  // subtle dither grain
  gl_FragColor = vec4(col,1.0);
}`;

export default function ShaderBackground({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    el.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.6) },
    };
    const mat = new THREE.ShaderMaterial({ uniforms, fragmentShader: frag, vertexShader: "void main(){gl_Position=vec4(position,1.);}" });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const target = new THREE.Vector2(0.5, 0.6);
    const resize = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height, false);
      uniforms.uRes.value.set(width * renderer.getPixelRatio(), height * renderer.getPixelRatio());
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    window.addEventListener("pointermove", onMove);
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      uniforms.uTime.value = reduce ? 0 : t / 1000;
      uniforms.uMouse.value.lerp(target, 0.05);
      renderer.render(scene, cam);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      renderer.dispose();
      mat.dispose();
      el.innerHTML = "";
    };
  }, []);
  return <div ref={host} aria-hidden className={className} />;
}
