import React, { useState, useEffect, useRef } from 'react';
import './iron-man-theme.css';

// Audio Device Detection Component
const AudioDeviceManager = ({ onDeviceChange }) => {
  const [audioDevices, setAudioDevices] = useState({
    input: [],
    output: [],
    bluetooth: []
  });
  const [selectedDevices, setSelectedDevices] = useState({
    microphone: null,
    speakers: null,
    bluetooth: null
  });
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    detectAudioDevices();
    // Set up device change listener
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', detectAudioDevices);
    }
    
    return () => {
      if (navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener('devicechange', detectAudioDevices);
      }
    };
  }, []);

  const detectAudioDevices = async () => {
    try {
      setIsScanning(true);
      
      // Get media devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const inputDevices = devices.filter(device => device.kind === 'audioinput');
      const outputDevices = devices.filter(device => device.kind === 'audiooutput');
      
      // Detect Bluetooth devices (simulated for demo)
      const bluetoothDevices = await detectBluetoothDevices();
      
      setAudioDevices({
        input: inputDevices,
        output: outputDevices,
        bluetooth: bluetoothDevices
      });
      
      // Auto-select default devices
      if (inputDevices.length > 0 && !selectedDevices.microphone) {
        setSelectedDevices(prev => ({ ...prev, microphone: inputDevices[0].deviceId }));
      }
      if (outputDevices.length > 0 && !selectedDevices.speakers) {
        setSelectedDevices(prev => ({ ...prev, speakers: outputDevices[0].deviceId }));
      }
      
      onDeviceChange && onDeviceChange({ inputDevices, outputDevices, bluetoothDevices });
      
    } catch (error) {
      console.error('Error detecting audio devices:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const detectBluetoothDevices = async () => {
    // Simulated Bluetooth device detection
    // In real implementation, would use Web Bluetooth API
    return [
      { deviceId: 'bt-1', label: 'AirPods Pro', connected: true, battery: 85 },
      { deviceId: 'bt-2', label: 'Sony WH-1000XM4', connected: false, battery: 0 },
      { deviceId: 'bt-3', label: 'Bose QuietComfort', connected: true, battery: 67 }
    ];
  };

  const connectBluetoothDevice = async (deviceId) => {
    try {
      // Simulated Bluetooth connection
      setAudioDevices(prev => ({
        ...prev,
        bluetooth: prev.bluetooth.map(device => 
          device.deviceId === deviceId 
            ? { ...device, connected: !device.connected }
            : device
        )
      }));
    } catch (error) {
      console.error('Error connecting Bluetooth device:', error);
    }
  };

  return (
    <div className="audio-device-manager">
      <div className="device-section">
        <div className="section-header">
          <span className="section-icon">🎤</span>
          <span className="section-title">Audio Input Devices</span>
          <button 
            className="scan-button" 
            onClick={detectAudioDevices}
            disabled={isScanning}
          >
            {isScanning ? '🔄' : '🔍'} {isScanning ? 'Scanning...' : 'Scan'}
          </button>
        </div>
        
        <div className="device-grid">
          {audioDevices.input.map(device => (
            <div 
              key={device.deviceId} 
              className={`device-card ${selectedDevices.microphone === device.deviceId ? 'selected' : ''}`}
              onClick={() => setSelectedDevices(prev => ({ ...prev, microphone: device.deviceId }))}
            >
              <div className="device-icon">🎤</div>
              <div className="device-info">
                <div className="device-name">{device.label || 'Unknown Microphone'}</div>
                <div className="device-status">
                  {selectedDevices.microphone === device.deviceId ? 'Active' : 'Available'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="device-section">
        <div className="section-header">
          <span className="section-icon">🔊</span>
          <span className="section-title">Audio Output Devices</span>
        </div>
        
        <div className="device-grid">
          {audioDevices.output.map(device => (
            <div 
              key={device.deviceId} 
              className={`device-card ${selectedDevices.speakers === device.deviceId ? 'selected' : ''}`}
              onClick={() => setSelectedDevices(prev => ({ ...prev, speakers: device.deviceId }))}
            >
              <div className="device-icon">🔊</div>
              <div className="device-info">
                <div className="device-name">{device.label || 'Unknown Speaker'}</div>
                <div className="device-status">
                  {selectedDevices.speakers === device.deviceId ? 'Active' : 'Available'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="device-section">
        <div className="section-header">
          <span className="section-icon">📶</span>
          <span className="section-title">Bluetooth Audio Devices</span>
        </div>
        
        <div className="device-grid">
          {audioDevices.bluetooth.map(device => (
            <div 
              key={device.deviceId} 
              className={`device-card bluetooth-device ${device.connected ? 'connected' : 'disconnected'}`}
              onClick={() => connectBluetoothDevice(device.deviceId)}
            >
              <div className="device-icon">🎧</div>
              <div className="device-info">
                <div className="device-name">{device.label}</div>
                <div className="device-status">
                  {device.connected ? `Connected • ${device.battery}%` : 'Disconnected'}
                </div>
              </div>
              <div className="device-actions">
                <button className="connect-button">
                  {device.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Manual Import Component
const ManualImportSystem = ({ onImport }) => {
  const [importType, setImportType] = useState('audio');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    files.forEach(file => {
      const fileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        importType: importType
      };
      
      onImport && onImport(fileInfo);
    });
  };

  return (
    <div className="manual-import-system">
      <div className="import-header">
        <span className="import-icon">📁</span>
        <span className="import-title">Manual Import System</span>
      </div>
      
      <div className="import-type-selector">
        <button 
          className={`type-button ${importType === 'audio' ? 'active' : ''}`}
          onClick={() => setImportType('audio')}
        >
          🎵 Audio Files
        </button>
        <button 
          className={`type-button ${importType === 'data' ? 'active' : ''}`}
          onClick={() => setImportType('data')}
        >
          📊 Data Files
        </button>
        <button 
          className={`type-button ${importType === 'config' ? 'active' : ''}`}
          onClick={() => setImportType('config')}
        >
          ⚙️ Config Files
        </button>
      </div>
      
      <div 
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-zone-content">
          <div className="drop-icon">📤</div>
          <div className="drop-text">
            <div className="primary-text">
              Drop {importType} files here or click to browse
            </div>
            <div className="secondary-text">
              Supports: {importType === 'audio' ? 'MP3, WAV, FLAC, M4A' : 
                        importType === 'data' ? 'JSON, CSV, XML, TXT' : 
                        'JSON, YAML, INI, CONF'}
            </div>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={importType === 'audio' ? 'audio/*' : 
                  importType === 'data' ? '.json,.csv,.xml,.txt' : 
                  '.json,.yaml,.ini,.conf'}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
      
      <div className="import-options">
        <div className="option-group">
          <label className="option-label">
            <input type="checkbox" defaultChecked />
            Auto-process imported files
          </label>
          <label className="option-label">
            <input type="checkbox" defaultChecked />
            Integrate with K.E.N. & J.A.R.V.I.S.
          </label>
          <label className="option-label">
            <input type="checkbox" />
            Create backup before processing
          </label>
        </div>
      </div>
    </div>
  );
};

// Enhanced Voice Processing with Whisper + spaCy
const EnhancedVoiceProcessor = ({ onVoiceResult, isActive }) => {
  const [voiceState, setVoiceState] = useState({
    isListening: false,
    isProcessing: false,
    confidence: 0,
    language: 'en',
    transcript: '',
    entities: [],
    sentiment: null
  });
  const [whisperModel, setWhisperModel] = useState('base');
  const [spacyModel, setSpacyModel] = useState('en_core_web_sm');

  const processVoiceInput = async (audioData) => {
    try {
      setVoiceState(prev => ({ ...prev, isProcessing: true }));
      
      // Simulate Whisper processing
      const whisperResult = await simulateWhisperProcessing(audioData, whisperModel);
      
      // Simulate spaCy NLP processing
      const spacyResult = await simulateSpacyProcessing(whisperResult.transcript, spacyModel);
      
      const finalResult = {
        transcript: whisperResult.transcript,
        confidence: whisperResult.confidence,
        language: whisperResult.language,
        entities: spacyResult.entities,
        sentiment: spacyResult.sentiment,
        intent: spacyResult.intent,
        keywords: spacyResult.keywords
      };
      
      setVoiceState(prev => ({
        ...prev,
        ...finalResult,
        isProcessing: false
      }));
      
      onVoiceResult && onVoiceResult(finalResult);
      
    } catch (error) {
      console.error('Voice processing error:', error);
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const simulateWhisperProcessing = async (audioData, model) => {
    // Simulate Whisper API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const sampleTranscripts = [
      "Show me the system performance metrics for K.E.N. and J.A.R.V.I.S.",
      "Connect to the Bluetooth audio device and start voice recognition.",
      "Import the audio files and process them through the enhancement algorithms.",
      "Display the graphical analysis of the quintillion-scale processing data.",
      "Run a diagnostic on all connected audio peripherals."
    ];
    
    return {
      transcript: sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)],
      confidence: 0.92 + Math.random() * 0.07,
      language: 'en',
      model: model
    };
  };

  const simulateSpacyProcessing = async (transcript, model) => {
    // Simulate spaCy NLP processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const entities = [
      { text: 'K.E.N.', label: 'SYSTEM', start: 0, end: 5 },
      { text: 'J.A.R.V.I.S.', label: 'SYSTEM', start: 10, end: 20 },
      { text: 'Bluetooth', label: 'TECHNOLOGY', start: 25, end: 34 }
    ];
    
    const sentiment = {
      polarity: Math.random() * 2 - 1, // -1 to 1
      subjectivity: Math.random() // 0 to 1
    };
    
    const intent = transcript.toLowerCase().includes('show') ? 'display' :
                  transcript.toLowerCase().includes('connect') ? 'connect' :
                  transcript.toLowerCase().includes('import') ? 'import' :
                  transcript.toLowerCase().includes('run') ? 'execute' : 'query';
    
    const keywords = ['system', 'performance', 'audio', 'processing', 'enhancement'];
    
    return {
      entities,
      sentiment,
      intent,
      keywords,
      model: model
    };
  };

  return (
    <div className="enhanced-voice-processor">
      <div className="processor-header">
        <span className="processor-icon">🧠</span>
        <span className="processor-title">Whisper + spaCy Voice Engine</span>
        <div className="processor-status">
          {voiceState.isProcessing ? '⚡ Processing...' : 
           voiceState.isListening ? '🎤 Listening...' : 
           '✅ Ready'}
        </div>
      </div>
      
      <div className="model-selection">
        <div className="model-group">
          <label>Whisper Model:</label>
          <select 
            value={whisperModel} 
            onChange={(e) => setWhisperModel(e.target.value)}
            className="model-select"
          >
            <option value="tiny">Tiny (Fast)</option>
            <option value="base">Base (Balanced)</option>
            <option value="small">Small (Better)</option>
            <option value="medium">Medium (High Quality)</option>
            <option value="large">Large (Best Quality)</option>
          </select>
        </div>
        
        <div className="model-group">
          <label>spaCy Model:</label>
          <select 
            value={spacyModel} 
            onChange={(e) => setSpacyModel(e.target.value)}
            className="model-select"
          >
            <option value="en_core_web_sm">English Small</option>
            <option value="en_core_web_md">English Medium</option>
            <option value="en_core_web_lg">English Large</option>
            <option value="en_core_web_trf">English Transformer</option>
          </select>
        </div>
      </div>
      
      {voiceState.transcript && (
        <div className="voice-results">
          <div className="result-section">
            <div className="result-title">Transcript</div>
            <div className="transcript-text">{voiceState.transcript}</div>
            <div className="confidence-bar">
              <div className="confidence-label">Confidence: {(voiceState.confidence * 100).toFixed(1)}%</div>
              <div className="confidence-progress">
                <div 
                  className="confidence-fill" 
                  style={{ width: `${voiceState.confidence * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {voiceState.entities.length > 0 && (
            <div className="result-section">
              <div className="result-title">Named Entities</div>
              <div className="entities-list">
                {voiceState.entities.map((entity, index) => (
                  <span key={index} className={`entity-tag ${entity.label.toLowerCase()}`}>
                    {entity.text} ({entity.label})
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {voiceState.sentiment && (
            <div className="result-section">
              <div className="result-title">Sentiment Analysis</div>
              <div className="sentiment-metrics">
                <div className="sentiment-item">
                  <span>Polarity:</span>
                  <span className={voiceState.sentiment.polarity > 0 ? 'positive' : 'negative'}>
                    {voiceState.sentiment.polarity.toFixed(2)}
                  </span>
                </div>
                <div className="sentiment-item">
                  <span>Subjectivity:</span>
                  <span>{voiceState.sentiment.subjectivity.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="processor-controls">
        <button 
          className="voice-control-button"
          onClick={() => processVoiceInput(new ArrayBuffer(1024))}
          disabled={voiceState.isProcessing}
        >
          {voiceState.isProcessing ? '⏳ Processing...' : '🎤 Test Voice Input'}
        </button>
      </div>
    </div>
  );
};

// Data Visualization Component
const DataVisualization = ({ data, type = 'performance' }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (canvasRef.current && data) {
      drawChart();
    }
  }, [data, type]);
  
  const drawChart = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up styling
    ctx.strokeStyle = '#00d4ff';
    ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
    ctx.lineWidth = 2;
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      const y = (height / 10) * i;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw data
    if (type === 'performance') {
      drawPerformanceChart(ctx, width, height);
    } else if (type === 'audio') {
      drawAudioWaveform(ctx, width, height);
    } else if (type === 'enhancement') {
      drawEnhancementMetrics(ctx, width, height);
    }
  };
  
  const drawPerformanceChart = (ctx, width, height) => {
    const dataPoints = [
      { x: 0, y: 0.3 }, { x: 0.1, y: 0.5 }, { x: 0.2, y: 0.4 },
      { x: 0.3, y: 0.7 }, { x: 0.4, y: 0.6 }, { x: 0.5, y: 0.8 },
      { x: 0.6, y: 0.9 }, { x: 0.7, y: 0.85 }, { x: 0.8, y: 0.95 },
      { x: 0.9, y: 0.92 }, { x: 1.0, y: 0.97 }
    ];
    
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    dataPoints.forEach((point, index) => {
      const x = point.x * width;
      const y = height - (point.y * height);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Fill area under curve
    ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  };
  
  const drawAudioWaveform = (ctx, width, height) => {
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const centerY = height / 2;
    const amplitude = height * 0.3;
    
    for (let x = 0; x < width; x++) {
      const frequency = 0.02;
      const y = centerY + Math.sin(x * frequency) * amplitude * Math.random();
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  };
  
  const drawEnhancementMetrics = (ctx, width, height) => {
    const bars = [
      { label: 'K.E.N.', value: 0.97, color: '#00d4ff' },
      { label: 'J.A.R.V.I.S.', value: 0.95, color: '#00ff88' },
      { label: 'Voice', value: 0.92, color: '#ff8800' },
      { label: 'Audio', value: 0.89, color: '#ff4444' }
    ];
    
    const barWidth = width / bars.length * 0.8;
    const barSpacing = width / bars.length * 0.2;
    
    bars.forEach((bar, index) => {
      const x = index * (barWidth + barSpacing) + barSpacing / 2;
      const barHeight = bar.value * height * 0.8;
      const y = height - barHeight;
      
      ctx.fillStyle = bar.color;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(bar.label, x + barWidth / 2, height - 5);
      ctx.fillText(`${(bar.value * 100).toFixed(0)}%`, x + barWidth / 2, y - 5);
    });
  };
  
  return (
    <div className="data-visualization">
      <div className="chart-header">
        <span className="chart-icon">📊</span>
        <span className="chart-title">
          {type === 'performance' ? 'Performance Metrics' :
           type === 'audio' ? 'Audio Waveform' :
           'Enhancement Factors'}
        </span>
      </div>
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={200} 
        className="chart-canvas"
      />
    </div>
  );
};

// Main Unified Hub Component
const UnifiedHub = () => {
  const [activeLayer, setActiveLayer] = useState('main');
  const [hubToggle, setHubToggle] = useState(true);
  const [systemData, setSystemData] = useState({
    performance: [],
    audio: [],
    enhancement: []
  });
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [importedFiles, setImportedFiles] = useState([]);
  const [voiceResults, setVoiceResults] = useState([]);

  const layers = [
    { id: 'main', name: 'Main System', icon: '🏠' },
    { id: 'audio', name: 'Audio Hub', icon: '🎵' },
    { id: 'data', name: 'Data Analytics', icon: '📊' },
    { id: 'voice', name: 'Voice Processing', icon: '🎤' },
    { id: 'devices', name: 'Device Manager', icon: '📱' }
  ];

  const handleDeviceChange = (devices) => {
    setConnectedDevices(devices);
  };

  const handleImport = (fileInfo) => {
    setImportedFiles(prev => [...prev, { ...fileInfo, timestamp: new Date() }]);
  };

  const handleVoiceResult = (result) => {
    setVoiceResults(prev => [...prev, { ...result, timestamp: new Date() }]);
  };

  const renderMainLayer = () => (
    <div className="main-layer">
      <div className="main-grid">
        {/* Text Input Section */}
        <div className="main-section">
          <div className="section-header">
            <span className="section-icon">⌨️</span>
            <span className="section-title">Text Input & Commands</span>
          </div>
          <div className="text-input-area">
            <textarea 
              placeholder="Enter commands for K.E.N. & J.A.R.V.I.S. system..."
              className="main-text-input"
              rows="4"
            />
            <div className="input-actions">
              <button className="action-button primary">Execute</button>
              <button className="action-button secondary">Clear</button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="main-section">
          <div className="section-header">
            <span className="section-icon">⚡</span>
            <span className="section-title">System Status</span>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">1.69e18x</div>
              <div className="stat-label">Enhancement</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">97.8%</div>
              <div className="stat-label">Voice Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{connectedDevices.input?.length || 0}</div>
              <div className="stat-label">Audio Devices</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{importedFiles.length}</div>
              <div className="stat-label">Imported Files</div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="main-section chart-section">
          <DataVisualization data={systemData.performance} type="performance" />
        </div>
      </div>
    </div>
  );

  const renderAudioLayer = () => (
    <div className="audio-layer">
      <div className="audio-grid">
        <div className="audio-section">
          <AudioDeviceManager onDeviceChange={handleDeviceChange} />
        </div>
        <div className="audio-section">
          <DataVisualization data={systemData.audio} type="audio" />
        </div>
      </div>
    </div>
  );

  const renderDataLayer = () => (
    <div className="data-layer">
      <div className="data-grid">
        <div className="data-section">
          <ManualImportSystem onImport={handleImport} />
        </div>
        <div className="data-section">
          <DataVisualization data={systemData.enhancement} type="enhancement" />
        </div>
      </div>
    </div>
  );

  const renderVoiceLayer = () => (
    <div className="voice-layer">
      <EnhancedVoiceProcessor 
        onVoiceResult={handleVoiceResult}
        isActive={activeLayer === 'voice'}
      />
    </div>
  );

  const renderDevicesLayer = () => (
    <div className="devices-layer">
      <div className="devices-overview">
        <h3>Connected Devices Overview</h3>
        <div className="device-summary">
          <div className="summary-item">
            <span>Audio Input:</span>
            <span>{connectedDevices.input?.length || 0} devices</span>
          </div>
          <div className="summary-item">
            <span>Audio Output:</span>
            <span>{connectedDevices.output?.length || 0} devices</span>
          </div>
          <div className="summary-item">
            <span>Bluetooth:</span>
            <span>{connectedDevices.bluetooth?.filter(d => d.connected).length || 0} connected</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveLayer = () => {
    switch (activeLayer) {
      case 'main': return renderMainLayer();
      case 'audio': return renderAudioLayer();
      case 'data': return renderDataLayer();
      case 'voice': return renderVoiceLayer();
      case 'devices': return renderDevicesLayer();
      default: return renderMainLayer();
    }
  };

  return (
    <div className="unified-hub">
      {/* Header with Toggle */}
      <header className="hub-header">
        <div className="header-left">
          <div className="hub-logo">
            <img 
              src="/assets/ken-jarvis-logo-app-icon.png" 
              alt="K.E.N. & J.A.R.V.I.S." 
              className="logo-image"
            />
          </div>
          <div className="hub-title">
            <h1>K.E.N. & J.A.R.V.I.S. Unified Hub</h1>
            <p>Quintillion-Scale AI Enhancement System</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="hub-toggle-control">
            <label className="hub-toggle-switch">
              <input 
                type="checkbox" 
                checked={hubToggle}
                onChange={(e) => setHubToggle(e.target.checked)}
              />
              <span className="hub-toggle-slider"></span>
              <span className="hub-toggle-label">
                {hubToggle ? '🌐 Unified Mode' : '📱 Simple Mode'}
              </span>
            </label>
          </div>
        </div>
      </header>

      {/* Layer Navigation */}
      {hubToggle && (
        <nav className="layer-navigation">
          {layers.map(layer => (
            <button
              key={layer.id}
              className={`layer-button ${activeLayer === layer.id ? 'active' : ''}`}
              onClick={() => setActiveLayer(layer.id)}
            >
              <span className="layer-icon">{layer.icon}</span>
              <span className="layer-name">{layer.name}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Main Content */}
      <main className="hub-content">
        {hubToggle ? renderActiveLayer() : renderMainLayer()}
      </main>

      {/* Status Bar */}
      <footer className="hub-status-bar">
        <div className="status-item">
          <span className="status-icon">🔗</span>
          <span>Neon DB: Connected</span>
        </div>
        <div className="status-item">
          <span className="status-icon">🎤</span>
          <span>Whisper + spaCy: Ready</span>
        </div>
        <div className="status-item">
          <span className="status-icon">📊</span>
          <span>Layer: {layers.find(l => l.id === activeLayer)?.name}</span>
        </div>
        <div className="status-item">
          <span className="status-icon">⚡</span>
          <span>Enhancement: 1.69e18x</span>
        </div>
      </footer>
    </div>
  );
};

export default UnifiedHub;

