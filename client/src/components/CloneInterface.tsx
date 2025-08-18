import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface CloneInterfaceProps {
  onProjectCreated: (project: any) => void;
  onProjectUpdated: (project: any) => void;
}

const CloneInterface: React.FC<CloneInterfaceProps> = ({ 
  onProjectCreated, 
  onProjectUpdated 
}) => {
  const [inputType, setInputType] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [aiModel, setAiModel] = useState('claude-opus');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!url && !file) {
      toast.error('Please provide a URL or upload a file');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      if (file) formData.append('appFile', file);
      formData.append('url', url);
      formData.append('description', description);
      formData.append('aiModel', aiModel);

      const response = await axios.post('/api/analyze-app', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setAnalysisResult(response.data);
        const project = {
          id: `project_${Date.now()}`,
          name: url || file?.name || 'Unnamed Project',
          framework: response.data.analysis.framework,
          status: 'ready' as const
        };
        onProjectCreated(project);
        toast.success('Analysis completed successfully!');
      } else {
        toast.error('Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze application');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClone = async () => {
    if (!analysisResult) {
      toast.error('Please analyze the application first');
      return;
    }

    setIsCloning(true);
    try {
      const response = await axios.post('/api/clone-app', {
        analysis: analysisResult.analysis,
        customizations: { description },
        aiModel
      });

      if (response.data.success) {
        toast.success('Application cloned successfully!');
        const downloadUrl = response.data.downloadUrl;
        window.open(downloadUrl, '_blank');
      } else {
        toast.error('Cloning failed');
      }
    } catch (error) {
      console.error('Cloning error:', error);
      toast.error('Failed to clone application');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="clone-interface">
      <div className="interface-header">
        <h2>Clone Any Application with AI</h2>
        <p>Analyze and replicate applications using advanced AI models</p>
      </div>

      <div className="input-section">
        <div className="input-type-selector">
          <button 
            className={`type-btn ${inputType === 'url' ? 'active' : ''}`}
            onClick={() => setInputType('url')}
          >
            URL
          </button>
          <button 
            className={`type-btn ${inputType === 'file' ? 'active' : ''}`}
            onClick={() => setInputType('file')}
          >
            File Upload
          </button>
        </div>

        {inputType === 'url' ? (
          <div className="url-input">
            <label>Application URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="input-field"
            />
          </div>
        ) : (
          <div className="file-input">
            <label>Upload Application Files</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".zip,.tar.gz,.rar"
              className="file-field"
            />
          </div>
        )}

        <div className="description-input">
          <label>Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you want to achieve with this clone..."
            className="textarea-field"
            rows={3}
          />
        </div>

        <div className="ai-model-selector">
          <label>AI Model</label>
          <select 
            value={aiModel} 
            onChange={(e) => setAiModel(e.target.value)}
            className="select-field"
          >
            <option value="claude-opus">Claude Opus 4.1</option>
            <option value="gpt-5">GPT-5</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude-sonnet">Claude Sonnet</option>
          </select>
        </div>

        <div className="action-buttons">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!url && !file)}
            className="analyze-btn"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Application'}
          </button>

          {analysisResult && (
            <button 
              onClick={handleClone}
              disabled={isCloning}
              className="clone-btn"
            >
              {isCloning ? 'Cloning...' : 'Clone Application'}
            </button>
          )}
        </div>
      </div>

      {analysisResult && (
        <div className="analysis-results">
          <h3>Analysis Results</h3>
          <div className="result-grid">
            <div className="result-item">
              <strong>Framework:</strong> {analysisResult.analysis.framework}
            </div>
            <div className="result-item">
              <strong>Language:</strong> {analysisResult.analysis.language}
            </div>
            <div className="result-item">
              <strong>Complexity:</strong> {analysisResult.analysis.complexity}
            </div>
            <div className="result-item">
              <strong>Components:</strong> {analysisResult.analysis.structure.components.join(', ')}
            </div>
          </div>
          
          <div className="recommendations">
            <h4>AI Recommendations:</h4>
            <ul>
              {analysisResult.recommendations.map((rec: string, index: number) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloneInterface;
