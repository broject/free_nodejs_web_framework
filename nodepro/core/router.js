/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function _check_trusted_host_state(host_name, common, route_config) {
    var trusted_hosts = route_config.trusted_hosts;
    var host_name_contained = false;
    trusted_hosts.forEach(function (item) {
        if (host_name_contained === false) {
            if (host_name !== item) {
                var ndx = common.indexOfRight(host_name, '.');
                if (ndx > 0) {
                    var hprefix = host_name.substr(0, ndx);
                    var iprefix = item.substr(0, ndx);
                    if (hprefix === iprefix) {
                        var hsubip = host_name.substr(ndx + 1);
                        var isubips = item.substr(ndx + 1);
                        if (common.isInt(hsubip) && isubips.indexOf('-') > 0) {
                            var isubs = isubips.split('-');
                            var ipStart = parseInt(isubs[0]);
                            var ipEnd = parseInt(isubs[1]);
                            var ipLast = parseInt(hsubip);
                            for (var i = ipStart; i <= ipEnd; i++) {
                                if (ipLast === i) {
                                    host_name_contained = true;
                                }
                            }
                        }
                    }
                }
            } else {
                host_name_contained = true;
            }
        }
    });
    var fixed_host = (host_name_contained === false ? trusted_hosts[0] : host_name);
    return { check: host_name_contained, host: fixed_host };
}

function _get_clean_segments(v_segments) {
    var c_segments = [];
    for (var i = 0, l = v_segments.length; i < l;) {
        var s = v_segments[i];
        if (s === '' || s.length === 0) {
            v_segments.splice(i, 1);
            l = v_segments.length;
            if (i > 0) {
                i--;
            }
        } else {
            i++;
        }
    }
    return v_segments;
}

function _supported_lang_code_exists(lang_code, supported_lang_codes) {
    var lang_code_exists = false;
    if (lang_code !== null && lang_code !== '') {
        supported_lang_codes.forEach(function (sl) {
            if (sl.code === lang_code) {
                lang_code_exists = true;
            }
        });
    }
    return lang_code_exists;
}

function _get_lang_code_from_domain(host) {
    var hparts = host.split('.');
    return hparts[0];
}

