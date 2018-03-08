/**
 * Created by Administrator on 2017/8/4.
 */
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var i = 0;
var url = "http://www.wmpic.me/88214";
//初始url

function fetchPage(url) {     //封装了一层函数
    startRequest(url);
}


function startRequest(x) {
    //采用http模块向服务器发起一次get请求
    http.get(x, function (res) {
        var html = '';        //用来存储请求网页的整个html内容
        var titles = [];
        res.setEncoding('utf-8'); //防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data', function (chunk) {
            html += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {

            var $ = cheerio.load(html); //采用cheerio模块解析html

            savedImg($);    //存储每篇文章的图片及图片标题


            //下一篇文章的url
            var nextLink="http://www.wmpic.me" + $('div a[rel="next"]').attr('href');
            //str1 = nextLink.split('-');  //去除掉url后面的中文
            str = encodeURI(nextLink);
            //这是亮点之一，通过控制I,可以控制爬取多少篇文章.
            if (i <= 500) {
                fetchPage(str);
            }

        });

    }).on('error', function (err) {
        console.log(err);
    });

}

//该函数的作用：在本地存储所爬取到的图片资源
function savedImg($) {
    $('.content-c a img').each(function (index, item) {
        // var img_title = $(this).parent().attr('href')   //获取图片的标题
        // // if(img_title.length>35||img_title==""){
        // //     img_title="Null";}


        var img_src = $(this).attr('src'); //获取图片的url
        var img_filename = img_src.slice(img_src.length-20)+".jpg";
        console.log(img_src);
        //采用request模块，向服务器发起一次请求，获取图片资源
        request.head(img_src,function(err,res,body){
            if(err){
                console.log(err);
            }
        });
        request(img_src).pipe(fs.createWriteStream('./image/' + img_filename));     //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
    })
}
fetchPage(url);      //主程序开始运行




















