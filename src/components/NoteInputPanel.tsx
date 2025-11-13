import React, { use, useState } from 'react';
import { Note } from '../models/Note';
import useNoteInput from '../hooks/useNoteInput';
import SensitivitySlider from './SensitivitySlider';
import styles from './NoteInputPanel.module.css';


interface NoteInputPanelProps {
    noteInput: ReturnType<typeof useNoteInput>;
}

const NoteInputPanel: React.FC<NoteInputPanelProps> = ({ noteInput }) => {

    const pitchClass = noteInput.note instanceof Note ? noteInput.note.pitchClass : noteInput.note;

    return (
        <div className={styles.noteInputPanel}>

            <div className={styles.inputPitchContainer}>
                <span className={styles.inputPitch}>{pitchClass ? pitchClass : " "}</span>
            </div>
            <SensitivitySlider
                value={noteInput.sensitivity}
                min={noteInput.MIN_SENSITIVITY}
                max={noteInput.MAX_SENSITIVITY}
                onChange={(e) => noteInput.setSensitivity(parseInt(e.target.value))} />

        </div>
    )
}

export default NoteInputPanel;