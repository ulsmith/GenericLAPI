-- @type postgres --
-- @database database --
-- @name load-test-data --
-- @author Paul Smith --
-- @copywrite n/a --
-- @date 2020-07-06 --

-- @parse --

BEGIN;

-- Add initial AIR organisation
INSERT INTO "identity"."organisation" ("id", "active", "name", "name_unique", "description" )
VALUES ('113c5698-6175-4d5e-8576-4037274039fd', TRUE, 'database', 'database', 'database system organisation');

-- Add some default users for devs
INSERT INTO "identity"."user" ("id", "active", "name", "description")
VALUES ('71f3d3a7-9937-48f9-8346-cd9fedb19080', TRUE, 'Paul Smith', 'database developer account');

-- Add user identity
INSERT INTO "identity"."user_identity" ("user_id", "identity", "type", "primary")
VALUES ('71f3d3a7-9937-48f9-8346-cd9fedb19080', 'p@ulsmith.net', 'email', TRUE);

-- Add user account (password)
INSERT INTO "identity"."user_account" ("user_id", "password")
VALUES ('71f3d3a7-9937-48f9-8346-cd9fedb19080', '35f989ed45e11031ba10824ae31928d98da99571f0dd75bfe8002d87defa53d48bc1b1ae105c635c07b975dbb56d1592c7a1b9d40e16264e1843aedc8ac3adcd');

-- Add department for database Org
INSERT INTO "identity"."department" ("organisation_id", "active", "name", "name_unique", "description")
VALUES ('113c5698-6175-4d5e-8576-4037274039fd', TRUE, 'Development', 'development', 'database development department');

-- Add group for Auper user access
INSERT INTO "identity"."group" ("id", "name", "name_unique", "description")
VALUES
	('e829afa6-ec4e-47c1-9a90-4601603e9f60', 'Super Admin', 'administrator.super', 'Super admin group for full system rights'),
	('3e460a4f-5717-4475-8aff-2eddcf1ee507', 'Basic User', 'user.basic', 'Limited access to the bare minimum needed, to log in and access things like account.');

-- role for login access/auth
INSERT INTO "identity"."role" ("id", "name", "name_unique", "description")
VALUES 
	('2760020e-5a6f-4969-b1fd-518e9387a324', 'UI access to user account route', 'ui.route.account', 'UI access to the account route for accessing your account.'),
	('48e5cf49-778d-4c8f-b1ee-38f3d13fbcb7', 'API access to your user account', 'api.identity.user', 'API access to your own user account.'),
	('46e8d84f-4e1f-4abf-a474-8a7c3a93b305', 'UI access to user admin route', 'ui.route.admin', 'UI access to the admin route for accessing your account.'),
	('fba04eb8-6b23-4542-a319-a419273ac815', 'API access to configuration', 'api.system.configuration', 'API config access for managing configs on the system.'),
	('4ee4350c-f362-4cc8-8967-12735ed17d9a', 'API system access to all users', 'api.identity.user.system', 'API system access to all users.');

-- apply permissions to the group
INSERT INTO "identity"."group__role" ("group_id", "role_id", "read", "write", "delete")
VALUES 
	('e829afa6-ec4e-47c1-9a90-4601603e9f60', '2760020e-5a6f-4969-b1fd-518e9387a324', true, true, true),
	('e829afa6-ec4e-47c1-9a90-4601603e9f60', '48e5cf49-778d-4c8f-b1ee-38f3d13fbcb7', true, true, true),
	('e829afa6-ec4e-47c1-9a90-4601603e9f60', '46e8d84f-4e1f-4abf-a474-8a7c3a93b305', true, true, true),
	('e829afa6-ec4e-47c1-9a90-4601603e9f60', 'fba04eb8-6b23-4542-a319-a419273ac815', true, true, true),
	('e829afa6-ec4e-47c1-9a90-4601603e9f60', '4ee4350c-f362-4cc8-8967-12735ed17d9a', true, true, true),
	('3e460a4f-5717-4475-8aff-2eddcf1ee507', '2760020e-5a6f-4969-b1fd-518e9387a324', true, true, true),
	('3e460a4f-5717-4475-8aff-2eddcf1ee507', '48e5cf49-778d-4c8f-b1ee-38f3d13fbcb7', true, true, true);

-- assign user to basic group
INSERT INTO "identity"."user__group" ("user_id", "group_id")
VALUES ('71f3d3a7-9937-48f9-8346-cd9fedb19080', 'e829afa6-ec4e-47c1-9a90-4601603e9f60');

-- Add system config
INSERT INTO "public"."configuration" ("name_unique", "data")
VALUES
	('admin', '{"email": "no-reply@database.net"}'),
	('registration', '{"autoActivateUser": false, "emailAdminRegistrationActivate": true, "emailAdminRegistrationCreated": true, "emailAdminRegistrationCompleted": true}');

-- End of file.

COMMIT;