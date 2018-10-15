define(['readium_js_plugins', 'readium_shared_js/globals', './body'], function (Plugins, Globals, PEBLFramework) {
    var config = {

    };


    Plugins.register("PEBL", function (api, readyCallback) {

	api.plugin.initialized = false;
	
	PEBLFramework.start(false, function (peblApi) {
	    
	    window.pebl = peblApi;

	    if (window.peblCompletion != null)
		window.clearInterval(window.peblCompletion);
	    
	    window.peblCompleteFunction = function () {
		var reader = window.top.ReadiumSDK.reader;
		if ((reader != null) &&
		    (reader.getCurrentView() != null) &&
		    (window.top.pebl != null)) {

		    var paginationInfo = reader.getPaginationInfo();
		    if (paginationInfo != null) {
			var idref = paginationInfo.openPages[paginationInfo.openPages.length - 1].idref;
			var e = reader.getElementById(idref, "CompleteTrigger");

			if (e && (e.length != 0)) {
			    var vis = reader.isElementVisible(e);
			    if ((vis != null) && (vis != 0)) {
				e.remove();
				var title = "";
				var tempE = reader.getElement(idref, ".title");
				if (tempE != null)
				    title = tempE.text();

				var num = "";
				tempE = reader.getElement(idref, ".num");
				if (tempE != null)
				    num = tempE.text();
				
				var lesson = "";
				tempE = reader.getElement(idref, ".lesson");
				if (tempE != null)
				    lesson = tempE.text();
				window.top.pebl.eventCompleted(lesson + " " + num, title);
			    }
			}
		    }
		}
	    };
	    
	    window.peblCompletion = setInterval(window.peblCompleteFunction, 1500);
	    
	    api.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function ($iframe, spineItem)  {
		var window = $iframe[0].contentWindow;
		var document = $iframe[0].contentDocument;
		// var peblObject = {};
		// window.PEBLNative = peblObject;
		window.PEBL = PEBLFramework;
		window.pebl = peblApi;
		// peblObject.storage = peblApi.storage;
		// peblObject.userManager = peblApi.userManager;
		// peblObject.launcherManager = peblApi.launcherManager;
		// peblObject.activityManager = peblApi.activityManager;
		// peblObject.networkManager = peblApi.networkManager;
		$(document.body).find("a").on("click", function () {
		    peblApi.eventPreferred(this.href, "link");
		});
		$(document.body).find("#CompleteTrigger").show();
	    });

	    if (readyCallback)
		readyCallback();
	});
    });
    
    return config;
});
