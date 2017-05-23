/* eslint-env mocha */

const Promise = require('bluebird')
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

  it('should set and get a value', async () => {
    await cache.del('hihi')
    await cache.set('hihi', {ok: 1})
    const saved = await cache.get('hihi')
    assert.deepEqual(saved, {ok: 1})
  })

  it('should add, get and remove members in a set', async () => {
    await cache.del('haha')
    await cache.sadd('haha', {ok: 1})
    await cache.sadd('haha', {ok: 2})

    const objects = await cache.smembers('haha')
    assert.ok(objects[0].ok === 1 || objects[0].ok === 2)
    assert.ok(objects[1].ok === 1 || objects[1].ok === 2)

    await cache.del('haha')
    await cache.sadd('haha', 'ok2')
    await cache.sadd('haha', 'ok1')

    let strings = await cache.smembers('haha', false)
    assert.ok(strings.indexOf('ok1') >= 0)
    assert.ok(strings.indexOf('ok2') >= 0)

    await cache.srem('haha', 'ok1')
    strings = await cache.smembers('haha', false)
    assert.deepEqual(strings, ['ok2'])
  })

  it('should set and expire a value', async () => {
    await cache.del('hehe')
    await cache.set('hehe', {ok: 1}, 1)
    await Promise.delay(1500)
    const expired = await cache.get('hehe')
    assert.deepEqual(expired, null)
  })
})
