var pathToMongodb = require('./');

var count = 100000;

console.time('100000 times');
while (count--) {
  pathToMongodb('/posts/:year/:skip/:limit', '/posts/2015/200/100?(price=0.99||price="1.99")&&(sale=true||qty<20)', {defaultDB: 'test'});
}
console.timeEnd('100000 times');