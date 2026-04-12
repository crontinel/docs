# Crontinel Browser Setup

## Chrome Profile: `crontinel`

Crontinel has its own dedicated Chrome profile for isolated browsing sessions.

### Profile Details

| Property | Value |
|---|---|
| **Profile Name** | `crontinel` |
| **CDP Port** | 9224 |
| **user-data-dir** | `~/.openclaw/browser/crontinel/user-data` |
| **profile-directory** | `Profile 1` |
| **Avatar** | Crontinel logo (264x264 PNG) |

### How to Start

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

### What This Profile Contains

- **Clean state**: No Google account, no bookmarks, no extensions
- **Session data**: Cookies and login sessions copied from `openclaw` profile
- **Crontinel logo**: Custom avatar set from `~/Work/crontinel/landing/public/logo-dark.png`

### Profile Architecture

```
~/.openclaw/browser/
├── crontinel/user-data/
│   ├── Profile 1/          ← Crontinel's isolated Chrome profile
│   ├── Local State         ← Chrome config (profile name: crontinel)
│   └── ...
├── openclaw/user-data/     ← OpenClaw default workspace profile
│   └── Default/           ← Copy of Harun's default Chrome
└── toolblip/user-data/      ← Toolblip project profile
    └── Default/
```

### All 4 Chrome Profiles

| Profile | Purpose | Google Account |
|---|---|---|
| `Default` | Harun's personal Chrome | ✅ Yes |
| `openclaw` | OpenClaw workspace default | ✅ Yes |
| `crontinel` | Crontinel project work | ❌ No |
| `toolblip` | Toolblip project work | ❌ No |

### Key Differences

- **Default** and **openclaw** share state (copies of same base Chrome)
- **crontinel** and **toolblip** are completely isolated clean profiles
- Sessions are NOT shared between profiles — each starts fresh

### Updating the Avatar

The crontinel logo is stored at:
```
~/.openclaw/browser/crontinel/user-data/Profile 1/Avatar Images/custom_avatar.png
```

To update it:
```bash
# Resize logo to 264x264
sips -z 264 264 ~/Work/crontinel/landing/public/logo-dark.png \
  --out ~/.openclaw/browser/crontinel/user-data/Profile 1/Avatar Images/custom_avatar.png
```

Then restart Chrome.
