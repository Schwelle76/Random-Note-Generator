import React, { useEffect, useState } from 'react';
import { useEarTrainingSettingsContext } from '../contexts/EarTrainingSettingsContext';
import { Scale } from '../models/Scale';
import { getPitchClass, Interval, ROOT_OCTAVE_INTERVALS, PitchClass, INTERVALS } from '../models/Note';
import useEarTrainingGame from '../hooks/useEarTrainingGame';
import useNoteInput from '../hooks/useNoteInput';
import styles from './NoteInputButtonGrid.module.css';

interface NoteInputButtonGridProps {

    active?: boolean;
    root: PitchClass;
    noteInput: ReturnType<typeof useNoteInput>;
    resetTrigger: number;

}



const NoteInputButtonGrid: React.FC<NoteInputButtonGridProps> = ({ root, noteInput, resetTrigger, active }) => {  
    
    if(active === undefined) active = true;

    const [clickedButtons, setClickedButtons] = useState<Set<string>>(new Set());
    const settings = useEarTrainingSettingsContext();
    const intervals = [...settings.scale.getIntervals()].sort(
        (a, b) => INTERVALS.indexOf(a) - INTERVALS.indexOf(b)
    );

    useEffect(() => {
        setClickedButtons(new Set());
        noteInput.setUiInput(undefined);
    }, [resetTrigger, settings]);

    const handleButtonClick = (interval: Interval) => {
        setClickedButtons(prev => new Set(prev).add(interval));
        noteInput.setUiInput(getPitchClass(root, interval));
    };



    return (


        <div className= {styles.noteInputButtonGrid}>
            {intervals.map(interval => (
                <button
                    key = {interval}
                    className={`${styles['note-input-button']} ${!active  || clickedButtons.has(interval) ? styles.inactive : ''}`}
                    onClick={() => handleButtonClick(interval)}
                >
                    {interval}
                </button>
            ))}
        </div>
    );

}

export default NoteInputButtonGrid;
