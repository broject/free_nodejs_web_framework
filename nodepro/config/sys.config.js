/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


module.exports = {
    areas: [
        {
            uri: '/admin',
            lang: false
        },
        {
            uri: '/api',
            lang: false
        }
    ],
    cache: {
        ignore: false,
        use_redis: false/*false is use a memory cache*/
    },
    logger: {
        enable: true,
        log_stdout: false,
        file_path_format: '/logs/%s.log'
    },
    security: {
        crypto_key: '47b513053c57a47ebcc04f34768e9d78',
        np_token_check: false,
        np_token_methods: 'post'
    },
    session: {
        key: '__np__',
        name: '__np__',
        secret: 'session_secret',
        saveUninitialized: false,
        resave: false,
        test: true,
        test_uri: '/session'
    },
    cookie: {
        secure: false,
        http_only: false,
        default_domain: '',
        default_path: '/',
        check_expiration_second: 900,/*15minute*/
        expiration_second: 86400/*24hour*/
    }
};