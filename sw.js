const C='dlt-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||e.request.url.indexOf(self.location.origin)!==0)return;
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
