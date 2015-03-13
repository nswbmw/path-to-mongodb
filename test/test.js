var test = require('tape');
var pathToMongodb = require('..');

test('Test path-to-mongodb', function (t) {
  t.deepEqual(pathToMongodb('/users/:uid', '/posts/1'), null);

  t.deepEqual(pathToMongodb('/:uid', '/1'), {
    db: undefined,
    collection: undefined,
    query: {
      uid: 1
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/:uid', '/1', {defaultDB: 'test'}), {
    db: 'test',
    collection: undefined,
    query: {
      uid: 1
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/:uid', '/1', {defaultCollection: 'users'}), {
    db: undefined,
    collection: 'users',
    query: {
      uid: 1
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/:uid', '/1', {defaultDB: 'test', defaultCollection: 'users'}), {
    db: 'test',
    collection: 'users',
    query: {
      uid: 1
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/test/:uid', '/1', {defaultCollection: 'users'}), {
    db: 'test',
    collection: 'users',
    query: {
      uid: 1
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/test/users/:uid', '/1'), {
    db: 'test',
    collection: 'users',
    query: {
      uid: 1
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/test/users/user/:uid', '/user/"1"'), {
    db: 'test',
    collection: 'users',
    query: {
      uid: "1"
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/test/user', '/user?uid=1'), null);

  t.deepEqual(pathToMongodb('/test/users/user', '/user?vip=true'), {
    db: 'test',
    collection: 'users',
    query: {
      vip: true
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/', '/?vip="true"', {defaultDB: 'test', defaultCollection: 'users'}), {
    db: 'test',
    collection: 'users',
    query: {
      vip: "true"
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/test/users/:uid', '/1?uid=2&age=25', {defaultDB: 'test2'}), {
    db: 'test',
    collection: 'users',
    query: {
      uid: 1,
      age: 25
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year/:month/:day/:title', '/posts/2015/2/14/hello-world'), {
    db: 'test',
    collection: 'posts',
    query: {
      year: 2015,
      month: 2,
      day: 14,
      title: 'hello-world'
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year/:month/:day/:title', '/posts/"2015"/"2"/"14"/hello-world'), {
    db: 'test',
    collection: 'posts',
    query: {
      year: '2015',
      month: '2',
      day: '14',
      title: 'hello-world'
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year', '/posts/2015?skip=100&limit=100'), {
    db: 'test',
    collection: 'posts',
    query: {
      year: 2015
    },
    options: {
      skip: 100,
      limit: 100
    }
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year', '/posts/2015?skip=100&limit=100&_id=123'), {
    db: 'test',
    collection: 'posts',
    query: {
      year: 2015,
      _id: 123
    },
    options: {
      skip: 100,
      limit: 100
    }
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year', '/posts/2015?skip=100&limit=100&fields=title&fields=content&fields=comments'), {
    db: 'test',
    collection: 'posts',
    query: {
      year: 2015
    },
    options: {
      skip: 100,
      limit: 100,
      fields: [ 'title', 'content', 'comments' ]
    }
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year', '/posts/2015?skip=100&limit=100&fields=title&fields=content&fields=comments', {queryOptions: ['fields']}), {
    db: 'test',
    collection: 'posts',
    query: {
      year: 2015,
      skip: 100,
      limit: 100
    },
    options: {
      fields: [ 'title', 'content', 'comments' ]
    }
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year', '/posts/2015?__skip=100&__limit=100', {queryOptions: ['skip', 'limit']}), {
    db: 'test',
    collection: 'posts',
    query: {
      year: 2015,
      __skip: 100,
      __limit: 100
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year', '/posts/2015?__skip=100&__limit=100', {queryOptions: {__skip: 'skip', __limit: 'limit'}}), {
    db: 'test',
    collection: 'posts',
    query: {
      year: 2015
    },
    options: {
      skip: 100,
      limit: 100
    }
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year', '/posts/2015?skip=100&limit=100&fields=title&fields=content&fields=comments&sort[title]=-1'), {
    db: 'test',
    collection: 'posts',
    query: {
      year: 2015
    },
    options: {
      skip: 100,
      limit: 100,
      fields: [ 'title', 'content', 'comments' ],
      sort: { title: -1 }
    }
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year/:skip/:limit', '/posts/2015/200/100?_id=123'), {
    db: 'test',
    collection: 'posts',
    query: {
      year: 2015,
      _id: 123,
      skip: 200,
      limit: 100
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year/:skip/:limit', '/posts/2015/200/100?skip=10&limit=20&_id=123'), {
    db: 'test',
    collection: 'posts',
    query: {
      year: 2015,
      _id: 123,
      skip: 200,
      limit: 100
    },
    options: {
      skip: 10,
      limit: 20
    }
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year', '/posts/2015?((user=nswbmw||user=zk)&&(star=true||comments[$size]>=100))&skip=100&limit=100'), {
    db: 'test',
    collection: 'posts',
    query: {
      year: 2015,
      $and: [
        {"$or": [{"user": 'nswbmw'}, {"user": 'zk'}]},
        {"$or": [{"star": true}, {"comments": {"$size": {"[$gte]": 100}}}]}
      ]
    },
    options: {
      skip: 100,
      limit: 100
    }
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year', '/posts/2015?((user=nswbmw||user=zk)&&(star=true||comments[$size]>=100))&skip=100&limit=100', {depth: Infinity}), {
    db: 'test',
    collection: 'posts',
    query: {
      year: 2015,
      $and: [
        {"$or": [{"user": 'nswbmw'}, {"user": 'zk'}]},
        {"$or": [{"star": true}, {"comments": {"$size": {"$gte": 100}}}]}
      ]
    },
    options: {
      skip: 100,
      limit: 100
    }
  });

  t.deepEqual(pathToMongodb('/test/posts/posts/:year', '/posts/2015?(user=nswbmw||user=zk)&(star=true||comments[$size]>=100)&skip=100&limit=100', {depth: Infinity}), {
    db: "test",
    collection: "posts",
    query: {
      $or: [
        {"user": "nswbmw", "star": true},
        {"user": "zk", "comments": {"$size": {"$gte": 100}}}
      ],
      year: 2015
    },
    options: {
      skip: 100,
      limit: 100
    }
  });

  t.end();
});