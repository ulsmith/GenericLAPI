# NOTES

* Split middleware so we call in and out directly...
* make MW use await and force running order

## Permissions

### raw crud access to data

api.identity.user                               access to your user
api.identity.user.related                       access to related users (same org)
api.identity.user.all                           access to all users
api.identity.organisation                       access to your organisation
api.identity.organisation.all                   access to all organisations

api.identity.department                         access to department your logged in as
api.identity.department.user                    access to department your logged in as
api.identity.department.department              access to department your logged in as
api.identity.department.organisation            access to departments in the organisation your logged in as
api.identity.department.system                  access to departments in the system

api.identity.xyz                                access to xyz restricted 
api.identity.department.organisation            access to departments in the organisation your logged in as
api.identity.department.all                     access to departments in the system

examples of checking a permission as written in code and what will resolve to it db perm > code check

one.two.three > one.two.three || one.two.three/four || one.two.three/four/five
one.two.three.four > one.two.three.four || one.two.three/foo.four/bar || one.two.three/foo/faz.four/bar/baz