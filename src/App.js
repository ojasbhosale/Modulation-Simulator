// src/App.js
import React from 'react';
import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import AM from './components/Modulation/Analog/AM';
import PM from './components/Modulation/Analog/PM';
import FM from './components/Modulation/Analog/FM';
import ASK from './components/Modulation/Digital/ASK';
import FSK from './components/Modulation/Digital/FSK';
import BPSK from './components/Modulation/Digital/BPSK';

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/modulation/analog/am" element={<AM />} />
                <Route path="/modulation/analog/pm" element={<PM />} />
                <Route path="/modulation/analog/fm" element={<FM />} />
                <Route path="/modulation/digital/ask" element={<ASK />} />
                <Route path="/modulation/digital/bpsk" element={<BPSK />} />
                <Route path="/modulation/digital/fsk" element={<FSK />} />
            </Routes>
        </Router>
    );
};

export default App;
