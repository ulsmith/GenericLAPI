-- @engine postgres
-- @database database-name
-- @name initial-setup
-- @author Paul Smith
-- @copywrite none
-- @date 2020-07-06
-- @license MIT

-- @editor_autosave false
-- @editor_width 809

-- @workspace_width 5000
-- @workspace_height 5000
-- @workspace_scale 1

-- @minimap_position bottom right
-- @minimap_scale 0.046875

-- @up

BEGIN;

CREATE SCHEMA IF NOT EXISTS "public";
CREATE SCHEMA IF NOT EXISTS "log";
CREATE SCHEMA IF NOT EXISTS "identity";
CREATE SCHEMA IF NOT EXISTS "design";

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

-- @table public.migrate {"x":2546,"y":102,"w":200,"h":200,"accentColor":"#222","textColor":"#fff"}
CREATE TABLE "public"."migrate" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "completed" timestamp,
  "name_unique" text NOT NULL,
  "data" jsonb,
  PRIMARY KEY ("id")
);

-- @table public.configuration {"x":2772,"y":104,"w":200,"h":200,"accentColor":"#222","textColor":"#fff"}
CREATE TABLE "public"."configuration" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "name_unique" text NOT NULL,
  "data" jsonb,
  PRIMARY KEY ("id")
);

-- @table public.email_blocked {"x":2972,"y":104,"w":200,"h":200,"accentColor":"#222","textColor":"#fff"}
CREATE TABLE "public"."email_blocked" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "email" text NOT NULL,
  "type" text NOT NULL,
  "data" jsonb,
  PRIMARY KEY ("id")
);

-- @table identity.department {"x":1682,"y":94,"w":248,"h":258,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."department" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "organisation_id" uuid NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "active" boolean NOT NULL DEFAULT false,
  "name" text NOT NULL,
  "name_unique" text NOT NULL,
  "description" text,
  PRIMARY KEY ("id")
);

-- @table identity.department__group {"x":1050,"y":98,"w":246,"h":250,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."department__group" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "department_id" uuid NOT NULL,
  "department_organisation_id" uuid NOT NULL,
  "group_id" uuid NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  PRIMARY KEY ("id")
);

-- @table identity.department__role {"x":1390,"y":454,"w":258,"h":274,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."department__role" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "department_id" uuid NOT NULL,
  "department_organisation_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "read" boolean NOT NULL DEFAULT false,
  "write" boolean NOT NULL DEFAULT false,
  "delete" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("id")
);

-- @table identity.group {"x":422,"y":100,"w":208,"h":230,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."group" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "name" text NOT NULL,
  "name_unique" text NOT NULL,
  "description" text,
  PRIMARY KEY ("id")
);

-- @table identity.group__role {"x":696,"y":466,"w":262,"h":256,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."group__role" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "group_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "read" boolean NOT NULL DEFAULT false,
  "write" boolean NOT NULL DEFAULT false,
  "delete" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("id")
);

-- @table identity.organisation {"x":2048,"y":96,"w":218,"h":268,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."organisation" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "active" boolean NOT NULL DEFAULT false,
  "name" text NOT NULL,
  "name_unique" text NOT NULL,
  "description" text,
  PRIMARY KEY ("id")
);

