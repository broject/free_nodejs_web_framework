/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


exports.options = {
    ability: {
        uuid_version: 1, /*1 is time based or 4 is random based*/
        use_base_controller: true,
        use_base_model: true
    },
    modules: {
        chat: {
            enable: false,
            uri: '/chat'
        }
    },
    fw: {
        force_to_https: false,
        globalAgent_maxSockets: 50,
        urlencoded_extended: true, /*if true then recognize user[username] to {user: { username: ""}}*/
        jade_engine: true, /*view engine*/
        disable_view_cache: true, /*app.cache*/
        disable_etag: true, /*disable<304 Not Modified>*/
        use_compression: true,
        use_helmet: true, /*disable X-Powered-By header*/
        use_session: true, /*if false then use cookie session*/
        session_lib: 'memory-store',/*redis-store,mysql-store*/
        use_parallel: true /*parallel routing*/
    },
    res: {
        favicon_file_uri: '/favicon.png',
        static_path: '/assets',
        media_path: '/assets/media',
        theme_path: '/assets/themes',
        static_dirname: 'public',
        code_dirname: 'nodepro',
        view_dirname: 'views',
        default_theme_name: 'default'
    }
};