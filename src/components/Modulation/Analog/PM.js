import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import '../../../styles/PM.css';

export default function Component() {
  const [messageAmplitude, setMessageAmplitude] = useState(1);
  const [carrierAmplitude, setCarrierAmplitude] = useState(2);
  const [messageFrequency, setMessageFrequency] = useState(2);
  const [carrierFrequency, setCarrierFrequency] = useState(20);
  const [modulationIndex, setModulationIndex] = useState(5);
  const [messageFunction, setMessageFunction] = useState('sin');
  const [carrierFunction, setCarrierFunction] = useState('cos');
  const sampleRate = 1000; // Samples per second
  const duration = 1; // Duration in seconds

  // Refs to store chart instances for cleanup
  const messageChartRef = useRef(null);
  const carrierChartRef = useRef(null);
  const pmChartRef = useRef(null);

  useEffect(() => {
    updateCharts();

    // Cleanup charts on component unmount or update
    return () => {
      if (messageChartRef.current) messageChartRef.current.destroy();
      if (carrierChartRef.current) carrierChartRef.current.destroy();
      if (pmChartRef.current) pmChartRef.current.destroy();
    };
  }, [messageAmplitude, carrierAmplitude, messageFrequency, carrierFrequency, modulationIndex, messageFunction, carrierFunction]);

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
    const carrierSig = generateCarrierSignal(carrierFrequency, carrierAmplitude, duration, sampleRate);
    const messageSig = generateMessageSignal(messageAmplitude, messageFrequency, duration, sampleRate);
    const pmSig = generatePMSignal(carrierSig, messageSig, modulationIndex, duration, sampleRate);

    // Update the charts
    renderCharts(carrierSig, messageSig, pmSig);
    updateExplanations();
  };

  const renderCharts = (carrierSig, messageSig, pmSig) => {
    const timeLabels = Array.from({ length: duration * sampleRate }, (_, i) => i / sampleRate);

    // Destroy existing charts before creating new ones
    if (messageChartRef.current) messageChartRef.current.destroy();
    if (carrierChartRef.current) carrierChartRef.current.destroy();
    if (pmChartRef.current) pmChartRef.current.destroy();

    const messageCtx = document.getElementById('messageChart').getContext('2d');
    const carrierCtx = document.getElementById('carrierChart').getContext('2d');
    const pmCtx = document.getElementById('pmChart').getContext('2d');

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

    pmChartRef.current = new Chart(pmCtx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{ label: 'PM Modulated Signal', borderColor: 'red', data: pmSig, fill: false }],
      },
      options: { scales: { x: { type: 'linear', position: 'bottom' } } },
    });
  };

  const generateCarrierSignal = (frequency, amplitude, duration, sampleRate) => {
    const numSamples = duration * sampleRate;
    const carrierSignal = [];
    for (let i = 0; i < numSamples; i++) {
      const time = i / sampleRate;
      const sample = amplitude * (carrierFunction === 'cos' ? Math.cos(2 * Math.PI * frequency * time) : Math.sin(2 * Math.PI * frequency * time));
      carrierSignal.push(sample);
    }
    return carrierSignal;
  };

  const generateMessageSignal = (amplitude, frequency, duration, sampleRate) => {
    const numSamples = duration * sampleRate;
    const messageSignal = [];
    for (let i = 0; i < numSamples; i++) {
      const time = i / sampleRate;
      const sample = amplitude * (messageFunction === 'sin' ? Math.sin(2 * Math.PI * frequency * time) : Math.cos(2 * Math.PI * frequency * time));
      messageSignal.push(sample);
    }
    return messageSignal;
  };

  const generatePMSignal = (carrierSignal, messageSignal, modulationIndex, duration, sampleRate) => {
    const pmSignal = [];
    const numSamples = carrierSignal.length;
    for (let i = 0; i < numSamples; i++) {
      const time = i / sampleRate;
      const modulatedPhase = (modulationIndex/messageAmplitude) * messageSignal[i];
      const sample = carrierAmplitude * (carrierFunction === 'cos' ? 
        Math.cos((2 * Math.PI * ( carrierFrequency * time + modulatedPhase))) :
        Math.sin((2 * Math.PI * ( carrierFrequency * time + modulatedPhase))));
      pmSignal.push(sample);
    }
    return pmSignal;
  };

  const updateExplanations = () => {
    const messageSignalExplanation = document.getElementById('messageSignalExplanation');
    messageSignalExplanation.innerHTML = `<strong>Message Signal:</strong> m(t) = ${messageAmplitude} * ${messageFunction}(2π * ${messageFrequency} * t)`;

    const carrierSignalExplanation = document.getElementById('carrierSignalExplanation');
    carrierSignalExplanation.innerHTML = `<strong>Carrier Signal:</strong> c(t) = ${carrierAmplitude} * ${carrierFunction}(2π * ${carrierFrequency} * t)`;

    const modulationIndexExplanation = document.getElementById('modulationIndexExplanation');
    modulationIndexExplanation.innerHTML = `<strong>Modulation Index (β):</strong> β = ${modulationIndex.toFixed(2)}`;

    const pmSignalExplanation = document.getElementById('pmSignalExplanation');
    pmSignalExplanation.innerHTML = `<strong>PM Modulated Signal:</strong> PM(t) = ${carrierAmplitude} * ${carrierFunction}(2π * ${carrierFrequency} * t + (${modulationIndex.toFixed(2)} / ${messageAmplitude}) * m(t))`;
  };

  return (
    <div className="pm-container">
      <h2>PM Modulation</h2>
      <div className="input-container">
        <div>
          <label htmlFor="messageFunction">Message Function:</label>
          <select
            id="messageFunction"
            value={messageFunction}
            onChange={(e) => setMessageFunction(e.target.value)}
          >
            <option value="sin">Sine</option>
            <option value="cos">Cosine</option>
          </select>
        </div>
        <div>
          <label htmlFor="carrierFunction">Carrier Function:</label>
          <select
            id="carrierFunction"
            value={carrierFunction}
            onChange={(e) => setCarrierFunction(e.target.value)}
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
        <canvas id="pmChart"></canvas>
      </div>
      <div className="explanation-container">
        <p id="messageSignalExplanation"></p>
        <p id="carrierSignalExplanation"></p>
        <p id="modulationIndexExplanation"></p>
        <p id="pmSignalExplanation"></p>
      </div>
    </div>
  );
}