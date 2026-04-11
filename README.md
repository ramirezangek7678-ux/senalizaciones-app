# SeñalPro – Sistema de Citas
### Proyecto Universitario | React + Node.js + MongoDB

---

## 📁 Estructura del Proyecto

```
senalizaciones-app/
├── backend/                  # API REST con Node.js + Express
│   ├── models/
│   │   ├── Usuario.js        # Modelo de usuarios (clientes y admins)
│   │   ├── Servicio.js       # Modelo de servicios del catálogo
│   │   └── Cita.js           # Modelo de citas agendadas
│   ├── routes/
│   │   ├── auth.js           # Login y registro
│   │   ├── citas.js          # CRUD de citas (cliente)
│   │   ├── servicios.js      # Catálogo de servicios
│   │   └── admin.js          # Rutas de administrador
│   ├── middleware/
│   │   └── auth.js           # JWT + verificación de rol
│   ├── .env.example          # Variables de entorno
│   ├── package.json
│   └── server.js             # Punto de entrada del servidor
│
└── frontend/                 # SPA con React
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js    # Estado global de autenticación
        ├── services/
        │   └── api.js            # Llamadas a la API con Axios
        ├── components/
        │   └── Navbar.js         # Barra de navegación
        ├── pages/
        │   ├── Home.js           # Página principal
        │   ├── Login.js          # Inicio de sesión
        │   ├── Registro.js       # Registro de clientes
        │   ├── Servicios.js      # Catálogo de servicios
        │   ├── Agendar.js        # Formulario paso a paso
        │   ├── MisCitas.js       # Citas del cliente
        │   ├── AdminDashboard.js # Panel con estadísticas
        │   ├── AdminCitas.js     # Gestión de citas (admin)
        │   ├── AdminServicios.js # Gestión del catálogo (admin)
        │   └── AdminClientes.js  # Directorio de clientes
        ├── index.css             # Estilos globales
        ├── App.js                # Rutas y configuración
        └── index.js              # Punto de entrada React
```

---

## 🚀 Instalación y Ejecución

### Pre-requisitos
- Node.js v18+
- MongoDB (local o Atlas)
- npm

### 1. Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tu cadena de MongoDB y JWT secret
npm run dev
# Servidor en: http://localhost:5000
```

### 2. Configurar Frontend

```bash
cd frontend
npm install
npm start
# App en: http://localhost:3000
```

---

## 🔗 Endpoints de la API

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | /api/auth/registro | Público | Registrar cliente |
| POST | /api/auth/login | Público | Iniciar sesión |
| GET | /api/auth/me | Auth | Perfil del usuario |
| GET | /api/servicios | Público | Listar servicios activos |
| POST | /api/servicios | Admin | Crear servicio |
| PUT | /api/servicios/:id | Admin | Actualizar servicio |
| GET | /api/citas | Cliente | Mis citas |
| POST | /api/citas | Cliente | Agendar cita |
| PUT | /api/citas/:id/cancelar | Cliente | Cancelar cita |
| GET | /api/citas/disponibilidad | Cliente | Horarios disponibles |
| GET | /api/admin/dashboard | Admin | Estadísticas |
| GET | /api/admin/citas | Admin | Todas las citas |
| PUT | /api/admin/citas/:id | Admin | Actualizar estado |
| GET | /api/admin/clientes | Admin | Lista de clientes |

---

## 🗄️ Modelos de Base de Datos

### Usuario
```
nombre, email, password (hash), telefono, empresa, rol (cliente/admin), activo
```

### Servicio
```
nombre, descripcion, duracionMinutos, precio, categoria, activo
```

### Cita
```
cliente (ref), servicio (ref), fecha, hora, estado, notas, notasAdmin, direccion
```

---

## 👤 Roles del Sistema

| Rol | Acceso |
|-----|--------|
| **Cliente** | Registro, login, ver catálogo, agendar/cancelar citas, ver historial |
| **Admin** | Todo lo anterior + gestionar citas, servicios y ver clientes |

Para crear un admin, cambia manualmente el campo `rol` en MongoDB:
```js
db.usuarios.updateOne({ email: "admin@empresa.com" }, { $set: { rol: "admin" } })
```

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express 4 |
| Base de datos | MongoDB, Mongoose |
| Autenticación | JWT (jsonwebtoken), bcryptjs |
| UI | CSS personalizado, Google Fonts (Barlow) |
| Notificaciones | react-hot-toast |

---

## 🎓 Información del Proyecto

- **Materia:** Desarrollo Web / Programación Web
- **Tecnologías:** MERN Stack (MongoDB, Express, React, Node.js)
- **Patrón:** MVC en backend, SPA en frontend
- **Autenticación:** JWT con roles (cliente / administrador)
