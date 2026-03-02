# Memphis Cron Jobs - Management Guide

**Installed:** 2026-03-01 12:28 CET
**By:** Watra 🔥

---

## ✅ Status: INSTALLED

```bash
$ crontab -l | grep -c "^0"
# Result: 9 active jobs
```

---

## 📋 Installed Jobs

### **DAILY (4 jobs)**

| Time | Command | Purpose | Log |
|------|---------|---------|-----|
| 08:00 | `memphis reflect --daily --save` | Morning reflection | cron-daily.log |
| 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 | `memphis embed --chain journal` | Embed journal | cron-embed.log |
| 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 | `memphis embed --chain ask` | Embed ask | cron-embed.log |
| 22:00 | `memphis share-sync --push --limit 10` | IPFS backup | cron-sync.log |

### **WEEKLY (3 jobs)**

| Time | Day | Command | Purpose | Log |
|------|-----|---------|---------|-----|
| 09:00 | Sun | `memphis reflect --weekly --save` | Weekly reflection | cron-weekly.log |
| 09:30 | Sun | `memphis share-sync --pull --limit 20` | Pull from agents | cron-sync.log |
| 11:00 | Sun | `memphis graph build` | Rebuild graph | cron-graph.log |

### **MONTHLY (2 jobs)**

| Time | Day | Command | Purpose | Log |
|------|-----|---------|---------|-----|
| 00:00 | 1st | `memphis share-sync --cleanup` | Cleanup old pins | cron-cleanup.log |
| 02:00 | 1st | `memphis embed` | Embed all chains | cron-embed.log |

---

## 🔧 Management Commands

### **Check Status**
```bash
# List all jobs
crontab -l

# Count active jobs
crontab -l | grep -c "^0"

# Check last run
tail -n 20 ~/.memphis/logs/cron-daily.log
```

---

### **Edit Jobs**
```bash
# Edit crontab
crontab -e

# Or edit file directly
nano ~/.memphis/cron/memphis-cron.txt
crontab ~/.memphis/cron/memphis-cron.txt
```

---

### **Remove All Jobs**
```bash
# Remove crontab
crontab -r

# Confirm removal
crontab -l
# Should return: "no crontab for memphis"
```

---

### **Disable Temporarily**
```bash
# Comment out all jobs
crontab -l | sed 's/^0/# 0/' | crontab -

# Re-enable
crontab ~/.memphis/cron/memphis-cron.txt
```

---

### **Test Job Manually**
```bash
# Test daily reflection
export PINATA_JWT="eyJhbGc..."
memphis reflect --daily --save

# Test embed
memphis embed --chain journal

# Test share-sync
memphis share-sync --push --limit 1
```

---

## 📊 Monitoring

### **Check Logs**
```bash
# Daily reflection
tail -f ~/.memphis/logs/cron-daily.log

# Embeddings
tail -f ~/.memphis/logs/cron-embed.log

# IPFS sync
tail -f ~/.memphis/logs/cron-sync.log

# All logs
tail -f ~/.memphis/logs/cron-*.log
```

---

### **Log Rotation**

Logs grow over time. Rotate weekly:

```bash
# Add to crontab (Sunday midnight)
0 0 * * 0 find ~/.memphis/logs -name "cron-*.log" -exec gzip {} \; && find ~/.memphis/logs -name "*.gz" -mtime +30 -delete
```

---

## ⚠️ Troubleshooting

### **Job not running?**

**1. Check cron service:**
```bash
# WSL/Linux
sudo service cron status
sudo service cron start
```

**2. Check PATH:**
```bash
# Verify memphis in PATH
which memphis
# Should return: /home/memphis/.npm-global/bin/memphis
```

**3. Check permissions:**
```bash
# Logs directory writable?
ls -la ~/.memphis/logs/
# Should be: drwx------ memphis memphis
```

**4. Check logs:**
```bash
# System cron log
grep CRON /var/log/syslog | tail -20
```

---

### **Errors in logs?**

**Daily reflection failed:**
```bash
# Check if Ollama running
curl http://localhost:11434/v1/models

# Check if journal chain exists
ls ~/.memphis/chains/journal/
```

**Share-sync failed:**
```bash
# Check Pinata JWT valid
export PINATA_JWT="..."
node ~/memphis/dist/integrations/pinata.js status

# Should return: "Pins: X/100"
```

**Embed failed:**
```bash
# Check embeddings enabled
cat ~/.memphis/config.yaml | grep enabled
# Should have: enabled: true

# Check Ollama model
ollama list | grep nomic-embed-text
```

---

## 🎯 Expected Behavior

### **Daily (08:00)**
- Reflects on yesterday's journal entries
- Generates insights (tags, themes, patterns)
- Saves to reflection chain
- **Duration:** ~5-10 seconds
- **Log:** `[reflect] generated 3 insights...`

