module.exports.model = function (name) {
    
    var self = this;
    var collection_name = name;
    var config = require('./config').config;
    var core = require('./core').core;
    var schemas = require('./models/schemas');
    
    var mongo = require('mongodb'),  
        Server = mongo.Server,
        Db = mongo.Db,
        ObjectId = mongo.ObjectId;
    
    var server = new Server(config.current_db().dbhost, config.current_db().dbport, {
        auto_reconnect: true
    });
    
    var db = new Db(config.current_db().database, server);
    
    console.log('(' + collection_name + ') model initialized.');
    
    var onError = function (err, callback) {
        db.close();
        
        console.log('Model (' + collection_name + ') error: ');
        console.log(err.message);
        console.log(' ');
        
        callback(err);
    };
    
    var execute_direct = function (query, callback) {
        db.open(function (err, db) {
            if (!err) {
                query(db);
            } else {
                onError(err, callback);
            }
        });
    };
    
    var collection = function (db, query, callback) {
        db.collection(collection_name, function (err, collection) {
            if (!err) {
                query(collection);
            } else {
                onError(err, callback);
            }
        });
    };
    
    var execute = function (query, callback) {
        db.open(function (err, db) {
            if (!err) {
                collection(db, query, callback);
            } else {
                onError(err, callback);
            }
        });
    };
    
    /*----*/
    
    this.get_object_id = function (id) {
        return ObjectId(id);
    };
    
    this.get_collection_name = function () {
        return collection_name;
    };
    
    this.get_schema = function () {
        return schemas.schema(collection_name, config, core);
    };
    
    /*----*/
    
    this.exists = function (callback) {
        //console.log('******************************** IsExists');
        var cond = { safe: true };
        var query = function (db) {
            db.collection(collection_name, cond, function (err, collection) {
                
                db.close();
                if (err) {
                    callback(false);
                } else {
                    callback(true);
                }

            });
        };
        execute_direct(query, callback);
        return true;
    };
    
    this.countall = function (callback) {
        //console.log('******************************** CountAll');
        var query = function (collection) {
            collection.count(function (err, doc) {
                
                if (!err) {
                    
                    db.close();
                    if (callback) {
                        callback(doc);
                    } else {
                        console.log('!Countall callback(doc) not exists!');
                    }

                } else {
                    onError(err, callback);
                }

            });
        };
        execute(query, callback);
        return true;
    };
    
    this.delete = function (cond, callback) {
        if (typeof cond !== 'object') {
            return false;
        }
        //console.log('******************************** Deleting');
        //console.log(core.tojstr_(cond));
        //console.log('******************************** Deleting');
        var query = function (collection) {
            collection.deleteMany(cond, function (err, docs) {
                
                if (!err) {
                    
                    db.close();
                    if (callback) {
                        callback(docs);
                    } else {
                        console.log('!Delete callback(docs) not exists!');
                    }

                } else {
                    onError(err, callback);
                }

            });
        };
        execute(query, callback);
        return true;
    };
    
    this.update = function (cond, obj, callback) {
        if (typeof cond === 'string') {
            cond = { '_id': ObjectId(cond) };
        }
        if (typeof cond !== 'object') {
            return false;
        }
        if (typeof obj === 'function' && callback === undefined) {
            callback = obj;
            obj = cond;
            if (obj['_id'] !== undefined) {
                cond = { '_id' : obj['_id'] };
            }
        }
        if (obj['_id'] !== undefined) {
            delete obj['_id'];
        }
        //console.log('******************************** Updating');
        //console.log(core.tojstr_(cond));
        //console.log(core.tojstr_(obj));
        //console.log('******************************** Updating');
        var query = function (collection) {
            collection.updateMany(cond, { $set: obj }, function (err, docs) {
                
                if (!err) {
                    
                    db.close();
                    if (callback) {
                        callback(docs);
                    } else {
                        console.log('!Update callback(docs) not exists!');
                    }

                } else {
                    onError(err, callback);
                }

            });
        };
        execute(query, callback);
        return true;
    };
    
    this.insert = function (arr, callback) {
        if (!Array.isArray(arr)) {
            var obj = arr;
            arr = [];
            arr.push(obj);
        }
        for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            if (obj['_id'] !== undefined) {
                delete obj['_id'];
            }
        }
        //console.log('******************************** Inserting');
        //console.log(core.tojstr_(arr));
        //console.log('******************************** Inserting');
        var query = function (collection) {
            collection.insertMany(arr, function (err, docs) {
                
                if (!err) {
                    
                    db.close();
                    if (callback) {
                        callback(docs);
                    } else {
                        console.log('!Insert callback(docs) not exists!');
                    }

                } else {
                    onError(err, callback);
                }

            });
        };
        execute(query, callback);
        return true;
    };
    
    this.count = function (cond, callback) {
        if (typeof cond !== 'object') {
            return false;
        }
        //console.log('******************************** Count');
        var query = function (collection) {
            collection.find(cond).count(function (err, doc) {
                
                if (!err) {
                    
                    db.close();
                    if (callback) {
                        callback(doc);
                    } else {
                        console.log('!Count callback(doc) not exists!');
                    }

                } else {
                    onError(err, callback);
                }

            });
        };
        execute(query, callback);
        return true;
    };

    this.get_list = function (cond, callback) {
        if (typeof cond !== 'object') {
            return false;
        }
        var sort = null;
        if (cond['$orderby'] !== undefined) {
            sort = cond['$orderby'];
            delete cond['$orderby'];
        }
        var limit = null;
        if (cond['$limit'] !== undefined) {
            limit = cond['$limit'];
            delete cond['$limit'];
        }
        var skip = null;
        if (cond['$skip'] !== undefined) {
            skip = cond['$skip'];
            delete cond['$skip'];
        }
        //console.log('******************************** Selecting');
        //console.log(core.tojstr_(cond));
        //console.log('******************************** Selecting');
        var query = function (collection) {
            var f = collection.find(cond);
            if (sort !== null) {
                f = f.sort(sort);
            }
            if (limit !== null) {
                f = f.limit(limit);
            }
            if (skip !== null) {
                f = f.skip(skip);
            }
            f.toArray(function (err, docs) {
                
                if (!err) {
                    
                    db.close();
                    if (callback) {
                        callback(docs);
                    } else {
                        console.log('!Select callback(docs) not exists!');
                    }

                } else {
                    onError(err, callback);
                }

            });
        };
        execute(query, callback);
        return true;
    };
    
    this.aggregate = function (cond, callback) {
        if (typeof cond !== 'object') {
            return false;
        }
        //console.log('******************************** Selecting');
        //console.log(core.tojstr_(cond));
        //console.log('******************************** Selecting');
        var query = function (collection) {
            collection.aggregate(cond).toArray(function (err, docs) {
                
                if (!err) {
                    
                    db.close();
                    if (callback) {
                        callback(docs);
                    } else {
                        console.log('!Select callback(docs) not exists!');
                    }

                } else {
                    onError(err, callback);
                }

            });
        };
        execute(query, callback);
        return true;
    };
    
    /*----*/
    
    var init_user_default_data = function (callback) {
        
        var users = core.clone_(config.user_default_data);
        self.insert(users, function (docs) {
            callback(true);
        });

    };
    
    this.init_default_data_if_not_exists = function (callback) {
        
        self.exists(function (exists) {
            
            if (exists) {
                
                console.log('Collection(' + collection_name + ') is exists.');
                
                self.countall(function (count) {
                    
                    if (parseInt(count) === count && count === 0) {
                        
                        console.log('Default data initializing...');
                        init_user_default_data(callback);

                    } else {
                        
                        if (count > 0) {
                            
                            callback(true);

                        } else {
                            
                            console.log('Collection(' + collection_name + ').Count error!');
                            callback(false);

                        }

                    }

                });

            } else {
                
                console.log('Collection(' + collection_name + ') is not exists!');
                callback(false);

            }

        });
    };
    
    return this;//require('./models/' + name)(onError, db);
};