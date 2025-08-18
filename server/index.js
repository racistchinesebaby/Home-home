const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const unzipper = require('unzipper');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'https://ai-cloning-app-yhm7ya21.devinapps.com'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 }
});

app.post('/api/analyze-app', upload.single('appFile'), async (req, res) => {
  try {
    const { url, description, aiModel } = req.body;
    const file = req.file;

    let analysisResult = {
      success: true,
      analysis: {
        framework: 'React',
        language: 'JavaScript',
        dependencies: ['react', 'react-dom'],
        structure: {
          components: ['App.js', 'Header.js', 'Footer.js'],
          pages: ['Home.js', 'About.js'],
          styles: ['App.css', 'index.css']
        },
        features: ['Responsive design', 'Component-based architecture'],
        complexity: 'Medium'
      },
      recommendations: [
        'Use modern React hooks',
        'Implement proper error handling',
        'Add TypeScript for better type safety'
      ]
    };

    if (file) {
      const extractPath = path.join(__dirname, 'extracted', Date.now().toString());
      await fs.ensureDir(extractPath);
      
      if (file.mimetype === 'application/zip') {
        await fs.createReadStream(file.path)
          .pipe(unzipper.Extract({ path: extractPath }))
          .promise();
      }
      
      analysisResult.extractedPath = extractPath;
    }

    res.json(analysisResult);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/clone-app', async (req, res) => {
  try {
    const { analysis, customizations, aiModel } = req.body;
    
    const cloneResult = {
      success: true,
      projectId: `clone_${Date.now()}`,
      files: [
        {
          path: 'src/App.js',
          content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Cloned Application</h1>
        <p>This application was cloned using AI assistance.</p>
      </header>
      <main>
        <section className="content">
          <h2>Welcome to your cloned app!</h2>
          <p>This is a replica created with AI-powered analysis.</p>
        </section>
      </main>
    </div>
  );
}

export default App;`
        },
        {
          path: 'src/App.css',
          content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
}

.content {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

h2 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  line-height: 1.6;
  color: #666;
}`
        },
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'cloned-app',
            version: '1.0.0',
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0',
              'react-scripts': '5.0.1'
            },
            scripts: {
              start: 'react-scripts start',
              build: 'react-scripts build',
              test: 'react-scripts test'
            }
          }, null, 2)
        }
      ],
      downloadUrl: `/api/download/${Date.now()}`
    };

    res.json(cloneResult);
  } catch (error) {
    console.error('Cloning error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/download/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.attachment(`cloned-app-${projectId}.zip`);
    archive.pipe(res);
    
    archive.append('Sample cloned application', { name: 'README.md' });
    archive.finalize();
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`AI Cloning Server running on port ${PORT}`);
});
