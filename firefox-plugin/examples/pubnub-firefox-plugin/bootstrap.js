const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyGetter(this, "sss", function () {
  return Cc["@mozilla.org/content/style-sheet-service;1"]
           .getService(Ci.nsIStyleSheetService);
});


var addonData = null;  // Set this in startup()
var scopes = {};
function require(module)
{
  if (!(module in scopes)) {
    let url = addonData.resourceURI.spec + "packages/" + module + ".js";
    scopes[module] = {
      require: require,
      exports: {},
      Cc: Components.classes,
      Ci: Components.interfaces,
      Cu: Components.utils
    };
    Services.scriptloader.loadSubScript(url, scopes[module]);
  }
  return scopes[module].exports;
}



var pubnub;

function init() {
  pubnub = require("pubnub").init({
    publish_key   : "demo",
    subscribe_key : "demo"
  });
}

var prefsPrefix = "extension.pubnub.";
var idPrefix = "pubnub-";

function alert(string) {
  Services.prompt.alert(Services.wm.getMostRecentWindow("navigator:browser"), "", string);
} 

function onSubscribeCommand(event) {
  !pubnub && init();
  if (event.target.id != idPrefix + "buttonSubscribe") {
    return;
  }
  var win = Services.wm.getMostRecentWindow("navigator:browser");
  var doc = win.document;
  var input_channel = {value: ""};
  var input_presence = {value: false};
  var result1 = Services.prompt.prompt(null, "PubNub", "Enter Channel Name :", input_channel, null, {});
  var result2 = Services.prompt.confirm(null, "PubNub", "Presence ? :", input_presence, null, {});


  var window = Services.wm.getMostRecentWindow("navigator:browser");

  var params = {
    channel : input_channel.value,
    callback : function(m){
      var window = Services.wm.getMostRecentWindow("navigator:browser");
      var notification = new window.Notification("PubNub", {
        body: JSON.stringify(m),
        tag: "pubnub",
        icon: "chrome://pubnub/skin/icon.png"
      });
    } 
  };

  if (input_presence.value === true) {
    params['presence'] = function(m){
      var window = Services.wm.getMostRecentWindow("navigator:browser");
      var notification = new window.Notification("PubNub", {
        body: JSON.stringify(m),
        tag: "pubnub",
        icon: "chrome://pubnub/skin/icon.png"
      });
    }; 
  }

  if (result1) {
    pubnub.subscribe(params);
  }
}

function onPublishCommand(event) {
  !pubnub && init();
  if (event.target.id != idPrefix + "buttonPublish") {
    return;
  }
  var win = Services.wm.getMostRecentWindow("navigator:browser");
  var doc = win.document;
  var input_channel = {value: ""};
  var input_message = {value: ""};
  var result1 = Services.prompt.prompt(null, "PubNub", "Enter Channel Name:", input_channel, null, {});
  var result2 = Services.prompt.prompt(null, "PubNub", "Enter a message:", input_message, null, {});

  if (result1 && result2) {
    pubnub.publish({
        channel : input_channel.value,
        message : input_message.value,
        callback : function(m){
        var window = Services.wm.getMostRecentWindow("navigator:browser");
        var notification = new window.Notification("PubNub", {
          body: JSON.stringify(m),
          tag: "pubnub",
          icon: "chrome://pubnub/skin/icon.png"
        });
      } 
    })
  }
}


/* Save the current toolbarbutton position in preferences
*/
function saveButtonPosition(event) {
  var button = event.target.ownerDocument.getElementById(idPrefix + "buttonSubscribe");
  if (button) {
    Services.prefs.setCharPref(prefsPrefix + "toolbarID", button.parentNode.id);
    Services.prefs.setCharPref(prefsPrefix + "nextSiblingID", button.nextSibling.id);
  } else {
    Services.prefs.clearUserPref(prefsPrefix + "toolbarID");
    Services.prefs.clearUserPref(prefsPrefix + "nextSiblingID");
  }
}

function loadIntoWindow(window) {
  if (!window || window.document.documentElement.getAttribute("windowtype") != "navigator:browser")
    return;

  let doc = window.document;

  let toolbox = doc.getElementById("navigator-toolbox");
  if (toolbox) {
    let button1 = doc.createElement("toolbarbutton");
    button1.setAttribute("id", idPrefix + "buttonSubscribe");
    button1.setAttribute("label", "PubNub Subscribe");
    button1.setAttribute("type", "button");
    button1.setAttribute("class",
    "pubnub-button");
    //button1.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
    button1.setAttribute("orient", "horizontal");
    toolbox.palette.appendChild(button1);
    if (Services.prefs.prefHasUserValue(prefsPrefix + "toolbarID")) {
      var toolbar = doc.getElementById(Services.prefs.getCharPref(prefsPrefix + "toolbarID"));
      var nextSibling = null;
      try {
        nextSibling = doc.getElementById(Services.prefs.getCharPref(prefsPrefix + "nextSiblingID"));
      } catch (ex) {}
      toolbar.insertItem(idPrefix + "buttonSubscribe", nextSibling);
    }
    window.addEventListener("aftercustomization", saveButtonPosition, false);
    window.addEventListener("command", onSubscribeCommand, false);
    
    let button2 = doc.createElement("toolbarbutton");
    button2.setAttribute("id", idPrefix + "buttonPublish");
    button2.setAttribute("label", "PubNub Publish");
    button2.setAttribute("class",
    "pubnub-button");
    //button2.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
    button2.setAttribute("orient", "horizontal");
    toolbox.palette.appendChild(button2);
    if (Services.prefs.prefHasUserValue(prefsPrefix + "toolbarID")) {
      var toolbar = doc.getElementById(Services.prefs.getCharPref(prefsPrefix + "toolbarID"));
      var nextSibling = null;
      try {
        nextSibling = doc.getElementById(Services.prefs.getCharPref(prefsPrefix + "nextSiblingID"));
      } catch (ex) {}
      toolbar.insertItem(idPrefix + "buttonPublish", nextSibling);
    }
    window.addEventListener("aftercustomization", saveButtonPosition, false);
    window.addEventListener("command", onPublishCommand, false);
    
  }
}
 
function unloadFromWindow(window) {
  if (!window || window.document.documentElement.getAttribute("windowtype") != "navigator:browser")
    return;
  let doc = window.document;
}
 
var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },
  
  onCloseWindow: function(aWindow) {},
  onWindowTitleChange: function(aWindow, aTitle) {}
};

function startup(aData, aReason) {
    addonData = aData;
    sss.loadAndRegisterSheet(Services.io.newURI("chrome://pubnub/skin/pubnub.css", null, null), sss.USER_SHEET);

    let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
   
    // Load into any existing windows
    let windows = wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
      let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
      loadIntoWindow(domWindow);
    }
   
    // Load into any new windows
    wm.addListener(windowListener);
    init(); 
  }

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;
 
  sss.unregisterSheet(Services.io.newURI("chrome://pubnub/skin/pubnub.css", null, null), sss.USER_SHEET);
 
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
 
  // Stop listening for new windows
  wm.removeListener(windowListener);
 
  // Unload from any existing windows
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
  for (let key in scopes) {
    let scope = scopes[key];
    for (let v in scope)
      scope[v] = null;
  }
  scopes = null;
}
 
function install(aData, aReason) {
  Services.prefs.setCharPref(prefsPrefix + "toolbarID", "nav-bar");
  var win = Services.wm.getMostRecentWindow("navigator:browser");
  if (win) {
//    win.openUILinkIn("FIRSTRUNPAGE", "tab");
  }
}
function uninstall(aData, aReason) {
}
