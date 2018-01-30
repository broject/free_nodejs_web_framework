/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


module.exports = {
    default_controller: 'home',
    default_function: 'index',
    trusted_hosts: ['localhost', '127.0.0.1', 'bor-pc', 'homework', '192.168.0.100-110'],    
    allowed_url_extensions: ['.html', '.htm', '.css', '.js', '.xml', '.json', '.jpeg', '.jpg', '.png', '.gif'],/* compute result by controller */
    language: {
        default_lang_code: 'mn',
        sub_domain_is_lang_code: true, /* en.domain.com */
        first_uri_is_lang_code: false, /* domain.com/mn or domain.com/en */
        supported_lang_codes: [{code: 'mn', name: 'Монгол'}, {code: 'en', name: 'English'}],
        language_dirname_by_default: true /* if language_dirname_by_default then langdir = default_lang_code */
    }
};