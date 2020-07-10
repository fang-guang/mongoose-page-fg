# page-mongo-fg

A plugin of mongoose page.

# Getting Start

## NPM

Installation

```shell
npm i -S paging-mongoose-fg
```

## Usage
### support defeat limit 30, page defeat 1
    await model.paging({});
### support json string query
    await model.paging({
        query: '{"name":"fg"}',
  });
### support select, sort, skip, lean, limit payload
    await model.paging({
        payload: {
            limit: 10,
            page: 3,
            select: {
                name: 1,
                _id: 0,
            },
            sort: {
                _id: -1,
            },
            lean: true,
        },
  });
### support redis cache total number
    await model.paging({
        cachePayload: {
            redis: {
                host: '127.0.0.1',
                port: '6379',
                db: '3',
            },
        prefix: 'fg',
        expire: 1 * 60,
    },
})


example

```javascript
const paging = require('paging-mongoose-fg');

schema.plugin(paging);
await model.paging({
    query:{
        user: 'lmy', description: 'tutou'
        }, 
    payload: {
        limit: 10,
        page: 3, 
        select: {
            user:1, 
            room:1, 
            _id:0
            }, 
        sort:{
            _id:-1
            } 
        }
    }
)
```
## 参数讲解
```
/**
 * @param {schem} schema  model schema 用于分页的mongo插件的schema
 * @param {Object} query  model query 操作符操作
 * @param {Object} payload  对model的操作
 * @param {Object} cachePayload  自定义redis配置
 *
 * return 
 * {
 *   data,                      该页的数据
 *   page_index: pageIndex,     当前索引页
 *   page_count: pageCount,     当前页面数量
 *   total_pages: totalPages,   全部页数
 *   total_counts: totalCounts, 全部数据
 * }
 *
 *
 * example:
 * model.paging({
 *    query:{
 *        user: 'lmy', description:'tutou1'
 *    },
 *    payload: {
 *        limit: 10,page: 1, select: {user:1, room:1, _id:0}, sort:{_id:-1} }
 *    })
 *    cachePayload: {
 *        redis: {
 *             host: '127.0.0.1',
 *             port: '6379',
 *             db: '3',
 *           },
 *         prefix: 'fg',
 *         expire: 1 * 60,
 *     },
 * })
 */
```