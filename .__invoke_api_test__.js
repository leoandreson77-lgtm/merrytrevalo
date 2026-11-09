import appModule from './api/index.js';
const app = appModule && appModule.default ? appModule.default : appModule;
const server = app.listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const port = server.address().port;
const url = `http://127.0.0.1:${port}/api/airports/search?q=nyc&scope=airport`;
let status = null;
let body = null;
try{
  const res = await fetch(url, { method: 'GET' });
  status = res.status;
  try { body = await res.json(); } catch(e) { body = await res.text(); }
  const excerpt = Array.isArray(body) ? body.slice(0,3) : body;
  console.log('<<RESULT>>' + JSON.stringify({ status, excerpt }, null, 2));
} catch (err) {
  console.error('<<ERROR>>' + (err && err.stack ? err.stack : String(err)));
}
await new Promise((r) => server.close(r));
console.log('<<DONE>>');
