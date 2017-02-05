(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Loader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var MiniSignalBinding = (function () {
  function MiniSignalBinding(fn, once, thisArg) {
    if (once === undefined) once = false;

    _classCallCheck(this, MiniSignalBinding);

    this._fn = fn;
    this._once = once;
    this._thisArg = thisArg;
    this._next = this._prev = this._owner = null;
  }

  _createClass(MiniSignalBinding, [{
    key: 'detach',
    value: function detach() {
      if (this._owner === null) return false;
      this._owner.detach(this);
      return true;
    }
  }]);

  return MiniSignalBinding;
})();

function _addMiniSignalBinding(self, node) {
  if (!self._head) {
    self._head = node;
    self._tail = node;
  } else {
    self._tail._next = node;
    node._prev = self._tail;
    self._tail = node;
  }

  node._owner = self;

  return node;
}

var MiniSignal = (function () {
  function MiniSignal() {
    _classCallCheck(this, MiniSignal);

    this._head = this._tail = undefined;
  }

  _createClass(MiniSignal, [{
    key: 'handlers',
    value: function handlers() {
      var exists = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var node = this._head;

      if (exists) return !!node;

      var ee = [];

      while (node) {
        ee.push(node);
        node = node._next;
      }

      return ee;
    }
  }, {
    key: 'has',
    value: function has(node) {
      if (!(node instanceof MiniSignalBinding)) {
        throw new Error('MiniSignal#has(): First arg must be a MiniSignalBinding object.');
      }

      return node._owner === this;
    }
  }, {
    key: 'dispatch',
    value: function dispatch() {
      var node = this._head;

      if (!node) return false;

      while (node) {
        if (node._once) this.detach(node);
        node._fn.apply(node._thisArg, arguments);
        node = node._next;
      }

      return true;
    }
  }, {
    key: 'add',
    value: function add(fn) {
      var thisArg = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      if (typeof fn !== 'function') {
        throw new Error('MiniSignal#add(): First arg must be a Function.');
      }
      return _addMiniSignalBinding(this, new MiniSignalBinding(fn, false, thisArg));
    }
  }, {
    key: 'once',
    value: function once(fn) {
      var thisArg = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      if (typeof fn !== 'function') {
        throw new Error('MiniSignal#once(): First arg must be a Function.');
      }
      return _addMiniSignalBinding(this, new MiniSignalBinding(fn, true, thisArg));
    }
  }, {
    key: 'detach',
    value: function detach(node) {
      if (!(node instanceof MiniSignalBinding)) {
        throw new Error('MiniSignal#detach(): First arg must be a MiniSignalBinding object.');
      }
      if (node._owner !== this) return this;

      if (node._prev) node._prev._next = node._next;
      if (node._next) node._next._prev = node._prev;

      if (node === this._head) {
        this._head = node._next;
        if (node._next === null) {
          this._tail = null;
        }
      } else if (node === this._tail) {
        this._tail = node._prev;
        this._tail._next = null;
      }

      node._owner = null;
      return this;
    }
  }, {
    key: 'detachAll',
    value: function detachAll() {
      var node = this._head;
      if (!node) return this;

      this._head = this._tail = null;

      while (node) {
        node._owner = null;
        node = node._next;
      }
      return this;
    }
  }]);

  return MiniSignal;
})();

MiniSignal.MiniSignalBinding = MiniSignalBinding;

exports['default'] = MiniSignal;
module.exports = exports['default'];

},{}],2:[function(require,module,exports){
'use strict'

module.exports = function parseURI (str, opts) {
  opts = opts || {}

  var o = {
    key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'],
    q: {
      name: 'queryKey',
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  }

  var m = o.parser[opts.strictMode ? 'strict' : 'loose'].exec(str)
  var uri = {}
  var i = 14

  while (i--) uri[o.key[i]] = m[i] || ''

  uri[o.q.name] = {}
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2
  })

  return uri
}

},{}],3:[function(require,module,exports){
'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var _miniSignals = require('mini-signals');

var _miniSignals2 = _interopRequireDefault(_miniSignals);

var _parseUri = require('parse-uri');

var _parseUri2 = _interopRequireDefault(_parseUri);

var _async = require('./async');

var async = _interopRequireWildcard(_async);

var _Resource = require('./Resource');

var _Resource2 = _interopRequireDefault(_Resource);

function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {};if (obj != null) {
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
        }newObj.default = obj;return newObj;
    }
}

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

// some constants
var MAX_PROGRESS = 100;
var rgxExtractUrlHash = /(#[\w\-]+)?$/;

/**
 * Manages the state and loading of multiple resources to load.
 *
 * @class
 */

var Loader = function () {
    /**
     * @param {string} [baseUrl=''] - The base url for all resources loaded by this loader.
     * @param {number} [concurrency=10] - The number of resources to load concurrently.
     */
    function Loader() {
        var _this = this;

        var baseUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var concurrency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

        _classCallCheck(this, Loader);

        /**
         * The base url for all resources loaded by this loader.
         *
         * @member {string}
         */
        this.baseUrl = baseUrl;

        /**
         * The progress percent of the loader going through the queue.
         *
         * @member {number}
         */
        this.progress = 0;

        /**
         * Loading state of the loader, true if it is currently loading resources.
         *
         * @member {boolean}
         */
        this.loading = false;

        /**
         * A querystring to append to every URL added to the loader.
         *
         * This should be a valid query string *without* the question-mark (`?`). The loader will
         * also *not* escape values for you. Make sure to escape your parameters with
         * [`encodeURIComponent`](https://mdn.io/encodeURIComponent) before assigning this property.
         *
         * @example
         *
         * ```js
         * const loader = new Loader();
         *
         * loader.defaultQueryString = 'user=me&password=secret';
         *
         * // This will request 'image.png?user=me&password=secret'
         * loader.add('image.png').load();
         *
         * loader.reset();
         *
         * // This will request 'image.png?v=1&user=me&password=secret'
         * loader.add('iamge.png?v=1').load();
         * ```
         */
        this.defaultQueryString = '';

        /**
         * The middleware to run before loading each resource.
         *
         * @member {function[]}
         */
        this._beforeMiddleware = [];

        /**
         * The middleware to run after loading each resource.
         *
         * @member {function[]}
         */
        this._afterMiddleware = [];

        /**
         * The `_loadResource` function bound with this object context.
         *
         * @private
         * @member {function}
         * @param {Resource} r - The resource to load
         * @param {Function} d - The dequeue function
         * @return {undefined}
         */
        this._boundLoadResource = function (r, d) {
            return _this._loadResource(r, d);
        };

        /**
         * The resources waiting to be loaded.
         *
         * @private
         * @member {Resource[]}
         */
        this._queue = async.queue(this._boundLoadResource, concurrency);

        this._queue.pause();

        /**
         * All the resources for this loader keyed by name.
         *
         * @member {object<string, Resource>}
         */
        this.resources = {};

        /**
         * Dispatched once per loaded or errored resource.
         *
         * The callback looks like {@link Loader.OnProgressSignal}.
         *
         * @member {Signal}
         */
        this.onProgress = new _miniSignals2.default();

        /**
         * Dispatched once per errored resource.
         *
         * The callback looks like {@link Loader.OnErrorSignal}.
         *
         * @member {Signal}
         */
        this.onError = new _miniSignals2.default();

        /**
         * Dispatched once per loaded resource.
         *
         * The callback looks like {@link Loader.OnLoadSignal}.
         *
         * @member {Signal}
         */
        this.onLoad = new _miniSignals2.default();

        /**
         * Dispatched when the loader begins to process the queue.
         *
         * The callback looks like {@link Loader.OnStartSignal}.
         *
         * @member {Signal}
         */
        this.onStart = new _miniSignals2.default();

        /**
         * Dispatched when the queued resources all load.
         *
         * The callback looks like {@link Loader.OnCompleteSignal}.
         *
         * @member {Signal}
         */
        this.onComplete = new _miniSignals2.default();

        /**
         * When the progress changes the loader and resource are disaptched.
         *
         * @memberof Loader
         * @callback OnProgressSignal
         * @param {Loader} loader - The loader the progress is advancing on.
         * @param {Resource} resource - The resource that has completed or failed to cause the progress to advance.
         */

        /**
         * When an error occurrs the loader and resource are disaptched.
         *
         * @memberof Loader
         * @callback OnErrorSignal
         * @param {Loader} loader - The loader the error happened in.
         * @param {Resource} resource - The resource that caused the error.
         */

        /**
         * When a load completes the loader and resource are disaptched.
         *
         * @memberof Loader
         * @callback OnLoadSignal
         * @param {Loader} loader - The loader that laoded the resource.
         * @param {Resource} resource - The resource that has completed loading.
         */

        /**
         * When the loader starts loading resources it dispatches this callback.
         *
         * @memberof Loader
         * @callback OnStartSignal
         * @param {Loader} loader - The loader that has started loading resources.
         */

        /**
         * When the loader completes loading resources it dispatches this callback.
         *
         * @memberof Loader
         * @callback OnCompleteSignal
         * @param {Loader} loader - The loader that has finished loading resources.
         */
    }

    /**
     * Adds a resource (or multiple resources) to the loader queue.
     *
     * This function can take a wide variety of different parameters. The only thing that is always
     * required the url to load. All the following will work:
     *
     * ```js
     * loader
     *     // normal param syntax
     *     .add('key', 'http://...', function () {})
     *     .add('http://...', function () {})
     *     .add('http://...')
     *
     *     // object syntax
     *     .add({
     *         name: 'key2',
     *         url: 'http://...'
     *     }, function () {})
     *     .add({
     *         url: 'http://...'
     *     }, function () {})
     *     .add({
     *         name: 'key3',
     *         url: 'http://...'
     *         onComplete: function () {}
     *     })
     *     .add({
     *         url: 'https://...',
     *         onComplete: function () {},
     *         crossOrigin: true
     *     })
     *
     *     // you can also pass an array of objects or urls or both
     *     .add([
     *         { name: 'key4', url: 'http://...', onComplete: function () {} },
     *         { url: 'http://...', onComplete: function () {} },
     *         'http://...'
     *     ])
     *
     *     // and you can use both params and options
     *     .add('key', 'http://...', { crossOrigin: true }, function () {})
     *     .add('http://...', { crossOrigin: true }, function () {});
     * ```
     *
     * @param {string} [name] - The name of the resource to load, if not passed the url is used.
     * @param {string} [url] - The url for this resource, relative to the baseUrl of this loader.
     * @param {object} [options] - The options for the load.
     * @param {boolean} [options.crossOrigin] - Is this request cross-origin? Default is to determine automatically.
     * @param {Resource.LOAD_TYPE} [options.loadType=Resource.LOAD_TYPE.XHR] - How should this resource be loaded?
     * @param {Resource.XHR_RESPONSE_TYPE} [options.xhrType=Resource.XHR_RESPONSE_TYPE.DEFAULT] - How should
     *      the data being loaded be interpreted when using XHR?
     * @param {object} [options.metadata] - Extra configuration for middleware and the Resource object.
     * @param {HTMLImageElement|HTMLAudioElement|HTMLVideoElement} [options.metadata.loadElement=null] - The
     *      element to use for loading, instead of creating one.
     * @param {boolean} [options.metadata.skipSource=false] - Skips adding source(s) to the load element. This
     *      is useful if you want to pass in a `loadElement` that you already added load sources to.
     * @param {function} [cb] - Function to call when this specific resource completes loading.
     * @return {Loader} Returns itself.
     */

    Loader.prototype.add = function add(name, url, options, cb) {
        // special case of an array of objects or urls
        if (Array.isArray(name)) {
            for (var i = 0; i < name.length; ++i) {
                this.add(name[i]);
            }

            return this;
        }

        // if an object is passed instead of params
        if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
            cb = url || name.callback || name.onComplete;
            options = name;
            url = name.url;
            name = name.name || name.key || name.url;
        }

        // case where no name is passed shift all args over by one.
        if (typeof url !== 'string') {
            cb = options;
            options = url;
            url = name;
        }

        // now that we shifted make sure we have a proper url.
        if (typeof url !== 'string') {
            throw new Error('No url passed to add resource to loader.');
        }

        // options are optional so people might pass a function and no options
        if (typeof options === 'function') {
            cb = options;
            options = null;
        }

        // if loading already you can only add resources that have a parent.
        if (this.loading && (!options || !options.parentResource)) {
            throw new Error('Cannot add resources while the loader is running.');
        }

        // check if resource already exists.
        if (this.resources[name]) {
            throw new Error('Resource named "' + name + '" already exists.');
        }

        // add base url if this isn't an absolute url
        url = this._prepareUrl(url);

        // create the store the resource
        this.resources[name] = new _Resource2.default(name, url, options);

        if (typeof cb === 'function') {
            this.resources[name].onAfterMiddleware.once(cb);
        }

        // if loading make sure to adjust progress chunks for that parent and its children
        if (this.loading) {
            var parent = options.parentResource;
            var fullChunk = parent.progressChunk * (parent.children.length + 1); // +1 for parent
            var eachChunk = fullChunk / (parent.children.length + 2); // +2 for parent & new child

            parent.children.push(this.resources[name]);
            parent.progressChunk = eachChunk;

            for (var _i = 0; _i < parent.children.length; ++_i) {
                parent.children[_i].progressChunk = eachChunk;
            }
        }

        // add the resource to the queue
        this._queue.push(this.resources[name]);

        return this;
    };

    /**
     * Sets up a middleware function that will run *before* the
     * resource is loaded.
     *
     * @method before
     * @param {function} fn - The middleware function to register.
     * @return {Loader} Returns itself.
     */

    Loader.prototype.pre = function pre(fn) {
        this._beforeMiddleware.push(fn);

        return this;
    };

    /**
     * Sets up a middleware function that will run *after* the
     * resource is loaded.
     *
     * @alias use
     * @method after
     * @param {function} fn - The middleware function to register.
     * @return {Loader} Returns itself.
     */

    Loader.prototype.use = function use(fn) {
        this._afterMiddleware.push(fn);

        return this;
    };

    /**
     * Resets the queue of the loader to prepare for a new load.
     *
     * @return {Loader} Returns itself.
     */

    Loader.prototype.reset = function reset() {
        this.progress = 0;
        this.loading = false;

        this._queue.kill();
        this._queue.pause();

        // abort all resource loads
        for (var k in this.resources) {
            var res = this.resources[k];

            if (res._onLoadBinding) {
                res._onLoadBinding.detach();
            }

            if (res.isLoading) {
                res.abort();
            }
        }

        this.resources = {};

        return this;
    };

    /**
     * Starts loading the queued resources.
     *
     * @param {function} [cb] - Optional callback that will be bound to the `complete` event.
     * @return {Loader} Returns itself.
     */

    Loader.prototype.load = function load(cb) {
        // register complete callback if they pass one
        if (typeof cb === 'function') {
            this.onComplete.once(cb);
        }

        // if the queue has already started we are done here
        if (this.loading) {
            return this;
        }

        // distribute progress chunks
        var chunk = 100 / this._queue._tasks.length;

        for (var i = 0; i < this._queue._tasks.length; ++i) {
            this._queue._tasks[i].data.progressChunk = chunk;
        }

        // update loading state
        this.loading = true;

        // notify of start
        this.onStart.dispatch(this);

        // start loading
        this._queue.resume();

        return this;
    };

    /**
     * Prepares a url for usage based on the configuration of this object
     *
     * @private
     * @param {string} url - The url to prepare.
     * @return {string} The prepared url.
     */

    Loader.prototype._prepareUrl = function _prepareUrl(url) {
        var parsedUrl = (0, _parseUri2.default)(url, { strictMode: true });
        var result = void 0;

        // absolute url, just use it as is.
        if (parsedUrl.protocol || !parsedUrl.path || url.indexOf('//') === 0) {
            result = url;
        }
        // if baseUrl doesn't end in slash and url doesn't start with slash, then add a slash inbetween
        else if (this.baseUrl.length && this.baseUrl.lastIndexOf('/') !== this.baseUrl.length - 1 && url.charAt(0) !== '/') {
                result = this.baseUrl + '/' + url;
            } else {
                result = this.baseUrl + url;
            }

        // if we need to add a default querystring, there is a bit more work
        if (this.defaultQueryString) {
            var hash = rgxExtractUrlHash.exec(result)[0];

            result = result.substr(0, result.length - hash.length);

            if (result.indexOf('?') !== -1) {
                result += '&' + this.defaultQueryString;
            } else {
                result += '?' + this.defaultQueryString;
            }

            result += hash;
        }

        return result;
    };

    /**
     * Loads a single resource.
     *
     * @private
     * @param {Resource} resource - The resource to load.
     * @param {function} dequeue - The function to call when we need to dequeue this item.
     */

    Loader.prototype._loadResource = function _loadResource(resource, dequeue) {
        var _this2 = this;

        resource._dequeue = dequeue;

        // run before middleware
        async.eachSeries(this._beforeMiddleware, function (fn, next) {
            fn.call(_this2, resource, function () {
                // if the before middleware marks the resource as complete,
                // break and don't process any more before middleware
                next(resource.isComplete ? {} : null);
            });
        }, function () {
            if (resource.isComplete) {
                _this2._onLoad(resource);
            } else {
                resource._onLoadBinding = resource.onComplete.once(_this2._onLoad, _this2);
                resource.load();
            }
        });
    };

    /**
     * Called once each resource has loaded.
     *
     * @private
     */

    Loader.prototype._onComplete = function _onComplete() {
        this.loading = false;

        this.onComplete.dispatch(this, this.resources);
    };

    /**
     * Called each time a resources is loaded.
     *
     * @private
     * @param {Resource} resource - The resource that was loaded
     */

    Loader.prototype._onLoad = function _onLoad(resource) {
        var _this3 = this;

        resource._onLoadBinding = null;

        // run middleware, this *must* happen before dequeue so sub-assets get added properly
        async.eachSeries(this._afterMiddleware, function (fn, next) {
            fn.call(_this3, resource, next);
        }, function () {
            resource.onAfterMiddleware.dispatch(resource);

            _this3.progress += resource.progressChunk;
            _this3.onProgress.dispatch(_this3, resource);

            if (resource.error) {
                _this3.onError.dispatch(resource.error, _this3, resource);
            } else {
                _this3.onLoad.dispatch(_this3, resource);
            }

            // remove this resource from the async queue
            resource._dequeue();

            // do completion check
            if (_this3._queue.idle()) {
                _this3.progress = MAX_PROGRESS;
                _this3._onComplete();
            }
        });
    };

    return Loader;
}();

exports.default = Loader;

},{"./Resource":4,"./async":5,"mini-signals":1,"parse-uri":2}],4:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

var _parseUri = require('parse-uri');

var _parseUri2 = _interopRequireDefault(_parseUri);

var _miniSignals = require('mini-signals');

var _miniSignals2 = _interopRequireDefault(_miniSignals);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var http = require('http');

// tests is CORS is supported in XHR, if not we need to use XDR
var useXdr = typeof window !== 'undefined' && !!(window.XDomainRequest && !('withCredentials' in new XMLHttpRequest()));
var tempAnchor = null;

// some status constants
var STATUS_NONE = 0;
var STATUS_OK = 200;
var STATUS_EMPTY = 204;

// noop
function _noop() {} /* empty */

/**
 * Manages the state and loading of a resource and all child resources.
 *
 * @class
 */

