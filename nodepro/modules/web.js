/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


exports.init = function (express, app) {
    var loader_package = require('../core/loader');
    var loader = loader_package.instance();
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var sys_config = loader.config('sys.config');
    var _opt = loader.options;

    /*app.configuring*/
    //set NODE_ENV=production&&node app.js
    function debuggerModule(req, res, next) {
        return next();
    }
    // debugging middleware in development only
    if ('development' === app.get('env')) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        app.use(debuggerModule);
    }
    //    process.env['CONSUMER_KEY'] = ""
    //    process.env['CONSUMER_SECRET'] = ""
    //    process.env['ACCESS_TOKEN_KEY'] = ""
    //    process.env['ACCESS_TOKEN_SECRET'] = ""

    app.use(bodyParser.urlencoded({ extended: _opt.fw.urlencoded_extended }));// parse application/x-www-form-urlencoded
    app.use(bodyParser.json());// parse application/json
    app.set('json spaces', 1);
    app.use(cookieParser());
    app.use(_opt.res.static_path, express.static(loader.static_dir()));

    if (_opt.fw.jade_engine) {
        app.engine('jade', require('jade').__express);
        app.set('view engine', 'jade');
    }
    if (_opt.fw.disable_view_cache) {
        app.disable('view cache');
    } else {
        app.set('view cache', true);
    }
    if (_opt.fw.disable_etag) {
        app.disable('etag');
    }
    if (_opt.fw.use_compression) {
        var compression = require('compression');
        app.use(compression());
    }
    if (_opt.fw.use_helmet) {
        var helmet = require('helmet');
        app.use(helmet());
        app.use(helmet.noCache());
        app.use(helmet.frameguard());
    } else {
        app.disable('x-powered-by');
    }
    if (_opt.fw.use_session) {
        var sessionLib = loader.lib('session/' + _opt.fw.session_lib);
        sessionLib.configure(express, app, loader);
    }

    /*app.routing*/
    function init_loader_base(area_item, app_area) {
        var new_loader = loader_package.instance();
        var area_name = new_loader._comm.trim(app_area.mountpath, '/');
        var base = {};
        base.bag = {};
        base.loader = new_loader;
        base.area = area_name;
        base.area_object = area_item;
        base.app = app_area;
        new_loader._base = base;
        return new_loader._base;
    }
    function parallel(middlewares) {
        var async = require("async");
        return function (req, res, next) {
            async.each(middlewares, function (mw, cb) {
                mw(req, res, cb);
            }, next);
        };
    }
    function headers(req, res, next) {
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    }
    function routing(req, res, next) {
        headers(req, res, next);
        var base = init_loader_base(undefined, app);
        var router_package = base.loader.core('router');
        var instance = router_package();
        instance.route(base, req, res, next);
    }
    // Router middleware, mentioned it before defining routes.
    /*areas*/
    sys_config.areas.forEach(function (area_item) {
        var app_area = new express();
        app.use(area_item.uri, app_area);
        app_area.use(function (req, res, next) {
            headers(req, res, next);
            var base = init_loader_base(area_item, app_area);
            var router_package = base.loader.core('router');
            var instance = router_package();
            instance.route(base, req, res, next);
        });
    });
    /*main*/
    if (_opt.fw.use_parallel) {
        app.use(parallel([routing]));
    } else {
        app.use(routing);
    }
};