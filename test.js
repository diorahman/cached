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
    assert.deepEqual(await cache.srem(), null)
    assert.deepEqual(await cache.lpush(), null)
    assert.deepEqual(await cache.lrem(), null)
    assert.deepEqual(await cache.lrange(), [])
    assert.deepEqual(await cache.exists(), false)
    assert.deepEqual(await cache.ttl(), null)
  })

  it('should set and get a value', async () => {
    await cache.del('huhu')
    await cache.set('huhu', {ok: 1})
    const saved = await cache.get('huhu')
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

  it('should give null on parsing non-json member', async () => {
    await cache.del('hehe')
    await cache.set('hehe', 'hihi')
    let saved = await cache.get('hehe')
    assert.deepEqual(saved, null)

    await cache.del('hoho')
    await cache.sadd('hoho', 'ok1')
    let member = await cache.smembers('hoho')
    assert.deepEqual(member, null)
  })

  it('should give null on invalid expiry', async () => {
    await cache.del('hehe')
    const reply = await cache.set('hehe', 'hihi', 'invalid')
    assert.deepEqual(reply, null)
  })

  it('should give 0 on removing invalid member', async () => {
    const reply = await cache.srem('haha', 'hihi')
    assert.deepEqual(reply, 0)
  })

  it('should fail on invalid storage', async () => {
    const config = {
      host: 'localhost',
      port: 8000
    }
    const fail = new Cache('ok2', config)
    const reply = await fail.del()
    assert.deepEqual(reply, null)
  })

  it('should exists', async () => {
    await cache.set('1', '2')
    assert.deepEqual(await cache.ttl('1'), 300)
    assert.ok(await cache.exists('1'))
  })

  it('should push, range and remove items from a list', async () => {
    await cache.del('list1')
    await cache.lpush('list1', '1')
    await cache.lpush('list1', '2')
    await cache.lpush('list1', '3')

    const range1 = await cache.lrange('list1')
    assert.deepEqual(range1, ['3', '2', '1'])

    const range2 = await cache.lrange('list1', 1)
    assert.deepEqual(range2, ['2', '1'])

    const range3 = await cache.lrange('list1', 1, 1)
    assert.deepEqual(range3, ['2'])

    await cache.lrem('list1', '2')
    const range4 = await cache.lrange('list1')
    assert.deepEqual(range4, ['3', '1'])
  })

  it('should set default expiry', async () => {
    const config = {
      host: 'localhost',
      port: 6379,
      expiry: 1111
    }
    const unique = new Cache('ok3', config)
    await unique.set('1', '1')
    assert.deepEqual(await unique.ttl('1'), config.expiry)
  })

  it('should execute in batch', async () => {
    await cache.del('batch1')
    await cache.del('batch2')
    await cache.set('batch1', 'ok')
    await cache.set('batch2', 'ok')

    const results = await cache.storage.batch()
      .get(cache.prefixed('batch1'))
      .get(cache.prefixed('batch2'))
      .execAsync()

    assert.deepEqual(results, ['ok', 'ok'])
  })
})
