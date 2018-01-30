/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


const controller = require('../../core/controller');
class home extends controller {
    constructor(base) {
        super(base);
    }
    feed_get(args) {
        return this.responser.raw({ function: this.router.function, method: this.router.method });
    }
    feed_put(args) {
        return this.responser.raw({ function: this.router.function, method: this.router.method });
    }
}
module.exports = home;