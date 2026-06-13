// 发布新版本时把 v 数字 +1，可强制清掉旧缓存
const C='dlt-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||req.url.indexOf(self.location.origin)!==0)return;
  const isHTML = req.mode==='navigate' || (req.headers.get('accept')||'').indexOf('text/html')!==-1;
  if(isHTML){
    // 页面用 network-first：始终优先拿最新，断网才回退缓存，避免老用户卡在旧版
    e.respondWith(
      fetch(req).then(res=>{
        const cp=res.clone();caches.open(C).then(c=>c.put(req,cp));return res;
      }).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html')))
    );
  }else{
    // 静态资源用 cache-first：快、省流量
    e.respondWith(
      caches.match(req).then(r=>r||fetch(req).then(res=>{
        const cp=res.clone();caches.open(C).then(c=>c.put(req,cp));return res;
      }))
    );
  }
});
