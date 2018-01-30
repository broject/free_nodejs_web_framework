/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


exports.instance = function () {
    return (function () {
        var fs__ = require('fs');
        var util__ = require('util');
        var path__ = require('path');
        var urljoin__ = require('url-join');
        var basedir__ = path__.dirname(path__.dirname(__dirname));
        var uuidV1 = require('uuid/v1');
        var uuidV4 = require('uuid/v4');

        /*define methods or variables*/
        this._base = { bag: {}, loader: this }; /*all core objects*/
        this._basedir = basedir__;
        this._fs = fs__;
        this._path = path__;
        this._urljoin = urljoin__;
        this._util = util__;
        this._uuidV1 = uuidV1;
        this._uuidV4 = uuidV4;
        this._comm = require('./common');
        this.options = require('./options').options;
        this.sys_config = require('../config/sys.config');
        this.reset = function () {
            delete require.cache[require.resolve('./common')];
            this._comm = require('./common');

            delete require.cache[require.resolve('./options')];
            this.options = require('./options').options;

            delete require.cache[require.resolve('../config/sys.config')];
            this.sys_config = require('../config/sys.config');
        };

        /*names or uri strings*/
        this.get_basedir = function (dir) {
            return (dir === undefined ? this._basedir : this._path.resolve(this._basedir, dir));
        };
        this.filename = function (file, dir) {
            var dpath = this._comm.isEmpty(dir) ? '' : this._path.resolve(this.options.res.code_dirname, this._comm.trim(dir, '/'));
            var fpath = this._path.resolve(this.get_basedir(), dpath, this._comm.trim(file, '/'));
            return fpath;
        };
        this.static_dir = function (root) {
            if (root === undefined)
                root = '';
            return this._path.resolve(this.get_basedir(), this.options.res.static_dirname, root);
        };
        this.static_uri = function (jscss) {
            var jscss_clean = this._comm.trim(jscss, '/');
            var static_uri = this._urljoin(this.options.res.static_path, jscss_clean);
            return '/' + this._comm.trim(static_uri, '/');
        };
        this.view_dir = function (router) {
            var aro = router.area_object || { lang: true };
            var lp = this._comm.trim(router.langdir, '/');
            var rp = this._comm.isEmpty(router.area) ? router.langdir : (aro.lang ? this._urljoin(lp, router.area) : router.area);
            return this._path.resolve(this.get_basedir(), this.options.res.code_dirname, this.options.res.view_dirname, rp);
        };
        this.view_uri = function (viewname, controllername) {
            if (controllername === undefined)
                controllername = '';
            else
                controllername = this._comm.trim(controllername, '/');
            var view_name = this._comm.trim(viewname, '/');
            var view_uri = view_name.indexOf('/') > 0 ? view_name : this._urljoin(controllername, view_name);
            return this._comm.trim(view_uri, '/');
        };
        this.theme_path = function (theme_name) {
            if (theme_name === undefined)
                theme_name = this.options.res.default_theme_name;
            var theme_path = this._urljoin(this.options.res.theme_path, theme_name);
            return this._comm.trim(theme_path, '/');
        };
        this.theme_favicon = function (theme_name) {
            return this._urljoin(this.theme_path(theme_name), this.options.res.favicon_file_uri);
        };
        this.theme_uri = function (jscss, theme_name) {
            var jscss_clean = this._comm.trim(jscss, '/');
            return this._urljoin(this.theme_path(theme_name), jscss_clean);
        };
        this.action_uri = function (action, controllername) {
            if (controllername === undefined)
                controllername = '';
            else
                controllername = this._comm.trim(controllername, '/');
            var action_name = this._comm.trim(action, '/');
            if (!this._comm.isEmpty(action_name) && controllername === action_name) {
                controllername = '';
            }
            var action_uri = (this._comm.isEmpty(controllername) || action_name.indexOf('/') > 0) ? action_name : this._urljoin(controllername, action_name);
            return this._comm.trim(action_uri, '/');
        };
        /*names or uri strings*/

        /*file loader*/
        this.file_exists = function (filename) {
            return this._fs.existsSync(filename);
        };
        this.controller_exists = function (jsfile) {
            var ext = '.js';
            if (jsfile.slice(-3) !== ext) {
                jsfile = jsfile + ext;
            }
            var fpath = this.filename(jsfile, 'controller');
            return this._fs.existsSync(fpath);
        };
        this.loadJs = function (jsfile, dir, single) {
            var ext = '.js';
            if (jsfile.slice(-3) !== ext) {
                jsfile = jsfile + ext;
            }
            var fpath = this.filename(jsfile, dir);
            //single instance
            if (single !== true) {
                delete require.cache[require.resolve(fpath)];
            }
            return require(fpath);
        };
        this.loadJson = function (jsonfile, dir) {
            if (jsonfile.slice(-5) !== '.json') {
                jsonfile = jsonfile + '.json';
            }
            var fpath = this.filename(jsonfile, dir);
            var jsonString = this._fs.readFileSync(fpath);
            var jsonObject = JSON.parse(jsonString);
            return jsonObject;
        };
        this.loadFile = function (file, dir) {
            var fpath = this.filename(file, dir);
            return this._fs.readFileSync(fpath, 'utf8');
        };
        this.config = function (jsfile) {
            return this.loadJs(jsfile, 'config', true);
        };
        this.core = function (jsfile) {
            return this.loadJs(jsfile, 'core');
        };
        this.module = function (jsfile) {
            return this.loadJs(jsfile, 'modules');
        };
        this.controller = function (jsfile) {
            return this.loadJs(jsfile, 'controller');
        };
        this.lib = function (jsfile, single) {
            return this.loadJs(jsfile, 'libraries', single);
        };
        this.model = function (jsfile) {
            if (jsfile.slice(-6) !== '_model') {
                jsfile = jsfile + '_model';
            }
            var model_obj = this.loadJs(jsfile, 'models', true);
            return new model_obj(this._base);
        };
        this.widget = function (jsfile) {
            if (jsfile.slice(-3) === '.js') {
                return this.loadJs(jsfile, 'widgets', true);
            } else {
                return this.filename(jsfile, 'widgets');
            }
        };
        /*file loader*/

        /*common methods*/
        this.gen_uuid = function (req) {
            if (req === undefined)
                req = false;
            if (req === false) {
                return this._uuidV4();/*random based*/
            } else {
                return (this.options.ability.uuid_version === 1 ? this._uuidV1() : this._uuidV4());
            }
        };
        this.log = function (level, message) {
            if (message === undefined) {
                message = level;
                level = 'debug';
            }
            if (this.sys_config.logger.enable) {
                var ftitle = this._comm.utc_datetime().slice(0, 10);
                var mtitle = (level === 'd' || level === 'debug') ? '[DEBUG] : ' : '<ERROR> : ';
                var logmsg = mtitle + message;

                var logf = this._util.format(this.sys_config.logger.file_path_format, ftitle);
                var fpath = this._path.join(this.get_basedir(), logf);

                var logFile = this._fs.createWriteStream(fpath, { flags: 'a', defaultEncoding: 'utf8', mode: 0o755 });
                logFile.write(logmsg);
                logFile.write('\r\n');
                logFile.end();

                if (this.sys_config.logger.log_stdout) {
                    var log_stdout = process.stdout;
                    log_stdout.write(logmsg + '\n');
                }
            }
        };
        /*common methods*/
        
        return this;
    })();
};