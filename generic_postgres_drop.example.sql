-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2020-01-29 21:10:09.319

-- foreign keys
ALTER TABLE identity.department_group
    DROP CONSTRAINT department_group_department;

ALTER TABLE identity.department_group
    DROP CONSTRAINT department_group_group;

ALTER TABLE identity.department
    DROP CONSTRAINT department_organisation;

ALTER TABLE identity.department_role
    DROP CONSTRAINT department_role_department;

ALTER TABLE identity.department_role
    DROP CONSTRAINT department_role_role;

ALTER TABLE identity.group_role
    DROP CONSTRAINT group_role_group;

ALTER TABLE identity.group_role
    DROP CONSTRAINT group_role_role;

ALTER TABLE identity.user_account
    DROP CONSTRAINT user_account_user;

ALTER TABLE identity.user_department
    DROP CONSTRAINT user_department_department;

ALTER TABLE identity.user_department
    DROP CONSTRAINT user_department_user;

ALTER TABLE identity.user_group
    DROP CONSTRAINT user_group_group;

ALTER TABLE identity.user_group
    DROP CONSTRAINT user_group_user;

ALTER TABLE identity.user_identity
    DROP CONSTRAINT user_identity_user;

ALTER TABLE identity.user_role
    DROP CONSTRAINT user_role_role;

ALTER TABLE identity.user_role
    DROP CONSTRAINT user_role_user;

-- tables
DROP TABLE identity.department;

DROP TABLE identity.department_group;

DROP TABLE identity.department_role;

DROP TABLE identity."group";

DROP TABLE identity.group_role;

DROP TABLE identity.organisation;

DROP TABLE identity.role;

DROP TABLE identity."user";

DROP TABLE identity.user_account;

DROP TABLE identity.user_department;

DROP TABLE identity.user_group;

DROP TABLE identity.user_identity;

DROP TABLE identity.user_role;

-- End of file.

