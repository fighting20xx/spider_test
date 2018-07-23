/**
 * Created by seven on 2018/6/12.
 * fighting20xx@126.com
 */

'use strict'

var http = require('https');
var cheerio = require('cheerio');
var superagent = require('superagent');
var fs = require('fs');

var query = require('../sql/sql_pool');

var pageNumber = 100;                 //最大的页数
var rootApi = "https://hz.lianjia.com/ershoufang/pg100/";   //   最终拼接成这个样子
var options = {
    hostname: 'hz.lianjia.com',
    port: 80,
    path: '',
    rootUrl:"/ershoufang/",
    agent:new http.Agent({ keepAlive: true }),
    headers: {
        'Content-Type':'application/x-www-form-urlencoded',
    },
    keepAlive:true,
    maxSockets:30
};

var Count = 0;

function Spider() {
    this.maxThread = 30;
    this.apiArr = [];
    this.busyApi = [];
}
Spider.prototype.findAllApi =function () {
    for (var i = 1 ;i<pageNumber; i++){
        this.apiArr.push("https://hz.lianjia.com/ershoufang/pg"+ i + '/');
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
        // options.path= options.rootUrl + api;
		//
        // http.get(options, function (res) {
        //     res.setEncoding('utf8');
        //     var rawData = '';
        //     res.on('data', function (chunk) {
        //         rawData += chunk;
        //     });
        //     res.on('end', function () {
        //         try {
        //             var parsedData = JSON.parse(rawData);
        //             that.endApi(api);
        //             that.handleResultList(parsedData);
        //         } catch (e) {
        //             console.error(e.message);
        //         }
        //     });
        // });


	superagent.get(api).end( function (err,res) {
		if(res) {

			var $ = cheerio.load(res.text); //采用cheerio模块解析html

			$('.LOGCLICKDATA').each(function (index, item) {
				$(".title a",item).text();

                console.log($(".title a",item).text());
                console.log($(".houseInfo a",item).text());
                console.log($(".houseInfo",item).text());

                console.log($(".positionInfo",item).text());
                console.log($(".positionInfo a",item).text());

                console.log($(".followInfo",item).text());

                console.log($(".totalPrice span",item).text());
                console.log($(".totalPrice",item).text());
                console.log($(".unitPrice span",item).text());

                console.log(Count++);
			});
		}
	})



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
    var list = data.data.list;
    var sql ="";
    list.forEach(function (value,index) {
          sql += that.spellSql(value);
    });
    console.log(sql);                                //多条语句拼接在一起；
    query(sql,function (err,rowdata,field) {
        if(err) console.log("==> " ,err);
    });

    // console.log(data);
};
Spider.prototype.spellSql =function (obj) {
    var pre_sql = "insert into lianjia_newbulid ("
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

