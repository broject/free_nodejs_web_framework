exports.dbcontext = function (engine, group, config) {
    if (this.config === undefined) {
        this.engine = engine;
        this.group = group;
        this.config = config;
        this.oracle = require('oracledb');

        if (this.config.ResultRowsToJsonOBJECT) {
            this.oracle.outFormat = this.oracle.OBJECT;
        }
        if (this.config.stmtCacheSize > 0) {
            this.oracle.stmtCacheSize = this.config.stmtCacheSize;
        }
        if (this.config.autoCommit) {
            this.oracle.autoCommit = this.config.autoCommit;
        }
        this.options = {
            user: this.config.user,
            password: this.config.password,
            connectString: this.config.host + ':' + this.config.port + '/' + this.config.name
        };
        if (this.config.use_pool) {
            this.options.queueRequests = this.config.queueRequests;
            this.options._enableStats = this.config._enableStats;
            this.options.retryCount = 5; //The max amount of retries to get a connection from the pool in case of any error (default to 10 if not provided) 
            this.options.retryInterval = 500; //The interval in millies between get connection retry attempts (defaults to 250 millies if not provided) 
            this.options.runValidationSQL = true; //True to ensure the connection returned is valid by running a test validation SQL (defaults to true) 
            this.options.validationSQL = 'SELECT 1 FROM DUAL'; //The test SQL to invoke before returning a connection to validate the connection is open (defaults to 'SELECT 1 FROM DUAL') 
        }
    }
    this.package = function (name) {
        if (name !== undefined && this.oracle[name] !== undefined)
            return this.oracle[name];
        else
            return this.oracle;
    }
    this.getConnection = function () {
        return this.connection;
    }
    this.getPool = function () {
        return this.pool;
    }
    this.execute = function (sql, params, callback) {
        if (!callback) {
            callback = params;
            params = false;
        }
        this.executeWith(sql, params, {}, callback);
    }
    this.executeWith = function (sql, params, setting, callback) {
        if (!setting) {
            setting = {};
        }
        if (!callback) {
            return;
        }
        var self = this;
        var _sql = sql;
        var _params = params;
        var _setting = setting;
        var _callback = callback;
        var _getConnection = function (err, connection) {
            self.connection = connection;
            if (err) {
                console.log("[ORACLE] Connection Error:" + err + '\n');
            } else {
                var _result = function (error, result) {
                    if (error) {
                        connection.close();
                        _callback(undefined, error);
                    } else {
                        connection.commit(function (error) {
                            connection.close();
                            if (error) {
                                _callback(undefined, error);
                            } else {
                                if (result === undefined)
                                    result = {};
                                if (result.rows === undefined)
                                    result.rows = [];
                                result.parameters = _params;
                                _callback(result, undefined);
                            }
                        });
                    }
                };
                if (!_params)
                    connection.execute(_sql, _result);
                else
                    connection.execute(_sql, _params, _setting, _result);
            }
        };
        if (this.config.use_pool) {
            this.oracle.createPool(this.options, function (error, pool) {
                self.pool = pool;
                pool.getConnection(_getConnection);
            });
        } else {
            this.oracle.getConnection(this.options, _getConnection);
        }
    };
    this.format_to_char = function (fieldname, format) {
        if (format === undefined)
            format = 'YYYY-MM-DD HH24:MI:SS';
        return 'TO_CHAR(' + fieldname + ', \'' + format + '\')';
    }
    this.format_to_date = function (fieldname) {
        return 'TO_DATE(:' + fieldname + ', \'YYYY-MM-DD HH24:MI:SS\')';
    }
    this.format_to_timestamp = function (fieldname) {
        return 'TO_TIMESTAMP(:' + fieldname + ', \'YYYY-MM-DD HH24:MI:SS.FF\')';
    }
    this.format_to_timezone = function () {
        return 'TO_TIMESTAMP_TZ(:' + fieldname + ', \'YYYY-MM-DD HH24:MI:SS.FF TZH:TZM\')';
    }
    return this;
};