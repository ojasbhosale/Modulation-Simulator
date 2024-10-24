import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Navbar.css';

const Navbar = () => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navRef = useRef(null);

    const toggleDropdown = (type) => {
        setActiveDropdown(prevActive => prevActive === type ? null : type);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleDropdownOptionClick = () => {
        setActiveDropdown(null); // Close the dropdown after clicking an option
        setMobileMenuOpen(false); // Close mobile menu if open
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setActiveDropdown(null);
                setMobileMenuOpen(false);
            }
        };

        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                setActiveDropdown(null);
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);

    const renderDropdownContent = (type) => (
        <div className={`dropdown-content ${activeDropdown === type ? 'show' : ''}`}>
            {type === 'analog' ? (
                <>
                    <Link to="/modulation/analog/am" onClick={handleDropdownOptionClick}>AM</Link>
                    <Link to="/modulation/analog/pm" onClick={handleDropdownOptionClick}>PM</Link>
                    <Link to="/modulation/analog/fm" onClick={handleDropdownOptionClick}>FM</Link>
                </>
            ) : (
                <>
                    <Link to="/modulation/digital/ask" onClick={handleDropdownOptionClick}>ASK</Link>
                    <Link to="/modulation/digital/bpsk" onClick={handleDropdownOptionClick}>BPSK</Link>
                    <Link to="/modulation/digital/fsk" onClick={handleDropdownOptionClick}>FSK</Link>
                </>
            )}
        </div>
    );

    return (
        <header className="header" ref={navRef}>
            <div className="section-1">
                <Link to="/" className="logo">Home</Link>
                <span className="title">Modulation Simulator</span>
            </div>
            <nav className="section-2">
                <div className="mobile-nav-top">
                    <Link to="/" className="mobile-home">Home</Link>
                    <div className="menu-icon" onClick={toggleMobileMenu}>☰</div>
                </div>
                <span className="menu-text">Menu &gt;&gt;</span>
                <div className="dropdown-container">
                    <div className="dropdown">
                        <button 
                            className={`dropbtn ${activeDropdown === 'analog' ? 'active' : ''}`} 
                            onClick={() => toggleDropdown('analog')}
                        >
                            Analog Modulation 
                            <span className="dropdown-arrow">▼</span>
                        </button>
                        {renderDropdownContent('analog')}
                    </div>
                    <div className="dropdown">
                        <button 
                            className={`dropbtn ${activeDropdown === 'digital' ? 'active' : ''}`} 
                            onClick={() => toggleDropdown('digital')}
                        >
                            Digital Modulation 
                            <span className="dropdown-arrow">▼</span>
                        </button>
                        {renderDropdownContent('digital')}
                    </div>
                </div>
                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        <div className="dropdown">
                            <button 
                                className={`dropbtn ${activeDropdown === 'analog' ? 'active' : ''}`} 
                                onClick={() => toggleDropdown('analog')}
                            >
                                Analog Modulation 
                                <span className="dropdown-arrow">▼</span>
                            </button>
                            {renderDropdownContent('analog')}
                        </div>
                        <div className="dropdown">
                            <button 
                                className={`dropbtn ${activeDropdown === 'digital' ? 'active' : ''}`} 
                                onClick={() => toggleDropdown('digital')}
                            >
                                Digital Modulation 
                                <span className="dropdown-arrow">▼</span>
                            </button>
                            {renderDropdownContent('digital')}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;
