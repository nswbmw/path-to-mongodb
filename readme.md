## path-to-mongodb

Parse URL to MongoDB query.

### Install

    npm i path-to-mongodb --save

### Usage

```
pathToMongodb(path, realPath, options);
```
- path: {String} Express style path like: `/users/:uid`.
- realPath: {String} Actual path like: `/users/123?vip=true`.
- options: {Object}
  - queryOptions: {Object|Array} Options to preserve, see test.
  - others see [path-to-regexp](https://www.npmjs.com/package/path-to-regexp).

### Example

```
pathToMongodb(
  '/posts/:year',
  '/posts/2015?__skip=100&__limit=100&(comments[$size]=10||praise>=5)',
  {queryOptions: {__skip: 'skip', __limit: 'limit'}}
);

// output

{
  "query": {
    "$or": [
      {"comments": {"$size": 10}},
      {"praise": {"$gte": 5}}
    ],
    "year": 2015
  },
  "options": {
    "skip": 100,
    "limit": 100
  }
}
```

Next, you may write like this:

```
mongoclient
  .db('test')
  .collection('users')
  .find(obj.query, obj.options)
```

see [test](https://github.com/nswbmw/path-to-mongodb/blob/master/test/test.js) for more details.

### Test

    npm test

### Benchmark

    node benchmark
    
### License

MIT