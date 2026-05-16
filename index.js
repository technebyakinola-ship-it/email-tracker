const http = require('http');
const url = require('url');

const opens = {};

const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname === '/pixel') {
    const id = parsed.query.id || 'unknown';
    const email = parsed.query.email || 'unknown';
    const now = new Date().toISOString();

    if (!opens[id]) {
      opens[id] = {
        email: email,
        firstOpened: now,
        openCount: 1
      };
    } else {
      opens[id].openCount += 1;
      opens[id].lastOpened = now;
    }

    console.log(`OPEN: ${email} | ID: ${id} | Time: ${now}`);

    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': PIXEL.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private'
    });
    res.end(PIXEL);

  } else if (parsed.pathname === '/opens') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(opens, null, 2));

  } else if (parsed.pathname === '/check') {
    const email = parsed.query.email || '';
    const result = Object.values(opens).find(o => o.email === email);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result || { opened: false }));

  } else {
    res.writeHead(200);
    res.end('Tracker running');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Tracker running on port ${PORT}`);
});
