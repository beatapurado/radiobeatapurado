/* Beat Apurado — Build 005 PRODUÇÃO Service Worker */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// Sem interceptação de fetch nesta fase: evita transformar falhas de rede externas em erros do Service Worker.

// Pronto para o backend Web Push da próxima etapa do Cosmic Alert.
self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{};}catch(e){data={body:event.data?.text()};}
  const title=data.title||'👽 Beat Apurado Radio';
  const options={
    body:data.body||'🎧 DJ Jordan está ao vivo!',
    icon:data.icon||'https://raw.githubusercontent.com/beatapurado/radiobeatapurado/main/icon-192.png',
    badge:data.badge||'https://raw.githubusercontent.com/beatapurado/radiobeatapurado/main/icon-192.png',
    tag:data.tag||'beatapurado-cosmic-alert',
    data:{url:data.url||'https://beatapurado.github.io/radiobeatapurado/'}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=event.notification.data?.url||'https://beatapurado.github.io/radiobeatapurado/';
  event.waitUntil((async()=>{
    const all=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of all){if('focus' in client){await client.focus(); if('navigate' in client) await client.navigate(url); return;}}
    if(clients.openWindow) return clients.openWindow(url);
  })());
});
