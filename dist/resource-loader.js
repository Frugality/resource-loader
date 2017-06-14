(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Loader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _miniSignals = require('mini-signals');

var _miniSignals2 = _interopRequireDefault(_miniSignals);

var _parseUri = require('parse-uri');

var _parseUri2 = _interopRequireDefault(_parseUri);

var _async = require('./async');

var async = _interopRequireWildcard(_async);

var _Resource = require('./Resource');

var _Resource2 = _interopRequireDefault(_Resource);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// some constants
var MAX_PROGRESS = 100;
var rgxExtractUrlHash = /(#[\w-]+)?$/;

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
         * The tracks the resources we are currently completing parsing for.
         *
         * @member {Resource[]}
         */
        this._resourcesParsing = [];

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

        // if actively loading, make sure to adjust progress chunks for that parent and its children
        if (this.loading) {
            var parent = options.parentResource;
            var incompleteChildren = [];

            for (var _i = 0; _i < parent.children.length; ++_i) {
                if (!parent.children[_i].isComplete) {
                    incompleteChildren.push(parent.children[_i]);
                }
            }

            var fullChunk = parent.progressChunk * (incompleteChildren.length + 1); // +1 for parent
            var eachChunk = fullChunk / (incompleteChildren.length + 2); // +2 for parent & new child

            parent.children.push(this.resources[name]);
            parent.progressChunk = eachChunk;

            for (var _i2 = 0; _i2 < incompleteChildren.length; ++_i2) {
                incompleteChildren[_i2].progressChunk = eachChunk;
            }

            this.resources[name].progressChunk = eachChunk;
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
        }, true);
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

        // remove this resource from the async queue, and add it to our list of resources that are being parsed
        this._resourcesParsing.push(resource);
        resource._dequeue();

        // run all the after middleware for this resource
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

            _this3._resourcesParsing.splice(_this3._resourcesParsing.indexOf(resource), 1);

            // do completion check
            if (_this3._queue.idle() && _this3._resourcesParsing.length === 0) {
                _this3.progress = MAX_PROGRESS;
                _this3._onComplete();
            }
        }, true);
    };

    return Loader;
}();

exports.default = Loader;

},{"./Resource":2,"./async":3,"mini-signals":8,"parse-uri":9}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _parseUri = require('parse-uri');

var _parseUri2 = _interopRequireDefault(_parseUri);

var _miniSignals = require('mini-signals');

var _miniSignals2 = _interopRequireDefault(_miniSignals);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// tests is CORS is supported in XHR, if not we need to use XDR
var useXdr = typeof window !== 'undefined' && !!(window.XDomainRequest && !('withCredentials' in new XMLHttpRequest()));
var tempAnchor = null;

