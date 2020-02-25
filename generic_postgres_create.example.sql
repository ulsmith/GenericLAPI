-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2020-01-29 21:10:09.319

-- on update function
CREATE OR REPLACE FUNCTION updated_current_timestamp() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

create extension if not exists "uuid-ossp";

-- create schema's
CREATE SCHEMA IF NOT EXISTS "public";
CREATE SCHEMA IF NOT EXISTS "identity";

-- create ENUM's
DROP TYPE IF EXISTS "user_identity_type";
CREATE TYPE "user_identity_type" AS ENUM ('email', 'phone');;

-- tables
-- Table: department
CREATE TABLE identity.department (
    id serial  NOT NULL,
    organisation_id serial  NOT NULL,
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name text  NOT NULL,
    name_unique text  NOT NULL,
    description text  NOT NULL,
    CONSTRAINT department_ak_1 UNIQUE (name_unique) NOT DEFERRABLE  INITIALLY IMMEDIATE,
    CONSTRAINT identity__department__primary_key PRIMARY KEY (id,organisation_id)
);

CREATE INDEX department_idx_1 on identity.department (organisation_id ASC,name_unique ASC);

CREATE TRIGGER updated__department BEFORE UPDATE ON "identity"."department" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- Table: department_group
CREATE TABLE identity.department_group (
    id serial  NOT NULL,
    group_id serial  NOT NULL,
    department_id serial  NOT NULL,
    department_organisation_id serial  NOT NULL,
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT identity__department_group__primary_key PRIMARY KEY (id)
);

CREATE INDEX department_group_idx_1 on identity.department_group (group_id ASC,department_id ASC);

CREATE TRIGGER updated__department_group BEFORE UPDATE ON "identity"."department_group" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- Table: department_role
CREATE TABLE identity.department_role (
    id serial  NOT NULL,
    department_id serial  NOT NULL,
    department_organisation_id serial  NOT NULL,
    role_id serial  NOT NULL,
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read boolean  NOT NULL DEFAULT false,
    write boolean  NOT NULL DEFAULT false,
    delete boolean  NOT NULL DEFAULT false,
    CONSTRAINT identity__department_role__primary_key PRIMARY KEY (id)
);

CREATE INDEX department_role_idx_1 on identity.department_role (department_id ASC,role_id ASC);

CREATE TRIGGER updated__department_role BEFORE UPDATE ON "identity"."department_role" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- Table: group
CREATE TABLE identity."group" (
    id serial  NOT NULL,
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name text  NOT NULL,
    name_unique text  NOT NULL,
    description text  NOT NULL,
    CONSTRAINT group_ak_1 UNIQUE (name_unique) NOT DEFERRABLE  INITIALLY IMMEDIATE,
    CONSTRAINT identity__group__primary_key PRIMARY KEY (id)
);

CREATE INDEX group_idx_1 on identity."group" (name_unique ASC);

CREATE TRIGGER updated__group BEFORE UPDATE ON "identity"."group" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- Table: group_role
CREATE TABLE identity.group_role (
    id serial  NOT NULL,
    group_id serial  NOT NULL,
    role_id serial  NOT NULL,
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read boolean  NOT NULL DEFAULT false,
    write boolean  NOT NULL DEFAULT false,
    delete boolean  NOT NULL DEFAULT false,
    CONSTRAINT identity__group_role__primary_key PRIMARY KEY (id)
);

CREATE INDEX group_role_idx_1 on identity.group_role (group_id ASC,role_id ASC);

CREATE TRIGGER updated__group_role BEFORE UPDATE ON "identity"."group_role" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- Table: organisation
CREATE TABLE identity.organisation (
    id serial  NOT NULL,
    uuid uuid  NOT NULL DEFAULT uuid_generate_v4(),
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active boolean  NOT NULL DEFAULT false,
    name text  NOT NULL,
    name_unique text  NOT NULL,
    description text  NOT NULL,
    CONSTRAINT organisation_ak_1 UNIQUE (uuid) NOT DEFERRABLE  INITIALLY IMMEDIATE,
    CONSTRAINT organisation_ak_2 UNIQUE (name_unique) NOT DEFERRABLE  INITIALLY IMMEDIATE,
    CONSTRAINT identity__organisation__primary_key PRIMARY KEY (id)
);

CREATE INDEX organisation_idx_1 on identity.organisation (uuid ASC);

CREATE INDEX organisation_idx_2 on identity.organisation (name_unique ASC);

CREATE TRIGGER updated__organisation BEFORE UPDATE ON "identity"."organisation" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- Table: role
CREATE TABLE identity.role (
    id serial  NOT NULL,
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name text  NOT NULL,
    name_unique text  NOT NULL,
    description text  NOT NULL,
    CONSTRAINT role_ak_1 UNIQUE (name_unique) NOT DEFERRABLE  INITIALLY IMMEDIATE,
    CONSTRAINT identity__role__primary_key PRIMARY KEY (id)
);

CREATE INDEX role_idx_1 on identity.role (name_unique ASC);

