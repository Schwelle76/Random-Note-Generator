import { useState, useEffect, useRef, use } from 'react';

import usePitchDetection from './usePitchDetection';
import EarTrainingSettings from '../models/EarTrainingSettings';
import { SCALES } from '../constants/SCALES';
import { Scale } from '../models/Scale';
import SoundfontService from '../services/SoundFontService';
import { getInterval, getPitchClass, isPitchClass, Note, parsePitchClass, PITCH_CLASSES, PitchClass, randomPitchClass } from '../models/Note';
import { Direction } from '../models/Direction';
import { StyledMessage } from '../models/StyledMessage';
import useAudioPlayer from './useAudioPlayer';

export default function useEarTrainingGame(detectedNote: Note | PitchClass | undefined, scale: Scale, rootPitchSetting: string, direction: Direction, melodyLength: number) {


    const [notes, setNotes] = useState<Note[]>([]);
    const [score, setScore] = useState(0);
    const [correctNotesCount, setCorrectNotesCount] = useState(0);
    const [active, setActive] = useState(false);

    const [ready, setReady] = useState(false);
    const defaultOctave = 4;

    const audioPlayer = useAudioPlayer();

    const [targetNotesChannelOutput, setTargetNotesChannels] = useState<StyledMessage[]>(Array.from({ length: melodyLength }, () => ({ message: '', style: '' })));
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
    const [selectedNoteIndex, setSelectedNoteIndex] = useState(0);
    const [startQuestionIndex, setStartQuestionIndex] = useState(0);
    const [root, setRoot] = useState<Note>(pickRoot());
    const userRootOctaveRef = useRef<number>(defaultOctave);

    function skipRoot(boolean: boolean) {

        const startQuestionIndexValue = boolean ? 1 : 0;
        setStartQuestionIndex(startQuestionIndexValue);
    }

    const start = () => {
        setActive(true);

        setScore(0);


        if (ready === true)
            setNewNotes();
    }

    useEffect(() => {
        return () => {
            setActive(false);
        };
    }, []);

    useEffect(() => {

        if (audioPlayer.ready) setReady(true);
        else setReady(false);


        return () => {
            setReady(false);
        };
    }, [audioPlayer.ready]);


    useEffect(() => {


        if (notes.length === 0
            || audioPlayer.isPlaying) return;


        let detectedNoteIsRoot = false;

        let detectedPitchClass = undefined;
        if (detectedNote instanceof Note) {
            detectedPitchClass = detectedNote.pitchClass;

            if (detectedNote.pitchClass === root.pitchClass && detectedNote.octave === userRootOctaveRef.current) {
                detectedNoteIsRoot = true;
                setSelectedNoteIndex(1);
                audioPlayer.play(root.toString());
                return;
            }

        }
        else detectedPitchClass = detectedNote;



        if (detectedNote === undefined)
            return;


        if (detectedPitchClass === notes[selectedNoteIndex].pitchClass) {

            setTargetNotesChannels((prev) =>
                [
                    ...prev.slice(0, selectedNoteIndex),
                    { message: notes[selectedNoteIndex].pitchClass, style: "reward" },
                    ...prev.slice(selectedNoteIndex + 1, prev.length)
                ]
            );

            setCorrectNotesCount(prev => prev + 1);

            if (selectedNoteIndex >= currentQuestionIndex) {
                setCurrentQuestionIndex(prev => prev + 1);
                setScore((prev) => prev + 1);
            }

            if (selectedNoteIndex < notes.length - 1) {
                if (selectedNoteIndex === 0 && detectedNote instanceof Note) {
                    userRootOctaveRef.current = detectedNote.octave;
                }


                setSelectedNoteIndex(prev => prev + 1);


                audioPlayer.play(notes[selectedNoteIndex].toString());
            }
            else {
                setSelectedNoteIndex(0);
                setCurrentQuestionIndex(1);
                playReward().then(() => {
                    setNewNotes();
                });
            }
        } else {
            if (selectedNoteIndex === currentQuestionIndex && selectedNoteIndex > 0 && !detectedNoteIsRoot) {
                setScore((prev) => Math.max(0, prev - 1));
                playPunishment();
            }
        }

    }, [detectedNote]);


    useEffect(() => {
        if (active)
            start();
    }, [rootPitchSetting, scale, direction, melodyLength, ready])


    function pickRoot() {
        return isPitchClass(rootPitchSetting) ? new Note(rootPitchSetting, defaultOctave) : new Note(randomPitchClass(), defaultOctave);
    }

    async function setNewNotes() {

        const newRoot = pickRoot();

        const absoluteScale = scale.getPitchClasses(newRoot.pitchClass);

        const newTargetNotes: Note[] = [];

        let channelOutput: StyledMessage[] = [];

        channelOutput.push({ message: newRoot.pitchClass, style: '' });
        for (let i = 0; i < melodyLength; i++)
            channelOutput.push({ message: '?', style: '' });
        setTargetNotesChannels(channelOutput);

        for (let i = 0; i < melodyLength; i++) {
            let nextPitchClass = absoluteScale[0];
            let octave = newRoot.octave;

            if (absoluteScale.length > 1) {
                const availablePitchClasses = absoluteScale.filter(pitchClass => pitchClass !== notes[currentQuestionIndex]?.pitchClass);
                nextPitchClass = availablePitchClasses[Math.floor(Math.random() * (availablePitchClasses.length))];
            }

            const rootPitchIndex = PITCH_CLASSES.indexOf(newRoot.pitchClass);
            const notePitchIndex = PITCH_CLASSES.indexOf(nextPitchClass);

            if (rootPitchIndex !== -1 && notePitchIndex !== -1) {
                if (direction === 'ascending') {
                    octave = notePitchIndex > rootPitchIndex ? newRoot.octave : newRoot.octave + 1;
                } else if (direction === 'descending') {
                    octave = notePitchIndex < rootPitchIndex ? newRoot.octave : newRoot.octave - 1;
                } else {
                    const useAscending = Math.random() > 0.5;
                    octave = useAscending
                        ? (notePitchIndex > rootPitchIndex ? newRoot.octave : newRoot.octave + 1)
                        : (notePitchIndex < rootPitchIndex ? newRoot.octave : newRoot.octave - 1);
                }
            }

            newTargetNotes.push(new Note(nextPitchClass, octave));
        }


        const newNotes = [newRoot, ...newTargetNotes];
        setNotes(newNotes);
        setRoot(newRoot);




        await playMelody(newNotes);
        setTimeout(() => {
            playMelody(newNotes, 0, startQuestionIndex).then(() =>
                setSelectedNoteIndex(startQuestionIndex)
            );
        }, 300);

    }

    const replayQuestion = () => {
        if (notes.length === 0) { setNewNotes(); return; }
        playMelody(notes);
    }

    const playMelody = async (notes: Note[], start = 0, end = notes.length) => {


        for (let i = start; i < end; i++) {


            setTargetNotesChannels((prev) => [
                ...prev.slice(0, i),
                { message: prev[i].message, style: "pulse" },
                ...prev.slice(i + 1, prev.length)
            ]);

            await audioPlayer.play(notes[i].toString());

            setTargetNotesChannels((prev) => [
                ...prev.slice(0, i),
                { message: prev[i].message, style: '' },
                ...prev.slice(i + 1, prev.length)]

            )
        }

    }

    const playPunishment = async () => {

        return new Promise((resolve) => {

            if (notes.length > 0 && currentQuestionIndex < notes.length) {

                setTargetNotesChannels((prev) => [
                    ...prev.slice(0, currentQuestionIndex),
                    { message: prev[currentQuestionIndex].message, style: "punishment" },
                    ...prev.slice(currentQuestionIndex + 1, prev.length)
                ]
                );

                const punishmentNotes: string[] = [];
                const punishmentInterval = getPitchClass(notes[currentQuestionIndex].pitchClass, "b5");

                punishmentNotes.push(root.pitchClass + 4);
                if (punishmentInterval)
                    punishmentNotes.push(punishmentInterval + 3);

                audioPlayer.play(punishmentNotes[0], .2, .5);
                setTimeout(() => {
                    audioPlayer.play(punishmentNotes[1].toString(), .4, .4).then(() => {
                        setTargetNotesChannels((prev) =>
                            [
                                ...prev.slice(0, currentQuestionIndex),
                                { message: prev[currentQuestionIndex].message, style: "" },
                                ...prev.slice(currentQuestionIndex + 1, prev.length)
                            ]
                        );
                        resolve(true)
                    });

                }, 130);
            } else resolve(false);
        })
    }

    const playReward = async () => {


        return new Promise((resolve) => {
            if (notes.length > 0 && currentQuestionIndex < notes.length) {



                setTargetNotesChannels(notes.map((note) => ({ message: note.pitchClass, style: "reward" })));

                const rewardNotes: string[] = [];
                const RewardInterval = getPitchClass(notes[currentQuestionIndex].pitchClass, "1");

                rewardNotes.push(notes[currentQuestionIndex].pitchClass + 5);
                if (RewardInterval)
                    rewardNotes.push(RewardInterval + 6);

                audioPlayer.play(rewardNotes[0], .2, .5);
                setTimeout(() => {
                    audioPlayer.play(rewardNotes[1].toString(), .4, .4).then(() => {
                        setTargetNotesChannels(notes.map((note) => ({ message: note.pitchClass, style: "" })));
                        resolve(true)
                    });

                }, 130);
            } else resolve(false);
        })
    }

    return {
        score,
        replayQuestion,
        start,
        active,
        ready,
        isTalking: audioPlayer.isPlaying,
        targetNotesChannelOutput,
        currentQuestionIndex,
        selectedNoteIndex,
        correctNotesCount,
        root,
        skipRoot
    }



}
