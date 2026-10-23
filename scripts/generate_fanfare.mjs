import fs from 'fs';
import path from 'path';

export function generateFanfareWavBuffer() {
  const SAMPLE_RATE = 44100;
  const DURATION_SEC = 12.5;
  const NUM_SAMPLES = Math.floor(SAMPLE_RATE * DURATION_SEC);
  const NUM_CHANNELS = 2; // Stereo

  const byteLength = NUM_SAMPLES * NUM_CHANNELS * 2;
  const buffer = Buffer.alloc(44 + byteLength);

  // 1. RIFF Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + byteLength, 4);
  buffer.write('WAVE', 8);

  // 2. fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(NUM_CHANNELS, 22); // Stereo
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * 2, 28);
  buffer.writeUInt16LE(NUM_CHANNELS * 2, 32);
  buffer.writeUInt16LE(16, 34);

  // 3. data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(byteLength, 40);

  const leftChannel = new Float64Array(NUM_SAMPLES);
  const rightChannel = new Float64Array(NUM_SAMPLES);

  const noteFreq = {
    C3: 130.81, G3: 196.00, C4: 261.63, D4: 293.66, E4: 329.63,
    F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
    D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
    B5: 987.77, C6: 1046.50
  };

  function addBrassNote(freq, startTime, duration, volume = 0.35, pan = 0) {
    const startSample = Math.floor(startTime * SAMPLE_RATE);
    const endSample = Math.min(NUM_SAMPLES, Math.floor((startTime + duration + 0.8) * SAMPLE_RATE));
    const lGain = (1 - pan) * 0.5;
    const rGain = (1 + pan) * 0.5;

    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / SAMPLE_RATE;
      if (t > duration + 0.8) break;

      let env = 0;
      if (t < 0.04) {
        env = t / 0.04;
      } else if (t < duration) {
        env = 1.0 - 0.15 * ((t - 0.04) / duration);
      } else {
        const relT = t - duration;
        env = Math.max(0, 0.85 * (1 - relT / 0.8));
      }

      const phase = 2 * Math.PI * freq * t;
      const wave = 
        1.00 * Math.sin(phase) +
        0.65 * Math.sin(2 * phase) +
        0.45 * Math.sin(3 * phase) +
        0.25 * Math.sin(4 * phase) +
        0.15 * Math.sin(5 * phase) +
        0.08 * Math.sin(6 * phase);

      const vibrato = t > 0.25 ? 1 + 0.012 * Math.sin(2 * Math.PI * 5.5 * t) : 1;
      const sampleVal = wave * env * volume * 0.22 * vibrato;

      leftChannel[i] += sampleVal * lGain;
      rightChannel[i] += sampleVal * rGain;
    }
  }

  function addChime(freq, startTime, duration = 2.5, volume = 0.18, pan = 0.2) {
    const startSample = Math.floor(startTime * SAMPLE_RATE);
    const endSample = Math.min(NUM_SAMPLES, Math.floor((startTime + duration) * SAMPLE_RATE));
    const lGain = (1 - pan) * 0.5;
    const rGain = (1 + pan) * 0.5;

    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / SAMPLE_RATE;
      const env = Math.exp(-3.2 * t);
      const wave = 
        0.7 * Math.sin(2 * Math.PI * freq * t) +
        0.5 * Math.sin(2 * Math.PI * freq * 2.76 * t) +
        0.3 * Math.sin(2 * Math.PI * freq * 5.4 * t);

      const sampleVal = wave * env * volume * 0.25;
      leftChannel[i] += sampleVal * lGain;
      rightChannel[i] += sampleVal * rGain;
    }
  }

  function addTimpani(freq, startTime, duration = 1.8, volume = 0.4) {
    const startSample = Math.floor(startTime * SAMPLE_RATE);
    const endSample = Math.min(NUM_SAMPLES, Math.floor((startTime + duration) * SAMPLE_RATE));
    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / SAMPLE_RATE;
      const env = Math.exp(-2.2 * t);
      const pitchEnv = freq * (1 + 0.3 * Math.exp(-15 * t));
      const wave = Math.sin(2 * Math.PI * pitchEnv * t) + 0.3 * Math.sin(2 * Math.PI * pitchEnv * 1.6 * t);
      const sampleVal = wave * env * volume * 0.35;
      leftChannel[i] += sampleVal * 0.5;
      rightChannel[i] += sampleVal * 0.5;
    }
  }

  // Motifs:
  // Bar 1: Herald triple summons (G4, G4, G4 -> C5)
  addBrassNote(noteFreq.G4, 0.1, 0.22, 0.6, -0.2);
  addBrassNote(noteFreq.G4, 0.4, 0.22, 0.6, -0.2);
  addBrassNote(noteFreq.G4, 0.7, 0.22, 0.65, -0.2);
  addBrassNote(noteFreq.C5, 1.05, 0.9, 0.75, 0.0);
  addChime(noteFreq.C6, 1.05, 2.0, 0.25, 0.3);

  // Bar 2: Ascending eagle flourish (E5, E5, G5 -> C6 High Triumph)
  addBrassNote(noteFreq.C4, 2.1, 0.8, 0.5, -0.4);
  addBrassNote(noteFreq.E5, 2.1, 0.25, 0.65, 0.2);
  addBrassNote(noteFreq.E5, 2.45, 0.25, 0.65, 0.2);
  addBrassNote(noteFreq.G5, 2.8, 0.4, 0.75, 0.1);
  addBrassNote(noteFreq.C6, 3.3, 1.3, 0.85, 0.0);
  addChime(noteFreq.C6, 3.3, 3.0, 0.35, -0.2);
  addTimpani(noteFreq.C3, 3.3, 1.5, 0.45);

  // Bar 3: Royal Descending Flourish
  addBrassNote(noteFreq.B5, 4.8, 0.35, 0.6, 0.2);
  addBrassNote(noteFreq.G5, 5.2, 0.35, 0.65, -0.1);
  addBrassNote(noteFreq.A5, 5.6, 0.35, 0.7, 0.15);
  addBrassNote(noteFreq.F5, 6.0, 0.35, 0.65, -0.15);
  addBrassNote(noteFreq.G5, 6.4, 0.5, 0.75, 0.0);

  // Bar 4: Stately Assembly Cadence
  addBrassNote(noteFreq.E4, 7.1, 0.22, 0.6, -0.3);
  addBrassNote(noteFreq.G4, 7.1, 0.22, 0.6, 0.3);
  addBrassNote(noteFreq.C5, 7.1, 0.22, 0.7, 0.0);

  addBrassNote(noteFreq.E4, 7.4, 0.22, 0.6, -0.3);
  addBrassNote(noteFreq.G4, 7.4, 0.22, 0.6, 0.3);
  addBrassNote(noteFreq.D5, 7.4, 0.22, 0.7, 0.0);

  addTimpani(noteFreq.G3, 7.6, 0.6, 0.4);
  addTimpani(noteFreq.G3, 7.85, 0.5, 0.5);

  // Grand Final Sovereign Chord: C Major
  const grandStart = 8.1;
  const grandDur = 3.6;

  addBrassNote(noteFreq.C3, grandStart, grandDur, 0.7, 0.0);
  addBrassNote(noteFreq.G3, grandStart, grandDur, 0.6, -0.35);
  addBrassNote(noteFreq.C4, grandStart, grandDur, 0.65, 0.35);
  addBrassNote(noteFreq.E4, grandStart, grandDur, 0.6, -0.2);
  addBrassNote(noteFreq.G4, grandStart, grandDur, 0.7, 0.2);
  addBrassNote(noteFreq.C5, grandStart, grandDur, 0.8, -0.1);
  addBrassNote(noteFreq.E5, grandStart, grandDur, 0.8, 0.1);
  addBrassNote(noteFreq.G5, grandStart, grandDur, 0.75, 0.0);
  addBrassNote(noteFreq.C6, grandStart, grandDur, 0.85, 0.0);

  addTimpani(noteFreq.C3, grandStart, 2.5, 0.7);
  addChime(noteFreq.C5, grandStart, 3.8, 0.3, -0.4);
  addChime(noteFreq.G5, grandStart + 0.1, 3.8, 0.35, 0.4);
  addChime(noteFreq.C6, grandStart + 0.2, 4.0, 0.4, 0.0);

  const delaySamples = Math.floor(0.18 * SAMPLE_RATE);
  for (let i = delaySamples; i < NUM_SAMPLES; i++) {
    leftChannel[i] += rightChannel[i - delaySamples] * 0.28;
    rightChannel[i] += leftChannel[i - delaySamples] * 0.28;
  }

  let maxAmp = 0.0001;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    if (Math.abs(leftChannel[i]) > maxAmp) maxAmp = Math.abs(leftChannel[i]);
    if (Math.abs(rightChannel[i]) > maxAmp) maxAmp = Math.abs(rightChannel[i]);
  }

  const normGain = 0.94 / maxAmp;
  let offset = 44;
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const leftSample = Math.max(-1, Math.min(1, leftChannel[i] * normGain));
    const rightSample = Math.max(-1, Math.min(1, rightChannel[i] * normGain));
    
    const leftInt = Math.floor(leftSample < 0 ? leftSample * 32768 : leftSample * 32767);
    const rightInt = Math.floor(rightSample < 0 ? rightSample * 32768 : rightSample * 32767);

    buffer.writeInt16LE(leftInt, offset);
    buffer.writeInt16LE(rightInt, offset + 2);
    offset += 4;
  }

  return buffer;
}
