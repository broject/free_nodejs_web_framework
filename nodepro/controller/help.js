/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


const controller = require('../core/controller');
class help extends controller {
    constructor(base) {
        super(base);
    }
    dbdoc() {
        return this.responser.redirect(this.loader.static_uri('/help/dbdoc/index.html'));
    }
}
module.exports = help;