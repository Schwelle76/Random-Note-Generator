import React from 'react';
import './SensitivitySlider.css';

interface SensitivitySliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SensitivitySlider: React.FC<SensitivitySliderProps> = ({ value, min, max, onChange }) => {
  return (
    <div className="sensitivity-slider-container">
      <input
        type="range"
        min= {min}
        max= {max}
        value={value}
        onChange={onChange}
        className="sensitivity-slider"
      />
      <p className="sensitivity-label">Microphone sensitivity: {value}</p>
    </div>
  );
};

export default SensitivitySlider;
