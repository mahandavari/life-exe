export class LifeAudio {
  private context: AudioContext | null = null;
  enabled = false;
  async toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) { this.context ??= new AudioContext(); await this.context.resume(); this.play(0); }
    return this.enabled;
  }
  play(stage: number) {
    if (!this.enabled || !this.context) return;
    const ctx = this.context;
    [0, 7, 12].forEach((note, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain(), start = ctx.currentTime + i * .07;
      osc.frequency.value = 174 * 2 ** ((note + stage * 2) / 12);
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.035, start + .025); gain.gain.exponentialRampToValueAtTime(.001, start + .55);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(start); osc.stop(start + .6);
    });
  }
  dispose() { void this.context?.close(); }
}
