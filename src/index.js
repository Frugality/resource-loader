// import Loader from './Loader';
// import Resource from './Resource';
// import * as async from './async';
// import * as b64 from './b64';

/* eslint-disable no-undef */

const Loader = require('./Loader').default;
const Resource = require('./Resource').default;
const async = require('./async');
const b64 = require('./b64');

const {memoryMiddlewareFactory} = require('./middlewares/caching/memory');
const {blobMiddlewareFactory} = require('./middlewares/parsing/blob');

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
