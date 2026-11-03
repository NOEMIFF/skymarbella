// SKY MARBELLA · permite abrir la app sin cobertura
const V='sky-v25';
const CORE=['./','index.html'];
// Los planos (31 archivos, unos 33 MB) ya NO se bajan todos al instalar: seria una
// barbaridad en el movil con datos. Cada plano se guarda solo cuando se abre una vez,
// y a partir de ahi ya se ve sin cobertura. Esto si conviene tenerlo de antemano.
const PLANOS=["pdf.js", "pdf.worker.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
  caches.open(V).then(c=>Promise.all(PLANOS.map(u=>c.match(u).then(m=>m||fetch(u).then(r=>r.ok&&c.put(u,r)).catch(()=>{})))))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const isPlano=/planos_PEDIDO_|\/pdf(\.worker)?\.js$/.test(u.pathname);
  if(isPlano){e.respondWith(caches.open(V).then(c=>c.match(u.pathname.split('/').pop()).then(m=>m||fetch(e.request).then(r=>{if(r.ok)c.put(u.pathname.split('/').pop(),r.clone());return r}))));return}
  // index: primero red (4 s), si no hay cobertura la copia guardada
  e.respondWith(new Promise(res=>{let done=false;const fb=()=>caches.match('index.html').then(m=>{if(!done&&m){done=true;res(m)}});
    const t=setTimeout(fb,4000);
    fetch(e.request).then(r=>{clearTimeout(t);if(r.ok&&(e.request.mode==='navigate'||/index\.html$|\/$/.test(u.pathname))){const cp=r.clone();caches.open(V).then(c=>c.put('index.html',cp))}if(!done){done=true;res(r)}}).catch(()=>{clearTimeout(t);caches.match('index.html').then(m=>{if(!done){done=true;res(m||Response.error())}})});
  }));
});
