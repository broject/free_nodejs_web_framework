/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class controller {
    constructor(base) {
        this._base = base;
        this._base.controller_object = this;
        this.loader = base.loader;
        this.router = base.router;
        this.inputs = this.router.inputs;
        this.params = this.router.params;
        var responser_package = base.loader.core('responser');
        this.viewer = responser_package(base);

        this.options = base.loader.options;
        if (this.options.ability.use_base_model) {
            base.loader.core('model');
        }
    }
}
class site extends controller {
    constructor(base) {
        super(base);
    }
}
class auth extends controller {
    constructor(base) {
        super(base);
    }
}
global.site_controller = site;
global.auth_controller = auth;
module.exports.site = site;
module.exports.auth = auth;