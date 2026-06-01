# 🥐 Quita Penas — Registro de Ventas

Aplicación web para registrar y gestionar las ventas diarias de la panadería y
pastelería **Quita Penas**. Funciona en celular y en computadora, con los datos
**guardados en la nube y sincronizados en tiempo real** entre todos los dispositivos.

## Características

- **Registro de ventas**: producto, cantidad, precio, método de pago y fecha/hora.
- **Productos editables**: agregar, editar precio y borrar productos desde la app.
- **Precio automático** al elegir el producto (editable en cada venta).
- **Resumen del día**: total, efectivo, Mercado Pago, producto más vendido y nº de transacciones.
- **Gráfico de ventas del mes**: barras por día con total mensual y mejor día.
- **Historial** por fecha y exportación a **CSV** y **PDF**.
- **Base de datos compartida en la nube** (Supabase) con sincronización en tiempo real.
- Navegación por secciones (Ventas / Productos / Resumen).
- Diseño **mobile-first**, responsive y accesible.

## Tecnología

- React 18 + Vite
- CSS puro (sin frameworks)
- Supabase (PostgreSQL + Realtime) como base de datos
- jsPDF para exportación a PDF

## 1) Configurar la base de datos (Supabase)

1. Creá una cuenta gratis en [supabase.com](https://supabase.com) y un **proyecto nuevo**.
2. En el menú **SQL Editor** → **New query**, pegá el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y apretá **Run**.
   Esto crea las tablas, los permisos, el tiempo real y carga los productos iniciales.
3. En **Project Settings → API** copiá:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon public key**

## 2) Conectar la app (variables de entorno)

Creá un archivo `.env.local` en la raíz (podés copiar `.env.example`) con:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

> Si la app abre con la pantalla "Falta conectar la base de datos", es que faltan
> estas variables o el servidor no se reinició.

## 3) Uso local

```bash
npm install
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # genera la versión de producción en /dist
npm run preview  # previsualiza el build
```

## 4) Desplegar en Vercel

1. Subí esta carpeta a un repositorio de GitHub.
2. En Vercel → **Import Project** → seleccioná el repo (detecta Vite solo:
   build `npm run build`, output `dist`).
3. En **Project Settings → Environment Variables** cargá las **mismas dos variables**
   (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).
4. Deploy. Vas a tener una URL pública (ej. `quita-penas.vercel.app`) que podés
   abrir desde cualquier dispositivo, e incluso "agregar a la pantalla de inicio"
   del celular para usarla como una app.

## Estructura

```
src/
  components/   Sidebar, SaleForm, DaySummary, SalesTable, MonthlyChart,
                History, ProductManager, Toast, ConfirmDialog, SetupNotice
  hooks/        useCollection (carga + realtime de Supabase)
  lib/          supabase (cliente)
  utils/        format, csv, pdf, resumen
  styles/       index.css
  App.jsx       integra todo y maneja el estado
  main.jsx      punto de entrada
supabase/
  schema.sql    script para crear la base de datos
```

## Nota de seguridad

El esquema deja la base con **acceso público** mediante la `anon key` (lectura y
escritura). Es suficiente para uso interno de la panadería. Si más adelante querés
restringir el acceso, se puede agregar **login** con Supabase Auth y políticas RLS
por usuario.
