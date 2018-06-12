/**
 * Created by seven on 2018/6/12.
 * fighting20xx@126.com
 */

'use strict'

var http = require('http');
var cheerio = require('cheerio');
var query = require('../sql/sql_pool');

var api = "http://jjhygl.hzfc.gov.cn/webty/WebFyAction_getGpxxSelectList.jspx";   //?page=8
var pageNumber = 6650;
//初始url

getApiData()


function getApiData() {
    http.get(api, function (res) {
        res.setEncoding('utf8');
        var rawData = '';
        res.on('data', function (chunk) {
            rawData += chunk;
        });
        res.on('end', function () {
            try {
                const parsedData = JSON.parse(rawData);
                // handleData(parsedData);
                handleData2(parsedData);

            } catch (e) {
                console.error(e.message);
            }
        });
    });

}

function handleData(data) {
    var list = data.list;
    list.forEach(function (value, index) {
        console.log(value.accountid, value.cjsj,value.fczsh);
        var sql =" INSERT into importData (accountid, accountname, cjsj,cqmc, cqsj, cyrybh,czfs, dqlc,  " +
            "fbzt, fczsh,  fwtybh, fwyt,fwytValue,gisx,gisy, gpfyid,gphytgsj, gpid, gplxrcode, gplxrdh,  gplxrxm,  " +
            " gply, gpzt, gpztValue, hxs, hxt, hxw, hyid, hyjzsj,isnew,  jzmj, mdmc,qyid, qyzt,  " +
            " scgpshsj, sellnum, sqhysj,szlc,szlcname, tygpbh,wtcsjg,wtdqts,  wtxybh,  wtxycode, xqid,  xqmc,  xzqh, xzqhname, zzcs  " +

        ") VALUES (  " +  value.accountid +","+
            value.accountname +" , "+
            value.cjsj +" , "+
            value.cqmc +" , "+
            value.cqsj+" , "+
            value.cyrybh+" , "+
            value.czfs+" , "+
            value.dqlc+"  , "+
            value.fbzt+" , "+
            value.fczsh+" , "+
            value.fwtybh+" , "+
            value.fwyt+" , "+
            value.fwytValue+" , "+
            value.gisx+" , "+
            value.gisy+" , "+
            value.gpfyid+" , "+
            value.gphytgsj+" , "+
            value.gpid+" , "+
            value.gplxrcode+" , "+
            value.gplxrdh+" , "+
            value.gplxrxm+" , "+
            value.gply+" , "+
            value.gpzt+" , "+
            value.gpztValue+" , "+
            value.hxs+" , "+
            value.hxt+" , "+
            value.hxw+" , "+
            value.hyid+" , "+
            value.hyjzsj+" , "+
            value.isnew+" , "+
            value.jzmj+" , "+
            value.mdmc+" , "+
            value.qyid+" , "+
            value.qyzt+" , "+
            value.scgpshsj+" , "+
            value.sellnum+" , "+
            value.sqhysj+" , "+
            value.szlc+" , "+
            value.szlcname+" , "+
            value.tygpbh+" , "+
            value.wtcsjg+" , "+
            value.wtdqts+" , "+
            value.wtxybh+" , "+
            value.wtxycode+" , "+
            value.xqid+" , "+
            value.xqmc+" , "+
            value.xzqh+" , "+
            value.xzqhname+" , "+
            value.zzcs+

       ")";

        console.log(sql);
        query(sql,function (err,rowdata,field) {
            if(err) console.log("==> " ,err);
        })
    })
}

function handleData2(data) {
    var list = data.list;
    list.forEach(function (value,index) {
        var sql = spellSql(value);

        console.log(sql);
        query(sql,function (err,rowdata,field) {
            if(err) console.log("==> " ,err);
        })
    })
}

function spellSql(obj) {

    var array = Object.prototype.keys.call(obj)  //obj.keys;
    var pre_sql = "insert into importData ("
    var last_sql = "values ( ";
    array.forEach(function (item,index) {
        var value = obj[item];
        if( typeof  value == "string" && value == ""){

        }else {
            pre_sql += item+ " ,";
            last_sql += value+ " ,";
        }
    });

    pre_sql = pre_sql.substr(0,-1) +" ) ";
    last_sql = last_sql.substr(0,-1)+ " ) ";
    return pre_sql + last_sql;
}