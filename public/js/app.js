const PETS_SEED = [
  { id: 1, name: "Firulais", age: "2 años", type: "Perro", breed: "Mestizo", sex: "Macho", desc: "Juguetón, sociable y le encanta correr en el parque. Ya está vacunado y esterilizado.", status: "En proceso" },
  { id: 2, name: "Michi", age: "1 año", type: "Gato", breed: "Común europeo", sex: "Hembra", desc: "Tranquila y cariñosa, ideal para apartamentos. Le gusta dormir al sol.", status: "Adoptada" },
  { id: 3, name: "Rocky", age: "3 años", type: "Perro", breed: "Pastor mestizo", sex: "Macho", desc: "Muy leal y protector. Necesita un hogar con espacio para jugar.", status: "Disponible" },
  { id: 4, name: "Luna", age: "6 meses", type: "Gato", breed: "Siamés mestizo", sex: "Hembra", desc: "Cachorra muy curiosa y llena de energía.", status: "Disponible" },
  { id: 5, name: "Toby", age: "4 años", type: "Perro", breed: "Poodle", sex: "Macho", desc: "Tranquilo, ya entrenado y perfecto para familias con niños.", status: "Disponible" },
  { id: 6, name: "Nina", age: "2 años", type: "Gato", breed: "Persa mestiza", sex: "Hembra", desc: "Independiente pero cariñosa cuando toma confianza.", status: "Disponible" },
];

const STORAGE_KEYS = {
  pets: "pc_pets",
  requests: "pc_requests",
  notifications: "pc_notifications",
  seeded: "pc_seeded",
};

function seedIfNeeded() {
  if (!localStorage.getItem(STORAGE_KEYS.seeded)) {
    localStorage.setItem(STORAGE_KEYS.pets, JSON.stringify(PETS_SEED));
    localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify([
      { id: 101, petId: 1, userId: 2, phone: "8888-1234", address: "Managua, Nicaragua", reason: "Tengo patio grande y experiencia con perros.", status: "En revisión", date: "2026-08-20" },
      { id: 102, petId: 2, userId: 2, phone: "8888-1234", address: "Managua, Nicaragua", reason: "Vivo sola y quiero compañía.", status: "Aprobada", date: "2026-08-15" },
      { id: 103, petId: 3, userId: 2, phone: "8888-1234", address: "Managua, Nicaragua", reason: "Ya tuve un perro similar antes.", status: "Rechazada", date: "2026-08-10" },
    ]));
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify([
      { id: 1, userId: 2, text: "Tu solicitud para Firulais está en revisión", date: "Hace 2 horas" },
      { id: 2, userId: 2, text: "¡Tu solicitud para Michi fue aprobada!", date: "Ayer" },
      { id: 3, userId: 2, text: "Nueva mascota disponible: Nina", date: "Hace 2 días" },
    ]));
    localStorage.setItem(STORAGE_KEYS.seeded, "true");
  }
}
seedIfNeeded();

const db = {
  getPets: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.pets) || "[]"),
  savePets: (p) => localStorage.setItem(STORAGE_KEYS.pets, JSON.stringify(p)),
  getRequests: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.requests) || "[]"),
  saveRequests: (r) => localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(r)),
  getNotifications: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || "[]"),
  saveNotifications: (n) => localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(n)),
};

function petIcon(type) {
  if (type === "Perro") return "🐶";
  if (type === "Gato") return "🐱";
  return "🐾";
}
