# How to Run TAMS - Complete Guide

## What is TAMS?
TAMS is a **terminal application** (command-line interface). You interact with it by typing commands, not clicking buttons.

Think of it like:
- Git (you type `git commit`)
- npm (you type `npm install`)
- Docker (you type `docker run`)

## Step 1: Get the Code

### Option A: Extract the ZIP
```bash
# Download tams.zip from your repository
# Then unzip it:
unzip tams.zip
cd tams
```

### Option B: Clone from Git
```bash
git clone <your-repo-url>
cd Home-home/tams
```

## Step 2: Install Dependencies

Open your **terminal** and run:
```bash
npm install
```

This downloads all the required packages (like chalk, axios, etc.)

## Step 3: Build the TypeScript

```bash
npm run build
```

This converts the .ts files to .js files that Node.js can run.

## Step 4: Run TAMS!

```bash
npm run dev
```

OR if built:
```bash
npm start
```

## What You'll See

```
🚀 Initializing Terminal App Management System...
🤖 Initializing AI Subsystem...
🧠 Registered AI: Gemini AI (gemini)
🧠 Registered AI: Background Agent AI (background-agent)
🧠 Registered AI: Meta-Tuner AI (meta-tuner)
✅ AI Subsystem ready with 3 AIs
🤖 Background Agent AI starting...
🔍 Background Agent: Running monitoring cycle...
🏪 App Store initialized with 4 apps
✅ TAMS initialized successfully

╔══════════════════════════════════════════════╗
║  Terminal App Management System (TAMS)      ║
║  Self-Replicating AI-Powered Apps           ║
╚══════════════════════════════════════════════╝

Type "help" for available commands

tams> _
```

## Step 5: Try Commands

Now you can type commands:

```bash
# Talk to Gemini AI
tams> gemini "Hello! What can you do?"

# Check system status
tams> status

# Create a trading bot
tams> create trading "My Bot"

# List all apps
tams> list

# Chat with Background Agent
tams> agent status

# Ask all AIs
tams> ask "What should I build first?"

# Get help
tams> help

# Exit
tams> exit
```

## Quick Video Tutorial Equivalent

1. **Open Terminal** (Terminal.app on Mac, PowerShell on Windows)
2. **Navigate to folder**: `cd /path/to/tams`
3. **Install**: `npm install` (wait ~30 seconds)
4. **Run**: `npm run dev`
5. **Type commands** at the `tams>` prompt
6. **Exit**: Type `exit` or press Ctrl+C

## Common Issues

### "npm not found"
- Install Node.js from nodejs.org
- Restart your terminal

### "tsc not found"
- Run `npm install` first
- Or install TypeScript globally: `npm install -g typescript`

### "Module not found"
- Make sure you're in the `tams` directory
- Run `npm install` again

### "Permission denied"
- On Mac/Linux, try: `sudo npm install`
- Or fix permissions: `sudo chown -R $USER /usr/local/lib/node_modules`

## Where to Run This

You can run TAMS in:
- **Terminal** (Mac)
- **PowerShell** (Windows)
- **Command Prompt** (Windows)
- **WSL** (Windows Subsystem for Linux)
- **VS Code Terminal** (any OS)
- **Any SSH terminal** if on a server

## What TAMS Does

Once running, TAMS lets you:
1. **Create apps** - Trading bots, research forums, web scrapers
2. **Talk to 3 AIs** - Gemini, Background Agent, Meta-Tuner
3. **Clone apps** - Self-replicating applications
4. **Auto-optimize** - AI tunes apps in the background
5. **Manage everything** - From one terminal interface

## Example Session

```
tams> gemini "I want to create a crypto trading bot"
💬 Gemini AI:
I can help you create a cryptocurrency trading bot! ...

tams> create trading "Crypto Scalper"
🔨 Creating new trading app: Crypto Scalper
✅ Created app: app_1234567890_abc123

tams> list
📱 Apps (1):
  Crypto Scalper (app_1234567890_abc123)
    Type: trading | Status: active | Version: 1.0.0

tams> tune app_1234567890_abc123
🎛️  Tuning app: Crypto Scalper
✅ Tuned app: app_1234567890_abc123

tams> agent status
🤖 Background Agent:
Running: Yes
Active Tasks: 3
...

tams> exit
👋 Shutting down TAMS...
```

## This is NOT

- ❌ A web browser app
- ❌ A desktop GUI application
- ❌ A mobile app
- ❌ Something you click on

## This IS

- ✅ A command-line tool (like git, npm, docker)
- ✅ You type commands in a terminal
- ✅ It responds with text
- ✅ Interactive terminal session

## Next Steps

1. Make sure Node.js is installed
2. Extract tams.zip or clone the repo
3. Open a terminal
4. `cd` to the tams folder
5. Run `npm install`
6. Run `npm run dev`
7. Start typing commands!

---

Need help? The terminal will guide you with error messages if something goes wrong!
