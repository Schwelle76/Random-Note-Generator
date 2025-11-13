import { useRef, useEffect, useState, use } from 'react';
import { SCALES } from '../constants/SCALES';
import { Scale } from '../models/Scale';
import { Direction } from '../models/Direction';
import { Interval } from '../models/Note';

export default function useEarTrainingSettings() {
  const [root, setRoot] = useState('random');
  const [direction, setDirection] = useState<Direction>('ascending');
  const [scale, setScale] = useState(SCALES[0]);
  const [scalePreset, setScalePreset] = useState<string | undefined>(undefined);
  const [melodyLength, setMelodyLength] = useState(1);
  const customScale = useRef(new Scale("Custom Scale", [0]));


  useEffect(() => {

    const lastUsedPreset = localStorage.getItem('scalePreset');
    const lastUsedHalfsteps = localStorage.getItem('scale')?.split(',').map(halfStep => parseInt(halfStep));


    if (lastUsedHalfsteps && lastUsedHalfsteps.length > 0)
      customScale.current = new Scale("Custom Scale", lastUsedHalfsteps);


    if(lastUsedPreset) setScalePreset(lastUsedPreset);
    else setScalePreset(SCALES[0].name);


  }, []);

  useEffect(() => {


    if (scalePreset === customScale.current.name) {
      console.log("set scale to ", customScale.current, " with ", customScale.current.getIntervals());
      setScale(customScale.current);
    } else {
      const foundScale = SCALES.find(scale => scale.name === scalePreset);
      if (foundScale) {
        setScale(foundScale);
      }
    }

    console.log("safe: " + scalePreset);
    if(scalePreset !== undefined) 
      localStorage.setItem('scalePreset', scalePreset);

  }, [scalePreset]);


  const toggleInterval = (interval: Interval) => {

    if (scale.getIntervals().includes(interval)) {
      if (scale.getIntervals().length === 1)
        customScale.current = new Scale(customScale.current.name, scale.getIntervals());
      else {
        customScale.current = new Scale(customScale.current.name, scale.getIntervals().filter(i => i !== interval))
      }
    }
    else customScale.current = new Scale(customScale.current.name, [...scale.getIntervals(), interval])

    localStorage.setItem('scale', customScale.current.halftoneSteps.join(','));
    setScale(customScale.current);
    setScalePreset(customScale.current.name);

  };

  return {
    scale,
    root,
    scalePreset,
    direction,
    toggleInterval,
    setCurrentRoot: setRoot,
    setScalePreset,
    setCurrentDirection: setDirection,
    customScale,
    melodyLength,
    setMelodyLength
  };
}
