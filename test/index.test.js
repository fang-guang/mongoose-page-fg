const test = require('ava');

const { model, dropCollection, insetDoc } = require('./init.js');

// 插入100条数据
test.before(async () => {
  await insetDoc();
});

// 测试完删除db
test.after(async () => {
  await dropCollection();
});

test('throw error when param inconformity rule', async (t) => {
  await t.throwsAsync(async () => {
    await model.paging({
      payload: {
        limit: 10,
        page: 3,
        select: { name: 1, _id: 0 },
        sort: { _id: -1 },
        lean: true,
      },
      cachePayload: {
        redis: { host: '127.0.', db: '5' },
      },
    }, { message: 'data.cachePayload.redis.host should match format "ipv4"' });
  });
});

test('support defeat limit 30, page defeat 1', async (t) => {
  const {
    data,
    page_index: pageIndex,
    page_count: pageCount,
    total_pages: totalPages,
    total_counts: totalCounts,
  } = await model.paging({});

  t.is(pageIndex, 1);
  t.is(data.length, 30);
  t.is(pageCount, 30);
  t.is(totalPages, 4);
  t.is(totalCounts, 100);
});

test('support json string query', async (t) => {
  const {
    data,
    total_counts: totalCounts,
  } = await model.paging({
    query: '{"name":"fg"}',
  });

  t.is(data.length, 30);
  t.is(totalCounts, 100);
});

test('support select, sort, skip, lean, limit payload', async (t) => {
  const {
    data,
    page_index: pageIndex,
    page_count: pageCount,
    total_pages: totalPages,
    total_counts: totalCounts,
  } = await model.paging({
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
  const verifySelect = Object.keys(data[0]).length;
  t.is(verifySelect, 1);
  t.is(data.length, 10);
  t.is(totalCounts, 100);
  t.is(totalPages, 10);
  t.is(pageCount, 10);
  t.is(pageIndex, 3);
});

test('support redis cache total number', async (t) => {
  const {
    data,
    page_index: pageIndex,
    page_count: pageCount,
    total_pages: totalPages,
    total_counts: totalCounts,
  } = await model.paging({
    cachePayload: {
      redis: {
        host: '127.0.0.1',
        port: '6379',
        db: '3',
      },
      prefix: 'fg',
      expire: 1 * 60,
    },
  });

  t.is(pageIndex, 1);
  t.is(data.length, 30);
  t.is(pageCount, 30);
  t.is(totalPages, 4);
  t.is(totalCounts, 100);
});
