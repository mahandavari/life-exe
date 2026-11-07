export type Vec = [number, number, number];
export const random = (n: number) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
export function helix(t: number, strand = 0): Vec { const a = t * Math.PI * 5 + strand * Math.PI; return [Math.cos(a) * 1.06, (t - .5) * 7.2, Math.sin(a) * 1.06]; }
export function networkNodes(): Vec[] {
  return Array.from({length:76}, (_,i) => {
    const z = 1 - 2 * (i + .5) / 76, a = i * Math.PI * (3 - Math.sqrt(5));
    const r = Math.sqrt(1 - z * z) * (i % 3 === 0 ? .65 : 1);
    return [Math.cos(a) * r * 2.9, z * 2.65, Math.sin(a) * r * 2];
  });
}
export function networkEdges(nodes: Vec[]): [number, number][] {
  const edges: [number, number][] = [];
  nodes.forEach((a,i) => nodes.forEach((b,j) => { if(j > i && Math.hypot(...a.map((v,k)=>v-b[k])) < 1.5) edges.push([i,j]); }));
  return edges;
}
export function makeTargets(count: number) {
  const nodes = networkNodes(), edges = networkEdges(nodes);
  const dna = new Float32Array(count*3), neural = new Float32Array(count*3), cake = new Float32Array(count*3), bursts = new Float32Array(count*3);
  for(let i=0;i<count;i++) {
    const t = random(i+1), a = random(i+10)*Math.PI*2;
    const h = helix(t, i%2), other = helix(t, 1-i%2);
    const mix = i%5 === 0 ? random(i+20) : 0;
    const edge = edges[i%edges.length], f = random(i+24);
    for(let k=0;k<3;k++) { dna[i*3+k] = h[k]*(1-mix)+other[k]*mix+(random(i*3+k+30)-.5)*.1; neural[i*3+k] = nodes[edge[0]][k]*(1-f)+nodes[edge[1]][k]*f; bursts[i*3+k] = (random(i*3+k+100)-.5)*11; }
    let p: Vec;
    if(i%10 < 8) {
      const upper = i%2 === 0, radius = upper ? 1.4 : 2.1;
      const y = upper ? -.15 : -1.45;
      const side = i%4 < 2, ring = side ? radius : Math.sqrt(random(i+50))*radius;
      p = [Math.cos(a)*ring, side ? y + random(i+51)*1.08 : y+1.08, Math.sin(a)*ring];
    } else if(i%10 === 8) {
      const candle = (i%3-1)*.72; p=[candle+Math.cos(a)*.07, .98+random(i+80)*.8, Math.sin(a)*.07];
    } else {
      const candle = (i%3-1)*.72, f = random(i+70);
      p=[candle+Math.cos(a)*.13*Math.sin(f*Math.PI), 1.84+f*.48, Math.sin(a)*.13*Math.sin(f*Math.PI)];
    }
    cake.set(p,i*3);
  }
  return {dna, neural, cake, bursts, nodes, edges};
}
