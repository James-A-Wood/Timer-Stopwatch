
const version = 'v19';
const RUNTIME = 'runtime';


const log = console.log;


const cacheTheseUrls = [
    './',
    'sounds/alarm.mp3',
    'sounds/tick.mp3',
    "images/icon_64.png",
    "images/icon_128.png",
    "images/icon_192.png",
    "images/icon_256.png",
    "images/icon_512.png",
    "images/icon_master.png",
    "images/apple_touch_icon.png",
    "js/timer.js",
    "js/libraries/howler.js",
    "js/libraries/jquery.js",
    "js/modules/Display.js",
    "js/modules/fitInParent.js",
    "js/modules/Sounds.js",
    "js/modules/Ticker.js",
    "css/styles.css",
];


// The install handler takes care of precaching the resources we need universally
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(version)
            .then(cache => cache.addAll(cacheTheseUrls))
            .then(self.skipWaiting())
    );
});


// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
    const currentCaches = [version, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !version.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => caches.delete(cacheToDelete)));
        }).then(() => self.clients.claim())
    );
});


// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
    // Skip cross-origin requests, like those for Google Analytics.
    if (!event.request.url.startsWith(self.location.origin)) return false;
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            return caches.open(RUNTIME).then(cache => {
                return fetch(event.request).then(response => {
                    // Put a copy of the response in the runtime cache.
                    return cache.put(event.request, response.clone()).then(() => response);
                });
            });
        })
    );
});


