exports.configure = function(express, app, loader) {
    var sys_config = loader.config('sys.config');    
    var session = require('express-session');

    var redis = require("redis");
    var RedisClient = redis.createClient();
    var RedisStore = require('connect-redis')(session);    

    var sess_object = {
        store: new RedisStore({ client : RedisClient }),
        key: sys_config.session.key,
        name: sys_config.session.name,
        secret: sys_config.session.secret,
        saveUninitialized: sys_config.session.saveUninitialized,
        resave: sys_config.session.resave,
        cookie: {
            path: sys_config.cookie.default_path,
            maxAge: sys_config.cookie.default_second * 1000
        },
        genid: function (req) {
            return loader.gen_uuid(req);// use UUIDs for session IDs
        }
    };
    if (sys_config.cookie.http_only) {
        sess_object.cookie.httpOnly = sys_config.cookie.http_only;
    }
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
                if (sess.views > 50) {
                    delete sess.views;
                }
                req.session.save();
                res.json(sess);
            } else {
                sess.views = 1;
                req.session.save();
                res.end('welcome to the session demo. refresh!');
            }
            return;
        });
    }
};