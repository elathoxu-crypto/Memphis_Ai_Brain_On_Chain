const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.MEMPHIS_STATUS_PORT ? Number(process.env.MEMPHIS_STATUS_PORT) : 8080;
const ACCESS_TOKEN = process.env.MEMPHIS_STATUS_TOKEN || '';

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json'
};

// Simple API - read Memphis chains
function getMemphisStatus() {
  const chains = [];
  const chainsDir = process.env.HOME + '/.memphis/chains';
  
  try {
    if (fs.existsSync(chainsDir)) {
      const dirs = fs.readdirSync(chainsDir);
      for (const dir of dirs) {
        const dirPath = chainsDir + '/' + dir;
        if (fs.statSync(dirPath).isDirectory()) {
          const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
          chains.push({ name: dir, blocks: files.length, status: files.length > 0 ? 'ok' : 'empty' });
        }
      }
    }
  } catch (e) {
    console.error('Error reading chains:', e);
  }

  // Get last 5 blocks
  const blocks = [];
  const journalDir = chainsDir + '/journal';
  try {
    if (fs.existsSync(journalDir)) {
      const files = fs.readdirSync(journalDir).filter(f => f.endsWith('.json')).sort().slice(-5);
      for (const file of files) {
        const data = JSON.parse(fs.readFileSync(journalDir + '/' + file, 'utf8'));
        blocks.push({
          index: parseInt(file.replace('.json', '')),
          source: data.data?.source || 'unknown',
          time: new Date(data.timestamp).toISOString().replace('T', ' ').substring(0, 16),
          content: data.data?.content?.substring(0, 80) || '',
          tags: data.data?.tags || []
        });
      }
    }
  } catch (e) {
    console.error('Error reading blocks:', e);
  }

  return {
    chains,
    providers: [{ name: 'ollama', model: 'llama3.2:1b', status: 'ready' }],
    blocks
  };
}

function isAuthorized(req) {
  if (!ACCESS_TOKEN) return true;
  const headerToken = req.headers['x-memphis-token'];
  let queryToken = null;
  try {
    const url = new URL(req.url, 'http://localhost');
    queryToken = url.searchParams.get('token');
  } catch (err) {
    // ignore
  }
  return headerToken === ACCESS_TOKEN || queryToken === ACCESS_TOKEN;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (!isAuthorized(req)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }
  
  if (req.url.startsWith('/api/status')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getMemphisStatus()));
    return;
  }
  
  const urlPath = req.url.split('?')[0];
  let filePath = urlPath === '/' ? '/memphis-status.html' : urlPath;
  filePath = __dirname + filePath;
  
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Memphis Status server on http://localhost:${PORT}/memphis-status.html`);
  if (ACCESS_TOKEN) {
    console.log('⚠ Token protection enabled. Pass X-Memphis-Token header or ?token=... in browser.');
  } else {
    console.log('⚠ No MEMPHIS_STATUS_TOKEN set. Anyone with access to this port can read stats.');
  }
});
