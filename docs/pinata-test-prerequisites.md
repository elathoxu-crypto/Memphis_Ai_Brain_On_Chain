# Pinata Share-Sync Test - Prerequisites

**Date:** 2026-03-01 12:00 CET
**Goal:** Test Memphis share-sync with Pinata

---

## ✅ Memphis Implementation Status

### **Already Implemented:**

1. **Pinata Integration** ✅
   - File: `src/integrations/pinata.ts`
   - Class: `PinataBridge`
   - Methods: `pinJSON()`, `unpin()`, `getPinned()`, `cleanupOldPins()`

2. **Share-Sync Command** ✅
   - File: `src/cli/share-sync.ts`
   - Command: `memphis share-sync`
   - Flags: `--push`, `--pull`, `--all`, `--cleanup`, `--limit`, `--dry-run`, `--push-disabled`

3. **Network Chain** ✅
   - File: `~/.memphis/network-chain.jsonl`
   - Tracks: CIDs, agents, timestamps, status

4. **Security** ✅
   - RLS guard for share operations
   - `assertOperation("share.push")`, `assertOperation("share.pull")`

---

## ❌ Missing: Pinata Credentials

### **Required:**

**Option 1: JWT (Recommended)**
```yaml
# ~/.memphis/config.yaml
integrations:
  pinata:
    jwt: "eyJhbGc..."
```

**Option 2: API Key + Secret**
```yaml
# ~/.memphis/config.yaml
integrations:
  pinata:
    apiKey: "abc123..."
    apiSecret: "xyz789..."
```

**Option 3: Environment Variables**
```bash
export PINATA_JWT="eyJhbGc..."
# or
export PINATA_API_KEY="abc123..."
export PINATA_SECRET="xyz789..."
```

---

## 📋 How to Get Pinata Credentials

### **Step 1: Create Pinata Account**

1. Go to: https://app.pinata.cloud/
2. Sign up (free tier)
3. Verify email

### **Step 2: Get JWT (Recommended)**

1. Go to: https://app.pinata.cloud/keys
2. Click "New Key"
3. Select permissions:
   - ✅ `pinFileToIPFS`
   - ✅ `pinJSONToIPFS`
   - ✅ `unpin`
4. Copy JWT (starts with `eyJhbG...`)

### **Step 3: Configure Memphis**

```bash
# Option A: Add to config
nano ~/.memphis/config.yaml
```

```yaml
integrations:
  pinata:
    jwt: "YOUR_JWT_HERE"
```

```bash
# Option B: Set env var
export PINATA_JWT="YOUR_JWT_HERE"

# Add to ~/.bashrc or ~/.zshrc for persistence:
echo 'export PINATA_JWT="YOUR_JWT_HERE"' >> ~/.bashrc
```

---

## 🧪 Test Plan

### **Test 1: Basic Pin**

```bash
# Check if Pinata is configured
memphis status | grep Pinata

# Test manual pin
node ~/memphis/dist/integrations/pinata.js status

# Expected output:
# Pins: 0/100
```

---

### **Test 2: Push Share Block**

```bash
# Create share-tagged block
memphis journal "Test share block for IPFS" --tags test,share

# Push to Pinata
memphis share-sync --push --limit 1

# Expected output:
# [share-sync] pushed journal#9 → QmXyz...
```

---

### **Test 3: Verify on IPFS**

```bash
# Get CID from network-chain
cat ~/.memphis/network-chain.jsonl | tail -1

# Expected format:
# {"cid":"QmXyz...","agent":"watra","timestamp":"...","status":"pinned"}

# Check on IPFS gateway
curl https://ipfs.io/ipfs/QmXyz...

# Expected: JSON block content
```

---

### **Test 4: Pull from Another Agent**

```bash
# Simulate pull (on same machine for now)
memphis share-sync --pull --limit 1

# Expected output:
# [share-sync] pulling QmXyz... (journal#9)
# [share-sync] imported QmXyz... → share#000000
```

---

### **Test 5: Cleanup**

```bash
# Cleanup old pins (TTL 7 days)
memphis share-sync --cleanup

# Expected output:
# [share-sync] removed 0 old pins
```

---

## ⚠️ Limitations (Free Tier)

| Limit | Value |
|-------|-------|
| Storage | 1 GB |
| Max pins | 100 |
| Bandwidth | Unlimited |
| TTL | No auto-expire (manual cleanup) |

**Memphis config defaults:**
- `maxPins: 100`
- `ttlDays: 7` (cleanup after 7 days)
- `cleanupEnabled: true`

---

## 🔧 Troubleshooting

### **Error: "Pinata config requires either JWT or apiKey+apiSecret"**

**Solution:** Add credentials to config or env

---

### **Error: "Payload exceeds 2KB limit"**

**Solution:** Share blocks must be ≤2KB

```bash
# Check block size:
memphis show journal 9 | wc -c

# If too large, split content:
memphis journal "part 1" --tags share
memphis journal "part 2" --tags share
```

---

### **Error: "Gateway timeout"**

**Solution:** IPFS gateways can be slow. Wait or use different gateway:

```bash
# Alternative gateways:
https://gateway.pinata.cloud/ipfs/QmXyz...
https://cloudflare-ipfs.com/ipfs/QmXyz...
https://dweb.link/ipfs/QmXyz...
```

---

## 📊 Expected Results

**If Pinata is configured correctly:**

```bash
$ memphis status | grep -A 5 Pinata
Pinata:
  ✓ configured (JWT)
  Pins: 0/100
  Last sync: never

$ memphis share-sync --push --limit 1
[share-sync] pushed journal#9 → QmXyz...

$ cat ~/.memphis/network-chain.jsonl
{"cid":"QmXyz...","agent":"watra","timestamp":"2026-03-01T11:00:00Z","chain":"journal","index":9,"tags":["test","share"],"status":"pinned"}

$ curl https://ipfs.io/ipfs/QmXyz...
{"agent":"watra","timestamp":"2026-03-01T11:00:00Z","chain":"journal","index":9,"content":"Test share block for IPFS","tags":["test","share"]}
```

---

## 🎯 Next Steps

### **If you have Pinata account:**

1. Get JWT from https://app.pinata.cloud/keys
2. Add to `~/.memphis/config.yaml`:
   ```yaml
   integrations:
     pinata:
       jwt: "YOUR_JWT_HERE"
   ```
3. Run: `memphis share-sync --push --limit 1`
4. Verify: `cat ~/.memphis/network-chain.jsonl`

### **If you DON'T have Pinata account:**

1. Create account at https://app.pinata.cloud/
2. Get JWT
3. Configure Memphis
4. Test

### **Alternative: Local IPFS Node**

If you don't want Pinata, you can run local IPFS node:

```bash
# Install IPFS
sudo apt install ipfs

# Initialize
ipfs init

# Start daemon
ipfs daemon &

# Pin locally
ipfs add --pin <file>

# Memphis would need local IPFS integration (not yet implemented)
```

---

## ✅ Summary

**Status: READY TO TEST** (needs Pinata credentials)

**Implementation:** 100% complete
- ✅ PinataBridge
- ✅ Share-sync command
- ✅ Network chain
- ✅ Security (RLS)

**Missing:** Pinata JWT/API key

**Time to test:** 5 minutes (after getting credentials)

---

**Do you have a Pinata account? If yes, let's configure it and test!** 🔥
