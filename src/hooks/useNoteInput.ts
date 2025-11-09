import { useState, useEffect, useRef, use } from 'react';
import NoteFromKeyboardDetector from '../services/NoteFromKeyboardDetector';
import { Note, PitchClass } from '../models/Note';
import MicrophoneNoteDetector from '../services/MicrophoneNoteDetector';
import { InputDevice } from '../models/InputDevice';

export default function useNoteInput() {

    const [inputDevice, setInputDevice] = useState<InputDevice | undefined>(undefined);

    const microphoneNoteDetector = useRef<MicrophoneNoteDetector | undefined>(undefined);
    const noteFromKeyboardDetector = useRef<NoteFromKeyboardDetector | undefined>(undefined);
    const [uiInput, setUiInput] = useState<PitchClass | undefined>(undefined);

    const [note, setNote] = useState<PitchClass | Note | undefined>(undefined);
    const [ready, setReady] = useState(false);
    const [sensitivity, setSensitivity] = useState(0);



    useEffect(() => {
    
        if(inputDevice === undefined) return;

        if (inputDevice === "microphone") {
            microphoneNoteDetector.current = new MicrophoneNoteDetector(setNote);
            setSensitivity(microphoneNoteDetector.current.sensitivity);
        }

        if (inputDevice === "keyboard") {
            noteFromKeyboardDetector.current = new NoteFromKeyboardDetector(setNote);
        }

        initialize();

        return () => {
            microphoneNoteDetector.current?.destroy();
            noteFromKeyboardDetector.current?.destroy();
        }
    }, [inputDevice]);


    useEffect(() => {
        microphoneNoteDetector.current?.setSensitivity(sensitivity);
    }, [sensitivity]);

    useEffect(() => {

        if (inputDevice === 'ui') 
            setNote(uiInput);

    }, [uiInput]);

    const initialize = async () => {

        if (inputDevice === "microphone") {
            let success = await microphoneNoteDetector.current?.initAudio();
            setReady(success ?? false);
        } else setReady(true);
    }

    return {
        note,
        setSensitivity,
        sensitivity,
        MAX_SENSITIVITY: microphoneNoteDetector.current?.MAX_SENSITIVITY ?? 100,
        MIN_SENSITIVITY: microphoneNoteDetector.current?.MIN_SENSITIVITY ?? 1,
        ready,
        inputDevice,
        setInputDevice,
        setUiInput
    };
}
