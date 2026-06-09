const CACHE = "amanzi-alert-v3";
const APP_SHELL = ["/", "/map", "/report", "/stats", "/mine", "/about", "/manifest.webmanifest"];
const QUEUE_STORE = "offline-reports";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method === "POST" && url.hostname.includes("supabase")) {
    event.respondWith(handleSupabasePost(req));
    return;
  }

  if (req.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      try {
        const network = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, network.clone()).catch(() => {});
        return network;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") {
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        return new Response("Offline", { status: 503 });
      }
    })()
  );
});

async function handleSupabasePost(req) {
  try {
    const res = await fetch(req.clone());
    return res;
  } catch {
    const body = await req.text();
    const entry = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      body,
      timestamp: Date.now(),
    };
    await saveToQueue(entry);
    notifyClients({ type: "QUEUED_OFFLINE", id: entry.id });
    return new Response(JSON.stringify({ offline_queued: true }), {
      status: 202,
      headers: { "Content-Type": "application/json" },
    });
  }
}

self.addEventListener("message", (event) => {
  if (event.data === "FLUSH_QUEUE") {
    flushQueue();
  }
  if (event.data === "GET_QUEUE_COUNT") {
    getQueueCount().then((count) => {
      notifyClients({ type: "QUEUE_COUNT", count });
    });
  }
});

async function flushQueue() {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, "readonly");
  const store = tx.objectStore(QUEUE_STORE);
  const entries = await idbGetAll(store);
  tx.oncomplete = () => db.close();

  let flushed = 0;
  for (const entry of entries) {
    try {
      const res = await fetch(entry.url, {
        method: "POST",
        headers: entry.headers,
        body: entry.body,
      });
      if (res.ok || res.status === 201 || res.status === 409) {
        await removeFromQueue(entry.id);
        flushed++;
      }
    } catch {
      break;
    }
  }
  if (flushed > 0) {
    notifyClients({ type: "QUEUE_FLUSHED", flushed });
  }
}

function notifyClients(msg) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((c) => c.postMessage(msg));
  });
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("amanzi-sw", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToQueue(entry) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    tx.objectStore(QUEUE_STORE).put(entry);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function removeFromQueue(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    tx.objectStore(QUEUE_STORE).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function getQueueCount() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readonly");
    const req = tx.objectStore(QUEUE_STORE).count();
    req.onsuccess = () => { db.close(); resolve(req.result); };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

function idbGetAll(store) {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
