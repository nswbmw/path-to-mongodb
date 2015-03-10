var url = require('url');
var debug = require('debug')('path-to-mongodb');
var pathToRegexp = require('path-to-regexp');
var qs = require('../qs-mongodb');

var cache = {};

module.exports = pathToMongodb;

function pathToMongodb(path, realPath, options) {
  options = options || {};
  var queryOptions = options.queryOptions || ['skip', 'limit', 'sort', 'fields'];

  var realPathObj = url.parse(realPath);
  var pathname = realPathObj.pathname;
  var querystring = realPathObj.query;

  var pathReg = cache[path] || (cache[path] = pathToRegexp(path, [], options));
  var pathArr = pathReg.exec(pathname);
  if (!pathArr) return null;

  var _collection = formatCollection(path, options);
  var _query = formatQueryBefore(querystring, options);
  var _options = formatOptions(_query, queryOptions);
  _query = formatQueryAfter(_query, pathReg, pathArr);

  var result = {
    db: options.defaultDB,
    collection: _collection,
    query: _query,
    options: _options
  };

  debug('%s => %s (%j) => %j', path, realPath, options, result);
  return result;
};

function formatCollection(path, options) {
  return (path.match(/^\/([^:/]+)/) || [])[1] || options.defaultCollection;
}

function formatQueryBefore(querystring, options) {
  return querystring ? qs.parse(querystring, options) : {};
}

function formatOptions(query, queryOptions) {
  var options = {};
  for (var i in query) {
    if (Array.isArray(queryOptions) && ~queryOptions.indexOf(i)) {
      options[i] = query[i];
      delete query[i];
    } else if ('object' === typeof queryOptions && (i in queryOptions)) {
      options[queryOptions[i]] = query[i];
      delete query[i];
    }
  }
  return options;
}

function formatQueryAfter(query, pathReg, pathArr) {
  (pathReg.keys || []).forEach(function (item, index) {
    var key = item.name;
    var value = pathArr[index + 1];
    var strReg = value.match(/^["'](.+)["']$/);
    if (strReg) {
      value = strReg[1];
    } else {
      if (parseFloat(value) == value) {
        value = parseFloat(value);
      } else {
        if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        }
      }
    }
    query[key] = value;
  });
  return query;
}