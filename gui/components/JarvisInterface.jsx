import React, { useState, useEffect, useRef } from 'react';
import './iron-man-theme.css';

// Text Input Component
const TextInput = ({ onSendMessage, isProcessing }) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && !isProcessing) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="text-input-section">
      <div className="input-header">
        <span className="input-icon">⌨️</span>
        <span className="input-label">Text Input</span>
      </div>
      
      <form onSubmit={handleSubmit} className="text-input-form">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to K.E.N. & J.A.R.V.I.S..."
            className="text-input-field"
            rows="3"
            disabled={isProcessing}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!inputText.trim() || isProcessing}
            title="Send Message"
          >
            {isProcessing ? '⏳' : '🚀'}
          </button>
        </div>
      </form>
      
      <div className="input-suggestions">
        <div className="suggestion-label">Quick Commands:</div>
        <div className="suggestions-grid">
          <button 
            className="suggestion-button"
            onClick={() => setInputText('Show system status')}
          >
            System Status
          </button>
          <button 
            className="suggestion-button"
            onClick={() => setInputText('Run diagnostic')}
          >
            Diagnostic
          </button>
          <button 
            className="suggestion-button"
            onClick={() => setInputText('What is the enhancement factor?')}
          >
            Enhancement Factor
          </button>
          <button 
            className="suggestion-button"
            onClick={() => setInputText('Optimize algorithms')}
          >
            Optimize
          </button>
        </div>
      </div>
    </div>
  );
};

// Voice Interface Component with Hands-Free Toggle
const VoiceInterface = ({ 
  isListening, 
  onToggleListening, 
  voiceStatus, 
  lastTranscription,
  isHandsFree,
  onToggleHandsFree 
}) => {
  return (
    <div className="voice-interface">
      <div className="voice-status">
        {voiceStatus || (isListening ? 'Listening...' : 'Voice Ready')}
      </div>
      
      {/* Hands-Free Toggle */}
      <div className="hands-free-control" style={{ marginBottom: '20px' }}>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={isHandsFree}
            onChange={onToggleHandsFree}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label">
            {isHandsFree ? '🎤 Hands-Free Mode' : '👆 Manual Mode'}
          </span>
        </label>
      </div>
      
      {/* Voice Button - Only show in manual mode */}
      {!isHandsFree && (
        <div 
          className={`voice-button ${isListening ? 'active' : ''}`}
          onClick={onToggleListening}
          title={isListening ? 'Stop Listening' : 'Start Voice Input'}
        >
          <div className="voice-icon">
            {isListening ? '🎤' : '🔊'}
          </div>
        </div>
      )}
      
      {/* Hands-Free Indicator */}
      {isHandsFree && (
        <div className="hands-free-indicator">
          <div className={`hands-free-status ${isListening ? 'listening' : 'waiting'}`}>
            <div className="pulse-ring"></div>
            <div className="voice-icon">🎤</div>
          </div>
          <div style={{ color: 'var(--primary-blue)', marginTop: '10px', fontSize: '0.9rem' }}>
            {isListening ? 'Listening continuously...' : 'Say "Hey J.A.R.V.I.S." to activate'}
          </div>
        </div>
      )}
      
      {lastTranscription && (
        <div className="status-panel" style={{ marginTop: '20px' }}>
          <div className="status-title">Last Voice Input</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            "{lastTranscription}"
          </div>
        </div>
      )}
      
      <div className="arc-reactor"></div>
    </div>
  );
};

