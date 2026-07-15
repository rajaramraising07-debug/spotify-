export class WebAudioSynth {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private nextNoteTime: number = 0;
  private currentBeat: number = 0;
  private tempo: number = 120;
  private timerId: number | null = null;
  private melody: number[] = [60, 62, 64, 67, 69];
  private synthType: OscillatorType = 'sine';
  private drumBeat: 'dance' | 'chill' | 'rock' | 'none' = 'chill';
  private onBeatCallback?: (beat: number, progress: number) => void;
  private masterGain: GainNode | null = null;

  constructor() {
    // Initialized lazily on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime); // keep volume comfortable
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(0.5, volume * 0.3)), this.ctx.currentTime);
    }
  }

  public start(config: {
    tempo: number;
    melody: number[];
    synthType: 'sine' | 'square' | 'triangle' | 'sawtooth';
    drumBeat: 'dance' | 'chill' | 'rock' | 'none';
    onBeat?: (beat: number, progress: number) => void;
  }) {
    this.initContext();
    if (this.isRunning) this.stop();

    this.tempo = config.tempo || 120;
    this.melody = config.melody || [60, 62, 64, 67, 69];
    this.synthType = config.synthType || 'sine';
    this.drumBeat = config.drumBeat || 'chill';
    this.onBeatCallback = config.onBeat;

    this.isRunning = true;
    this.currentBeat = 0;
    this.nextNoteTime = this.ctx!.currentTime + 0.1;

    this.scheduler();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduler() {
    if (!this.isRunning || !this.ctx) return;

    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime);
      this.advanceBeat();
    }

    // Schedule next polling interval
    this.timerId = window.setTimeout(() => this.scheduler(), 25);
  }

  private advanceBeat() {
    const secondsPerBeat = 60.0 / this.tempo / 2; // 8th notes
    this.nextNoteTime += secondsPerBeat;
    this.currentBeat = (this.currentBeat + 1) % 16;
  }

  private scheduleNote(beat: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    // Trigger visualizer heartbeat
    if (this.onBeatCallback) {
      // simulate song position or beat pulse
      this.onBeatCallback(beat, beat * (60 / this.tempo / 2));
    }

    // --- PLAY DRUM BEATS ---
    if (this.drumBeat !== 'none') {
      const isKick = beat % 4 === 0 || (this.drumBeat === 'dance' && beat % 2 === 0);
      const isSnare = beat % 8 === 4;
      const isHihat = beat % 2 === 1;

      if (isKick) {
        this.playKick(time);
      }
      if (isSnare && this.drumBeat !== 'chill') {
        this.playSnare(time);
      }
      if (isHihat) {
        this.playHihat(time);
      }
    }

    // --- PLAY MELODY NOTE ---
    // Every odd beat, randomly play a note from the pentatonic melody list to make a pleasant soundscape
    if (beat % 2 === 0) {
      // Pick note from melody
      const noteIndex = Math.floor(Math.sin(beat * 0.5 + 1) * 3 + 3) % this.melody.length;
      const midiNote = this.melody[noteIndex];
      const freq = this.midiToFreq(midiNote);
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = this.synthType;
      osc.frequency.setValueAtTime(freq, time);

      // Simple ADSR envelope
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.15, time + 0.03); // Attack
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4); // Decay/Release

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.45);
    }
  }

  private midiToFreq(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  private playKick(time: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.15);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.start(time);
    osc.stop(time + 0.16);
  }

  private playHihat(time: number) {
    if (!this.ctx || !this.masterGain) return;

    // Hihat using bandpassed white noise
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.connect(gain);

    const noiseSize = this.ctx.sampleRate * 0.1;
    const noiseBuffer = this.ctx.createBuffer(1, noiseSize, this.ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1000, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    gain.connect(this.masterGain);
    noiseGain.connect(this.masterGain);

    osc.start(time);
    noiseSource.start(time);
    
    osc.stop(time + 0.1);
    noiseSource.stop(time + 0.11);
  }
}
