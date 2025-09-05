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
comment on column users.id is 'ID del usuario';
comment on column users.created_at is 'Fecha de creación del usuario';
comment on column users.updated_at is 'Fecha de actualización';
comment on column users.role is 'Rol del usuario (admin, collaborator, customer)';
comment on column users.is_accountant is 'Si es contador publico';
comment on column users.status is 'Estado del usuario (active, lock)';
comment on column users.username is 'Nombre de usuario único, sin espacios ni caracteres especiales';
comment on column users.email is 'Correo electrónico máximo 100 caracteres';
comment on column users.name is 'Nombre, máximo 20 caracteres';
comment on column users.last_name is 'Apellido, máximo 20 caracteres';
comment on column users.sex is 'Sexo del Usuario (M, F)';
comment on column users.cellphone is 'Teléfono celular';
comment on column users.pin is 'PIN de acceso';
comment on column users.password is 'Contraseña guardado en forma segura';
comment on column users.jwt_secret_key is 'Clave secreta para JWT';
comment on column users.permissions is 'Permisos, array de texto';

-- Tablas de los datos de sistema

--  Responsabilidades fiscales
create table data_tax_responsibilities
(
  "code" int not null,                                             --> ID de la responsabilidad
  "name" varchar(500) not null,                                    --> Nombre
  "description" text                                               --> Descripción
);
comment on table data_tax_responsibilities is 'Responsabilidades fiscales según la DIAN';
comment on column data_tax_responsibilities.code is 'ID de la responsabilidad';
comment on column data_tax_responsibilities.name is 'Nombre de la responsabilidad';
comment on column data_tax_responsibilities.description is 'Descripción de la responsabilidad';

-- Cuentas del PUC
create table data_puc
(
  "code" varchar(10) primary key,                                  --> Código del PUC
  "name" varchar(200) not null                                     --> Nombre de la cuenta
);
comment on table data_puc is 'Plan Único de Cuentas para Colombia';
comment on column data_puc.code is 'Código del PUC';
comment on column data_puc.name is 'Nombre de la cuenta';

create table data_ciiu_sections
(
  "code" char(1) primary key,
  "description" varchar(500) not null
);
comment on table data_ciiu_sections is 'Secciones de la CIIU';
comment on column data_ciiu_sections.code is 'Código de la sección';
comment on column data_ciiu_sections.description is 'Nombre de la sección';

create table data_ciiu_divisions
(
  "code" char(2) primary key,
  "section_code" char(1) not null references data_ciiu_sections(code),
  "description" varchar(500)
);
comment on table data_ciiu_divisions is 'Divisiones de la CIIU';
comment on column data_ciiu_divisions.code is 'Código de la división';
comment on column data_ciiu_divisions.section_code is 'Sección a la que pertenece';
comment on column data_ciiu_divisions.description is 'Descripción de la división';

create table data_ciiu_groups
(
  "code" char(3) primary key,
  "division_code" char(2) not null references data_ciiu_divisions(code),
  "description" varchar(500)
);
comment on table data_ciiu_groups is 'Grupos de la CIIU';
comment on column data_ciiu_groups.code is 'Código del grupo';
comment on column data_ciiu_groups.division_code is 'División a la que pertenece';
comment on column data_ciiu_groups.description is 'Descripción del grupo';

create table data_ciiu_codes
(
  "code" char(4) primary key,
  "group_code" char(3) not null references data_ciiu_groups(code),
  "description" varchar(500)
);
comment on table data_ciiu_codes is 'Códigos de la CIIU';
comment on column data_ciiu_codes.code is 'Código del código';
comment on column data_ciiu_codes.group_code is 'Grupo al que pertenece';
comment on column data_ciiu_codes.description is 'Descripción del código';

-- Registro de las UVTs
create table data_uvt (
  "year" char(4) primary key,
  "value" numeric(15, 2)
);

comment on table data_uvt is 'Historial de las UVTs';
comment on column data_uvt.year is 'Año';
comment on column data_uvt.value is 'Valor de la UVT en pesos Colombianos';

create table data_unspsc_segments
(
  "code" char(2) primary key,
  "name" varchar(200)
);

comment on table data_unspsc_segments is 'Segmentos de la UNSPSC';
comment on column data_unspsc_segments.code is 'Código del segmento';
comment on column data_unspsc_segments.name is 'Nombre del segmento';

create table data_unspsc_families
(
  "code" char(4) primary key,
  "segment_code" char(2) references data_unspsc_segments(code),
  "name" varchar(200)
);

