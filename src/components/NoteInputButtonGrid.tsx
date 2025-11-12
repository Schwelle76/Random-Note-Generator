import React, { useEffect, useState } from 'react';
import { useEarTrainingSettingsContext } from '../contexts/EarTrainingSettingsContext';
import { Scale } from '../models/Scale';
import { getPitchClass, Interval, BASE_INTERVALS, PitchClass, INTERVALS } from '../models/Note';
import useEarTrainingGame from '../hooks/useEarTrainingGame';
import useNoteInput from '../hooks/useNoteInput';
import styles from './NoteInputButtonGrid.module.css';
import { Direction } from '../models/Direction';

interface NoteInputButtonGridProps {

    active?: boolean;
    root: PitchClass;
    noteInput: ReturnType<typeof useNoteInput>;
    resetTrigger: number;
    direction: Direction;

}



const NoteInputButtonGrid: React.FC<NoteInputButtonGridProps> = ({ root, noteInput, resetTrigger, active, direction = 'any' }) => {

    if (active === undefined) active = true;

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


    const intervalButton = (interval: Interval, label: string = interval) => {
        return <button
            key={label}
            className={`${styles['note-input-button']} ${!active || clickedButtons.has(interval) ? styles.inactive : ''}`}
            onClick={() => handleButtonClick(interval)}
        > {/* <span>{getPitchClass(root, interval)}</span> */}<span>{label}</span></button>
    }

    console.log(intervals + ' - ' + direction);

    return (

        <div className={styles.noteInputButtonGrid}>
            {intervals.includes('1') && direction !== 'ascending' && intervalButton('1')}
            {intervals.filter(interval => interval !== '1').map(interval => intervalButton(interval))}
            {intervals.includes('1') && direction !== 'descending' && intervalButton('1', '8')}
        </div>
    );

}

export default NoteInputButtonGrid;