CREATE TRIGGER updated__role BEFORE UPDATE ON "identity"."role" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- Table: user
CREATE TABLE identity."user" (
    id serial  NOT NULL,
    uuid uuid  NOT NULL DEFAULT uuid_generate_v4(),
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active boolean  NOT NULL DEFAULT false,
    name text  NOT NULL,
    CONSTRAINT user_ak_1 UNIQUE (uuid) NOT DEFERRABLE  INITIALLY IMMEDIATE,
    CONSTRAINT identity__user__primary_key PRIMARY KEY (id)
);

CREATE UNIQUE INDEX user_idx_1 on identity."user" (uuid ASC);

CREATE TRIGGER updated__user BEFORE UPDATE ON "identity"."user" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- Table: user_account
CREATE TABLE identity.user_account (
    id serial  NOT NULL,
    user_id serial  NOT NULL,
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    password varchar(255)  NOT NULL,
    password_reminder text  NULL,
    password_reminder_sent timestamp  NULL,
    ip_address cidr  NULL,
    user_agent text  NULL,
    login_current timestamp  NULL,
    login_previous timestamp  NULL,
    CONSTRAINT identity__user_account__primary_key PRIMARY KEY (id,user_id)
);

CREATE INDEX user_account_idx_1 on identity.user_account (user_id ASC);

CREATE TRIGGER updated__user_account BEFORE UPDATE ON "identity"."user_account" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- Table: user_department
CREATE TABLE identity.user_department (
    id serial  NOT NULL,
    user_id serial  NOT NULL,
    department_id serial  NOT NULL,
    department_organisation_id serial  NOT NULL,
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT identity__user_department__primary_key PRIMARY KEY (id)
);

CREATE INDEX user_department_idx_1 on identity.user_department (user_id ASC,department_organisation_id ASC);

CREATE TRIGGER updated__user_department BEFORE UPDATE ON "identity"."user_department" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- Table: user_group
CREATE TABLE identity.user_group (
    id serial  NOT NULL,
    user_id serial  NOT NULL,
    group_id serial  NOT NULL,
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT identity__user_group__primary_key PRIMARY KEY (id)
);

CREATE INDEX user_group_idx_1 on identity.user_group (user_id ASC,group_id ASC);

CREATE TRIGGER updated__user_group BEFORE UPDATE ON "identity"."user_group" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- Table: user_identity
CREATE TABLE identity.user_identity (
    id serial  NOT NULL,
    user_id serial  NOT NULL,
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    identity text  NOT NULL,
    type user_identity_type  NOT NULL DEFAULT 'email',
    "primary" boolean  NOT NULL DEFAULT false,
    CONSTRAINT user_identity_ak_1 UNIQUE (identity, type) NOT DEFERRABLE  INITIALLY IMMEDIATE,
    CONSTRAINT identity__user_identity__primary_key PRIMARY KEY (id)
);

CREATE INDEX user_identity_idx_1 on identity.user_identity (user_id ASC);

CREATE INDEX user_identity_idx_2 on identity.user_identity (user_id ASC,identity ASC,type ASC);

CREATE TRIGGER updated__user_identity BEFORE UPDATE ON "identity"."user_identity" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- Table: user_role
CREATE TABLE identity.user_role (
    id serial  NOT NULL,
    user_id serial  NOT NULL,
    role_id serial  NOT NULL,
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read boolean  NOT NULL DEFAULT false,
    write boolean  NOT NULL DEFAULT false,
    delete boolean  NOT NULL DEFAULT false,
    CONSTRAINT identity__user_role__primary_key PRIMARY KEY (id)
);

CREATE INDEX user_role_idx_1 on identity.user_role (user_id ASC,role_id ASC);

CREATE TRIGGER updated__user_role BEFORE UPDATE ON "identity"."user_role" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- Table: registration
CREATE TABLE identity."registration" (
    id serial  NOT NULL,
    created timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    identity text  NOT NULL,
    identity_type user_identity_type  NOT NULL DEFAULT 'email',
    password varchar(255)  NOT NULL,
    token text  NULL,
    token_sent timestamp  NULL,
    ip_address cidr  NULL,
    user_agent text  NULL,
    CONSTRAINT registration_ak_1 UNIQUE (identity, identity_type) NOT DEFERRABLE  INITIALLY IMMEDIATE,
    CONSTRAINT identity__registration__primary_key PRIMARY KEY (id)
);

CREATE INDEX registration_idx_1 on identity.registration (identity ASC,identity_type ASC);

CREATE TRIGGER updated__registration BEFORE UPDATE ON "identity"."registration" FOR EACH ROW EXECUTE PROCEDURE  updated_current_timestamp();;

