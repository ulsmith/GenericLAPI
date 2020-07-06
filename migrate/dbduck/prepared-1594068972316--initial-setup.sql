-- @timestamp 1594068972316 --
-- @type postgres --
-- @database dbduck --
-- @name initial-setup --
-- @author Paul Smith --
-- @copywrite dbduck.net --
-- @date 2020-07-06 --

-- @up --

BEGIN;

CREATE SCHEMA IF NOT EXISTS "public";
CREATE SCHEMA IF NOT EXISTS "log";
CREATE SCHEMA IF NOT EXISTS "identity";

CREATE OR REPLACE FUNCTION updated_current_timestamp() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

create extension if not exists "uuid-ossp";

CREATE TYPE "public"."communication_type" AS ENUM (
  'email',
  'phone',
  'twitter',
  'facebook'
);

CREATE TABLE "public"."migrate" (
  "id" SERIAL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "completed" timestamp,
  "name_unique" text NOT NULL,
  "data" jsonb,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."configuration" (
  "id" SERIAL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "name_unique" text NOT NULL,
  "data" jsonb,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."department" (
  "id" SERIAL,
  "organisation_id" integer NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "active" boolean NOT NULL DEFAULT false,
  "name" text NOT NULL,
  "name_unique" text NOT NULL,
  "description" text,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."department__group" (
  "id" SERIAL,
  "department_id" integer NOT NULL,
  "department_organisation_id" integer NOT NULL,
  "group_id" integer NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."department__role" (
  "id" SERIAL,
  "department_id" integer NOT NULL,
  "department_organisation_id" integer NOT NULL,
  "role_id" integer NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "read" boolean NOT NULL DEFAULT false,
  "write" boolean NOT NULL DEFAULT false,
  "delete" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."group" (
  "id" SERIAL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "name" text NOT NULL,
  "name_unique" text NOT NULL,
  "description" text,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."group__role" (
  "id" SERIAL,
  "group_id" integer NOT NULL,
  "role_id" integer NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "read" boolean NOT NULL DEFAULT false,
  "write" boolean NOT NULL DEFAULT false,
  "delete" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."organisation" (
  "id" SERIAL,
  "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "active" boolean NOT NULL DEFAULT false,
  "name" text NOT NULL,
  "name_unique" text NOT NULL,
  "description" text,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."registration" (
  "id" SERIAL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "identity" text NOT NULL,
  "identity_type" communication_type NOT NULL,
  "password" varchar(256) NOT NULL,
  "token" text,
  "token_sent" timestamp,
  "ip_address" cidr,
  "user_agent" text,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."role" (
  "id" SERIAL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "name" text NOT NULL,
  "name_unique" text NOT NULL,
  "description" text,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."user" (
  "id" SERIAL,
  "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "active" boolean NOT NULL DEFAULT false,
  "name" text NOT NULL,
  "description" text,
  "data" jsonb,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."user__group" (
  "id" SERIAL,
  "user_id" integer NOT NULL,
  "group_id" integer NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."user__department" (
  "id" SERIAL,
  "user_id" integer NOT NULL,
  "department_id" integer NOT NULL,
  "department_organisation_id" integer NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."user__role" (
  "id" SERIAL,
  "user_id" integer NOT NULL,
  "role_id" integer NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "read" boolean NOT NULL DEFAULT false,
  "write" boolean NOT NULL DEFAULT false,
  "delete" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."user_account" (
  "id" SERIAL,
  "user_id" integer UNIQUE NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "password" text NOT NULL,
  "password_reminder" text,
  "password_reminder_sent" timestamp,
  "ip_address" cidr,
  "user_agent" text,
  "login_current" timestamp,
  "login_previous" timestamp,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."user_identity" (
  "id" SERIAL,
  "user_id" integer NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "identity" text NOT NULL,
  "type" communication_type NOT NULL,
  "primary" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."user_api" (
  "id" SERIAL,
  "user_id" integer NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "key" text NOT NULL,
  "token" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  PRIMARY KEY ("id")
);

CREATE TABLE "identity"."user_config" (
  "id" SERIAL,
  "user_id" integer NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "data" jsonb NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "log"."log_user" (
  "id" SERIAL,
  "user_id" integer,
  "created_date" date NOT NULL DEFAULT (now()),
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "data" jsonb NOT NULL,
  PRIMARY KEY ("id", "created_date")
) PARTITION BY RANGE ("created_date");

CREATE TABLE "log"."log_user_2020" PARTITION OF "log"."log_user" FOR VALUES FROM ('2020-01-01') TO ('2020-12-31');
CREATE TABLE "log"."log_user_2021" PARTITION OF "log"."log_user" FOR VALUES FROM ('2021-01-01') TO ('2021-12-31');
CREATE TABLE "log"."log_user_2022" PARTITION OF "log"."log_user" FOR VALUES FROM ('2022-01-01') TO ('2022-12-31');
CREATE TABLE "log"."log_user_2023" PARTITION OF "log"."log_user" FOR VALUES FROM ('2023-01-01') TO ('2023-12-31');
CREATE TABLE "log"."log_user_2024" PARTITION OF "log"."log_user" FOR VALUES FROM ('2024-01-01') TO ('2024-12-31');
CREATE TABLE "log"."log_user_2025" PARTITION OF "log"."log_user" FOR VALUES FROM ('2025-01-01') TO ('2025-12-31');
CREATE TABLE "log"."log_user_2026" PARTITION OF "log"."log_user" FOR VALUES FROM ('2026-01-01') TO ('2026-12-31');
CREATE TABLE "log"."log_user_2027" PARTITION OF "log"."log_user" FOR VALUES FROM ('2027-01-01') TO ('2027-12-31');
CREATE TABLE "log"."log_user_2028" PARTITION OF "log"."log_user" FOR VALUES FROM ('2028-01-01') TO ('2028-12-31');
CREATE TABLE "log"."log_user_2029" PARTITION OF "log"."log_user" FOR VALUES FROM ('2029-01-01') TO ('2029-12-31');
CREATE TABLE "log"."log_user_2030" PARTITION OF "log"."log_user" FOR VALUES FROM ('2030-01-01') TO ('2030-12-31');
CREATE TABLE "log"."log_user_2031" PARTITION OF "log"."log_user" FOR VALUES FROM ('2031-01-01') TO ('2031-12-31');
CREATE TABLE "log"."log_user_2032" PARTITION OF "log"."log_user" FOR VALUES FROM ('2032-01-01') TO ('2032-12-31');
CREATE TABLE "log"."log_user_2033" PARTITION OF "log"."log_user" FOR VALUES FROM ('2033-01-01') TO ('2033-12-31');
CREATE TABLE "log"."log_user_2034" PARTITION OF "log"."log_user" FOR VALUES FROM ('2034-01-01') TO ('2034-12-31');
CREATE TABLE "log"."log_user_2035" PARTITION OF "log"."log_user" FOR VALUES FROM ('2035-01-01') TO ('2035-12-31');
CREATE TABLE "log"."log_user_2036" PARTITION OF "log"."log_user" FOR VALUES FROM ('2036-01-01') TO ('2036-12-31');
CREATE TABLE "log"."log_user_2037" PARTITION OF "log"."log_user" FOR VALUES FROM ('2037-01-01') TO ('2037-12-31');
CREATE TABLE "log"."log_user_2038" PARTITION OF "log"."log_user" FOR VALUES FROM ('2038-01-01') TO ('2038-12-31');
CREATE TABLE "log"."log_user_2039" PARTITION OF "log"."log_user" FOR VALUES FROM ('2039-01-01') TO ('2039-12-31');
CREATE TABLE "log"."log_user_2040" PARTITION OF "log"."log_user" FOR VALUES FROM ('2040-01-01') TO ('2040-12-31');
CREATE TABLE "log"."log_user_2041" PARTITION OF "log"."log_user" FOR VALUES FROM ('2041-01-01') TO ('2041-12-31');
CREATE TABLE "log"."log_user_2042" PARTITION OF "log"."log_user" FOR VALUES FROM ('2042-01-01') TO ('2042-12-31');
CREATE TABLE "log"."log_user_2043" PARTITION OF "log"."log_user" FOR VALUES FROM ('2043-01-01') TO ('2043-12-31');
CREATE TABLE "log"."log_user_2044" PARTITION OF "log"."log_user" FOR VALUES FROM ('2044-01-01') TO ('2044-12-31');
CREATE TABLE "log"."log_user_2045" PARTITION OF "log"."log_user" FOR VALUES FROM ('2045-01-01') TO ('2045-12-31');
CREATE TABLE "log"."log_user_2046" PARTITION OF "log"."log_user" FOR VALUES FROM ('2046-01-01') TO ('2046-12-31');
CREATE TABLE "log"."log_user_2047" PARTITION OF "log"."log_user" FOR VALUES FROM ('2047-01-01') TO ('2047-12-31');
CREATE TABLE "log"."log_user_2048" PARTITION OF "log"."log_user" FOR VALUES FROM ('2048-01-01') TO ('2048-12-31');
CREATE TABLE "log"."log_user_2049" PARTITION OF "log"."log_user" FOR VALUES FROM ('2049-01-01') TO ('2049-12-31');
CREATE TABLE "log"."log_user_2050" PARTITION OF "log"."log_user" FOR VALUES FROM ('2050-01-01') TO ('2050-12-31');

CREATE TRIGGER updated__migrate BEFORE UPDATE ON "public"."migrate" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__configuration BEFORE UPDATE ON "public"."configuration" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__department BEFORE UPDATE ON "identity"."department" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__department__group BEFORE UPDATE ON "identity"."department__group" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__department__role BEFORE UPDATE ON "identity"."department__role" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__group BEFORE UPDATE ON "identity"."group" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__group__role BEFORE UPDATE ON "identity"."group__role" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__organisation BEFORE UPDATE ON "identity"."organisation" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__registration BEFORE UPDATE ON "identity"."registration" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__role BEFORE UPDATE ON "identity"."role" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__user BEFORE UPDATE ON "identity"."user" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__user__group BEFORE UPDATE ON "identity"."user__group" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__user__department BEFORE UPDATE ON "identity"."user__department" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__user__role BEFORE UPDATE ON "identity"."user__role" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__user_account BEFORE UPDATE ON "identity"."user_account" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__user_identity BEFORE UPDATE ON "identity"."user_identity" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__user_api BEFORE UPDATE ON "identity"."user_api" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
CREATE TRIGGER updated__user_config BEFORE UPDATE ON "identity"."user_config" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();

CREATE UNIQUE INDEX ON "public"."migrate" ("name_unique");
CREATE UNIQUE INDEX ON "public"."configuration" ("name_unique");
CREATE UNIQUE INDEX ON "identity"."department" ("organisation_id", "name_unique");
CREATE UNIQUE INDEX ON "identity"."department__group" ("department_id", "group_id");
CREATE UNIQUE INDEX ON "identity"."department__role" ("department_id", "role_id");
CREATE UNIQUE INDEX ON "identity"."group" ("name_unique");
CREATE UNIQUE INDEX ON "identity"."group__role" ("group_id", "role_id");
CREATE UNIQUE INDEX ON "identity"."organisation" ("uuid");
CREATE UNIQUE INDEX ON "identity"."organisation" ("name_unique");
CREATE UNIQUE INDEX ON "identity"."registration" ("identity");
CREATE UNIQUE INDEX ON "identity"."registration" ("token");
CREATE UNIQUE INDEX ON "identity"."role" ("name_unique");
CREATE UNIQUE INDEX ON "identity"."user" ("uuid");
CREATE UNIQUE INDEX ON "identity"."user__group" ("user_id", "group_id");
CREATE UNIQUE INDEX ON "identity"."user__department" ("user_id", "department_id");
CREATE UNIQUE INDEX ON "identity"."user__role" ("user_id", "role_id");
CREATE UNIQUE INDEX ON "identity"."user_account" ("user_id");
CREATE UNIQUE INDEX ON "identity"."user_identity" ("identity");
CREATE UNIQUE INDEX ON "identity"."user_api" ("key");
CREATE UNIQUE INDEX ON "identity"."user_config" ("user_id");
CREATE INDEX ON "log"."log_user" ("user_id", "created_date");

ALTER TABLE "identity"."department" ADD FOREIGN KEY ("organisation_id") REFERENCES "identity"."organisation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "identity"."user__department" ADD FOREIGN KEY ("department_id") REFERENCES "identity"."department" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."user__department" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."user__group" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."user__group" ADD FOREIGN KEY ("group_id") REFERENCES "identity"."group" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."department__group" ADD FOREIGN KEY ("department_id") REFERENCES "identity"."department" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."department__group" ADD FOREIGN KEY ("group_id") REFERENCES "identity"."group" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."department__role" ADD FOREIGN KEY ("department_id") REFERENCES "identity"."department" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."user__role" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."user__role" ADD FOREIGN KEY ("role_id") REFERENCES "identity"."role" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."group__role" ADD FOREIGN KEY ("group_id") REFERENCES "identity"."group" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."group__role" ADD FOREIGN KEY ("role_id") REFERENCES "identity"."role" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."department__role" ADD FOREIGN KEY ("role_id") REFERENCES "identity"."role" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."user_identity" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."user_account" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."user_api" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "identity"."user_config" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "log"."log_user" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT;

-- @down --

BEGIN;

DROP TABLE IF EXISTS "public"."migrate";
DROP TABLE IF EXISTS "public"."configuration";
DROP TABLE IF EXISTS "log"."log_user_2020";
DROP TABLE IF EXISTS "log"."log_user_2021";
DROP TABLE IF EXISTS "log"."log_user_2022";
DROP TABLE IF EXISTS "log"."log_user_2023";
DROP TABLE IF EXISTS "log"."log_user_2024";
DROP TABLE IF EXISTS "log"."log_user_2025";
DROP TABLE IF EXISTS "log"."log_user_2026";
DROP TABLE IF EXISTS "log"."log_user_2027";
DROP TABLE IF EXISTS "log"."log_user_2028";
DROP TABLE IF EXISTS "log"."log_user_2029";
DROP TABLE IF EXISTS "log"."log_user_2030";
DROP TABLE IF EXISTS "log"."log_user_2031";
DROP TABLE IF EXISTS "log"."log_user_2032";
DROP TABLE IF EXISTS "log"."log_user_2033";
DROP TABLE IF EXISTS "log"."log_user_2034";
DROP TABLE IF EXISTS "log"."log_user_2035";
DROP TABLE IF EXISTS "log"."log_user_2036";
DROP TABLE IF EXISTS "log"."log_user_2037";
DROP TABLE IF EXISTS "log"."log_user_2038";
DROP TABLE IF EXISTS "log"."log_user_2039";
DROP TABLE IF EXISTS "log"."log_user_2040";
DROP TABLE IF EXISTS "log"."log_user_2041";
DROP TABLE IF EXISTS "log"."log_user_2042";
DROP TABLE IF EXISTS "log"."log_user_2043";
DROP TABLE IF EXISTS "log"."log_user_2044";
DROP TABLE IF EXISTS "log"."log_user_2045";
DROP TABLE IF EXISTS "log"."log_user_2046";
DROP TABLE IF EXISTS "log"."log_user_2047";
DROP TABLE IF EXISTS "log"."log_user_2048";
DROP TABLE IF EXISTS "log"."log_user_2049";
DROP TABLE IF EXISTS "log"."log_user_2050";
DROP TABLE IF EXISTS "log"."log_user";
DROP TABLE IF EXISTS "identity"."user_account";
DROP TABLE IF EXISTS "identity"."user_identity";
DROP TABLE IF EXISTS "identity"."user_api";
DROP TABLE IF EXISTS "identity"."user_config";
DROP TABLE IF EXISTS "identity"."user__group";
DROP TABLE IF EXISTS "identity"."user__department";
DROP TABLE IF EXISTS "identity"."user__role";
DROP TABLE IF EXISTS "identity"."department__role";
DROP TABLE IF EXISTS "identity"."department__group";
DROP TABLE IF EXISTS "identity"."department";
DROP TABLE IF EXISTS "identity"."group__role";
DROP TABLE IF EXISTS "identity"."group";
DROP TABLE IF EXISTS "identity"."organisation";
DROP TABLE IF EXISTS "identity"."registration";
DROP TABLE IF EXISTS "identity"."role";
DROP TABLE IF EXISTS "identity"."user";

DROP TYPE IF EXISTS "public"."communication_type";

DROP SCHEMA IF EXISTS "log";
DROP SCHEMA IF EXISTS "identity";

COMMIT;