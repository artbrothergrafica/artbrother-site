const CACHE_PREFIX = 'art-brother-';
const CACHE_NAME = CACHE_PREFIX + 'galerias1';
const CORE_ASSETS = [
 './banner-sazonal.js?v=natal2026','./img/brotherzinho-natal-2026.webp',
 './index.html','./catalogo/index.html','./404.html','./style.css?v=galerias1','./script.js?v=galerias1',
 './logo.png','./img/brotherzinho-vitrine.webp','./site.webmanifest?v=7.2.0',
 './favicon/favicon-192x192.png','./favicon/favicon-512x512.png'
];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
function paginaEmCache(url) {
 const base = new URL('./', self.registration.scope).pathname;
 if (!url.pathname.startsWith(base)) return null;
 const path = url.pathname.slice(base.length);
 if (path === '' || path === 'index.html') return './index.html';
 if (path === 'catalogo' || path === 'catalogo/' || path === 'catalogo/index.html') return './catalogo/index.html';
 return null;
}
async function buscarComPrazo(request, cache) {
 const controller = new AbortController();
 const timeout = setTimeout(() => controller.abort(), 6000);
 try {
  return await fetch(request, {cache, signal:controller.signal});
 } finally {
  clearTimeout(timeout);
 }
}
async function remember(key,response){
 if(response.ok && response.type!=='opaque'){
  const cache=await caches.open(CACHE_NAME);
  try{await cache.put(key,response.clone());}catch(error){console.warn("Cache indisponível",error);}
 }
 return response;
}
async function navigation(request, cacheKey){
 const cache=await caches.open(CACHE_NAME);
 try{
  const response=await buscarComPrazo(request,'no-store');
  if(response.ok){await remember(cacheKey,response);return response;}
  if(response.status>=500){const previous=await cache.match(cacheKey);if(previous)return previous;}
  return response;
 }catch{
  return await cache.match(cacheKey) || new Response('Sem conexão. Acesse novamente quando estiver online.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 }
}
async function asset(request){
 const cache=await caches.open(CACHE_NAME);
 try{
  const response=await buscarComPrazo(request,'no-cache');
  if(response.ok)return await remember(request,response);
  return await cache.match(request) || response;
 }catch{
  return await cache.match(request) || Response.error();
 }
}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(url.pathname.endsWith('.pdf'))return;
 if(request.mode==='navigate'){
  const cacheKey = paginaEmCache(url);
  if(cacheKey){event.respondWith(navigation(request,cacheKey));return;}
  event.respondWith(fetch(request).catch(async()=>{
   const cache=await caches.open(CACHE_NAME),fallback=await cache.match('./404.html');
   return fallback?new Response(await fallback.text(),{status:404,headers:{'Content-Type':'text/html; charset=utf-8'}}):Response.error();
  }));return;
 }
 if(['style','script','image','manifest','font'].includes(request.destination))event.respondWith(asset(request));
});
