# Browser Setup

## Chrome Profile: `amazing`

AmazingPlugins has its own dedicated Chrome profile for isolated browsing sessions.

### Profile Details

| Property | Value |
|---|---|
| **Profile Name** | `amazing` |
| **CDP Port** | 9226 |
| **user-data-dir** | `~/.openclaw/browser/amazing/user-data` |
| **profile-directory** | `Profile 1` |

### How to Start

```bash
# Kill existing instance first
lsof -ti :9226 | xargs kill 2>/dev/null

# Start amazing Chrome
nohup "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --user-data-dir="/Users/ray/.openclaw/browser/amazing/user-data" \
  --no-first-run \
  --no-service-initialize \
  --remote-debugging-port=9226 \
  --profile-directory="Profile 1" \
  > /tmp/chrome-amazing.log 2>&1 &
```

### What This Profile Contains

- **Clean state**: No Google account, no bookmarks, no extensions
- Isolated from Harun's personal Chrome session
- Sessions are NOT shared with other profiles

---

## All Chrome Profiles

| Profile | Purpose | Port | Google Account |
|---|---|---|---|
| `Default` | Harun's personal Chrome | — | ✅ Yes |
| `openclaw` | OpenClaw workspace default | 9222 | ✅ Yes |
| `crontinel` | Crontinel project work | 9224 | ❌ No |
| `toolblip` | Toolblip project work | 9225 | ❌ No |
| `amazing` | AmazingPlugins project work | 9226 | ❌ No |

### Key Differences

- **Default** and **openclaw** share state (copies of same base Chrome)
- **crontinel**, **toolblip**, and **amazing** are completely isolated clean profiles
- Sessions are NOT shared between profiles — each starts fresh

---

## Profile Architecture

```
~/.openclaw/browser/
├── amazing/user-data/
│   └── Profile 1/          ← AmazingPlugins isolated Chrome profile
├── crontinel/user-data/
│   └── Profile 1/          ← Crontinel isolated Chrome profile
├── openclaw/user-data/
│   └── Default/            ← OpenClaw default workspace profile
└── toolblip/user-data/
    └── Default/            ← Toolblip project profile
```

---

## Crontinel Profile (Legacy, port 9224)

```bash
# Kill existing instance first
lsof -ti :9224 | xargs kill 2>/dev/null

# Start crontinel Chrome
nohup "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --user-data-dir="/Users/ray/.openclaw/browser/crontinel/user-data" \
  --no-first-run \
  --no-service-initialize \
  --remote-debugging-port=9224 \
  --profile-directory="Profile 1" \
  > /tmp/chrome-crontinel.log 2>&1 &
```