comment on table data_unspsc_families is 'Familias de la UNSPSC';
comment on column data_unspsc_families.code is 'Código de la familia';
comment on column data_unspsc_families.segment_code is 'Segmento al que pertenece';
comment on column data_unspsc_families.name is 'Nombre de la familia';

create table data_unspsc_classes
(
  "code" char(6) primary key,
  "family_code" char(4) references data_unspsc_families(code),
  "name" varchar(200)
);

comment on table data_unspsc_classes is 'Clases de la UNSPSC';
comment on column data_unspsc_classes.code is 'Código de la clase';
comment on column data_unspsc_classes.family_code is 'Familia a la que pertenece';
comment on column data_unspsc_classes.name is 'Nombre de la clase';

-- Código de producto o servicios
create table data_unspsc_codes
(
  "code" char(8) primary key,
  "class_code" char(6) references data_unspsc_classes(code),
  "name" varchar(200)
);

comment on table data_unspsc_codes is 'Código de producto o servicios';
comment on column data_unspsc_codes.code is 'Código del producto o servicio';
comment on column data_unspsc_codes.class_code is 'Clase a la que pertenece';
comment on column data_unspsc_codes.name is 'Nombre del producto o servicio';

create table data_tax_id_types 
(
  "code" char(2) primary key,
  "name" varchar(100) not null,
  "short_name" varchar(5)
);

comment on table data_tax_id_types is 'Documentos de identificación para Colombia';
comment on column data_tax_id_types.code is 'Código del documento asignado por la DIAN';
comment on column data_tax_id_types.name is 'Nombre del tipo de documento';
comment on column data_tax_id_types.short_name is 'Nombre corto del documento tipo de documento';

create table data_location_departments
(
  "code" char(2) primary key,
  "name" varchar(100)
);

comment on table data_location_departments is 'Departamentos de Colombia';
comment on column data_location_departments.code is 'Código del departamento';
comment on column data_location_departments.name is 'Nombre del departamento';

create table data_location_cities
(
  "code" char(5) primary key,
  "department_code" char(2),
  "name" varchar(100)
);

comment on table data_location_cities is 'Ciudades de Colombia';
comment on column data_location_cities.code is 'Código de la ciudad';
comment on column data_location_cities.department_code is 'Código del departamento al que pertenece';
comment on column data_location_cities.name is 'Nombre de la ciudad';

create table data_taxes 
(
  "code" char(2) primary key,
  "name" varchar(100) not null,
  "description" text
);

comment on table data_taxes is 'Tipos de impuestos en Colombia';
comment on column data_taxes.code is 'Código del impuesto';
comment on column data_taxes.name is 'Nombre del impuesto';
comment on column data_taxes.description is 'Descripción del impuesto';

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

comment on table companies is 'Empresas PYM''s';
comment on column companies.id is 'ID de la empresa';
comment on column companies.created_at is 'Fecha de creación';
comment on column companies.updated_at is 'Fecha de actualización';
comment on column companies.taxpayer_type is 'Tipo de contribuyente (legal, natural)';
comment on column companies.status is 'Estado (enable, disable)';
comment on column companies.nit is 'NIT';
comment on column companies.dv is 'Dígito de verificación';
comment on column companies.account_name is 'Nombre de la compañía';
comment on column companies.name is 'Nombre';
comment on column companies.last_name is 'Apellido';
comment on column companies.company_name is 'Razón social';
comment on column companies.trade_name is 'Nombre comercial';
comment on column companies.email is 'Correo electrónico';
comment on column companies.cellphone is 'Teléfono';
comment on column companies.department is 'Departamento';
comment on column companies.city is 'Ciudad';
comment on column companies.address is 'Dirección';
comment on column companies.economic_activities is 'Actividades económicas';
comment on column companies.responsibilities is 'Responsabilidades fiscales';
comment on column companies.legal_representative is 'ID del representante legal';
comment on column companies.contacts is 'Lista de contactos';
comment on column companies.access_credentials is 'Lista de los accesos, ejemplo: usuario y contraseña de la DIAN';

create table companies_collaborators
(
  "main" boolean not null default false,                                                  --> ¿Es el colaborador principal?
  "company_id" uuid not null references companies("id"),                                  --> ID de la empresa
  "user_id" uuid not null references users("id"),                                         --> ID del usuario
  "permissions" text[] not null default array[]::text[],                                  --> Permisos del colaborador
  unique (company_id, user_id)
);

comment on table companies_collaborators is 'Colaboradores de las empresas';
comment on column companies_collaborators.main is '¿Es el colaborador principal?';
comment on column companies_collaborators.company_id is 'ID de la empresa';
comment on column companies_collaborators.user_id is 'ID del usuario';
comment on column companies_collaborators.permissions is 'Permisos del colaborador (array de texto)';