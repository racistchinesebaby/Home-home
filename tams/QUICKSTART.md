# TAMS Quickstart Guide

Get started with TAMS in 5 minutes!

## Installation

```bash
cd tams
npm install
npm run build
```

## Quick Start

### 1. Start TAMS CLI

```bash
npm run dev
```

You'll see:
```
╔══════════════════════════════════════════════╗
║  Terminal App Management System (TAMS)      ║
║  Self-Replicating AI-Powered Apps           ║
╚══════════════════════════════════════════════╝

tams>
```

### 2. Check System Status

```bash
tams> status
```

### 3. Create Your First App

#### Trading Bot
```bash
tams> create trading "My First Bot"
```

#### Web Scraper
```bash
tams> create tool "News Scraper"
```

#### Research Forum
```bash
tams> install research-forum
```

### 4. List Your Apps

```bash
tams> list
```

### 5. Execute App Commands

#### Start Trading Bot
```bash
tams> execute app_123456 start
```

#### Crawl Websites
```bash
tams> execute app_789012 crawl '["https://news.ycombinator.com"]' 2
```

#### Create Research Topic
```bash
tams> execute app_345678 createTopic '{"title":"AI Research","description":"Discussion","author":"user1","tags":["ai"],"bounty":100}'
```

### 6. Clone an App

```bash
tams> clone app_123456 --name "Bot Clone"
```

### 7. Tune with AI

```bash
tams> tune app_123456
```

### 8. Search the Store

```bash
tams> store trading
tams> install trading-algo-basic
```

## Browser Interface

Start the browser interface:

```bash
# In your TAMS CLI
tams> execute <browser-integration-app-id> start
```

Then open: http://localhost:3001

## Common Workflows

### Build a Knowledge Library

```bash
# Create scraper
create tool "Knowledge Library"

# Crawl multiple sources
execute <app-id> crawl '["https://arxiv.org","https://news.ycombinator.com"]' 3

# Search library
execute <app-id> search "machine learning"

# Export
execute <app-id> exportLibrary markdown
```

### Run Trading Experiments

```bash
# Create bot
create trading "Experimental Bot"

# Backtest
execute <app-id> backtest '{"period":"2024-01"}'

# Tune
tune <app-id>

# Clone variations
clone <app-id> --name "Variation 1"
clone <app-id> --name "Variation 2"
```

### Manage Research Projects

```bash
# Install forum
install research-forum

# Create topics
execute <app-id> createTopic '{"title":"Topic","description":"Desc","author":"me","tags":["tag"],"bounty":100}'

# Add contributions
execute <app-id> addContribution '{"topicId":"topic_123","author":"contributor","content":"My idea..."}'

# Resolve bounty
execute <app-id> resolveBounty topic_123 contrib_456
```

## Next Steps

- Read the full [README.md](./README.md)
- Check [examples/](./examples/) for detailed use cases
- Explore the [core/](./core/) architecture
- Join the community

## Tips

1. **Use Tab Completion** - Most terminals support tab completion
2. **Background Agent** - The AI agent automatically monitors and optimizes your apps
3. **Clone Everything** - Apps are designed to be cloned and experimented with
4. **Tune Regularly** - AI tuning improves performance over time
5. **Check Status** - Use `status` to see what's running

## Troubleshooting

- **App not found**: Check the app ID with `list`
- **Command failed**: Use `help <command>` for usage
- **Agent issues**: Restart TAMS with `exit` then `npm run dev`

Happy building! 🚀
