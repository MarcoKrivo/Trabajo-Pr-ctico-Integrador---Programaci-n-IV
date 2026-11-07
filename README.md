# Food Store — Trabajo Práctico Integrador de Programación IV

Aplicación web para la gestión de catálogo de productos, usuarios y pedidos, desarrollada como Trabajo Práctico Integrador de la asignatura Programación IV.

El sistema permite a los clientes consultar productos, gestionar un carrito y realizar pedidos. Además, cuenta con un panel administrativo para gestionar categorías, productos, stock, pedidos y usuarios.

## Tecnologías utilizadas

**Backend**
- Python 3.11, 3.12 o 3.13.
- FastAPI.
- SQLModel.
- PostgreSQL.
- Autenticación mediante JWT en cookie HttpOnly.
- Bcrypt para el manejo seguro de contraseñas.

**Frontend**
- React 19.
- TypeScript.
- Vite.
- Tailwind CSS.
- TanStack Query.
- TanStack Form.
- TanStack Table.
- Zustand.
- Axios.
- React Router.

## Requisitos previos

Antes de ejecutar el proyecto, es necesario contar con:

- Python 3.11 o superior.
- PostgreSQL 15 o superior.
- Node.js 20.19 o superior.
- pnpm 9 o superior.

## Configuración de la base de datos

1. Crear una base de datos PostgreSQL llamada `foodstore_db`.
2. Iniciar PostgreSQL.
3. Configurar las credenciales de conexión en `backend/.env`, tomando como referencia el archivo `backend/.env.example`.

## Instalación y ejecución del backend

Abrir una terminal en la carpeta raíz del proyecto y ejecutar:

```powershell
cd backend

python -m venv .venv

.venv\Scripts\Activate.ps1

pip install -r requirements.txt

Copy-Item .env.example .env
```

Editar el archivo `.env` y configurar las siguientes variables:

- `DATABASE_URL`
- `SECRET_KEY`
- `FRONTEND_ORIGIN`

Una vez configurado el entorno, ejecutar:

```powershell
python -m app.db.seed

uvicorn app.main:app --reload
```

El backend estará disponible en:

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Usuario administrador de demostración:**

- Usuario: `admin`
- Contraseña: `Admin1234!`

Estas credenciales son exclusivamente para el entorno de demostración y desarrollo local.

## Instalación y ejecución del frontend

Abrir una segunda terminal desde la carpeta raíz del proyecto:

```powershell
cd frontend

pnpm install

Copy-Item .env.example .env
```

Verificar que la variable `VITE_API_URL` apunte a:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Para compilar el proyecto:

```powershell
pnpm build
```

Para iniciar el servidor de desarrollo:

```powershell
pnpm dev
```

El frontend estará disponible en:

http://localhost:5173

## Funcionalidades principales

### Clientes
- Registro e inicio de sesión.
- Consulta del catálogo de productos.
- Búsqueda y filtrado por categorías.
- Carrito de compras persistente.
- Confirmación y creación de pedidos.
- Consulta del historial de pedidos.
- Cancelación de pedidos pendientes.

### Administradores
- Panel de resumen del negocio.
- Alta, edición y baja lógica de categorías.
- Alta, edición y baja lógica de productos.
- Gestión de precios, stock y disponibilidad.
- Consulta y gestión de pedidos.
- Cambio de estados de pedidos.
- Activación y desactivación de usuarios.

### Seguridad y reglas de negocio
- Autenticación mediante JWT en cookies HttpOnly.
- Roles diferenciados: `user` y `admin`.
- Control de acceso a funcionalidades administrativas.
- Validación de stock y disponibilidad.
- Descuento y restitución de stock según las operaciones de pedidos.
- Validación de transiciones de estados.
- Protección de los pedidos de cada usuario.

## Documentación de la API

La API utiliza el prefijo `/api/v1`.

La documentación interactiva se encuentra disponible mediante Swagger UI y ReDoc una vez iniciado el backend.

## Entrega del trabajo

El proyecto se entregará mediante un repositorio público de GitHub.

El archivo ZIP de entrega no debe incluir:

- Archivos `.env`.
- Entornos virtuales (`.venv`).
- Dependencias instaladas (`node_modules`).

También se debe incluir el video de demostración de entre 10 y 15 minutos solicitado en la consigna.

**Repositorio GitHub:** [Agregar URL del repositorio]

**Video de demostración:** [Agregar URL del video]

## Alcance del proyecto

El sistema implementa autenticación, gestión de usuarios, catálogo de productos, carrito de compras, gestión de pedidos, control de stock, máquina de estados, panel administrativo, documentación OpenAPI y carga inicial de datos mediante un proceso de seed idempotente.

Proyecto desarrollado en el marco del Trabajo Práctico Integrador de Programación IV.