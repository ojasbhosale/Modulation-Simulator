import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chart from 'chart.js/auto';
import '../../../styles/ASK.css';

const ASK = () => {
  const [bitStream, setBitStream] = useState('1101011'); // Default bit stream
  const [carrierAmplitude, setCarrierAmplitude] = useState(1);
  const [carrierFrequency, setCarrierFrequency] = useState(10);
  const [carrierType, setCarrierType] = useState('cos'); // New state for carrier type
  const sampleRate = 1000; // Samples per second
  const duration = 1; // Total duration in seconds for the bit stream

  // Calculate bit rate and duration per bit based on the length of bit stream
  const bitRate = bitStream.length / duration;
  const bitDuration = 1 / bitRate;

  // Refs to store chart instances for cleanup
  const carrierChartRef = useRef(null);
  const askChartRef = useRef(null);

  const validateInputs = useCallback(() => {
    if (
      carrierAmplitude <= 0 || // Carrier amplitude should be greater than 0
      carrierFrequency <= 0 ||
      bitStream.length === 0 || !/^[01]+$/.test(bitStream) // Check if bitStream is non-empty and valid binary
    ) {
      alert('Please enter valid positive values for amplitudes, frequencies, and a valid binary bit stream.');
      return false;
    }
    return true;
  }, [carrierAmplitude, carrierFrequency, bitStream]);

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

  const generateASKSignal = useCallback((carrierSignal, bitStream, bitDuration, sampleRate) => {
    const askSignal = [];
    const numSamplesPerBit = Math.floor(bitDuration * sampleRate);
    let bitIndex = 0;

    for (let i = 0; i < carrierSignal.length; i++) {
      const bit = bitStream[bitIndex];
      const modulatedSample = bit === '1' ? carrierSignal[i] : 0;
      askSignal.push(modulatedSample);

      // Move to the next bit after numSamplesPerBit
      if ((i + 1) % numSamplesPerBit === 0) bitIndex++;
      if (bitIndex >= bitStream.length) break;
    }

    return askSignal;
  }, []);

  const updateExplanations = useCallback(() => {
    const bitStreamExplanation = document.getElementById('bitStreamExplanation');
    bitStreamExplanation.innerHTML = `<strong>Bit Stream:</strong> ${bitStream}`;

    const carrierSignalExplanation = document.getElementById('carrierSignalExplanation');
    carrierSignalExplanation.innerHTML = `<strong>Carrier Signal:</strong> c(t) = ${carrierAmplitude} * ${carrierType}(2π * ${carrierFrequency} * t)`;

    const askSignalExplanation = document.getElementById('askSignalExplanation');
    askSignalExplanation.innerHTML = `<strong>ASK Modulated Signal:</strong> 
      <pre>
        ASK(t) = { 
          ${carrierAmplitude} * ${carrierType}(2π * ${carrierFrequency} * t) ; if bit = 1,
          0                    ; if bit = 0 
        }
      </pre>`;
  }, [bitStream, carrierAmplitude, carrierFrequency, carrierType]);

  const renderCharts = useCallback((carrierSig, askSig) => {
    const timeLabels = Array.from({ length: duration * sampleRate }, (_, i) => i / sampleRate);

    // Destroy existing charts before creating new ones
    if (carrierChartRef.current) carrierChartRef.current.destroy();
    if (askChartRef.current) askChartRef.current.destroy();

    const carrierCtx = document.getElementById('carrierChart').getContext('2d');
    const askCtx = document.getElementById('askChart').getContext('2d');

    carrierChartRef.current = new Chart(carrierCtx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{ label: 'Carrier Signal', borderColor: 'green', data: carrierSig, fill: false }],
      },
      options: { scales: { x: { type: 'linear', position: 'bottom' } } },
    });

    askChartRef.current = new Chart(askCtx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{ label: 'ASK Modulated Signal', borderColor: 'red', data: askSig, fill: false }],
      },
      options: { scales: { x: { type: 'linear', position: 'bottom' } } },
    });
  }, [duration, sampleRate]);

  const updateCharts = useCallback(() => {
    if (!validateInputs()) return;

    // Generate signals
    const carrierSig = generateCarrierSignal(carrierFrequency, carrierAmplitude, sampleRate, duration);
    const askSig = generateASKSignal(carrierSig, bitStream, bitDuration, sampleRate);

    // Update the charts
    renderCharts(carrierSig, askSig);
    updateExplanations();
  }, [
    validateInputs,
    generateCarrierSignal,
    generateASKSignal,
    carrierFrequency,
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
      if (carrierChartRef.current) carrierChartRef.current.destroy();
      if (askChartRef.current) askChartRef.current.destroy();
    };
  }, [updateCharts]);

  return (
    <div className="ask-container">
      <h2>ASK Modulation</h2>
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
          <label htmlFor="carrierFrequency">Carrier Frequency (fc):</label>
          <input
            type="number"
            id="carrierFrequency"
            value={carrierFrequency}
            onChange={(e) => setCarrierFrequency(parseFloat(e.target.value))}
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
        <canvas id="carrierChart"></canvas>
        <canvas id="askChart"></canvas>
      </div>
      <div className="explanation-container">
        <p id="bitStreamExplanation"></p>
        <p id="carrierSignalExplanation"></p>
        <p id="askSignalExplanation"></p>
      </div>
    </div>
  );
};

export default ASK;