-- @table identity.registration {"x":60,"y":98,"w":250,"h":292,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."registration" (
  "id" uuid DEFAULT uuid_generate_v4(),
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

-- @table identity.role {"x":1080,"y":446,"w":212,"h":242,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."role" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "name" text NOT NULL,
  "name_unique" text NOT NULL,
  "description" text,
  PRIMARY KEY ("id")
);

-- @table identity.user {"x":1070,"y":1174,"w":230,"h":240,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."user" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "active" boolean NOT NULL DEFAULT false,
  "name" text NOT NULL,
  "description" text,
  "data" jsonb,
  PRIMARY KEY ("id")
);

-- @table identity.user__group {"x":418,"y":838,"w":208,"h":214,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."user__group" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL,
  "group_id" uuid NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  PRIMARY KEY ("id")
);

-- @table identity.user__department {"x":1672,"y":804,"w":266,"h":260,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."user__department" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL,
  "department_id" uuid NOT NULL,
  "department_organisation_id" uuid NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  PRIMARY KEY ("id")
);

-- @table identity.user__role {"x":1062,"y":780,"w":246,"h":256,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."user__role" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "read" boolean NOT NULL DEFAULT false,
  "write" boolean NOT NULL DEFAULT false,
  "delete" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("id")
);

-- @table identity.user_account {"x":44,"y":1604,"w":322,"h":320,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."user_account" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "user_id" uuid UNIQUE NOT NULL,
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

-- @table identity.user_identity {"x":384,"y":1602,"w":226,"h":322,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."user_identity" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "identity" text NOT NULL,
  "type" communication_type NOT NULL,
  "primary" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("id")
);

-- @table identity.user_api {"x":850,"y":1602,"w":236,"h":318,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."user_api" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "key" text NOT NULL,
  "token" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  PRIMARY KEY ("id")
);

-- @table identity.user_config {"x":626,"y":1600,"w":208,"h":322,"accentColor":"#447fbf","textColor":"#fff"}
CREATE TABLE "identity"."user_config" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "user_id" uuid NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "updated" timestamp NOT NULL DEFAULT (now()),
  "deleted" timestamp,
  "data" jsonb NOT NULL,
  PRIMARY KEY ("id")
);

-- @table log.log_user {"x":1820,"y":1614,"w":248,"h":320,"accentColor":"#ff8c00","textColor":"#fff"}
CREATE TABLE "log"."log_user" (
  "id" uuid DEFAULT uuid_generate_v4(),
  "user_id" uuid,
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
CREATE TRIGGER updated__email_blocked BEFORE UPDATE ON "public"."email_blocked" FOR EACH ROW EXECUTE PROCEDURE updated_current_timestamp();
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
CREATE UNIQUE INDEX ON "public"."email_blocked" ("email");
CREATE UNIQUE INDEX ON "identity"."department" ("organisation_id", "name_unique");
CREATE UNIQUE INDEX ON "identity"."department__group" ("department_id", "group_id");
CREATE UNIQUE INDEX ON "identity"."department__role" ("department_id", "role_id");
CREATE UNIQUE INDEX ON "identity"."group" ("name_unique");
CREATE UNIQUE INDEX ON "identity"."group__role" ("group_id", "role_id");
CREATE UNIQUE INDEX ON "identity"."organisation" ("name_unique");
CREATE UNIQUE INDEX ON "identity"."registration" ("identity");
CREATE UNIQUE INDEX ON "identity"."registration" ("token");
CREATE UNIQUE INDEX ON "identity"."role" ("name_unique");
CREATE UNIQUE INDEX ON "identity"."user__group" ("user_id", "group_id");
CREATE UNIQUE INDEX ON "identity"."user__department" ("user_id", "department_id");
CREATE UNIQUE INDEX ON "identity"."user__role" ("user_id", "role_id");
CREATE UNIQUE INDEX ON "identity"."user_account" ("user_id");
CREATE UNIQUE INDEX ON "identity"."user_identity" ("identity");
CREATE UNIQUE INDEX ON "identity"."user_api" ("key");
CREATE UNIQUE INDEX ON "identity"."user_config" ("user_id");
CREATE INDEX ON "log"."log_user" ("user_id", "created_date")

-- @line identity.department<>identity.organisation {"b":0,"color":"black"}
ALTER TABLE "identity"."department" ADD FOREIGN KEY ("organisation_id") REFERENCES "identity"."organisation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- @line identity.user__department<>identity.department {"b":0,"color":"black"}
ALTER TABLE "identity"."user__department" ADD FOREIGN KEY ("department_id") REFERENCES "identity"."department" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.user__department<>identity.user {"b":0,"color":"black"}
ALTER TABLE "identity"."user__department" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.user__group<>identity.user {"b":0,"color":"black"}
ALTER TABLE "identity"."user__group" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.user__group<>identity.group {"b":0,"color":"black"}
ALTER TABLE "identity"."user__group" ADD FOREIGN KEY ("group_id") REFERENCES "identity"."group" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.department__group<>identity.department {"b":0,"color":"black"}
ALTER TABLE "identity"."department__group" ADD FOREIGN KEY ("department_id") REFERENCES "identity"."department" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.department__group<>identity.group {"b":0,"color":"black"}
ALTER TABLE "identity"."department__group" ADD FOREIGN KEY ("group_id") REFERENCES "identity"."group" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.department__role<>identity.department {"b":0,"color":"black"}
ALTER TABLE "identity"."department__role" ADD FOREIGN KEY ("department_id") REFERENCES "identity"."department" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.user__role<>identity.user {"b":0,"color":"black"}
ALTER TABLE "identity"."user__role" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.user__role<>identity.role {"b":0,"color":"black"}
ALTER TABLE "identity"."user__role" ADD FOREIGN KEY ("role_id") REFERENCES "identity"."role" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.group__role<>identity.group {"b":0,"color":"black"}
ALTER TABLE "identity"."group__role" ADD FOREIGN KEY ("group_id") REFERENCES "identity"."group" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.group__role<>identity.role {"b":0,"color":"black"}
ALTER TABLE "identity"."group__role" ADD FOREIGN KEY ("role_id") REFERENCES "identity"."role" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.department__role<>identity.role {"b":0,"color":"black"}
ALTER TABLE "identity"."department__role" ADD FOREIGN KEY ("role_id") REFERENCES "identity"."role" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.user_identity<>identity.user {"b":50,"color":"black"}
ALTER TABLE "identity"."user_identity" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.user_account<>identity.user {"b":75,"color":"black"}
ALTER TABLE "identity"."user_account" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.user_api<>identity.user {"b":0,"color":"black"}
ALTER TABLE "identity"."user_api" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line identity.user_config<>identity.user {"b":25,"color":"black"}
ALTER TABLE "identity"."user_config" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- @line log.log_user<>identity.user {"b":25,"color":"black"}
ALTER TABLE "log"."log_user" ADD FOREIGN KEY ("user_id") REFERENCES "identity"."user" ("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- READ

-- roles for db
CREATE ROLE "database_name_read";

-- grant access to db
GRANT CONNECT ON DATABASE "database_name" TO "database_name_read";

-- grant usage access to schemas
GRANT USAGE ON SCHEMA "public" TO "database_name_read";
GRANT USAGE ON SCHEMA "identity" TO "database_name_read";
GRANT USAGE ON SCHEMA "log" TO "database_name_read";
GRANT USAGE ON SCHEMA "design" TO "database_name_read";

-- grant select access to existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO "database_name_read";
GRANT SELECT ON ALL TABLES IN SCHEMA "identity" TO "database_name_read";
GRANT SELECT ON ALL TABLES IN SCHEMA "log" TO "database_name_read";
GRANT SELECT ON ALL TABLES IN SCHEMA "design" TO "database_name_read";

-- grant select access to all future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "identity" GRANT SELECT ON TABLES TO "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "log" GRANT SELECT ON TABLES TO "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "design" GRANT SELECT ON TABLES TO "database_name_read";

-- grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA "public" TO "database_name_read";
GRANT USAGE ON ALL SEQUENCES IN SCHEMA "identity" TO "database_name_read";
GRANT USAGE ON ALL SEQUENCES IN SCHEMA "log" TO "database_name_read";
GRANT USAGE ON ALL SEQUENCES IN SCHEMA "design" TO "database_name_read";

-- grant usage on sequences to all future
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT USAGE ON SEQUENCES TO "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "identity" GRANT USAGE ON SEQUENCES TO "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "log" GRANT USAGE ON SEQUENCES TO "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "design" GRANT USAGE ON SEQUENCES TO "database_name_read";

-- grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA "public" TO "database_name_read";
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA "identity" TO "database_name_read";
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA "log" TO "database_name_read";
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA "design" TO "database_name_read";

-- grant execute on function to all future
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT EXECUTE ON FUNCTIONS TO "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "identity" GRANT EXECUTE ON FUNCTIONS TO "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "log" GRANT EXECUTE ON FUNCTIONS TO "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "design" GRANT EXECUTE ON FUNCTIONS TO "database_name_read";

-- grant usage on types
GRANT USAGE ON TYPE "public"."communication_type" TO "database_name_read";

-- grant execute on types to all future
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT USAGE ON TYPES TO "database_name_read";

-- READ WRITE

-- roles for db
CREATE ROLE "database_name_read_write";

-- grant access to db
GRANT CONNECT ON DATABASE "database_name" TO "database_name_read_write";

-- grant read write access to schemas
GRANT USAGE, CREATE ON SCHEMA "public" TO "database_name_read_write";
GRANT USAGE, CREATE ON SCHEMA "identity" TO "database_name_read_write";
GRANT USAGE, CREATE ON SCHEMA "log" TO "database_name_read_write";
GRANT USAGE, CREATE ON SCHEMA "design" TO "database_name_read_write";

-- grant read write access to existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "public" TO "database_name_read_write";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "identity" TO "database_name_read_write";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "log" TO "database_name_read_write";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "design" TO "database_name_read_write";

-- grant read write access to all future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "identity" GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "log" GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "design" GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "database_name_read_write";

-- grant read write access to sequence for serials and new create of sequences on existing
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "public" TO "database_name_read_write";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "identity" TO "database_name_read_write";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "log" TO "database_name_read_write";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "design" TO "database_name_read_write";

-- grant read write access to sequence for serials and new create of sequences on future
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT USAGE, SELECT ON SEQUENCES TO "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "identity" GRANT USAGE, SELECT ON SEQUENCES TO "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "log" GRANT USAGE, SELECT ON SEQUENCES TO "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "design" GRANT USAGE, SELECT ON SEQUENCES TO "database_name_read_write";

-- grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA "public" TO "database_name_read_write";
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA "identity" TO "database_name_read_write";
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA "log" TO "database_name_read_write";
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA "design" TO "database_name_read_write";

-- grant execute on function to all future
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT EXECUTE ON FUNCTIONS TO "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "identity" GRANT EXECUTE ON FUNCTIONS TO "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "log" GRANT EXECUTE ON FUNCTIONS TO "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "design" GRANT EXECUTE ON FUNCTIONS TO "database_name_read_write";

-- grant usage on types
GRANT USAGE ON TYPE "public"."communication_type" TO "database_name_read_write";

-- grant execute on types to all future
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT USAGE ON TYPES TO "database_name_read_write";

-- USER

-- create a new users for db
CREATE USER "database_name_api" WITH PASSWORD 'fj........................................eh';

-- grant user access
GRANT "database_name_read_write" TO "database_name_api";

COMMIT;

-- @down

BEGIN;

-- USER

-- drop new users for db
DROP USER "database_name_api";

-- READ

-- revoke read
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA "public" FROM "database_name_read";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "public" FROM "database_name_read";
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "public" FROM "database_name_read";
REVOKE ALL PRIVILEGES ON TYPE "public"."communication_type" FROM "database_name_read";

-- revoke future read
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL PRIVILEGES ON TABLES FROM "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL PRIVILEGES ON SEQUENCES FROM "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL PRIVILEGES ON FUNCTIONS FROM "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"  REVOKE ALL PRIVILEGES ON TYPES FROM "database_name_read";

-- revoke read
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA "identity" FROM "database_name_read";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "identity" FROM "database_name_read";
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "identity" FROM "database_name_read";

-- revoke future read
ALTER DEFAULT PRIVILEGES IN SCHEMA "identity" REVOKE ALL PRIVILEGES ON TABLES FROM "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "identity" REVOKE ALL PRIVILEGES ON SEQUENCES FROM "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "identity" REVOKE ALL PRIVILEGES ON FUNCTIONS FROM "database_name_read";

-- revoke read
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA "log" FROM "database_name_read";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "log" FROM "database_name_read";
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "log" FROM "database_name_read";

-- revoke future read
ALTER DEFAULT PRIVILEGES IN SCHEMA "log" REVOKE ALL PRIVILEGES ON TABLES FROM "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "log" REVOKE ALL PRIVILEGES ON SEQUENCES FROM "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "log" REVOKE ALL PRIVILEGES ON FUNCTIONS FROM "database_name_read";

-- revoke read
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA "design" FROM "database_name_read";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "design" FROM "database_name_read";
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "design" FROM "database_name_read";

-- revoke future read
ALTER DEFAULT PRIVILEGES IN SCHEMA "design" REVOKE ALL PRIVILEGES ON TABLES FROM "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "design" REVOKE ALL PRIVILEGES ON SEQUENCES FROM "database_name_read";
ALTER DEFAULT PRIVILEGES IN SCHEMA "design" REVOKE ALL PRIVILEGES ON FUNCTIONS FROM "database_name_read";

-- revoke scheme read
REVOKE ALL PRIVILEGES ON SCHEMA "public" FROM "database_name_read";
REVOKE ALL PRIVILEGES ON SCHEMA "identity" FROM "database_name_read";
REVOKE ALL PRIVILEGES ON SCHEMA "log" FROM "database_name_read";
REVOKE ALL PRIVILEGES ON SCHEMA "design" FROM "database_name_read";

-- revoke db read
REVOKE ALL PRIVILEGES ON DATABASE "database_name" FROM "database_name_read";

-- drop read
DROP ROLE "database_name_read";

-- READ WRITE

-- revoke read write
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA "public" FROM "database_name_read_write";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "public" FROM "database_name_read_write";
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "public" FROM "database_name_read_write";
REVOKE ALL PRIVILEGES ON TYPE "public"."communication_type" FROM "database_name_read_write";

-- revoke future read write
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL PRIVILEGES ON TABLES FROM "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL PRIVILEGES ON SEQUENCES FROM "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public" REVOKE ALL PRIVILEGES ON FUNCTIONS FROM "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"  REVOKE ALL PRIVILEGES ON TYPES FROM "database_name_read_write";

-- revoke read write
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA "identity" FROM "database_name_read_write";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "identity" FROM "database_name_read_write";
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "identity" FROM "database_name_read_write";

-- revoke future read write
ALTER DEFAULT PRIVILEGES IN SCHEMA "identity" REVOKE ALL PRIVILEGES ON TABLES FROM "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "identity" REVOKE ALL PRIVILEGES ON SEQUENCES FROM "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "identity" REVOKE ALL PRIVILEGES ON FUNCTIONS FROM "database_name_read_write";

-- revoke read write
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA "log" FROM "database_name_read_write";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "log" FROM "database_name_read_write";
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "log" FROM "database_name_read_write";

-- revoke future read write
ALTER DEFAULT PRIVILEGES IN SCHEMA "log" REVOKE ALL PRIVILEGES ON TABLES FROM "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "log" REVOKE ALL PRIVILEGES ON SEQUENCES FROM "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "log" REVOKE ALL PRIVILEGES ON FUNCTIONS FROM "database_name_read_write";

-- revoke read write
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA "design" FROM "database_name_read_write";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "design" FROM "database_name_read_write";
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "design" FROM "database_name_read_write";

-- revoke future read write
ALTER DEFAULT PRIVILEGES IN SCHEMA "design" REVOKE ALL PRIVILEGES ON TABLES FROM "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "design" REVOKE ALL PRIVILEGES ON SEQUENCES FROM "database_name_read_write";
ALTER DEFAULT PRIVILEGES IN SCHEMA "design" REVOKE ALL PRIVILEGES ON FUNCTIONS FROM "database_name_read_write";

-- revoke read write scheme
REVOKE ALL PRIVILEGES ON SCHEMA "public" FROM "database_name_read_write";
REVOKE ALL PRIVILEGES ON SCHEMA "identity" FROM "database_name_read_write";
REVOKE ALL PRIVILEGES ON SCHEMA "log" FROM "database_name_read_write";
REVOKE ALL PRIVILEGES ON SCHEMA "design" FROM "database_name_read_write";

-- grant read write db
REVOKE ALL PRIVILEGES ON DATABASE "database_name" FROM "database_name_read_write";

-- drop read write
DROP ROLE "database_name_read_write";

-- TABLES

DROP TABLE IF EXISTS "public"."migrate";
DROP TABLE IF EXISTS "public"."configuration";
DROP TABLE IF EXISTS "public"."email_blocked";
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
DROP SCHEMA IF EXISTS "design";

COMMIT;