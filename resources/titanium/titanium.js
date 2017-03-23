/**
 * WARNING: this is generated code and will be lost if changes are made.
 * This generated source code is Copyright (c) 2010- by Appcelerator, Inc. All Rights Reserved.
 */
var require = {
	app: {
		analytics: true,
		copyright: "not specified",
		deployType: "development",
		description: "",
		guid: "25705bdb-68d6-4e67-ae5a-1a37af8696da",
		id: "com.pubnub.javascript",
		name: "javascript",
		names: {},
		publisher: "PubNub",
		url: "",
		version: "1.0"
	},
	has: {
		"native-localstorage": function (g) {
			return "localStorage" in g && "setItem" in localStorage;
		},
		"js-btoa": function (g) {
			return "btoa" in g;
		},
		"opera": typeof opera === "undefined" || opera.toString() != "[object Opera]",
		"ti-analytics-use-xhr": false,
		"ti-show-errors": true,
		"ti-instrumentation": function(g) {
				return false && g.instrumentation;
		},
		"touch": function (g) {
			return true && 'ontouchstart' in g;
		}
	},
	locales: [],
	packages: [{"name":"Ti","location":"./titanium","main":"./Ti"}],
	project: {
		id: "com.pubnub.javascript",
		name: "javascript"
	},
	ti: {
		analyticsPlatformName: "mobileweb",
		buildHash: "3c5806f",
		buildDate: "2/24/2017 19:26",
		buildType: "",
		colorsModule: "Ti/_/colors",
		filesystem: {
			registry: "ondemand"
		},
		osName: "mobileweb",
		platformName: "mobileweb",
		theme: "default",
		version: "6.0.2"
	},
	vendorPrefixes: {
		css: ["", "-webkit-", "-moz-", "-ms-", "-o-", "-khtml-"],
		dom: ["", "Webkit", "Moz", "ms", "O", "Khtml"]
	}
};

/**
 * This file contains source code from the following:
 *
 * Dojo Toolkit
 * Copyright (c) 2005-2011, The Dojo Foundation
 * New BSD License
 * <http://dojotoolkit.org>
 *
 * require.js
 * Copyright (c) 2010-2011, The Dojo Foundation
 * New BSD License / MIT License
 * <http://requirejs.org>
 *
 * curl.js
 * Copyright (c) 2011 unscriptable.com / John Hann
 * MIT License
 * <https://github.com/unscriptable/curl>
 */

(function(global) {

	"use strict";

	var w, x, y, z,

		// cached useful regexes
		reservedModuleIdsRegExp = /exports|module/,
		pluginRegExp = /^(.+?)\!(.*)$/,
		notModuleRegExp = /\:|^\/\/|\.js$/,
		relativeRegExp = /^\./,
		absoluteRegExp = /^\.\./,
		startingSlashRegExp = /^\//,
		endingSlashRegExp = /\/$/,
		packageNameRegExp = /([^\/]+)\/?(.*)/,
		urlRegExp = /^url\:(.+)/,
		jsFileRegExp = /\.js$/,

		// the global config settings
		cfg = global.require || {},

		// the number of seconds to wait for a script to load before timing out
		waitSeconds = (cfg.waitSeconds || 7) * 1000,

		// a base url to be prepended to all urls
		baseUrl = cfg.baseUrl || "./",

		// a timeout to fetch a remote resource, defaults to 2 seconds
		timeout = cfg.timeout || 2000,

		// CommonJS paths
		paths = cfg.paths || {},

		// a queue of module definitions to evaluate once a module has loaded
		defQ = [],

		// map of module ids to functions containing an entire module, which could
		// include multiple defines. when a dependency is not defined, the loader
		// will check the cache to see if it exists first before fetching from the
		// server. this is used when the build system bundles modules into the
		// minified javascript files.
		defCache = {},

		// map of package names to package resource definitions
		packages = {},

		// module states
		// default state unloaded = 0
		REQUESTED = 1, // module is being downloaded
		LOADED    = 2, // module is downloaded, but not executing/executed
		EXECUTING = 3, // module is resolving dependencies and being evaluated
		EXECUTED  = 4, // module is fully executed
		BADMODULE = 5, // module errored out

		// map of module ids to module resource definitions that are being loaded and processed
		waiting = {},

		// map of module ids to module resource definitions
		modules = {},

		// mixin of common functions
		fnMixin;

	/******************************************************************************
	 * Utility functions
	 *****************************************************************************/

	function noop() {}

	function mix(dest) {
		// summary:
		//		Copies properties by reference from a source object to a destination
		//		object, then returns the destination object. To be clear, this will
		//		modify the dest being passed in.
		var i = 1,
			l = arguments.length,
			p,
			src;
		dest || (dest = {});
		while (i < l) {
			src = arguments[i++];
			for (p in src) {
				src.hasOwnProperty(p) && (dest[p] = src[p]);
			}
		}
		return dest;
	}

	function is(it, type) {
		// summary:
		//		Tests if "it" is a specific "type". If type is omitted, then
		//		it will return the type.
		//
		// returns:
		//		Boolean if type is passed in
		//		String of type if type is not passed in
		var t = Object.prototype.toString.call(it),
			v = it === void 0 ? "Undefined" : t.substring(8, t.length - 1);
		return type ? type === v : v;
	}

	function isEmpty(it) {
		// summary:
		//		Checks if an object is empty.
		var p;
		for (p in it) {
			break;
		}
		return !it || (!it.call && !p);
	}

	function evaluate(code, sandboxVariables, globally) {
		// summary:
		//		Evaluates code globally or in a sandbox.
		//
		// code: String
		//		The code to evaluate
		//
		// sandboxVariables: Object?
		//		When "globally" is false, an object of names => values to initialize in
		//		the sandbox. The variable names must NOT contain '-' characters.
		//
		// globally: Boolean?
		//		When true, evaluates the code in the global namespace, generally "window".
		//		If false, then it will evaluate the code in a sandbox.

		var i,
			vars = [],
			vals = [],
			r;

		if (globally) {
			r = global.eval(code);
		} else {
			for (i in sandboxVariables) {
				vars.push(i + "=__vars." + i);
				vals.push(i + ":" + i);
			}
			r = (new Function("__vars", (vars.length ? "var " + vars.join(',') + ";\n" : '') + code + "\n;return {" + vals.join(',') + "};"))(sandboxVariables);
		}

		// if the last line of a module is a console.*() call, Firebug for some reason
		// sometimes returns "_firebugIgnore" instead of undefined or null
		return r === "_firebugIgnore" ? null : r;
	}

	function collapsePath(path) {
		var result = [],
			segment,
			lastSegment;
		path = path.replace(/\\/g, '/').split('/');
		while (path.length) {
			segment = path.shift();
			if (segment === ".." && result.length && lastSegment !== "..") {
				result.pop();
				lastSegment = result[result.length - 1];
			} else if (segment !== ".") {
				result.push(lastSegment = segment);
			}
		}
		return result.join("/");
	}

	/******************************************************************************
	 * Event handling
	 *****************************************************************************/

	function on(target, type, context, listener) {
		// summary:
		//		Connects a listener to an event on the specified target.
		//
		// target: Object|DomNode
		//		The target to add the event listener to.
		//
		// type: String
		//		The event to listen for.
		//
		// context: Object|Function
		//		When listener is defined, the context is the scope in which the listener
		//		is executed.
		//
		// listener: Function?|String?
		//		Optional. When present, the context is used as the scope.
		//
		// example:
		//		Attaching to a click event:
		//		|	on(myButton, "click", function() {
		//		|		alert("Howdy!");
		//		|	});
		//
		// example:
		//		Attaching to a click event within a declared class method:
		//		|	...
		//		|	constructor: function() {
		//		|		require.on(myButton, "click", this, "onButtonClick");
		//		|	},
		//		|	onButtonClick: function() {
		//		|		alert("Howdy from " + this.declaredClass + "!");
		//		|	}
		//		|	...
		//
		// example:
		//		Attaching to a click event with an anonymous function in a declared class:
		//		|	...
		//		|	constructor: function() {
		//		|		require.on(myButton, "click", this, function() {
		//		|			alert("Howdy from " + this.declaredClass + "!");
		//		|		});
		//		|	}
		//		|	...

		var cb = is(listener, "Function") ? function() {
			return listener.apply(context, arguments);
		} : is(listener, "String") ? function() {
			return context[listener].apply(context, arguments);
		} : context;

		target.addEventListener(type, cb, false);
		return function() {
			target.removeEventListener(type, cb, false);
		};
	}

	on.once = function(target, type, listener) {
		var h = on(target, type, function() {
			h && h(); // do the disconnect
			return listener.apply(this, arguments);
		});
		return h;
	};

	/******************************************************************************
	 * Promise
	 *****************************************************************************/

	function Promise() {
		this.thens = arguments.length ? [arguments] : [];
	}

	mix(Promise.prototype, {

		then: function promiseThen() {
			this.thens.push(arguments);
			return this;
		},

		resolve: function promiseResolve() {
			this._complete(0, arguments);
		},

		reject: function promiseReject(ex) {
			this._complete(1, ex instanceof Error ? ex : new Error(ex));
		},

		_complete: function promiseComplete(fnIdx, result) {
			this.then = fnIdx ? function promiseCompleteReject(resolved, rejected) { rejected && rejected(result); }
			                   : function promiseCompleteResolve(resolved) { resolved && resolved.apply(null, result); };
			this._complete = noop;

			for (var i = 0, thens = this.thens, len = thens.length, fn; i < len;) {
				fn = thens[i++][fnIdx];
				fn && fn[fnIdx ? "call" : "apply"](null, result);
			}

			delete this.thens;
		}

	});

	/******************************************************************************
	 * Configuration processing
	 *****************************************************************************/

	// make sure baseUrl ends with a slash
	if (!endingSlashRegExp.test(baseUrl)) {
		baseUrl += "/";
	}

	function configPackage(/*String|Object*/pkg, /*String?*/dir) {
		// summary:
		//		An internal helper function to configure a package and add it to the array
		//		of packages.
		//
		// pkg: String|Object
		//		The name of the package (if a string) or an object containing at a minimum
		//		the package's name, but possibly also the package's location and main
		//		source file
		//
		// dir: String?
		//		Optional. A base URL to prepend to the package location

		pkg = pkg.name ? pkg : { name: pkg };
		pkg.location = (/^\/\/|\:/.test(dir) ? dir : '') + (pkg.location || pkg.name);
		pkg.main = (pkg.main || "main").replace(/^\.\/|\.js$/g, '');
		packages[pkg.name] = pkg;
	}

	// first init all packages from the config
	if (y = cfg.packages) {
		for (x = y.length - 1; x >= 0;) {
			configPackage(y[x--]);
		}
		delete cfg.packages;
	}

	// second init all package paths and their packages from the config
	for (x in w = cfg.packagePaths) {
		for (y = w[x], z = y.length - 1; z >= 0;) {
			configPackage(y[z--], x + '/');
		}
	}
	delete cfg.packagePaths;

	/******************************************************************************
	 * Module functionality
	 *****************************************************************************/

	function ResourceDef(name, refModule, deps, rawDef) {
		// summary:
		//		A resource definition that describes a file or module being loaded.
		//
		// description:
		//		A resource is anything that is "required" such as applications calling
		//		require() or a define() with dependencies.
		//
		//		This loader supports resources that define multiple modules, hence this
		//		object.
		//
		//		In addition, this object tracks the state of the resource (loaded,
		//		executed, etc) as well as loads a resource and executes the defintions.
		//
		// name: String
		//		The module id.
		//
		// deps: Array?
		//		An array of dependencies.
		//
		// rawDef: Object? | Function? | String?
		//		The object, function, or string that defines the resource.
		//
		// refModule: Object?
		//		A reference map used for resolving module URLs.

		var _t = this,
			match = name && name.match(pluginRegExp),
			isRelative = relativeRegExp.test(name),
			notModule = notModuleRegExp.test(name),
			exports = {},
			pkg = null,
			cjs,
			i,
			m,
			p,
			url = baseUrl,
			slice = Array.prototype.slice;

		// name could be:
		//  - a plugin		text!/some/file.html or include!/some/file.js
		//  - a module		some/module, /some/module, ./some/module, ../some/module
		//  - a js file		/some/file.js
		//  - a url			http://www.google.com/some/file, //google.com/some/file

		_t.name = name;
		_t.deps = deps || [];
		_t.plugin = null;
		_t.rawDef = rawDef;
		_t.state = rawDef ? LOADED : 0;
		_t.refModule = refModule;

		if (!match && (notModule || (isRelative && !refModule))) {
			_t.url = name;
		} else {
			if (match) {
				_t.plugin = _t.deps.length;
				_t.pluginArgs = match[2];
				_t.pluginCfg = cfg[match[1]];
				_t.deps.push(match[1]);
			} else if (name) {
				name = (isRelative ? refModule.name + "/../" : '') + name.replace(startingSlashRegExp, '');

				if (absoluteRegExp.test(name)) {
					throw new Error('Irrational path "' + name + '"');
				}

				match = name.match(packageNameRegExp);
				m = match && match[1];

				if (m) {
					p = packages[m];
					if (!p && pkg === null && refModule) {
						p = packages[m = refModule.pkg];
						isRelative || (match[2] = name);
					}
					if (p) {
						// module is a package
						pkg = m;
						endingSlashRegExp.test(i = p.location) || (i += '/');
						m = match[2];
						url += collapsePath(i + (m ? (p.root ? m : name) : p.main));
						m || (name = pkg + '/' + p.main);
					} else if (p = paths[m]) {
						// module is a path
						pkg = '';
						// currently we only support a single path
						url = is(p, "Array") ? p[0] : p;
					}
				}

				_t.name = name = collapsePath(name);

				// MUST set pkg to anything other than null, even if this module isn't in a package
				if (pkg === null || (!match && notModule)) {
					pkg = '';
					url += name;
				}

				_t.url = url + ".js";
			}
		}

		_t.pkg = pkg;

		// our scoped require()
		function scopedRequire() {
			var args = slice.call(arguments, 0);
			return req.apply(null, [
				args[0],
				args[1] || 0,
				args[2] || 0,
				_t
			]);
		}
		scopedRequire.toUrl = function scopedToUrl() {
			var args = slice.call(arguments, 0);
			_t.plugin === null && (args[1] = _t);
			return toUrl.apply(null, args);
		};
		mix(scopedRequire, fnMixin, {
			cache: req.cache
		});

		_t.cjs = {
			require: scopedRequire,
			exports: exports,
			module: {
				exports: exports
			}
		};
	}

	ResourceDef.prototype.load = function load(sync) {
		// summary:
		//		Retreives a remote script and inject it either by XHR (sync) or attaching
		//		a script tag to the DOM (async). Once the resource is loaded, it will be
		//		executed.
		//
		// sync: Boolean
		//		If true, uses XHR, otherwise uses a script tag.

		var s,
			xhr,
			scriptTag,
			scriptTagLoadEvent,
			scriptTagErrorEvent,
			doc = global.document,
			_t = this,
			name = _t.name,
			cached = defCache[name],
			promise = _t.promise = (_t.promise || new Promise),
			timer;

		function cleanup() {
			clearTimeout(timer);
			if (xhr) {
				xhr.abort();
			}
			if (scriptTag) {
				scriptTagLoadEvent();
				scriptTagErrorEvent();
				scriptTag.parentNode.removeChild(scriptTag);
			}
		}

		function onload(rawDef) {
			cleanup();
			_t.state = EXECUTING;

			// if rawDef is undefined, then we're loading async
			if (_t.rawDef = rawDef) {
				if (is(rawDef, "String")) {
					// if rawDef is a string, then it's either a cached string or xhr response.
					// the string could contain an AMD module or CommonJS module
					if (jsFileRegExp.test(_t.url)) {
						rawDef = evaluate(rawDef, _t.cjs);
						_t.def = _t.rawDef = !isEmpty(rawDef.exports) ? rawDef.exports : (rawDef.module && !isEmpty(rawDef.module.exports) ? rawDef.module.exports : null);
						_t.def === null && (_t.rawDef = rawDef);
					} else {
						_t.def = rawDef;
						_t.state = EXECUTED;
					}
				} else if (is(rawDef, "Function")) {
					// if rawDef is a function, then it's a cached module definition
					waiting[name] = _t;
					rawDef();
				}
			}

			// we need to process the definition queue just in case the rawDef fired define()
			processDefQ(_t) || _t.execute();
		}

		function onfail(msg) {
			cleanup();
			modules[name] = 0;
			delete waiting[name];
			_t.state = BADMODULE;
			promise.reject('Failed to load module "'+ name + '"' + (msg ? ': ' + msg : ''));
		}

		// if we don't have a url, then I suppose we're loaded
		if (_t.state === EXECUTED || !_t.url) {
			_t.execute();

		// if we're not executing and not already waiting, then fetch the module
		} else if (_t.state !== EXECUTING && !waiting[name]) {

			// if the definition has been cached, no need to load it
			if (_t.state === LOADED || cached) {
				delete defCache[name];
				onload(cached);

			} else {
				// mark this module as waiting to be loaded so that anonymous modules can be identified
				waiting[name] = _t;
				_t.state = REQUESTED;

				timeout && (timer = setTimeout(function() {
					onfail("request timed out");
				}, timeout));

				if (_t.sync = sync) {
					xhr = new XMLHttpRequest;
					xhr.open("GET", _t.url, false);
					xhr.send(null);

					if (xhr.status === 200) {
						onload(xhr.responseText);
					} else {
						onfail(xhr.status);
					}
				} else {
					// insert the script tag, attach onload, wait
					scriptTag = _t.node = doc.createElement("script");
					scriptTag.type = "text/javascript";
					scriptTag.charset = "utf-8";
					scriptTag.async = true;

					scriptTagLoadEvent = on(scriptTag, "load", function onScriptTagLoad(e) {
						e = e || global.event;
						var node = e.target || e.srcElement;
						if (e.type === "load" || /complete|loaded/.test(node.readyState)) {
							scriptTagLoadEvent();
							scriptTagErrorEvent();
							onload();
						}
					});

					scriptTagErrorEvent = on(scriptTag, "error", function() {
						onfail();
					});

					// set the source url last
					scriptTag.src = _t.url;

					s = doc.getElementsByTagName("script")[0];
					s.parentNode.insertBefore(scriptTag, s);
				}
			}
		}

		return promise;
	};

	ResourceDef.prototype.execute = function execute() {
		// summary:
		//		Executes the resource's rawDef which defines the module.

		var _t = this,
			promise = _t.promise = (_t.promise || new Promise),
			resolve = promise.resolve;

		if (_t.state === EXECUTED) {
			resolve.call(promise, _t);
			return;
		}

		// first need to make sure we have all the deps loaded
		req(_t, function onExecuteDepsLoaded() {
			var i,
				p,
				r = _t.rawDef,
				q = defQ.slice(0); // backup the defQ

			function finish() {
				_t.state = EXECUTED;
				delete _t.deps;
				delete _t.rawDef;
				resolve.call(promise, _t);
			}

			// need to wipe out the defQ
			defQ = [];

			_t.def = _t.def
				||	(r && (is(r, "String")
						? evaluate(r, _t.cjs)
						: is(r, "Function")
							? r.apply(null, arguments)
							: is(r, "Object")
								?	(function(obj, vars) {
										for (var i in vars) {
											this[i] = vars[i];
										}
										return obj;
									}).call({}, r, _t.cjs)
								: null
						)
					)
				|| _t.cjs.module.exports || _t.cjs.exports;

			// we might have just executed code above that could have caused a couple define()'s to queue up
			processDefQ(_t);

			// restore the defQ
			defQ = q;

			// if plugin is not null, then it's the index in the deps array of the plugin to invoke
			if (_t.plugin !== null) {
				p = arguments[_t.plugin];

				// the plugin's content is dynamic, so just remove from the module cache
				if (p.dynamic) {
					delete modules[_t.name];
				}

				// if the plugin has a load function, then invoke it!
				p.load && p.load(_t.pluginArgs, _t.cjs.require, function onPluginRun(v) {
					_t.def = v;
					finish();
				}, _t.pluginCfg);
			}

			(p && p.load) || finish();
		}, function(ex) {
			promise.reject(ex);
		}, _t.refModule, _t.sync);
	};

	function getResourceDef(name, refModule, deps, rawDef, dontCache, overrideCache) {
		// summary:
		//		Creates a new resource definition or returns an existing one from cache.

		var module = new ResourceDef(name, refModule, deps, rawDef),
			moduleName = module.name;

		if (refModule && refModule.cjs && name in refModule.cjs) {
			module.def = refModule.cjs[name];
			module.state = EXECUTED;
			dontCache = 1;
		}

		return dontCache || !moduleName ? module : (!modules[moduleName] || !modules[moduleName].state || overrideCache ? (modules[moduleName] = module) : modules[moduleName]);
	}

	function processDefQ(module) {
		// summary:
		//		Executes all modules sitting in the define queue.
		//
		// description:
		//		When a resource is loaded, the remote AMD resource is fetched, it's
		//		possible that one of the define() calls was anonymous, so it should
		//		be sitting in the defQ waiting to be executed.

		var m,
			q = defQ.slice(0),
			r = 0;
		defQ = [];

		while (q.length) {
			m = q.shift();

			// if the module is anonymous, assume this module's name
			m.name || (m.name = module.name);

			// if the module is this module, then modify this
			if (m.name === module.name) {
				modules[m.name] = module;
				module.deps = m.deps;
				module.rawDef = m.rawDef;
				module.refModule = m.refModule;
				module.execute();
				r = 1;
			} else {
				modules[m.name] = m;
				m.execute();
			}
		}

		delete waiting[module.name];
		return r;
	}

	function def(name, deps, rawDef) {
		// summary:
		//		Used to define a module and it's dependencies.
		//
		// description:
		//		Defines a module. If the module has any dependencies, the loader will
		//		resolve them before evaluating the module.
		//
		//		If any of the dependencies fail to load or the module definition causes
		//		an error, the entire definition is aborted.
		//
		// name: String|Array?
		//		Optional. The module name (if a string) or array of module IDs (if an array) of the module being defined.
		//
		// deps: Array?
		//		Optional. An array of module IDs that the rawDef being defined requires.
		//
		// rawDef: Object|Function
		//		An object or function that returns an object defining the module.
		//
		// example:
		//		Anonymous module, no deps, object definition.
		//
		//		Loader tries to detect module name, fails and ignores definition if more
		//		unable to determine name or there's already anonymous module tied to the
		//		name found.
		//
		//		If the module name is determined, then the module definition
		//		is immediately defined.
		//
		//		|	define({
		//		|		sq: function(x) { return x * x; }
		//		|	});
		//
		// example:
		//		Anonymous module, no deps, rawDef definition.
		//
		//		Loader tries to detect module name, fails and ignores definition if more
		//		unable to determine name or there's already anonymous module tied to the
		//		name found.
		//
		//		Since no deps, module definition is treated as a CommonJS module and is
		//		passed in passed require, exports, and module arguments, then immediately
		//		evaluated.
		//
		//		|	define(function(require, exports, module) {
		//		|		return {
		//		|			sq: function(x) { return x * x; }
		//		|		};
		//		|	});
		//
		// example:
		//		Named module, no deps, object definition.
		//
		//		Since no deps, the module definition is immediately defined.
		//
		//		|	define("arithmetic", {
		//		|		sq: function(x) { return x * x; }
		//		|	});
		//
		// example:
		//		Named module, no deps, rawDef definition.
		//
		//		Since no deps, module definition is treated as a CommonJS module and is
		//		passed in passed require, exports, and module arguments, then immediately
		//		evaluated.
		//
		//		|	define("arithmetic", function(require, exports, module) {
		//		|		return {
		//		|			sq: function(x) { return x * x; }
		//		|		};
		//		|	});
		//
		// example:
		//		Anonymous module, two deps, object definition.
		//
		//		Loader tries to detect module name, fails and ignores definition if more
		//		unable to determine name or there's already anonymous module tied to the
		//		name found.
		//
		//		If the module name is determined, then the loader will load the two
		//		dependencies, then once the dependencies are loaded, it will evaluate a
		//		function wrapper around the module definition.
		//
		//		|	define(["dep1", "dep2"], {
		//		|		sq: function(x) { return x * x; }
		//		|	});
		//
		// example:
		//		Anonymous module, two deps, function definition.
		//
		//		Loader tries to detect module name, fails and ignores definition if more
		//		unable to determine name or there's already anonymous module tied to the
		//		name found.
		//
		//		If the module name is determined, then the loader will load the two
		//		dependencies, then once the dependencies are loaded, it will evaluate
		//		the rawDef function.
		//
		//		|	define(["dep1", "dep2"], function(dep1, dep2) {
		//		|		return {
		//		|			sq: function(x) { return x * x; }
		//		|		};
		//		|	});
		//
		// example:
		//		Name module, two deps, object definition.
		//
		//		After the two dependencies are loaded, the loader will evaluate a
		//		function wrapper around the module definition.
		//
		//		|	define("arithmetic", ["dep1", "dep2"], {
		//		|		sq: function(x) { return x * x; }
		//		|	});
		//
		// example:
		//		Name module, two deps, function definition.
		//
		//		After the two dependencies are loaded, the loader will evaluate the
		//		function rawDef.
		//
		//		|	define("arithmetic", ["dep1", "dep2"], function(dep1, dep2) {
		//		|		return {
		//		|			sq: function(x) { return x * x; }
		//		|		};
		//		|	});

		var i = ["require", "exports", "module"],
			module;

		if (!rawDef) {
			rawDef = deps || name;
			if (typeof name !== "string") {
				deps = deps ? name : i;
				name = 0;
			} else {
				deps = i;
			}
		}

		if (reservedModuleIdsRegExp.test(name)) {
			throw new Error('Not allowed to define reserved module id "' + name + '"');
		}

		module = getResourceDef(name, 0, deps, rawDef, 0, 1);

		// if not waiting for this module to be loaded, then the define() call was
		// possibly inline or deferred, so try fulfill dependencies, and define the
		// module right now.
		if (name && !waiting[name]) {
			module.execute();

		// otherwise we are definitely waiting for a script to load, eventhough we
		// may not know the name, we'll know when the script's onload fires.
		} else if (name || !isEmpty(waiting)) {
			defQ.push(module);

		// finally, we we're ask to define something without a name and there's no
		// scripts pending, so there's no way to know what the name is. :(
		} else {
			throw new Error("Unable to define anonymous module");
		}
	}

	// set the "amd" property and advertise supported features
	def.amd = {
		plugins: true,
		vendor: "titanium"
	};

	function toUrl(name, refModule) {
		// summary:
		//		Converts a module name including extension to a URL path.
		//
		// name: String
		//		The module name including extension.
		//
		// returns: String
		//		The fully resolved URL.
		//
		// example:
		//		Returns the URL for a HTML template file.
		//		|	define(function(require) {
		//		|		var templatePath = require.toUrl("./templates/example.html");
		//		|	});

		var	match = name.match(/(.+)(\.[^\/\.]+?)$/),
			module = getResourceDef((match && match[1]) || name, refModule, 0, 0, 1),
			url = module.url;

		module.pkg !== null && (url = url.substring(0, url.length - 3));
		return url + ((match && match[2]) || '');
	}

	function req(deps, callback, errback, refModule, sync) {
		// summary:
		//		Fetches a module, caches its definition, and returns the module. If an
		//		array of modules is specified, then after all of them have been
		//		asynchronously loaded, an optional callback is fired.
		//
		// deps: String | Array | Object
		//		A string or array of strings containing valid module identifiers.
		//
		// callback: Function?
		//		Optional. A function that is fired after all dependencies have been
		//		loaded. Only applicable if deps is an array.
		//
		// refModule: Object?
		//		A reference map used for resolving module URLs.
		//
		// sync: Boolean?
		//		Forces the async path to be sync.
		//
		// returns: Object | Promise
		//		If calling with a string, it will return the corresponding module
		//		definition, otherwise it returns a Promise for the async loading.
		//
		// example:
		//		Synchronous call.
		//		|	require("arithmetic").sq(10); // returns 100
		//
		// example:
		//		Asynchronous call.
		//		|	require(["arithmetic", "convert"], function(arithmetic, convert) {
		//		|		convert(arithmetic.sq(10), "fahrenheit", "celsius"); // returns 37.777
		//		|	});

		var i = 0,
			l,
			counter,
			errorCount = 0,
			type = is(deps),
			s = type === "String",
			promise = new Promise(callback, errback);

		if (type === "Object") {
			refModule = deps;
			deps = refModule.deps || [];
		}

		if (s) {
			deps = [deps];
			sync = 1;
		}

		for (l = counter = deps.length; i < l;) {
			(function requireDepClosure(j) {
				function finish(m) {
					deps[j] = m instanceof Error && ++errorCount ? void 0 : m.def;
					if (--counter === 0) {
						errorCount ? promise.reject(m) : promise.resolve.apply(promise, deps);
						counter = -1; // prevent success from being called the 2nd time below
					}
				}

				deps[j] && getResourceDef(deps[j], refModule).load(sync).then(finish, finish);
			}(i++));
		}

		counter === 0 && promise.resolve.apply(promise, deps);

		return s ? deps[0] : promise;
	}

	req.toUrl = toUrl;
	mix(req, fnMixin = {
		config: cfg,
		evaluate: evaluate,
		is: is,
		isEmpty: isEmpty,
		mix: mix,
		on: on,
		Promise: Promise
	});

	req.cache = function requireCache(subject) {
		// summary:
		//		Copies module definitions into the definition cache.
		//
		// description:
		//		When running a build, the build will call this function and pass in an
		//		object with module id => function. Each function contains the contents
		//		of the module's file.
		//
		//		When a module is required, the loader will first see if the module has
		//		already been defined.  If not, it will then check this cache and execute
		//		the module definition.  Modules not defined or cached will be fetched
		//		remotely.
		//
		// subject: String | Object
		//		When a string, returns the cached object or undefined otherwise an object
		//		with module id => function where each function wraps a module.
		//
		// example:
		//		This shows what build system would generate. You should not need to do this.
		//		|	require.cache({
		//		|		"arithmetic": function() {
		//		|			define(["dep1", "dep2"], function(dep1, dep2) {
		//		|				var api = { sq: function(x) { return x * x; } };
		//		|			});
		//		|		},
		//		|		"my/favorite": function() {
		//		|			define({
		//		|				color: "red",
		//		|				food: "pizza"
		//		|			});
		//		|		}
		//		|	});
		var p, m;
		if (is(subject, "String")) {
			return defCache[subject];
		} else {
			for (p in subject) {
				m = p.match(urlRegExp);
				if (m) {
					defCache[toUrl(m[1])] = subject[p];
				} else {
					m = getResourceDef(p, 0, 0, subject[p], 1);
					defCache[m.name] = m.rawDef;
				}
			}
		}
	};

	// expose require() and define() to the global namespace
	global.require = req;
	global.define = def;

}(window));

require.cache({
"Ti":function(){
/* /titanium/Ti.js */

/**
 * This file contains source code from the following:
 *
 * es5-shim
 * Copyright 2009, 2010 Kristopher Michael Kowal
 * MIT License
 * <https://github.com/kriskowal/es5-shim>
 *
 * Dojo Toolkit
 * Copyright (c) 2005-2011, The Dojo Foundation
 * New BSD License
 * <http://dojotoolkit.org>
 */

define(
	["Ti/_", "Ti/API", "Ti/_/analytics", "Ti/App", "Ti/_/Evented", "Ti/_/has", "Ti/_/lang", "Ti/_/ready", "Ti/_/style", "Ti/Buffer", "Ti/Platform", "Ti/UI", "Ti/Locale", "Ti/_/include"],
	function(_, API, analytics, App, Evented, has, lang, ready, style, Buffer, Platform, UI) {

	var global = window,
		req = require,
		cfg = req.config,
		deployType = App.deployType,
		ver = cfg.ti.version,
		is = req.is,
		on = req.on,
		loaded,
		unloaded,
		showingError,
		waiting = [],
		Ti = lang.setObject("Ti", Evented, {
			constants: {
				buildDate: cfg.ti.buildDate,
				buildHash: cfg.ti.buildHash,
				version: ver
			},

			properties: {
				userAgent: function() {
					return navigator.userAgent;
				}
			},

			createBuffer: function(args) {
				return new Buffer(args);
			},
			include: function(files) {
				typeof files === "array" || (files = [].concat(Array.prototype.slice.call(arguments, 0)));
				files.forEach(function(f) {
					require("Ti/_/include!" + f);
				});
			},
			deferStart: function() {
				if (loaded) {
					API.warn("app.js already loaded!");
				} else {
					var n = Math.round(Math.random()*1e12);
					waiting.push(n);
					return function() {
						var p = waiting.indexOf(n);
						~p && waiting.splice(p, 1);
						loaded = 1;
						if (!waiting.length) {
							has("ti-instrumentation") && instrumentation.stopTest(instrumentation.systemLoadTimeTest);
							require(cfg.main || ["//test/titanium/app.test.js"]);
						}
					};
				}
			}
		}),
		loadAppjs = Ti.deferStart();

	if (!has("js-btoa")) {
		var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
			fromCharCode = String.fromCharCode;

		global.btoa = function(bytes) {
			var ascii = [],
				chr1, chr2, chr3,
				enc1, enc2, enc3, enc4,
				i = 0,
				len = bytes.length;

			while (i < len) {
				chr1 = bytes.charCodeAt(i++);
				chr2 = bytes.charCodeAt(i++);
				chr3 = bytes.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				ascii.push(tab.charAt(enc1) + tab.charAt(enc2) + tab.charAt(enc3) + tab.charAt(enc4));
			}

			return ascii.join('');
		};

		global.atob = function(ascii) {
			var bytes = [],
				enc1, enc2, enc3, enc4,
				i = 0,
				len = ascii.length;

			ascii = ascii.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			while (i < len) {
				enc1 = tab.indexOf(ascii.charAt(i++));
				enc2 = tab.indexOf(ascii.charAt(i++));
				enc3 = tab.indexOf(ascii.charAt(i++));
				enc4 = tab.indexOf(ascii.charAt(i++));

				bytes.push(fromCharCode((enc1 << 2) | (enc2 >> 4)));

				enc3 !== 64 && bytes.push(fromCharCode(((enc2 & 15) << 4) | (enc3 >> 2)));
				enc4 !== 64 && bytes.push(fromCharCode(((enc3 & 3) << 6) | enc4));
			}

			return bytes.join('');
		};
	}

	// protect global titanium object
	Object.defineProperty(global, "Ti", { value: Ti, writable: false });
	Object.defineProperty(global, "Titanium", { value: Ti, writable: false });

	API.info("Appcelerator Titanium " + ver + " Mobile Web");

	// make sure we have some vendor prefixes defined
	cfg.vendorPrefixes || (cfg.vendorPrefixes = ["", "Moz", "Webkit", "O", "ms"]);

	function shutdown() {
		if (!unloaded) {
			unloaded = 1;
			App.fireEvent("close");
			analytics.add("ti.end", "ti.end");
		}
	}

	on(global, "beforeunload", shutdown);
	on(global, "unload", shutdown);

	if (has("ti-show-errors")) {
		on(global, "error", function(e) {
			if (!showingError) {
				showingError = 1;

				var f = e.filename || "",
					match = f.match(/:\/\/.+(\/.*)/),
					filename = match ? match[1] : e.filename,
					line = e.lineno,
					win = UI.createWindow({
						backgroundColor: "#f00",
						top: "100%",
						height: "100%",
						layout: UI._LAYOUT_CONSTRAINING_VERTICAL
					}),
					view,
					button;

				function makeLabel(text, height, color, fontSize) {
					win.add(UI.createLabel({
						color: color,
						font: { fontSize: fontSize, fontWeight: "bold" },
						height: height,
						left: 10,
						right: 10,
						textAlign: UI.TEXT_ALIGNMENT_CENTER,
						text: text
					}));
				}

				makeLabel("Application Error", "15%", "#0f0", "24pt");
				makeLabel((e.message || "Unknown error").trim() + (filename && filename !== "undefined" ? " at " + filename : "") + (line ? " (line " + line + ")" : ""), "45%", "#fff", "16pt");

				win.add(view = UI.createView({ height: "12%" }));
				view.add(button = UI.createButton({ title: "Dismiss" }));
				win.addEventListener("close", function() { win.destroy(); });
				button.addEventListener("singletap", function() {
					win.animate({
						duration: 500,
						top: "100%"
					}, function() {
						win.close();
						showingError = 0;
					});
				});

				makeLabel("Error messages will only be displayed during development. When your app is packaged for final distribution, no error screen will appear. Test your code!", "28%", "#000", "10pt");

				on.once(win,"postlayout", function() {
					setTimeout(function() {
						win.animate({
							duration: 500,
							top: 0
						}, function() {
							win.top = 0;
							win.height = "100%";
						});
					}, 100);
				});

				win.open();
			}
			return true;
		});
	}

	ready(function() {
		style.set(document.body, {
			margin: 0,
			padding: 0
		});

		if (App.analytics) {
			var analyticsPlatformName = require.config.ti.analyticsPlatformName;

			// enroll event
			if (localStorage.getItem("ti:enrolled") === null) {
				// setup enroll event
				analytics.add("ti.enroll", "ti.enroll", {
					app_name: App.name,
					app_version: App.version,
					oscpu: 1,
					mac_addr: null,
					deploytype: deployType,
					ostype: Platform.osname,
					osarch: null,
					app_id: App.id,
					platform: analyticsPlatformName,
					model: Platform.model
				});
				localStorage.setItem("ti:enrolled", true)
			}

			// app start event
			analytics.add("ti.start", "ti.start", {
				tz: (new Date).getTimezoneOffset(),
				deploytype: deployType,
				os: Platform.osname,
				osver: Platform.ostype,
				version: cfg.ti.version,
				platform: analyticsPlatformName,
				model: Platform.model,
				un: null,
				app_version: App.version,
				nettype: null
			});

			// try to sent previously sent analytics events on app load
			analytics.send();
		}

		// load app.js when ti and dom is ready
		setTimeout(loadAppjs, 1);
	});

	return Ti;

});

},
"Ti/_":function(){
/* /titanium/Ti/_.js */

define(["Ti/_/lang"], function(lang) {
	// Pre-calculate the screen DPI
	var body = document.body,
		measureDiv = document.createElement('div'),
		dpi;

	measureDiv.style.width = "1in";
	measureDiv.style.visibility = "hidden";
	body.appendChild(measureDiv);
	dpi = parseInt(measureDiv.clientWidth);
	body.removeChild(measureDiv);

	return lang.setObject("Ti._", {
		assert: function(test, msg) {
			if (!test) {
				throw new Error(msg);
			}
		},
		dpi: dpi,
		escapeHtmlEntities: function(html) {
			return (""+html).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
		},
		getAbsolutePath: function(path) {
			/^app\:\/\//.test(path) && (path = path.substring(6));
			/^\//.test(path) && (path = path.substring(1));

			// check if we have an external url
			if (/^\/\//.test(path) || ~path.indexOf("://")) {
				return path;
			}

			var pn = location.pathname;

			// if we're dealing with windows phone, then location.pathname does not have a beginning slash and we need to add one
			!/^\//.test(pn) && location.protocol == 'x-wmapp0:' && (pn = '/' + pn);

			// strip everything after the last '/' and add the path
			return pn.replace(/(.*)\/.*/, '$1') + '/' + path;
		},
		isBinaryMimeType: function(type) {
			return /^(application|image|audio|video)\/(?!javascript|x\-javascript|atom\+xml|rss\+xml|json)/.test(type);
		},
		uuid: function() {
			/**
			 * Math.uuid.js (v1.4)
			 * Copyright (c) 2010 Robert Kieffer
			 * Dual licensed under the MIT and GPL licenses.
			 * <http://www.broofa.com>
			 * mailto:robert@broofa.com
			 */
			// RFC4122v4 solution:
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0,
					v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			}).toUpperCase();
		}
	});
});
},
"Ti/_/lang":function(){
/* /titanium/Ti/_/lang.js */

/**
 * hitch() and setObject() functionality based on code from Dojo Toolkit.
 *
 * Dojo Toolkit
 * Copyright (c) 2005-2011, The Dojo Foundation
 * New BSD License
 * <http://dojotoolkit.org>
 */

define(['Ti/_/has'], function (has) {
	var global = this,
		hitch,
		is = require.is;

	function toArray(obj, offset) {
		return [].concat(Array.prototype.slice.call(obj, offset||0));
	}

	function hitchArgs(scope, method) {
		var pre = toArray(arguments, 2),
			named = typeof method == 'string';
		return function () {
			var s = scope || global,
				f = named ? s[method] : method;
			return f && f.apply(s, pre.concat(toArray(arguments)));
		};
	}

	return {
		hitch: hitch = function (scope, method) {
			if (arguments.length > 2) {
				return hitchArgs.apply(global, arguments);
			}
			if (!method) {
				method = scope;
				scope = null;
			}
			if (typeof method == 'string') {
				scope = scope || global;
				if (!scope[method]) {
					throw(['hitch: scope["', method, '"] is null (scope="', scope, '")'].join(''));
				}
				return function () {
					return scope[method].apply(scope, arguments || []);
				};
			}
			return !scope ? method : function () {
				return method.apply(scope, arguments || []);
			};
		},

		isDef: function (it) {
			return it !== void 0;
		},

		mixProps: function (dest, src, setDefaults, copyDefs) {
			var prop, propObj, name, destDef, destExists,
				srcDef = src.__def__,
				source = srcDef || src,
				ignore = /^constructor|__values__|__def__|declaredClass$/,
				special = { properties: 1, constants: 0 };

			// copyDefs is only true if declare() is mixing in a superclass
			copyDefs && dest.__def__ || (dest.__def__ = {});

			for (prop in source) {
				if (source.hasOwnProperty(prop) && !ignore.test(prop)) {
					// check if this prop is "properties" or "constants"
					if (special.hasOwnProperty(prop)) {
						// this is where we store original source property's definition
						destDef = dest.__def__[prop] || (dest.__def__[prop] = {});

						// loop over each prop in the source
						propObj = source[prop];
						for (name in propObj) {
							destExists = destDef.hasOwnProperty(name);

							// don't copy props that already exist in the destination
							if (!srcDef || !destExists) {
								// copy the original source property's definition
								destExists || (destDef[name] = propObj[name]);

								// define and call the function that wires up the properties
								(function (type, property, /* setter/getter, getter, or value */ descriptor, capitalizedName, writable) {
									var isObj = descriptor && typeof descriptor == 'object',
										getter = isObj && descriptor.get,
										setter = isObj && descriptor.set,
										post = isObj && descriptor.post,
										desc = {
											get: function () {
												var v = this.__values__[type][property];
												return getter ? (typeof getter == 'string' ? this[getter] : getter).call(this, v) : v;
											},
											set: function (v) {
												if (!writable) {
													throw new Error('Property "' + property + '" is read only');
												}
												var d = this.__values__[type],
													args = [v, d[property], property];
												args[0] = d[property] = setter ? (typeof setter == 'string' ? this[setter] : setter).apply(this, args) : v;
												post && (typeof post == 'function' ? post : this[post]).apply(this, args);
											},
											configurable: true,
											enumerable: true
										};

									if (isObj && (getter || setter || post)) {
										setDefaults && (dest.__values__[type][property] = descriptor.value);
									} else if (typeof descriptor == 'function') {
										getter = descriptor;
									} else if (setDefaults) {
										dest.__values__[type][property] = descriptor;
									}

									Object.defineProperty(dest, property, desc);

									// if it's writable or it's not an uppercase constant name, create the getter/setter
									if (writable || property.toUpperCase() !== property) {
										dest['get' + capitalizedName] = desc.get;
										writable && (dest['set' + capitalizedName] = desc.set);
									}
								}(prop, name, propObj[name], name.substring(0, 1).toUpperCase() + name.substring(1), special[prop]));
							}
						}
					} else if (!srcDef || ((!srcDef.properties || !srcDef.properties.hasOwnProperty(prop)) && (!srcDef.constants || !srcDef.constants.hasOwnProperty(prop)))) {
						copyDefs && dest.__def__.hasOwnProperty(prop) || (dest.__def__[prop] = source[prop]);
						dest[prop] = source[prop];
					}
				}
			}
			return dest;
		},

		generateAccessors: function (definition, readOnlyProps, props) {
			function generateGetter(prop) {
				var getterName = 'get' + prop.substring(0, 1).toUpperCase() + prop.substring(1);
				if (!(getterName in definition.prototype)) {
					definition.prototype[getterName] = function () {
						return this[prop];
					}
				}
			}
			
			function generateSetter(prop) {
				var setterName = 'set' + prop.substring(0, 1).toUpperCase() + prop.substring(1);
				if (!(setterName in definition.prototype)) {
					definition.prototype[setterName] = function (value) {
						return this[prop] = value;
					}
				}
			}
			
			readOnlyProps && readOnlyProps.split(',').forEach(generateGetter);
			props && props.split(',').forEach(function (prop) {
				generateGetter(prop);
				generateSetter(prop);
			});
		},

		setObject: function (name) {
			var parts = name.split('.'),
				q = parts.pop(),
				obj = window,
				i = 0,
				p = parts[i++],
				a,
				r;

			if (p) {
				do {
					obj = p in obj ? obj[p] : (obj[p] = {});
				} while (obj && (p = parts[i++]));
			}

			if (obj && q) {
				r = q in obj ? obj[q] : {};
				// need to mix args into values
				for (i = 1; i < arguments.length; i++) {
					a = arguments[i];
					if (a && typeof a == 'object') {
						// if the destination is a plain object, then we need to initialize the property store
						r.__values__ || (r.__values__ = { constants:{}, properties:{} });

						// mix the props
						this.mixProps(r, a, 1);
					} else {
						r = a;
					}
				}
			}

			return obj[q] = r;
		},

		toArray: toArray,

		urlEncode: function (obj) {
			var enc = encodeURIComponent,
				pairs = [],
				prop,
				value,
				i,
				l;

			for (prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					Array.isArray(value = obj[prop]) || (value = [value]);
					prop = enc(prop) + '=';
					for (i = 0, l = value.length; i < l;) {
						pairs.push(prop + enc(value[i++]));
					}
				}
			}

			return pairs.join('&');
		},

		val: function (originalValue, defaultValue) {
			return originalValue === void 0 ? defaultValue : originalValue;
		}
	};
});
},
"Ti/_/has":function(){
/* /titanium/Ti/_/has.js */

define(function() {

	var cfg = require.config,
		hasCache = cfg.hasCache || {},
		global = window,
		doc = global.document,
		el = doc.createElement("div"),
		i;

	function has(name) {
		// summary:
		//		Determines of a specific feature is supported.
		//
		// name: String
		//		The name of the test.
		//
		// returns: Boolean (truthy/falsey)
		//		Whether or not the feature has been detected.

		var fn = hasCache[name];
		require.is(fn, "Function") && (fn = hasCache[name] = fn(global, doc, el));
		return fn;
	}

	has.add = function hasAdd(name, test, now, force){
		// summary:
		//		Adds a feature test.
		//
		// name: String
		//		The name of the test.
		//
		// test: Function
		//		The function that tests for a feature.
		//
		// now: Boolean?
		//		If true, runs the test immediately.
		//
		// force: Boolean?
		//		If true, forces the test to override an existing test.

		if (hasCache[name] === void 0 || force) {
			hasCache[name] = test;
		}
		return now && has(name);
	};

	// run all feature detection tests
	for (i in cfg.has) {
		has.add(i, cfg.has[i], 0, true);
	}
	delete cfg.has;

	return has;

});

},
"Ti/API":function(){
/* /titanium/Ti/API.js */

/*global define, window*/
define(['Ti/_/Evented', 'Ti/_/lang'], function(Evented, lang) {

	var api = {},
		global = window,
		con = global.console,
		i = 0,
		last,

		// the order of these DOES matter... it uses the last known function
		// (i.e. if trace() does not exist, it'll use debug() for trace)
		fns = ['debug', 'trace', 'error', 'fatal', 'critical', 'notice', 'warn', 'info'],
		len = fns.length;

	// console.*() shim
	con === void 0 && (con = global.console = {});

	// make sure 'log' is always at the end
	fns.forEach(function(c) {
		con[c] || (con[c] = ('log' in con) ? function () {
				var a = Array.apply({}, arguments);
				a.unshift(c + ':');
				con.log(a.join(' '));
			} : function () {}
		);
	});

	con.trace = 0; // need to undefine trace() since it does something completely different

	for (; i < len; i++) {
		(function(fn) {
			var ls = last = console[fn] ? fn : last;
			api[fn] = function() {
				console[ls]('[' + fn.toUpperCase() + '] ' + lang.toArray(arguments).map(function(a) {
					return require.is(a, 'Object') ? a.hasOwnProperty('toString') ? a.toString() : JSON.stringify(a) : a === null ? 'null' : a === void 0 ? 'undefined' : a;
				}).join(' '));
			};
		})(fns[i]);
	}

	api.log = function () {
		var a = lang.toArray(arguments);
		var fn = ~fns.indexOf(('' + a[0]).toLowerCase()) && a.shift().toLowerCase();
		api[fn||'info'].apply(this, a);
	};

	return lang.setObject('Ti.API', Evented, api);

});
},
"Ti/_/Evented":function(){
/* /titanium/Ti/_/Evented.js */

/*global define*/
define(function() {

	var mix = require.mix;

	return {
		destroy: function() {
			for (var i in this) {
				delete this[i];
			}
			this._alive = 0;
		},

		addEventListener: function(name, handler) {
			this.listeners || (this.listeners = {});
			(this.listeners[name] = this.listeners[name] || []).push(handler);
		},

		removeEventListener: function(name, handler) {
			if (this.listeners) {
				if (handler) {
					var i = 0,
						events = this.listeners[name],
						l = events && events.length || 0;

					for (; i < l; i++) {
						events[i] === handler && events.splice(i, 1);
					}
				} else {
					delete this.listeners[name];
				}
			}
		},

		fireEvent: function(name, data) {
			var i = 0,
				modifiers = this._modifiers && this._modifiers[name],
				listeners = this.listeners && this.listeners[name],
				l = modifiers && modifiers.length;

			data = data || {};
			mix(data, {
				source: data.source || this,
				type: name
			});

			while (i < l) {
				modifiers[i++].call(this, data);
			}

			if (listeners) {
				// We deep copy the listeners because the original list can change in the middle of a callback
				listeners = [].concat(listeners);
				i = 0;
				l = listeners.length;
				while (i < l) {
					listeners[i++].call(this, data);
				}
			}
		},

		applyProperties: function(props) {
			mix(this, props);
		},

		_addEventModifier: function(name, handler) {
			this._modifiers || (this._modifiers = {});
			(Array.isArray(name) ? name : [name]).forEach(function(n) {
				(this._modifiers[n] = this._modifiers[n] || []).push(handler);
			}, this);
		},

		constants: {
			apiName: {
				get: function() {
					return this.declaredClass;
				}
			}
		}
	};

});
},
"Ti/_/analytics":function(){
/* /titanium/Ti/_/analytics.js */

define(["Ti/_", "Ti/_/dom", "Ti/_/has", "Ti/_/lang", "Ti/App", "Ti/Platform"],
	function(_, dom, has, lang, App, Platform) {

	var global = window,
		is = require.is,
		analyticsEnabled = App.analytics,
		analyticsLastSent = null,
		analyticsUrl = "https://api.appcelerator.com/p/v3/mobile-web-track/" + App.guid,
		pending = {},
		sendTimer,
		sendDelay = 60000,
		analytics = {
			add: function(type, event, data, isUrgent) {
				if (analyticsEnabled) {
					// store event
					var storage = getStorage();

					storage.push({
						id: _.uuid(),
						type: type,
						evt: event,
						ts: (new Date).toISOString().replace('Z', "+0000"),
						data: data
					});

					setStorage(storage);
					this.send(isUrgent);
				}
			},

			send: function(isUrgent) {
				if (analyticsEnabled) {
					var rand = Math.floor(Math.random() * 1e6),
						now = Date.now(),
						ids = [],
						payload = [],
						sessionId = sessionStorage.getItem("ti:sessionId"),
						seqId = sessionStorage.getItem("ti:analyticsSeqId"),
						events = getStorage(),
						i = 0,
						len = events.length,
						evt,
						eventData,
						buildType = require.config.ti.buildType;

					typeof seqId == 'string' && (seqId = JSON.parse(seqId));

					clearTimeout(sendTimer);

					if (len && (isUrgent || analyticsLastSent == null || now - analyticsLastSent >= sendDelay)) {
						sessionId || (sessionId = _.uuid());
						seqId == null && (seqId = 0);

						while (i < len) {
							evt = events[i++];

							ids.push(evt.id);

							payload.push(eventData = {
								id: evt.id,
								mid: Platform.id,
								rdu: null,
								type: evt.type,
								aguid: App.guid,
								event: evt.evt,
								seq: seqId++,
								ver: "2",
								deploytype: App.deployType,
								sid: sessionId,
								ts: evt.ts,
								data: evt.data
							});

							buildType && (eventData.buildType = buildType);

							if (evt.type == 'ti.end') {
								seqId = 0;
								sessionId = _.uuid();
							}
						}

						sessionStorage.setItem("ti:sessionId", sessionId);
						sessionStorage.setItem("ti:analyticsSeqId", seqId);

						pending[rand] = ids;
						analyticsLastSent = now;
						payload = JSON.stringify(payload);

						if (has('ti-analytics-use-xhr')) {
							var xhr = new XMLHttpRequest;
							xhr.onreadystatechange = function() {
								if (xhr.readyState == 4 && xhr.status == 200) {
									try {
										var data = JSON.parse(xhr.responseText);
										data.callback = rand;
										onSuccess(data);
									} catch (e) {}
								}
							};
							xhr.open("POST", analyticsUrl, true);
							xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
							xhr.send('content=' + encodeURIComponent(payload));
						} else {
							var body = document.body,
								iframeName = "analytics" + rand,
								iframe = dom.create("iframe", {
									id: iframeName,
									name: iframeName,
									style: {
										display: "none"
									}
								}, body),
								form = dom.create("form", {
									action: analyticsUrl + "?callback=" + rand + "&output=html",
									method: "POST",
									style: {
										display: "none"
									},
									target: iframeName
								}, body);

							dom.create("input", {
								name: "content",
								type: "hidden",
								value: payload
							}, form);

							// need to delay attaching of iframe events so they aren't prematurely called
							setTimeout(function() {
								function onIframeLoaded() {
									setTimeout(function() {
										dom.destroy(form);
										dom.destroy(iframe);
									}, 1);
								}
								iframe.onload = onIframeLoaded;
								iframe.onerror = onIframeLoaded;
								form.submit();
							}, 25);
						}
					}

					sendTimer = setTimeout(function() {
						analytics.send(1);
					}, sendDelay);
				}
			}
		};

	function getStorage() {
		var s = localStorage.getItem("ti:analyticsEvents");
		return s ? JSON.parse(s) : [];
	}

	function setStorage(data) {
		localStorage.setItem("ti:analyticsEvents", JSON.stringify(data));
	}

	function onSuccess(data) {
		if (data && typeof data == 'object' && data.success) {
			var ids = pending[data.callback],
				keepers = [],
				events = getStorage(),
				i = 0,
				len = events.length,
				evt;

			if (ids) {
				while (i < len) {
					evt = events[i++];
					~ids.indexOf(evt.id) || keepers.push(evt);
				}
				setStorage(keepers);
			}
		}
	}

	require.on(global, 'message', function (response) {
		onSuccess(response.data);
	});

	return analytics;

});
},
"Ti/_/dom":function(){
/* /titanium/Ti/_/dom.js */

/**
 * create(), attr(), place(), & remove() functionality based on code from Dojo Toolkit.
 *
 * Dojo Toolkit
 * Copyright (c) 2005-2011, The Dojo Foundation
 * New BSD License
 * <http://dojotoolkit.org>
 */

define(["Ti/_", "Ti/API", "Ti/_/style"], function(_, API, style) {
	var is = require.is,
		forcePropNames = {
			innerHTML:	1,
			className:	1,
			value:		1
		},
		attrNames = {
			// original attribute names
			classname: "class",
			htmlfor: "for",
			// for IE
			tabindex: "tabIndex",
			readonly: "readOnly"
		},
		names = {
			// properties renamed to avoid clashes with reserved words
			"class": "className",
			"for": "htmlFor",
			// properties written as camelCase
			tabindex: "tabIndex",
			readonly: "readOnly",
			colspan: "colSpan",
			frameborder: "frameBorder",
			rowspan: "rowSpan",
			valuetype: "valueType"
		},
		attr = {
			set: function(node, name, value) {
				if (arguments.length === 2) {
					// the object form of setter: the 2nd argument is a dictionary
					for (var x in name) {
						attr.set(node, x, name[x]);
					}
					return node;
				}

				var lc = name.toLowerCase(),
					propName = names[lc] || name,
					forceProp = forcePropNames[propName],
					attrId, h;

				if (propName === "style" && !require.is(value, "String")) {
					return style.set(node, value);
				}

				if (forceProp || is(value, "Boolean") || is(value, "Function")) {
					node[name] = value;
					return node;
				}

				// node's attribute
				node.setAttribute(attrNames[lc] || name, value);
				return node;
			},
			remove: function(node, name) {
				node.removeAttribute(name);
				return node;
			}
		};

	return {
		create: function(tag, attrs, refNode, pos) {
			var doc = refNode ? refNode.ownerDocument : document;
			is(tag, "String") && (tag = doc.createElement(tag));
			attrs && attr.set(tag, attrs);
			refNode && this.place(tag, refNode, pos);
			return tag;
		},

		attr: attr,

		place: function(node, refNode, pos) {
			refNode.appendChild(node);
			return node;
		},

		detach: function(node) {
			return node.parentNode && node.parentNode.removeChild(node);
		},

		destroy: function(node) {
			try {
				var destroyContainer = node.ownerDocument.createElement("div");
				destroyContainer.appendChild(this.detach(node) || node);
				destroyContainer.innerHTML = "";
			} catch(e) {
				/* squelch */
			}
		},

		calculateDistance: function(ax, ay, bx, by) {
			return Math.sqrt(Math.pow(ax - bx,2) + Math.pow(ay - by, 2));
		},

		unitize: function(x) {
			return isNaN(x-0) || x-0 != x ? x : x + "px"; // note: must be != and not !==
		},

		computeSize: function(x, totalLength, convertSizeToUndef) {
			if (is(x,"Number") && isNaN(x)) {
				return 0;
			}
			var type = require.is(x);
			if (type === "String") {
				var UI = require("Ti/UI");
				if (x === UI.SIZE) {
					convertSizeToUndef && (x = void 0);
				} else {
					var value = parseFloat(x),
						units = x.match(/.*(%|mm|cm|em|pt|in|px|dp)$/);
					if (units) {
						units = units[1];
					} else {
						units = "px";
					}

					switch(units) {
						case "%":
							if(totalLength == UI.SIZE) {
								convertSizeToUndef ? void 0 : UI.SIZE;
							} else if (!require.is(totalLength,"Number")) {
								API.error("Could not compute percentage size/position of element.");
								return;
							} 
							return value / 100 * totalLength;
						case "mm":
							value /= 10;
						case "cm":
							return value * 0.393700787 * _.dpi;
						case "em":
						case "pt":
							value /= 12;
						case "pc":
							value /= 6;
						case "in":
							return value * _.dpi;
						case "px":
							return value;
						case "dp":
							return value * _.dpi / 96;
					}
				}
			} else if (type !== "Number") {
				x = void 0;
			}

			return x;
		}
	};
});
},
"Ti/_/style":function(){
/* /titanium/Ti/_/style.js */

define(["Ti/_", "Ti/_/string", "Ti/Filesystem"], function(_, string, Filesystem) {

	var vp = require.config.vendorPrefixes.dom,
		is = require.is,
		dummyNode = document.createElement("p");

	function set(node, name, value) {
		var i = 0,
			x,
			uc;
		if (node) {
			if (arguments.length > 2) {
				while (i < vp.length) {
					x = vp[i++];
					x += x ? uc || (uc = string.capitalize(name)) : name;
					if (x in node.style) {
						(is(value, "Array") ? value : [value]).forEach(function(v) { node.style[x] = v; });
						return value;
					}
				}
			} else {
				for (x in name) {
					set(node, x, name[x]);
				}
			}
		}
		return node;
	}

	return {
		discover: function(name, node) {
			var i = 0,
				x,
				uc;

			node || (node = dummyNode);

			while (i < vp.length) {
				x = vp[i++];
				x += x ? uc || (uc = string.capitalize(name)) : name;
				if (x in node.style) {
					return x;
				}
			}

			return name;
		},

		get: function(node, name) {
			return node.style[this.discover(name, node)];
		},

		set: set,

		supports: function(name, node) {
			var x = this.discover(name, node);
			return x in node.style;
		},

		url: function(/*String|Blob*/url) {
			if (url && url.declaredClass === "Ti.Blob") {
				return "url(" + url.toString() + ")";
			}

			var match = url && url.match(/^(.+):\/\//),
				file = match && ~Filesystem.protocols.indexOf(match[1]) && Filesystem.getFile(url);

			return file && file.exists()
				? "url(" + file.read().toString() + ")"
				: !url || url === "none"
					? ""
					: /^url\(/.test(url)
						? url
						: "url(" + (require.cache(url) || _.getAbsolutePath(url)) + ")";
		}
	};
});
},
"Ti/_/string":function(){
/* /titanium/Ti/_/string.js */

/**
 * String.format() functionality based on dojox.string code from Dojo Toolkit.
 *
 * Dojo Toolkit
 * Copyright (c) 2005-2011, The Dojo Foundation
 * New BSD License
 * <http://dojotoolkit.org>
 */

define(["Ti/_", "Ti/_/has", "Ti/_/lang"], function(_, has, lang) {

	var assert = _.assert,
		is = require.is,
		mix = require.mix,
		isOpera = has("opera"),
		zeros10 = "0000000000",
		spaces10 = "          ",
		specifiers = {
			b: {
				base: 2,
				isInt: 1
			},
			o: {
				base: 8,
				isInt: 1
			},
			x: {
				base: 16,
				isInt: 1
			},
			X: {
				extend: ["x"],
				toUpper: 1
			},
			d: {
				base: 10,
				isInt: 1
			},
			i: {
				extend: ["d"]
			},
			u: {
				extend: ["d"],
				isUnsigned: 1
			},
			c: {
				setArg: function(token) {
					if (!isNaN(token.arg)) {
						var num = parseInt(token.arg);
						assert(num < 0 || num > 127, "Invalid character code passed to %c in sprintf");
						token.arg = isNaN(num) ? "" + num : String.fromCharCode(num);
					}
				}
			},
			s: {
				setMaxWidth: function(token) {
					token.maxWidth = token.period === "." ? token.precision : -1;
				}
			},
			e: {
				isDouble: 1
			},
			E: {
				extend: ["e"],
				toUpper: 1
			},
			f: {
				isDouble: 1
			},
			F: {
				extend: ["f"]
			},
			g: {
				isDouble: 1
			},
			G: {
				extend: ["g"],
				toUpper: 1
			}
		};

	function pad(token, length, padding) {
		var tenless = length - 10,
			pad;

		is(token.arg, "String") || (token.arg = "" + token.arg);

		while (token.arg.length < tenless) {
			token.arg = token.rightJustify ? token.arg + padding : padding + token.arg;
		}

		pad = length - token.arg.length;
		token.arg = token.rightJustify ? token.arg + padding.substring(0, pad) : padding.substring(0, pad) + token.arg;
	}

	function zeroPad(token, length) {
		pad(token, lang.val(length, token.precision), zeros10);
	}

	function spacePad(token, length) {
		pad(token, lang.val(length, token.minWidth), spaces10);
	}

	function fitField(token) {
		token.maxWidth >= 0 && token.arg.length > token.maxWidth ? token.arg.substring(0, token.maxWidth) : token.zeroPad ? zeroPad(token, token.minWidth) : spacePad(token);
	}

	function formatInt(token) {
		var i = parseInt(token.arg);

		if (!isFinite(i)) {
			// allow this only if arg is number
			assert(!is(token.arg, "Number"), "Format argument '" + token.arg + "' not an integer; parseInt returned " + i);
			i = 0;
		}

		// if not base 10, make negatives be positive
		// otherwise, (-10).toString(16) is '-a' instead of 'fffffff6'
		i < 0 && (token.isUnsigned || token.base != 10) && (i = 0xffffffff + i + 1);

		if (i < 0) {
			token.arg = (-i).toString(token.base);
			zeroPad(token);
			token.arg = "-" + token.arg;
		} else {
			token.arg = i.toString(token.base);
			// need to make sure that argument 0 with precision==0 is formatted as ''
			i || token.precision ? zeroPad(token) : (token.arg = "");
			token.sign && (token.arg = token.sign + token.arg);
		}
		if (token.base === 16) {
			token.alternative && (token.arg = '0x' + token.arg);
			token.arg = token.toUpper ? token.arg.toUpperCase() : token.arg.toLowerCase();
		}
		token.base === 8 && token.alternative && token.arg.charAt(0) != '0' && (token.arg = '0' + token.arg);
	}

	function formatDouble(token) {
		var f = parseFloat(token.arg);

		if (!isFinite(f)) {
			// allow this only if arg is number
			assert(!is(token.arg, "Number"), "Format argument '" + token.arg + "' not a float; parseFloat returned " + f);
			// C99 says that for 'f':
			//   infinity -> '[-]inf' or '[-]infinity' ('[-]INF' or '[-]INFINITY' for 'F')
			//   NaN -> a string  starting with 'nan' ('NAN' for 'F')
			// this is not commonly implemented though.
			f = 0;
		}

		switch (token.specifier) {
			case 'e':
				token.arg = f.toExponential(token.precision);
				break;
			case 'f':
				token.arg = f.toFixed(token.precision);
				break;
			case 'g':
				// C says use 'e' notation if exponent is < -4 or is >= prec
				// ECMAScript for toPrecision says use exponential notation if exponent is >= prec,
				// though step 17 of toPrecision indicates a test for < -6 to force exponential.
				if(Math.abs(f) < 0.0001){
					//print("forcing exponential notation for f=" + f);
					token.arg = f.toExponential(token.precision > 0 ? token.precision - 1 : token.precision);
				}else{
					token.arg = f.toPrecision(token.precision);
				}

				// In C, unlike 'f', 'gG' removes trailing 0s from fractional part, unless alternative format flag ("#").
				// But ECMAScript formats toPrecision as 0.00100000. So remove trailing 0s.
				if(!token.alternative){
					//print("replacing trailing 0 in '" + s + "'");
					token.arg = token.arg.replace(/(\..*[^0])0*/, "$1");
					// if fractional part is entirely 0, remove it and decimal point
					token.arg = token.arg.replace(/\.0*e/, 'e').replace(/\.0$/,'');
				}
				break;
			default:
				throw new Error("Unexpected double notation '" + token.doubleNotation + "'");
		}

		// C says that exponent must have at least two digits.
		// But ECMAScript does not; toExponential results in things like "1.000000e-8" and "1.000000e+8".
		// Note that s.replace(/e([\+\-])(\d)/, "e$10$2") won't work because of the "$10" instead of "$1".
		// And replace(re, func) isn't supported on IE50 or Safari1.
		token.arg = token.arg.replace(/e\+(\d)$/, "e+0$1").replace(/e\-(\d)$/, "e-0$1");

		// Ensure a '0' before the period.
		// Opera implements (0.001).toString() as '0.001', but (0.001).toFixed(1) is '.001'
		isOpera && (token.arg = token.arg.replace(/^\./, '0.'));

		// if alt, ensure a decimal point
		if (token.alternative) {
			token.arg = token.arg.replace(/^(\d+)$/,"$1.");
			token.arg = token.arg.replace(/^(\d+)e/,"$1.e");
		}

		f >= 0 && token.sign && (token.arg = token.sign + token.arg);
		token.arg = token.toUpper ? token.arg.toUpperCase() : token.arg.toLowerCase();
	}

	String.format = function(format) {
		var args = lang.toArray(arguments),
			re = /\%(?:\(([\w_]+)\)|([1-9]\d*)\$)?([0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?[hlL]?([\%scdeEfFgGiouxX])/g,
			tokens = [],
			sequence,
			mapped = 0,
			match,
			copy,
			content,
			lastIndex = 0,
			position = 0,
			str = "",
			keys = ["mapping", "intmapping", "flags", "_minWidth", "period", "_precision", "specifier"];

		// tokenize
		while (match = re.exec(format)) {
			content = format.slice(lastIndex, re.lastIndex - match[0].length);
			content.length && tokens.push(content);
			if (isOpera) {
				copy = match.slice(0);
				while (copy.length < match.length) {
					copy.push(null);
				}
				match = copy;
			}
			sequence = {};
			match.slice(1).concat(tokens.length).map(function(x, y) {
				keys[y] && (sequence[keys[y]] = x);
			});
			tokens.push(sequence);
			sequence[0] && mapped++;
			lastIndex = re.lastIndex;
		}
		content = format.slice(lastIndex);
		content.length && tokens.push(content);

		// strip off the format
		args.shift();
		assert(!mapped || args.length, "Format has no mapped arguments");

		tokens.forEach(function(token) {
			var tf,
				flags = {},
				fi,
				flag,
				mixins = specifiers[token.specifier];

			if (is(token, "String")) {
				str += token;
			} else {
				if (mapped) {
					assert(args[token.mapping] === void 0, "Missing key " + token.mapping);
				} else {
					token.intmapping && (position = parseInt(token.intmapping) - 1);
					assert(position < args.length, "Got " + args.length + " format arguments, insufficient for '" + format + "'");
				}
				token.arg = args[mapped ? token.mapping : position++];

				if (!token.compiled) {
					mix(token, {
						compiled: 1,
						sign: "",
						zeroPad: 0,
						rightJustify: 0,
						alternative: 0,
						minWidth: token._minWidth | 0,
						maxWidth: -1,
						toUpper: 0,
						isUnsigned: 0,
						isInt: 0,
						isDouble: 0,
						precision: token.period === '.' ? token._precision | 0 : 1
					});

					for (tf = token.flags, fi = tf.length; fi--;) {
						flags[flag = tf.charAt(fi)] = 1;
						switch (flag) {
							case " ":
								token.sign = " ";
								break;
							case "+":
								token.sign = "+";
								break;
							case "0":
								token.zeroPad = !flags["-"];
								break;
							case "-":
								token.rightJustify = 1;
								token.zeroPad = 0;
								break;
							case "\#":
								token.alternative = 1;
								break;
							default:
								throw new Error("Bad formatting flag '" + flag + "'");
						}
					}

					assert(mixins !== void 0, "Unexpected specifier '" + token.specifier + "'");

					if (mixins.extend) {
						mix(mixins, specifiers[mixins.extend]);
						delete mixins.extend;
					}
					mix(token, mixins);
				}

				is(token.setArg, "Function") && token.setArg(token);
				is(token.setMaxWidth, "Function") && token.setMaxWidth(token);

				if (token._minWidth === "*") {
					assert(mapped, "* width not supported in mapped formats");
					assert(isNaN(token.minWidth = parseInt(args[position++])), "The argument for * width at position " + position + " is not a number in " + this._format);
					// negative width means rightJustify
					if (token.minWidth < 0) {
						token.rightJustify = 1;
						token.minWidth = -token.minWidth;
					}
				}

				if(token._precision === "*" && token.period === "."){
					assert(mapped, "* precision not supported in mapped formats");
					assert(isNaN(token.precision = parseInt(args[position++])), "The argument for * precision at position " + position + " is not a number in " + this._format);
					// negative precision means unspecified
					if (token.precision < 0) {
						token.precision = 1;
						token.period = '';
					}
				}

				if (token.isInt) {
					// a specified precision means no zero padding
					token.period === '.' && (token.zeroPad = 0);
					formatInt(token);
				} else if(token.isDouble) {
					token.period !== '.' && (token.precision = 6);
					formatDouble(token);
				}

				fitField(token);

				str += "" + token.arg;
			}
		});

		return str;
	};

	return {
		capitalize: function(s) {
			s = s || "";
			return s.substring(0, 1).toUpperCase() + s.substring(1);
		},

		trim: String.prototype.trim ?
			function(str){ return str.trim(); } :
			function(str){ return str.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); }
	};

});
},
"Ti/Filesystem":function(){
/* /titanium/Ti/Filesystem.js */

define(["Ti/_", "Ti/_/Evented", "Ti/_/lang", "Ti/Filesystem/File"],
	function(_, Evented, lang, File) {

	var applicationDataDirectory = "appdata://",
		tempDirectory = "tmp://";

	function join() {
		var re = /(.+:\/\/)?(.*)/,
			prefix = "",
			result = [],
			lastSegment,
			path = lang.toArray(arguments).filter(function(a) {
				return a !== void 0;
			}).map(function(a) {
				prefix || (prefix = a.match(re)) && (prefix = prefix[1] || "");
				return a.replace(prefix, "").replace(/^\/|\/$/g, '');
			}).join('/');

		// compact the path
		path.split('/').forEach(function(segment) {
			if (segment === ".." && lastSegment !== "..") {
				if (!result.length) {
					throw new Error('Irrational path "' + path + '"')
				}
				result.pop();
				lastSegment = result[result.length - 1];
			} else if (segment && segment !== ".") {
				result.push(lastSegment = segment);
			}
		});

		// re-assemble path
		path = prefix + result.join('/');
		if (!prefix && !/^\//.test(path)) {
			path = '/' + path;
		}

		return path;
	}

	function makeTemp(type) {
		var f = new File({
			_type: type.charAt(0),
			nativePath: tempDirectory + _.uuid()
		});
		return f["create" + type]() ? f : null;
	}

	return lang.setObject("Ti.Filesystem", Evented, {
		constants: {
			MODE_APPEND: 4,
			MODE_READ: 1,
			MODE_WRITE: 2,
			applicationDataDirectory: applicationDataDirectory,
			lineEnding: '\n',
			resourcesDirectory: '/',
			separator: '/',
			tempDirectory: tempDirectory
		},

		protocols: ["appdata", "tmp"],

		createTempDirectory: function() {
			return makeTemp("Directory");
		},

		createTempFile: function() {
			return makeTemp("File");
		},

		getFile: function() {
			return new File(join.apply(null, arguments));
		},

		isExternalStoragePresent: function() {
			return false;
		},

		openStream: function(mode) {
			var args = lang.toArray(arguments),
				file;
			args.shift();
			file = new File(join.apply(null, args));
			return file.open(mode);
		}
	});

});
},
"Ti/Filesystem/File":function(){
/* /titanium/Ti/Filesystem/File.js */

define(["Ti/_/declare", "Ti/_/Filesystem/Local", "Ti/App/Properties"], function(declare, Local, Properties) {

	var backend = Properties.getString("ti.fs.backend");

	return declare("Ti.Filesystem.File", backend ? require(backend) : Local);

});
},
"Ti/_/declare":function(){
/* /titanium/Ti/_/declare.js */

/**
 * declare() functionality based on code from Dojo Toolkit.
 *
 * Dojo Toolkit
 * Copyright (c) 2005-2011, The Dojo Foundation
 * New BSD License
 * <http://dojotoolkit.org>
 */

define(['Ti/_', 'Ti/_/lang'], function(_, lang) {
	var classCounters = {},
		objProto = Object.prototype,
		fnRegExp = /^\d*|[^A-Za-z0-9_]*/g;

	function declare(className, superclass, definition) {
		var ctor,
			proto = {},
			ctors = [],
			tmp;

		if (typeof className != 'string') {
			definition = superclass;
			superclass = className;
			className = '';
		}

		proto.__def__ = definition = definition || {};

		tmp = definition.constructor;
		if (typeof tmp == 'function' && tmp !== objProto.constructor) {
			ctors.push(tmp);
		}

		if (typeof superclass == 'function') {
			tmp = superclass.prototype;
			tmp.__ctors__ && (ctors = ctors.concat(tmp.__ctors__));
			lang.mixProps(proto, tmp, 0, 1);
		} else if (superclass && typeof superclass == 'object') {
			lang.mixProps(proto, superclass, 0, 1);
		}

		proto.declaredClass = className;
		lang.mixProps(proto, definition);
		proto.__ctors__ = ctors;

		ctor = new Function('con', 'return function ' + (className && className.replace(fnRegExp, '') || 'AnonymousClass') + '(){con.apply(this,arguments);};')(function () {
			var dc = this.declaredClass,
				a = arguments,
				a0 = a[0],
				special = ['properties', 'constants'],
				def = this.__def__,
				i, c, type, descriptor,
				v = this.__values__ = {};

			// set the widget id
			if (dc) {
				classCounters[dc] || (classCounters[dc] = 0);
				this.widgetId = dc + ':' + (classCounters[dc]++);
			}

			// initialize the internal storage values
			for (i = 0; i < special.length; i++) {
				type = special[i];
				if (def[type]) {
					for (c in def[type]) {
						descriptor = def[type][c];
						if (descriptor && typeof descriptor == 'object' && (typeof descriptor.get == 'function' || typeof descriptor.set == 'function' || descriptor.post)) {
							v[type] || (v[type] = {});
							v[type][c] = descriptor.value;
						} else if (typeof descriptor != 'function') {
							v[type] || (v[type] = {});
							v[type][c] = descriptor;
						}
					}
				}
			}

			// call constructors
			for (i = ctors.length; i;) {
				ctors[--i].apply(this, a);
			}

			// mix in args, if any
			if (a0 && typeof a0 == 'object') {
				c = this.__values__.constants;
				for (i in a0) {
					(c && c.hasOwnProperty(i) ? c : this)[i] = a0[i];
				}
			}

			// add the toString() function for all our objects
			this.toString === objProto.toString && (this.toString = function() {
				return '[object ' + (dc ? dc.replace(/\./g, '') : 'Object') + ']';
			});

			// continue the original ritual: call the postscript
			f = this.postscript;
			f && f.apply(this, a);
		});

		ctor.prototype = proto;

		className && lang.setObject(className, ctor);

		return ctor;
	}

	return _.declare = declare;
});
},
"Ti/_/Filesystem/Local":function(){
/* /titanium/Ti/_/Filesystem/Local.js */

define(["Ti/_", "Ti/_/Evented", "Ti/_/declare", "Ti/_/encoding", "Ti/_/lang", "Ti/API", "Ti/Blob"],
	function(_, Evented, declare, encoding, lang, API, Blob) {

	var reg,
		regDate = Date.now(),
		File,
		Filesystem,
		is = require.is,
		ls = localStorage,
		slash = '/',
		metaMap = {
			n: "sname",
			c: "i_created",
			m: "i_modified",
			t: "s_type",
			y: "s_mimeType",
			e: "b_remote",
			x: "bexecutable",
			r: "breadonly",
			s: "isize",
			l: "bsymbolicLink",
			h: "bhidden"
		},
		metaCast = {
			i: function(i) {
				return i - 0;
			},
			s: function(s) {
				return ""+s;
			},
			b: function(b) {
				return !!(b|0);
			}
		},
		metaPrefix = "ti:fs:meta:",
		blobPrefix = "ti:fs:blob:",
		pathRegExp = /(\/)?([^\:]*)(\:\/\/)?(.*)/,

		// important! add new mime types to the end of array and then figure out the index to assign to each extension
		mimeTypes = "application/octet-stream,text/plain,text/html,text/css,text/xml,text/mathml,image/gif,image/jpeg,image/png,image/x-icon,image/svg+xml,application/x-javascript,application/json,application/pdf,application/x-opentype,audio/mpeg,video/mpeg,video/quicktime,video/x-flv,video/x-ms-wmv,video/x-msvideo,video/ogg,video/mp4,video/webm,text/csv".split(','),
		mimeExtentions = { txt: 1, html: 2, htm: 2, css: 3, xml: 4, mml: 5, gif: 6, jpeg: 7, jpg: 7, png: 8, ico: 9, svg: 10, js: 11, json: 12, pdf: 13, otf: 14, mp3: 15, mpeg: 16, mpg: 16, mov: 17, flv: 18, wmv: 19, avi: 20, ogg: 21, ogv: 21, mp4: 22, m4v: 22, webm: 23, csv: 24 };

	function getLocal(path, meta) {
		return ls.getItem("ti:fs:" + (meta ? "meta:" : "blob:") + path);
	}

	function setLocal(path, value, meta) {
		ls.setItem("ti:fs:" + (meta ? "meta:" : "blob:") + path, value);
		return value.length;
	}

	function getRemote(path) {
		var xhr = new XMLHttpRequest;
		xhr.overrideMimeType && xhr.overrideMimeType('text/plain; charset=x-user-defined');
		xhr.open("GET", '.' + path, false);
		xhr.send(null);
		return xhr.status === 200 ? { data: xhr.responseText, mimeType: xhr.getResponseHeader("Content-Type") } : null;
	}

	function registry(path) {
		var stack = [],
			r;

		if (!reg) {
			reg = {
				'/': "tD\nr1"
			};

			require("./.././filesystem.registry").split(/\n|\|/).forEach(function(line, i) {
				var depth = 0,
					line = line.split('\t'),
					len = line.length,
					name;

				if (i === 0 && line[0] === "ts") {
					regDate = line[1];
					reg[slash] += "\nc" + regDate;
				} else {
					for (; depth < len && !line[depth]; depth++) {}
					stack = stack.slice(0, depth).concat(name = line[depth]);
					reg[slash + stack.join(slash)] = "n" + name + "\nt" + (depth + 1 == len ? 'D' : 'F\ns' + line[depth + 1]);
				}
			});
		}
		return (r = reg[path]) && r + "\nr1\ne1\nc" + regDate + "\nm" + regDate;
	}

	function filesystem() {
		return Filesystem || (Filesystem = require("Ti/Filesystem"));
	}

	function mkdir(prefix, parts, i, parent) {
		var file,
			i = i || 1,
			path = prefix + parts.slice(0, i).join(slash);

		if (parent && parent.readonly) {
			// parent directory is readonly, so we can't create a directory here
			API.error('Unable to create "' + path + '" because parent is readonly');
			return false;
		}

		file = new File({
			nativePath: path,
			type: 'D'
		});
		file.createDirectory();

		if (++i > parts.length) {
			// we're done!
			return true;
		}

		return mkdir(prefix, parts, i, file);
	}

	function mkdirs(path) {
		if (path) {
			var match = path.match(pathRegExp),
				prefix = (match[1] ? match[1] : match[2] + match[3]) || slash;
			path = match[1] ? match[2] : match[4];
			return path ? mkdir(prefix, path.split(slash)) : true;
		}
		return false;
	}

	function cpdir(src, dest) {
		var path = src.nativePath,
			re = new RegExp("^(ti:fs:meta|ti:fs:blob):" + path + (/\/$/.test(path) ? '' : slash) + "(.*)"),
			match,
			key,
			i = 0,
			len = ls.length;

		dest = filesystem().getFile(dest.nativePath, src.name);

		if (mkdirs(dest.nativePath)) {
			while (i < len) {
				key = ls.key(i++);
				(match = key.match(re)) && ls.setItem(match[1] + ':' + dest.nativePath + slash + match[2], ls.getItem(key) || '');
			}
			return true;
		}

		return false;
	}

	function purgeTemp() {
		var re = /^ti:fs:tmp:\/\//,
			i = 0,
			len = ls.length,
			key;
		while (i < len) {
			key = ls.key(i++);
			re.test(key) && ls.removeItem(key);
		}
	}
	purgeTemp();
	require.on(window, "beforeunload", purgeTemp);

	(function(paths, now) {
		for (var p in paths) {
			getLocal(p, 1) || setLocal(p, "c" + now + "\nm" + now + "\ntD\ne0\nx0\nl0\nh0\nr" + paths[p], 1);
		}
	}({
		"appdata://": 0,
		"/": 1,
		"tmp://": 0
	}, Date.now()));

	return File = declare("Ti._.Filesystem.Local", Evented, {

		constructor: function(path) {
			if (is(path, "String")) {
				var match = path.match(pathRegExp),
					b = !match[1] && match[3];

				if (/^\.\./.test(path = b ? match[4] : match[2])) {
					throw new Error('Irrational path "' + path + '"');
				}

				this.__values__.constants.nativePath = (b ? match[2] + "://" : slash) + path;
			}

			this._type = !path || path._type === 'D' ? 'D' : 'F';
		},

		postscript: function(args) {
			var c = this.__values__.constants,
				path = this.nativePath,
				metaData = path && getLocal(path, 1) || registry(path),
				match = path.match(pathRegExp),
				prefix = (match[1] ? match[1] : match[2] + match[3]) || slash,
				parentPath,
				parent;

			metaData && (this._exists = 1) && metaData.split('\n').forEach(function(line) {
				var fieldInfo = metaMap[line.charAt(0)],
					field = fieldInfo.substring(1),
					value = metaCast[fieldInfo.charAt(0)](line.substring(1));
				(c.hasOwnProperty(field) ? c : this)[field] = value;
			}, this);

			path = match[1] ? match[2] : match[4];
			parentPath = path.split(slash);
			c.name = parentPath.pop();
			parentPath = parentPath.join(slash);
			parent = c.parent = path ? new File(prefix + parentPath) : null;

			(parent && parent.readonly) || (match && match[1]) && (c.readonly = true);
		},

		constants: {
			name: "",
			executable: false,
			readonly: false,
			size: 0,
			symbolicLink: false,
			nativePath: "",
			parent: null,
			writable: {
				get: function() {
					return !this.readonly;
				},
				set: function(value) {
					return this.__values__.constants.readonly = !value;
				},
				value: true
			}
		},

		properties: {
			hidden: false
		},

		append: function(/*Ti.Blob|Ti.Filesystem.File*/data) {
			if (this.isFile()) {
				switch (data && data.declaredClass) {
					case "Ti.Filesystem.File":
						data = data.read();
					case "Ti.Blob":
						this._mimeType = data.mimeType;
						data = data.text;
				}
				var blob = this.read();
				blob.append(data);
				return this.write(blob);
			}
			return false;
		},

		copy: function(dest) {
			if (this.exists && dest) {
				var fs = filesystem(),
					dest = dest.declaredClass === "Ti.Filesystem.File" ? dest : fs.getFile.apply(null, arguments),
					p = dest.parent,
					isFile = this.isFile();
				if (dest.exists()) {
					if (dest.readonly) {
						return false;
					}
					if (dest.isFile()) {
						if (!isFile) {
							Ti.API.error("Destination is not a directory");
							return false;
						}
						return dest.write(this.read());
					} else {
						return isFile ? fs.getFile(dest.nativePath, this.name).write(this.read()) : cpdir(this, dest);
					}
				} else {
					if (p) {
						p.createDirectory();
						if (!p.exists() || p.readonly || (!isFile && !dest.createDirectory())) {
							return false;
						}
					}
					return isFile ? dest.write(this.read()) : cpdir(this, dest);
				}
			}
			return false;
		},

		createDirectory: function() {
			return this._create('D');
		},

		createFile: function() {
			return this._create('F');
		},

		createTimestamp: function() {
			return this._created || null;
		},

		deleteDirectory: function(recursive) {
			if (this.isDirectory() && !this.readonly) {
				var path = this.nativePath,
					re = new RegExp("^ti:fs:(meta|blob):" + path + (/\/$/.test(path) ? '' : slash) + ".*"),
					i = 0,
					len = ls.length;
				while (i < len) {
					if (re.test(key = ls.key(i++))) {
						if (!recursive) {
							Ti.API.error('Directory "' + path + '" not empty');
							return false;
						}
						ls.removeItem(key);
					}
				}
				this._exists = 0;
				ls.removeItem(metaPrefix + path);
				ls.removeItem(blobPrefix + path);
				return true;
			}
			return false;
		},

		deleteFile: function() {
			if (this.exists() && this.isFile() && !this.readonly) {
				var path = this.nativePath;
				this._exists = 0;
				ls.removeItem(metaPrefix + path);
				ls.removeItem(blobPrefix + path);
				return true;
			}
			return false;
		},

		exists: function() {
			return !!this._exists;
		},

		extension: function() {
			var m = this.name.match(/\.(.+)$/);
			return m ? m[1] : "";
		},

		getDirectoryListing: function() {
			var files = [];
			if (this.isDirectory()) {
				var path = this.nativePath + (/\/$/.test(this.nativePath) ? '' : slash),
					lsRegExp = new RegExp("^" + metaPrefix + path + "(.*)"),
					regRegExp = new RegExp("^" + path + "(.*)"),
					i = 0,
					len = ls.length;

				function add(s, re) {
					var file, match = s.match(re);
					match && match[1] && files.indexOf(file = match[1].split(slash)[0]) < 0 && files.push(file);
				}

				// check local storage
				while (i < len) {
					add(ls.key(i++), lsRegExp);
				}

				// check remote storage
				for (i in reg) {
					add(i, regRegExp);
				}
			}
			return files.sort();
		},

		isDirectory: function() {
			return this._type === 'D';
		},

		isFile: function() {
			return this._type === 'F';
		},

		modificationTimestamp: function() {
			return this._modified || null;
		},

		move: function() {
			return this.copy.apply(this, arguments) && this[this.isFile() ? "deleteFile" : "deleteDirectory"](1);
		},

		open: function(mode) {
			var FileStream = require("Ti/Filesystem/FileStream");
			return this.exists() && this.isFile() ? new FileStream({
				mode: mode,
				data: this.read().text
			}) : null;
		},

		read: function() {
			if (this.exists() && this.isFile()) {
				var path = this.nativePath,
					obj,
					data = this._remote ? (obj = getRemote(path)).data : getLocal(path) || "",
					defaultMimeType =  mimeTypes[mimeExtentions[this.extension()] || 0],
					type = obj && obj.mimeType || this._mimeType || defaultMimeType,
					i = 0,
					len = data.length,
					binaryData = '',
					params = {
						file: this,
						data: data,
						length: len,
						mimeType: type = type === "application/octet-stream" && type !== defaultMimeType ? defaultMimeType : type,
						nativePath: path
					};

				if (this._remote && _.isBinaryMimeType(type)) {
					while (i < len) {
						binaryData += String.fromCharCode(data.charCodeAt(i++) & 0xff);
					}
					params.data = btoa(binaryData);
				}

				return new Blob(params);
			}
			return null;
		},

		rename: function(name) {
			if (this.exists && !this.readonly) {
				var origPath = this.nativePath,
					path = origPath,
					blob = ls.getItem(blobPrefix + path),
					re = new RegExp("^ti:fs:(meta|blob):" + path + (/\/$/.test(path) ? '' : slash) + "(.*)"),
					match = path.match(pathRegExp),
					prefix = (match[1] ? match[1] : match[2] + match[3]) || slash,
					i = 0,
					len = ls.length,
					c = this.__values__.constants,
					dest,
					key;

				path = match[1] ? match[2] : match[4];

				if (!path) {
					Ti.API.error('Can\'t rename root "' + prefix + '"');
					return false;
				}

				path = path.split(slash);
				path.pop();
				path.push(name);

				dest = new File(path = prefix + path.join(slash));
				if (dest.exists() || dest.parent.readonly) {
					return false;
				}

				if (this._type === 'D') {
					while (i < len) {
						key = ls.key(i++);
						if (match = key.match(re)) {
							ls.setItem("ti:fs:" + match[1] + ":" + path + slash + match[2], ls.getItem(key));
							ls.removeItem(key);
						}
					}
				}

				this._save(path, name);
				blob && ls.setItem(blobPrefix + path, blob);
				ls.removeItem(metaPrefix + origPath);
				ls.removeItem(blobPrefix + origPath);

				return true;
			}
			return false;
		},

		resolve: function() {
			return this.nativePath;
		},

		spaceAvailable: function() {
			return "remainingSpace" in ls ? ls.remainingSpace : null;
		},

		write: function(/*String|File|Blob*/data, append) {
			var path = this.nativePath;
			if (path && this.isFile() && !this.readonly && this.parent && !this.parent.readonly) {
				data && is(data, "String") && (this._mimeType = mimeTypes[1]);
				switch (data && data.declaredClass) {
					case "Ti.Filesystem.File":
						data = data.read();
					case "Ti.Blob":
						this._mimeType = data.mimeType;
						data = data._data || "";
				}
				this._exists = 1;
				this._modified = Date.now();
				this._created || (this._created = this._modified);
				this.__values__.constants.size = setLocal(path, append ? this.read() + data : data);
				return this._save();
			}
			return false;
		},

		_create: function(type) {
			if (!this.exists() && this.parent && !this.parent.readonly && mkdirs(this.parent.nativePath)) {
				this._created = this._modified = Date.now();
				this._exists = 1;
				this._type = type;
				return this._save();
			}
			return false;
		},

		_save: function(path, name) {
			var path = path || this.nativePath,
				meta;
			if (path) {
				meta = ["n", name || this.name, "\nc", this._created, "\nm", this._modified, "\nt", this._type, "\ne0\nx0\nr", this.readonly|0, "\nl", this.symbolicLink|0, "\nh", this.hidden|0];
				this._type === 'F' && meta.push("\ns" + this.size);
				this._mimeType && meta.push("\ny" + this._mimeType);
				setLocal(path, meta.join(''), 1);
				return true;
			}
			return false;
		}

	});

});
},
"Ti/_/encoding":function(){
/* /titanium/Ti/_/encoding.js */

define(["Ti/_/lang"], function(lang) {

	var fromCharCode = String.fromCharCode,
		x = 128;

	return lang.setObject("Ti._.encoding", {

		utf8encode: function(str) {
			var c,
				str = str.replace(/\r\n/g,"\n"),
				i = 0,
				len = str.length,
				bytes = [];

			while (i < len) {
				c = str.charCodeAt(i++);

				if (c < x) {
					bytes.push(fromCharCode(c));
				} else if((c >= x) && (c < 2048)) {
					bytes.push(fromCharCode((c >> 6) | 192));
					bytes.push(fromCharCode((c & 63) | x));
				} else {
					bytes.push(fromCharCode((c >> 12) | 224));
					bytes.push(fromCharCode(((c >> 6) & 63) | x));
					bytes.push(fromCharCode((c & 63) | x));
				}
			}

			return bytes.join('');
		},

		utf8decode: function(bytes) {
			var str = [],
				i = 0,
				len = bytes.length,
				c,
				c2;

			while (i < len) {
				c = bytes.charCodeAt(i);
				if (c < x) {
					str.push(fromCharCode(c));
					i++;
				} else {
					c2 = bytes.charCodeAt(i+1);
					if(c > 191 && c < 224) {
						str.push(fromCharCode(((c & 31) << 6) | (c2 & 63)));
						i += 2;
					} else {
						str.push(fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (bytes.charCodeAt(i+2) & 63)));
						i += 3;
					}
				}
			}

			return str.join('');
		}

	});

});
},
"Ti/Blob":function(){
/* /titanium/Ti/Blob.js */

define(["Ti/_", "Ti/_/declare", "Ti/_/Evented"], function(_, declare, Evented) {

	return declare("Ti.Blob", Evented, {

		constructor: function(args) {
			args = args || {};
			this._data = args.data || "";
		},

		postscript: function() {
			var type = this.mimeType,
				img,
				v = this.__values__.constants;

			(this._isBinary = _.isBinaryMimeType(type)) && (v.size = v.length);

			if (!type.indexOf("image/")) {
				img = new Image;
				require.on.once(img, "load", function() {
					v.width = img.width;
					v.height = img.height;
				});
				img.src = this.toString();
			}
		},

		append: function(/*String|Blob*/blob) {
			blob && (this._data = (this._data || "") + blob.toString());
		},

		toString: function() {
			return (this._isBinary ? "data:" + this.mimeType + ";base64," : "") + (this._data || "");
		},

		constants: {
			file: null,
			height: 0,
			length: 0,
			mimeType: "",
			nativePath: null,
			size: 0,
			text: function() {
				return this._isBinary ? null : this._data || "";
			},
			width: 0
		}

	});

});
},
"Ti/App/Properties":function(){
/* /titanium/Ti/App/Properties.js */

define(["Ti/_/Evented", "Ti/_/lang"], function(Evented, lang) {

	var storageKey = "ti:properties",
		types = {
			"Bool": function(value) {
				return !!value;
			},
			"Double": function(value) {
				return parseFloat(value);
			},
			"Int": function(value) {
				return parseInt(value);
			},
			"List": function(value) {
				return require.is(value, "Array") ? value : [value];
			},
			"Object": function(value) {
				return value;
			},
			"String": function(value) {
				return "" + value;
			}
		},
		type,
		storage,
		api = lang.setObject("Ti.App.Properties",  Evented, {
			hasProperty: function(prop) {
				return !!getStorage(prop);
			},
			listProperties: function() {
				var storage = getStorage(),
					props = [],
					prop;
				for (prop in storage) {
					props.push(prop);
				}
				return props;
			},
			removeProperty: function(prop) {
				setProp(prop);
			}
		});

	function getStorage(prop) {
		if (!storage) {
			var value = localStorage.getItem(storageKey);
			storage = (require.is(value, "String") && JSON.parse(value)) || {};
		}
		if (prop) {
			return storage[prop];
		}
		return storage;
	}

	function getProp(prop, type, defaultValue) {
		var value = getStorage(prop);
		return value === void 0 ? lang.val(defaultValue, null) : types[type] ? types[type](value) : value;
	}

	function setProp(prop, type, value) {
		if (prop) {
			getStorage();
			if (value === void 0 || value === null) {
				delete storage[prop];
			} else {
				storage[prop] = types[type] ? types[type](value) : value;
			}
			localStorage.setItem(storageKey, JSON.stringify(storage));
		}
	}

	for (type in types) {
		(function(t) {
			api["get" + t] = function(prop, defaultValue) {
				return getProp(prop, t, defaultValue);
			};
			api["set" + t] = function(prop, value) {
				setProp(prop, t, value)
			};
		}(type));
	}

	return api;

});
},
"Ti/App":function(){
/* /titanium/Ti/App.js */

define(["Ti/_", "Ti/_/Evented", "Ti/_/lang"], function(_, Evented, lang) {

	return lang.setObject("Ti.App", Evented, {
		constants: require.mix({
			sessionId: function() {
				var ss = sessionStorage,
					sid = ss.getItem("ti:sessionId");
				sid || ss.setItem("ti:sessionId", sid = _.uuid());
				return sid;
			}
		}, require.config.app),

		getID: function() {
			return this.id;
		},

		getURL: function() {
			return this.url;
		},

		getGUID: function() {
			return this.guid;
		}
	});

});
},
"Ti/Platform":function(){
/* /titanium/Ti/Platform.js */

define(['Ti/_', 'Ti/_/browser', 'Ti/_/Evented', 'Ti/_/lang', 'Ti/Locale', 'Ti/_/dom', 'Ti/UI'],
	function (_, browser, Evented, lang, Locale, dom, UI) {

	var doc = document,
		midName = 'ti:mid',
		matches = doc.cookie.match(new RegExp('(?:^|; )' + midName + '=([^;]*)')),
		mid = matches ? decodeURIComponent(matches[1]) : void 0,
		unloaded,
		on = require.on,
		tiConfig = require.config.ti,
		hiddenIFrame = dom.create('iframe', { id: 'urlOpener', style: {display: 'none'} }, doc.body),
		nav = navigator,
		battery = nav.battery || nav.webkitBattery || nav.mozBattery,
		Platform;

	mid || (mid = localStorage.getItem(midName));
	mid || localStorage.setItem(midName, mid = _.uuid());

	function saveMid() {
		if (!unloaded) {
			unloaded = 1;
			// expire cookie in 20 years... forever in mobile terms
			doc.cookie = midName + '=' + encodeURIComponent(mid) + '; expires=' + (new Date(Date.now() + 63072e7)).toUTCString();
			localStorage.setItem(midName, mid);
		}
	}

	on(window, 'beforeunload', saveMid);
	on(window, 'unload', saveMid);

	Platform = lang.setObject('Ti.Platform', Evented, {
		canOpenURL: function (url) {
			return !!url;
		},

		createUUID: _.uuid,

		is24HourTimeFormat: function () {
			return false;
		},

		openURL: function (url){
			if (/^([tel|sms|mailto])/.test(url)) {
				hiddenIFrame.contentWindow.location.href = url;
			} else {
				var win = UI.createWindow({
						layout: UI._LAYOUT_CONSTRAINING_VERTICAL,
						backgroundColor: '#888'
					}),
					backButton = UI.createButton({
						top: 2,
						bottom: 2,
						title: 'Close'
					}),
					webview = UI.createWebView({
						width: UI.FILL,
						height: UI.FILL
					});
				backButton.addEventListener('singletap', function () {
					win.close();
				});
				win.add(backButton);
				win.add(webview);
				win.open();
				setTimeout(function () {
					webview.url = url;
				}, 1);
			}
		},

		properties: {
			batteryMonitoring: false
		},

		constants: {
			BATTERY_STATE_CHARGING: 1,
			BATTERY_STATE_FULL: 2,
			BATTERY_STATE_UNKNOWN: -1,
			BATTERY_STATE_UNPLUGGED: 0,
			address: void 0,
			architecture: void 0,
			availableMemory: void 0,
			batteryLevel: function () {
				return this.batteryMonitoring && battery ? battery.level * 100 : -1;
			},
			batteryState: function () {
				return this.batteryMonitoring && battery && battery.charging ? this.BATTERY_STATE_CHARGING : this.BATTERY_STATE_UNKNOWN;
			},
			isBrowser: true,
			id: mid,
			locale: Locale,
			macaddress: void 0,
			model: nav.userAgent,
			name: tiConfig.platformName,
			netmask: void 0,
			osname: tiConfig.osName,
			ostype: nav.platform,
			runtime: browser.runtime,
			processorCount: void 0,
			username: void 0,
			version: tiConfig.version
		}
	});

	battery && require.on(battery, 'chargingchange', function () {
		Platform.batteryMonitoring && Platform.fireEvent('battery', {
			level: Platform.batteryLevel,
			state: Platform.batteryState
		});
	});

	return Platform;
});

},
"Ti/_/browser":function(){
/* /titanium/Ti/_/browser.js */

define(["Ti/_"], function(_) {
	var match = navigator.userAgent.toLowerCase().match(/(webkit|gecko|trident|presto)/);
	return _.browser = {
		runtime: match ? match[0] : "unknown"
	};
});
},
"Ti/Locale":function(){
/* /titanium/Ti/Locale.js */

define(["require", "Ti/_/lang", "Ti/_/Evented", "Ti/API"],
	function(require, lang, Evented, API) {

	var locale = lang.val(navigator.language,navigator.browserLanguage).replace(/^([^\-\_]+)[\-\_](.+)?$/, function(o, l, c){ return l.toLowerCase() + (c && "-" + c.toUpperCase()); }),
		languageParts = locale.split("-"),
		language = languageParts[0],
		strings = {},
		cfg = require.config,
		app = cfg.app;

	// Add `dir` attribute to set text direction for language
	document.body.dir = /^ar|he$/.test(language) ? 'RTL' : 'LTR';

	document.title = app.name = app.names[language] || app.name;

	try {
		~cfg.locales.indexOf(language) && (strings = require("./Locale/" + language + "/i18n"));
	} catch (e) {}

	function getString(key, hint) {
		return strings[key] || hint || key || "";
	}

	Object.defineProperty(window, "L", { value: getString, enumarable: true });

	// format a date into a locale specific date format. Optionally pass a second argument (string) as either "short" (default), "medium" or "long" for controlling the date format.
	String.formatDate = function(dt, fmt) {
		API.debug('Method "String.formatDate" is not implemented yet.');
		return dt.toString();
	};

	// format a date into a locale specific time format.
	String.formatTime = function(dt) {
		API.debug('Method "String.formatTime" is not implemented yet.');
		return dt.toString();
	};

	// format a number into a locale specific currency format.
	String.formatCurrency = function(amt) {
		API.debug('Method "String.formatCurrency" is not implemented yet.');
		return amt;
	};

	// format a number into a locale specific decimal format.
	String.formatDecimal = function(dec) {
		API.debug('Method "String.formatDecimal" is not implemented yet.');
		return dec;
	};

	return lang.setObject("Ti.Locale", Evented, {

		constants: {
			currentCountry: languageParts[1] || "",
			currentLanguage: languageParts[0] || "",
			currentLocale: locale
		},

		formatTelephoneNumber: function(s) {
			return s;
		},

		getCurrencyCode: function(locale) {
			// locale = "en-US" => "USD"
			return "";
		},

		getCurrencySymbol: function(currencyCode) {
			// currencyCode = "en-US" => "$"
			return "";
		},

		getLocaleCurrencySymbol: function(locale) {
			// locale = "en-US" => "$"
			return "";
		},

		getString: getString,

		_getString: function(key, hint) {
			return lang.val(hint, getString(key, hint));
		}

	});

});
},
"Ti/UI":function(){
/* /titanium/Ti/UI.js */

/*global Ti define window document navigator instrumentation*/
define(
	['Ti/_', 'Ti/_/Evented', 'Ti/_/has', 'Ti/_/lang', 'Ti/_/ready', 'Ti/_/style', 'Ti/_/dom', 'Ti/_/event',
	'Ti/_/Gestures/DoubleTap', 'Ti/_/Gestures/Dragging', 'Ti/_/Gestures/LongPress', 'Ti/_/Gestures/Pinch', 'Ti/_/Gestures/SingleTap',
	'Ti/_/Gestures/Swipe', 'Ti/_/Gestures/TouchCancel', 'Ti/_/Gestures/TouchEnd', 'Ti/_/Gestures/TouchMove',
	'Ti/_/Gestures/TouchStart', 'Ti/_/Gestures/TwoFingerTap'],
	function(_, Evented, has, lang, ready, style, dom, event,
		DoubleTap, Dragging, LongPress, Pinch, SingleTap, Swipe, TouchCancel, TouchEnd, TouchMove, TouchStart, TwoFingerTap) {

	var global = window,
		doc = document,
		body = doc.body,
		on = require.on,
		is = require.is,
		modules = '2DMatrix,ActivityIndicator,AlertDialog,Animation,Button,EmailDialog,ImageView,Label,OptionDialog,Picker,PickerColumn,PickerRow,ProgressBar,ScrollableView,ScrollView,Slider,Switch,Tab,TabGroup,TableView,TableViewRow,TableViewSection,TextArea,TextField,View,WebView,Window',
		creators = {},
		setStyle = style.set,
		handheld = navigator.userAgent.toLowerCase().match(/(iphone|android)/),
		iphone = handheld && handheld[0] === 'iphone',
		targetHeight = {},
		hidingAddressBar,
		finishAddressBar = function() {
			Ti.UI._recalculateLayout();
			hidingAddressBar = 0;
		},
		hideAddressBar = finishAddressBar,
		splashScreen,
		unitize = dom.unitize,
		Gesture,
		recognizers = [
			TouchStart,
			TouchEnd,
			TouchMove,
			TouchCancel,
			Dragging,
			SingleTap,
			DoubleTap,
			LongPress,
			Pinch,
			Swipe,
			TwoFingerTap
		];

	on(body, 'touchmove', function(e) {
		e.preventDefault();
	});

	modules.split(',').forEach(function(name) {
		creators['create' + name] = function(args) {
			return new (require('Ti/UI/' + name))(args);
		};
	});

	if (!navigator.standalone && handheld) {
		hideAddressBar = function() {
			if (!hidingAddressBar) {
				hidingAddressBar = 1;
				var isPortrait = require('Ti/Gesture').isPortrait | 0,
					h = targetHeight[isPortrait],
					timer;

				if (!h) {
					if (iphone) {
						h = global.innerHeight + 60;
						if (global.screen.availHeight - h > 50) {
							h += 50;
						}
					} else {
						h = global.outerHeight / (global.devicePixelRatio || 0);
					}
					targetHeight[isPortrait] = h;
				}

				setStyle(body, 'height', h + 'px');

				if (iphone) {
					global.scrollTo(0, 0);
					finishAddressBar();
				} else {
					timer = setInterval(function() {
						global.scrollTo(0, -1);
						if (global.innerHeight + 1 >= h) {
							clearTimeout(timer);
							finishAddressBar();
						}
					}, 50);
				}
			}
		};
		ready(hideAddressBar);
		on(global, 'orientationchange', hideAddressBar);
		on(global, 'touchstart', hideAddressBar);
	}

	ready(10, function() {
		setTimeout(function() {
			var container = Ti.UI._container = Ti.UI.createView({
					left: 0,
					top: 0
				}),
				node = container.domNode,
				coefficients = container._layoutCoefficients,
				useTouch = has('touch'),
				usePointer = global.navigator.msPointerEnabled,
				touching = 0;

			coefficients.width.x1 = 1;
			coefficients.height.x1 = 1;
			container._measuredTop = 0;
			container._measuredLeft = 0;
			node.id = 'TiUIContainer';
			setStyle(node, 'overflow', 'hidden');
			body.appendChild(node);

			(splashScreen = doc.getElementById('splash')) && container.addEventListener('postlayout', function(){
				setTimeout(function(){
					setStyle(splashScreen,{
						position: 'absolute',
						width: unitize(container._measuredWidth),
						height: unitize(container._measuredHeight),
						left: 0,
						top: 0,
						right: '',
						bottom: ''
					});
				}, 10);
			});
			hideAddressBar();

			function processTouchEvent(eventType, evt) {
				var i = 0, len = recognizers.length,
					j,
					events = [],
					results,
					recognizer,
					elements = evt._elements;

				if (elements && elements.length) {
					// Convert mouse* and pointer* events to touch* events
					useTouch || require.mix(evt, {
						touches: ~['mouseup', 'pointerup', 'MSPointerUp'].indexOf(evt.type) ? [] : [evt],
						targetTouches: [],
						changedTouches: [evt]
					});

					// Calculate the set of gesture events
					for (; i < len; i++) {
						recognizer = recognizers[i]['process' + eventType];
						if (recognizer) {
							results = recognizer(evt, elements);
							for(j in results) {
								events[j] || (events[j] = []);
								events[j] = events[j].concat(results[j]);
							}
						}
					}

					// Fire the events
					Ti.UI._fireGestureEvents(events, elements);
				}
			}

			// NOTE: MSPointer* events should be converted to just pointer* once Windows Phone 8.1 is out
			on(node, usePointer ? 'MSPointerDown' : useTouch ? 'touchstart' : 'mousedown', function(evt){
				var handles = [
					on(global, usePointer ? 'MSPointerMove' : useTouch ? 'touchmove' : 'mousemove', function(evt){
						(useTouch || touching) && processTouchEvent('TouchMoveEvent', evt);
					}),
					on(global, usePointer ? 'MSPointerUp' : useTouch ? 'touchend' : 'mouseup', function(evt){
						touching = 0;
						processTouchEvent('TouchEndEvent', evt);
						event.off(handles);
					}),
					useTouch && on(global, 'touchcancel', function(evt){
						processTouchEvent('TouchCancelEvent', evt);
						event.off(handles);
					})
				];
				touching = 1;
				processTouchEvent('TouchStartEvent', evt);
			});
		}, 1);
	});

	on(global, 'resize', function() {
		Ti.UI._recalculateLayout();
	});

	return lang.setObject('Ti.UI', Evented, creators, {

		_addWindow: function(win, set) {
			this._container.add(win.modal ? win._modalParentContainer : win);
			set && this._setWindow(win);

			// as soon as we add a window or tabgroup, we can destroy the splash screen
			splashScreen && dom.destroy(splashScreen);

			return win;
		},

		_setWindow: function(win) {
			this.__values__.constants.currentWindow = win;
		},

		_removeWindow: function(win) {
			this._container.remove(win.modal ? win._modalParentContainer : win);
			return win;
		},

		_fireGestureEvents: function(events, elements) {
			var i = 0, len = recognizers.length,
				j,
				x, y, pt,
				sourceIndex = 0,
				e;

			// Fire the events
			while(elements[sourceIndex] && !elements[sourceIndex]._isPublished) {
				sourceIndex++;
			}
			elements[sourceIndex] || (sourceIndex = 0);
			for (i in events) {
				for (j = 0, len = events[i].length; j < len; j++) {

					// Create the event object with proper relative locations, etc
					e = events[i][j];
					if (is(e.x, 'Number') && is(e.y, 'Number')) {
						pt = this._container.convertPointToView({
							x: e.x,
							y: e.y
						}, elements[sourceIndex]);
						x = pt ? pt.x : e.x;
						y = pt ? pt.y : e.y;
					} else {
						x = y = void 0;
					}
					e.x = x;
					e.y = y;
					e.bubbles = true;
					e.cancelBubble = false; // We use true and false here instead of 0 and 1 because they are user facing

					// Fire the event
					elements[sourceIndex].fireEvent(i, e);
				}
			}
		},

		_layoutSemaphore: 0,

		_nodesToLayout: [],

		_startLayout: function() {
			this._layoutSemaphore++;
		},

		_finishLayout: function() {
			if (--this._layoutSemaphore === 0) {
				this._triggerLayout(true);
			}
		},

		_elementLayoutCount: 0,

		_triggerLayout: function(node, force) {
			var self = this;

			if (~self._nodesToLayout.indexOf(node)) {
				return;
			}

			self._nodesToLayout.push(node);

			function startLayout() {
				self._elementLayoutCount = 0;
				var nodes = self._nodesToLayout,
					layoutNode,
					node,
					parent,
					previousParent,
					children,
					child,
					recursionStack,
					rootNodesToLayout = [],
					layoutRootNode = false,
					breakAfterChildrenCalculations,
					container = self._container,
					i,
					j,
					len = nodes.length;

				has('ti-instrumentation') && (self._layoutInstrumentationTest = instrumentation.startTest('Layout'));

				// Determine which nodes need to be re-layed out
				for (i = 0; i < len; i++) {
					layoutNode = nodes[i];
					if (layoutNode._isAttachedToActiveWin()) {
						// Mark all of the children for update that need to be updated
						recursionStack = [layoutNode];
						while (recursionStack.length > 0) {
							node = recursionStack.pop();
							node._markedForLayout = true;
							children = node._children;
							for (j in children) {
								child = children[j];
								if (node.layout !== 'composite' || child._needsMeasuring || node._layout._isDependentOnParent(child)) {
									recursionStack.push(child);
								}
							}
						}

						if (layoutNode === container) {
							layoutRootNode = true;
						} else {
							// Go up and mark any other nodes that need to be marked
							parent = layoutNode;
							while(1) {
								parent._markedForLayout = true;
								previousParent = parent;
								parent = parent._parent;

								// Check if this parent is the stopping point
								breakAfterChildrenCalculations = false;
								if (!parent || parent === container) {
									layoutRootNode = true;
									break;
								} else if(!parent._hasSizeDimensions() && !parent._needsMeasuring) {
									!parent._markedForLayout && !~rootNodesToLayout.indexOf(parent) && rootNodesToLayout.push(parent);
									breakAfterChildrenCalculations = true;
								}

								// Recurse through the children of the parent
								recursionStack = [parent];
								while (recursionStack.length > 0) {
									node = recursionStack.pop();
									children = node._children;
									for (j in children) {
										child = children[j];
										if (child !== previousParent && (node.layout !== 'composite' || child._needsMeasuring || node._layout._isDependentOnParent(child))) {
											child._markedForLayout = true;
											recursionStack.push(child);
										}
									}
								}

								if (breakAfterChildrenCalculations) {
									break;
								}
							}
						}
					}
				}

				// Layout all nodes that need it
				if (layoutRootNode) {
					var props = container.__values__.properties,
						width = container._measuredWidth = props.width = global.innerWidth,
						height = container._measuredHeight = props.height = global.innerHeight;
					container._measuredSandboxWidth = width;
					container._measuredSandboxHeight = height;
					container.fireEvent('postlayout');
					setStyle(container.domNode, {
						width: width + 'px',
						height: height + 'px'
					});
					container._layout._doLayout(container, width, height, false, false);
				}
				for (i = 0; i < rootNodesToLayout.length; i++) {
					node = rootNodesToLayout[i];
					node._layout._doLayout(node,
						node._measuredWidth - node._borderLeftWidth - node._borderRightWidth,
						node._measuredHeight - node._borderTopWidth - node._borderBottomWidth,
						node._parent._layout._getWidth(node, node.width) === Ti.UI.SIZE,
						node._parent._layout._getHeight(node, node.height) === Ti.UI.SIZE);
				}

				has('ti-instrumentation') && instrumentation.stopTest(self._layoutInstrumentationTest,
					self._elementLayoutCount + ' out of approximately ' + document.getElementById('TiUIContainer').getElementsByTagName('*').length + ' elements laid out.');

				self._layoutInProgress = false;
				self._layoutTimer = null;
				self._nodesToLayout = [];

				self.fireEvent('postlayout');
			}

			if (force) {
				clearTimeout(self._layoutTimer);
				self._layoutInProgress = true;
				startLayout();
			} else if (self._nodesToLayout.length === 1) {
				self._layoutInProgress = true;
				self._layoutTimer = setTimeout(startLayout, 10);
			}
		},

		_recalculateLayout: function() {
			Gesture || (Gesture = require('Ti/Gesture'));
			Gesture._updateOrientation();
			var container = this._container;
			if (container) {
				container.width = global.innerWidth;
				container.height = global.innerHeight;
			}
		},

		properties: {
			backgroundColor: {
				set: function(value) {
					return this._container.backgroundColor = value;
				}
			},
			backgroundImage: {
				set: function(value) {
					return setStyle(body, 'backgroundImage', value ? style.url(value) : '');
				}
			},
			currentTab: void 0
		},

		convertUnits: function(convertFromValue, convertToUnits) {
			var intermediary = dom.computeSize(convertFromValue, 0, false);
			switch(convertToUnits) {
				case Ti.UI.UNIT_MM:
					intermediary *= 10;
				case Ti.UI.UNIT_CM:
					return intermediary / ( 0.0393700787 * _.dpi * 10);
				case Ti.UI.UNIT_IN:
					return intermediary / _.dpi;
				case Ti.UI.UNIT_DIP:
					return intermediary * 96 / _.dpi;
				case Ti.UI.UNIT_PX:
					return intermediary;
				default: return 0;
			}
		},

		constants: {
			currentWindow: void 0,
			UNKNOWN: 0,
			FACE_DOWN: 1,
			FACE_UP: 2,
			PORTRAIT: 3,
			UPSIDE_PORTRAIT: 4,
			LANDSCAPE_LEFT: 5,
			LANDSCAPE_RIGHT: 6,
			INPUT_BORDERSTYLE_NONE: 0, // DO NOT CHANGE! Values are referenced directly in code
			INPUT_BORDERSTYLE_LINE: 1, // DO NOT CHANGE! Values are referenced directly in code
			INPUT_BORDERSTYLE_BEZEL: 2, // DO NOT CHANGE! Values are referenced directly in code
			INPUT_BORDERSTYLE_ROUNDED: 3, // DO NOT CHANGE! Values are referenced directly in code
			KEYBOARD_DEFAULT: 2,
			KEYBOARD_EMAIL: 3,
			KEYBOARD_NUMBER_PAD: 6,
			KEYBOARD_PHONE_PAD: 7,
			KEYBOARD_URL: 8,
			KEYBOARD_TYPE_DEFAULT: 2,
			KEYBOARD_TYPE_EMAIL: 3,
			KEYBOARD_TYPE_NUMBER_PAD: 6,
			KEYBOARD_TYPE_PHONE_PAD: 7,
			KEYBOARD_TYPE_URL: 8,
			NOTIFICATION_DURATION_LONG: 1,
			NOTIFICATION_DURATION_SHORT: 2,
			PICKER_TYPE_DATE: 2,
			PICKER_TYPE_DATE_AND_TIME: 3,
			PICKER_TYPE_PLAIN: 4,
			PICKER_TYPE_TIME: 5,
			RETURNKEY_DEFAULT: 0, // return
			RETURNKEY_DONE: 1, // Done
			RETURNKEY_EMERGENCY_CALL: 2, // Emergency Call
			RETURNKEY_GO: 3, // Go
			RETURNKEY_GOOGLE: 4, // Search
			RETURNKEY_JOIN: 5, // Join
			RETURNKEY_NEXT: 6, // Next
			RETURNKEY_ROUTE: 7, // Route
			RETURNKEY_SEARCH: 8, // Search
			RETURNKEY_SEND: 9, // Send
			RETURNKEY_YAHOO: 10, // Search
			TABLE_VIEW_SEPARATOR_STYLE_NONE: 0,
			TABLE_VIEW_SEPARATOR_STYLE_SINGLE_LINE: 1,
			TEXT_ALIGNMENT_CENTER: 'center',
			TEXT_ALIGNMENT_RIGHT: 'right',
			TEXT_ALIGNMENT_LEFT: 'left',
			TEXT_AUTOCAPITALIZATION_ALL: 3,
			TEXT_AUTOCAPITALIZATION_NONE: 0,
			TEXT_AUTOCAPITALIZATION_SENTENCES: 2,
			TEXT_AUTOCAPITALIZATION_WORDS: 1,
			TEXT_VERTICAL_ALIGNMENT_BOTTOM: 'bottom',
			TEXT_VERTICAL_ALIGNMENT_CENTER: 'center',
			TEXT_VERTICAL_ALIGNMENT_TOP: 'top',
			ANIMATION_CURVE_EASE_IN: 1,
			ANIMATION_CURVE_EASE_IN_OUT: 0,
			ANIMATION_CURVE_EASE_OUT: 2,
			ANIMATION_CURVE_LINEAR: 3,
			SIZE: 'auto',
			FILL: 'fill',
			INHERIT: 'inherit',
			UNIT_PX: 'px',
			UNIT_MM: 'mm',
			UNIT_CM: 'cm',
			UNIT_IN: 'in',
			UNIT_DIP: 'dp', // We don't have DIPs, so we treat them as pixels,
			
			// Hidden constants
			_LAYOUT_COMPOSITE: 'composite',
			_LAYOUT_VERTICAL: 'vertical',
			_LAYOUT_HORIZONTAL: 'horizontal',
			_LAYOUT_CONSTRAINING_VERTICAL: 'constrainingVertical',
			_LAYOUT_CONSTRAINING_HORIZONTAL: 'constrainingHorizontal'
		}

	});

});
},
"Ti/_/ready":function(){
/* /titanium/Ti/_/ready.js */

/**
 * ready() functionality based on code from Dojo Toolkit.
 *
 * Dojo Toolkit
 * Copyright (c) 2005-2011, The Dojo Foundation
 * New BSD License
 * <http://dojotoolkit.org>
 */

define(function() {
	var doc = document,
		on = require.on,
		readyStates = { "loaded": 1, "complete": 1 },
		isReady = !!readyStates[doc.readyState],
		readyQ = [];

	if (!isReady) {
		function detectReady(evt) {
			if (isReady || (evt && evt.type == "readystatechange" && !readyStates[doc.readyState])) {
				return;
			}
			while (readyQ.length) {
				(readyQ.shift())();
			}
			isReady = 1;
		}

		readyQ.concat([
			on(doc, "DOMContentLoaded", detectReady),
			on(window, "load", detectReady)
		]);

		if ("onreadystatechange" in doc) {
			readyQ.push(require.on(doc, "readystatechange", detectReady));
		} else {
			function poller() {
				readyStates[doc.readyState] ? detectReady() : setTimeout(poller, 30);
			}
			poller();
		}
	}

	function ready(priority, context, callback) {
		var fn, i, l;
		if (!require.is(priority, "Number")) {
			callback = context;
			context = priority;
			priority = 1000;
		}
		fn = callback ? function(){ callback.call(context); } : context;
		if (isReady) {
			fn();
		} else {
			fn.priority = priority;
			for (i = 0, l = readyQ.length; i < l && priority >= readyQ[i].priority; i++) {}
			readyQ.splice(i, 0, fn);
		}
	}

	ready.load = function(name, require, onLoad) {
		ready(onLoad);
	};

	return ready;
});
},
"Ti/_/event":function(){
/* /titanium/Ti/_/event.js */

define({
	stop: function(e) {
		if (e) {
			e.preventDefault && e.preventDefault();
			e.stopPropagation && e.stopPropagation();
		}
	},
	off: function(handles) {
		var handles = require.is(handles, "Array") ? handles : [handles],
			h,
			i = 0,
			l = handles.length;
		while (i < l) {
			(h = handles[i++]) && h();
		}
		handles.splice(0);
	}
});
},
"Ti/_/Gestures/DoubleTap":function(){
/* /titanium/Ti/_/Gestures/DoubleTap.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/lang'], function (declare, lang) {

	var firstTapTime = null,
		firstTapLocation = null,
		
		// This is the amount of time that can elapse before the two taps are considered two separate single taps
		timeThreshold = 250,
		
		// This is the amount of space the finger is allowed drift until the gesture is no longer considered a tap
		driftThreshold = 25;

	function initTracker (x, y) {
		firstTapTime = Date.now();
		firstTapLocation = {
			x: x,
			y: y
		};
	}

	return lang.setObject('Ti._.Gestures.DoubleTap', {

		processTouchEndEvent: function(e){
			if (e.touches.length === 0 && e.changedTouches.length === 1) {
				var x = e.changedTouches[0].clientX,
					y = e.changedTouches[0].clientY,
					events = {
						doubletap: [],
						dblclick: []
					},
					elapsedTime = Date.now() - firstTapTime;

				if (firstTapTime) {
					firstTapTime = null;
					if (elapsedTime < timeThreshold && Math.abs(firstTapLocation.x - x) < driftThreshold &&
						Math.abs(firstTapLocation.y - y) < driftThreshold) {
						// We don't reuse the same results object because the values are modified before the event is fired.
						// If we reused the object, they would be modified twice, which is incorrect.
						events.doubletap.push({
							x: x,
							y: y
						});
						events.dblclick.push({
							x: x,
							y: y
						});
						return events;
					} else {
						initTracker(x,y);
					}
				} else {
					initTracker(x,y);
				}
			}
		},

		processTouchCancelEvent: function(){
			this._firstTapTime = null;
		}

	});

});
},
"Ti/_/Gestures/Dragging":function(){
/* /titanium/Ti/_/Gestures/Dragging.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/lang'], function (declare, lang) {

	// This is the amount of space the finger is allowed drift until the gesture is no longer considered a tap
	var driftThreshold =  25,
		touchStartLocation;

	function cancelDrag(e) {
		var cancelEvent;
		if (touchStartLocation) {
			cancelEvent = createEvent(e);
			touchStartLocation = null;
			return {
				draggingcancel: cancelEvent
			};
		}
	}

	function createEvent (e) {
		var x = e.changedTouches[0].clientX,
			y = e.changedTouches[0].clientY,
			distanceX = x - touchStartLocation.x,
			distanceY = y - touchStartLocation.y;
		return [{
			x: x,
			y: y,
			distanceX: distanceX,
			distanceY: distanceY,
			distance: Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2))
		}];
	}

	return lang.setObject('Ti._.Gestures.Drag', {

		processTouchStartEvent: function(e){
			if (e.touches.length == 1 && e.changedTouches.length == 1) {
				var x,
					y;
				touchStartLocation = {
					x: x = e.changedTouches[0].clientX,
					y: y = e.changedTouches[0].clientY
				};
				return {
					draggingstart: createEvent(e)
				};
			} else if (touchStartLocation) {
				return cancelDrag(e);
			}
		},

		processTouchEndEvent: function(e){
			if (touchStartLocation) {
				var distance = Math.sqrt(Math.pow(e.changedTouches[0].clientX - touchStartLocation.x, 2) +
						Math.pow(e.changedTouches[0].clientY - touchStartLocation.y, 2)),
					endEvent;
				if (e.touches.length === 0 && e.changedTouches.length === 1 && distance > driftThreshold) {
					endEvent = createEvent(e);
					touchStartLocation = null;
					return {
						draggingend: endEvent
					};
				} else {
					return cancelDrag(e);
				}
			}
		},

		processTouchMoveEvent: function(e) {
			if (touchStartLocation) {
				if (e.touches.length == 1 && e.changedTouches.length == 1) {
					return {
						dragging: createEvent(e)
					};
				} else {
					return cancelDrag(e);
				}
			}
		},

		processTouchCancelEvent: function(e){
			return touchStartLocation && cancelDrag(e);
		}

	});

});
},
"Ti/_/Gestures/LongPress":function(){
/* /titanium/Ti/_/Gestures/LongPress.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/lang'], function (declare, lang) {

	var timer = null,
		touchStartLocation = null,
		
		// This is the amount of time that must elapse before the tap is considered a long press
		timeThreshold = 500,
		
		// This is the amount of space the finger is allowed drift until the gesture is no longer considered a tap
		driftThreshold = 25;

	return lang.setObject('Ti._.Gestures.LongPress', {
		
		processTouchStartEvent: function (e, elements) {
			var changed = e.changedTouches,
				x = changed[0].clientX,
				y = changed[0].clientY;
			clearTimeout(timer);
			if (e.touches.length == 1 && e.changedTouches.length == 1) {
				touchStartLocation = {
					x: e.changedTouches[0].clientX,
					y: e.changedTouches[0].clientY
				};
				timer = setTimeout(function () {
					require('Ti/UI')._fireGestureEvents({
						longpress: [{
							x: x,
							y: y
						}]
					}, elements);
				}, timeThreshold);
			}
		},
		
		processTouchEndEvent: function (e) {
			if (e.touches.length === 0 && e.changedTouches.length === 1) {
				clearTimeout(timer);
			}
		},
		
		processTouchMoveEvent: function (e) {
			if (!touchStartLocation || Math.abs(touchStartLocation.x - e.changedTouches[0].clientX) > driftThreshold ||
					Math.abs(touchStartLocation.y - e.changedTouches[0].clientY) > driftThreshold) {
				clearTimeout(timer);
			}
		},
		
		processTouchCancelEvent: function () {
			clearTimeout(timer);
		}
		
	});
	
});
},
"Ti/_/Gestures/Pinch":function(){
/* /titanium/Ti/_/Gestures/Pinch.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/lang'], function (declare, lang) {

	var touchStartLocation = null,
		fingerDifferenceThresholdTimer = null,
		startDistance = null,
		previousDistance = null,
		previousTime = null,

		// There are two possibilities: the user puts down two fingers at exactly the same time,
		// which is almost impossible, or they put one finger down first, followed by the second.
		// For the second case, we need ensure that the two taps were intended to be at the same time.
		// This value defines the maximum time difference before this is considered some other type of gesture.
		fingerDifferenceThreshold = 100;

	function processTouch(e) {
		if (touchStartLocation && touchStartLocation.length == 2 && e.touches.length == 2) {
			var currentDistance = Math.sqrt(Math.pow(e.touches[0].clientX - e.touches[1].clientX,2) +
				Math.pow(e.touches[0].clientY - e.touches[1].clientY,2)),
				velocity = 0,
				currentTime = Date.now();
			if (previousDistance) {
				velocity = Math.abs(previousDistance / startDistance - currentDistance / startDistance) / ((currentTime - previousTime) / 1000);
			}
			previousDistance = currentDistance;
			previousTime = currentTime;
			return {
				pinch: [{
					scale: currentDistance / startDistance,
					velocity: velocity
				}]
			};
		}
	}

	return lang.setObject('Ti._.Gestures.Pinch', {

		processTouchStartEvent: function (e) {
			var x = e.changedTouches[0].clientX,
				y = e.changedTouches[0].clientY,
				touchesLength = e.touches.length,
				changedTouchesLength = e.changedTouches.length;

			// First finger down of the two, given a slight difference in contact time
			if (touchesLength == 1 && changedTouchesLength == 1) {
				touchStartLocation = [{
					x: x,
					y: y
				}];
				fingerDifferenceThresholdTimer = setTimeout(function () {
					touchStartLocation = null;
				}, fingerDifferenceThreshold);

			// Second finger down of the two, given a slight difference in contact time
			} else if (touchesLength == 2 && changedTouchesLength == 1) {
				clearTimeout(fingerDifferenceThresholdTimer);
				if (touchStartLocation) {
					touchStartLocation.push({
						x: x,
						y: y
					});
					startDistance = Math.sqrt(Math.pow(touchStartLocation[0].x - touchStartLocation[1].x,2) +
						Math.pow(touchStartLocation[0].y - touchStartLocation[1].y,2));
				}

			// Two fingers down at the same time
			} else if (touchesLength == 2 && changedTouchesLength == 2) {
				touchStartLocation = [{
					x: x,
					y: y
				},
				{
					x: e.changedTouches[1].clientX,
					y: e.changedTouches[1].clientY
				}];
				startDistance = Math.sqrt(Math.pow(touchStartLocation[0].x - touchStartLocation[1].x,2) +
					Math.pow(touchStartLocation[0].y - touchStartLocation[1].y,2));
				
			// Something else, means it's not a pinch
			} else {
				touchStartLocation = null;
			}
		},

		processTouchEndEvent: function(e){
			var result = processTouch(e);
			touchStartLocation = null;
			return result;
		},

		processTouchMoveEvent: function(e){
			return processTouch(e);
		},

		processTouchCancelEvent: function () {
			touchStartLocation = null;
		}

	});
	
});
},
"Ti/_/Gestures/SingleTap":function(){
/* /titanium/Ti/_/Gestures/SingleTap.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/lang'], function (declare, lang) {

	// This is the amount of space the finger is allowed drift until the gesture is no longer considered a tap
	var driftThreshold = 25,
		touchStartLocation,
		driftedOutsideThreshold;

	function withinThreshold(x, y) {
		return touchStartLocation && Math.abs(touchStartLocation.x - x) < driftThreshold &&
			Math.abs(touchStartLocation.y - y) < driftThreshold;
	}

	return lang.setObject('Ti._.Gestures.SingleTap', {

		processTouchStartEvent: function (e) {
			var changed = e.changedTouches;
			if (e.touches.length == 1 && changed.length == 1) {
				touchStartLocation = {
					x: changed[0].clientX,
					y: changed[0].clientY
				};
				driftedOutsideThreshold = false;
			}
		},

		processTouchEndEvent: function (e) {
			var changed = e.changedTouches,
				x = changed[0].clientX,
				y = changed[0].clientY,
				events = {
					singletap: [],
					click: []
				};

			if (e.touches.length === 0 && changed.length === 1 && withinThreshold(x, y) && !driftedOutsideThreshold) {
				// We don't reuse the same results object because the values are modified before the event is fired.
				// If we reused the object, they would be modified twice, which is incorrect.
				events.singletap.push({
					x: x,
					y: y
				});
				events.click.push({
					x: x,
					y: y
				});
				touchStartLocation = null;
			}
			return events;
		},

		processTouchMoveEvent: function (e) {
			var changed = e.changedTouches;
			driftedOutsideThreshold = changed.length == 1 && !withinThreshold(changed[0].clientX, changed[0].clientY);
		},

		processTouchCancelEvent: function () {
			touchStartLocation = null;
		}

	});

});
},
"Ti/_/Gestures/Swipe":function(){
/* /titanium/Ti/_/Gestures/Swipe.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/lang'], function (declare, lang) {

		// This specifies the minimum distance that a finger must travel before it is considered a swipe
	var distanceThreshold = 50,

		// The maximum angle, in radians, from the axis a swipe is allowed to travel before it is no longer considered a swipe
		angleThreshold = Math.PI/6, // 30 degrees

		// This sets the minimum velocity that determines this is a swipe, or just a drag
		velocityThreshold = 0.5,

		distanceThresholdPassed = false,
		touchStartLocation,
		startTime;

	return lang.setObject('Ti._.Gestures.Swipe', {

		processTouchStartEvent: function(e){
			if (e.touches.length == 1 && e.changedTouches.length == 1) {
				distanceThresholdPassed = false;
				touchStartLocation = {
					x: e.changedTouches[0].clientX,
					y: e.changedTouches[0].clientY
				};
				startTime = Date.now();
			} else {
				touchStartLocation = null;
			}
		},

		processTouchEndEvent: function(e){
			if (e.touches.length === 0 && e.changedTouches.length === 1 && touchStartLocation) {
				var x = e.changedTouches[0].clientX,
						y = e.changedTouches[0].clientY,
						xDiff = Math.abs(touchStartLocation.x - x),
						yDiff = Math.abs(touchStartLocation.y - y),
						distance = Math.sqrt(Math.pow(touchStartLocation.x - x, 2) + Math.pow(touchStartLocation.y - y, 2)),
						angleOK,
						direction,
						velocity;
					!distanceThresholdPassed && (distanceThresholdPassed = distance > distanceThreshold);

					if (distanceThresholdPassed) {
						// If the distance is small, then the angle is way restrictive, so we ignore it
						if (distance <= distanceThreshold || xDiff === 0 || yDiff === 0) {
							angleOK = true;
						} else if (xDiff > yDiff) {
							angleOK = Math.atan(yDiff/xDiff) < angleThreshold;
						} else {
							angleOK = Math.atan(xDiff/yDiff) < angleThreshold;
						}
						if (angleOK) {

							// Calculate the direction
							direction = xDiff > yDiff ?
								touchStartLocation.x - x > 0 ? 'left' : 'right' :
								touchStartLocation.y - y < 0 ? 'down' : 'up';
							velocity = Math.abs(distance / (Date.now() - startTime));
							if (velocity > velocityThreshold) {
								return {
									swipe: [{
										x: x,
										y: y,
										direction: direction
									}]
								};
							}
						}
					}
			}
			touchStartLocation = null;
		},

		processTouchCancelEvent: function(){
			touchStartLocation = null;
		}
	});
	
});
},
"Ti/_/Gestures/TouchCancel":function(){
/* /titanium/Ti/_/Gestures/TouchCancel.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/lang'], function (declare, lang) {

	return lang.setObject('Ti._.Gestures.TouchCancel', {
		
		processTouchCancelEvent: function (e) {
			var changed = e.changedTouches,
				i = 0,
				l = changed.length,
				events = {
					'touchcancel': []
				};
			for (; i < l; i++) {
				events.touchcancel.push({
					x: changed[i].clientX,
					y: changed[i].clientY
				});
			}
			return events;
		}

	});

});
},
"Ti/_/Gestures/TouchEnd":function(){
/* /titanium/Ti/_/Gestures/TouchEnd.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/lang'], function (declare, lang) {

	return lang.setObject('Ti._.Gestures.TouchEnd', {

		processTouchEndEvent: function (e) {
			var changed = e.changedTouches,
				i = 0,
				l = changed.length,
				events = {
					'touchend': []
				};
			for (; i < l; i++) {
				events.touchend.push({
					x: changed[i].clientX,
					y: changed[i].clientY
				});
			}
			return events;
		}

	});

});
},
"Ti/_/Gestures/TouchMove":function(){
/* /titanium/Ti/_/Gestures/TouchMove.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/lang'], function (declare, lang) {

	return lang.setObject('Ti._.Gestures.TouchMove', {
		
		processTouchMoveEvent: function (e) {
			var changed = e.changedTouches,
				i = 0,
				l = changed.length,
				events = {
					'touchmove': []
				};
			for (; i < l; i++) {
				events.touchmove.push({
					x: changed[i].clientX,
					y: changed[i].clientY
				});
			}
			return events;
		}

	});

});
},
"Ti/_/Gestures/TouchStart":function(){
/* /titanium/Ti/_/Gestures/TouchStart.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/lang'], function (declare, lang) {

	return lang.setObject('Ti._.Gestures.TouchStart', {

		processTouchStartEvent: function (e) {
			var changed = e.changedTouches,
				i = 0,
				l = changed.length,
				events = {
					'touchstart': []
				};
			for (; i < l; i++) {
				events.touchstart.push({
					x: changed[i].clientX,
					y: changed[i].clientY
				});
			}
			return events;
		}

	});

});
},
"Ti/_/Gestures/TwoFingerTap":function(){
/* /titanium/Ti/_/Gestures/TwoFingerTap.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/lang'], function (declare, lang) {

	var touchStartLocation = null,
		touchEndLocation = null,
		fingerDifferenceThresholdTimer = null,

		// There are two possibilities: the user puts down two fingers at exactly the same time,
		// which is almost impossible, or they put one finger down first, followed by the second.
		// For the second case, we need ensure that the two taps were intended to be at the same time.
		// This value defines the maximum time difference before this is considered some other type of gesture.
		fingerDifferenceThreshold = 100,

		// This is the amount of space the fingers are allowed drift until the gesture is no longer considered a two finger tap
		driftThreshold = 25;

	return lang.setObject('Ti._.Gestures.TwoFingerTap', {

		processTouchStartEvent: function(e){

			var x = e.changedTouches[0].clientX,
				y = e.changedTouches[0].clientY,
				touchesLength = e.touches.length,
				changedTouchesLength = e.changedTouches.length;

			// First finger down of the two, given a slight difference in contact time
			if (touchesLength == 1 && changedTouchesLength == 1) {
				touchStartLocation = [{
					x: x,
					y: y
				}];
				fingerDifferenceThresholdTimer = setTimeout(function () {
					touchStartLocation = null;
					touchEndLocation = null;
				},fingerDifferenceThreshold);

			// Second finger down of the two, given a slight difference in contact time
			} else if (touchesLength == 2 && changedTouchesLength == 1) {
				clearTimeout(fingerDifferenceThresholdTimer);
				touchStartLocation && touchStartLocation.push({
					x: x,
					y: y
				});

			// Two fingers down at the same time
			} else if (touchesLength == 2 && changedTouchesLength == 2) {
				touchStartLocation = [{
						x: x,
						y: y
					},
					{
						x: e.changedTouches[1].clientX,
						y: e.changedTouches[1].clientY
					}];
			// Something else, means it's not a two finger tap
			} else {
				touchStartLocation = null;
				touchEndLocation = null;
			}
		},

		processTouchEndEvent: function(e){

			var changedTouches = e.changedTouches,
				x = changedTouches[0].clientX,
				y = changedTouches[0].clientY,
				touchesLength = e.touches.length,
				changedTouchesLength = changedTouches.length,
				events = {},
				i,
				distance1OK,
				distance2OK;

			// One finger was lifted off, one remains
			if (touchesLength == 1 && changedTouchesLength == 1) {
				touchEndLocation = [{
					x: x,
					y: y
				}];
				fingerDifferenceThresholdTimer = setTimeout(function () {
					touchStartLocation = null;
					touchEndLocation = null;
				}, fingerDifferenceThreshold);

			// Second or both fingers lifted off
			} else if (touchesLength === 0 && (changedTouchesLength === 1 || changedTouchesLength === 2)) {
				if (touchStartLocation && touchStartLocation.length === 2) {
					touchEndLocation || (touchEndLocation = []);
					for(i = 0; i < changedTouchesLength; i++) {
						touchEndLocation.push({
							x: changedTouches[i].clientX,
							y: changedTouches[i].clientY
						});
					}
					if (touchEndLocation.length === 2) {
						distance1OK = Math.abs(touchStartLocation[0].x - touchEndLocation[0].x) < driftThreshold &&
							Math.abs(touchStartLocation[0].y - touchEndLocation[0].y) < driftThreshold;
						distance2OK = Math.abs(touchStartLocation[1].x - touchEndLocation[1].x) < driftThreshold &&
							Math.abs(touchStartLocation[1].y - touchEndLocation[1].y) < driftThreshold;
						// Check if the end points are swapped from the start points
						if (!distance1OK || !distance2OK) {
							distance1OK = Math.abs(touchStartLocation[0].x - touchEndLocation[1].x) < driftThreshold &&
								Math.abs(touchStartLocation[0].y - touchEndLocation[1].y) < driftThreshold;
							distance2OK = Math.abs(touchStartLocation[1].x - touchEndLocation[0].x) < driftThreshold &&
								Math.abs(touchStartLocation[1].y - touchEndLocation[0].y) < driftThreshold;
						}
						if (distance1OK && distance2OK) {
							events.twofingertap = [{
								x: (touchStartLocation[0].x + touchStartLocation[1].x) / 2,
								y: (touchStartLocation[0].y + touchStartLocation[1].y) / 2
							}];
						}
					}
					touchStartLocation = null;
					touchEndLocation = null;
					return events;
				}

			// Something else, means it's not a two finger tap
			} else {
				touchStartLocation = null;
				touchEndLocation = null;
			}
		},

		processTouchCancelEvent: function(){
			touchStartLocation = null;
			touchEndLocation = null;
		}

	});

});
},
"Ti/Buffer":function(){
/* /titanium/Ti/Buffer.js */

define(["Ti/_/declare", "Ti/_/Evented", "Ti/Blob", "Ti/Codec"], function(declare, Evented, Blob, Codec) {

	var Buffer;

	return Buffer = declare("Ti.Buffer", Evented, {

		constructor: function(args) {
			args && args.value && this._set(args.value);
		},

		append: function(buffer, offset, len) {
			var v = buffer.value;
			offset = offset | 0,
			length = length || v.length;
			this._set(this.value + v.substring(offset, offset + length));
			return length - offset;
		},

		clear: function() {
			this._set("");
		},

		clone: function(offset, length) {
			return new Buffer({ value: offset ? this.value.substring(offset, length && offset + length) : this.value });
		},

		copy: function(srcBuffer, offset, srcOffset, srcLength) {
			var v = srcBuffer.value,
				offset = offset | 0,
				srcOffset = srcOffset | 0,
				len = Math.max(this.length, srcLength && srcOffset + srcLength) - offset,
				srcBuffer = v.substring(srcOffset, len);
			this._set(this.value.substring(0, offset) + srcBuffer + this.value.substring(offset, srcBuffer.length - offset));
		},

		fill: function(fillByte, offset, length) {
			if (!fillByte) {
				throw new Error("Missing fillByte argument");
			}
			offset = offset | 0;
			length = this.length - offset - length | 0;
			this._set(this.value.substring(0, offset | 0) + (new Array(length)).join((fillByte + ' ').charAt(0)) + this.value.substring(length));
		},

		insert: function(buffer, offset, srcOffset, srcLength) {
			var b = buffer.value;
			srcOffset = srcOffset | 0;
			offset = offset | 0;
			this._set(this.value.substring(0, offset) + v.substring(srcOffset, srcLength && srcOffset + srcLength) + this.value.substring(offset));
			return srcLength || v.length;
		},

		release: function() {
			this.length = 0;
		},

		toBlob: function() {
			return new Blob({ data: this.value });
		},

		toString: function() {
			return ""+this.value;
		},

		_set: function(value) {
			this.__values__.constants.value = ""+value;
		},

		_resize: function(offset, length) {
			offset = offset | 0;
			this._set(this.value.substring(offset, length && (offset + length | 0)));
		},

		constants: {
			byteOrder: Codec.LITTLE_ENDIAN,
			type: Codec.CHARSET_UTF8,
			value: ""
		},

		properties: {
			length: {
				get: function() {
					return this.value.length;
				},
				set: function(newValue, oldValue) {
					if (newValue < oldValue) {
						this._resize(0, newValue);
					} else {
						this.__values__.constants.value += (new Array(newValue - oldValue)).join(' ');
					}
					return newValue;
				}
			}
		}

	});

});
},
"Ti/Codec":function(){
/* /titanium/Ti/Codec.js */

define(["Ti/_/declare", "Ti/_/lang", "Ti/_/Evented"], function(declare, lang, Evented) {

	var Codec;

	function paramError(msg) {
		throw new Error("Missing " + msg + " argument");
	}

	function parse(type, value) {
		return type === Codec.TYPE_DOUBLE || type === Codec.TYPE_FLOAT ? parseFloat(value) : parseInt(value);
	}

	return Codec = lang.setObject("Ti.Codec", Evented, {

		decodeNumber: function(args) {
			(!args || !args.source) && paramError("source");
			args.type || paramError("type");
			return parse(args.type, args.source.buffer);
		},

		decodeString: function(args) {
			(!args || !args.source) && paramError("source");
			var b = args.source.buffer || "",
				p = args.position | 0,
				l = args.length;
			return b.substring(p, l && p + l);
		},

		encodeNumber: function(args) {
			(!args || !args.source) && paramError("source");
			args.dest || paramError("dest");
			args.type || paramError("type");
			return dest.append(new (require("Ti/Buffer"))({ buffer: ""+parse(args.type, args.source.buffer) }));
		},

		encodeString: function(args) {
			(!args || !args.source) && paramError("source");
			args.dest || paramError("dest");
			var b = args.source.buffer || "",
				p = args.destPosition | 0;
			b = new (require("Ti/Buffer"))({ buffer: b.substring(args.sourcePosition | 0, args.sourceLength || b.length) });
			return p ? dest.insert(b, p) : dest.append(b);
		},

		getNativeByteOrder: function() {
			return this.LITTLE_ENDIAN;
		},

		constants: {
			BIG_ENDIAN: 2,
			CHARSET_ASCII: "ascii",
			CHARSET_ISO_LATIN_1: "ios-latin-1",
			CHARSET_UTF16: "utf16",
			CHARSET_UTF16BE: "utf16be",
			CHARSET_UTF16LE: "utf16le",
			CHARSET_UTF8: "utf8",
			LITTLE_ENDIAN: 1,
			TYPE_BYTE: "byte",
			TYPE_DOUBLE: "double",
			TYPE_FLOAT: "float",
			TYPE_INT: "int",
			TYPE_LONG: "long",
			TYPE_SHORT: "short"
		}

	});

});
},
"Ti/_/include":function(){
/* /titanium/Ti/_/include.js */

define(function() {
	var cache = {},
 		stack = [];

 	return {
 		dynamic: true, // prevent the loader from caching the result

 		normalize: function(name, normalize) {
 			var parts = name.split("!"),
 				url = parts[0];
 			parts.shift();
 			return (/^\./.test(url) ? normalize(url) : url) + (parts.length ? "!" + parts.join("!") : "");
 		},

 		load: function(name, require, onLoad, config) {
 			var c,
 				x,
 				parts = name.split("!"),
 				len = parts.length,
 				url,
 				sandbox;

 			if (sandbox = len > 1 && parts[0] === "sandbox") {
 				parts.shift();
 				name = parts.join("!");
 			}

 			url = require.toUrl(/^\//.test(name) ? name : "./" + name, stack.length ? { name: stack[stack.length-1] } : null);
 			c = cache[url] || require.cache(url);

 			if (!c) {
 				x = new XMLHttpRequest;
 				x.open("GET", url, false);
 				x.send(null);
 				if (x.status === 200) {
 					c = x.responseText;
 				} else {
 					throw new Error("Failed to load include \"" + url + "\": " + x.status);
 				}
 			}

 			stack.push(url);
 			try {
 				require.evaluate(cache[url] = c, 0, !sandbox);
 			} catch (e) {
 				throw e;
 			} finally {
 				stack.pop();
 			}

 			onLoad(c);
 		}
 	};
});

},
"Ti/Accelerometer":function(){
/* /titanium/Ti/Accelerometer.js */

define(["Ti/_/Evented", "Ti/_/lang"], function(Evented, lang) {
	
	var lastShake = Date.now(),
		lastAccel = {},
		threshold = 0.2,
		api = lang.setObject("Ti.Accelerometer", Evented);
	
	require.on(window, "devicemotion", function(evt) {
		var e = evt.acceleration || evt.accelerationIncludingGravity,
			currentTime,
			accel = e && {
				x: e.x,
				y: e.y,
				z: e.z,
				source: evt.source
			};
		if (accel) {
			if (lastAccel.x !== void 0 && (
				Math.abs(lastAccel.x - accel.x) > threshold || 
				Math.abs(lastAccel.y - accel.y) > threshold ||
				Math.abs(lastAccel.z - accel.z) > threshold
			)) {
				currentTime = Date.now();
				accel.timestamp = currentTime - lastShake;
				lastShake = currentTime;
				api.fireEvent("update", accel);
			}
			lastAccel = accel;
		}
	});
	
	return api;
	
});
},
"Ti/Analytics":function(){
/* /titanium/Ti/Analytics.js */

define(["Ti/_/analytics", "Ti/_/Evented", "Ti/_/lang"], function(analytics, Evented, lang) {

	return lang.setObject("Ti.Analytics", Evented, {

		addEvent: function(type, name, data) {
			analytics.add(type, name, data);
		},

		featureEvent: function(name, data) {
			analytics.add("app.feature", name, data);
		},

		navEvent: function(from, to, name, data) {
			analytics.add("app.nav", name, data);
		},

		settingsEvent: function(name, data) {
			analytics.add("app.settings", name, data);
		},

		timedEvent: function(name, start, stop, duration, data) {
			analytics.add("app.timed", name, require.mix({}, data, {
				start: start,
				stop: stop,
				duration: duration
			}));
		},

		userEvent: function(name, data) {
			analytics.add("app.user", name, data);
		}

	});

});
},
"Ti/BlobStream":function(){
/* /titanium/Ti/BlobStream.js */

define(["Ti/_/declare", "Ti/IOStream"], function(declare, IOStream) {

	return declare("Ti.BlobStream", IOStream);

});
},
"Ti/IOStream":function(){
/* /titanium/Ti/IOStream.js */

define(["Ti/_/declare", "Ti/_/Evented", "Ti/Buffer", "Ti/Filesystem"], function(declare, Evented, Buffer, Filesystem) {

	return declare("Ti.IOStream", Evented, {

		constructor: function(args) {
			args = args || {};
			this._data = args.data || "";
			this._mode = args.mode || Filesystem.MODE_APPEND;
		},

		close: function() {
			this._closed = true;
		},

		isReadable: function() {
			return !this._closed;
		},

		isWriteable: function() {
			return !this._closed && (this._mode === Filesystem.MODE_WRITE || this._mode === Filesystem.MODE_APPEND);
		},

		read: function(buffer, offset, length) {
			if (this.isReadable()) {
				var d = this._data,
					len = length || d.length,
					bytesRead = buffer.append(new Buffer({ value: d.substring(offset || 0, len) }));
				this._data = d.substring(len);
				return bytesRead;
			}
			return 0;
		},

		write: function(buffer, offset, length) {
			if (this.isWriteable()) {
				var b = buffer.value;
				offset = offset | 0;
				length = length || b.length;
				this._data += b.substring(offset, length);
				return length - offset;
			}
			return 0;
		}

	});

});
},
"Ti/BufferStream":function(){
/* /titanium/Ti/BufferStream.js */

define(["Ti/_/declare", "Ti/IOStream"], function(declare, IOStream) {

	return declare("Ti.BufferStream", IOStream);

});
},
"Ti/Facebook":function(){
/* /titanium/Ti/Facebook.js */

define(["Ti/_/Evented", "Ti/_/lang"], function(Evented, lang) {

	var facebookInitialized = false,
		loginAfterInitialization = false,
		appid = null,
		notLoggedInMessage = "not logged in",
		facebookDiv = document.createElement("div"),
		facebookScriptTagID = "facebook-jssdk",
		facebookLoaded = false,
		api;
		
	function initFacebook() {
		FB.init({
			appId: appid, // App ID
			status: false, // do NOT check login status because we're gonna do it after init() anyways
			cookie: true, // enable cookies to allow the server to access the session
			oauth: true, // enable OAuth 2.0
			xfbml: true  // parse XFBML
		});
		FB.getLoginStatus(function(response){
			facebookInitialized = true;
			(response.status == "connected" && initSession(response)) || loginAfterInitialization && loginInternal();
		}, true);
	}

	function initSession(response) {
		var authResponse = response.authResponse;
		if (authResponse) {
			// Set the various status members
			api.loggedIn = true;
			api.uid = authResponse.userID;
			api.expirationDate = new Date(Date.now() + authResponse.expiresIn * 1000);
			api.accessToken = authResponse.accessToken;

			// Set a timeout to match when the token expires
			authResponse.expiresIn && setTimeout(function(){ 
				api.logout();
			}, authResponse.expiresIn * 1000);

			// Fire the login event
			api.fireEvent("login", {
				cancelled: false,
				data: response,
				success: true,
				uid: api.uid
			});

			return true;
		}
	}

	function processResponse(response, requestParamName, requestParamValue, callback) {
		result = {source:api,success:false};
		result[requestParamName] = requestParamValue;
		if (!response || response.error) {
			response && (result["error"] = response.error);
		} else {
			result["success"] = true;
			result["result"] = JSON.stringify(response);
		}
		callback(result);
	}
		
	function loginInternal() {
		FB.login(function(response) {
			initSession(response) || api.fireEvent("login", {
				cancelled	: true,
				data		: response,
				error		: "user cancelled or an internal error occured.",
				success		: false,
				uid			: response.id
			});
		}, {"scope":api.permissions.join()});
	}

	api = lang.setObject("Ti.Facebook", Evented, {
		
		authorize: function() {
			// Sanity check
			if (!appid) {
				throw new Error("App ID not set. Facebook authorization cancelled.");
			}
	
			// Check if facebook is still initializing, and if so queue the auth request
			if (facebookInitialized) {
				// Authorize
				loginInternal();
			} else {
				loginAfterInitialization = true;
			}
		},
		
		createLoginButton: function(parameters) {
			return new (require("Ti/Facebook/LoginButton"))(parameters);
		},
		
		dialog: function(action, params, callback) {
			if (api.loggedIn) {
				params.method = action;
				FB.ui(params,function(response){
					processResponse(response,"action",action,callback);
				});
			} else {
				callback({
					success	: false,
					error	: notLoggedInMessage,
					action	: action,
					source	: api
				});
			}
		},
		
		logout: function() {
			api.loggedIn && FB.logout(function(response) {
				api.loggedIn = false;
				api.fireEvent("logout", {
					success	: true
				});
			});
		},
		
		request: function(method, params, callback) {
			if (api.loggedIn) {
				params.method = method;
				params.urls = "facebook.com,developers.facebook.com";
				FB.api(params,function(response){
					processResponse(response,"method",method,callback);
				});
			} else {
				callback({
					success	: false,
					error	: notLoggedInMessage,
					method	: method,
					source	: api
				});
			}
		},
		
		requestWithGraphPath: function(path, params, httpMethod, callback) {
			if (api.loggedIn) {
				FB.api(path,httpMethod,params,function(response){
					processResponse(response,"path",path,callback);
				});
			} else {
				callback({
					success	: false,
					error	: notLoggedInMessage,
					path	: path,
					source	: api
				});
			}
		},
		
		constants: {
			
			
			BUTTON_STYLE_NORMAL: 1,
			
			BUTTON_STYLE_WIDE: 2
		},
		
		properties: {
			
			accessToken: void 0,
			
			appid: {
				set: function(value){
					appid = value;
					facebookLoaded && initFacebook();
					return value;
				}
			},
			
			expirationDate: void 0,
			
			forceDialogAuth: true,
			
			loggedIn: false,
			
			permissions: void 0,
			
			uid: void 0
		}
		
	});
	
	// Create the div required by Facebook
	facebookDiv.id = "fb-root";
	document.body.appendChild(facebookDiv);

	// Load the Facebook SDK Asynchronously.
	if (!document.getElementById(facebookScriptTagID)) {
		var facebookScriptTag = document.createElement("script"),
			head = document.getElementsByTagName("head")[0];
		facebookScriptTag.id = facebookScriptTagID; 
		facebookScriptTag.async = true;
		facebookScriptTag.src = "//connect.facebook.net/en_US/all.js";
		head.insertBefore(facebookScriptTag, head.firstChild);
	}

	window.fbAsyncInit = function() {
		facebookLoaded = true;
		appid && initFacebook();
	};
	
	return api;

});
},
"Ti/Geolocation":function(){
/* /titanium/Ti/Geolocation.js */

/*global
define,
window,
navigator,
escape
*/
define(['Ti/_/Evented', 'Ti/_/lang', 'Ti/Network'], function(Evented, lang, Network) {

	var api,
		on = require.on,
		compassSupport = false,
		currentHeading,
		removeHeadingEventListener,
		locationWatchId,
		currentLocation,
		numHeadingEventListeners = 0,
		numLocationEventListeners = 0,
		isDef = lang.isDef;

	function singleShotHeading(callback) {
		var removeOrientation = on(window,'deviceorientation',function(e) {
			removeOrientation();
			callback(e);
		});
	}
	singleShotHeading(function(e) {
		isDef(e.webkitCompassHeading) && (compassSupport = true);
	});
	function createHeadingCallback(callback) {
		return function(e) {
			currentHeading = {
				heading: {
					accuracy: e.webkitCompassAccuracy,
					magneticHeading: e.webkitCompassHeading
				},
				success: true,
				timestamp: Date.now()

			};
			api.fireEvent('heading', currentHeading);
			callback && callback(currentHeading);
		};
	}

	function createLocationCallback(callback) {
		return function(e) {
			var success = 'coords' in e;
			currentLocation = {
				success: success
			};
			success ? (currentLocation.coords = e.coords) : (currentLocation.code = e.code);
			api.fireEvent('location', currentLocation);
			callback && callback(currentLocation);
		};
	}
	function createLocationArguments() {
		return {
			enableHighAccuracy: api.accuracy === api.ACCURACY_HIGH,
			timeout: api.MobileWeb.locationTimeout,
			maximumAge: api.MobileWeb.maximumLocationAge
		};
	}

	api = lang.setObject('Ti.Geolocation', Evented, {

		getCurrentPosition: function(callback) {
			if (api.locationServicesEnabled) {
				navigator.geolocation.getCurrentPosition(
					createLocationCallback(callback),
					createLocationCallback(callback),
					createLocationArguments()
				);
			}
		},

		getCurrentHeading: function(callback) {
			if (compassSupport) {
				if (currentHeading && Date.now() - currentHeading.timestamp < api.maximumHeadingAge) {
					callback(currentHeading);
				} else {
					singleShotHeading(createHeadingCallback(callback));
				}
			}
		},

		forwardGeocoder: function(address, callback) {
			if (!require.is(address,'String')) {
				return;
			}
			var client = Network.createHTTPClient({
				onload : function() {
					var responseParts = this.responseText.split(',');
					callback({
						success: true,
						code: 0,
						latitude: parseFloat(responseParts[2]),
						longitude: parseFloat(responseParts[3])
					});
				},
				onerror : function(e) {
					callback({
						success: false,
						code: -1,
						error: e + ''
					});
				},
				timeout : api.MobileWeb.forwardGeocoderTimeout
			});
			client.open('GET', 'http://api.appcelerator.com/p/v1/geo?d=f&' +
				// TODO 'c=' + Locale.getCurrentCountry() +
				'q=' + escape(address));
			client.send();
		},

		reverseGeocoder: function(latitude, longitude, callback) {
			if (!isDef(latitude) || !isDef(longitude)) {
				return;
			}
			var client = Network.createHTTPClient({
				onload : function() {
					callback(JSON.parse(this.responseText));
				},
				onerror : function() {
					callback({
						success: false
					});
				},
				timeout : api.MobileWeb.forwardGeocoderTimeout
			});
			client.open('GET', 'http://api.appcelerator.com/p/v1/geo?d=r&' +
				// TODO 'c=' + Locale.getCurrentCountry() +
				'q=' + latitude + ',' + longitude);
			client.send();
		},

		// Hook in to add/remove event listener so that we can disable the geo and compass intervals
		addEventListener: function(name, handler) {
			switch(name) {
				case 'heading':
					if (compassSupport) {
						numHeadingEventListeners++;
						if (numHeadingEventListeners === 1) {
							removeHeadingEventListener = on(window,'deviceorientation',createHeadingCallback());
						}
					}
					break;
				case 'location': {
					if (api.locationServicesEnabled) {
						numLocationEventListeners++;
						if (numLocationEventListeners === 1) {
							locationWatchId = navigator.geolocation.watchPosition(
								createLocationCallback(),
								createLocationCallback(),
								createLocationArguments()
							);
						}
					}
					break;
				}
			}
			Evented.addEventListener.call(this,name,handler);
		},

		removeEventListener: function(name, handler) {
			switch(name) {
				case 'heading':
					if (compassSupport) {
						numHeadingEventListeners--;
						if (numHeadingEventListeners === 0) {
							removeHeadingEventListener();
						}
					}
					break;
				case 'location': {
					if (api.locationServicesEnabled) {
						numLocationEventListeners--;
						if (numHeadingEventListeners < 1) {
							navigator.geolocation.clearWatch(locationWatchId);
						}
					}
					break;
				}
			}
			Evented.removeEventListener.call(this,name,handler);
		},

		constants: {

			ACCURACY_HIGH: 1,

			ACCURACY_LOW: 2,

			ERROR_DENIED: 1,

			ERROR_LOCATION_UNKNOWN: 2,

			ERROR_TIMEOUT: 3,

			locationServicesEnabled: {
				get: function() {
					return !!navigator.geolocation;
				}
			},

			MobileWeb: {
				locationTimeout: Infinity,
				maximumLocationAge: 0,
				maximumHeadingAge: 1000,
				forwardGeocoderTimeout: void 0,
				reverseGeocoderTimeout: void 0
			},

			hasCompass: function() {
				return compassSupport;
			}

		},

		properties: {
			accuracy: 2
		}

	});
	return api;

});
},
"Ti/Network":function(){
/* /titanium/Ti/Network.js */

define(["Ti/_/Evented", "Ti/_/lang"], function(Evented, lang) {

	var conn = navigator.connection,
		online = navigator.onLine,
		Network = lang.setObject("Ti.Network", Evented, {

			constants: {
				NETWORK_LAN: 1,
				NETWORK_MOBILE: 3,
				NETWORK_NONE: 0,
				NETWORK_UNKNOWN: -1,
				NETWORK_WIFI: 2,
				networkType: function() {
					if (!online) {
						return Network.NETWORK_NONE;
					}		
					if (conn && conn.type == conn.WIFI) {
						return Network.NETWORK_WIFI;
					}
					if (conn && conn.type == conn.ETHERNET) {
						return Network.NETWORK_LAN;
					}
					if (conn && (conn.type == conn.CELL_2G || conn.type == conn.CELL_3G)) {
						return Network.NETWORK_MOBILE;
					}
					return Network.NETWORK_UNKNOWN;
				},
				networkTypeName: function() {
					if (!online) {
						return "NONE";
					}		
					if (conn && conn.type == conn.WIFI) {
						return "WIFI";
					}
					if (conn && conn.type == conn.ETHERNET) {
						return "LAN";
					}
					if (conn && (conn.type == conn.CELL_2G || conn.type == conn.CELL_3G)) {
						return "MOBILE";
					}
					return "UNKNOWN";
				},
				online: function() {
					return online;
				}
			},

			properties: {
				httpURLFormatter: null
			},

			createHTTPClient: function(args) {
				return new (require("Ti/Network/HTTPClient"))(args);
			},

			decodeURIComponent: function(value) {
				return decodeURIComponent(value);
			},

			encodeURIComponent: function(value) {
				return encodeURIComponent(value);
			}

		});

	function onlineChange(evt) {
		evt.type === "online" && !online && (online = 1);
		evt.type === "offline" && online && (online = 0);

		Network.fireEvent("change", {
			networkType		: Network.networkType,
			networkTypeName	: Network.networkTypeName,
			online			: online
		});
	}

	require.on(window, "online", onlineChange);
	require.on(window, "offline", onlineChange);

	return Network;

});
},
"Ti/Gesture":function(){
/* /titanium/Ti/Gesture.js */

define(["Ti/_/Evented", "Ti/_/lang", "Ti/UI", "Ti/_/ready", "Ti/_/event"], function(Evented, lang, UI, ready, event) {

	var win = window,
		on = require.on,
		lastOrient = null,
		lastShake = Date.now(),
		lastAccel = {},
		orientationListeners = 0,
		orientationEvents = [],
		api = lang.setObject("Ti.Gesture", Evented, {
			_updateOrientation: function() {
				getWindowOrientation();
				lastOrient !== api.orientation && api.fireEvent('orientationchange', {
					orientation: lastOrient = api.orientation
				});
			},

			addEventListener: function (name) {
				name == 'orientationchange' && orientationListeners++;
				orientationListeners == 1 && (orientationEvents = [
					on(win, "MozOrientation", deviceOrientation),
					on(win, "deviceorientation", deviceOrientation)
				]);
				Evented.addEventListener.apply(this, arguments);
			},

			removeEventListener: function (name) {
				name == 'orientationchange' && (orientationListeners = Math.max(orientationListeners - 1, 0));
				orientationListeners == 0 && event.off(orientationEvents);
				Evented.removeEventListener.apply(this, arguments);
			},

			isLandscape: function() {
				return api.landscape;
			},

			isPortrait: function() {
				return api.portrait;
			},

			constants: {
				portrait: false,
				landscape: false,
				orientation: UI.UNKNOWN
			}
		});

	function getWindowOrientation() {
		var landscape = !!(window.innerWidth && (window.innerWidth > window.innerHeight)),
			c = api.__values__.constants;
		c.orientation = landscape ? UI.LANDSCAPE_LEFT : UI.PORTRAIT;
		c.landscape = landscape;
		c.portrait = !landscape;
		return api.orientation;
	}

	ready(function() {
		getWindowOrientation();
	});

	function deviceOrientation(evt) {
		var orient = null,
			beta = Math.abs(evt.beta || evt.y|0 * 90),
			gamma = Math.abs(evt.gamma || evt.x|0 * 90);

		beta < 5 && gamma > 170 && (orient = UI.FACE_DOWN);
		beta < 5 && gamma < 5 && (orient = UI.FACE_UP);
		beta > 50 && 0 > beta && lastOrient != orient && (orient = UI.UPSIDE_PORTRAIT);

		if (orient !== null && lastOrient !== orient) {
			api.fireEvent('orientationchange', {
				orientation: lastOrient = orient,
				source: evt.source
			});
		}
	}

	on(win, "devicemotion", function(evt) {
		var e = evt.acceleration || evt.accelerationIncludingGravity,
			x, y, z,
			currentTime,
			accel = e && {
				x: e.x,
				y: e.y,
				z: e.z,
				source: evt.source
			};

		if (accel) {
			if (lastAccel.x !== void 0) {
				x = Math.abs(lastAccel.x - accel.x) > 10;
				y = Math.abs(lastAccel.y - accel.y) > 10;
				z = Math.abs(lastAccel.z - accel.z) > 10;
				if ((x && (y || z)) || (y && z)) {
					currentTime = Date.now();
					if ((accel.timestamp = currentTime - lastShake) > 300) {
						lastShake = currentTime;
						api.fireEvent('shake', accel);
					}
				}
			}
			lastAccel = accel;
		}
	});

	return api;

});
},
"Ti/Map":function(){
/* /titanium/Ti/Map.js */

define(["Ti/_/Evented", "Ti/_/lang"], function(Evented, lang) {

	return lang.setObject("Ti.Map", Evented, {

		constants: {
			// these constants MUST match the correct order of the markers in Ti.Map.View
			ANNOTATION_GREEN: 1,
			ANNOTATION_PURPLE: 2,
			ANNOTATION_RED: 0,

			HYBRID_TYPE: 2,
			SATELLITE_TYPE: 1,
			STANDARD_TYPE: 0,
			TERRAIN_TYPE: 3
		},

		createAnnotation: function(args) {
			return new (require("Ti/Map/Annotation"))(args);
		},

		createView: function(args) {
			return new (require("Ti/Map/View"))(args);
		}

	});

});
},
"Ti/Media":function(){
/* /titanium/Ti/Media.js */

define(["Ti/_/Evented", "Ti/_/lang"], function(Evented, lang) {

	return lang.setObject("Ti.Media", Evented, {

		constants: {
			UNKNOWN_ERROR: 0,
			DEVICE_BUSY: 1,
			NO_CAMERA: 2,
			NO_VIDEO: 3,

			VIDEO_CONTROL_DEFAULT: 1,
			VIDEO_CONTROL_EMBEDDED: 1,
			VIDEO_CONTROL_FULLSCREEN: 2,
			VIDEO_CONTROL_NONE: 0,
			VIDEO_CONTROL_HIDDEN: 0,

			VIDEO_SCALING_NONE: 0,
			VIDEO_SCALING_ASPECT_FILL: 2,
			VIDEO_SCALING_ASPECT_FIT: 1,
			VIDEO_SCALING_MODE_FILL: 3,

			VIDEO_PLAYBACK_STATE_STOPPED: 0,
			VIDEO_PLAYBACK_STATE_PLAYING: 1,
			VIDEO_PLAYBACK_STATE_PAUSED: 2,

			VIDEO_LOAD_STATE_PLAYABLE: 1,
			VIDEO_LOAD_STATE_PLAYTHROUGH_OK: 2,
			VIDEO_LOAD_STATE_STALLED: 4,
			VIDEO_LOAD_STATE_UNKNOWN: 0,

			VIDEO_REPEAT_MODE_NONE: 0,
			VIDEO_REPEAT_MODE_ONE: 1,

			VIDEO_FINISH_REASON_PLAYBACK_ENDED: 0,
			VIDEO_FINISH_REASON_PLAYBACK_ERROR: 1,
			VIDEO_FINISH_REASON_USER_EXITED: 2,

			MEDIA_TYPE_PHOTO: "public.image",
			MEDIA_TYPE_VIDEO: "public.video"
		},

		//beep: function() {},

		//createAudioPlayer: function() {},

		//createSound: function() {},

		createVideoPlayer: function(args) {
			return new (require("Ti/Media/VideoPlayer"))(args);
		},

		vibrate: function(pattern) {
			"vibrate" in navigator && navigator.vibrate(require.is(pattern, "Array") ? pattern : [pattern | 0]);
		}

	});
	
});
},
"Ti/Utils":function(){
/* /titanium/Ti/Utils.js */

/**
 * This file contains source code from the following:
 *
 * Dojo Toolkit
 * Copyright (c) 2005-2011, The Dojo Foundation
 * New BSD License
 * <http://dojotoolkit.org>
 *
 * A JavaScript implementation of the RSA Data Security, Inc. MD5
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * BSD License
 * <http://pajhome.org.uk/crypt/md5/md5.html>
 *
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256
 * Version 2.2 Copyright Angel Marin, Paul Johnston 2000 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * BSD License
 * <http://pajhome.org.uk/crypt/md5/sha256.html>
 */

define(["Ti/_/encoding", "Ti/_/Evented", "Ti/_/lang", "Ti/Blob"], function(encoding, Evented, lang, Blob) {

	function toWord(s, y) {
		var wa = [],
			i = 0,
			l = s.length * 8;
		for (; i < l; i += 8) {
			wa[i>>5] |= (s.charCodeAt(i / 8) & 255) << ((y ? y - i : i) % 32);
		}
		return wa;
	}

	function toString(wa, y) {
		var s = [],
			i = 0,
			l = wa.length * 32;
		for (; i < l; i += 8) {
			s.push(String.fromCharCode((wa[i >> 5] >>> ((y ? y - i : i) % 32)) & 255));
		}
		return s.join('');
	}

	function toHex(wa, y) {
		var h = "0123456789abcdef",
			i = 0,
			l = wa.length * 4,
			s = [];
		for (; i < l; i++) {
			s.push(h.charAt((wa[i>>2]>>(((y?y-i:i)%4)*8+4))&0xF)+h.charAt((wa[i>>2]>>(((y?y-i:i)%4)*8))&0xF));
		}
		return s.join('');
	}

	function padWords(x, len) {
		x = toWord(x, 24);
		x[len >> 5] |= 0x80 << (24 - len % 32);
		x[((len + 64 >> 9) << 4) + 15] = len;
		return x;
	}

	function addWords(a, b) {
		var l = (a & 0xFFFF) + (b & 0xFFFF),
			m = (a >> 16) + (b >> 16) + (l >> 16);
		return (m << 16) | (l & 0xFFFF);
	}

	function R(n,c) { return (n<<c) | (n>>>(32-c)); }
	function C(q,a,b,x,s,t) { return addWords(R(addWords(addWords(a, q), addWords(x, t)), s), b); }
	function FF(a,b,c,d,x,s,t) { return C((b&c)|((~b)&d),a,b,x,s,t); }
	function GG(a,b,c,d,x,s,t) { return C((b&d)|(c&(~d)),a,b,x,s,t); }
	function HH(a,b,c,d,x,s,t) { return C(b^c^d,a,b,x,s,t); }
	function II(a,b,c,d,x,s,t) { return C(c^(b|(~d)),a,b,x,s,t); }
	function FT(t,b,c,d) {
		if (t<20) { return (b&c)|((~b)&d); }
		if (t<40) { return b^c^d; }
		if (t<60) { return (b&c)|(b&d)|(c&d); }
		return b^c^d;
	}
	function KT(t) { return (t<20)?1518500249:(t<40)?1859775393:(t<60)?-1894007588:-899497514; }

	function sha256_S (X, n) {return ( X >>> n ) | (X << (32 - n));}
	function sha256_Gamma0256(x) {return (sha256_S(x, 7) ^ sha256_S(x, 18) ^ (x >>> 3));}
	function sha256_Gamma1256(x) {return (sha256_S(x, 17) ^ sha256_S(x, 19) ^ (x >>> 10));}

	var sha256_K = [
		1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993,
		-1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
		1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
		264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
		-1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
		113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
		1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885,
		-1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
		430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
		1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872,
		-1866530822, -1538233109, -1090935817, -965641998
	];

	function isBlob(it) {
		return it && it.declaredClass === "Ti.Blob";
	}

	function base64decode(input) {
		return atob(encoding.utf8encode(input));
	}

	function getData(x) {
		return isBlob(x) ? (x._isBinary ? base64decode(x._data) : x._data) : x;
	}

	return lang.setObject("Ti.Utils", Evented, {

		base64decode: function(/*String|Ti.Blob*/input) {
			// if input is a binary blob, no sense in decoding it since it would just be re-encoded again
			return isBlob(input) && input._isBinary ? input : new Blob({ data: base64decode(input._data || input) });
		},

		base64encode: function(/*String|Ti.Blob*/input) {
			// if input is a binary blob, then it's already base64 encoded
			return isBlob(input) && input._isBinary ? input : new Blob({ data: encoding.utf8decode(btoa(input._data || input)) });
		},

		md5HexDigest: function(/*String|Ti.Blob*/x) {
			var x = encoding.utf8encode(getData(x)),
				len = x.length * 8,
				a = 1732584193,
				b = -271733879,
				c = -1732584194,
				d = 271733878,
				i = 0,
				l;

			x = toWord(x);
			x[len >> 5] |= 0x80 << (len % 32);
			x[(((len + 64) >>> 9) << 4) + 14] = len;

			for (l = x.length; i < l; i += 16) {
				var olda = a, oldb = b, oldc = c, oldd = d;

				a = FF(a,b,c,d,x[i+ 0],7 ,-680876936);
				d = FF(d,a,b,c,x[i+ 1],12,-389564586);
				c = FF(c,d,a,b,x[i+ 2],17, 606105819);
				b = FF(b,c,d,a,x[i+ 3],22,-1044525330);
				a = FF(a,b,c,d,x[i+ 4],7 ,-176418897);
				d = FF(d,a,b,c,x[i+ 5],12, 1200080426);
				c = FF(c,d,a,b,x[i+ 6],17,-1473231341);
				b = FF(b,c,d,a,x[i+ 7],22,-45705983);
				a = FF(a,b,c,d,x[i+ 8],7 , 1770035416);
				d = FF(d,a,b,c,x[i+ 9],12,-1958414417);
				c = FF(c,d,a,b,x[i+10],17,-42063);
				b = FF(b,c,d,a,x[i+11],22,-1990404162);
				a = FF(a,b,c,d,x[i+12],7 , 1804603682);
				d = FF(d,a,b,c,x[i+13],12,-40341101);
				c = FF(c,d,a,b,x[i+14],17,-1502002290);
				b = FF(b,c,d,a,x[i+15],22, 1236535329);

				a = GG(a,b,c,d,x[i+ 1],5 ,-165796510);
				d = GG(d,a,b,c,x[i+ 6],9 ,-1069501632);
				c = GG(c,d,a,b,x[i+11],14, 643717713);
				b = GG(b,c,d,a,x[i+ 0],20,-373897302);
				a = GG(a,b,c,d,x[i+ 5],5 ,-701558691);
				d = GG(d,a,b,c,x[i+10],9 , 38016083);
				c = GG(c,d,a,b,x[i+15],14,-660478335);
				b = GG(b,c,d,a,x[i+ 4],20,-405537848);
				a = GG(a,b,c,d,x[i+ 9],5 , 568446438);
				d = GG(d,a,b,c,x[i+14],9 ,-1019803690);
				c = GG(c,d,a,b,x[i+ 3],14,-187363961);
				b = GG(b,c,d,a,x[i+ 8],20, 1163531501);
				a = GG(a,b,c,d,x[i+13],5 ,-1444681467);
				d = GG(d,a,b,c,x[i+ 2],9 ,-51403784);
				c = GG(c,d,a,b,x[i+ 7],14, 1735328473);
				b = GG(b,c,d,a,x[i+12],20,-1926607734);

				a = HH(a,b,c,d,x[i+ 5],4 ,-378558);
				d = HH(d,a,b,c,x[i+ 8],11,-2022574463);
				c = HH(c,d,a,b,x[i+11],16, 1839030562);
				b = HH(b,c,d,a,x[i+14],23,-35309556);
				a = HH(a,b,c,d,x[i+ 1],4 ,-1530992060);
				d = HH(d,a,b,c,x[i+ 4],11, 1272893353);
				c = HH(c,d,a,b,x[i+ 7],16,-155497632);
				b = HH(b,c,d,a,x[i+10],23,-1094730640);
				a = HH(a,b,c,d,x[i+13],4 , 681279174);
				d = HH(d,a,b,c,x[i+ 0],11,-358537222);
				c = HH(c,d,a,b,x[i+ 3],16,-722521979);
				b = HH(b,c,d,a,x[i+ 6],23, 76029189);
				a = HH(a,b,c,d,x[i+ 9],4 ,-640364487);
				d = HH(d,a,b,c,x[i+12],11,-421815835);
				c = HH(c,d,a,b,x[i+15],16, 530742520);
				b = HH(b,c,d,a,x[i+ 2],23,-995338651);

				a = II(a,b,c,d,x[i+ 0],6 ,-198630844);
				d = II(d,a,b,c,x[i+ 7],10, 1126891415);
				c = II(c,d,a,b,x[i+14],15,-1416354905);
				b = II(b,c,d,a,x[i+ 5],21,-57434055);
				a = II(a,b,c,d,x[i+12],6 , 1700485571);
				d = II(d,a,b,c,x[i+ 3],10,-1894986606);
				c = II(c,d,a,b,x[i+10],15,-1051523);
				b = II(b,c,d,a,x[i+ 1],21,-2054922799);
				a = II(a,b,c,d,x[i+ 8],6 , 1873313359);
				d = II(d,a,b,c,x[i+15],10,-30611744);
				c = II(c,d,a,b,x[i+ 6],15,-1560198380);
				b = II(b,c,d,a,x[i+13],21, 1309151649);
				a = II(a,b,c,d,x[i+ 4],6 ,-145523070);
				d = II(d,a,b,c,x[i+11],10,-1120210379);
				c = II(c,d,a,b,x[i+ 2],15, 718787259);
				b = II(b,c,d,a,x[i+ 9],21,-343485551);

				a = addWords(a, olda);
				b = addWords(b, oldb);
				c = addWords(c, oldc);
				d = addWords(d, oldd);
			}

			return toHex([a,b,c,d]);
		},

		sha1: function(/*String|Ti.Blob*/x) {
			var x = encoding.utf8encode(getData(x)),
				a = 1732584193,
				b = -271733879,
				c = -1732584194,
				d = 271733878,
				e = -1009589776,
				i = 0,
				j, k, l,
				w = new Array(80);

			x = padWords(x, x.length * 8);

			for (l = x.length; i < l; i += 16) {
				var olda = a, oldb = b, oldc = c, oldd = d, olde = e;

				for (j = 0; j < 80; j++) {
					w[j] = j < 16 ? x[i + j] : R(w[j-3]^w[j-8]^w[j-14]^w[j-16], 1);
					k = addWords(addWords(R(a,5), FT(j,b,c,d)), addWords(addWords(e,w[j]), KT(j)));
					e = d;
					d = c;
					c = R(b, 30);
					b = a;
					a = k;
				}

				a = addWords(a, olda);
				b = addWords(b, oldb);
				c = addWords(c, oldc);
				d = addWords(d, oldd);
				e = addWords(e, olde);
			}

			return toHex([a, b, c, d, e], 3);
		},

		sha256: function(/*String|Ti.Blob*/x) {
			var x = encoding.utf8encode(getData(x)),
				a = 1779033703,
				b = -1150833019,
				c = 1013904242,
				d = -1521486534,
				e = 1359893119,
				f = -1694144372,
				g = 528734635,
				h = 1541459225,
				i = 0,
				j, l, T1, T2,
				w = new Array(64);

			x = padWords(x, x.length * 8);

			for (l = x.length; i < l; i += 16) {
				var olda = a, oldb = b, oldc = c, oldd = d, olde = e, oldf = f, oldg = g, oldh = h;

				for (j = 0; j < 64; j++) {
					w[j] = j < 16 ? x[i + j] : addWords(addWords(addWords(sha256_Gamma1256(w[j-2]), w[j-7]), sha256_Gamma0256(w[j-15])), w[j-16]);
					T1 = addWords(addWords(addWords(addWords(h, sha256_S(e, 6) ^ sha256_S(e, 11) ^ sha256_S(e, 25)), (e & f) ^ ((~e) & g)), sha256_K[j]), w[j]);
					T2 = addWords(sha256_S(a, 2) ^ sha256_S(a, 13) ^ sha256_S(a, 22), (a & b) ^ (a & c) ^ (b & c));
					h = g;
					g = f;
					f = e;
					e = addWords(d, T1);
					d = c;
					c = b;
					b = a;
					a = addWords(T1, T2);
				}

				a = addWords(a, olda);
				b = addWords(b, oldb);
				c = addWords(c, oldc);
				d = addWords(d, oldd);
				e = addWords(e, olde);
				f = addWords(f, oldf);
				g = addWords(g, oldg);
				h = addWords(h, oldh);
			}

			return toHex([a, b, c, d, e, f, g, h], 3);
		}

	});

});
},
"Ti/XML":function(){
/* /titanium/Ti/XML.js */

define(["Ti/_/Evented", "Ti/_/lang"], function(Evented, lang) {
	
	// Add getters and setters to the various prototypes
	[
		[
			"Document",
			"doctype,implementation,documentElement,inputEncoding,xmlEncoding,domConfig",
			"xmlStandalone,xmlVersion,strictErrorChecking,documentURI"
		],[
			"Node",
			"nodeName,nodeType,parentNode,childNodes,firstChild,lastChild,previousSibling,nextSibling,attributes,ownerDocument,namespaceURI,localName,baseURI",
			"textContent,nodeValue,prefix"
		],[
			"NamedNodeMap",
			"length"
		],[
			"CharacterData",
			"length",
			"data"
		],[
			"Attr",
			"name,specified,ownerElement,schemaTypeInfo,isId",
			"value"
		],[
			"Element",
			"tagName,schemaTypeInfo"
		],[
			"Text",
			"isElementContentWhitespace,wholeText"
		],[
			"DocumentType",
			"name,entities,notations,publicId,systemId,internalSubset"
		],[
			"Notation",
			"publicId,systemId"
		],[
			"NodeList",
			"length"
		],[
			"Entity",
			"publicId,systemId,notationName,inputEncoding,xmlEncoding,xmlVersion"
		],[
			"ProcessingInstruction",
			"target",
			"data"
		]
	].forEach(function(e) {
		var f = window[e[0]];
		f && lang.generateAccessors(f, e[1], e[2]);
	});

	return lang.setObject("Ti.XML", Evented, {
		
		parseString: function(xml) {
			return (new DOMParser()).parseFromString(xml,"text/xml");
		},
		
		serializeToString: function(node) {
			return (new XMLSerializer()).serializeToString(node);
		}

	});

});
},
"Ti/Yahoo":function(){
/* /titanium/Ti/Yahoo.js */

define(["Ti/_/Evented", "Ti/_/lang"],
	function(Evented, lang) {

	return lang.setObject("Ti.Yahoo", Evented, {

		yql: function(query, callback) {
			require([
				"http://query.yahooapis.com/v1/public/yql?format=json&callback=define&q="
					+ encodeURIComponent(query)
					.replace(/!/g,'%21')
					.replace(/'/g,'%27')
					.replace(/\(/,'%28')
					.replace(/\)/,'%29')
			], function(data) {
				var data = data || {},
					results = data.query && data.query.results;
				require.is(callback, "Function") && callback({
					success: !!results,
					data: results,
					message: data.error && data.error.description
				});
			});
		}

	});

});

},
"Ti/Facebook/LoginButton":function(){
/* /titanium/Ti/Facebook/LoginButton.js */

define(["Ti/_/declare", "Ti/_/Evented", "Ti/UI/Button", "Ti/Facebook", "Ti/_/lang"], function(declare, Evented, Button, Facebook, lang) {
	
	var imagePrefix = "themes/" + require.config.ti.theme + "/Facebook/",
		buttonImages = [
			"login.png", // Login normal
			"logout.png", // Logout normal
			"loginWide.png", // Login wide
			"logout.png" // Logout "wide" (really just normal)
		],
		pressedButtonImages = [
			"loginPressed.png", // Login normal pressed
			"logoutPressed.png", // Logout normal pressed
			"loginWidePressed.png", // Login wide pressed
			"logoutPressed.png" // Logout "wide" pressed (really just normal)
		];
	
	return declare("Ti.Facebook.LoginButton", Button, {
		
		constructor: function() {
			
			this._clearDefaultLook();
			this._updateImages();
			
			this._loggedInState = Facebook.loggedIn;
			
			this.addEventListener("singletap", function() {
				if (Facebook.loggedIn) {
					Facebook.logout();
				} else {
					Facebook.authorize();
				}
			});
			Facebook.addEventListener("login", lang.hitch(this,"_updateImages"));
			Facebook.addEventListener("logout", lang.hitch(this,"_updateImages"));
		},
		
		_updateImages: function() {
			this._loggedInState = Facebook.loggedIn;
			var imageIndex = 0;
			Facebook.loggedIn && (imageIndex++);
			this.style === Facebook.BUTTON_STYLE_WIDE && (imageIndex += 2);
			this.backgroundImage = imagePrefix + buttonImages[imageIndex];
			this.backgroundSelectedImage = imagePrefix + pressedButtonImages[imageIndex];
			this._hasSizeDimensions() && this._triggerLayout();
		},
		
		_getContentSize: function() {
			// Heights and widths taken directly from the image sizes.
			return {
				width: !Facebook.loggedIn && this.style === Facebook.BUTTON_STYLE_WIDE ? 318 : 144,
				height: 58
			};
		},
		
		properties: {
			style: {
				post: function() {
					this._updateImages();
				},
				value: Facebook.BUTTON_STYLE_NORMAL
			}
		}
		
	});

});
},
"Ti/UI/Button":function(){
/* /titanium/Ti/UI/Button.js */

define(['Ti/_/declare', 'Ti/_/UI/Widget', 'Ti/_/dom', 'Ti/_/css', 'Ti/_/style', 'Ti/_/lang', 'Ti/Locale', 'Ti/UI'],
	function(declare, Widget, dom, css, style, lang, Locale, UI) {

	var on = require.on,
		setStyle = style.set,
		postDoBackground = {
			post: function() {
				if (this.backgroundColor || this.backgroundDisabledColor || this.backgroundDisabledImage || this.backgroundFocusedColor ||
					this.backgroundFocusedImage || this.backgroundImage || this.backgroundSelectedColor || this.backgroundSelectedImage) {
					this._clearDefaultLook();
				} else {
					this._setDefaultLook();
				}
				this._doBackground();
			}
		},
		titlePost = {
			post: function() {
				var text = Locale._getString(this.titleid, this.title);
				//For platform consistency, covert leading spaces to non-breaking
				this._buttonTitle.text = text.replace(/^[ \t]+/gm, function(x){ return new Array(x.length + 1).join('&nbsp;') });
				this._hasSizeDimensions() && this._triggerLayout();
			}
		};

	return declare('Ti.UI.Button', Widget, {

		constructor: function() {
			var contentContainer = this._contentContainer = UI.createView({
					width: UI.INHERIT,
					height: UI.INHERIT,
					layout: UI._LAYOUT_CONSTRAINING_HORIZONTAL,
					borderColor: 'transparent'
				}),
				node = this.domNode;

			this._add(contentContainer);

			contentContainer._add(this._buttonImage = UI.createImageView());
			contentContainer._add(this._buttonTitle = UI.createLabel({
				textAlign: UI.TEXT_ALIGNMENT_CENTER,
				verticalAlign: UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
				width: UI.INHERIT,
				height: UI.INHERIT
			}));

			this._setDefaultLook();

			on(this, 'touchstart', this, function() {
				if (this._hasDefaultLook) {
					css.remove(node, 'TiUIElementGradient');
					css.add(node, 'TiUIElementGradientActive');
				} else {
					this.selectedColor && (this._buttonTitle.color = this.selectedColor);
					this.backgroundSelectedColor && setStyle(this.domNode,'backgroundColor',this.backgroundSelectedColor);
				}
			});
			on(this, 'touchend', this, function() {
				if (this._hasDefaultLook) {
					css.remove(node, 'TiUIElementGradientActive');
					css.add(node, 'TiUIElementGradient');
				} else {
					this.selectedColor && (this._buttonTitle.color = this.color || '#000');
					this.backgroundSelectedColor && setStyle(this.domNode,'backgroundColor',this.backgroundColor);
				}
			});
			on(node, 'mouseout', this, function() {
				this.selectedColor && (this._buttonTitle.color = this.color || '#000');
			});
		},

		_defaultWidth: UI.SIZE,

		_defaultHeight: UI.SIZE,

		_setDefaultLook: function() {
			if (!this._hasDefaultLook) {
				this._hasDefaultLook = true;
				this._previousBorderWidth = this.borderWidth;
				this._previousBorderColor = this.borderColor;
				css.add(this.domNode, 'TiUIElementGradient');
				css.add(this.domNode, 'TiUIButtonDefault');
				this._contentContainer.borderWidth = 6;
				this._getBorderFromCSS();
			}
		},

		_clearDefaultLook: function() {
			if (this._hasDefaultLook) {
				this._hasDefaultLook = false;
				this.borderWidth = this._previousBorderWidth;
				this.borderColor = this._previousBorderColor;
				css.remove(this.domNode, 'TiUIElementGradient');
				css.remove(this.domNode, 'TiUIButtonDefault');
				this._contentContainer.borderWidth = 0;
			}
		},

		properties: {

			// Override the default background info so we can hook into it
			backgroundColor: postDoBackground,

			backgroundDisabledColor: postDoBackground,

			backgroundDisabledImage: postDoBackground,

			backgroundFocusedColor: postDoBackground,

			backgroundFocusedImage: postDoBackground,

			backgroundImage: postDoBackground,

			backgroundSelectedColor: postDoBackground,

			backgroundSelectedImage: postDoBackground,

			enabled: {
				set: function(value, oldValue) {

					if (value !== oldValue) {
						if (this._hasDefaultLook) {
							if (!value) {
								css.remove(this.domNode,'TiUIElementGradient');
								setStyle(this.domNode,'backgroundColor','#aaa');
							} else {
								css.add(this.domNode,'TiUIElementGradient');
								setStyle(this.domNode,'backgroundColor','');
							}
						}
						this._setTouchEnabled(value);
					}
					return value;
				},
				value: true
			},
			font : {
				set : function(value) {
					this._buttonTitle.font = value;
					return value;
				}
			},
			image: {
				set: function(value) {
					this._buttonImage.image = value;
					return value;
				}
			},
			shadowColor: {
				post: function (value) {
					this._buttonTitle.shadowColor = value;
				}
			},
			shadowOffset: {
				post: function (value) {
					this._buttonTitle.shadowOffset = value;
				}
			},
			shadowRadius: {
				post: function (value) {
					this._buttonTitle.shadowRadius = value;
				}
			},
			selectedColor: void 0,
			textAlign: {
				set: function(value) {
					return this._buttonTitle.textAlign = value;
				}
			},
			title: titlePost,
			titleid: titlePost,
			verticalAlign: {
				set: function(value) {
					return this._buttonTitle.verticalAlign = value;
				}
			}
		}

	});

});
},
"Ti/_/UI/Widget":function(){
/* /titanium/Ti/_/UI/Widget.js */

define(["Ti/_/declare", "Ti/UI/View"], function(declare, View) {

	// base class for various widgets that will eventually merge with Ti._.UI.Element in 1.9
	return declare("Ti._.UI.Widget", View);

});
},
"Ti/UI/View":function(){
/* /titanium/Ti/UI/View.js */

define(['Ti/_/declare', 'Ti/_/UI/Element', 'Ti/_/string', 'Ti/_/Layouts', 'Ti/UI'],
	function (declare, Element, string, Layouts, UI) {

	var layoutRegExp = /^horizontal|vertical|constrainingHorizontal|constrainingVertical$/;

	return declare('Ti.UI.View', Element, {

		constructor: function () {
			this.__values__.constants.children = [];
			this._setLayout();
			this.containerNode = this.domNode;
		},

		/**
		 * Marks a view as 'published,' meaning it will show up in {@link Ti#UI#View#children} and can be the source of
		 * UI events.
		 *
		 * @private
		 * @name Ti#UI#View#_markPublished
		 * @param {Ti.UI.View} view The view to mark as published.
		 */
		_publish: function (view) {
			this.children.push(view);
			view._isPublished = 1;
		},

		/**
		 * Marks a view as 'unpublished,' meaning it will <em>not</em> show up in {@link Ti#UI#View#children} and can
		 * <em>not</em> be the source of UI events.
		 *
		 * @private
		 * @name Ti#UI#View#_markPublished
		 * @param {Ti.UI.View} view The view to mark as unpublished.
		 */
		_unpublish: function (view) {
			var children = this.children,
				viewIdx = children.indexOf(view);
			~viewIdx && children.splice(viewIdx, 1);
		},

		add: function (view) {
			this._add(view);
			this._publish(view);
		},

		remove: function (view) {
			this._remove(view);
			this._unpublish(view);
		},

		_defaultWidth: UI.FILL,

		_defaultHeight: UI.FILL,

		_setLayout: function (value) {
			value = layoutRegExp.test(value) ? value : 'composite';

			if (this._layout) {
				this._layout.destroy();
				this._layout = null;
			}

			this._layout = new Layouts[string.capitalize(value === 'horizontal' && !this.horizontalWrap ? 'constrainingHorizontal' : value)]({
				element: this
			});

			return value;
		},

		constants: {
			children: void 0
		},

		properties: {
			layout: {
				set: '_setLayout'
			},
			horizontalWrap: {
				post: function () {
					this.layout = this.layout; // Force a new layout to be created.
				},
				value: true
			}
		}

	});

});
},
"Ti/_/UI/Element":function(){
/* /titanium/Ti/_/UI/Element.js */

/*global Ti define window*/
define(
	['Ti/_/css', 'Ti/_/declare', 'Ti/_/dom', 'Ti/_/event', 'Ti/_/has', 'Ti/_/lang',
	'Ti/_/style', 'Ti/_/Evented', 'Ti/UI', 'Ti/UI/Animation'],
	function(css, declare, dom, event, has, lang, style, Evented, UI, Animation) {

	var global = window,
		unitize = dom.unitize,
		computeSize = dom.computeSize,
		on = require.on,
		setStyle = style.set,
		is = require.is,
		isDef = lang.isDef,
		postDoBackground = {
			post: '_doBackground'
		},
		postLayoutPropFunction = function(value, oldValue) {
			(value === null || (!is(value,'String') && !is(value,'Number'))) && (value = void 0);
			value !== oldValue && !this._batchUpdateInProgress && this._triggerLayout();
			return value;
		},
		postLayoutProp = {
			set: postLayoutPropFunction
		},
		pixelUnits = 'px',
		useTouch = has('touch'),
		usePointer = global.navigator.msPointerEnabled,
		gestureEvents = [
			'touchstart',
			'touchend',
			'touchmove',
			'touchcancel',
			'singletap',
			'doubletap',
			'longpress',
			'pinch',
			'swipe',
			'twofingertap'
		];

	return declare('Ti._.UI.Element', Evented, {

		domType: null,
		domNode: null,
		_alive: 1,

		constructor: function(args) {
			var self = this,
				touching = 0,

				node = self.domNode = self._setFocusNode(dom.create(self.domType || 'div', {
					className: 'TiUIElement ' + css.clean(self.declaredClass),
					'data-widget-id': self.widgetId
				}));

			self._children = [];

			on(self, 'touchstart', self, '_doBackground');
			on(self, 'touchend', self, '_doBackground');

			// NOTE: this code signifies that a given element was involved in the event, but doesn't actually handle it.
			// The code to actually handle the event is in UI.js
			on(self.domNode, usePointer ? 'MSPointerDown' : useTouch ? 'touchstart' : 'mousedown', function(evt){
				var handles = [
					on(global, usePointer ? 'MSPointerMove' : useTouch ? 'touchmove' : 'mousemove', function(evt){
						(useTouch || touching) && (evt._elements || (evt._elements = [])).push(self);
					}),
					on(global, usePointer ? 'MSPointerUp' : useTouch ? 'touchend' : 'mouseup', function(evt){
						touching = 0;
						(evt._elements || (evt._elements = [])).push(self);
						event.off(handles);
					}),
					useTouch && on(global, 'touchcancel', function(evt){
						(evt._elements || (evt._elements = [])).push(self);
						event.off(handles);
					})
				];
				touching = 1;
				(evt._elements || (evt._elements = [])).push(self);
			});

			var values = self.__values__.constants;
			self._layoutCoefficients = {
				width: {
					x1: 0,
					x2: 0,
					x3: 0
				},
				minWidth: {
					x1: 0,
					x2: 0,
					x3: 0
				},
				sandboxWidth: {
					x1: 0,
					x2: 0,
					x3: 0
				},
				height: {
					x1: 0,
					x2: 0,
					x3: 0
				},
				minHeight: {
					x1: 0,
					x2: 0,
					x3: 0
				},
				sandboxHeight: {
					x1: 0,
					x2: 0,
					x3: 0
				},
				left: {
					x1: 0,
					x2: 0,
					x3: 0
				},
				top: {
					x1: 0,
					x2: 0,
					x3: 0,
					x4: 0
				}
			};
			values.size = {
				x: 0,
				y: 0,
				width: 0,
				height: 0
			};
			values.rect = {
				x: 0,
				y: 0,
				width: 0,
				height: 0
			};
		},

		fireEvent: function(type, e) {
			e = e || {};
			var bubbles = e.bubbles,
				p;
			Evented.fireEvent.call(this, type, e);
			if (bubbles && !e.cancelBubble && this.bubbleParent && this._parent) {
				if (isDef(e.x)) {
					p = this.convertPointToView({
						x: e.x,
						y: e.y
					}, this._parent);
					e.x = p ? p.x : e.x;
					e.y = p ? p.y : e.y;
				}
				this._parent.fireEvent(type, e);
			}
		},

		_setParent: function(view) {
			this._parent = view;
		},

		_add: function(view, hidden) {

			view._hidden = hidden;

			view._setParent(this);

			this._children.push(view);
			this.containerNode.appendChild(view.domNode);

			view._triggerLayout();
		},

		_insertAt: function(view, index, hidden) {
			var children = this._children;
			if (index > children.length || index < 0) {
				return;
			} else if (index === children.length) {
				this._add(view, hidden);
			} else {
				view._parent = this;
				this.containerNode.insertBefore(view.domNode, children[index].domNode);
				children.splice(index,0,view);
				this._triggerLayout();
			}
		},

		_remove: function(view) {
			var children = this._children,
				p = children.indexOf(view);
			if (p !== -1) {
				children.splice(p, 1);
				view._setParent();
				dom.detach(view.domNode);
				this._triggerLayout();
			}
		},

		_removeAllChildren: function(view) {
			var children = this._children;
			while (children.length) {
				this.remove(children[0]);
			}
			this._triggerLayout();
		},

		destroy: function() {
			if (this._alive) {
				var children = this._children;
				while (children.length) {
					children.splice(0, 1)[0].destroy();
				}
				this._parent && this._parent._remove(this);
				if (this.domNode) {
					dom.destroy(this.domNode);
					this.domNode = null;
				}
			}
			Evented.destroy.apply(this, arguments);
		},

		_isAttachedToActiveWin: function() {
			// If this element is not attached to an active window, skip the calculation
			var isAttachedToActiveWin = false,
				node = this;
			while(node) {
				if (node === UI._container) {
					isAttachedToActiveWin = true;
					break;
				}
				node = node._parent;
			}
			return isAttachedToActiveWin;
		},

		_needsMeasuring: true,

		_triggerLayout: function(force) {
			this._needsMeasuring = true;
			this._isAttachedToActiveWin() && (!this._batchUpdateInProgress || force) && UI._triggerLayout(this, force);
		},

		_hasSizeDimensions: function() {
			return this._hasSizeWidth() || this._hasSizeHeight();
		},

		_hasSizeHeight: function() {
			return isNaN(this._layoutCoefficients.height.x1);
		},

		_hasSizeWidth: function() {
			return isNaN(this._layoutCoefficients.width.x1);
		},

		startLayout: function() {
			this._batchUpdateInProgress = true;
		},

		finishLayout: function() {
			this._batchUpdateInProgress = false;
			UI._triggerLayout(this, true);
		},

		updateLayout: function(params) {
			this.startLayout();
			var i = 0,
				len = params.length;
			for(; i < len; i++) {
				this[i] = params[i];
			}
			this.finishLayout();
		},

		convertPointToView: function(point, destinationView) {
			// Make sure that both nodes are connected to the root
			if (!this._isAttachedToActiveWin() || !destinationView._isAttachedToActiveWin()) {
				return null;
			}

			if (!point || !is(point.x,'Number') || !is(point.y,'Number')) {
				throw new Error('Invalid point');
			}

			if (!destinationView.domNode) {
				throw new Error('Invalid destination view');
			}

			function getAbsolutePosition(node, point, additive) {
				var x = point.x,
					y = point.y,
					multiplier = (additive ? 1 : -1);

				while(node) {
					x += multiplier * node.domNode.offsetLeft;
					y += multiplier * node.domNode.offsetTop;
					node = node._parent;
				}

				return {x: x, y: y};
			}

			// Find this node's location relative to the root
			return getAbsolutePosition(destinationView, getAbsolutePosition(this,point,true),false);
		},

		// This method returns the offset of the content relative to the parent's location.
		// This is useful for controls like ScrollView that can move the children around relative to itself.
		_getContentOffset: function() {
			return {x: 0, y: 0};
		},

		_computeGradient: function() {
			var backgroundGradient = this.backgroundGradient;
				colors = backgroundGradient.colors,
				type = backgroundGradient.type,
				cssVal = type + '-gradient(';

			// Convert common units to absolute
			var startPointX = computeSize(backgroundGradient.startPoint.x, this._measuredWidth),
				startPointY = computeSize(backgroundGradient.startPoint.y, this._measuredHeight),
				centerX = computeSize('50%', this._measuredWidth),
				centerY = computeSize('50%', this._measuredHeight),
				numColors = colors.length;

			if (type === 'linear') {

				// Convert linear specific values to absolute
				var endPointX = computeSize(backgroundGradient.endPoint.x, this._measuredWidth),
					endPointY = computeSize(backgroundGradient.endPoint.y, this._measuredHeight);

				var userGradientStart,
					userGradientEnd;
				if (Math.abs(startPointX - endPointX) < 0.01) {
					// Vertical gradient shortcut
					if (startPointY < endPointY) {
						userGradientStart = startPointY;
						userGradientEnd = endPointY;
						cssVal += '270deg';
					} else {
						userGradientStart = endPointY;
						userGradientEnd = startPointY;
						cssVal += '90deg';
					}
				} else if(Math.abs(startPointY - endPointY) < 0.01) {
					// Horizontal gradient shortcut
					if (startPointX < endPointX) {
						userGradientStart = startPointX;
						userGradientEnd = endPointX;
						cssVal += '0deg';
					} else {
						userGradientStart = endPointX;
						userGradientEnd = startPointX;
						cssVal += '180deg';
					}
				}else {

					// Rearrange values so that start is to the left of end
					var mirrorGradient = false;
					if (startPointX > endPointX) {
						mirrorGradient = true;
						var temp = startPointX;
						startPointX = endPointX;
						endPointX = temp;
						temp = startPointY;
						startPointY = endPointY;
						endPointY = temp;
					}

					// Compute the angle, start location, and end location of the gradient
					var angle = Math.atan2(endPointY - startPointY, endPointX - startPointX),
						tanAngle = Math.tan(angle),
						cosAngle = Math.cos(angle),
						originLineIntersection = centerY - centerX * tanAngle,
						userDistance = (startPointY - startPointX * tanAngle - originLineIntersection) * cosAngle,
						userXOffset = userDistance * Math.sin(angle),
						userYOffset = userDistance * cosAngle,
						startPointX = startPointX + userXOffset,
						startPointY = startPointY - userYOffset,
						endPointX = endPointX + userXOffset,
						endPointY = endPointY - userYOffset,
						shiftedAngle = Math.PI / 2 - angle;
					if (angle > 0) {
						var globalGradientStartDistance = originLineIntersection * Math.sin(shiftedAngle),
							globalGradientStartOffsetX = -globalGradientStartDistance * Math.cos(shiftedAngle),
							globalGradientStartOffsetY = globalGradientStartDistance * Math.sin(shiftedAngle);
						userGradientStart = Math.sqrt(Math.pow(startPointX - globalGradientStartOffsetX,2) + Math.pow(startPointY - globalGradientStartOffsetY,2));
						userGradientEnd = Math.sqrt(Math.pow(endPointX - globalGradientStartOffsetX,2) + Math.pow(endPointY - globalGradientStartOffsetY,2));
					} else {
						var globalGradientStartDistance = (this._measuredHeight - originLineIntersection) * Math.sin(shiftedAngle),
							globalGradientStartOffsetX = -globalGradientStartDistance * Math.cos(shiftedAngle),
							globalGradientStartOffsetY = this._measuredHeight - globalGradientStartDistance * Math.sin(shiftedAngle);
						userGradientStart = Math.sqrt(Math.pow(startPointX - globalGradientStartOffsetX,2) + Math.pow(startPointY - globalGradientStartOffsetY,2));
						userGradientEnd = Math.sqrt(Math.pow(endPointX - globalGradientStartOffsetX,2) + Math.pow(endPointY - globalGradientStartOffsetY,2));
					}

					// Set the angle info for the gradient
					angle = mirrorGradient ? angle + Math.PI : angle;
					cssVal += Math.round((360 * (2 * Math.PI - angle) / (2 * Math.PI))) + 'deg';
				}

				// Calculate the color stops
				for (var i = 0; i < numColors; i++) {
					var color = colors[i];
					if (is(color,'String')) {
						color = { color: color };
					}
					if (!is(color.offset,'Number')) {
						color.offset = i / (numColors - 1);
					}
					cssVal += ',' + color.color + ' ' + Math.round(computeSize(100 * color.offset + '%', userGradientEnd - userGradientStart) + userGradientStart) + pixelUnits;
				}

			} else if (type === 'radial') {

				// Convert radial specific values to absolute
				var radiusTotalLength = Math.min(this._measuredWidth,this._measuredHeight),
					startRadius = computeSize(backgroundGradient.startRadius, radiusTotalLength),
					endRadius = computeSize(backgroundGradient.endRadius, radiusTotalLength);

				var colorList = [],
					mirrorGradient = false;
				if (startRadius > endRadius) {
					var temp = startRadius;
					startRadius = endRadius;
					endRadius = temp;
					mirrorGradient = true;

					for (var i = 0; i <= (numColors - 2) / 2; i++) {
						var mirroredPosition = numColors - i - 1;
						colorList[i] = colors[mirroredPosition];
						colorList[mirroredPosition] = colors[i];
					}
					if (numColors % 2 === 1) {
						var middleIndex = Math.floor(numColors / 2);
						colorList[middleIndex] = colors[middleIndex];
					}
				} else {
					for (var i = 0; i < numColors; i++) {
						colorList[i] = colors[i];
					}
				}

				cssVal += startPointX + pixelUnits + ' ' + startPointY + pixelUnits;

				// Calculate the color stops
				for (var i = 0; i < numColors; i++) {
					var color = colorList[i];
					if (is(color,'String')) {
						color = { color: color };
					}
					var offset;
					if (!is(color.offset,'Number')) {
						offset = i / (numColors - 1);
					} else {
						offset = mirrorGradient ? numColors % 2 === 1 && i === Math.floor(numColors / 2) ? color.offset : 1 - color.offset : color.offset;
					}
					cssVal += ',' + color.color + ' ' + Math.round(computeSize(100 * offset + '%', endRadius - startRadius) + startRadius) + pixelUnits;
				}
			}

			require.config.vendorPrefixes.css.forEach(function(vendorPrefix) {
				setStyle(this.domNode, 'backgroundImage', vendorPrefix + cssVal + ')');
			}, this);
		},

		_defaultBackgroundColor: void 0,

		_defaultBackgroundImage: void 0,

		_defaultBackgroundDisabledColor: void 0,

		_defaultBackgroundDisabledImage: void 0,

		_defaultBackgroundFocusedColor: void 0,

		_defaultBackgroundFocusedImage: void 0,

		_defaultBackgroundSelectedColor: void 0,

		_defaultBackgroundSelectedImage: void 0,

		_borderLeftWidth: 0,

		_borderRightWidth: 0,

		_borderTopWidth: 0,

		_borderBottomWidth: 0,

		_getBorderFromCSS: function() {
			setTimeout(lang.hitch(this, function () {
				var computedStyle = global.getComputedStyle(this.domNode),
					left = Math.round(parseFloat(computedStyle['border-left-width'])),
					right = Math.round(parseFloat(computedStyle['border-right-width'])),
					top = Math.round(parseFloat(computedStyle['border-top-width'])),
					bottom = Math.round(parseFloat(computedStyle['border-bottom-width']));

				if (!(isNaN(left) || isNaN(right) || isNaN(top) || isNaN(bottom))) {
						if (left === right && left === top && left === bottom) {
							this.borderWidth = left;
						} else {
							this.borderWidth = [left, right, top, bottom];
						}
				}
			}), 1);
		},

		_doBackground: function(evt) {
			if (!this.backgroundGradient) {
				evt = evt || {};
				var m = (evt.type || '').match(/mouse(over|out)/),
					bi = this.backgroundImage || this._defaultBackgroundImage || 'none',
					bc = this.backgroundColor || this._defaultBackgroundColor,
					repeat = this.backgroundRepeat,
					nodeStyle = this.domNode.style,
					tmp;

				if (this._touching) {
					bc = this.backgroundSelectedColor || this._defaultBackgroundSelectedColor || bc;
					bi = this.backgroundSelectedImage || this._defaultBackgroundSelectedImage || bi;
				}

				m && (this._over = m[1] === 'over');
				if (!this._touching && this.focusable && this._over) {
					bc = this.backgroundFocusedColor || this._defaultBackgroundFocusedColor || bc;
					bi = this.backgroundFocusedImage || this._defaultBackgroundFocusedImage || bi;
				}

				if (!this.enabled) {
					bc = this.backgroundDisabledColor || this._defaultBackgroundDisabledColor || bc;
					bi = this.backgroundDisabledImage || this._defaultBackgroundDisabledImage || bi;
				}

				bc = bc || (bi && bi !== 'none' ? 'transparent' : '');
				nodeStyle.backgroundColor.toLowerCase() !== bc.toLowerCase() && (nodeStyle.backgroundColor = bc);

				bi != 'none' && (bi = style.url(bi));
				nodeStyle.backgroundImage.replace(/'|"/g, '').toLowerCase() !== bi.toLowerCase() && (nodeStyle.backgroundImage = (bi == 'none' ? '' : bi));

				if (bi) {
					tmp = repeat ? 'repeat' : 'no-repeat';
					nodeStyle.backgroundRepeat !== tmp && (nodeStyle.backgroundRepeat = tmp);
					tmp = repeat ? 'auto' : '100% 100%';
					nodeStyle.backgroundSize.replace(/(100%) 100%/, '$1') !== tmp && (nodeStyle.backgroundSize = tmp);
				}
			}
		},

		_setFocusNode: function(node) {
			var f = this._focus = this._focus || {};

			if (f.node !== node) {
				if (f.node) {
					event.off(f.evts);
					event.off(f.evtsMore);
				}
				f.node = node;
				f.evts = [
					on(node, 'focus', this, '_doBackground'),
					on(node, 'blur', this, '_doBackground')
				];
			}

			return node;
		},

		show: function() {
			this.visible = true;
		},

		hide: function() {
			this.visible = false;
		},

		animate: function(anim, callback) {
			return this._isAttachedToActiveWin() && Animation._play(this, anim && anim.declaredClass === 'Ti.UI.Animation' ? anim : new Animation(anim)).then(callback);
		},

		_setTouchEnabled: function(value) {
			var children = this._children,
				child,
				i = 0,
				len = children.length;
			setStyle(this.domNode, 'pointerEvents', value ? 'auto' : 'none');
			for (; i < len; i++) {
				child = children[i];
				child._setTouchEnabled(value && child.touchEnabled);
			}
		},

		_measuredLeft: 0,

		_measuredTop: 0,

		_measuredWidth: 0,

		_measuredHeight: 0,

		_measuredSandboxWidth: 0,

		_measuredSandboxHeight: 0,

		constants: {
			size: {
				get: function() {
					return {
						x: 0,
						y: 0,
						width: this._measuredWidth,
						height: this._measuredHeight
					};
				}
			},
			rect: {
				get: function() {
					return {
						x: this._measuredLeft,
						y: this._measuredTop,
						width: this._measuredWidth,
						height: this._measuredHeight
					};
				}
			},
			parent: function() {
				return this._parent;
			}
		},

		properties: {
			backgroundColor: postDoBackground,

			backgroundDisabledColor: postDoBackground,

			backgroundDisabledImage: postDoBackground,

			backgroundFocusedColor: postDoBackground,

			backgroundFocusedImage: postDoBackground,

			backgroundGradient: {
				set: function(value, oldValue) {

					// Type and colors are required
					if (!is(value.type,'String') || !is(value.colors,'Array') || value.colors.length < 2) {
						return;
					}

					// Vet the type and assign default values
					var type = value.type,
						startPoint = value.startPoint,
						endPoint = value.endPoint;
					if (type === 'linear') {
						if (!startPoint || !('x' in startPoint) || !('y' in startPoint)) {
							value.startPoint = {
								x: '0%',
								y: '50%'
							};
						}
						if (!endPoint || !('x' in endPoint) || !('y' in endPoint)) {
							value.endPoint = {
								x: '100%',
								y: '50%'
							};
						}
					} else if (type === 'radial') {
						if (!startPoint || !('x' in startPoint) || !('y' in startPoint)) {
							value.startPoint = {
								x: '50%',
								y: '50%'
							};
						}
					} else {
						return;
					}
					return value;
				},
				post: function() {
					this.backgroundGradient && this._computeGradient();
				}
			},

			backgroundImage: postDoBackground,

			backgroundRepeat: postDoBackground,

			backgroundSelectedColor: postDoBackground,

			backgroundSelectedImage: postDoBackground,

			borderColor: {
				set: function(value) {
					setStyle(this.domNode, 'borderColor', value);
					return value;
				}
			},

			borderRadius: {
				set: function(value) {
					setStyle(this.domNode, 'borderRadius', unitize(value));
					return value;
				},
				value: 0
			},

			borderWidth: {
				set: function(value, oldValue) {

					if (is(value,'Array')) {
						if (value.length !== 4) {
							return oldValue;
						}
						setStyle(this.domNode, {
							borderLeftWidth: (this._borderLeftWidth = value[0]) + pixelUnits,
							borderRightWidth: (this._borderRightWidth = value[1]) + pixelUnits,
							borderTopWidth: (this._borderTopWidth = value[2]) + pixelUnits,
							borderBottomWidth: (this._borderBottomWidth = value[3]) + pixelUnits
						});
						this._borderSet = true;
					} else if(isNaN(value)) {
						return oldValue;
					} else {
						setStyle(this.domNode, 'borderWidth', value + pixelUnits);
						this._borderLeftWidth = this._borderRightWidth = this._borderTopWidth = this._borderBottomWidth = value;
						this._borderSet = true;
					}
					return value;
				},
				post: postLayoutPropFunction,
				value: 0
			},

			bottom: postLayoutProp,

			bubbleParent: true,

			center: postLayoutProp,

			color: {
				set: function(value) {
					return setStyle(this.domNode, 'color', value);
				}
			},

			enabled: {
				post: '_doBackground',
				set: function(value) {
					this._focus.node.disabled = !value;
					return value;
				},
				value: true
			},

			focusable: {
				value: false,
				set: function(value) {
					dom.attr[value ? 'set' : 'remove'](this._focus.node, 'tabindex', 0);
					return value;
				}
			},

			_minHeight: postLayoutProp,

			_maxHeight: postLayoutProp,

			height: postLayoutProp,

			left: postLayoutProp,

			opacity: {
				set: function(value) {
					return setStyle(this.domNode, 'opacity', value);
				}
			},

			visible: {
				set: function(value, orig) {
					value = !!value;
					if (value !== orig) {
						!value && (this._lastDisplay = style.get(this.domNode, 'display'));
						setStyle(this.domNode, 'display', !!value ? this._lastDisplay || '' : 'none');
						value && orig !== void 0 && this._triggerLayout();
					}
					return value;
				}
			},

			right: postLayoutProp,

			touchEnabled: {
				set: function(value) {
					this._setTouchEnabled(value);
					return value;
				},
				value: true
			},

			top: postLayoutProp,

			transform: {
				set: function(value) {
					setStyle(this.domNode, 'transform', value && value.toCSS());
					return this._curTransform = value;
				}
			},

			_minWidth: postLayoutProp,

			_maxWidth: postLayoutProp,

			width: postLayoutProp,

			zIndex: postLayoutProp
		}

	});

});
},
"Ti/_/css":function(){
/* /titanium/Ti/_/css.js */

define(["Ti/_", "Ti/_/string"], function(_, string) {
	function processClass(node, cls, adding) {
		var i = 0, p,
			cn = " " + node.className + " ",
			cls = require.is(cls, "Array") ? cls : cls.split(" ");

		for (; i < cls.length; i++) {
			p = cn.indexOf(" " + cls[i] + " ");
			if (adding && p === -1) {
				cn += cls[i] + " ";
			} else if (!adding && p !== -1) {
				cn = cn.substring(0, p) + cn.substring(p + cls[i].length + 1);
			}
		}

		node.className = string.trim(cn);
	}

	return _.css = {
		add: function(node, cls) {
			processClass(node, cls, 1);
		},

		remove: function(node, cls) {
			processClass(node, cls);
		},

		clean: function(cls) {
			return cls.replace(/[^A-Za-z0-9\-]/g, "");
		}
	};
});
},
"Ti/UI/Animation":function(){
/* /titanium/Ti/UI/Animation.js */

/*global define, window, requestAnimationFrame*/
define(['Ti/_/declare', 'Ti/_/Evented', 'Ti/_/style', 'Ti/UI'], function(declare, Evented, style, UI) {

	var curves = [
			function easeInOut(n) {
				n *= 2;
				return n < 1 ? Math.pow(n, 2) / 2 : -1 * ((--n) * (n - 2) - 1) / 2;
			},
			function easeIn(n) {
				return Math.pow(n, 2);
			},
			function easeOut(n) {
				return n * (n - 2) * -1;
			},
			function linear(n) {
				return n;
			}
		],
		global = window,
		now = Date.now,
		on = require.on,
		lastTime = 0,
		prefixes = ['ms', 'moz', 'webkit', 'o'],
		i = prefixes.length,
		ignoreOptions = {
			autoreverse: 1,
			bottom: 1,
			center: 1,
			curve: 1,
			delay: 1,
			duration: 1,
			repeat: 1,
			right: 1,
			visible: 1,
			zIndex: 1
		},
		colorOptions = {
			backgroundColor: 1,
			color: 1
		},
		positionOptions = {
			height: 1,
			left: 1,
			opacity: 1,
			top: 1,
			width: 1
		},
		rgbaRegExp = /^rgba?\(([\s\.,0-9]+)\)/,
		threeDRegExp = /3d/,
		tiMatrixRegExp = /^Ti\.UI\.(2|3)DMatrix$/,
		matrixRegExp = /matrix(3d)?\(([^\)]*)/,
		rotateRegExp = /rotate(3d)?\(([^\)]*)/,
		needsRender,
		animations = {},
		transformName = style.discover('transform'),
		colors = require(require.config.ti.colorsModule),
		api = declare('Ti.UI.Animation', Evented, {
			properties: {
				autoreverse: void 0,
				backgroundColor: void 0,
				bottom: void 0,
				center: void 0,
				color: void 0,
				curve: void 0,
				delay: void 0,
				duration: void 0,
				height: void 0,
				left: void 0,
				opacity: void 0,
				repeat: void 0,
				right: void 0,
				top: void 0,
				transform: void 0,
				visible: void 0,
				width: void 0,
				zIndex: void 0
			}
		});

	while (--i >= 0 && !global.requestAnimationFrame) {
		global.requestAnimationFrame = global[prefixes[i] + 'RequestAnimationFrame'];
	}

	global.requestAnimationFrame || (global.requestAnimationFrame = function(callback) {
		var currTime = now(),
			timeToCall = Math.max(0, 16 - (currTime - lastTime)),
			timer = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
		lastTime = currTime + timeToCall;
		return timer;
	});

	function pump() {
		UI._layoutInProgress ? on.once(UI, 'postlayout', function() {
			requestAnimationFrame(render);
		}) : requestAnimationFrame(render);
	}

	function render() {
		var wid,
			anis,
			ani,
			elem,
			i,
			j,
			len,
			from,
			to,
			ts = now(),
			pct,
			progress,
			prop,
			val,
			vals;

		needsRender = 0;

		for (wid in animations) {
			for (anis = animations[wid], i = 0; i < anis.length; i++) {
				ani = anis[i];
				if (!ani.paused) {
					pct = ani.duration ? Math.min(1, (ts - ani.ts) / ani.duration) : 1;
					progress = curves[ani.curve](ani.forward ? pct : 1 - pct);
					elem = ani.elem;

					if (elem._isAttachedToActiveWin()) {
						for (prop in ani.props) {
							vals = ani.props[prop];
							from = vals[0];
							to = vals[1];

							pct === 1 && (val = ani.forward ? to : from);

							if (prop === 'transform') {
								if (pct !== 1) {
									val = [];
									len = from.length;
									for (j = 0; j < len; j++) {
										// for 3d matrices, indices 12-14 are normally [0, 0, 0, 1], but since they are
										// unused, we use them to store the rotation vector which we want to skip
										if (j < 12 || j > 14) {
											val[j] = from[j] + ((to[j] - from[j]) * progress);
										}
									}
									needsRender = 1;
								}

								if (val.length === 16) {
									j = val.splice(12);
									val = 'matrix3d(' + val.join(',') + ') rotate3d(' + j.join(',') + 'deg)';
								} else {
									j = val.pop();
									val = 'matrix(' + val.join(',') + ') rotate(' + j + 'deg)';
								}

								prop = transformName;

							} else if (colorOptions[prop]) {
								if (pct !== 1) {
									val = [];
									for (j = 0; j < 4; j++) {
										val[j] = Math.floor(from[j] + ((to[j] - from[j]) * progress));
									}
									needsRender = 1;
								}
								val = 'rgba(' + val.join(',') + ')';

							} else if (positionOptions[prop]) {
								if (pct !== 1) {
									val = from + ((to - from) * progress);
									needsRender = 1;
								}
								val = prop === 'opacity' ? val : val + 'px';
							}

							ani.prev !== val && (elem.domNode.style[prop] = val);
							ani.prev = val;
						}
					}

					if (pct === 1) {
						ani.ts = ts;
						if (ani.duration && ani.reverse && ani.forward) {
							ani.forward = 0;
							needsRender = 1;
						} else if (ani.repeat-- > 0) {
							needsRender = ani.forward = 1;
						} else {
							// we need to remove this animation before resolving
							anis.splice(i--, 1);
							ani.promise.resolve();
							if (!anis.length && !animations[wid].activeCount) {
								delete animations[wid];
							}
						}
					}
				}
			}
		}

		needsRender && pump();
	}

	function parseColor(color) {
		var i, bits, mask, result;

		color = color.trim().toLowerCase();

		if (color.charAt(0) === '#') {
			// hex
			bits = color.length == 4 ? 4 : 8;
			if (!isNaN(color = Number('0x' + color.substring(1)))) {
				mask = (1 << bits) - 1; // 15 or 255
				result = bits === 4 ? 17 : 1; // multiplier
				result = [((color >> bits * 2) & mask) * result, ((color >> bits) & mask) * result, (color & mask) * result, 1];
			}
		} else if (i = color.match(rgbaRegExp)) {
			// rgb, rbga
			result = i[1].split(/\s*,\s*/);
			for (i = 0; i < 3;) {
				result[i++] |= 0;
			}
		} else if (colors) {
			// named color
			result = colors[color];
		}

		if (result) {
			result[3] = isNaN(i = parseFloat(result[3])) ? 1 : Math.min(Math.max(i, 0), 1);
			return result;
		}
	}

	function parse3dMatrix(matrix, rotate, to, toType) {
		// this function parses an existing 2d or 3d tranform into a 3d matrix

		var is3d,
			params,
			len,
			i,
			from = [1, 0, 0, 0,
			        0, 1, 0, 0,
			        0, 0, 1, 0,
			        0, 0, 0, 0]; // m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, rx, ry, rz, r

		if (matrix) {
			is3d = matrix[1];
			params = matrix[2].split(',');
			len = params.length;

			if (is3d && len === 16) {
				for (i = 0; i < 12; i++) {
					from[i] = params[i];
				}
			} else if (!is3d && len === 6) {
				from[0] = params[0];
				from[1] = params[1];
				from[4] = params[2];
				from[5] = params[3];
				from[3] = params[4];
				from[7] = params[5];
			}
		}

		if (rotate) {
			is3d = rotate[1];
			params = rotate[2].split(',');
			len = params.length;

			if (is3d && len === 4) {
				for (i = 0; i < 4; i++) {
					from[12 + i] = params[i];
				}
			} else if (!is3d && len === 1) {
				from[14] = 1;
				from[15] = params[0];
			}
		}

		if (toType === 2) {
			// promote 2dmatrix "to" into a 3D array
			to = [to.a, to.b, 0, to.tx,
			      to.c, to.d, 0, to.ty,
			      0, 0, 1, 0,
			      0, 0, 1, to.rotation]; // m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, rx, ry, rz, r
		} else {
			// translate "to" into a 3D array
			to = [to.m11, to.m12, to.m13, to.m14,
			      to.m21, to.m22, to.m23, to.m24,
			      to.m31, to.m32, to.m33, to.m34,
			      to.rotationX, to.rotationY, to.rotationZ, to.rotation];
		}

		return [from, to];
	}

	api._play = function animationPlay(elem, anim) {
		var promise = new require.Promise,
			wid = elem.widgetId,
			id = Math.random() * 1e9 | 0,
			anis = animations[wid] = (animations[wid] || []),
			properties = anim.__values__.properties,
			delay = properties.delay | 0,
			visible = !!properties.visible,
			zIndex = properties.zIndex;

		anis.activeCount = ~~anis.activeCount + 1;

		function go() {

			if (!elem._alive || !elem._isAttachedToActiveWin()) {
				anis.activeCount--;
				return;
			}

			var i,
				len,
				props = {},
				prop,
				from,
				toType,
				to,
				tmp,
				params,
				matrix,
				rotate,
				layoutTo = elem._parent._layout.calculateAnimation(elem, anim);

			// get all animatable properties that are defined
			for (prop in properties) {
				to = properties[prop];
				if (!ignoreOptions[prop] && to !== void 0) {
					// see if we are already animating this element's property
					for (i = 0; i < anis.length; i++) {
						delete anis[i].props[prop];
						if (require.isEmpty(anis[i].props)) {
							anis.splice(i--, 1);
						}
					}

					from = style.get(elem.domNode, prop);

					if (colorOptions[prop]) {
						from = parseColor(from);
						to = parseColor(to);
						(from < to || to < from) && (props[prop] = [from, to]);
					} else if (positionOptions[prop]) {
						isNaN(from = parseFloat(from)) && prop === 'opacity' && (from = 1);
						to = prop in layoutTo ? layoutTo[prop] : to;
						from !== to && (props[prop] = [from, to]);
					} else if (prop === 'transform' && (toType = to.declaredClass.match(tiMatrixRegExp))) {
						toType = toType[1] | 0;

						matrix = from.match(matrixRegExp);
						rotate = from.match(rotateRegExp);

						if (threeDRegExp.test(from) || toType === 3) {
							tmp = parse3dMatrix(matrix, rotate, to, toType);
							from = tmp[0];
							to = tmp[1];
						} else if (toType === 2) {
							// parse "from" into 2D matrix
							from = [1, 0, 0, 1, 0, 0, 0]; // a, b, c, d, tx, ty, r

							if (matrix) {
								params = matrix[2].split(',');
								len = Math.min(6, params.length);
								for (i = 0; i < len; i++) {
									from[i] = parseFloat(params[i]);
								}
							}

							if (rotate) {
								params = rotate[2].split(',');
								params.length && (from[6] = parseFloat(params[0]));
							}

							// translate "to" into a 2D array
							to = [to.a, to.b, to.c, to.d, to.tx, to.ty, to.rotation];
							tmp = [from, to];
						}

						(from < to || to < from) && (props[prop] = tmp);
					}
				}
			}

			anis.push({
				id: id,
				elem: elem,
				promise: promise,
				props: props,
				ts: now(),
				reverse: !!properties.autoreverse,
				forward: 1,
				curve: Math.max(0, Math.min(curves.length - 1, properties.curve | 0)),
				duration: properties.duration | 0,
				repeat: !!properties.repeat
			});

			anim.fireEvent('start');

			if (!needsRender) {
				needsRender = 1;
				pump();
			}
		}

		setTimeout(go, delay || 0);

		function findAnimation() {
			var i = 0,
				len = anis && anis.length;
			for (; i < len; i++) {
				if (anis[i].id === id) {
					return anis[i];
				}
			}
		}

		promise.source = elem;

		promise.animation = anim;

		promise.pause = function() {
			var a = findAnimation();
			a = !!a && (a.paused || (a.paused = now()));
			anim.fireEvent('pause');
			return a;
		};

		promise.resume = function() {
			var a = findAnimation();

			if (a) {
				a.paused && (a.ts += (now() - a.paused));

				/*
				TODO: if the layout changes while an animation is paused,
				then we need to recalculate the layout prior to resuming.

				elem._parent._layout.calculateAnimation(elem, anim)
				for (prop in a.props) {
					//
				}
				*/

				if (!needsRender) {
					needsRender = 1;
					pump();
				}
			}

			a = !!a && !(a.paused = 0);

			anim.fireEvent('resume');

			return a;
		};

		promise.cancel = function(reset) {
			var ani,
				prop,
				node,
				i = 0,
				j = anis && anis.length,
				result = false;

			for (; i < j; i++) {
				if (anis[i].id === id) {
					ani = anis[i];

					if (reset) {
						node = ani.elem.domNode;
						for (prop in ani.props) {
							j = ani.props[prop][0];
							style.set(node, prop, positionOptions[prop] && prop !== 'opacity' ? j + 'px' : j);
						}
					}

					anis.splice(i, 1);
					if (!anis.length && !anis.activeCount) {
						delete animations[wid];
					}

					result = true;

					break;
				}
			}

			anis.activeCount--;
			anim.fireEvent('cancel');

			return result;
		};

		return promise.then(function() {
			properties.visible !== void 0 && (elem.visible = visible);
			properties.zIndex !== void 0 && (elem.zIndex = zIndex);

			// TODO: update View.rect here: TIMOB-8930

			anis.activeCount--;

			anim.fireEvent('complete');
		});
	};

	return api;

});

},
"Ti/_/Layouts":function(){
/* /titanium/Ti/_/Layouts.js */

define(
	["Ti/_/Layouts/Composite", "Ti/_/Layouts/Horizontal", "Ti/_/Layouts/Vertical", "Ti/_/Layouts/ConstrainingHorizontal", "Ti/_/Layouts/ConstrainingVertical"],
	function(Composite, Horizontal, Vertical, ConstrainingHorizontal, ConstrainingVertical) {

	return {
		Composite: Composite,
		Horizontal: Horizontal,
		Vertical: Vertical,
		
		// Mobile web specific layouts, used for internal controls
		ConstrainingHorizontal: ConstrainingHorizontal,
		ConstrainingVertical: ConstrainingVertical
	};

});
},
"Ti/_/Layouts/Composite":function(){
/* /titanium/Ti/_/Layouts/Composite.js */

/*global define*/
define(['Ti/_/Layouts/Base', 'Ti/_/declare', 'Ti/UI', 'Ti/_/lang'], function(Base, declare, UI, lang) {

	var isDef = lang.isDef,
		pixelUnits = 'px',
		round = Math.round;

	return declare('Ti._.Layouts.Composite', Base, {

		_doLayout: function(element, width, height, isWidthSize, isHeightSize) {
			var computedSize = {width: 0, height: 0},
				children = element._children,
				child,
				i = 0,
				layoutCoefficients,
				widthLayoutCoefficients, heightLayoutCoefficients, sandboxWidthLayoutCoefficients, sandboxHeightLayoutCoefficients, topLayoutCoefficients, leftLayoutCoefficients,
				minWidthLayoutCoefficients, minHeightLayoutCoefficients,
				childSize,
				measuredWidth, measuredHeight, measuredSandboxHeight, measuredSandboxWidth, measuredLeft, measuredTop,
				deferredLeftCalculations = [],
				deferredTopCalculations = [],
				len = children.length,
				measureNode = this._measureNode,
				style;

			// Calculate size and position for the children
			for(i = 0; i < len; i++) {

				child = element._children[i];
				if (!child._alive || !child.domNode) {
					this.handleInvalidState(child,element);
				} else {

					if (child._markedForLayout) {
						((child._preLayout && child._preLayout(width, height, isWidthSize, isHeightSize)) || child._needsMeasuring) && measureNode(child, child, child._layoutCoefficients, this);

						layoutCoefficients = child._layoutCoefficients;
						widthLayoutCoefficients = layoutCoefficients.width;
						minWidthLayoutCoefficients = layoutCoefficients.minWidth;
						heightLayoutCoefficients = layoutCoefficients.height;
						minHeightLayoutCoefficients = layoutCoefficients.minHeight;
						sandboxWidthLayoutCoefficients = layoutCoefficients.sandboxWidth;
						sandboxHeightLayoutCoefficients = layoutCoefficients.sandboxHeight;
						leftLayoutCoefficients = layoutCoefficients.left;
						topLayoutCoefficients = layoutCoefficients.top;

						measuredWidth = widthLayoutCoefficients.x1 * width + widthLayoutCoefficients.x2;
						minWidthLayoutCoefficients.x1 !== void 0 && (measuredWidth = Math.max(measuredWidth,
							minWidthLayoutCoefficients.x1 * width + minWidthLayoutCoefficients.x2));

						measuredHeight = heightLayoutCoefficients.x1 * height + heightLayoutCoefficients.x2;
						minHeightLayoutCoefficients.x1 !== void 0 && (measuredHeight = Math.max(measuredHeight,
							minHeightLayoutCoefficients.x1 * height + minHeightLayoutCoefficients.x2));

						if (child._getContentSize) {
							childSize = child._getContentSize(measuredWidth, measuredHeight);
						} else {
							childSize = child._layout._doLayout(
								child,
								isNaN(measuredWidth) ? width : measuredWidth - child._borderLeftWidth - child._borderRightWidth,
								isNaN(measuredHeight) ? height : measuredHeight - child._borderTopWidth - child._borderBottomWidth,
								isNaN(measuredWidth),
								isNaN(measuredHeight));
						}

						if (isNaN(measuredWidth)) {
							measuredWidth = childSize.width + child._borderLeftWidth + child._borderRightWidth;
							minWidthLayoutCoefficients.x1 !== void 0 && (measuredWidth = Math.max(measuredWidth,
								minWidthLayoutCoefficients.x1 * width + minWidthLayoutCoefficients.x2));
						}
						if (isNaN(measuredHeight)) {
							measuredHeight = childSize.height + child._borderTopWidth + child._borderBottomWidth;
							minHeightLayoutCoefficients.x1 !== void 0 && (measuredHeight = Math.max(measuredHeight,
								minHeightLayoutCoefficients.x1 * height + minHeightLayoutCoefficients.x2));
						}

						if (isWidthSize && leftLayoutCoefficients.x1 !== 0) {
							deferredLeftCalculations.push(child);
						} else {
							measuredLeft = leftLayoutCoefficients.x1 * width + leftLayoutCoefficients.x2 * measuredWidth + leftLayoutCoefficients.x3;
						}
						if (isHeightSize && topLayoutCoefficients.x1 !== 0) {
							deferredTopCalculations.push(child);
						} else {
							measuredTop = topLayoutCoefficients.x1 * height + topLayoutCoefficients.x2 * measuredHeight + topLayoutCoefficients.x3;
						}

						child._measuredSandboxWidth = measuredSandboxWidth = sandboxWidthLayoutCoefficients.x1 * height + sandboxWidthLayoutCoefficients.x2 + measuredWidth + (isNaN(measuredLeft) ? 0 : measuredLeft);
						child._measuredSandboxHeight = measuredSandboxHeight = sandboxHeightLayoutCoefficients.x1 * height + sandboxHeightLayoutCoefficients.x2 + measuredHeight + (isNaN(measuredTop) ? 0 : measuredTop);

						child._measuredWidth = measuredWidth;
						child._measuredHeight = measuredHeight;
						child._measuredLeft = measuredLeft;
						child._measuredTop = measuredTop;
					}

					// Update the size of the component
					child._measuredSandboxWidth > computedSize.width && (computedSize.width = child._measuredSandboxWidth);
					child._measuredSandboxHeight > computedSize.height && (computedSize.height = child._measuredSandboxHeight);
				}
			}

			// Second pass, if necessary, to determine the left/top values
			len = deferredLeftCalculations.length;
			for(i = 0; i < len; i++) {
				child = deferredLeftCalculations[i];
				leftLayoutCoefficients = child._layoutCoefficients.left;
				sandboxWidthLayoutCoefficients = child._layoutCoefficients.sandboxWidth;
				child._measuredLeft = measuredLeft = leftLayoutCoefficients.x1 * computedSize.width + leftLayoutCoefficients.x2 * measuredWidth + leftLayoutCoefficients.x3;
				child._measuredSandboxWidth = measuredSandboxWidth = sandboxWidthLayoutCoefficients.x1 * height + sandboxWidthLayoutCoefficients.x2 + child._measuredWidth + measuredLeft;

				// Update the size of the component
				measuredSandboxWidth = child._measuredSandboxWidth;
				measuredSandboxWidth > computedSize.width && (computedSize.width = measuredSandboxWidth);
			}
			len = deferredTopCalculations.length;
			for(i = 0; i < len; i++) {
				child = deferredTopCalculations[i];
				topLayoutCoefficients = child._layoutCoefficients.top;
				sandboxHeightLayoutCoefficients = child._layoutCoefficients.sandboxHeight;
				child._measuredTop = measuredTop = topLayoutCoefficients.x1 * computedSize.height + topLayoutCoefficients.x2 * measuredHeight + topLayoutCoefficients.x3;
				child._measuredSandboxHeight = measuredSandboxHeight = sandboxHeightLayoutCoefficients.x1 * height + sandboxHeightLayoutCoefficients.x2 + child._measuredHeight + measuredTop;

				// Update the size of the component
				measuredSandboxHeight = child._measuredSandboxHeight;
				measuredSandboxHeight > computedSize.height && (computedSize.height = measuredSandboxHeight);
			}

			// Position the children
			len = children.length;
			for(i = 0; i < len; i++) {
				child = children[i];
				if (child._markedForLayout) {
					UI._elementLayoutCount++;
					style = child.domNode.style;
					style.zIndex = child.zIndex;
					style.left = round(child._measuredLeft) + pixelUnits;
					style.top = round(child._measuredTop) + pixelUnits;
					style.width = round(child._measuredWidth - child._borderLeftWidth - child._borderRightWidth) + pixelUnits;
					style.height = round(child._measuredHeight - child._borderTopWidth - child._borderBottomWidth) + pixelUnits;
					child._markedForLayout = false;
					child.fireEvent('postlayout');
				}
			}

			return this._computedSize = computedSize;
		},

		_getWidth: function(node, width) {

			// Get the width or default width, depending on which one is needed
			!isDef(width) && (isDef(node.left) + isDef(node.center && node.center.x) + isDef(node.right) < 2) && (width = node._defaultWidth);

			// Check if the width is INHERIT, and if so fetch the inherited width
			if (width === UI.INHERIT) {
				if (node._parent._parent) {
					return node._parent._parent._layout._getWidth(node._parent, node._parent.width) === UI.SIZE ? UI.SIZE : UI.FILL;
				}
				// This is the root level content container, which we know has a width of FILL
				return UI.FILL;
			}
			return width;
		},

		_getHeight: function(node, height) {

			// Get the height or default height, depending on which one is needed
			!isDef(height) && (isDef(node.top) + isDef(node.center && node.center.y) + isDef(node.bottom) < 2) && (height = node._defaultHeight);

			// Check if the width is INHERIT, and if so fetch the inherited width
			if (height === UI.INHERIT) {
				if (node._parent._parent) {
					return node._parent._parent._layout._getHeight(node._parent, node._parent.height) === UI.SIZE ? UI.SIZE : UI.FILL;
				}
				// This is the root level content container, which we know has a width of FILL
				return UI.FILL;
			}
			return height;
		},

		_isDependentOnParent: function(node){
			var layoutCoefficients = node._layoutCoefficients;
			return (!isNaN(layoutCoefficients.width.x1) && layoutCoefficients.width.x1 !== 0) || // width
				(!isNaN(layoutCoefficients.height.x1) && layoutCoefficients.height.x1 !== 0) || // height
				layoutCoefficients.left.x1 !== 0 || // left
				layoutCoefficients.top.x1 !== 0; // top
		},

		_doAnimationLayout: function(node, animationCoefficients) {

			var parentWidth = node._parent._measuredWidth,
				parentHeight = node._parent._measuredHeight,
				width = animationCoefficients.width.x1 * parentWidth + animationCoefficients.width.x2,
				height = animationCoefficients.height.x1 * parentHeight + animationCoefficients.height.x2;

			return {
				width: width,
				height: height,
				left: animationCoefficients.left.x1 * parentWidth + animationCoefficients.left.x2 * width + animationCoefficients.left.x3,
				top: animationCoefficients.top.x1 * parentHeight + animationCoefficients.top.x2 * height + animationCoefficients.top.x3
			};
		},

		_measureNode: function(node, layoutProperties, layoutCoefficients, self) {

			node._needsMeasuring = false;

			// Pre-processing
			var getValueType = self.getValueType,
				computeValue = self.computeValue,

				width = self._getWidth(node, layoutProperties.width),
				widthType = getValueType(width),
				widthValue = computeValue(width, widthType),

				minWidth = layoutProperties._minWidth,
				minWidthType = getValueType(minWidth),
				minWidthValue = computeValue(minWidth, minWidthType),

				height = self._getHeight(node, layoutProperties.height),
				heightType = getValueType(height),
				heightValue = computeValue(height, heightType),

				minHeight = layoutProperties._minHeight,
				minHeightType = getValueType(minHeight),
				minHeightValue = computeValue(minHeight, minHeightType),

				left = layoutProperties.left,
				leftType = getValueType(left),
				leftValue = computeValue(left, leftType),

				centerX = layoutProperties.center && layoutProperties.center.x,
				centerXType = getValueType(centerX),
				centerXValue = computeValue(centerX, centerXType),

				right = layoutProperties.right,
				rightType = getValueType(right),
				rightValue = computeValue(right, rightType),

				top = layoutProperties.top,
				topType = getValueType(top),
				topValue = computeValue(top, topType),

				centerY = layoutProperties.center && layoutProperties.center.y,
				centerYType = getValueType(centerY),
				centerYValue = computeValue(centerY, centerYType),

				bottom = layoutProperties.bottom,
				bottomType = getValueType(bottom),
				bottomValue = computeValue(bottom, bottomType),

				x1, x2, x3,

				sandboxWidthLayoutCoefficients = layoutCoefficients.sandboxWidth,
				sandboxHeightLayoutCoefficients = layoutCoefficients.sandboxHeight,

				// Width/height rule evaluation
				paramsSet = [
					[widthType, widthValue, leftType, leftValue, centerXType, centerXValue, rightType, rightValue],
					[heightType, heightValue, topType, topValue, centerYType, centerYValue, bottomType, bottomValue]
				],
				params, sizeType, sizeValue, startType, startValue, centerType, centerValue, endType, endValue,
				i = 0,
				type;
			for (; i < 2; i++) {

				params = paramsSet[i];
				sizeType = params[0];
				sizeValue = params[1];
				startType = params[2];
				startValue = params[3];
				centerType = params[4];
				centerValue = params[5];
				endType = params[6];
				endValue = params[7];

				x1 = x2 = 0;
				if (sizeType === UI.SIZE) {
					x1 = x2 = NaN;
				} else if (sizeType === UI.FILL) {
					x1 = 1;
					if (startType === '%') {
						x1 -= startValue;
					} else if (startType === '#') {
						x2 = -startValue;
					} else if (endType === '%') {
						x1 -= endValue;
					} else if (endType === '#') {
						x2 = -endValue;
					}
				} else if (sizeType === '%') {
					x1 = sizeValue;
				} else if (sizeType === '#') {
					x2 = sizeValue;
				} else if (startType === '%') {
					if (centerType === '%') {
						x1 = 2 * (centerValue - startValue);
					} else if (centerType === '#') {
						x1 = -2 * startValue;
						x2 = 2 * centerValue;
					} else if (endType === '%') {
						x1 = 1 - startValue - endValue;
					} else if (endType === '#') {
						x1 = 1 - startValue;
						x2 = -endValue;
					}
				} else if (startType === '#') {
					if (centerType === '%') {
						x1 = 2 * centerValue;
						x2 = -2 * startValue;
					} else if (centerType === '#') {
						x2 = 2 * (centerValue - startValue);
					} else if (endType === '%') {
						x1 = 1 - endValue;
						x2 = -startValue;
					} else if (endType === '#') {
						x1 = 1;
						x2 = -endValue - startValue;
					}
				} else if (centerType === '%') {
					if (endType === '%') {
						x1 = 2 * (endValue - centerValue);
					} else if (endType === '#') {
						x1 = -2 * centerValue;
						x2 = 2 * endValue;
					}
				} else if (centerType === '#') {
					if (endType === '%') {
						x1 = 2 * endValue;
						x2 = -2 * centerValue;
					} else if (endType === '#') {
						x2 = 2 * (endValue - centerValue);
					}
				}
				layoutCoefficients[type = i === 0 ? 'width' : 'height'].x1 = x1;
				layoutCoefficients[type].x2 = x2;
			}

			// Min width/height rule evaluation
			paramsSet = {
				minWidth: [minWidthType, minWidthValue, leftType, leftValue, centerXType, centerXValue, rightType, rightValue],
				minHeight: [minHeightType, minHeightValue, topType, topValue, centerYType, centerYValue, bottomType, bottomValue]
			};
			for (i in paramsSet) {

				params = paramsSet[i];
				sizeType = params[0];
				sizeValue = params[1];
				startType = params[2];
				startValue = params[3];
				centerType = params[4];
				centerValue = params[5];
				endType = params[6];
				endValue = params[7];

				x1 = x2 = x3 = 0;
				if (sizeType === UI.SIZE) {
					x1 = x2 = NaN;
				} else if (sizeType === UI.FILL) {
					x1 = 1;
					if (startType === '%') {
						x1 -= startValue;
					} else if (startType === '#') {
						x2 = -startValue;
					} else if (endType === '%') {
						x1 -= endValue;
					} else if (endType === '#') {
						x2 = -endValue;
					}
				} else if (sizeType === '%') {
					x1 = sizeValue;
				} else if (sizeType === '#') {
					x2 = sizeValue;
				} else {
					x1 = x2 = x3 = void 0;
				}
				layoutCoefficients[i].x1 = x1;
				layoutCoefficients[i].x2 = x2;
				layoutCoefficients[i].x3 = x3;
			}

			// Left/top rule evaluation
			paramsSet = [
				[leftType, leftValue, centerXType, centerXValue, rightType, rightValue],
				[topType, topValue, centerYType, centerYValue, bottomType, bottomValue]
			];
			for (i = 0; i < 2; i++) {

				params = paramsSet[i];
				startType = params[0];
				startValue = params[1];
				centerType = params[2];
				centerValue = params[3];
				endType = params[4];
				endValue = params[5];

				x1 = x2 = x3 = 0;
				if (startType === '%') {
					x1 = startValue;
				} else if(startType === '#') {
					x3 = startValue;
				} else if (centerType === '%') {
					x1 = centerValue;
					x2 = -0.5;
				} else if (centerType === '#') {
					x2 = -0.5;
					x3 = centerValue;
				} else if (endType === '%') {
					x1 = 1 - endValue;
					x2 = -1;
				} else if (endType === '#') {
					x1 = 1;
					x2 = -1;
					x3 = -endValue;
				} else {
					switch(i === 'left' ? self._defaultHorizontalAlignment : self._defaultVerticalAlignment) {
						case 'center':
							x1 = 0.5;
							x2 = -0.5;
							break;
						case 'end':
							x1 = 1;
							x2 = -1;
					}
				}
				layoutCoefficients[type = i === 0 ? 'left' : 'top'].x1 = x1;
				layoutCoefficients[type].x2 = x2;
				layoutCoefficients[type].x3 = x3;
			}

			// Sandbox width/height rule evaluation
			sandboxWidthLayoutCoefficients.x1 = rightType === '%' ? rightValue : 0;
			sandboxWidthLayoutCoefficients.x2 = rightType === '#' ? rightValue : 0;
			sandboxHeightLayoutCoefficients.x1 = bottomType === '%' ? bottomValue : 0;
			sandboxHeightLayoutCoefficients.x2 = bottomType === '#' ? bottomValue : 0;
		},

		_defaultHorizontalAlignment: 'center',

		_defaultVerticalAlignment: 'center'

	});

});

},
"Ti/_/Layouts/Base":function(){
/* /titanium/Ti/_/Layouts/Base.js */

/*global define*/
define(['Ti/_/css', 'Ti/_/declare', 'Ti/_/style', 'Ti/_/lang', 'Ti/API', 'Ti/UI', 'Ti/_', 'Ti/_/dom'],
	function(css, declare, style, lang, API, UI, _, dom) {

	return declare('Ti._.Layouts.Base', null, {

		computedSize: {width: 0, height: 0},

		constructor: function(args) {
			css.add(args.element.domNode, css.clean(this.declaredClass));
		},

		destroy: function() {
			css.remove(this.element.domNode, css.clean(this.declaredClass));
		},

		handleInvalidState: function(child, parent) {
			API.debug('WARNING: Attempting to layout element that has been destroyed.\n\t Removing the element from the parent.\n\t The parent has a widget ID of ' + parent.widgetId + '.');
			var children = parent._children;
			children.splice(children.indexOf(child),1);
		},

		getValueType: function(value) {
			if (value !== void 0) {
				if (value === UI.SIZE || value === UI.FILL) {
					return value;
				}
				return ~(value + '').indexOf('%') ? '%' : '#';
			}
		},

		/*
		calculateAnimation: function(node, animation) {
			var val = lang.val,
				animationCoefficients = node._animationCoefficients,
				center,
				results,
				pixelUnits = 'px';

			(node.center || animation.center) && (center = {});
			if (center) {
				center.x = val(animation.center && animation.center.x, node.center && node.center.x);
				center.y = val(animation.center && animation.center.y, node.center && node.center.y);
			}

			!animationCoefficients && (animationCoefficients = node._animationCoefficients = {
				width: {},
				minWidth: {},
				sandboxWidth: {},
				height: {},
				minHeight: {},
				sandboxHeight: {},
				left: {},
				top: {}
			});

			this._measureNode(node, {
				left: val(animation.left,node.left),
				right: val(animation.right,node.right),
				top: val(animation.top,node.top),
				bottom: val(animation.bottom,node.bottom),
				center: center,
				width: val(animation.width,node.width),
				minWidth: node.minWidth,
				minHeight: node.minHeight,
				height: val(animation.height,node.height)
			},animationCoefficients, this);

			results = this._doAnimationLayout(node, animationCoefficients);

			style.set(node.domNode, {
				zIndex: node.zIndex | 0,
				left: Math.round(results.left) + pixelUnits,
				top: Math.round(results.top) + pixelUnits,
				width: Math.round(results.width - node._borderLeftWidth - node._borderRightWidth) + pixelUnits,
				height: Math.round(results.height - node._borderTopWidth - node._borderBottomWidth) + pixelUnits
			});
		},
		*/

		calculateAnimation: function(elem, animation) {
			var val = lang.val,
				animationCoefficients = elem._animationCoefficients || (elem._animationCoefficients = {
					height: {},
					left: {},
					minWidth: {},
					sandboxWidth: {},
					minHeight: {},
					sandboxHeight: {},
					top: {},
					width: {}
				}),
				results = {};

			this._measureNode(elem, {
				left: val(animation.left, elem.left),
				right: val(animation.right, elem.right),
				top: val(animation.top, elem.top),
				bottom: val(animation.bottom, elem.bottom),
				center: (elem.center || animation.center) && {
					x: val(animation.center && animation.center.x, elem.center && elem.center.x),
					y: val(animation.center && animation.center.y, elem.center && elem.center.y)
				},
				width: val(animation.width, elem.width),
				minWidth: elem.minWidth,
				minHeight: elem.minHeight,
				height: val(animation.height, elem.height)
			}, animationCoefficients, this);

			results = this._doAnimationLayout(elem, animationCoefficients);

			return {
				left: results.left,
				top: results.top,
				width: results.width - elem._borderLeftWidth - elem._borderRightWidth,
				height: results.height - elem._borderTopWidth - elem._borderBottomWidth
			};
		},

		computeValue: function(dimension, valueType) {
			if (valueType === '%') {
				return parseFloat(dimension) / 100;
			}
			if (valueType === '#') {
				return dom.computeSize(dimension);
			}
		}

	});

});
},
"Ti/_/Layouts/Horizontal":function(){
/* /titanium/Ti/_/Layouts/Horizontal.js */

/*global define*/
define(['Ti/_/Layouts/Base', 'Ti/_/declare', 'Ti/API', 'Ti/UI', 'Ti/_/lang'],
	function(Base, declare, API, UI, lang) {

	var isDef = lang.isDef,
		round = Math.round,
		floor = Math.floor,
		ceil = Math.ceil;

	return declare('Ti._.Layouts.Horizontal', Base, {

		_doLayout: function(element, width, height, isWidthSize, isHeightSize) {
			var computedSize = {width: 0, height: 0},
				children = element._children,
				child,
				i = 0, j,
				layoutCoefficients,
				widthLayoutCoefficients, heightLayoutCoefficients, sandboxWidthLayoutCoefficients, sandboxHeightLayoutCoefficients, topLayoutCoefficients, leftLayoutCoefficients,
				childSize,
				measuredWidth, measuredHeight, measuredSandboxHeight, measuredSandboxWidth, measuredLeft, measuredTop,
				pixelUnits = 'px',
				runningHeight = 0, runningWidth = 0,
				rows = [[]], row,
				rowHeights = [], rowHeight,
				deferredTopCalculations = [],
				verticalAlignmentOffset = 0,
				len = children.length, rowLen,
				measureNode = this._measureNode,
				nodeStyle;

			// Calculate horizontal size and position for the children
			for(i = 0; i < len; i++) {

				child = element._children[i];
				if (!child._alive || !child.domNode) {
					this.handleInvalidState(child,element);
				} else {

					child._measuredRunningWidth = runningWidth;

					if (child._markedForLayout) {
						((child._preLayout && child._preLayout(width, height, isWidthSize, isHeightSize)) || child._needsMeasuring) && measureNode(child, child, child._layoutCoefficients, this);

						layoutCoefficients = child._layoutCoefficients;
						widthLayoutCoefficients = layoutCoefficients.width;
						heightLayoutCoefficients = layoutCoefficients.height;
						sandboxWidthLayoutCoefficients = layoutCoefficients.sandboxWidth;
						leftLayoutCoefficients = layoutCoefficients.left;

						measuredWidth = widthLayoutCoefficients.x1 * width + widthLayoutCoefficients.x2 * (width - runningWidth) + widthLayoutCoefficients.x3;
						measuredHeight = heightLayoutCoefficients.x2 === 0 ? heightLayoutCoefficients.x1 * height + heightLayoutCoefficients.x3 : NaN;

						if (isNaN(measuredWidth) || isNaN(heightLayoutCoefficients.x1)) {
							if (child._getContentSize) {
								childSize = child._getContentSize(measuredWidth, measuredHeight);
							} else {
								childSize = child._layout._doLayout(
									child,
									isNaN(measuredWidth) ? width : measuredWidth - child._borderLeftWidth - child._borderRightWidth,
									isNaN(measuredHeight) ? height : measuredHeight - child._borderTopWidth - child._borderBottomWidth,
									isNaN(measuredWidth),
									isNaN(measuredHeight));
							}
							isNaN(measuredWidth) && (measuredWidth = childSize.width + child._borderLeftWidth + child._borderRightWidth);
							isNaN(heightLayoutCoefficients.x1) && (measuredHeight = childSize.height + child._borderTopWidth + child._borderBottomWidth);

							child._childrenLaidOut = true;
							if (heightLayoutCoefficients.x2 !== 0 && !isNaN(heightLayoutCoefficients.x2)) {
								API.warn('Child of width SIZE and height FILL detected in a horizontal layout. Performance degradation may occur.');
								child._childrenLaidOut = false;
							}
						} else {
							child._childrenLaidOut = false;
						}
						child._measuredWidth = measuredWidth;
						child._measuredHeight = measuredHeight;

						measuredSandboxWidth = child._measuredSandboxWidth = sandboxWidthLayoutCoefficients.x1 * width + sandboxWidthLayoutCoefficients.x2 + measuredWidth;

						measuredLeft = leftLayoutCoefficients.x1 * width + leftLayoutCoefficients.x2 + runningWidth;
						if (!isWidthSize && floor(measuredSandboxWidth + runningWidth) > ceil(width)) {
							rows.push([]);
							measuredLeft -= runningWidth;
							runningWidth = 0;
						}
						child._measuredLeft = measuredLeft;
						rows[rows.length - 1].push(child);
						runningWidth += measuredSandboxWidth;
					}
					runningWidth > computedSize.width && (computedSize.width = runningWidth);
				}
			}

			// Calculate vertical size and position for the children
			len = rows.length;
			for(i = 0; i < len; i++) {
				row = rows[i];
				rowHeight = 0;
				rowLen = row.length;
				for (j = 0; j < rowLen; j++) {
					child = row[j];

					if (child._markedForLayout) {
						layoutCoefficients = child._layoutCoefficients;
						topLayoutCoefficients = layoutCoefficients.top;
						heightLayoutCoefficients = layoutCoefficients.height;
						sandboxHeightLayoutCoefficients = layoutCoefficients.sandboxHeight;
						measuredHeight = child._measuredHeight;
						isNaN(measuredHeight) && (child._measuredHeight = measuredHeight = heightLayoutCoefficients.x1 *
							height + heightLayoutCoefficients.x2 * (height - runningHeight) + heightLayoutCoefficients.x3);

						if (!child._childrenLaidOut) {
							measuredWidth = child._measuredWidth;
							child._childrenLaidOut = true;
							child._layout._doLayout(
								child,
								isNaN(measuredWidth) ? width : measuredWidth - child._borderLeftWidth - child._borderRightWidth,
								isNaN(measuredHeight) ? height : measuredHeight - child._borderTopWidth - child._borderBottomWidth,
								isNaN(measuredWidth),
								isNaN(measuredHeight));
						}

						if (topLayoutCoefficients.x2 !== 0) {
							deferredTopCalculations.push(child);
							measuredTop = runningHeight; // Temporary for use in calculating row height
						} else {
							child._measuredTop = measuredTop = topLayoutCoefficients.x1 * height +
								topLayoutCoefficients.x3 * measuredHeight + topLayoutCoefficients.x4 + runningHeight;
						}

						child._measuredSandboxHeight = measuredSandboxHeight = sandboxHeightLayoutCoefficients.x1 * height + sandboxHeightLayoutCoefficients.x2 + measuredHeight + measuredTop - runningHeight;
						rowHeight < measuredSandboxHeight && (rowHeight = measuredSandboxHeight);
					}
				}
				rowHeights.push(rowHeight);
				runningHeight += rowHeight;
			}

			// Second pass, if necessary, to determine the top values
			runningHeight = 0;
			len = rows.length;
			for(i = 0; i < len; i++) {
				row = rows[i];
				rowHeight = rowHeights[i];
				rowLen = row.length;
				for (j = 0; j < rowLen; j++) {
					child = row[j];
					child._measuredRunningHeight = runningHeight;
					child._measuredRowHeight = rowHeight;
					if (~deferredTopCalculations.indexOf(child) && child._markedForLayout) {
						measuredHeight = child._measuredHeight;
						topLayoutCoefficients = child._layoutCoefficients.top;
						child._measuredTop = topLayoutCoefficients.x1 * height + topLayoutCoefficients.x2 * rowHeight + topLayoutCoefficients.x3 * measuredHeight + topLayoutCoefficients.x4 + runningHeight;
					}
				}
				runningHeight += rowHeight;
			}
			computedSize.height = runningHeight;

			// Calculate the alignment offset (mobile web specific)
			if(!isHeightSize) {
				switch(this._defaultVerticalAlignment) {
					case 'end':
						verticalAlignmentOffset = height - runningHeight;
					case 'center':
						verticalAlignmentOffset /= 2;
				}
			}

			// Position the children
			len = children.length;
			for(i = 0; i < len; i++) {
				child = children[i];
				if (child._markedForLayout) {
					UI._elementLayoutCount++;
					child = children[i];
					nodeStyle = child.domNode.style;
					nodeStyle.zIndex = child.zIndex;
					nodeStyle.left = round(child._measuredLeft) + pixelUnits;
					nodeStyle.top = round(child._measuredTop) + pixelUnits;
					nodeStyle.width = round(child._measuredWidth - child._borderLeftWidth - child._borderRightWidth) + pixelUnits;
					nodeStyle.height = round(child._measuredHeight - child._borderTopWidth - child._borderBottomWidth) + pixelUnits;
					child._markedForLayout = false;
					child.fireEvent('postlayout');
				}
			}

			return this._computedSize = computedSize;
		},

		_getWidth: function(node, width) {

			// Get the width or default width, depending on which one is needed
			!isDef(width) && (width = node._defaultWidth);

			// Check if the width is INHERIT, and if so fetch the inherited width
			if (width === UI.INHERIT) {
				if (node._parent._parent) {
					return node._parent._parent._layout._getWidth(node._parent, node._parent.width) === UI.SIZE ? UI.SIZE : UI.FILL;
				}
				// This is the root level content container, which we know has a width of FILL
				return UI.FILL;
			}
			return width;
		},

		_getHeight: function(node, height) {

			// Get the height or default height, depending on which one is needed
			!isDef(height) && (height = node._defaultHeight);

			// Check if the width is INHERIT, and if so fetch the inherited width
			if (height === UI.INHERIT) {
				if (node._parent._parent) {
					return node._parent._parent._layout._getHeight(node._parent, node._height) === UI.SIZE ? UI.SIZE : UI.FILL;
				}
				// This is the root level content container, which we know has a width of FILL
				return UI.FILL;
			}
			return height;
		},

		_isDependentOnParent: function(node){
			var layoutCoefficients = node._layoutCoefficients;
			return (!isNaN(layoutCoefficients.width.x1) && layoutCoefficients.width.x1 !== 0) ||
				(!isNaN(layoutCoefficients.width.x2) && layoutCoefficients.width.x2 !== 0) || // width
				(!isNaN(layoutCoefficients.height.x1) && layoutCoefficients.height.x1 !== 0) ||
				(!isNaN(layoutCoefficients.height.x2) && layoutCoefficients.height.x2 !== 0) || // height
				layoutCoefficients.sandboxWidth.x1 !== 0 || // sandbox width
				layoutCoefficients.sandboxHeight.x1 !== 0 || // sandbox height
				layoutCoefficients.left.x1 !== 0 || // left
				layoutCoefficients.top.x1 !== 0; // top
		},

		_doAnimationLayout: function(node, animationCoefficients) {

			var parentWidth = node._parent._measuredWidth,
				parentHeight = node._parent._measuredHeight,
				nodeHeight = node._measuredHeight,
				runningWidth = node._measuredRunningWidth,
				runningHeight = node._measuredRunningHeight,
				rowHeight = node._measuredRowHeight;

			return {
				width: animationCoefficients.width.x1 * parentWidth + animationCoefficients.width.x2 * (parentWidth - runningWidth) + animationCoefficients.width.x3,
				height: animationCoefficients.height.x1 * parentHeight + animationCoefficients.height.x2 * (parentHeight - runningHeight) + animationCoefficients.height.x3,
				left: animationCoefficients.left.x1 * parentWidth + animationCoefficients.left.x2  + runningWidth,
				top: animationCoefficients.top.x1 * parentHeight + animationCoefficients.top.x2 * rowHeight + animationCoefficients.top.x3 * nodeHeight + animationCoefficients.top.x4 + runningHeight
			};
		},

		_measureNode: function(node, layoutProperties, layoutCoefficients, self) {

			node._needsMeasuring = false;

			// Pre-processing
			var getValueType = self.getValueType,
				computeValue = self.computeValue,

				width = self._getWidth(node, layoutProperties.width),
				widthType = getValueType(width),
				widthValue = computeValue(width, widthType),

				height = self._getHeight(node, layoutProperties.height),
				heightType = getValueType(height),
				heightValue = computeValue(height, heightType),

				left = layoutProperties.left,
				leftType = getValueType(left),
				leftValue = computeValue(left, leftType),

				right = layoutProperties.right,
				rightType = getValueType(right),
				rightValue = computeValue(right, rightType),

				top = layoutProperties.top,
				topType = getValueType(top),
				topValue = computeValue(top, topType),

				bottom = layoutProperties.bottom,
				bottomType = getValueType(bottom),
				bottomValue = computeValue(bottom, bottomType),

				x1, x2, x3, x4,

				widthLayoutCoefficients = layoutCoefficients.width,
				heightLayoutCoefficients = layoutCoefficients.height,
				sandboxWidthLayoutCoefficients = layoutCoefficients.sandboxWidth,
				sandboxHeightLayoutCoefficients = layoutCoefficients.sandboxHeight,
				leftLayoutCoefficients = layoutCoefficients.left,
				topLayoutCoefficients = layoutCoefficients.top;

			// Width rule calculation
			x1 = x2 = x3 = 0;
			if (widthType === UI.SIZE) {
				x1 = x2 = x3 = NaN;
			} else if (widthType === UI.FILL) {
				x2 = 1;
				leftType === '%' && (x1 = -leftValue);
				leftType === '#' && (x3 = -leftValue);
				rightType === '%' && (x1 = -rightValue);
				rightType === '#' && (x3 = -rightValue);
			} else if (widthType === '%') {
				x1 = widthValue;
			} else if (widthType === '#') {
				x3 = widthValue;
			}
			widthLayoutCoefficients.x1 = x1;
			widthLayoutCoefficients.x2 = x2;
			widthLayoutCoefficients.x3 = x3;

			// Sandbox width rule calculation
			x1 = x2 = 0;
			leftType === '%' && (x1 = leftValue);
			leftType === '#' && (x2 = leftValue);
			rightType === '%' && (x1 += rightValue);
			rightType === '#' && (x2 += rightValue);
			sandboxWidthLayoutCoefficients.x1 = x1;
			sandboxWidthLayoutCoefficients.x2 = x2;

			// Height rule calculation
			x1 = x2 = x3 = 0;
			if (heightType === UI.SIZE) {
				x1 = x2 = x3 = NaN;
			} else if (heightType === UI.FILL) {
				x2 = 1;
				topType === '%' && (x1 = -topValue);
				topType === '#' && (x3 = -topValue);
			} else if (heightType === '%') {
				x1 = heightValue;
			} else if (heightType === '#') {
				x3 = heightValue;
			}
			heightLayoutCoefficients.x1 = x1;
			heightLayoutCoefficients.x2 = x2;
			heightLayoutCoefficients.x3 = x3;

			// Sandbox height rule calculation
			sandboxHeightLayoutCoefficients.x1 = bottomType === '%' ? bottomValue : 0;
			sandboxHeightLayoutCoefficients.x2 = bottomType === '#' ? bottomValue : 0;

			// Left rule calculation
			leftLayoutCoefficients.x1 = leftType === '%' ? leftValue : 0;
			leftLayoutCoefficients.x2 = leftType === '#' ? leftValue : 0;

			// Top rule calculation
			x1 = x2 = x3 = x4 = 0;
			if (topType === '%') {
				x1 = topValue;
			} else if(topType === '#') {
				x4 = topValue;
			} else if(bottomType === '%') {
				x1 = 1 - bottomValue;
				x3 = -1;
			} else if(bottomType === '#') {
				x1 = 1;
				x3 = -1;
				x4 = -bottomValue;
			} else {
				switch(self._defaultRowAlignment) {
					case 'center':
						x2 = 0.5;
						x3 = -0.5;
						break;
					case 'end':
						x2 = 1;
						x3 = -1;
				}
			}
			topLayoutCoefficients.x1 = x1;
			topLayoutCoefficients.x2 = x2;
			topLayoutCoefficients.x3 = x3;
			topLayoutCoefficients.x4 = x4;
		},

		_defaultHorizontalAlignment: 'start',

		_defaultVerticalAlignment: 'start',

		_defaultRowAlignment: 'center'

	});

});

},
"Ti/_/Layouts/Vertical":function(){
/* /titanium/Ti/_/Layouts/Vertical.js */

/*global define*/
define(['Ti/_/Layouts/Base', 'Ti/_/declare', 'Ti/UI', 'Ti/_/lang'], function(Base, declare, UI, lang) {

	var isDef = lang.isDef,
		round = Math.round;

	return declare('Ti._.Layouts.Vertical', Base, {

		_doLayout: function(element, width, height, isWidthSize, isHeightSize) {
			var computedSize = {width: 0, height: 0},
				children = element._children,
				child,
				i = 0,
				layoutCoefficients,
				widthLayoutCoefficients, heightLayoutCoefficients, sandboxWidthLayoutCoefficients, sandboxHeightLayoutCoefficients, topLayoutCoefficients, leftLayoutCoefficients,
				childSize,
				measuredWidth, measuredHeight, measuredSandboxHeight, measuredSandboxWidth, measuredLeft,
				pixelUnits = 'px',
				deferredLeftCalculations = [],
				runningHeight = 0,
				len = children.length,
				measureNode = this._measureNode,
				style;

			// Calculate size and position for the children
			for(i = 0; i < len; i++) {

				child = element._children[i];
				if (!child._alive || !child.domNode) {
					this.handleInvalidState(child,element);
				} else {

					child._measuredRunningHeight = runningHeight;

					if (child._markedForLayout) {
						((child._preLayout && child._preLayout(width, height, isWidthSize, isHeightSize)) || child._needsMeasuring) && measureNode(child, child, child._layoutCoefficients, this);

						layoutCoefficients = child._layoutCoefficients;
						widthLayoutCoefficients = layoutCoefficients.width;
						heightLayoutCoefficients = layoutCoefficients.height;
						sandboxWidthLayoutCoefficients = layoutCoefficients.sandboxWidth;
						sandboxHeightLayoutCoefficients = layoutCoefficients.sandboxHeight;
						leftLayoutCoefficients = layoutCoefficients.left;
						topLayoutCoefficients = layoutCoefficients.top;

						measuredWidth = widthLayoutCoefficients.x1 * width + widthLayoutCoefficients.x2;
						measuredHeight = heightLayoutCoefficients.x1 * height + heightLayoutCoefficients.x2 * (height - runningHeight) + heightLayoutCoefficients.x3;

						if (child._getContentSize) {
							childSize = child._getContentSize(measuredWidth, measuredHeight);
						} else {
							childSize = child._layout._doLayout(
								child,
								isNaN(measuredWidth) ? width : measuredWidth - child._borderLeftWidth - child._borderRightWidth,
								isNaN(measuredHeight) ? height : measuredHeight - child._borderTopWidth - child._borderBottomWidth,
								isNaN(measuredWidth),
								isNaN(measuredHeight));
						}
						isNaN(measuredWidth) && (measuredWidth = childSize.width + child._borderLeftWidth + child._borderRightWidth);
						isNaN(measuredHeight) && (measuredHeight = childSize.height + child._borderTopWidth + child._borderBottomWidth);
						child._measuredWidth = measuredWidth;
						child._measuredHeight = measuredHeight;

						if (isWidthSize && leftLayoutCoefficients.x1 !== 0) {
							deferredLeftCalculations.push(child);
						} else {
							measuredLeft = child._measuredLeft = leftLayoutCoefficients.x1 * width + leftLayoutCoefficients.x2 * measuredWidth + leftLayoutCoefficients.x3;
							measuredSandboxWidth = child._measuredSandboxWidth = sandboxWidthLayoutCoefficients.x1 * width + sandboxWidthLayoutCoefficients.x2 + measuredWidth + (isNaN(measuredLeft) ? 0 : measuredLeft);
						}
						child._measuredTop = topLayoutCoefficients.x1 * height + topLayoutCoefficients.x2 + runningHeight;

						measuredSandboxHeight = child._measuredSandboxHeight = sandboxHeightLayoutCoefficients.x1 * height + sandboxHeightLayoutCoefficients.x2 + measuredHeight;
					}
					child._measuredSandboxWidth > computedSize.width && (computedSize.width = child._measuredSandboxWidth);
					runningHeight = (computedSize.height += child._measuredSandboxHeight);
				}
			}

			// Calculate the preliminary sandbox widths (missing left, since one of these widths may end up impacting all the lefts)
			len = deferredLeftCalculations.length;
			for(i = 0; i < len; i++) {
				child = deferredLeftCalculations[i];
				sandboxWidthLayoutCoefficients = child._layoutCoefficients.sandboxWidth;
				measuredSandboxWidth = child._measuredSandboxWidth = sandboxWidthLayoutCoefficients.x1 * width + sandboxWidthLayoutCoefficients.x2 + child._measuredWidth;
				measuredSandboxWidth > computedSize.width && (computedSize.width = measuredSandboxWidth);
			}

			// Second pass, if necessary, to determine the left values
			for(i = 0; i < len; i++) {
				child = deferredLeftCalculations[i];

				leftLayoutCoefficients = child._layoutCoefficients.left;
				sandboxWidthLayoutCoefficients = child._layoutCoefficients.sandboxWidth;
				measuredWidth = child._measuredWidth;
				measuredSandboxWidth = child._measuredSandboxWidth;

				measuredSandboxWidth > computedSize.width && (computedSize.width = measuredSandboxWidth);
				measuredLeft = child._measuredLeft = leftLayoutCoefficients.x1 * computedSize.width + leftLayoutCoefficients.x2 * measuredWidth + leftLayoutCoefficients.x3;
				child._measuredSandboxWidth += (isNaN(measuredLeft) ? 0 : measuredLeft);
			}

			// Position the children
			len = children.length;
			for(i = 0; i < len; i++) {
				child = children[i];
				if (child._markedForLayout) {
					UI._elementLayoutCount++;
					child = children[i];
					style = child.domNode.style;
					style.zIndex = child.zIndex;
					style.left = round(child._measuredLeft) + pixelUnits;
					style.top = round(child._measuredTop) + pixelUnits;
					style.width = round(child._measuredWidth - child._borderLeftWidth - child._borderRightWidth) + pixelUnits;
					style.height = round(child._measuredHeight - child._borderTopWidth - child._borderBottomWidth) + pixelUnits;
					child._markedForLayout = false;
					child.fireEvent('postlayout');
				}
			}

			return this._computedSize = computedSize;
		},

		_getWidth: function(node, width) {

			// Get the width or default width, depending on which one is needed
			!isDef(width) && (isDef(node.left) + isDef(node.center && node.center.x) + isDef(node.right) < 2) && (width = node._defaultWidth);

			// Check if the width is INHERIT, and if so fetch the inherited width
			if (width === UI.INHERIT) {
				if (node._parent._parent) {
					return node._parent._parent._layout._getWidth(node._parent, node._parent.width) === UI.SIZE ? UI.SIZE : UI.FILL;
				}
				// This is the root level content container, which we know has a width of FILL
				return UI.FILL;
			}
			return width;
		},

		_getHeight: function(node, height) {

			// Get the height or default height, depending on which one is needed
			!isDef(height) && (height = node._defaultHeight);

			// Check if the width is INHERIT, and if so fetch the inherited width
			if (height === UI.INHERIT) {
				if (node._parent._parent) {
					return node._parent._parent._layout._getHeight(node._parent, node._parent.height) === UI.SIZE ? UI.SIZE : UI.FILL;
				}
				// This is the root level content container, which we know has a width of FILL
				return UI.FILL;
			}
			return height;
		},

		_isDependentOnParent: function(node){
			var layoutCoefficients = node._layoutCoefficients;
			return (!isNaN(layoutCoefficients.width.x1) && layoutCoefficients.width.x1 !== 0) || // width
				(!isNaN(layoutCoefficients.height.x1) && layoutCoefficients.height.x1 !== 0) ||
				(!isNaN(layoutCoefficients.height.x2) && layoutCoefficients.height.x2 !== 0) || // height
				layoutCoefficients.sandboxWidth.x1 !== 0 || // sandbox width
				layoutCoefficients.sandboxHeight.x1 !== 0 || // sandbox height
				layoutCoefficients.left.x1 !== 0 || // left
				layoutCoefficients.top.x1 !== 0; // top
		},

		_doAnimationLayout: function(node, animationCoefficients) {

			var parentWidth = node._parent._measuredWidth,
				parentHeight = node._parent._measuredHeight,
				runningHeight = node._measuredRunningHeight,
				width = animationCoefficients.width.x1 * parentWidth + animationCoefficients.width.x2;

			return {
				width: width,
				height: animationCoefficients.height.x1 * parentHeight + animationCoefficients.height.x2 * (parentHeight - runningHeight) + animationCoefficients.height.x3,
				left: animationCoefficients.left.x1 * parentWidth + animationCoefficients.left.x2 * width + animationCoefficients.left.x3,
				top: animationCoefficients.top.x1 * parentHeight + animationCoefficients.top.x2 + runningHeight
			};
		},

		_measureNode: function(node, layoutProperties, layoutCoefficients, self) {

			node._needsMeasuring = false;

			// Pre-processing
			var getValueType = self.getValueType,
				computeValue = self.computeValue,

				width = self._getWidth(node, layoutProperties.width),
				widthType = getValueType(width),
				widthValue = computeValue(width, widthType),

				height = self._getHeight(node, layoutProperties.height),
				heightType = getValueType(height),
				heightValue = computeValue(height, heightType),

				left = layoutProperties.left,
				leftType = getValueType(left),
				leftValue = computeValue(left, leftType),

				centerX = layoutProperties.center && layoutProperties.center.x,
				centerXType = getValueType(centerX),
				centerXValue = computeValue(centerX, centerXType),

				right = layoutProperties.right,
				rightType = getValueType(right),
				rightValue = computeValue(right, rightType),

				top = layoutProperties.top,
				topType = getValueType(top),
				topValue = computeValue(top, topType),

				bottom = layoutProperties.bottom,
				bottomType = getValueType(bottom),
				bottomValue = computeValue(bottom, bottomType),

				x1, x2, x3,

				widthLayoutCoefficients = layoutCoefficients.width,
				heightLayoutCoefficients = layoutCoefficients.height,
				sandboxWidthLayoutCoefficients = layoutCoefficients.sandboxWidth,
				sandboxHeightLayoutCoefficients = layoutCoefficients.sandboxHeight,
				leftLayoutCoefficients = layoutCoefficients.left,
				topLayoutCoefficients = layoutCoefficients.top;

			// Width rule evaluation
			x1 = x2 = 0;
			if (widthType === UI.SIZE) {
				x1 = x2 = NaN;
			} else if (widthType === UI.FILL) {
				x1 = 1;
				if (leftType === '%') {
					x1 -= leftValue;
				} else if (leftType === '#') {
					x2 = -leftValue;
				} else if (rightType === '%') {
					x1 -= rightValue;
				} else if (rightType === '#') {
					x2 = -rightValue;
				}
			} else if (widthType === '%') {
				x1 = widthValue;
			} else if (widthType === '#') {
				x2 = widthValue;
			} else if (leftType === '%') {
				if (centerXType === '%') {
					x1 = 2 * (centerXValue - leftValue);
				} else if (centerXType === '#') {
					x1 = -2 * leftValue;
					x2 = 2 * centerXValue;
				} else if (rightType === '%') {
					x1 = 1 - leftValue - rightValue;
				} else if (rightType === '#') {
					x1 = 1 - leftValue;
					x2 = -rightValue;
				}
			} else if (leftType === '#') {
				if (centerXType === '%') {
					x1 = 2 * centerXValue;
					x2 = -2 * leftValue;
				} else if (centerXType === '#') {
					x2 = 2 * (centerXValue - leftValue);
				} else if (rightType === '%') {
					x1 = 1 - rightValue;
					x2 = -leftValue;
				} else if (rightType === '#') {
					x1 = 1;
					x2 = -rightValue - leftValue;
				}
			} else if (centerXType === '%') {
				if (rightType === '%') {
					x1 = 2 * (rightValue - centerXValue);
				} else if (rightType === '#') {
					x1 = -2 * centerXValue;
					x2 = 2 * rightValue;
				}
			} else if (centerXType === '#') {
				if (rightType === '%') {
					x1 = 2 * rightValue;
					x2 = -2 * centerXValue;
				} else if (rightType === '#') {
					x2 = 2 * (rightValue - centerXValue);
				}
			}
			widthLayoutCoefficients.x1 = x1;
			widthLayoutCoefficients.x2 = x2;

			// Sandbox width/height rule evaluation
			sandboxWidthLayoutCoefficients.x1 = rightType === '%' ? rightValue : 0;
			sandboxWidthLayoutCoefficients.x2 = rightType === '#' ? rightValue : 0;

			// Height rule calculation
			x1 = x2 = x3 = 0;
			if (heightType === UI.SIZE) {
				x1 = x2 = x3 = NaN;
			} else if (heightType === UI.FILL) {
				x2 = 1;
				topType === '%' && (x1 = -topValue);
				topType === '#' && (x3 = -topValue);
				bottomType === '%' && (x1 = -bottomValue);
				bottomType === '#' && (x3 = -bottomValue);
			} else if (heightType === '%') {
				x1 = heightValue;
			} else if (heightType === '#') {
				x3 = heightValue;
			}
			heightLayoutCoefficients.x1 = x1;
			heightLayoutCoefficients.x2 = x2;
			heightLayoutCoefficients.x3 = x3;

			// Sandbox height rule calculation
			x1 = x2 = 0;
			topType === '%' && (x1 = topValue);
			topType === '#' && (x2 = topValue);
			bottomType === '%' && (x1 += bottomValue);
			bottomType === '#' && (x2 += bottomValue);
			sandboxHeightLayoutCoefficients.x1 = x1;
			sandboxHeightLayoutCoefficients.x2 = x2;

			// Left rule calculation
			x1 = x2 = x3 = 0;
			if (leftType === '%') {
				x1 = leftValue;
			} else if(leftType === '#') {
				x3 = leftValue;
			} else if (centerXType === '%') {
				x1 = centerXValue;
				x2 = -0.5;
			} else if (centerXType === '#') {
				x2 = -0.5;
				x3 = centerXValue;
			} else if (rightType === '%') {
				x1 = 1 - rightValue;
				x2 = -1;
			} else if (rightType === '#') {
				x1 = 1;
				x2 = -1;
				x3 = -rightValue;
			} else {
				switch(self._defaultHorizontalAlignment) {
					case 'center':
						x1 = 0.5;
						x2 = -0.5;
						break;
					case 'end':
						x1 = 1;
						x2 = -1;
				}
			}
			leftLayoutCoefficients.x1 = x1;
			leftLayoutCoefficients.x2 = x2;
			leftLayoutCoefficients.x3 = x3;

			// Top rule calculation
			topLayoutCoefficients.x1 = topType === '%' ? topValue : 0;
			topLayoutCoefficients.x2 = topType === '#' ? topValue : 0;
		},

		_defaultHorizontalAlignment: 'center',

		_defaultVerticalAlignment: 'start'

	});

});

},
"Ti/_/Layouts/ConstrainingHorizontal":function(){
/* /titanium/Ti/_/Layouts/ConstrainingHorizontal.js */

/*global define*/
define(['Ti/_/Layouts/Base', 'Ti/_/declare', 'Ti/UI', 'Ti/_/lang'], function(Base, declare, UI, lang) {

	var isDef = lang.isDef,
		round = Math.round;

	return declare('Ti._.Layouts.ConstrainingHorizontal', Base, {

		_doLayout: function(element, width, height, isWidthSize, isHeightSize) {
			var computedSize = {width: 0, height: 0},
				children = element._children,
				child,
				i = 0,
				layoutCoefficients,
				widthLayoutCoefficients, heightLayoutCoefficients, sandboxWidthLayoutCoefficients, sandboxHeightLayoutCoefficients, topLayoutCoefficients, leftLayoutCoefficients,
				childSize,
				measuredWidth, measuredHeight, measuredSandboxHeight, measuredSandboxWidth, measuredLeft, measuredTop,
				pixelUnits = 'px',
				deferredTopCalculations = [],
				runningWidth = 0,
				remainingSpace,
				fillCount = 0,
				len = children.length,
				measureNode = this._measureNode,
				style;

			// Calculate size for the non-FILL children
			for(i = 0; i < len; i++) {

				child = element._children[i];
				if (!child._alive || !child.domNode) {
					this.handleInvalidState(child,element);
				} else {

					if (child._markedForLayout) {
						((child._preLayout && child._preLayout(width, height, isWidthSize, isHeightSize)) || child._needsMeasuring) && measureNode(child, child, child._layoutCoefficients, this);

						layoutCoefficients = child._layoutCoefficients;
						widthLayoutCoefficients = layoutCoefficients.width;

						if (widthLayoutCoefficients.x2 === 0 || isNaN(widthLayoutCoefficients.x2)) {
							heightLayoutCoefficients = layoutCoefficients.height;
							sandboxWidthLayoutCoefficients = layoutCoefficients.sandboxWidth;
							sandboxHeightLayoutCoefficients = layoutCoefficients.sandboxHeight;

							measuredHeight = heightLayoutCoefficients.x1 * height + heightLayoutCoefficients.x2;
							measuredWidth = widthLayoutCoefficients.x1 * width + widthLayoutCoefficients.x2 * (width - runningWidth) + widthLayoutCoefficients.x3;

							if (child._getContentSize) {
								childSize = child._getContentSize(measuredWidth, measuredHeight);
							} else {
								childSize = child._layout._doLayout(
									child,
									isNaN(measuredWidth) ? width : measuredWidth - child._borderLeftWidth - child._borderRightWidth,
									isNaN(measuredHeight) ? height : measuredHeight - child._borderTopWidth - child._borderBottomWidth,
									isNaN(measuredWidth),
									isNaN(measuredHeight));
							}
							isNaN(measuredWidth) && (measuredWidth = childSize.width + child._borderLeftWidth + child._borderRightWidth);
							isNaN(measuredHeight) && (measuredHeight = childSize.height + child._borderTopWidth + child._borderBottomWidth);

							measuredSandboxWidth = child._measuredSandboxWidth = sandboxWidthLayoutCoefficients.x1 * width + sandboxWidthLayoutCoefficients.x2 + measuredWidth;

							runningWidth += measuredSandboxWidth;

							child._measuredWidth = measuredWidth;
							child._measuredHeight = measuredHeight;
						} else {
							fillCount++;
						}
					}
				}
			}

			// Calculate size for the FILL children
			remainingSpace = width - runningWidth;
			runningWidth = Math.floor(remainingSpace / fillCount); // Temporary repurposing of runningHeight
			for(i = 0; i < len; i++) {

				child = element._children[i];
				if (child._markedForLayout) {

					layoutCoefficients = child._layoutCoefficients;
					widthLayoutCoefficients = layoutCoefficients.width;

					if (widthLayoutCoefficients.x2 !== 0 && !isNaN(widthLayoutCoefficients.x2)) {
						heightLayoutCoefficients = layoutCoefficients.height;
						sandboxWidthLayoutCoefficients = layoutCoefficients.sandboxWidth;
						sandboxHeightLayoutCoefficients = layoutCoefficients.sandboxHeight;

						measuredHeight = heightLayoutCoefficients.x1 * height + heightLayoutCoefficients.x2;
						measuredWidth = widthLayoutCoefficients.x1 * width + widthLayoutCoefficients.x2 * (i < len - 1 ? runningWidth : remainingSpace - runningWidth * (fillCount - 1)) + widthLayoutCoefficients.x3;

						if (child._getContentSize) {
							childSize = child._getContentSize(measuredWidth, measuredHeight);
						} else {
							childSize = child._layout._doLayout(
								child,
								isNaN(measuredWidth) ? width : measuredWidth - child._borderLeftWidth - child._borderRightWidth,
								isNaN(measuredHeight) ? height : measuredHeight - child._borderTopWidth - child._borderBottomWidth,
								isNaN(measuredWidth),
								isNaN(measuredHeight));
						}
						isNaN(measuredWidth) && (measuredWidth = childSize.width + child._borderLeftWidth + child._borderRightWidth);
						isNaN(measuredHeight) && (measuredHeight = childSize.height + child._borderTopWidth + child._borderBottomWidth);
						child._measuredWidth = measuredWidth;
						child._measuredHeight = measuredHeight;

						measuredSandboxWidth = child._measuredSandboxWidth = sandboxWidthLayoutCoefficients.x1 * width + sandboxWidthLayoutCoefficients.x2 + measuredWidth;
					}
				}
			}

			// Calculate position for the children
			runningWidth = 0;
			for(i = 0; i < len; i++) {

				child = element._children[i];
				child._measuredRunningWidth = runningWidth;
				if (child._markedForLayout) {
					layoutCoefficients = child._layoutCoefficients;
					sandboxHeightLayoutCoefficients = layoutCoefficients.sandboxHeight;
					topLayoutCoefficients = layoutCoefficients.top;
					leftLayoutCoefficients = layoutCoefficients.left;

					if (isHeightSize && topLayoutCoefficients.x1 !== 0) {
						deferredTopCalculations.push(child);
					} else {
						measuredHeight = child._measuredHeight;

						measuredTop = child._measuredTop = topLayoutCoefficients.x1 * height + topLayoutCoefficients.x2 * measuredHeight + topLayoutCoefficients.x3;
						measuredSandboxHeight = child._measuredSandboxHeight = sandboxHeightLayoutCoefficients.x1 * height + sandboxHeightLayoutCoefficients.x2 + measuredHeight + (isNaN(measuredTop) ? 0 : measuredTop);
						child._measuredSandboxHeight > computedSize.height && (computedSize.height = child._measuredSandboxHeight);
					}
					measuredLeft = child._measuredLeft = leftLayoutCoefficients.x1 * width + leftLayoutCoefficients.x2 + runningWidth;
				} else {
					child._measuredSandboxHeight > computedSize.height && (computedSize.height = child._measuredSandboxHeight);
				}
				runningWidth += child._measuredSandboxWidth;
			}
			computedSize.width = runningWidth;

			// Calculate the preliminary sandbox heights (missing top, since one of these heights may end up impacting all the tops)
			len = deferredTopCalculations.length;
			for(i = 0; i < len; i++) {
				child = deferredTopCalculations[i];
				sandboxHeightLayoutCoefficients = child._layoutCoefficients.sandboxHeight;
				measuredSandboxHeight = child._measuredSandboxHeight = sandboxHeightLayoutCoefficients.x1 * height + sandboxHeightLayoutCoefficients.x2 + child._measuredHeight;
				measuredSandboxHeight > computedSize.height && (computedSize.height = measuredSandboxHeight);
			}

			// Second pass, if necessary, to determine the top values
			for(i = 0; i < len; i++) {
				child = deferredTopCalculations[i];

				topLayoutCoefficients = child._layoutCoefficients.top;
				sandboxHeightLayoutCoefficients = child._layoutCoefficients.sandboxHeight;
				measuredHeight = child._measuredHeight;
				measuredSandboxHeight = child._measuredSandboxHeight;

				measuredSandboxHeight > computedSize.height && (computedSize.height = measuredSandboxHeight);
				measuredTop = child._measuredTop = topLayoutCoefficients.x1 * computedSize.height + topLayoutCoefficients.x2 * measuredHeight + topLayoutCoefficients.x3;
				child._measuredSandboxHeight += (isNaN(measuredTop) ? 0 : measuredTop);
			}

			// Position the children
			len = children.length;
			for(i = 0; i < len; i++) {
				child = children[i];
				if (child._markedForLayout) {
					UI._elementLayoutCount++;
					child = children[i];
					style = child.domNode.style;
					style.zIndex = child.zIndex;
					style.left = round(child._measuredLeft) + pixelUnits;
					style.top = round(child._measuredTop) + pixelUnits;
					style.width = round(child._measuredWidth - child._borderLeftWidth - child._borderRightWidth) + pixelUnits;
					style.height = round(child._measuredHeight - child._borderTopWidth - child._borderBottomWidth) + pixelUnits;
					child._markedForLayout = false;
					child.fireEvent('postlayout');
				}
			}

			return this._computedSize = computedSize;
		},

		_getWidth: function(node, width) {

			// Get the width or default width, depending on which one is needed
			!isDef(width) && (width = node._defaultWidth);

			// Check if the width is INHERIT, and if so fetch the inherited width
			if (width === UI.INHERIT) {
				if (node._parent._parent) {
					return node._parent._parent._layout._getWidth(node._parent, node._parent.width) === UI.SIZE ? UI.SIZE : UI.FILL;
				}
				// This is the root level content container, which we know has a width of FILL
				return UI.FILL;
			}
			return width;
		},

		_getHeight: function(node, height) {

			// Get the height or default height, depending on which one is needed
			!isDef(height) && (isDef(node.top) + isDef(node.center && node.center.y) + isDef(node.bottom) < 2) && (height = node._defaultHeight);

			// Check if the width is INHERIT, and if so fetch the inherited width
			if (height === UI.INHERIT) {
				if (node._parent._parent) {
					return node._parent._parent._layout._getHeight(node._parent, node._parent.height) === UI.SIZE ? UI.SIZE : UI.FILL;
				}
				// This is the root level content container, which we know has a width of FILL
				return UI.FILL;
			}
			return height;
		},

		_isDependentOnParent: function(node){
			var layoutCoefficients = node._layoutCoefficients;
			return (!isNaN(layoutCoefficients.width.x1) && layoutCoefficients.width.x1 !== 0) ||
				(!isNaN(layoutCoefficients.width.x2) && layoutCoefficients.width.x2 !== 0) || // width
				(!isNaN(layoutCoefficients.height.x1) && layoutCoefficients.height.x1 !== 0) || // height
				layoutCoefficients.sandboxWidth.x1 !== 0 || // sandbox width
				layoutCoefficients.sandboxHeight.x1 !== 0 || // sandbox height
				layoutCoefficients.left.x1 !== 0 || // left
				layoutCoefficients.top.x1 !== 0; // top
		},

		_doAnimationLayout: function(node, animationCoefficients) {

			var parentWidth = node._parent._measuredWidth,
				parentHeight = node._parent._measuredHeight,
				runningWidth = node._measuredRunningWidth,
				height = animationCoefficients.height.x1 * parentHeight + animationCoefficients.height.x2;

			return {
				width: animationCoefficients.width.x1 * parentWidth + animationCoefficients.width.x2 * (parentWidth - runningWidth) + animationCoefficients.width.x3,
				height: height,
				left: animationCoefficients.left.x1 * parentWidth + animationCoefficients.left.x2 + runningWidth,
				top: animationCoefficients.top.x1 * parentHeight + animationCoefficients.top.x2 * height + animationCoefficients.top.x3
			};
		},

		_measureNode: function(node, layoutProperties, layoutCoefficients, self) {

			node._needsMeasuring = false;

			// Pre-processing
			var getValueType = self.getValueType,
				computeValue = self.computeValue,

				width = self._getWidth(node, layoutProperties.width),
				widthType = getValueType(width),
				widthValue = computeValue(width, widthType),

				height = self._getHeight(node, layoutProperties.height),
				heightType = getValueType(height),
				heightValue = computeValue(height, heightType),

				left = layoutProperties.left,
				leftType = getValueType(left),
				leftValue = computeValue(left, leftType),

				right = layoutProperties.right,
				rightType = getValueType(right),
				rightValue = computeValue(right, rightType),

				top = layoutProperties.top,
				topType = getValueType(top),
				topValue = computeValue(top, topType),

				centerY = layoutProperties.center && layoutProperties.center.y,
				centerYType = getValueType(centerY),
				centerYValue = computeValue(centerY, centerYType),

				bottom = layoutProperties.bottom,
				bottomType = getValueType(bottom),
				bottomValue = computeValue(bottom, bottomType),

				x1, x2, x3,

				widthLayoutCoefficients = layoutCoefficients.width,
				heightLayoutCoefficients = layoutCoefficients.height,
				sandboxWidthLayoutCoefficients = layoutCoefficients.sandboxWidth,
				sandboxHeightLayoutCoefficients = layoutCoefficients.sandboxHeight,
				leftLayoutCoefficients = layoutCoefficients.left,
				topLayoutCoefficients = layoutCoefficients.top;

			// Height rule evaluation
			x1 = x2 = 0;
			if (heightType === UI.SIZE) {
				x1 = x2 = NaN;
			} else if (heightType === UI.FILL) {
				x1 = 1;
				if (topType === '%') {
					x1 -= topValue;
				} else if (topType === '#') {
					x2 = -topValue;
				} else if (bottomType === '%') {
					x1 -= bottomValue;
				} else if (bottomType === '#') {
					x2 = -bottomValue;
				}
			} else if (heightType === '%') {
				x1 = heightValue;
			} else if (heightType === '#') {
				x2 = heightValue;
			} else if (topType === '%') {
				if (centerYType === '%') {
					x1 = 2 * (centerYValue - topValue);
				} else if (centerYType === '#') {
					x1 = -2 * topValue;
					x2 = 2 * centerYValue;
				} else if (bottomType === '%') {
					x1 = 1 - topValue - bottomValue;
				} else if (bottomType === '#') {
					x1 = 1 - topValue;
					x2 = -bottomValue;
				}
			} else if (topType === '#') {
				if (centerYType === '%') {
					x1 = 2 * centerYValue;
					x2 = -2 * topValue;
				} else if (centerYType === '#') {
					x2 = 2 * (centerYValue - topValue);
				} else if (bottomType === '%') {
					x1 = 1 - bottomValue;
					x2 = -topValue;
				} else if (bottomType === '#') {
					x1 = 1;
					x2 = -bottomValue - topValue;
				}
			} else if (centerYType === '%') {
				if (bottomType === '%') {
					x1 = 2 * (bottomValue - centerYValue);
				} else if (bottomType === '#') {
					x1 = -2 * centerYValue;
					x2 = 2 * bottomValue;
				}
			} else if (centerYType === '#') {
				if (bottomType === '%') {
					x1 = 2 * bottomValue;
					x2 = -2 * centerYValue;
				} else if (bottomType === '#') {
					x2 = 2 * (bottomValue - centerYValue);
				}
			}
			heightLayoutCoefficients.x1 = x1;
			heightLayoutCoefficients.x2 = x2;

			// Sandbox height rule evaluation
			sandboxHeightLayoutCoefficients.x1 = bottomType === '%' ? bottomValue : 0;
			sandboxHeightLayoutCoefficients.x2 = bottomType === '#' ? bottomValue : 0;

			// Width rule calculation
			x1 = x2 = x3 = 0;
			if (widthType === UI.SIZE) {
				x1 = x2 = x3 = NaN;
			} else if (widthType === UI.FILL) {
				x2 = 1;
				leftType === '%' && (x1 = -leftValue);
				leftType === '#' && (x3 = -leftValue);
				rightType === '%' && (x1 = -rightValue);
				rightType === '#' && (x3 = -rightValue);
			} else if (widthType === '%') {
				x1 = widthValue;
			} else if (widthType === '#') {
				x3 = widthValue;
			}
			widthLayoutCoefficients.x1 = x1;
			widthLayoutCoefficients.x2 = x2;
			widthLayoutCoefficients.x3 = x3;

			// Sandbox width rule calculation
			x1 = x2 = 0;
			leftType === '%' && (x1 = leftValue);
			leftType === '#' && (x2 = leftValue);
			rightType === '%' && (x1 += rightValue);
			rightType === '#' && (x2 += rightValue);
			sandboxWidthLayoutCoefficients.x1 = x1;
			sandboxWidthLayoutCoefficients.x2 = x2;

			// Top rule calculation
			x1 = x2 = x3 = 0;
			if (topType === '%') {
				x1 = topValue;
			} else if(topType === '#') {
				x3 = topValue;
			} else if (centerYType === '%') {
				x1 = centerYValue;
				x2 = -0.5;
			} else if (centerYType === '#') {
				x2 = -0.5;
				x3 = centerYValue;
			} else if (bottomType === '%') {
				x1 = 1 - bottomValue;
				x2 = -1;
			} else if (bottomType === '#') {
				x1 = 1;
				x2 = -1;
				x3 = -bottomValue;
			} else {
				switch(self._defaultVerticalAlignment) {
					case 'center':
						x1 = 0.5;
						x2 = -0.5;
						break;
					case 'end':
						x1 = 1;
						x2 = -1;
				}
			}
			topLayoutCoefficients.x1 = x1;
			topLayoutCoefficients.x2 = x2;
			topLayoutCoefficients.x3 = x3;

			// Left rule calculation
			leftLayoutCoefficients.x1 = leftType === '%' ? leftValue : 0;
			leftLayoutCoefficients.x2 = leftType === '#' ? leftValue : 0;
		},

		_defaultHorizontalAlignment: 'start',

		_defaultVerticalAlignment: 'center'

	});

});

},
"Ti/_/Layouts/ConstrainingVertical":function(){
/* /titanium/Ti/_/Layouts/ConstrainingVertical.js */

/*global define*/
define(['Ti/_/Layouts/Base', 'Ti/_/declare', 'Ti/UI', 'Ti/_/lang'], function(Base, declare, UI, lang) {

	var isDef = lang.isDef,
		round = Math.round;

	return declare('Ti._.Layouts.ConstrainingVertical', Base, {

		_doLayout: function(element, width, height, isWidthSize, isHeightSize) {
			var computedSize = {width: 0, height: 0},
				children = element._children,
				child,
				i = 0,
				layoutCoefficients,
				widthLayoutCoefficients, heightLayoutCoefficients, sandboxWidthLayoutCoefficients, sandboxHeightLayoutCoefficients, topLayoutCoefficients, leftLayoutCoefficients,
				childSize,
				measuredWidth, measuredHeight, measuredSandboxHeight, measuredSandboxWidth, measuredLeft, measuredTop,
				pixelUnits = 'px',
				deferredLeftCalculations = [],
				runningHeight = 0,
				remainingSpace,
				fillCount = 0,
				len = children.length,
				measureNode = this._measureNode,
				style;

			// Calculate size for the non-FILL children
			for(i = 0; i < len; i++) {

				child = element._children[i];
				if (!child._alive || !child.domNode) {
					this.handleInvalidState(child,element);
				} else {

					if (child._markedForLayout) {
						((child._preLayout && child._preLayout(width, height, isWidthSize, isHeightSize)) || child._needsMeasuring) && measureNode(child, child, child._layoutCoefficients, this);

						layoutCoefficients = child._layoutCoefficients;
						heightLayoutCoefficients = layoutCoefficients.height;

						if (heightLayoutCoefficients.x2 === 0 || isNaN(heightLayoutCoefficients.x2)) {
							widthLayoutCoefficients = layoutCoefficients.width;
							sandboxWidthLayoutCoefficients = layoutCoefficients.sandboxWidth;
							sandboxHeightLayoutCoefficients = layoutCoefficients.sandboxHeight;

							measuredWidth = widthLayoutCoefficients.x1 * width + widthLayoutCoefficients.x2;
							measuredHeight = heightLayoutCoefficients.x1 * height + heightLayoutCoefficients.x2 * (height - runningHeight) + heightLayoutCoefficients.x3;

							if (child._getContentSize) {
								childSize = child._getContentSize(measuredWidth, measuredHeight);
							} else {
								childSize = child._layout._doLayout(
									child,
									isNaN(measuredWidth) ? width : measuredWidth - child._borderLeftWidth - child._borderRightWidth,
									isNaN(measuredHeight) ? height : measuredHeight - child._borderTopWidth - child._borderBottomWidth,
									isNaN(measuredWidth),
									isNaN(measuredHeight));
							}
							isNaN(measuredWidth) && (measuredWidth = childSize.width + child._borderLeftWidth + child._borderRightWidth);
							isNaN(measuredHeight) && (measuredHeight = childSize.height + child._borderTopWidth + child._borderBottomWidth);

							measuredSandboxHeight = child._measuredSandboxHeight = sandboxHeightLayoutCoefficients.x1 * height + sandboxHeightLayoutCoefficients.x2 + measuredHeight;

							runningHeight += measuredSandboxHeight;

							child._measuredWidth = measuredWidth;
							child._measuredHeight = measuredHeight;
						} else {
							fillCount++;
						}
					}
				}
			}

			// Calculate size for the FILL children
			remainingSpace = height - runningHeight;
			runningHeight = Math.floor(remainingSpace / fillCount); // Temporary repurposing of runningHeight
			for(i = 0; i < len; i++) {

				child = element._children[i];

				if (child._markedForLayout) {

					layoutCoefficients = child._layoutCoefficients;
					heightLayoutCoefficients = layoutCoefficients.height;

					if (heightLayoutCoefficients.x2 !== 0 && !isNaN(heightLayoutCoefficients.x2)) {
						widthLayoutCoefficients = layoutCoefficients.width;
						sandboxWidthLayoutCoefficients = layoutCoefficients.sandboxWidth;
						sandboxHeightLayoutCoefficients = layoutCoefficients.sandboxHeight;

						measuredWidth = widthLayoutCoefficients.x1 * width + widthLayoutCoefficients.x2;
						measuredHeight = heightLayoutCoefficients.x1 * height + heightLayoutCoefficients.x2 * (i < len - 1 ? runningHeight : remainingSpace - runningHeight * (fillCount - 1)) + heightLayoutCoefficients.x3;

						if (child._getContentSize) {
							childSize = child._getContentSize(measuredWidth, measuredHeight);
						} else {
							childSize = child._layout._doLayout(
								child,
								isNaN(measuredWidth) ? width : measuredWidth - child._borderLeftWidth - child._borderRightWidth,
								isNaN(measuredHeight) ? height : measuredHeight - child._borderTopWidth - child._borderBottomWidth,
								isNaN(measuredWidth),
								isNaN(measuredHeight));
						}
						isNaN(measuredWidth) && (measuredWidth = childSize.width + child._borderLeftWidth + child._borderRightWidth);
						isNaN(measuredHeight) && (measuredHeight = childSize.height + child._borderTopWidth + child._borderBottomWidth);
						child._measuredWidth = measuredWidth;
						child._measuredHeight = measuredHeight;

						measuredSandboxHeight = child._measuredSandboxHeight = sandboxHeightLayoutCoefficients.x1 * height + sandboxHeightLayoutCoefficients.x2 + measuredHeight;
					}
				}
			}

			// Calculate position for the children
			runningHeight = 0;
			for(i = 0; i < len; i++) {

				child = element._children[i];
				child._measuredRunningHeight = runningHeight;
				if (child._markedForLayout) {
					layoutCoefficients = child._layoutCoefficients;
					sandboxWidthLayoutCoefficients = layoutCoefficients.sandboxWidth;
					topLayoutCoefficients = layoutCoefficients.top;
					leftLayoutCoefficients = layoutCoefficients.left;

					if (isWidthSize && leftLayoutCoefficients.x1 !== 0) {
						deferredLeftCalculations.push(child);
					} else {
						measuredWidth = child._measuredWidth;

						measuredLeft = child._measuredLeft = leftLayoutCoefficients.x1 * width + leftLayoutCoefficients.x2 * measuredWidth + leftLayoutCoefficients.x3;
						measuredSandboxWidth = child._measuredSandboxWidth = sandboxWidthLayoutCoefficients.x1 * width + sandboxWidthLayoutCoefficients.x2 + measuredWidth + (isNaN(measuredLeft) ? 0 : measuredLeft);
						child._measuredSandboxWidth > computedSize.width && (computedSize.width = child._measuredSandboxWidth);
					}
					measuredTop = child._measuredTop = topLayoutCoefficients.x1 * height + topLayoutCoefficients.x2 + runningHeight;
				} else {
					child._measuredSandboxWidth > computedSize.width && (computedSize.width = child._measuredSandboxWidth);
				}
				runningHeight += child._measuredSandboxHeight;
			}
			computedSize.height = runningHeight;

			// Calculate the preliminary sandbox widths (missing left, since one of these widths may end up impacting all the lefts)
			len = deferredLeftCalculations.length;
			for(i = 0; i < len; i++) {
				child = deferredLeftCalculations[i];
				sandboxWidthLayoutCoefficients = child._layoutCoefficients.sandboxWidth;
				measuredSandboxWidth = child._measuredSandboxWidth = sandboxWidthLayoutCoefficients.x1 * width + sandboxWidthLayoutCoefficients.x2 + child._measuredWidth;
				measuredSandboxWidth > computedSize.width && (computedSize.width = measuredSandboxWidth);
			}

			// Second pass, if necessary, to determine the left values
			for(i = 0; i < len; i++) {
				child = deferredLeftCalculations[i];

				leftLayoutCoefficients = child._layoutCoefficients.left;
				sandboxWidthLayoutCoefficients = child._layoutCoefficients.sandboxWidth;
				measuredWidth = child._measuredWidth;
				measuredSandboxWidth = child._measuredSandboxWidth;

				measuredSandboxWidth > computedSize.width && (computedSize.width = measuredSandboxWidth);
				measuredLeft = child._measuredLeft = leftLayoutCoefficients.x1 * computedSize.width + leftLayoutCoefficients.x2 * measuredWidth + leftLayoutCoefficients.x3;
				child._measuredSandboxWidth += (isNaN(measuredLeft) ? 0 : measuredLeft);
			}

			// Position the children
			len = children.length;
			for(i = 0; i < len; i++) {
				child = children[i];
				if (child._markedForLayout) {
					UI._elementLayoutCount++;
					child = children[i];
					style = child.domNode.style;
					style.zIndex = child.zIndex;
					style.left = round(child._measuredLeft) + pixelUnits;
					style.top = round(child._measuredTop) + pixelUnits;
					style.width = round(child._measuredWidth - child._borderLeftWidth - child._borderRightWidth) + pixelUnits;
					style.height = round(child._measuredHeight - child._borderTopWidth - child._borderBottomWidth) + pixelUnits;
					child._markedForLayout = false;
					child.fireEvent('postlayout');
				}
			}

			return this._computedSize = computedSize;
		},

		_getWidth: function(node, width) {

			// Get the width or default width, depending on which one is needed
			!isDef(width) && (isDef(node.left) + isDef(node.center && node.center.x) + isDef(node.right) < 2) && (width = node._defaultWidth);

			// Check if the width is INHERIT, and if so fetch the inherited width
			if (width === UI.INHERIT) {
				if (node._parent._parent) {
					return node._parent._parent._layout._getWidth(node._parent, node._parent.width) === UI.SIZE ? UI.SIZE : UI.FILL;
				}
				// This is the root level content container, which we know has a width of FILL
				return UI.FILL;
			}
			return width;
		},

		_getHeight: function(node, height) {

			// Get the height or default height, depending on which one is needed
			!isDef(height) && (height = node._defaultHeight);

			// Check if the width is INHERIT, and if so fetch the inherited width
			if (height === UI.INHERIT) {
				if (node._parent._parent) {
					return node._parent._parent._layout._getHeight(node._parent, node._parent.height) === UI.SIZE ? UI.SIZE : UI.FILL;
				}
				// This is the root level content container, which we know has a width of FILL
				return UI.FILL;
			}
			return height;
		},

		_isDependentOnParent: function(node){
			var layoutCoefficients = node._layoutCoefficients;
			return (!isNaN(layoutCoefficients.width.x1) && layoutCoefficients.width.x1 !== 0) || // width
				(!isNaN(layoutCoefficients.height.x1) && layoutCoefficients.height.x1 !== 0) ||
				(!isNaN(layoutCoefficients.height.x2) && layoutCoefficients.height.x2 !== 0) || // height
				layoutCoefficients.sandboxWidth.x1 !== 0 || // sandbox width
				layoutCoefficients.sandboxHeight.x1 !== 0 || // sandbox height
				layoutCoefficients.left.x1 !== 0 || // left
				layoutCoefficients.top.x1 !== 0; // top
		},

		_doAnimationLayout: function(node, animationCoefficients) {

			var parentWidth = node._parent._measuredWidth,
				parentHeight = node._parent._measuredHeight,
				runningHeight = node._measuredRunningHeight,
				width = animationCoefficients.width.x1 * parentWidth + animationCoefficients.width.x2;

			return {
				width: width,
				height: animationCoefficients.height.x1 * parentHeight + animationCoefficients.height.x2 * (parentHeight - runningHeight) + animationCoefficients.height.x3,
				left: animationCoefficients.left.x1 * parentWidth + animationCoefficients.left.x2 * width + animationCoefficients.left.x3,
				top: animationCoefficients.top.x1 * parentHeight + animationCoefficients.top.x2 + runningHeight
			};
		},

		_measureNode: function(node, layoutProperties, layoutCoefficients, self) {

			node._needsMeasuring = false;

			// Pre-processing
			var getValueType = self.getValueType,
				computeValue = self.computeValue,

				width = self._getWidth(node, layoutProperties.width),
				widthType = getValueType(width),
				widthValue = computeValue(width, widthType),

				height = self._getHeight(node, layoutProperties.height),
				heightType = getValueType(height),
				heightValue = computeValue(height, heightType),

				left = layoutProperties.left,
				leftType = getValueType(left),
				leftValue = computeValue(left, leftType),

				centerX = layoutProperties.center && layoutProperties.center.x,
				centerXType = getValueType(centerX),
				centerXValue = computeValue(centerX, centerXType),

				right = layoutProperties.right,
				rightType = getValueType(right),
				rightValue = computeValue(right, rightType),

				top = layoutProperties.top,
				topType = getValueType(top),
				topValue = computeValue(top, topType),

				bottom = layoutProperties.bottom,
				bottomType = getValueType(bottom),
				bottomValue = computeValue(bottom, bottomType),

				x1, x2, x3,

				widthLayoutCoefficients = layoutCoefficients.width,
				heightLayoutCoefficients = layoutCoefficients.height,
				sandboxWidthLayoutCoefficients = layoutCoefficients.sandboxWidth,
				sandboxHeightLayoutCoefficients = layoutCoefficients.sandboxHeight,
				leftLayoutCoefficients = layoutCoefficients.left,
				topLayoutCoefficients = layoutCoefficients.top;

			// Width rule evaluation
			x1 = x2 = 0;
			if (widthType === UI.SIZE) {
				x1 = x2 = NaN;
			} else if (widthType === UI.FILL) {
				x1 = 1;
				if (leftType === '%') {
					x1 -= leftValue;
				} else if (leftType === '#') {
					x2 = -leftValue;
				} else if (rightType === '%') {
					x1 -= rightValue;
				} else if (rightType === '#') {
					x2 = -rightValue;
				}
			} else if (widthType === '%') {
				x1 = widthValue;
			} else if (widthType === '#') {
				x2 = widthValue;
			} else if (leftType === '%') {
				if (centerXType === '%') {
					x1 = 2 * (centerXValue - leftValue);
				} else if (centerXType === '#') {
					x1 = -2 * leftValue;
					x2 = 2 * centerXValue;
				} else if (rightType === '%') {
					x1 = 1 - leftValue - rightValue;
				} else if (rightType === '#') {
					x1 = 1 - leftValue;
					x2 = -rightValue;
				}
			} else if (leftType === '#') {
				if (centerXType === '%') {
					x1 = 2 * centerXValue;
					x2 = -2 * leftValue;
				} else if (centerXType === '#') {
					x2 = 2 * (centerXValue - leftValue);
				} else if (rightType === '%') {
					x1 = 1 - rightValue;
					x2 = -leftValue;
				} else if (rightType === '#') {
					x1 = 1;
					x2 = -rightValue - leftValue;
				}
			} else if (centerXType === '%') {
				if (rightType === '%') {
					x1 = 2 * (rightValue - centerXValue);
				} else if (rightType === '#') {
					x1 = -2 * centerXValue;
					x2 = 2 * rightValue;
				}
			} else if (centerXType === '#') {
				if (rightType === '%') {
					x1 = 2 * rightValue;
					x2 = -2 * centerXValue;
				} else if (rightType === '#') {
					x2 = 2 * (rightValue - centerXValue);
				}
			}
			widthLayoutCoefficients.x1 = x1;
			widthLayoutCoefficients.x2 = x2;

			// Sandbox width rule evaluation
			sandboxWidthLayoutCoefficients.x1 = rightType === '%' ? rightValue : 0;
			sandboxWidthLayoutCoefficients.x2 = rightType === '#' ? rightValue : 0;

			// Height rule calculation
			x1 = x2 = x3 = 0;
			if (heightType === UI.SIZE) {
				x1 = x2 = x3 = NaN;
			} else if (heightType === UI.FILL) {
				x2 = 1;
				topType === '%' && (x1 = -topValue);
				topType === '#' && (x3 = -topValue);
				bottomType === '%' && (x1 = -bottomValue);
				bottomType === '#' && (x3 = -bottomValue);
			} else if (heightType === '%') {
				x1 = heightValue;
			} else if (heightType === '#') {
				x3 = heightValue;
			}
			heightLayoutCoefficients.x1 = x1;
			heightLayoutCoefficients.x2 = x2;
			heightLayoutCoefficients.x3 = x3;

			// Sandbox height rule calculation
			x1 = x2 = 0;
			topType === '%' && (x1 = topValue);
			topType === '#' && (x2 = topValue);
			bottomType === '%' && (x1 += bottomValue);
			bottomType === '#' && (x2 += bottomValue);
			sandboxHeightLayoutCoefficients.x1 = x1;
			sandboxHeightLayoutCoefficients.x2 = x2;

			// Left rule calculation
			x1 = x2 = x3 = 0;
			if (leftType === '%') {
				x1 = leftValue;
			} else if(leftType === '#') {
				x3 = leftValue;
			} else if (centerXType === '%') {
				x1 = centerXValue;
				x2 = -0.5;
			} else if (centerXType === '#') {
				x2 = -0.5;
				x3 = centerXValue;
			} else if (rightType === '%') {
				x1 = 1 - rightValue;
				x2 = -1;
			} else if (rightType === '#') {
				x1 = 1;
				x2 = -1;
				x3 = -rightValue;
			} else {
				switch(self._defaultHorizontalAlignment) {
					case 'center':
						x1 = 0.5;
						x2 = -0.5;
						break;
					case 'end':
						x1 = 1;
						x2 = -1;
				}
			}
			leftLayoutCoefficients.x1 = x1;
			leftLayoutCoefficients.x2 = x2;
			leftLayoutCoefficients.x3 = x3;

			// Top rule calculation
			topLayoutCoefficients.x1 = topType === '%' ? topValue : 0;
			topLayoutCoefficients.x2 = topType === '#' ? topValue : 0;
		},

		_defaultHorizontalAlignment: 'center',

		_defaultVerticalAlignment: 'start'

	});

});

},
"Ti/Filesystem/FileStream":function(){
/* /titanium/Ti/Filesystem/FileStream.js */

define(["Ti/_/declare", "Ti/IOStream"], function(declare, IOStream) {

	return declare("Ti.Filesystem.Filestream", IOStream);

});
},
"Ti/Map/Annotation":function(){
/* /titanium/Ti/Map/Annotation.js */

define(["Ti/_/declare", "Ti/_/Evented", "Ti/Locale"], function(declare, Evented, Locale) {

	var updateHook = {
		post: function(newValue, oldValue, prop) {
			this.fireEvent("update", {
				property: prop,
				value: newValue,
				oldValue: oldValue
			});
		}
	};

	return declare("Ti.Map.Annotation", Evented, {

		_onclick: function(mapview, idx, src) {
			this.fireEvent("click", {
				annotation: this,
				clicksource: src,
				index: idx,
				map: mapview,
				title: this.title
			});
		},

		_update: function() {},

		_getTitle: function() {
			return Locale._getString(this.titleid, this.title);
		},

		_getSubtitle: function() {
			return Locale._getString(this.subtitleid, this.subtitle);
		},

		properties: {
			animate: false,
			image: updateHook,
			latitude: updateHook,
			longitude: updateHook,
			leftButton: updateHook,
			pincolor: updateHook,
			rightButton: updateHook,
			subtitle: updateHook,
			subtitleid: updateHook,
			title: updateHook,
			titleid: updateHook
		}

	});

});

},
"Ti/Map/View":function(){
/* /titanium/Ti/Map/View.js */

define(["Ti/_/declare", "Ti/_/Map/Google", "Ti/App/Properties"], function(declare, Google, Properties) {

	var backend = Properties.getString("ti.map.backend");

	return declare("Ti.Map.View", backend ? require(backend) : Google);

});

},
"Ti/_/Map/Google":function(){
/* /titanium/Ti/_/Map/Google.js */

/*global define Ti*/
define(['Ti/_/declare', 'Ti/_/dom', 'Ti/_/event', 'Ti/App/Properties', 'Ti/Gesture', 'Ti/Geolocation', 'Ti/Map', 'Ti/UI/View', 'Ti/Utils'],
	function(declare, dom, event, Properties, Gesture, Geolocation, Map, View, Utils) {

	function mapType(type) {
		var t = gmaps.MapTypeId;
		switch (type) {
			case Map.HYBRID_TYPE: return t.HYBRID;
			case Map.SATELLITE_TYPE: return t.SATELLITE;
			case Map.TERRAIN_TYPE: return t.TERRAIN;
		}
		return t.ROADMAP;
	}

	var on = require.on,
		fireEvent = View.prototype.fireEvent,
		defaultRegion = {
			latitude: 39.828175,
			longitude: -98.5795,
			latitudeDelta: 30.137412,
			longitudeDelta: 63.235658
		},
		gmaps,
		gevent,
		theInfoWindow,
		// the order of the markers MUST match the ANNOTATION_* constants defined in Ti.Map
		markers = { 0: 'red', 1: 'green', 2: 'purple' },
		locationMarkerImage,
		onload = Ti.deferStart(),
		MapView = declare('Ti.Map.View', View, {

			constructor: function() {
				this.__values__.properties.annotations = [];
				this._annotationMap = {};
				this._routes = [];
				this.fireEvent('loading');
			},

			postscript: function() {
				var self = this,
					region = self.region || defaultRegion,
					gmap = self._gmap = new gmaps.Map(self.domNode, {
						disableDefaultUI: true,
						zoom: 2,
						zoomControl: true,
						center: new gmaps.LatLng(region.latitude, region.longitude),
						mapTypeId: mapType(self.mapType)
					});

				function resizeMap(init) {
					// get the center
					var center = gmap.getCenter()

					setTimeout(function () {
						gevent.trigger(gmap, 'resize');

						if (!init) {
							// orientation change, recenter
							gmap.setCenter(center);
							return;
						}

						// first time, fit map region into view
						self._updateMap(region, 1);
						self._updateUserLocation(self.userLocation);
						self.annotations.forEach(self._createMarker, self);
						self._annotationEvents = [];
						self._boundsEvt = gevent.addListener(gmap, 'bounds_changed', self._fitRegion.bind(self));
					}, 25);
				}

				on.once(self, 'postlayout', function () {
					resizeMap(1);

					Gesture.addEventListener('orientationchange', function () {
						resizeMap();
					});
				});
			},

			destroy: function() {
				event.off(this._annotationEvents);
				gevent.removeListener(this._boundsEvt);
				gevent.clearInstanceListeners(this._gmap);
				this.removeAllAnnotations();
				this._gmap = null;
				View.prototype.destroy.apply(this, arguments);
			},

			addAnnotation: function(/*Object|Ti.Map.Annotation*/a) {
				if (a) {
					a.declaredClass === 'Ti.Map.Annotation' || (a = new Annotation(a));
					~this.annotations.indexOf(a) || this._createMarker(a);
					a.title && (this._annotationMap[a.title] = a);
				}
			},

			addAnnotations: function(/*Array*/annotations) {
				annotations && annotations.forEach(this.addAnnotation, this);
			},

			addRoute: function(/*Object*/route) {
				if (route && (route.points || []).length) {
					route.pline = new gmaps.Polyline({
						map: this._gmap,
						path: route.points.map(function(p) {
							return new gmaps.LatLng(p.latitude, p.longitude);
						}),
						strokeColor: route.color || '#000',
						strokeWeight: route.width || 1
					});
					this._routes.push(route);
				}
			},

			deselectAnnotation: function(/*String|Ti.Map.Annotation*/a) {
				require.is(a, 'String') && (a = this._annotationMap[a]);
				a && theInfoWindow && theInfoWindow.widgetId === a.widgetId && this._hide(a);
			},

			removeAllAnnotations: function() {
				theInfoWindow && theInfoWindow.close();
				while (this.annotations.length) {
					this.removeAnnotation(this.annotations[0]);
				}
			},

			removeAnnotation: function(/*String|Ti.Map.Annotation*/a) {
				require.is(a, 'String') && (a = this._annotationMap[a]);
				if (a) {
					var annotations = this.__values__.properties.annotations,
						p = annotations.indexOf(a);
					theInfoWindow && this._hide(a);
					gevent.removeListener(a.evt);
					a.marker.setMap(null);
					delete a.marker;
					a.destroy();
					~p && annotations.splice(p, 1);
				}
			},

			removeAnnotations: function(/*Array*/annotations) {
				annotations.forEach(function(a) {
					this.removeAnnotation(a);
				}, this);
			},

			removeRoute: function(/*Object*/route) {
				if (route && route.name) {
					var r = this._routes,
						i = 0;
					for (; i < r.length; i++) {
						if (r[i].name === route.name) {
							route.pline.setMap(null);
							delete route.pline;
							r.splice(i--, 1);
						}
					}
				}
			},

			selectAnnotation: function(/*String|Ti.Map.Annotation*/a) {
				require.is(a, 'String') && (a = this._annotationMap[a]);
				a && this._show(a);
			},

			setLocation: function(location) {
				location && (this.region = location);
				isDef(location.animate) && (this.animated = location.animate);
				isDef(location.animated) && (this.animated = location.animated);
				isDef(location.regionFit) && (this.regionFit = location.regionFit);
				this._updateMap(location);
			},

			zoom: function(level) {
				var gmap = this._gmap;
				gmap.setZoom(gmap.getZoom() + level);
			},

			_show: function(annotation, clicksource) {
				if (annotation && (!theInfoWindow || theInfoWindow.widgetId !== annotation.widgetId)) {
					var _t = this,
						widgetId = annotation.widgetId,
						cls = 'TiMapAnnotation',
						type,
						p = dom.create('div', { className: cls }),
						annotationNode = p,
						nodes = {
							annotation: annotationNode,
							leftButton: annotation.leftButton && dom.create('img', { className: cls + 'LeftButton', src: annotation.leftButton }, p),
							rightButton: annotation.rightButton && dom.create('img', { className: cls + 'RightButton', src: annotation.rightButton }, p),
							dummy: (p = dom.create('div', { className: cls + 'Content' }, p)) && 0,
							title: dom.create('h1', { innerHTML: annotation._getTitle() }, p),
							subtitle: dom.create('p', { innerHTML: annotation._getSubtitle() }, p)
						},
						shown;

					function onShow() {
						shown || (shown = 1) && _t._dispatchEvents(annotation, clicksource);
					}

					// wire up the dom nodes in the info window
					event.off(_t._annotationEvents);
					for (type in nodes) {
						(function(t, node) {
							node && _t._annotationEvents.push(on(node, 'click', function(evt) {
								event.stop(evt);
								_t._hide(annotation, t);
							}));
						}(type, nodes[type]));
					}

					// listen for updates to the annotation object
					_t._annotationEvents.push(on(annotation, 'update', this, function(args) {
						if (theInfoWindow.widgetId === widgetId) {
							var p = args.property,
								v = args.value,
								markerImg,
								amap = this._annotationMap;
							switch (p) {
								case 'title':
								case 'subtitle':
									nodes[p].innerHTML = v;
									delete amap[args.oldValue];
									v && (amap[v] = annotation);
									break;
								case 'leftButton':
								case 'rightButton':
									nodes[p].src = v;
									break;
								case 'image':
								case 'pincolor':
									markerImg = _t._getMarkerImage(annotation);
									annotation.marker.setIcon(markerImg[0]);
									annotation.marker.setShadow(markerImg[1] || null);
							}
						}
					}));

					if (theInfoWindow) {
						onShow();
						theInfoWindow.setContent(annotationNode);
					} else {
						theInfoWindow = new gmaps.InfoWindow({ content: annotationNode });
						gevent.addListener(theInfoWindow, 'domready', onShow);
						gevent.addListener(theInfoWindow, 'closeclick', function() {
							_t._hide(annotation, 'annotation');
						});
					}

					theInfoWindow.open(_t._gmap, annotation.marker);
					theInfoWindow.widgetId = annotation.widgetId;
				}
			},

			_hide: function(annotation, clicksource) {
				if (!clicksource || !~clicksource.indexOf('Button')) {
					theInfoWindow.close();
					theInfoWindow.widgetId = 0;
				}
				this._dispatchEvents(annotation, clicksource);
			},

			_dispatchEvents: function(annotation, clicksource) {
				var idx = this.annotations.indexOf(annotation),
					props = {
						annotation: annotation,
						clicksource: clicksource = clicksource || 'pin',
						index: idx,
						latitude: annotation.latitude,
						longitude: annotation.longitude,
						map: this,
						subtitle: annotation._getSubtitle(),
						title: annotation._getTitle()
					};

				fireEvent.call(this, 'singletap', props);
				fireEvent.call(this, 'click', props);
				annotation._onclick(this, idx, clicksource);
			},

			_getMarkerImage: function(a) {
				var markerImg = markers[a.pincolor | 0],
					hash,
					blob;

				if (a.image) {
					if (a.image.declaredClass === 'Ti.Blob') {
						markerImg = markers[hash = Utils.md5HexDigest(blob = a.image.toString())];
						markerImg || (markerImg = markers[hash] = [new gmaps.MarkerImage(blob)]); //, new gmaps.Size(x1, 34), new point(x2, 0), new point(10, 34));
					} else {
						markerImg = markers[a.image];
						markerImg || (markerImg = markers[a.image] = [new gmaps.MarkerImage(a.image)]);
					}
				}

				return markerImg;
			},

			_createMarker: function(a) {
				var _t = this,
					markerImg = _t._getMarkerImage(a);

				a.evt = gevent.addListener(a.marker = new gmaps.Marker({
					map: _t._gmap,
					icon: markerImg[0],
					shadow: markerImg[1],
					position: new gmaps.LatLng(a.latitude, a.longitude),
					optimized: false,
					title: a._getTitle(),
					animation: a.animate && gmaps.Animation.DROP
				}), 'click', function() {
					_t[theInfoWindow && theInfoWindow.widgetId === a.widgetId ? '_hide' : '_show'](a);
				});

				_t.__values__.properties.annotations.push(a);
			},

			_fitRegion: function() {
				var c = this.__values__.constants,
					gmap = this._gmap,
					center = gmap.getCenter(),
					bounds = gmap.getBounds(),
					ne = bounds.getNorthEast(),
					sw = bounds.getSouthWest(),
					latD = c.latitudeDelta = ne.lat() - sw.lat(),
					lngD = c.longitudeDelta = ne.lng() - sw.lng(),
					region = {
						latitude: center.lat(),
						longitude: center.lng(),
						latitudeDelta: latD,
						longitudeDelta: lngD
					};

				this.regionFit && (this.__values__.properties.region = region);

				if (!this._initialized) {
					this._initialized = 1;
					this.fireEvent('complete');
				}

				this.fireEvent('regionchanged', region);
			},

			_updateMap: function(region, dontAnimate) {
				var gmap = this._gmap;
				if (gmap) {
					var animated = !dontAnimate && this.animated,
						latD = region.latitudeDelta / 2.0,
						lngD = region.longitudeDelta / 2.0;
					gmap[animated ? 'panTo' : 'setCenter'](new gmaps.LatLng(region.latitude, region.longitude));
					gmap[animated ? 'panToBounds' : 'fitBounds'](new gmaps.LatLngBounds(
						new gmaps.LatLng(region.latitude - latD, region.longitude - lngD),
						new gmaps.LatLng(region.latitude + latD, region.longitude + lngD)
					));
				}
			},

			_updateUserLocation: function(userLocation) {
				var _t = this,
					gmap = _t._gmap;

				if (gmap && (userLocation || _t._locationInited)) {
					_t._locationInited = 1;

					Geolocation[userLocation ? 'addEventListener' : 'removeEventListener']('location', function (e) {
						var marker = _t._locationMarker,
							coords = e.coords,
							code = e.code,
							pos;

						if (coords) {
							pos = new gmaps.LatLng(coords.latitude, coords.longitude);
							if (marker) {
								marker.setPosition(pos);
							} else {
								_t._locationMarker = new gmaps.Marker({
									map: _t._gmap,
									icon: locationMarkerImage,
									position: pos
								});
							}
						} else if ('code' in e) {
							Ti.API.warn('Geolocation error: ' + (code === Geolocation.ERROR_DENIED ? 'permission denied' : code === Geolocation.ERROR_TIMEOUT ? 'timeout' : code === Geolocation.ERROR_LOCATION_UNKNOWN ? 'position unavailable' : 'unknown'));
						}
					});

					if (!Geolocation.locationServicesEnabled) {
						Ti.API.warn('Geolocation services unavailable');
						_t.__values__.properties.userLocation = false;
					} else if (!userLocation || _t._locationMarker) {
						_t._locationMarker.setVisible(userLocation);
					}
				}
			},

			fireEvent: function(type, e) {
				/(click|singletap)/.test(type) || View.prototype.fireEvent.apply(this,arguments);
			},

			constants: {
				latitudeDelta: 0,
				longitudeDelta: 0
			},

			properties: {
				animated: false,
				annotations: {
					set: function(value) {
						value = value.filter(function(a) { return a && a.declaredClass === 'Ti.Map.Annotation'; });
						if (this._gmap) {
							this.removeAllAnnotations();
							value.forEach(this._createMarker, this);
						}
						return value;
					}
				},
				mapType: {
					set: function(value) {
						this._gmap && this._gmap.setMapTypeId(mapType(value));
						return value;
					}
				},
				region: {
					set: function(newValue, oldValue) {
						return require.mix({}, defaultRegion, oldValue, newValue);
					},
					post: function(newValue, oldValue) {
						newValue !== oldValue && this._updateMap(newValue);
					},
					value: null
				},
				regionFit: true,
				userLocation: {
					post: function(value) {
						this._updateUserLocation(value);
					},
					value: false
				}
			}

		});

	window.TiMapViewInit = function() {
		gmaps = google.maps;
		gevent = gmaps.event;

		var i,
			prefix = 'themes/' + require.config.ti.theme + '/Map/',
			point = gmaps.Point;

		function makeMarker(color, x1, x2) {
			return new gmaps.MarkerImage(prefix + 'marker_' + color + '.png', new gmaps.Size(x1, 34), new point(x2, 0), new point(10, 34));
		}

		for (i in markers) {
			markers[i] = [makeMarker(markers[i], 20, 0), makeMarker(markers[i], 37, 20)];
		}

		locationMarkerImage = new gmaps.MarkerImage(prefix + 'location.png', new gmaps.Size(22, 22), new point(0, 0), new point(11, 11));

		onload();
	};

	require(['//maps.googleapis.com/maps/api/js?key=' + Properties.getString('ti.map.apikey', '') + '&sensor=true&callback=TiMapViewInit'], 0, onload);

	return MapView;

});
},
"Ti/Media/AudioPlayer":function(){
/* /titanium/Ti/Media/AudioPlayer.js */

define(["Ti/_/declare", "Ti/_/Evented"], function(declare, Evented) {
	
	return declare("Ti.Media.AudioPlayer", Evented, {
	});

});
},
"Ti/Media/Sound":function(){
/* /titanium/Ti/Media/Sound.js */

define(["Ti/_/declare", "Ti/_/Evented"], function(declare, Evented) {
	
	return declare("Ti.Media.Sound", Evented, {
	});

});
},
"Ti/Media/VideoPlayer":function(){
/* /titanium/Ti/Media/VideoPlayer.js */

define(["Ti/_/declare", "Ti/_/dom", "Ti/_/event", "Ti/_/lang", "Ti/Media", "Ti/UI/View"],
	function(declare, dom, event, lang, Media, View) {

	var doc = document,
		on = require.on,
		prefixes = require.config.vendorPrefixes.dom,
		STOPPED = 0,
		STOPPING = 1,
		PAUSED = 2,
		PLAYING = 3,
		requestFullScreen = "requestFullScreen",
		exitFullScreen = "exitFullScreen",
		nativeFullScreen = (function() {
			for (var i = 0, prefix; i < prefixes.length; i++) {
				prefix = prefixes[i].toLowerCase();
				if (doc[prefix + "CancelFullScreen"]) {
					requestFullScreen = prefix + "RequestFullScreen";
					exitFullScreen = prefix + "ExitFullScreen";
					return 1;
				}
			}
			return !!doc.cancelFullScreen;
		}()),
		fakeFullscreen = true,
		mimeTypes = {
			"m4v": "video/mp4",
			"mov": "video/quicktime",
			"mp4": "video/mp4",
			"ogg": "video/ogg",
			"ogv": "video/ogg",
			"webm": "video/webm"
		};

	function isFullScreen(fs) {
		return nativeFullScreen ? (!!doc.mozFullScreen || !!doc.webkitIsFullScreen) : !!fs;
	}

	return declare("Ti.Media.VideoPlayer", View, {

		_currentState: STOPPED,

		constructor: function() {
			this._handles = [];
		},

		properties: {
			autoplay: false,
			currentPlaybackTime: {
				get: function() {
					return this._video ? this._video.currentTime * 1000 : 0;
				},
				set: function(value) {
					this._video && (this._video.currentTime = (value / 1000) | 0);
					return value;
				}
			},
			fullscreen: {
				value: isFullScreen(),

				set: function(value) {
					var h,
						v = this._video;

					value = !!value;
					if (nativeFullScreen) {
						try {
							value === isFullScreen() && (value = !value);
							v[value ? requestFullScreen : exitFullScreen]();
						} catch(ex) {}
					} else if (fakeFullscreen) {
						v.className = value ? "fullscreen" : "";
						value && (h = on(window, "keydown", function(e) {
							if (e.keyCode === 27) {
								this.fullscreen = 0;
								h();
							}
						}));
					}

					this.fireEvent("fullscreen", {
						entering: value
					});

					return value;
				}
			},
			mediaControlStyle: {
				value: Media.VIDEO_CONTROL_DEFAULT,
				set: function(value) {
					this._video && (this._video.controls = value === Media.VIDEO_CONTROL_DEFAULT);
					return value;
				}
			},
			repeatMode: Media.VIDEO_REPEAT_MODE_NONE,
			scalingMode: {
				set: function(value) {
					var n = this.domNode,
						fit = Media.VIDEO_SCALING_ASPECT_FIT,
						m = {};

					m[Media.VIDEO_SCALING_NONE] = "TiScalingNone";
					m[fit] = "TiScalingAspectFit";
					n.className = n.className.replace(/(scaling\-[\w\-]+)/, "") + ' ' + (m[value] || m[value = fit]);
					return value;
				}
			},
			url: {
				set: function(value) {
					this.__values__.constants.playing = false;
					this._currentState = STOPPED;
					this.__values__.properties.url = value;
					this._createVideo();
					return value;
				}
			}
		},

		constants: {
			playbackState: Media.VIDEO_PLAYBACK_STATE_STOPPED,
			playing: false,
			initialPlaybackTime: 0,
			endPlaybackTime: 0,
			playableDuration: 0,
			loadState: Media.VIDEO_LOAD_STATE_UNKNOWN,
			duration: 0
		},

		_set: function(type, state) {
			var evt = {};
			evt[type] = this.__values__.constants[type] = state;
			this.fireEvent(type.toLowerCase(), evt);
		},

		_complete: function(evt) {
			var ended = evt.type === "ended";
			this.__values__.constants.playing = false;
			this._currentState = STOPPED;
			this.fireEvent("complete", {
				reason: ended ? Media.VIDEO_FINISH_REASON_PLAYBACK_ENDED : Media.VIDEO_FINISH_REASON_USER_EXITED
			});
			ended && this.repeatMode === Media.VIDEO_REPEAT_MODE_ONE && setTimeout(lang.hitch(this, function() { this._video.play(); }), 1);
		},

		_stalled: function() {
			this._set("loadState", Media.VIDEO_LOAD_STATE_STALLED);
		},

		_fullscreenChange: function(e) {
			this.__values__.properties.fullscreen = !isFullScreen(this.fullscreen);
		},

		_durationChange: function() {
			var d = this._video.duration * 1000,
				c = this.__values__.constants;
			if (d !== Infinity) {
				this.duration || this.fireEvent("durationavailable", {
					duration: d
				});
				c.duration = c.playableDuration = c.endPlaybackTime = d;
			}
		},

		_paused: function() {
			var pbs = Media.VIDEO_PLAYBACK_STATE_STOPPED;
			this.__values__.constants.playing = false;
			if (this._currentState === PLAYING) {
				this._currentState = PAUSED;
				pbs = Media.VIDEO_PLAYBACK_STATE_PAUSED;
			} else if (this._currentState === STOPPING) {
				this._video.currentTime = 0;
			}
			this._set("playbackState", pbs);
		},

		_createVideo: function(dontCreate) {
			var i, match,
				video = this._video,
				url = this.url,
				c = this.__values__.constants;

			if (!url) {
				return;
			}

			if (dontCreate && video && video.parentNode) {
				return video;
			}

			this.release();

			video = this._video = dom.create("video", {
				tabindex: 0
			});

			this.mediaControlStyle === Media.VIDEO_CONTROL_DEFAULT && (video.controls = 1);
			this.scalingMode = Media.VIDEO_SCALING_ASPECT_FIT;

			this._handles = [
				on(video, "playing", this, function() {
					this._currentState = PLAYING;
					c.playing = true;
					this.fireEvent("playing", {
						url: video.currentSrc
					});
					this._set("playbackState", Media.VIDEO_PLAYBACK_STATE_PLAYING);
				}),
				on(video, "pause", this, "_paused"),
				on(video, "canplay", this, function() {
					this._set("loadState", Media.VIDEO_LOAD_STATE_PLAYABLE);
					this._currentState === STOPPED && this.autoplay && video.play();
				}),
				on(video, "canplaythrough", this, function() {
					this._set("loadState", Media.VIDEO_LOAD_STATE_PLAYTHROUGH_OK);
					this.fireEvent("preload");
				}),
				on(video, "loadeddata", this, function() {
					this.fireEvent("load");
				}),
				on(video, "loadedmetadata", this, "_durationChange"),
				on(video, "durationchange", this, "_durationChange"),
				on(video, "timeupdate", this, function() {
					c.currentPlaybackTime = this._video.currentTime * 1000;
					this._currentState === STOPPING && this.pause();
				}),
				on(video, "error", this, function() {
					var msg = "Unknown error";
					switch (video.error.code) {
						case 1: msg = "Aborted"; break;
						case 2: msg = "Decode error"; break;
						case 3: msg = "Network error"; break;
						case 4: msg = "Unsupported format";
					}
					c.playing = false;
					this._set("loadState", Media.VIDEO_LOAD_STATE_UNKNOWN);
					this.fireEvent("error", {
						message: msg
					});
					this.fireEvent("complete", {
						reason: Media.VIDEO_FINISH_REASON_PLAYBACK_ERROR
					});
				}),
				on(video, "abort", this, "_complete"),
				on(video, "ended", this, "_complete"),
				on(video, "stalled", this, "_stalled"),
				on(video, "waiting", this, "_stalled"),
				on(video, "mozfullscreenchange", this, "_fullscreenChange"),
				on(video, "webkitfullscreenchange", this, "_fullscreenChange")
			];

			this.domNode.appendChild(video);

			require.is(url, "Array") || (url = [url]);

			for (i = 0; i < url.length; i++) {
				match = url[i].match(/.+\.([^\/\.]+?)$/);
				dom.create("source", {
					src: url[i],
					type: match && mimeTypes[match[1]]
				}, video);
			}

			return video;
		},

		play: function() {
			this._currentState !== PLAYING && this._createVideo(1).play();
		},

		pause: function() {
			this._currentState === PLAYING && this._createVideo(1).pause();
		},

		destroy: function() {
			this.release();
			View.prototype.destroy.apply(this, arguments);
		},

		release: function() {
			var i,
				video = this._video,
				parent = video && video.parentNode;
			this._currentState = STOPPED;
			this.__values__.constants.playing = false;
			if (parent) {
				event.off(this._handles);
				parent.removeChild(video);
			}
			this._video = null;
		},

		stop: function() {
			var v = this._video;
			this._currentState = STOPPING;
			if (v) {
				v.pause();
				v.currentTime = 0;
			}
		}

	});

});

},
"Ti/Network/HTTPClient":function(){
/* /titanium/Ti/Network/HTTPClient.js */

define(["Ti/_", "Ti/_/declare", "Ti/_/has", "Ti/_/lang", "Ti/_/Evented", "Ti/Filesystem", "Ti/Network", "Ti/Blob", "Ti/_/event", "Ti/App"],
	function(_, declare, has, lang, Evented, Filesystem, Network, Blob, event, App) {

	var is = require.is,
		on = require.on;

	return declare("Ti.Network.HTTPClient", Evented, {

		constructor: function() {
			var xhr = this._xhr = new XMLHttpRequest;

			this._handles = [
				on(xhr, "error", this, "_onError"),
				xhr.upload && on(xhr.upload, "error", this, "_onError"),
				on(xhr, "progress", this, function(evt) {
					evt.progress = evt.lengthComputable ? evt.loaded / evt.total : false;
					is(this.ondatastream, "Function") && this.ondatastream.call(this, evt);
				}),
				xhr.upload && on(xhr.upload, "progress", this, function(evt) {
					evt.progress = evt.lengthComputable ? evt.loaded / evt.total : false;
					is(this.onsendstream, "Function") && this.onsendstream.call(this, evt);
				})
			];

			xhr.onreadystatechange = lang.hitch(this, function() {
				var c = this.__values__.constants,
					f,
					onload = this.onload;

				switch (xhr.readyState) {
					case 0: c.readyState = this.UNSENT; break;
					case 1: c.readyState = this.OPENED; break;
					case 2: c.readyState = this.LOADING; break;
					case 3: c.readyState = this.HEADERS_RECEIVED; break;
					case 4:
						clearTimeout(this._timeoutTimer);
						this._completed = 1;
						c.readyState = this.DONE;

						if (!this._aborted) {
							if (f = this.file) {
								f = Filesystem.getFile(f);
								f.writable && f.write(xhr.responseText);
							}

							c.responseText = xhr.responseText;
							c.responseData = new Blob({
								data: xhr.responseText,
								length: xhr.responseText.length,
								mimeType: xhr.getResponseHeader("Content-Type") || "text/plain"
							});
							c.responseXML = xhr.responseXML;

							has("ti-instrumentation") && (instrumentation.stopTest(this._requestInstrumentationTest, this.location));

							xhr.status >= 400 && (onload = this._onError);
							is(onload, "Function") && onload.call(this);
						}
				}

				this._fireStateChange();
			});
		},

		destroy: function() {
			if (this._xhr) {
				this._xhr.abort();
				this._xhr = null;
			}
			event.off(this._handles);
			Evented.destroy.apply(this, arguments);
		},

		_onError: function(error) {
			is(error, "Object") || (error = { message: error });
			error.source = this;
			error.type = "error";
			error.error || (error.error = error.message || this._xhr.status);
			parseInt(error.error) || (error.error = "Can't reach host");
			is(this.onerror, "Function") && this.onerror.call(this, error);
		},

		abort: function() {
			clearTimeout(this._timeoutTimer);
			this._aborted = 1;
			this.connected && this._xhr.abort();
			this.__values__.constants.readyState = this.UNSENT;
			this._fireStateChange();
		},

		_fireStateChange: function() {
			is(this.onreadystatechange, "Function") && this.onreadystatechange.call(this);
		},

		getResponseHeader: function(name) {
			return this._xhr.readyState > 1 ? this._xhr.getResponseHeader(name) : null;
		},

		open: function(method, url, async) {
			var httpURLFormatter = Ti.Network.httpURLFormatter,
				c = this.__values__.constants,
				wc = this.withCredentials,
				loc = _.getAbsolutePath(httpURLFormatter ? httpURLFormatter(url) : url),
				parts = loc.match(/^((?:.+\:)?\/\/)?(?:.+@)?(.*)$/);

			if (parts && this.username && this.password) {
				loc = (parts[1] || '') + (this.domain ? this.domain + '\\' : '') + this.username + ':' + this.password + '@' + parts[2];
			}

			this.abort();
			this._xhr.open(
				c.connectionType = method,
				c.location = loc,
				wc || async === void 0 ? true : !!async
			);
			wc && (this._xhr.withCredentials = wc);
		},

		send: function(args){
			try {
				var timeout = this.timeout | 0;
				this._aborted = this._completed = 0;
				has("ti-instrumentation") && (this._requestInstrumentationTest = instrumentation.startTest("HTTP Request"));
				args = is(args, "Object") ? lang.urlEncode(args) : args;
				this._contentTypeSet || args && this._xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				this._xhr.setRequestHeader('X-Titanium-Id', App.guid);
				this._xhr.send(args);
				clearTimeout(this._timeoutTimer);
				timeout && (this._timeoutTimer = setTimeout(lang.hitch(this, function() {
					if (this.connected) {
						this.abort();
						!this._completed && this._onError("Request timed out");
					}
				}), timeout));
			} catch (ex) {}
		},

		setRequestHeader: function(name, value) {
			name === 'Content-Type' && (this._contentTypeSet = 1);
			this._xhr.setRequestHeader(name, value);
		},

		properties: {
			ondatastream: void 0,
			onerror: void 0,
			onload: void 0,
			onreadystatechange: void 0,
			onsendstream: void 0,
			timeout: void 0,
			username: null,
			password: null,
			domain: null,
			withCredentials: false
		},

		constants: {
			DONE: 4,

			HEADERS_RECEIVED: 2,

			LOADING: 3,

			OPENED: 1,

			UNSENT: 1,

			connected: function() {
				return this.readyState >= this.OPENED;
			},

			connectionType: void 0,

			location: void 0,

			readyState: this.UNSENT,

			responseData: void 0,

			responseText: void 0,

			responseXML: void 0,

			status: function() {
				return this._xhr.status;
			},

			statusText: function() {
				return this._xhr.statusText;
			}
		}

	});

});

},
"Ti/Platform/DisplayCaps":function(){
/* /titanium/Ti/Platform/DisplayCaps.js */

define(["Ti/_", "Ti/_/Evented", "Ti/_/lang"], function(_, Evented, lang) {

	var ua = navigator.userAgent.toLowerCase(),
		dc = lang.setObject("Ti.Platform.DisplayCaps", Evented, {
			constants: {
				density: function(){
					switch (ua) {
						case "iphone":
							return "medium";
						case "ipad":
							return "medium";
						default:
							return "";
					}
				},
	
				dpi: _.dpi,
	
				platformHeight: window.innerHeight,
	
				platformWidth: window.innerWidth
			}
		});

	return Ti.Platform.displayCaps = dc;

});
},
"Ti/UI/2DMatrix":function(){
/* /titanium/Ti/UI/2DMatrix.js */

define(["Ti/_/declare", "Ti/_/Evented", "Ti/_/lang", "Ti/Platform"],
	function(declare, Evented, lang, Platform) {

	var isFF = Platform.runtime === "gecko",
		api,
		px = function(x) {
			return isFF ? x + "px" : x;
		};

	function detMinor(y, x, m) {
		var x1 = x == 0 ? 1 : 0,
			x2 = x == 2 ? 1 : 2,
			y1 = y == 0 ? 1 : 0,
			y2 = y == 2 ? 1 : 2;
		return (m[y1][x1] * m[y2][x2]) - (m[y1][x2] * m[y2][x1]);
	}

	function mult(obj, a, b, c, d, tx, ty, r) {
		return {
			a: obj.a * a + obj.b * c,
			b: obj.a * b + obj.b * d,
			c: obj.c * a + obj.d * c,
			d: obj.c * b + obj.d * d,
			tx: obj.a * tx + obj.b * ty + obj.tx,
			ty: obj.c * tx + obj.d * ty + obj.ty,
			rotation: obj.rotation + (r | 0)
		};
	}

	return api = declare("Ti.UI.2DMatrix", Evented, {

		properties: {
			a: 1,
			b: 0,
			c: 0,
			d: 1,
			tx: 0,
			ty: 0,
			rotation: 0
		},

		constructor: function(matrix) {
			matrix && require.mix(this, matrix);
		},

		invert: function() {
			var x = 0,
				y = 0,
				m = [[this.a, this.b, this.tx], [this.c, this.d, this.ty], [0, 0, 1]],
				n = m,
				det = this.a * detMinor(0, 0, m) - this.b * detMinor(0, 1, m) + this.tx * detMinor(0, 2, m);

			if (Math.abs(det) > 1e-10) {
				det = 1.0 / det;
				for (; y < 3; y++) {
					for (; x < 3; x++) {
						n[y][x] = detMinor(x, y, m) * det;
						(x + y) % 2 == 1 && (n[y][x] = -n[y][x]);
					}
				}
			}

			return new api(mult(this, n[0][0], n[0][1], n[1][0], n[1][1], n[0][2], n[1][2]));
		},

		multiply: function(other) {
			return new api(mult(this, other.a, other.b, other.c, other.d, other.tx, other.ty, other.rotation));
		},

		rotate: function(angle) {
			return new api({ a: this.a, b: this.b, c: this.c, d: this.d, tx: this.tx, ty: this.ty, rotation: this.rotation + angle });
		},

		scale: function(x, y) {
			return new api(mult(this, x, 0, 0, lang.val(y, x), 0, 0));
		},

		translate: function(x, y) {
			return new api(mult(this, 1, 0, 0, 1, x, y));
		},

		toCSS: function() {
			var i = 0,
				v = [this.a, this.b, this.c, this.d, this.tx, this.ty];
	
			for (; i < 6; i++) {
				v[i] = v[i].toFixed(6);
				i > 4 && (v[i] = px(v[i]));
			}

			return "matrix(" + v.join(",") + ") rotate(" + this.rotation + "deg)";
		}

	});

});

},
"Ti/UI/ActivityIndicator":function(){
/* /titanium/Ti/UI/ActivityIndicator.js */

define(['Ti/_/declare', 'Ti/_/lang', 'Ti/_/UI/Widget', 'Ti/_/dom', 'Ti/_/style', 'Ti/Locale', 'Ti/UI', 'Ti/UI/ActivityIndicatorStyle'],
	function(declare, lang, Widget, dom, style, Locale, UI, ActivityIndicatorStyle) {

	var opacity = 0.3,
		setStyle = style.set;

	return declare('Ti.UI.ActivityIndicator', Widget, {

		constructor: function() {
			var contentContainer = this._contentContainer = UI.createView({
					layout: UI._LAYOUT_CONSTRAINING_HORIZONTAL,
					width: UI.SIZE,
					height: UI.SIZE
				});
			this._add(contentContainer);

			Widget.prototype.hide.call(this);

			contentContainer._add(this._indicatorIndicator = UI.createView());
			contentContainer._add(this._indicatorMessage = UI.createLabel());

			this._createProngs();
		},

		_createProngs: function() {

			var i = 0,
				prongs = this._prongs = [],
				indicator = this._indicatorIndicator,
				indicatorDomNode = indicator.domNode,
				backgroundColor = this.indicatorColor,
				diameter = this.indicatorDiameter,
				scale = diameter / 36,
				prongContainer;

			// Set the container size
			indicator.width = indicator.height = diameter;

			// Remove any old children
			while (indicatorDomNode.firstChild) {
				indicatorDomNode.removeChild(indicatorDomNode.firstChild);
			}

			// Add the prong container
			prongContainer = dom.create('div', {
				className: 'TiUIActivityIndicatorProngContainer',
				style: {
					transformOrigin: '0px 0px',
					transform: 'scale(' + scale + ')'
				}
			}, indicatorDomNode);

			// Add the new prongs
			for (; i < 12; i++) {
				prongs.push(dom.create('div', {
					className: 'TiUIActivityIndicatorProng',
					style: {
						transform: 'translate(16px,0px) rotate(' + i * 30 + 'deg)',
						transformOrigin: '2px 18px',
						opacity: opacity,
						backgroundColor: backgroundColor
					}
				}, prongContainer));
			}
		},

		show: function() {
			Widget.prototype.show.call(this);
			this._timer = setInterval(lang.hitch(this, '_animate'), 100);
		},

		hide: function() {
			clearTimeout(this._timer);
			Widget.prototype.hide.call(this);
		},

		_currentProng: 0,

		_animate: function() {
			var prong = this._prongs[this._currentProng];
			++this._currentProng == 12 && (this._currentProng = 0);
			setStyle(prong, 'transition', '');
			setTimeout(function() {
				setStyle(prong, 'opacity', 1);
				setTimeout(function() {
					setStyle(prong, 'transition', 'opacity 500ms linear 0ms');
					setTimeout(function() {
						setStyle(prong, 'opacity', opacity);
					}, 1);
				}, 1);
			}, 1);
		},

		_defaultWidth: UI.SIZE,

		_defaultHeight: UI.SIZE,

		_messagePadding: 0,

		properties: {
			color: {
				set: function(value) {
					return this._indicatorMessage.color = value;
				}
			},
			font: {
				set: function(value) {
					return this._indicatorMessage.font = value;
				}
			},
			indicatorColor: {
				post: '_createProngs',
				value: '#fff'
			},
			indicatorDiameter: {
				post: '_createProngs',
				value: 36
			},
			message: {
				set: function(value) {
					var indicatorMessage = this._indicatorMessage;
					indicatorMessage.left = value ? 5 : 0;
					return indicatorMessage.text = value;
				}
			},
			messageid: {
				set: function(value) {
					var indicatorMessage = this._indicatorMessage;
					indicatorMessage.left = value ? 5 : 0;
					return indicatorMessage.textid = value;
				}
			},
			style: {
				set: function(value) {
					if (~[ActivityIndicatorStyle.DARK, ActivityIndicatorStyle.BIG_DARK].indexOf(value)) {
						this.indicatorColor = '#444';
					} else {
						this.indicatorColor = '#fff';
					}
					if (~[ActivityIndicatorStyle.BIG, ActivityIndicatorStyle.BIG_DARK].indexOf(value)) {
						this.indicatorDiameter = 72;
					} else {
						this.indicatorDiameter = 36;
					}
				}
			}
		}

	});
});
},
"Ti/UI/ActivityIndicatorStyle":function(){
/* /titanium/Ti/UI/ActivityIndicatorStyle.js */

define(["Ti/_/lang"], function(lang) {

	return lang.setObject("Ti.UI.ActivityIndicatorStyle", {
		constants: {
			BIG: 0,
			BIG_DARK: 1,
			DARK: 2,
			PLAIN: 3
		}
	});
	
});
},
"Ti/UI/AlertDialog":function(){
/* /titanium/Ti/UI/AlertDialog.js */

/*global define*/
define(['Ti/_/css', 'Ti/_/declare', 'Ti/_/lang', 'Ti/_/Evented', 'Ti/Locale', 'Ti/UI', 'Ti/_/style'],
	function(css, declare, lang, Evented, Locale, UI, style) {

	return declare('Ti.UI.AlertDialog', Evented, {

		show: function() {
			// Create the window and a background to dim the current view
			var alertWindow = this._alertWindow = UI.createWindow(),
				dimmingView = UI.createView({
					backgroundColor: 'black',
					opacity: 0,
					left: 0,
					top: 0,
					right: 0,
					bottom: 0
				}),
				alertDialog = UI.createView({
					backgroundColor: 'white',
					borderRadius: 3,
					height: UI.SIZE,
					layout: UI._LAYOUT_CONSTRAINING_VERTICAL,
					opacity: 0,
					width: '50%'
				}),
				buttons = this.buttonNames || [];

			alertWindow._add(dimmingView);
			alertWindow._add(alertDialog);
			style.set(alertWindow.domNode, 'zIndex', 2147483647);

			// Add the title
			alertDialog._add(UI.createLabel({
				text: Locale._getString(this.titleid, this.title),
				font: {fontWeight: 'bold'},
				left: 5,
				right: 5,
				top: 5,
				height: UI.SIZE,
				textAlign: UI.TEXT_ALIGNMENT_CENTER
			}));

			// Add the message
			alertDialog._add(UI.createLabel({
				text: Locale._getString(this.messageid, this.message),
				left: 5,
				right: 5,
				top: 5,
				height: UI.SIZE,
				textAlign: UI.TEXT_ALIGNMENT_CENTER
			}));

			buttons.length || buttons.push(Locale._getString(this.okid, this.ok || 'OK'));

			buttons.forEach(function(title, i) {
				var button = UI.createButton({
					left: 5,
					right: 5,
					top: 5,
					bottom: i === buttons.length - 1 ? 5 : 0,
					height: UI.SIZE,
					title: title,
					index: i
				});
				i === this.cancel && css.add(button.domNode, 'TiUIElementGradientCancel');
				alertDialog.add(button);
				button.addEventListener('singletap', lang.hitch(this, function(){
					alertWindow.close();
					this._alertWindow = void 0;
					this.fireEvent('click', {
						index: i,
						cancel: this.cancel === i
					});
				}));
			}, this);

			// Animate the background after waiting for the first layout to occur
			dimmingView.addEventListener('postlayout', function() {
				setTimeout(function(){ // We have to wait for the entire layout pass to complete and the CSS rules to be applied.
					dimmingView.animate({
						opacity: 0.5,
						duration: 200
					}, function(){
						alertDialog.animate({
							opacity: 1,
							duration: 200
						});
					});
				}, 0);
			});

			// Show the alert dialog
			alertWindow.open();
		},

		hide: function() {
			this._alertWindow && this._alertWindow.close();
		},

		properties: {
			buttonNames: void 0,
			cancel: -1,
			message: void 0,
			messageid: void 0,
			ok: void 0,
			okid: void 0,
			title: void 0,
			titleid: void 0
		}

	});

});

},
"Ti/UI/Clipboard":function(){
/* /titanium/Ti/UI/Clipboard.js */

define(["Ti/_/Evented", "Ti/_/lang"], function(Evented, lang) {

	var storageKey = "ti:clipboard",
		plainText = "text/plain",
		error = 'Missing required argument "type"',
		value = localStorage.getItem(storageKey),
		cache = (require.is(value, "String") && JSON.parse(value)) || {};

	function get(type) {
		if (!type) {
			throw new Error(error);
		}
		return cache[type];
	}

	function set(type, data) {
		if (!type) {
			throw new Error(error);
		}
		if (data) {
			cache[type] = data;
		} else {
			delete cache[type];
		}
		save()
	}

	function save() {
		localStorage.setItem(storageKey, JSON.stringify(cache));
	}

	return lang.setObject("Ti.UI.Clipboard", Evented, {

		clearData: function() {
			cache = {};
			save();
		},

		clearText: function() {
			set(plainText);
		},

		getData: function(type) {
			return get(type) || null;
		},

		getText: function() {
			return get(plainText) || null;
		},

		hasData: function(type) {
			return !!get(type);
		},

		hasText: function() {
			return !!get(plainText);
		},

		setData: function(type, data) {
			set(type, data);
		},

		setText: function(text) {
			set(plainText, text);
		}

	});

});
},
"Ti/UI/EmailDialog":function(){
/* /titanium/Ti/UI/EmailDialog.js */

define(["Ti/_", "Ti/_/declare", "Ti/_/Evented", "Ti/_/lang"],
	function(_, declare, Evented, lang) {

	return declare("Ti.UI.EmailDialog", Evented, {

		open: function() {
			var r = this.toRecipients || [],
				url = "mailto:" + r.join(","),
				i, j,
				fields = {
					subject: "subject",
					ccRecipients: "cc",
					bccRecipients: "bcc",
					messageBody: "body"
				},
				params = {};

			for (i in fields) {
				if (j = this[i]) {
					require.is(j, "Array") && (j = j.join(","));
					params[fields[i]] = j;
				}
			}

			this.html || params.body && (params.body = _.escapeHtmlEntities(params.body));
			params = lang.urlEncode(params);

			location.href = url + (params ? "?" + params : "");

			this.fireEvent("complete", {
				result: this.SENT,
				success: true
			});
		},
		
		isSupported: function() {
			return true;
		},

		constants: {
			CANCELLED: 0,
			FAILED: 3,
			SAVED: 1,
			SENT: 2
		},

		properties: {
		    bccRecipients: void 0,
		    ccRecipients: void 0,
		    html: false,
		    messageBody: void 0,
		    subject: void 0,
		    toRecipients: void 0
		}

	});

});

},
"Ti/UI/ImageView":function(){
/* /titanium/Ti/UI/ImageView.js */

define(["Ti/_/declare", "Ti/_/event", "Ti/_/lang", "Ti/_/style", "Ti/_/UI/Widget", "Ti/UI", "Ti/Filesystem"],
	function(declare, event, lang, style, Widget, UI, Filesystem) {

	var setStyle = style.set,
		is = require.is,
		on = require.on,
		InternalImageView = declare(Widget, {

			domType: "img",
			onload: null,
			onerror: null,

			constructor: function() {
				this.domNode.ondragstart = function() { return false; }; // Prevent images from being dragged
			},

			_getContentSize: function() {
				return {
					width: this.domNode.width,
					height: this.domNode.height
				}
			},

			_preLayout: function(boundingWidth, boundingHeight, isParentWidthSize, isParentHeightSize) {
				// We have to remove the old style to get the image to scale to its default size,
				// otherwise we are just reading in whatever we set in the last doLayout(), which is
				// 0 if the image was not loaded...thus always clamping it to 0.
				this.domNode.style.width = "";
				this.domNode.style.height = "";

				var imageRatio = this.domNode.width / this.domNode.height,
					values = this.__values__.properties,
					oldWidth = values.width,
					oldHeight = values.height;

				if (!isParentWidthSize && !isParentHeightSize) {
					if (boundingWidth / boundingHeight > imageRatio) {
						values.width = boundingHeight * imageRatio;
						values.height = boundingHeight;
					} else {
						values.width = boundingWidth;
						values.height = boundingWidth / imageRatio;
					}
				} else if (!isParentWidthSize) {
					values.width = boundingWidth;
					values.height = boundingWidth / imageRatio;
				} else if (!isParentHeightSize) {
					values.width = boundingHeight * imageRatio;
					values.height = boundingHeight;
				} else {
					values.width = UI.SIZE;
					values.height = UI.SIZE;
				}

				return oldWidth !== values.width || oldHeight !== values.height;
			},

			_imageRatio: 1,

			properties: {
				src: {
					set: function(value) {
						var node = this.domNode,
							disp = "none",
							handles,
							onerror = lang.hitch(this, function(e) {
								event.off(handles);
								this._triggerLayout();
								this.onerror && this.onerror(e);
							});

						if (value) {
							value = value.replace(/^(\/|\.\/)/, '');
							disp = "inherit";
							handles = [
								on(node, "load", this, function() {
									node.style.width = "";
									node.style.height = "";
									var imageRatio = node.width / node.height;
									isNaN(imageRatio) && (imageRatio = node.width === 0 ? 1 : Infinity);
									this._imageRatio = imageRatio;
									this._triggerLayout();
									this.onload && this.onload();
								}),
								on(node, "error", onerror),
								on(node, "abort", onerror)
							];
							node.src = require.cache(value) || value;
						}

						setStyle(node, "display", disp);
						return value;
					}
				}
			}
		});

	return declare("Ti.UI.ImageView", Widget, {

		_createImage: function(src, onload, onerror) {
			var m = is(src, "String") && src.match(/^(.+)\:\/\//);
			m && ~Filesystem.protocols.indexOf(m[1]) && (src = Filesystem.getFile(src));
			switch (src && src.declaredClass) {
				case "Ti.Filesystem.File":
					src = src.read();
				case "Ti.Blob":
					src = src.toString();
			}
			return new InternalImageView({
				onload: onload,
				onerror: onerror,
				src: src
			});
		},

		_defaultWidth: UI.SIZE,

		_defaultHeight: UI.SIZE,

		_slideshowCount: 0,

		_setSlideshowInterval: function() {
			var self = this,
				imgs = self._images;
			clearInterval(this._slideshowTimer);

			this._slideshowTimer = setInterval(function(){
				var rollover = false;

				setStyle(imgs[self._currentIndex].domNode, "display", "none");

				if (self.reverse) {
					if (--self._currentIndex === 0) {
						self._currentIndex = self.images.length - 1;
						rollover = true;
					}
				} else if (++self._currentIndex === self.images.length) {
					self._currentIndex = 0;
					rollover = true;
				}

				setStyle(imgs[self._currentIndex].domNode, "display", "inherit");

				if (self.repeatCount && rollover && ++self._slideshowCount === self.repeatCount) {
					self.stop();
					return;
				}

				self.fireEvent("change", {
					index: self._currentIndex
				});
			}, this.duration);
		},

		start: function(){
			if (this._images) {
				this._setState(0, 1);
				this._slideshowCount = 0;
				this._setSlideshowInterval();
				this.fireEvent("start");
			}
		},

		stop: function(){
			var imgs = this._images;
			if (imgs) {
				clearInterval(this._slideshowTimer);
				if (imgs.length) {
					var start = 0;
					this.reverse && (start = imgs.length - 1);
					this._currentIndex && setStyle(imgs[this._currentIndex].domNode, "display", "none");
					setStyle(imgs[start].domNode, "display", "inherit");
					this._currentIndex = start;
				}
				this._setState(0, 0);
				this.fireEvent("stop");
			}
		},

		pause: function(){
			if (this._images) {
				clearInterval(this._slideshowTimer);
				this._setState(1, 0);
				this.fireEvent("pause");
			}
		},

		resume: function() {
			if (this._images) {
				this._setSlideshowInterval();
				this._setState(0, 1);
			}
		},

		_setState: function(paused, animating) {
			var c = this.__values__.constants;
			c.paused = !!paused;
			c.animating = !!animating;
		},

		constants: {
			animating: false,
			paused: false
		},

		properties: {
			duration: {
				set: function(value) {
					return Math.max(30, value);
				},
				value: 200
			},

			image: {
				set: function(value) {
					this._removeAllChildren();
					this._images = void 0;
					var self = this; //Need to get event context
					this._add(this._createImage(value, function() {
						self.fireEvent("load", {
							state: "image"
						});
					}, function(e) {
						this.fireEvent("error", e);
					}));
					return value;
				}
			},

			images: {
				set: function(value) {
					var imgs = void 0,
						counter = 0,
						errored = 0;
					this._removeAllChildren();
					if (is(value, "Array")) {
						imgs = [];
						value.forEach(function(val) {
							var img = this._createImage(val, function() {
								!errored && ++counter === value.length && this.fireEvent("load", {
									state: "image"
								});
							}, function(e) {
								errored || (errored = 1) && this.fireEvent("error", e);
							});
							setStyle(img.domNode, "display", "none");
							imgs.push(img);
							this._add(img);
						}, this);
					}
					this._images = imgs;
					return value;
				},

				post: function() {
					this.stop();
				}
			},

			repeatCount: 0,

			reverse: false
		}

	});

});
},
"Ti/UI/Label":function(){
/* /titanium/Ti/UI/Label.js */

define(['Ti/_/declare', 'Ti/_/UI/FontWidget', 'Ti/_/dom', 'Ti/_/css', 'Ti/_/style', 'Ti/_/lang', 'Ti/Locale', 'Ti/UI'],
	function(declare, FontWidget, dom, css, style, lang, Locale, UI) {

	var setStyle = style.set,
		unitize = dom.unitize,
		tabStop = 2,
		textPost = {
			post: '_setText'
		};

	return declare('Ti.UI.Label', FontWidget, {

		constructor: function() {
			this._add(this._textContainer = UI.createView({
				width: UI.INHERIT,
				height: UI.SIZE,
				center: {y: '50%'}
			}));

			var self = this,
				textContainerDomNode = this._textContainerDomNode = this._textContainer.domNode;
			self._textContainer._getContentSize = function(width) {
				var text = self._textContainerDomNode.innerHTML,
					measuredSize = self._measureText(text, textContainerDomNode, self._hasSizeWidth() ? void 0 : width);
				return {
					width: measuredSize.width,
					height: measuredSize.height
				};
			};

			this._addStyleableDomNode(textContainerDomNode);
			setStyle(textContainerDomNode, 'overflow', 'visible');
			this.wordWrap = true;
		},

		_defaultWidth: UI.SIZE,

		_defaultHeight: UI.SIZE,

		_getText: function() {
			var i,
				lineStartIndex = 0,
				currentIndex = 0,
				currentTabIndex,
				text = Locale._getString(this.textid, this.text);

			// Handle null, undefined, etc edge case
			if (text === void 0) {
				return '';
			}
			text += '';

			// Convert \t and \n to &nbsp;'s and <br/>'s
			while (currentIndex < text.length) {
				if (text[currentIndex] === '\t') {
					var tabSpaces = '',
						numSpacesToInsert = tabStop - (currentTabIndex) % tabStop;
					for (i = 0; i < numSpacesToInsert; i++) {
						tabSpaces += '&nbsp;';
					}
					text = text.substring(0, currentIndex) + tabSpaces + text.substring(currentIndex + 1);
					currentIndex += tabSpaces.length;
					currentTabIndex += numSpacesToInsert;
				} else if (text[currentIndex] === '\n') {
					text = text.substring(0, currentIndex) + '<br/>' + text.substring(currentIndex + 1);
					currentIndex += 5;
					lineStartIndex = currentIndex;
					currentTabIndex = 0;
				} else {
					currentIndex++;
					currentTabIndex++;
				}
			}

			text.match(/<br\/>$/) && (text += '&nbsp;');
			return text;
		},

		_setText: function() {
			this._textContainerDomNode.innerHTML = this._getText();
			this._triggerLayout();
		},

		_setTextShadow: function() {
			var shadowColor = this.shadowColor && this.shadowColor !== '' ? this.shadowColor : void 0;
			setStyle(
				this._textContainerDomNode,
				'textShadow',
				this.shadowOffset || shadowColor
					? (this.shadowOffset ? unitize(this.shadowOffset.x) + ' ' + unitize(this.shadowOffset.y) : '0px 0px') +
						' ' + (this.shadowRadius ? unitize(this.shadowRadius) : '0.1em') + ' ' + lang.val(shadowColor,'black')
					: ''
			);
		},

		properties: {
			ellipsize: {
				set: function(value) {
					setStyle(this._textContainerDomNode, 'textOverflow', !!value ? 'ellipsis' : 'clip');
					setStyle(this._textContainerDomNode, 'overflow', !!value ? 'hidden' : 'visible');
					return value;
				},
				value: true
			},
			html: {
				set: function(value) {
					this._textContainerDomNode.innerHTML = value;
					this._hasSizeDimensions() && this._triggerLayout();
					return value;
				}
			},
			shadowColor: {
				post: '_setTextShadow'
			},
			shadowOffset: {
				post: '_setTextShadow'
			},
			shadowRadius: {
				post: '_setTextShadow'
			},
			text: textPost,
			textAlign: {
				set: function(value) {
					setStyle(this._textContainerDomNode, 'textAlign', /(center|right)/.test(value) ? value : 'left');
					return value;
				}
			},
			textid: textPost,
			wordWrap: {
				set: function(value) {
					setStyle(this._textContainerDomNode, 'whiteSpace', !!value ? 'normal' : 'nowrap');
					return value;
				}
			},
			verticalAlign: {
				set: function(value) {
					var top,
						bottom,
						center = this.center || {},
						textContainer = this._textContainer;
					switch(value) {
						case UI.TEXT_VERTICAL_ALIGNMENT_TOP: top = 0; break;
						case UI.TEXT_VERTICAL_ALIGNMENT_CENTER: center.y = '50%'; break;
						case UI.TEXT_VERTICAL_ALIGNMENT_BOTTOM: bottom = 0; break;
					}
					textContainer.top = top;
					textContainer.center = center;
					textContainer.bottom = bottom;
					return value;
				},
				value: UI.TEXT_VERTICAL_ALIGNMENT_CENTER
			}
		}

	});

});
},
"Ti/_/UI/FontWidget":function(){
/* /titanium/Ti/_/UI/FontWidget.js */

define(["Ti/_/declare", "Ti/_/dom", "Ti/_/lang", "Ti/_/ready", "Ti/_/style", "Ti/_/UI/Widget"],
	function(declare, dom, lang, ready, style, Widget) {

	var textRuler;

	ready(function() {
		textRuler = dom.create("p", {
			style: {
				position: "absolute",
				top: "-1000em",
				left: 0,
				height: "auto",
				width: "auto"
			}
		}, document.body);
	});

	return declare("Ti._.UI.FontWidget", Widget, {

		constructor: function() {
			this._styleableDomNodes = [];
		},

		_setFont: function(font,domNode) {
			if (font) {
				var fontSize = parseInt(font.fontSize);
				font.fontSize = isNaN(fontSize) ? void 0 : (fontSize + "px");
				style.set(domNode, font);
			} else {
				style.set(domNode,{
					fontFamily: "",
					fontSize: "",
					fontStyle: "",
					fontWeight: ""
				});
			}
		},

		_addStyleableDomNode: function(styleableDomNode) {
			this._styleableDomNodes.push(styleableDomNode);
		},

		_removeStyleableDomNode: function(styleableDomNode) {
			var index = this._styleableDomNodes.indexOf(styleableDomNode);
			index != -1 && this._styleableDomNodes.splice(index,1);
		},

		_measureText: function(text, domNode, width) {
			var computedStyle = window.getComputedStyle(domNode) || {},
				font = this.font || {},
				emptyText = !text || text === "";

			textRuler.innerHTML = emptyText ? "\u00C4y" : text;

			this._setFont({
				fontFamily: font.fontFamily || computedStyle.fontFamily || "",
				fontSize: font.fontSize || computedStyle.fontSize || "",
				fontStyle: font.fontStyle || computedStyle.fontStyle || "",
				fontWeight: font.fontWeight || computedStyle.fontWeight || ""
			}, textRuler);
			style.set(textRuler,{
				whiteSpace: domNode.style.whiteSpace,
				width: dom.unitize(lang.val(width,"auto"))
			});

			// Return the computed style
			return { width: emptyText ? 0 : textRuler.clientWidth + 0.5, height: textRuler.clientHeight };
		},

		properties: {
			color: {
				set: function(value) {
					for (var domNode in this._styleableDomNodes) {
						style.set(this._styleableDomNodes[domNode], "color", value);
					}
					return value;
				}
			},
			font: {
				set: function(value) {
					for (var domNode in this._styleableDomNodes) {
						this._setFont(value, this._styleableDomNodes[domNode]);
					}
					return value;
				}
			}
		}
	});
	
});
},
"Ti/UI/MobileWeb":function(){
/* /titanium/Ti/UI/MobileWeb.js */

define(["Ti/_/Evented", "Ti/_/lang", "Ti/UI/MobileWeb/NavigationGroup"],
	function(Evented, lang, NavigationGroup) {

	return lang.setObject("Ti.UI.MobileWeb", Evented, {
		createNavigationGroup: function(args) {
			return new NavigationGroup(args);
		}
	});

});
},
"Ti/UI/MobileWeb/NavigationGroup":function(){
/* /titanium/Ti/UI/MobileWeb/NavigationGroup.js */

/*global define*/
define(['Ti/_/css', 'Ti/_/declare', 'Ti/UI/View', 'Ti/UI', 'Ti/_/lang'],
	function(css, declare, View, UI, lang) {

	var isDef = lang.isDef,
		UI_FILL = UI.FILL,
		navGroupCss = 'TiUINavigationGroup';

	return declare('Ti.UI.MobileWeb.NavigationGroup', View, {

		constructor: function(args) {
			var self = this,
				win = self.__values__.constants.window = args && args.window,
				navBarContainer = self._navBarContainer = UI.createView({
					height: 50,
					width: UI.FILL,
					layout: UI._LAYOUT_CONSTRAINING_HORIZONTAL
				});
			css.add(navBarContainer.domNode, navGroupCss);
			self.layout = UI._LAYOUT_CONSTRAINING_VERTICAL;

			// Create the nav bar content
			navBarContainer.add(self._leftContainer = UI.createView({
				width: UI.SIZE,
				height: '100%',
				left: 5,
				right: 5
			}));
			navBarContainer.add(self._centerContainer = UI.createView({
				width: UI.FILL,
				height: '100%'
			}));
			navBarContainer.add(self._rightContainer = UI.createView({
				width: UI.SIZE,
				height: '100%',
				left: 5,
				right: 5
			}));
			self._add(navBarContainer);

			// Create the content container
			self._add(self._contentContainer = UI.createView({
				width: UI_FILL,
				height: UI_FILL
			}));

			// Stylize the top
			this.navBarAtTop = true;
			navBarContainer._getBorderFromCSS();

			// Initialize the window stack and add the root window
			self._windows = [];
			win && self.open(win);
		},

		_defaultWidth: UI_FILL,

		_defaultHeight: UI_FILL,

		_updateNavBar: function() {
			var _self = this,
				windows = _self._windows,
				len = windows.length,
				activeWin = windows[len - 1],
				navBarContainer = this._navBarContainer,
				leftContainer = _self._leftContainer,
				centerContainer = _self._centerContainer,
				rightContainer = _self._rightContainer,
				leftView,
				centerView,
				rightView;

			if (!activeWin) {
				return;
			}
			rightView = activeWin.rightNavButton;

			if (activeWin.leftNavButton) {
				leftView = activeWin.leftNavButton;
			} else {
				if (!_self._backButton) {
					_self._backButton = UI.createButton({
						title: 'Back'
					});
					require.on(_self._backButton, 'singletap', function() {
						// Note: we can reuse activeWin or length because they may have changed by the time this event
						// listener is called due to reuse of the back button across windows.
						_self.close(windows[windows.length - 1]);
					});
				}
				len > 1 && (leftView = _self._backButton);
			}
			if (leftContainer._children[0] !== leftView) {
				leftContainer._removeAllChildren();
				leftView && leftContainer.add(leftView);
			}

			if (rightContainer._children[0] !== rightView) {
				rightContainer._removeAllChildren();
				rightView && rightContainer.add(rightView);
			}

			navBarContainer.backgroundColor = activeWin.barColor;
			navBarContainer.backgroundImage = activeWin.barImage;
			navBarContainer.opacity = activeWin.translucent ? 0.5 : 1;
			navBarContainer.height = activeWin.navBarHidden && activeWin.modal ? 0 : 50;

			if (activeWin.titleControl) {
				centerView = activeWin.titleControl;
			} else if (activeWin.titleImage) {
				centerView = activeWin._titleImageView || (activeWin._titleImageView = UI.createImageView({
					image: activeWin.titleImage
				}));
			} else {
				centerView = activeWin._titleControl || (activeWin._titleControl = UI.createLabel({
					text: activeWin._getTitle() || (this._tab && this._tab._getTitle()) || '',
					width: '100%',
					height: '100%',
					textAlign: UI.TEXT_ALIGNMENT_CENTER
				}));
			}
			if (centerContainer._children[0] !== centerView) {
				centerContainer._removeAllChildren();
				centerView && centerContainer.add(centerView);
			}
		},

		_getTopWindow: function() {
			var windows = this._windows,
				len = windows.length;
			return len ? windows[windows.length - 1] : null;
		},

		open: function(win) {
			if (!win._opened) {
				var windows = this._windows,
					tab = this._tab;

				win._navGroup = this;

				// Set a default background
				!isDef(win.backgroundColor) && !isDef(win.backgroundImage) && (win.backgroundColor = '#fff');

				~(windows.length - 1) && windows[windows.length - 1].fireEvent('blur');

				// Show the window
				tab && (win.tabGroup = (win.tab = tab)._tabGroup);
				windows.push(win);
				this._contentContainer._add(win);
				this._updateNavBar();

				win._opened || win.fireEvent('open');
				win._opened = 1;
				win.fireEvent('focus');
			}
		},

		close: function(win) {
			var windows = this._windows,
				windowIdx = windows.indexOf(win),
				self = this;

			win._navGroup = void 0;

			// make sure the window exists and it's not the root
			if (windowIdx > 0) {
				windows.splice(windowIdx, 1);
				win.fireEvent('blur');
				self._contentContainer.remove(win);
				win.fireEvent('close');
				win._opened = 0;

				this._updateNavBar();
				windows[windows.length - 1].fireEvent('focus');
			}
		},

		_reset: function() {
			var windows = this._windows,
				win,
				i = windows.length - 1,
				l = i;

			while (1) {
				win = windows[i];
				if (!i) {
					break;
				}
				i-- === l && win.fireEvent('blur');
				this._contentContainer.remove(win);
				win.fireEvent('close');
				win._opened = 0;
			}

			windows.splice(1);
			this._updateNavBar();
			win.fireEvent('focus');
		},

		constants: {
			window: void 0,
			bubbleParent: false
		},

		properties: {
			navBarAtTop: {
				set: function (value, oldValue) {
					if (value !== oldValue) {
						var navBarContainer = this._navBarContainer,
							navBarContainerDomNode = navBarContainer.domNode;

						this._remove(navBarContainer);
						this._insertAt(navBarContainer, value ? 0 : 1);

						css.remove(navBarContainerDomNode, navGroupCss + (value ? 'Top' : 'Bottom'));
						css.add(navBarContainerDomNode, navGroupCss + (value ? 'Bottom' : 'Top'));
					}

					return value;
				}
			}
		}

	});

});
},
"Ti/UI/OptionDialog":function(){
/* /titanium/Ti/UI/OptionDialog.js */

define(["Ti/_/declare", "Ti/_/lang", "Ti/_/Evented", "Ti/Locale", "Ti/UI", "Ti/_/css"],
	function(declare, lang, Evented, Locale, UI, css) {

	return declare("Ti.UI.OptionDialog", Evented, {

		show: function() {
			// Create the window and a background to dim the current view
			var optionsWindow = this._optionsWindow = UI.createWindow(),
				dimmingView = UI.createView({
					backgroundColor: "black",
					opacity: 0,
					left: 0,
					top: 0,
					right: 0,
					bottom: 0
				}),
				optionsDialog = UI.createView({
					width: "100%",
					height: UI.SIZE,
					bottom: 0,
					backgroundColor: "white",
					layout: UI._LAYOUT_CONSTRAINING_VERTICAL,
					opacity: 0
				});

			optionsWindow._add(dimmingView);
			optionsWindow._add(optionsDialog);

			// Add the title
			optionsDialog._add(UI.createLabel({
				text: Locale._getString(this.titleid, this.title),
				font: {fontWeight: "bold"},
				left: 5,
				right: 5,
				top: 5,
				height: UI.SIZE,
				textAlign: UI.TEXT_ALIGNMENT_CENTER
			}));

			// Create buttons
			require.is(this.options, "Array") && this.options.forEach(function(opt, i, arr) {
				var button = UI.createButton({
					left: 5,
					right: 5,
					top: 5,
					bottom: i === arr.length - 1 ? 5 : 0,
					height: UI.SIZE,
					title: opt,
					index: i
				});
				if (i === this.destructive) {
					css.add(button.domNode, "TiUIElementGradientDestructive");
				} else if (i === this.cancel) {
					css.add(button.domNode, "TiUIElementGradientCancel");
				}
				optionsDialog._add(button);
				button.addEventListener("singletap", lang.hitch(this, function(){
					optionsWindow.close();
					this._optionsWindow = void 0;
					this.fireEvent("click", {
						index: i,
						cancel: this.cancel,
						destructive: this.destructive
					});
				}));
			}, this);

			// Animate the background after waiting for the first layout to occur
			optionsDialog.addEventListener("postlayout", function() {
				setTimeout(function(){ // We have to wait for the entire layout pass to complete and the CSS rules to be applied.
					optionsDialog.animate({
						bottom: -optionsDialog._measuredHeight,
						opacity: 1,
						duration: 0
					});
					dimmingView.animate({
						opacity: 0.5,
						duration: 200
					}, function(){
						optionsDialog.animate({
							bottom: 0,
							duration: 200
						});
					});
				}, 0);
			});

			// Show the options dialog
			optionsWindow.open();
		},

		properties: {
			cancel: -1,
			destructive: -1,
			options: void 0,
			title: void 0,
			titleid: void 0
		}

	});

});

},
"Ti/UI/Picker":function(){
/* /titanium/Ti/UI/Picker.js */

define(["Ti/_/declare", "Ti/_/event", 'Ti/_/has', "Ti/UI/View", "Ti/_/UI/Widget", "Ti/UI", "Ti/_/lang", "Ti/_/dom", "Ti/_/ready"],
	function(declare, event, has, View, Widget, UI, lang, dom, ready) {

	function formatDate(str, type) {
		if (str) {
			if (type === 'DateTime') {
				return new Date(str);
			}

			var d = new Date,
				m;

			if (type === 'Date') {
				m = str.match(/^(?:(\d+)\/(\d+)\/(\d+))|(?:(\d+)-(\d+)-(\d+))$/);
				d.setYear(m[1] ? m[3] : m[4]);
				d.setMonth(m[1] ? m[1] - 1 : m[5] - 1);
				d.setDate(m[1] ? m[2] : m[6]);
			}

			if (type === 'Time') {
				m = str.match(/^(\d+)\:(\d+)\s*(am|pm)?$/i);
				d.setHours(m[3] && m[3].toLowerCase() == 'pm' && ~~m[1] < 12 ? ~~m[1] + 12 : m[1]);
				d.setMinutes(m[2]);
				d.setSeconds(0);
			}

			return d;
		}
	}

	var is = require.is,
		borderRadius = 6,
		unitizedBorderRadius = dom.unitize(borderRadius),
		inputSizes = {},
		on = require.on,
		DateTimeInput = declare(Widget, {

			constructor: function() {
				var input = this._input = dom.create("input", {
						style: {
							left: unitizedBorderRadius,
							top: unitizedBorderRadius,
							right: unitizedBorderRadius,
							bottom: unitizedBorderRadius,
							position: "absolute"
						}
					}, this.domNode),
					currentValue,
					self = this;

				function handleChange() {
					var newValue = input.value,
						dateValue = formatDate(newValue, self.type);
					if (currentValue !== newValue && dateValue) {
						currentValue = newValue;
						self.picker.fireEvent("change", {
							value: dateValue
						});
					}
				}

				self._handles = [
					on(input, has('touch') ? "touchend" : "click", handleChange),
					// on(input, "keyup", handleChange), // I think this was for older versions of Mobile Safari
					on(input, "change", handleChange),
					on(input, "blur", handleChange)
				];
			},

			destroy: function() {
				event.off(this._handles);
				Widget.prototype.destroy.apply(this, arguments);
			},

			_getContentSize: function() {
				return inputSizes[this.type];
			},

			properties: {
				type: {
					set: function(value) {
						return this._input.type = value;
					}
				},
				min: {
					set: function(value) {
						this._input.min = lang.val(value, "");
						return value;
					}
				},
				max: {
					set: function(value) {
						this._input.max = lang.val(value, "");
						return value;
					}
				},
				value: {
					get: function () {
						return formatDate(this._input.value, this.type);
					},
					set: function(value) {
						// Some browsers have this property, but if you assign to it, it throws an exception.
						try {
							this._input.valueAsDate = value;
						} catch(e) {}
					}
				}
			}
		});

	DateTimeInput.prototype.declaredClass = 'DateTimeInput';

	ready(function() {
		var inputRuler = dom.create("input", {
				style: {
					height: UI.SIZE,
					width: UI.SIZE
				}
			}, document.body);

		["Date", "Time", "DateTime"].forEach(function(type) {
			try {
				inputRuler.type = type;
			} catch(e) {}
			inputSizes[type] = {
				width: inputRuler.clientWidth + 2 * borderRadius,
				height: inputRuler.clientHeight + 2 * borderRadius
			};
		});

		dom.detach(inputRuler);
	});

	return declare("Ti.UI.Picker", View, {

		constructor: function() {
			this.layout = "constrainingHorizontal";
			this._columns = [];
			this._getBorderFromCSS();
		},

		_currentColumn: null,

		_addColumn: function(column) {
			this._columns.push(column);
			column._parentPicker = this;

			var i = 0,
				numColumns = this._columns.length,
				width = this.width === UI.SIZE ? UI.SIZE : 100 / numColumns + "%",
				height = this.height === UI.SIZE ? UI.SIZE : "100%";

			for (; i < numColumns; i++) {
				column = this._columns[i]; // Repurposing of the column variable
				column.width = width;
				column.height = height;
				column._setCorners(i === 0, i === numColumns - 1, unitizedBorderRadius);
			}

			column._pickerChangeEventListener = lang.hitch(this, function(e) {
				var eventInfo = {
					column: e.column,
					columnIndex: this._columns.indexOf(e.column),
					row: e.row,
					rowIndex: e.rowIndex
				};
				if (this.type === UI.PICKER_TYPE_PLAIN) {
					var selectedValue = []
					for(var i in this._columns) {
						var selectedRow = this._columns[i].selectedRow;
						selectedRow && selectedValue.push(selectedRow.title);
					}
					eventInfo.selectedValue = selectedValue;
				} else {

				}
				this.fireEvent("change", eventInfo);
			});

			column.addEventListener("change", column._pickerChangeEventListener);
			this._add(column);
			this._publish(column);
		},

		_updateColumnHeights: function() {
			var tallestColumnHeight = 0,
				i;
			for(i in this._columns) {
				tallestColumnHeight = Math.max(tallestColumnHeight, this._columns[i]._getTallestRowHeight());
			}
			for(i in this._columns) {
				this._columns[i]._setTallestRowHeight(tallestColumnHeight);
			}
		},

		_defaultWidth: UI.SIZE,

		_defaultHeight: UI.SIZE,

		add: function(value) {
			if (is(value,"Array")) {
				for (var i in value) {
					this.add(value[i]);
				}
			} else if(lang.isDef(value.declaredClass)) {
				if (value.declaredClass === "Ti.UI.PickerColumn") {
					this._addColumn(value);
				} else if(value.declaredClass === "Ti.UI.PickerRow") {
					this._currentColumn === null && (this._addColumn(this._currentColumn = UI.createPickerColumn()));
					this._currentColumn.addRow(value);
				}
			}
		},

		destroy: function() {
			this._dateTimeInput && this._dateTimeInput.destroy();
			Widget.prototype.destroy.apply(this, arguments);
		},

		getSelectedRow: function(columnIndex) {
			var column = this._columns[columnIndex];
			return column && column.selectedRow;
		},

		setSelectedRow: function(columnIndex, rowIndex) {
			var column = this._columns[columnIndex];
			column && (column.selectedRow = column.rows[rowIndex]);
		},

		properties: {
			columns: {
				get: function() {
					return this._columns;
				},
				set: function(value) {
					// Remove the existing columns
					this._removeAllChildren();
					for(var i in this._columns) {
						var column = this._columns[i];
						column.removeEventListener(column._pickerChangeEventListener);
						column._parentPicker = void 0;
					}
					this._columns = [];

					// Add the new column(s)
					value && this.add(value);

					// We intentionally don't return anything because we are not using the internal storage mechanism.
				}
			},

			maxDate: {
				set: function(value) {
					this._dateTimeInput && (this._dateTimeInput.max = value);
					return value;
				}
			},

			minDate: {
				set: function(value) {
					this._dateTimeInput && (this._dateTimeInput.min = value);
					return value;
				}
			},

			type: {
				set: function(value, oldValue) {
					var self = this;
					if (value !== oldValue) {
						this.columns = void 0;
						this._dateTimeInput = null;

						function createInput(inputType) {
							var dateTimeInput = self._dateTimeInput = new DateTimeInput({
								type: inputType,
								width: UI.INHERIT,
								height: UI.INHERIT,
								picker: self
							});
							dateTimeInput.addEventListener("change", function(e) {
								self.__values__.properties.value = e.value;
								self.fireEvent("change",e);
							});
							dateTimeInput.min = self.min;
							dateTimeInput.max = self.max;
							self._add(dateTimeInput);
						}

						switch(value) {
							case UI.PICKER_TYPE_DATE:
								createInput("Date");
								break;
							case UI.PICKER_TYPE_TIME:
								createInput("Time");
								break;
							case UI.PICKER_TYPE_DATE_AND_TIME:
								createInput("DateTime");
								break;
						}
					}
					return value;
				},
				value: UI.PICKER_TYPE_PLAIN
			},

			value: {
				get: function () {
					return this._dateTimeInput && this._dateTimeInput.value;
				},
				set: function(value) {
					this._dateTimeInput && (this._dateTimeInput.value = value);
					return value;
				}
			}
		}

	});

});
},
"Ti/UI/PickerColumn":function(){
/* /titanium/Ti/UI/PickerColumn.js */

define(["Ti/_/declare", "Ti/_/UI/FontWidget", "Ti/_/dom", "Ti/UI", 'Ti/_/has', "Ti/_/style", "Ti/_/lang"],
	function(declare, FontWidget, dom, UI, has, style, lang) {

	var setStyle = style.set,
		contentPadding = 15,
		on = require.on;

	return declare("Ti.UI.PickerColumn", FontWidget, {

		constructor: function() {
			var self = this,
				clickEventName = has('touch') ? "touchend" : "click",
				node = self.domNode,
				rows = self.__values__.constants.rows = [],
				upArrow = self._upArrow = dom.create("div", {
					className: "TiUIElementGradient",
					style: {
						textAlign: "center",
						position: "absolute",
						top: 0,
						height: "40px",
						left: 0,
						right: 0,
						borderBottom: "1px solid #666",
						fontSize: "28px",
						cursor: "pointer"
					},
					innerHTML: "\u2227"
				}, node),
				titleContainer = self._titleContainer = dom.create("div", {
					style: {
						position: "absolute",
						top: "50%",
						height: "1em",
						width: "100%",
						marginTop: "-0.5em",
						textAlign: "center"
					}
				}, node),
				titleClickArea = dom.create("div", {
					style: {
						position: "absolute",
						top: "40px",
						bottom: "40px",
						width: "100%"
					}
				}, node),
				downArrow = self._downArrow = dom.create("div", {
					className: "TiUIElementGradient",
					innerHTML: "\u2228",
					style: {
						textAlign: "center",
						position: "absolute",
						bottom: "0px",
						height: "40px",
						width: "100%",
						borderTop: "1px solid #666",
						fontSize: "28px",
						cursor: "pointer"
					}
				}, node);

			self._addStyleableDomNode(titleContainer);

			this._handles = [
				on(upArrow, clickEventName, function() {
					var nextRow = rows.indexOf(self.selectedRow);
					if (nextRow > 0) {
						self.selectedRow = rows[nextRow - 1];
					} else {
						self.selectedRow = rows[rows.length - 1];
					}
				}),
				on(titleClickArea, clickEventName, function() {
					// Create the window and a background to dim the current view
					var listWindow = UI.createWindow(),
						dimmingView = UI.createView({
							backgroundColor: "#000",
							opacity: 0,
							left: 0,
							top: 0,
							right: 0,
							bottom: 0
						}),
						listDialog = UI.createView({
							width: "75%",
							height: UI.SIZE,
							backgroundColor: "#fff",
							layout: UI._LAYOUT_CONSTRAINING_VERTICAL,
							borderRadius: 3,
							opacity: 0
						}),
						selectedRowIndex = 0,
						tmp = 0,
						data = rows.map(function(row) {
							var isSelectedRow = row === self.selectedRow;
							isSelectedRow && (selectedRowIndex = parseInt(tmp++));
							return {
								title: row.title,
								hasCheck: isSelectedRow
							};
						}),
						listTable = UI.createTableView({
							left: 5,
							right: 5,
							top: 5,
							height: data.length < 10 ? UI.SIZE : "70%",
							data: data
						}),
						cancelButton = UI.createButton({
							left: 5,
							top: 5,
							right: 5,
							title: "Cancel"
						});

					listTable.addEventListener("singletap", function(e) {
						e.index in rows && (self.selectedRow = rows[e.index]);
						listWindow.close();
					});

					cancelButton.addEventListener("singletap", function() {
						listWindow.close();
					});

					listWindow._add(dimmingView);
					listWindow._add(listDialog);

					listDialog._add(listTable);
					listDialog.add(cancelButton);

					// Add a view to handle padding since there is no TI API to do it
					listDialog._add(UI.createView({ height: "5px" }));

					// Show the options dialog
					listWindow.open();

					// Animate the background after waiting for the first layout to occur
					setTimeout(function() {
						dimmingView.animate({
							opacity: 0.5,
							duration: 200
						}, function() {
							listDialog.animate({
								opacity: 1,
								duration: 200
							}, function() {
								listTable.scrollToIndex(selectedRowIndex);
							});
						});
					}, 30);
				}),
				on(downArrow, clickEventName, function() {
					var nextRow = rows.indexOf(self.selectedRow);
					if (nextRow < rows.length - 1) {
						self.selectedRow = rows[nextRow + 1];
					} else {
						self.selectedRow = rows[0];
					}
				})
			];
		},

		destroy: function() {
			event.off(this._handles);
			FontWidget.prototype.destroy.apply(this, arguments);
		},

		_setCorners: function(left, right, radius) {
			setStyle(this._upArrow, {
				borderTopLeftRadius: left ? radius : "0px",
				borderTopRightRadius: right ? radius : "0px"
			});
			setStyle(this._downArrow, {
				borderBottomLeftRadius: left ? radius : "0px",
				borderBottomRightRadius: right ? radius : "0px"
			});
			this.borderWidth = [0, right ? 0 : 1, 0, 0];
			this.borderColor = "#666";
		},

		_defaultWidth: UI.SIZE,

		_defaultHeight: UI.SIZE,

		_preLayout: function() {
			this._updateContentWidth();
			this._parentPicker && this._parentPicker._updateColumnHeights();
			return true;
		},

		_getContentSize: function() {
			var titleContainer = this._titleContainer;
				text = titleContainer.innerHTML;
			return {
				width: Math.max(this._widestRowWidth + contentPadding, 100),
				height: this._tallestRowHeight + contentPadding + this._upArrow.clientHeight + this._downArrow.clientHeight
			};
		},

		_widestRowWidth: 0,

		_tallestRowHeight: 0,

		_updateContentWidth: function() {
			var widestRowWidth = 0,
				i = 0,
				len = this.rows.length,
				row;
			while (i < len) {
				row = this.rows[i++];
				widestRowWidth = Math.max(widestRowWidth, row._measureText(row.title, row.domNode).width);
			}
			if (this._widestRowWidth !== widestRowWidth) {
				this._widestRowWidth = widestRowWidth;
			}
		},

		_getTallestRowHeight: function() {
			var widestRowWidth = 0,
				tallestRowHeight = 0,
				i = 0,
				len = this.rows.length;
			for(; i < len; i++) {
				var row = this.rows[i];
				tallestRowHeight = Math.max(tallestRowHeight, row._measureText(row.title, row.domNode).height);
			}
			return tallestRowHeight;
		},

		_setTallestRowHeight: function(height) {
			if (this._tallestRowHeight !== height) {
				this._tallestRowHeight = height;
				this._triggerLayout();
			}
		},

		addRow: function(row) {
			this.rows.push(row);
			row._parentColumn = this;
			this._updateContentWidth();
			this._parentPicker && this._parentPicker._updateColumnHeights();
			if (!this.selectedRow) {
				this.selectedRow = row;
			}
			this._publish(row);
		},

		removeRow: function(row) {
			var rowIndex = this.rows.indexOf(row);
			if (rowIndex !== -1) {
				this.rows.splice(rowIndex, 1);
				row._parentColumn = void 0;
				this._updateContentWidth();
				this._parentPicker && this._parentPicker._updateColumnHeights();
				if (this.selectedRow === row) {
					this.selectedRow = this.rows[0];
				}
			}
			this._unpublish(row);
		},

		constants: {
			rowCount: {
				get: function() {
					return this.rows.length;
				}
			},
			rows: void 0
		},

		properties: {
			selectedRow: {
				set: function(value) {
					if (!value) {
						this.font = void 0;
						this.color = void 0;
						this._titleContainer.innerHTML = "";
						this._hasSizeDimensions() && this._triggerLayout();
					} else {
						var rowIndex = this.rows.indexOf(value);
						if (rowIndex === -1) {
							return;
						}
						this.font = value.font;
						this.color = lang.val(value.color, "");
						this._titleContainer.innerHTML = value.title;
						this._hasSizeDimensions() && this._triggerLayout();
					}
					return value;
				},
				post: function(value) {
					this.fireEvent("change", {
						column: this,
						rowIndex: this.rows.indexOf(value),
						row: value,
						value: value && value.title
					});
				}
			}
		}

	});

});
},
"Ti/UI/PickerRow":function(){
/* /titanium/Ti/UI/PickerRow.js */

define(["Ti/_/declare", "Ti/_/UI/FontWidget", "Ti/UI"],
	function(declare, FontWidget, UI) {

	return declare("Ti.UI.PickerRow", FontWidget, {
		
		constructor: function() {
			this._addStyleableDomNode(this.domNode);
		},

		_defaultWidth: UI.SIZE,

		_defaultHeight: UI.SIZE,
		
		properties: {
			title: {
				post: function() {
					this._parentColumn && this._parentColumn._updateContentDimensions();
				}
			}
		}
		
	});
	
});
},
"Ti/UI/ProgressBar":function(){
/* /titanium/Ti/UI/ProgressBar.js */

define(["Ti/_/declare", "Ti/_/UI/Widget", "Ti/_/UI/FontWidget", "Ti/_/lang", "Ti/_/dom", "Ti/_/style", "Ti/UI"], 
	function(declare, Widget, FontWidget, lang, dom, style, UI) {

	var setStyle = style.set;

	var InternalProgressBar = declare(Widget, {
			
			constructor: function() {
				this._contentContainer = dom.create("div", {
					className: "TiUIProgressBarContainer",
					style: {
						pointerEvents: "none",
						left: 0,
						right: 0,
						top: 0,
						bottom: 0,
						position: "absolute",
						overflow: "hidden"
					}
				}, this.domNode);
				this._indicator = dom.create("div", {
					className: "TiUIProgressBarIndicator",
					style: {
						pointerEvents: "none",
						width: "0%",
						height: "100%"
					}
				}, this._contentContainer);
			},
			
			_getContentSize: function(width, height) {
				return {
					width: 200,
					height: 25
				};
			},
			
			_setPosition: function(location) {
				setStyle(this._indicator, "width", Math.round(100 * location) + "%");
			}
		});

	return declare("Ti.UI.ProgressBar", Widget, {
		
		constructor: function() {
			this._add(this._contentContainer = UI.createView({
				width: UI.INHERIT,
				height: UI.INHERIT,
				left: 0,
				top: 0,
				layout: UI._LAYOUT_CONSTRAINING_VERTICAL
			}));
			this._contentContainer._layout._defaultHorizontalLayout = "start";
			this._contentContainer._add(this._message = UI.createLabel());
			this._contentContainer._add(this._progressBar = new InternalProgressBar({
				width: UI.INHERIT,
				height: UI.INHERIT
			}));
		},
		
		_updateSize: function() {
			this._progressBar._setPosition((this.value - this.min) / (this.max - this.min));
		},

		_defaultWidth: UI.SIZE,

		_defaultHeight: UI.SIZE,
		
		properties: {
			color: {
				set: function(value) {
					this._message.color = value;
					return value;
				}
			},
			
			font: {
				set: function(value) {
					this._message.font = value;
					return value;
				}
			},
			
			message: {
				set: function(value) {
					this._message.text = value;
					return value;
				}
			},
			
			min: {
				set: function(value) {
					return Math.min(value, this.max);
				},
				post: "_updateSize",
				value: 0
			},
			
			max: {
				set: function(value) {
					return Math.max(value, this.min);
				},
				post: "_updateSize",
				value: 100
			},
			
			value: {
				set: function(value) {
					return Math.min(Math.max(value, this.min), this.max);
				},
				post: "_updateSize",
				value: 0
			}
		}
		
	});
});
},
"Ti/UI/ScrollView":function(){
/* /titanium/Ti/UI/ScrollView.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/UI/KineticScrollView', 'Ti/_/style', 'Ti/_/lang', 'Ti/UI'],
	function(declare, KineticScrollView, style, lang, UI) {

	var isDef = lang.isDef,

		// The amount of deceleration (in pixels/ms^2)
		deceleration = 0.001;

	return declare('Ti.UI.ScrollView', KineticScrollView, {

		constructor: function() {
			var contentContainer;
			this._initKineticScrollView(contentContainer = UI.createView({
				width: UI.SIZE,
				height: UI.SIZE,
				_minWidth: '100%',
				_minHeight: '100%',
				left: 0,
				top: 0
			}), 'both', 'both', 1);
		},

		_handleMouseWheel: function() {
			this._isScrollBarActive && this.fireEvent('scroll',{
				x: -this._currentTranslationX,
				y: -this._currentTranslationY,
				dragging: false,
				decelerating: false
			});
		},

		_handleDragStart: function() {
			this.fireEvent('dragStart');
		},

		_handleDrag: function() {
			this.fireEvent('scroll',{
				x: -this._currentTranslationX,
				y: -this._currentTranslationY,
				dragging: true,
				decelerating: false
			});
		},

		_handleDragEnd: function(e, velocityX, velocityY) {
			if (isDef(velocityX)) {
				var self = this,
					velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY),
					distance = velocity * velocity / (1.724 * deceleration),
					duration = velocity / deceleration,
					theta = Math.atan(Math.abs(velocityY / velocityX)),
					distanceX = distance * Math.cos(theta) * (velocityX < 0 ? -1 : 1),
					distanceY = distance * Math.sin(theta) * (velocityY < 0 ? -1 : 1),
					translationX = Math.min(0, Math.max(self._minTranslationX, self._currentTranslationX + distanceX)),
					translationY = Math.min(0, Math.max(self._minTranslationY, self._currentTranslationY + distanceY));
				self.fireEvent('dragEnd',{
					decelerate: true
				});
				self._animateToPosition(translationX, translationY, duration, UI.ANIMATION_CURVE_EASE_OUT, function() {
					self._setTranslation(translationX, translationY);
					self._endScrollBars();
					self.fireEvent('scrollEnd');
				});
			}
		},

		scrollTo: function(x, y) {
			this._setTranslation(x !== null ? -x : this._currentTranslationX, y !== null ? -y : this._currentTranslationX);
		},

		_defaultWidth: UI.FILL,

		_defaultHeight: UI.FILL,

		_getContentOffset: function(){
			return this.contentOffset;
		},

		_preLayout: function() {
			var needsRecalculation = this._contentContainer.layout === this.layout;
			this._contentContainer.layout = this.layout;
			return needsRecalculation;
		},

		add: function(view) {
			this._contentContainer._add(view);
			this._publish(view);
		},

		remove: function(view) {
			this._contentContainer.remove(view);
			this._unpublish(view);
		},

		properties: {
			contentHeight: {
				get: function() {
					return this._contentContainer.height;
				},
				set: function(value) {
					this._contentContainer.height = value;
					return value;
				}
			},

			contentOffset: {
				get: function() {
					return {
						x: -this._currentTranslationX,
						y: -this._currentTranslationY
					};
				},
				set: function(value) {
					this._setTranslation(isDef(value.x) ? -value.x : this._currentTranslationX,
						isDef(value.y) ? -value.y : this._currentTranslationY);
					return value;
				}
			},

			contentWidth: {
				get: function() {
					return this._contentContainer.width;
				},
				set: function(value) {
					this._contentContainer.width = value;
					return value;
				}
			},

			disableBounce: false,

			horizontalBounce: {
				set: function(value) {
					return this._horizontalElastic = value;
				},
				value: true
			},

			layout: {
				set: function(value) {
					return this._contentContainer.layout = value;
				},
				value: 'composite'
			},

			showHorizontalScrollIndicator: {
				set: function(value, oldValue) {
					if (value !== oldValue) {
						if (value) {
							this._createHorizontalScrollBar();
						} else {
							this._destroyHorizontalScrollBar();
						}
					}
					return value;
				},
				value: true
			},

			showVerticalScrollIndicator: {
				set: function(value, oldValue) {
					if (value !== oldValue) {
						if (value) {
							this._createVerticalScrollBar();
						} else {
							this._destroyVerticalScrollBar();
						}
					}
					return value;
				},
				value: true
			},

			verticalBounce: {
				set: function(value) {
					return this._verticalElastic = value;
				},
				value: true
			}
		}

	});

});
},
"Ti/_/UI/KineticScrollView":function(){
/* /titanium/Ti/_/UI/KineticScrollView.js */

define(["Ti/_/browser", "Ti/_/declare", "Ti/UI/View", "Ti/_/lang", "Ti/_/dom", "Ti/_/style", "Ti/UI", "Ti/_/event"],
	function(browser, declare, View, lang, dom, style, UI, event) {

	var setStyle = style.set,
		unitize = dom.unitize,
		calculateDistance = dom.calculateDistance,
		on = require.on,

		// This is the limit that elastic drags will go towards (i.e. limit as x->infinity = elasticityLimit)
		elasticityLimit = 100,

		// Controls the friction curve for elastic dragging. The higher the value, the sooner drag starts to kick in. 
		// Must be greater than or equal to elasticityLimit otherwise the curve has a slope greater than 1, which is bad.
		elasticityDrag = 100;

	return declare("Ti._.UI.KineticScrollView", View, {

		_initKineticScrollView: function(contentContainer, elasticity, scrollbars, enableMouseWheel){

			var contentContainerDomNode,
				self = this,
				velocity = 0,
				startTranslationX,
				startTranslationY,
				translationX,
				translationY,
				minTranslationX,
				minTranslationY,
				positionData,
				previousTime,
				currentTime,
				period,
				previousTranslationX,
				previousTranslationY,
				numSamples,
				velocityX,
				velocityY,
				scrollbarTimeout;
			self._currentTranslationX = 0;
			self._currentTranslationY = 0;
			self._horizontalElastic = elasticity === "horizontal" || elasticity === "both";
			self._verticalElastic = elasticity === "vertical" || elasticity === "both";
			self._kineticTransform = UI.create2DMatrix();
			
			(scrollbars === "horizontal" || scrollbars === "both") && self._createHorizontalScrollBar();
			(scrollbars === "vertical" || scrollbars === "both") && self._createVerticalScrollBar();

			// Create the content container
			self._add(self._contentContainer = contentContainer);
			contentContainerDomNode = contentContainer.domNode;

			// Calculate the velocity by calculating a weighted slope average, favoring more recent movement
			function calculateVelocity() {
				currentTime = Date.now();
				period = currentTime - previousTime;
				previousTime = currentTime;
				if (numSamples++) {
					velocityX = (velocityX * (numSamples - 1) + numSamples * (translationX - previousTranslationX) / period) / 2 / numSamples;
					velocityY = (velocityY * (numSamples - 1) + numSamples * (translationY - previousTranslationY) / period) / 2 / numSamples;
				} else {
					velocityX = (translationX - startTranslationX) / period;
					velocityY = (translationY - startTranslationY) / period;
				}
			}
			
			function setMinTranslations() {
				minTranslationX = self._minTranslationX = Math.min(0, self._measuredWidth - self._borderLeftWidth - self._borderRightWidth - self._contentContainer._measuredWidth);
				minTranslationY = self._minTranslationY = Math.min(0, self._measuredHeight - self._borderTopWidth - self._borderBottomWidth - self._contentContainer._measuredHeight);
			}
			
			on(self._contentContainer, "postlayout", function() {
				setMinTranslations();
				self._setTranslation(self._currentTranslationX, self._currentTranslationY);
			});

			on(self, "draggingstart", function(e) {
				if (self.scrollingEnabled) {
					self._cancelAnimations();

					// Initialize the velocity calculations
					velocityX = void 0;
					velocityY = void 0;
					startTranslationX = self._currentTranslationX;
					startTranslationY = self._currentTranslationY;
					numSamples = 0;
					previousTime = (new Date).getTime();

					setMinTranslations();

					// Start the scroll bars
					var width = self._measuredWidth,
						height = self._measuredHeight,
						contentWidth = contentContainer._measuredWidth,
						contentHeight = contentContainer._measuredHeight;
					self._startScrollBars({
						x: -self._currentTranslationX / (contentWidth - width),
						y: -self._currentTranslationY / (contentHeight - height)
					},
					{
						x: width / contentWidth,
						y: height / contentHeight
					});

					// Call the callback
					self._handleDragStart && self._handleDragStart(e);
				}
			});

			on(self, "dragging", function(e) {
				if (self.scrollingEnabled) {
					// Update the velocity calculations
					translationX = startTranslationX + e.distanceX;
					translationY = startTranslationY + e.distanceY;
					calculateVelocity();

					// Update the translation
					self._setTranslation(previousTranslationX = translationX, previousTranslationY = translationY);
					
					self._handleDrag && self._handleDrag(e);
				}
			});

			on(self, "draggingcancel", function(e) {
				if (self.scrollingEnabled) {
					self._animateToPosition(startTranslationX, startTranslationY, 400 + 0.3 * calculateDistance(
							startTranslationX, startTranslationY, self._currentTranslationX, self._currentTranslationY),
						UI.ANIMATION_CURVE_EASE_IN_OUT, function(){
							self._handleDragCancel && self._handleDragCancel(e);
						});
					self._endScrollBars();
					self._handleDragCancel && self._handleDragCancel(e);
				}
			});

			on(self, "draggingend", function(e) {
				if (self.scrollingEnabled) {
					translationX = startTranslationX + e.distanceX;
					translationY = startTranslationY + e.distanceY;
					calculateVelocity();
					var x = self._currentTranslationX,
						y = self._currentTranslationY,
						springBack;

					// Spring back if need be
					if (x > 0) {
						x = 0;
						springBack = 1;
					} else if(x < minTranslationX) {
						x = minTranslationX;
						springBack = 1;
					}
					if (y > 0) {
						y = 0;
						springBack = 1;
					} else if(y < minTranslationY) {
						y = minTranslationY;
						springBack = 1;
					}

					if (springBack) {
						self._animateToPosition(x, y, 200, UI.ANIMATION_CURVE_EASE_OUT, function(){
							self._handleDragEnd && self._handleDragEnd(e);
							self._endScrollBars();
						});
					} else {
						self._handleDragEnd && self._handleDragEnd(e, velocityX, velocityY);
					}
				}
			});

			var mouseWheelEvent = navigator.userAgent.indexOf("Firefox") != -1 ? "DOMMouseScroll" : "mousewheel";
			enableMouseWheel && (this._disconnectMouseWheelEvent = on(self.domNode, mouseWheelEvent,function(e) {
				if (self.scrollingEnabled) {

					if (mouseWheelEvent == "DOMMouseScroll") { //Patch Firefox
						e.wheelDeltaY = - e.detail * 40; //Normalize Value (FF "detail" is either 3 or -3)
						e.wheelDeltaX = 0;
					} else if (e.wheelDelta && !e.wheelDeltaX) { //Patch IE as it only has e.wheelDelta
						e.wheelDeltaY = e.wheelDelta;
						e.wheelDeltaX = 0;
					}
					if (e.shiftKey) { //Translate the scroll direction by 90 degrees for shift + scroll
						e.wheelDeltaX = e.wheelDeltaY;
						e.wheelDeltaY = 0;
					} else if (e.ctrlKey) {
						//TODO turn control + mousewheel into zoom/pinch
						e.preventDefault(); //For now, prevent standard browser ctrl + scroll zoom
						return false;
					}

					self._cancelAnimations();
					var distanceX = contentContainer._measuredWidth - self._measuredWidth,
						distanceY = contentContainer._measuredHeight - self._measuredHeight,
						currentPositionX = -self._currentTranslationX,
						currentPositionY = -self._currentTranslationY;

					setMinTranslations();

					// Start the scrollbar
					self._startScrollBars({
							x: currentPositionX / distanceX,
							y: currentPositionY / distanceY
						},
						{
							x: self._measuredWidth / contentContainer._measuredWidth,
							y: self._measuredHeight / contentContainer._measuredHeight
						});

					// Set the scroll position
					self._setTranslation(Math.min(0, Math.max(self._minTranslationX,-currentPositionX + e.wheelDeltaX)),
						Math.min(0, Math.max(self._minTranslationY,-currentPositionY + e.wheelDeltaY)));

					clearTimeout(scrollbarTimeout);
					scrollbarTimeout = setTimeout(function(){
						self._endScrollBars();
					},500);

					self._handleMouseWheel && self._handleMouseWheel();
				}
			}));
		},

		destroy: function() {
			this._disconnectMouseWheelEvent && this._disconnectMouseWheelEvent();
			View.prototype.destroy.apply(this, arguments);
		},

		_animateToPosition: function(destinationTranslationX, destinationTranslationY, duration, curve, callback) {
			var self = this,
				contentContainer = self._contentContainer,
				contentContainerDomNode = contentContainer.domNode,
				destination,
				horizontalScrollBar = self._horizontalScrollBar,
				verticalScrollBar = self._verticalScrollBar;
			
			if (calculateDistance(self._currentTranslationX, self._currentTranslationY, destinationTranslationX, destinationTranslationY) < 1) {
				self._setTranslation(destinationTranslationX, destinationTranslationY);
				callback();
			} else {

				// Animate the contents
				destination = self._setTranslation(destinationTranslationX, destinationTranslationY, 1);
				self._contentAnimation = contentContainer.animate({
					transform: self._kineticTransform.translate(destination.translationX, destination.translationY),
					duration: Math.round(duration),
					curve: curve
				}, callback);

				// Animate the scroll bars
				self._horizontalScrollBarAnimation = horizontalScrollBar && horizontalScrollBar.animate({
					transform: this._kineticTransform.translate(Math.max(0,Math.min(1, 
						-destination.translationX / (contentContainer._measuredWidth - self._measuredWidth))) *
						(this._measuredWidth - this._scrollBarWidth), 0),
					duration: duration,
					curve: curve
				});
				self._verticalScrollBarAnimation = verticalScrollBar && verticalScrollBar.animate({
					transform: this._kineticTransform.translate(0, Math.max(0,Math.min(1, 
						-destination.translationY / (contentContainer._measuredHeight - self._measuredHeight))) *
						(this._measuredHeight - this._scrollBarHeight)),
					duration: duration,
					curve: curve
				});
			}
		},

		_setTranslation: function(translationX, translationY, dontSet) {

			// Check if the translation is outside the limits of the view and apply elasticity
			function elastize(value) {
				return elasticityLimit * (-1 / (value / elasticityDrag + 1) + 1);
			}
			var contentContainer = this._contentContainer,
				minTranslationX = this._minTranslationX,
				minTranslationY = this._minTranslationY,
				horizontalElastic = this._horizontalElastic && !this.disableBounce && 
					this._measuredWidth < contentContainer._measuredWidth,
				verticalElastic = this._verticalElastic && !this.disableBounce && 
					this._measuredHeight < contentContainer._measuredHeight,
				width = this._measuredWidth,
				height = this._measuredHeight,
				contentWidth = contentContainer._measuredWidth,
				contentHeight = contentContainer._measuredHeight;

			if (translationX > 0) {
				translationX = horizontalElastic ? elastize(translationX) : 0;
			} else if(translationX < minTranslationX) {
				translationX = horizontalElastic ? minTranslationX - elastize(minTranslationX - translationX) : minTranslationX;
			}
			if (translationY > 0) {
				translationY = verticalElastic ? elastize(translationY) : 0;
			} else if(translationY < minTranslationY) {
				translationY = verticalElastic ? minTranslationY - elastize(minTranslationY - translationY) : minTranslationY;
			}

			// Apply the translation
			dontSet || this._contentContainer.animate({
				transform: this._kineticTransform.translate(this._currentTranslationX = translationX, this._currentTranslationY = translationY)
			});

			// Update the scroll bars
			if (this._isScrollBarActive) {
				var horizontalScrollBar = this._horizontalScrollBar,
					verticalScrollBar = this._verticalScrollBar;
				
				horizontalScrollBar && horizontalScrollBar.animate({
					transform: this._kineticTransform.translate(Math.max(0,Math.min(1, 
						-translationX / (contentWidth - width))) * (this._measuredWidth - this._scrollBarWidth), 0)
				});
				
				verticalScrollBar && verticalScrollBar.animate({
					transform: this._kineticTransform.translate(0, Math.max(0,Math.min(1,
						-translationY / (contentHeight - height))) * (this._measuredHeight - this._scrollBarHeight))
				});
			}

			// Return the results
			return {
				translationX: translationX,
				translationY: translationY
			}
		},

		_cancelAnimations: function() {
			this._horizontalScrollBarAnimation && this._horizontalScrollBarAnimation.cancel();
			this._verticalScrollBarAnimation && this._verticalScrollBarAnimation.cancel();
			this._contentAnimation && this._contentAnimation.cancel();
		},

		_createHorizontalScrollBar: function() {
			this._horizontalScrollBar || this._add(this._horizontalScrollBar = UI.createView({
				zIndex: 0x7FFFFFFF, // Max (32-bit) z-index
				backgroundColor: "#555",
				borderRadius: 3,
				width: 0,
				height: 6,
				left: 0,
				bottom: 0,
				opacity: 0
			}));
		},
		
		_createVerticalScrollBar: function() {			
			this._verticalScrollBar || this._add(this._verticalScrollBar = UI.createView({
				zIndex: 0x7FFFFFFF, // Max (32-bit) z-index
				backgroundColor: "#555",
				borderRadius: 3,
				width: 6,
				height: 0,
				right: 0,
				top: 0,
				opacity: 0
			}));
		},

		_destroyHorizontalScrollBar: function() {
			this._horizontalScrollBarAnimation && this._horizontalScrollBarAnimation.cancel();
			this._remove(this._horizontalScrollBar);
		},

		_destroyVerticalScrollBar: function() {
			this._verticalScrollBarAnimation && this._verticalScrollBarAnimation.cancel();
			this._remove(this._verticalScrollBar);
		},

		_startScrollBars: function(normalizedScrollPosition, visibleAreaRatio) {

			if (this._horizontalScrollBar && visibleAreaRatio.x < 1 && visibleAreaRatio.x > 0) {
				var measuredWidth = this._measuredWidth,
					scrollBarWidth = this._scrollBarWidth = Math.round(Math.max(10, measuredWidth * visibleAreaRatio.x)),
					horizontalScrollBar = this._horizontalScrollBar;
				horizontalScrollBar.opacity = 0.5;
				horizontalScrollBar.domNode.style.width = unitize(scrollBarWidth);
				horizontalScrollBar.animate({
					transform: this._kineticTransform.translate(Math.max(0, Math.min(1, normalizedScrollPosition.x)) * 
						(measuredWidth - scrollBarWidth), 0)
				});
				this._isScrollBarActive = 1;
			}

			if (this._verticalScrollBar && visibleAreaRatio.y < 1 && visibleAreaRatio.y > 0) {
				var measuredHeight = this._measuredHeight,
					scrollBarHeight = this._scrollBarHeight = Math.round(Math.max(10, measuredHeight * visibleAreaRatio.y)),
					verticalScrollBar = this._verticalScrollBar;
				verticalScrollBar.opacity = 0.5;
				verticalScrollBar.domNode.style.height = unitize(scrollBarHeight);
				verticalScrollBar.animate({
					transform: this._kineticTransform.translate(0, Math.max(0, Math.min(1, normalizedScrollPosition.y)) * 
						(measuredHeight - scrollBarHeight))
				});
				this._isScrollBarActive = 1;
			}
		},

		_endScrollBars: function() {
			if (this._isScrollBarActive) {
				var self = this,
					horizontalScrollBar = self._horizontalScrollBar,
					verticalScrollBar = self._verticalScrollBar;

				function animateScrollBar(scrollBar) {
					scrollBar && scrollBar.animate({
						opacity: 0,
						duration: 500
					}, function() {
						self._isScrollBarActive = false;
					});
				}

				animateScrollBar(horizontalScrollBar);
				animateScrollBar(verticalScrollBar);
			}
		},
		
		properties: {
			scrollingEnabled: true
		}
	});
});
},
"Ti/UI/ScrollableView":function(){
/* /titanium/Ti/UI/ScrollableView.js */

/*global define window*/
define(['Ti/_/declare', 'Ti/UI/View', 'Ti/_/dom', 'Ti/_/has', 'Ti/_/style', 'Ti/UI', 'Ti/_/browser'],
	function(declare, View, dom, has, style, UI, browser) {

	var setStyle = style.set,
		is = require.is,
		unitize = dom.unitize,
		on = require.on,
		once = on.once,
		global = window,
		transitionEnd = browser.runtime == 'webkit' ? 'webkitTransitionEnd' : 'transitionend',

		useTouch = has('touch'),
		usePointer = global.navigator.msPointerEnabled,

		// Maximum time that a gesture can be considered a flick
		maxFlickTime = 200,

		// Minimum distance that must be traveled to register the flick
		flickThreshold = 10,

		minAnimationTime = 25,

		maxAnimationTime = 1000,

		flickAnimationScaleFactor = 0.5,

		dragAnimationScaleFactor = 2;

	return declare('Ti.UI.ScrollableView', View, {

		constructor: function(){

			// Create the content container
			var containerDomNode,
				self = this,
				offsetX = 0;
			self._add(self._contentContainer = UI.createView({
				left: 0,
				top: 0,
				width: UI.SIZE,
				height: '100%',
				layout: 'constrainingHorizontal'
			}));
			containerDomNode = self._contentContainer.domNode;

			// Create the paging control container
			self._add(self._pagingControlContainer = UI.createView({
				width: '100%',
				height: 20,
				bottom: 0,
				backgroundColor: 'black',
				opacity: 0,
				touchEnabled: false
			}));

			self._pagingControlContainer._add(self._pagingControlContentContainer = UI.createView({
				width: UI.SIZE,
				height: '100%',
				top: 0,
				touchEnabled: false,
				layout: 'constrainingHorizontal'
			}));

			// State variables
			self.__values__.properties.views = [];
			self._viewToRemoveAfterScroll = -1;

			on(self, 'postlayout', function() {
				self._animating || self._setTranslation(self.currentPage * -self._measuredWidth);
			});

			// NOTE: MSPointer* events should be converted to just pointer* once Windows Phone 8.1 is out
			on(containerDomNode, usePointer ? 'MSPointerDown' : useTouch ? 'touchstart' : 'mousedown', function(e) {
				var startX = e.touches ? e.touches[0].clientX : e.clientX,
					currentX = startX,
					startTime = Date.now(),
					width = self._measuredWidth,
					mouseMoveListener = function(e) {
						var currentPage = self.currentPage,
							offset = currentX - startX + offsetX;
						width = self._measuredWidth;
						e.preventDefault();
						currentX = e.touches ? e.touches[0].clientX : e.clientX;
						self._setTranslation((currentPage * -width) + offset);
						self.fireEvent('scroll', {
							currentPage: currentPage,
							currentPageAsFloat: currentPage - offset / width,
							view: self.views[currentPage]
						});
					},
					mouseUpListener = function(e) {
						var	now = Date.now(),
							isFlick = now - startTime < maxFlickTime,
							currentPage = self.currentPage,
							thresholdMet = Math.abs(startX - currentX) > (isFlick ? flickThreshold : width / 2),
							props = self.__values__.properties,
							duration = Math.abs(currentX - startX);
						global.removeEventListener(usePointer ? 'MSPointerMove' : useTouch ? 'touchmove' : 'mousemove', mouseMoveListener);
						global.removeEventListener(usePointer ? 'MSPointerUp' : useTouch ? 'touchend' : 'mouseup', mouseUpListener);
						width = self._measuredWidth;
						self._animating = 1;
						e.preventDefault();

						if (thresholdMet) {
							if (startX > currentX) {
								currentPage !== props.views.length - 1 && currentPage++;
							} else {
								currentPage !== 0 && currentPage--;
							}
							duration = width - duration;
						}
						self._showPagingControl(currentPage);
						offsetX = currentX - startX + offsetX;
						duration = Math.max(minAnimationTime, Math.min(maxAnimationTime,
							(isFlick ? flickAnimationScaleFactor : dragAnimationScaleFactor) * duration));
						setStyle(containerDomNode, 'transition', duration + 'ms ease-out');
						setTimeout(function(){
							once(containerDomNode, transitionEnd, function() {
								setStyle(containerDomNode, 'transition', '');
								self._animating = 0;
								props.currentPage = currentPage;
								self._updatePagingControl();
								self.fireEvent('scrollend',{
									currentPage: currentPage,
									view: self.views[currentPage]
								});
							});
							self._setTranslation(currentPage * -width);
						}, 1);
						self.fireEvent('dragend', {
							currentPage: currentPage,
							view: self.views[currentPage]
						});
					};
				self._showPagingControl(self.currentPage, 1);
				e.preventDefault();
				offsetX = self._animating ? offsetX || 0 : 0;
				setStyle(containerDomNode, 'transition', '');
				self._setTranslation((self.currentPage * -width) + offsetX);
				self._animating = 0;
				global.addEventListener(usePointer ? 'MSPointerMove' : useTouch ? 'touchmove' : 'mousemove', mouseMoveListener);
				global.addEventListener(usePointer ? 'MSPointerUp' : useTouch ? 'touchend' : 'mouseup', mouseUpListener);
				self.fireEvent('dragstart');
			});
		},

		_setTranslation: function(offset) {
			setStyle(this._contentContainer.domNode, 'transform', 'translatez(0) translatex(' + offset + 'px)');
		},

		_showPagingControl: function(newIndex, indefinite) {
			var self = this;
			if (!self.showPagingControl) {
				self._pagingControlContainer.opacity = 0;
				return;
			}
			self._pagingAnimation && self._pagingAnimation.cancel();
			self._pagingAnimation = self._pagingControlContainer.animate({
				duration: 250,
				opacity: 0.75
			});
			clearInterval(self._pagingTimeout);
			if (!indefinite && self.pagingControlTimeout > 0) {
				self._pagingTimeout = setTimeout(function() {
					self._pagingAnimation && self._pagingAnimation.cancel();
					self._pagingAnimation = self._pagingControlContainer.animate({
						duration: 750,
						opacity: 0
					}, function() {
						self._pagingAnimation = void 0;
					});
				}, self.pagingControlTimeout);
			} else {
				self._pagingAnimation = void 0;
			}
		},

		_updatePagingControl: function() {
			var contentContainer = this._pagingControlContentContainer,
				numViews = this.views.length,
				diameter = this.pagingControlHeight / 2;
			if (numViews !== contentContainer._numViews || diameter !== contentContainer._diameter) {
				contentContainer._numViews = numViews;
				contentContainer._diameter = diameter;
				contentContainer._removeAllChildren();
				for (var i = 0; i < this.views.length; i++) {
					contentContainer._add(UI.createView({
						width: diameter,
						height: diameter,
						left: 5,
						right: 5,
						backgroundColor: '#aaa',
						borderRadius: unitize(diameter / 2)
					}));
				}
				contentContainer._highlightedPage = -1;
			}
			if (contentContainer._highlightedPage !== this.currentPage) {
				contentContainer._highlightedPage < 0 ||
					(contentContainer._children[contentContainer._highlightedPage].backgroundColor = '#aaa');
				contentContainer._children[this.currentPage].backgroundColor = '#fff';
				contentContainer._highlightedPage = this.currentPage;
			}
		},

		addView: function(view) {
			if (view) {
				view.width = '100%';
				view.height = '100%';
				this.views.push(view);
				this._contentContainer._add(view);
				if (this.views.length == 1) {
					this.__values__.properties.currentPage = 0;
				}
				this._updatePagingControl();
			}
		},

		removeView: function(view) {

			// Get and validate the location of the view
			var viewIndex = is(view,'Number') ? view : this.views.indexOf(view);
			if (viewIndex < 0 || viewIndex >= this.views.length) {
				return;
			}

			// Update the view if this view was currently visible
			if (viewIndex == this.currentPage && this.views.length !== 1) {
				this._viewToRemoveAfterScroll = viewIndex;
				this.scrollToView(viewIndex == this.views.length - 1 ? --viewIndex : ++viewIndex);
			} else {
				this._removeViewFromList(viewIndex);
			}
		},

		_removeViewFromList: function(viewIndex) {

			var contentContainer = this._contentContainer,
				self = this;

			// Update the current view if necessary once everything has been re-laid out.
			if (viewIndex < this.currentPage) {
				self.__values__.properties.currentPage--;
			}

			// Remove the view and update the paging control
			contentContainer._remove(self.views.splice(viewIndex,1)[0]);
			self.views.length || (self.__values__.properties.currentPage = -1);
			once(UI, 'postlayout', function() {
				setTimeout(function(){
					self._setTranslation(self.currentPage * -self._measuredWidth);
				}, 1);
			});
		},

		scrollToView: function(view, noAnimation) {
			var viewIndex = is(view,'Number') ? view : this.views.indexOf(view),
				self = this;

			// Sanity check
			if (viewIndex < 0 || viewIndex >= this.views.length || viewIndex == this.currentPage) {
				return;
			}

			function scroll(){

				// Calculate the views to be scrolled
				var contentContainer = self._contentContainer,
					containerDomNode = contentContainer.domNode,
					destination = -self.views[viewIndex]._measuredLeft,

					// Calculate a weighted duration so that larger views take longer to scroll.
					duration = Math.max(minAnimationTime, Math.min(maxAnimationTime,
						dragAnimationScaleFactor * contentContainer._measuredWidth));

				// Animate the views
				self._updatePagingControl();
				self._showPagingControl(viewIndex);

				if (noAnimation) {
					self._setTranslation(destination);
					self.__values__.properties.currentPage = viewIndex;
				} else {
					setStyle(containerDomNode, 'transition', duration + 'ms ease-out');
					setTimeout(function(){
						once(containerDomNode, transitionEnd, function() {
							setStyle(containerDomNode, 'transition', '');
							self._animating = 0;
							self.__values__.properties.currentPage = viewIndex;
							self._updatePagingControl();
							if (self._viewToRemoveAfterScroll !== -1) {
								destination += self.views[self._viewToRemoveAfterScroll]._measuredWidth;
								self._removeViewFromList(self._viewToRemoveAfterScroll);
								self._viewToRemoveAfterScroll = -1;
							}
							self.fireEvent('scrollend',{
								currentPage: viewIndex,
								view: self.views[viewIndex]
							});
						});
						self._setTranslation(destination);
					}, 1);
				}
			}

			// If the scrollableView hasn't been laid out yet, we must wait until it is
			if (self._contentContainer.domNode.offsetWidth) {
				scroll();
			} else {
				once(self, 'postlayout', scroll);
			}
		},

		_defaultWidth: UI.FILL,

		_defaultHeight: UI.FILL,

		properties: {
			currentPage: {
				set: function(value, oldValue) {
					if (value >= 0 && value < this.views.length) {
						this.scrollToView(value, 1);
						return value;
					}
					return oldValue;
				},
				value: -1
			},
			pagingControlColor: {
				set: function(value) {
					this._pagingControlContainer.backgroundColor = value;
					return value;
				},
				value: 'black'
			},
			pagingControlHeight: {
				set: function(value) {
					this._pagingControlContainer.height = value;
					return value;
				},
				value: 20
			},
			pagingControlTimeout: {
				post: function(value) {
					value || (this._pagingControlContainer.opacity = 0.75);
				},
				value: 3000
			},
			showPagingControl: false,
			views: {
				set: function(value) {

					// Value must be an array
					if (!is(value,'Array')) {
						return;
					}

					// Add the views to the content container
					var i = 0,
						len = value.length,
						contentContainer = this._contentContainer,
						view;
					contentContainer._removeAllChildren();
					for(; i < len; i++) {
						(view = value[i]).width = '100%';
						view.height = '100%';
						contentContainer._add(view);
					}
					this.__values__.properties.currentPage = len ? 0 : -1;

					return value;
				},
				post: '_updatePagingControl'
			}
		}

	});

});
},
"Ti/UI/Slider":function(){
/* /titanium/Ti/UI/Slider.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/UI/Widget', 'Ti/_/dom', 'Ti/_/css', 'Ti/_/style', 'Ti/_/lang', 'Ti/UI'],
	function(declare, Widget, dom, css, style, lang, UI) {

	var on = require.on,
		setStyle = style.set;

	return declare('Ti.UI.Slider', Widget, {

		constructor: function() {
			var self = this,
				initialPosition,
				initialValue,
				track = self._track = dom.create('div', {
					className: 'TiUISliderTrack'
				}, self.domNode),
				thumb = self._thumb = dom.create('div', {
					className: 'TiUIElementGradient TiUISliderThumb'
				}, self.domNode);

			on(self, 'touchstart', function(e) {
				initialPosition = e.x;
				initialValue = self.value;
			});

			on(self, 'touchmove', function(e) {
				self.value = (e.x - initialPosition) * (self.max - self.min) / (track.offsetWidth - thumb.offsetWidth) + initialValue;
			});

			on(self, 'postlayout', self, '_updatePosition');
		},

		_constrainedUpdate: function(value) {
			this.__values__.properties.value = this._constrainValue(value);
			this._updatePosition();
		},

		_constrainValue: function(value) {
			return Math.min(lang.val(this.maxRange, this.max), Math.max(lang.val(this.minRange, this.min), value));
		},

		_updatePosition: function() {
			var thumb = this._thumb;
			this._thumbLocation = Math.round((this._track.offsetWidth - thumb.offsetWidth) *
				((this.value - this.min) / (this.max - this.min)));
			setStyle(thumb, 'transform', 'translateX(' + this._thumbLocation + 'px)');
		},

		_defaultWidth: UI.FILL,

		_defaultHeight: UI.SIZE,

		_setTouchEnabled: function(value) {
			var cssVal = value ? 'auto' : 'none';
			Widget.prototype._setTouchEnabled.call(this, value);
			setStyle(this._track, 'pointerEvents', cssVal);
			setStyle(this._thumb, 'pointerEvents', cssVal);
		},

		_getContentSize: function() {
			return {
				width: 200,
				height: 40
			};
		},

		properties: {

			enabled: {
				set: function(value, oldValue) {
					if (value !== oldValue) {
						css.remove(this._thumb, ['TiUIElementGradient', 'TiUISliderThumbDisabled']);
						css.add(this._thumb, value ? 'TiUIElementGradient' : 'TiUISliderThumbDisabled');
						this._setTouchEnabled(value);
					}
					return value;
				},
				value: true
			},

			max: {
				set: function(value) {
					return Math.max(this.min, value);
				},
				post: '_constrainedUpdate',
				value: 1
			},

			maxRange: {
				set: function(value) {
					return Math.min(this.max, value);
				},
				post: '_constrainedUpdate'
			},

			min: {
				set: function(value) {
					return Math.min(this.max, value);
				},
				post: '_constrainedUpdate',
				value: 0
			},

			minRange: {
				set: function(value) {
					return Math.max(this.min, value);
				},
				post: '_constrainedUpdate'
			},

			value: {
				set: function(value) {
					return this._constrainValue(value);
				},
				post: function(value, oldValue) {
					if (value !== oldValue) {
						this.fireEvent('change', {
							value: value,
							thumbOffset: {
								x: 0,
								y: 0
							},
							thumbSize: {
								height: 0,
								width: 0
							}
						});
					}
					this._updatePosition();
				},
				value: 0
			}

		}

	});

});

},
"Ti/UI/Switch":function(){
/* /titanium/Ti/UI/Switch.js */

define(["Ti/_/declare", "Ti/_/UI/FontWidget", "Ti/_/css", "Ti/_/style", "Ti/UI"],
	function(declare, FontWidget, css, style, UI) {

	var setStyle = style.set,
		postDoBackground = {
			post: function() {
				if (this.backgroundColor || this.backgroundDisabledColor || this.backgroundDisabledImage || this.backgroundFocusedColor || 
					this.backgroundFocusedImage || this.backgroundImage || this.backgroundSelectedColor || this.backgroundSelectedImage) {
					this._clearDefaultLook();
				} else {
					this._setDefaultLook();
				}
				this._doBackground();
			}
		};

	return declare("Ti.UI.Switch", FontWidget, {

		constructor: function(args) {
			
			var contentContainer = this._contentContainer = UI.createView({
				width: UI.INHERIT,
				height: UI.INHERIT,
				layout: UI._LAYOUT_CONSTRAINING_VERTICAL,
				borderColor: "transparent"
			});
			this._add(contentContainer);
			
			contentContainer._add(this._switchTitle = UI.createLabel({
				width: UI.INHERIT,
				height: UI.INHERIT,
				verticalAlign: UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
				textAlign: UI.TEXT_ALIGNMENT_CENTER
			}));
			
			contentContainer._add(this._switchIndicator = UI.createView({
				width: 40,
				height: 10,
				borderRadius: 4,
				borderWidth: 1,
				borderColor: "#888"
			}));
			
			// Set the default look
			this._setDefaultLook();
			var self = this;
			self.addEventListener("singletap",function(){
				self.value = !self.value;
			});
			
			this.value = false;
		},

		_setDefaultLook: function() {
			if (!this._hasDefaultLook) {
				this._hasDefaultLook = true;
				this._previousBorderWidth = this.borderWidth;
				this._previousBorderColor = this.borderColor;
				css.add(this.domNode, "TiUIElementGradient");
				css.add(this.domNode, "TiUIButtonDefault");
				this._contentContainer.borderWidth = 6;
				this._getBorderFromCSS();
			}
		},
		
		_clearDefaultLook: function() {
			if (this._hasDefaultLook) {
				this._hasDefaultLook = false;
				this.borderWidth = this._previousBorderWidth;
				this.borderColor = this._previousBorderColor;
				css.remove(this.domNode, "TiUIElementGradient");
				css.remove(this.domNode, "TiUIButtonDefault");
				this._contentContainer.borderWidth = 0;
			}
		},
		
		_defaultWidth: UI.SIZE,
		
        _defaultHeight: UI.SIZE,

		properties: {
			
			// Override the default background info so we can hook into it
			backgroundColor: postDoBackground,

			backgroundDisabledColor: postDoBackground,

			backgroundDisabledImage: postDoBackground,

			backgroundFocusedColor: postDoBackground,

			backgroundFocusedImage: postDoBackground,

			backgroundImage: postDoBackground,

			backgroundSelectedColor: postDoBackground,

			backgroundSelectedImage: postDoBackground,
			
			enabled: {
				set: function(value, oldValue) {
					
					if (value !== oldValue) {
						if (this._hasDefaultLook) {	
							if (!value) {
								css.remove(this.domNode,"TiUIElementGradient");
								setStyle(this.domNode,"backgroundColor","#aaa");
							} else {
								css.add(this.domNode,"TiUIElementGradient");
								setStyle(this.domNode,"backgroundColor","");
							}
						}
						this._setTouchEnabled(value);
					}
					return value;
				},
				value: true
			},
			
			textAlign: {
				set: function(value) {
					this._switchTitle.textAlign = value;
					return value;
				}
			},
			
			titleOff: {
				set: function(value) {
					if (!this.value) {
						this._switchTitle.text = value;
					}
					return value;
				},
				value: "Off"
			},
			
			titleOn: {
				set: function(value) {
					if (this.value) {
						this._switchTitle.text = value;
					}
					return value;
				},
				value: "On"
			},
			
            value: {
				set: function(value) {
					this._switchIndicator.backgroundColor = value ? "#0f0" : "#aaa";
					value = !!value;
					this._switchTitle.text = value ? this.titleOn : this.titleOff;
					return value;
				},
				post: function() {
					this.fireEvent("change",{
						value: this.value
					});
				}
			},
			
			verticalAlign: {
				set: function(value) {
					this._switchTitle.verticalAlign = value;
				},
				value: UI.TEXT_VERTICAL_ALIGNMENT_CENTER
			}

		}

	});

});

},
"Ti/UI/Tab":function(){
/* /titanium/Ti/UI/Tab.js */

define(["Ti/_/declare", "Ti/UI/View", "Ti/_/dom", "Ti/Locale", "Ti/UI", "Ti/UI/MobileWeb", "Ti/UI/Label", "Ti/UI/ImageView"],
	function(declare, View, dom, Locale, UI, MobileWeb) {

	var postTitle = {
			post: function() {
				this._tabTitle.text = this._getTitle();
			}
		},
		UI_FILL = UI.FILL,
		UI_SIZE = UI.SIZE;

	return declare("Ti.UI.Tab", View, {

		constructor: function(args) {
			var win = args && args.window,
				container = UI.createView({
					layout: UI._LAYOUT_CONSTRAINING_VERTICAL,
					width: "100%",
					height: UI_SIZE
				}),
				navGroup = this._tabNavigationGroup = MobileWeb.createNavigationGroup({ window: win, _tab: this });;

			this._add(container);

			container._add(this._tabIcon = UI.createImageView({
				height: UI_SIZE,
				width: UI_SIZE
			}));

			container._add(this._tabTitle = UI.createLabel({
				width: "100%",
				wordWrap: true,
				textAlign: UI.TEXT_ALIGNMENT_CENTER
			}));

			win && require.on(this, "singletap", this, function(e) {
				var tabGroup = this._tabGroup;
				if (tabGroup) {
					if (tabGroup.activeTab === this) {
						navGroup._reset();
					} else {
						tabGroup.activeTab = this;
					}
				}
			});
		},

		_defaultWidth: UI_FILL,

		_defaultHeight: UI_FILL,

		open: function(win, options) {
			this._tabNavigationGroup.open(win, options);
		},

		close: function(win, options) {
			this._tabNavigationGroup.close(win, options);
		},

		_focus: function() {
			this.fireEvent("focus", this._tabGroup._getEventData());
			var win = this._tabNavigationGroup._getTopWindow();
			if (win) {
				if (this._tabGroup && this._tabGroup._opened && !win._opened) {
					win._opened = 1;
					win.fireEvent("open");
				}
				win._handleFocusEvent();
			}
		},

		_blur: function() {
			var win = this._tabNavigationGroup._getTopWindow();
			win && win._handleBlurEvent();
			this.fireEvent("blur", this._tabGroup._getEventData());
		},

		_getTitle: function() {
			return Locale._getString(this.titleid, this.title);
		},

		_setTabGroup: function(tabGroup) {
			this._tabGroup = tabGroup;
			this._tabNavigationGroup.navBarAtTop = tabGroup.tabsAtTop;
			this._win && (this._win.tabGroup = tabGroup);
		},

		_setNavBarAtTop: function(value) {
			this._tabNavigationGroup.navBarAtTop = value;
		},

		properties: {
			active: {
				get: function() {
					return this._tabGroup && this._tabGroup.activeTab === this;
				},
				post: function(value) {
					var tabGroup = this._tabGroup,
						navGroup = this._tabNavigationGroup,
						doEvents = tabGroup._focused && tabGroup._opened;
					if (value) {
						navGroup.navBarAtTop = tabGroup.tabsAtBottom;
						navGroup._updateNavBar();
						tabGroup._addTabContents(navGroup);
						doEvents && this._focus();
					} else {
						tabGroup._removeTabContents(navGroup);
						doEvents && this._blur();
					}
				}
			},

			icon: {
				set: function(value) {
					return this._tabIcon.image = value;
				}
			},

			title: postTitle,

			titleid: postTitle
		}

	});

});

},
"Ti/UI/TabGroup":function(){
/* /titanium/Ti/UI/TabGroup.js */

define(["Ti/_/declare", "Ti/_/UI/SuperView", "Ti/UI/View", "Ti/UI", "Ti/_/lang"], 
	function(declare, SuperView, View, UI, lang) {

	var is = require.is,
		UI_FILL = UI.FILL,
		postUpdateTabsBackground = {
			post: "_updateTabsBackground"
		};

	return declare("Ti.UI.TabGroup", SuperView, {

		constructor: function(args) {
			var self = this,
				tabsAtBottom = self.__values__.constants.tabsAtBottom = lang.val(args && args.tabsAtBottom, self.__values__.constants.tabsAtBottom),
				TabBarContainer = declare(View, {
					// set a declared class here so that it's not defined globally, yet we still are able
					// to set a widget id and css class on the dom node.
					declaredClass: "Ti.UI.TabBarContainer"
				});

			// Create the tab bar
			self._tabBarContainer = new TabBarContainer({
				width: UI_FILL,
				layout: UI._LAYOUT_CONSTRAINING_HORIZONTAL
			});
			self.tabHeight = 75;

			// Create the tab window container
			self._tabContentContainer = UI.createView({
				width: UI_FILL,
				height: UI_FILL
			});

			// Add the windows ordered such that they respect tabsAtBottom
			self.layout = UI._LAYOUT_CONSTRAINING_VERTICAL;
			self.tabs = [];
			self.tabsAtBottom = lang.val(args && args.tabsAtBottom, true);
		},

		addTab: function(tab) {
			// Initialize the tabs, if necessary
			var tabs = this.tabs;
			tabs.push(tab);
			tab._setTabGroup(this);

			// Set the active tab if there are currently no tabs, otherwise add a divider
			if (tabs.length === 1) {
				this.activeTab = tab;
			} else {
				this._tabBarContainer._add(this._createTabDivider());
			}

			// Add the tab to the UI
			this._tabBarContainer._add(tab);

			// Update the background on the tab
			this._updateTabBackground(tab);

			// Publish the tab
			this._publish(tab);
		},

		_addTabContents: function(contents) {
			this._tabContentContainer._add(contents);
		},

		_removeTabContents: function(contents) {
			this._tabContentContainer._remove(contents);
		},

		removeTab: function(tab) {
			// Remove the tab from the list
			var tabs = this.tabs,
				idx = this.tabs.indexOf(tab);

			if (idx >= 0) {
				tabs.splice(idx, 1);

				// Remove the tab from the tab bar and recalculate the tab sizes
				this._tabBarContainer.remove(tab);

				// Update the active tab, if necessary
				tab === this._activeTab && this._activateTab(tabs[0]);

				// Unpublish the tab
				this._unpublish(tab);
			}
		},

		_createTabDivider: function() {
			return UI.createView({
				width: this.tabDividerWidth,
				height: UI_FILL,
				backgroundColor: this.tabDividerColor
			});
		},

		close: function() {
			this._previousTab = null;
			SuperView.prototype.close.call(this);
		},

		_getEventData: function() {
			var tabs = this.tabs,
				previousTab = this._previousTab,
				activeTab = this._activeTab;

			return {
				index: activeTab && tabs.indexOf(activeTab),
				previousIndex: previousTab && tabs.indexOf(previousTab),
				tab: activeTab,
				previousTab: previousTab
			};
		},

		_handleFocusEvent: function() {
			// TabGroup was just opened or a window was closed and the TabGroup regained focus

			var previousTab = this._previousTab,
				activeTab = this._activeTab;

			previousTab && previousTab._blur();

			if (!this._focused && this._opened) {
				this.fireEvent("focus", this._getEventData());
				activeTab && activeTab._focus();
			}
			this._focused = 1;
		},

		_handleBlurEvent: function(blurTabs) {
			// TabGroup is about to be closed or a window was opened

			// blurTabs: 1) blur all tabs, 2) blur active tab only
			if (blurTabs) {
				var i = 0,
					len = this.tabs.length,
					tab;

				while (i < len) {
					tab = this.tabs[i++];
					(blurTabs !== 2 || tab === this._activeTab) && tab._blur();
				}

				this._previousTab = void 0;
			}

			this._focused && this._opened && this.fireEvent("blur", this._getEventData());
			this._focused = 0;
		},

		_activateTab: function(activeTab) {
			var tabs = this.tabs,
				previousTab = this._activeTab;

			if (previousTab !== activeTab) {
				if (this._previousTab = previousTab) {
					previousTab.active = false;
					previousTab._doBackground();
				}

				UI.currentTab = this._activeTab = activeTab;
				activeTab.active = true;

				this._updateTabsBackground();
			}
		},

		_updateTabBackground: function(tab) {
			var prefix = tab.active ? "activeTab" : "tabs";

			["", "Focused", "Disabled", "Selected"].forEach(function(s) {
				s = "Background" + s;
				tab["_default" + s + "Color"] = this[prefix + s + "Color"];
				tab["_default" + s + "Image"] = this[prefix + s + "Image"];
			}, this);

			tab._doBackground();
		},

		_updateTabsBackground: function() {
			var tabs = this.tabs,
				i = 0,
				l = tabs.length;
			while (i < l) {
				this._updateTabBackground(tabs[i++]);
			}
		},

		_updateDividers: function(){
			var tabs = this._tabBarContainer._children,
				i = 1;
			for(; i < tabs.length; i += 2) {
				var tab = tabs[i];
				tab.width = this.tabDividerWidth;
				tab.backgroundColor = this.tabDividerColor;
			}
		},

		_defaultWidth: UI_FILL,

		_defaultHeight: UI_FILL,

		constants: {
			bubbleParent: false
		},

		properties: {
			activeTab: {
				set: function(value) {
					if (is(value, "Number")) {
						value = this.tabs[value];
					}
					if (!value in this.tabs) {
						return;
					}
					return value;
				},
				post: function(value) {
					lang.isDef(value) && this._activateTab(value);
				}
			},

			tabs: {
				set: function(value) {
					if (is(value, "Array")) {
						var i,
							tabBarContainer = this._tabBarContainer;

						tabBarContainer._removeAllChildren();

						if (value.length) {
							for (i = 0; i < value.length; i++) {
								value[i]._setTabGroup(this);
								i == 0 && this._activateTab(this.activeTab = value[i]);
								this._publish(value[i]);
								i && tabBarContainer._add(this._createTabDivider());
								tabBarContainer._add(value[i]);
							}
						}

						return value;
					}
				},
				post: "_updateTabsBackground"
			},

			tabsAtBottom: {
				set: function(value, oldValue) {
					if (value !== oldValue) {
						var tabContentContainer = this._tabContentContainer,
							tabBarContainer = this._tabBarContainer;

						this._activeTab && this._activeTab._setNavBarAtTop(value);

						this._remove(tabContentContainer);
						this._remove(tabBarContainer);

						if (value) {
							this._add(tabContentContainer);
							this._add(tabBarContainer);
						} else {
							this._add(tabBarContainer);
							this._add(tabContentContainer);
						}
					}
					return value;
				}
			},

			activeTabBackgroundColor: {
				post: "_updateTabsBackground",
				value: "#fff"
			},

			activeTabBackgroundImage: postUpdateTabsBackground,

			activeTabBackgroundDisabledColor: {
				post: "_updateTabsBackground",
				value: "#888"
			},

			activeTabBackgroundDisabledImage: postUpdateTabsBackground,

			activeTabBackgroundFocusedColor: {
				post: "_updateTabsBackground",
				value: "#ccc"
			},

			activeTabBackgroundFocusedImage: postUpdateTabsBackground,

			activeTabBackgroundSelectedColor: {
				post: "_updateTabsBackground",
				value: "#ddd"
			},

			activeTabBackgroundSelectedImage: postUpdateTabsBackground,

			tabsBackgroundColor: {
				post: "_updateTabsBackground",
				value: "#aaa"
			},

			tabsBackgroundImage: postUpdateTabsBackground,

			tabsBackgroundDisabledColor: {
				post: "_updateTabsBackground",
				value: "#666"
			},

			tabsBackgroundDisabledImage: postUpdateTabsBackground,

			tabsBackgroundFocusedColor: {
				post: "_updateTabsBackground",
				value: "#ccc"
			},

			tabsBackgroundFocusedImage: postUpdateTabsBackground,
			
			tabsBackgroundSelectedColor: {
				post: "_updateTabsBackground",
				value: "#ddd"
			},
			
			tabsBackgroundSelectedImage: postUpdateTabsBackground,
			
			tabDividerColor: {
				post: "_updateDividers",
				value: "#555"
			},
			
			tabDividerWidth: {
				post: "_updateDividers",
				value: 1
			},
			
			tabHeight: {
				set: function(value) {
					this._tabBarContainer.height = value;
					return value;
				}
			}
		}
	});

});

},
"Ti/_/UI/SuperView":function(){
/* /titanium/Ti/_/UI/SuperView.js */

/*global define*/
define(['Ti/_/declare', 'Ti/UI', 'Ti/UI/View'], function(declare, UI, View) {

	var windows = [];

	return declare('Ti._.UI.SuperView', View, {

		destroy: function() {
			this.close();
			View.prototype.destroy.apply(this, arguments);
		},

		open: function() {
			if (!this._opened) {
				this._opened = 1;
				UI._addWindow(this, 1).show();

				var len = windows.length;
				len && windows[len-1]._handleBlurEvent(2); // only blur the active tab
				windows.push(this);

				this.fireEvent('open');
				this._handleFocusEvent();
			}
		},

		close: function() {
			if (this.tab) {
				this.tab.close(this);
			} else if (this._opened) {
				var i = windows.indexOf(this),
					same = i === windows.length - 1;

				UI._removeWindow(this);

				if (~i) {
					same && this._handleBlurEvent(1); // blur all tabs
					windows.splice(i, 1);
				}

				this.fireEvent('close');

				// if we just closed the active window, focus the next top-most window
				if (same) {
					for (i = windows.length - 1; i >= 0 && !windows[i]._opened; i--) {}
					i >= 0 && windows[i]._handleFocusEvent();
				}

				this._opened = 0;
			}
		},

		_handleFocusEvent: function() {
			this.fireEvent('focus');
		},

		_handleBlurEvent: function() {
			this.fireEvent('blur');
		}

	});

});
},
"Ti/UI/TableView":function(){
/* /titanium/Ti/UI/TableView.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/UI/KineticScrollView', 'Ti/_/style', 'Ti/_/lang', 'Ti/UI'],
	function(declare, KineticScrollView, style, lang, UI) {

	var setStyle = style.set,
		is = require.is,
		isDef = lang.isDef,

		// The amount of deceleration (in pixels/ms^2)
		deceleration = 0.001,
		eventFilter = /^click|singletap|longpress$/;

	return declare('Ti.UI.TableView', KineticScrollView, {

		constructor: function() {
			var contentContainer = UI.createView({
				width: UI.INHERIT,
				height: UI.SIZE,
				left: 0,
				top: 0,
				layout: UI._LAYOUT_CONSTRAINING_VERTICAL
			});

			this._initKineticScrollView(contentContainer, 'vertical', 'vertical', 1);

			contentContainer._add(this._header = UI.createView({
				height: UI.SIZE,
				width: UI.INHERIT,
				layout: UI._LAYOUT_CONSTRAINING_VERTICAL
			}));
			contentContainer._add(this._sections = UI.createView({
				height: UI.SIZE,
				width: UI.INHERIT,
				layout: UI._LAYOUT_CONSTRAINING_VERTICAL
			}));
			contentContainer._add(this._footer = UI.createView({
				height: UI.SIZE,
				width: UI.INHERIT,
				layout: UI._LAYOUT_CONSTRAINING_VERTICAL
			}));

			this.__values__.constants.sections = [];
		},

		_handleMouseWheel: function() {
			this._fireScrollEvent('scroll');
		},

		_handleDragStart: function() {
			this.fireEvent('dragstart');
		},

		_handleDrag: function(e) {
			this._fireScrollEvent('scroll', e);
		},

		_handleDragEnd: function(e, velocityX, velocityY) {
			var self = this;
			if (isDef(velocityY)) {
				var distance = velocityY * velocityY / (1.724 * deceleration) * (velocityY < 0 ? -1 : 1),
					duration = Math.abs(velocityY) / deceleration,
					translation = Math.min(0, Math.max(self._minTranslationY, self._currentTranslationY + distance));
				self.fireEvent('dragend',{
					decelerate: true
				});
				self._animateToPosition(self._currentTranslationX, translation, duration, UI.ANIMATION_CURVE_EASE_OUT, function() {
					self._setTranslation(self._currentTranslationX, translation);
					self._endScrollBars();
					self._fireScrollEvent('scrollend', e);
				});
			}

		},

		_fireScrollEvent: function(type, e) {
			// Calculate the visible items
			var firstVisibleItem,
				visibleItemCount = 0,
				contentContainer = this._contentContainer,
				y = -this._currentTranslationY,
				sections = this._sections,
				sectionsList = sections._children,
				len = sectionsList.length;
			for(var i = 0; i < len; i+= 2) {

				// Check if the section is visible
				var section = sectionsList[i],
					sectionOffsetTop = y - section._measuredTop,
					sectionOffsetBottom = section._measuredHeight - sectionOffsetTop;
				if (sectionOffsetTop > 0 && sectionOffsetBottom > 0) {
					var rows = section._rows._children;
					for (var j = 1; j < rows.length; j += 2) {
						var row = rows[j],
							rowOffsetTop = sectionOffsetTop - row._measuredTop,
							rowOffsetBottom = row._measuredHeight - rowOffsetTop;
						if (rowOffsetTop > 0 && rowOffsetBottom > 0) {
							visibleItemCount++;
							!firstVisibleItem && (firstVisibleItem = row);
						}
					}
				}
			}

			// Create the scroll event
			this.fireEvent(type, {
				contentOffset: {
					x: 0,
					y: y
				},
				contentSize: {
					width: sections._measuredWidth,
					height: sections._measuredHeight
				},
				firstVisibleItem: firstVisibleItem,
				size: {
					width: contentContainer._measuredWidth,
					height: contentContainer._measuredHeight
				},
				totalItemCount: this.data.length,
				visibleItemCount: visibleItemCount,
				x: e && e.x,
				y: e && e.y
			});
		},

		_defaultWidth: UI.FILL,

		_defaultHeight: UI.FILL,

		_getContentOffset: function(){
			return {
				x: -this._currentTranslationX,
				y: -this._currentTranslationY
			};
		},

		fireEvent: function(type, e) {
			var i = 0,
				index = 0,
				localIndex,
				sections = this._sections._children,
				row = this._tableViewRowClicked,
				section = this._tableViewSectionClicked;
			if (eventFilter.test(type)) {
				if (row && section) {

					for (; i < sections.length; i += 2) {
						localIndex = sections[i]._rows._children.indexOf(row);
						if (localIndex !== -1) {
							index += Math.floor(localIndex / 2);
							break;
						} else {
							index += sections[i].rowCount;
						}
					}
					e.row = e.rowData = row;
					e.index = index;
					e.section = section;
					e.searchMode = false;

					KineticScrollView.prototype.fireEvent.apply(this, arguments);

					this._tableViewRowClicked = null;
					this._tableViewSectionClicked = null;
				}
			} else {
				KineticScrollView.prototype.fireEvent.apply(this, arguments);
			}
		},

		_createSeparator: function() {
			var separator = UI.createView({
				height: 1,
				width: UI.INHERIT,
				backgroundColor: 'white'
			});
			setStyle(separator.domNode,'minWidth','100%'); // Temporary hack until TIMOB-8124 is completed.
			return separator;
		},

		_createDecorationLabel: function(text) {
			return UI.createLabel({
				text: text,
				backgroundColor: 'darkGrey',
				color: 'white',
				width: UI.INHERIT,
				height: UI.SIZE,
				left: 0,
				font: {fontSize: 22}
			});
		},

		_refreshSections: function() {
			for (var i = 0; i < this._sections._children.length; i++) {
				this._sections._children[i]._refreshRows();
			}
			this._triggerLayout();
		},

		_calculateLocation: function(index) {
			var currentOffset = 0,
				section;
			for(var i = 0; i < this._sections._children.length; i += 2) {
				section = this._sections._children[i];
				currentOffset += section.rowCount;
				if (index < currentOffset) {
					return {
						section: section,
						localIndex: section.rowCount - (currentOffset - index)
					};
				}
			}

			// Handle the special case of inserting after the last element in the last section
			if (index == currentOffset) {
				return {
					section: section,
					localIndex: section.rowCount
				};
			}
		},

		_insertRow: function(value, index) {
			var location = this._calculateLocation(index);
			if (location) {
				location.section.add(value,location.localIndex); // We call the normal .add() method to hook into the sections proper add mechanism
			}
			this._publish(value);
			this._refreshSections();
		},

		_removeRow: function(index) {
			var location = this._calculateLocation(index);
			if (location) {
				this._unpublish(location.section._rows._children[2 * location.localIndex + 1]);
				location.section._removeAt(location.localIndex);
			}
		},

		appendRow: function(value) {
			if (!this._currentSection) {
				this._sections._add(this._currentSection = UI.createTableViewSection({_tableView: this}));
				this.sections.push(this._currentSection);
				this._sections._add(this._createSeparator());
				this.data.push(this._currentSection);
			}
			this._currentSection.add(value); // We call the normal .add() method to hook into the sections proper add mechanism
			this._publish(value);
			this._refreshSections();
		},

		deleteRow: function(index) {
			this._removeRow(index);
		},

		insertRowAfter: function(index, value) {
			this._insertRow(value, index + 1);
		},

		insertRowBefore: function(index, value) {
			this._insertRow(value, index);
		},

		updateRow: function(index, row) {
			this._removeRow(index);
			this._insertRow(row, index);
		},

		scrollToIndex: function(index) {
			var location = this._calculateLocation(index);
			location && this._setTranslation(0,-location.section._measuredTop -
				location.section._rows._children[2 * location.localIndex + 1]._measuredTop);
		},

		scrollToTop: function(top) {
			this._setTranslation(0,-top);
		},

		_insertSection: function(sections, index) {
			!is(sections,'Array') && (sections = [sections]);
			var i = 0,
				len = sections.length;
			for(; i < len; i++) {
				if (!isDef(sections[i].declaredClass) || sections[i].declaredClass != 'Ti.UI.TableViewSection') {
					sections[i] = UI.createTableViewSection(sections[i]);
				}
				this._sections._insertAt(sections[i], index + i);
				if (index === len) {
					this.sections.push(sections[i]);
				} else {
					this.sections.splice(index,0,sections[i]);
				}
			}
			this._refreshSections();
		},

		_removeSection: function(index) {
			this._sections._remove(this.sections[index]);
			this.sections.splice(index,1);
		},

		appendSection: function(section) {
			this._insertSection(section, this.sections.length);
		},

		deleteSection: function(section) {
			if (section in this.sections) {
				this._sections._remove(this.sections[section]);
				this.sections.splice(section,1);
			}
		},

		insertSectionBefore: function(index, section) {
			this._insertSection(section, index);
		},

		insertSectionAfter: function(index, section) {
			this._insertSection(section, index + 1);
		},

		updateSection: function(index, section) {
			this._removeSection(index);
			this._insertSection(section, index);
		},

		constants: {
			sectionCount: function() {
				return this.sections.length;
			},
			sections: void 0
		},

		properties: {
			data: {
				set: function(value) {
					if (is(value,'Array')) {

						var retval = [],
							i;

						// Remove all of the previous sections
						this._sections._removeAllChildren();
						this.__values__.constants.sections = [];
						this._currentSection = void 0;

						// Convert any object literals to TableViewRow instances
						for (i in value) {
							if (!isDef(value[i].declaredClass) || (value[i].declaredClass != 'Ti.UI.TableViewRow' && value[i].declaredClass != 'Ti.UI.TableViewSection')) {
								value[i] = UI.createTableViewRow(value[i]);
							}
						}

						// Add each element
						for (i = 0; i < value.length; i++) {
							if (value[i].declaredClass === 'Ti.UI.TableViewRow') {
								// Check if we need a default section
								if (!this._currentSection) {
									this.appendSection(this._currentSection = UI.createTableViewSection({_tableView: this}));
									retval.push(this._currentSection);
								}
								this._currentSection.add(value[i]); // We call the normal .add() method to hook into the sections proper add mechanism
							} else if (value[i].declaredClass === 'Ti.UI.TableViewSection') {
								value[i]._tableView = this;
								this.appendSection(this._currentSection = value[i]);
								retval.push(this._currentSection);
							}
							this._publish(value[i]);
						}
						this._refreshSections();

						return retval;
					} else {
						// Data must be an array
						return;
					}
				}
			},

			footerTitle: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this._footer._removeAllChildren();
						this._footer._add(this._createDecorationLabel(value));
					}
					return value;
				}
			},

			footerView: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this._footer._removeAllChildren();
						this._footer._add(value);
					}
					return value;
				}
			},

			headerTitle: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this._header._removeAllChildren();
						this._header._add(this._createDecorationLabel(value));
						this._header._add(this._createSeparator());
					}
					return value;
				}
			},

			headerView: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this._header._removeAllChildren();
						this._header._add(value);
					}
					return value;
				}
			},

			maxRowHeight: {
				post: '_refreshSections'
			},

			minRowHeight: {
				post: '_refreshSections'
			},

			rowHeight: {
				post: '_refreshSections',
				value: '50px'
			},

			separatorColor: {
				post: '_refreshSections',
				value: 'lightGrey'
			},

			separatorStyle: {
				post: '_refreshSections',
				value: UI.TABLE_VIEW_SEPARATOR_STYLE_SINGLE_LINE
			}
		}

	});

});
},
"Ti/UI/MobileWeb/TableViewSeparatorStyle":function(){
/* /titanium/Ti/UI/MobileWeb/TableViewSeparatorStyle.js */

define(["Ti/_/lang"], function(lang) {

	return lang.setObject("Ti.UI.MobileWeb.TableViewSeparatorStyle", {}, {
		constants: {
			NONE: 0,
			SINGLE_LINE: 1
		}
	});
	
});
},
"Ti/UI/TableViewRow":function(){
/* /titanium/Ti/UI/TableViewRow.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/lang', 'Ti/UI/View', 'Ti/_/dom', 'Ti/_/css', 'Ti/_/style', 'Ti/UI', 'Ti/_/Layouts/ConstrainingHorizontal'],
	function(declare, lang, View, dom, css, style, UI, ConstrainingHorizontal) {

	var isDef = lang.isDef,
		imagePrefix = 'themes/' + require.config.ti.theme + '/UI/TableViewRow/',
		checkImage = imagePrefix + 'check.png',
		childImage = imagePrefix + 'child.png',
		detailImage = imagePrefix + 'detail.png',
		eventFilter = /(click|singletap|longpress)/;

	return declare('Ti.UI.TableViewRow', View, {

		// The number of pixels 1 indention equals
		_indentionScale: 10,

		constructor: function() {

			this._layout = new ConstrainingHorizontal({ element: this });

			this._add(this._leftImageView = UI.createImageView({
				width: UI.SIZE,
				height: UI.SIZE
			}));

			var centerContainer = UI.createView({
				width: UI.INHERIT,
				height: UI.INHERIT
			});
			this._add(centerContainer);

			centerContainer._add(this._titleLabel = UI.createLabel({
				width: UI.INHERIT,
				height: UI.INHERIT,
				wordWrap: false
			}));

			centerContainer._add(this._contentContainer = UI.createView({
				width: UI.INHERIT,
				height: UI.INHERIT
			}));

			this._add(this._rightImageView = UI.createImageView({
				right: 0,
				width: UI.SIZE,
				height: UI.SIZE
			}));
		},

		_defaultWidth: UI.INHERIT,

		_defaultHeight: UI.SIZE,

		_tableRowHeight: void 0,

		_tableViewSection: null,

		fireEvent: function(type) {
			if (eventFilter.test(type)) {
				this._tableViewSection && this._tableViewSection._tableView && (this._tableViewSection._tableView._tableViewRowClicked = this);
			}
			View.prototype.fireEvent.apply(this, arguments);
		},

		_doBackground: function() {
			if (this._touching) {
				this._titleLabel.color = this.selectedColor;
			} else {
				this._titleLabel.color = this.color;
			}
			View.prototype._doBackground.apply(this, arguments);
		},

		_updatePadding: function() {
			// Fake padding with a transparent border
			this._contentContainer.borderWidth = this._titleLabel.borderWidth =
				[this.leftImage ? 5 : 0, this.rightImage ? 5 : 0, 0, 0];
		},

		add: function(view) {
			this._contentContainer._add(view);
			this._publish(view);
		},

		remove: function(view) {
			this._contentContainer._remove(view);
			this._unpublish(view);
		},

		properties: {
			className: void 0,
			color: {
				set: function(value) {
					this._titleLabel.color = value;
					return value;
				}
			},
			hasCheck: {
				set: function(value, oldValue) {
					if (value !== oldValue && !isDef(this.rightImage) && !this.hasChild) {
						this._rightImageView.image = value ? checkImage : '';
					}
					return value;
				}
			},
			hasChild: {
				set: function(value, oldValue) {
					if (value !== oldValue && !isDef(this.rightImage)) {
						this._rightImageView.image = value ? childImage : '';
					}
					return value;
				}
			},
			hasDetail: {
				set: function(value, oldValue) {
					if (value !== oldValue && !isDef(this.rightImage) && !this.hasChild && !this.hasCheck) {
						this._rightImageView.image = value ? detailImage : '';
					}
					return value;
				}
			},
			indentionLevel: {
				set: function(value) {
					this._leftImageView.left = value * this._indentionScale;
					return value;
				},
				value: 0
			},
			layout: {
				set: function(value) {
					this._contentContainer.layout = value;
				}
			},
			leftImage: {
				set: function(value, oldValue) {
					if (value !== oldValue) {
						this._leftImageView.image = value;
					}
					return value;
				},
				post: '_updatePadding'
			},
			rightImage: {
				set: function(value, oldValue) {
					if (value !== oldValue) {
						this._rightImageView.image = value;
					}
					return value;
				},
				post: '_updatePadding'
			},
			selectedColor: void 0,
			title: {
				set: function(value) {
					this._titleLabel.text = value;
					return value;
				}
			},

			// Pass through to the label
			font: {
				set: function(value) {
					this._titleLabel.font = value;
					return value;
				}
			}
		}

	});

});
},
"Ti/UI/TableViewSection":function(){
/* /titanium/Ti/UI/TableViewSection.js */

/*global define*/
define(['Ti/_/declare', 'Ti/_/lang', 'Ti/_/UI/Widget', 'Ti/_/style', 'Ti/UI'],
	function(declare, lang, Widget, style, UI) {

	var is = require.is,
		setStyle = style.set,
		eventFilter = /(click|singletap|longpress)/;

	return declare('Ti.UI.TableViewSection', Widget, {

		constructor: function() {
			this._indexedContent = [];

			var i = 0,
				l = 3,
				a = ['_header', '_rows', '_footer'];

			while (i < l) {
				this._add(this[a[i++]] = UI.createView({
					height: UI.SIZE,
					width: UI.INHERIT,
					layout: UI._LAYOUT_CONSTRAINING_VERTICAL
				}));
			}

			// Create the parts out of Ti controls so we can make use of the layout system
			this.layout = UI._LAYOUT_CONSTRAINING_VERTICAL;
		},

		_defaultWidth: UI.INHERIT,

		_defaultHeight: UI.SIZE,

		fireEvent: function(type) {
			if (eventFilter.test(type)) {
				this._tableView && (this._tableView._tableViewSectionClicked = this);
			}
			Widget.prototype.fireEvent.apply(this,arguments);
		},

		_tableView: null,

		_createSeparator: function() {
			var showSeparator = this._tableView && this._tableView.separatorStyle === UI.TABLE_VIEW_SEPARATOR_STYLE_SINGLE_LINE,
				separator = UI.createView({
					height: showSeparator ? 1 : 0,
					width: UI.INHERIT,
					backgroundColor: showSeparator ? this._tableView.separatorColor : 'transparent'
				});
			setStyle(separator.domNode,'minWidth','100%'); // Temporary hack until TIMOB-8124 is completed.
			return separator;
		},

		_createDecorationLabel: function(text) {
			return UI.createLabel({
				text: text,
				backgroundColor: 'darkGrey',
				color: 'white',
				width: UI.INHERIT,
				height: UI.SIZE,
				left: 0,
				font: {fontSize: 18}
			});
		},

		_refreshRows: function() {
			if (this._tableView) {
				// Update the row information
				var rows = this._rows._children,
					tableView = this._tableView,
					rowsData = this.__values__.constants.rows = [],
					i,
					row;
				for (i = 1; i < rows.length; i += 2) {
					row = rows[i];
					row._defaultHeight = tableView.rowHeight;
					row._minHeight = tableView.minRowHeight;
					row._maxHeight = tableView.maxRowHeight;
					rowsData.push(row);
				}

				for (i = 0; i < rows.length; i += 2) {
					row = rows[i];
					if (tableView.separatorStyle === UI.TABLE_VIEW_SEPARATOR_STYLE_SINGLE_LINE) {
						row.height = 1;
						row.backgroundColor = tableView.separatorColor;
					} else {
						row.height = 0;
						row.backgroundColor = 'transparent';
					}
				}
			}
		},

		_insertHelper: function(value, index) {
			if (!lang.isDef(value.declaredClass) || value.declaredClass != 'Ti.UI.TableViewRow') {
				value = UI.createTableViewRow(value);
			}

			this._rows._insertAt(value, 2 * index + 1);
			this._rows._insertAt(this._createSeparator(), 2 * index + 2);
			value._tableViewSection = this;
			this.rowCount++;
			this._refreshRows();
		},

		add: function(value, index) {
			var rows = this._rows._children,
				rowCount = this.rowCount;

			if (index === void 0) {
				index = rowCount;
			}
			if (index < 0 || index > rowCount) {
				return;
			}

			if (rows.length === 0) {
				this._rows._add(this._createSeparator());
			}

			if (is(value,'Array')) {
				for (var i in value) {
					this._insertHelper(value[i],index++);
				}
			} else {
				this._insertHelper(value,index);
			}
		},

		_removeAt: function(index) {
			if (index < 0 || index >= this.rowCount) {
				return;
			}
			this._rows._children[2 * index + 1]._tableViewSection = null;
			this._rows.remove(this._rows._children[2 * index + 1]); // Remove the separator
			this._rows.remove(this._rows._children[2 * index + 1]); // Remove the row

			// Remove the last separator, if there are no rows left
			if (this._rows._children.length === 1) {
				this._rows.remove(this._rows._children[0]);
			}
			this._refreshRows();
		},

		remove: function(view) {
			var index = this._rows._children.indexOf(view);
			if (index === -1) {
				return;
			}

			this._removeAt(index);
		},

		constants: {
			rows: void 0
		},

		properties: {
			footerTitle: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this._footer._removeAllChildren();
						this._footer._add(this._createDecorationLabel(value));
						this._footer._add(this._createSeparator());
					}
					return value;
				}
			},
			footerView: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this._footer._removeAllChildren();
						this._footer._add(value);
					}
					return value;
				}
			},
			headerTitle: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this._header._removeAllChildren();
						this._header._add(this._createDecorationLabel(value));
						this._header._add(this._createSeparator());
					}
					return value;
				}
			},
			headerView: {
				set: function(value, oldValue) {
					if (oldValue != value) {
						this._header._removeAllChildren();
						this._header._add(value);
					}
					return value;
				}
			},

			rowCount: function() {
				return Math.floor(this._rows._children.length / 2);
			}
		}

	});

});
},
"Ti/UI/TextArea":function(){
/* /titanium/Ti/UI/TextArea.js */

define(["Ti/_/declare", "Ti/_/UI/TextBox", "Ti/_/dom", "Ti/_/css", "Ti/_/style", "Ti/UI"],
	function(declare, TextBox, dom, css, style, UI) {

	return declare("Ti.UI.TextArea", TextBox, {

		constructor: function(args) {
			var field = dom.create("textarea", {
				autocomplete: "off",
				className: "TiUITextFieldInput"
			}, this.domNode);

			this._initTextBox(field);
		},

		_defaultWidth: UI.SIZE,

		_defaultHeight: UI.SIZE,
		
		_getContentSize: function(width, height) {
			return {
				width: this._measureText(this.value, this._field, width).width,
				height: this._measureText(this.value, this._field, width).height
			};
		},

		_setTouchEnabled: function(value) {
			TextBox.prototype._setTouchEnabled.apply(this,arguments);
			this.slider && style.set(this.textArea, "pointerEvents", value ? "auto" : "none");
		}

	});

});

},
"Ti/_/UI/TextBox":function(){
/* /titanium/Ti/_/UI/TextBox.js */

define(
	["Ti/_/declare", "Ti/_/dom", "Ti/_/event", "Ti/_/style", "Ti/_/lang", "Ti/_/UI/FontWidget", "Ti/UI"],
	function(declare, dom, event, style, lang, FontWidget, UI) {
		
	var on = require.on,
		setStyle = style.set;

	return declare("Ti._.UI.TextBox", FontWidget, {

		constructor: function(){
			this._addEventModifier(["click", "singletap", "blur", "change", "focus", "return"], function(data) {
				data.value = this._getInternalText();
			});
		},

		_initTextBox: function(field) {
			// wire up events
			this._field = field;
			var updateInterval = null,
				previousText = "";

			this._addStyleableDomNode(this._setFocusNode(field));

			on(field, "keydown", this, function(e) {
				if (this.editable) {
					if (e.keyCode === 13) {
						if (this.suppressReturn) {
							event.stop(e);
							field.blur();
						}
						this.fireEvent("return");
					}
				} else {
					event.stop(e);
					return false;
				}
			});

			on(field, "keypress", this, function() {
				setTimeout(lang.hitch(this, function () { this._capitalize() }));
			});

			on(field, "focus", this, function(){
				this.fireEvent("focus");

				updateInterval = setInterval(lang.hitch(this, function(){
					var value = field.value;
					if (previousText.length !== value.length || previousText !== value) {
						this.fireEvent("change");
						previousText = value;
					}
				}), 200);
			});

			on(field, "blur", this, function(){
				clearInterval(updateInterval);
				this.fireEvent("blur");
			});
			
			// Set the autocorrect value via the setter
			this.autocorrect = true;
		},

		_setInternalText: function(value) {
			if (this._field.value !== value) {
				this._field.value = value;
				this._capitalize();
			}
		},
		
		_getInternalText: function() {
			return this._field.value;
		},
		
		_updateInternalText: function() {
			this._setInternalText(this._getInternalText());
		},

		_capitalize: function() {
			var acval = "off",
				field = this._field;
			switch (this.autocapitalization) {
				case UI.TEXT_AUTOCAPITALIZATION_ALL:
					field.value = field.value.toUpperCase();
					break;
				case UI.TEXT_AUTOCAPITALIZATION_SENTENCES:
					acval = "on";
			}
			this._field.autocapitalize = acval;
		},

		blur: function() {
			this._field.blur();
		},

		focus: function() {
			this._field.focus();
		},

		hasText: function() {
			return !!this._field.value;
		},

		properties: {
			autocapitalization: {
				value: UI.TEXT_AUTOCAPITALIZATION_SENTENCES,
				post: "_capitalize"
			},

			autocorrect: {
				post: function(value) {
					this._field.autocorrect = !!value ? "on" : "off";
				}
			},

			editable: true,

			maxLength: {
				set: function(value) {
					value = Math.max(value|0, 0);
					dom.attr[value > 0 ? "set" : "remove"](this._field, "maxlength", value);
					return value;
				}
			},

			returnKeyType:  function() {
				return UI.RETURNKEY_DEFAULT;
			},

			suppressReturn: true,

			textAlign: {
				post: function(value) {
					setStyle(this._field, "textAlign", /(center|right)/.test(value) ? value : "left");
				}
			},

			value: {
				get: function() {
					return this._getInternalText();
				},
				post: "_setInternalText",
				value: ""
			}
		}

	});

});
},
"Ti/UI/TextField":function(){
/* /titanium/Ti/UI/TextField.js */

define(["Ti/_/declare", "Ti/_/UI/TextBox", "Ti/_/css", "Ti/_/dom", "Ti/_/lang", "Ti/_/style", "Ti/UI"],
	function(declare, TextBox, css, dom, lang, style, UI) {

	var borderStyles = ["None", "Line", "Bezel", "Rounded"],
		keyboardPost = {
			post: "_setKeyboardType"
		},
		setStyle = style.set,
		on = require.on;

	return declare("Ti.UI.TextField", TextBox, {

		constructor: function(args) {
			// note: do NOT add position:absolute to this style under ANY circumstances. It will break text field on WebKit
			var field = dom.create("input", {
				autocomplete: "off",
				className: "TiUITextFieldInput"
			}, this.domNode);

			this._initTextBox(field);
			this._setKeyboardType();
			this.borderStyle = UI.INPUT_BORDERSTYLE_BEZEL;

			this._disconnectFocusEvent = on(field, "focus", this, function() {
				this._focused = 1;
				this._setInternalText(this.clearOnEdit ? "" : this._getInternalText());
			});
			this._disconnectBlurEvent = on(field, "blur", this, function() {
				this._focused = 0;
				this._updateInternalText();
			});
		},

		destroy: function() {
			this._disconnectFocusEvent();
			this._disconnectBlurEvent();
			TextBox.prototype.destroy.apply(this, arguments);
		},
		
		_showingHint: 1,

		_setInternalText: function(value) {
			var showingHint = !this._focused && !value;
			if (showingHint !== this._showingHint) {
				this._showingHint = showingHint;
				this._setKeyboardType();
			}
			TextBox.prototype._setInternalText.call(this, showingHint ? this.hintText : value);
		},
		
		_getInternalText: function() {
			return this._showingHint ? "" : TextBox.prototype._getInternalText.call(this);
		},

        _defaultWidth: UI.SIZE,

        _defaultHeight: UI.SIZE,
		
		_getContentSize: function(width, height) {
			return {
				width: this._measureText(this.value, this._field, width).width + 6,
				height: this._measureText(this.value, this._field, width).height + 6
			};
		},

		_setTouchEnabled: function(value) {
			this.slider && setStyle(this._field, "pointerEvents", value ? "auto" : "none");
		},

		_setKeyboardType: function() {
			var type = "text";
			if (this.passwordMask && !this._showingHint) {
				type = "password";
			} else {
				switch (this.keyboardType) {
					case UI.KEYBOARD_EMAIL:
						type = "email";
						break;
					case UI.KEYBOARD_NUMBER_PAD:
						type = "number";
						break;
					case UI.KEYBOARD_PHONE_PAD:
						type = "tel";
						break;
					case UI.KEYBOARD_URL:
						type = "url";
						break;
				}
			}
			// Note: IE9 throws an exception if you don't set an input type it supports
			try {
				this._field.type = type;
			} catch(e) {
				this._field.type = "text";
			}
		},

		properties: {
			borderStyle: {
				set: function(value, oldValue) {
					var n = this.domNode,
						s = "TiUITextFieldBorderStyle";
					if (value !== oldValue) {
						// This code references constants Ti.UI.INPUT_BORDERSTYLE_NONE, 
						// Ti.UI.INPUT_BORDERSTYLE_LINE, Ti.UI.INPUT_BORDERSTYLE_BEZEL, and Ti.UI.INPUT_BORDERSTYLE_ROUNDED
						css.remove(n, s + borderStyles[oldValue]);
						css.add(n, s + borderStyles[value]);
					}
					return value;
				}
			},

			clearOnEdit: false,

			hintText: {
				post: "_updateInternalText",
				value: ""
			},

			keyboardType: keyboardPost,

			passwordMask: keyboardPost
		}

	});

});

},
"Ti/UI/WebView":function(){
/* /titanium/Ti/UI/WebView.js */

/*global define, window*/
define(['Ti/_/declare', 'Ti/UI/View', 'Ti/_/dom', 'Ti/_/event', 'Ti/_/lang', 'Ti/_/text!Ti/_/UI/WebViewBridge.js', 'Ti/App', 'Ti/API', 'Ti/UI', 'Ti/_/style'],
	function(declare, View, dom, event, lang, bridge, App, API, UI, style) {

	var on = require.on;

	return declare('Ti.UI.WebView', View, {

		constructor: function() {
			App.addEventListener(this.widgetId + ':unload', lang.hitch(this, function() {
				this._loading(1);
			}));
			this.backgroundColor = '#fff';
			style.set(this.domNode, {
				overflow: 'auto',
				overflowScrolling: 'touch'
			});
		},

		destroy: function() {
			App.removeEventListener(this.widgetId + ':unload');
			this._destroy();
			Widget.prototype.destroy.apply(this, arguments);
		},

		_destroy: function() {
			if (this._iframe) {
				event.off(this._iframeHandles);
				dom.destroy(this._iframe);
			}
		},

		_createIFrame: function() {
			if (this._parent) {
				this._destroy();
				this._loading(1);
				var url = this.url || '',
					match = url.match(/(https?)\:\/\/([^\:\/]*)(:?\d*)(.*)/),
					loc = window.location,
					isSameDomain = !match || (match[0] + ':' === loc.protocol && match[1] + match[2] === window.location.host),
					iframe = this._iframe = dom.create('iframe', {
						frameborder: 0,
						marginwidth: 0,
						marginheight: 0,
						hspace: 0,
						vspace: 0,
						scrolling: this.showScrollbars ? 'auto' : 'no',
						src: url || require.toUrl('Ti/_/UI/blank.html'),
						style: {
							width: '100%',
							height: '100%',
							position: 'absolute'
						}
					}, this.domNode);

				this._iframeHandles = [
					on(iframe, 'load', this, function() {
						var i = Math.max(isSameDomain | 0, 0),
							cw = iframe.contentWindow,
							prop,
							url,
							html;

						if (i !== -1) {
							// we can always guarantee that the first load we'll know if it's the same domain
							isSameDomain = -1;
						} else {
							// for every load after the first, we need to try which will throw security errors
							for (prop in cw) {
								i++;
								break;
							}
						}

						if (i > 0) {
							url = cw.location.href;
							this.evalJS(bridge.replace('WEBVIEW_ID', this.widgetId + ':unload'));
							(html = this.__values__.properties.html) && this._setContent(html);
						} else {
							API.warn('Unable to inject WebView bridge into cross-domain URL, ignore browser security message');
						}

						this._loading();
						this.fireEvent('load', {
							url: url ? (this.__values__.properties.url = url) : this.url
						});
					}),
					on(iframe, 'error', this, function() {
						this._loading();
						this.fireEvent('error', {
							message: 'Page failed to load',
							url: this.url
						});
					})
				];

				return 1;
			}
		},

		_setParent: function() {
			View.prototype._setParent.apply(this, arguments);

			// we are being added to a parent, need to manually fire
			(this.url || this.html) && this._createIFrame();
		},

		_getWindow: function() {
			return this._iframe.contentWindow;
		},

		_getDoc: function() {
			return this._getWindow().document;
		},

		_getHistory: function() {
			return this._getWindow().history;
		},

		_loading: function(v) {
			this.loading || v && this.fireEvent('beforeload', {
				url: this.url
			});
			this.__values__.constants.loading = !!v;
		},

		canGoBack: function() {
			return this.url && !!this._getHistory().length;
		},

		canGoForward: function() {
			return this.url && !!this._getHistory().length;
		},

		evalJS: function(js) {
			var w = this._getWindow(),
				r = null;
			try {
				r = js && w && w.eval && w.eval(js);
			} catch (e) {}
			return r;
		},

		goBack: function() {
			if (this.canGoBack()) {
				var h = this._getHistory();
				if (h) {
					this._loading(1);
					h.go(-1);
				}
			}
		},

		goForward: function() {
			if (this.canGoForward()) {
				var h = this._getHistory();
				if (h) {
					this._loading(1);
					h.go(1);
				}
			}
		},

		reload: function() {
			var w = this._getWindow();
			this.url && w ? (w.location.href = this.url) : this._createIFrame();
		},

		stopLoading: function(hardStop) {
			try {
				this.loading && hardStop ? this._destroy() : this._getWindow().stop();
			} catch (e) {}
			this._loading();
		},

		_defaultWidth: UI.FILL,

		_defaultHeight: UI.FILL,

		_getContentSize: function() {
			return {
				width: this._iframe ? this._iframe.clientWidth : 0,
				height: this._iframe ? this._iframe.clientHeight : 0
			};
		},

		_setContent: function(value) {
			try {
				var doc = this._getDoc();
				doc.open();
				doc.write(value);
				doc.close();
			} catch (e) {}
			return value;
		},

		properties: {
			data: {
				set: function(value) {
					var data = value;
					switch (data && data.declaredClass) {
						case 'Ti.Filesystem.File':
							data = data.read();
						case 'Ti.Blob':
							data = data.toString();
						default:
							this.html = data;
					}
					return value;
				}
			},

			html: {
				get: function(value) {
					var doc = this._iframe && this._getDoc();
					return value === void 0 && doc ? doc.documentElement.innerHTML : value;
				},
				post: function(value) {
					var values = this.__values__.properties;
					values.data = void 0;
					values.url = void 0;
					this._createIFrame() && this._setContent(value);
				}
			},

			showScrollbars: {
				set: function(value) {
					this._iframe && dom.attr.set(this._iframe, 'scrolling', value ? 'auto' : 'no');
					return value;
				},
				value: true
			},

			url: {
				post: function() {
					var values = this.__values__.properties;
					values.data = void 0;
					values.html = void 0;
					this._createIFrame();
				}
			}
		},

		constants: {
			loading: false
		}

	});

});
},
"url:Ti/_/UI/WebViewBridge.js":"(function (w) {\n\
	var a, b,\n\
		p = w.parent,\n\
		u = w.onunload;\n\
\n\
	if (p && typeof Ti == 'undefined' && typeof p.Ti == 'object') {\n\
		a = p.Ti.API;\n\
		b = p.Ti.App;\n\
		w.Ti = w.Titanium = {\n\
			API: {\n\
				log: a.log,\n\
				debug: a.debug,\n\
				error: a.error,\n\
				info: a.info,\n\
				warn: a.warn\n\
			},\n\
			App: {\n\
				addEventListener: b.addEventListener.bind(b),\n\
				removeEventListener: b.removeEventListener.bind(b),\n\
				fireEvent: b.fireEvent.bind(b)\n\
			}\n\
		};\n\
	}\n\
\n\
	w.onunload = function () {\n\
		Ti.App.fireEvent(\"WEBVIEW_ID\");\n\
		u && u();\n\
	};\n\
}(window));",
"Ti/UI/Window":function(){
/* /titanium/Ti/UI/Window.js */

define(["Ti/_/declare", "Ti/Gesture", "Ti/Locale", "Ti/_/UI/SuperView", "Ti/UI"],
	function(declare, Gesture, Locale, SuperView, UI) {

	var UI_FILL = UI.FILL,
		UI_SIZE = UI.SIZE,
		postNavGroup = {
			post: function () {
				this._navGroup && this._navGroup._updateNavBar();
			}
		};

	return declare("Ti.UI.Window", SuperView, {
	
		_defaultWidth: UI_FILL,

		_defaultHeight: UI_FILL,

		postscript: function() {
			if (this.url) {
				var prevWindow = UI.currentWindow;
				UI._setWindow(this);
				require("Ti/_/include!sandbox!" + this.url);
				UI._setWindow(prevWindow);
			}
		},

		_getTitle: function() {
			return Locale.getString(this.titleid, this.title);
		},

		constants: {
			url: void 0,
			bubbleParent: false
		},

		properties: {
		
			modal: {
				set: function(value, oldValue) {
					if (value !== oldValue) {
						if (value) {
							var parentContainer = this._modalParentContainer = UI.createView();
							parentContainer._add(UI.createView({
								backgroundColor: "#000",
								opacity: 0.5
							}));
							parentContainer._add(this._modalContentContainer = UI.createView({
								width: UI_SIZE,
								height: UI_SIZE
							}));
							this._modalContentContainer.add(this); // We call the normal .add() method to hook into the views proper add mechanism
						} else if (this._modalParentContainer) {
							this._modalParentContainer._opened && this._modalParentContainer.close();
							this._modalContentContainer.remove(this);
							this._modalParentContainer = null;
							if (this._opened) {
								this.close(); // Close to reset state...at this point it's not attached to the window anymore, but thinks it's still open
								this.open();
							}
						}
					}
					return value;
				}
			},

			orientation: {
				get: function() {
					return Gesture.orientation;
				}
			},
		
			/** Nav group properties **/
			
			barColor: postNavGroup,
			
			barImage: postNavGroup,
			
			leftNavButton: postNavGroup,
			
			navBarHidden: postNavGroup,
			
			rightNavButton: postNavGroup,
			
			titleControl: postNavGroup,
			
			titleImage: postNavGroup,

			title: postNavGroup,

			titleid: postNavGroup,
			
			translucent: postNavGroup
		}

	});

});
},
"Ti/_/colors":function(){
/* /titanium/Ti/_/colors.js */

define({
	antiquewhite: [250,235,215],
	aqua: [0,255,255],
	aquamarine: [127,255,212],
	azure: [240,255,255],
	beige: [245,245,220],
	bisque: [255,228,196],
	black: [0,0,0],
	blanchedalmond: [255,235,205],
	blue: [0,0,255],
	blueviolet: [138,43,226],
	brown: [165,42,42],
	burlywood: [222,184,135],
	cadetblue: [95,158,160],
	chartreuse: [127,255,0],
	chocolate: [210,105,30],
	coral: [255,127,80],
	cornflowerblue: [100,149,237],
	cornsilk: [255,248,220],
	crimson: [220,20,60],
	cyan: [0,255,255],
	darkblue: [0,0,139],
	darkcyan: [0,139,139],
	darkgoldenrod: [184,134,11],
	darkgray: [169,169,169],
	darkgrey: [169,169,169],
	darkgreen: [0,100,0],
	darkkhaki: [189,183,107],
	darkmagenta: [139,0,139],
	darkolivegreen: [85,107,47],
	darkorange: [255,140,0],
	darkorchid: [153,50,204],
	darkred: [139,0,0],
	darksalmon: [233,150,122],
	darkseagreen: [143,188,143],
	darkslateblue: [72,61,139],
	darkslategray: [47,79,79],
	darkslategrey: [47,79,79],
	darkturquoise: [0,206,209],
	darkviolet: [148,0,211],
	deeppink: [255,20,147],
	deepskyblue: [0,191,255],
	dimgray: [105,105,105],
	dimgrey: [105,105,105],
	dodgerblue: [30,144,255],
	firebrick: [178,34,34],
	floralwhite: [255,250,240],
	forestgreen: [34,139,34],
	fuchsia: [255,0,255],
	gainsboro: [220,220,220],
	ghostwhite: [248,248,255],
	gold: [255,215,0],
	goldenrod: [218,165,32],
	gray: [128,128,128],
	grey: [128,128,128],
	green: [0,128,0],
	greenyellow: [173,255,47],
	honeydew: [240,255,240],
	hotpink: [255,105,180],
	indianred: [205,92,92],
	indigo: [75,0,130],
	ivory: [255,255,240],
	khaki: [240,230,140],
	lavender: [230,230,250],
	lavenderblush: [255,240,245],
	lawngreen: [124,252,0],
	lemonchiffon: [255,250,205],
	lightblue: [173,216,230],
	lightcoral: [240,128,128],
	lightcyan: [224,255,255],
	lightgoldenrodyellow: [250,250,210],
	lightgray: [211,211,211],
	lightgrey: [211,211,211],
	lightgreen: [144,238,144],
	lightpink: [255,182,193],
	lightsalmon: [255,160,122],
	lightseagreen: [32,178,170],
	lightskyblue: [135,206,250],
	lightslategray: [119,136,153],
	lightslategrey: [119,136,153],
	lightsteelblue: [176,196,222],
	lightyellow: [255,255,224],
	lime: [0,255,0],
	limegreen: [50,205,50],
	linen: [250,240,230],
	magenta: [255,0,255],
	maroon: [128,0,0],
	mediumaquamarine: [102,205,170],
	mediumblue: [0,0,205],
	mediumorchid: [186,85,211],
	mediumpurple: [147,112,216],
	mediumseagreen: [60,179,113],
	mediumslateblue: [123,104,238],
	mediumspringgreen: [0,250,154],
	mediumturquoise: [72,209,204],
	mediumvioletred: [199,21,133],
	midnightblue: [25,25,112],
	mintcream: [245,255,250],
	mistyrose: [255,228,225],
	moccasin: [255,228,181],
	navajowhite: [255,222,173],
	navy: [0,0,128],
	oldlace: [253,245,230],
	olive: [128,128,0],
	olivedrab: [107,142,35],
	orange: [255,165,0],
	orangered: [255,69,0],
	orchid: [218,112,214],
	palegoldenrod: [238,232,170],
	palegreen: [152,251,152],
	paleturquoise: [175,238,238],
	palevioletred: [216,112,147],
	papayawhip: [255,239,213],
	peachpuff: [255,218,185],
	peru: [205,133,63],
	pink: [255,192,203],
	plum: [221,160,221],
	powderblue: [176,224,230],
	purple: [128,0,128],
	red: [255,0,0],
	rosybrown: [188,143,143],
	royalblue: [65,105,225],
	saddlebrown: [139,69,19],
	salmon: [250,128,114],
	sandybrown: [244,164,96],
	seagreen: [46,139,87],
	seashell: [255,245,238],
	sienna: [160,82,45],
	silver: [192,192,192],
	skyblue: [135,206,235],
	slateblue: [106,90,205],
	slategray: [112,128,144],
	slategrey: [112,128,144],
	snow: [255,250,250],
	springgreen: [0,255,127],
	steelblue: [70,130,180],
	tan: [210,180,140],
	teal: [0,128,128],
	thistle: [216,191,216],
	tomato: [255,99,71],
	transparent: [0,0,0,0],
	turquoise: [64,224,208],
	violet: [238,130,238],
	wheat: [245,222,179],
	white: [255,255,255],
	whitesmoke: [245,245,245],
	yellow: [255,255,0],
	yellowgreen: [154,205,50]
});

},
"Ti/_/image":function(){
/* /titanium/Ti/_/image.js */

define(function() {
	return {
		normalize: function(name) {
			return name;
		},

		load: function(name, require, onLoad, config) {
			var img = new Image();
			img.onload = img.onerror = function() {
				onLoad(img);
				delete img.onload;
				delete img.onerror;
			};
			img.src = require.toUrl(name);
		}
	};
});

},
"Ti/_/text":function(){
/* /titanium/Ti/_/text.js */

define(function() {
	var cache = {};

	return {
		dynamic: true, // prevent the loader from caching the result

		normalize: function(name, normalize) {
			var parts = name.split("!"),
				url = parts[0];
			parts.shift();
			return (/^\./.test(url) ? normalize(url) : url) + (parts.length ? "!" + parts.join("!") : "");
		},

		load: function(name, require, onLoad, config) {
			var x,
				url = require.toUrl(name),
				c = cache[url] || require.cache(url);

			if (!c) {
				x = new XMLHttpRequest;
				x.open("GET", url, false);
				x.send(null);
				if (x.status === 200) {
					c = x.responseText;
				} else {
					throw new Error("Failed to load text \"" + url + "\": " + x.status);
				}
			}

			onLoad(c);
		}
	};
});

}});
require("Ti/App/Properties", function(p) {
	p.setString("ti.ui.defaultunit","dp");
	p.setBool("run-on-main-thread",true);
});
require(["Ti","Ti/Accelerometer","Ti/Analytics","Ti/BlobStream","Ti/BufferStream","Ti/Facebook/LoginButton","Ti/Filesystem/FileStream","Ti/Map/Annotation","Ti/Map/View","Ti/Media/AudioPlayer","Ti/Media/Sound","Ti/Media/VideoPlayer","Ti/Network/HTTPClient","Ti/Platform/DisplayCaps","Ti/UI/2DMatrix","Ti/UI/ActivityIndicator","Ti/UI/AlertDialog","Ti/UI/Clipboard","Ti/UI/EmailDialog","Ti/UI/OptionDialog","Ti/UI/Picker","Ti/UI/PickerColumn","Ti/UI/PickerRow","Ti/UI/ProgressBar","Ti/UI/ScrollView","Ti/UI/ScrollableView","Ti/UI/Slider","Ti/UI/Switch","Ti/UI/Tab","Ti/UI/TabGroup","Ti/UI/TableView","Ti/UI/TableViewRow","Ti/UI/TableViewSection","Ti/UI/TextArea","Ti/UI/TextField","Ti/UI/WebView","Ti/UI/Window","Ti/XML","Ti/Yahoo","Ti/_/colors","Ti/_/image","Ti/_/text","Ti/_/text!Ti/_/UI/WebViewBridge.js"]);