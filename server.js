const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

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

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getMemphisStatus()));
    return;
  }
  
  let filePath = req.url === '/' ? '/memphis-status.html' : req.url;
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
  console.log(`Memphis Status: https://localhost:${PORT}/memphis-status.html`);
});
