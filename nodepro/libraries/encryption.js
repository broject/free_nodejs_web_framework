/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


exports.init = function (engine) {
    var _config = engine.config("sys.config");
    var crypto = require('crypto');

    this.encryptString = function (input) {
        var cipher = crypto.createCipher('aes-256-cbc', _config.security.crypto_key);
        var encrypted = cipher.update("" + input + "", 'utf8', 'base64') + cipher.final('base64');
        return encrypted;
    };

    this.decryptString = function (encrypted) {
        var decipher = crypto.createDecipher('aes-256-cbc', _config.security.crypto_key);
        var plain = decipher.update("" + encrypted + "", 'base64', 'utf8') + decipher.final('utf8');
        return plain;
    };
};