-- Add initial AIR organisation
INSERT INTO "identity"."organisation" ("active", "name", "name_unique", "description" )
VALUES (TRUE, 'dbduck', 'dbduck', 'dbduck system organisation');

-- Add some default users for devs
INSERT INTO "identity"."user" ("active", "name", "description")
VALUES (TRUE, 'Paul Smith', 'dbduck developer account');

-- Add user identity
INSERT INTO "identity"."user_identity" ("user_id", "identity", "type", "primary")
VALUES (1, 'p@ulsmith.net', 'email', TRUE);

-- Add user account (password)
INSERT INTO "identity"."user_account" ("user_id", "password")
VALUES (1, '35f989ed45e11031ba10824ae31928d98da99571f0dd75bfe8002d87defa53d48bc1b1ae105c635c07b975dbb56d1592c7a1b9d40e16264e1843aedc8ac3adcd');

-- Add department for Air Org
INSERT INTO "identity"."department" ("organisation_id", "active", "name", "name_unique", "description")
VALUES (1, TRUE, 'Development', 'development', 'dbduck development department');

-- Add group for Auper user access
INSERT INTO "identity"."group" ("name", "name_unique", "description")
VALUES
	('Super Admin', 'administrator.super', 'Super admin group for full system rights'),
	('Basic User', 'user.basic', 'Limited access to the bare minimum needed, to log in and access things like account.');

-- role for login access/auth
INSERT INTO "identity"."role" ("name", "name_unique", "description")
VALUES 
	('API access to your user account', 'api.identity.user', 'API access to your own user account.'),
	('UI access to user account route', 'ui.route.account', 'UI access to the account route for accessing your account.');

-- apply permissions to the group
INSERT INTO "identity"."group__role" ("group_id", "role_id", "read", "write", "delete")
VALUES 
	(1, 1, true, true, true),
	(1, 2, true, true, true);

-- assign user to basic group
INSERT INTO "identity"."user__group" ("user_id", "group_id")
VALUES (1, 1);

-- Add system config
INSERT INTO "public"."configuration" ("name_unique", "data")
VALUES
	('admin', '{"email": "no-reply@dbduck.net"}'),
	('registration', '{"autoActivateUser": false, "emailAdminRegistrationActivate": false, "emailAdminRegistrationCreated": false, "emailAdminRegistrationCompleted": false}');

-- End of file.