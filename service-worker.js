const CACHE_PREFIX = 'art-brother-';
const CACHE_NAME = CACHE_PREFIX + 'v6.4.0';
const CORE_ASSETS = [
 './index.html','./404.html','./style.css?v=6.4.0','./script.js?v=6.4.0',
 './logo.png','./site.webmanifest?v=6.4.0',
 './favicon/favicon-192x192.png','./favicon/favicon-512x512.png'
];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
function homePath(url){
 const base=new URL('./',self.registration.scope).pathname;
 return url.pathname===base || url.pathname===base+'index.html';
}
async function remember(key,response){
 if(response.ok && response.type!=='opaque'){
  const cache=await caches.open(CACHE_NAME);
  try{await cache.put(key,response.clone());}catch(error){console.warn("Cache indisponível",error);}
 }
 return response;
}
async function navigation(request){
 const cache=await caches.open(CACHE_NAME);
 try{
  const response=await fetch(request,{cache:'no-store',signal:AbortSignal.timeout(6000)});
  if(response.ok){await remember('./index.html',response);return response;}
  if(response.status>=500){const previous=await cache.match('./index.html');if(previous)return previous;}
  return response;
 }catch{
  return await cache.match('./index.html') || new Response('Sem conexão. Acesse novamente quando estiver online.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 }
}
async function asset(request){
 const cache=await caches.open(CACHE_NAME);
 try{
  const response=await fetch(request,{cache:'no-cache',signal:AbortSignal.timeout(6000)});
  if(response.ok)return await remember(request,response);
  return await cache.match(request) || response;
 }catch{
  return await cache.match(request) || Response.error();
 }
}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  if(homePath(url)){event.respondWith(navigation(request));return;}
  event.respondWith(fetch(request).catch(async()=>{
   const cache=await caches.open(CACHE_NAME),fallback=await cache.match('./404.html');
   return fallback?new Response(await fallback.text(),{status:404,headers:{'Content-Type':'text/html; charset=utf-8'}}):Response.error();
  }));return;
 }
 if(['style','script','image','manifest','font'].includes(request.destination))event.respondWith(asset(request));
});
