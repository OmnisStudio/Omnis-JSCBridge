See other branches for alternative versions compatible with other Omnis Studio versions.

# Requirements
Omnis Studio **10.1**.

# Installation

* Copy the **jsclient_bridge** folder into Omnis' **htmlcontrols** folder (in the application area).
* Copy the following folders from Omnis' **html** directory (in the _writeable files_ section of the install) into 
**htmlcontrols/jsclient_bridge**.
    * **css**
    * **scripts**
    * **icons**
    * **images** 
    * **themes**

(this jsclient_bridge folder, with JS Client resources, can now be moved around as a complete component - e.g. added to a runtime tree)

### Chromium Flags:
This control requires some Chromium flags to be set, in order to allow CORS inside oBrowser
(to allow access to localhost from file:// URLs).

Add the following to **config.json**, inside the **obrowser** section:

    "cefSwitches": [
        "allow-file-access-from-files",
        "disable-web-security"
     ]
 

# Usage

## Loading a Form:

1) Add an **oBrowser** external component to your window.
2) Set oBrowser's **$urlorcontrolname** property to '**jsclient_bridge**'.
3) Edit oBrowser's **$htmlcontroloptions**, and set the **omnisclass**, **omnislibrary** and **serverport** columns.
This will cause the form to be loaded automatically, and will also display the form in design mode.
    * _If you wish to load a form from another Omnis server, you'll also need to populate the **webserverurl** and **omnisserverandport** properties._

If you wish to change the form, call oBrowser's **$callmethod()**, passing '**loadForm**' as first param, and a row with
'**omnisclass**' and '**omnislibrary**' columns as the second param.
This row could also optionally contain '**webserverurl**'  and/or '**omnisserverandport**' cols, if you wish to load a form
hosted elsewhere.

## Messaging
### Fat Client to JS Client

#### Sending:
You use oBrowser's **$callmethod()** method to call the **sendMessageToJSClient** method.

This takes a Row containing a column named **messageID** (type Character) and a column named **data** (any supported type).

In order to send complex data to the client, you would make the _data_ column type **Row**.

E.g:

    Do lJSCMessageRow.$define(messageID, data)
    Do lJSCMessageRow.$assigncols("SetCustomerDetails",iCustomersList.[iCustomersList.$line])
    Do $cinst.$objs.oBrowser.$callmethod("sendMessageToJSClient",lJSCMessageRow)
    
If the form has not yet loaded, the message will be deferred until it has.

You **must**, however, wait until the **CONTROL_READY** message has been fired before attempting to send a message (see below).


#### Receiving:
You should implement a private _class_ method on the remote form which oBrowser is running named **htmlcontrolMessage** 
(No '$'. It can be client- or server-executed).

This method will receive 2 parameters - the first will be the **messageID** passed from the fat client, and the second 
will be the **data** passed from the fat client.


### JS Client to Fat Client

#### Sending:
You need to execute the following JavaScript code to send a message to the fat client:
    
    jControl.callbackObject.sendMessageToFatClient(pID, pData);
    
* **pID** should be a string identifying the message.
* **pData** should be a supported JavaScript data type (e.g. a _string_, _boolean_, _number_, _omnis_date_. 
Could also be a _JavaScript object_ containing these types (it will be converted to a row), or an _omnis_raw_list_ or _omnis_list_ instance.).

You would probably do this using the **JavaScript:** command from a client-executed method.


#### Receiving:
oBrowser's **evControlEvent** will be fired when the fat client receives a message from the JS client.

* **pInfo.id** will contain the message ID.
* **pInfo.data** will contain any data sent with the message.

The control sends some special messages automatically, with the following IDs:

* **CONTROL_READY**: The control has initialised, the web socket is connected, and you may now call methods on it.
* **JSC_LOADED**: The Omnis JavaScript client has loaded, along with the initial form(s).

# API

## Properties
Properties are set on oBrowser's **$htmlcontroloptions** property.

Property Name | Property Value
------------- | --------------
omnislibrary  | The name of the Omnis library containing the form to load automatically. _(Required for automatic form loading)_
omnisclass    | The name of the Remote Form class to load automatically. _(Required for automatic form loading)_
webserverurl  | The URL to the Omnis web server plugin. _(Optional for automatic form loading)._ Omit to use the local Omnis server.
omnisserverandport  | The **$serverport** or **ip-address:$serverport** of the Omnis server. _(Optional for automatic form loading)_ Omit to use the local Omnis server.
serverport  | The **$serverport** Omnis. _(Optional)_ Only used for local connections, when _webserverurl_ is not provided. Only necessary if you've changed the **htmlControlPort** config.json option.

## Methods
Methods are called with oBrowser's **$callMethod** method.

The first parameter is the **name** of the method you wish to call, the second parameter is the method's **parameter** (it can have only one).

#### sendMessageToJSClient
Sends a message to the Remote Form. The form's **htmlcontrolMessage** method will be called, with the passed data.

Its parameter is a **Row** with the following columns:

Column Name | Type       | Column Value
----------- | -----------| ---------------------
messageID   | Character  | An identifier for the message.
data        | Any        | The data to pass through to the JS client. Use a Row to send complex data.
form        | Character  | _(Optional)_ The name of the form to pass the message to. If omitted, will _attempt_ to get the active form.

Example:

    Do lRow.$define(messageID, form, data)
    Do lRow.$assigncols("doSomething", "jsMyForm", iDataRow)
    Do $cinst.$objs.oBrowser.$callMethod("sendMessageToJSClient", lRow)

### loadForm
Loads a Remote Form.

Its parameter is a **Row**. The column names of which will be added as "data-<colname>" attributes of the omnisobject1 element.
As such, it could likely contain the following columns:

Column Name | Type       | Column Value
----------- | -----------| ---------------------
omnislibrary| Character  | The name of the Omnis library containing the form.
omnisclass  | Character  | The name of the Remote Form class.
webserverurl| Character  | _(Optional)_ The URL to the Omnis web server plugin. Leave empty/omit to connect directly to the local Omnis instance.
omnisserverandport| Character | _(Optional)_ $serverport/<ipaddress>:$serverport of Omnis server. Leave empty if using a direct connection.

Example:

    Do lRow.$define(omnislibrary, omnisclass)
    Do lRow.$assigncols("myLibrary", "jsMyForm")
    Do $cinst.$objs.oBrowser.$callMethod("loadForm", lRow)
    
    
# Notes:

### macOS only
* The design window's context menu option to _Open Window..._ has extra processing which clears the whole execution stack (including any pending JS Client requests).
If you use the context menu on macOS to test your window, you may find that the JS Client doesn't load.

* Due to the threading model on macOS (oBrowser executes client code on the main thread), sending a synchronous disconnect message to Omnis causes hangs.
    
    * To avoid this, the JS Client disconnect message is sent to Omnis asynchronously - this does however mean that there's a chance the disconnect message _may_ not reach Omnis, and the Remote Task instance is not closed.
        * This should not cause licensing issues, as all instances of oBrowser should use the same connection license.
        * Make sure to set a **$timeout** on your Remote Task, so they'll be closed eventually. 
