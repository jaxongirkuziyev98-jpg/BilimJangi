class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  public setEnabled(val: boolean): void {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.14,
    delay = 0
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration + 0.02);
    } catch {
      // Ignore audio errors if blocked by browser autoplay policy
    }
  }

  public click(): void {
    this.playTone(540, 0.06, 'triangle', 0.08);
  }

  public correct(): void {
    this.playTone(523.25, 0.12, 'triangle', 0.14, 0);
    this.playTone(659.25, 0.14, 'triangle', 0.14, 0.08);
    this.playTone(783.99, 0.2, 'sine', 0.15, 0.16);
  }

  public wrong(): void {
    this.playTone(220, 0.16, 'sawtooth', 0.09, 0);
    this.playTone(175, 0.22, 'sawtooth', 0.08, 0.12);
  }

  public streak(): void {
    this.playTone(587.33, 0.1, 'triangle', 0.14, 0);
    this.playTone(783.99, 0.1, 'triangle', 0.14, 0.07);
    this.playTone(987.77, 0.12, 'triangle', 0.15, 0.14);
    this.playTone(1174.66, 0.24, 'sine', 0.16, 0.21);
  }

  public countdownTick(): void {
    this.playTone(440, 0.12, 'sine', 0.14, 0);
  }

  public countdownGo(): void {
    this.playTone(523.25, 0.12, 'triangle', 0.16, 0);
    this.playTone(783.99, 0.14, 'triangle', 0.16, 0.08);
    this.playTone(1046.5, 0.3, 'sine', 0.18, 0.16);
  }

  public timerTick(): void {
    this.playTone(880, 0.05, 'square', 0.04, 0);
  }

  public pull(): void {
    this.playTone(300, 0.09, 'triangle', 0.1, 0);
    this.playTone(420, 0.09, 'triangle', 0.1, 0.05);
  }

  public victory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const delays = [0, 0.1, 0.2, 0.32, 0.48, 0.6];
    notes.forEach((n, idx) => {
      this.playTone(n, idx === notes.length - 1 ? 0.4 : 0.14, 'triangle', 0.15, delays[idx]);
    });
  }
}

export const soundEngine = new SoundEngine();
