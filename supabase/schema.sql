-- ============================================================
-- Quita Penas — Esquema de base de datos (Supabase / PostgreSQL)
--
-- Cómo usarlo:
-- 1. Entrá a tu proyecto en https://supabase.com
-- 2. Menú lateral → "SQL Editor" → "New query"
-- 3. Pegá TODO este archivo y apretá "Run".
-- Esto crea las tablas, los permisos, el tiempo real y carga los productos.
-- ============================================================

-- ---------- Tabla de productos ----------
create table if not exists productos (
  id        uuid primary key default gen_random_uuid(),
  nombre    text not null,
  precio    numeric not null default 0,
  creado_en timestamptz not null default now()
);

-- ---------- Tabla de ventas ----------
-- Cada fila es un producto vendido. Las filas con el mismo "ticket"
-- pertenecen al mismo cliente (una compra puede llevar varios productos).
create table if not exists ventas (
  id        uuid primary key default gen_random_uuid(),
  ticket    uuid,
  producto  text not null,
  cantidad  numeric not null,
  precio    numeric not null,
  total     numeric not null,
  metodo    text not null,
  fecha     timestamptz not null default now(),
  creado_en timestamptz not null default now()
);

-- Si la tabla ya existía de una versión anterior, agrega la columna "ticket".
alter table ventas add column if not exists ticket uuid;

-- ---------- Seguridad (Row Level Security) ----------
-- Se habilita RLS y se permite acceso con la clave pública (anon key).
-- NOTA: con esto, cualquiera que tenga la URL y la anon key puede leer/escribir.
-- Para una panadería es suficiente; más adelante se puede agregar login.
alter table productos enable row level security;
alter table ventas    enable row level security;

drop policy if exists "acceso publico productos" on productos;
drop policy if exists "acceso publico ventas" on ventas;

create policy "acceso publico productos" on productos
  for all using (true) with check (true);
create policy "acceso publico ventas" on ventas
  for all using (true) with check (true);

-- ---------- Tiempo real (sincronización entre dispositivos) ----------
alter publication supabase_realtime add table productos;
alter publication supabase_realtime add table ventas;

-- ---------- Productos iniciales (solo si la tabla está vacía) ----------
insert into productos (nombre, precio)
select * from (values
  ('Facturas',    800),
  ('Chipa',       500),
  ('Bizcochitos', 600),
  ('Cookies',    1200),
  ('Budín',      3500)
) as nuevos(nombre, precio)
where not exists (select 1 from productos);
