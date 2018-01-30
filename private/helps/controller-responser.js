/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class home {
    constructor(base, req, res) {
        this._loader = base.loader;
        this._router = base.router;
        this._render = base.render;
        this._req = req;
        this._res = res;
        this._responser = this._loader.core('responser');
    }
    void(args) {
        this._res.status(200).send(args);
    }
    index(args) {
        var list = ['Comedy', 'Thriller'];
        var data = {list: list, title: 'data title', args: args};
        return this._responser.view('login/index', data);
    }
    xmls(args) {
        var xml = '<?xml version="1.0" encoding="UTF-8" ?><business><company>Code Blog</company><owner>Nic Raboy</owner><employee><firstname>Nic</firstname><lastname>Raboy</lastname></employee><employee><firstname>Maria</firstname><lastname>Campos</lastname></employee></business>';
        return this._responser.xml(xml);
    }
    xmlto() {
        var xmlString = this._loader.loadFile('/public/themes/default/xmlres.xml');
        return this._responser.xml(xmlString, {type: 'xml2js'});
    }
    xmlfile(args) {
        var xmlfile = this._loader.filename('/public/themes/default/xmlres.xml');
        return this._responser.xml(xmlfile, {type: 'xmlfile'});
    }    
    jsons(args) {
        var params = this._router.params;
        var list = ['Comedy', 'Thriller'];
        var data = {list: list, title: 'data title', args: args, params: params};
        return this._responser.json(data);
    }
    html(args) {
        this._res.sendFile(this._loader.filename('./index.html'));
    }
}
module.exports = home;