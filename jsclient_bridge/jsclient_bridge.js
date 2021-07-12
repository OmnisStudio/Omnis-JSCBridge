var isMac = navigator.userAgent.indexOf("AppleWebKit") > -1;

var origOnLoad = jOmnis.onLoad;

jOmnis.onLoad = function() {
	console.log("dummy onload");
}

function JSCBridge() {

	/*** PRIVATE VARS ***/
	var omnisPort;
	var settings;
	var startingUp = true;


	/**
	 * Called to set the control's $htmlcontroloptions (i.e. the control's custom properties).
	 * @param options		An object containing the keys and values of $htmlcontroloptions.
	 */
	this.omnisSetOptions = function(options) {

		settings = options;

		if (options.serverport > 0) // If the 'serverport' option is set, override the value of omnisPort.
			omnisPort = options.serverport;

		// If we're starting up, and the omnislibrary & omnisclass settings are set, try to open the form now
		if (startingUp && settings.omnislibrary && settings.omnisclass) {
			var params = {
				"omnislibrary": settings.omnislibrary,
				"omnisclass": settings.omnisclass
			};

			if (settings.webserverurl) params.webserverurl = settings.webserverurl;
			if (settings.omnisserverandport) params.omnisserverandport = settings.omnisserverandport;

			this.loadForm(params);
		}

		startingUp = false;
	};


	/**
	 * Omnis has opened the web socket connection.
	 * Messages may now be passed.
	 * @param port			The Web Socket connection's port.
	 */
	this.omnisOnWebSocketOpened = function (port)
	{
		omnisPort = (port - 1); // Omnis' $serverport is 1 less than the websocket port (by default)
		jControl.sendControlEvent({"id": "CONTROL_READY", "data": null}); // Notify the developer that the web socket is now open, so you can now use $callMethod() etc.
	};


	/**
	 * Called when the tab key is pressed. Prevents default Omnis handling (moving focus to next field).
	 * This should call jControl.tabOutOfControl() if the key press should move the focus out of oBrowser.
	 * @param event						The key event.
	 */
	this.omnisTab = function(event) {

		var isShiftTab = event.shiftKey;

		var omnisObj;
		var elem = event.target;
		while (elem && elem.parentNode) {
			if (elem.omnisObject) {
				omnisObj = elem.omnisObject;
				break;
			}
			elem = elem.parentNode;
		}

		if (omnisObj) {
			var nextTabObj = omnisObj.form.getNextPrevTabObject(omnisObj, isShiftTab);
			console.log("Next tab obj: " + (nextTabObj && nextTabObj.clientElem.id));
			var tabbingOut = nextTabObj == null || (isShiftTab ? nextTabObj.objNumber > omnisObj.objNumber : nextTabObj.objNumber < omnisObj.objNumber);
			if (tabbingOut)
				jControl.tabOutOfControl(isShiftTab);
		}

	};


	/**
	 * Loads a form in the control.
	 * Adds 'data-<colname>' attributes to the omnisobject element, then attempts to load the form.
	 * Should contain at least the following columns:
	 *		omnislibrary
	 * 	 	omnisclass
	 * and optionally:
	 * 		webserverurl
	 * 		omnisserverandport
	 *
	 * @param row 		A row whose columns will be set as data- attributes.
	 */
	this.loadForm = function(row)
	{

		if (origOnLoad) {
			jOmnis.onLoad = origOnLoad;
			origOnLoad = null;
		}
		var omnisObj = document.getElementById("omnisobject1");

		omnisObj.setAttribute("data-webserverurl", "http://127.0.0.1:" + omnisPort);

		for (var col in row) {
			omnisObj.setAttribute("data-" + col, row[col]);
		}

		jOmnis.onLoad();
	};


	/**
	 * Calls the 'htmlcontrolMessage' class method of the top form.
	 * @param row					A row with a 'messageID' column (text) and a 'data' column (anything).
	 */
	this.sendMessageToJSClient = function(row)
	{
		try
		{
			var inst = jOmnis.omnisInsts[0];
			var form = row["form"] ? inst.formGet(inst.formFindByName(row.form)) : inst.formGet(-1);
		}
		finally
		{
			if (form)
				form.callMethodEx("htmlcontrolMessage", 0, row.messageID, row.data);
			else {// If the form is not loaded yet, try again in 50ms:
				setTimeout(function () {
					jControl.callbackObject.sendMessageToJSClient(row);
				}, 50);
			}
		}
	};


	/**
	 * Called by JavaScript code in the running Remote Form to send a message to the Fat client.
	 * @param id					An identifier for the message.
	 * @param data				The data payload to send.
	 */
	this.sendMessageToFatClient = function(id, data)
	{
		jControl.sendControlEvent({"id": id, "data": data}, true);
	};

}

jControl.callbackObject = new JSCBridge();



window.addEventListener('omnisReady', function() {
	jControl.sendControlEvent({"id": "JSC_LOADED"}, false); // The JS Client has now loaded, along with all initial forms.
});

// Sending a synchronous disconnect with the webview on macOS causes hangs.
// Send async on this platform - more performant, but a chance the disconnect may not get through...
jOmnis.asyncDisconnect = isMac;