var Resource = function () {
    /**
     * Sets the load type to be used for a specific extension.
     *
     * @static
     * @param {string} extname - The extension to set the type for, e.g. "png" or "fnt"
     * @param {Resource.LOAD_TYPE} loadType - The load type to set it to.
     */
    Resource.setExtensionLoadType = function setExtensionLoadType(extname, loadType) {
        setExtMap(Resource._loadTypeMap, extname, loadType);
    };

    /**
     * Sets the load type to be used for a specific extension.
     *
     * @static
     * @param {string} extname - The extension to set the type for, e.g. "png" or "fnt"
     * @param {Resource.XHR_RESPONSE_TYPE} xhrType - The xhr type to set it to.
     */

    Resource.setExtensionXhrType = function setExtensionXhrType(extname, xhrType) {
        setExtMap(Resource._xhrTypeMap, extname, xhrType);
    };

    /**
     * @param {string} name - The name of the resource to load.
     * @param {string|string[]} url - The url for this resource, for audio/video loads you can pass
     *      an array of sources.
     * @param {object} [options] - The options for the load.
     * @param {string|boolean} [options.crossOrigin] - Is this request cross-origin? Default is to
     *      determine automatically.
     * @param {Resource.LOAD_TYPE} [options.loadType=Resource.LOAD_TYPE.XHR] - How should this resource
     *      be loaded?
     * @param {Resource.XHR_RESPONSE_TYPE} [options.xhrType=Resource.XHR_RESPONSE_TYPE.DEFAULT] - How
     *      should the data being loaded be interpreted when using XHR?
     * @param {object} [options.metadata] - Extra configuration for middleware and the Resource object.
     * @param {HTMLImageElement|HTMLAudioElement|HTMLVideoElement} [options.metadata.loadElement=null] - The
     *      element to use for loading, instead of creating one.
     * @param {boolean} [options.metadata.skipSource=false] - Skips adding source(s) to the load element. This
     *      is useful if you want to pass in a `loadElement` that you already added load sources to.
     */

    function Resource(name, url, options) {
        _classCallCheck(this, Resource);

        if (typeof name !== 'string' || typeof url !== 'string') {
            throw new Error('Both name and url are required for constructing a resource.');
        }

        options = options || {};

        /**
         * The state flags of this resource.
         *
         * @member {number}
         */
        this._flags = 0;

        // set data url flag, needs to be set early for some _determineX checks to work.
        this._setFlag(Resource.STATUS_FLAGS.DATA_URL, url.indexOf('data:') === 0);

        /**
         * The name of this resource.
         *
         * @member {string}
         * @readonly
         */
        this.name = name;

        /**
         * The url used to load this resource.
         *
         * @member {string}
         * @readonly
         */
        this.url = url;

        /**
         * The data that was loaded by the resource.
         *
         * @member {any}
         */
        this.data = null;

        /**
         * Is this request cross-origin? If unset, determined automatically.
         *
         * @member {string}
         */
        this.crossOrigin = options.crossOrigin === true ? 'anonymous' : options.crossOrigin;

        /**
         * The method of loading to use for this resource.
         *
         * @member {Resource.LOAD_TYPE}
         */
        this.loadType = options.loadType || this._determineLoadType();

        /**
         * The type used to load the resource via XHR. If unset, determined automatically.
         *
         * @member {string}
         */
        this.xhrType = options.xhrType;

        /**
         * Extra info for middleware, and controlling specifics about how the resource loads.
         *
         * Note that if you pass in a `loadElement`, the Resource class takes ownership of it.
         * Meaning it will modify it as it sees fit.
         *
         * @member {object}
         * @property {HTMLImageElement|HTMLAudioElement|HTMLVideoElement} [loadElement=null] - The
         *  element to use for loading, instead of creating one.
         * @property {boolean} [skipSource=false] - Skips adding source(s) to the load element. This
         *  is useful if you want to pass in a `loadElement` that you already added load sources
         *  to.
         */
        this.metadata = options.metadata || {};

        /**
         * The error that occurred while loading (if any).
         *
         * @member {Error}
         * @readonly
         */
        this.error = null;

        /**
         * The XHR object that was used to load this resource. This is only set
         * when `loadType` is `Resource.LOAD_TYPE.XHR`.
         *
         * @member {XMLHttpRequest}
         * @readonly
         */
        this.xhr = null;

        /**
         * The child resources this resource owns.
         *
         * @member {Resource[]}
         * @readonly
         */
        this.children = [];

        /**
         * The resource type.
         *
         * @member {Resource.TYPE}
         * @readonly
         */
        this.type = Resource.TYPE.UNKNOWN;

        /**
         * The progress chunk owned by this resource.
         *
         * @member {number}
         * @readonly
         */
        this.progressChunk = 0;

        /**
         * The `dequeue` method that will be used a storage place for the async queue dequeue method
         * used privately by the loader.
         *
         * @private
         * @member {function}
         */
        this._dequeue = _noop;

        /**
         * Used a storage place for the on load binding used privately by the loader.
         *
         * @private
         * @member {function}
         */
        this._onLoadBinding = null;

        /**
         * The `complete` function bound to this resource's context.
         *
         * @private
         * @member {function}
         */
        this._boundComplete = this.complete.bind(this);

        /**
         * The `_onError` function bound to this resource's context.
         *
         * @private
         * @member {function}
         */
        this._boundOnError = this._onError.bind(this);

        /**
         * The `_onProgress` function bound to this resource's context.
         *
         * @private
         * @member {function}
         */
        this._boundOnProgress = this._onProgress.bind(this);

        // xhr callbacks
        this._boundXhrOnError = this._xhrOnError.bind(this);
        this._boundXhrOnAbort = this._xhrOnAbort.bind(this);
        this._boundXhrOnLoad = this._xhrOnLoad.bind(this);
        this._boundXdrOnTimeout = this._xdrOnTimeout.bind(this);

        /**
         * Dispatched when the resource beings to load.
         *
         * The callback looks like {@link Resource.OnStartSignal}.
         *
         * @member {Signal}
         */
        this.onStart = new _miniSignals2.default();

        /**
         * Dispatched each time progress of this resource load updates.
         * Not all resources types and loader systems can support this event
         * so sometimes it may not be available. If the resource
         * is being loaded on a modern browser, using XHR, and the remote server
         * properly sets Content-Length headers, then this will be available.
         *
         * The callback looks like {@link Resource.OnProgressSignal}.
         *
         * @member {Signal}
         */
        this.onProgress = new _miniSignals2.default();

        /**
         * Dispatched once this resource has loaded, if there was an error it will
         * be in the `error` property.
         *
         * The callback looks like {@link Resource.OnCompleteSignal}.
         *
         * @member {Signal}
         */
        this.onComplete = new _miniSignals2.default();

        /**
         * Dispatched after this resource has had all the *after* middleware run on it.
         *
         * The callback looks like {@link Resource.OnCompleteSignal}.
         *
         * @member {Signal}
         */
        this.onAfterMiddleware = new _miniSignals2.default();

        /**
         * When the resource starts to load.
         *
         * @memberof Resource
         * @callback OnStartSignal
         * @param {Resource} resource - The resource that the event happened on.
         */

        /**
         * When the resource reports loading progress.
         *
         * @memberof Resource
         * @callback OnProgressSignal
         * @param {Resource} resource - The resource that the event happened on.
         * @param {number} percentage - The progress of the load in the range [0, 1].
         */

        /**
         * When the resource finishes loading.
         *
         * @memberof Resource
         * @callback OnCompleteSignal
         * @param {Resource} resource - The resource that the event happened on.
         */
    }

    /**
     * Stores whether or not this url is a data url.
     *
     * @member {boolean}
     * @readonly
     */

    /**
     * Marks the resource as complete.
     *
     */
    Resource.prototype.complete = function complete() {
        // TODO: Clean this up in a wrapper or something...gross....
        if (this.data && this.data.removeEventListener) {
            this.data.removeEventListener('error', this._boundOnError, false);
            this.data.removeEventListener('load', this._boundComplete, false);
            this.data.removeEventListener('progress', this._boundOnProgress, false);
            this.data.removeEventListener('canplaythrough', this._boundComplete, false);
        }

        if (this.xhr) {
            if (this.xhr.removeEventListener) {
                this.xhr.removeEventListener('error', this._boundXhrOnError, false);
                this.xhr.removeEventListener('abort', this._boundXhrOnAbort, false);
                this.xhr.removeEventListener('progress', this._boundOnProgress, false);
                this.xhr.removeEventListener('load', this._boundXhrOnLoad, false);
            } else {
                this.xhr.onerror = null;
                this.xhr.ontimeout = null;
                this.xhr.onprogress = null;
                this.xhr.onload = null;
            }
        }

        if (this.isComplete) {
            throw new Error('Complete called again for an already completed resource.');
        }

        this._setFlag(Resource.STATUS_FLAGS.COMPLETE, true);
        this._setFlag(Resource.STATUS_FLAGS.LOADING, false);

        this.onComplete.dispatch(this);
    };

    /**
     * Aborts the loading of this resource, with an optional message.
     *
     * @param {string} message - The message to use for the error
     */

    Resource.prototype.abort = function abort(message) {
        // abort can be called multiple times, ignore subsequent calls.
        if (this.error) {
            return;
        }

        // store error
        this.error = new Error(message);

        // abort the actual loading
        if (this.xhr) {
            this.xhr.abort();
        } else if (this.xdr) {
            this.xdr.abort();
        } else if (this.data) {
            // single source
            if (this.data.src) {
                this.data.src = Resource.EMPTY_GIF;
            }
            // multi-source
            else {
                    while (this.data.firstChild) {
                        this.data.removeChild(this.data.firstChild);
                    }
                }
        }

        // done now.
        this.complete();
    };

    /**
     * Kicks off loading of this resource. This method is asynchronous.
     *
     * @param {function} [cb] - Optional callback to call once the resource is loaded.
     */

    Resource.prototype.load = function load(cb) {
        var _this = this;

        if (this.isLoading) {
            return;
        }

        if (this.isComplete) {
            if (cb) {
                setTimeout(function () {
                    return cb(_this);
                }, 1);
            }

            return;
        } else if (cb) {
            this.onComplete.once(cb);
        }

        this._setFlag(Resource.STATUS_FLAGS.LOADING, true);

        this.onStart.dispatch(this);

        // if unset, determine the value
        if (this.crossOrigin === false || typeof this.crossOrigin !== 'string') {
            this.crossOrigin = this._determineCrossOrigin(this.url);
        }

        switch (this.loadType) {
            case Resource.LOAD_TYPE.IMAGE:
                this.type = Resource.TYPE.IMAGE;
                this._loadElement('image');
                break;

            case Resource.LOAD_TYPE.AUDIO:
                this.type = Resource.TYPE.AUDIO;
                this._loadSourceElement('audio');
                break;

            case Resource.LOAD_TYPE.VIDEO:
                this.type = Resource.TYPE.VIDEO;
                this._loadSourceElement('video');
                break;

            case Resource.LOAD_TYPE.NODE_HTTP:
                this._loadHttp();
                break;

            case Resource.LOAD_TYPE.XHR:
            /* falls through */
            default:
                if (useXdr && this.crossOrigin) {
                    this._loadXdr();
                } else {
                    this._loadXhr();
                }
                break;
        }
    };

    /**
     * Checks if the flag is set.
     *
     * @private
     * @param {number} flag - The flag to check.
     * @return {boolean} True if the flag is set.
     */

    Resource.prototype._hasFlag = function _hasFlag(flag) {
        return !!(this._flags & flag);
    };

    /**
     * (Un)Sets the flag.
     *
     * @private
     * @param {number} flag - The flag to (un)set.
     * @param {boolean} value - Whether to set or (un)set the flag.
     */

    Resource.prototype._setFlag = function _setFlag(flag, value) {
        this._flags = value ? this._flags | flag : this._flags & ~flag;
    };

    /**
     * Loads this resources using an element that has a single source,
     * like an HTMLImageElement.
     *
     * @private
     * @param {string} type - The type of element to use.
     */

    Resource.prototype._loadElement = function _loadElement(type) {
        if (this.metadata.loadElement) {
            this.data = this.metadata.loadElement;
        } else if (type === 'image' && typeof window.Image !== 'undefined') {
            this.data = new Image();
        } else {
            this.data = document.createElement(type);
        }

        if (this.crossOrigin) {
            this.data.crossOrigin = this.crossOrigin;
        }

        if (!this.metadata.skipSource) {
            this.data.src = this.url;
        }

        this.data.addEventListener('error', this._boundOnError, false);
        this.data.addEventListener('load', this._boundComplete, false);
        this.data.addEventListener('progress', this._boundOnProgress, false);
    };

    /**
     * Loads this resources using an element that has multiple sources,
     * like an HTMLAudioElement or HTMLVideoElement.
     *
     * @private
     * @param {string} type - The type of element to use.
     */

    Resource.prototype._loadSourceElement = function _loadSourceElement(type) {
        if (this.metadata.loadElement) {
            this.data = this.metadata.loadElement;
        } else if (type === 'audio' && typeof window.Audio !== 'undefined') {
            this.data = new Audio();
        } else {
            this.data = document.createElement(type);
        }

        if (this.data === null) {
            this.abort('Unsupported element: ' + type);

            return;
        }

        if (!this.metadata.skipSource) {
            // support for CocoonJS Canvas+ runtime, lacks document.createElement('source')
            if (navigator.isCocoonJS) {
                this.data.src = Array.isArray(this.url) ? this.url[0] : this.url;
            } else if (Array.isArray(this.url)) {
                for (var i = 0; i < this.url.length; ++i) {
                    this.data.appendChild(this._createSource(type, this.url[i]));
                }
            } else {
                this.data.appendChild(this._createSource(type, this.url));
            }
        }

        this.data.addEventListener('error', this._boundOnError, false);
        this.data.addEventListener('load', this._boundComplete, false);
        this.data.addEventListener('progress', this._boundOnProgress, false);
        this.data.addEventListener('canplaythrough', this._boundComplete, false);

        this.data.load();
    };

    Resource.prototype._loadHttp = function _loadHttp() {
        var _this2 = this;

        // if unset, determine the value
        if (typeof this.httpType !== 'string') {
            this.httpType = this._determineHttpType();
        }

        var req = http.get(this.url, function (res) {
            var statusCode = res.statusCode;
            var contentType = res.headers['content-type'];
            var contentLength = res.headers['content-length'];

            var data = '';

            res.on('data', function (chunk) {
                data += chunk;

                if (contentLength && contentLength > 0) {
                    _this2.onProgress.dispatch(_this2, data.length / contentLength);
                }
            });

            res.on('end', function () {
                _this2._loadHttpComplete(res, data);
            });
        }).on('error', function (e) {
            _this2.abort('http Request failed. Status: ' + req.statusCode + ', text: "' + e.message + '"');
        }).on('abort', function (e) {
            _this2.abort('http Request aborted. Status: ' + req.statusCode + ', text: "' + e.message + '"');
        });
    };

    Resource.prototype._loadHttpComplete = function _loadHttpComplete(res, data) {
        // status can be 0 when using the `file://` protocol so we also check if a response is set
        var status = res.statusCode;

        if (status === STATUS_OK || status === STATUS_EMPTY || status === STATUS_NONE && data.length > 0) {
            // if text, just return it
            if (this.httpType === Resource.XHR_RESPONSE_TYPE.TEXT) {
                this.data = data;
                this.type = Resource.TYPE.TEXT;
            }
            // if json, parse into json object
            else if (this.httpType === Resource.XHR_RESPONSE_TYPE.JSON) {
                    try {
                        this.data = JSON.parse(data);
                        this.type = Resource.TYPE.JSON;
                    } catch (e) {
                        this.abort('Error trying to parse loaded json: ' + e);

                        return;
                    }
                }
                // other types just return the response
                else {
                        this.data = data;
                    }
        } else {
            this.abort('[' + res.statusCode + '] ' + res.statusMessage + ': ' + this.url);

            return;
        }

        this.complete();
    };

    /**
     * Loads this resources using an XMLHttpRequest.
     *
     * @private
     */

    Resource.prototype._loadXhr = function _loadXhr() {
        // if unset, determine the value
        if (typeof this.xhrType !== 'string') {
            this.xhrType = this._determineXhrType();
        }

        var xhr = this.xhr = new XMLHttpRequest();

        // set the request type and url
        xhr.open('GET', this.url, true);

        // load json as text and parse it ourselves. We do this because some browsers
        // *cough* safari *cough* can't deal with it.
        if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON || this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
            xhr.responseType = Resource.XHR_RESPONSE_TYPE.TEXT;
        } else {
            xhr.responseType = this.xhrType;
        }

        xhr.addEventListener('error', this._boundXhrOnError, false);
        xhr.addEventListener('abort', this._boundXhrOnAbort, false);
        xhr.addEventListener('progress', this._boundOnProgress, false);
        xhr.addEventListener('load', this._boundXhrOnLoad, false);

        xhr.send();
    };

    /**
     * Loads this resources using an XDomainRequest. This is here because we need to support IE9 (gross).
     *
     * @private
     */

    Resource.prototype._loadXdr = function _loadXdr() {
        // if unset, determine the value
        if (typeof this.xhrType !== 'string') {
            this.xhrType = this._determineXhrType();
        }

        var xdr = this.xhr = new XDomainRequest();

        // XDomainRequest has a few quirks. Occasionally it will abort requests
        // A way to avoid this is to make sure ALL callbacks are set even if not used
        // More info here: http://stackoverflow.com/questions/15786966/xdomainrequest-aborts-post-on-ie-9
        xdr.timeout = 5000;

        xdr.onerror = this._boundXhrOnError;
        xdr.ontimeout = this._boundXdrOnTimeout;
        xdr.onprogress = this._boundOnProgress;
        xdr.onload = this._boundXhrOnLoad;

        xdr.open('GET', this.url, true);

        // Note: The xdr.send() call is wrapped in a timeout to prevent an
        // issue with the interface where some requests are lost if multiple
        // XDomainRequests are being sent at the same time.
        // Some info here: https://github.com/photonstorm/phaser/issues/1248
        setTimeout(function () {
            return xdr.send();
        }, 1);
    };

    /**
     * Creates a source used in loading via an element.
     *
     * @private
     * @param {string} type - The element type (video or audio).
     * @param {string} url - The source URL to load from.
     * @param {string} [mime] - The mime type of the video
     * @return {HTMLSourceElement} The source element.
     */

    Resource.prototype._createSource = function _createSource(type, url, mime) {
        if (!mime) {
            mime = type + '/' + url.substr(url.lastIndexOf('.') + 1);
        }

        var source = document.createElement('source');

        source.src = url;
        source.type = mime;

        return source;
    };

    /**
     * Called if a load errors out.
     *
     * @param {Event} event - The error event from the element that emits it.
     * @private
     */

    Resource.prototype._onError = function _onError(event) {
        this.abort('Failed to load element using: ' + event.target.nodeName);
    };

    /**
     * Called if a load progress event fires for xhr/xdr.
     *
     * @private
     * @param {XMLHttpRequestProgressEvent|Event} event - Progress event.
     */

    Resource.prototype._onProgress = function _onProgress(event) {
        if (event && event.lengthComputable) {
            this.onProgress.dispatch(this, event.loaded / event.total);
        }
    };

    /**
     * Called if an error event fires for xhr/xdr.
     *
     * @private
     * @param {XMLHttpRequestErrorEvent|Event} event - Error event.
     */

    Resource.prototype._xhrOnError = function _xhrOnError() {
        var xhr = this.xhr;

        this.abort(reqType(xhr) + ' Request failed. Status: ' + xhr.status + ', text: "' + xhr.statusText + '"');
    };

    /**
     * Called if an abort event fires for xhr.
     *
     * @private
     * @param {XMLHttpRequestAbortEvent} event - Abort Event
     */

    Resource.prototype._xhrOnAbort = function _xhrOnAbort() {
        this.abort(reqType(this.xhr) + ' Request was aborted by the user.');
    };

    /**
     * Called if a timeout event fires for xdr.
     *
     * @private
     * @param {Event} event - Timeout event.
     */

    Resource.prototype._xdrOnTimeout = function _xdrOnTimeout() {
        this.abort(reqType(this.xhr) + ' Request timed out.');
    };

    /**
     * Called when data successfully loads from an xhr/xdr request.
     *
     * @private
     * @param {XMLHttpRequestLoadEvent|Event} event - Load event
     */

    Resource.prototype._xhrOnLoad = function _xhrOnLoad() {
        var xhr = this.xhr;
        var status = typeof xhr.status === 'undefined' ? xhr.status : STATUS_OK; // XDR has no `.status`, assume 200.

        // status can be 0 when using the `file://` protocol so we also check if a response is set
        if (status === STATUS_OK || status === STATUS_EMPTY || status === STATUS_NONE && xhr.responseText.length > 0) {
            // if text, just return it
            if (this.xhrType === Resource.XHR_RESPONSE_TYPE.TEXT) {
                this.data = xhr.responseText;
                this.type = Resource.TYPE.TEXT;
            }
            // if json, parse into json object
            else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON) {
                    try {
                        this.data = JSON.parse(xhr.responseText);
                        this.type = Resource.TYPE.JSON;
                    } catch (e) {
                        this.abort('Error trying to parse loaded json: ' + e);

                        return;
                    }
                }
                // if xml, parse into an xml document or div element
                else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.DOCUMENT) {
                        try {
                            if (window.DOMParser) {
                                var domparser = new DOMParser();

                                this.data = domparser.parseFromString(xhr.responseText, 'text/xml');
                            } else {
                                var div = document.createElement('div');

                                div.innerHTML = xhr.responseText;

                                this.data = div;
                            }

                            this.type = Resource.TYPE.XML;
                        } catch (e) {
                            this.abort('Error trying to parse loaded xml: ' + e);

                            return;
                        }
                    }
                    // other types just return the response
                    else {
                            this.data = xhr.response || xhr.responseText;
                        }
        } else {
            this.abort('[' + xhr.status + '] ' + xhr.statusText + ': ' + xhr.responseURL);

            return;
        }

        this.complete();
    };

    /**
     * Sets the `crossOrigin` property for this resource based on if the url
     * for this resource is cross-origin. If crossOrigin was manually set, this
     * function does nothing.
     *
     * @private
     * @param {string} url - The url to test.
     * @param {object} [loc=window.location] - The location object to test against.
     * @return {string} The crossOrigin value to use (or empty string for none).
     */

    Resource.prototype._determineCrossOrigin = function _determineCrossOrigin(url, loc) {
        // data: and javascript: urls are considered same-origin
        if (url.indexOf('data:') === 0) {
            return '';
        }

        // default is window.location
        loc = loc || typeof window !== 'undefined' && window.location;

        if (!tempAnchor) {
            tempAnchor = document.createElement('a');
        }

        // let the browser determine the full href for the url of this resource and then
        // parse with the node url lib, we can't use the properties of the anchor element
        // because they don't work in IE9 :(
        tempAnchor.href = url;
        url = (0, _parseUri2.default)(tempAnchor.href, { strictMode: true });

        var samePort = !url.port && loc.port === '' || url.port === loc.port;
        var protocol = url.protocol ? url.protocol + ':' : '';

        // if cross origin
        if (url.host !== loc.hostname || !samePort || protocol !== loc.protocol) {
            return 'anonymous';
        }

        return '';
    };

    Resource.prototype._determineHttpType = function _determineHttpType() {
        return Resource._xhrTypeMap[this._getExtension()] || Resource.XHR_RESPONSE_TYPE.TEXT;
    };

    /**
     * Determines the responseType of an XHR request based on the extension of the
     * resource being loaded.
     *
     * @private
     * @return {Resource.XHR_RESPONSE_TYPE} The responseType to use.
     */

    Resource.prototype._determineXhrType = function _determineXhrType() {
        return Resource._xhrTypeMap[this._getExtension()] || Resource.XHR_RESPONSE_TYPE.TEXT;
    };

    /**
     * Determines the loadType of a resource based on the extension of the
     * resource being loaded.
     *
     * @private
     * @return {Resource.LOAD_TYPE} The loadType to use.
     */

    Resource.prototype._determineLoadType = function _determineLoadType() {
        return Resource._loadTypeMap[this._getExtension()] || Resource.LOAD_TYPE.XHR;
    };

    /**
     * Extracts the extension (sans '.') of the file being loaded by the resource.
     *
     * @private
     * @return {string} The extension.
     */

    Resource.prototype._getExtension = function _getExtension() {
        var url = this.url;
        var ext = '';

        if (this.isDataUrl) {
            var slashIndex = url.indexOf('/');

            ext = url.substring(slashIndex + 1, url.indexOf(';', slashIndex));
        } else {
            var queryStart = url.indexOf('?');

            if (queryStart !== -1) {
                url = url.substring(0, queryStart);
            }

            ext = url.substring(url.lastIndexOf('.') + 1);
        }

        return ext.toLowerCase();
    };

    /**
     * Determines the mime type of an XHR request based on the responseType of
     * resource being loaded.
     *
     * @private
     * @param {Resource.XHR_RESPONSE_TYPE} type - The type to get a mime type for.
     * @return {string} The mime type to use.
     */

    Resource.prototype._getMimeFromXhrType = function _getMimeFromXhrType(type) {
        switch (type) {
            case Resource.XHR_RESPONSE_TYPE.BUFFER:
                return 'application/octet-binary';

            case Resource.XHR_RESPONSE_TYPE.BLOB:
                return 'application/blob';

            case Resource.XHR_RESPONSE_TYPE.DOCUMENT:
                return 'application/xml';

            case Resource.XHR_RESPONSE_TYPE.JSON:
                return 'application/json';

            case Resource.XHR_RESPONSE_TYPE.DEFAULT:
            case Resource.XHR_RESPONSE_TYPE.TEXT:
            /* falls through */
            default:
                return 'text/plain';

        }
    };

    _createClass(Resource, [{
        key: 'isDataUrl',
        get: function get() {
            return this._hasFlag(Resource.STATUS_FLAGS.DATA_URL);
        }

        /**
         * Describes if this resource has finished loading. Is true when the resource has completely
         * loaded.
         *
         * @member {boolean}
         * @readonly
         */

    }, {
        key: 'isComplete',
        get: function get() {
            return this._hasFlag(Resource.STATUS_FLAGS.COMPLETE);
        }

        /**
         * Describes if this resource is currently loading. Is true when the resource starts loading,
         * and is false again when complete.
         *
         * @member {boolean}
         * @readonly
         */

    }, {
        key: 'isLoading',
        get: function get() {
            return this._hasFlag(Resource.STATUS_FLAGS.LOADING);
        }
    }]);

    return Resource;
}();

/**
 * The types of resources a resource could represent.
 *
 * @static
 * @readonly
 * @enum {number}
 */

exports.default = Resource;
Resource.STATUS_FLAGS = {
    NONE: 0,
    DATA_URL: 1 << 0,
    COMPLETE: 1 << 1,
    LOADING: 1 << 2
};

/**
 * The types of resources a resource could represent.
 *
 * @static
 * @readonly
 * @enum {number}
 */
Resource.TYPE = {
    UNKNOWN: 0,
    JSON: 1,
    XML: 2,
    IMAGE: 3,
    AUDIO: 4,
    VIDEO: 5,
    TEXT: 6
};

/**
 * The types of loading a resource can use.
 *
 * @static
 * @readonly
 * @enum {number}
 */
Resource.LOAD_TYPE = {
    /** Uses XMLHttpRequest to load the resource. */
    XHR: 1,
    /** Uses an `Image` object to load the resource. */
    IMAGE: 2,
    /** Uses an `Audio` object to load the resource. */
    AUDIO: 3,
    /** Uses a `Video` object to load the resource. */
    VIDEO: 4,
    /** Uses node's HTTP get to load the resource. */
    NODE_HTTP: 5
};

/**
 * The XHR ready states, used internally.
 *
 * @static
 * @readonly
 * @enum {string}
 */
Resource.XHR_RESPONSE_TYPE = {
    /** string */
    DEFAULT: 'text',
    /** ArrayBuffer */
    BUFFER: 'arraybuffer',
    /** Blob */
    BLOB: 'blob',
    /** Document */
    DOCUMENT: 'document',
    /** Object */
    JSON: 'json',
    /** String */
    TEXT: 'text'
};

Resource._loadTypeMap = {
    // images
    gif: Resource.LOAD_TYPE.IMAGE,
    png: Resource.LOAD_TYPE.IMAGE,
    bmp: Resource.LOAD_TYPE.IMAGE,
    jpg: Resource.LOAD_TYPE.IMAGE,
    jpeg: Resource.LOAD_TYPE.IMAGE,
    tif: Resource.LOAD_TYPE.IMAGE,
    tiff: Resource.LOAD_TYPE.IMAGE,
    webp: Resource.LOAD_TYPE.IMAGE,
    tga: Resource.LOAD_TYPE.IMAGE,
    svg: Resource.LOAD_TYPE.IMAGE,
    'svg+xml': Resource.LOAD_TYPE.IMAGE, // for SVG data urls

    // audio
    mp3: Resource.LOAD_TYPE.AUDIO,
    ogg: Resource.LOAD_TYPE.AUDIO,
    wav: Resource.LOAD_TYPE.AUDIO,

    // videos
    mp4: Resource.LOAD_TYPE.VIDEO,
    webm: Resource.LOAD_TYPE.VIDEO
};

