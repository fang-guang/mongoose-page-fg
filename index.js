const _ = require('lodash');
const Ajv = require('ajv');
const Boom = require('boom');
const cache = require('./cache.js');

const ajv = new Ajv({
  // 给属性和items加上默认值
  useDefaults: true,
  // 强制数据类型强制转化为type指定类型
  coerceTypes: 'arrary',
});

/**
 * 这个方法用于返回path对应页面的单页数据
 * @param {Object} options
 * @param {Object} options.limit 限制的数量
 * @param {Object} options.datap this.find({constion})
 * @param {Object} options.q 查询条件
 */
const getSparseResult = (options) => {
  const {
    limit, page, dataP,
  } = options;

  return dataP.limit(limit).then((data) => ({
    data,
    pageindex: page,
    count: data.length,
  }));
};

/**
 * 返回总页数，以及总数量
 * @param {Object} options
 * @param {Object} options.limit 限制的数量
 * @param {Object} options.countP db.count({consition})
 */
const totalCount = async (options) => {
  const { skip, limit, countP } = options;
  const findNumber = await countP;

  if (skip > findNumber) {
    throw Boom.badRequest('total_counts less than skip number');
  }

  if (findNumber % limit === 0) {
    return ({
      total_pages: findNumber / limit,
      total_counts: findNumber,
    });
  }

  return ({
    total_pages: Math.floor(findNumber / limit) + 1,
    total_counts: findNumber,
  });
};

/**
 * 返回数据以及单页以及全部数据的统计结果
 * @param {Object} options
 * @param {Object} options.dataP 需要操作的model
 * @param {Object} options.countP db.count({consition})
 * @param {Number} options.limit 单页数量
 * @param {Number} options.page 页码
 * @param {Number} options.skip 跳过的数量
 */
const getResult = (options) => {
  const {
    dataP, limit, page, countP, skip, totalCountKey, cachePayload,
  } = options;
  return Promise.all([
    getSparseResult({ limit, page, dataP }),
    cache({
      payload: cachePayload,
      key: totalCountKey,
      getPathNum: totalCount({ skip, limit, countP }),
    }),
  ]).then(([pathData, totalNum]) => ({
    data: pathData.data,
    page_index: pathData.pageindex,
    page_count: pathData.count,
    total_pages: totalNum.total_pages,
    total_counts: totalNum.total_counts,
  }));
};

const optsSchema = {
  type: 'object',
  properties: {
    lean: { type: 'boolean', default: true },
    page: { type: 'number', minimum: 1, default: 1 },
    limit: {
      type: 'number', minumum: 1, maxumum: 100, default: 30,
    },
    select: { $ref: '#/definitions/stringOrObject' },
    sort: { $ref: '#/definitions/stringOrObject' },
  },
  definitions: {
    stringOrObject: {
      // 关键字的值应为JSON模式的数组。如果数据与该数组中的一个JSON模式完全匹配，则该数据有效。
      oneOf: [{ type: 'string' }, { type: 'object' }],
    },
  },
};

/**
 * @param {schem} schema  model schema 用于分页的mongo插件的schema
 * @param {Object} query  model query 操作符操作
 * @param {Object} payload  对model的操作
 * @param {Object} cachePayload  redis配置
 *
 * example:
 * model.paging({
 *    query:{
 *        user: 'lmy', description:'tutou1'
 *    },
 *     payload: {
 *        limit: 10,page: 1, select: {user:1, room:1, _id:0}, sort:{_id:-1} }
 *    })
 */
module.exports = (schema) => {
  const optsValidate = ajv.compile(optsSchema);

  schema.statics.paging = function paging({ query = {}, payload = {}, cachePayload = {} }) {
    if (!optsValidate(payload)) {
      const errorMsg = ajv.errorsText(optsValidate.errors);
      return Promise.reject(new Error(errorMsg));
    }
    const findConditions = typeof query === 'string' ? JSON.parse(query) : query;

    const dataP = this.find(findConditions);
    const countP = this.count(findConditions);
    // model + query + limit 确保一致性
    const totalCountKey = this.modelName + JSON.stringify(query) + payload.limit;
    // 将传入的path参数转化为skip,参数若传递参数有page则skip page * limit 的数量
    if (_.has(payload, 'page')) {
      payload.skip = payload.limit * (payload.page - 1);
    }

    ['select', 'sort', 'skip', 'lean', 'limit'].forEach((key) => {
      if (payload[key] !== undefined) {
        dataP[key](payload[key]);
      }
    });

    return getResult({
      dataP,
      countP,
      totalCountKey,
      cachePayload,
      ...payload,
    });
  };
};
