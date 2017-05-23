/* eslint-env mocha */

const assert = require('assert')
const Cache = require('./')

const cache = new Cache('ok')

describe('cache', () => {
  it('should give null on invalid args', async () => {
    assert.deepEqual(await cache.set(), null)
    assert.deepEqual(await cache.set('hihi'), null)
    assert.deepEqual(await cache.get(), null)
    assert.deepEqual(await cache.del(), null)
    assert.deepEqual(await cache.sadd(), null)
    assert.deepEqual(await cache.sadd('haha'), null)
    assert.deepEqual(await cache.smembers(), null)
  })

  it('should set a value', async () => {
    await cache.del('hihi')
    await cache.set('hihi', {ok: 1})
    const saved = await cache.get('hihi')
    assert.deepEqual(saved, {ok: 1})
  })

  it('should add a member in a set', async () => {
    await cache.del('haha')
    await cache.sadd('haha', {ok: 1})
    await cache.sadd('haha', {ok: 2})
    await cache.sadd('haha', {ok: 3})
    await cache.sadd('haha', {ok: 4})
    const saved = await cache.smembers('haha')
    assert.deepEqual(saved.length, 4)
  })
})
