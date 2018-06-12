/**
 * Created by seven on 2018/6/12.
 * fighting20xx@126.com
 */

'use strict'

var mysql = require('mysql');
var pool = mysql.createPool({
    host: '101.132.122.2',
    user: 'seven',
    password: '123456',
    database:'spiderdata',
    port: 3306
});


var insertSQL = 'INSERT INTO secondHandHouseData (	CODE,	address,	NAME,	area,	price,	company,	date) VALUES	(2, 2, 2, 2, 2, 2, 2)';
var selectSQL = 'SELECT  * from secondHandHouseData';
var deleteSQL = 'DELETE FROM  secondHandHouseData  WHERE id = 3 ';
var updateSQL = 'UPDATE secondHandHouseData SET date = "2018-06-12" ';

var query=function(sql,callback){
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql,function(err,results,fields){
                //释放连接
                conn.release();
                //事件驱动回调
                callback(err,results,fields);
            });
        }
    });
};

module.exports = query;

// query(insertSQL,  function(err,results,fields){
//     console.log(results);
// });
//
// query(selectSQL,  function(err,results,fields){
//     console.log(results);
// });
//
// query(deleteSQL,  function(err,results,fields){
//     console.log(results);
// });
//
// query(updateSQL,  function(err,results,fields){
//     console.log(results);
// });










