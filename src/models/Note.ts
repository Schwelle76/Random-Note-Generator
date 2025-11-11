export const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type PitchClass = typeof PITCH_CLASSES[number];

export function isPitchClass(item: any): item is PitchClass {

  if (typeof item !== 'string') return false;
  return (PITCH_CLASSES as readonly string[]).includes(item);
}

export function parsePitchClass(str: string): PitchClass | undefined {
  if (isPitchClass(str)) return str;
  else return undefined;
}

export const ROOT_OCTAVE_INTERVALS = ['1', 'm2', 'M2', 'm3', 'M3', '4', 'b5', '5', 'm6', 'M6', 'm7', 'M7'] as const;
export const FURTHER_OCTAVE_INTERVALS = ['8', 'm9', 'M9', 'm10', 'M10', '11', 'b13', '13', 'm14', 'M14', 'm15', 'M17'] as const;
export const INTERVALS = [...ROOT_OCTAVE_INTERVALS, ...FURTHER_OCTAVE_INTERVALS] as const;
export type Interval = typeof INTERVALS[number];

export function getInterval(note: Note, tonic: Note) {
  const noteIndex = PITCH_CLASSES.indexOf(note.pitchClass);
  const tonicIndex = PITCH_CLASSES.indexOf(tonic.pitchClass);

  //let semitoneDistance = (noteIndex - tonicIndex +12) % 12;
  let semitoneDistance = ((noteIndex + note.octave * 12) - (tonicIndex + tonic.octave * 12));

  let mod = 0
  if (semitoneDistance < 0) mod = 12 * Math.ceil(Math.abs( semitoneDistance / -12));
  const intervalIndex = (semitoneDistance + mod) % 12;

  
  if (semitoneDistance < 12)
    return ROOT_OCTAVE_INTERVALS[intervalIndex];
  else return FURTHER_OCTAVE_INTERVALS[intervalIndex];


}

export function getPitchClass(tonic: PitchClass, interval: Interval) {
  const tonicIndex = PITCH_CLASSES.indexOf(tonic);
  const semitoneDistance = INTERVALS.indexOf(interval);

  const targetNoteIndex = (tonicIndex + semitoneDistance) % 12;

  return PITCH_CLASSES[targetNoteIndex];
}

export function randomPitchClass(): PitchClass {
  return PITCH_CLASSES[Math.floor(Math.random() * PITCH_CLASSES.length)];
}


export class Note {

  pitchClass: PitchClass;
  octave: number;

  constructor(pitchClass: PitchClass, octave: number = 4) {
    this.pitchClass = pitchClass;
    this.octave = octave;
  }

  public toString() {
    return this.pitchClass + this.octave;
  }

  public equals(other: Note): boolean {
    return this.pitchClass === other.pitchClass &&
      this.octave === other.octave;
  }

}