// some status constants
var STATUS_NONE = 0;
var STATUS_OK = 200;
var STATUS_EMPTY = 204;
var STATUS_IE_BUG_EMPTY = 1223;
var STATUS_TYPE_OK = 2;

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
         * The extension used to load this resource.
         *
         * @member {string}
         * @readonly
         */
        this.extension = this._getExtension();

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
        var text = '';
        var status = typeof xhr.status === 'undefined' ? STATUS_OK : xhr.status; // XDR has no `.status`, assume 200.

        // responseText is accessible only if responseType is '' or 'text' and on older browsers
        if (xhr.responseType === '' || xhr.responseType === 'text' || typeof xhr.responseType === 'undefined') {
            text = xhr.responseText;
        }

        // status can be 0 when using the `file://` protocol so we also check if a response is set.
        // If it has a response, we assume 200; otherwise a 0 status code with no contents is an aborted request.
        if (status === STATUS_NONE && text.length > 0) {
            status = STATUS_OK;
        }
        // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
        else if (status === STATUS_IE_BUG_EMPTY) {
                status = STATUS_EMPTY;
            }

        var statusType = status / 100 | 0;

        if (statusType === STATUS_TYPE_OK) {
            // if text, just return it
            if (this.xhrType === Resource.XHR_RESPONSE_TYPE.TEXT) {
                this.data = text;
                this.type = Resource.TYPE.TEXT;
            }
            // if json, parse into json object
            else if (this.xhrType === Resource.XHR_RESPONSE_TYPE.JSON) {
                    try {
                        this.data = JSON.parse(text);
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

                                this.data = domparser.parseFromString(text, 'text/xml');
                            } else {
                                var div = document.createElement('div');

                                div.innerHTML = text;

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
                            this.data = xhr.response || text;
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

    /**
     * Determines the responseType of an XHR request based on the extension of the
     * resource being loaded.
     *
     * @private
     * @return {Resource.XHR_RESPONSE_TYPE} The responseType to use.
     */


    Resource.prototype._determineXhrType = function _determineXhrType() {
        return Resource._xhrTypeMap[this.extension] || Resource.XHR_RESPONSE_TYPE.TEXT;
    };

    /**
     * Determines the loadType of a resource based on the extension of the
     * resource being loaded.
     *
     * @private
     * @return {Resource.LOAD_TYPE} The loadType to use.
     */


    Resource.prototype._determineLoadType = function _determineLoadType() {
        return Resource._loadTypeMap[this.extension] || Resource.LOAD_TYPE.XHR;
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
    VIDEO: 4
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

},{"mini-signals":8,"parse-uri":9}],3:[function(require,module,exports){
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
 * @param {Array.<*>} array - Array to iterate.
 * @param {function} iterator - Function to call for each element.
 * @param {function} callback - Function to call when done, or on error.
 * @param {boolean} [deferNext=false] - Break synchronous each loop by calling next with a setTimeout of 1.
 */
function eachSeries(array, iterator, callback, deferNext) {
    var i = 0;
    var len = array.length;

    (function next(err) {
        if (err || i === len) {
            if (callback) {
                callback(err);
            }

            return;
        }

        if (deferNext) {
            setTimeout(function () {
                iterator(array[i++], next);
            }, 1);
        } else {
            iterator(array[i++], next);
        }
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

// import Loader from './Loader';
// import Resource from './Resource';
// import * as async from './async';
// import * as b64 from './b64';

/* eslint-disable no-undef */

var Loader = require('./Loader').default;
var Resource = require('./Resource').default;
var async = require('./async');
var b64 = require('./b64');

var _require = require('./middlewares/caching/memory'),
    memoryMiddlewareFactory = _require.memoryMiddlewareFactory;

var _require2 = require('./middlewares/parsing/blob'),
    blobMiddlewareFactory = _require2.blobMiddlewareFactory;

Loader.Resource = Resource;
Loader.async = async;
Loader.base64 = b64;
Loader.middleware = {
  caching: {
    memory: memoryMiddlewareFactory
  },
  parsing: {
    blob: blobMiddlewareFactory
  }
};

// export manually, and also as default
module.exports = Loader;
// export default Loader;
module.exports.default = Loader;

},{"./Loader":1,"./Resource":2,"./async":3,"./b64":4,"./middlewares/caching/memory":6,"./middlewares/parsing/blob":7}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.blobMiddlewareFactory = blobMiddlewareFactory;

var _Resource = require('../../Resource');

var _Resource2 = _interopRequireDefault(_Resource);

var _b = require('../../b64');

var _b2 = _interopRequireDefault(_b);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Url = window.URL || window.webkitURL;

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
                    return;
                }
        }

        next();
    };
}

},{"../../Resource":2,"../../b64":4}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}]},{},[5])(5)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvTG9hZGVyLmpzIiwibGliL1Jlc291cmNlLmpzIiwibGliL2FzeW5jLmpzIiwibGliL2I2NC5qcyIsImxpYi9pbmRleC5qcyIsImxpYi9taWRkbGV3YXJlcy9jYWNoaW5nL21lbW9yeS5qcyIsImxpYi9taWRkbGV3YXJlcy9wYXJzaW5nL2Jsb2IuanMiLCJub2RlX21vZHVsZXMvbWluaS1zaWduYWxzL2xpYi9taW5pLXNpZ25hbHMuanMiLCJub2RlX21vZHVsZXMvcGFyc2UtdXJpL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4bUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1bkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbnZhciBfbWluaVNpZ25hbHMgPSByZXF1aXJlKCdtaW5pLXNpZ25hbHMnKTtcblxudmFyIF9taW5pU2lnbmFsczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taW5pU2lnbmFscyk7XG5cbnZhciBfcGFyc2VVcmkgPSByZXF1aXJlKCdwYXJzZS11cmknKTtcblxudmFyIF9wYXJzZVVyaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wYXJzZVVyaSk7XG5cbnZhciBfYXN5bmMgPSByZXF1aXJlKCcuL2FzeW5jJyk7XG5cbnZhciBhc3luYyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9hc3luYyk7XG5cbnZhciBfUmVzb3VyY2UgPSByZXF1aXJlKCcuL1Jlc291cmNlJyk7XG5cbnZhciBfUmVzb3VyY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUmVzb3VyY2UpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHsgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkgeyByZXR1cm4gb2JqOyB9IGVsc2UgeyB2YXIgbmV3T2JqID0ge307IGlmIChvYmogIT0gbnVsbCkgeyBmb3IgKHZhciBrZXkgaW4gb2JqKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gbmV3T2JqLmRlZmF1bHQgPSBvYmo7IHJldHVybiBuZXdPYmo7IH0gfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vLyBzb21lIGNvbnN0YW50c1xudmFyIE1BWF9QUk9HUkVTUyA9IDEwMDtcbnZhciByZ3hFeHRyYWN0VXJsSGFzaCA9IC8oI1tcXHctXSspPyQvO1xuXG4vKipcbiAqIE1hbmFnZXMgdGhlIHN0YXRlIGFuZCBsb2FkaW5nIG9mIG11bHRpcGxlIHJlc291cmNlcyB0byBsb2FkLlxuICpcbiAqIEBjbGFzc1xuICovXG5cbnZhciBMb2FkZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtiYXNlVXJsPScnXSAtIFRoZSBiYXNlIHVybCBmb3IgYWxsIHJlc291cmNlcyBsb2FkZWQgYnkgdGhpcyBsb2FkZXIuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtjb25jdXJyZW5jeT0xMF0gLSBUaGUgbnVtYmVyIG9mIHJlc291cmNlcyB0byBsb2FkIGNvbmN1cnJlbnRseS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBMb2FkZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGJhc2VVcmwgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xuICAgICAgICB2YXIgY29uY3VycmVuY3kgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IDEwO1xuXG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMb2FkZXIpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgYmFzZSB1cmwgZm9yIGFsbCByZXNvdXJjZXMgbG9hZGVkIGJ5IHRoaXMgbG9hZGVyLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmJhc2VVcmwgPSBiYXNlVXJsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgcHJvZ3Jlc3MgcGVyY2VudCBvZiB0aGUgbG9hZGVyIGdvaW5nIHRocm91Z2ggdGhlIHF1ZXVlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnByb2dyZXNzID0gMDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTG9hZGluZyBzdGF0ZSBvZiB0aGUgbG9hZGVyLCB0cnVlIGlmIGl0IGlzIGN1cnJlbnRseSBsb2FkaW5nIHJlc291cmNlcy5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBIHF1ZXJ5c3RyaW5nIHRvIGFwcGVuZCB0byBldmVyeSBVUkwgYWRkZWQgdG8gdGhlIGxvYWRlci5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhpcyBzaG91bGQgYmUgYSB2YWxpZCBxdWVyeSBzdHJpbmcgKndpdGhvdXQqIHRoZSBxdWVzdGlvbi1tYXJrIChgP2ApLiBUaGUgbG9hZGVyIHdpbGxcbiAgICAgICAgICogYWxzbyAqbm90KiBlc2NhcGUgdmFsdWVzIGZvciB5b3UuIE1ha2Ugc3VyZSB0byBlc2NhcGUgeW91ciBwYXJhbWV0ZXJzIHdpdGhcbiAgICAgICAgICogW2BlbmNvZGVVUklDb21wb25lbnRgXShodHRwczovL21kbi5pby9lbmNvZGVVUklDb21wb25lbnQpIGJlZm9yZSBhc3NpZ25pbmcgdGhpcyBwcm9wZXJ0eS5cbiAgICAgICAgICpcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICogY29uc3QgbG9hZGVyID0gbmV3IExvYWRlcigpO1xuICAgICAgICAgKlxuICAgICAgICAgKiBsb2FkZXIuZGVmYXVsdFF1ZXJ5U3RyaW5nID0gJ3VzZXI9bWUmcGFzc3dvcmQ9c2VjcmV0JztcbiAgICAgICAgICpcbiAgICAgICAgICogLy8gVGhpcyB3aWxsIHJlcXVlc3QgJ2ltYWdlLnBuZz91c2VyPW1lJnBhc3N3b3JkPXNlY3JldCdcbiAgICAgICAgICogbG9hZGVyLmFkZCgnaW1hZ2UucG5nJykubG9hZCgpO1xuICAgICAgICAgKlxuICAgICAgICAgKiBsb2FkZXIucmVzZXQoKTtcbiAgICAgICAgICpcbiAgICAgICAgICogLy8gVGhpcyB3aWxsIHJlcXVlc3QgJ2ltYWdlLnBuZz92PTEmdXNlcj1tZSZwYXNzd29yZD1zZWNyZXQnXG4gICAgICAgICAqIGxvYWRlci5hZGQoJ2lhbWdlLnBuZz92PTEnKS5sb2FkKCk7XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRlZmF1bHRRdWVyeVN0cmluZyA9ICcnO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgbWlkZGxld2FyZSB0byBydW4gYmVmb3JlIGxvYWRpbmcgZWFjaCByZXNvdXJjZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7ZnVuY3Rpb25bXX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2JlZm9yZU1pZGRsZXdhcmUgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG1pZGRsZXdhcmUgdG8gcnVuIGFmdGVyIGxvYWRpbmcgZWFjaCByZXNvdXJjZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7ZnVuY3Rpb25bXX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2FmdGVyTWlkZGxld2FyZSA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgdHJhY2tzIHRoZSByZXNvdXJjZXMgd2UgYXJlIGN1cnJlbnRseSBjb21wbGV0aW5nIHBhcnNpbmcgZm9yLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtSZXNvdXJjZVtdfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcmVzb3VyY2VzUGFyc2luZyA9IFtdO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgYF9sb2FkUmVzb3VyY2VgIGZ1bmN0aW9uIGJvdW5kIHdpdGggdGhpcyBvYmplY3QgY29udGV4dC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1lbWJlciB7ZnVuY3Rpb259XG4gICAgICAgICAqIEBwYXJhbSB7UmVzb3VyY2V9IHIgLSBUaGUgcmVzb3VyY2UgdG8gbG9hZFxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBkIC0gVGhlIGRlcXVldWUgZnVuY3Rpb25cbiAgICAgICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fYm91bmRMb2FkUmVzb3VyY2UgPSBmdW5jdGlvbiAociwgZCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLl9sb2FkUmVzb3VyY2UociwgZCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSByZXNvdXJjZXMgd2FpdGluZyB0byBiZSBsb2FkZWQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBtZW1iZXIge1Jlc291cmNlW119XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9xdWV1ZSA9IGFzeW5jLnF1ZXVlKHRoaXMuX2JvdW5kTG9hZFJlc291cmNlLCBjb25jdXJyZW5jeSk7XG5cbiAgICAgICAgdGhpcy5fcXVldWUucGF1c2UoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQWxsIHRoZSByZXNvdXJjZXMgZm9yIHRoaXMgbG9hZGVyIGtleWVkIGJ5IG5hbWUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge29iamVjdDxzdHJpbmcsIFJlc291cmNlPn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucmVzb3VyY2VzID0ge307XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc3BhdGNoZWQgb25jZSBwZXIgbG9hZGVkIG9yIGVycm9yZWQgcmVzb3VyY2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoZSBjYWxsYmFjayBsb29rcyBsaWtlIHtAbGluayBMb2FkZXIuT25Qcm9ncmVzc1NpZ25hbH0uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge1NpZ25hbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub25Qcm9ncmVzcyA9IG5ldyBfbWluaVNpZ25hbHMyLmRlZmF1bHQoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGlzcGF0Y2hlZCBvbmNlIHBlciBlcnJvcmVkIHJlc291cmNlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgY2FsbGJhY2sgbG9va3MgbGlrZSB7QGxpbmsgTG9hZGVyLk9uRXJyb3JTaWduYWx9LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtTaWduYWx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9uRXJyb3IgPSBuZXcgX21pbmlTaWduYWxzMi5kZWZhdWx0KCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc3BhdGNoZWQgb25jZSBwZXIgbG9hZGVkIHJlc291cmNlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgY2FsbGJhY2sgbG9va3MgbGlrZSB7QGxpbmsgTG9hZGVyLk9uTG9hZFNpZ25hbH0uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge1NpZ25hbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub25Mb2FkID0gbmV3IF9taW5pU2lnbmFsczIuZGVmYXVsdCgpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNwYXRjaGVkIHdoZW4gdGhlIGxvYWRlciBiZWdpbnMgdG8gcHJvY2VzcyB0aGUgcXVldWUuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoZSBjYWxsYmFjayBsb29rcyBsaWtlIHtAbGluayBMb2FkZXIuT25TdGFydFNpZ25hbH0uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge1NpZ25hbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub25TdGFydCA9IG5ldyBfbWluaVNpZ25hbHMyLmRlZmF1bHQoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGlzcGF0Y2hlZCB3aGVuIHRoZSBxdWV1ZWQgcmVzb3VyY2VzIGFsbCBsb2FkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgY2FsbGJhY2sgbG9va3MgbGlrZSB7QGxpbmsgTG9hZGVyLk9uQ29tcGxldGVTaWduYWx9LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtTaWduYWx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9uQ29tcGxldGUgPSBuZXcgX21pbmlTaWduYWxzMi5kZWZhdWx0KCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZW4gdGhlIHByb2dyZXNzIGNoYW5nZXMgdGhlIGxvYWRlciBhbmQgcmVzb3VyY2UgYXJlIGRpc2FwdGNoZWQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJvZiBMb2FkZXJcbiAgICAgICAgICogQGNhbGxiYWNrIE9uUHJvZ3Jlc3NTaWduYWxcbiAgICAgICAgICogQHBhcmFtIHtMb2FkZXJ9IGxvYWRlciAtIFRoZSBsb2FkZXIgdGhlIHByb2dyZXNzIGlzIGFkdmFuY2luZyBvbi5cbiAgICAgICAgICogQHBhcmFtIHtSZXNvdXJjZX0gcmVzb3VyY2UgLSBUaGUgcmVzb3VyY2UgdGhhdCBoYXMgY29tcGxldGVkIG9yIGZhaWxlZCB0byBjYXVzZSB0aGUgcHJvZ3Jlc3MgdG8gYWR2YW5jZS5cbiAgICAgICAgICovXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZW4gYW4gZXJyb3Igb2NjdXJycyB0aGUgbG9hZGVyIGFuZCByZXNvdXJjZSBhcmUgZGlzYXB0Y2hlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlcm9mIExvYWRlclxuICAgICAgICAgKiBAY2FsbGJhY2sgT25FcnJvclNpZ25hbFxuICAgICAgICAgKiBAcGFyYW0ge0xvYWRlcn0gbG9hZGVyIC0gVGhlIGxvYWRlciB0aGUgZXJyb3IgaGFwcGVuZWQgaW4uXG4gICAgICAgICAqIEBwYXJhbSB7UmVzb3VyY2V9IHJlc291cmNlIC0gVGhlIHJlc291cmNlIHRoYXQgY2F1c2VkIHRoZSBlcnJvci5cbiAgICAgICAgICovXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZW4gYSBsb2FkIGNvbXBsZXRlcyB0aGUgbG9hZGVyIGFuZCByZXNvdXJjZSBhcmUgZGlzYXB0Y2hlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlcm9mIExvYWRlclxuICAgICAgICAgKiBAY2FsbGJhY2sgT25Mb2FkU2lnbmFsXG4gICAgICAgICAqIEBwYXJhbSB7TG9hZGVyfSBsb2FkZXIgLSBUaGUgbG9hZGVyIHRoYXQgbGFvZGVkIHRoZSByZXNvdXJjZS5cbiAgICAgICAgICogQHBhcmFtIHtSZXNvdXJjZX0gcmVzb3VyY2UgLSBUaGUgcmVzb3VyY2UgdGhhdCBoYXMgY29tcGxldGVkIGxvYWRpbmcuXG4gICAgICAgICAqL1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGVuIHRoZSBsb2FkZXIgc3RhcnRzIGxvYWRpbmcgcmVzb3VyY2VzIGl0IGRpc3BhdGNoZXMgdGhpcyBjYWxsYmFjay5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlcm9mIExvYWRlclxuICAgICAgICAgKiBAY2FsbGJhY2sgT25TdGFydFNpZ25hbFxuICAgICAgICAgKiBAcGFyYW0ge0xvYWRlcn0gbG9hZGVyIC0gVGhlIGxvYWRlciB0aGF0IGhhcyBzdGFydGVkIGxvYWRpbmcgcmVzb3VyY2VzLlxuICAgICAgICAgKi9cblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hlbiB0aGUgbG9hZGVyIGNvbXBsZXRlcyBsb2FkaW5nIHJlc291cmNlcyBpdCBkaXNwYXRjaGVzIHRoaXMgY2FsbGJhY2suXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJvZiBMb2FkZXJcbiAgICAgICAgICogQGNhbGxiYWNrIE9uQ29tcGxldGVTaWduYWxcbiAgICAgICAgICogQHBhcmFtIHtMb2FkZXJ9IGxvYWRlciAtIFRoZSBsb2FkZXIgdGhhdCBoYXMgZmluaXNoZWQgbG9hZGluZyByZXNvdXJjZXMuXG4gICAgICAgICAqL1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSByZXNvdXJjZSAob3IgbXVsdGlwbGUgcmVzb3VyY2VzKSB0byB0aGUgbG9hZGVyIHF1ZXVlLlxuICAgICAqXG4gICAgICogVGhpcyBmdW5jdGlvbiBjYW4gdGFrZSBhIHdpZGUgdmFyaWV0eSBvZiBkaWZmZXJlbnQgcGFyYW1ldGVycy4gVGhlIG9ubHkgdGhpbmcgdGhhdCBpcyBhbHdheXNcbiAgICAgKiByZXF1aXJlZCB0aGUgdXJsIHRvIGxvYWQuIEFsbCB0aGUgZm9sbG93aW5nIHdpbGwgd29yazpcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogbG9hZGVyXG4gICAgICogICAgIC8vIG5vcm1hbCBwYXJhbSBzeW50YXhcbiAgICAgKiAgICAgLmFkZCgna2V5JywgJ2h0dHA6Ly8uLi4nLCBmdW5jdGlvbiAoKSB7fSlcbiAgICAgKiAgICAgLmFkZCgnaHR0cDovLy4uLicsIGZ1bmN0aW9uICgpIHt9KVxuICAgICAqICAgICAuYWRkKCdodHRwOi8vLi4uJylcbiAgICAgKlxuICAgICAqICAgICAvLyBvYmplY3Qgc3ludGF4XG4gICAgICogICAgIC5hZGQoe1xuICAgICAqICAgICAgICAgbmFtZTogJ2tleTInLFxuICAgICAqICAgICAgICAgdXJsOiAnaHR0cDovLy4uLidcbiAgICAgKiAgICAgfSwgZnVuY3Rpb24gKCkge30pXG4gICAgICogICAgIC5hZGQoe1xuICAgICAqICAgICAgICAgdXJsOiAnaHR0cDovLy4uLidcbiAgICAgKiAgICAgfSwgZnVuY3Rpb24gKCkge30pXG4gICAgICogICAgIC5hZGQoe1xuICAgICAqICAgICAgICAgbmFtZTogJ2tleTMnLFxuICAgICAqICAgICAgICAgdXJsOiAnaHR0cDovLy4uLidcbiAgICAgKiAgICAgICAgIG9uQ29tcGxldGU6IGZ1bmN0aW9uICgpIHt9XG4gICAgICogICAgIH0pXG4gICAgICogICAgIC5hZGQoe1xuICAgICAqICAgICAgICAgdXJsOiAnaHR0cHM6Ly8uLi4nLFxuICAgICAqICAgICAgICAgb25Db21wbGV0ZTogZnVuY3Rpb24gKCkge30sXG4gICAgICogICAgICAgICBjcm9zc09yaWdpbjogdHJ1ZVxuICAgICAqICAgICB9KVxuICAgICAqXG4gICAgICogICAgIC8vIHlvdSBjYW4gYWxzbyBwYXNzIGFuIGFycmF5IG9mIG9iamVjdHMgb3IgdXJscyBvciBib3RoXG4gICAgICogICAgIC5hZGQoW1xuICAgICAqICAgICAgICAgeyBuYW1lOiAna2V5NCcsIHVybDogJ2h0dHA6Ly8uLi4nLCBvbkNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7fSB9LFxuICAgICAqICAgICAgICAgeyB1cmw6ICdodHRwOi8vLi4uJywgb25Db21wbGV0ZTogZnVuY3Rpb24gKCkge30gfSxcbiAgICAgKiAgICAgICAgICdodHRwOi8vLi4uJ1xuICAgICAqICAgICBdKVxuICAgICAqXG4gICAgICogICAgIC8vIGFuZCB5b3UgY2FuIHVzZSBib3RoIHBhcmFtcyBhbmQgb3B0aW9uc1xuICAgICAqICAgICAuYWRkKCdrZXknLCAnaHR0cDovLy4uLicsIHsgY3Jvc3NPcmlnaW46IHRydWUgfSwgZnVuY3Rpb24gKCkge30pXG4gICAgICogICAgIC5hZGQoJ2h0dHA6Ly8uLi4nLCB7IGNyb3NzT3JpZ2luOiB0cnVlIH0sIGZ1bmN0aW9uICgpIHt9KTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZV0gLSBUaGUgbmFtZSBvZiB0aGUgcmVzb3VyY2UgdG8gbG9hZCwgaWYgbm90IHBhc3NlZCB0aGUgdXJsIGlzIHVzZWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFt1cmxdIC0gVGhlIHVybCBmb3IgdGhpcyByZXNvdXJjZSwgcmVsYXRpdmUgdG8gdGhlIGJhc2VVcmwgb2YgdGhpcyBsb2FkZXIuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAtIFRoZSBvcHRpb25zIGZvciB0aGUgbG9hZC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmNyb3NzT3JpZ2luXSAtIElzIHRoaXMgcmVxdWVzdCBjcm9zcy1vcmlnaW4/IERlZmF1bHQgaXMgdG8gZGV0ZXJtaW5lIGF1dG9tYXRpY2FsbHkuXG4gICAgICogQHBhcmFtIHtSZXNvdXJjZS5MT0FEX1RZUEV9IFtvcHRpb25zLmxvYWRUeXBlPVJlc291cmNlLkxPQURfVFlQRS5YSFJdIC0gSG93IHNob3VsZCB0aGlzIHJlc291cmNlIGJlIGxvYWRlZD9cbiAgICAgKiBAcGFyYW0ge1Jlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFfSBbb3B0aW9ucy54aHJUeXBlPVJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRFRkFVTFRdIC0gSG93IHNob3VsZFxuICAgICAqICAgICAgdGhlIGRhdGEgYmVpbmcgbG9hZGVkIGJlIGludGVycHJldGVkIHdoZW4gdXNpbmcgWEhSP1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5tZXRhZGF0YV0gLSBFeHRyYSBjb25maWd1cmF0aW9uIGZvciBtaWRkbGV3YXJlIGFuZCB0aGUgUmVzb3VyY2Ugb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7SFRNTEltYWdlRWxlbWVudHxIVE1MQXVkaW9FbGVtZW50fEhUTUxWaWRlb0VsZW1lbnR9IFtvcHRpb25zLm1ldGFkYXRhLmxvYWRFbGVtZW50PW51bGxdIC0gVGhlXG4gICAgICogICAgICBlbGVtZW50IHRvIHVzZSBmb3IgbG9hZGluZywgaW5zdGVhZCBvZiBjcmVhdGluZyBvbmUuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5tZXRhZGF0YS5za2lwU291cmNlPWZhbHNlXSAtIFNraXBzIGFkZGluZyBzb3VyY2UocykgdG8gdGhlIGxvYWQgZWxlbWVudC4gVGhpc1xuICAgICAqICAgICAgaXMgdXNlZnVsIGlmIHlvdSB3YW50IHRvIHBhc3MgaW4gYSBgbG9hZEVsZW1lbnRgIHRoYXQgeW91IGFscmVhZHkgYWRkZWQgbG9hZCBzb3VyY2VzIHRvLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtjYl0gLSBGdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhpcyBzcGVjaWZpYyByZXNvdXJjZSBjb21wbGV0ZXMgbG9hZGluZy5cbiAgICAgKiBAcmV0dXJuIHtMb2FkZXJ9IFJldHVybnMgaXRzZWxmLlxuICAgICAqL1xuXG5cbiAgICBMb2FkZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChuYW1lLCB1cmwsIG9wdGlvbnMsIGNiKSB7XG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZSBvZiBhbiBhcnJheSBvZiBvYmplY3RzIG9yIHVybHNcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkobmFtZSkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmFtZS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkKG5hbWVbaV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGFuIG9iamVjdCBpcyBwYXNzZWQgaW5zdGVhZCBvZiBwYXJhbXNcbiAgICAgICAgaWYgKCh0eXBlb2YgbmFtZSA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YobmFtZSkpID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgY2IgPSB1cmwgfHwgbmFtZS5jYWxsYmFjayB8fCBuYW1lLm9uQ29tcGxldGU7XG4gICAgICAgICAgICBvcHRpb25zID0gbmFtZTtcbiAgICAgICAgICAgIHVybCA9IG5hbWUudXJsO1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUubmFtZSB8fCBuYW1lLmtleSB8fCBuYW1lLnVybDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhc2Ugd2hlcmUgbm8gbmFtZSBpcyBwYXNzZWQgc2hpZnQgYWxsIGFyZ3Mgb3ZlciBieSBvbmUuXG4gICAgICAgIGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY2IgPSBvcHRpb25zO1xuICAgICAgICAgICAgb3B0aW9ucyA9IHVybDtcbiAgICAgICAgICAgIHVybCA9IG5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBub3cgdGhhdCB3ZSBzaGlmdGVkIG1ha2Ugc3VyZSB3ZSBoYXZlIGEgcHJvcGVyIHVybC5cbiAgICAgICAgaWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHVybCBwYXNzZWQgdG8gYWRkIHJlc291cmNlIHRvIGxvYWRlci4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9wdGlvbnMgYXJlIG9wdGlvbmFsIHNvIHBlb3BsZSBtaWdodCBwYXNzIGEgZnVuY3Rpb24gYW5kIG5vIG9wdGlvbnNcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYiA9IG9wdGlvbnM7XG4gICAgICAgICAgICBvcHRpb25zID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGxvYWRpbmcgYWxyZWFkeSB5b3UgY2FuIG9ubHkgYWRkIHJlc291cmNlcyB0aGF0IGhhdmUgYSBwYXJlbnQuXG4gICAgICAgIGlmICh0aGlzLmxvYWRpbmcgJiYgKCFvcHRpb25zIHx8ICFvcHRpb25zLnBhcmVudFJlc291cmNlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgYWRkIHJlc291cmNlcyB3aGlsZSB0aGUgbG9hZGVyIGlzIHJ1bm5pbmcuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjaGVjayBpZiByZXNvdXJjZSBhbHJlYWR5IGV4aXN0cy5cbiAgICAgICAgaWYgKHRoaXMucmVzb3VyY2VzW25hbWVdKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc291cmNlIG5hbWVkIFwiJyArIG5hbWUgKyAnXCIgYWxyZWFkeSBleGlzdHMuJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgYmFzZSB1cmwgaWYgdGhpcyBpc24ndCBhbiBhYnNvbHV0ZSB1cmxcbiAgICAgICAgdXJsID0gdGhpcy5fcHJlcGFyZVVybCh1cmwpO1xuXG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgc3RvcmUgdGhlIHJlc291cmNlXG4gICAgICAgIHRoaXMucmVzb3VyY2VzW25hbWVdID0gbmV3IF9SZXNvdXJjZTIuZGVmYXVsdChuYW1lLCB1cmwsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2VzW25hbWVdLm9uQWZ0ZXJNaWRkbGV3YXJlLm9uY2UoY2IpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgYWN0aXZlbHkgbG9hZGluZywgbWFrZSBzdXJlIHRvIGFkanVzdCBwcm9ncmVzcyBjaHVua3MgZm9yIHRoYXQgcGFyZW50IGFuZCBpdHMgY2hpbGRyZW5cbiAgICAgICAgaWYgKHRoaXMubG9hZGluZykge1xuICAgICAgICAgICAgdmFyIHBhcmVudCA9IG9wdGlvbnMucGFyZW50UmVzb3VyY2U7XG4gICAgICAgICAgICB2YXIgaW5jb21wbGV0ZUNoaWxkcmVuID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoOyArK19pKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJlbnQuY2hpbGRyZW5bX2ldLmlzQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5jb21wbGV0ZUNoaWxkcmVuLnB1c2gocGFyZW50LmNoaWxkcmVuW19pXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZnVsbENodW5rID0gcGFyZW50LnByb2dyZXNzQ2h1bmsgKiAoaW5jb21wbGV0ZUNoaWxkcmVuLmxlbmd0aCArIDEpOyAvLyArMSBmb3IgcGFyZW50XG4gICAgICAgICAgICB2YXIgZWFjaENodW5rID0gZnVsbENodW5rIC8gKGluY29tcGxldGVDaGlsZHJlbi5sZW5ndGggKyAyKTsgLy8gKzIgZm9yIHBhcmVudCAmIG5ldyBjaGlsZFxuXG4gICAgICAgICAgICBwYXJlbnQuY2hpbGRyZW4ucHVzaCh0aGlzLnJlc291cmNlc1tuYW1lXSk7XG4gICAgICAgICAgICBwYXJlbnQucHJvZ3Jlc3NDaHVuayA9IGVhY2hDaHVuaztcblxuICAgICAgICAgICAgZm9yICh2YXIgX2kyID0gMDsgX2kyIDwgaW5jb21wbGV0ZUNoaWxkcmVuLmxlbmd0aDsgKytfaTIpIHtcbiAgICAgICAgICAgICAgICBpbmNvbXBsZXRlQ2hpbGRyZW5bX2kyXS5wcm9ncmVzc0NodW5rID0gZWFjaENodW5rO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnJlc291cmNlc1tuYW1lXS5wcm9ncmVzc0NodW5rID0gZWFjaENodW5rO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHRoZSByZXNvdXJjZSB0byB0aGUgcXVldWVcbiAgICAgICAgdGhpcy5fcXVldWUucHVzaCh0aGlzLnJlc291cmNlc1tuYW1lXSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgYSBtaWRkbGV3YXJlIGZ1bmN0aW9uIHRoYXQgd2lsbCBydW4gKmJlZm9yZSogdGhlXG4gICAgICogcmVzb3VyY2UgaXMgbG9hZGVkLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBiZWZvcmVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiAtIFRoZSBtaWRkbGV3YXJlIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyLlxuICAgICAqIEByZXR1cm4ge0xvYWRlcn0gUmV0dXJucyBpdHNlbGYuXG4gICAgICovXG5cblxuICAgIExvYWRlci5wcm90b3R5cGUucHJlID0gZnVuY3Rpb24gcHJlKGZuKSB7XG4gICAgICAgIHRoaXMuX2JlZm9yZU1pZGRsZXdhcmUucHVzaChmbik7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgYSBtaWRkbGV3YXJlIGZ1bmN0aW9uIHRoYXQgd2lsbCBydW4gKmFmdGVyKiB0aGVcbiAgICAgKiByZXNvdXJjZSBpcyBsb2FkZWQuXG4gICAgICpcbiAgICAgKiBAYWxpYXMgdXNlXG4gICAgICogQG1ldGhvZCBhZnRlclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIC0gVGhlIG1pZGRsZXdhcmUgZnVuY3Rpb24gdG8gcmVnaXN0ZXIuXG4gICAgICogQHJldHVybiB7TG9hZGVyfSBSZXR1cm5zIGl0c2VsZi5cbiAgICAgKi9cblxuXG4gICAgTG9hZGVyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZm4pIHtcbiAgICAgICAgdGhpcy5fYWZ0ZXJNaWRkbGV3YXJlLnB1c2goZm4pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIHF1ZXVlIG9mIHRoZSBsb2FkZXIgdG8gcHJlcGFyZSBmb3IgYSBuZXcgbG9hZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0xvYWRlcn0gUmV0dXJucyBpdHNlbGYuXG4gICAgICovXG5cblxuICAgIExvYWRlci5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XG4gICAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuX3F1ZXVlLmtpbGwoKTtcbiAgICAgICAgdGhpcy5fcXVldWUucGF1c2UoKTtcblxuICAgICAgICAvLyBhYm9ydCBhbGwgcmVzb3VyY2UgbG9hZHNcbiAgICAgICAgZm9yICh2YXIgayBpbiB0aGlzLnJlc291cmNlcykge1xuICAgICAgICAgICAgdmFyIHJlcyA9IHRoaXMucmVzb3VyY2VzW2tdO1xuXG4gICAgICAgICAgICBpZiAocmVzLl9vbkxvYWRCaW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgcmVzLl9vbkxvYWRCaW5kaW5nLmRldGFjaCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzLmlzTG9hZGluZykge1xuICAgICAgICAgICAgICAgIHJlcy5hYm9ydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZXNvdXJjZXMgPSB7fTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU3RhcnRzIGxvYWRpbmcgdGhlIHF1ZXVlZCByZXNvdXJjZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBbY2JdIC0gT3B0aW9uYWwgY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGJvdW5kIHRvIHRoZSBgY29tcGxldGVgIGV2ZW50LlxuICAgICAqIEByZXR1cm4ge0xvYWRlcn0gUmV0dXJucyBpdHNlbGYuXG4gICAgICovXG5cblxuICAgIExvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uIGxvYWQoY2IpIHtcbiAgICAgICAgLy8gcmVnaXN0ZXIgY29tcGxldGUgY2FsbGJhY2sgaWYgdGhleSBwYXNzIG9uZVxuICAgICAgICBpZiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aGlzLm9uQ29tcGxldGUub25jZShjYik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB0aGUgcXVldWUgaGFzIGFscmVhZHkgc3RhcnRlZCB3ZSBhcmUgZG9uZSBoZXJlXG4gICAgICAgIGlmICh0aGlzLmxvYWRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGlzdHJpYnV0ZSBwcm9ncmVzcyBjaHVua3NcbiAgICAgICAgdmFyIGNodW5rID0gMTAwIC8gdGhpcy5fcXVldWUuX3Rhc2tzLmxlbmd0aDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3F1ZXVlLl90YXNrcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdGhpcy5fcXVldWUuX3Rhc2tzW2ldLmRhdGEucHJvZ3Jlc3NDaHVuayA9IGNodW5rO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlIGxvYWRpbmcgc3RhdGVcbiAgICAgICAgdGhpcy5sb2FkaW5nID0gdHJ1ZTtcblxuICAgICAgICAvLyBub3RpZnkgb2Ygc3RhcnRcbiAgICAgICAgdGhpcy5vblN0YXJ0LmRpc3BhdGNoKHRoaXMpO1xuXG4gICAgICAgIC8vIHN0YXJ0IGxvYWRpbmdcbiAgICAgICAgdGhpcy5fcXVldWUucmVzdW1lKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFByZXBhcmVzIGEgdXJsIGZvciB1c2FnZSBiYXNlZCBvbiB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGlzIG9iamVjdFxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIC0gVGhlIHVybCB0byBwcmVwYXJlLlxuICAgICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHByZXBhcmVkIHVybC5cbiAgICAgKi9cblxuXG4gICAgTG9hZGVyLnByb3RvdHlwZS5fcHJlcGFyZVVybCA9IGZ1bmN0aW9uIF9wcmVwYXJlVXJsKHVybCkge1xuICAgICAgICB2YXIgcGFyc2VkVXJsID0gKDAsIF9wYXJzZVVyaTIuZGVmYXVsdCkodXJsLCB7IHN0cmljdE1vZGU6IHRydWUgfSk7XG4gICAgICAgIHZhciByZXN1bHQgPSB2b2lkIDA7XG5cbiAgICAgICAgLy8gYWJzb2x1dGUgdXJsLCBqdXN0IHVzZSBpdCBhcyBpcy5cbiAgICAgICAgaWYgKHBhcnNlZFVybC5wcm90b2NvbCB8fCAhcGFyc2VkVXJsLnBhdGggfHwgdXJsLmluZGV4T2YoJy8vJykgPT09IDApIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHVybDtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiBiYXNlVXJsIGRvZXNuJ3QgZW5kIGluIHNsYXNoIGFuZCB1cmwgZG9lc24ndCBzdGFydCB3aXRoIHNsYXNoLCB0aGVuIGFkZCBhIHNsYXNoIGluYmV0d2VlblxuICAgICAgICBlbHNlIGlmICh0aGlzLmJhc2VVcmwubGVuZ3RoICYmIHRoaXMuYmFzZVVybC5sYXN0SW5kZXhPZignLycpICE9PSB0aGlzLmJhc2VVcmwubGVuZ3RoIC0gMSAmJiB1cmwuY2hhckF0KDApICE9PSAnLycpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0aGlzLmJhc2VVcmwgKyAnLycgKyB1cmw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuYmFzZVVybCArIHVybDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAvLyBpZiB3ZSBuZWVkIHRvIGFkZCBhIGRlZmF1bHQgcXVlcnlzdHJpbmcsIHRoZXJlIGlzIGEgYml0IG1vcmUgd29ya1xuICAgICAgICBpZiAodGhpcy5kZWZhdWx0UXVlcnlTdHJpbmcpIHtcbiAgICAgICAgICAgIHZhciBoYXNoID0gcmd4RXh0cmFjdFVybEhhc2guZXhlYyhyZXN1bHQpWzBdO1xuXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuc3Vic3RyKDAsIHJlc3VsdC5sZW5ndGggLSBoYXNoLmxlbmd0aCk7XG5cbiAgICAgICAgICAgIGlmIChyZXN1bHQuaW5kZXhPZignPycpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCArPSAnJicgKyB0aGlzLmRlZmF1bHRRdWVyeVN0cmluZztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9ICc/JyArIHRoaXMuZGVmYXVsdFF1ZXJ5U3RyaW5nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQgKz0gaGFzaDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIExvYWRzIGEgc2luZ2xlIHJlc291cmNlLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge1Jlc291cmNlfSByZXNvdXJjZSAtIFRoZSByZXNvdXJjZSB0byBsb2FkLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGRlcXVldWUgLSBUaGUgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHdlIG5lZWQgdG8gZGVxdWV1ZSB0aGlzIGl0ZW0uXG4gICAgICovXG5cblxuICAgIExvYWRlci5wcm90b3R5cGUuX2xvYWRSZXNvdXJjZSA9IGZ1bmN0aW9uIF9sb2FkUmVzb3VyY2UocmVzb3VyY2UsIGRlcXVldWUpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgcmVzb3VyY2UuX2RlcXVldWUgPSBkZXF1ZXVlO1xuXG4gICAgICAgIC8vIHJ1biBiZWZvcmUgbWlkZGxld2FyZVxuICAgICAgICBhc3luYy5lYWNoU2VyaWVzKHRoaXMuX2JlZm9yZU1pZGRsZXdhcmUsIGZ1bmN0aW9uIChmbiwgbmV4dCkge1xuICAgICAgICAgICAgZm4uY2FsbChfdGhpczIsIHJlc291cmNlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIGJlZm9yZSBtaWRkbGV3YXJlIG1hcmtzIHRoZSByZXNvdXJjZSBhcyBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgICAvLyBicmVhayBhbmQgZG9uJ3QgcHJvY2VzcyBhbnkgbW9yZSBiZWZvcmUgbWlkZGxld2FyZVxuICAgICAgICAgICAgICAgIG5leHQocmVzb3VyY2UuaXNDb21wbGV0ZSA/IHt9IDogbnVsbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHJlc291cmNlLmlzQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuX29uTG9hZChyZXNvdXJjZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc291cmNlLl9vbkxvYWRCaW5kaW5nID0gcmVzb3VyY2Uub25Db21wbGV0ZS5vbmNlKF90aGlzMi5fb25Mb2FkLCBfdGhpczIpO1xuICAgICAgICAgICAgICAgIHJlc291cmNlLmxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENhbGxlZCBvbmNlIGVhY2ggcmVzb3VyY2UgaGFzIGxvYWRlZC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cblxuICAgIExvYWRlci5wcm90b3R5cGUuX29uQ29tcGxldGUgPSBmdW5jdGlvbiBfb25Db21wbGV0ZSgpIHtcbiAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5vbkNvbXBsZXRlLmRpc3BhdGNoKHRoaXMsIHRoaXMucmVzb3VyY2VzKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGVhY2ggdGltZSBhIHJlc291cmNlcyBpcyBsb2FkZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7UmVzb3VyY2V9IHJlc291cmNlIC0gVGhlIHJlc291cmNlIHRoYXQgd2FzIGxvYWRlZFxuICAgICAqL1xuXG5cbiAgICBMb2FkZXIucHJvdG90eXBlLl9vbkxvYWQgPSBmdW5jdGlvbiBfb25Mb2FkKHJlc291cmNlKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIHJlc291cmNlLl9vbkxvYWRCaW5kaW5nID0gbnVsbDtcblxuICAgICAgICAvLyByZW1vdmUgdGhpcyByZXNvdXJjZSBmcm9tIHRoZSBhc3luYyBxdWV1ZSwgYW5kIGFkZCBpdCB0byBvdXIgbGlzdCBvZiByZXNvdXJjZXMgdGhhdCBhcmUgYmVpbmcgcGFyc2VkXG4gICAgICAgIHRoaXMuX3Jlc291cmNlc1BhcnNpbmcucHVzaChyZXNvdXJjZSk7XG4gICAgICAgIHJlc291cmNlLl9kZXF1ZXVlKCk7XG5cbiAgICAgICAgLy8gcnVuIGFsbCB0aGUgYWZ0ZXIgbWlkZGxld2FyZSBmb3IgdGhpcyByZXNvdXJjZVxuICAgICAgICBhc3luYy5lYWNoU2VyaWVzKHRoaXMuX2FmdGVyTWlkZGxld2FyZSwgZnVuY3Rpb24gKGZuLCBuZXh0KSB7XG4gICAgICAgICAgICBmbi5jYWxsKF90aGlzMywgcmVzb3VyY2UsIG5leHQpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXNvdXJjZS5vbkFmdGVyTWlkZGxld2FyZS5kaXNwYXRjaChyZXNvdXJjZSk7XG5cbiAgICAgICAgICAgIF90aGlzMy5wcm9ncmVzcyArPSByZXNvdXJjZS5wcm9ncmVzc0NodW5rO1xuICAgICAgICAgICAgX3RoaXMzLm9uUHJvZ3Jlc3MuZGlzcGF0Y2goX3RoaXMzLCByZXNvdXJjZSk7XG5cbiAgICAgICAgICAgIGlmIChyZXNvdXJjZS5lcnJvcikge1xuICAgICAgICAgICAgICAgIF90aGlzMy5vbkVycm9yLmRpc3BhdGNoKHJlc291cmNlLmVycm9yLCBfdGhpczMsIHJlc291cmNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX3RoaXMzLm9uTG9hZC5kaXNwYXRjaChfdGhpczMsIHJlc291cmNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX3RoaXMzLl9yZXNvdXJjZXNQYXJzaW5nLnNwbGljZShfdGhpczMuX3Jlc291cmNlc1BhcnNpbmcuaW5kZXhPZihyZXNvdXJjZSksIDEpO1xuXG4gICAgICAgICAgICAvLyBkbyBjb21wbGV0aW9uIGNoZWNrXG4gICAgICAgICAgICBpZiAoX3RoaXMzLl9xdWV1ZS5pZGxlKCkgJiYgX3RoaXMzLl9yZXNvdXJjZXNQYXJzaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIF90aGlzMy5wcm9ncmVzcyA9IE1BWF9QUk9HUkVTUztcbiAgICAgICAgICAgICAgICBfdGhpczMuX29uQ29tcGxldGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBMb2FkZXI7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IExvYWRlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUxvYWRlci5qcy5tYXAiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfcGFyc2VVcmkgPSByZXF1aXJlKCdwYXJzZS11cmknKTtcblxudmFyIF9wYXJzZVVyaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wYXJzZVVyaSk7XG5cbnZhciBfbWluaVNpZ25hbHMgPSByZXF1aXJlKCdtaW5pLXNpZ25hbHMnKTtcblxudmFyIF9taW5pU2lnbmFsczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9taW5pU2lnbmFscyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8vIHRlc3RzIGlzIENPUlMgaXMgc3VwcG9ydGVkIGluIFhIUiwgaWYgbm90IHdlIG5lZWQgdG8gdXNlIFhEUlxudmFyIHVzZVhkciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmICEhKHdpbmRvdy5YRG9tYWluUmVxdWVzdCAmJiAhKCd3aXRoQ3JlZGVudGlhbHMnIGluIG5ldyBYTUxIdHRwUmVxdWVzdCgpKSk7XG52YXIgdGVtcEFuY2hvciA9IG51bGw7XG5cbi8vIHNvbWUgc3RhdHVzIGNvbnN0YW50c1xudmFyIFNUQVRVU19OT05FID0gMDtcbnZhciBTVEFUVVNfT0sgPSAyMDA7XG52YXIgU1RBVFVTX0VNUFRZID0gMjA0O1xudmFyIFNUQVRVU19JRV9CVUdfRU1QVFkgPSAxMjIzO1xudmFyIFNUQVRVU19UWVBFX09LID0gMjtcblxuLy8gbm9vcFxuZnVuY3Rpb24gX25vb3AoKSB7fSAvKiBlbXB0eSAqL1xuXG4vKipcbiAqIE1hbmFnZXMgdGhlIHN0YXRlIGFuZCBsb2FkaW5nIG9mIGEgcmVzb3VyY2UgYW5kIGFsbCBjaGlsZCByZXNvdXJjZXMuXG4gKlxuICogQGNsYXNzXG4gKi9cblxudmFyIFJlc291cmNlID0gZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGxvYWQgdHlwZSB0byBiZSB1c2VkIGZvciBhIHNwZWNpZmljIGV4dGVuc2lvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXh0bmFtZSAtIFRoZSBleHRlbnNpb24gdG8gc2V0IHRoZSB0eXBlIGZvciwgZS5nLiBcInBuZ1wiIG9yIFwiZm50XCJcbiAgICAgKiBAcGFyYW0ge1Jlc291cmNlLkxPQURfVFlQRX0gbG9hZFR5cGUgLSBUaGUgbG9hZCB0eXBlIHRvIHNldCBpdCB0by5cbiAgICAgKi9cbiAgICBSZXNvdXJjZS5zZXRFeHRlbnNpb25Mb2FkVHlwZSA9IGZ1bmN0aW9uIHNldEV4dGVuc2lvbkxvYWRUeXBlKGV4dG5hbWUsIGxvYWRUeXBlKSB7XG4gICAgICAgIHNldEV4dE1hcChSZXNvdXJjZS5fbG9hZFR5cGVNYXAsIGV4dG5hbWUsIGxvYWRUeXBlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgbG9hZCB0eXBlIHRvIGJlIHVzZWQgZm9yIGEgc3BlY2lmaWMgZXh0ZW5zaW9uLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBleHRuYW1lIC0gVGhlIGV4dGVuc2lvbiB0byBzZXQgdGhlIHR5cGUgZm9yLCBlLmcuIFwicG5nXCIgb3IgXCJmbnRcIlxuICAgICAqIEBwYXJhbSB7UmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEV9IHhoclR5cGUgLSBUaGUgeGhyIHR5cGUgdG8gc2V0IGl0IHRvLlxuICAgICAqL1xuXG5cbiAgICBSZXNvdXJjZS5zZXRFeHRlbnNpb25YaHJUeXBlID0gZnVuY3Rpb24gc2V0RXh0ZW5zaW9uWGhyVHlwZShleHRuYW1lLCB4aHJUeXBlKSB7XG4gICAgICAgIHNldEV4dE1hcChSZXNvdXJjZS5feGhyVHlwZU1hcCwgZXh0bmFtZSwgeGhyVHlwZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIHJlc291cmNlIHRvIGxvYWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd8c3RyaW5nW119IHVybCAtIFRoZSB1cmwgZm9yIHRoaXMgcmVzb3VyY2UsIGZvciBhdWRpby92aWRlbyBsb2FkcyB5b3UgY2FuIHBhc3NcbiAgICAgKiAgICAgIGFuIGFycmF5IG9mIHNvdXJjZXMuXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAtIFRoZSBvcHRpb25zIGZvciB0aGUgbG9hZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xib29sZWFufSBbb3B0aW9ucy5jcm9zc09yaWdpbl0gLSBJcyB0aGlzIHJlcXVlc3QgY3Jvc3Mtb3JpZ2luPyBEZWZhdWx0IGlzIHRvXG4gICAgICogICAgICBkZXRlcm1pbmUgYXV0b21hdGljYWxseS5cbiAgICAgKiBAcGFyYW0ge1Jlc291cmNlLkxPQURfVFlQRX0gW29wdGlvbnMubG9hZFR5cGU9UmVzb3VyY2UuTE9BRF9UWVBFLlhIUl0gLSBIb3cgc2hvdWxkIHRoaXMgcmVzb3VyY2VcbiAgICAgKiAgICAgIGJlIGxvYWRlZD9cbiAgICAgKiBAcGFyYW0ge1Jlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFfSBbb3B0aW9ucy54aHJUeXBlPVJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRFRkFVTFRdIC0gSG93XG4gICAgICogICAgICBzaG91bGQgdGhlIGRhdGEgYmVpbmcgbG9hZGVkIGJlIGludGVycHJldGVkIHdoZW4gdXNpbmcgWEhSP1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5tZXRhZGF0YV0gLSBFeHRyYSBjb25maWd1cmF0aW9uIGZvciBtaWRkbGV3YXJlIGFuZCB0aGUgUmVzb3VyY2Ugb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7SFRNTEltYWdlRWxlbWVudHxIVE1MQXVkaW9FbGVtZW50fEhUTUxWaWRlb0VsZW1lbnR9IFtvcHRpb25zLm1ldGFkYXRhLmxvYWRFbGVtZW50PW51bGxdIC0gVGhlXG4gICAgICogICAgICBlbGVtZW50IHRvIHVzZSBmb3IgbG9hZGluZywgaW5zdGVhZCBvZiBjcmVhdGluZyBvbmUuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5tZXRhZGF0YS5za2lwU291cmNlPWZhbHNlXSAtIFNraXBzIGFkZGluZyBzb3VyY2UocykgdG8gdGhlIGxvYWQgZWxlbWVudC4gVGhpc1xuICAgICAqICAgICAgaXMgdXNlZnVsIGlmIHlvdSB3YW50IHRvIHBhc3MgaW4gYSBgbG9hZEVsZW1lbnRgIHRoYXQgeW91IGFscmVhZHkgYWRkZWQgbG9hZCBzb3VyY2VzIHRvLlxuICAgICAqL1xuXG5cbiAgICBmdW5jdGlvbiBSZXNvdXJjZShuYW1lLCB1cmwsIG9wdGlvbnMpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJlc291cmNlKTtcblxuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnIHx8IHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JvdGggbmFtZSBhbmQgdXJsIGFyZSByZXF1aXJlZCBmb3IgY29uc3RydWN0aW5nIGEgcmVzb3VyY2UuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHN0YXRlIGZsYWdzIG9mIHRoaXMgcmVzb3VyY2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2ZsYWdzID0gMDtcblxuICAgICAgICAvLyBzZXQgZGF0YSB1cmwgZmxhZywgbmVlZHMgdG8gYmUgc2V0IGVhcmx5IGZvciBzb21lIF9kZXRlcm1pbmVYIGNoZWNrcyB0byB3b3JrLlxuICAgICAgICB0aGlzLl9zZXRGbGFnKFJlc291cmNlLlNUQVRVU19GTEFHUy5EQVRBX1VSTCwgdXJsLmluZGV4T2YoJ2RhdGE6JykgPT09IDApO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgbmFtZSBvZiB0aGlzIHJlc291cmNlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtzdHJpbmd9XG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHVybCB1c2VkIHRvIGxvYWQgdGhpcyByZXNvdXJjZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7c3RyaW5nfVxuICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgZXh0ZW5zaW9uIHVzZWQgdG8gbG9hZCB0aGlzIHJlc291cmNlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtzdHJpbmd9XG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5leHRlbnNpb24gPSB0aGlzLl9nZXRFeHRlbnNpb24oKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGRhdGEgdGhhdCB3YXMgbG9hZGVkIGJ5IHRoZSByZXNvdXJjZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7YW55fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5kYXRhID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSXMgdGhpcyByZXF1ZXN0IGNyb3NzLW9yaWdpbj8gSWYgdW5zZXQsIGRldGVybWluZWQgYXV0b21hdGljYWxseS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5jcm9zc09yaWdpbiA9IG9wdGlvbnMuY3Jvc3NPcmlnaW4gPT09IHRydWUgPyAnYW5vbnltb3VzJyA6IG9wdGlvbnMuY3Jvc3NPcmlnaW47XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBtZXRob2Qgb2YgbG9hZGluZyB0byB1c2UgZm9yIHRoaXMgcmVzb3VyY2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge1Jlc291cmNlLkxPQURfVFlQRX1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubG9hZFR5cGUgPSBvcHRpb25zLmxvYWRUeXBlIHx8IHRoaXMuX2RldGVybWluZUxvYWRUeXBlKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSB0eXBlIHVzZWQgdG8gbG9hZCB0aGUgcmVzb3VyY2UgdmlhIFhIUi4gSWYgdW5zZXQsIGRldGVybWluZWQgYXV0b21hdGljYWxseS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy54aHJUeXBlID0gb3B0aW9ucy54aHJUeXBlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFeHRyYSBpbmZvIGZvciBtaWRkbGV3YXJlLCBhbmQgY29udHJvbGxpbmcgc3BlY2lmaWNzIGFib3V0IGhvdyB0aGUgcmVzb3VyY2UgbG9hZHMuXG4gICAgICAgICAqXG4gICAgICAgICAqIE5vdGUgdGhhdCBpZiB5b3UgcGFzcyBpbiBhIGBsb2FkRWxlbWVudGAsIHRoZSBSZXNvdXJjZSBjbGFzcyB0YWtlcyBvd25lcnNoaXAgb2YgaXQuXG4gICAgICAgICAqIE1lYW5pbmcgaXQgd2lsbCBtb2RpZnkgaXQgYXMgaXQgc2VlcyBmaXQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge29iamVjdH1cbiAgICAgICAgICogQHByb3BlcnR5IHtIVE1MSW1hZ2VFbGVtZW50fEhUTUxBdWRpb0VsZW1lbnR8SFRNTFZpZGVvRWxlbWVudH0gW2xvYWRFbGVtZW50PW51bGxdIC0gVGhlXG4gICAgICAgICAqICBlbGVtZW50IHRvIHVzZSBmb3IgbG9hZGluZywgaW5zdGVhZCBvZiBjcmVhdGluZyBvbmUuXG4gICAgICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW3NraXBTb3VyY2U9ZmFsc2VdIC0gU2tpcHMgYWRkaW5nIHNvdXJjZShzKSB0byB0aGUgbG9hZCBlbGVtZW50LiBUaGlzXG4gICAgICAgICAqICBpcyB1c2VmdWwgaWYgeW91IHdhbnQgdG8gcGFzcyBpbiBhIGBsb2FkRWxlbWVudGAgdGhhdCB5b3UgYWxyZWFkeSBhZGRlZCBsb2FkIHNvdXJjZXNcbiAgICAgICAgICogIHRvLlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5tZXRhZGF0YSA9IG9wdGlvbnMubWV0YWRhdGEgfHwge307XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBlcnJvciB0aGF0IG9jY3VycmVkIHdoaWxlIGxvYWRpbmcgKGlmIGFueSkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge0Vycm9yfVxuICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgWEhSIG9iamVjdCB0aGF0IHdhcyB1c2VkIHRvIGxvYWQgdGhpcyByZXNvdXJjZS4gVGhpcyBpcyBvbmx5IHNldFxuICAgICAgICAgKiB3aGVuIGBsb2FkVHlwZWAgaXMgYFJlc291cmNlLkxPQURfVFlQRS5YSFJgLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtYTUxIdHRwUmVxdWVzdH1cbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnhociA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBjaGlsZCByZXNvdXJjZXMgdGhpcyByZXNvdXJjZSBvd25zLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtSZXNvdXJjZVtdfVxuICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHJlc291cmNlIHR5cGUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge1Jlc291cmNlLlRZUEV9XG4gICAgICAgICAqIEByZWFkb25seVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50eXBlID0gUmVzb3VyY2UuVFlQRS5VTktOT1dOO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgcHJvZ3Jlc3MgY2h1bmsgb3duZWQgYnkgdGhpcyByZXNvdXJjZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7bnVtYmVyfVxuICAgICAgICAgKiBAcmVhZG9ubHlcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMucHJvZ3Jlc3NDaHVuayA9IDA7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBgZGVxdWV1ZWAgbWV0aG9kIHRoYXQgd2lsbCBiZSB1c2VkIGEgc3RvcmFnZSBwbGFjZSBmb3IgdGhlIGFzeW5jIHF1ZXVlIGRlcXVldWUgbWV0aG9kXG4gICAgICAgICAqIHVzZWQgcHJpdmF0ZWx5IGJ5IHRoZSBsb2FkZXIuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBtZW1iZXIge2Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZGVxdWV1ZSA9IF9ub29wO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVc2VkIGEgc3RvcmFnZSBwbGFjZSBmb3IgdGhlIG9uIGxvYWQgYmluZGluZyB1c2VkIHByaXZhdGVseSBieSB0aGUgbG9hZGVyLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWVtYmVyIHtmdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX29uTG9hZEJpbmRpbmcgPSBudWxsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgYGNvbXBsZXRlYCBmdW5jdGlvbiBib3VuZCB0byB0aGlzIHJlc291cmNlJ3MgY29udGV4dC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1lbWJlciB7ZnVuY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9ib3VuZENvbXBsZXRlID0gdGhpcy5jb21wbGV0ZS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgYF9vbkVycm9yYCBmdW5jdGlvbiBib3VuZCB0byB0aGlzIHJlc291cmNlJ3MgY29udGV4dC5cbiAgICAgICAgICpcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQG1lbWJlciB7ZnVuY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9ib3VuZE9uRXJyb3IgPSB0aGlzLl9vbkVycm9yLmJpbmQodGhpcyk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBgX29uUHJvZ3Jlc3NgIGZ1bmN0aW9uIGJvdW5kIHRvIHRoaXMgcmVzb3VyY2UncyBjb250ZXh0LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAbWVtYmVyIHtmdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2JvdW5kT25Qcm9ncmVzcyA9IHRoaXMuX29uUHJvZ3Jlc3MuYmluZCh0aGlzKTtcblxuICAgICAgICAvLyB4aHIgY2FsbGJhY2tzXG4gICAgICAgIHRoaXMuX2JvdW5kWGhyT25FcnJvciA9IHRoaXMuX3hock9uRXJyb3IuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fYm91bmRYaHJPbkFib3J0ID0gdGhpcy5feGhyT25BYm9ydC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9ib3VuZFhock9uTG9hZCA9IHRoaXMuX3hock9uTG9hZC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9ib3VuZFhkck9uVGltZW91dCA9IHRoaXMuX3hkck9uVGltZW91dC5iaW5kKHRoaXMpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNwYXRjaGVkIHdoZW4gdGhlIHJlc291cmNlIGJlaW5ncyB0byBsb2FkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgY2FsbGJhY2sgbG9va3MgbGlrZSB7QGxpbmsgUmVzb3VyY2UuT25TdGFydFNpZ25hbH0uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge1NpZ25hbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub25TdGFydCA9IG5ldyBfbWluaVNpZ25hbHMyLmRlZmF1bHQoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGlzcGF0Y2hlZCBlYWNoIHRpbWUgcHJvZ3Jlc3Mgb2YgdGhpcyByZXNvdXJjZSBsb2FkIHVwZGF0ZXMuXG4gICAgICAgICAqIE5vdCBhbGwgcmVzb3VyY2VzIHR5cGVzIGFuZCBsb2FkZXIgc3lzdGVtcyBjYW4gc3VwcG9ydCB0aGlzIGV2ZW50XG4gICAgICAgICAqIHNvIHNvbWV0aW1lcyBpdCBtYXkgbm90IGJlIGF2YWlsYWJsZS4gSWYgdGhlIHJlc291cmNlXG4gICAgICAgICAqIGlzIGJlaW5nIGxvYWRlZCBvbiBhIG1vZGVybiBicm93c2VyLCB1c2luZyBYSFIsIGFuZCB0aGUgcmVtb3RlIHNlcnZlclxuICAgICAgICAgKiBwcm9wZXJseSBzZXRzIENvbnRlbnQtTGVuZ3RoIGhlYWRlcnMsIHRoZW4gdGhpcyB3aWxsIGJlIGF2YWlsYWJsZS5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhlIGNhbGxiYWNrIGxvb2tzIGxpa2Uge0BsaW5rIFJlc291cmNlLk9uUHJvZ3Jlc3NTaWduYWx9LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyIHtTaWduYWx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9uUHJvZ3Jlc3MgPSBuZXcgX21pbmlTaWduYWxzMi5kZWZhdWx0KCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc3BhdGNoZWQgb25jZSB0aGlzIHJlc291cmNlIGhhcyBsb2FkZWQsIGlmIHRoZXJlIHdhcyBhbiBlcnJvciBpdCB3aWxsXG4gICAgICAgICAqIGJlIGluIHRoZSBgZXJyb3JgIHByb3BlcnR5LlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgY2FsbGJhY2sgbG9va3MgbGlrZSB7QGxpbmsgUmVzb3VyY2UuT25Db21wbGV0ZVNpZ25hbH0uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge1NpZ25hbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub25Db21wbGV0ZSA9IG5ldyBfbWluaVNpZ25hbHMyLmRlZmF1bHQoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGlzcGF0Y2hlZCBhZnRlciB0aGlzIHJlc291cmNlIGhhcyBoYWQgYWxsIHRoZSAqYWZ0ZXIqIG1pZGRsZXdhcmUgcnVuIG9uIGl0LlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgY2FsbGJhY2sgbG9va3MgbGlrZSB7QGxpbmsgUmVzb3VyY2UuT25Db21wbGV0ZVNpZ25hbH0uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXIge1NpZ25hbH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub25BZnRlck1pZGRsZXdhcmUgPSBuZXcgX21pbmlTaWduYWxzMi5kZWZhdWx0KCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZW4gdGhlIHJlc291cmNlIHN0YXJ0cyB0byBsb2FkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWVtYmVyb2YgUmVzb3VyY2VcbiAgICAgICAgICogQGNhbGxiYWNrIE9uU3RhcnRTaWduYWxcbiAgICAgICAgICogQHBhcmFtIHtSZXNvdXJjZX0gcmVzb3VyY2UgLSBUaGUgcmVzb3VyY2UgdGhhdCB0aGUgZXZlbnQgaGFwcGVuZWQgb24uXG4gICAgICAgICAqL1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGVuIHRoZSByZXNvdXJjZSByZXBvcnRzIGxvYWRpbmcgcHJvZ3Jlc3MuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJvZiBSZXNvdXJjZVxuICAgICAgICAgKiBAY2FsbGJhY2sgT25Qcm9ncmVzc1NpZ25hbFxuICAgICAgICAgKiBAcGFyYW0ge1Jlc291cmNlfSByZXNvdXJjZSAtIFRoZSByZXNvdXJjZSB0aGF0IHRoZSBldmVudCBoYXBwZW5lZCBvbi5cbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IHBlcmNlbnRhZ2UgLSBUaGUgcHJvZ3Jlc3Mgb2YgdGhlIGxvYWQgaW4gdGhlIHJhbmdlIFswLCAxXS5cbiAgICAgICAgICovXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFdoZW4gdGhlIHJlc291cmNlIGZpbmlzaGVzIGxvYWRpbmcuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZW1iZXJvZiBSZXNvdXJjZVxuICAgICAgICAgKiBAY2FsbGJhY2sgT25Db21wbGV0ZVNpZ25hbFxuICAgICAgICAgKiBAcGFyYW0ge1Jlc291cmNlfSByZXNvdXJjZSAtIFRoZSByZXNvdXJjZSB0aGF0IHRoZSBldmVudCBoYXBwZW5lZCBvbi5cbiAgICAgICAgICovXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RvcmVzIHdoZXRoZXIgb3Igbm90IHRoaXMgdXJsIGlzIGEgZGF0YSB1cmwuXG4gICAgICpcbiAgICAgKiBAbWVtYmVyIHtib29sZWFufVxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuXG5cbiAgICAvKipcbiAgICAgKiBNYXJrcyB0aGUgcmVzb3VyY2UgYXMgY29tcGxldGUuXG4gICAgICpcbiAgICAgKi9cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbiBjb21wbGV0ZSgpIHtcbiAgICAgICAgLy8gVE9ETzogQ2xlYW4gdGhpcyB1cCBpbiBhIHdyYXBwZXIgb3Igc29tZXRoaW5nLi4uZ3Jvc3MuLi4uXG4gICAgICAgIGlmICh0aGlzLmRhdGEgJiYgdGhpcy5kYXRhLnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2JvdW5kT25FcnJvciwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5kYXRhLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCB0aGlzLl9ib3VuZENvbXBsZXRlLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmRhdGEucmVtb3ZlRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCB0aGlzLl9ib3VuZE9uUHJvZ3Jlc3MsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIHRoaXMuX2JvdW5kQ29tcGxldGUsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnhocikge1xuICAgICAgICAgICAgaWYgKHRoaXMueGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2JvdW5kWGhyT25FcnJvciwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHRoaXMueGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgdGhpcy5fYm91bmRYaHJPbkFib3J0LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgdGhpcy54aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCB0aGlzLl9ib3VuZE9uUHJvZ3Jlc3MsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcy5fYm91bmRYaHJPbkxvYWQsIGZhbHNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy54aHIub25lcnJvciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy54aHIub250aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnhoci5vbnByb2dyZXNzID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnhoci5vbmxvYWQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNDb21wbGV0ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wbGV0ZSBjYWxsZWQgYWdhaW4gZm9yIGFuIGFscmVhZHkgY29tcGxldGVkIHJlc291cmNlLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2V0RmxhZyhSZXNvdXJjZS5TVEFUVVNfRkxBR1MuQ09NUExFVEUsIHRydWUpO1xuICAgICAgICB0aGlzLl9zZXRGbGFnKFJlc291cmNlLlNUQVRVU19GTEFHUy5MT0FESU5HLCBmYWxzZSk7XG5cbiAgICAgICAgdGhpcy5vbkNvbXBsZXRlLmRpc3BhdGNoKHRoaXMpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBYm9ydHMgdGhlIGxvYWRpbmcgb2YgdGhpcyByZXNvdXJjZSwgd2l0aCBhbiBvcHRpb25hbCBtZXNzYWdlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0byB1c2UgZm9yIHRoZSBlcnJvclxuICAgICAqL1xuXG5cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbiBhYm9ydChtZXNzYWdlKSB7XG4gICAgICAgIC8vIGFib3J0IGNhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMsIGlnbm9yZSBzdWJzZXF1ZW50IGNhbGxzLlxuICAgICAgICBpZiAodGhpcy5lcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RvcmUgZXJyb3JcbiAgICAgICAgdGhpcy5lcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcblxuICAgICAgICAvLyBhYm9ydCB0aGUgYWN0dWFsIGxvYWRpbmdcbiAgICAgICAgaWYgKHRoaXMueGhyKSB7XG4gICAgICAgICAgICB0aGlzLnhoci5hYm9ydCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMueGRyKSB7XG4gICAgICAgICAgICB0aGlzLnhkci5hYm9ydCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZGF0YSkge1xuICAgICAgICAgICAgLy8gc2luZ2xlIHNvdXJjZVxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YS5zcmMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEuc3JjID0gUmVzb3VyY2UuRU1QVFlfR0lGO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gbXVsdGktc291cmNlXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHRoaXMuZGF0YS5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGEucmVtb3ZlQ2hpbGQodGhpcy5kYXRhLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZG9uZSBub3cuXG4gICAgICAgIHRoaXMuY29tcGxldGUoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogS2lja3Mgb2ZmIGxvYWRpbmcgb2YgdGhpcyByZXNvdXJjZS4gVGhpcyBtZXRob2QgaXMgYXN5bmNocm9ub3VzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gW2NiXSAtIE9wdGlvbmFsIGNhbGxiYWNrIHRvIGNhbGwgb25jZSB0aGUgcmVzb3VyY2UgaXMgbG9hZGVkLlxuICAgICAqL1xuXG5cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uIGxvYWQoY2IpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBpZiAodGhpcy5pc0xvYWRpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzQ29tcGxldGUpIHtcbiAgICAgICAgICAgIGlmIChjYikge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2IoX3RoaXMpO1xuICAgICAgICAgICAgICAgIH0sIDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoY2IpIHtcbiAgICAgICAgICAgIHRoaXMub25Db21wbGV0ZS5vbmNlKGNiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3NldEZsYWcoUmVzb3VyY2UuU1RBVFVTX0ZMQUdTLkxPQURJTkcsIHRydWUpO1xuXG4gICAgICAgIHRoaXMub25TdGFydC5kaXNwYXRjaCh0aGlzKTtcblxuICAgICAgICAvLyBpZiB1bnNldCwgZGV0ZXJtaW5lIHRoZSB2YWx1ZVxuICAgICAgICBpZiAodGhpcy5jcm9zc09yaWdpbiA9PT0gZmFsc2UgfHwgdHlwZW9mIHRoaXMuY3Jvc3NPcmlnaW4gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aGlzLmNyb3NzT3JpZ2luID0gdGhpcy5fZGV0ZXJtaW5lQ3Jvc3NPcmlnaW4odGhpcy51cmwpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLmxvYWRUeXBlKSB7XG4gICAgICAgICAgICBjYXNlIFJlc291cmNlLkxPQURfVFlQRS5JTUFHRTpcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUgPSBSZXNvdXJjZS5UWVBFLklNQUdFO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRFbGVtZW50KCdpbWFnZScpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJlc291cmNlLkxPQURfVFlQRS5BVURJTzpcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUgPSBSZXNvdXJjZS5UWVBFLkFVRElPO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRTb3VyY2VFbGVtZW50KCdhdWRpbycpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJlc291cmNlLkxPQURfVFlQRS5WSURFTzpcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGUgPSBSZXNvdXJjZS5UWVBFLlZJREVPO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRTb3VyY2VFbGVtZW50KCd2aWRlbycpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFJlc291cmNlLkxPQURfVFlQRS5YSFI6XG4gICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGlmICh1c2VYZHIgJiYgdGhpcy5jcm9zc09yaWdpbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2FkWGRyKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9hZFhocigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhlIGZsYWcgaXMgc2V0LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZmxhZyAtIFRoZSBmbGFnIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIGZsYWcgaXMgc2V0LlxuICAgICAqL1xuXG5cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuX2hhc0ZsYWcgPSBmdW5jdGlvbiBfaGFzRmxhZyhmbGFnKSB7XG4gICAgICAgIHJldHVybiAhISh0aGlzLl9mbGFncyAmIGZsYWcpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiAoVW4pU2V0cyB0aGUgZmxhZy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGZsYWcgLSBUaGUgZmxhZyB0byAodW4pc2V0LlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWUgLSBXaGV0aGVyIHRvIHNldCBvciAodW4pc2V0IHRoZSBmbGFnLlxuICAgICAqL1xuXG5cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuX3NldEZsYWcgPSBmdW5jdGlvbiBfc2V0RmxhZyhmbGFnLCB2YWx1ZSkge1xuICAgICAgICB0aGlzLl9mbGFncyA9IHZhbHVlID8gdGhpcy5fZmxhZ3MgfCBmbGFnIDogdGhpcy5fZmxhZ3MgJiB+ZmxhZztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGhpcyByZXNvdXJjZXMgdXNpbmcgYW4gZWxlbWVudCB0aGF0IGhhcyBhIHNpbmdsZSBzb3VyY2UsXG4gICAgICogbGlrZSBhbiBIVE1MSW1hZ2VFbGVtZW50LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFRoZSB0eXBlIG9mIGVsZW1lbnQgdG8gdXNlLlxuICAgICAqL1xuXG5cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuX2xvYWRFbGVtZW50ID0gZnVuY3Rpb24gX2xvYWRFbGVtZW50KHR5cGUpIHtcbiAgICAgICAgaWYgKHRoaXMubWV0YWRhdGEubG9hZEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMubWV0YWRhdGEubG9hZEVsZW1lbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2ltYWdlJyAmJiB0eXBlb2Ygd2luZG93LkltYWdlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IEltYWdlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY3Jvc3NPcmlnaW4pIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5jcm9zc09yaWdpbiA9IHRoaXMuY3Jvc3NPcmlnaW47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMubWV0YWRhdGEuc2tpcFNvdXJjZSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhLnNyYyA9IHRoaXMudXJsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kYXRhLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fYm91bmRPbkVycm9yLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZGF0YS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgdGhpcy5fYm91bmRDb21wbGV0ZSwgZmFsc2UpO1xuICAgICAgICB0aGlzLmRhdGEuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCB0aGlzLl9ib3VuZE9uUHJvZ3Jlc3MsIGZhbHNlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGhpcyByZXNvdXJjZXMgdXNpbmcgYW4gZWxlbWVudCB0aGF0IGhhcyBtdWx0aXBsZSBzb3VyY2VzLFxuICAgICAqIGxpa2UgYW4gSFRNTEF1ZGlvRWxlbWVudCBvciBIVE1MVmlkZW9FbGVtZW50LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFRoZSB0eXBlIG9mIGVsZW1lbnQgdG8gdXNlLlxuICAgICAqL1xuXG5cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuX2xvYWRTb3VyY2VFbGVtZW50ID0gZnVuY3Rpb24gX2xvYWRTb3VyY2VFbGVtZW50KHR5cGUpIHtcbiAgICAgICAgaWYgKHRoaXMubWV0YWRhdGEubG9hZEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IHRoaXMubWV0YWRhdGEubG9hZEVsZW1lbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2F1ZGlvJyAmJiB0eXBlb2Ygd2luZG93LkF1ZGlvICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IEF1ZGlvKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5hYm9ydCgnVW5zdXBwb3J0ZWQgZWxlbWVudDogJyArIHR5cGUpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMubWV0YWRhdGEuc2tpcFNvdXJjZSkge1xuICAgICAgICAgICAgLy8gc3VwcG9ydCBmb3IgQ29jb29uSlMgQ2FudmFzKyBydW50aW1lLCBsYWNrcyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzb3VyY2UnKVxuICAgICAgICAgICAgaWYgKG5hdmlnYXRvci5pc0NvY29vbkpTKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhLnNyYyA9IEFycmF5LmlzQXJyYXkodGhpcy51cmwpID8gdGhpcy51cmxbMF0gOiB0aGlzLnVybDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnVybCkpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudXJsLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5hcHBlbmRDaGlsZCh0aGlzLl9jcmVhdGVTb3VyY2UodHlwZSwgdGhpcy51cmxbaV0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5hcHBlbmRDaGlsZCh0aGlzLl9jcmVhdGVTb3VyY2UodHlwZSwgdGhpcy51cmwpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZGF0YS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2JvdW5kT25FcnJvciwgZmFsc2UpO1xuICAgICAgICB0aGlzLmRhdGEuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuX2JvdW5kQ29tcGxldGUsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5kYXRhLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgdGhpcy5fYm91bmRPblByb2dyZXNzLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuZGF0YS5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIHRoaXMuX2JvdW5kQ29tcGxldGUsIGZhbHNlKTtcblxuICAgICAgICB0aGlzLmRhdGEubG9hZCgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyB0aGlzIHJlc291cmNlcyB1c2luZyBhbiBYTUxIdHRwUmVxdWVzdC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cblxuICAgIFJlc291cmNlLnByb3RvdHlwZS5fbG9hZFhociA9IGZ1bmN0aW9uIF9sb2FkWGhyKCkge1xuICAgICAgICAvLyBpZiB1bnNldCwgZGV0ZXJtaW5lIHRoZSB2YWx1ZVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMueGhyVHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRoaXMueGhyVHlwZSA9IHRoaXMuX2RldGVybWluZVhoclR5cGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB4aHIgPSB0aGlzLnhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgIC8vIHNldCB0aGUgcmVxdWVzdCB0eXBlIGFuZCB1cmxcbiAgICAgICAgeGhyLm9wZW4oJ0dFVCcsIHRoaXMudXJsLCB0cnVlKTtcblxuICAgICAgICAvLyBsb2FkIGpzb24gYXMgdGV4dCBhbmQgcGFyc2UgaXQgb3Vyc2VsdmVzLiBXZSBkbyB0aGlzIGJlY2F1c2Ugc29tZSBicm93c2Vyc1xuICAgICAgICAvLyAqY291Z2gqIHNhZmFyaSAqY291Z2gqIGNhbid0IGRlYWwgd2l0aCBpdC5cbiAgICAgICAgaWYgKHRoaXMueGhyVHlwZSA9PT0gUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuSlNPTiB8fCB0aGlzLnhoclR5cGUgPT09IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5UKSB7XG4gICAgICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuVEVYVDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSB0aGlzLnhoclR5cGU7XG4gICAgICAgIH1cblxuICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLl9ib3VuZFhock9uRXJyb3IsIGZhbHNlKTtcbiAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgdGhpcy5fYm91bmRYaHJPbkFib3J0LCBmYWxzZSk7XG4gICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIHRoaXMuX2JvdW5kT25Qcm9ncmVzcywgZmFsc2UpO1xuICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHRoaXMuX2JvdW5kWGhyT25Mb2FkLCBmYWxzZSk7XG5cbiAgICAgICAgeGhyLnNlbmQoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGhpcyByZXNvdXJjZXMgdXNpbmcgYW4gWERvbWFpblJlcXVlc3QuIFRoaXMgaXMgaGVyZSBiZWNhdXNlIHdlIG5lZWQgdG8gc3VwcG9ydCBJRTkgKGdyb3NzKS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cblxuICAgIFJlc291cmNlLnByb3RvdHlwZS5fbG9hZFhkciA9IGZ1bmN0aW9uIF9sb2FkWGRyKCkge1xuICAgICAgICAvLyBpZiB1bnNldCwgZGV0ZXJtaW5lIHRoZSB2YWx1ZVxuICAgICAgICBpZiAodHlwZW9mIHRoaXMueGhyVHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRoaXMueGhyVHlwZSA9IHRoaXMuX2RldGVybWluZVhoclR5cGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB4ZHIgPSB0aGlzLnhociA9IG5ldyBYRG9tYWluUmVxdWVzdCgpO1xuXG4gICAgICAgIC8vIFhEb21haW5SZXF1ZXN0IGhhcyBhIGZldyBxdWlya3MuIE9jY2FzaW9uYWxseSBpdCB3aWxsIGFib3J0IHJlcXVlc3RzXG4gICAgICAgIC8vIEEgd2F5IHRvIGF2b2lkIHRoaXMgaXMgdG8gbWFrZSBzdXJlIEFMTCBjYWxsYmFja3MgYXJlIHNldCBldmVuIGlmIG5vdCB1c2VkXG4gICAgICAgIC8vIE1vcmUgaW5mbyBoZXJlOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1Nzg2OTY2L3hkb21haW5yZXF1ZXN0LWFib3J0cy1wb3N0LW9uLWllLTlcbiAgICAgICAgeGRyLnRpbWVvdXQgPSA1MDAwO1xuXG4gICAgICAgIHhkci5vbmVycm9yID0gdGhpcy5fYm91bmRYaHJPbkVycm9yO1xuICAgICAgICB4ZHIub250aW1lb3V0ID0gdGhpcy5fYm91bmRYZHJPblRpbWVvdXQ7XG4gICAgICAgIHhkci5vbnByb2dyZXNzID0gdGhpcy5fYm91bmRPblByb2dyZXNzO1xuICAgICAgICB4ZHIub25sb2FkID0gdGhpcy5fYm91bmRYaHJPbkxvYWQ7XG5cbiAgICAgICAgeGRyLm9wZW4oJ0dFVCcsIHRoaXMudXJsLCB0cnVlKTtcblxuICAgICAgICAvLyBOb3RlOiBUaGUgeGRyLnNlbmQoKSBjYWxsIGlzIHdyYXBwZWQgaW4gYSB0aW1lb3V0IHRvIHByZXZlbnQgYW5cbiAgICAgICAgLy8gaXNzdWUgd2l0aCB0aGUgaW50ZXJmYWNlIHdoZXJlIHNvbWUgcmVxdWVzdHMgYXJlIGxvc3QgaWYgbXVsdGlwbGVcbiAgICAgICAgLy8gWERvbWFpblJlcXVlc3RzIGFyZSBiZWluZyBzZW50IGF0IHRoZSBzYW1lIHRpbWUuXG4gICAgICAgIC8vIFNvbWUgaW5mbyBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vcGhvdG9uc3Rvcm0vcGhhc2VyL2lzc3Vlcy8xMjQ4XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHhkci5zZW5kKCk7XG4gICAgICAgIH0sIDEpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgc291cmNlIHVzZWQgaW4gbG9hZGluZyB2aWEgYW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgLSBUaGUgZWxlbWVudCB0eXBlICh2aWRlbyBvciBhdWRpbykuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFRoZSBzb3VyY2UgVVJMIHRvIGxvYWQgZnJvbS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW21pbWVdIC0gVGhlIG1pbWUgdHlwZSBvZiB0aGUgdmlkZW9cbiAgICAgKiBAcmV0dXJuIHtIVE1MU291cmNlRWxlbWVudH0gVGhlIHNvdXJjZSBlbGVtZW50LlxuICAgICAqL1xuXG5cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuX2NyZWF0ZVNvdXJjZSA9IGZ1bmN0aW9uIF9jcmVhdGVTb3VyY2UodHlwZSwgdXJsLCBtaW1lKSB7XG4gICAgICAgIGlmICghbWltZSkge1xuICAgICAgICAgICAgbWltZSA9IHR5cGUgKyAnLycgKyB1cmwuc3Vic3RyKHVybC5sYXN0SW5kZXhPZignLicpICsgMSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc291cmNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc291cmNlJyk7XG5cbiAgICAgICAgc291cmNlLnNyYyA9IHVybDtcbiAgICAgICAgc291cmNlLnR5cGUgPSBtaW1lO1xuXG4gICAgICAgIHJldHVybiBzb3VyY2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENhbGxlZCBpZiBhIGxvYWQgZXJyb3JzIG91dC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gVGhlIGVycm9yIGV2ZW50IGZyb20gdGhlIGVsZW1lbnQgdGhhdCBlbWl0cyBpdC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG5cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuX29uRXJyb3IgPSBmdW5jdGlvbiBfb25FcnJvcihldmVudCkge1xuICAgICAgICB0aGlzLmFib3J0KCdGYWlsZWQgdG8gbG9hZCBlbGVtZW50IHVzaW5nOiAnICsgZXZlbnQudGFyZ2V0Lm5vZGVOYW1lKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGlmIGEgbG9hZCBwcm9ncmVzcyBldmVudCBmaXJlcyBmb3IgeGhyL3hkci5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtYTUxIdHRwUmVxdWVzdFByb2dyZXNzRXZlbnR8RXZlbnR9IGV2ZW50IC0gUHJvZ3Jlc3MgZXZlbnQuXG4gICAgICovXG5cblxuICAgIFJlc291cmNlLnByb3RvdHlwZS5fb25Qcm9ncmVzcyA9IGZ1bmN0aW9uIF9vblByb2dyZXNzKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudCAmJiBldmVudC5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgICB0aGlzLm9uUHJvZ3Jlc3MuZGlzcGF0Y2godGhpcywgZXZlbnQubG9hZGVkIC8gZXZlbnQudG90YWwpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENhbGxlZCBpZiBhbiBlcnJvciBldmVudCBmaXJlcyBmb3IgeGhyL3hkci5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtYTUxIdHRwUmVxdWVzdEVycm9yRXZlbnR8RXZlbnR9IGV2ZW50IC0gRXJyb3IgZXZlbnQuXG4gICAgICovXG5cblxuICAgIFJlc291cmNlLnByb3RvdHlwZS5feGhyT25FcnJvciA9IGZ1bmN0aW9uIF94aHJPbkVycm9yKCkge1xuICAgICAgICB2YXIgeGhyID0gdGhpcy54aHI7XG5cbiAgICAgICAgdGhpcy5hYm9ydChyZXFUeXBlKHhocikgKyAnIFJlcXVlc3QgZmFpbGVkLiBTdGF0dXM6ICcgKyB4aHIuc3RhdHVzICsgJywgdGV4dDogXCInICsgeGhyLnN0YXR1c1RleHQgKyAnXCInKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIGlmIGFuIGFib3J0IGV2ZW50IGZpcmVzIGZvciB4aHIuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3RBYm9ydEV2ZW50fSBldmVudCAtIEFib3J0IEV2ZW50XG4gICAgICovXG5cblxuICAgIFJlc291cmNlLnByb3RvdHlwZS5feGhyT25BYm9ydCA9IGZ1bmN0aW9uIF94aHJPbkFib3J0KCkge1xuICAgICAgICB0aGlzLmFib3J0KHJlcVR5cGUodGhpcy54aHIpICsgJyBSZXF1ZXN0IHdhcyBhYm9ydGVkIGJ5IHRoZSB1c2VyLicpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgaWYgYSB0aW1lb3V0IGV2ZW50IGZpcmVzIGZvciB4ZHIuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gVGltZW91dCBldmVudC5cbiAgICAgKi9cblxuXG4gICAgUmVzb3VyY2UucHJvdG90eXBlLl94ZHJPblRpbWVvdXQgPSBmdW5jdGlvbiBfeGRyT25UaW1lb3V0KCkge1xuICAgICAgICB0aGlzLmFib3J0KHJlcVR5cGUodGhpcy54aHIpICsgJyBSZXF1ZXN0IHRpbWVkIG91dC4nKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2FsbGVkIHdoZW4gZGF0YSBzdWNjZXNzZnVsbHkgbG9hZHMgZnJvbSBhbiB4aHIveGRyIHJlcXVlc3QuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3RMb2FkRXZlbnR8RXZlbnR9IGV2ZW50IC0gTG9hZCBldmVudFxuICAgICAqL1xuXG5cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuX3hock9uTG9hZCA9IGZ1bmN0aW9uIF94aHJPbkxvYWQoKSB7XG4gICAgICAgIHZhciB4aHIgPSB0aGlzLnhocjtcbiAgICAgICAgdmFyIHRleHQgPSAnJztcbiAgICAgICAgdmFyIHN0YXR1cyA9IHR5cGVvZiB4aHIuc3RhdHVzID09PSAndW5kZWZpbmVkJyA/IFNUQVRVU19PSyA6IHhoci5zdGF0dXM7IC8vIFhEUiBoYXMgbm8gYC5zdGF0dXNgLCBhc3N1bWUgMjAwLlxuXG4gICAgICAgIC8vIHJlc3BvbnNlVGV4dCBpcyBhY2Nlc3NpYmxlIG9ubHkgaWYgcmVzcG9uc2VUeXBlIGlzICcnIG9yICd0ZXh0JyBhbmQgb24gb2xkZXIgYnJvd3NlcnNcbiAgICAgICAgaWYgKHhoci5yZXNwb25zZVR5cGUgPT09ICcnIHx8IHhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCB0eXBlb2YgeGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RhdHVzIGNhbiBiZSAwIHdoZW4gdXNpbmcgdGhlIGBmaWxlOi8vYCBwcm90b2NvbCBzbyB3ZSBhbHNvIGNoZWNrIGlmIGEgcmVzcG9uc2UgaXMgc2V0LlxuICAgICAgICAvLyBJZiBpdCBoYXMgYSByZXNwb25zZSwgd2UgYXNzdW1lIDIwMDsgb3RoZXJ3aXNlIGEgMCBzdGF0dXMgY29kZSB3aXRoIG5vIGNvbnRlbnRzIGlzIGFuIGFib3J0ZWQgcmVxdWVzdC5cbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gU1RBVFVTX05PTkUgJiYgdGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzdGF0dXMgPSBTVEFUVVNfT0s7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaGFuZGxlIElFOSBidWc6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAwNDY5NzIvbXNpZS1yZXR1cm5zLXN0YXR1cy1jb2RlLW9mLTEyMjMtZm9yLWFqYXgtcmVxdWVzdFxuICAgICAgICBlbHNlIGlmIChzdGF0dXMgPT09IFNUQVRVU19JRV9CVUdfRU1QVFkpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSBTVEFUVVNfRU1QVFk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0YXR1c1R5cGUgPSBzdGF0dXMgLyAxMDAgfCAwO1xuXG4gICAgICAgIGlmIChzdGF0dXNUeXBlID09PSBTVEFUVVNfVFlQRV9PSykge1xuICAgICAgICAgICAgLy8gaWYgdGV4dCwganVzdCByZXR1cm4gaXRcbiAgICAgICAgICAgIGlmICh0aGlzLnhoclR5cGUgPT09IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLlRFWFQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSB0ZXh0O1xuICAgICAgICAgICAgICAgIHRoaXMudHlwZSA9IFJlc291cmNlLlRZUEUuVEVYVDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIGpzb24sIHBhcnNlIGludG8ganNvbiBvYmplY3RcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMueGhyVHlwZSA9PT0gUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuSlNPTikge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZSA9IFJlc291cmNlLlRZUEUuSlNPTjtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hYm9ydCgnRXJyb3IgdHJ5aW5nIHRvIHBhcnNlIGxvYWRlZCBqc29uOiAnICsgZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBpZiB4bWwsIHBhcnNlIGludG8gYW4geG1sIGRvY3VtZW50IG9yIGRpdiBlbGVtZW50XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy54aHJUeXBlID09PSBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5ET0NVTUVOVCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93LkRPTVBhcnNlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZG9tcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IGRvbXBhcnNlci5wYXJzZUZyb21TdHJpbmcodGV4dCwgJ3RleHQveG1sJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpdi5pbm5lckhUTUwgPSB0ZXh0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IGRpdjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGUgPSBSZXNvdXJjZS5UWVBFLlhNTDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFib3J0KCdFcnJvciB0cnlpbmcgdG8gcGFyc2UgbG9hZGVkIHhtbDogJyArIGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIG90aGVyIHR5cGVzIGp1c3QgcmV0dXJuIHRoZSByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSB4aHIucmVzcG9uc2UgfHwgdGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWJvcnQoJ1snICsgeGhyLnN0YXR1cyArICddICcgKyB4aHIuc3RhdHVzVGV4dCArICc6ICcgKyB4aHIucmVzcG9uc2VVUkwpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbXBsZXRlKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGBjcm9zc09yaWdpbmAgcHJvcGVydHkgZm9yIHRoaXMgcmVzb3VyY2UgYmFzZWQgb24gaWYgdGhlIHVybFxuICAgICAqIGZvciB0aGlzIHJlc291cmNlIGlzIGNyb3NzLW9yaWdpbi4gSWYgY3Jvc3NPcmlnaW4gd2FzIG1hbnVhbGx5IHNldCwgdGhpc1xuICAgICAqIGZ1bmN0aW9uIGRvZXMgbm90aGluZy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFRoZSB1cmwgdG8gdGVzdC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW2xvYz13aW5kb3cubG9jYXRpb25dIC0gVGhlIGxvY2F0aW9uIG9iamVjdCB0byB0ZXN0IGFnYWluc3QuXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgY3Jvc3NPcmlnaW4gdmFsdWUgdG8gdXNlIChvciBlbXB0eSBzdHJpbmcgZm9yIG5vbmUpLlxuICAgICAqL1xuXG5cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuX2RldGVybWluZUNyb3NzT3JpZ2luID0gZnVuY3Rpb24gX2RldGVybWluZUNyb3NzT3JpZ2luKHVybCwgbG9jKSB7XG4gICAgICAgIC8vIGRhdGE6IGFuZCBqYXZhc2NyaXB0OiB1cmxzIGFyZSBjb25zaWRlcmVkIHNhbWUtb3JpZ2luXG4gICAgICAgIGlmICh1cmwuaW5kZXhPZignZGF0YTonKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGVmYXVsdCBpcyB3aW5kb3cubG9jYXRpb25cbiAgICAgICAgbG9jID0gbG9jIHx8IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbjtcblxuICAgICAgICBpZiAoIXRlbXBBbmNob3IpIHtcbiAgICAgICAgICAgIHRlbXBBbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBsZXQgdGhlIGJyb3dzZXIgZGV0ZXJtaW5lIHRoZSBmdWxsIGhyZWYgZm9yIHRoZSB1cmwgb2YgdGhpcyByZXNvdXJjZSBhbmQgdGhlblxuICAgICAgICAvLyBwYXJzZSB3aXRoIHRoZSBub2RlIHVybCBsaWIsIHdlIGNhbid0IHVzZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgYW5jaG9yIGVsZW1lbnRcbiAgICAgICAgLy8gYmVjYXVzZSB0aGV5IGRvbid0IHdvcmsgaW4gSUU5IDooXG4gICAgICAgIHRlbXBBbmNob3IuaHJlZiA9IHVybDtcbiAgICAgICAgdXJsID0gKDAsIF9wYXJzZVVyaTIuZGVmYXVsdCkodGVtcEFuY2hvci5ocmVmLCB7IHN0cmljdE1vZGU6IHRydWUgfSk7XG5cbiAgICAgICAgdmFyIHNhbWVQb3J0ID0gIXVybC5wb3J0ICYmIGxvYy5wb3J0ID09PSAnJyB8fCB1cmwucG9ydCA9PT0gbG9jLnBvcnQ7XG4gICAgICAgIHZhciBwcm90b2NvbCA9IHVybC5wcm90b2NvbCA/IHVybC5wcm90b2NvbCArICc6JyA6ICcnO1xuXG4gICAgICAgIC8vIGlmIGNyb3NzIG9yaWdpblxuICAgICAgICBpZiAodXJsLmhvc3QgIT09IGxvYy5ob3N0bmFtZSB8fCAhc2FtZVBvcnQgfHwgcHJvdG9jb2wgIT09IGxvYy5wcm90b2NvbCkge1xuICAgICAgICAgICAgcmV0dXJuICdhbm9ueW1vdXMnO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHRoZSByZXNwb25zZVR5cGUgb2YgYW4gWEhSIHJlcXVlc3QgYmFzZWQgb24gdGhlIGV4dGVuc2lvbiBvZiB0aGVcbiAgICAgKiByZXNvdXJjZSBiZWluZyBsb2FkZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEByZXR1cm4ge1Jlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFfSBUaGUgcmVzcG9uc2VUeXBlIHRvIHVzZS5cbiAgICAgKi9cblxuXG4gICAgUmVzb3VyY2UucHJvdG90eXBlLl9kZXRlcm1pbmVYaHJUeXBlID0gZnVuY3Rpb24gX2RldGVybWluZVhoclR5cGUoKSB7XG4gICAgICAgIHJldHVybiBSZXNvdXJjZS5feGhyVHlwZU1hcFt0aGlzLmV4dGVuc2lvbl0gfHwgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuVEVYVDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB0aGUgbG9hZFR5cGUgb2YgYSByZXNvdXJjZSBiYXNlZCBvbiB0aGUgZXh0ZW5zaW9uIG9mIHRoZVxuICAgICAqIHJlc291cmNlIGJlaW5nIGxvYWRlZC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybiB7UmVzb3VyY2UuTE9BRF9UWVBFfSBUaGUgbG9hZFR5cGUgdG8gdXNlLlxuICAgICAqL1xuXG5cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuX2RldGVybWluZUxvYWRUeXBlID0gZnVuY3Rpb24gX2RldGVybWluZUxvYWRUeXBlKCkge1xuICAgICAgICByZXR1cm4gUmVzb3VyY2UuX2xvYWRUeXBlTWFwW3RoaXMuZXh0ZW5zaW9uXSB8fCBSZXNvdXJjZS5MT0FEX1RZUEUuWEhSO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBFeHRyYWN0cyB0aGUgZXh0ZW5zaW9uIChzYW5zICcuJykgb2YgdGhlIGZpbGUgYmVpbmcgbG9hZGVkIGJ5IHRoZSByZXNvdXJjZS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgZXh0ZW5zaW9uLlxuICAgICAqL1xuXG5cbiAgICBSZXNvdXJjZS5wcm90b3R5cGUuX2dldEV4dGVuc2lvbiA9IGZ1bmN0aW9uIF9nZXRFeHRlbnNpb24oKSB7XG4gICAgICAgIHZhciB1cmwgPSB0aGlzLnVybDtcbiAgICAgICAgdmFyIGV4dCA9ICcnO1xuXG4gICAgICAgIGlmICh0aGlzLmlzRGF0YVVybCkge1xuICAgICAgICAgICAgdmFyIHNsYXNoSW5kZXggPSB1cmwuaW5kZXhPZignLycpO1xuXG4gICAgICAgICAgICBleHQgPSB1cmwuc3Vic3RyaW5nKHNsYXNoSW5kZXggKyAxLCB1cmwuaW5kZXhPZignOycsIHNsYXNoSW5kZXgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBxdWVyeVN0YXJ0ID0gdXJsLmluZGV4T2YoJz8nKTtcblxuICAgICAgICAgICAgaWYgKHF1ZXJ5U3RhcnQgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gdXJsLnN1YnN0cmluZygwLCBxdWVyeVN0YXJ0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0ID0gdXJsLnN1YnN0cmluZyh1cmwubGFzdEluZGV4T2YoJy4nKSArIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHRoZSBtaW1lIHR5cGUgb2YgYW4gWEhSIHJlcXVlc3QgYmFzZWQgb24gdGhlIHJlc3BvbnNlVHlwZSBvZlxuICAgICAqIHJlc291cmNlIGJlaW5nIGxvYWRlZC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRX0gdHlwZSAtIFRoZSB0eXBlIHRvIGdldCBhIG1pbWUgdHlwZSBmb3IuXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgbWltZSB0eXBlIHRvIHVzZS5cbiAgICAgKi9cblxuXG4gICAgUmVzb3VyY2UucHJvdG90eXBlLl9nZXRNaW1lRnJvbVhoclR5cGUgPSBmdW5jdGlvbiBfZ2V0TWltZUZyb21YaHJUeXBlKHR5cGUpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkJVRkZFUjpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2FwcGxpY2F0aW9uL29jdGV0LWJpbmFyeSc7XG5cbiAgICAgICAgICAgIGNhc2UgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQjpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2FwcGxpY2F0aW9uL2Jsb2InO1xuXG4gICAgICAgICAgICBjYXNlIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5UOlxuICAgICAgICAgICAgICAgIHJldHVybiAnYXBwbGljYXRpb24veG1sJztcblxuICAgICAgICAgICAgY2FzZSBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5KU09OOlxuICAgICAgICAgICAgICAgIHJldHVybiAnYXBwbGljYXRpb24vanNvbic7XG5cbiAgICAgICAgICAgIGNhc2UgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuREVGQVVMVDpcbiAgICAgICAgICAgIGNhc2UgUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuVEVYVDpcbiAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0ZXh0L3BsYWluJztcblxuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9jcmVhdGVDbGFzcyhSZXNvdXJjZSwgW3tcbiAgICAgICAga2V5OiAnaXNEYXRhVXJsJyxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faGFzRmxhZyhSZXNvdXJjZS5TVEFUVVNfRkxBR1MuREFUQV9VUkwpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlc2NyaWJlcyBpZiB0aGlzIHJlc291cmNlIGhhcyBmaW5pc2hlZCBsb2FkaW5nLiBJcyB0cnVlIHdoZW4gdGhlIHJlc291cmNlIGhhcyBjb21wbGV0ZWx5XG4gICAgICAgICAqIGxvYWRlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7Ym9vbGVhbn1cbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdpc0NvbXBsZXRlJyxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faGFzRmxhZyhSZXNvdXJjZS5TVEFUVVNfRkxBR1MuQ09NUExFVEUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlc2NyaWJlcyBpZiB0aGlzIHJlc291cmNlIGlzIGN1cnJlbnRseSBsb2FkaW5nLiBJcyB0cnVlIHdoZW4gdGhlIHJlc291cmNlIHN0YXJ0cyBsb2FkaW5nLFxuICAgICAgICAgKiBhbmQgaXMgZmFsc2UgYWdhaW4gd2hlbiBjb21wbGV0ZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1lbWJlciB7Ym9vbGVhbn1cbiAgICAgICAgICogQHJlYWRvbmx5XG4gICAgICAgICAqL1xuXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdpc0xvYWRpbmcnLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9oYXNGbGFnKFJlc291cmNlLlNUQVRVU19GTEFHUy5MT0FESU5HKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBSZXNvdXJjZTtcbn0oKTtcblxuLyoqXG4gKiBUaGUgdHlwZXMgb2YgcmVzb3VyY2VzIGEgcmVzb3VyY2UgY291bGQgcmVwcmVzZW50LlxuICpcbiAqIEBzdGF0aWNcbiAqIEByZWFkb25seVxuICogQGVudW0ge251bWJlcn1cbiAqL1xuXG5cbmV4cG9ydHMuZGVmYXVsdCA9IFJlc291cmNlO1xuUmVzb3VyY2UuU1RBVFVTX0ZMQUdTID0ge1xuICAgIE5PTkU6IDAsXG4gICAgREFUQV9VUkw6IDEgPDwgMCxcbiAgICBDT01QTEVURTogMSA8PCAxLFxuICAgIExPQURJTkc6IDEgPDwgMlxufTtcblxuLyoqXG4gKiBUaGUgdHlwZXMgb2YgcmVzb3VyY2VzIGEgcmVzb3VyY2UgY291bGQgcmVwcmVzZW50LlxuICpcbiAqIEBzdGF0aWNcbiAqIEByZWFkb25seVxuICogQGVudW0ge251bWJlcn1cbiAqL1xuUmVzb3VyY2UuVFlQRSA9IHtcbiAgICBVTktOT1dOOiAwLFxuICAgIEpTT046IDEsXG4gICAgWE1MOiAyLFxuICAgIElNQUdFOiAzLFxuICAgIEFVRElPOiA0LFxuICAgIFZJREVPOiA1LFxuICAgIFRFWFQ6IDZcbn07XG5cbi8qKlxuICogVGhlIHR5cGVzIG9mIGxvYWRpbmcgYSByZXNvdXJjZSBjYW4gdXNlLlxuICpcbiAqIEBzdGF0aWNcbiAqIEByZWFkb25seVxuICogQGVudW0ge251bWJlcn1cbiAqL1xuUmVzb3VyY2UuTE9BRF9UWVBFID0ge1xuICAgIC8qKiBVc2VzIFhNTEh0dHBSZXF1ZXN0IHRvIGxvYWQgdGhlIHJlc291cmNlLiAqL1xuICAgIFhIUjogMSxcbiAgICAvKiogVXNlcyBhbiBgSW1hZ2VgIG9iamVjdCB0byBsb2FkIHRoZSByZXNvdXJjZS4gKi9cbiAgICBJTUFHRTogMixcbiAgICAvKiogVXNlcyBhbiBgQXVkaW9gIG9iamVjdCB0byBsb2FkIHRoZSByZXNvdXJjZS4gKi9cbiAgICBBVURJTzogMyxcbiAgICAvKiogVXNlcyBhIGBWaWRlb2Agb2JqZWN0IHRvIGxvYWQgdGhlIHJlc291cmNlLiAqL1xuICAgIFZJREVPOiA0XG59O1xuXG4vKipcbiAqIFRoZSBYSFIgcmVhZHkgc3RhdGVzLCB1c2VkIGludGVybmFsbHkuXG4gKlxuICogQHN0YXRpY1xuICogQHJlYWRvbmx5XG4gKiBAZW51bSB7c3RyaW5nfVxuICovXG5SZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRSA9IHtcbiAgICAvKiogc3RyaW5nICovXG4gICAgREVGQVVMVDogJ3RleHQnLFxuICAgIC8qKiBBcnJheUJ1ZmZlciAqL1xuICAgIEJVRkZFUjogJ2FycmF5YnVmZmVyJyxcbiAgICAvKiogQmxvYiAqL1xuICAgIEJMT0I6ICdibG9iJyxcbiAgICAvKiogRG9jdW1lbnQgKi9cbiAgICBET0NVTUVOVDogJ2RvY3VtZW50JyxcbiAgICAvKiogT2JqZWN0ICovXG4gICAgSlNPTjogJ2pzb24nLFxuICAgIC8qKiBTdHJpbmcgKi9cbiAgICBURVhUOiAndGV4dCdcbn07XG5cblJlc291cmNlLl9sb2FkVHlwZU1hcCA9IHtcbiAgICAvLyBpbWFnZXNcbiAgICBnaWY6IFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICBwbmc6IFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICBibXA6IFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICBqcGc6IFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICBqcGVnOiBSZXNvdXJjZS5MT0FEX1RZUEUuSU1BR0UsXG4gICAgdGlmOiBSZXNvdXJjZS5MT0FEX1RZUEUuSU1BR0UsXG4gICAgdGlmZjogUmVzb3VyY2UuTE9BRF9UWVBFLklNQUdFLFxuICAgIHdlYnA6IFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICB0Z2E6IFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICBzdmc6IFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSxcbiAgICAnc3ZnK3htbCc6IFJlc291cmNlLkxPQURfVFlQRS5JTUFHRSwgLy8gZm9yIFNWRyBkYXRhIHVybHNcblxuICAgIC8vIGF1ZGlvXG4gICAgbXAzOiBSZXNvdXJjZS5MT0FEX1RZUEUuQVVESU8sXG4gICAgb2dnOiBSZXNvdXJjZS5MT0FEX1RZUEUuQVVESU8sXG4gICAgd2F2OiBSZXNvdXJjZS5MT0FEX1RZUEUuQVVESU8sXG5cbiAgICAvLyB2aWRlb3NcbiAgICBtcDQ6IFJlc291cmNlLkxPQURfVFlQRS5WSURFTyxcbiAgICB3ZWJtOiBSZXNvdXJjZS5MT0FEX1RZUEUuVklERU9cbn07XG5cblJlc291cmNlLl94aHJUeXBlTWFwID0ge1xuICAgIC8vIHhtbFxuICAgIHhodG1sOiBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5ET0NVTUVOVCxcbiAgICBodG1sOiBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5ET0NVTUVOVCxcbiAgICBodG06IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5ULFxuICAgIHhtbDogUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuRE9DVU1FTlQsXG4gICAgdG14OiBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5ET0NVTUVOVCxcbiAgICBzdmc6IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5ULFxuXG4gICAgLy8gVGhpcyB3YXMgYWRkZWQgdG8gaGFuZGxlIFRpbGVkIFRpbGVzZXQgWE1MLCBidXQgLnRzeCBpcyBhbHNvIGEgVHlwZVNjcmlwdCBSZWFjdCBDb21wb25lbnQuXG4gICAgLy8gU2luY2UgaXQgaXMgd2F5IGxlc3MgbGlrZWx5IGZvciBwZW9wbGUgdG8gYmUgbG9hZGluZyBUeXBlU2NyaXB0IGZpbGVzIGluc3RlYWQgb2YgVGlsZWQgZmlsZXMsXG4gICAgLy8gdGhpcyBzaG91bGQgcHJvYmFibHkgYmUgZmluZS5cbiAgICB0c3g6IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkRPQ1VNRU5ULFxuXG4gICAgLy8gaW1hZ2VzXG4gICAgZ2lmOiBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5CTE9CLFxuICAgIHBuZzogUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcbiAgICBibXA6IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkJMT0IsXG4gICAganBnOiBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5CTE9CLFxuICAgIGpwZWc6IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkJMT0IsXG4gICAgdGlmOiBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5CTE9CLFxuICAgIHRpZmY6IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkJMT0IsXG4gICAgd2VicDogUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuQkxPQixcbiAgICB0Z2E6IFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkJMT0IsXG5cbiAgICAvLyBqc29uXG4gICAganNvbjogUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuSlNPTixcblxuICAgIC8vIHRleHRcbiAgICB0ZXh0OiBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5URVhULFxuICAgIHR4dDogUmVzb3VyY2UuWEhSX1JFU1BPTlNFX1RZUEUuVEVYVCxcblxuICAgIC8vIGZvbnRzXG4gICAgdHRmOiBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5CVUZGRVIsXG4gICAgb3RmOiBSZXNvdXJjZS5YSFJfUkVTUE9OU0VfVFlQRS5CVUZGRVJcbn07XG5cbi8vIFdlIGNhbid0IHNldCB0aGUgYHNyY2AgYXR0cmlidXRlIHRvIGVtcHR5IHN0cmluZywgc28gb24gYWJvcnQgd2Ugc2V0IGl0IHRvIHRoaXMgMXB4IHRyYW5zcGFyZW50IGdpZlxuUmVzb3VyY2UuRU1QVFlfR0lGID0gJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBSUFBQVAvLy93QUFBQ0g1QkFFQUFBQUFMQUFBQUFBQkFBRUFBQUlDUkFFQU93PT0nO1xuXG4vKipcbiAqIFF1aWNrIGhlbHBlciB0byBzZXQgYSB2YWx1ZSBvbiBvbmUgb2YgdGhlIGV4dGVuc2lvbiBtYXBzLiBFbnN1cmVzIHRoZXJlIGlzIG5vXG4gKiBkb3QgYXQgdGhlIHN0YXJ0IG9mIHRoZSBleHRlbnNpb24uXG4gKlxuICogQGlnbm9yZVxuICogQHBhcmFtIHtvYmplY3R9IG1hcCAtIFRoZSBtYXAgdG8gc2V0IG9uLlxuICogQHBhcmFtIHtzdHJpbmd9IGV4dG5hbWUgLSBUaGUgZXh0ZW5zaW9uIChvciBrZXkpIHRvIHNldC5cbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWwgLSBUaGUgdmFsdWUgdG8gc2V0LlxuICovXG5mdW5jdGlvbiBzZXRFeHRNYXAobWFwLCBleHRuYW1lLCB2YWwpIHtcbiAgICBpZiAoZXh0bmFtZSAmJiBleHRuYW1lLmluZGV4T2YoJy4nKSA9PT0gMCkge1xuICAgICAgICBleHRuYW1lID0gZXh0bmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgfVxuXG4gICAgaWYgKCFleHRuYW1lKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBtYXBbZXh0bmFtZV0gPSB2YWw7XG59XG5cbi8qKlxuICogUXVpY2sgaGVscGVyIHRvIGdldCBzdHJpbmcgeGhyIHR5cGUuXG4gKlxuICogQGlnbm9yZVxuICogQHBhcmFtIHtYTUxIdHRwUmVxdWVzdHxYRG9tYWluUmVxdWVzdH0geGhyIC0gVGhlIHJlcXVlc3QgdG8gY2hlY2suXG4gKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSB0eXBlLlxuICovXG5mdW5jdGlvbiByZXFUeXBlKHhocikge1xuICAgIHJldHVybiB4aHIudG9TdHJpbmcoKS5yZXBsYWNlKCdvYmplY3QgJywgJycpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UmVzb3VyY2UuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5lYWNoU2VyaWVzID0gZWFjaFNlcmllcztcbmV4cG9ydHMucXVldWUgPSBxdWV1ZTtcbi8qKlxuICogU21hbGxlciB2ZXJzaW9uIG9mIHRoZSBhc3luYyBsaWJyYXJ5IGNvbnN0cnVjdHMuXG4gKlxuICovXG5mdW5jdGlvbiBfbm9vcCgpIHt9IC8qIGVtcHR5ICovXG5cbi8qKlxuICogSXRlcmF0ZXMgYW4gYXJyYXkgaW4gc2VyaWVzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXkuPCo+fSBhcnJheSAtIEFycmF5IHRvIGl0ZXJhdGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBpdGVyYXRvciAtIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggZWxlbWVudC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gRnVuY3Rpb24gdG8gY2FsbCB3aGVuIGRvbmUsIG9yIG9uIGVycm9yLlxuICogQHBhcmFtIHtib29sZWFufSBbZGVmZXJOZXh0PWZhbHNlXSAtIEJyZWFrIHN5bmNocm9ub3VzIGVhY2ggbG9vcCBieSBjYWxsaW5nIG5leHQgd2l0aCBhIHNldFRpbWVvdXQgb2YgMS5cbiAqL1xuZnVuY3Rpb24gZWFjaFNlcmllcyhhcnJheSwgaXRlcmF0b3IsIGNhbGxiYWNrLCBkZWZlck5leHQpIHtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGxlbiA9IGFycmF5Lmxlbmd0aDtcblxuICAgIChmdW5jdGlvbiBuZXh0KGVycikge1xuICAgICAgICBpZiAoZXJyIHx8IGkgPT09IGxlbikge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRlZmVyTmV4dCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IoYXJyYXlbaSsrXSwgbmV4dCk7XG4gICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKGFycmF5W2krK10sIG5leHQpO1xuICAgICAgICB9XG4gICAgfSkoKTtcbn1cblxuLyoqXG4gKiBFbnN1cmVzIGEgZnVuY3Rpb24gaXMgb25seSBjYWxsZWQgb25jZS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiAtIFRoZSBmdW5jdGlvbiB0byB3cmFwLlxuICogQHJldHVybiB7ZnVuY3Rpb259IFRoZSB3cmFwcGluZyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb25seU9uY2UoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gb25jZVdyYXBwZXIoKSB7XG4gICAgICAgIGlmIChmbiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYWxsYmFjayB3YXMgYWxyZWFkeSBjYWxsZWQuJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2FsbEZuID0gZm47XG5cbiAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICBjYWxsRm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuXG4vKipcbiAqIEFzeW5jIHF1ZXVlIGltcGxlbWVudGF0aW9uLFxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHdvcmtlciAtIFRoZSB3b3JrZXIgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB0YXNrLlxuICogQHBhcmFtIHtudW1iZXJ9IGNvbmN1cnJlbmN5IC0gSG93IG1hbnkgd29ya2VycyB0byBydW4gaW4gcGFycmFsbGVsLlxuICogQHJldHVybiB7Kn0gVGhlIGFzeW5jIHF1ZXVlIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gcXVldWUod29ya2VyLCBjb25jdXJyZW5jeSkge1xuICAgIGlmIChjb25jdXJyZW5jeSA9PSBudWxsKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZXEtbnVsbCxlcWVxZXFcbiAgICAgICAgY29uY3VycmVuY3kgPSAxO1xuICAgIH0gZWxzZSBpZiAoY29uY3VycmVuY3kgPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb25jdXJyZW5jeSBtdXN0IG5vdCBiZSB6ZXJvJyk7XG4gICAgfVxuXG4gICAgdmFyIHdvcmtlcnMgPSAwO1xuICAgIHZhciBxID0ge1xuICAgICAgICBfdGFza3M6IFtdLFxuICAgICAgICBjb25jdXJyZW5jeTogY29uY3VycmVuY3ksXG4gICAgICAgIHNhdHVyYXRlZDogX25vb3AsXG4gICAgICAgIHVuc2F0dXJhdGVkOiBfbm9vcCxcbiAgICAgICAgYnVmZmVyOiBjb25jdXJyZW5jeSAvIDQsXG4gICAgICAgIGVtcHR5OiBfbm9vcCxcbiAgICAgICAgZHJhaW46IF9ub29wLFxuICAgICAgICBlcnJvcjogX25vb3AsXG4gICAgICAgIHN0YXJ0ZWQ6IGZhbHNlLFxuICAgICAgICBwYXVzZWQ6IGZhbHNlLFxuICAgICAgICBwdXNoOiBmdW5jdGlvbiBwdXNoKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBfaW5zZXJ0KGRhdGEsIGZhbHNlLCBjYWxsYmFjayk7XG4gICAgICAgIH0sXG4gICAgICAgIGtpbGw6IGZ1bmN0aW9uIGtpbGwoKSB7XG4gICAgICAgICAgICB3b3JrZXJzID0gMDtcbiAgICAgICAgICAgIHEuZHJhaW4gPSBfbm9vcDtcbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgcS5fdGFza3MgPSBbXTtcbiAgICAgICAgfSxcbiAgICAgICAgdW5zaGlmdDogZnVuY3Rpb24gdW5zaGlmdChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgX2luc2VydChkYXRhLCB0cnVlLCBjYWxsYmFjayk7XG4gICAgICAgIH0sXG4gICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIHByb2Nlc3MoKSB7XG4gICAgICAgICAgICB3aGlsZSAoIXEucGF1c2VkICYmIHdvcmtlcnMgPCBxLmNvbmN1cnJlbmN5ICYmIHEuX3Rhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciB0YXNrID0gcS5fdGFza3Muc2hpZnQoKTtcblxuICAgICAgICAgICAgICAgIGlmIChxLl90YXNrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdvcmtlcnMgKz0gMTtcblxuICAgICAgICAgICAgICAgIGlmICh3b3JrZXJzID09PSBxLmNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd29ya2VyKHRhc2suZGF0YSwgb25seU9uY2UoX25leHQodGFzaykpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbGVuZ3RoOiBmdW5jdGlvbiBsZW5ndGgoKSB7XG4gICAgICAgICAgICByZXR1cm4gcS5fdGFza3MubGVuZ3RoO1xuICAgICAgICB9LFxuICAgICAgICBydW5uaW5nOiBmdW5jdGlvbiBydW5uaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHdvcmtlcnM7XG4gICAgICAgIH0sXG4gICAgICAgIGlkbGU6IGZ1bmN0aW9uIGlkbGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gcS5fdGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMDtcbiAgICAgICAgfSxcbiAgICAgICAgcGF1c2U6IGZ1bmN0aW9uIHBhdXNlKCkge1xuICAgICAgICAgICAgaWYgKHEucGF1c2VkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBxLnBhdXNlZCA9IHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIHJlc3VtZTogZnVuY3Rpb24gcmVzdW1lKCkge1xuICAgICAgICAgICAgaWYgKHEucGF1c2VkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcS5wYXVzZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gTmVlZCB0byBjYWxsIHEucHJvY2VzcyBvbmNlIHBlciBjb25jdXJyZW50XG4gICAgICAgICAgICAvLyB3b3JrZXIgdG8gcHJlc2VydmUgZnVsbCBjb25jdXJyZW5jeSBhZnRlciBwYXVzZVxuICAgICAgICAgICAgZm9yICh2YXIgdyA9IDE7IHcgPD0gcS5jb25jdXJyZW5jeTsgdysrKSB7XG4gICAgICAgICAgICAgICAgcS5wcm9jZXNzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2luc2VydChkYXRhLCBpbnNlcnRBdEZyb250LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZXEtbnVsbCxlcWVxZXFcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndGFzayBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKGRhdGEgPT0gbnVsbCAmJiBxLmlkbGUoKSkge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1lcS1udWxsLGVxZXFlcVxuICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLmRyYWluKCk7XG4gICAgICAgICAgICB9LCAxKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgY2FsbGJhY2s6IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogX25vb3BcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaW5zZXJ0QXRGcm9udCkge1xuICAgICAgICAgICAgcS5fdGFza3MudW5zaGlmdChpdGVtKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHEuX3Rhc2tzLnB1c2goaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBxLnByb2Nlc3MoKTtcbiAgICAgICAgfSwgMSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX25leHQodGFzaykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgIHdvcmtlcnMgLT0gMTtcblxuICAgICAgICAgICAgdGFzay5jYWxsYmFjay5hcHBseSh0YXNrLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzWzBdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWVxLW51bGwsZXFlcWVxXG4gICAgICAgICAgICAgICAgcS5lcnJvcihhcmd1bWVudHNbMF0sIHRhc2suZGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh3b3JrZXJzIDw9IHEuY29uY3VycmVuY3kgLSBxLmJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIHEudW5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHEuaWRsZSgpKSB7XG4gICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBxLnByb2Nlc3MoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFzeW5jLmpzLm1hcCIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuZW5jb2RlQmluYXJ5ID0gZW5jb2RlQmluYXJ5O1xudmFyIF9rZXlTdHIgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nO1xuXG5mdW5jdGlvbiBlbmNvZGVCaW5hcnkoaW5wdXQpIHtcbiAgICB2YXIgb3V0cHV0ID0gJyc7XG4gICAgdmFyIGlueCA9IDA7XG5cbiAgICB3aGlsZSAoaW54IDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgIC8vIEZpbGwgYnl0ZSBidWZmZXIgYXJyYXlcbiAgICAgICAgdmFyIGJ5dGVidWZmZXIgPSBbMCwgMCwgMF07XG4gICAgICAgIHZhciBlbmNvZGVkQ2hhckluZGV4ZXMgPSBbMCwgMCwgMCwgMF07XG5cbiAgICAgICAgZm9yICh2YXIgam54ID0gMDsgam54IDwgYnl0ZWJ1ZmZlci5sZW5ndGg7ICsram54KSB7XG4gICAgICAgICAgICBpZiAoaW54IDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhyb3cgYXdheSBoaWdoLW9yZGVyIGJ5dGUsIGFzIGRvY3VtZW50ZWQgYXQ6XG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvRW4vVXNpbmdfWE1MSHR0cFJlcXVlc3QjSGFuZGxpbmdfYmluYXJ5X2RhdGFcbiAgICAgICAgICAgICAgICBieXRlYnVmZmVyW2pueF0gPSBpbnB1dC5jaGFyQ29kZUF0KGlueCsrKSAmIDB4ZmY7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJ5dGVidWZmZXJbam54XSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgZWFjaCBlbmNvZGVkIGNoYXJhY3RlciwgNiBiaXRzIGF0IGEgdGltZVxuICAgICAgICAvLyBpbmRleCAxOiBmaXJzdCA2IGJpdHNcbiAgICAgICAgZW5jb2RlZENoYXJJbmRleGVzWzBdID0gYnl0ZWJ1ZmZlclswXSA+PiAyO1xuXG4gICAgICAgIC8vIGluZGV4IDI6IHNlY29uZCA2IGJpdHMgKDIgbGVhc3Qgc2lnbmlmaWNhbnQgYml0cyBmcm9tIGlucHV0IGJ5dGUgMSArIDQgbW9zdCBzaWduaWZpY2FudCBiaXRzIGZyb20gYnl0ZSAyKVxuICAgICAgICBlbmNvZGVkQ2hhckluZGV4ZXNbMV0gPSAoYnl0ZWJ1ZmZlclswXSAmIDB4MykgPDwgNCB8IGJ5dGVidWZmZXJbMV0gPj4gNDtcblxuICAgICAgICAvLyBpbmRleCAzOiB0aGlyZCA2IGJpdHMgKDQgbGVhc3Qgc2lnbmlmaWNhbnQgYml0cyBmcm9tIGlucHV0IGJ5dGUgMiArIDIgbW9zdCBzaWduaWZpY2FudCBiaXRzIGZyb20gYnl0ZSAzKVxuICAgICAgICBlbmNvZGVkQ2hhckluZGV4ZXNbMl0gPSAoYnl0ZWJ1ZmZlclsxXSAmIDB4MGYpIDw8IDIgfCBieXRlYnVmZmVyWzJdID4+IDY7XG5cbiAgICAgICAgLy8gaW5kZXggMzogZm9ydGggNiBiaXRzICg2IGxlYXN0IHNpZ25pZmljYW50IGJpdHMgZnJvbSBpbnB1dCBieXRlIDMpXG4gICAgICAgIGVuY29kZWRDaGFySW5kZXhlc1szXSA9IGJ5dGVidWZmZXJbMl0gJiAweDNmO1xuXG4gICAgICAgIC8vIERldGVybWluZSB3aGV0aGVyIHBhZGRpbmcgaGFwcGVuZWQsIGFuZCBhZGp1c3QgYWNjb3JkaW5nbHlcbiAgICAgICAgdmFyIHBhZGRpbmdCeXRlcyA9IGlueCAtIChpbnB1dC5sZW5ndGggLSAxKTtcblxuICAgICAgICBzd2l0Y2ggKHBhZGRpbmdCeXRlcykge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIC8vIFNldCBsYXN0IDIgY2hhcmFjdGVycyB0byBwYWRkaW5nIGNoYXJcbiAgICAgICAgICAgICAgICBlbmNvZGVkQ2hhckluZGV4ZXNbM10gPSA2NDtcbiAgICAgICAgICAgICAgICBlbmNvZGVkQ2hhckluZGV4ZXNbMl0gPSA2NDtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIC8vIFNldCBsYXN0IGNoYXJhY3RlciB0byBwYWRkaW5nIGNoYXJcbiAgICAgICAgICAgICAgICBlbmNvZGVkQ2hhckluZGV4ZXNbM10gPSA2NDtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhazsgLy8gTm8gcGFkZGluZyAtIHByb2NlZWRcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdyB3ZSB3aWxsIGdyYWIgZWFjaCBhcHByb3ByaWF0ZSBjaGFyYWN0ZXIgb3V0IG9mIG91ciBrZXlzdHJpbmdcbiAgICAgICAgLy8gYmFzZWQgb24gb3VyIGluZGV4IGFycmF5IGFuZCBhcHBlbmQgaXQgdG8gdGhlIG91dHB1dCBzdHJpbmdcbiAgICAgICAgZm9yICh2YXIgX2pueCA9IDA7IF9qbnggPCBlbmNvZGVkQ2hhckluZGV4ZXMubGVuZ3RoOyArK19qbngpIHtcbiAgICAgICAgICAgIG91dHB1dCArPSBfa2V5U3RyLmNoYXJBdChlbmNvZGVkQ2hhckluZGV4ZXNbX2pueF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWI2NC5qcy5tYXAiLCIndXNlIHN0cmljdCc7XG5cbi8vIGltcG9ydCBMb2FkZXIgZnJvbSAnLi9Mb2FkZXInO1xuLy8gaW1wb3J0IFJlc291cmNlIGZyb20gJy4vUmVzb3VyY2UnO1xuLy8gaW1wb3J0ICogYXMgYXN5bmMgZnJvbSAnLi9hc3luYyc7XG4vLyBpbXBvcnQgKiBhcyBiNjQgZnJvbSAnLi9iNjQnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuXG52YXIgTG9hZGVyID0gcmVxdWlyZSgnLi9Mb2FkZXInKS5kZWZhdWx0O1xudmFyIFJlc291cmNlID0gcmVxdWlyZSgnLi9SZXNvdXJjZScpLmRlZmF1bHQ7XG52YXIgYXN5bmMgPSByZXF1aXJlKCcuL2FzeW5jJyk7XG52YXIgYjY0ID0gcmVxdWlyZSgnLi9iNjQnKTtcblxudmFyIF9yZXF1aXJlID0gcmVxdWlyZSgnLi9taWRkbGV3YXJlcy9jYWNoaW5nL21lbW9yeScpLFxuICAgIG1lbW9yeU1pZGRsZXdhcmVGYWN0b3J5ID0gX3JlcXVpcmUubWVtb3J5TWlkZGxld2FyZUZhY3Rvcnk7XG5cbnZhciBfcmVxdWlyZTIgPSByZXF1aXJlKCcuL21pZGRsZXdhcmVzL3BhcnNpbmcvYmxvYicpLFxuICAgIGJsb2JNaWRkbGV3YXJlRmFjdG9yeSA9IF9yZXF1aXJlMi5ibG9iTWlkZGxld2FyZUZhY3Rvcnk7XG5cbkxvYWRlci5SZXNvdXJjZSA9IFJlc291cmNlO1xuTG9hZGVyLmFzeW5jID0gYXN5bmM7XG5Mb2FkZXIuYmFzZTY0ID0gYjY0O1xuTG9hZGVyLm1pZGRsZXdhcmUgPSB7XG4gIGNhY2hpbmc6IHtcbiAgICBtZW1vcnk6IG1lbW9yeU1pZGRsZXdhcmVGYWN0b3J5XG4gIH0sXG4gIHBhcnNpbmc6IHtcbiAgICBibG9iOiBibG9iTWlkZGxld2FyZUZhY3RvcnlcbiAgfVxufTtcblxuLy8gZXhwb3J0IG1hbnVhbGx5LCBhbmQgYWxzbyBhcyBkZWZhdWx0XG5tb2R1bGUuZXhwb3J0cyA9IExvYWRlcjtcbi8vIGV4cG9ydCBkZWZhdWx0IExvYWRlcjtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBMb2FkZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMubWVtb3J5TWlkZGxld2FyZUZhY3RvcnkgPSBtZW1vcnlNaWRkbGV3YXJlRmFjdG9yeTtcbi8vIGEgc2ltcGxlIGluLW1lbW9yeSBjYWNoZSBmb3IgcmVzb3VyY2VzXG52YXIgY2FjaGUgPSB7fTtcblxuZnVuY3Rpb24gbWVtb3J5TWlkZGxld2FyZUZhY3RvcnkoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIG1lbW9yeU1pZGRsZXdhcmUocmVzb3VyY2UsIG5leHQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAvLyBpZiBjYWNoZWQsIHRoZW4gc2V0IGRhdGEgYW5kIGNvbXBsZXRlIHRoZSByZXNvdXJjZVxuICAgICAgICBpZiAoY2FjaGVbcmVzb3VyY2UudXJsXSkge1xuICAgICAgICAgICAgcmVzb3VyY2UuZGF0YSA9IGNhY2hlW3Jlc291cmNlLnVybF07XG4gICAgICAgICAgICByZXNvdXJjZS5jb21wbGV0ZSgpOyAvLyBtYXJrcyByZXNvdXJjZSBsb2FkIGNvbXBsZXRlIGFuZCBzdG9wcyBwcm9jZXNzaW5nIGJlZm9yZSBtaWRkbGV3YXJlc1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIG5vdCBjYWNoZWQsIHdhaXQgZm9yIGNvbXBsZXRlIGFuZCBzdG9yZSBpdCBpbiB0aGUgY2FjaGUuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc291cmNlLm9uQ29tcGxldGUub25jZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWNoZVtfdGhpcy51cmxdID0gX3RoaXMuZGF0YTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICBuZXh0KCk7XG4gICAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1lbW9yeS5qcy5tYXAiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmJsb2JNaWRkbGV3YXJlRmFjdG9yeSA9IGJsb2JNaWRkbGV3YXJlRmFjdG9yeTtcblxudmFyIF9SZXNvdXJjZSA9IHJlcXVpcmUoJy4uLy4uL1Jlc291cmNlJyk7XG5cbnZhciBfUmVzb3VyY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUmVzb3VyY2UpO1xuXG52YXIgX2IgPSByZXF1aXJlKCcuLi8uLi9iNjQnKTtcblxudmFyIF9iMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2IpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgVXJsID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMO1xuXG4vLyBhIG1pZGRsZXdhcmUgZm9yIHRyYW5zZm9ybWluZyBYSFIgbG9hZGVkIEJsb2JzIGludG8gbW9yZSB1c2VmdWwgb2JqZWN0c1xuZnVuY3Rpb24gYmxvYk1pZGRsZXdhcmVGYWN0b3J5KCkge1xuICAgIHJldHVybiBmdW5jdGlvbiBibG9iTWlkZGxld2FyZShyZXNvdXJjZSwgbmV4dCkge1xuICAgICAgICBpZiAoIXJlc291cmNlLmRhdGEpIHtcbiAgICAgICAgICAgIG5leHQoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgdGhpcyB3YXMgYW4gWEhSIGxvYWQgb2YgYSBibG9iXG4gICAgICAgIGlmIChyZXNvdXJjZS54aHIgJiYgcmVzb3VyY2UueGhyVHlwZSA9PT0gX1Jlc291cmNlMi5kZWZhdWx0LlhIUl9SRVNQT05TRV9UWVBFLkJMT0IpIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIGJsb2Igc3VwcG9ydCB3ZSBwcm9iYWJseSBnb3QgYSBiaW5hcnkgc3RyaW5nIGJhY2tcbiAgICAgICAgICAgIGlmICghd2luZG93LkJsb2IgfHwgdHlwZW9mIHJlc291cmNlLmRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSByZXNvdXJjZS54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuXG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhbiBpbWFnZSwgY29udmVydCB0aGUgYmluYXJ5IHN0cmluZyBpbnRvIGEgZGF0YSB1cmxcbiAgICAgICAgICAgICAgICBpZiAodHlwZSAmJiB0eXBlLmluZGV4T2YoJ2ltYWdlJykgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2UuZGF0YSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS5kYXRhLnNyYyA9ICdkYXRhOicgKyB0eXBlICsgJztiYXNlNjQsJyArIF9iMi5kZWZhdWx0LmVuY29kZUJpbmFyeShyZXNvdXJjZS54aHIucmVzcG9uc2VUZXh0KTtcblxuICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS50eXBlID0gX1Jlc291cmNlMi5kZWZhdWx0LlRZUEUuSU1BR0U7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gd2FpdCB1bnRpbCB0aGUgaW1hZ2UgbG9hZHMgYW5kIHRoZW4gY2FsbGJhY2tcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2UuZGF0YS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS5kYXRhLm9ubG9hZCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBuZXh0IHdpbGwgYmUgY2FsbGVkIG9uIGxvYWRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIGNvbnRlbnQgdHlwZSBzYXlzIHRoaXMgaXMgYW4gaW1hZ2UsIHRoZW4gd2Ugc2hvdWxkIHRyYW5zZm9ybSB0aGUgYmxvYiBpbnRvIGFuIEltYWdlIG9iamVjdFxuICAgICAgICAgICAgZWxzZSBpZiAocmVzb3VyY2UuZGF0YS50eXBlLmluZGV4T2YoJ2ltYWdlJykgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNyYyA9IFVybC5jcmVhdGVPYmplY3RVUkwocmVzb3VyY2UuZGF0YSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2UuYmxvYiA9IHJlc291cmNlLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIHJlc291cmNlLmRhdGEgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2UuZGF0YS5zcmMgPSBzcmM7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2UudHlwZSA9IF9SZXNvdXJjZTIuZGVmYXVsdC5UWVBFLklNQUdFO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNsZWFudXAgdGhlIG5vIGxvbmdlciB1c2VkIGJsb2IgYWZ0ZXIgdGhlIGltYWdlIGxvYWRzXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IElzIHRoaXMgY29ycmVjdD8gV2lsbCB0aGUgaW1hZ2UgYmUgaW52YWxpZCBhZnRlciByZXZva2luZz9cbiAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2UuZGF0YS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBVcmwucmV2b2tlT2JqZWN0VVJMKHNyYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZS5kYXRhLm9ubG9hZCA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBuZXh0IHdpbGwgYmUgY2FsbGVkIG9uIGxvYWQuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBuZXh0KCk7XG4gICAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJsb2IuanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBNaW5pU2lnbmFsQmluZGluZyA9IChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIE1pbmlTaWduYWxCaW5kaW5nKGZuLCBvbmNlLCB0aGlzQXJnKSB7XG4gICAgaWYgKG9uY2UgPT09IHVuZGVmaW5lZCkgb25jZSA9IGZhbHNlO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1pbmlTaWduYWxCaW5kaW5nKTtcblxuICAgIHRoaXMuX2ZuID0gZm47XG4gICAgdGhpcy5fb25jZSA9IG9uY2U7XG4gICAgdGhpcy5fdGhpc0FyZyA9IHRoaXNBcmc7XG4gICAgdGhpcy5fbmV4dCA9IHRoaXMuX3ByZXYgPSB0aGlzLl9vd25lciA9IG51bGw7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoTWluaVNpZ25hbEJpbmRpbmcsIFt7XG4gICAga2V5OiAnZGV0YWNoJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGV0YWNoKCkge1xuICAgICAgaWYgKHRoaXMuX293bmVyID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgICB0aGlzLl9vd25lci5kZXRhY2godGhpcyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTWluaVNpZ25hbEJpbmRpbmc7XG59KSgpO1xuXG5mdW5jdGlvbiBfYWRkTWluaVNpZ25hbEJpbmRpbmcoc2VsZiwgbm9kZSkge1xuICBpZiAoIXNlbGYuX2hlYWQpIHtcbiAgICBzZWxmLl9oZWFkID0gbm9kZTtcbiAgICBzZWxmLl90YWlsID0gbm9kZTtcbiAgfSBlbHNlIHtcbiAgICBzZWxmLl90YWlsLl9uZXh0ID0gbm9kZTtcbiAgICBub2RlLl9wcmV2ID0gc2VsZi5fdGFpbDtcbiAgICBzZWxmLl90YWlsID0gbm9kZTtcbiAgfVxuXG4gIG5vZGUuX293bmVyID0gc2VsZjtcblxuICByZXR1cm4gbm9kZTtcbn1cblxudmFyIE1pbmlTaWduYWwgPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBNaW5pU2lnbmFsKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNaW5pU2lnbmFsKTtcblxuICAgIHRoaXMuX2hlYWQgPSB0aGlzLl90YWlsID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE1pbmlTaWduYWwsIFt7XG4gICAga2V5OiAnaGFuZGxlcnMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVycygpIHtcbiAgICAgIHZhciBleGlzdHMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgdmFyIG5vZGUgPSB0aGlzLl9oZWFkO1xuXG4gICAgICBpZiAoZXhpc3RzKSByZXR1cm4gISFub2RlO1xuXG4gICAgICB2YXIgZWUgPSBbXTtcblxuICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgZWUucHVzaChub2RlKTtcbiAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdoYXMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYXMobm9kZSkge1xuICAgICAgaWYgKCEobm9kZSBpbnN0YW5jZW9mIE1pbmlTaWduYWxCaW5kaW5nKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pbmlTaWduYWwjaGFzKCk6IEZpcnN0IGFyZyBtdXN0IGJlIGEgTWluaVNpZ25hbEJpbmRpbmcgb2JqZWN0LicpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZS5fb3duZXIgPT09IHRoaXM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZGlzcGF0Y2gnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNwYXRjaCgpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5faGVhZDtcblxuICAgICAgaWYgKCFub2RlKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlLl9vbmNlKSB0aGlzLmRldGFjaChub2RlKTtcbiAgICAgICAgbm9kZS5fZm4uYXBwbHkobm9kZS5fdGhpc0FyZywgYXJndW1lbnRzKTtcbiAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2FkZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZChmbikge1xuICAgICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWluaVNpZ25hbCNhZGQoKTogRmlyc3QgYXJnIG11c3QgYmUgYSBGdW5jdGlvbi4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfYWRkTWluaVNpZ25hbEJpbmRpbmcodGhpcywgbmV3IE1pbmlTaWduYWxCaW5kaW5nKGZuLCBmYWxzZSwgdGhpc0FyZykpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ29uY2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvbmNlKGZuKSB7XG4gICAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaW5pU2lnbmFsI29uY2UoKTogRmlyc3QgYXJnIG11c3QgYmUgYSBGdW5jdGlvbi4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfYWRkTWluaVNpZ25hbEJpbmRpbmcodGhpcywgbmV3IE1pbmlTaWduYWxCaW5kaW5nKGZuLCB0cnVlLCB0aGlzQXJnKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZGV0YWNoJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGV0YWNoKG5vZGUpIHtcbiAgICAgIGlmICghKG5vZGUgaW5zdGFuY2VvZiBNaW5pU2lnbmFsQmluZGluZykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaW5pU2lnbmFsI2RldGFjaCgpOiBGaXJzdCBhcmcgbXVzdCBiZSBhIE1pbmlTaWduYWxCaW5kaW5nIG9iamVjdC4nKTtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlLl9vd25lciAhPT0gdGhpcykgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGlmIChub2RlLl9wcmV2KSBub2RlLl9wcmV2Ll9uZXh0ID0gbm9kZS5fbmV4dDtcbiAgICAgIGlmIChub2RlLl9uZXh0KSBub2RlLl9uZXh0Ll9wcmV2ID0gbm9kZS5fcHJldjtcblxuICAgICAgaWYgKG5vZGUgPT09IHRoaXMuX2hlYWQpIHtcbiAgICAgICAgdGhpcy5faGVhZCA9IG5vZGUuX25leHQ7XG4gICAgICAgIGlmIChub2RlLl9uZXh0ID09PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fdGFpbCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobm9kZSA9PT0gdGhpcy5fdGFpbCkge1xuICAgICAgICB0aGlzLl90YWlsID0gbm9kZS5fcHJldjtcbiAgICAgICAgdGhpcy5fdGFpbC5fbmV4dCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIG5vZGUuX293bmVyID0gbnVsbDtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2RldGFjaEFsbCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRldGFjaEFsbCgpIHtcbiAgICAgIHZhciBub2RlID0gdGhpcy5faGVhZDtcbiAgICAgIGlmICghbm9kZSkgcmV0dXJuIHRoaXM7XG5cbiAgICAgIHRoaXMuX2hlYWQgPSB0aGlzLl90YWlsID0gbnVsbDtcblxuICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgbm9kZS5fb3duZXIgPSBudWxsO1xuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBNaW5pU2lnbmFsO1xufSkoKTtcblxuTWluaVNpZ25hbC5NaW5pU2lnbmFsQmluZGluZyA9IE1pbmlTaWduYWxCaW5kaW5nO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBNaW5pU2lnbmFsO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZVVSSSAoc3RyLCBvcHRzKSB7XG4gIG9wdHMgPSBvcHRzIHx8IHt9XG5cbiAgdmFyIG8gPSB7XG4gICAga2V5OiBbJ3NvdXJjZScsICdwcm90b2NvbCcsICdhdXRob3JpdHknLCAndXNlckluZm8nLCAndXNlcicsICdwYXNzd29yZCcsICdob3N0JywgJ3BvcnQnLCAncmVsYXRpdmUnLCAncGF0aCcsICdkaXJlY3RvcnknLCAnZmlsZScsICdxdWVyeScsICdhbmNob3InXSxcbiAgICBxOiB7XG4gICAgICBuYW1lOiAncXVlcnlLZXknLFxuICAgICAgcGFyc2VyOiAvKD86XnwmKShbXiY9XSopPT8oW14mXSopL2dcbiAgICB9LFxuICAgIHBhcnNlcjoge1xuICAgICAgc3RyaWN0OiAvXig/OihbXjpcXC8/I10rKTopPyg/OlxcL1xcLygoPzooKFteOkBdKikoPzo6KFteOkBdKikpPyk/QCk/KFteOlxcLz8jXSopKD86OihcXGQqKSk/KSk/KCgoKD86W14/I1xcL10qXFwvKSopKFtePyNdKikpKD86XFw/KFteI10qKSk/KD86IyguKikpPykvLFxuICAgICAgbG9vc2U6IC9eKD86KD8hW146QF0rOlteOkBcXC9dKkApKFteOlxcLz8jLl0rKTopPyg/OlxcL1xcLyk/KCg/OigoW146QF0qKSg/OjooW146QF0qKSk/KT9AKT8oW146XFwvPyNdKikoPzo6KFxcZCopKT8pKCgoXFwvKD86W14/I10oPyFbXj8jXFwvXSpcXC5bXj8jXFwvLl0rKD86Wz8jXXwkKSkpKlxcLz8pPyhbXj8jXFwvXSopKSg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8pL1xuICAgIH1cbiAgfVxuXG4gIHZhciBtID0gby5wYXJzZXJbb3B0cy5zdHJpY3RNb2RlID8gJ3N0cmljdCcgOiAnbG9vc2UnXS5leGVjKHN0cilcbiAgdmFyIHVyaSA9IHt9XG4gIHZhciBpID0gMTRcblxuICB3aGlsZSAoaS0tKSB1cmlbby5rZXlbaV1dID0gbVtpXSB8fCAnJ1xuXG4gIHVyaVtvLnEubmFtZV0gPSB7fVxuICB1cmlbby5rZXlbMTJdXS5yZXBsYWNlKG8ucS5wYXJzZXIsIGZ1bmN0aW9uICgkMCwgJDEsICQyKSB7XG4gICAgaWYgKCQxKSB1cmlbby5xLm5hbWVdWyQxXSA9ICQyXG4gIH0pXG5cbiAgcmV0dXJuIHVyaVxufVxuIl19