// Download Section Component
const DownloadSection = () => {
  const downloadLinks = [
    {
      platform: 'Android APK',
      icon: '📱',
      url: '/downloads/ken-jarvis-android.apk',
      size: '45.2 MB',
      version: 'v3.0.0'
    },
    {
      platform: 'Windows Desktop',
      icon: '💻',
      url: '/downloads/ken-jarvis-windows.exe',
      size: '128.5 MB',
      version: 'v3.0.0'
    },
    {
      platform: 'macOS Desktop',
      icon: '🍎',
      url: '/downloads/ken-jarvis-macos.dmg',
      size: '142.1 MB',
      version: 'v3.0.0'
    },
    {
      platform: 'Linux AppImage',
      icon: '🐧',
      url: '/downloads/ken-jarvis-linux.AppImage',
      size: '135.8 MB',
      version: 'v3.0.0'
    }
  ];

  const handleDownload = (platform, url) => {
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `ken-jarvis-${platform.toLowerCase().replace(' ', '-')}-v3.0.0`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show notification
    console.log(`Downloading K.E.N. & J.A.R.V.I.S. for ${platform}...`);
  };

  return (
    <div className="download-section">
      <h3 style={{ color: 'var(--primary-blue)', textAlign: 'center', marginBottom: '20px' }}>
        📥 Download K.E.N. & J.A.R.V.I.S.
      </h3>
      
      <div className="download-grid">
        {downloadLinks.map((download, index) => (
          <div key={index} className="download-card">
            <div className="download-icon">{download.icon}</div>
            <div className="download-info">
              <div className="download-platform">{download.platform}</div>
              <div className="download-details">
                <span className="download-version">{download.version}</span>
                <span className="download-size">{download.size}</span>
              </div>
            </div>
            <button 
              className="download-button"
              onClick={() => handleDownload(download.platform, download.url)}
            >
              Download
            </button>
          </div>
        ))}
      </div>
      
      <div className="download-info-panel">
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
          <p>🔐 All downloads are secure and virus-free</p>
          <p>🚀 Includes complete voice integration and Iron Man theme</p>
          <p>📱 Google Play Store version coming soon</p>
        </div>
      </div>
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
const ConversationMessage = ({ message, isUser, timestamp, inputMethod }) => (
  <div className={`conversation-message ${isUser ? 'user' : 'jarvis'}`}>
    <div className="message-header">
      {isUser && (
        <span className="input-method-indicator">
          {inputMethod === 'voice' ? '🎤' : '⌨️'}
        </span>
      )}
    </div>
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
  const [isHandsFree, setIsHandsFree] = useState(false);
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
  const [showDownloads, setShowDownloads] = useState(false);
  
  // Refs
  const conversationRef = useRef(null);
  const voiceEngineRef = useRef(null);
  const handsFreeTimeoutRef = useRef(null);

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
      if (handsFreeTimeoutRef.current) {
        clearTimeout(handsFreeTimeoutRef.current);
      }
    };
  }, []);

  // Hands-free voice detection
  useEffect(() => {
    if (isHandsFree) {
      startHandsFreeMode();
    } else {
      stopHandsFreeMode();
    }
  }, [isHandsFree]);

  const initializeVoiceEngine = async () => {
    try {
      setVoiceStatus('Initializing Voice Engine...');
      
      // Simulate voice engine initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVoiceStatus('Voice System Online');
      addNotification('success', 'K.E.N. & J.A.R.V.I.S. Voice System Initialized');
      
      // Add welcome message
      addConversationMessage(
        'K.E.N. & J.A.R.V.I.S. interface is now online. You can interact using voice or text input. How may I assist you today?',
        false,
        'system'
      );
      
    } catch (error) {
      setVoiceStatus('Voice System Error');
      addNotification('error', 'Failed to initialize voice system');
    }
  };

  const startHandsFreeMode = () => {
    setVoiceStatus('Hands-Free Mode Active');
    addNotification('info', 'Hands-free voice detection enabled');
    
    // Start continuous listening simulation
    const startListening = () => {
      setIsListening(true);
      setVoiceStatus('Listening for "Hey J.A.R.V.I.S."...');
      
      // Simulate wake word detection
      handsFreeTimeoutRef.current = setTimeout(() => {
        if (Math.random() > 0.7) { // 30% chance of wake word detection
          simulateVoiceInput(true);
        } else {
          setIsListening(false);
          setVoiceStatus('Waiting for wake word...');
          // Continue listening cycle
          setTimeout(startListening, 2000);
        }
      }, 3000);
    };
    
    startListening();
  };

  const stopHandsFreeMode = () => {
    if (handsFreeTimeoutRef.current) {
      clearTimeout(handsFreeTimeoutRef.current);
    }
    setIsListening(false);
    setVoiceStatus('Voice System Ready');
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
    if (isHandsFree) return; // Don't allow manual control in hands-free mode
    
    if (isListening) {
      setIsListening(false);
      setVoiceStatus('Voice Input Stopped');
    } else {
      setIsListening(true);
      setVoiceStatus('Listening for voice input...');
      
      // Simulate voice recognition
      setTimeout(() => {
        if (isListening && !isHandsFree) {
          simulateVoiceInput(false);
        }
      }, 3000);
    }
  };

  const toggleHandsFree = () => {
    setIsHandsFree(!isHandsFree);
  };

  const handleTextMessage = async (message) => {
    setIsProcessing(true);
    
    // Add user message
    addConversationMessage(message, true, 'text');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate J.A.R.V.I.S. response
    const response = generateJarvisResponse(message);
    addConversationMessage(response, false, 'system');
    
    setIsProcessing(false);
  };

  const simulateVoiceInput = async (isWakeWord = false) => {
    const sampleInputs = [
      "Hello K.E.N. & J.A.R.V.I.S., what's the status of the system?",
      "Can you enhance this data with the 49 algorithm engine?",
      "Show me the current performance metrics",
      "Run a diagnostic on all systems",
      "What's the enhancement factor right now?",
      "Download the mobile app",
      "Enable hands-free mode"
    ];
    
    let randomInput;
    if (isWakeWord) {
      randomInput = "Hey J.A.R.V.I.S., " + sampleInputs[Math.floor(Math.random() * sampleInputs.length)];
    } else {
      randomInput = sampleInputs[Math.floor(Math.random() * sampleInputs.length)];
    }
    
    setLastTranscription(randomInput);
    setVoiceStatus('Processing voice input...');
    setIsProcessing(true);
    
    // Add user message
    addConversationMessage(randomInput, true, 'voice');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate J.A.R.V.I.S. response
    const response = generateJarvisResponse(randomInput);
    addConversationMessage(response, false, 'system');
    
    setIsProcessing(false);
    
    if (isHandsFree) {
      // Continue hands-free listening cycle
      setTimeout(() => {
        setIsListening(false);
        setVoiceStatus('Waiting for wake word...');
        setTimeout(() => startHandsFreeMode(), 2000);
      }, 1000);
    } else {
      setIsListening(false);
      setVoiceStatus('Voice System Ready');
    }
  };

  const generateJarvisResponse = (input) => {
    const responses = {
      'status': 'All systems are operating at optimal efficiency. K.E.N. enhancement factor is currently at 1.69 quintillion times baseline.',
      'enhance': 'Initiating 49 algorithm enhancement protocol. Processing through quantum foundation, causal-Bayesian, and consciousness simulation layers.',
      'metrics': `Current performance metrics: ${systemMetrics.processingSpeed}ms response time, ${systemMetrics.successRate}% success rate, ${systemMetrics.voiceAccuracy}% voice accuracy.`,
      'diagnostic': 'Running comprehensive system diagnostic... All 49 algorithms operational. No anomalies detected.',
      'enhancement': `Enhancement factor is currently ${(systemMetrics.kenEnhancement / 1e18).toFixed(2)} quintillion times baseline performance.`,
      'download': 'Opening download section. You can download K.E.N. & J.A.R.V.I.S. for Android, Windows, macOS, or Linux.',
      'hands-free': 'Hands-free mode allows continuous voice detection. Toggle it on to activate "Hey J.A.R.V.I.S." wake word detection.',
      'text': 'I can process both voice and text input. Feel free to use whichever method is most convenient for you.'
    };
    
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('status')) return responses.status;
    if (inputLower.includes('enhance')) return responses.enhance;
    if (inputLower.includes('metrics') || inputLower.includes('performance')) return responses.metrics;
    if (inputLower.includes('diagnostic')) return responses.diagnostic;
    if (inputLower.includes('enhancement') || inputLower.includes('factor')) return responses.enhancement;
    if (inputLower.includes('download') || inputLower.includes('app')) {
      setShowDownloads(true);
      return responses.download;
    }
    if (inputLower.includes('hands-free') || inputLower.includes('hands free')) return responses['hands-free'];
    if (inputLower.includes('text') || inputLower.includes('type')) return responses.text;
    
    return 'I understand your request. Processing through K.E.N. & J.A.R.V.I.S. integration protocols for optimal response generation.';
  };

  const addConversationMessage = (message, isUser, inputMethod = 'system') => {
    const newMessage = {
      id: Date.now(),
      message,
      isUser,
      inputMethod,
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
          
          {/* Download Toggle */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              className="jarvis-button" 
              onClick={() => setShowDownloads(!showDownloads)}
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
              {showDownloads ? 'Hide Downloads' : '📥 Download App'}
            </button>
          </div>
        </aside>

        {/* Central Display */}
        <section className="jarvis-display steel-panel large-rivets">
          <div className="corner-rivet top-left"></div>
          <div className="corner-rivet top-right"></div>
          <div className="corner-rivet bottom-left"></div>
          <div className="corner-rivet bottom-right"></div>
          
          {/* Download Section */}
          {showDownloads && (
            <div style={{ marginBottom: '30px' }}>
              <DownloadSection />
            </div>
          )}
          
          {/* Voice Interface */}
          <VoiceInterface
            isListening={isListening}
            onToggleListening={toggleListening}
            voiceStatus={voiceStatus}
            lastTranscription={lastTranscription}
            isHandsFree={isHandsFree}
            onToggleHandsFree={toggleHandsFree}
          />
          
          {/* Text Input Section */}
          <TextInput 
            onSendMessage={handleTextMessage}
            isProcessing={isProcessing}
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
              label="Input Mode" 
              value={isHandsFree ? "Hands-Free" : "Manual"} 
              unit="" 
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
                inputMethod={msg.inputMethod}
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
                Use voice or text input to start.
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

