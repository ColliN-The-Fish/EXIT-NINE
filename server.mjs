import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.wav':'audio/wav'};
const server=http.createServer((req,res)=>{let p;try{p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;} if(p===root)p=path.join(root,'index.html');if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;} fs.readFile(p,(e,data)=>{if(e){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store','Content-Length':data.length});res.end(data);});});
server.listen(Number(process.env.PORT||4177),'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+server.address().port));
server.on('error',e=>{console.error(e.message);process.exitCode=1;});
