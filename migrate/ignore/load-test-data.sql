-- @type postgres
-- @database somename
-- @name load-test-data
-- @author Paul Smith
-- @copywrite n/a
-- @date 2020-07-06

-- @parse

BEGIN;

-- Add initial AIR organisation
INSERT INTO "identity"."organisation" ("id", "active", "name", "name_unique", "description" )
VALUES ('113c5698-...............-4037274039fd', TRUE, 'somename', 'somename', 'somename system organisation');

-- Add some default users for devs
INSERT INTO "identity"."user" ("id", "active", "name", "description")
VALUES
	('71f3d3a7-.........-cd9fedb19080', TRUE, 'Paul Smith', 'somename developer account'),
	('5fe2c11f-.........-c4a0aab1471a', TRUE, 'Test User', 'test user account');

-- Add user identity
INSERT INTO "identity"."user_identity" ("user_id", "identity", "type", "primary")
VALUES
	('71f3d3a7-.........-cd9fedb19080', 'p@ulsmith.net', 'email', TRUE),
	('5fe2c11f-.........-c4a0aab1471a', 'info@somename.net', 'email', TRUE);

-- Add user account (password)
INSERT INTO "identity"."user_account" ("user_id", "password")
VALUES
	('71f3d3a7-.........-cd9fedb19080', '35f989ed45e11031ba10824ae31928d98da99571f0dd75bfe8002d87defa53d48bc1b1ae105c635c07b975dbb56d1592c7a1b9d40e16264e1843aedc8ac3adcd'),
	('5fe2c11f-.........-c4a0aab1471a', '35f989ed45e11031ba10824ae31928d98da99571f0dd75bfe8002d87defa53d48bc1b1ae105c635c07b975dbb56d1592c7a1b9d40e16264e1843aedc8ac3adcd');

-- Add department for somename Org
INSERT INTO "identity"."department" ("id", "organisation_id", "active", "name", "name_unique", "description")
VALUES ('d5013d89-..............-c104af874464', '113c5698-...............-4037274039fd', TRUE, 'Development', 'development', 'somename development department');

-- Add user to department for somename Org
INSERT INTO "identity"."user__department" ("user_id", "department_id", "department_organisation_id")
VALUES ('71f3d3a7-.........-cd9fedb19080', 'd5013d89-..............-c104af874464', '113c5698-...............-4037274039fd');

-- Add group for super user access
INSERT INTO "identity"."group" ("id", "name", "name_unique", "description")
VALUES
	('e829afa6-..............-4601603e9f60', 'Super Admin', 'administrator.super', 'Super admin group for full system rights'),
	('3e460a4f-..............-2eddcf1ee507', 'Basic User', 'user.basic', 'Basic access to the bare minimum needed, to log in and access things like account, limited online usage.'),
	('5baf5bd5-..............-73f47c072445', 'Low User', 'user.low', 'Low access to the bare minimum needed, to log in and access things like account, low online usage.'),
	('11b11c4d-..............-857707698470', 'Medium User', 'user.medium', 'Medium access to the bare minimum needed, to log in and access things like account, medium online usage.'),
	('0844039d-..............-18c75d82a8bc', 'High User', 'user.high', 'High access to the bare minimum needed, to log in and access things like account, high online usage.'),
	('32b738c4-..............-589a32046bab', 'Full User', 'user.full', 'Full access to the bare minimum needed, to log in and access things like account, full online usage.');

-- role for login access/auth
INSERT INTO "identity"."role" ("id", "name", "name_unique", "description")
VALUES 
	('fba04eb8-..............-a419273ac815', 'API access to configuration', 'api.system.configuration', 'API config access for managing configs on the system.'),
	('4ee4350c-..............-12735ed17d9a', 'API system access to all users', 'api.identity.user.system', 'API system access to all users.'),
	('2760020e-..............-518e9387a324', 'UI access to user account route', 'ui.route.account', 'UI access to the account route for accessing your account.'),
	('46e8d84f-..............-8a7c3a93b305', 'UI access to user admin route', 'ui.route.admin', 'UI access to the admin route for accessing your account.'),
	('afec1b4a-..............-6cb212f612a0', 'UI access to user browser route', 'ui.route.browser', 'UI access to the admin route for accessing your account.');

-- apply permissions to the group
INSERT INTO "identity"."group__role" ("group_id", "role_id", "read", "write", "delete")
VALUES 
	-- Super Admin Group
	('e829afa6-..............-4601603e9f60', '2760020e-..............-518e9387a324', true, true, true),
	('e829afa6-..............-4601603e9f60', '48e5cf49-..............-38f3d13fbcb7', true, true, true),
	('e829afa6-..............-4601603e9f60', '46e8d84f-..............-8a7c3a93b305', true, true, true),
	('e829afa6-..............-4601603e9f60', 'fba04eb8-..............-a419273ac815', true, true, true),
	('e829afa6-..............-4601603e9f60', '4ee4350c-..............-12735ed17d9a', true, true, true),
	('e829afa6-..............-4601603e9f60', 'afec1b4a-..............-6cb212f612a0', true, true, true),

	-- Basic User Group
	('3e460a4f-..............-2eddcf1ee507', '2760020e-..............-518e9387a324', true, true, true),
	('3e460a4f-..............-2eddcf1ee507', 'afec1b4a-..............-6cb212f612a0', true, true, true),
	('3e460a4f-..............-2eddcf1ee507', '48e5cf49-..............-38f3d13fbcb7', true, true, true);

-- assign user to basic group
INSERT INTO "identity"."user__group" ("user_id", "group_id")
VALUES
	-- super admin user super adming group, basic group and full group for paul
	('71f3d3a7-.........-cd9fedb19080', 'e829afa6-..............-4601603e9f60'),
	('71f3d3a7-.........-cd9fedb19080', '3e460a4f-..............-2eddcf1ee507'),
	-- test user basic user group for test
	('5fe2c11f-.........-c4a0aab1471a', '3e460a4f-..............-2eddcf1ee507');

-- Add system config
INSERT INTO "public"."configuration" ("name_unique", "data")
VALUES
	('admin', '{"email": "no-reply@somename.net"}'),
	('registration', '{"autoActivateUser": false, "emailAdminRegistrationActivate": true, "emailAdminRegistrationCreated": true, "emailAdminRegistrationCompleted": true}');

-- End of file.

COMMIT;