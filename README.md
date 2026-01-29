
---

#  Proyecto Fullstack – Visualización de Datos

Este proyecto está compuesto por un **backend** y un **frontend** que deben ejecutarse de manera simultánea para poder visualizar correctamente los datos.
A continuación se detallan los pasos necesarios para que cualquier persona pueda levantar el proyecto sin problemas.

---

## Estructura del Proyecto

```
/
├── back/      # Servidor Backend (API)
└── front/     # Aplicación Frontend
```

---

## Configuración Inicial

### Instalación de Dependencias

Es necesario instalar las dependencias **en ambas carpetas** (`/back` y `/front`).

Desde la raíz del proyecto:

```bash
cd back
npm install
```

Luego:

```bash
cd ../front
npm install
```

---

### Variables de Entorno (Back)

Dentro de la carpeta `/back`, debe existir un archivo `.env`.

Por el momento, este archivo solo se utiliza para definir el **puerto del servidor, el URL y KEY de Supabase**, por ejemplo:

```
PORT=3000
SUPABASE_URL= ...
SUPABASE_KEY= ...
```

### Variables de Entorno (Front)

Dentro de la carpeta `/front`, debe existir un archivo `.env`.

Por el momento, este archivo solo se utiliza para definir el **el URL y KEY de Supabase**, por ejemplo:

```
VITE_SUPABASE_URL= ...
VITE_SUPABASE_KEY= ...
```

**SUPABASE_URL** se encuentra en Setting/Data API como URL. 
**SUPABASE_KEY** se encuentra Setting/API Keys/Legacy anon, service_role API keys como Service Role.

---

## Ejecución del Proyecto

Para que la aplicación funcione correctamente, se deben abrir **dos terminales al mismo tiempo**.

---

### Terminal 1 – Backend

```bash
cd back
npm run dev
```

 Verifica que en consola aparezca un mensaje similar a:

```
Servidor iniciado en el puerto 3000
```

---

### Terminal 2 – Frontend

```bash
cd front
npm run dev
```

Vite mostrará una URL en la terminal.
Generalmente será:

```
http://localhost:5173
```

Abre esa dirección en el navegador.

---

## Puntos Críticos de Verificación

Si **los datos no se visualizan correctamente**, revisa los siguientes puntos:

---

### 1. Ruta del Script en el Frontend

En el archivo:

```
front/index.html
```

La ruta del script debe ser **exactamente**:

```html
<script type="module" src="/src/main.tsx"></script>
```

Cualquier variación puede provocar que la aplicación no cargue correctamente.

---

### 2. Prefijo de las Rutas en el Backend

En el archivo:

```
back/src/app.js
```

El prefijo de las rutas debe coincidir con el `fetch` utilizado en el frontend.

Actualmente, el frontend espera rutas con el prefijo:

```
/api/rooms
```

Asegúrate de que el backend esté configurado con ese mismo prefijo.

---

### 3. Configuración de CORS

El backend debe permitir la comunicación con el frontend.

Verifica que **antes de definir las rutas**, exista la siguiente configuración en `app.js`:

```js
app.use(cors());
```

Esto es fundamental para evitar errores de conexión entre ambos servidores.

---

## Resultado Esperado

Si todos los pasos se siguieron correctamente:

* El backend estará corriendo en el puerto **3000**
* El frontend se abrirá en **[http://localhost:5173](http://localhost:5173)**
* Los datos deberían visualizarse sin errores en la aplicación