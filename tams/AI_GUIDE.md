# TAMS AI Guide

**Multiple AI Personalities Working Together**

TAMS includes three distinct AI assistants that work together to provide intelligent app management, optimization, and assistance.

## 🤖 The Three AIs

### 1. Gemini AI (General Purpose)
**Model:** Gemini 3.0 Pro (Google)
**Role:** Conversational AI assistant

**Capabilities:**
- Chat and help with any task
- Analyze apps and provide insights
- Debug issues
- Generate code
- Explain concepts
- Create apps based on descriptions

**When to use:**
- Need help understanding something
- Want to create or modify apps
- Need debugging assistance
- Want explanations or recommendations

**Examples:**
```bash
# Get help
gemini "How do I create a trading bot?"

# Analyze an app
gemini "Analyze this app" --app app_123

# Debug
gemini "Why is my app not working?" --app app_123

# Get recommendations
gemini "How can I improve performance?"
```

### 2. Background Agent AI (Autonomous)
**Model:** Claude Sonnet 4.5 (Anthropic)
**Role:** Autonomous monitoring and optimization

**Capabilities:**
- Continuously monitor all apps
- Auto-detect and fix issues
- Optimize configurations autonomously
- Heal broken apps automatically
- Work silently in the background

**When to use:**
- Want automated monitoring
- Need autonomous problem-solving
- Want hands-off app management
- Check what the agent is doing

**Examples:**
```bash
# Check agent status
agent status

# See current tasks
agent tasks

# Ask what it's doing
agent "What are you working on?"

# Pause/resume
agent pause
agent resume
```

### 3. Meta-Tuner AI (App Manager)
**Model:** Claude Opus 4.1 (Anthropic)
**Role:** Strategic app optimization and management

**Capabilities:**
- Tune individual apps or entire system
- Learn from tuning history
- Optimize app relationships
- Make data-driven tuning decisions
- Provide strategic recommendations

**When to use:**
- Want intelligent app tuning
- Need system-wide optimization
- Want performance analysis
- Need tuning recommendations

**Examples:**
```bash
# Tune an app
tuner "Optimize this app" --app app_123

# Get recommendations
tuner "What should I tune?" --app app_123

# System-wide tuning
tuner "Optimize the entire system"

# Performance analysis
tuner "Analyze performance" --app app_123
```

## 💬 AI Communication

### Chat with Specific AI

```bash
# Gemini
gemini "Your message here"

# Background Agent
agent "Your message here"

# Meta-Tuner
tuner "Your message here"

# Generic AI command
ai gemini "Your message here"
ai agent "Status?"
ai tuner "Tune app_123"
```

### Collaborative Intelligence

Ask all AIs and get consensus:

```bash
# All AIs analyze together
ask "Should I optimize this app?" --app app_123

# Get collaborative decision
ask "What's the best strategy for this trading bot?" --app trading_123
```

## 🔗 AI Collaboration

The AIs work together automatically:

```
Background Agent finds issue
         ↓
Requests Meta-Tuner to optimize
         ↓
Meta-Tuner requests Gemini for analysis
         ↓
Gemini provides insights
         ↓
Meta-Tuner applies optimizations
         ↓
Background Agent monitors results
```

## 📊 AI Status

Check AI system status:

```bash
# System status includes AI info
status

# List all AIs
ai

# Get specific AI info
gemini
agent
tuner
```

## 🎯 Use Cases

### 1. Creating an App with AI Help

```bash
# Ask Gemini for help
gemini "I want to create a trading bot for cryptocurrency"

# Gemini will guide you through:
# - Strategy selection
# - Configuration
# - Risk parameters

# Then actually create it
create trading "Crypto Bot" --config '{"strategy": "scalping"}'

# Let Meta-Tuner optimize it
tuner "Optimize for cryptocurrency trading" --app app_123

# Background Agent monitors automatically
agent status
```

### 2. Debugging with AI

