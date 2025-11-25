# 📱 Using TAMS on Mobile

## 🎯 3 Ways to Use TAMS on Your Phone

### ✅ Option 1: Browser Interface (RECOMMENDED - Easiest!)

**What it is:** Access TAMS through your phone's web browser

**How it works:**
1. Run TAMS on your computer
2. Open your phone's browser
3. Access the web dashboard

**Steps:**

```bash
# On your computer:
cd tams
npm install
npm run web
```

You'll see:
```
🌐 TAMS Web Interface Running!
📱 Access from your phone:
   http://192.168.1.100:3001
```

**On your phone:**
1. Open Safari (iPhone) or Chrome (Android)
2. Type: `http://192.168.1.100:3001` (use the IP shown)
3. Bookmark it!

**Features:**
- ✅ View all apps
- ✅ Create new apps
- ✅ Tune/optimize apps
- ✅ See system status
- ✅ Real-time updates
- ✅ Works on ANY phone

---

### ✅ Option 2: Run Node.js Directly on Mobile

**For Android - Use Termux:**

1. **Install Termux** from F-Droid (not Google Play - old version)
   - Download: https://f-droid.org/en/packages/com.termux/

2. **Install Node.js:**
   ```bash
   pkg update
   pkg install nodejs git
   ```

3. **Get TAMS:**
   ```bash
   git clone <your-repo-url>
   cd Home-home/tams
   npm install
   npm run dev
   ```

4. **Use it!**
   ```
   tams> gemini "hello"
   tams> create trading "mobile bot"
   ```

**For iPhone - Use iSH:**

1. **Install iSH** from App Store
   - https://apps.apple.com/us/app/ish-shell/id1436902243

2. **Install Node.js:**
   ```bash
   apk add nodejs npm git
   ```

3. **Get TAMS:**
   ```bash
   git clone <your-repo-url>
   cd Home-home/tams
   npm install
   npm run dev
   ```

---

### ✅ Option 3: SSH to a Server

**What it is:** Run TAMS on a cloud server, access from phone

**Steps:**

**A. Set up server (one time):**
```bash
# On a DigitalOcean/AWS/etc server:
ssh user@your-server.com
git clone <your-repo-url>
cd Home-home/tams
npm install
npm run web
```

**B. Access from phone:**

**Option B1 - Web Browser:**
```
http://your-server.com:3001
```

**Option B2 - SSH Client:**
- iPhone: Install **Termius** or **Blink Shell**
- Android: Install **Termius** or **JuiceSSH**
- Connect and use the CLI

---

## 📊 Comparison

| Method | Ease | Features | Cost |
|--------|------|----------|------|
| **Browser** | ⭐⭐⭐⭐⭐ Easiest | Web UI, all features | Free |
| **Termux/iSH** | ⭐⭐⭐ Moderate | Full CLI, all features | Free |
| **SSH Server** | ⭐⭐ Advanced | 24/7 access, remote | ~$5/mo |

---

## 🚀 Quick Start: Browser Method (5 minutes)

### On Your Computer:

```bash
# 1. Download tams.zip
unzip tams.zip
cd tams

# 2. Install
npm install

# 3. Start web server
npm run web
```

### On Your Phone:

```
1. Open browser
2. Go to: http://YOUR_COMPUTER_IP:3001
3. Start using TAMS!
```

**Find your computer's IP:**
- Mac: System Preferences → Network → IP Address
- Windows: `ipconfig` in Command Prompt
- Linux: `ip addr show`

---

## 📱 Mobile App Recommendations

### SSH Clients (for Option 3):
**iPhone:**
- ⭐ **Termius** (Best UI, free/paid)
- **Blink Shell** (Powerful, $20)
- **Prompt** (Simple, $15)

**Android:**
- ⭐ **Termius** (Best UI, free/paid)
- **JuiceSSH** (Free, feature-rich)
- **ConnectBot** (Open source, free)

### Terminal Emulators (for Option 2):
**iPhone:**
- **iSH** (Free, Alpine Linux)
- **a-Shell** (Free, basic shell)

**Android:**
- ⭐ **Termux** (Free, full Linux)
- **UserLAnd** (Free, full distros)

---

## 🌟 Example Mobile Workflow

### Morning:
```
📱 Open browser → http://server:3001
👀 Check system status
🤖 See what Background Agent did overnight
📊 View trading bot performance
```

### During Day:
```
💬 "gemini, analyze my research forum"
🎛️ Tune apps based on AI suggestions
🧬 Clone successful trading strategies
```

### Evening:
```
📈 Review all app metrics
🔄 Let Meta-Tuner optimize everything
😴 Let Background Agent monitor while you sleep
```

---

## 🔧 Troubleshooting

### Can't access from phone:
- Make sure computer and phone are on same WiFi
- Check firewall isn't blocking port 3001
- Use computer's local IP (192.168.x.x)

### Node.js too slow on mobile:
- Use browser method instead
- Or SSH to a server

### Browser interface not loading:
- Make sure you ran `npm run web` not `npm run dev`
- Check the port (3001) is open
- Try `http://0.0.0.0:3001` or `http://localhost:3001`

---

## 💡 Pro Tips

1. **Bookmark the URL** on your phone's home screen
2. **Use Dark Mode** for better battery life
3. **Enable notifications** (future feature)
4. **Set up auto-start** on your computer
5. **Use ngrok** for external access without server

### Using ngrok (access from anywhere):
```bash
# Install ngrok
npm install -g ngrok

# In one terminal:
npm run web

# In another terminal:
ngrok http 3001

# Access from anywhere:
https://abc123.ngrok.io
```

---

## 🎉 Recommended Setup

**Best for most people:**
1. Run `npm run web` on your computer
2. Access from phone browser
3. Bookmark the page
4. Done! ✨

**Total time:** 5 minutes
**Cost:** $0
**Difficulty:** Easy

---

Now you can manage your AI-powered apps from your phone! 🚀
