# page-mongo-fg

A maging plugin of mongoose.

# Getting Start

## NPM

Installation

```shell
npm i -S paging-mongoose-fg
```


## quotoe
```javascript
const mpaging = require('paging-mongoose-fg')
schema.plugin(mpaging);
```

## params
```javascript
/**
 * @param {schem} schema  model schema   You need to set up the model for paging functionality
 * @param {Object} query  model query    Operator operation
 * @param {Object} payload  Operations on the Model
 * @param {Object} cachePayload  custom redis configuration
 *
 * return 
 * {
 *   data,                      data for the current page number
 *   page_index: pageIndex,     current index page
 *   page_count: pageCount,     current page number 
 *   total_pages: totalPages,   total page number
 *   total_counts: totalCounts, total number 
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

## Usage

### support defeat limit 30, page defeat 1
```javascript    
await model.paging({});
```

### support json string query
```javascript
await model.paging({
    query: '{"name":"fg"}',
});
```

### support select, sort, skip, lean, limit payload
```javascript
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
```
### support redis cache total number
```javascript
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
```

__example__

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