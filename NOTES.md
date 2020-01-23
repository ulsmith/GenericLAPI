# NOTES

Need to ensure JWT has...

indentifier (session/user/company etc)
reference (instance or reason for doing it, maybe an adevrrt reference)
iss (who created the jwt)
aud (who its going to)
roles: {
	definition: { read: true, write: false},
	payload: { read: false, write: true}
}

if no JWT and want anonymous...

pass identifier and reference as attributes on canvas and this will...

dont send JWT on Authorization header as 
Bearer .....
send the following
Identifier .... Reference ...

this will generate a JWT for you and will come back to the UI

* encrypt the data in payload
* maybe tie in origin to hash for payloads to ensure no cross site issues... maybe dump them in origin folder too
* add expire-month tag to expire data after a month on s3 payloads
* restrict non UI to certain endpoints??



02 Apr 2019 21:03:32	AccroCanvasLAPI	ROLLBACK_COMPLETE	-
02 Apr 2019 21:03:32	S3Bucket	DELETE_COMPLETE	-
02 Apr 2019 21:03:31	PayloadRole	DELETE_COMPLETE	-
02 Apr 2019 21:03:31	DefinitionRole	DELETE_COMPLETE	-
02 Apr 2019 21:03:31	NotFoundRole	DELETE_COMPLETE	-
02 Apr 2019 21:03:31	ActionsRole	DELETE_COMPLETE	-
02 Apr 2019 21:03:14	AccroCanvasLAPI	ROLLBACK_IN_PROGRESS	The following resource(s) failed to create: [PayloadRole, DefinitionRole, ActionsRole, S3Bucket, NotFoundRole]. . Rollback requested by user.
02 Apr 2019 21:03:13	ActionsRole	CREATE_FAILED	API: iam:CreateRole User: arn:aws:iam::230772823978:user/ulsmith is not authorized to perform: iam:CreateRole on resource: arn:aws:iam::230772823978:role/AccroCanvasLAPI-ActionsRole-1TCGXO5PIQOKA
02 Apr 2019 21:03:13	DefinitionRole	CREATE_FAILED	API: iam:CreateRole User: arn:aws:iam::230772823978:user/ulsmith is not authorized to perform: iam:CreateRole on resource: arn:aws:iam::230772823978:role/AccroCanvasLAPI-DefinitionRole-4S3WM2E2OCDO
02 Apr 2019 21:03:13	S3Bucket	CREATE_FAILED	ulsmith-lambda-test already exists
02 Apr 2019 21:03:13	PayloadRole	CREATE_FAILED	API: iam:CreateRole User: arn:aws:iam::230772823978:user/ulsmith is not authorized to perform: iam:CreateRole on resource: arn:aws:iam::230772823978:role/AccroCanvasLAPI-PayloadRole-10HNAB4EZNXGU
02 Apr 2019 21:03:13	NotFoundRole	CREATE_FAILED	API: iam:CreateRole User: arn:aws:iam::230772823978:user/ulsmith is not authorized to perform: iam:CreateRole on resource: arn:aws:iam::230772823978:role/AccroCanvasLAPI-NotFoundRole-1170ZBJY9IERT
02 Apr 2019 21:03:12	DefinitionRole	CREATE_IN_PROGRESS	-
02 Apr 2019 21:03:12	S3Bucket	CREATE_IN_PROGRESS	-
02 Apr 2019 21:03:12	ActionsRole	CREATE_IN_PROGRESS	-
02 Apr 2019 21:03:12	PayloadRole	CREATE_IN_PROGRESS	-
02 Apr 2019 21:03:12	NotFoundRole	CREATE_IN_PROGRESS	-
02 Apr 2019 21:03:08	AccroCanvasLAPI	CREATE_IN_PROGRESS	User Initiated
02 Apr 2019 21:03:03	AccroCanvasLAPI	REVIEW_IN_PROGRESS	User Initiated





sam package --profile ulsmith --template-file template.yaml --s3-bucket ulsmith-cloudformation-build --output-template-file packaged.yaml

sam deploy --profile ulsmith --template-file ./packaged.yaml --stack-name ulsmith-cloudformation-snaggerlapi --capabilities CAPABILITY_IAM --region eu-west-2



  Api:
    EndpointConfiguration: REGIONAL
    Cors:
      AllowMethods: 'GET,POST,PUT,PATCH,DELETE'
      # For example, "'GET,POST,DELETE'". If you omit this property, then SAM will automatically allow all the methods configured for each API. 
      # Checkout [HTTP Spec](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods) more details on the value.

      AllowHeaders: 'Accept,Cache-Control,Content-Type,Content-Length,Authorization,Pragma,Expires'
      # For example, "'X-Forwarded-For'". Checkout [HTTP Spec](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers) for more details on the value

      AllowOrigin: '*' 
      # For example, "'www.example.com'". Checkout [HTTP Spec](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) for more details on this value.

      MaxAge: '0'
      # For example, "'600'" will cache request for 600 seconds. Checkout [HTTP Spec](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age) for more details on this value

      AllowCredentials: true
      # Header is omitted when false. Checkout [HTTP Spec](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials) for more details on this value.
      