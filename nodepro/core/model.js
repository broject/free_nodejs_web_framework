/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class base_model {
    constructor(base) {
        this._base = base;
        this.loader = base.loader;
        if (base.dbcontext === undefined) {
            var db_configs = this.loader.config('db.config');
            var db_conn_obj = db_configs[db_configs.engine];
            var db_conn_config = db_conn_obj[db_configs.group];
            var db_package = this.loader.lib('db/' + db_configs.engine);
            base.dbcontext = db_package.dbcontext(db_configs.engine, db_configs.group, db_conn_config);
        }
        this.db = base.dbcontext;
    }
    context() {
        return this.db;
    }
    package(name) {
        return this.db.package(name);
    }
    execute(sql, params, callback) {
        this.db.execute(sql, params, callback);
    }
}
module.exports = base_model;
global.base_model = base_model;