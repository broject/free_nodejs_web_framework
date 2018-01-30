/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var options_define = function (options, def_type) {
    var fixed = {};
    if (options === undefined) {
        fixed = { cache: 0, type: def_type };
    } else {
        if (typeof options === 'string') {
            fixed = { cache: 0, type: options };
        } else {
            if (typeof options === 'function') {
                fixed = options();
            } else {
                fixed = options;
            }
        }
    }
    fixed.cache = fixed.cache === undefined ? 0 : fixed.cache;
    fixed.type = fixed.type === undefined ? 'html' : fixed.type;
    return fixed;
};
var view = function (uri, model, options) {
    var fixed = options_define(options, 'html');
    return { cache: fixed.cache, type: fixed.type, view: uri, model: model };
};
var json = function (model, options) {
    var fixed = options_define(options, 'json');
    return view(undefined, model, fixed);
};
var xml = function (model, options) {
    var fixed = options_define(options, 'xml');
    return view(undefined, model, fixed);
};
var file = function (model, options) {
    var fixed = options_define(options, 'file');
    return view(undefined, model, fixed);
};
var raw = function (model, options) {
    var fixed = options_define(options, 'raw');
    return view(undefined, model, fixed);
};
var redirect = function (url, options) {
    var fixed = options_define(options, 'redirect');
    return view(undefined, url, fixed);
};
module.exports = function (base) {
    return {
        _base: base,
        _callback: function (result) {
            var controller = this._base.controller_object;
            controller.__sent_headers = true;
            controller.__callback(result);
        },
        view: function (uri, model, options) {
            var result = view(uri, model, options);
            this._callback(result);
        },
        json: function (model, options) {
            var result = json(model, options);
            this._callback(result);
        },
        xml: function (model, options) {
            var result = xml(model, options);
            this._callback(result);
        },
        file: function (model, options) {
            var result = file(model, options);
            this._callback(result);
        },
        raw: function (model, options) {
            var result = raw(model, options);
            this._callback(result);
        },
        redirect: function (url, options) {
            var result = redirect(url, options);
            var controller = this._base.controller_object;            
            if (controller.__callback === undefined) {
                controller.__sent_headers = true;
                return this._base.response.redirect(url);
            } else {
                return this._callback(result);
            }
        }
    };
};