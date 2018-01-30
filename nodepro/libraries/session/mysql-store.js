exports.configure = function (express, app, loader) {
    var sys_config = loader.config('sys.config');
    var session = require('express-session');

    var db_configs = loader.config('db.config');
    var db_conn_obj = db_configs['mysql'];
    var db_conn_config = db_conn_obj[db_configs.group];

    var MySQLStore = require('express-mysql-session')(session);
    var check_expiration = sys_config.cookie.check_expiration_second * 1000;
    var cookie_expiration = sys_config.cookie.expiration_second * 1000;
    var options = {
        host: db_conn_config.host,
        port: db_conn_config.port,
        user: db_conn_config.user,
        password: db_conn_config.password,
        database: db_conn_config.name,
        checkExpirationInterval: check_expiration/*900 000*/,// How frequently expired sessions will be cleared; milliseconds. 15 minutes
        expiration: cookie_expiration/*86400 000*/,// The maximum age of a valid session; milliseconds. 24 hours
        createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist.
        connectionLimit: 1,// Number of connections when creating a connection pool
        schema: {
            tableName: db_conn_config.session_table,
            columnNames: {
                session_id: db_conn_config.session_field_id,
                expires: db_conn_config.session_field_expires,
                data: db_conn_config.session_field_data
            }
        }
    };
    var sessionStore = null;
    if (db_conn_config.session_use_connection) {
        var model_package = loader.core('model');
        var model = new model_package(loader._base);
        var connection = model.context().getConnection();
        sessionStore = new MySQLStore(options/* session store options */, connection);
    } else {
        sessionStore = new MySQLStore(options);
    }

    var sess_object = {
        store: sessionStore,
        key: sys_config.session.key,
        name: sys_config.session.name,
        secret: sys_config.session.secret,
        saveUninitialized: sys_config.session.saveUninitialized,
        resave: sys_config.session.resave,
        cookie: {
            httpOnly: sys_config.cookie.http_only,
            path: sys_config.cookie.default_path,
            maxAge: cookie_expiration
        },
        genid: function (req) {
            return loader.gen_uuid(req);// use UUIDs for session IDs
        }
    };
    if (sys_config.cookie.secure) {
        sess_object.cookie.secure = sys_config.cookie.secure;
    }
    app.set('trust proxy', 1); // trust first proxy
    app.use(session(sess_object));
    if (sys_config.session.test) {
        app.get(sys_config.session.test_uri, function (req, res) {
            var sess = req.session;
            if (sess.views) {
                sess.views++;
                sess.modified = new Date().toJSON();
                if (sess.views > 50) {
                    delete sess.views;
                }
                req.session.save();
                res.json(sess);
            } else {
                sess.views = 1;
                sess.created = new Date().toJSON();
                req.session.save();
                res.end('welcome to the session demo. refresh!');
            }
            return;
        });
    }
};