```bash
# Ask Gemini to debug
gemini "My app is throwing errors" --app app_123

# Gemini will:
# - Analyze the issue
# - Suggest fixes
# - Offer to apply them

# Or let Background Agent auto-fix
agent "Fix app_123"

# Check if it's fixed
gemini "Is app_123 working now?" --app app_123
```

### 3. Optimization Workflow

```bash
# Get recommendations from Meta-Tuner
tuner "Suggest optimizations" --app app_123

# Apply them
tune app_123

# Background Agent monitors performance
agent "How is app_123 performing?"

# Get analysis from all AIs
ask "Is app_123 optimized well?" --app app_123
```

### 4. Learning and Improvement

```bash
# Meta-Tuner learns from history
tuner "What have you learned from tuning?"

# Get insights
tuner "What patterns have you found?"

# Apply learned optimizations
tuner "Use best practices from history" --app app_123
```

## 🧠 AI Context Awareness

All AIs are context-aware:

- **App Context**: Use `--app APP_ID` to give context about specific apps
- **Conversation History**: AIs remember previous messages in a session
- **System State**: AIs know current system status
- **Cross-AI Knowledge**: AIs can share information with each other

## ⚡ AI Actions

AIs can suggest or perform actions:

```json
{
  "content": "I've analyzed your app and found opportunities for optimization",
  "action": {
    "type": "tune-app",
    "parameters": {
      "appId": "app_123",
      "suggestions": ["..."]
    }
  },
  "confidence": 0.9
}
```

When an AI suggests an action, you can:
- Let it proceed automatically
- Review the parameters first
- Modify the parameters
- Decline and ask for alternatives

## 🎛️ AI Configuration

Each AI can be configured:

```bash
# Set AI preferences (future feature)
set-ai gemini --temperature 0.7
set-ai tuner --learning enabled

# Change AI models
set-ai agent --model claude-opus-4.1

# Configure collaboration
set-ai collaboration --mode aggressive
```

## 📈 AI Performance

Monitor AI performance:

```bash
# Background Agent metrics
agent "Show me your performance metrics"

# Meta-Tuner learning stats
tuner "What's your success rate?"

# All AIs combined
ask "How are you all performing?"
```

## 🔮 Advanced Features

### AI Chaining

```bash
# Chain AI operations
gemini "Analyze app_123" | tuner "Optimize based on analysis" | agent "Monitor results"
```

### AI Streaming (Future)

```bash
# Get real-time AI responses
gemini "Explain this complex concept" --stream
```

### Custom AI Personalities (Future)

```bash
# Create custom AI persona
create-ai "Domain Expert" --specialization trading --model gpt-5

# Use it
ai domain-expert "What's the best scalping strategy?"
```

## 💡 Tips

1. **Use the right AI for the job**:
   - Questions/Help → Gemini
   - Automation → Background Agent
   - Optimization → Meta-Tuner

2. **Combine AIs**: Use `ask` for collaborative decisions

3. **Trust the Background Agent**: Let it work autonomously

4. **Learn from Meta-Tuner**: It improves over time

5. **Be specific**: Provide context with `--app` flag

6. **Check status**: Use `status` to see all AI activity

## 🆘 Troubleshooting

### AI not responding
```bash
status  # Check if AI subsystem is running
```

### Need better answers
```bash
# Be more specific
gemini "How do I optimize trading bot performance?" --app trading_bot_123

# Use collaborative mode
ask "How should I fix this?" --app app_123
```

### AI conflicts
```bash
# Get consensus
ask "What should I do about app_123?" --app app_123
```

## 🚀 Quick Reference

| Command | AI | Purpose |
|---------|----|----|
| `gemini` | Gemini | General help and analysis |
| `agent` | Background Agent | Autonomous monitoring |
| `tuner` | Meta-Tuner | Strategic optimization |
| `ask` | All AIs | Collaborative decision |
| `ai` | Specific AI | Direct AI interaction |
| `status` | System | See all AI status |

---

**The future is multi-AI collaboration** 🤖🤖🤖

With TAMS, you get three specialized AIs working together to manage your apps intelligently, autonomously, and effectively.
