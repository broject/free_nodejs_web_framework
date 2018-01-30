/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


module.exports = function () {
    return {
        do: function (base, res, callback) {
            var app = base.app;
            var loader = base.loader;
            var router = base.router;
            var result = base.result;

            if (result.type !== 'html') {
                switch (result.type) {
                    default:
                    case 'json':
                        res.header('Content-Type', 'application/json; charset=utf-8').json(result.model);
                        break;
                    case 'xml2js':
                        var parseString = require('xml2js').parseString;
                        parseString(result.model, function (err, data) {
                            if (err && callback !== undefined)
                                callback(err);
                            else
                                res.header('Content-Type', 'application/json; charset=utf-8').json(data);
                        });
                        break;
                    case 'xml':
                        /*
                         res.header("Cache-Control", "no-cache, no-store, must-revalidate");
                         res.header("Pragma", "no-cache");
                         res.header("Expires", 0);*/
                        res.header('Content-Type', 'text/xml; charset=utf-8').send(result.model);
                        break;
                    case 'file':
                        res.sendFile(result.model);
                        break;
                    case 'raw':
                        res.send(result.model);
                        break;
                    case 'redirect':
                        res.redirect(result.model);
                        break;
                }
            } else {
                var engines = app.engines;
                var view_cache = app.cache;
                var view_func = app.get('view');
                var cache_second = result.cache;
                //console.log('-cache second is ' + cache_second);

                //render a view
                var root_dir = loader.view_dir(router);
                var view_uri = loader.view_uri(result.view, router.controller);
                var engine_options = { defaultEngine: app.get('view engine'), root: root_dir, engines: engines };

                var cache_name = 'views-cache:' + router.controller + '-' + router.function;
                var view = view_cache[cache_name];

                if (view) {
                    //console.log('-view is exists');
                    view.cache_check_time = new Date();
                    if (cache_second > 0) {
                        var duration_second = (view.cache_check_time - view.cache_start_time) / 1000;
                        //console.log('-duration second is ' + duration_second);
                        if (duration_second > cache_second) {
                            delete view_cache[cache_name];
                            view = null;
                            //console.log('-view is deleted');
                        }
                    }
                } else {
                    //console.log('-view is not exists');
                }
                if (!view || !(cache_second > 0)) {
                    //console.log('....View Caching.... ' + cache_second + ' s');
                    view = new (view_func)(view_uri, engine_options);
                    if (cache_second > 0) {
                        view.cache_start_time = new Date();
                        view_cache[cache_name] = view;
                    }
                } else {
                    //console.log('....Cached View.... ');
                }
                if (!view.path) {
                    res.status(500).send('View path error!');
                } else {
                    try {
                        result.loader = loader;
                        result.router = router;
                        result.require = require;

                        view.render(result, function (err, html) {
                            if (err)
                                res.status(500).send('View render error! Error::' + err);
                            else
                                res.status(200).send(html);
                        });
                    } catch (err) {
                        res.status(500).send('View render error! Error::' + err);
                    }
                }
            }
        }
    };
};