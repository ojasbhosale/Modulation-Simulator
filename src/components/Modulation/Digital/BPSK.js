import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import '../../../styles/BPSK.css';

export default function Component() {
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
  const bpskChartRef = useRef(null);

  useEffect(() => {
    updateCharts();

    // Cleanup charts on component unmount or update
    return () => {
      if (carrierChartRef.current) carrierChartRef.current.destroy();
      if (bpskChartRef.current) bpskChartRef.current.destroy();
    };
  }, [bitStream, carrierAmplitude, carrierFrequency, carrierType]);

  const validateInputs = () => {
    if (
      carrierAmplitude <= 0 ||
      carrierFrequency <= 0 ||
      bitStream.length === 0 || !/^[01]+$/.test(bitStream)
    ) {
      alert('Please enter valid positive values for amplitudes, frequencies, and a valid binary bit stream.');
      return false;
    }
    return true;
  };

  const updateCharts = () => {
    if (!validateInputs()) return;

    // Generate signals
    const carrierSig = generateCarrierSignal(carrierFrequency, carrierAmplitude, sampleRate, duration);
    const bpskSig = generateBPSKSignal(carrierSig, bitStream, bitDuration, sampleRate);

    // Update the charts
    renderCharts(carrierSig, bpskSig);
    updateExplanations();
  };

  const renderCharts = (carrierSig, bpskSig) => {
    const timeLabels = Array.from({ length: duration * sampleRate }, (_, i) => i / sampleRate);

    if (carrierChartRef.current) carrierChartRef.current.destroy();
    if (bpskChartRef.current) bpskChartRef.current.destroy();

    const carrierCtx = document.getElementById('carrierChart').getContext('2d');
    const bpskCtx = document.getElementById('bpskChart').getContext('2d');

    carrierChartRef.current = new Chart(carrierCtx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{ label: 'Carrier Signal', borderColor: 'green', data: carrierSig, fill: false }],
      },
      options: { scales: { x: { type: 'linear', position: 'bottom' } } },
    });

    bpskChartRef.current = new Chart(bpskCtx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{ label: 'BPSK Modulated Signal', borderColor: 'red', data: bpskSig, fill: false }],
      },
      options: { scales: { x: { type: 'linear', position: 'bottom' } } },
    });
  };

  const generateCarrierSignal = (frequency, amplitude, sampleRate, duration) => {
    const numSamples = duration * sampleRate;
    const carrierSignal = [];
    for (let i = 0; i < numSamples; i++) {
      const time = i / sampleRate;
      const sample = amplitude * (carrierType === 'cos' ? 
        Math.cos(2 * Math.PI * frequency * time) : 
        Math.sin(2 * Math.PI * frequency * time));
      carrierSignal.push(sample);
    }
    return carrierSignal;
  };

  const generateBPSKSignal = () => {
    const bpskSignal = [];
    const totalSamples = sampleRate * duration;
    const samplesPerBit = Math.floor(totalSamples / bitStream.length);
    
    // Calculate carrier angular frequency
    const w = 2 * Math.PI * carrierFrequency;
    
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const bitIndex = Math.floor(i / samplesPerBit);
      
      // Ensure we don't exceed the bit stream length
      if (bitIndex >= bitStream.length) break;
      
      // Get the current bit value (1 -> +1, 0 -> -1 for phase shift)
      const bitValue = bitStream[bitIndex] === '1' ? 1 : -1;
      
      // Generate BPSK signal
      // For cosine carrier: s(t) = A * bitValue * cos(wt)
      // For sine carrier: s(t) = A * bitValue * sin(wt)
      const sample = carrierAmplitude * bitValue * (
        carrierType === 'cos' ? Math.cos(w * t) : Math.sin(w * t)
      );
      
      bpskSignal.push(sample);
    }
    
    return bpskSignal;
  };


    


  const updateExplanations = () => {
    const bitStreamExplanation = document.getElementById('bitStreamExplanation');
    bitStreamExplanation.innerHTML = `<strong>Bit Stream:</strong> ${bitStream}`;

    const carrierSignalExplanation = document.getElementById('carrierSignalExplanation');
    carrierSignalExplanation.innerHTML = `<strong>Carrier Signal:</strong> c(t) = ${carrierAmplitude} * ${carrierType}(2π * ${carrierFrequency} * t)`;

    const bpskSignalExplanation = document.getElementById('bpskSignalExplanation');
    bpskSignalExplanation.innerHTML = `<strong>BPSK Modulated Signal:</strong> 
      <pre>
        BPSK(t) = { 
          ${carrierAmplitude} * ${carrierType}(2π * ${carrierFrequency} * t) ; if bit = 1,
          ${-carrierAmplitude} * ${carrierType}(2π * ${carrierFrequency} * t) ; if bit = 0 
        }
      </pre>`;
  };

  return (
    <div className="bpsk-container">
      <h2>BPSK Modulation</h2>
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
          <label htmlFor="carrierType">Carrier Type:</label>
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
        <canvas id="bpskChart"></canvas>
      </div>
      <div className="explanation-container">
        <p id="bitStreamExplanation"></p>
        <p id="carrierSignalExplanation"></p>
        <p id="bpskSignalExplanation"></p>
      </div>
    </div>
  );
}