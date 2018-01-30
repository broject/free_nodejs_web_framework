/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


module.exports = {
    engine: 'mssql',
    group: 'test',
    oracle: {
        test: {
            host: 'localhost',
            port: 1521,
            name: 'nodepro',
            user: 'boroo',
            password: 'MyPassword02',
            stmtCacheSize: 40,
            autoCommit: false,
            use_pool: false,
            queueRequests: true,/*default is true*/
            _enableStats: true,/*default is false*/
            ResultRowsToJsonOBJECT: true,/*['1', 'my name'] => {ID: 1, NAME: 'my name'}*/
            session_use_connection: true,
            session_table: 'cms_sessions',
            session_field_id: 'session_id',
            session_field_expires: 'expires',
            session_field_data: 'data'
        }
    },
    mysql: {
        test: {
            host: 'localhost',
            port: 3306,
            name: 'nodepro_test',
            user: 'root',
            password: '',
            use_pool: false,
            pool_limit: 50,
            use_ssl: false,
            ssl_cert: '',
            rejectUnauthorized: false,
            multipleStatements: true,
            session_use_connection: true,
            session_table: 'cms_sessions',
            session_field_id: 'session_id',
            session_field_expires: 'expires',
            session_field_data: 'data'
        }
    },
    mssql: {
        test: {
            host: 'localhost',
            port: 1433,
            name: 'TestDB',
            user: 'sa',
            password: 'hiimeloyun',
            connectionTimeout: 15000, /*(default: 15000).*/
            requestTimeout: 15000, /*(default: 15000).*/
            use_request_mode: false, /*if false then use PreparedStatement*/
            request_stream: false, /*(default: false). (request.stream = true). Always set to true if you plan to work with large amount of rows.*/
            request_multiple: true,
            parseJSON: true, /*Parse JSON recordsets to JS objects (default: false). For more information please see section JSON support.*/
            use_pool: true,
            pool: {
                max: 10,/*The maximum number of connections there can be in the pool (default: 10).*/
                min: 0,/*The minimum of connections there can be in the pool (default: 0).*/
                idleTimeoutMillis: 30000/*The Number of milliseconds before closing an unused connection (default: 30000).*/
            },
            extra: {
                instanceName: '', /*The instance name to connect to. The SQL Server Browser service must be running on the database server, and UDP port 1444 on the database server must be reachable.*/
                useUTC: true, /*A boolean determining whether or not use UTC time for values without time zone offset (default: true).*/
                encrypt: false, /*A boolean determining whether or not the connection will be encrypted (default: false).*/
                tdsVersion: '7_4',/*The version of TDS to use (default: 7_4, available: 7_1, 7_2, 7_3_A, 7_3_B, 7_4).*/
                appName: '', /*Application name used for SQL server logging.*/
                abortTransactionOnError: false /*A boolean determining whether to rollback a transaction automatically if any error is encountered during the given transaction's execution. This sets the value for XACT_ABORT during the initial SQL phase of a connection.*/
            },
            session_use_connection: true,
            session_table: 'cms_sessions',
            session_field_id: 'session_id',
            session_field_expires: 'expires',
            session_field_data: 'data'
        }
    }
};