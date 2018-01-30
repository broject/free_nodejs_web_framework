/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class user_model extends base_model {
    constructor(base) {
        super(base);
    }
    _login(username, password) {
        var ulist = this.get_user_list();
        var exists = ulist.filter(function (item, index, array) {
            return item.username === username && item.password === password;
        });
        return exists.length > 0 ? exists[0] : null;
    }
    login(username, password) {
        var user = this._login(username, password);
        return user;
    }
    reset(username, email) {
        
    }
    get_user_list() {
        return [
            { username: 'root', password: 'password' },
            { username: 'admin', password: 'password' },
            { username: 'boroo', password: 'password' }
        ];
    }
}
module.exports = user_model;