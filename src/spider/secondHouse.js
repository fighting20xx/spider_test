/**
 * Created by seven on 2018/6/12.
 * fighting20xx@126.com
 */

'use strict'

var http = require('http');
var cheerio = require('cheerio');
var query = require('../sql/sql_pool');

var rootApi = "http://jjhygl.hzfc.gov.cn/webty/WebFyAction_getGpxxSelectList.jspx";   //?page=8
var pageNumber = 6650;
//初始url


function Spider() {
    this.maxThread = 50;
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
            console.log("进度=================>"+((1 - this.apiArr.length/6650)*100).toFixed(2) +"%")
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
    this.busyApi.splice(this.busyApi.indexOf(api) , 1)
};

Spider.prototype.handleResultList = function (data) {
    var that = this;
    var list = data.list;
    list.forEach(function (value,index) {
        var sql = spellSql(value);

        console.log(sql);
        query(sql,function (err,rowdata,field) {
            if(err) console.log("==> " ,err);
            that.eachAllApi();
        })
    });
};



Spider.prototype.run =function () {
    this.findAllApi();
    this.eachAllApi();
};

var spider = new Spider();
spider.run();





function spellSql(obj) {
    var pre_sql = "insert into importData ("
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
    last_sql = last_sql.substring(0,last_sql.length-1)+ " ) ";
    return pre_sql + last_sql;
}

