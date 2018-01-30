exports.dbcontext = function (engine, group, config) {
    if (this.config === undefined) {
        this.engine = engine;
        this.group = group;
        this.config = config;
        this.mssql = require('mssql');

        this.options = {
            user: this.config.user,
            password: this.config.password,
            server: this.config.host,
            database: this.config.name,
            connectionTimeout: this.config.connectionTimeout,
            requestTimeout: this.config.requestTimeout,
            parseJSON: this.config.parseJSON
        };
        if (this.config.use_pool) {
            this.options.pool = this.config.pool;
        }
    }
    this.package = function (name) {
        if (name !== undefined && this.mssql[name] !== undefined)
            return this.mssql[name];
        else
            return this.mssql;
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
        var _mssql = this.mssql;
        var _sql = sql;
        var _params = params;
        var _callback = callback;
        var _is_stream = this.config.request_stream;
        var _is_multiple = this.config.request_multiple;
        var _use_request_mode = this.config.use_request_mode;
        var connection = new _mssql.Connection(this.options, function (err) {
            if (err) {
                console.log("[MSSQL] Connection Error:" + err + '\n');
            } else {
                var _stmt = null;
                if (_use_request_mode) {
                    _stmt = new _mssql.Request(connection);
                } else {
                    _stmt = new _mssql.PreparedStatement(connection);
                }
                if (_is_stream) {
                    _stmt.stream = true;
                }
                if (_is_multiple) {
                    _stmt.multiple = true;
                }
                if (typeof _params === 'object') {
                    for (var key in _params) {
                        var parameter = _params[key];
                        if (typeof parameter === 'object' && parameter.type !== undefined) {
                            if (parameter.dir == 'out') {
                                _stmt.output(key, parameter.type);
                            } else {
                                _stmt.input(key, parameter.type, parameter.val);
                            }
                        }
                    }
                }
                if (_use_request_mode) {
                    _stmt.query(_sql, function (error, recordsets, returnValue, affected) {
                        if (error) {
                            _callback(undefined, error);
                        } else {
                            var rows = [];
                            if (recordsets !== undefined && recordsets.length > 0) {
                                rows = recordsets[0];
                            }
                            var result = {
                                rows: rows,
                                returnValue: returnValue,
                                rowsAffected: affected,
                                parameters: _params,
                                outBinds: _stmt.parameters
                            };
                            _callback(result, undefined);
                        }
                    });
                } else {
                    _stmt.input('name', _mssql.NVarChar(50));
                    _stmt.prepare('INSERT INTO table1(Name) OUTPUT INSERTED.ID VALUES (@name);', function (err) {
                        console.log('err is ', err);
                        _stmt.execute({ name: 'Petr Cech' }, function (error, result) {
                            console.log('result is ', result);
                            // ... error checks
                            if (error) {
                                _callback(undefined, error);
                            } else {
                                _callback(result, undefined);
                            }
                            _stmt.unprepare(function (error) {
                            });
                        });
                    });
                }
            }
        });
        this.connection = connection;
    };
    return this;
};
/*
String -> sql.NVarChar
Number -> sql.Int
Boolean -> sql.Bit
Date -> sql.DateTime
Buffer -> sql.VarBinary
sql.Table -> sql.TVP
*/