exports.dbcontext = function (engine, group, config) {
    if (this.config === undefined) {
        this.engine = engine;
        this.group = group;
        this.config = config;
        this.mysql = require('mysql');

        var options = {
            host: this.config.host,
            user: this.config.user,
            password: this.config.password,
            database: this.config.name
        };
        if (this.config.use_ssl) {
            options.ssl = {};
            if (this.config.ssl_cert.length > 0) {
                var fs = require('fs');
                options.ssl.ca = fs.readFileSync(this.config.ssl_cert)
            } else {
                // DO NOT DO THIS
                // set up your ca correctly to trust the connection
                options.ssl.rejectUnauthorized = this.config.rejectUnauthorized;
            }
        }
        if (this.config.use_pool) {
            options.connectionLimit = this.config.pool_limit;
            this.pool = this.mysql.createPool(options);
        } else {
            if (this.config.multipleStatements) {
                options.multipleStatements = this.config.multipleStatements;
            }
            this.connection = this.mysql.createConnection(options);
        }
    }
    this.package = function (name) {
        if (name !== undefined && this.mysql[name] !== undefined)
            return this.mysql[name];
        else
            return this.mysql;
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
        if (!callback) {
            return;
        }
        var _pool = this.pool;
        var _connection = this.connection;
        var _sql = sql;
        var _params = params;
        var _callback = callback;
        var _execute = function (connection) {
            var _result = function (error, rows, fields) {
                if (_connection) {
                    connection.end(); // close the connection
                }
                if (error) {
                    _callback(undefined, error);
                } else {
                    if (rows === undefined)
                        rows = [];
                    var result = { rows: rows, parameters: _params, metaData: fields };
                    _callback(result, undefined);
                }
                if (_pool) {
                    //console.log(_pool._freeConnections.indexOf(connection)); // -1
                    connection.release();
                    //console.log(_pool._freeConnections.indexOf(connection)); // 0
                }
            }
            if (!_params)
                connection.query(_sql, _result);
            else
                connection.query(_sql, _params, _result);
        };
        if (_pool) {
            _pool.getConnection(function (err, connection) {
                if (err !== null) {
                    console.log("[MYSQL] Pooling Error:" + err + '\n');
                } else {
                    _execute(connection);
                }
            });
        } else {
            _connection.connect(function (err) {
                if (err !== null) {
                    console.log("[MYSQL] Connecting Error:" + err + '\n');
                } else {
                    _execute(_connection);
                }
            });
        }
    };
    return this;
};