Resource._xhrTypeMap = {
    // xml
    xhtml: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    html: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    htm: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    xml: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    tmx: Resource.XHR_RESPONSE_TYPE.DOCUMENT,
    svg: Resource.XHR_RESPONSE_TYPE.DOCUMENT,

    // This was added to handle Tiled Tileset XML, but .tsx is also a TypeScript React Component.
    // Since it is way less likely for people to be loading TypeScript files instead of Tiled files,
    // this should probably be fine.
    tsx: Resource.XHR_RESPONSE_TYPE.DOCUMENT,

    // images
    gif: Resource.XHR_RESPONSE_TYPE.BLOB,
    png: Resource.XHR_RESPONSE_TYPE.BLOB,
    bmp: Resource.XHR_RESPONSE_TYPE.BLOB,
    jpg: Resource.XHR_RESPONSE_TYPE.BLOB,
    jpeg: Resource.XHR_RESPONSE_TYPE.BLOB,
    tif: Resource.XHR_RESPONSE_TYPE.BLOB,
    tiff: Resource.XHR_RESPONSE_TYPE.BLOB,
    webp: Resource.XHR_RESPONSE_TYPE.BLOB,
    tga: Resource.XHR_RESPONSE_TYPE.BLOB,

    // json
    json: Resource.XHR_RESPONSE_TYPE.JSON,

    // text
    text: Resource.XHR_RESPONSE_TYPE.TEXT,
    txt: Resource.XHR_RESPONSE_TYPE.TEXT,

    // fonts
    ttf: Resource.XHR_RESPONSE_TYPE.BUFFER,
    otf: Resource.XHR_RESPONSE_TYPE.BUFFER
};

// We can't set the `src` attribute to empty string, so on abort we set it to this 1px transparent gif
Resource.EMPTY_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

/**
 * Quick helper to set a value on one of the extension maps. Ensures there is no
 * dot at the start of the extension.
 *
 * @ignore
 * @param {object} map - The map to set on.
 * @param {string} extname - The extension (or key) to set.
 * @param {number} val - The value to set.
 */
function setExtMap(map, extname, val) {
    if (extname && extname.indexOf('.') === 0) {
        extname = extname.substring(1);
    }

    if (!extname) {
        return;
    }

    map[extname] = val;
}

/**
 * Quick helper to get string xhr type.
 *
 * @ignore
 * @param {XMLHttpRequest|XDomainRequest} xhr - The request to check.
 * @return {string} The type.
 */
function reqType(xhr) {
    return xhr.toString().replace('object ', '');
}

},{"http":undefined,"mini-signals":1,"parse-uri":2}],5:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.eachSeries = eachSeries;
exports.queue = queue;
/**
 * Smaller version of the async library constructs.
 *
 */
function _noop() {} /* empty */

/**
 * Iterates an array in series.
 *
 * @param {*[]} array - Array to iterate.
 * @param {function} iterator - Function to call for each element.
 * @param {function} callback - Function to call when done, or on error.
 */
function eachSeries(array, iterator, callback) {
    var i = 0;
    var len = array.length;

    (function next(err) {
        if (err || i === len) {
            if (callback) {
                callback(err);
            }

            return;
        }

        iterator(array[i++], next);
    })();
}

/**
 * Ensures a function is only called once.
 *
 * @param {function} fn - The function to wrap.
 * @return {function} The wrapping function.
 */
function onlyOnce(fn) {
    return function onceWrapper() {
        if (fn === null) {
            throw new Error('Callback was already called.');
        }

        var callFn = fn;

        fn = null;
        callFn.apply(this, arguments);
    };
}

/**
 * Async queue implementation,
 *
 * @param {function} worker - The worker function to call for each task.
 * @param {number} concurrency - How many workers to run in parrallel.
 * @return {*} The async queue object.
 */
function queue(worker, concurrency) {
    if (concurrency == null) {
        // eslint-disable-line no-eq-null,eqeqeq
        concurrency = 1;
    } else if (concurrency === 0) {
        throw new Error('Concurrency must not be zero');
    }

    var workers = 0;
    var q = {
        _tasks: [],
        concurrency: concurrency,
        saturated: _noop,
        unsaturated: _noop,
        buffer: concurrency / 4,
        empty: _noop,
        drain: _noop,
        error: _noop,
        started: false,
        paused: false,
        push: function push(data, callback) {
            _insert(data, false, callback);
        },
        kill: function kill() {
            workers = 0;
            q.drain = _noop;
            q.started = false;
            q._tasks = [];
        },
        unshift: function unshift(data, callback) {
            _insert(data, true, callback);
        },
        process: function process() {
            while (!q.paused && workers < q.concurrency && q._tasks.length) {
                var task = q._tasks.shift();

                if (q._tasks.length === 0) {
                    q.empty();
                }

                workers += 1;

                if (workers === q.concurrency) {
                    q.saturated();
                }

                worker(task.data, onlyOnce(_next(task)));
            }
        },
        length: function length() {
            return q._tasks.length;
        },
        running: function running() {
            return workers;
        },
        idle: function idle() {
            return q._tasks.length + workers === 0;
        },
        pause: function pause() {
            if (q.paused === true) {
                return;
            }

            q.paused = true;
        },
        resume: function resume() {
            if (q.paused === false) {
                return;
            }

            q.paused = false;

            // Need to call q.process once per concurrent
            // worker to preserve full concurrency after pause
            for (var w = 1; w <= q.concurrency; w++) {
                q.process();
            }
        }
    };

    function _insert(data, insertAtFront, callback) {
        if (callback != null && typeof callback !== 'function') {
            // eslint-disable-line no-eq-null,eqeqeq
            throw new Error('task callback must be a function');
        }

        q.started = true;

        if (data == null && q.idle()) {
            // eslint-disable-line no-eq-null,eqeqeq
            // call drain immediately if there are no tasks
            setTimeout(function () {
                return q.drain();
            }, 1);

            return;
        }

        var item = {
            data: data,
            callback: typeof callback === 'function' ? callback : _noop
        };

        if (insertAtFront) {
            q._tasks.unshift(item);
        } else {
            q._tasks.push(item);
        }

        setTimeout(function () {
            return q.process();
        }, 1);
    }

    function _next(task) {
        return function next() {
            workers -= 1;

            task.callback.apply(task, arguments);

            if (arguments[0] != null) {
                // eslint-disable-line no-eq-null,eqeqeq
                q.error(arguments[0], task.data);
            }

            if (workers <= q.concurrency - q.buffer) {
                q.unsaturated();
            }

            if (q.idle()) {
                q.drain();
            }

            q.process();
        };
    }

    return q;
}

},{}],6:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.encodeBinary = encodeBinary;
var _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function encodeBinary(input) {
    var output = '';
    var inx = 0;

    while (inx < input.length) {
        // Fill byte buffer array
        var bytebuffer = [0, 0, 0];
        var encodedCharIndexes = [0, 0, 0, 0];

        for (var jnx = 0; jnx < bytebuffer.length; ++jnx) {
            if (inx < input.length) {
                // throw away high-order byte, as documented at:
                // https://developer.mozilla.org/En/Using_XMLHttpRequest#Handling_binary_data
                bytebuffer[jnx] = input.charCodeAt(inx++) & 0xff;
            } else {
                bytebuffer[jnx] = 0;
            }
        }

        // Get each encoded character, 6 bits at a time
        // index 1: first 6 bits
        encodedCharIndexes[0] = bytebuffer[0] >> 2;

        // index 2: second 6 bits (2 least significant bits from input byte 1 + 4 most significant bits from byte 2)
        encodedCharIndexes[1] = (bytebuffer[0] & 0x3) << 4 | bytebuffer[1] >> 4;

        // index 3: third 6 bits (4 least significant bits from input byte 2 + 2 most significant bits from byte 3)
        encodedCharIndexes[2] = (bytebuffer[1] & 0x0f) << 2 | bytebuffer[2] >> 6;

        // index 3: forth 6 bits (6 least significant bits from input byte 3)
        encodedCharIndexes[3] = bytebuffer[2] & 0x3f;

        // Determine whether padding happened, and adjust accordingly
        var paddingBytes = inx - (input.length - 1);

        switch (paddingBytes) {
            case 2:
                // Set last 2 characters to padding char
                encodedCharIndexes[3] = 64;
                encodedCharIndexes[2] = 64;
                break;

            case 1:
                // Set last character to padding char
                encodedCharIndexes[3] = 64;
                break;

            default:
                break; // No padding - proceed
        }

        // Now we will grab each appropriate character out of our keystring
        // based on our index array and append it to the output string
        for (var _jnx = 0; _jnx < encodedCharIndexes.length; ++_jnx) {
            output += _keyStr.charAt(encodedCharIndexes[_jnx]);
        }
    }

    return output;
}

},{}],7:[function(require,module,exports){
'use strict';

var _Loader = require('./Loader');

var _Loader2 = _interopRequireDefault(_Loader);

var _Resource = require('./Resource');

var _Resource2 = _interopRequireDefault(_Resource);

var _async = require('./async');

var async = _interopRequireWildcard(_async);

var _b = require('./b64');

var b64 = _interopRequireWildcard(_b);

var _memory = require('./middlewares/caching/memory');

var _blob = require('./middlewares/parsing/blob');

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }newObj.default = obj;return newObj;
  }
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

_Loader2.default.Resource = _Resource2.default;
_Loader2.default.async = async;
_Loader2.default.base64 = b64;
_Loader2.default.middleware = {
  caching: {
    memory: _memory.memoryMiddlewareFactory
  },
  parsing: {
    blob: _blob.blobMiddlewareFactory
  }
};

module.exports = _Loader2.default; // eslint-disable-line no-undef

},{"./Loader":3,"./Resource":4,"./async":5,"./b64":6,"./middlewares/caching/memory":8,"./middlewares/parsing/blob":9}],8:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.memoryMiddlewareFactory = memoryMiddlewareFactory;
// a simple in-memory cache for resources
var cache = {};

