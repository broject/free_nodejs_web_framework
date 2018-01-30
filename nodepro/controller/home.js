/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


const site = require('../core/controller').site;
class home extends site {
    constructor(base) {
        super(base);
    }
    index() {
        var chat_html = this.loader.widget('chat/index.html');
        this.viewer.file(chat_html);
    }
    reset() {
        this.loader.reset();
        this.viewer.raw({ OK1: 'OK' });
    }
}
module.exports = home;