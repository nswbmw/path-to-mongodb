var test = require('tape');
var pathToMongodb = require('..');

test('Test path-to-mongodb', function (t) {
  t.deepEqual(pathToMongodb('/users/:uid', '/posts/1'), null);

  t.deepEqual(pathToMongodb('/:uid', '/1'), {
    query: {
      uid: 1
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/users/:uid', '/users/1'), {
    query: {
      uid: 1
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/users/:uid', '/users/"1"'), {
    query: {
      uid: "1"
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/users', '/users?uid=1'), {
    query: {
      uid: 1
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/users/:uid', '/users/2?uid=1'), {
    query: {
      uid: 2
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/users', '/users?vip=true'), {
    query: {
      vip: true
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/users', '/users?vip="true"'), {
    query: {
      vip: "true"
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/users/:uid', '/users/1?uid=2&age=25'), {
    query: {
      uid: 1,
      age: 25
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/users/:uid', '/users/1?uid=2&user.name=nswbmw&age=25'), {
    query: {
      uid: 1,
      'user.name': 'nswbmw',
      age: 25
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/posts/:year/:month/:day/:title', '/posts/2015/2/14/hello-world'), {
    query: {
      year: 2015,
      month: 2,
      day: 14,
      title: 'hello-world'
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/posts/:year/:month/:day/:title', '/posts/"2015"/"2"/"14"/hello-world'), {
    query: {
      year: '2015',
      month: '2',
      day: '14',
      title: 'hello-world'
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/posts/:year', '/posts/2015?skip=100&limit=100'), {
    query: {
      year: 2015
    },
    options: {
      skip: 100,
      limit: 100
    }
  });

  t.deepEqual(pathToMongodb('/posts/:year', '/posts/2015?skip=100&limit=100&_id=123'), {
    query: {
      year: 2015,
      _id: 123
    },
    options: {
      skip: 100,
      limit: 100
    }
  });

  t.deepEqual(pathToMongodb('/posts/:year', '/posts/2015?skip=100&limit=100&fields=title&fields=content&fields=comments'), {
    query: {
      year: 2015
    },
    options: {
      skip: 100,
      limit: 100,
      fields: [ 'title', 'content', 'comments' ]
    }
  });

  t.deepEqual(pathToMongodb('/posts/:year', '/posts/2015?skip=100&limit=100&fields=title&fields=content&fields=comments', {queryOptions: ['fields']}), {
    query: {
      year: 2015,
      skip: 100,
      limit: 100
    },
    options: {
      fields: [ 'title', 'content', 'comments' ]
    }
  });

  t.deepEqual(pathToMongodb('/posts/:year', '/posts/2015?__skip=100&__limit=100', {queryOptions: ['skip', 'limit']}), {
    query: {
      year: 2015,
      __skip: 100,
      __limit: 100
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/posts/:year', '/posts/2015?__skip=100&__limit=100', {queryOptions: ['__skip', '__limit']}), {
    query: {
      year: 2015
    },
    options: {
      __skip: 100,
      __limit: 100
    }
  });

  t.deepEqual(pathToMongodb('/posts/:year', '/posts/2015?__skip=100&__limit=100', {queryOptions: {__skip: 'skip', __limit: 'limit'}}), {
    query: {
      year: 2015
    },
    options: {
      skip: 100,
      limit: 100
    }
  });

  t.deepEqual(pathToMongodb('/posts/:year', '/posts/2015?skip=100&limit=100&fields=title&fields=content&fields=comments&sort[title]=-1'), {
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

  t.deepEqual(pathToMongodb('/posts/:year/:skip/:limit', '/posts/2015/200/100?_id=123'), {
    query: {
      year: 2015,
      _id: 123,
      skip: 200,
      limit: 100
    },
    options: {}
  });

  t.deepEqual(pathToMongodb('/posts/:year/:skip/:limit', '/posts/2015/200/100?skip=10&limit=20&_id=123'), {
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

  t.deepEqual(pathToMongodb('/posts/:year', '/posts/2015?((user=nswbmw||user=zk)&&(star=true||comments[$size]>=100))&skip=100&limit=100'), {
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

  t.deepEqual(pathToMongodb('/posts/:year', '/posts/2015?((user=nswbmw||user=zk)&&(star=true||comments[$size]>=100))&skip=100&limit=100', {depth: Infinity}), {
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

  t.deepEqual(pathToMongodb('/posts/:year', '/posts/2015?(user=nswbmw||user=zk)&(star=true||comments[$size]>=100)&skip=100&limit=100', {depth: Infinity}), {
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

  function aliasLimitAndSkip(value) {
    return 'limit=10&skip=' + (value * 10);
  }

  t.deepEqual(pathToMongodb('/posts/:year', '/posts/2015?(user=nswbmw||user=zk)&(star=true||comments[$size]>=100)&p=2', {
    depth: Infinity,
    alias: {
      p: aliasLimitAndSkip
    }
  }), {
    query: {
      $or: [
        {"user": "nswbmw", "star": true},
        {"user": "zk", "comments": {"$size": {"$gte": 100}}}
      ],
      year: 2015
    },
    options: {
      skip: 20,
      limit: 10
    }
  });

  t.deepEqual(pathToMongodb('/posts/:year', '/posts/2015?p=2&(user=nswbmw||user=zk)&(star=true||comments[$size]>=100)', {
    depth: Infinity,
    alias: {
      p: 'limit=10&skip=20'
    }
  }), {
    query: {
      $or: [
        {"user": "nswbmw", "star": true},
        {"user": "zk", "comments": {"$size": {"$gte": 100}}}
      ],
      year: 2015
    },
    options: {
      skip: 20,
      limit: 10
    }
  });

  t.end();
});