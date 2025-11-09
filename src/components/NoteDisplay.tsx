import React, {useEffect, useRef, useState } from 'react';
import style from './NoteDisplay.module.css';
import { StyledMessage } from '../models/StyledMessage';
import { getInterval, isPitchClass, Note, PitchClass } from '../models/Note';
import useWindowSize from '../hooks/useWindowSize';

interface NoteDisplayProps {
  notes: StyledMessage[];
  root: PitchClass;
  activeNoteIndex: number;
}

const NoteDisplay: React.FC<NoteDisplayProps> = ({ notes, root, activeNoteIndex }) => {

  const noteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeNote = notes[activeNoteIndex];

  const activeElement = noteRefs.current[activeNoteIndex];
  const indicatorScale = 1.2;
  const [indicatorSize, setIndicatorSize] = useState(0);
  const [indicatorX, setIndicatorX] = useState( 0);
  const [indicatorY, setIndicatorY] = useState(0);
  const [indicatorOpacity, setIndicatorOpacity] = useState(0);

  const updateIndicatorPosition = () =>{


    setIndicatorOpacity(activeElement ? 1 : 0);

    if (activeElement) {
      const mainDimension = Math.min(activeElement.offsetWidth, activeElement.offsetHeight);
      const size = mainDimension * indicatorScale;
      setIndicatorSize(size);
      setIndicatorX(activeElement.offsetLeft + activeElement.offsetWidth / 2 - size / 2);
      setIndicatorY(activeElement.offsetTop + activeElement.offsetHeight / 2 - size / 2);
    }
  };

  useWindowSize(updateIndicatorPosition);

  useEffect(() => {
    noteRefs.current = noteRefs.current.slice(0, notes.length);
    updateIndicatorPosition();
  }, [notes]);


  return (
    <div className={style.noteDisplayContainer}>

      <div className={`${style.activeIndicator} ${style[activeNote?.style]}`} style={{
        width: `${indicatorSize}px`,
        height: `${indicatorSize}px`,
        translate: `${indicatorX}px ${indicatorY}px`,
        opacity: `${indicatorOpacity}`
      }} />


      {notes.map((note, index) => {
        const message = note.message;
        let content: string;

        if (isPitchClass(message)) {
          content = getInterval(message, root);
        } else {
          content = message;
        }

        return (
          <div
            key={index}
            ref={(el) => { noteRefs.current[index] = el; }}
            className={`${style.noteDisplay} ${style[note.style]}`}
          >
            <div className={style.currentNote}>
              <span>{note.message}</span>
            </div>
            <div className={style.currentInterval}>
              <span>{content}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default NoteDisplay;