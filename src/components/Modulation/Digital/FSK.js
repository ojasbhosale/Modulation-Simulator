import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chart from 'chart.js/auto';
import '../../../styles/FSK.css';

const FSK = () => {
  const [bitStream, setBitStream] = useState('1101011'); // Default bit stream
  const [carrierAmplitude, setCarrierAmplitude] = useState(1);
  const [frequency0, setFrequency0] = useState(10); // Frequency for bit '0'
  const [frequency1, setFrequency1] = useState(20); // Frequency for bit '1'
  const [carrierType, setCarrierType] = useState('cos'); // New state for carrier type
  const sampleRate = 1000; // Samples per second
  const duration = 1; // Total duration in seconds for the bit stream

  // Calculate bit rate and duration per bit based on the length of bit stream
  const bitRate = bitStream.length / duration;
  const bitDuration = 1 / bitRate;

  // Refs to store chart instances for cleanup
  const carrier0ChartRef = useRef(null);
  const carrier1ChartRef = useRef(null);
  const fskChartRef = useRef(null);

  const validateInputs = useCallback(() => {
    if (
      carrierAmplitude <= 0 || // Carrier amplitude should be greater than 0
      frequency0 <= 0 ||
      frequency1 <= 0 ||
      bitStream.length === 0 || !/^[01]+$/.test(bitStream) // Check if bitStream is non-empty and valid binary
    ) {
      alert('Please enter valid positive values for amplitudes, frequencies, and a valid binary bit stream.');
      return false;
    }
    return true;
  }, [carrierAmplitude, frequency0, frequency1, bitStream]);

  const generateCarrierSignal = useCallback((frequency, amplitude, sampleRate, duration) => {
    const numSamples = duration * sampleRate;
    const carrierSignal = [];
    for (let i = 0; i < numSamples; i++) {
      const time = i / sampleRate;
      const sample = carrierType === 'cos' 
        ? amplitude * Math.cos(2 * Math.PI * frequency * time)
        : amplitude * Math.sin(2 * Math.PI * frequency * time);
      carrierSignal.push(sample);
    }
    return carrierSignal;
  }, [carrierType]);

  const generateFSKSignal = useCallback((carrier0Signal, carrier1Signal, bitStream, bitDuration, sampleRate) => {
    const fskSignal = [];
    const numSamplesPerBit = Math.floor(bitDuration * sampleRate);
    let bitIndex = 0;

    for (let i = 0; i < carrier0Signal.length; i++) {
      const bit = bitStream[bitIndex];
      const modulatedSample = bit === '0' ? carrier0Signal[i] : carrier1Signal[i];
      fskSignal.push(modulatedSample);

      // Move to the next bit after numSamplesPerBit
      if ((i + 1) % numSamplesPerBit === 0) bitIndex++;
      if (bitIndex >= bitStream.length) break;
    }

    return fskSignal;
  }, []);

  const updateExplanations = useCallback(() => {
    const bitStreamExplanation = document.getElementById('bitStreamExplanation');
    bitStreamExplanation.innerHTML = `<strong>Bit Stream:</strong> ${bitStream}`;

    const carrier0SignalExplanation = document.getElementById('carrier0SignalExplanation');
    carrier0SignalExplanation.innerHTML = `<strong>Carrier Signal (Bit 0):</strong> c0(t) = ${carrierAmplitude} * ${carrierType}(2π * ${frequency0} * t)`;

    const carrier1SignalExplanation = document.getElementById('carrier1SignalExplanation');
    carrier1SignalExplanation.innerHTML = `<strong>Carrier Signal (Bit 1):</strong> c1(t) = ${carrierAmplitude} * ${carrierType}(2π * ${frequency1} * t)`;

    const fskSignalExplanation = document.getElementById('fskSignalExplanation');
    fskSignalExplanation.innerHTML = `<strong>FSK Modulated Signal:</strong> 
      <pre>
        FSK(t) = { 
          ${carrierAmplitude} * ${carrierType}(2π * ${frequency0} * t) ; if bit = 0,
          ${carrierAmplitude} * ${carrierType}(2π * ${frequency1} * t) ; if bit = 1 
        }
      </pre>`;
  }, [bitStream, carrierAmplitude, carrierType, frequency0, frequency1]);

  const renderCharts = useCallback((carrier0Sig, carrier1Sig, fskSig) => {
    const timeLabels = Array.from({ length: duration * sampleRate }, (_, i) => i / sampleRate);

    // Destroy existing charts before creating new ones
    if (carrier0ChartRef.current) carrier0ChartRef.current.destroy();
    if (carrier1ChartRef.current) carrier1ChartRef.current.destroy();
    if (fskChartRef.current) fskChartRef.current.destroy();

    const carrier0Ctx = document.getElementById('carrier0Chart').getContext('2d');
    const carrier1Ctx = document.getElementById('carrier1Chart').getContext('2d');
    const fskCtx = document.getElementById('fskChart').getContext('2d');

    carrier0ChartRef.current = new Chart(carrier0Ctx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{ label: 'Carrier Signal (Bit 0)', borderColor: 'blue', data: carrier0Sig, fill: false }],
      },
      options: { scales: { x: { type: 'linear', position: 'bottom' } } },
    });

    carrier1ChartRef.current = new Chart(carrier1Ctx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{ label: 'Carrier Signal (Bit 1)', borderColor: 'green', data: carrier1Sig, fill: false }],
      },
      options: { scales: { x: { type: 'linear', position: 'bottom' } } },
    });

    fskChartRef.current = new Chart(fskCtx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{ label: 'FSK Modulated Signal', borderColor: 'red', data: fskSig, fill: false }],
      },
      options: { scales: { x: { type: 'linear', position: 'bottom' } } },
    });
  }, [duration, sampleRate]);

  const updateCharts = useCallback(() => {
    if (!validateInputs()) return;

    // Generate signals
    const carrier0Sig = generateCarrierSignal(frequency0, carrierAmplitude, sampleRate, duration);
    const carrier1Sig = generateCarrierSignal(frequency1, carrierAmplitude, sampleRate, duration);
    const fskSig = generateFSKSignal(carrier0Sig, carrier1Sig, bitStream, bitDuration, sampleRate);

    // Update the charts
    renderCharts(carrier0Sig, carrier1Sig, fskSig);
    updateExplanations();
  }, [
    validateInputs,
    generateCarrierSignal,
    generateFSKSignal,
    frequency0,
    frequency1,
    carrierAmplitude,
    sampleRate,
    duration,
    bitStream,
    bitDuration,
    renderCharts,
    updateExplanations
  ]);

  useEffect(() => {
    updateCharts();

    // Cleanup charts on component unmount or update
    return () => {
      if (carrier0ChartRef.current) carrier0ChartRef.current.destroy();
      if (carrier1ChartRef.current) carrier1ChartRef.current.destroy();
      if (fskChartRef.current) fskChartRef.current.destroy();
    };
  }, [updateCharts]);

  return (
    <div className="fsk-container">
      <h2>FSK Modulation</h2>
      <div className="input-container">
        <div>
          <label htmlFor="bitStream">Bit Stream (Binary):</label>
          <input
            type="text"
            id="bitStream"
            value={bitStream}
            onChange={(e) => setBitStream(e.target.value)}
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
          <label htmlFor="frequency0">Frequency for Bit 0 (f0):</label>
          <input
            type="number"
            id="frequency0"
            value={frequency0}
            onChange={(e) => setFrequency0(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="frequency1">Frequency for Bit 1 (f1):</label>
          <input
            type="number"
            id="frequency1"
            value={frequency1}
            onChange={(e) => setFrequency1(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="carrierType">Carrier Signal Type:</label>
          <select
            id="carrierType"
            value={carrierType}
            onChange={(e) => setCarrierType(e.target.value)}
          >
            <option value="cos">Cosine</option>
            <option value="sin">Sine</option>
          </select>
        </div>
      </div>
      <div className="charts-container">
        <canvas id="carrier0Chart"></canvas>
        <canvas id="carrier1Chart"></canvas>
        <canvas id="fskChart"></canvas>
      </div>
      <div className="explanation-container">
        <p id="bitStreamExplanation"></p>
        <p id="carrier0SignalExplanation"></p>
        <p id="carrier1SignalExplanation"></p>
        <p id="fskSignalExplanation"></p>
      </div>
    </div>
  );
};

export default FSK;