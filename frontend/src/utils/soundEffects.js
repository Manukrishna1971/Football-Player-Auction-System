// Synthesize sports stadium and auction sound effects using the Web Audio API
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('sound_enabled') !== 'false';
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem('sound_enabled', this.enabled);
    return this.enabled;
  }

  isSoundEnabled() {
    return this.enabled;
  }

  // Bid placed: Pleasant dual-tone high frequency ping
  playBidSound() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      // Audio context error ignore
    }
  }

  // Timer Tick: Crisp short wooden clock tick
  playTickSound(isUrgent = false) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const freq = isUrgent ? 880 : 440;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(isUrgent ? 0.25 : 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  // Auctioneer Gavel Hammer: Deep resonant wooden knock
  playGavelSound() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Double strike
      [0, 0.14].forEach(delay => {
        const now = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
      });
    } catch (e) {}
  }

  // Official Referee Match Whistle: Dual-tone modulated trill (Fox 40 pea-less whistle)
  playWhistleSound(isFinal = false) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bursts = isFinal ? [0, 0.28, 0.6] : [0, 0.22]; // Double or triple blast

      bursts.forEach(offset => {
        const t = now + offset;
        const dur = isFinal && offset === 0.6 ? 0.45 : 0.16;

        [2780, 3100].forEach(baseFreq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          // Rapid 28Hz trill modulation
          const lfo = this.ctx.createOscillator();
          const lfoGain = this.ctx.createGain();
          lfo.frequency.setValueAtTime(28, t);
          lfoGain.gain.setValueAtTime(130, t);
          lfo.connect(osc.frequency);
          lfo.start(t);
          lfo.stop(t + dur);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq, t);

          gain.gain.setValueAtTime(0.01, t);
          gain.gain.linearRampToValueAtTime(0.24, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t);
          osc.stop(t + dur);
        });
      });
    } catch (e) {}
  }

  // Sold Celebration: Fanfare chord progression + crowd cheer swell
  playSoldCelebration() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.playWhistleSound(true); // Final whistle for transfer seal!

      const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      chord.forEach((freq, i) => {
        const now = this.ctx.currentTime + 0.35 + (i * 0.09);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      });
    } catch (e) {}
  }
}

export const soundManager = new SoundManager();

