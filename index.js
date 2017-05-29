const EXPIRY = Number(process.env.DEFAULT_CACHE_EXPIRY) || 300
const CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
}

const Promise = require('bluebird')
const storage = require('./storage')

module.exports = class Cache {
  constructor (namespace, config = CONFIG) {
    this.namespace = namespace || '' // the default namespace is ''
    this.storage = storage(config)
    this.expiry = config.expiry || EXPIRY
  }

  prefixed (key) {
    return `${this.namespace}:${key}`
  }

  validKeyVal (key, val) {
    return typeof key === 'string' && key.length > 0 && (typeof val === 'string' || typeof val === 'object')
  }

  validKey (key) {
    return typeof key === 'string' && key.length > 0
  }

  set (key, val, expiry = this.expiry || EXPIRY) {
    if (!this.validKeyVal(key, val)) {
      return Promise.resolve(null)
    }

    return this.storage.setexAsync(this.prefixed(key), expiry, typeof val === 'string' ? val : JSON.stringify(val))
      .catch(() => null)
  }

  get (key, parseResult = true) {
    if (!this.validKey(key)) {
      return Promise.resolve(null)
    }

    return this.storage.getAsync(this.prefixed(key))
      .then((val) => parseResult && typeof val === 'string' ? JSON.parse(val) : val)
      .catch(() => null)
  }

  del (key) {
    if (!this.validKey(key)) {
      return Promise.resolve(null)
    }

    return this.storage.delAsync(this.prefixed(key))
      .catch(() => null)
  }

  // set
  sadd (key, member) {
    if (!this.validKeyVal(key, member)) {
      return Promise.resolve(null)
    }

    return this.storage.saddAsync(this.prefixed(key), typeof member === 'string' ? member : JSON.stringify(member))
      .catch(() => null)
  }

  srem (key, member) {
    if (!this.validKeyVal(key, member)) {
      return Promise.resolve(null)
    }

    return this.storage.sremAsync(this.prefixed(key), member)
      .catch(() => null)
  }

  smembers (key, parseMember = true) {
    if (!this.validKey(key)) {
      return Promise.resolve(null)
    }

    return this.storage.smembersAsync(this.prefixed(key))
      .then((members) => {
        return parseMember ? members.map(member => typeof member === 'string' ? JSON.parse(member) : member) : members
      })
      .catch(() => null)
  }

  // list
  lpush (key, item) {
    if (!this.validKey(key, item)) {
      return Promise.resolve(null)
    }

    return this.storage.lpushAsync(this.prefixed(key), typeof item === 'string' ? item : JSON.stringify(item))
      .catch(() => null)
  }

  lrem (key, item, count = 0) {
    // NOTE: remove all items equal to item
    if (!this.validKeyVal(key, item)) {
      return Promise.resolve(null)
    }

    return this.storage.lremAsync(this.prefixed(key), count, item)
      .catch(() => null)
  }

  lrange (key, start = 0, end = -1) {
    if (!this.validKey(key)) {
      return Promise.resolve([])
    }

    return this.storage.lrangeAsync(this.prefixed(key), start, end)
      // FIXME: do we need this to return an array when failed or null?
      .then((result) => result || [])
      .catch(() => [])
  }

  exists (key) {
    if (!this.validKey(key)) {
      return Promise.resolve(false)
    }

    return this.storage.existsAsync(this.prefixed(key))
      .then((result) => result > 0)
      .catch(() => false)
  }

  ttl (key) {
    if (!this.validKey(key)) {
      return Promise.resolve(null)
    }

    return this.storage.ttlAsync(this.prefixed(key))
      .catch(() => null)
  }

  batchGet (keys, parseResult = true) {
    let k
    if (!Array.isArray(keys) || (k = keys.filter((key) => this.validKey(key))).length === 0) {
      return Promise.resolve([])
    }
    const batch = this.storage.batch()
    k.forEach((key) => batch.get(this.prefixed(key)))
    return batch.execAsync()
      .then((results) => {
        return results.map((val) => parseResult && typeof val === 'string' ? JSON.parse(val) : val)
      })
      .catch(() => [])
  }
}
