import React from 'react';
import styles from './InputSelection.module.css';
import InputOption from './InputOption';
import useNoteInput from '../hooks/useNoteInput';
import { InputDevice } from '../models/InputDevice';
import ImageCycle from './ImageCycle';
import mouseIcon from '../assets/mouse-pointer-click.svg';
import touchIcon from '../assets/touch-press-click.svg';
import guitarIcon from '../assets/guitar.svg';
import pianoIcon from '../assets/piano.svg';
import saxophoneIcon from '../assets/saxophone.svg';


interface InputSelectionProps {
    noteInput: ReturnType<typeof useNoteInput>;
}

const InputSelection: React.FC<InputSelectionProps> = ({ noteInput }) => {

    const usesMouse = window.matchMedia('(hover: hover)').matches;
    const isDevMode = import.meta.env.DEV;


    function setInputDevice(InputDevice: InputDevice) {
        noteInput.setInputDevice(InputDevice);
    }

    return (

        <div className={styles.inputSelectionMasterContainer}>
            <p className={styles.selectInputPrompt}>Select your input device</p>
            <div className={styles.inputOptionsContainerFlexbox}>
                <div className={styles.inputOptionContainer}>
                    <button className={styles.inputOption} onClick={() => {
                        setInputDevice("ui");
                    }}>
                        {usesMouse ?
                            <img src={mouseIcon} alt={"Mouse"} className={styles.inputOptionImage} />
                            : <img src={touchIcon} alt={"Touch"} className={styles.inputOptionImage} />
                        }
                    </button>
                    {usesMouse ?
                        <p>Mouse</p> : <p>Touch</p>}
                </div>

                <div className={styles.inputOptionContainer}>
                    <button className={styles.inputOption} onClick={() => {
                        setInputDevice("microphone");
                    }}>
                        <ImageCycle imageSrcs={[guitarIcon, pianoIcon, saxophoneIcon]} alt={"Your instrument"} fadeDuration={1000} displayDuration={2500} />
                    </button>
                    <p>Your instrument</p>
                </div>

                {isDevMode && <div className={styles.inputOptionContainer}>
                    <button className={styles.inputOption} onClick={() => {
                        setInputDevice("keyboard");
                    }}>
                        <img src={mouseIcon} alt={"Mouse"} className={styles.inputOptionImage} />
                    </button>
                    <p>Keyboard</p>
                </div>}

            </div>
        </div>

    );
};
export default InputSelection;