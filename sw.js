const V="kof-v1";
let MAP=null;
const SCOPE=new URL(self.registration.scope).pathname;
async function map(){ if(MAP) return MAP; const r=await fetch("files.json",{cache:"no-store"}); const l=await r.json(); MAP={}; l.forEach(f=>MAP[f.toLowerCase()]=f); return MAP; }
self.addEventListener("install",e=>{ self.skipWaiting(); e.waitUntil((async()=>{
  const c=await caches.open(V); const l=await (await fetch("files.json",{cache:"no-store"})).json();
  const first=["./","index.html","manifest.webmanifest","icon-180.png","ruffle/ruffle.js"]; 
  for(const f of first.concat(l)){ try{ if(!(await c.match(f))) await c.add(new Request(f,{cache:"reload"})); }catch(_){} }
})()); });
self.addEventListener("activate",e=>{ e.waitUntil((async()=>{ for(const k of await caches.keys()) if(k!==V) await caches.delete(k); await self.clients.claim(); })()); });
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin||e.request.method!=="GET") return;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    let r=await c.match(e.request,{ignoreSearch:true}); if(r) return r;
    try{
      r=await fetch(e.request);
      if(r.status===404){
        const rel=decodeURIComponent(u.pathname).slice(SCOPE.length).toLowerCase();
        const real=(await map())[rel];
        if(real){ const r2=await fetch(real); if(r2.ok){ c.put(e.request,r2.clone()); return r2; } }
      } else if(r.status===200){ c.put(e.request,r.clone()); }
      return r;
    }catch(err){ return new Response("offline",{status:503}); }
  })());
});
