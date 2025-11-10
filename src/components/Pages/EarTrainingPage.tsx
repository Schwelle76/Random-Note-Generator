import styles from './EarTrainingPage.module.css'
import React, { use, useEffect, useRef, useState } from 'react';
import Sidebar from '../Sidebar';
import SensitivitySlider from '../SensitivitySlider';
import NoteDisplay from '../NoteDisplay';
import { useGlobalPointer } from '../../hooks/useGlobalPointer';
import { getInterval, isPitchClass, Note } from '../../models/Note';
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

    const earTrainingGame = useEarTrainingGame(noteInput.note, earTrainingSettings.scale, earTrainingSettings.root, earTrainingSettings.direction, 5);

    useEffect(() => {
        if (noteInput.inputDevice === 'ui')
            earTrainingGame.skipRoot(true);
        else earTrainingGame.skipRoot(false);
    }, [noteInput.inputDevice])




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


    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
                        notes={[...earTrainingGame.targetNotesChannelOutput]}
                        root={earTrainingGame.root.pitchClass}
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
