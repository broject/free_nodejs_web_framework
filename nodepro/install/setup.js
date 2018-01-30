module.exports.create_tables = function (loader, done) {
    var async = require('async');
    var model_package = loader.core('model');
    var model = new model_package(loader._base);
    var create_sql_content = loader.loadFile('data/create_tables.sql', 'install/defaults');
    var create_sql_items = loader._comm.clean_array(create_sql_content.split(';'));
    async.eachSeries(create_sql_items, function iteratee(sql_item, next_func) {
        async.setImmediate(function () {
            model.execute(sql_item, function (ret, err) {
                console.log('*------------------------------------------*');
                console.log('<Error Is> ', err, ', <Sql Is> ', sql_item);
                console.log('*------------------------------------------*');
                next_func();
            });
        });
    }, done);
};