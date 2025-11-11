import styles from './EarTrainingPage.module.css'
import React, { use, useEffect, useRef, useState } from 'react';
import Sidebar from '../Sidebar';
import SensitivitySlider from '../SensitivitySlider';
import NoteDisplay from '../NoteDisplay';
import { useGlobalPointer } from '../../hooks/useGlobalPointer';
import useNoteInput from '../../hooks/useNoteInput';
import useEarTrainingGame from '../../hooks/useEarTrainingGame';
import NoteInputButtonGrid from '../NoteInputButtonGrid';
import InputSelection from '../InputSelection';
import { useEarTrainingSettingsContext } from '../../contexts/EarTrainingSettingsContext';
import volumeIcon from '../../assets/volume-mid.svg';
import LoadingIcon from '../LoadingIcon';
import NoteInputPanel from '../NoteInputPanel';
import useAudioPlayer from '../../hooks/useAudioPlayer';



const EarTrainingPage: React.FC = () => {

    const earTrainingSettings = useEarTrainingSettingsContext()
    const noteInput = useNoteInput()
    const [melodyLength, setMelodyLength] = useState(earTrainingSettings.melodyLength);
    const [scale, setScale] = useState(earTrainingSettings.scale);
    const [root, setRoot] = useState(earTrainingSettings.root);
    const [direction, setDirection] = useState(earTrainingSettings.direction);

    const earTrainingGame = useEarTrainingGame(noteInput.note, scale, root, direction, melodyLength);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const [roundCount, setRoundCount] = useState(0);
    const previousScore = useRef(0);

    const score = earTrainingGame.score;
    const correctNotesCount = earTrainingGame.correctNotesCount;

    useEffect(() => {

        if (earTrainingGame.score === 0) setRoundCount(0);
        else if (earTrainingGame.score > previousScore.current) {
            setRoundCount(roundCount + 1);
        }
        previousScore.current = earTrainingGame.score;
    }, [score]);


    useEffect(() => {
        if (!isSidebarOpen) {
            setMelodyLength(earTrainingSettings.melodyLength);
            setScale(earTrainingSettings.scale);
            setRoot(earTrainingSettings.root);
            setDirection(earTrainingSettings.direction);
        }

    }, [isSidebarOpen]);
    
    useEffect(() => {
        if (noteInput.inputDevice === 'ui')
            earTrainingGame.skipRoot(true);
        else earTrainingGame.skipRoot(false);
    }, [noteInput.inputDevice])


    useGlobalPointer((ev) => {
        if (earTrainingGame.active && !earTrainingGame.isTalking && !isSidebarOpen)
            earTrainingGame.replayQuestion();
    });

    useEffect(() => {
        if (noteInput.ready)
            earTrainingGame.start();
    }, [noteInput.ready])


    return (

        <div className={styles.appContainer}>

            <div className={styles.topBar}>
                {!isSidebarOpen && (
                    <button className={styles.sidebarToggle} onClick={() => setIsSidebarOpen(true)}>
                        ☰
                    </button>
                )}

                <span
                    className={`${styles.score} ${styles[earTrainingGame.targetNotesChannelOutput[earTrainingGame.currentQuestionIndex].style]}`}
                >{earTrainingGame.score}</span>

            </div>



            <div className={styles.centerElement}>


                {!noteInput.inputDevice &&
                    <InputSelection noteInput={noteInput} />
                }

                {noteInput.inputDevice && !noteInput.ready &&
                    <div className={styles.centerElement}>
                        <h1>Allow microphone access to detect your intrument!</h1>
                    </div>
                }


                
                {noteInput.inputDevice && earTrainingGame.active && !earTrainingGame.ready && noteInput.ready &&
                    <LoadingIcon />
                }

                {noteInput.inputDevice && earTrainingGame.active && earTrainingGame.ready && noteInput.ready &&
                    <NoteDisplay
                        styledNotes={[...earTrainingGame.targetNotesChannelOutput]}
                        root={earTrainingGame.root}
                        activeNoteIndex={earTrainingGame.selectedNoteIndex}
                    />}
            </div>


            <div className={styles.bottom}>


                {noteInput.ready && noteInput.inputDevice != 'ui' 
                && <NoteInputPanel noteInput={noteInput} />}


                {earTrainingGame.ready && noteInput.ready && noteInput.inputDevice === 'ui' &&
                    <NoteInputButtonGrid resetTrigger={correctNotesCount} noteInput={noteInput} root={earTrainingGame.root.pitchClass} active={!earTrainingGame.isTalking} />}

            </div>


            <div className={styles.bottomBar}>
                <img className={`${styles.soundIcon} ${earTrainingGame.isTalking ? styles.show : styles.hide}`} src={volumeIcon} alt={"Turn on volume"} />
            </div>

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </div>
    )

}

export default EarTrainingPage;
