import React from 'react';
import './SettingsPanel.css';
import { SCALES } from '../constants/SCALES';
import { useEarTrainingSettingsContext } from '../contexts/EarTrainingSettingsContext';
import EarTrainingSettings from '../models/EarTrainingSettings';
import { Direction, DIRECTIONS } from '../models/Direction';
import { ROOT_OCTAVE_INTERVALS } from '../models/Note';

const SettingsPanel = ({ }) => {

  const settings = useEarTrainingSettingsContext();

  const ScalePresets = SCALES;

  return (
    <div className="settings-panel">
      <h2>Settings</h2>

      <div className="setting-section">
        <h3>Root</h3>
        <select
          value={settings.root}
          onChange={(e) => settings.setCurrentRoot(e.target.value)}
          className="dropdown"
        >
          {['Random', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(note => (
            <option key={note} value={note}>{note}</option>
          ))}
        </select>
      </div>

      <div className="setting-section">
        <h3>Interval</h3>
        <select
          value={settings.scalePreset}
          onChange={(e) => settings.setScalePreset(e.target.value)}
          className="dropdown"
        >
          {ScalePresets.map((preset, index) => (
            <option key={index} value={preset.name}>{preset.name}</option>
          ))}
          <option value={settings.customScale.current.name}>Custom Scale</option>
        </select>



        <div className="interval-buttons">
          {ROOT_OCTAVE_INTERVALS.map(interval => (
            <button
              key={interval}
              className={`interval-button ${settings.scale.getIntervals().includes(interval) ? 'active' : ''}`}
              onClick={() => settings.toggleInterval(interval)}
            >
              {interval}
            </button>
          ))}
        </div>
      </div>

      <div className="setting-section">
        <h3>Direction</h3>
        <select
          value={settings.direction}
          onChange={(e) => settings.setCurrentDirection(e.target.value)}
          className="dropdown"
        >
          {DIRECTIONS.map(direction => (
            <option key={direction} value={direction}>{direction.charAt(0).toUpperCase() + direction.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="setting-section">
        <h3>Melody Length</h3>
        <div className="melody-length-container">
          <span>{settings.melodyLength}</span>
          <input
            type="range"
            min="1"
            max="5"
            value={settings.melodyLength}
            onChange={(e) => settings.setMelodyLength(parseInt(e.target.value))}
          >
          </input>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
