const db = new Promise((resolve,reject)=>{const r=indexedDB.open('proxemica',1);r.onupgradeneeded=()=>r.result.createObjectStore('samples',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
async function transaction(mode,action){const d=await db;return new Promise((resolve,reject)=>{const t=d.transaction('samples',mode),r=action(t.objectStore('samples'));t.oncomplete=()=>resolve(r.result);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error)})}
export const all=()=>transaction('readonly',s=>s.getAll());
export const put=value=>transaction('readwrite',s=>s.put(value));
export const remove=id=>transaction('readwrite',s=>s.delete(id));
export const defaults=()=>({volume:-12,pan:0,rate:1,filter:12000,reverb:.22,delay:.08,fade:.15,loop:true});
