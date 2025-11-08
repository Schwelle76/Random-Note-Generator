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


    const [targetNotes, setTargetNotes] = useState<Note[]>([]);
    const [score, setScore] = useState(0);
    const [correctNotesCount, setCorrectNotesCount] = useState(0);
    const [active, setActive] = useState(false);

    const [ready, setReady] = useState(false);
    const rootOctave = 4;

    const audioPlayer = useAudioPlayer();

    const [rootChannelOutput, setRootChannel] = useState<StyledMessage>({ message: '', style: '' });
    const [targetNotesChannelOutput, setTargetNotesChannels] = useState<StyledMessage[]>([{ message: '', style: '' }]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [root, setRoot] = useState<Note>(pickRoot());

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

        if (targetNotes.length === 0
            || audioPlayer.isPlaying) return;


        let detectedPitchClass = undefined;
        if (detectedNote instanceof Note) {
            detectedPitchClass = detectedNote.pitchClass;
        }
        else detectedPitchClass = detectedNote;


        if (detectedNote === undefined || detectedNote instanceof Note && detectedNote.equals(root))
            return;


        if (detectedPitchClass === targetNotes[currentQuestionIndex].pitchClass) {

            setTargetNotesChannels((prev) =>
                [
                    ...prev.slice(0, currentQuestionIndex),
                    { message: targetNotes[currentQuestionIndex].pitchClass, style: "reward" },
                    ...prev.slice(currentQuestionIndex + 1, prev.length)
                ]
            );

            setCorrectNotesCount(prev => prev + 1);

            if (currentQuestionIndex < targetNotes.length - 1)
                setCurrentQuestionIndex(prev => prev + 1);
            else {
                setScore(score + 1);
                setCurrentQuestionIndex(0);
                playReward().then(() => {
                    setNewNotes();
                });
            }
        } else {
            setScore((prev) => Math.max(0, prev - 1));
            playPunishment();
        }

    }, [detectedNote]);


    useEffect(() => {
        if (active)
            start();
    }, [rootPitchSetting, scale, direction, melodyLength, ready])


    function pickRoot() {
        return isPitchClass(rootPitchSetting) ? new Note(rootPitchSetting, rootOctave) : new Note(randomPitchClass(), rootOctave);
    }

    function setNewNotes() {

        const newRoot = pickRoot();

        const absoluteScale = scale.getPitchClasses(newRoot.pitchClass);

        const newTargetNotes: Note[] = [];


        let channelOutput: StyledMessage[] = [];
        for (let i = 0; i < melodyLength; i++)
            channelOutput.push({ message: '?', style: '' });
        setTargetNotesChannels(channelOutput);

        for (let i = 0; i < melodyLength; i++) {
            let nextPitchClass = absoluteScale[0];
            let octave = newRoot.octave;

            if (absoluteScale.length > 1) {
                const availablePitchClasses = absoluteScale.filter(pitchClass => pitchClass !== targetNotes[currentQuestionIndex]?.pitchClass);
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

        setTargetNotes(newTargetNotes);
        setRoot(newRoot);
        setCurrentQuestionIndex(0);


        playQuestion(newRoot, newTargetNotes);

    }

    const replayQuestion = () => {
        if (targetNotes.length === 0) { setNewNotes(); return; }
        playQuestion(root, targetNotes);
    }

    const playQuestion = async (rootNote: Note, nextNotes: Note[]) => {

        setRootChannel({ message: rootNote.pitchClass, style: "pulse" });
        await audioPlayer.play(rootNote.toString());
        setRootChannel({ message: rootNote.pitchClass, style: '' });



        for (let i = 0; i < nextNotes.length; i++) {


            setTargetNotesChannels((prev) => [
                ...prev.slice(0, i),
                { message: prev[i].message, style: "pulse" },
                ...prev.slice(i + 1, prev.length)
            ]);

            await audioPlayer.play(nextNotes[i].toString());

            setTargetNotesChannels((prev) => [
                ...prev.slice(0, i),
                { message: prev[i].message, style: '' },
                ...prev.slice(i + 1, prev.length)]

            )
        }

    }

    const playPunishment = async () => {

        return new Promise((resolve) => {
            if (targetNotes.length > 0 && currentQuestionIndex < targetNotes.length) {

                setTargetNotesChannels((prev) => [
                    ...prev.slice(0, currentQuestionIndex),
                    { message: prev[currentQuestionIndex].message, style: "punishment" },
                    ...prev.slice(currentQuestionIndex + 1, prev.length)
                ]
                );

                const rewardNotes: string[] = [];
                const punishmentInterval = getPitchClass(targetNotes[currentQuestionIndex].pitchClass, "b5");

                rewardNotes.push(root.pitchClass + 4);
                if (punishmentInterval)
                    rewardNotes.push(punishmentInterval + 3);

                audioPlayer.play(rewardNotes[0], .2, .5);
                setTimeout(() => {
                    audioPlayer.play(rewardNotes[1].toString(), .4, .4).then(() => {
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
            if (targetNotes.length > 0 && currentQuestionIndex < targetNotes.length) {



                setTargetNotesChannels(targetNotes.map((note) => ({ message: note.pitchClass, style: "reward" })));

                const rewardNotes: string[] = [];
                const RewardInterval = getPitchClass(targetNotes[currentQuestionIndex].pitchClass, "1");

                rewardNotes.push(targetNotes[currentQuestionIndex].pitchClass + 5);
                if (RewardInterval)
                    rewardNotes.push(RewardInterval + 6);

                audioPlayer.play(rewardNotes[0], .2, .5);
                setTimeout(() => {
                    audioPlayer.play(rewardNotes[1].toString(), .4, .4).then(() => {
                        setTargetNotesChannels(targetNotes.map((note) => ({ message: note.pitchClass, style: "" })));
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
        rootChannelOutput,
        targetNotesChannelOutput,
        currentQuestionIndex,
        correctNotesCount,
        root
    }



}
