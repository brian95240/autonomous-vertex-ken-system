import React, { useState, useEffect, useRef } from 'react';
import './iron-man-theme.css';

// Voice Interface Component
const VoiceInterface = ({ isListening, onToggleListening, voiceStatus, lastTranscription }) => {
  return (
    <div className="voice-interface">
      <div className="voice-status">
        {voiceStatus || (isListening ? 'Listening...' : 'Voice Ready')}
      </div>
      
      <div 
        className={`voice-button ${isListening ? 'active' : ''}`}
        onClick={onToggleListening}
        title={isListening ? 'Stop Listening' : 'Start Voice Input'}
      >
        <div className="voice-icon">
          {isListening ? '🎤' : '🔊'}
        </div>
      </div>
      
      {lastTranscription && (
        <div className="status-panel" style={{ marginTop: '20px' }}>
          <div className="status-title">Last Input</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            "{lastTranscription}"
          </div>
        </div>
      )}
      
      <div className="arc-reactor"></div>
    </div>
  );
};

// Logo Component
const KenJarvisLogo = ({ size = 60 }) => (
  <div className="ken-jarvis-logo" style={{ width: size, height: size }}>
    <img 
      src="/assets/ken-jarvis-logo-app-icon.png" 
      alt="K.E.N. & J.A.R.V.I.S. Logo"
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'contain',
        filter: 'drop-shadow(0 0 10px var(--primary-blue))'
      }}
    />
  </div>
);

// Status Panel Component
const StatusPanel = ({ title, children }) => (
  <div className="status-panel">
    <div className="status-title">{title}</div>
    {children}
  </div>
);

// Data Card Component
const DataCard = ({ label, value, unit = '' }) => (
  <div className="data-card">
    <div className="data-label">{label}</div>
    <div className="data-value">{value}{unit}</div>
  </div>
);

// Progress Bar Component
const ProgressBar = ({ value, max = 100, label }) => (
  <div>
    {label && <div className="status-title">{label}</div>}
    <div className="status-bar">
      <div 
        className="status-bar-fill" 
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
    <div className="status-value">{value}%</div>
  </div>
);

// Conversation Message Component
const ConversationMessage = ({ message, isUser, timestamp }) => (
  <div className={`conversation-message ${isUser ? 'user' : 'jarvis'}`}>
    <div className="message-text">{message}</div>
    <div className="message-timestamp">
      {new Date(timestamp).toLocaleTimeString()}
    </div>
  </div>
);

// Notification Component
const Notification = ({ type = 'info', message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      {message}
    </div>
  );
};

