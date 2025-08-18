# AI App Cloner

An AI-powered application cloning tool similar to Replit, built with React and Node.js.

## Design Attribution

This project's aesthetic and structure are inspired by [zero365.com](https://zero365.com), incorporating their minimalist dark theme, clean typography, and professional interface design patterns.

## Features

- **URL Analysis**: Analyze any web application by providing its URL
- **File Upload**: Upload application files for analysis
- **AI-Powered Cloning**: Generate clones using advanced AI models
- **Multiple AI Models**: Support for Claude Opus 4.1, GPT-5, GPT-4, and Claude Sonnet
- **Mobile Responsive**: Works seamlessly on all devices
- **Real-time Analysis**: Get instant feedback on application structure
- **Dark Theme**: Professional dark interface inspired by zero365.com

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **AI Integration**: Multiple AI model support including GPT-5
- **File Processing**: Support for various file formats
- **Design**: Dark theme aesthetic inspired by zero365.com

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/racistchinesebaby/Home-home.git
cd Home-home
```

2. Install dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

4. Install server dependencies:
```bash
cd server
npm install
cd ..
```

### Running the Application

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client (in a new terminal):
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`.

## Usage

1. **Choose Input Method**: Select between URL analysis or file upload
2. **Provide Input**: Enter a URL or upload your application files
3. **Add Description**: Optionally describe what you want to achieve
4. **Select AI Model**: Choose from Claude Opus 4.1, GPT-5, GPT-4, or Claude Sonnet
5. **Analyze**: Click "Analyze Application" to get insights
6. **Clone**: Use "Clone Application" to generate a downloadable clone

## API Endpoints

- `POST /api/analyze-app` - Analyze an application
- `POST /api/clone-app` - Generate application clone
- `GET /api/download/:id` - Download generated clone

## Design Credits

- Interface design inspired by [zero365.com](https://zero365.com)
- Dark theme aesthetic and typography patterns adapted from zero365.com
- Minimalist, professional design approach following zero365.com principles

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
