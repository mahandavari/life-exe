"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { makeTargets, helix, random } from "./geometry";
export type SceneHandle = { pulse: () => void; save: () => Promise<void> };
type Props = { stage: number; activity: number; reducedMotion: boolean; onActivate: () => void; onRenderer: (value: string) => void };

const LabScene = forwardRef<SceneHandle, Props>(function LabScene(props, ref) {
  const host = useRef<HTMLDivElement>(null), gpuCanvas = useRef<HTMLCanvasElement>(null), fallbackCanvas = useRef<HTMLCanvasElement>(null);
  const live = useRef(props); live.current = props;
  const pulseAt = useRef(-100), saveImpl = useRef<(() => Promise<void>) | null>(null);
  const [fallback, setFallback] = useState(false);
  useImperativeHandle(ref, () => ({ pulse: () => { pulseAt.current = performance.now()/1000; }, save: async () => { if(!saveImpl.current) throw Error("Renderer unavailable"); await saveImpl.current(); } }), []);
  useEffect(() => {
    let disposed = false, frame = 0, cleanup = () => {};
    const size = () => ({width: Math.max(1,host.current?.clientWidth ?? 600), height: Math.max(1,host.current?.clientHeight ?? 700)});
    const mobile = innerWidth < 700;
    const targets = makeTargets(mobile ? 1100 : 2400);
    const pointer = {x:0,y:0};
    const move = (e: PointerEvent) => { const r=host.current!.getBoundingClientRect(); pointer.x=(e.clientX-r.left)/r.width-.5; pointer.y=(e.clientY-r.top)/r.height-.5; };
    const leave = () => {pointer.x=0;pointer.y=0;};
    host.current?.addEventListener("pointermove",move); host.current?.addEventListener("pointerleave",leave);
    const exportArtwork = async (canvas: HTMLCanvasElement) => {
      const out=document.createElement("canvas"); out.width=1800;out.height=1100;
      const ctx=out.getContext("2d")!; ctx.fillStyle="#060b10";ctx.fillRect(0,0,1800,1100);
      const aspect=canvas.width/canvas.height, h=920, w=h*aspect;
      ctx.drawImage(canvas,1020-w/2,80,w,h);
      ctx.fillStyle="#a4f7dc";ctx.font="18px monospace";ctx.fillText("LIFE.exe  /  NEW VERSION UNLOCKED",100,180);
      ctx.fillStyle="#f2f5f3";ctx.font="72px sans-serif";ctx.fillText("Another year.",100,430);ctx.fillText("Another evolution.",100,520);
      ctx.fillStyle="#94a8ab";ctx.font="18px monospace";ctx.fillText("Built with curiosity, biology & code",100,950);
      const blob=await new Promise<Blob|null>(resolve=>out.toBlob(resolve,"image/png"));if(!blob)throw Error();
      const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="LIFE-exe-next-iteration.png";link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
    };
    const startFallback = () => {
      setFallback(true);live.current.onRenderer("CANVAS 2D");
      const canvas=fallbackCanvas.current!,ctx=canvas.getContext("2d");if(!ctx)return;
      let last=0;
      const draw=(now:number)=>{
        if(disposed)return;frame=requestAnimationFrame(draw);
        if(document.hidden||now-last<33)return;last=now;
        const {width:w,height:h}=size();const d=Math.min(devicePixelRatio,1.5);
        if(canvas.width!==Math.floor(w*d)||canvas.height!==Math.floor(h*d)){canvas.width=w*d;canvas.height=h*d;}
        ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);
        const stage=live.current.stage,src=stage<2?targets.dna:stage===2?targets.neural:targets.cake,t=live.current.reducedMotion?0:now*.00015;
        const rot=t+pointer.x*.4,scale=Math.min(w/7.5,h/9.5);
        for(let i=0;i<src.length;i+=3){const x=src[i],y=src[i+1],z=src[i+2],rx=x*Math.cos(rot)+z*Math.sin(rot),rz=-x*Math.sin(rot)+z*Math.cos(rot),p=9/(9-rz);const sx=w/2+(rx*Math.cos(-.28)-y*Math.sin(-.28))*scale*p,sy=h/2-(rx*Math.sin(-.28)+y*Math.cos(-.28))*scale*p;ctx.fillStyle=i%9===0?"#b6a5f6":"#8aefd9";ctx.globalAlpha=.35+.5*p;ctx.beginPath();ctx.arc(sx,sy,1.1*p,0,Math.PI*2);ctx.fill();}
        ctx.globalAlpha=1;
      }; frame=requestAnimationFrame(draw); saveImpl.current=()=>exportArtwork(canvas);
    };
    void (async()=>{
      try {
        const T=await import("three");if(disposed)return;
        if(new URLSearchParams(location.search).get("renderer")==="canvas")throw Error("Requested fallback");
        const canvas=gpuCanvas.current!, renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:!mobile,powerPreference:"low-power"});
        renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:1.8));renderer.setClearColor(0x000000,0);
        live.current.onRenderer("WEBGL / ADAPTIVE");
        const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.1,60);camera.position.z=13;
        const root=new T.Group();scene.add(root);const dnaGroup=new T.Group();root.add(dnaGroup);
        const dnaMaterials: InstanceType<typeof T.MeshBasicMaterial>[]=[];
        for(let strand=0;strand<2;strand++){
          const curve=new T.CatmullRomCurve3(Array.from({length:180},(_,i)=>new T.Vector3(...helix(i/179,strand))));
          const mat=new T.MeshBasicMaterial({color:strand?0x9d8ce7:0x7df5d5,transparent:true,opacity:.85});dnaMaterials.push(mat);
          dnaGroup.add(new T.Mesh(new T.TubeGeometry(curve,mobile?130:250,.035,6,false),mat));
          const glow=new T.MeshBasicMaterial({color:strand?0x8264ef:0x44e6c1,transparent:true,opacity:.075,depthWrite:false});dnaMaterials.push(glow);
          dnaGroup.add(new T.Mesh(new T.TubeGeometry(curve,130,.13,6,false),glow));
          const nodes=new T.InstancedMesh(new T.SphereGeometry(.069,10,8),mat,48),dummy=new T.Object3D();
          for(let i=0;i<48;i++){dummy.position.set(...helix(i/47,strand));dummy.updateMatrix();nodes.setMatrixAt(i,dummy.matrix);}dnaGroup.add(nodes);
        }
        const rungPositions:number[]=[],rungColors:number[]=[];
        for(let i=0;i<48;i++){
          const a=helix(i/47,0),b=helix(i/47,1),c=new T.Color(i%3===0?0x9787d4:0x66d8c5);
          rungPositions.push(...a,...b);rungColors.push(c.r,c.g,c.b,c.r,c.g,c.b);
        }
        const rg=new T.BufferGeometry();rg.setAttribute("position",new T.Float32BufferAttribute(rungPositions,3));rg.setAttribute("color",new T.Float32BufferAttribute(rungColors,3));
        const rungMaterial=new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.42});dnaGroup.add(new T.LineSegments(rg,rungMaterial));
        const geometry=new T.BufferGeometry(),positions=new Float32Array(targets.dna),colors=new Float32Array(positions.length);
        for(let i=0;i<positions.length/3;i++){const c=new T.Color(i%7===0?0xb2a0ef:i%5===0?0xe2fff3:0x64dec7);colors.set([c.r,c.g,c.b],i*3);}
        geometry.setAttribute("position",new T.BufferAttribute(positions,3));geometry.setAttribute("color",new T.BufferAttribute(colors,3));
        const pointMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,vertexColors:true,blending:T.AdditiveBlending,uniforms:{uSize:{value:(mobile?70:90)*renderer.getPixelRatio()},uPulse:{value:0}},vertexShader:`varying vec3 vColor; uniform float uSize; uniform float uPulse; void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((uSize+uPulse*18.)/-mv.z,1.,14.);}`,fragmentShader:`varying vec3 vColor; void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float a=exp(-d*d*5.);gl_FragColor=vec4(vColor*1.3,a*.9);}`});
        const cloud=new T.Points(geometry,pointMaterial);root.add(cloud);
        const edgePos:number[]=[];targets.edges.forEach(([a,b])=>edgePos.push(...targets.nodes[a],...targets.nodes[b]));
        const edgeGeom=new T.BufferGeometry();edgeGeom.setAttribute("position",new T.Float32BufferAttribute(edgePos,3));
        const edgeMat=new T.LineBasicMaterial({color:0x76b7b2,transparent:true,opacity:0});root.add(new T.LineSegments(edgeGeom,edgeMat));
        const synapseGeom=new T.BufferGeometry();synapseGeom.setAttribute("position",new T.Float32BufferAttribute(targets.nodes.flat(),3));
        const nodeMat=new T.PointsMaterial({color:0xd8fff1,size:.12,transparent:true,opacity:0,blending:T.AdditiveBlending});root.add(new T.Points(synapseGeom,nodeMat));
        const signalArray=new Float32Array(36*3),signalGeom=new T.BufferGeometry();signalGeom.setAttribute("position",new T.BufferAttribute(signalArray,3));
        const signalMat=new T.PointsMaterial({color:0xb4ffe6,size:.085,transparent:true,opacity:0,blending:T.AdditiveBlending});root.add(new T.Points(signalGeom,signalMat));
        const cakeGroup=new T.Group();root.add(cakeGroup);
        const cakeLines:number[]=[];
        for(const [r,y] of [[2.1,-1.45],[2.1,-.37],[1.4,-.15],[1.4,.93]]){
          for(let i=0;i<128;i++){const a=i/128*Math.PI*2,b=(i+1)/128*Math.PI*2;cakeLines.push(Math.cos(a)*r,y,Math.sin(a)*r,Math.cos(b)*r,y,Math.sin(b)*r);}
        }
        for(let i=0;i<20;i++){const a=i/20*Math.PI*2;cakeLines.push(Math.cos(a)*2.1,-1.45,Math.sin(a)*2.1,Math.cos(a)*2.1,-.37,Math.sin(a)*2.1);}
        const cakeGeom=new T.BufferGeometry();cakeGeom.setAttribute("position",new T.Float32BufferAttribute(cakeLines,3));
        const cakeMat=new T.LineBasicMaterial({color:0x8ff3d7,transparent:true,opacity:0});cakeGroup.add(new T.LineSegments(cakeGeom,cakeMat));
        const candleMat=new T.MeshBasicMaterial({color:0xc3ffea,transparent:true,opacity:0});
        const flameMat=new T.MeshBasicMaterial({color:0xffe6b5,transparent:true,opacity:0});
        for(let i=-1;i<=1;i++){
          const candle=new T.Mesh(new T.CylinderGeometry(.025,.025,.8,8),candleMat);candle.position.set(i*.72,1.38,0);cakeGroup.add(candle);
          const flame=new T.Mesh(new T.SphereGeometry(.075,12,8),flameMat);flame.scale.y=2;flame.position.set(i*.72,2.04,0);cakeGroup.add(flame);
        }
        const ambientGeom=new T.BufferGeometry(),amb=new Float32Array((mobile?100:250)*3);
        for(let i=0;i<amb.length;i++)amb[i]=(random(i+1800)-.5)*(i%3===2?7:14);
        ambientGeom.setAttribute("position",new T.BufferAttribute(amb,3));const ambient=new T.Points(ambientGeom,new T.PointsMaterial({color:0x659b9c,size:.018,transparent:true,opacity:.45}));scene.add(ambient);
        let stage=live.current.stage,changed=performance.now()/1000-4,from=new Float32Array(positions),last=0,simTime=0,slowFrames=0;
        const resize=new ResizeObserver(()=>{const {width,height}=size();renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=Math.max(13,9/camera.aspect);camera.updateProjectionMatrix();});resize.observe(host.current!);
        const draw=(now:number)=>{
          if(disposed)return;frame=requestAnimationFrame(draw);if(document.hidden)return;
          const reduced=live.current.reducedMotion;
          if(now-last<(reduced?100:mobile?30:15))return;
          const delta=Math.min((now-last)/1000,.06);last=now;const t=now/1000;if(!reduced)simTime+=delta;
          if(delta>.045&&!reduced)slowFrames++;if(slowFrames===100){renderer.setPixelRatio(1);slowFrames++;}
          if(stage!==live.current.stage){
            stage=live.current.stage;changed=t;from=new Float32Array(positions);
            for(let i=0;i<positions.length/3;i++){const c=new T.Color(stage===3&&i%10===9?0xffdda4:i%7===0?0xb2a0ef:i%5===0?0xe2fff3:0x64dec7);colors.set([c.r,c.g,c.b],i*3);}
            geometry.attributes.color.needsUpdate=true;
          }
          const age=t-changed,progress=reduced?1:Math.min(age/2.5,1),ease=progress*progress*(3-2*progress);
          const cakeFade=stage===3?(reduced?1:Math.max(0,Math.min((age-1.6)/1.3,1))):0;
          cakeGroup.visible=cakeFade>0;cakeMat.opacity=cakeFade*.52;candleMat.opacity=cakeFade*.9;flameMat.opacity=cakeFade;
          const target=stage<2?targets.dna:stage===2?targets.neural:targets.cake;
          const burst=stage>=2?Math.sin(progress*Math.PI)*(stage===3?1:.55):0;
          for(let i=0;i<positions.length;i++){
            const drift=reduced?0:Math.sin(simTime*.7+i*.23)*.012;
            const contract=stage===3&&progress<.24?1-progress/.24:0;
            positions[i]=contract>0?from[i]*contract:from[i]*(1-ease)+target[i]*ease+targets.bursts[i]*burst+drift;
          }
          geometry.attributes.position.needsUpdate=true;
          const fade=stage<2?1:reduced?0:Math.max(0,1-age/1.2);
          dnaGroup.visible=fade>0;
          dnaMaterials.forEach((m,i)=>m.opacity=fade*(i%2?.075:.85));rungMaterial.opacity=fade*.42;
          edgeMat.opacity=stage===2?(reduced?.42:Math.min(age/2.4,.42)):0;nodeMat.opacity=stage===2?(reduced?1:Math.min(age/2,1)):0;
          edgeGeom.setDrawRange(0,Math.min(targets.edges.length,Math.floor(targets.edges.length*(.46+live.current.activity*.18)))*2);
          const pulse=Math.max(0,1-(t-pulseAt.current)/1.5);pointMaterial.uniforms.uPulse.value=reduced?0:pulse;
          signalMat.opacity=stage===2?(reduced?.5:.4+pulse*.6):0;
          for(let i=0;i<36;i++){const edge=targets.edges[(i*7)%targets.edges.length],f=reduced?.5:(simTime*.24+i/36+pulse*.1)%1;for(let k=0;k<3;k++)signalArray[i*3+k]=targets.nodes[edge[0]][k]*(1-f)+targets.nodes[edge[1]][k]*f;}signalGeom.attributes.position.needsUpdate=true;
          root.rotation.z=stage<2?-.37:stage===3?-.04:.03;
          root.rotation.y=(reduced?.22:simTime*(stage===3?.07:.14))+pointer.x*.4;
          root.rotation.x=pointer.y*.12;root.scale.setScalar(stage===3?1.12:1);
          ambient.rotation.y=reduced?0:simTime*.015;
          renderer.render(scene,camera);
        };
        const contextLost=(e:Event)=>{e.preventDefault();cancelAnimationFrame(frame);resize.disconnect();renderer.dispose();startFallback();};canvas.addEventListener("webglcontextlost",contextLost);
        cleanup=()=>{resize.disconnect();canvas.removeEventListener("webglcontextlost",contextLost);scene.traverse(obj=>{const o=obj as InstanceType<typeof T.Mesh>;o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();};
        saveImpl.current=async()=>{renderer.render(scene,camera);await exportArtwork(canvas);};frame=requestAnimationFrame(draw);
      }catch{if(!disposed)startFallback();}
    })();
    return ()=>{disposed=true;cancelAnimationFrame(frame);cleanup();host.current?.removeEventListener("pointermove",move);host.current?.removeEventListener("pointerleave",leave);saveImpl.current=null;};
  }, []);
  const down=useRef({x:0,y:0});
  return <div ref={host} className="scene-canvas" onPointerDown={e=>{down.current={x:e.clientX,y:e.clientY};}} onPointerUp={e=>{if(Math.hypot(e.clientX-down.current.x,e.clientY-down.current.y)<15)live.current.onActivate();}} aria-hidden="true"><canvas ref={gpuCanvas} style={{display:fallback?"none":"block"}}/><canvas ref={fallbackCanvas} style={{display:fallback?"block":"none"}}/>{fallback&&<span className="fallback-label">LIGHTWEIGHT CANVAS MODE</span>}</div>;
});
export default LabScene;