module.exports = function () {
    return {
        route: function (base, req, res, next) {            
            var _url = require('url');
            var _urljoin = require('url-join');
            var _qs = require('querystring');

            /*base objects*/
            this.area = base.area;
            this.area_object = base.area_object;
            base.loader = base.loader.core('loader').instance();
            base.router = this;
            base.request = req;
            base.response = res;
            base.loader._base = base;
            base.router._base = base;
            this.sys_config = base.loader.config('sys.config');
            this.route_config = base.loader.config('route.config');
            this.options = base.loader.options;
            this.common = base.loader._comm;

            this.action = function (name) {
                var action_uri = base.loader.action_uri(name, this.controller);
                return (this.common.isEmpty(this.area) ? action_uri : _urljoin(this.area, action_name));
            };
            this.url = function (uri, query) {
                if (uri === undefined) {
                    return req.url;
                } else {
                    query = (!query ? '' : (query.indexOf('?') === 0 ? query : '?' + query));
                    return _urljoin(req.protocol + '://' + this.host, uri, query);
                }
            };
            this.nptoken = function () {
                var np_token = base.loader.gen_uuid();
                if (this.options.fw.use_session) {
                    req.session.np_token = np_token;
                    req.session.save();
                }
                return np_token;
            };
            this.check_nptoken = function () {
                if (this.options.fw.use_session) {
                    var np_token = req.session.np_token;
                    if (np_token === undefined) {
                        return false;
                    } else {
                        delete req.session.np_token;
                        return (this.inputs !== undefined && this.inputs.np_token !== undefined && this.inputs.np_token === np_token);
                    }
                } else {
                    return false;
                }
            };

            /*trusted host filter*/
            var trusted_host_state = _check_trusted_host_state(req.headers.host, this.common, this.route_config);
            this.ssl = /https/.test(req.protocol);
            this.host = trusted_host_state.host;

            // use http/https as necessary
            if (this.options.fw.force_to_https && !this.ssl) {
                return res.redirect("https://" + this.host + req.url);
            } else {
                var http = this.ssl ? require('https') : require('http');
                http.globalAgent.maxSockets = this.options.fw.globalAgent_maxSockets;
            }

            /*url objects*/
            this.url_object = _url.parse(req.url);
            this.path = this.url_object.path;
            this.pathname = this.url_object.pathname;
            this.query = this.url_object.query;
            this.params = _qs.parse(this.query);
            this.inputs = req.body;
            this.method = req.method;

            /*check own request when refresh a post*/
            if (this.sys_config.security.np_token_check
                && this.sys_config.security.np_token_methods.indexOf(this.method.toLowerCase()) > -1) {
                if (this.check_nptoken(req) === false) {
                    /*Unauthorized Request*/
                    return res.sendStatus(401);
                }
            }

            /*clean segments filter*/
            var v_segments = this.pathname.split('/');
            this.segments = _get_clean_segments(v_segments);

            /*fetch basename by allowed url extensions*/
            this.first_segment = '';
            this.last_segment = '';
            this.basename = '';
            this.extension = '';
            if (this.segments.length > 0) {
                var lastNdx = this.segments.length - 1;
                var lastSeq = this.segments[lastNdx];
                var lastSeq_lower = lastSeq.toLowerCase();
                var ext_arr = this.route_config.allowed_url_extensions;
                var v_extension = this.extension;
                ext_arr.forEach(function (ext) {
                    if (lastSeq_lower.slice(-1 * ext.length) === ext) {
                        v_extension = ext;
                    }
                });
                this.first_segment = this.segments[0];
                this.last_segment = lastSeq;
                this.extension = v_extension;
                if (!this.common.isEmpty(this.extension)) {
                    this.basename = this.last_segment;
                }
            }

            /*language configuration*/
            this.default_lang_code = this.route_config.language.default_lang_code;
            this.sub_domain_is_lang_code = this.route_config.language.sub_domain_is_lang_code;
            this.first_uri_is_lang_code = this.route_config.language.first_uri_is_lang_code;
            this.supported_lang_codes = this.route_config.language.supported_lang_codes;
            this.language_dirname_by_default = this.route_config.language.language_dirname_by_default;

            /*render configuration*/
            this.langcode = this.default_lang_code;
            this.langdir = this.default_lang_code;
            this.controller = this.route_config.default_controller;
            this.function = this.route_config.default_function;

            /*supported languages filter*/
            if (this.sub_domain_is_lang_code) {
                var domain_lang_code = _get_lang_code_from_domain(this.host);
                var lang_code_exists = _supported_lang_code_exists(domain_lang_code, this.supported_lang_codes);
                if (lang_code_exists) {
                    this.langcode = domain_lang_code;
                }
                /*clean supported language segment*/
                var uri_lang_code = this.segments.length > 0 ? this.segments[0] : '';
                lang_code_exists = _supported_lang_code_exists(uri_lang_code, this.supported_lang_codes);
                if (lang_code_exists) {
                    this.segments.splice(0, 1);
                    var red_url = this.url(this.segments.join('/'), this.query);
                    return res.redirect(red_url);
                }
            } else {
                if (this.first_uri_is_lang_code) {
                    var uri_lang_code = this.segments.length > 0 ? this.segments[0] : '';
                    var lang_code_exists = _supported_lang_code_exists(uri_lang_code, this.supported_lang_codes);
                    if (lang_code_exists) {
                        this.segments.splice(0, 1);
                        this.langcode = uri_lang_code;
                    }
                }
            }

            /*if all languages by default directory then*/
            this.langdir = this.langcode;
            if (this.language_dirname_by_default) {
                this.langdir = this.default_lang_code;
            }

            if (this.segments.length === 0) {
                this.segments.push(this.controller);
                this.segments.push(this.function);
            }
            /*contoller object filter*/
            var v_controller = this.segments[0];
            var controller_path = _urljoin(this.common.isEmpty(this.area) ? '' : this.area, v_controller);
            if (base.loader.controller_exists(controller_path)) {
                try {
                    this.segments.splice(0, 1);
                    this.controller = v_controller;
                    this.controller_path = controller_path;

                    /*create contoller object*/
                    if (this.options.ability.use_base_controller) {
                        base.loader.core('controller');
                    }

                    var np_constructor = base.loader.controller(controller_path);
                    var np_controller = new np_constructor(base);
                    if (np_controller.__sent_headers) {
                        return;
                    }

                    if (this.segments.length > 0) {
                        var v_function = this.segments[0];
                        this.function = v_function.toLowerCase();

                        /*fixed segments and function by basename; feed.xml -> controller.feed(args)*/
                        if (!this.common.isEmpty(this.extension)) {
                            if (this.function === this.basename) {

                                var fixed_segment = this.basename.slice(0, this.basename.length - this.extension.length);
                                this.segments.splice(this.segments.length - 1, 1);
                                this.segments.push(fixed_segment);

                                this.function = fixed_segment.toLowerCase();
                            }
                        }
                    }

                    /*try calling controller.function*/
                    if (this.function.indexOf('_') !== 0) {
                        if (this.segments.length > 0) {
                            this.segments.splice(0, 1);
                        }
                        /*check exists controller.function*/
                        if (typeof np_controller[this.function] !== 'function') {
                            /*check RESTfull service*/
                            var v_rest_postfix = '_' + this.method.toLowerCase();
                            this.function = this.function + v_rest_postfix;
                            if (typeof np_controller[this.function] !== 'function') {
                                return res.sendStatus(404);
                            }
                        }

                        /*handle controller.function*/
                        var np_function = np_controller[this.function];

                        var result_cache_key = 'cacher-' + req.url;
                        var np_cacher = base.loader.core('cacher').init(base);
                        this.cacher = np_cacher;

                        var _caster = function (data) {
                            return (!data ? undefined : (typeof data === 'object' ? data : JSON.parse(data)));
                        }

                        var _outputer = function (np_result) {
                            if (typeof np_result === 'object' && np_result.type !== undefined) {
                                /*view correct result*/
                                base.result = np_result;

                                var render_package = base.loader.core('render');
                                base.render = render_package();
                                base.render._base = base;
                                base.render.do(base, res, next);
                            } else {
                                res.status(500).send('Function result error!');
                            }
                        }

                        np_cacher.cache(result_cache_key, function (error, data) {
                            if (error) {
                                res.status(500).send('Cache result error!');
                            } else {
                                //console.log('****************************************');
                                if (!data) {
                                    //console.log('....Data Caching.... ');
                                    np_controller.__callback = function (ret_result) {
                                        var np_result = _caster(ret_result);
                                        if (typeof np_result === 'object' && np_result.cache > 0) {
                                            np_cacher.put(result_cache_key, np_result, np_result.cache);
                                        }
                                        _outputer(np_result);
                                    };
                                    try {
                                        np_function.call(np_controller, this.segments);
                                    } catch (function_err) {
                                        res.status(500).send('Function internal error! Error::' + function_err);
                                    }
                                } else {
                                    //console.log('....Cached Data.... ');
                                    _outputer(_caster(data));
                                }
                            }
                        });
                    } else {
                        res.sendStatus(404);
                    }
                } catch (err) {
                    res.status(500).send('Controller internal error! Error::' + err);
                }
            } else {
                res.sendStatus(404);
            }
        }
    };
};