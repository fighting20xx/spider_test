/**
 * Created by seven on 2018/6/12.
 * fighting20xx@126.com
 */

'use strict'

var http = require('http');
var cheerio = require('cheerio');
var query = require('../sql/sql_pool');

var pageNumber = 3000;                 // 阿三顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶顶
var rootApi = "http://jjhygl.hzfc.gov.cn/webty/WebFyAction_getGpxxSelectList.jspx";   //?page=8
var options = {
    hostname: 'jjhygl.hzfc.gov.cn',
    port: 80,
    path: '',
    rootUrl:"/webty/WebFyAction_getGpxxSelectList.jspx?",
    agent:new http.Agent({ keepAlive: true }),
    headers: {
        'Content-Type':'application/x-www-form-urlencoded',
    },
    keepAlive:true,
    maxSockets:30
};



function Spider() {
    this.maxThread = 30;
    this.apiArr = [];
    this.busyApi = [];
}
Spider.prototype.findAllApi =function () {
    for (var i = 1 ;i<pageNumber; i++){
        this.apiArr.push("page="+i);
    }
};
Spider.prototype.eachAllApi =function () {
    if (!this.isBusy()){
        var newApi = this.apiArr.shift();
        if (newApi){
            this.busyApi.push(newApi);
            this.getApiData(newApi);
            console.log("进度=================>"+((1 - this.apiArr.length/pageNumber)*100).toFixed(2) +"%")
        }else {
            console.log("=====================> END");
        }
    }
};
Spider.prototype.getApiData =function (api) {

        var that = this;
        options.path= options.rootUrl + api;
        http.get(options, function (res) {
            res.setEncoding('utf8');
            var rawData = '';
            res.on('data', function (chunk) {
                rawData += chunk;
            });
            res.on('end', function () {
                try {
                    var parsedData = JSON.parse(rawData);
                    that.endApi(api);
                    that.handleResultList(parsedData);
                } catch (e) {
                    console.error(e.message);
                }
            });
        });

};
Spider.prototype.isBusy =function () {
    return this.busyApi.length >= this.maxThread;
};
Spider.prototype.endApi =function (api) {
    this.busyApi.splice(this.busyApi.indexOf(api) , 1);
    this.eachAllApi();
};

Spider.prototype.startMutilThread =function (api) {
   for(var i=0; i<this.maxThread ;i++){
       this.eachAllApi();
   }
};

Spider.prototype.handleResultList = function (data) {
    var that = this;
    var list = data.list;
    var sql ="";
    list.forEach(function (value,index) {
          sql += that.spellSql(value);
    });
    // console.log(sql);                                //多条语句拼接在一起；
    query(sql,function (err,rowdata,field) {
        if(err) console.log("==> " ,err);
    })
};
Spider.prototype.spellSql =function (obj) {
    var pre_sql = "insert into importData_test ("
    var last_sql = "values ( ";

    for (var item in obj){
        var value = obj[item];
        if( typeof  value == "string" && value == ""){

        }else {
            pre_sql += item+ " ,";
            last_sql += "\""+value+ "\" ,";
        }
    }
    pre_sql = pre_sql.substring(0,pre_sql.length-1) +" ) ";
    last_sql = last_sql.substring(0,last_sql.length-1)+ " ); ";
    return pre_sql + last_sql;
};
Spider.prototype.run =function () {
    this.findAllApi();
    this.startMutilThread();
};



var spider = new Spider();
spider.run();

