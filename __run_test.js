(async ()=>{try{
const appMod = await import('./api/index.js');
const app = appMod && appMod.default ? appMod.default : appMod;
const server = app.listen(0,'127.0.0.1');
await new Promise((r)=>server.once('listening',r));
const port = server.address().port;
const url = `http://127.0.0.1:${port}/api/airports/search?q=nyc&scope=airport`;
const res = await fetch(url);
const status = res.status;
let body;
try{ body = await res.json(); }catch(e){ body = await res.text(); }
console.log('<<RESULT>>'+JSON.stringify({status, body: Array.isArray(body)? body.slice(0,3): body}));
server.close();
process.exit(0);}catch(e){ console.error('<<ERROR>>'+(e && e.stack? e.stack : String(e))); process.exit(2);} })();
