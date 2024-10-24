import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import '../../../styles/FM.css';

export default function FMComponent() {
  const [messageAmplitude, setMessageAmplitude] = useState(1);
  const [carrierAmplitude, setCarrierAmplitude] = useState(2);
  const [messageFrequency, setMessageFrequency] = useState(2);
  const [carrierFrequency, setCarrierFrequency] = useState(20);
  const [modulationIndex, setModulationIndex] = useState(5);
  const [messageWaveform, setMessageWaveform] = useState('sin');
  const [carrierWaveform, setCarrierWaveform] = useState('cos');
  const sampleRate = 1000; // Samples per second
  const duration = 1; // Duration in seconds

  // Refs to store chart instances for cleanup
  const messageChartRef = useRef(null);
  const carrierChartRef = useRef(null);
  const fmChartRef = useRef(null);

  useEffect(() => {
    updateCharts();

    // Cleanup charts on component unmount or update
    return () => {
      if (messageChartRef.current) messageChartRef.current.destroy();
      if (carrierChartRef.current) carrierChartRef.current.destroy();
      if (fmChartRef.current) fmChartRef.current.destroy();
    };
  }, [messageAmplitude, carrierAmplitude, messageFrequency, carrierFrequency, modulationIndex, messageWaveform, carrierWaveform]);

  const validateInputs = () => {
    if (
      messageAmplitude <= 0 ||
      carrierAmplitude <= 0 ||
      carrierFrequency <= 0 ||
      messageFrequency <= 0 
    ) {
      alert('Please enter valid positive values for all parameters.');
      return false;
    }
    return true;
  };

  const updateCharts = () => {
    if (!validateInputs()) return;

    // Generate signals
    const carrierSig = generateSignal(carrierFrequency, carrierAmplitude, duration, sampleRate, carrierWaveform);
    const messageSig = generateSignal(messageFrequency, messageAmplitude, duration, sampleRate, messageWaveform);
    const fmSig = generateFMSignal(carrierSig, messageSig, modulationIndex, duration, sampleRate);

    // Update the charts
    renderCharts(carrierSig, messageSig, fmSig);
    updateExplanations();
  };

  const renderCharts = (carrierSig, messageSig, fmSig) => {
    const timeLabels = Array.from({ length: duration * sampleRate }, (_, i) => i / sampleRate);

    // Destroy existing charts before creating new ones
    if (messageChartRef.current) messageChartRef.current.destroy();
    if (carrierChartRef.current) carrierChartRef.current.destroy();
    if (fmChartRef.current) fmChartRef.current.destroy();

    const messageCtx = document.getElementById('messageChart').getContext('2d');
    const carrierCtx = document.getElementById('carrierChart').getContext('2d');
    const fmCtx = document.getElementById('fmChart').getContext('2d');

    messageChartRef.current = new Chart(messageCtx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{ label: 'Message Signal', borderColor: 'blue', data: messageSig, fill: false }],
      },
      options: { scales: { x: { type: 'linear', position: 'bottom' } } },
    });

    carrierChartRef.current = new Chart(carrierCtx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{ label: 'Carrier Signal', borderColor: 'green', data: carrierSig, fill: false }],
      },
      options: { scales: { x: { type: 'linear', position: 'bottom' } } },
    });

    fmChartRef.current = new Chart(fmCtx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{ label: 'FM Modulated Signal', borderColor: 'red', data: fmSig, fill: false }],
      },
      options: { scales: { x: { type: 'linear', position: 'bottom' } } },
    });
  };

  const generateSignal = (frequency, amplitude, duration, sampleRate, waveform) => {
    const numSamples = duration * sampleRate;
    const signal = [];
    for (let i = 0; i < numSamples; i++) {
      const time = i / sampleRate;
      const sample = amplitude * (waveform === 'sin' ? Math.sin(2 * Math.PI * frequency * time) : Math.cos(2 * Math.PI * frequency * time));
      signal.push(sample);
    }
    return signal;
  };

  const generateFMSignal = (carrierSignal, messageSignal, modulationIndex, duration, sampleRate) => {
    const fmSignal = [];
    const numSamples = carrierSignal.length;
    let integral = 0;
    for (let i = 0; i < numSamples; i++) {
      const time = i / sampleRate;
      integral += messageSignal[i] / sampleRate;
      const phase = 2 * Math.PI * (carrierFrequency * time + (modulationIndex * messageFrequency / messageAmplitude) * integral);
      const sample = carrierAmplitude * (carrierWaveform === 'sin' ? Math.sin(phase) : Math.cos(phase));
      fmSignal.push(sample);
    }
    return fmSignal;
  };

  const updateExplanations = () => {
    const messageSignalExplanation = document.getElementById('messageSignalExplanation');
    messageSignalExplanation.innerHTML = `<strong>Message Signal:</strong> m(t) = ${messageAmplitude} * ${messageWaveform}(2π * ${messageFrequency} * t)`;

    const carrierSignalExplanation = document.getElementById('carrierSignalExplanation');
    carrierSignalExplanation.innerHTML = `<strong>Carrier Signal:</strong> c(t) = ${carrierAmplitude} * ${carrierWaveform}(2π * ${carrierFrequency} * t)`;

    const modulationIndexExplanation = document.getElementById('modulationIndexExplanation');
    modulationIndexExplanation.innerHTML = `<strong>Modulation Index (β):</strong> β = ${modulationIndex.toFixed(2)}`;

    const fmSignalExplanation = document.getElementById('fmSignalExplanation');
    fmSignalExplanation.innerHTML = `<strong>FM Modulated Signal:</strong> FM(t) = ${carrierAmplitude} * ${carrierWaveform}(2π * ${carrierFrequency} * t + (${modulationIndex.toFixed(2)} * ${messageFrequency} / ${messageAmplitude}) * ∫m(T)dT)`;
  };

  return (
    <div className="fm-container">
      <h2>FM Modulation</h2>
      <div className="input-container">
        <div>
          <label htmlFor="messageWaveform">Message Waveform:</label>
          <select
            id="messageWaveform"
            value={messageWaveform}
            onChange={(e) => setMessageWaveform(e.target.value)}
          >
            <option value="sin">Sine</option>
            <option value="cos">Cosine</option>
          </select>
        </div>
        <div>
          <label htmlFor="carrierWaveform">Carrier Waveform:</label>
          <select
            id="carrierWaveform"
            value={carrierWaveform}
            onChange={(e) => setCarrierWaveform(e.target.value)}
          >
            <option value="sin">Sine</option>
            <option value="cos">Cosine</option>
          </select>
        </div>
        <div>
          <label htmlFor="messageAmplitude">Message Amplitude (Am):</label>
          <input
            type="number"
            id="messageAmplitude"
            value={messageAmplitude}
            onChange={(e) => setMessageAmplitude(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="carrierAmplitude">Carrier Amplitude (Ac):</label>
          <input
            type="number"
            id="carrierAmplitude"
            value={carrierAmplitude}
            onChange={(e) => setCarrierAmplitude(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="messageFrequency">Message Frequency (fm):</label>
          <input
            type="number"
            id="messageFrequency"
            value={messageFrequency}
            onChange={(e) => setMessageFrequency(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="carrierFrequency">Carrier Frequency (fc):</label>
          <input
            type="number"
            id="carrierFrequency"
            value={carrierFrequency}
            onChange={(e) => setCarrierFrequency(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="modulationIndex">Modulation Index (β):</label>
          <input
            type="number"
            id="modulationIndex"
            value={modulationIndex}
            onChange={(e) => setModulationIndex(parseFloat(e.target.value))}
          />
        </div>
      </div>
      <div className="charts-container">
        <canvas id="messageChart"></canvas>
        <canvas id="carrierChart"></canvas>
        <canvas id="fmChart"></canvas>
      </div>
      <div className="explanation-container">
        <p id="messageSignalExplanation"></p>
        <p id="carrierSignalExplanation"></p>
        <p id="modulationIndexExplanation"></p>
        <p id="fmSignalExplanation"></p>
      </div>
    </div>
  );
}