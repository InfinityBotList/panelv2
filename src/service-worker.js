importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const t = 'infinitypanel',
	s = 'offline';

self.addEventListener('message', (e) => {
	e.data && e.data.type === 'SKIP_WAITING' && self.skipWaiting();
});

self.addEventListener('install', async (e) => {
	e.waitUntil(caches.open(t).then((a) => a.add(s)));
});

workbox.navigationPreload.isSupported() && workbox.navigationPreload.enable();

self.addEventListener('fetch', (e) => {
	e.request.mode === 'navigate' &&
		e.respondWith(
			(async () => {
				try {
					const a = await e.preloadResponse;
					return a || (await fetch(e.request));
				} catch {
					return await (await caches.open(t)).match(s);
				}
			})()
		);
});
