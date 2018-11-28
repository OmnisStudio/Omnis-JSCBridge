 # Requirements

Omnis Studio **8.1.6** or later.

## Contents

##### OAUTH2

This folder contains the source JSON files for the OAuth2 Omnis library which can be used to integrate your Omnis application with other third party services via OAuth2 standard.


##### OAUTH2_DEMO

This folder contains the source JSON files for the OAuth2 demo Omnis library which can be used to learn more about the OAuth2 library.


##### OAUTH2_OmnisLibraries

This folder contains the Omnis libraries (.lbs) for the OAuth2 standard and a demo.

# Usage

1) Create a variable of type **Object** and set the subtype to the **oAuth2** object in the OAUTH2 library.

2) Create two public methods: $tokenReceived and $tokenError.

3) Call oAuth2's $init public method and pass the required parameters:

		Do oAuth2.$init(pClientID, pClientSecret, pAccessCodeURL, pAccessTokenURL, [pScope, pRedirectURI])
		
4) Call oAuth2's $getToken public method and pass the required parameters in order to get the authorization token:

		Do oAuth2.$getToken(pCallbackObject, [pCallbackMethodSuccessful=‘$tokenReceived’, pCallbackMethodError=‘$tokenError’, pFormInstance])

5) If everything is successful, you will receive the following parameters in the $tokenReceived method in the specified pCallbackObject: access token, refresh token, expiry date (Date Time #FDT)

6) If an error occurred, you will receive a row variable containing more details in the $tokenError method in the specified pCallbackObject.

## Examples

**Fat client**

	Do oAuth2.$init(lCLientID, lClientSecret, lAccessCodeURL, lAccessTokenURL, [lScope, lRedirectURI])

	Do oAuth2.$getToken($cinst)

After the oAuth2 flow is finished, the access token, refresh token and the #FDT formatted DateTime indicating the expiry date of the access token will be returned to the $tokenReceived method in the current instance that instantiated the oAuth2 object. You can also change both $tokenReceived and $tokenError such as in this example which comes after $init:

	Do oAuth2.$getToken($cinst,'$receiveToken','$errorReceivingToken')

**JavaScript client**

	Do oAuth2.$init(lClientID, lClientSecret, lAccessCodeURL, lAccessTokenURL, [lScope, lRedirectURI])

	Do oAuth2.$getToken($cinst,,,$cinst)


After the oAuth2 flow is finished, the access token, refresh token and the #FDT formatted DateTime indicating the expiry date of the access token will be returned to the $tokenReceived method in the remote form instance that instantiated the oAuth2 object.


## Details

Client ID – this will be provided by the third party service you are trying to access through OAuth2.

Client Secret – this will be provided by the third party service as well.

Access Code URL – this will be the URL where the request for the access code is made. The third party service will provide this.

Access Token URL – this will be the URL where the request for the access token is made. The third party service will provide this as well.

Scope – this is optional, it will be added to the request headers. For example, some third party services will require you to pass a scope as well to determine which part of their service you can access. For example, Google’s Gmail API has different OAuth2 scopes: https://developers.google.com/identity/protocols/googlescopes

pRedirectURI – you can use this parameter to pass in your own redirect URI. If it is not passed, Omnis will use a Web Service Server with a /code endpoint that receives GET requests in order to receive the access code which is successively exchanged for an access token.

# API

### Methods
Methods can be called by creating a variable in your application of type Object and of subtype oAuth2 object in the OAUTH2 library.

**$init** 
Method to initialise the oAuth2 object. Usually, $init is the first method that is called.

Parameter | Type | Value
-|-|-
Client ID | Character | Client ID provided by the third party service you are trying to access.
Client Secret | Character | Client Secret provided by the third party service you are trying to access.
Auth Code URL | Character | Authorization code URL provided by the third party service you are trying to access.
Auth Token URL | Character | Authorization Token URL provided by the third party service you are trying to access.
[Scope] | Character | Optional scope to be sent with the requests. Usually used to specify which party of the third party system will the Token allow you to access.
[Redirect URI] | Character | Optional redirect URI when using your own web server.
---
**$getToken** 
Method called to get an authorization token. 
Parameter | Type | Value
-|-|-
Callback Object|Item reference|Reference to the object which holds the 'successful' and 'error' callback methods
[Callback Method Successful]|Character|Optional name of callback method when $getToken is successful
[Callback Method Error]|Character|Optional name of callback method when $getToken is not successful
[Remote Form Object]|Item reference|Optional reference to remote form instance if a remote form is used
Remote Form Object should be passed only when using a remote form.
Returns: Access Token, Refresh Token and Expiry date to Callback Method Successful OR row variable with more information to Callback Method Error, in the Callback Object.

---
**$setToken**
Allows setting a token to the current instance of the oAuth2 object.

Parameter | Type | Value
-|-|-
Access Token| Character | Access token
[Refresh Token]| Character | Optional refresh token
[Expires on (#FDT)]| DateTime (#FDT) | Optional DateTime timestamp formatted in #FDT of the expiry date of the access token
---
**$getAuthCodeParameters**
Returns: row variable containing the parameters that will be used for authorization code request

---
**$setAuthCodeParameters**
Allows adding extra parameters to the authorization code request.

Parameter | Type | Value
-|-|-
Key|Character|Parameter key e.g. Accept
Value|Character|Parameter value e.g. application/json
---
**$clearToken**
Clears the Access Token, Refresh Token and Expires On variables stored in the instantiated oAuth2 object.

---
**$setManualAuthWindowCallback**
Allows setting a specific callback method and instance for when the access token is sent back before the authorization window gets closed.

Parameter | Type | Value
-|-|-
Callback Method|Character|Name of the callback method
Callback Instance|Item reference|Reference to the object which holds the callback method e.g. $cinst

---