-- foreign keys
-- Reference: department_group_department (table: department_group)
ALTER TABLE identity.department_group ADD CONSTRAINT department_group_department
    FOREIGN KEY (department_id, department_organisation_id)
    REFERENCES identity.department (id, organisation_id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: department_group_group (table: department_group)
ALTER TABLE identity.department_group ADD CONSTRAINT department_group_group
    FOREIGN KEY (group_id)
    REFERENCES identity."group" (id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: department_organisation (table: department)
ALTER TABLE identity.department ADD CONSTRAINT department_organisation
    FOREIGN KEY (organisation_id)
    REFERENCES identity.organisation (id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: department_role_department (table: department_role)
ALTER TABLE identity.department_role ADD CONSTRAINT department_role_department
    FOREIGN KEY (department_id, department_organisation_id)
    REFERENCES identity.department (id, organisation_id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: department_role_role (table: department_role)
ALTER TABLE identity.department_role ADD CONSTRAINT department_role_role
    FOREIGN KEY (role_id)
    REFERENCES identity.role (id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: group_role_group (table: group_role)
ALTER TABLE identity.group_role ADD CONSTRAINT group_role_group
    FOREIGN KEY (group_id)
    REFERENCES identity."group" (id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: group_role_role (table: group_role)
ALTER TABLE identity.group_role ADD CONSTRAINT group_role_role
    FOREIGN KEY (role_id)
    REFERENCES identity.role (id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: user_account_user (table: user_account)
ALTER TABLE identity.user_account ADD CONSTRAINT user_account_user
    FOREIGN KEY (user_id)
    REFERENCES identity."user" (id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: user_department_department (table: user_department)
ALTER TABLE identity.user_department ADD CONSTRAINT user_department_department
    FOREIGN KEY (department_id, department_organisation_id)
    REFERENCES identity.department (id, organisation_id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: user_department_user (table: user_department)
ALTER TABLE identity.user_department ADD CONSTRAINT user_department_user
    FOREIGN KEY (user_id)
    REFERENCES identity."user" (id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: user_group_group (table: user_group)
ALTER TABLE identity.user_group ADD CONSTRAINT user_group_group
    FOREIGN KEY (group_id)
    REFERENCES identity."group" (id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: user_group_user (table: user_group)
ALTER TABLE identity.user_group ADD CONSTRAINT user_group_user
    FOREIGN KEY (user_id)
    REFERENCES identity."user" (id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: user_identity_user (table: user_identity)
ALTER TABLE identity.user_identity ADD CONSTRAINT user_identity_user
    FOREIGN KEY (user_id)
    REFERENCES identity."user" (id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: user_role_role (table: user_role)
ALTER TABLE identity.user_role ADD CONSTRAINT user_role_role
    FOREIGN KEY (role_id)
    REFERENCES identity.role (id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: user_role_user (table: user_role)
ALTER TABLE identity.user_role ADD CONSTRAINT user_role_user
    FOREIGN KEY (user_id)
    REFERENCES identity."user" (id)
    ON DELETE  CASCADE 
    ON UPDATE  CASCADE 
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Preload database with basic user

-- add org
INSERT INTO "identity"."organisation" ("name", "name_unique", "description")
VALUES ('Generic Company Ltd', 'generic_company_ltd', 'Base organisation for Generic Company Limited staff.');

-- then department
INSERT INTO "identity"."department" ("organisation_id", "name", "name_unique", "description")
VALUES (1, 'Administration (Super)', 'administration.super', 'Base department for Generic Company Limited staff.');

-- then user
INSERT INTO "identity"."user" ("name")
VALUES ('Paul Smith');

-- user identity
INSERT INTO "identity"."user_identity" ("identity", "type", "primary")
VALUES ('p@ulsmith.net', 'email', true);

-- user account
INSERT INTO "identity"."user_account" (user_id, password)
VALUES (1, 'a395192e5666da4839ebcaa8ef903083848d7a7d50a29d65b5ee48a5e0bbfa9e635b3938d26edb0eb9913f2e1264dceec7e6a49a95e40c887fe79ea771598ef9');

-- permissions

-- add a super admin group
INSERT INTO "identity"."group" ("name", "name_unique", "description")
VALUES ('Administrator (Super)', 'administrator.super', 'Full read, write, delete access to entire system, regardless of organisation, department or any other. A.K.A. GOD!');

-- role for login access/auth
INSERT INTO "identity"."role" ("name", "name_unique", "description")
VALUES 
('API access to endpoint xyz', 'api.controller.xyz', 'API access to a specific endpoint.'),
('API access to endpoint 123', 'api.controller.123', 'API access to a specific endpoint.'),
('UI access to page ABC', 'ui.route.abc', 'UI access to a specific page.'),
('UI access to page 123', 'ui.route.123', 'UI access to a specific page.');

-- apply permissions to the group
INSERT INTO "identity"."group_role" ("group_id", "role_id", "read", "write", "delete")
VALUES 
(1, 1, true, true, true),
(1, 2, true, true, true),
(1, 3, true, true, true),
(1, 4, true, true, true);

-- assign group to the department
INSERT INTO "identity"."department_group" ("group_id", "department_id", "department_organisation_id")
VALUES (1, 1, 1);

-- add me to the department.
INSERT INTO "identity"."user_department" ("user_id", "department_id", "department_organisation_id")
VALUES (1, 1, 1);;

-- End of file.