// Main J.A.R.V.I.S. Interface Component
const JarvisInterface = () => {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Voice System Ready');
  const [lastTranscription, setLastTranscription] = useState('');
  const [conversation, setConversation] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    kenEnhancement: 1.69e18,
    jarvisConfidence: 95,
    processingSpeed: 34.13,
    successRate: 100,
    activeAlgorithms: 49,
    voiceAccuracy: 97.8
  });
  const [notifications, setNotifications] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs
  const conversationRef = useRef(null);
  const voiceEngineRef = useRef(null);

  // Initialize voice engine
  useEffect(() => {
    initializeVoiceEngine();
    
    // Simulate real-time metrics updates
    const metricsInterval = setInterval(updateMetrics, 2000);
    
    return () => {
      clearInterval(metricsInterval);
      if (voiceEngineRef.current) {
        voiceEngineRef.current.stop();
      }
    };
  }, []);

  const initializeVoiceEngine = async () => {
    try {
      setVoiceStatus('Initializing Voice Engine...');
      
      // Simulate voice engine initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVoiceStatus('Voice System Online');
      addNotification('success', 'K.E.N. & J.A.R.V.I.S. Voice System Initialized');
      
      // Add welcome message
      addConversationMessage(
        'K.E.N. & J.A.R.V.I.S. voice interface is now online. How may I assist you today?',
        false
      );
      
    } catch (error) {
      setVoiceStatus('Voice System Error');
      addNotification('error', 'Failed to initialize voice system');
    }
  };

  const updateMetrics = () => {
    setSystemMetrics(prev => ({
      ...prev,
      kenEnhancement: prev.kenEnhancement + (Math.random() - 0.5) * 1e16,
      jarvisConfidence: Math.max(90, Math.min(100, prev.jarvisConfidence + (Math.random() - 0.5) * 2)),
      processingSpeed: Math.max(20, Math.min(50, prev.processingSpeed + (Math.random() - 0.5) * 2)),
      voiceAccuracy: Math.max(95, Math.min(100, prev.voiceAccuracy + (Math.random() - 0.5) * 0.5))
    }));
  };

  const toggleListening = async () => {
    if (isListening) {
      setIsListening(false);
      setVoiceStatus('Voice Input Stopped');
    } else {
      setIsListening(true);
      setVoiceStatus('Listening for voice input...');
      
      // Simulate voice recognition
      setTimeout(() => {
        if (isListening) {
          simulateVoiceInput();
        }
      }, 3000);
    }
  };

  const simulateVoiceInput = async () => {
    const sampleInputs = [
      "Hello K.E.N. & J.A.R.V.I.S., what's the status of the system?",
      "Can you enhance this data with the 49 algorithm engine?",
      "Show me the current performance metrics",
      "Run a diagnostic on all systems",
      "What's the enhancement factor right now?"
    ];
    
    const randomInput = sampleInputs[Math.floor(Math.random() * sampleInputs.length)];
    
    setLastTranscription(randomInput);
    setVoiceStatus('Processing voice input...');
    setIsProcessing(true);
    
    // Add user message
    addConversationMessage(randomInput, true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate J.A.R.V.I.S. response
    const response = generateJarvisResponse(randomInput);
    addConversationMessage(response, false);
    
    setIsProcessing(false);
    setIsListening(false);
    setVoiceStatus('Voice System Ready');
  };

  const generateJarvisResponse = (input) => {
    const responses = {
      'status': 'All systems are operating at optimal efficiency. K.E.N. enhancement factor is currently at 1.69 quintillion times baseline.',
      'enhance': 'Initiating 49 algorithm enhancement protocol. Processing through quantum foundation, causal-Bayesian, and consciousness simulation layers.',
      'metrics': `Current performance metrics: ${systemMetrics.processingSpeed}ms response time, ${systemMetrics.successRate}% success rate, ${systemMetrics.voiceAccuracy}% voice accuracy.`,
      'diagnostic': 'Running comprehensive system diagnostic... All 49 algorithms operational. No anomalies detected.',
      'enhancement': `Enhancement factor is currently ${(systemMetrics.kenEnhancement / 1e18).toFixed(2)} quintillion times baseline performance.`
    };
    
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('status')) return responses.status;
    if (inputLower.includes('enhance')) return responses.enhance;
    if (inputLower.includes('metrics') || inputLower.includes('performance')) return responses.metrics;
    if (inputLower.includes('diagnostic')) return responses.diagnostic;
    if (inputLower.includes('enhancement') || inputLower.includes('factor')) return responses.enhancement;
    
    return 'I understand your request. Processing through K.E.N. & J.A.R.V.I.S. integration protocols for optimal response generation.';
  };

  const addConversationMessage = (message, isUser) => {
    const newMessage = {
      id: Date.now(),
      message,
      isUser,
      timestamp: new Date().toISOString()
    };
    
    setConversation(prev => [...prev, newMessage]);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      if (conversationRef.current) {
        conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
      }
    }, 100);
  };

  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type,
      message
    };
    
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatEnhancementFactor = (value) => {
    return (value / 1e18).toFixed(2) + 'e18x';
  };

  return (
    <div className="jarvis-container">
      {/* Header */}
      <header className="jarvis-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <KenJarvisLogo size={80} />
          <div>
            <h1 className="jarvis-title">K.E.N. & J.A.R.V.I.S.</h1>
            <p className="jarvis-subtitle">Quintillion-Scale AI Enhancement System</p>
          </div>
          <KenJarvisLogo size={80} />
        </div>
      </header>

      {/* Main Content */}
      <main className="jarvis-main">
        {/* Left Sidebar - System Status */}
        <aside className="jarvis-sidebar">
          <div className="rivet bottom-left"></div>
          <div className="rivet bottom-right"></div>
          
          <h3 style={{ color: 'var(--primary-blue)', marginBottom: '20px', textAlign: 'center' }}>
            System Status
          </h3>
          
          <StatusPanel title="K.E.N. Enhancement">
            <div className="status-value">{formatEnhancementFactor(systemMetrics.kenEnhancement)}</div>
          </StatusPanel>
          
          <ProgressBar 
            value={systemMetrics.jarvisConfidence} 
            label="J.A.R.V.I.S. Confidence"
          />
          
          <StatusPanel title="Processing Speed">
            <div className="status-value">{systemMetrics.processingSpeed.toFixed(2)}ms</div>
          </StatusPanel>
          
          <ProgressBar 
            value={systemMetrics.successRate} 
            label="Success Rate"
          />
          
          <StatusPanel title="Active Algorithms">
            <div className="status-value">{systemMetrics.activeAlgorithms}/49</div>
          </StatusPanel>
          
          <ProgressBar 
            value={systemMetrics.voiceAccuracy} 
            label="Voice Accuracy"
          />
        </aside>

        {/* Central Display */}
        <section className="jarvis-display steel-panel large-rivets">
          <div className="corner-rivet top-left"></div>
          <div className="corner-rivet top-right"></div>
          <div className="corner-rivet bottom-left"></div>
          <div className="corner-rivet bottom-right"></div>
          
          {/* Voice Interface */}
          <VoiceInterface
            isListening={isListening}
            onToggleListening={toggleListening}
            voiceStatus={voiceStatus}
            lastTranscription={lastTranscription}
          />
          
          {/* Processing Indicator */}
          {isProcessing && (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <div className="loading-spinner"></div>
              <div style={{ color: 'var(--primary-blue)', marginTop: '10px' }}>
                Processing through 49 algorithm engine...
              </div>
            </div>
          )}
          
          {/* Performance Metrics */}
          <div className="data-grid">
            <DataCard 
              label="Response Time" 
              value={systemMetrics.processingSpeed.toFixed(1)} 
              unit="ms" 
            />
            <DataCard 
              label="Enhancement Factor" 
              value={(systemMetrics.kenEnhancement / 1e18).toFixed(2)} 
              unit="e18x" 
            />
            <DataCard 
              label="Voice Accuracy" 
              value={systemMetrics.voiceAccuracy.toFixed(1)} 
              unit="%" 
            />
            <DataCard 
              label="System Uptime" 
              value="99.9" 
              unit="%" 
            />
          </div>
          
          {/* Control Buttons */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '30px 0' }}>
            <button className="jarvis-button" onClick={() => addNotification('info', 'Running system diagnostic...')}>
              System Diagnostic
            </button>
            <button className="jarvis-button" onClick={() => addNotification('success', 'Algorithms optimized')}>
              Optimize Algorithms
            </button>
            <button className="jarvis-button" onClick={() => addNotification('info', 'Generating performance report...')}>
              Performance Report
            </button>
          </div>
        </section>

        {/* Right Sidebar - Conversation */}
        <aside className="jarvis-sidebar">
          <div className="rivet bottom-left"></div>
          <div className="rivet bottom-right"></div>
          
          <h3 style={{ color: 'var(--primary-blue)', marginBottom: '20px', textAlign: 'center' }}>
            Conversation Log
          </h3>
          
          <div className="conversation-panel" ref={conversationRef}>
            {conversation.map(msg => (
              <ConversationMessage
                key={msg.id}
                message={msg.message}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
              />
            ))}
            
            {conversation.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                color: 'var(--text-secondary)', 
                marginTop: '50px' 
              }}>
                No conversation yet.<br />
                Click the voice button to start.
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              className="jarvis-button" 
              onClick={() => setConversation([])}
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
              Clear Log
            </button>
          </div>
        </aside>
      </main>

      {/* Notifications */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default JarvisInterface;

