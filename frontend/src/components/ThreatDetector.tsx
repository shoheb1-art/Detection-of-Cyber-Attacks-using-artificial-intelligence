import { useState } from 'react';
import axios from 'axios';
import './ThreatDetector.css';
import type { Activity } from '../App';

interface DetectorProps {
  onScanComplete: (scanResult: Omit<Activity, 'id' | 'timestamp'>) => void;
}

const tabConfig = {
  'SQL Injection': {
    title: 'SQL Injection',
    description: 'Analyze content for potential sql injection threats.',
    placeholder: 'Enter SQL query or code snippet...',
    endpoint: '/api/predict/sql',
    bodyKey: 'query',
  },
  'Phishing URL': {
    title: 'Phishing URL Detection',
    description: 'Analyze a URL for potential phishing indicators.',
    placeholder: 'Enter a full URL (e.g., http://example.com)...',
    endpoint: '/api/predict/phishing',
    bodyKey: 'url',
  },
  'File Analysis': {
    title: 'File Analysis',
    description: 'Upload an executable file to analyze for potential malware.',
    placeholder: '',
    endpoint: '/api/predict/file',
    bodyKey: 'file',
  },
};

type TabType = keyof typeof tabConfig;

const ThreatDetector = ({ onScanComplete }: DetectorProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('SQL Injection');
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastResult, setLastResult] = useState<{ message: string; isThreat: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const api = axios.create({
      baseURL: 'http://localhost:5000',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });

  const isSqlQuery = (query: string): boolean => {
    const sqlPattern = new RegExp(/select|insert|update|delete|union|from|where|'|--|;|=/i);
    return sqlPattern.test(query);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setValidationError('');
      setLastResult(null);
    }
  };

  const handleAnalyze = async () => {
    setLastResult(null);
    setValidationError('');
    setIsLoading(true);

    try {
        const config = tabConfig[activeTab];
        let isThreat = false;

        if (activeTab === 'File Analysis') {
            if (!selectedFile) {
                setValidationError('Please select a file to analyze.');
                setIsLoading(false);
                return;
            }
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await api.post(config.endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            isThreat = response.data.prediction === 1;
            onScanComplete({ scan_type: 'File Analysis', query_text: selectedFile.name, result: isThreat ? 'Threat' : 'Clean' });
            setLastResult({ message: isThreat ? 'Threat Detected: Potential Malware' : 'Clean: File appears safe', isThreat });
            setSelectedFile(null); // Reset file input
        
        } else { // Logic for SQLi and Phishing
            if (!inputValue) { setIsLoading(false); return; }
            if (activeTab === 'SQL Injection' && !isSqlQuery(inputValue)) {
                setValidationError('Invalid input. Please enter a valid SQL query.');
                setIsLoading(false);
                return;
            }
            const requestBody = { [config.bodyKey]: inputValue };
            const response = await api.post(config.endpoint, requestBody);
            
            isThreat = response.data.prediction === 1;
            onScanComplete({ scan_type: activeTab, query_text: inputValue, result: isThreat ? 'Threat' : 'Clean' });
            setLastResult({ message: isThreat ? `Threat Detected: Potential ${activeTab}` : `Clean: No immediate threat found`, isThreat });
            setInputValue('');
        }
    } catch (error) {
        setLastResult({ message: 'Error: Could not complete the analysis.', isThreat: true });
    } finally {
        setIsLoading(false);
    }
  };
  
  const currentConfig = tabConfig[activeTab];

  return (
    <main className="detector-container">
      <div className="detector-card">
        <div className="tabs">
          {(Object.keys(tabConfig) as TabType[]).map(tabName => (
            <button 
              key={tabName} 
              className={`tab ${activeTab === tabName ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tabName);
                setInputValue('');
                setSelectedFile(null);
                setLastResult(null);
                setValidationError('');
              }}
            >
              {tabName}
            </button>
          ))}
        </div>
        <div className="content">
          <h2>{currentConfig.title}</h2>
          <p>{currentConfig.description}</p>
          
          {activeTab === 'File Analysis' ? (
            <div className="file-uploader">
                <input type="file" id="file-upload" onChange={handleFileChange} />
                <label htmlFor="file-upload" className="file-upload-label">
                    {selectedFile ? 'Change File' : 'Choose File'}
                </label>
                {selectedFile && <p className="selected-file">Selected: {selectedFile.name}</p>}
            </div>
          ) : (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={currentConfig.placeholder}
              disabled={!currentConfig.endpoint}
            />
          )}

          {validationError && <p className="error-message">{validationError}</p>}
          
          <button onClick={handleAnalyze} disabled={isLoading || !currentConfig.endpoint}>
            {isLoading ? 'Analyzing...' : 'Analyze for Threats'}
          </button>
          
          {lastResult && ( <div className={`result-box ${lastResult.isThreat ? 'threat' : 'clean'}`}>{lastResult.message}</div> )}
        </div>
      </div>
    </main>
  );
};

export default ThreatDetector;