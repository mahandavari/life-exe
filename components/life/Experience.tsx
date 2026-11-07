"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowRight, Volume2, VolumeX, RotateCcw, Download, Dna, Sparkles, X, Terminal } from "lucide-react";
import { bootLines, sceneCopy, stages } from "./content";
import { LifeAudio } from "./audio";
import LabScene, { type SceneHandle } from "./LabScene";

export default function Experience() {
  const [stage, setStage] = useState(0), [count, setCount] = useState(0), [lines, setLines] = useState(0);
  const [sound, setSound] = useState(false), [motion, setMotion] = useState(false), [info, setInfo] = useState(false);
  const [command, setCommand] = useState(""), [response, setResponse] = useState(""), [toast, setToast] = useState(""), [renderer, setRenderer] = useState("CONNECTING");
  const audio = useRef<LifeAudio | null>(null), scene = useRef<SceneHandle | null>(null), countRef = useRef(0);
  const lock = useRef(false), transition = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copy = sceneCopy[stage];
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { window.scrollTo({top:0,behavior:"instant"}); heading.current?.focus({preventScroll:true}); }, [stage]);
  useEffect(() => {
    audio.current = new LifeAudio();
    const media = matchMedia("(prefers-reduced-motion: reduce)"); setMotion(media.matches);
    const listener = () => setMotion(media.matches); media.addEventListener("change", listener);
    return () => { audio.current?.dispose(); media.removeEventListener("change", listener); if (transition.current) clearTimeout(transition.current); };
  }, []);
  useEffect(() => { if (stage !== 0) return; setLines(0); const timer = setInterval(() => setLines(v => Math.min(4, v + 1)), motion ? 60 : 650); return () => clearInterval(timer); }, [stage, motion]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 3500); return () => clearTimeout(t); }, [toast]);
  const go = useCallback((next: number) => {
    if (transition.current) clearTimeout(transition.current); lock.current = false; countRef.current = 0;
    setStage(next); setCount(0); setResponse(""); audio.current?.play(next);
  }, []);
  const activate = useCallback(() => {
    if (stage === 0 || stage === 3 || lock.current) return;
    scene.current?.pulse(); audio.current?.play(stage); countRef.current++; setCount(countRef.current);
    if (countRef.current >= 3) { lock.current = true; transition.current = setTimeout(() => go(stage + 1), motion ? 500 : 1600); }
  }, [stage, go, motion]);
  const submitCommand = (event: React.FormEvent) => {
    event.preventDefault(); const value = command.trim().toLowerCase();
    const replies: Record<string, string> = {
      help: "Commands: initiate_sequence · status · coffee · sudo evolve · ATGC",
      status: "FICTIONAL DIAGNOSTICS / Genomic stability: acceptable. Neural activity: questionable. Evolution: ongoing.",
      coffee: "FICTIONAL DIAGNOSTIC / Coffee dependency: critical. Please insert one espresso.",
      "sudo evolve": "Permission granted. Becoming yourself requires no administrator.",
      atgc: "A, T, G, C. Four letters. An unreasonable number of possibilities.",
      "42": "Meaning of life located. Further peer review required.",
    };
    if (["start", "initiate_sequence", "run"].includes(value)) go(1); else setResponse(replies[value] ?? "Unknown command. Curiosity detected. Try ‘help’."); setCommand("");
  };
  const save = async () => { try { if(!scene.current) throw Error(); await scene.current.save(); setToast("Artwork saved. Another iteration, captured."); } catch { setToast("Saving is unavailable here. You can take a screenshot instead."); } };
  return <main className={`experience stage-${stage} ${motion ? "still" : ""}`}>
    <div className="grain" aria-hidden="true"/>
    <header className="topbar">
      <a className="wordmark" href="#" aria-label="LIFE.exe — replay" onClick={e => { e.preventDefault(); go(0); }}><span className="logo-mark"><i/><i/><i/></span>LIFE<span className="exe">.exe</span><span className="version">/ EXPERIMENT 001</span></a>
      <nav className="stage-nav" aria-label="Experience progress">{stages.map((name, index) => <button key={name} className={`${index === stage ? "current" : ""} ${index < stage ? "complete" : ""}`} disabled={index > stage} onClick={() => go(index)} aria-current={index === stage ? "step" : undefined}><span>0{index + 1}</span><b>{name}</b></button>)}</nav>
      <div className="header-actions"><button className="sound-control" aria-label={sound ? "Mute sound" : "Enable sound"} aria-pressed={sound} onClick={async () => { try { setSound(await audio.current!.toggle()); } catch { setToast("Audio is unavailable in this browser."); } }}>{sound ? <Volume2 size={15}/> : <VolumeX size={15}/>}<span>SOUND {sound ? "ON" : "OFF"}</span></button><button className="info-control" aria-label="About this experiment" onClick={() => setInfo(true)}>i</button></div>
    </header>
    <section className="laboratory" aria-label={stages[stage]}>
      <div className="coordinates" aria-hidden="true">SYS / BIOLOGICAL COMPUTING INTERFACE<span>EST. ∞ POSSIBILITIES</span></div>
      <div className="visual-area"><div className="orbit orbit-one"/><div className="orbit orbit-two"/>
        <LabScene ref={scene} stage={stage} activity={count} reducedMotion={motion} onActivate={activate} onRenderer={setRenderer}/>
        <div className="specimen-label"><span className="tiny-cross">+</span><span>{stage < 2 ? "FIG 01 — DIGITAL ORGANISM" : stage === 2 ? "FIG 02 — CONNECTED CONSCIOUSNESS" : "FIG 03 — THE NEXT ITERATION"}<small>{stage < 2 ? "DOUBLE HELIX / INTERACTIVE MODEL" : stage === 2 ? "SYNAPTIC FIELD / INTERACTIVE MODEL" : "LIFE, STILL IN DEVELOPMENT"}</small></span></div>
        <div className="visual-telemetry" aria-hidden="true"><span>◈ {stage < 2 ? "A—T / G—C" : stage === 2 ? "INPUT → POSSIBILITY" : "EVOLUTION ∞"}</span><span>{stage === 1 ? `${count.toString().padStart(2,"0")} MUTATIONS` : stage === 2 ? `${count.toString().padStart(2,"0")} SIGNALS` : "SYSTEM ALIVE"}</span></div>
      </div>
      <div className="story" key={stage}>
        <div className="eyebrow"><span className="live-dot"/>{copy.label}</div>
        <h1 ref={heading} tabIndex={-1}>{copy.title[0]}<br/><em>{copy.title[1]}</em><span className="title-period" aria-hidden="true">_</span></h1>
        <p className="description">{copy.description}</p>
        {stage === 0 ? <div className="terminal-panel"><div className="terminal-bar"><span><Terminal size={13}/> LIFE.exe BIOS</span><span className="terminal-status">● LIVE SESSION</span></div>
          <div className="boot-output" aria-label="System boot status">{bootLines.map(([text, status], index) => <div key={text} className={lines > index ? "boot-line visible" : "boot-line"}><span><b>›</b> {text}...</span><small>{status}</small></div>)}</div>
          <form className="command-line" onSubmit={submitCommand}><label htmlFor="terminal-command">&gt;</label><input id="terminal-command" value={command} onChange={e => setCommand(e.target.value)} placeholder="type ‘help’ to explore" autoComplete="off" autoCapitalize="none" spellCheck={false} aria-label="Terminal command"/><button type="submit" aria-label="Run terminal command">↵</button></form>{response && <p className="command-response" role="status">{response}</p>}
        </div> : stage < 3 ? <div className="interaction-panel"><div className="interaction-header"><span>{stage === 1 ? "GENOME INITIALIZED" : "NEURAL FIELD ONLINE"}</span><span>{count}/03</span></div><div className="signal-meter">{Array.from({length:30},(_,i) => <i key={i} className={i < count * 10 ? "filled" : ""}/>)}</div><p aria-live="polite">{count >= 3 ? "SYNCHRONIZED. PREPARING UPGRADE..." : count ? (stage === 1 ? "SEQUENCE EVOLVING — CHANGE IS BEAUTIFUL" : "NEW CONNECTIONS FORMED — MEMORY UPDATED") : copy.instruction}</p></div> : <div className="reveal-note"><span>✧</span><p>No final form. No finish line.<br/>Just the beautiful act of becoming.</p></div>}
        <div className="primary-actions">{stage === 0 ? <button className="primary-button" onClick={() => go(1)}>Initiate sequence <ArrowUpRight size={20}/></button> : stage < 3 ? <button className="primary-button" disabled={count >= 3} onClick={activate}>{count >= 3 ? "Synchronizing" : stage === 1 ? "Introduce a mutation" : "Activate a neuron"}{stage === 1 ? <Dna size={19}/> : <Sparkles size={19}/>}</button> : <button className="primary-button" onClick={() => go(0)}>Replay experience <RotateCcw size={17}/></button>}{stage === 0 ? <button className="text-button" onClick={() => go(1)}>Skip intro <ArrowRight size={15}/></button> : stage < 3 ? <button className="text-button" onClick={() => go(stage + 1)}>Continue <ArrowRight size={15}/></button> : <button className="text-button" onClick={save}>Save artwork <Download size={16}/></button>}</div>
        <p className="under-action">{stage === 0 ? "≈ 45 SECONDS · BEST EXPERIENCED WITH CURIOSITY" : stage < 3 ? "CLICK, TAP, OR USE THE BUTTON ABOVE TO INTERACT" : copy.instruction.toUpperCase()}</p>
      </div><div className="side-index" aria-hidden="true">{String(stage + 1).padStart(2,"0")}<span>/ 04</span></div>
    </section>
    <footer className="bottom-bar"><div><span className="live-dot"/><span>{stage === 3 ? "STATUS: EVOLVING" : "ALL SYSTEMS WITHIN POSSIBILITY"}</span></div><div className="footer-center">ANOTHER YEAR. ANOTHER ITERATION.</div><button className="motion-control" aria-pressed={motion} onClick={() => setMotion(v => !v)}>{motion ? "MOTION PAUSED" : "MOTION ON"}<span className={motion ? "toggle" : "toggle on"}/></button></footer>
    <div className="journey-track" aria-hidden="true"><span style={{width:`${(stage+1)*25}%`}}/></div>{toast && <div className="toast" role="status">{toast}</div>}
    {info && <div className="modal-backdrop" onClick={() => setInfo(false)}><section className="about-dialog" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={e => e.stopPropagation()} onKeyDown={e => { if(e.key === "Escape") setInfo(false); if(e.key === "Tab") { e.preventDefault(); (e.currentTarget.querySelector("button") as HTMLButtonElement)?.focus(); } }}><button autoFocus aria-label="Close about" onClick={() => setInfo(false)}><X size={20}/></button><span className="eyebrow">A SMALL EXPERIMENT</span><h2 id="about-title">Life is still<br/>in development.</h2><p>A fictional biological computing system. Three small changes, three sparks of curiosity, and one unexpected upgrade.</p><p>Use the buttons or tap the artwork. Sound is optional. Motion can be paused at any time.</p><div className="about-meta"><span>RENDERER / {renderer}</span><span>NO DATA COLLECTED</span></div></section></div>}
  </main>;
}
