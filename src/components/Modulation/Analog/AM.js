import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import '../../../styles/AM.css';

const AM = () => {
  const [messageAmplitude, setMessageAmplitude] = useState(1);
  const [carrierAmplitude, setCarrierAmplitude] = useState(2);
  const [messageFrequency, setMessageFrequency] = useState(2);
  const [carrierFrequency, setCarrierFrequency] = useState(20);
  const [messageSignalType, setMessageSignalType] = useState('cos');
  const [carrierSignalType, setCarrierSignalType] = useState('cos');
  const sampleRate = 1000; // Samples per second
  const duration = 1; // Duration in seconds

  // Refs to store chart instances for cleanup
  const messageChartRef = useRef(null);
  const carrierChartRef = useRef(null);
  const amChartRef = useRef(null);

  useEffect(() => {
    updateCharts();

    // Cleanup charts on component unmount or update
    return () => {
      if (messageChartRef.current) messageChartRef.current.destroy();
      if (carrierChartRef.current) carrierChartRef.current.destroy();
      if (amChartRef.current) amChartRef.current.destroy();
    };
  }, [messageAmplitude, carrierAmplitude, messageFrequency, carrierFrequency, messageSignalType, carrierSignalType]);

  const validateInputs = () => {
    if (
      messageAmplitude < 0 ||
      carrierAmplitude <= 0 ||
      carrierFrequency <= 0 ||
      messageFrequency <= 0
    ) {
      alert('Please enter valid positive values for amplitudes and frequencies.');
      return false;
    }
    return true;
  };

  const updateCharts = () => {
    if (!validateInputs()) return;

    const modulationIdx = messageAmplitude / carrierAmplitude;

    // Generate signals
    const carrierSig = generateSignal(carrierFrequency, carrierAmplitude, duration, sampleRate, carrierSignalType);
    const messageSig = generateSignal(messageFrequency, messageAmplitude, duration, sampleRate, messageSignalType);
    const amSig = generateAMSignal(carrierSig, messageSig, modulationIdx, duration);

    // Update the charts
    renderCharts(carrierSig, messageSig, amSig);
    updateExplanations(modulationIdx);
  };

  const renderCharts = (carrierSig, messageSig, amSig) => {
    const timeLabels = Array.from({ length: duration * sampleRate }, (_, i) => i / sampleRate);

    // Destroy existing charts before creating new ones
    if (messageChartRef.current) messageChartRef.current.destroy();
    if (carrierChartRef.current) carrierChartRef.current.destroy();
    if (amChartRef.current) amChartRef.current.destroy();

    const messageCtx = document.getElementById('messageChart').getContext('2d');
    const carrierCtx = document.getElementById('carrierChart').getContext('2d');
    const amCtx = document.getElementById('amChart').getContext('2d');

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

    amChartRef.current = new Chart(amCtx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{ label: 'AM Modulated Signal', borderColor: 'red', data: amSig, fill: false }],
      },
      options: { scales: { x: { type: 'linear', position: 'bottom' } } },
    });
  };

  const generateSignal = (frequency, amplitude, duration, sampleRate, signalType) => {
    const numSamples = duration * sampleRate;
    const signal = [];
    for (let i = 0; i < numSamples; i++) {
      const time = i / sampleRate;
      const sample = amplitude * (signalType === 'sin' ? Math.sin(2 * Math.PI * frequency * time) : Math.cos(2 * Math.PI * frequency * time));
      signal.push(sample);
    }
    return signal;
  };

  const generateAMSignal = (carrierSignal, messageSignal, modulationIndex, duration) => {
    const amSignal = [];
    const numSamples = carrierSignal.length;
    for (let i = 0; i < numSamples; i++) {
      const modulatedSample = (1 + modulationIndex * messageSignal[i]) * carrierSignal[i];
      amSignal.push(modulatedSample);
    }
    return amSignal;
  };

  const updateExplanations = (modulationIdx) => {
    const messageSignalExplanation = document.getElementById('messageSignalExplanation');
    messageSignalExplanation.innerHTML = `<strong>Message Signal:</strong> m(t) = ${messageAmplitude} * ${messageSignalType}(2π * ${messageFrequency} * t)`;

    const carrierSignalExplanation = document.getElementById('carrierSignalExplanation');
    carrierSignalExplanation.innerHTML = `<strong>Carrier Signal:</strong> c(t) = ${carrierAmplitude} * ${carrierSignalType}(2π * ${carrierFrequency} * t)`;

    const modulationIndexExplanation = document.getElementById('modulationIndexExplanation');
    modulationIndexExplanation.innerHTML = `<strong>Modulation Index (m):</strong> m = ${modulationIdx.toFixed(2)}`;

    const amSignalExplanation = document.getElementById('amSignalExplanation');
    amSignalExplanation.innerHTML = `<strong>AM Modulated Signal:</strong> AM(t) = ${carrierAmplitude} * [1 + ${modulationIdx.toFixed(2)} * ${messageSignalType}(2π * ${messageFrequency} * t)] * ${carrierSignalType}(2π * ${carrierFrequency} * t)`;
  };

  return (
    <div className="am-container">
      <h2>AM Modulation</h2>
      <div className="input-container">
        <div>
          <label htmlFor="messageSignalType">Message Signal Type:</label>
          <select
            id="messageSignalType"
            value={messageSignalType}
            onChange={(e) => setMessageSignalType(e.target.value)}
          >
            <option value="cos">Cosine</option>
            <option value="sin">Sine</option>
          </select>
        </div>
        <div>
          <label htmlFor="carrierSignalType">Carrier Signal Type:</label>
          <select
            id="carrierSignalType"
            value={carrierSignalType}
            onChange={(e) => setCarrierSignalType(e.target.value)}
          >
            <option value="cos">Cosine</option>
            <option value="sin">Sine</option>
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
      </div>
      <div className="charts-container">
        <canvas id="messageChart"></canvas>
        <canvas id="carrierChart"></canvas>
        <canvas id="amChart"></canvas>
      </div>
      <div className="explanation-container">
        <p id="messageSignalExplanation"></p>
        <p id="carrierSignalExplanation"></p>
        <p id="modulationIndexExplanation"></p>
        <p id="amSignalExplanation"></p>
      </div>
    </div>
  );
};

export default AM;