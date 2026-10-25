// ---------- Datos iniciales (simulan la base de datos MongoDB) ----------
const PETS_SEED = [
  { id: 1, name: "Firulais", age: "2 años", type: "Perro", breed: "Mestizo", sex: "Macho", desc: "Juguetón, sociable y le encanta correr en el parque. Ya está vacunado y esterilizado.", status: "En proceso" },
  { id: 2, name: "Michi", age: "1 año", type: "Gato", breed: "Común europeo", sex: "Hembra", desc: "Tranquila y cariñosa, ideal para apartamentos. Le gusta dormir al sol.", status: "Adoptada" },
  { id: 3, name: "Rocky", age: "3 años", type: "Perro", breed: "Pastor mestizo", sex: "Macho", desc: "Muy leal y protector. Necesita un hogar con espacio para jugar.", status: "Disponible" },
  { id: 4, name: "Luna", age: "6 meses", type: "Gato", breed: "Siamés mestizo", sex: "Hembra", desc: "Cachorra muy curiosa y llena de energía.", status: "Disponible" },
  { id: 5, name: "Toby", age: "4 años", type: "Perro", breed: "Poodle", sex: "Macho", desc: "Tranquilo, ya entrenado y perfecto para familias con niños.", status: "Disponible" },
  { id: 6, name: "Nina", age: "2 años", type: "Gato", breed: "Persa mestiza", sex: "Hembra", desc: "Independiente pero cariñosa cuando toma confianza.", status: "Disponible" },
];

const STORAGE_KEYS = {
  users: "pc_users",
  session: "pc_session",
  pets: "pc_pets",
  requests: "pc_requests",
  notifications: "pc_notifications",
  seeded: "pc_seeded",
};

function seedIfNeeded() {
  if (!localStorage.getItem(STORAGE_KEYS.seeded)) {
    localStorage.setItem(STORAGE_KEYS.pets, JSON.stringify(PETS_SEED));
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([
      { id: 1, name: "Administrador Refugio", email: "admin@patitas.com", password: "admin123", role: "admin" },
      { id: 2, name: "Juan Pérez", email: "juan@correo.com", password: "123456", role: "adoptante" },
    ]));
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

// ---------- Helpers de datos ----------
const db = {
  getUsers: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || "[]"),
  saveUsers: (u) => localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(u)),
  getPets: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.pets) || "[]"),
  savePets: (p) => localStorage.setItem(STORAGE_KEYS.pets, JSON.stringify(p)),
  getRequests: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.requests) || "[]"),
  saveRequests: (r) => localStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(r)),
  getNotifications: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || "[]"),
  saveNotifications: (n) => localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(n)),
};

// ---------- Sesión ----------
const session = {
  get: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null"),
  set: (user) => localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user)),
  clear: () => localStorage.removeItem(STORAGE_KEYS.session),
};

function requireAuth(role) {
  const s = session.get();
  if (!s) { window.location.href = "login.html"; return null; }
  if (role && s.role !== role) { window.location.href = "catalogo.html"; return null; }
  return s;
}

function logout() {
  session.clear();
  window.location.href = "login.html";
}

function renderTopbar(active) {
  const s = session.get();
  const el = document.getElementById("topbar");
  if (!el) return;
  let links = "";
  if (s) {
    links += `<a href="catalogo.html" class="${active==='catalogo'?'active':''}">Mascotas</a>`;
    links += `<a href="mis-solicitudes.html" class="${active==='solicitudes'?'active':''}">Mis Solicitudes</a>`;
    links += `<a href="notificaciones.html" class="${active==='notificaciones'?'active':''}">Notificaciones</a>`;
    if (s.role === "admin") {
      links += `<a href="admin.html" class="${active==='admin'?'active':''}">Panel Admin</a>`;
    }
    links += `<a href="#" onclick="logout(); return false;">Salir (${s.name.split(" ")[0]})</a>`;
  } else {
    links += `<a href="catalogo-publico.html">Mascotas</a>`;
    links += `<a href="login.html">Iniciar sesión</a>`;
    links += `<a href="registro.html">Registrarse</a>`;
  }
  el.innerHTML = `
    <a class="brand" href="${s ? (s.role==='admin'?'admin.html':'catalogo.html') : 'index.html'}"><span class="paw">🐾</span> Patitas Conectadas</a>
    <nav>${links}</nav>
  `;
}

function initial(name) { return (name || "?").trim().charAt(0).toUpperCase(); }

function petIcon(type) {
  if (type === "Perro") return "🐶";
  if (type === "Gato") return "🐱";
  return "🐾";
}
