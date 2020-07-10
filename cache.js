const _ = require('lodash');
const Redis = require('ioredis');

/**
 * @param {Object} payload   redis配置
 * @param {Function} getPathNum 函数
 * @param {String} key 缓存key
 */
module.exports = (({ payload = {}, key, getPathNum }) => {
  const opt = _.defaultsDeep(payload, {
    redis: {
      host: '127.0.0.1',
      port: '6379',
      db: '6',
    },
    prefix: 'total_count_cache_',
    expire: 5 * 60,
  });
  const client = new Redis(opt.redis);
  const keyp = opt.prefix + key;
  return client.get(keyp).then((data) => {
    if (data !== null && data !== 'undefined') {
      const result = JSON.parse(data);
      return result;
    }
    return getPathNum.then((result) => {
      if (!_.isUndefined(result)) {
        // 全部转化为json存入redis
        const value = JSON.stringify(result);
        client.set(key, value, 'ex', opt.expire, 'nx');
      }

      return result;
    });
  });
});