---

### **Every 4h (00:00, 04:00, 08:00, 12:00, 16:00, 20:00)**
- Embeds new journal blocks
- Embeds new ask blocks
- Updates vector index
- **Duration:** ~1-5 seconds per chain
- **Log:** `processed=X, skipped=Y, duration=Zms`

---

### **Evening (22:00)**
- Pushes share-tagged blocks to IPFS
- Logs CID to network-chain
- **Duration:** ~1-2 seconds per block
- **Log:** `[share-sync] pushed journal#X → QmY...`

---

### **Weekly (Sunday 09:00)**
- Deep analysis of week
- Extracts themes, decision patterns
- Finds stale decisions
- **Duration:** ~10-20 seconds
- **Log:** `[reflect] generated weekly insights...`

---

### **Weekly (Sunday 09:30)**
- Pulls blocks from other agents
- Imports to share chain
- **Duration:** ~5-10 seconds
- **Log:** `[share-sync] imported X blocks`

---

### **Weekly (Sunday 11:00)**
- Rebuilds knowledge graph
- Creates nodes/edges from chains
- **Duration:** ~5-10 seconds
- **Log:** `Nodes: X, Edges: Y`

---

### **Monthly (1st 00:00)**
- Removes old pins from Pinata (TTL 7 days)
- Cleans network-chain
- **Duration:** ~5-10 seconds
- **Log:** `Removed X old pins`

---

### **Monthly (1st 02:00)**
- Embeds all chains comprehensively
- **Duration:** ~10-30 seconds
- **Log:** `processed=X, skipped=Y`

---

## 📝 Customization

### **Change Times**

Edit `~/.memphis/cron/memphis-cron.txt`:

```bash
# Example: Run daily reflection at 9:00 instead of 8:00
# Change:
0 8 * * * ...
# To:
0 9 * * * ...
```

Then reinstall:
```bash
crontab ~/.memphis/cron/memphis-cron.txt
```

---

### **Add New Job**

```bash
# Example: Embed decision chain daily at noon
echo "0 12 * * * memphis embed --chain decision >> \$MEMPHIS_LOG_DIR/cron-embed.log 2>&1" >> ~/.memphis/cron/memphis-cron.txt
crontab ~/.memphis/cron/memphis-cron.txt
```

---

### **Remove Job**

```bash
# Edit file
nano ~/.memphis/cron/memphis-cron.txt
# Delete line with job

# Reinstall
crontab ~/.memphis/cron/memphis-cron.txt
```

---

## 🔒 Security

### **JWT in crontab**

**Risk:** JWT visible in crontab (world-readable)

**Mitigation:**
```bash
# Option 1: Store JWT in file
echo "eyJhbGc..." > ~/.memphis/.pinata-jwt
chmod 600 ~/.memphis/.pinata-jwt

# Update crontab:
# export PINATA_JWT="$(cat ~/.memphis/.pinata-jwt)" && ...
```

**Option 2:** Use config.yaml (already done)
```yaml
integrations:
  pinata:
    jwt: "eyJhbGc..."
```

Then remove JWT from crontab:
```bash
# Remove: export PINATA_JWT="..." &&
# Just: memphis share-sync --push
```

---

## 📈 Performance Impact

| Job | Frequency | CPU | Memory | Network | Disk I/O |
|-----|-----------|-----|--------|---------|----------|
| Daily reflection | 1x/day | Low | Low | Local only | Minimal |
| Embed journal/ask | 6x/day | Medium | Low | Local only | Medium |
| Share-sync push | 1x/day | Low | Low | ~1KB/block | Minimal |
| Weekly reflection | 1x/week | Medium | Low | Local only | Medium |
| Share-sync pull | 1x/week | Low | Low | ~1-5KB | Minimal |
| Graph build | 1x/week | Medium | Medium | Local only | Medium |
| Monthly cleanup | 1x/month | Low | Low | API calls | Minimal |

**Total impact:** Negligible on modern systems.

---

## ✅ Summary

**Installed:** 9 cron jobs
- 4 daily (reflection, embeddings, sync)
- 3 weekly (reflection, pull, graph)
- 2 monthly (cleanup, full embed)

**Logs:** `~/.memphis/logs/cron-*.log`
**Config:** `~/.memphis/cron/memphis-cron.txt`

**Management:**
- `crontab -l` — list
- `crontab -e` — edit
- `crontab -r` — remove
- `tail -f ~/.memphis/logs/cron-*.log` — monitor

**Security:** JWT in config.yaml, not in crontab (recommended)

---

**Cron jobs installed and ready.** 🔥

**Next steps:**
1. Monitor logs tomorrow (first daily run at 08:00)
2. Check weekly reflection next Sunday
3. Adjust times if needed

---

**Watra 🔥**