function memoryMiddlewareFactory() {
    return function memoryMiddleware(resource, next) {
        var _this = this;

        // if cached, then set data and complete the resource
        if (cache[resource.url]) {
            resource.data = cache[resource.url];
            resource.complete(); // marks resource load complete and stops processing before middlewares
        }
        // if not cached, wait for complete and store it in the cache.
        else {
                resource.onComplete.once(function () {
                    return cache[_this.url] = _this.data;
                });
            }

        next();
    };
}

},{}],9:[function(require,module,exports){
'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

exports.blobMiddlewareFactory = blobMiddlewareFactory;

var _Resource = require('../../Resource');

var _Resource2 = _interopRequireDefault(_Resource);

var _b = require('../../b64');

var _b2 = _interopRequireDefault(_b);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

var Url = typeof window !== 'undefined' && (window.URL || window.webkitURL);

// a middleware for transforming XHR loaded Blobs into more useful objects
function blobMiddlewareFactory() {
    return function blobMiddleware(resource, next) {
        if (!resource.data) {
            next();

            return;
        }

        // if this was an XHR load of a blob
        if (resource.xhr && resource.xhrType === _Resource2.default.XHR_RESPONSE_TYPE.BLOB) {
            // if there is no blob support we probably got a binary string back
            if (!window.Blob || typeof resource.data === 'string') {
                var type = resource.xhr.getResponseHeader('content-type');

                // this is an image, convert the binary string into a data url
                if (type && type.indexOf('image') === 0) {
                    resource.data = new Image();
                    resource.data.src = 'data:' + type + ';base64,' + _b2.default.encodeBinary(resource.xhr.responseText);

                    resource.type = _Resource2.default.TYPE.IMAGE;

                    // wait until the image loads and then callback
                    resource.data.onload = function () {
                        resource.data.onload = null;

                        next();
                    };

                    // next will be called on load
                    return;
                }
            }
            // if content type says this is an image, then we should transform the blob into an Image object
            else if (resource.data.type.indexOf('image') === 0) {
                    var _ret = function () {
                        var src = Url.createObjectURL(resource.data);

                        resource.blob = resource.data;
                        resource.data = new Image();
                        resource.data.src = src;

                        resource.type = _Resource2.default.TYPE.IMAGE;

                        // cleanup the no longer used blob after the image loads
                        // TODO: Is this correct? Will the image be invalid after revoking?
                        resource.data.onload = function () {
                            Url.revokeObjectURL(src);
                            resource.data.onload = null;

                            next();
                        };

                        // next will be called on load.
                        return {
                            v: void 0
                        };
                    }();

                    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                }
        }

        next();
    };
}

},{"../../Resource":4,"../../b64":6}]},{},[7])(7)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbWluaS1zaWduYWxzL2xpYi9taW5pLXNpZ25hbHMuanMiLCJub2RlX21vZHVsZXMvcGFyc2UtdXJpL2luZGV4LmpzIiwic3JjL0xvYWRlci5qcyIsInNyYy9SZXNvdXJjZS5qcyIsInNyYy9hc3luYy5qcyIsInNyYy9iNjQuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvbWlkZGxld2FyZXMvY2FjaGluZy9tZW1vcnkuanMiLCJzcmMvbWlkZGxld2FyZXMvcGFyc2luZy9ibG9iLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QSxBQUFTLEtBQVQsQUFBYyxTQUFkLEFBQXVCLEFBRXZCOztBQUNIO0FBSkQsQUFNQTs7QUFDQTtBQUNIO0FBQ0o7QUFDRDtBQXJCQTtpQkFzQkssSUFBSSxTQUFBLEFBQVMsS0FBVCxBQUFjLEtBQWQsQUFBbUIsUUFBbkIsQUFBMkIsYUFBL0IsQUFBNEMsR0FBRzsyQ0FDaEQ7NEJBQU0sTUFBTSxJQUFBLEFBQUksZ0JBQWdCLFNBQWhDLEFBQVksQUFBNkIsQUFFekM7O2lDQUFBLEFBQVMsT0FBTyxTQUFoQixBQUF5QixBQUN6QjtpQ0FBQSxBQUFTLE9BQU8sSUFBaEIsQUFBZ0IsQUFBSSxBQUNwQjtpQ0FBQSxBQUFTLEtBQVQsQUFBYyxNQUFkLEFBQW9CLEFBRXBCOztpQ0FBQSxBQUFTLE9BQU8sbUJBQUEsQUFBUyxLQUF6QixBQUE4QixBQUU5Qjs7QUFDQTtBQUNBO2lDQUFBLEFBQVMsS0FBVCxBQUFjLFNBQVMsWUFBTSxBQUN6QjtnQ0FBQSxBQUFJLGdCQUFKLEFBQW9CLEFBQ3BCO3FDQUFBLEFBQVMsS0FBVCxBQUFjLFNBQWQsQUFBdUIsQUFFdkI7O0FBQ0g7QUFMRCxBQU9BOztBQUNBOztvQ0FuQmdELEFBbUJoRDtBQUFBO0FBbkJnRDs7OEdBb0JuRDtBQUNKO0FBRUQ7O0FBQ0g7QUF4REQsQUF5REgiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBNaW5pU2lnbmFsQmluZGluZyA9IChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE1pbmlTaWduYWxCaW5kaW5nKGZuLCBvbmNlLCB0aGlzQXJnKSB7XG4gICAgaWYgKG9uY2UgPT09IHVuZGVmaW5lZCkgb25jZSA9IGZhbHNlO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1pbmlTaWduYWxCaW5kaW5nKTtcblxuICAgIHRoaXMuX2ZuID0gZm47XG4gICAgdGhpcy5fb25jZSA9IG9uY2U7XG4gICAgdGhpcy5fdGhpc0FyZyA9IHRoaXNBcmc7XG4gICAgdGhpcy5fbmV4dCA9IHRoaXMuX3ByZXYgPSB0aGlzLl9vd25lciA9IG51bGw7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoTWluaVNpZ25hbEJpbmRpbmcsIFt7XG4gICAga2V5OiAnZGV0YWNoJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGV0YWNoKCkge1xuICAgICAgaWYgKHRoaXMuX293bmVyID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgICB0aGlzLl9vd25lci5kZXRhY2godGhpcyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTWluaVNpZ25hbEJpbmRpbmc7XG59KSgpO1xuXG5mdW5jdGlvbiBfYWRkTWluaVNpZ25hbEJpbmRpbmcoc2VsZiwgbm9kZSkge1xuICBpZiAoIXNlbGYuX2hlYWQpIHtcbiAgICBzZWxmLl9oZWFkID0gbm9kZTtcbiAgICBzZWxmLl90YWlsID0gbm9kZTtcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl90YWlsLl9uZXh0ID0gbm9kZTtcbiAgICBub2RlLl9wcmV2ID0gc2VsZi5fdGFpbDtcbiAgICBzZWxmLl90YWlsID0gbm9kZTtcbiAgfVxuXG4gIG5vZGUuX293bmVyID0gc2VsZjtcblxuICByZXR1cm4gbm9kZTtcbn1cblxudmFyIE1pbmlTaWduYWwgPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBNaW5pU2lnbmFsKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNaW5pU2lnbmFsKTtcblxuICAgIHRoaXMuX2hlYWQgPSB0aGlzLl90YWlsID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1pbmlTaWduYWwsIFt7XG4gICAga2V5OiAnaGFuZGxlcnMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVycygpIHtcbiAgICAgIHZhciBleGlzdHMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgdmFyIG5vZGUgPSB0aGlzLl9oZWFkO1xuXG4gICAgICBpZiAoZXhpc3RzKSByZXR1cm4gISFub2RlO1xuXG4gICAgICB2YXIgZWUgPSBbXTtcblxuICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgZWUucHVzaChub2RlKTtcbiAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdoYXMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYXMobm9kZSkge1xuICAgICAgaWYgKCEobm9kZSBpbnN0YW5jZW9mIE1pbmlTaWduYWxCaW5kaW5nKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pbmlTaWduYWwjaGFzKCk6IEZpcnN0IGFyZyBtdXN0IGJlIGEgTWluaVNpZ25hbEJpbmRpbmcgb2JqZWN0LicpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZS5fb3duZXIgPT09IHRoaXM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZGlzcGF0Y2gnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNwYXRjaCgpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5faGVhZDtcblxuICAgICAgaWYgKCFub2RlKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlLl9vbmNlKSB0aGlzLmRldGFjaChub2RlKTtcbiAgICAgICAgbm9kZS5fZm4uYXBwbHkobm9kZS5fdGhpc0FyZywgYXJndW1lbnRzKTtcbiAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FkZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZChmbikge1xuICAgICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWluaVNpZ25hbCNhZGQoKTogRmlyc3QgYXJnIG11c3QgYmUgYSBGdW5jdGlvbi4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfYWRkTWluaVNpZ25hbEJpbmRpbmcodGhpcywgbmV3IE1pbmlTaWduYWxCaW5kaW5nKGZuLCBmYWxzZSwgdGhpc0FyZykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ29uY2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvbmNlKGZuKSB7XG4gICAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaW5pU2lnbmFsI29uY2UoKTogRmlyc3QgYXJnIG11c3QgYmUgYSBGdW5jdGlvbi4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfYWRkTWluaVNpZ25hbEJpbmRpbmcodGhpcywgbmV3IE1pbmlTaWduYWxCaW5kaW5nKGZuLCB0cnVlLCB0aGlzQXJnKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZGV0YWNoJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGV0YWNoKG5vZGUpIHtcbiAgICAgIGlmICghKG5vZGUgaW5zdGFuY2VvZiBNaW5pU2lnbmFsQmluZGluZykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaW5pU2lnbmFsI2RldGFjaCgpOiBGaXJzdCBhcmcgbXVzdCBiZSBhIE1pbmlTaWduYWxCaW5kaW5nIG9iamVjdC4nKTtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlLl9vd25lciAhPT0gdGhpcykgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGlmIChub2RlLl9wcmV2KSBub2RlLl9wcmV2Ll9uZXh0ID0gbm9kZS5fbmV4dDtcbiAgICAgIGlmIChub2RlLl9uZXh0KSBub2RlLl9uZXh0Ll9wcmV2ID0gbm9kZS5fcHJldjtcblxuICAgICAgaWYgKG5vZGUgPT09IHRoaXMuX2hlYWQpIHtcbiAgICAgICAgdGhpcy5faGVhZCA9IG5vZGUuX25leHQ7XG4gICAgICAgIGlmIChub2RlLl9uZXh0ID09PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fdGFpbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobm9kZSA9PT0gdGhpcy5fdGFpbCkge1xuICAgICAgICB0aGlzLl90YWlsID0gbm9kZS5fcHJldjtcbiAgICAgICAgdGhpcy5fdGFpbC5fbmV4dCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIG5vZGUuX293bmVyID0gbnVsbDtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2RldGFjaEFsbCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRldGFjaEFsbCgpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5faGVhZDtcbiAgICAgIGlmICghbm9kZSkgcmV0dXJuIHRoaXM7XG5cbiAgICAgIHRoaXMuX2hlYWQgPSB0aGlzLl90YWlsID0gbnVsbDtcblxuICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgbm9kZS5fb3duZXIgPSBudWxsO1xuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNaW5pU2lnbmFsO1xufSkoKTtcblxuTWluaVNpZ25hbC5NaW5pU2lnbmFsQmluZGluZyA9IE1pbmlTaWduYWxCaW5kaW5nO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBNaW5pU2lnbmFsO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZVVSSSAoc3RyLCBvcHRzKSB7XG4gIG9wdHMgPSBvcHRzIHx8IHt9XG5cbiAgdmFyIG8gPSB7XG4gICAga2V5OiBbJ3NvdXJjZScsICdwcm90b2NvbCcsICdhdXRob3JpdHknLCAndXNlckluZm8nLCAndXNlcicsICdwYXNzd29yZCcsICdob3N0JywgJ3BvcnQnLCAncmVsYXRpdmUnLCAncGF0aCcsICdkaXJlY3RvcnknLCAnZmlsZScsICdxdWVyeScsICdhbmNob3InXSxcbiAgICBxOiB7XG4gICAgICBuYW1lOiAncXVlcnlLZXknLFxuICAgICAgcGFyc2VyOiAvKD86XnwmKShbXiY9XSopPT8oW14mXSopL2dcbiAgICB9LFxuICAgIHBhcnNlcjoge1xuICAgICAgc3RyaWN0OiAvXig/OihbXjpcXC8/I10rKTopPyg/OlxcL1xcLygoPzooKFteOkBdKikoPzo6KFteOkBdKikpPyk/QCk/KFteOlxcLz8jXSopKD86OihcXGQqKSk/KSk/KCgoKD86W14/I1xcL10qXFwvKSopKFtePyNdKikpKD86XFw/KFteI10qKSk/KD86IyguKikpPykvLFxuICAgICAgbG9vc2U6IC9eKD86KD8hW146QF0rOlteOkBcXC9dKkApKFteOlxcLz8jLl0rKTopPyg/OlxcL1xcLyk/KCg/OigoW146QF0qKSg/OjooW146QF0qKSk/KT9AKT8oW146XFwvPyNdKikoPzo6KFxcZCopKT8pKCgoXFwvKD86W14/I10oPyFbXj8jXFwvXSpcXC5bXj8jXFwvLl0rKD86Wz8jXXwkKSkpKlxcLz8pPyhbXj8jXFwvXSopKSg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8pL1xuICAgIH1cbiAgfVxuXG4gIHZhciBtID0gby5wYXJzZXJbb3B0cy5zdHJpY3RNb2RlID8gJ3N0cmljdCcgOiAnbG9vc2UnXS5leGVjKHN0cilcbiAgdmFyIHVyaSA9IHt9XG4gIHZhciBpID0gMTRcblxuICB3aGlsZSAoaS0tKSB1cmlbby5rZXlbaV1dID0gbVtpXSB8fCAnJ1xuXG4gIHVyaVtvLnEubmFtZV0gPSB7fVxuICB1cmlbby5rZXlbMTJdXS5yZXBsYWNlKG8ucS5wYXJzZXIsIGZ1bmN0aW9uICgkMCwgJDEsICQyKSB7XG4gICAgaWYgKCQxKSB1cmlbby5xLm5hbWVdWyQxXSA9ICQyXG4gIH0pXG5cbiAgcmV0dXJuIHVyaVxufVxuIiwiaW1wb3J0IFNpZ25hbCBmcm9tICdtaW5pLXNpZ25hbHMnO1xuaW1wb3J0IHBhcnNlVXJpIGZyb20gJ3BhcnNlLXVyaSc7XG5pbXBvcnQgKiBhcyBhc3luYyBmcm9tICcuL2FzeW5jJztcbmltcG9ydCBSZXNvdXJjZSBmcm9tICcuL1Jlc291cmNlJztcblxuLy8gc29tZSBjb25zdGFudHNcbmNvbnN0IE1BWF9QUk9HUkVTUyA9IDEwMDtcbmNvbnN0IHJneEV4dHJhY3RVcmxIYXNoID0gLygjW1xcd1xcLV0rKT8kLztcblxuLyoqXG4gKiBNYW5hZ2VzIHRoZSBzdGF0ZSBhbmQgbG9hZGluZyBvZiBtdWx0aXBsZSByZXNvdXJjZXMgdG8gbG9hZC5cbiAqXG4gKiBAY2xhc3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9hZGVyIHtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2Jhc2VVcmw9JyddIC0gVGhlIGJhc2UgdXJsIGZvciBhbGwgcmVzb3VyY2VzIGxvYWRlZCBieSB0aGlzIGxvYWRlci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2NvbmN1cnJlbmN5PTEwXSAtIFRoZSBudW1iZXIgb2YgcmVzb3VyY2VzIHRvIGxvYWQgY29uY3VycmVudGx5LlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGJhc2VVcmwgPSAnJywgY29uY3VycmVuY3kgPSAxMCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGJhc2UgdXJsIGZvciBhbGwgcmVzb3VyY2VzIGxvYWRlZCBieSB0aGlzIGxvYWRlci5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5iYXNlVXJsID0gYmFzZVVybDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHByb2dyZXNzIHBlcmNlbnQgb2YgdGhlIGxvYWRlciBnb2luZyB0aHJvdWdoIHRoZSBxdWV1ZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIExvYWRpbmcgc3RhdGUgb2YgdGhlIGxvYWRlciwgdHJ1ZSBpZiBpdCBpcyBjdXJyZW50bHkgbG9hZGluZyByZXNvdXJjZXMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQSBxdWVyeXN0cmluZyB0byBhcHBlbmQgdG8gZXZlcnkgVVJMIGFkZGVkIHRvIHRoZSBsb2FkZXIuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoaXMgc2hvdWxkIGJlIGEgdmFsaWQgcXVlcnkgc3RyaW5nICp3aXRob3V0KiB0aGUgcXVlc3Rpb24tbWFyayAoYD9gKS4gVGhlIGxvYWRlciB3aWxsXG4gICAgICAgICAqIGFsc28gKm5vdCogZXNjYXBlIHZhbHVlcyBmb3IgeW91LiBNYWtlIHN1cmUgdG8gZXNjYXBlIHlvdXIgcGFyYW1ldGVycyB3aXRoXG4gICAgICAgICAqIFtgZW5jb2RlVVJJQ29tcG9uZW50YF0oaHR0cHM6Ly9tZG4uaW8vZW5jb2RlVVJJQ29tcG9uZW50KSBiZWZvcmUgYXNzaWduaW5nIHRoaXMgcHJvcGVydHkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqXG4gICAgICAgICAqIGBgYGpzXG4gICAgICAgICAqIGNvbnN0IGxvYWRlciA9IG5ldyBMb2FkZXIoKTtcbiAgICAgICAgICpcbiAgICAgICAgICogbG9hZGVyLmRlZmF1bHRRdWVyeVN0cmluZyA9ICd1c2VyPW1lJnBhc3N3b3JkPXNlY3JldCc7XG4gICAgICAgICAqXG4gICAgICAgICAqIC8vIFRoaXMgd2lsbCByZXF1ZXN0ICdpbWFnZS5wbmc/dXNlcj1tZSZwYXNzd29yZD1zZWNyZXQnXG4gICAgICAgICAqIGxvYWRlci5hZGQoJ2ltYWdlLnBuZycpLmxvYWQoKTtcbiAgICAgICAgICpcbiAgICAgICAgICogbG9hZGVyLnJlc2V0KCk7XG4gICAgICAgICAqXG4gICAgICAgICAqIC8vIFRoaXMgd2lsbCByZXF1ZXN0ICdpbWFnZS5wbmc/dj0xJnVzZXI9bWUmcGFzc3dvcmQ9c2VjcmV0J1xuICAgICAgICAgKiBsb2FkZXIuYWRkKCdpYW1nZS5wbmc/dj0xJykubG9hZCgpO1xuICAgICAgICAgKiBgYGBcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGVmYXVsdFF1ZXJ5U3RyaW5nID0gJyc7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBtaWRkbGV3YXJlIHRvIHJ1biBiZWZvcmUgbG9hZGluZyBlYWNoIHJlc291cmNlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtmdW5jdGlvbltdfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fYmVmb3JlTWlkZGxld2FyZSA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgbWlkZGxld2FyZSB0byBydW4gYWZ0ZXIgbG9hZGluZyBlYWNoIHJlc291cmNlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtmdW5jdGlvbltdfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fYWZ0ZXJNaWRkbGV3YXJlID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBgX2xvYWRSZXNvdXJjZWAgZnVuY3Rpb24gYm91bmQgd2l0aCB0aGlzIG9iamVjdCBjb250ZXh0LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWVtYmVyIHtmdW5jdGlvbn1cbiAgICAgICAgICogQHBhcmFtIHtSZXNvdXJjZX0gciAtIFRoZSByZXNvdXJjZSB0byBsb2FkXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGQgLSBUaGUgZGVxdWV1ZSBmdW5jdGlvblxuICAgICAgICAgKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9ib3VuZExvYWRSZXNvdXJjZSA9IChyLCBkKSA9PiB0aGlzLl9sb2FkUmVzb3VyY2UociwgZCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSByZXNvdXJjZXMgd2FpdGluZyB0byBiZSBsb2FkZWQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBtZW1iZXIge1Jlc291cmNlW119XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9xdWV1ZSA9IGFzeW5jLnF1ZXVlKHRoaXMuX2JvdW5kTG9hZFJlc291cmNlLCBjb25jdXJyZW5jeSk7XG5cbiAgICAgICAgdGhpcy5fcXVldWUucGF1c2UoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQWxsIHRoZSByZXNvdXJjZXMgZm9yIHRoaXMgbG9hZGVyIGtleWVkIGJ5IG5hbWUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge29iamVjdDxzdHJpbmcsIFJlc291cmNlPn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVzb3VyY2VzID0ge307XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc3BhdGNoZWQgb25jZSBwZXIgbG9hZGVkIG9yIGVycm9yZWQgcmVzb3VyY2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoZSBjYWxsYmFjayBsb29rcyBsaWtlIHtAbGluayBMb2FkZXIuT25Qcm9ncmVzc1NpZ25hbH0uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge1NpZ25hbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub25Qcm9ncmVzcyA9IG5ldyBTaWduYWwoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGlzcGF0Y2hlZCBvbmNlIHBlciBlcnJvcmVkIHJlc291cmNlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgY2FsbGJhY2sgbG9va3MgbGlrZSB7QGxpbmsgTG9hZGVyLk9uRXJyb3JTaWduYWx9LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtTaWduYWx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9uRXJyb3IgPSBuZXcgU2lnbmFsKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc3BhdGNoZWQgb25jZSBwZXIgbG9hZGVkIHJlc291cmNlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgY2FsbGJhY2sgbG9va3MgbGlrZSB7QGxpbmsgTG9hZGVyLk9uTG9hZFNpZ25hbH0uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge1NpZ25hbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub25Mb2FkID0gbmV3IFNpZ25hbCgpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNwYXRjaGVkIHdoZW4gdGhlIGxvYWRlciBiZWdpbnMgdG8gcHJvY2VzcyB0aGUgcXVldWUuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoZSBjYWxsYmFjayBsb29rcyBsaWtlIHtAbGluayBMb2FkZXIuT25TdGFydFNpZ25hbH0uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge1NpZ25hbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub25TdGFydCA9IG5ldyBTaWduYWwoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGlzcGF0Y2hlZCB3aGVuIHRoZSBxdWV1ZWQgcmVzb3VyY2VzIGFsbCBsb2FkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgY2FsbGJhY2sgbG9va3MgbGlrZSB7QGxpbmsgTG9hZGVyLk9uQ29tcGxldGVTaWduYWx9LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtTaWduYWx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9uQ29tcGxldGUgPSBuZXcgU2lnbmFsKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZW4gdGhlIHByb2dyZXNzIGNoYW5nZXMgdGhlIGxvYWRlciBhbmQgcmVzb3VyY2UgYXJlIGRpc2FwdGNoZWQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJvZiBMb2FkZXJcbiAgICAgICAgICogQGNhbGxiYWNrIE9uUHJvZ3Jlc3NTaWduYWxcbiAgICAgICAgICogQHBhcmFtIHtMb2FkZXJ9IGxvYWRlciAtIFRoZSBsb2FkZXIgdGhlIHByb2dyZXNzIGlzIGFkdmFuY2luZyBvbi5cbiAgICAgICAgICogQHBhcmFtIHtSZXNvdXJjZX0gcmVzb3VyY2UgLSBUaGUgcmVzb3VyY2UgdGhhdCBoYXMgY29tcGxldGVkIG9yIGZhaWxlZCB0byBjYXVzZSB0aGUgcHJvZ3Jlc3MgdG8gYWR2YW5jZS5cbiAgICAgICAgICovXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZW4gYW4gZXJyb3Igb2NjdXJycyB0aGUgbG9hZGVyIGFuZCByZXNvdXJjZSBhcmUgZGlzYXB0Y2hlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlcm9mIExvYWRlclxuICAgICAgICAgKiBAY2FsbGJhY2sgT25FcnJvclNpZ25hbFxuICAgICAgICAgKiBAcGFyYW0ge0xvYWRlcn0gbG9hZGVyIC0gVGhlIGxvYWRlciB0aGUgZXJyb3IgaGFwcGVuZWQgaW4uXG4gICAgICAgICAqIEBwYXJhbSB7UmVzb3VyY2V9IHJlc291cmNlIC0gVGhlIHJlc291cmNlIHRoYXQgY2F1c2VkIHRoZSBlcnJvci5cbiAgICAgICAgICovXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZW4gYSBsb2FkIGNvbXBsZXRlcyB0aGUgbG9hZGVyIGFuZCByZXNvdXJjZSBhcmUgZGlzYXB0Y2hlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlcm9mIExvYWRlclxuICAgICAgICAgKiBAY2FsbGJhY2sgT25Mb2FkU2lnbmFsXG4gICAgICAgICAqIEBwYXJhbSB7TG9hZGVyfSBsb2FkZXIgLSBUaGUgbG9hZGVyIHRoYXQgbGFvZGVkIHRoZSByZXNvdXJjZS5cbiAgICAgICAgICogQHBhcmFtIHtSZXNvdXJjZX0gcmVzb3VyY2UgLSBUaGUgcmVzb3VyY2UgdGhhdCBoYXMgY29tcGxldGVkIGxvYWRpbmcuXG4gICAgICAgICAqL1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGVuIHRoZSBsb2FkZXIgc3RhcnRzIGxvYWRpbmcgcmVzb3VyY2VzIGl0IGRpc3BhdGNoZXMgdGhpcyBjYWxsYmFjay5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlcm9mIExvYWRlclxuICAgICAgICAgKiBAY2FsbGJhY2sgT25TdGFydFNpZ25hbFxuICAgICAgICAgKiBAcGFyYW0ge0xvYWRlcn0gbG9hZGVyIC0gVGhlIGxvYWRlciB0aGF0IGhhcyBzdGFydGVkIGxvYWRpbmcgcmVzb3VyY2VzLlxuICAgICAgICAgKi9cblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hlbiB0aGUgbG9hZGVyIGNvbXBsZXRlcyBsb2FkaW5nIHJlc291cmNlcyBpdCBkaXNwYXRjaGVzIHRoaXMgY2FsbGJhY2suXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJvZiBMb2FkZXJcbiAgICAgICAgICogQGNhbGxiYWNrIE9uQ29tcGxldGVTaWduYWxcbiAgICAgICAgICogQHBhcmFtIHtMb2FkZXJ9IGxvYWRlciAtIFRoZSBsb2FkZXIgdGhhdCBoYXMgZmluaXNoZWQgbG9hZGluZyByZXNvdXJjZXMuXG4gICAgICAgICAqL1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSByZXNvdXJjZSAob3IgbXVsdGlwbGUgcmVzb3VyY2VzKSB0byB0aGUgbG9hZGVyIHF1ZXVlLlxuICAgICAqXG4gICAgICogVGhpcyBmdW5jdGlvbiBjYW4gdGFrZSBhIHdpZGUgdmFyaWV0eSBvZiBkaWZmZXJlbnQgcGFyYW1ldGVycy4gVGhlIG9ubHkgdGhpbmcgdGhhdCBpcyBhbHdheXNcbiAgICAgKiByZXF1aXJlZCB0aGUgdXJsIHRvIGxvYWQuIEFsbCB0aGUgZm9sbG93aW5nIHdpbGwgd29yazpcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogbG9hZGVyXG4gICAgICogICAgIC8vIG5vcm1hbCBwYXJhbSBzeW50YXhcbiAgICAgKiAgICAgLmFkZCgna2V5JywgJ2h0dHA6Ly8uLi4nLCBmdW5jdGlvbiAoKSB7fSlcbiAgICAgKiAgICAgLmFkZCgnaHR0cDovLy4uLicsIGZ1bmN0aW9uICgpIHt9KVxuICAgICAqICAgICAuYWRkKCdodHRwOi8vLi4uJylcbiAgICAgKlxuICAgICAqICAgICAvLyBvYmplY3Qgc3ludGF4XG4gICAgICogICAgIC5hZGQoe1xuICAgICAqICAgICAgICAgbmFtZTogJ2tleTInLFxuICAgICAqICAgICAgICAgdXJsOiAnaHR0cDovLy4uLidcbiAgICAgKiAgICAgfSwgZnVuY3Rpb24gKCkge30pXG4gICAgICogICAgIC5hZGQoe1xuICAgICAqICAgICAgICAgdXJsOiAnaHR0cDovLy4uLidcbiAgICAgKiAgICAgfSwgZnVuY3Rpb24gKCkge30pXG4gICAgICogICAgIC5hZGQoe1xuICAgICAqICAgICAgICAgbmFtZTogJ2tleTMnLFxuICAgICAqICAgICAgICAgdXJsOiAnaHR0cDovLy4uLidcbiAgICAgKiAgICAgICAgIG9uQ29tcGxldGU6IGZ1bmN0aW9uICgpIHt9XG4gICAgICogICAgIH0pXG4gICAgICogICAgIC5hZGQoe1xuICAgICAqICAgICAgICAgdXJsOiAnaHR0cHM6Ly8uLi4nLFxuICAgICAqICAgICAgICAgb25Db21wbGV0ZTogZnVuY3Rpb24gKCkge30sXG4gICAgICogICAgICAgICBjcm9zc09yaWdpbjogdHJ1ZVxuICAgICAqICAgICB9KVxuICAgICAqXG4gICAgICogICAgIC8vIHlvdSBjYW4gYWxzbyBwYXNzIGFuIGFycmF5IG9mIG9iamVjdHMgb3IgdXJscyBvciBib3RoXG4gICAgICogICAgIC5hZGQoW1xuICAgICAqICAgICAgICAgeyBuYW1lOiAna2V5NCcsIHVybDogJ2h0dHA6Ly8uLi4nLCBvbkNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7fSB9LFxuICAgICAqICAgICAgICAgeyB1cmw6ICdodHRwOi8vLi4uJywgb25Db21wbGV0ZTogZnVuY3Rpb24gKCkge30gfSxcbiAgICAgKiAgICAgICAgICdodHRwOi8vLi4uJ1xuICAgICAqICAgICBdKVxuICAgICAqXG4gICAgICogICAgIC8vIGFuZCB5b3UgY2FuIHVzZSBib3RoIHBhcmFtcyBhbmQgb3B0aW9uc1xuICAgICAqICAgICAuYWRkKCdrZXknLCAnaHR0cDovLy4uLicsIHsgY3Jvc3NPcmlnaW46IHRydWUgfSwgZnVuY3Rpb24gKCkge30pXG4gICAgICogICAgIC5hZGQoJ2h0dHA6Ly8uLi4nLCB7IGNyb3NzT3JpZ2luOiB0cnVlIH0sIGZ1bmN0aW9uICgpIHt9KTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZV0gLSBUaGUgbmFtZSBvZiB0aGUgcmVzb3VyY2UgdG8gbG9hZCwgaWYgbm90IHBhc3NlZCB0aGUgdXJsIGlzIHVzZWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFt1cmxdIC0gVGhlIHVybCBmb3IgdGhpcyByZXNvdXJjZSwgcmVsYXRpdmUgdG8gdGhlIGJhc2VVcmwgb2YgdGhpcyBsb2FkZXIuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAtIFRoZSBvcHRpb25zIGZvciB0aGUgbG9hZC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmNyb3NzT3JpZ2luXSAtIElzIHRoaXMgcmVxdWVzdCBjcm9zcy1vcmlnaW4/IERlZmF1bHQgaXMgdG8gZGV0ZXJtaW5lIGF1dG9tYXRpY2FsbHkuXG4gICAgICogQHBhcmFtIHtSZXNvdXJjZS5MT0FEX1RZUEV9IFtvcHRpb25zLmxvYWRUeXBlPVJlc291cmNlLkxPQURfVFlQRS5YSFJdIC0gSG93IHNob3VsZCB0aGlzIHJlc291cmNlIGJlIGxvYWRlZD9cbiAgICAgKiBAcGFyYW0ge1Jlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFfSBbb3B0aW9ucy54aHJUeXBlPVJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRFRkFVTFRdIC0gSG93IHNob3VsZFxuICAgICAqICAgICAgdGhlIGRhdGEgYmVpbmcgbG9hZGVkIGJlIGludGVycHJldGVkIHdoZW4gdXNpbmcgWEhSP1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5tZXRhZGF0YV0gLSBFeHRyYSBjb25maWd1cmF0aW9uIGZvciBtaWRkbGV3YXJlIGFuZCB0aGUgUmVzb3VyY2Ugb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7SFRNTEltYWdlRWxlbWVudHxIVE1MQXVkaW9FbGVtZW50fEhUTUxWaWRlb0VsZW1lbnR9IFtvcHRpb25zLm1ldGFkYXRhLmxvYWRFbGVtZW50PW51bGxdIC0gVGhlXG4gICAgICogICAgICBlbGVtZW50IHRvIHVzZSBmb3IgbG9hZGluZywgaW5zdGVhZCBvZiBjcmVhdGluZyBvbmUuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5tZXRhZGF0YS5za2lwU291cmNlPWZhbHNlXSAtIFNraXBzIGFkZGluZyBzb3VyY2UocykgdG8gdGhlIGxvYWQgZWxlbWVudC4gVGhpc1xuICAgICAqICAgICAgaXMgdXNlZnVsIGlmIHlvdSB3YW50IHRvIHBhc3MgaW4gYSBgbG9hZEVsZW1lbnRgIHRoYXQgeW91IGFscmVhZHkgYWRkZWQgbG9hZCBzb3VyY2VzIHRvLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYl0gLSBGdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhpcyBzcGVjaWZpYyByZXNvdXJjZSBjb21wbGV0ZXMgbG9hZGluZy5cbiAgICAgKiBAcmV0dXJuIHtMb2FkZXJ9IFJldHVybnMgaXRzZWxmLlxuICAgICAqL1xuICAgIGFkZChuYW1lLCB1cmwsIG9wdGlvbnMsIGNiKSB7XG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZSBvZiBhbiBhcnJheSBvZiBvYmplY3RzIG9yIHVybHNcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkobmFtZSkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkKG5hbWVbaV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGFuIG9iamVjdCBpcyBwYXNzZWQgaW5zdGVhZCBvZiBwYXJhbXNcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgY2IgPSB1cmwgfHwgbmFtZS5jYWxsYmFjayB8fCBuYW1lLm9uQ29tcGxldGU7XG4gICAgICAgICAgICBvcHRpb25zID0gbmFtZTtcbiAgICAgICAgICAgIHVybCA9IG5hbWUudXJsO1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUubmFtZSB8fCBuYW1lLmtleSB8fCBuYW1lLnVybDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhc2Ugd2hlcmUgbm8gbmFtZSBpcyBwYXNzZWQgc2hpZnQgYWxsIGFyZ3Mgb3ZlciBieSBvbmUuXG4gICAgICAgIGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY2IgPSBvcHRpb25zO1xuICAgICAgICAgICAgb3B0aW9ucyA9IHVybDtcbiAgICAgICAgICAgIHVybCA9IG5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBub3cgdGhhdCB3ZSBzaGlmdGVkIG1ha2Ugc3VyZSB3ZSBoYXZlIGEgcHJvcGVyIHVybC5cbiAgICAgICAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHVybCBwYXNzZWQgdG8gYWRkIHJlc291cmNlIHRvIGxvYWRlci4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9wdGlvbnMgYXJlIG9wdGlvbmFsIHNvIHBlb3BsZSBtaWdodCBwYXNzIGEgZnVuY3Rpb24gYW5kIG5vIG9wdGlvbnNcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYiA9IG9wdGlvbnM7XG4gICAgICAgICAgICBvcHRpb25zID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGxvYWRpbmcgYWxyZWFkeSB5b3UgY2FuIG9ubHkgYWRkIHJlc291cmNlcyB0aGF0IGhhdmUgYSBwYXJlbnQuXG4gICAgICAgIGlmICh0aGlzLmxvYWRpbmcgJiYgKCFvcHRpb25zIHx8ICFvcHRpb25zLnBhcmVudFJlc291cmNlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgYWRkIHJlc291cmNlcyB3aGlsZSB0aGUgbG9hZGVyIGlzIHJ1bm5pbmcuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjaGVjayBpZiByZXNvdXJjZSBhbHJlYWR5IGV4aXN0cy5cbiAgICAgICAgaWYgKHRoaXMucmVzb3VyY2VzW25hbWVdKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlc291cmNlIG5hbWVkIFwiJHtuYW1lfVwiIGFscmVhZHkgZXhpc3RzLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIGJhc2UgdXJsIGlmIHRoaXMgaXNuJ3QgYW4gYWJzb2x1dGUgdXJsXG4gICAgICAgIHVybCA9IHRoaXMuX3ByZXBhcmVVcmwodXJsKTtcblxuICAgICAgICAvLyBjcmVhdGUgdGhlIHN0b3JlIHRoZSByZXNvdXJjZVxuICAgICAgICB0aGlzLnJlc291cmNlc1tuYW1lXSA9IG5ldyBSZXNvdXJjZShuYW1lLCB1cmwsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2VzW25hbWVdLm9uQWZ0ZXJNaWRkbGV3YXJlLm9uY2UoY2IpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgbG9hZGluZyBtYWtlIHN1cmUgdG8gYWRqdXN0IHByb2dyZXNzIGNodW5rcyBmb3IgdGhhdCBwYXJlbnQgYW5kIGl0cyBjaGlsZHJlblxuICAgICAgICBpZiAodGhpcy5sb2FkaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFJlc291cmNlO1xuICAgICAgICAgICAgY29uc3QgZnVsbENodW5rID0gcGFyZW50LnByb2dyZXNzQ2h1bmsgKiAocGFyZW50LmNoaWxkcmVuLmxlbmd0aCArIDEpOyAvLyArMSBmb3IgcGFyZW50XG4gICAgICAgICAgICBjb25zdCBlYWNoQ2h1bmsgPSBmdWxsQ2h1bmsgLyAocGFyZW50LmNoaWxkcmVuLmxlbmd0aCArIDIpOyAvLyArMiBmb3IgcGFyZW50ICYgbmV3IGNoaWxkXG5cbiAgICAgICAgICAgIHBhcmVudC5jaGlsZHJlbi5wdXNoKHRoaXMucmVzb3VyY2VzW25hbWVdKTtcbiAgICAgICAgICAgIHBhcmVudC5wcm9ncmVzc0NodW5rID0gZWFjaENodW5rO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcmVudC5jaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHBhcmVudC5jaGlsZHJlbltpXS5wcm9ncmVzc0NodW5rID0gZWFjaENodW5rO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHRoZSByZXNvdXJjZSB0byB0aGUgcXVldWVcbiAgICAgICAgdGhpcy5fcXVldWUucHVzaCh0aGlzLnJlc291cmNlc1tuYW1lXSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCBhIG1pZGRsZXdhcmUgZnVuY3Rpb24gdGhhdCB3aWxsIHJ1biAqYmVmb3JlKiB0aGVcbiAgICAgKiByZXNvdXJjZSBpcyBsb2FkZWQuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGJlZm9yZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIC0gVGhlIG1pZGRsZXdhcmUgZnVuY3Rpb24gdG8gcmVnaXN0ZXIuXG4gICAgICogQHJldHVybiB7TG9hZGVyfSBSZXR1cm5zIGl0c2VsZi5cbiAgICAgKi9cbiAgICBwcmUoZm4pIHtcbiAgICAgICAgdGhpcy5fYmVmb3JlTWlkZGxld2FyZS5wdXNoKGZuKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHVwIGEgbWlkZGxld2FyZSBmdW5jdGlvbiB0aGF0IHdpbGwgcnVuICphZnRlciogdGhlXG4gICAgICogcmVzb3VyY2UgaXMgbG9hZGVkLlxuICAgICAqXG4gICAgICogQGFsaWFzIHVzZVxuICAgICAqIEBtZXRob2QgYWZ0ZXJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiAtIFRoZSBtaWRkbGV3YXJlIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyLlxuICAgICAqIEByZXR1cm4ge0xvYWRlcn0gUmV0dXJucyBpdHNlbGYuXG4gICAgICovXG4gICAgdXNlKGZuKSB7XG4gICAgICAgIHRoaXMuX2FmdGVyTWlkZGxld2FyZS5wdXNoKGZuKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIHF1ZXVlIG9mIHRoZSBsb2FkZXIgdG8gcHJlcGFyZSBmb3IgYSBuZXcgbG9hZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0xvYWRlcn0gUmV0dXJucyBpdHNlbGYuXG4gICAgICovXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xuICAgICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLl9xdWV1ZS5raWxsKCk7XG4gICAgICAgIHRoaXMuX3F1ZXVlLnBhdXNlKCk7XG5cbiAgICAgICAgLy8gYWJvcnQgYWxsIHJlc291cmNlIGxvYWRzXG4gICAgICAgIGZvciAoY29uc3QgayBpbiB0aGlzLnJlc291cmNlcykge1xuICAgICAgICAgICAgY29uc3QgcmVzID0gdGhpcy5yZXNvdXJjZXNba107XG5cbiAgICAgICAgICAgIGlmIChyZXMuX29uTG9hZEJpbmRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXMuX29uTG9hZEJpbmRpbmcuZGV0YWNoKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXMuaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICAgICAgcmVzLmFib3J0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlc291cmNlcyA9IHt9O1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyBsb2FkaW5nIHRoZSBxdWV1ZWQgcmVzb3VyY2VzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gW2NiXSAtIE9wdGlvbmFsIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBib3VuZCB0byB0aGUgYGNvbXBsZXRlYCBldmVudC5cbiAgICAgKiBAcmV0dXJuIHtMb2FkZXJ9IFJldHVybnMgaXRzZWxmLlxuICAgICAqL1xuICAgIGxvYWQoY2IpIHtcbiAgICAgICAgLy8gcmVnaXN0ZXIgY29tcGxldGUgY2FsbGJhY2sgaWYgdGhleSBwYXNzIG9uZVxuICAgICAgICBpZiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLm9uQ29tcGxldGUub25jZShjYik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB0aGUgcXVldWUgaGFzIGFscmVhZHkgc3RhcnRlZCB3ZSBhcmUgZG9uZSBoZXJlXG4gICAgICAgIGlmICh0aGlzLmxvYWRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGlzdHJpYnV0ZSBwcm9ncmVzcyBjaHVua3NcbiAgICAgICAgY29uc3QgY2h1bmsgPSAxMDAgLyB0aGlzLl9xdWV1ZS5fdGFza3MubGVuZ3RoO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fcXVldWUuX3Rhc2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB0aGlzLl9xdWV1ZS5fdGFza3NbaV0uZGF0YS5wcm9ncmVzc0NodW5rID0gY2h1bms7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgbG9hZGluZyBzdGF0ZVxuICAgICAgICB0aGlzLmxvYWRpbmcgPSB0cnVlO1xuXG4gICAgICAgIC8vIG5vdGlmeSBvZiBzdGFydFxuICAgICAgICB0aGlzLm9uU3RhcnQuZGlzcGF0Y2godGhpcyk7XG5cbiAgICAgICAgLy8gc3RhcnQgbG9hZGluZ1xuICAgICAgICB0aGlzLl9xdWV1ZS5yZXN1bWUoKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmVwYXJlcyBhIHVybCBmb3IgdXNhZ2UgYmFzZWQgb24gdGhlIGNvbmZpZ3VyYXRpb24gb2YgdGhpcyBvYmplY3RcbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFRoZSB1cmwgdG8gcHJlcGFyZS5cbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBwcmVwYXJlZCB1cmwuXG4gICAgICovXG4gICAgX3ByZXBhcmVVcmwodXJsKSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZFVybCA9IHBhcnNlVXJpKHVybCwgeyBzdHJpY3RNb2RlOiB0cnVlIH0pO1xuICAgICAgICBsZXQgcmVzdWx0O1xuXG4gICAgICAgIC8vIGFic29sdXRlIHVybCwganVzdCB1c2UgaXQgYXMgaXMuXG4gICAgICAgIGlmIChwYXJzZWRVcmwucHJvdG9jb2wgfHwgIXBhcnNlZFVybC5wYXRoIHx8IHVybC5pbmRleE9mKCcvLycpID09PSAwKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB1cmw7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgYmFzZVVybCBkb2Vzbid0IGVuZCBpbiBzbGFzaCBhbmQgdXJsIGRvZXNuJ3Qgc3RhcnQgd2l0aCBzbGFzaCwgdGhlbiBhZGQgYSBzbGFzaCBpbmJldHdlZW5cbiAgICAgICAgZWxzZSBpZiAodGhpcy5iYXNlVXJsLmxlbmd0aFxuICAgICAgICAgICAgJiYgdGhpcy5iYXNlVXJsLmxhc3RJbmRleE9mKCcvJykgIT09IHRoaXMuYmFzZVVybC5sZW5ndGggLSAxXG4gICAgICAgICAgICAmJiB1cmwuY2hhckF0KDApICE9PSAnLydcbiAgICAgICAgKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBgJHt0aGlzLmJhc2VVcmx9LyR7dXJsfWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0aGlzLmJhc2VVcmwgKyB1cmw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB3ZSBuZWVkIHRvIGFkZCBhIGRlZmF1bHQgcXVlcnlzdHJpbmcsIHRoZXJlIGlzIGEgYml0IG1vcmUgd29ya1xuICAgICAgICBpZiAodGhpcy5kZWZhdWx0UXVlcnlTdHJpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhc2ggPSByZ3hFeHRyYWN0VXJsSGFzaC5leGVjKHJlc3VsdClbMF07XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5zdWJzdHIoMCwgcmVzdWx0Lmxlbmd0aCAtIGhhc2gubGVuZ3RoKTtcblxuICAgICAgICAgICAgaWYgKHJlc3VsdC5pbmRleE9mKCc/JykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGAmJHt0aGlzLmRlZmF1bHRRdWVyeVN0cmluZ31gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IGA/JHt0aGlzLmRlZmF1bHRRdWVyeVN0cmluZ31gO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQgKz0gaGFzaDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZHMgYSBzaW5nbGUgcmVzb3VyY2UuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7UmVzb3VyY2V9IHJlc291cmNlIC0gVGhlIHJlc291cmNlIHRvIGxvYWQuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gZGVxdWV1ZSAtIFRoZSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gd2UgbmVlZCB0byBkZXF1ZXVlIHRoaXMgaXRlbS5cbiAgICAgKi9cbiAgICBfbG9hZFJlc291cmNlKHJlc291cmNlLCBkZXF1ZXVlKSB7XG4gICAgICAgIHJlc291cmNlLl9kZXF1ZXVlID0gZGVxdWV1ZTtcblxuICAgICAgICAvLyBydW4gYmVmb3JlIG1pZGRsZXdhcmVcbiAgICAgICAgYXN5bmMuZWFjaFNlcmllcyhcbiAgICAgICAgICAgIHRoaXMuX2JlZm9yZU1pZGRsZXdhcmUsXG4gICAgICAgICAgICAoZm4sIG5leHQpID0+IHtcbiAgICAgICAgICAgICAgICBmbi5jYWxsKHRoaXMsIHJlc291cmNlLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBiZWZvcmUgbWlkZGxld2FyZSBtYXJrcyB0aGUgcmVzb3VyY2UgYXMgY29tcGxldGUsXG4gICAgICAgICAgICAgICAgICAgIC8vIGJyZWFrIGFuZCBkb24ndCBwcm9jZXNzIGFueSBtb3JlIGJlZm9yZSBtaWRkbGV3YXJlXG4gICAgICAgICAgICAgICAgICAgIG5leHQocmVzb3VyY2UuaXNDb21wbGV0ZSA/IHt9IDogbnVsbCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXNvdXJjZS5pc0NvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uTG9hZChyZXNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS5fb25Mb2FkQmluZGluZyA9IHJlc291cmNlLm9uQ29tcGxldGUub25jZSh0aGlzLl9vbkxvYWQsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS5sb2FkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxlZCBvbmNlIGVhY2ggcmVzb3VyY2UgaGFzIGxvYWRlZC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ29tcGxldGUoKSB7XG4gICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMub25Db21wbGV0ZS5kaXNwYXRjaCh0aGlzLCB0aGlzLnJlc291cmNlcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGVhY2ggdGltZSBhIHJlc291cmNlcyBpcyBsb2FkZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7UmVzb3VyY2V9IHJlc291cmNlIC0gVGhlIHJlc291cmNlIHRoYXQgd2FzIGxvYWRlZFxuICAgICAqL1xuICAgIF9vbkxvYWQocmVzb3VyY2UpIHtcbiAgICAgICAgcmVzb3VyY2UuX29uTG9hZEJpbmRpbmcgPSBudWxsO1xuXG4gICAgICAgIC8vIHJ1biBtaWRkbGV3YXJlLCB0aGlzICptdXN0KiBoYXBwZW4gYmVmb3JlIGRlcXVldWUgc28gc3ViLWFzc2V0cyBnZXQgYWRkZWQgcHJvcGVybHlcbiAgICAgICAgYXN5bmMuZWFjaFNlcmllcyhcbiAgICAgICAgICAgIHRoaXMuX2FmdGVyTWlkZGxld2FyZSxcbiAgICAgICAgICAgIChmbiwgbmV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIGZuLmNhbGwodGhpcywgcmVzb3VyY2UsIG5leHQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvdXJjZS5vbkFmdGVyTWlkZGxld2FyZS5kaXNwYXRjaChyZXNvdXJjZSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzICs9IHJlc291cmNlLnByb2dyZXNzQ2h1bms7XG4gICAgICAgICAgICAgICAgdGhpcy5vblByb2dyZXNzLmRpc3BhdGNoKHRoaXMsIHJlc291cmNlKTtcblxuICAgICAgICAgICAgICAgIGlmIChyZXNvdXJjZS5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IuZGlzcGF0Y2gocmVzb3VyY2UuZXJyb3IsIHRoaXMsIHJlc291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25Mb2FkLmRpc3BhdGNoKHRoaXMsIHJlc291cmNlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhpcyByZXNvdXJjZSBmcm9tIHRoZSBhc3luYyBxdWV1ZVxuICAgICAgICAgICAgICAgIHJlc291cmNlLl9kZXF1ZXVlKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBkbyBjb21wbGV0aW9uIGNoZWNrXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3F1ZXVlLmlkbGUoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2dyZXNzID0gTUFYX1BST0dSRVNTO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cbn1cbiIsImltcG9ydCBwYXJzZVVyaSBmcm9tICdwYXJzZS11cmknO1xuaW1wb3J0IFNpZ25hbCBmcm9tICdtaW5pLXNpZ25hbHMnO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcblxuLy8gdGVzdHMgaXMgQ09SUyBpcyBzdXBwb3J0ZWQgaW4gWEhSLCBpZiBub3Qgd2UgbmVlZCB0byB1c2UgWERSXG5jb25zdCB1c2VYZHIgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpICYmICEhKHdpbmRvdy5YRG9tYWluUmVxdWVzdCAmJiAhKCd3aXRoQ3JlZGVudGlhbHMnIGluIChuZXcgWE1MSHR0cFJlcXVlc3QoKSkpKTtcbmxldCB0ZW1wQW5jaG9yID0gbnVsbDtcblxuLy8gc29tZSBzdGF0dXMgY29uc3RhbnRzXG5jb25zdCBTVEFUVVNfTk9ORSA9IDA7XG5jb25zdCBTVEFUVVNfT0sgPSAyMDA7XG5jb25zdCBTVEFUVVNfRU1QVFkgPSAyMDQ7XG5cbi8vIG5vb3BcbmZ1bmN0aW9uIF9ub29wKCkgeyAvKiBlbXB0eSAqLyB9XG5cbi8qKlxuICogTWFuYWdlcyB0aGUgc3RhdGUgYW5kIGxvYWRpbmcgb2YgYSByZXNvdXJjZSBhbmQgYWxsIGNoaWxkIHJlc291cmNlcy5cbiAqXG4gKiBAY2xhc3NcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzb3VyY2Uge1xuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGxvYWQgdHlwZSB0byBiZSB1c2VkIGZvciBhIHNwZWNpZmljIGV4dGVuc2lvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXh0bmFtZSAtIFRoZSBleHRlbnNpb24gdG8gc2V0IHRoZSB0eXBlIGZvciwgZS5nLiBcInBuZ1wiIG9yIFwiZm50XCJcbiAgICAgKiBAcGFyYW0ge1Jlc291cmNlLkxPQURfVFlQRX0gbG9hZFR5cGUgLSBUaGUgbG9hZCB0eXBlIHRvIHNldCBpdCB0by5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0RXh0ZW5zaW9uTG9hZFR5cGUoZXh0bmFtZSwgbG9hZFR5cGUpIHtcbiAgICAgICAgc2V0RXh0TWFwKFJlc291cmNlLl9sb2FkVHlwZU1hcCwgZXh0bmFtZSwgbG9hZFR5cGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGxvYWQgdHlwZSB0byBiZSB1c2VkIGZvciBhIHNwZWNpZmljIGV4dGVuc2lvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXh0bmFtZSAtIFRoZSBleHRlbnNpb24gdG8gc2V0IHRoZSB0eXBlIGZvciwgZS5nLiBcInBuZ1wiIG9yIFwiZm50XCJcbiAgICAgKiBAcGFyYW0ge1Jlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFfSB4aHJUeXBlIC0gVGhlIHhociB0eXBlIHRvIHNldCBpdCB0by5cbiAgICAgKi9cbiAgICBzdGF0aWMgc2V0RXh0ZW5zaW9uWGhyVHlwZShleHRuYW1lLCB4aHJUeXBlKSB7XG4gICAgICAgIHNldEV4dE1hcChSZXNvdXJjZS5feGhyVHlwZU1hcCwgZXh0bmFtZSwgeGhyVHlwZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgcmVzb3VyY2UgdG8gbG9hZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xzdHJpbmdbXX0gdXJsIC0gVGhlIHVybCBmb3IgdGhpcyByZXNvdXJjZSwgZm9yIGF1ZGlvL3ZpZGVvIGxvYWRzIHlvdSBjYW4gcGFzc1xuICAgICAqICAgICAgYW4gYXJyYXkgb2Ygc291cmNlcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIC0gVGhlIG9wdGlvbnMgZm9yIHRoZSBsb2FkLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGJvb2xlYW59IFtvcHRpb25zLmNyb3NzT3JpZ2luXSAtIElzIHRoaXMgcmVxdWVzdCBjcm9zcy1vcmlnaW4/IERlZmF1bHQgaXMgdG9cbiAgICAgKiAgICAgIGRldGVybWluZSBhdXRvbWF0aWNhbGx5LlxuICAgICAqIEBwYXJhbSB7UmVzb3VyY2UuTE9BRF9UWVBFfSBbb3B0aW9ucy5sb2FkVHlwZT1SZXNvdXJjZS5MT0FEX1RZUEUuWEhSXSAtIEhvdyBzaG91bGQgdGhpcyByZXNvdXJjZVxuICAgICAqICAgICAgYmUgbG9hZGVkP1xuICAgICAqIEBwYXJhbSB7UmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEV9IFtvcHRpb25zLnhoclR5cGU9UmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuREVGQVVMVF0gLSBIb3dcbiAgICAgKiAgICAgIHNob3VsZCB0aGUgZGF0YSBiZWluZyBsb2FkZWQgYmUgaW50ZXJwcmV0ZWQgd2hlbiB1c2luZyBYSFI/XG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLm1ldGFkYXRhXSAtIEV4dHJhIGNvbmZpZ3VyYXRpb24gZm9yIG1pZGRsZXdhcmUgYW5kIHRoZSBSZXNvdXJjZSBvYmplY3QuXG4gICAgICogQHBhcmFtIHtIVE1MSW1hZ2VFbGVtZW50fEhUTUxBdWRpb0VsZW1lbnR8SFRNTFZpZGVvRWxlbWVudH0gW29wdGlvbnMubWV0YWRhdGEubG9hZEVsZW1lbnQ9bnVsbF0gLSBUaGVcbiAgICAgKiAgICAgIGVsZW1lbnQgdG8gdXNlIGZvciBsb2FkaW5nLCBpbnN0ZWFkIG9mIGNyZWF0aW5nIG9uZS5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm1ldGFkYXRhLnNraXBTb3VyY2U9ZmFsc2VdIC0gU2tpcHMgYWRkaW5nIHNvdXJjZShzKSB0byB0aGUgbG9hZCBlbGVtZW50LiBUaGlzXG4gICAgICogICAgICBpcyB1c2VmdWwgaWYgeW91IHdhbnQgdG8gcGFzcyBpbiBhIGBsb2FkRWxlbWVudGAgdGhhdCB5b3UgYWxyZWFkeSBhZGRlZCBsb2FkIHNvdXJjZXMgdG8uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobmFtZSwgdXJsLCBvcHRpb25zKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycgfHwgdHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQm90aCBuYW1lIGFuZCB1cmwgYXJlIHJlcXVpcmVkIGZvciBjb25zdHJ1Y3RpbmcgYSByZXNvdXJjZS4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgc3RhdGUgZmxhZ3Mgb2YgdGhpcyByZXNvdXJjZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZmxhZ3MgPSAwO1xuXG4gICAgICAgIC8vIHNldCBkYXRhIHVybCBmbGFnLCBuZWVkcyB0byBiZSBzZXQgZWFybHkgZm9yIHNvbWUgX2RldGVybWluZVggY2hlY2tzIHRvIHdvcmsuXG4gICAgICAgIHRoaXMuX3NldEZsYWcoUmVzb3VyY2UuU1RBVFVTX0ZMQUdTLkRBVEFfVVJMLCB1cmwuaW5kZXhPZignZGF0YTonKSA9PT0gMCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBuYW1lIG9mIHRoaXMgcmVzb3VyY2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge3N0cmluZ31cbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgdXJsIHVzZWQgdG8gbG9hZCB0aGlzIHJlc291cmNlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtzdHJpbmd9XG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBkYXRhIHRoYXQgd2FzIGxvYWRlZCBieSB0aGUgcmVzb3VyY2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge2FueX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZGF0YSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElzIHRoaXMgcmVxdWVzdCBjcm9zcy1vcmlnaW4/IElmIHVuc2V0LCBkZXRlcm1pbmVkIGF1dG9tYXRpY2FsbHkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY3Jvc3NPcmlnaW4gPSBvcHRpb25zLmNyb3NzT3JpZ2luID09PSB0cnVlID8gJ2Fub255bW91cycgOiBvcHRpb25zLmNyb3NzT3JpZ2luO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgbWV0aG9kIG9mIGxvYWRpbmcgdG8gdXNlIGZvciB0aGlzIHJlc291cmNlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtSZXNvdXJjZS5MT0FEX1RZUEV9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmxvYWRUeXBlID0gb3B0aW9ucy5sb2FkVHlwZSB8fCB0aGlzLl9kZXRlcm1pbmVMb2FkVHlwZSgpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgdHlwZSB1c2VkIHRvIGxvYWQgdGhlIHJlc291cmNlIHZpYSBYSFIuIElmIHVuc2V0LCBkZXRlcm1pbmVkIGF1dG9tYXRpY2FsbHkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMueGhyVHlwZSA9IG9wdGlvbnMueGhyVHlwZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRXh0cmEgaW5mbyBmb3IgbWlkZGxld2FyZSwgYW5kIGNvbnRyb2xsaW5nIHNwZWNpZmljcyBhYm91dCBob3cgdGhlIHJlc291cmNlIGxvYWRzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBOb3RlIHRoYXQgaWYgeW91IHBhc3MgaW4gYSBgbG9hZEVsZW1lbnRgLCB0aGUgUmVzb3VyY2UgY2xhc3MgdGFrZXMgb3duZXJzaGlwIG9mIGl0LlxuICAgICAgICAgKiBNZWFuaW5nIGl0IHdpbGwgbW9kaWZ5IGl0IGFzIGl0IHNlZXMgZml0LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtvYmplY3R9XG4gICAgICAgICAqIEBwcm9wZXJ0eSB7SFRNTEltYWdlRWxlbWVudHxIVE1MQXVkaW9FbGVtZW50fEhUTUxWaWRlb0VsZW1lbnR9IFtsb2FkRWxlbWVudD1udWxsXSAtIFRoZVxuICAgICAgICAgKiAgZWxlbWVudCB0byB1c2UgZm9yIGxvYWRpbmcsIGluc3RlYWQgb2YgY3JlYXRpbmcgb25lLlxuICAgICAgICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IFtza2lwU291cmNlPWZhbHNlXSAtIFNraXBzIGFkZGluZyBzb3VyY2UocykgdG8gdGhlIGxvYWQgZWxlbWVudC4gVGhpc1xuICAgICAgICAgKiAgaXMgdXNlZnVsIGlmIHlvdSB3YW50IHRvIHBhc3MgaW4gYSBgbG9hZEVsZW1lbnRgIHRoYXQgeW91IGFscmVhZHkgYWRkZWQgbG9hZCBzb3VyY2VzXG4gICAgICAgICAqICB0by5cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubWV0YWRhdGEgPSBvcHRpb25zLm1ldGFkYXRhIHx8IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgZXJyb3IgdGhhdCBvY2N1cnJlZCB3aGlsZSBsb2FkaW5nIChpZiBhbnkpLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtFcnJvcn1cbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmVycm9yID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIFhIUiBvYmplY3QgdGhhdCB3YXMgdXNlZCB0byBsb2FkIHRoaXMgcmVzb3VyY2UuIFRoaXMgaXMgb25seSBzZXRcbiAgICAgICAgICogd2hlbiBgbG9hZFR5cGVgIGlzIGBSZXNvdXJjZS5MT0FEX1RZUEUuWEhSYC5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7WE1MSHR0cFJlcXVlc3R9XG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy54aHIgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgY2hpbGQgcmVzb3VyY2VzIHRoaXMgcmVzb3VyY2Ugb3ducy5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7UmVzb3VyY2VbXX1cbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSByZXNvdXJjZSB0eXBlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtSZXNvdXJjZS5UWVBFfVxuICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudHlwZSA9IFJlc291cmNlLlRZUEUuVU5LTk9XTjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHByb2dyZXNzIGNodW5rIG93bmVkIGJ5IHRoaXMgcmVzb3VyY2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge251bWJlcn1cbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnByb2dyZXNzQ2h1bmsgPSAwO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgYGRlcXVldWVgIG1ldGhvZCB0aGF0IHdpbGwgYmUgdXNlZCBhIHN0b3JhZ2UgcGxhY2UgZm9yIHRoZSBhc3luYyBxdWV1ZSBkZXF1ZXVlIG1ldGhvZFxuICAgICAgICAgKiB1c2VkIHByaXZhdGVseSBieSB0aGUgbG9hZGVyLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWVtYmVyIHtmdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2RlcXVldWUgPSBfbm9vcDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVXNlZCBhIHN0b3JhZ2UgcGxhY2UgZm9yIHRoZSBvbiBsb2FkIGJpbmRpbmcgdXNlZCBwcml2YXRlbHkgYnkgdGhlIGxvYWRlci5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1lbWJlciB7ZnVuY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9vbkxvYWRCaW5kaW5nID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGBjb21wbGV0ZWAgZnVuY3Rpb24gYm91bmQgdG8gdGhpcyByZXNvdXJjZSdzIGNvbnRleHQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBtZW1iZXIge2Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fYm91bmRDb21wbGV0ZSA9IHRoaXMuY29tcGxldGUuYmluZCh0aGlzKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGBfb25FcnJvcmAgZnVuY3Rpb24gYm91bmQgdG8gdGhpcyByZXNvdXJjZSdzIGNvbnRleHQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBtZW1iZXIge2Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fYm91bmRPbkVycm9yID0gdGhpcy5fb25FcnJvci5iaW5kKHRoaXMpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgYF9vblByb2dyZXNzYCBmdW5jdGlvbiBib3VuZCB0byB0aGlzIHJlc291cmNlJ3MgY29udGV4dC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1lbWJlciB7ZnVuY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9ib3VuZE9uUHJvZ3Jlc3MgPSB0aGlzLl9vblByb2dyZXNzLmJpbmQodGhpcyk7XG5cbiAgICAgICAgLy8geGhyIGNhbGxiYWNrc1xuICAgICAgICB0aGlzLl9ib3VuZFhock9uRXJyb3IgPSB0aGlzLl94aHJPbkVycm9yLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX2JvdW5kWGhyT25BYm9ydCA9IHRoaXMuX3hock9uQWJvcnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fYm91bmRYaHJPbkxvYWQgPSB0aGlzLl94aHJPbkxvYWQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fYm91bmRYZHJPblRpbWVvdXQgPSB0aGlzLl94ZHJPblRpbWVvdXQuYmluZCh0aGlzKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGlzcGF0Y2hlZCB3aGVuIHRoZSByZXNvdXJjZSBiZWluZ3MgdG8gbG9hZC5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhlIGNhbGxiYWNrIGxvb2tzIGxpa2Uge0BsaW5rIFJlc291cmNlLk9uU3RhcnRTaWduYWx9LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtTaWduYWx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9uU3RhcnQgPSBuZXcgU2lnbmFsKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc3BhdGNoZWQgZWFjaCB0aW1lIHByb2dyZXNzIG9mIHRoaXMgcmVzb3VyY2UgbG9hZCB1cGRhdGVzLlxuICAgICAgICAgKiBOb3QgYWxsIHJlc291cmNlcyB0eXBlcyBhbmQgbG9hZGVyIHN5c3RlbXMgY2FuIHN1cHBvcnQgdGhpcyBldmVudFxuICAgICAgICAgKiBzbyBzb21ldGltZXMgaXQgbWF5IG5vdCBiZSBhdmFpbGFibGUuIElmIHRoZSByZXNvdXJjZVxuICAgICAgICAgKiBpcyBiZWluZyBsb2FkZWQgb24gYSBtb2Rlcm4gYnJvd3NlciwgdXNpbmcgWEhSLCBhbmQgdGhlIHJlbW90ZSBzZXJ2ZXJcbiAgICAgICAgICogcHJvcGVybHkgc2V0cyBDb250ZW50LUxlbmd0aCBoZWFkZXJzLCB0aGVuIHRoaXMgd2lsbCBiZSBhdmFpbGFibGUuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoZSBjYWxsYmFjayBsb29rcyBsaWtlIHtAbGluayBSZXNvdXJjZS5PblByb2dyZXNzU2lnbmFsfS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7U2lnbmFsfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5vblByb2dyZXNzID0gbmV3IFNpZ25hbCgpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNwYXRjaGVkIG9uY2UgdGhpcyByZXNvdXJjZSBoYXMgbG9hZGVkLCBpZiB0aGVyZSB3YXMgYW4gZXJyb3IgaXQgd2lsbFxuICAgICAgICAgKiBiZSBpbiB0aGUgYGVycm9yYCBwcm9wZXJ0eS5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhlIGNhbGxiYWNrIGxvb2tzIGxpa2Uge0BsaW5rIFJlc291cmNlLk9uQ29tcGxldGVTaWduYWx9LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtTaWduYWx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9uQ29tcGxldGUgPSBuZXcgU2lnbmFsKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc3BhdGNoZWQgYWZ0ZXIgdGhpcyByZXNvdXJjZSBoYXMgaGFkIGFsbCB0aGUgKmFmdGVyKiBtaWRkbGV3YXJlIHJ1biBvbiBpdC5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhlIGNhbGxiYWNrIGxvb2tzIGxpa2Uge0BsaW5rIFJlc291cmNlLk9uQ29tcGxldGVTaWduYWx9LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtTaWduYWx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9uQWZ0ZXJNaWRkbGV3YXJlID0gbmV3IFNpZ25hbCgpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGVuIHRoZSByZXNvdXJjZSBzdGFydHMgdG8gbG9hZC5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlcm9mIFJlc291cmNlXG4gICAgICAgICAqIEBjYWxsYmFjayBPblN0YXJ0U2lnbmFsXG4gICAgICAgICAqIEBwYXJhbSB7UmVzb3VyY2V9IHJlc291cmNlIC0gVGhlIHJlc291cmNlIHRoYXQgdGhlIGV2ZW50IGhhcHBlbmVkIG9uLlxuICAgICAgICAgKi9cblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hlbiB0aGUgcmVzb3VyY2UgcmVwb3J0cyBsb2FkaW5nIHByb2dyZXNzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyb2YgUmVzb3VyY2VcbiAgICAgICAgICogQGNhbGxiYWNrIE9uUHJvZ3Jlc3NTaWduYWxcbiAgICAgICAgICogQHBhcmFtIHtSZXNvdXJjZX0gcmVzb3VyY2UgLSBUaGUgcmVzb3VyY2UgdGhhdCB0aGUgZXZlbnQgaGFwcGVuZWQgb24uXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwZXJjZW50YWdlIC0gVGhlIHByb2dyZXNzIG9mIHRoZSBsb2FkIGluIHRoZSByYW5nZSBbMCwgMV0uXG4gICAgICAgICAqL1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGVuIHRoZSByZXNvdXJjZSBmaW5pc2hlcyBsb2FkaW5nLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyb2YgUmVzb3VyY2VcbiAgICAgICAgICogQGNhbGxiYWNrIE9uQ29tcGxldGVTaWduYWxcbiAgICAgICAgICogQHBhcmFtIHtSZXNvdXJjZX0gcmVzb3VyY2UgLSBUaGUgcmVzb3VyY2UgdGhhdCB0aGUgZXZlbnQgaGFwcGVuZWQgb24uXG4gICAgICAgICAqL1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0b3JlcyB3aGV0aGVyIG9yIG5vdCB0aGlzIHVybCBpcyBhIGRhdGEgdXJsLlxuICAgICAqXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cbiAgICAgKiBAcmVhZG9ubHlcbiAgICAgKi9cbiAgICBnZXQgaXNEYXRhVXJsKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFzRmxhZyhSZXNvdXJjZS5TVEFUVVNfRkxBR1MuREFUQV9VUkwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlc2NyaWJlcyBpZiB0aGlzIHJlc291cmNlIGhhcyBmaW5pc2hlZCBsb2FkaW5nLiBJcyB0cnVlIHdoZW4gdGhlIHJlc291cmNlIGhhcyBjb21wbGV0ZWx5XG4gICAgICogbG9hZGVkLlxuICAgICAqXG4gICAgICogQG1lbWJlciB7Ym9vbGVhbn1cbiAgICAgKiBAcmVhZG9ubHlcbiAgICAgKi9cbiAgICBnZXQgaXNDb21wbGV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhc0ZsYWcoUmVzb3VyY2UuU1RBVFVTX0ZMQUdTLkNPTVBMRVRFKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXNjcmliZXMgaWYgdGhpcyByZXNvdXJjZSBpcyBjdXJyZW50bHkgbG9hZGluZy4gSXMgdHJ1ZSB3aGVuIHRoZSByZXNvdXJjZSBzdGFydHMgbG9hZGluZyxcbiAgICAgKiBhbmQgaXMgZmFsc2UgYWdhaW4gd2hlbiBjb21wbGV0ZS5cbiAgICAgKlxuICAgICAqIEBtZW1iZXIge2Jvb2xlYW59XG4gICAgICogQHJlYWRvbmx5XG4gICAgICovXG4gICAgZ2V0IGlzTG9hZGluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhc0ZsYWcoUmVzb3VyY2UuU1RBVFVTX0ZMQUdTLkxPQURJTkcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1hcmtzIHRoZSByZXNvdXJjZSBhcyBjb21wbGV0ZS5cbiAgICAgKlxuICAgICAqL1xuICAgIGNvbXBsZXRlKCkge1xuICAgICAgICAvLyBUT0RPOiBDbGVhbiB0aGlzIHVwIGluIGEgd3JhcHBlciBvciBzb21ldGhpbmcuLi5ncm9zcy4uLi5cbiAgICAgICAgaWYgKHRoaXMuZGF0YSAmJiB0aGlzLmRhdGEucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGhpcy5kYXRhLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fYm91bmRPbkVycm9yLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmRhdGEucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuX2JvdW5kQ29tcGxldGUsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5yZW1vdmVFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIHRoaXMuX2JvdW5kT25Qcm9ncmVzcywgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5kYXRhLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgdGhpcy5fYm91bmRDb21wbGV0ZSwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMueGhyKSB7XG4gICAgICAgICAgICBpZiAodGhpcy54aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgICAgIHRoaXMueGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fYm91bmRYaHJPbkVycm9yLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgdGhpcy54aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCB0aGlzLl9ib3VuZFhock9uQWJvcnQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIHRoaXMuX2JvdW5kT25Qcm9ncmVzcywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRoaXMueGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzLl9ib3VuZFhock9uTG9hZCwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy54aHIub25lcnJvciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy54aHIub250aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnhoci5vbnByb2dyZXNzID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnhoci5vbmxvYWQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNDb21wbGV0ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wbGV0ZSBjYWxsZWQgYWdhaW4gZm9yIGFuIGFscmVhZHkgY29tcGxldGVkIHJlc291cmNlLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2V0RmxhZyhSZXNvdXJjZS5TVEFUVVNfRkxBR1MuQ09NUExFVEUsIHRydWUpO1xuICAgICAgICB0aGlzLl9zZXRGbGFnKFJlc291cmNlLlNUQVRVU19GTEFHUy5MT0FESU5HLCBmYWxzZSk7XG5cbiAgICAgICAgdGhpcy5vbkNvbXBsZXRlLmRpc3BhdGNoKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFib3J0cyB0aGUgbG9hZGluZyBvZiB0aGlzIHJlc291cmNlLCB3aXRoIGFuIG9wdGlvbmFsIG1lc3NhZ2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRvIHVzZSBmb3IgdGhlIGVycm9yXG4gICAgICovXG4gICAgYWJvcnQobWVzc2FnZSkge1xuICAgICAgICAvLyBhYm9ydCBjYW4gYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzLCBpZ25vcmUgc3Vic2VxdWVudCBjYWxscy5cbiAgICAgICAgaWYgKHRoaXMuZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0b3JlIGVycm9yXG4gICAgICAgIHRoaXMuZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG5cbiAgICAgICAgLy8gYWJvcnQgdGhlIGFjdHVhbCBsb2FkaW5nXG4gICAgICAgIGlmICh0aGlzLnhocikge1xuICAgICAgICAgICAgdGhpcy54aHIuYWJvcnQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLnhkcikge1xuICAgICAgICAgICAgdGhpcy54ZHIuYWJvcnQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmRhdGEpIHtcbiAgICAgICAgICAgIC8vIHNpbmdsZSBzb3VyY2VcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGEuc3JjKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhLnNyYyA9IFJlc291cmNlLkVNUFRZX0dJRjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG11bHRpLXNvdXJjZVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuZGF0YS5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5yZW1vdmVDaGlsZCh0aGlzLmRhdGEuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZG9uZSBub3cuXG4gICAgICAgIHRoaXMuY29tcGxldGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBLaWNrcyBvZmYgbG9hZGluZyBvZiB0aGlzIHJlc291cmNlLiBUaGlzIG1ldGhvZCBpcyBhc3luY2hyb25vdXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBbY2JdIC0gT3B0aW9uYWwgY2FsbGJhY2sgdG8gY2FsbCBvbmNlIHRoZSByZXNvdXJjZSBpcyBsb2FkZWQuXG4gICAgICovXG4gICAgbG9hZChjYikge1xuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzQ29tcGxldGUpIHtcbiAgICAgICAgICAgIGlmIChjYikge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gY2IodGhpcyksIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2IpIHtcbiAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZS5vbmNlKGNiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3NldEZsYWcoUmVzb3VyY2UuU1RBVFVTX0ZMQUdTLkxPQURJTkcsIHRydWUpO1xuXG4gICAgICAgIHRoaXMub25TdGFydC5kaXNwYXRjaCh0aGlzKTtcblxuICAgICAgICAvLyBpZiB1bnNldCwgZGV0ZXJtaW5lIHRoZSB2YWx1ZVxuICAgICAgICBpZiAodGhpcy5jcm9zc09yaWdpbiA9PT0gZmFsc2UgfHwgdHlwZW9mIHRoaXMuY3Jvc3NPcmlnaW4gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3NzT3JpZ2luID0gdGhpcy5fZGV0ZXJtaW5lQ3Jvc3NPcmlnaW4odGhpcy51cmwpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLmxvYWRUeXBlKSB7XG4gICAgICAgICAgICBjYXNlIFJlc291cmNlLkxPQURfVFlQRS5JTUFHRTpcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUgPSBSZXNvdXJjZS5UWVBFLklNQUdFO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRFbGVtZW50KCdpbWFnZScpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJlc291cmNlLkxPQURfVFlQRS5BVURJTzpcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUgPSBSZXNvdXJjZS5UWVBFLkFVRElPO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRTb3VyY2VFbGVtZW50KCdhdWRpbycpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJlc291cmNlLkxPQURfVFlQRS5WSURFTzpcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUgPSBSZXNvdXJjZS5UWVBFLlZJREVPO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRTb3VyY2VFbGVtZW50KCd2aWRlbycpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJlc291cmNlLkxPQURfVFlQRS5OT0RFX0hUVFA6XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZEh0dHAoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBSZXNvdXJjZS5MT0FEX1RZUEUuWEhSOlxuICAgICAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgaWYgKHVzZVhkciAmJiB0aGlzLmNyb3NzT3JpZ2luKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRYZHIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRYaHIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGZsYWcgaXMgc2V0LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZmxhZyAtIFRoZSBmbGFnIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIGZsYWcgaXMgc2V0LlxuICAgICAqL1xuICAgIF9oYXNGbGFnKGZsYWcpIHtcbiAgICAgICAgcmV0dXJuICEhKHRoaXMuX2ZsYWdzICYgZmxhZyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogKFVuKVNldHMgdGhlIGZsYWcuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBmbGFnIC0gVGhlIGZsYWcgdG8gKHVuKXNldC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlIC0gV2hldGhlciB0byBzZXQgb3IgKHVuKXNldCB0aGUgZmxhZy5cbiAgICAgKi9cbiAgICBfc2V0RmxhZyhmbGFnLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLl9mbGFncyA9IHZhbHVlID8gKHRoaXMuX2ZsYWdzIHwgZmxhZykgOiAodGhpcy5fZmxhZ3MgJiB+ZmxhZyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGhpcyByZXNvdXJjZXMgdXNpbmcgYW4gZWxlbWVudCB0aGF0IGhhcyBhIHNpbmdsZSBzb3VyY2UsXG4gICAgICogbGlrZSBhbiBIVE1MSW1hZ2VFbGVtZW50LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFRoZSB0eXBlIG9mIGVsZW1lbnQgdG8gdXNlLlxuICAgICAqL1xuICAgIF9sb2FkRWxlbWVudCh0eXBlKSB7XG4gICAgICAgIGlmICh0aGlzLm1ldGFkYXRhLmxvYWRFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLm1ldGFkYXRhLmxvYWRFbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdpbWFnZScgJiYgdHlwZW9mIHdpbmRvdy5JbWFnZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNyb3NzT3JpZ2luKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEuY3Jvc3NPcmlnaW4gPSB0aGlzLmNyb3NzT3JpZ2luO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLm1ldGFkYXRhLnNraXBTb3VyY2UpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5zcmMgPSB0aGlzLnVybDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZGF0YS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2JvdW5kT25FcnJvciwgZmFsc2UpO1xuICAgICAgICB0aGlzLmRhdGEuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuX2JvdW5kQ29tcGxldGUsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5kYXRhLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgdGhpcy5fYm91bmRPblByb2dyZXNzLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGhpcyByZXNvdXJjZXMgdXNpbmcgYW4gZWxlbWVudCB0aGF0IGhhcyBtdWx0aXBsZSBzb3VyY2VzLFxuICAgICAqIGxpa2UgYW4gSFRNTEF1ZGlvRWxlbWVudCBvciBIVE1MVmlkZW9FbGVtZW50LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFRoZSB0eXBlIG9mIGVsZW1lbnQgdG8gdXNlLlxuICAgICAqL1xuICAgIF9sb2FkU291cmNlRWxlbWVudCh0eXBlKSB7XG4gICAgICAgIGlmICh0aGlzLm1ldGFkYXRhLmxvYWRFbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLm1ldGFkYXRhLmxvYWRFbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdhdWRpbycgJiYgdHlwZW9mIHdpbmRvdy5BdWRpbyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBBdWRpbygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmRhdGEgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuYWJvcnQoYFVuc3VwcG9ydGVkIGVsZW1lbnQ6ICR7dHlwZX1gKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLm1ldGFkYXRhLnNraXBTb3VyY2UpIHtcbiAgICAgICAgICAgIC8vIHN1cHBvcnQgZm9yIENvY29vbkpTIENhbnZhcysgcnVudGltZSwgbGFja3MgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc291cmNlJylcbiAgICAgICAgICAgIGlmIChuYXZpZ2F0b3IuaXNDb2Nvb25KUykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5zcmMgPSBBcnJheS5pc0FycmF5KHRoaXMudXJsKSA/IHRoaXMudXJsWzBdIDogdGhpcy51cmw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRoaXMudXJsKSkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy51cmwubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhLmFwcGVuZENoaWxkKHRoaXMuX2NyZWF0ZVNvdXJjZSh0eXBlLCB0aGlzLnVybFtpXSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5hcHBlbmRDaGlsZCh0aGlzLl9jcmVhdGVTb3VyY2UodHlwZSwgdGhpcy51cmwpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZGF0YS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2JvdW5kT25FcnJvciwgZmFsc2UpO1xuICAgICAgICB0aGlzLmRhdGEuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuX2JvdW5kQ29tcGxldGUsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5kYXRhLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgdGhpcy5fYm91bmRPblByb2dyZXNzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZGF0YS5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIHRoaXMuX2JvdW5kQ29tcGxldGUsIGZhbHNlKTtcblxuICAgICAgICB0aGlzLmRhdGEubG9hZCgpO1xuICAgIH1cblxuICAgIF9sb2FkSHR0cCgpIHtcbiAgICAgICAgLy8gaWYgdW5zZXQsIGRldGVybWluZSB0aGUgdmFsdWVcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmh0dHBUeXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhpcy5odHRwVHlwZSA9IHRoaXMuX2RldGVybWluZUh0dHBUeXBlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXEgPSBodHRwLmdldCh0aGlzLnVybCwgKHJlcykgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHVzQ29kZSA9IHJlcy5zdGF0dXNDb2RlO1xuICAgICAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXMuaGVhZGVyc1snY29udGVudC10eXBlJ107XG4gICAgICAgICAgICBjb25zdCBjb250ZW50TGVuZ3RoID0gcmVzLmhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ107XG5cbiAgICAgICAgICAgIGxldCBkYXRhID0gJyc7XG5cbiAgICAgICAgICAgIHJlcy5vbignZGF0YScsIChjaHVuaykgPT4ge1xuICAgICAgICAgICAgICAgIGRhdGEgKz0gY2h1bms7XG5cbiAgICAgICAgICAgICAgICBpZihjb250ZW50TGVuZ3RoICYmIGNvbnRlbnRMZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25Qcm9ncmVzcy5kaXNwYXRjaCh0aGlzLCBkYXRhLmxlbmd0aCAvIGNvbnRlbnRMZW5ndGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXMub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2FkSHR0cENvbXBsZXRlKHJlcywgZGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkub24oJ2Vycm9yJywgKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYWJvcnQoYGh0dHAgUmVxdWVzdCBmYWlsZWQuIFN0YXR1czogJHtyZXEuc3RhdHVzQ29kZX0sIHRleHQ6IFwiJHtlLm1lc3NhZ2V9XCJgKTtcbiAgICAgICAgfSkub24oJ2Fib3J0JywgKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYWJvcnQoYGh0dHAgUmVxdWVzdCBhYm9ydGVkLiBTdGF0dXM6ICR7cmVxLnN0YXR1c0NvZGV9LCB0ZXh0OiBcIiR7ZS5tZXNzYWdlfVwiYCk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgX2xvYWRIdHRwQ29tcGxldGUocmVzLCBkYXRhKSB7XG4gICAgICAgIC8vIHN0YXR1cyBjYW4gYmUgMCB3aGVuIHVzaW5nIHRoZSBgZmlsZTovL2AgcHJvdG9jb2wgc28gd2UgYWxzbyBjaGVjayBpZiBhIHJlc3BvbnNlIGlzIHNldFxuICAgICAgICBjb25zdCBzdGF0dXMgPSByZXMuc3RhdHVzQ29kZTtcblxuICAgICAgICBpZiAoc3RhdHVzID09PSBTVEFUVVNfT0tcbiAgICAgICAgICAgIHx8IHN0YXR1cyA9PT0gU1RBVFVTX0VNUFRZXG4gICAgICAgICAgICB8fCAoc3RhdHVzID09PSBTVEFUVVNfTk9ORSAmJiBkYXRhLmxlbmd0aCA+IDApXG4gICAgICAgICkge1xuICAgICAgICAgICAgLy8gaWYgdGV4dCwganVzdCByZXR1cm4gaXRcbiAgICAgICAgICAgIGlmICh0aGlzLmh0dHBUeXBlID09PSBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5URVhUKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUgPSBSZXNvdXJjZS5UWVBFLlRFWFQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiBqc29uLCBwYXJzZSBpbnRvIGpzb24gb2JqZWN0XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmh0dHBUeXBlID09PSBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5KU09OKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlID0gUmVzb3VyY2UuVFlQRS5KU09OO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFib3J0KGBFcnJvciB0cnlpbmcgdG8gcGFyc2UgbG9hZGVkIGpzb246ICR7ZX1gKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gb3RoZXIgdHlwZXMganVzdCByZXR1cm4gdGhlIHJlc3BvbnNlXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hYm9ydChgWyR7cmVzLnN0YXR1c0NvZGV9XSAke3Jlcy5zdGF0dXNNZXNzYWdlfTogJHt0aGlzLnVybH1gKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb21wbGV0ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWRzIHRoaXMgcmVzb3VyY2VzIHVzaW5nIGFuIFhNTEh0dHBSZXF1ZXN0LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbG9hZFhocigpIHtcbiAgICAgICAgLy8gaWYgdW5zZXQsIGRldGVybWluZSB0aGUgdmFsdWVcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnhoclR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aGlzLnhoclR5cGUgPSB0aGlzLl9kZXRlcm1pbmVYaHJUeXBlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB4aHIgPSB0aGlzLnhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgIC8vIHNldCB0aGUgcmVxdWVzdCB0eXBlIGFuZCB1cmxcbiAgICAgICAgeGhyLm9wZW4oJ0dFVCcsIHRoaXMudXJsLCB0cnVlKTtcblxuICAgICAgICAvLyBsb2FkIGpzb24gYXMgdGV4dCBhbmQgcGFyc2UgaXQgb3Vyc2VsdmVzLiBXZSBkbyB0aGlzIGJlY2F1c2Ugc29tZSBicm93c2Vyc1xuICAgICAgICAvLyAqY291Z2gqIHNhZmFyaSAqY291Z2gqIGNhbid0IGRlYWwgd2l0aCBpdC5cbiAgICAgICAgaWYgKHRoaXMueGhyVHlwZSA9PT0gUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuSlNPTiB8fCB0aGlzLnhoclR5cGUgPT09IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5UKSB7XG4gICAgICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuVEVYVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSB0aGlzLnhoclR5cGU7XG4gICAgICAgIH1cblxuICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLl9ib3VuZFhock9uRXJyb3IsIGZhbHNlKTtcbiAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgdGhpcy5fYm91bmRYaHJPbkFib3J0LCBmYWxzZSk7XG4gICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIHRoaXMuX2JvdW5kT25Qcm9ncmVzcywgZmFsc2UpO1xuICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuX2JvdW5kWGhyT25Mb2FkLCBmYWxzZSk7XG5cbiAgICAgICAgeGhyLnNlbmQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyB0aGlzIHJlc291cmNlcyB1c2luZyBhbiBYRG9tYWluUmVxdWVzdC4gVGhpcyBpcyBoZXJlIGJlY2F1c2Ugd2UgbmVlZCB0byBzdXBwb3J0IElFOSAoZ3Jvc3MpLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfbG9hZFhkcigpIHtcbiAgICAgICAgLy8gaWYgdW5zZXQsIGRldGVybWluZSB0aGUgdmFsdWVcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnhoclR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aGlzLnhoclR5cGUgPSB0aGlzLl9kZXRlcm1pbmVYaHJUeXBlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB4ZHIgPSB0aGlzLnhociA9IG5ldyBYRG9tYWluUmVxdWVzdCgpO1xuXG4gICAgICAgIC8vIFhEb21haW5SZXF1ZXN0IGhhcyBhIGZldyBxdWlya3MuIE9jY2FzaW9uYWxseSBpdCB3aWxsIGFib3J0IHJlcXVlc3RzXG4gICAgICAgIC8vIEEgd2F5IHRvIGF2b2lkIHRoaXMgaXMgdG8gbWFrZSBzdXJlIEFMTCBjYWxsYmFja3MgYXJlIHNldCBldmVuIGlmIG5vdCB1c2VkXG4gICAgICAgIC8vIE1vcmUgaW5mbyBoZXJlOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1Nzg2OTY2L3hkb21haW5yZXF1ZXN0LWFib3J0cy1wb3N0LW9uLWllLTlcbiAgICAgICAgeGRyLnRpbWVvdXQgPSA1MDAwO1xuXG4gICAgICAgIHhkci5vbmVycm9yID0gdGhpcy5fYm91bmRYaHJPbkVycm9yO1xuICAgICAgICB4ZHIub250aW1lb3V0ID0gdGhpcy5fYm91bmRYZHJPblRpbWVvdXQ7XG4gICAgICAgIHhkci5vbnByb2dyZXNzID0gdGhpcy5fYm91bmRPblByb2dyZXNzO1xuICAgICAgICB4ZHIub25sb2FkID0gdGhpcy5fYm91bmRYaHJPbkxvYWQ7XG5cbiAgICAgICAgeGRyLm9wZW4oJ0dFVCcsIHRoaXMudXJsLCB0cnVlKTtcblxuICAgICAgICAvLyBOb3RlOiBUaGUgeGRyLnNlbmQoKSBjYWxsIGlzIHdyYXBwZWQgaW4gYSB0aW1lb3V0IHRvIHByZXZlbnQgYW5cbiAgICAgICAgLy8gaXNzdWUgd2l0aCB0aGUgaW50ZXJmYWNlIHdoZXJlIHNvbWUgcmVxdWVzdHMgYXJlIGxvc3QgaWYgbXVsdGlwbGVcbiAgICAgICAgLy8gWERvbWFpblJlcXVlc3RzIGFyZSBiZWluZyBzZW50IGF0IHRoZSBzYW1lIHRpbWUuXG4gICAgICAgIC8vIFNvbWUgaW5mbyBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vcGhvdG9uc3Rvcm0vcGhhc2VyL2lzc3Vlcy8xMjQ4XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4geGRyLnNlbmQoKSwgMSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHNvdXJjZSB1c2VkIGluIGxvYWRpbmcgdmlhIGFuIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVGhlIGVsZW1lbnQgdHlwZSAodmlkZW8gb3IgYXVkaW8pLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSBUaGUgc291cmNlIFVSTCB0byBsb2FkIGZyb20uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFttaW1lXSAtIFRoZSBtaW1lIHR5cGUgb2YgdGhlIHZpZGVvXG4gICAgICogQHJldHVybiB7SFRNTFNvdXJjZUVsZW1lbnR9IFRoZSBzb3VyY2UgZWxlbWVudC5cbiAgICAgKi9cbiAgICBfY3JlYXRlU291cmNlKHR5cGUsIHVybCwgbWltZSkge1xuICAgICAgICBpZiAoIW1pbWUpIHtcbiAgICAgICAgICAgIG1pbWUgPSBgJHt0eXBlfS8ke3VybC5zdWJzdHIodXJsLmxhc3RJbmRleE9mKCcuJykgKyAxKX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc291cmNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc291cmNlJyk7XG5cbiAgICAgICAgc291cmNlLnNyYyA9IHVybDtcbiAgICAgICAgc291cmNlLnR5cGUgPSBtaW1lO1xuXG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGlmIGEgbG9hZCBlcnJvcnMgb3V0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSBUaGUgZXJyb3IgZXZlbnQgZnJvbSB0aGUgZWxlbWVudCB0aGF0IGVtaXRzIGl0LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uRXJyb3IoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5hYm9ydChgRmFpbGVkIHRvIGxvYWQgZWxlbWVudCB1c2luZzogJHtldmVudC50YXJnZXQubm9kZU5hbWV9YCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGlmIGEgbG9hZCBwcm9ncmVzcyBldmVudCBmaXJlcyBmb3IgeGhyL3hkci5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtYTUxIdHRwUmVxdWVzdFByb2dyZXNzRXZlbnR8RXZlbnR9IGV2ZW50IC0gUHJvZ3Jlc3MgZXZlbnQuXG4gICAgICovXG4gICAgX29uUHJvZ3Jlc3MoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50ICYmIGV2ZW50Lmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICAgIHRoaXMub25Qcm9ncmVzcy5kaXNwYXRjaCh0aGlzLCBldmVudC5sb2FkZWQgLyBldmVudC50b3RhbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgaWYgYW4gZXJyb3IgZXZlbnQgZmlyZXMgZm9yIHhoci94ZHIuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3RFcnJvckV2ZW50fEV2ZW50fSBldmVudCAtIEVycm9yIGV2ZW50LlxuICAgICAqL1xuICAgIF94aHJPbkVycm9yKCkge1xuICAgICAgICBjb25zdCB4aHIgPSB0aGlzLnhocjtcblxuICAgICAgICB0aGlzLmFib3J0KGAke3JlcVR5cGUoeGhyKX0gUmVxdWVzdCBmYWlsZWQuIFN0YXR1czogJHt4aHIuc3RhdHVzfSwgdGV4dDogXCIke3hoci5zdGF0dXNUZXh0fVwiYCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGlmIGFuIGFib3J0IGV2ZW50IGZpcmVzIGZvciB4aHIuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3RBYm9ydEV2ZW50fSBldmVudCAtIEFib3J0IEV2ZW50XG4gICAgICovXG4gICAgX3hock9uQWJvcnQoKSB7XG4gICAgICAgIHRoaXMuYWJvcnQoYCR7cmVxVHlwZSh0aGlzLnhocil9IFJlcXVlc3Qgd2FzIGFib3J0ZWQgYnkgdGhlIHVzZXIuYCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGlmIGEgdGltZW91dCBldmVudCBmaXJlcyBmb3IgeGRyLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIFRpbWVvdXQgZXZlbnQuXG4gICAgICovXG4gICAgX3hkck9uVGltZW91dCgpIHtcbiAgICAgICAgdGhpcy5hYm9ydChgJHtyZXFUeXBlKHRoaXMueGhyKX0gUmVxdWVzdCB0aW1lZCBvdXQuYCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gZGF0YSBzdWNjZXNzZnVsbHkgbG9hZHMgZnJvbSBhbiB4aHIveGRyIHJlcXVlc3QuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3RMb2FkRXZlbnR8RXZlbnR9IGV2ZW50IC0gTG9hZCBldmVudFxuICAgICAqL1xuICAgIF94aHJPbkxvYWQoKSB7XG4gICAgICAgIGNvbnN0IHhociA9IHRoaXMueGhyO1xuICAgICAgICBjb25zdCBzdGF0dXMgPSB0eXBlb2YgeGhyLnN0YXR1cyA9PT0gJ3VuZGVmaW5lZCcgPyB4aHIuc3RhdHVzIDogU1RBVFVTX09LOyAvLyBYRFIgaGFzIG5vIGAuc3RhdHVzYCwgYXNzdW1lIDIwMC5cblxuICAgICAgICAvLyBzdGF0dXMgY2FuIGJlIDAgd2hlbiB1c2luZyB0aGUgYGZpbGU6Ly9gIHByb3RvY29sIHNvIHdlIGFsc28gY2hlY2sgaWYgYSByZXNwb25zZSBpcyBzZXRcbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gU1RBVFVTX09LXG4gICAgICAgICAgICB8fCBzdGF0dXMgPT09IFNUQVRVU19FTVBUWVxuICAgICAgICAgICAgfHwgKHN0YXR1cyA9PT0gU1RBVFVTX05PTkUgJiYgeGhyLnJlc3BvbnNlVGV4dC5sZW5ndGggPiAwKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIGlmIHRleHQsIGp1c3QgcmV0dXJuIGl0XG4gICAgICAgICAgICBpZiAodGhpcy54aHJUeXBlID09PSBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5URVhUKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUgPSBSZXNvdXJjZS5UWVBFLlRFWFQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiBqc29uLCBwYXJzZSBpbnRvIGpzb24gb2JqZWN0XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLnhoclR5cGUgPT09IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkpTT04pIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUgPSBSZXNvdXJjZS5UWVBFLkpTT047XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWJvcnQoYEVycm9yIHRyeWluZyB0byBwYXJzZSBsb2FkZWQganNvbjogJHtlfWApO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiB4bWwsIHBhcnNlIGludG8gYW4geG1sIGRvY3VtZW50IG9yIGRpdiBlbGVtZW50XG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLnhoclR5cGUgPT09IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5UKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5ET01QYXJzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbXBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gZG9tcGFyc2VyLnBhcnNlRnJvbVN0cmluZyh4aHIucmVzcG9uc2VUZXh0LCAndGV4dC94bWwnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXYuaW5uZXJIVE1MID0geGhyLnJlc3BvbnNlVGV4dDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gZGl2O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlID0gUmVzb3VyY2UuVFlQRS5YTUw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWJvcnQoYEVycm9yIHRyeWluZyB0byBwYXJzZSBsb2FkZWQgeG1sOiAke2V9YCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG90aGVyIHR5cGVzIGp1c3QgcmV0dXJuIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0geGhyLnJlc3BvbnNlIHx8IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFib3J0KGBbJHt4aHIuc3RhdHVzfV0gJHt4aHIuc3RhdHVzVGV4dH06ICR7eGhyLnJlc3BvbnNlVVJMfWApO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbXBsZXRlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYGNyb3NzT3JpZ2luYCBwcm9wZXJ0eSBmb3IgdGhpcyByZXNvdXJjZSBiYXNlZCBvbiBpZiB0aGUgdXJsXG4gICAgICogZm9yIHRoaXMgcmVzb3VyY2UgaXMgY3Jvc3Mtb3JpZ2luLiBJZiBjcm9zc09yaWdpbiB3YXMgbWFudWFsbHkgc2V0LCB0aGlzXG4gICAgICogZnVuY3Rpb24gZG9lcyBub3RoaW5nLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gVGhlIHVybCB0byB0ZXN0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbbG9jPXdpbmRvdy5sb2NhdGlvbl0gLSBUaGUgbG9jYXRpb24gb2JqZWN0IHRvIHRlc3QgYWdhaW5zdC5cbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBjcm9zc09yaWdpbiB2YWx1ZSB0byB1c2UgKG9yIGVtcHR5IHN0cmluZyBmb3Igbm9uZSkuXG4gICAgICovXG4gICAgX2RldGVybWluZUNyb3NzT3JpZ2luKHVybCwgbG9jKSB7XG4gICAgICAgIC8vIGRhdGE6IGFuZCBqYXZhc2NyaXB0OiB1cmxzIGFyZSBjb25zaWRlcmVkIHNhbWUtb3JpZ2luXG4gICAgICAgIGlmICh1cmwuaW5kZXhPZignZGF0YTonKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGVmYXVsdCBpcyB3aW5kb3cubG9jYXRpb25cbiAgICAgICAgbG9jID0gbG9jIHx8ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubG9jYXRpb24pO1xuXG4gICAgICAgIGlmICghdGVtcEFuY2hvcikge1xuICAgICAgICAgICAgdGVtcEFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGxldCB0aGUgYnJvd3NlciBkZXRlcm1pbmUgdGhlIGZ1bGwgaHJlZiBmb3IgdGhlIHVybCBvZiB0aGlzIHJlc291cmNlIGFuZCB0aGVuXG4gICAgICAgIC8vIHBhcnNlIHdpdGggdGhlIG5vZGUgdXJsIGxpYiwgd2UgY2FuJ3QgdXNlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBhbmNob3IgZWxlbWVudFxuICAgICAgICAvLyBiZWNhdXNlIHRoZXkgZG9uJ3Qgd29yayBpbiBJRTkgOihcbiAgICAgICAgdGVtcEFuY2hvci5ocmVmID0gdXJsO1xuICAgICAgICB1cmwgPSBwYXJzZVVyaSh0ZW1wQW5jaG9yLmhyZWYsIHsgc3RyaWN0TW9kZTogdHJ1ZSB9KTtcblxuICAgICAgICBjb25zdCBzYW1lUG9ydCA9ICghdXJsLnBvcnQgJiYgbG9jLnBvcnQgPT09ICcnKSB8fCAodXJsLnBvcnQgPT09IGxvYy5wb3J0KTtcbiAgICAgICAgY29uc3QgcHJvdG9jb2wgPSB1cmwucHJvdG9jb2wgPyBgJHt1cmwucHJvdG9jb2x9OmAgOiAnJztcblxuICAgICAgICAvLyBpZiBjcm9zcyBvcmlnaW5cbiAgICAgICAgaWYgKHVybC5ob3N0ICE9PSBsb2MuaG9zdG5hbWUgfHwgIXNhbWVQb3J0IHx8IHByb3RvY29sICE9PSBsb2MucHJvdG9jb2wpIHtcbiAgICAgICAgICAgIHJldHVybiAnYW5vbnltb3VzJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBfZGV0ZXJtaW5lSHR0cFR5cGUoKSB7XG4gICAgICAgIHJldHVybiBSZXNvdXJjZS5feGhyVHlwZU1hcFt0aGlzLl9nZXRFeHRlbnNpb24oKV0gfHwgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuVEVYVDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHRoZSByZXNwb25zZVR5cGUgb2YgYW4gWEhSIHJlcXVlc3QgYmFzZWQgb24gdGhlIGV4dGVuc2lvbiBvZiB0aGVcbiAgICAgKiByZXNvdXJjZSBiZWluZyBsb2FkZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm4ge1Jlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFfSBUaGUgcmVzcG9uc2VUeXBlIHRvIHVzZS5cbiAgICAgKi9cbiAgICBfZGV0ZXJtaW5lWGhyVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIFJlc291cmNlLl94aHJUeXBlTWFwW3RoaXMuX2dldEV4dGVuc2lvbigpXSB8fCBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5URVhUO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgdGhlIGxvYWRUeXBlIG9mIGEgcmVzb3VyY2UgYmFzZWQgb24gdGhlIGV4dGVuc2lvbiBvZiB0aGVcbiAgICAgKiByZXNvdXJjZSBiZWluZyBsb2FkZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm4ge1Jlc291cmNlLkxPQURfVFlQRX0gVGhlIGxvYWRUeXBlIHRvIHVzZS5cbiAgICAgKi9cbiAgICBfZGV0ZXJtaW5lTG9hZFR5cGUoKSB7XG4gICAgICAgIHJldHVybiBSZXNvdXJjZS5fbG9hZFR5cGVNYXBbdGhpcy5fZ2V0RXh0ZW5zaW9uKCldIHx8IFJlc291cmNlLkxPQURfVFlQRS5YSFI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXh0cmFjdHMgdGhlIGV4dGVuc2lvbiAoc2FucyAnLicpIG9mIHRoZSBmaWxlIGJlaW5nIGxvYWRlZCBieSB0aGUgcmVzb3VyY2UuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGV4dGVuc2lvbi5cbiAgICAgKi9cbiAgICBfZ2V0RXh0ZW5zaW9uKCkge1xuICAgICAgICBsZXQgdXJsID0gdGhpcy51cmw7XG4gICAgICAgIGxldCBleHQgPSAnJztcblxuICAgICAgICBpZiAodGhpcy5pc0RhdGFVcmwpIHtcbiAgICAgICAgICAgIGNvbnN0IHNsYXNoSW5kZXggPSB1cmwuaW5kZXhPZignLycpO1xuXG4gICAgICAgICAgICBleHQgPSB1cmwuc3Vic3RyaW5nKHNsYXNoSW5kZXggKyAxLCB1cmwuaW5kZXhPZignOycsIHNsYXNoSW5kZXgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5U3RhcnQgPSB1cmwuaW5kZXhPZignPycpO1xuXG4gICAgICAgICAgICBpZiAocXVlcnlTdGFydCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwuc3Vic3RyaW5nKDAsIHF1ZXJ5U3RhcnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBleHQgPSB1cmwuc3Vic3RyaW5nKHVybC5sYXN0SW5kZXhPZignLicpICsgMSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB0aGUgbWltZSB0eXBlIG9mIGFuIFhIUiByZXF1ZXN0IGJhc2VkIG9uIHRoZSByZXNwb25zZVR5cGUgb2ZcbiAgICAgKiByZXNvdXJjZSBiZWluZyBsb2FkZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7UmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEV9IHR5cGUgLSBUaGUgdHlwZSB0byBnZXQgYSBtaW1lIHR5cGUgZm9yLlxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIG1pbWUgdHlwZSB0byB1c2UuXG4gICAgICovXG4gICAgX2dldE1pbWVGcm9tWGhyVHlwZSh0eXBlKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5CVUZGRVI6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdhcHBsaWNhdGlvbi9vY3RldC1iaW5hcnknO1xuXG4gICAgICAgICAgICBjYXNlIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkJMT0I6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdhcHBsaWNhdGlvbi9ibG9iJztcblxuICAgICAgICAgICAgY2FzZSBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5ET0NVTUVOVDpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2FwcGxpY2F0aW9uL3htbCc7XG5cbiAgICAgICAgICAgIGNhc2UgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuSlNPTjpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2FwcGxpY2F0aW9uL2pzb24nO1xuXG4gICAgICAgICAgICBjYXNlIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRFRkFVTFQ6XG4gICAgICAgICAgICBjYXNlIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLlRFWFQ6XG4gICAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3RleHQvcGxhaW4nO1xuXG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogVGhlIHR5cGVzIG9mIHJlc291cmNlcyBhIHJlc291cmNlIGNvdWxkIHJlcHJlc2VudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAcmVhZG9ubHlcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblJlc291cmNlLlNUQVRVU19GTEFHUyA9IHtcbiAgICBOT05FOiAgICAgICAwLFxuICAgIERBVEFfVVJMOiAgICgxIDw8IDApLFxuICAgIENPTVBMRVRFOiAgICgxIDw8IDEpLFxuICAgIExPQURJTkc6ICAgICgxIDw8IDIpLFxufTtcblxuLyoqXG4gKiBUaGUgdHlwZXMgb2YgcmVzb3VyY2VzIGEgcmVzb3VyY2UgY291bGQgcmVwcmVzZW50LlxuICpcbiAqIEBzdGF0aWNcbiAqIEByZWFkb25seVxuICogQGVudW0ge251bWJlcn1cbiAqL1xuUmVzb3VyY2UuVFlQRSA9IHtcbiAgICBVTktOT1dOOiAgICAwLFxuICAgIEpTT046ICAgICAgIDEsXG4gICAgWE1MOiAgICAgICAgMixcbiAgICBJTUFHRTogICAgICAzLFxuICAgIEFVRElPOiAgICAgIDQsXG4gICAgVklERU86ICAgICAgNSxcbiAgICBURVhUOiAgICAgICA2LFxufTtcblxuLyoqXG4gKiBUaGUgdHlwZXMgb2YgbG9hZGluZyBhIHJlc291cmNlIGNhbiB1c2UuXG4gKlxuICogQHN0YXRpY1xuICogQHJlYWRvbmx5XG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5SZXNvdXJjZS5MT0FEX1RZUEUgPSB7XG4gICAgLyoqIFVzZXMgWE1MSHR0cFJlcXVlc3QgdG8gbG9hZCB0aGUgcmVzb3VyY2UuICovXG4gICAgWEhSOiAgICAxLFxuICAgIC8qKiBVc2VzIGFuIGBJbWFnZWAgb2JqZWN0IHRvIGxvYWQgdGhlIHJlc291cmNlLiAqL1xuICAgIElNQUdFOiAgMixcbiAgICAvKiogVXNlcyBhbiBgQXVkaW9gIG9iamVjdCB0byBsb2FkIHRoZSByZXNvdXJjZS4gKi9cbiAgICBBVURJTzogIDMsXG4gICAgLyoqIFVzZXMgYSBgVmlkZW9gIG9iamVjdCB0byBsb2FkIHRoZSByZXNvdXJjZS4gKi9cbiAgICBWSURFTzogIDQsXG4gICAgLyoqIFVzZXMgbm9kZSdzIEhUVFAgZ2V0IHRvIGxvYWQgdGhlIHJlc291cmNlLiAqL1xuICAgIE5PREVfSFRUUDogNVxufTtcblxuLyoqXG4gKiBUaGUgWEhSIHJlYWR5IHN0YXRlcywgdXNlZCBpbnRlcm5hbGx5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEByZWFkb25seVxuICogQGVudW0ge3N0cmluZ31cbiAqL1xuUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUgPSB7XG4gICAgLyoqIHN0cmluZyAqL1xuICAgIERFRkFVTFQ6ICAgICd0ZXh0JyxcbiAgICAvKiogQXJyYXlCdWZmZXIgKi9cbiAgICBCVUZGRVI6ICAgICAnYXJyYXlidWZmZXInLFxuICAgIC8qKiBCbG9iICovXG4gICAgQkxPQjogICAgICAgJ2Jsb2InLFxuICAgIC8qKiBEb2N1bWVudCAqL1xuICAgIERPQ1VNRU5UOiAgICdkb2N1bWVudCcsXG4gICAgLyoqIE9iamVjdCAqL1xuICAgIEpTT046ICAgICAgICdqc29uJyxcbiAgICAvKiogU3RyaW5nICovXG4gICAgVEVYVDogICAgICAgJ3RleHQnLFxufTtcblxuUmVzb3VyY2UuX2xvYWRUeXBlTWFwID0ge1xuICAgIC8vIGltYWdlc1xuICAgIGdpZjogICAgICAgIFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICBwbmc6ICAgICAgICBSZXNvdXJjZS5MT0FEX1RZUEUuSU1BR0UsXG4gICAgYm1wOiAgICAgICAgUmVzb3VyY2UuTE9BRF9UWVBFLklNQUdFLFxuICAgIGpwZzogICAgICAgIFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICBqcGVnOiAgICAgICBSZXNvdXJjZS5MT0FEX1RZUEUuSU1BR0UsXG4gICAgdGlmOiAgICAgICAgUmVzb3VyY2UuTE9BRF9UWVBFLklNQUdFLFxuICAgIHRpZmY6ICAgICAgIFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICB3ZWJwOiAgICAgICBSZXNvdXJjZS5MT0FEX1RZUEUuSU1BR0UsXG4gICAgdGdhOiAgICAgICAgUmVzb3VyY2UuTE9BRF9UWVBFLklNQUdFLFxuICAgIHN2ZzogICAgICAgIFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICAnc3ZnK3htbCc6ICBSZXNvdXJjZS5MT0FEX1RZUEUuSU1BR0UsIC8vIGZvciBTVkcgZGF0YSB1cmxzXG5cbiAgICAvLyBhdWRpb1xuICAgIG1wMzogICAgICAgIFJlc291cmNlLkxPQURfVFlQRS5BVURJTyxcbiAgICBvZ2c6ICAgICAgICBSZXNvdXJjZS5MT0FEX1RZUEUuQVVESU8sXG4gICAgd2F2OiAgICAgICAgUmVzb3VyY2UuTE9BRF9UWVBFLkFVRElPLFxuXG4gICAgLy8gdmlkZW9zXG4gICAgbXA0OiAgICAgICAgUmVzb3VyY2UuTE9BRF9UWVBFLlZJREVPLFxuICAgIHdlYm06ICAgICAgIFJlc291cmNlLkxPQURfVFlQRS5WSURFTyxcbn07XG5cblJlc291cmNlLl94aHJUeXBlTWFwID0ge1xuICAgIC8vIHhtbFxuICAgIHhodG1sOiAgICAgIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5ULFxuICAgIGh0bWw6ICAgICAgIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5ULFxuICAgIGh0bTogICAgICAgIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5ULFxuICAgIHhtbDogICAgICAgIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5ULFxuICAgIHRteDogICAgICAgIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5ULFxuICAgIHN2ZzogICAgICAgIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5ULFxuXG4gICAgLy8gVGhpcyB3YXMgYWRkZWQgdG8gaGFuZGxlIFRpbGVkIFRpbGVzZXQgWE1MLCBidXQgLnRzeCBpcyBhbHNvIGEgVHlwZVNjcmlwdCBSZWFjdCBDb21wb25lbnQuXG4gICAgLy8gU2luY2UgaXQgaXMgd2F5IGxlc3MgbGlrZWx5IGZvciBwZW9wbGUgdG8gYmUgbG9hZGluZyBUeXBlU2NyaXB0IGZpbGVzIGluc3RlYWQgb2YgVGlsZWQgZmlsZXMsXG4gICAgLy8gdGhpcyBzaG91bGQgcHJvYmFibHkgYmUgZmluZS5cbiAgICB0c3g6ICAgICAgICBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5ET0NVTUVOVCxcblxuICAgIC8vIGltYWdlc1xuICAgIGdpZjogICAgICAgIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkJMT0IsXG4gICAgcG5nOiAgICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcbiAgICBibXA6ICAgICAgICBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5CTE9CLFxuICAgIGpwZzogICAgICAgIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkJMT0IsXG4gICAganBlZzogICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcbiAgICB0aWY6ICAgICAgICBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5CTE9CLFxuICAgIHRpZmY6ICAgICAgIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkJMT0IsXG4gICAgd2VicDogICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcbiAgICB0Z2E6ICAgICAgICBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5CTE9CLFxuXG4gICAgLy8ganNvblxuICAgIGpzb246ICAgICAgIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkpTT04sXG5cbiAgICAvLyB0ZXh0XG4gICAgdGV4dDogICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuVEVYVCxcbiAgICB0eHQ6ICAgICAgICBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5URVhULFxuXG4gICAgLy8gZm9udHNcbiAgICB0dGY6ICAgICAgICBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5CVUZGRVIsXG4gICAgb3RmOiAgICAgICAgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQlVGRkVSLFxufTtcblxuLy8gV2UgY2FuJ3Qgc2V0IHRoZSBgc3JjYCBhdHRyaWJ1dGUgdG8gZW1wdHkgc3RyaW5nLCBzbyBvbiBhYm9ydCB3ZSBzZXQgaXQgdG8gdGhpcyAxcHggdHJhbnNwYXJlbnQgZ2lmXG5SZXNvdXJjZS5FTVBUWV9HSUYgPSAnZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoQVFBQkFJQUFBUC8vL3dBQUFDSDVCQUVBQUFBQUxBQUFBQUFCQUFFQUFBSUNSQUVBT3c9PSc7XG5cbi8qKlxuICogUXVpY2sgaGVscGVyIHRvIHNldCBhIHZhbHVlIG9uIG9uZSBvZiB0aGUgZXh0ZW5zaW9uIG1hcHMuIEVuc3VyZXMgdGhlcmUgaXMgbm9cbiAqIGRvdCBhdCB0aGUgc3RhcnQgb2YgdGhlIGV4dGVuc2lvbi5cbiAqXG4gKiBAaWdub3JlXG4gKiBAcGFyYW0ge29iamVjdH0gbWFwIC0gVGhlIG1hcCB0byBzZXQgb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gZXh0bmFtZSAtIFRoZSBleHRlbnNpb24gKG9yIGtleSkgdG8gc2V0LlxuICogQHBhcmFtIHtudW1iZXJ9IHZhbCAtIFRoZSB2YWx1ZSB0byBzZXQuXG4gKi9cbmZ1bmN0aW9uIHNldEV4dE1hcChtYXAsIGV4dG5hbWUsIHZhbCkge1xuICAgIGlmIChleHRuYW1lICYmIGV4dG5hbWUuaW5kZXhPZignLicpID09PSAwKSB7XG4gICAgICAgIGV4dG5hbWUgPSBleHRuYW1lLnN1YnN0cmluZygxKTtcbiAgICB9XG5cbiAgICBpZiAoIWV4dG5hbWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG1hcFtleHRuYW1lXSA9IHZhbDtcbn1cblxuLyoqXG4gKiBRdWljayBoZWxwZXIgdG8gZ2V0IHN0cmluZyB4aHIgdHlwZS5cbiAqXG4gKiBAaWdub3JlXG4gKiBAcGFyYW0ge1hNTEh0dHBSZXF1ZXN0fFhEb21haW5SZXF1ZXN0fSB4aHIgLSBUaGUgcmVxdWVzdCB0byBjaGVjay5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIHJlcVR5cGUoeGhyKSB7XG4gICAgcmV0dXJuIHhoci50b1N0cmluZygpLnJlcGxhY2UoJ29iamVjdCAnLCAnJyk7XG59XG4iLCIvKipcbiAqIFNtYWxsZXIgdmVyc2lvbiBvZiB0aGUgYXN5bmMgbGlicmFyeSBjb25zdHJ1Y3RzLlxuICpcbiAqL1xuZnVuY3Rpb24gX25vb3AoKSB7IC8qIGVtcHR5ICovIH1cblxuLyoqXG4gKiBJdGVyYXRlcyBhbiBhcnJheSBpbiBzZXJpZXMuXG4gKlxuICogQHBhcmFtIHsqW119IGFycmF5IC0gQXJyYXkgdG8gaXRlcmF0ZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGl0ZXJhdG9yIC0gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBlbGVtZW50LlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBjYWxsIHdoZW4gZG9uZSwgb3Igb24gZXJyb3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlYWNoU2VyaWVzKGFycmF5LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICBsZXQgaSA9IDA7XG4gICAgY29uc3QgbGVuID0gYXJyYXkubGVuZ3RoO1xuXG4gICAgKGZ1bmN0aW9uIG5leHQoZXJyKSB7XG4gICAgICAgIGlmIChlcnIgfHwgaSA9PT0gbGVuKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpdGVyYXRvcihhcnJheVtpKytdLCBuZXh0KTtcbiAgICB9KSgpO1xufVxuXG4vKipcbiAqIEVuc3VyZXMgYSBmdW5jdGlvbiBpcyBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIC0gVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gKiBAcmV0dXJuIHtmdW5jdGlvbn0gVGhlIHdyYXBwaW5nIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvbmx5T25jZShmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiBvbmNlV3JhcHBlcigpIHtcbiAgICAgICAgaWYgKGZuID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbGxiYWNrIHdhcyBhbHJlYWR5IGNhbGxlZC4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNhbGxGbiA9IGZuO1xuXG4gICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgY2FsbEZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBBc3luYyBxdWV1ZSBpbXBsZW1lbnRhdGlvbixcbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSB3b3JrZXIgLSBUaGUgd29ya2VyIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdGFzay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBjb25jdXJyZW5jeSAtIEhvdyBtYW55IHdvcmtlcnMgdG8gcnVuIGluIHBhcnJhbGxlbC5cbiAqIEByZXR1cm4geyp9IFRoZSBhc3luYyBxdWV1ZSBvYmplY3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBxdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG4gICAgaWYgKGNvbmN1cnJlbmN5ID09IG51bGwpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1lcS1udWxsLGVxZXFlcVxuICAgICAgICBjb25jdXJyZW5jeSA9IDE7XG4gICAgfVxuICAgIGVsc2UgaWYgKGNvbmN1cnJlbmN5ID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uY3VycmVuY3kgbXVzdCBub3QgYmUgemVybycpO1xuICAgIH1cblxuICAgIGxldCB3b3JrZXJzID0gMDtcbiAgICBjb25zdCBxID0ge1xuICAgICAgICBfdGFza3M6IFtdLFxuICAgICAgICBjb25jdXJyZW5jeSxcbiAgICAgICAgc2F0dXJhdGVkOiBfbm9vcCxcbiAgICAgICAgdW5zYXR1cmF0ZWQ6IF9ub29wLFxuICAgICAgICBidWZmZXI6IGNvbmN1cnJlbmN5IC8gNCxcbiAgICAgICAgZW1wdHk6IF9ub29wLFxuICAgICAgICBkcmFpbjogX25vb3AsXG4gICAgICAgIGVycm9yOiBfbm9vcCxcbiAgICAgICAgc3RhcnRlZDogZmFsc2UsXG4gICAgICAgIHBhdXNlZDogZmFsc2UsXG4gICAgICAgIHB1c2goZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIF9pbnNlcnQoZGF0YSwgZmFsc2UsIGNhbGxiYWNrKTtcbiAgICAgICAgfSxcbiAgICAgICAga2lsbCgpIHtcbiAgICAgICAgICAgIHdvcmtlcnMgPSAwO1xuICAgICAgICAgICAgcS5kcmFpbiA9IF9ub29wO1xuICAgICAgICAgICAgcS5zdGFydGVkID0gZmFsc2U7XG4gICAgICAgICAgICBxLl90YXNrcyA9IFtdO1xuICAgICAgICB9LFxuICAgICAgICB1bnNoaWZ0KGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBfaW5zZXJ0KGRhdGEsIHRydWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJvY2VzcygpIHtcbiAgICAgICAgICAgIHdoaWxlICghcS5wYXVzZWQgJiYgd29ya2VycyA8IHEuY29uY3VycmVuY3kgJiYgcS5fdGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFzayA9IHEuX3Rhc2tzLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocS5fdGFza3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZW1wdHkoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3b3JrZXJzICs9IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAod29ya2VycyA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdvcmtlcih0YXNrLmRhdGEsIG9ubHlPbmNlKF9uZXh0KHRhc2spKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxlbmd0aCgpIHtcbiAgICAgICAgICAgIHJldHVybiBxLl90YXNrcy5sZW5ndGg7XG4gICAgICAgIH0sXG4gICAgICAgIHJ1bm5pbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gd29ya2VycztcbiAgICAgICAgfSxcbiAgICAgICAgaWRsZSgpIHtcbiAgICAgICAgICAgIHJldHVybiBxLl90YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwO1xuICAgICAgICB9LFxuICAgICAgICBwYXVzZSgpIHtcbiAgICAgICAgICAgIGlmIChxLnBhdXNlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcS5wYXVzZWQgPSB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICByZXN1bWUoKSB7XG4gICAgICAgICAgICBpZiAocS5wYXVzZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBxLnBhdXNlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBOZWVkIHRvIGNhbGwgcS5wcm9jZXNzIG9uY2UgcGVyIGNvbmN1cnJlbnRcbiAgICAgICAgICAgIC8vIHdvcmtlciB0byBwcmVzZXJ2ZSBmdWxsIGNvbmN1cnJlbmN5IGFmdGVyIHBhdXNlXG4gICAgICAgICAgICBmb3IgKGxldCB3ID0gMTsgdyA8PSBxLmNvbmN1cnJlbmN5OyB3KyspIHtcbiAgICAgICAgICAgICAgICBxLnByb2Nlc3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2luc2VydChkYXRhLCBpbnNlcnRBdEZyb250LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1lcS1udWxsLGVxZXFlcVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoZGF0YSA9PSBudWxsICYmIHEuaWRsZSgpKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZXEtbnVsbCxlcWVxZXFcbiAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHEuZHJhaW4oKSwgMSk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGl0ZW0gPSB7XG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgY2FsbGJhY2s6IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogX25vb3AsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGluc2VydEF0RnJvbnQpIHtcbiAgICAgICAgICAgIHEuX3Rhc2tzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBxLl90YXNrcy5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBxLnByb2Nlc3MoKSwgMSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX25leHQodGFzaykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgIHdvcmtlcnMgLT0gMTtcblxuICAgICAgICAgICAgdGFzay5jYWxsYmFjay5hcHBseSh0YXNrLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzWzBdICE9IG51bGwpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1lcS1udWxsLGVxZXFlcVxuICAgICAgICAgICAgICAgIHEuZXJyb3IoYXJndW1lbnRzWzBdLCB0YXNrLmRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAod29ya2VycyA8PSAocS5jb25jdXJyZW5jeSAtIHEuYnVmZmVyKSkge1xuICAgICAgICAgICAgICAgIHEudW5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHEuaWRsZSgpKSB7XG4gICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBxLnByb2Nlc3MoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcTtcbn1cbiIsImNvbnN0IF9rZXlTdHIgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nO1xuXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlQmluYXJ5KGlucHV0KSB7XG4gICAgbGV0IG91dHB1dCA9ICcnO1xuICAgIGxldCBpbnggPSAwO1xuXG4gICAgd2hpbGUgKGlueCA8IGlucHV0Lmxlbmd0aCkge1xuICAgICAgICAvLyBGaWxsIGJ5dGUgYnVmZmVyIGFycmF5XG4gICAgICAgIGNvbnN0IGJ5dGVidWZmZXIgPSBbMCwgMCwgMF07XG4gICAgICAgIGNvbnN0IGVuY29kZWRDaGFySW5kZXhlcyA9IFswLCAwLCAwLCAwXTtcblxuICAgICAgICBmb3IgKGxldCBqbnggPSAwOyBqbnggPCBieXRlYnVmZmVyLmxlbmd0aDsgKytqbngpIHtcbiAgICAgICAgICAgIGlmIChpbnggPCBpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvLyB0aHJvdyBhd2F5IGhpZ2gtb3JkZXIgYnl0ZSwgYXMgZG9jdW1lbnRlZCBhdDpcbiAgICAgICAgICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9Fbi9Vc2luZ19YTUxIdHRwUmVxdWVzdCNIYW5kbGluZ19iaW5hcnlfZGF0YVxuICAgICAgICAgICAgICAgIGJ5dGVidWZmZXJbam54XSA9IGlucHV0LmNoYXJDb2RlQXQoaW54KyspICYgMHhmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGJ5dGVidWZmZXJbam54XSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgZWFjaCBlbmNvZGVkIGNoYXJhY3RlciwgNiBiaXRzIGF0IGEgdGltZVxuICAgICAgICAvLyBpbmRleCAxOiBmaXJzdCA2IGJpdHNcbiAgICAgICAgZW5jb2RlZENoYXJJbmRleGVzWzBdID0gYnl0ZWJ1ZmZlclswXSA+PiAyO1xuXG4gICAgICAgIC8vIGluZGV4IDI6IHNlY29uZCA2IGJpdHMgKDIgbGVhc3Qgc2lnbmlmaWNhbnQgYml0cyBmcm9tIGlucHV0IGJ5dGUgMSArIDQgbW9zdCBzaWduaWZpY2FudCBiaXRzIGZyb20gYnl0ZSAyKVxuICAgICAgICBlbmNvZGVkQ2hhckluZGV4ZXNbMV0gPSAoKGJ5dGVidWZmZXJbMF0gJiAweDMpIDw8IDQpIHwgKGJ5dGVidWZmZXJbMV0gPj4gNCk7XG5cbiAgICAgICAgLy8gaW5kZXggMzogdGhpcmQgNiBiaXRzICg0IGxlYXN0IHNpZ25pZmljYW50IGJpdHMgZnJvbSBpbnB1dCBieXRlIDIgKyAyIG1vc3Qgc2lnbmlmaWNhbnQgYml0cyBmcm9tIGJ5dGUgMylcbiAgICAgICAgZW5jb2RlZENoYXJJbmRleGVzWzJdID0gKChieXRlYnVmZmVyWzFdICYgMHgwZikgPDwgMikgfCAoYnl0ZWJ1ZmZlclsyXSA+PiA2KTtcblxuICAgICAgICAvLyBpbmRleCAzOiBmb3J0aCA2IGJpdHMgKDYgbGVhc3Qgc2lnbmlmaWNhbnQgYml0cyBmcm9tIGlucHV0IGJ5dGUgMylcbiAgICAgICAgZW5jb2RlZENoYXJJbmRleGVzWzNdID0gYnl0ZWJ1ZmZlclsyXSAmIDB4M2Y7XG5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgcGFkZGluZyBoYXBwZW5lZCwgYW5kIGFkanVzdCBhY2NvcmRpbmdseVxuICAgICAgICBjb25zdCBwYWRkaW5nQnl0ZXMgPSBpbnggLSAoaW5wdXQubGVuZ3RoIC0gMSk7XG5cbiAgICAgICAgc3dpdGNoIChwYWRkaW5nQnl0ZXMpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAvLyBTZXQgbGFzdCAyIGNoYXJhY3RlcnMgdG8gcGFkZGluZyBjaGFyXG4gICAgICAgICAgICAgICAgZW5jb2RlZENoYXJJbmRleGVzWzNdID0gNjQ7XG4gICAgICAgICAgICAgICAgZW5jb2RlZENoYXJJbmRleGVzWzJdID0gNjQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAvLyBTZXQgbGFzdCBjaGFyYWN0ZXIgdG8gcGFkZGluZyBjaGFyXG4gICAgICAgICAgICAgICAgZW5jb2RlZENoYXJJbmRleGVzWzNdID0gNjQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7IC8vIE5vIHBhZGRpbmcgLSBwcm9jZWVkXG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3cgd2Ugd2lsbCBncmFiIGVhY2ggYXBwcm9wcmlhdGUgY2hhcmFjdGVyIG91dCBvZiBvdXIga2V5c3RyaW5nXG4gICAgICAgIC8vIGJhc2VkIG9uIG91ciBpbmRleCBhcnJheSBhbmQgYXBwZW5kIGl0IHRvIHRoZSBvdXRwdXQgc3RyaW5nXG4gICAgICAgIGZvciAobGV0IGpueCA9IDA7IGpueCA8IGVuY29kZWRDaGFySW5kZXhlcy5sZW5ndGg7ICsram54KSB7XG4gICAgICAgICAgICBvdXRwdXQgKz0gX2tleVN0ci5jaGFyQXQoZW5jb2RlZENoYXJJbmRleGVzW2pueF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dDtcbn1cbiIsImltcG9ydCBMb2FkZXIgZnJvbSAnLi9Mb2FkZXInO1xuaW1wb3J0IFJlc291cmNlIGZyb20gJy4vUmVzb3VyY2UnO1xuaW1wb3J0ICogYXMgYXN5bmMgZnJvbSAnLi9hc3luYyc7XG5pbXBvcnQgKiBhcyBiNjQgZnJvbSAnLi9iNjQnO1xuXG5pbXBvcnQge21lbW9yeU1pZGRsZXdhcmVGYWN0b3J5fSBmcm9tICcuL21pZGRsZXdhcmVzL2NhY2hpbmcvbWVtb3J5JztcbmltcG9ydCB7YmxvYk1pZGRsZXdhcmVGYWN0b3J5fSBmcm9tICcuL21pZGRsZXdhcmVzL3BhcnNpbmcvYmxvYic7XG5cbkxvYWRlci5SZXNvdXJjZSA9IFJlc291cmNlO1xuTG9hZGVyLmFzeW5jID0gYXN5bmM7XG5Mb2FkZXIuYmFzZTY0ID0gYjY0O1xuTG9hZGVyLm1pZGRsZXdhcmUgPSB7XG4gIGNhY2hpbmc6IHtcbiAgICBtZW1vcnk6IG1lbW9yeU1pZGRsZXdhcmVGYWN0b3J5XG4gIH0sXG4gIHBhcnNpbmc6IHtcbiAgICBibG9iOiBibG9iTWlkZGxld2FyZUZhY3RvcnlcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBMb2FkZXI7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcbiIsIi8vIGEgc2ltcGxlIGluLW1lbW9yeSBjYWNoZSBmb3IgcmVzb3VyY2VzXG5jb25zdCBjYWNoZSA9IHt9O1xuXG5leHBvcnQgZnVuY3Rpb24gbWVtb3J5TWlkZGxld2FyZUZhY3RvcnkoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIG1lbW9yeU1pZGRsZXdhcmUocmVzb3VyY2UsIG5leHQpIHtcbiAgICAgICAgLy8gaWYgY2FjaGVkLCB0aGVuIHNldCBkYXRhIGFuZCBjb21wbGV0ZSB0aGUgcmVzb3VyY2VcbiAgICAgICAgaWYgKGNhY2hlW3Jlc291cmNlLnVybF0pIHtcbiAgICAgICAgICAgIHJlc291cmNlLmRhdGEgPSBjYWNoZVtyZXNvdXJjZS51cmxdO1xuICAgICAgICAgICAgcmVzb3VyY2UuY29tcGxldGUoKTsgLy8gbWFya3MgcmVzb3VyY2UgbG9hZCBjb21wbGV0ZSBhbmQgc3RvcHMgcHJvY2Vzc2luZyBiZWZvcmUgbWlkZGxld2FyZXNcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiBub3QgY2FjaGVkLCB3YWl0IGZvciBjb21wbGV0ZSBhbmQgc3RvcmUgaXQgaW4gdGhlIGNhY2hlLlxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc291cmNlLm9uQ29tcGxldGUub25jZSgoKSA9PiAoY2FjaGVbdGhpcy51cmxdID0gdGhpcy5kYXRhKSk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXh0KCk7XG4gICAgfTtcbn1cbiIsImltcG9ydCBSZXNvdXJjZSBmcm9tICcuLi8uLi9SZXNvdXJjZSc7XG5pbXBvcnQgYjY0IGZyb20gJy4uLy4uL2I2NCc7XG5cbmNvbnN0IFVybCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmICh3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkwpO1xuXG4vLyBhIG1pZGRsZXdhcmUgZm9yIHRyYW5zZm9ybWluZyBYSFIgbG9hZGVkIEJsb2JzIGludG8gbW9yZSB1c2VmdWwgb2JqZWN0c1xuZXhwb3J0IGZ1bmN0aW9uIGJsb2JNaWRkbGV3YXJlRmFjdG9yeSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gYmxvYk1pZGRsZXdhcmUocmVzb3VyY2UsIG5leHQpIHtcbiAgICAgICAgaWYgKCFyZXNvdXJjZS5kYXRhKSB7XG4gICAgICAgICAgICBuZXh0KCk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHRoaXMgd2FzIGFuIFhIUiBsb2FkIG9mIGEgYmxvYlxuICAgICAgICBpZiAocmVzb3VyY2UueGhyICYmIHJlc291cmNlLnhoclR5cGUgPT09IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkJMT0IpIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGJsb2Igc3VwcG9ydCB3ZSBwcm9iYWJseSBnb3QgYSBiaW5hcnkgc3RyaW5nIGJhY2tcbiAgICAgICAgICAgIGlmICghd2luZG93LkJsb2IgfHwgdHlwZW9mIHJlc291cmNlLmRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IHJlc291cmNlLnhoci5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJyk7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFuIGltYWdlLCBjb252ZXJ0IHRoZSBiaW5hcnkgc3RyaW5nIGludG8gYSBkYXRhIHVybFxuICAgICAgICAgICAgICAgIGlmICh0eXBlICYmIHR5cGUuaW5kZXhPZignaW1hZ2UnKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS5kYXRhID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlLmRhdGEuc3JjID0gYGRhdGE6JHt0eXBlfTtiYXNlNjQsJHtiNjQuZW5jb2RlQmluYXJ5KHJlc291cmNlLnhoci5yZXNwb25zZVRleHQpfWA7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2UudHlwZSA9IFJlc291cmNlLlRZUEUuSU1BR0U7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gd2FpdCB1bnRpbCB0aGUgaW1hZ2UgbG9hZHMgYW5kIHRoZW4gY2FsbGJhY2tcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2UuZGF0YS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS5kYXRhLm9ubG9hZCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBuZXh0IHdpbGwgYmUgY2FsbGVkIG9uIGxvYWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIGNvbnRlbnQgdHlwZSBzYXlzIHRoaXMgaXMgYW4gaW1hZ2UsIHRoZW4gd2Ugc2hvdWxkIHRyYW5zZm9ybSB0aGUgYmxvYiBpbnRvIGFuIEltYWdlIG9iamVjdFxuICAgICAgICAgICAgZWxzZSBpZiAocmVzb3VyY2UuZGF0YS50eXBlLmluZGV4T2YoJ2ltYWdlJykgPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzcmMgPSBVcmwuY3JlYXRlT2JqZWN0VVJMKHJlc291cmNlLmRhdGEpO1xuXG4gICAgICAgICAgICAgICAgcmVzb3VyY2UuYmxvYiA9IHJlc291cmNlLmRhdGE7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2UuZGF0YSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgICAgIHJlc291cmNlLmRhdGEuc3JjID0gc3JjO1xuXG4gICAgICAgICAgICAgICAgcmVzb3VyY2UudHlwZSA9IFJlc291cmNlLlRZUEUuSU1BR0U7XG5cbiAgICAgICAgICAgICAgICAvLyBjbGVhbnVwIHRoZSBubyBsb25nZXIgdXNlZCBibG9iIGFmdGVyIHRoZSBpbWFnZSBsb2Fkc1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IElzIHRoaXMgY29ycmVjdD8gV2lsbCB0aGUgaW1hZ2UgYmUgaW52YWxpZCBhZnRlciByZXZva2luZz9cbiAgICAgICAgICAgICAgICByZXNvdXJjZS5kYXRhLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgVXJsLnJldm9rZU9iamVjdFVSTChzcmMpO1xuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS5kYXRhLm9ubG9hZCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAvLyBuZXh0IHdpbGwgYmUgY2FsbGVkIG9uIGxvYWQuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbmV4dCgpO1xuICAgIH07XG59XG4iXX0=
