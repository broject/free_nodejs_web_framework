/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


exports.init = function (base) {
    var sys_config = base.loader.config('sys.config');
    var use_redis = sys_config.cache.use_redis;
    var cache_ignore = sys_config.cache.ignore;

    this.singleton = function () {
        var saved_cacher = base.bag.saved_cacher;
        if (saved_cacher === undefined) {
            if (use_redis) {
                var redis = require('redis');
                saved_cacher = redis.createClient(6379, '127.0.0.1');
            } else {
                saved_cacher = require('memory-cache');
            }
        }
        base.bag.saved_cacher = saved_cacher;
        return saved_cacher;
    };
    this.cache = function (key, callback) {
        if (key === undefined) {
            throw new Error('Cache key undefined!');
        }
        if (callback === undefined) {
            throw new Error('Data function undefined!');
        }
        if (cache_ignore) {
            callback(null, undefined);
        } else {
            var cacher = this.singleton();
            if (use_redis) {
                cacher.get(key, callback);
            } else {
                var data = cacher.get(key);
                callback(null, data);
            }
        }
    };
    this.put = function (key, data, expire) {
        if (expire > 0) {
            var cacher = this.singleton();
            if (use_redis) {
                cacher.setex(key, expire, JSON.stringify(data), function (error) {
                    if (error) {
                        console.log('Cacher Set Error: ' + error);
                    }
                });
            } else {
                var duration = expire * 1000;
                cacher.put(key, data, duration);
            }
        }
    }
    return this;
};