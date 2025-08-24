-- Author: Heiler Nova

drop schema public cascade;
create schema public;
create extension pgcrypto;
create extension unaccent;

create domain cellphone as varchar check (value ~* '^\+\d+ \d{3} \d{3} \d{4}$');
create domain email as varchar(100) check (value ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$');
create domain hex_short_id as char(8) check (value ~* '[0-9a-fA-F]{8}');

create type device as enum('mobile', 'desktop', 'tablet');
create type taxpayer_type as enum('natural', 'legal');
create type sex as enum('M', 'F');

-------------------------------------------------------------------------------------------------------------------------
-- Funciones globales

-- Función para generar un ID de 8 caracteres hexadecimal aleatorio
create function gen_random_hex_short_id()
returns hex_short_id language plpgsql as $$
begin
return encode(gen_random_bytes(4), 'hex');
end;$$;

-------------------------------------------------------------------------------------------------------------------------
-- Tables
-------------------------------------------------------------------------------------------------------------------------

--  Tabla de usuarios
create type user_role as enum('admin', 'collaborator', 'customer');
create type user_status as enum('active', 'lock');

create table users
(
  "id" uuid primary key default gen_random_uuid(),                --> ID del usuario
  "created_at" timestamp not null default now(),                  --> Fecha de creación del usuario
  "updated_at" timestamp not null default now(),                  --> Fecha de actualización
  "role" user_role not null default 'collaborator',               --> Rol del usuario
  "is_accountant" boolean not null default false,                 --> Si es contador publico
  "status" user_status not null default 'active',                 --> Estado del usuario
  "username" varchar(20) not null unique,                         --> Nombre de usuario
  "email" varchar(100) not null unique,                           --> Correo electrónico
  "name" varchar(20) not null,                                    --> Nombre
  "last_name" varchar(20) not null,                               --> Apellido
  "sex" sex,                                                      --> Sexo del Usuario
  "cellphone" cellphone,                                          --> Teléfono celular
  "pin" text,                                                     --> PIN de acceso
  "password" text not null,                                       --> Contraseña
  "jwt_secret_key" uuid not null default gen_random_uuid(),       --> Clave secreta para JWT
  "permissions" text[] not null default array[]::text[]           --> Permisos
);
comment on table users is 'Tabla de usuarios del sistema';

-- Tablas de los datos de sistema

--  Responsabilidades fiscales
create table data_tax_responsibilities
(
  "code" int not null,                                             --> ID de la responsabilidad
  "name" varchar(500) not null,                                    --> Nombre
  "description" text                                               --> Descripción
);

-- Cuentas del PUC
create table data_puc
(
  "code" varchar(10) primary key,                                  --> Código del PUC
  "name" varchar(200) not null                                     --> Nombre de la cuenta
);

create table data_ciiu_sections
(
  "code" char(1) primary key,
  "name" varchar(500) not null
);

create table data_ciiu_divisions
(
  "code" char(2) primary key,
  "section" char(1),
  "name" varchar(500)
);

create table data_ciiu_groups
(
  "code" char(3) primary key,
  "name" varchar(500)
);

create table data_ciiu_codes
(
  "code" char(4) primary key,
  "name" varchar(500)
);

-- Registro de las UVTs
create table data_uvt (
  "year" char(4) primary key,
  "value" numeric(15, 2)
);

create table data_unspsc_segments
(
  "code" char(2) primary key,
  "name" varchar(200)
);
create table data_unspsc_families
(
  "code" char(4) primary key,
  "segment" char(2),
  "name" varchar(200)
);

create table data_unspsc_classes
(
  "code" char(6) primary key,
  "family" char(4),
  "name" varchar(200)
);

-- Código de producto o servicios
create table data_unspsc
(
  "code" char(8) primary key,
  "class" char(6),
  "name" varchar(200)
);

create table data_identification_documents 
(
  "code" char(2) primary key,
  "name" varchar(100) not null,
  "short_name" varchar(5)
);

create table data_location_departments
(
  "code" char(2) primary key,
  "name" varchar(100)
);

create table data_location_cities
(
  "code" char(5) primary key,
  "department_code" char(2),
  "name" varchar(100)
);

create table data_taxes 
(
  "code" char(2) primary key,
  "name" varchar(100) not null,
  "description" text
);

---------------------------------------------------------------------------------------------------------------------------
-- Empresas PYM's

create type company_status as enum('enable', 'disable');
create table companies
(
  "id" uuid primary key default gen_random_uuid(),                                        --> ID del producto
  "created_at" timestamp not null default now(),                                          --> Fecha de creación
  "updated_at" timestamp not null default now(),                                          --> Fecha de actualización
  "taxpayer_type" taxpayer_type not null,                                                 --> Tipo de contribuyente
  "status" company_status not null default 'disable',                                     --> Estado
  "nit" varchar(15) not null,                                                             --> NIT
  "dv" char(1) not null,                                                                  --> Dígito de verificación
  "account_name" varchar(100) not null,                                                   --> Nombre de la compañía
  "name" varchar(20),                                                                     --> Nombre
  "last_name" varchar(20),                                                                --> Apellido
  "company_name" varchar(100),                                                            --> Razón social
  "trade_name" varchar(100),                                                              --> Nombre comercial
  "email" email not null,                                                                 --> Correo electrónico
  "cellphone" cellphone not null,                                                         --> Teléfono
  "department" char(2) not null,                                                          --> Departamento
  "city" char(5) not null,                                                                --> Ciudad
  "address" varchar(100) not null,                                                        --> Dirección
  "economic_activities" char(4)[] not null default array[]::char(4)[],                    --> Actividades económicas
  "responsibilities" int[] not null default array[]::int[],                               --> Responsabilidades fiscales
  "legal_representative" uuid references companies("id"),                                 --> Representante legal
  "contacts" jsonb[] not null default array[]::jsonb[],                                   --> Lista de contactos
  "access_credentials" jsonb[] not null default array[]::jsonb[]                          --> Lista de los accesos, ejemplo: usuario y contraseña de la DIAN
);


create table companies_collaborators
(
  "main" boolean not null default false,                                                  --> ¿Es el colaborador principal?
  "company_id" uuid not null references companies("id"),                                  --> ID de la empresa
  "user_id" uuid not null references users("id"),                                         --> ID del usuario
  "permissions" text[] not null default array[]::text[],                                  --> Permisos del colaborador
  unique (company_id, user_id)
);