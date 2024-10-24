import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { 
  FaWaveSquare, 
  FaChartLine, 
  FaLightbulb, 
  FaCode,
  FaGraduationCap,
  FaGithub,
  FaTwitter,
  FaLinkedin
} from 'react-icons/fa';

const WavyBackground = () => (
  <div className="wavy-background">
    <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
      <motion.path
        d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,186.7C960,213,1056,235,1152,224C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        fill="url(#gradient)"
        animate={{
          d: [
            "M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,186.7C960,213,1056,235,1152,224C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            "M0,64L48,85.3C96,107,192,149,288,165.3C384,181,480,171,576,144C672,117,768,75,864,80C960,85,1056,139,1152,160C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(79, 70, 229, 0.6)" />
          <stop offset="50%" stopColor="rgba(124, 58, 237, 0.6)" />
          <stop offset="100%" stopColor="rgba(79, 70, 229, 0.6)" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const FeatureCard = ({ icon, title, description }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  return (
    <motion.div 
      className="feature-card"
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="feature-icon-wrapper">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
};

const ModulationDemo = ({ type }) => {
  const [frequency, setFrequency] = useState(50);
  const [amplitude, setAmplitude] = useState(75);

  return (
    <div className="modulation-demo">
      <motion.div 
        className="signal-wave"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%234f46e5' fill-opacity='1' d='M0,${160 - amplitude * 1.6}L48,${160 - amplitude * Math.sin(frequency * 0.1)}C96,${160 - amplitude * Math.sin(frequency * 0.2)},192,${160 - amplitude * Math.sin(frequency * 0.3)},288,${160 - amplitude * Math.sin(frequency * 0.4)}C384,${160 - amplitude * Math.sin(frequency * 0.5)},480,${160 - amplitude * Math.sin(frequency * 0.6)},576,${160 - amplitude * Math.sin(frequency * 0.7)}C672,${160 - amplitude * Math.sin(frequency * 0.8)},768,${160 - amplitude * Math.sin(frequency * 0.9)},864,${160 - amplitude * Math.sin(frequency * 1.0)}C960,${160 - amplitude * Math.sin(frequency * 1.1)},1056,${160 - amplitude * Math.sin(frequency * 1.2)},1152,${160 - amplitude * Math.sin(frequency * 1.3)}C1248,${160 - amplitude * Math.sin(frequency * 1.4)},1344,${160 - amplitude * Math.sin(frequency * 1.5)},1392,${160 - amplitude * Math.sin(frequency * 1.6)}L1440,${160 - amplitude * 1.6}L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat"
        }}
        animate={{
          backgroundPositionX: ["0%", "100%"],
        }}
        transition={{
          duration: 20 / (frequency / 50),
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <div className="demo-controls">
        <label>Frequency: {frequency}Hz</label>
        <input 
          type="range" 
          min="1" 
          max="100" 
          value={frequency} 
          onChange={(e) => setFrequency(Number(e.target.value))} 
        />
        <label>Amplitude: {amplitude}%</label>
        <input 
          type="range" 
          min="1" 
          max="100" 
          value={amplitude} 
          onChange={(e) => setAmplitude(Number(e.target.value))} 
        />
      </div>
    </div>
  );
};

const Home = () => {
  const [activeDemo, setActiveDemo] = useState('analog');

  const features = [
    {
      icon: <FaWaveSquare />,
      title: "Analog Modulation",
      description: "Interactive AM, FM, and PM simulations with real-time waveform visualization"
    },
    {
      icon: <FaChartLine />,
      title: "Digital Signals",
      description: "Comprehensive ASK, FSK, and BPSK modulation techniques with constellation diagrams"
    },
    {
      icon: <FaCode />,
      title: "Signal Processing",
      description: "Advanced FFT analysis, filtering, and noise simulation capabilities"
    },
    {
      icon: <FaLightbulb />,
      title: "Interactive Learning",
      description: "Real-time parameter adjustment with instant visual feedback"
    },
    {
      icon: <FaGraduationCap />,
      title: "Educational Tools",
      description: "Structured learning paths with comprehensive theoretical foundations"
    }
  ];

  return (
    <div className="home">
      <header className="hero">
        <WavyBackground />
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Modulation Simulator
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Master signal processing through interactive visualization
          </motion.p>
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button className="btn-primary">Get Started</button>
            <button className="btn-secondary">Learn More</button>
          </motion.div>
        </div>
      </header>

      <section className="features-section">
        <h2>Powerful Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      <section className="demo-section">
        <h2>Interactive Demo</h2>
        <div className="demo-tabs">
          <button 
            className={`demo-tab ${activeDemo === 'analog' ? 'active' : ''}`}
            onClick={() => setActiveDemo('analog')}
          >
            Analog
          </button>
          <button 
            className={`demo-tab ${activeDemo === 'digital' ? 'active' : ''}`}
            onClick={() => setActiveDemo('digital')}
          >
            Digital
          </button>
        </div>
        <ModulationDemo type={activeDemo} />
      </section>

      <section className="cta-section">
        <h2>Start Your Journey</h2>
        <p>Join thousands of engineers and students mastering signal processing</p>
        <button className="btn-primary">Get Started</button>
      </section>

      <section className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"This simulator has revolutionized how I teach modulation techniques. It's an invaluable tool for both students and educators."</p>
            <h4>Dr. Emily Chen</h4>
            <p>Professor of Electrical Engineering</p>
          </div>
          <div className="testimonial-card">
            <p>"The interactive demos helped me grasp complex concepts quickly. It's like having a lab in my pocket!"</p>
            <h4>Alex Johnson</h4>
            <p>Electrical Engineering Student</p>
          </div>
          <div className="testimonial-card">
            <p>"As a professional engineer, I use this tool for quick prototyping and visualization. It's become an essential part of my workflow."</p>
            <h4>Sarah Thompson</h4>
            <p>Senior RF Engineer</p>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>Modulation Simulator</h3>
            <p>Advancing signal processing education</p>
            <div className="social-icons">
              <a href="/" aria-label="GitHub"><FaGithub /></a>
              <a href="/" aria-label="Twitter"><FaTwitter /></a>
              <a href="/" aria-label="LinkedIn"><FaLinkedin /></a>
            </div>
          </div>
          <div className="footer-links">
            <div>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#demo">Demo</a>
            </div>
            <div>
              <h4>Resources</h4>
              <a href="#docs">Documentation</a>
              <a href="#tutorials">Tutorials</a>
              <a href="#blog">Blog</a>
            </div>
            <div>
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
              <a href="#careers">Careers</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Modulation Simulator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;