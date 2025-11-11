import { PITCH_CLASSES, ROOT_OCTAVE_INTERVALS, Interval } from "./Note";

export class Scale {

  name: string;
  intervals: Interval[];
  halftoneSteps: number[];

  constructor(name: string, steps: number[]);
  constructor(name: string, intervals: string[]);
  constructor(name: string, intervals: Interval[]);

  constructor(name: string, input: string[] | number[] | Interval[]) {
    this.name = name;

    if (typeof input[0] === 'string') {
      this.intervals = input as Interval[];
      this.halftoneSteps = input.map(interval => {
        const step = ROOT_OCTAVE_INTERVALS.findIndex(i => i === interval);
        if (step === -1) {
          throw new Error(`Invalid interval: ${interval}`);
        }
        return step;
      });
    } else {
      this.halftoneSteps = input as number[];
      this.intervals = this.halftoneSteps.map(step => ROOT_OCTAVE_INTERVALS[step]);

    }
  }

  getPitchClasses(tonic: string) {
    const tonicIndex = PITCH_CLASSES.findIndex(note => note === tonic);
    if (tonicIndex === -1) throw new Error('Invalid tonic note');

    const pitchClasses =  this.halftoneSteps.map(halftoneStep => {
      const noteIndex = (tonicIndex + halftoneStep) % 12;
      return PITCH_CLASSES[noteIndex];
    });

    return pitchClasses;
  }

  getIntervals() {
    return this.intervals;
  }
}

