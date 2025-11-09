import { PitchClass, PITCH_CLASSES, isPitchClass, Note } from "../models/Note";

export default class NoteFromKeyboardDetector {

  currentKey: string | undefined;
  octave = 4;
  onNote: (note: Note | undefined) => void;

  constructor(onNote: (note: Note | undefined) => void) {
    this.onNote = onNote;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (keyboardEvent: KeyboardEvent) => {
    if (keyboardEvent.repeat) return;

    if (this.currentKey !== keyboardEvent.key) {

      this.currentKey = keyboardEvent.key;

      const currentKeyAsNumber = Number(this.currentKey);
      if (!isNaN(currentKeyAsNumber)) {
        this.octave = currentKeyAsNumber;
        return;
      }

        let currentString = this.currentKey?.trim().toUpperCase().toString();

      if (keyboardEvent.shiftKey)
        currentString += '#';


      if (currentString != undefined && isPitchClass(currentString)) {
        this.onNote(new Note(currentString, this.octave));
      }
    }
  }

  private handleKeyUp = (keyboardEvent: KeyboardEvent) => {
    if (this.currentKey === keyboardEvent.key) {
      this.currentKey = undefined;
      this.onNote(undefined);
    }
  }



  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

}
