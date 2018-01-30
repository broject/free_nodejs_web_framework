/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class login extends site_controller {
    constructor(base) {
        super(base);

        this.user_model = this.loader.model('user');
    }
    _dat_index(callback) {
        var person = {};
        person.name = ["John", "Markus", "Gerald", "Adrian", "Dominik",
            "Andrew", "David", "Edward", "Martin", "Penny",
            "Nangle", "Gratzer", "Venzl", "Richmond", "Ashley",
            "Bond", "Smith", "Stadler", "Avril", "Jones"];
        person.age = [29, 43, 48, 42, 21, 32, 56];
        var _umodel = this.user_model;
        var user_list = _umodel.get_user_list();
        var _db = _umodel.context();
        var _dbp = _umodel.package();
        var _endCreation = function (result, err) {
            var data = { title: 'login title', users: user_list, one: result };
            callback(data);
        };
        var rnd = Math.floor(Math.random() * person.name.length);
        var iname = person.name[rnd];
        var insertStmt = 'insert into table1 values(?); SELECT SCOPE_IDENTITY();';
        var binds = {
            id: { type: _dbp.NVarChar(36), dir: 'out' },
            name: { val: iname, type: _dbp.NVarChar(36) }
        };
        _umodel.execute(insertStmt, null, _endCreation);
        // switch (_db.engine) {
        //     default:
        //     case 'oracle': {
        //         var insertStmt = 'insert into cms_temp (name) values (:name) RETURNING ID into :id';
        //         var bind_params = {
        //             id = { type: _dbp.STRING, dir: _dbp.BIND_OUT },
        //             name: iname
        //         }
        //         _umodel.execute(insertStmt, bind_params, _endCreation);
        //     } break;
        //     case 'mysql': {
        //         console.log(_db.engine);
        //     } break;
        //     case 'mssql': {
        //         var insertStmt = 'insert into table1 values(?); SELECT SCOPE_IDENTITY();';
        //         var binds = {
        //             id: { type: _dbp.NVarChar(36), dir: 'out' },
        //             name: { val: iname, type: _dbp.NVarChar(36) }
        //         };
        //         _umodel.execute(insertStmt, null, _endCreation);
        //     } break;
        // }
    }
    index(args) {
        var viewer = this.viewer;
        this._dat_index(function (data) {
            viewer.raw(data);
            // viewer.view('login/index', data, { cache: 15 });
        });
    }
    auth(args) {
        var uname = this.inputs['username'];
        var pass = this.inputs['password'];
        var userinfo = this.user_model.login(uname, pass);
        var data = { title: 'login title', args: args, users: this.user_model.get_user_list(), user: userinfo };
        return this.responser.view('login/index', data);
    }
}
module.exports = login;