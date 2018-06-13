/**
 * Created by seven on 2018/6/12.
 * fighting20xx@126.com
 */

'use strict'

var http = require('http');
var cheerio = require('cheerio');
var query = require('../sql/sql_pool');

var rootApi = "http://jjhygl.hzfc.gov.cn/webty/WebFyAction_getGpxxSelectList.jspx";   //?page=8
var pageNumber = 6678;
//初始url


function Spider() {
    this.maxThread = 40;
    this.apiArr = [];
    this.busyApi = [];
}
Spider.prototype.findAllApi =function () {
    for (var i = 1 ;i<pageNumber; i++){
        this.apiArr.push(rootApi +"?page="+i);
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
    http.get(api, function (res) {
        res.setEncoding('utf8');
        var rawData = '';
        res.on('data', function (chunk) {
            rawData += chunk;
        });
        res.on('end', function () {
            try {
                const parsedData = JSON.parse(rawData);
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
          sql += spellSql(value);
    });

    console.log(sql);                                //多条语句拼接在一起；
    query(sql,function (err,rowdata,field) {
        if(err) console.log("==> " ,err);
    })
};



Spider.prototype.run =function () {
    this.findAllApi();
    this.startMutilThread();
};

var spider = new Spider();
spider.run();





function spellSql(obj) {
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
}

