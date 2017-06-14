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
//# sourceMappingURL=index.js.map