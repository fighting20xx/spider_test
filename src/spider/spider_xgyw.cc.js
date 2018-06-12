/**
 * Created by Administrator on 2017/8/4.
 */
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var superagent = require('superagent');
var i = 0;
var url = "http://www.xgyw.cc/top.html";
//初始url
var num = 1000;
var count =1;
var Array_img_src =[];

startRequest(url);



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


            $('.dan a').each(function (index, item) {
                var link = "http://www.xgyw.cc" + $(item).attr("href");
                if( index <= 3){
                    //saveOnePageImages();
                    forEachTheme(link);
                }else {

                }


            });


            // //下一篇文章的url
            // var nextLink="http://www.xgyw.cc" + $('.next a').attr('href');
            // //str1 = nextLink.split('-');  //去除掉url后面的中文
            // str = encodeURI(nextLink);
            // //这是亮点之一，通过控制I,可以控制爬取多少篇文章.
            // if (i <= 500) {
            //     fetchPage(str);
            // }

        });

    }).on('error', function (err) {
        console.log(err);
    });

}




function forEachTheme(URL2) {

    superagent.get(URL2).end( function (err,res) {
        if(res) {
            console.log("begin------forEachTheme");

            var $ = cheerio.load(res.text); //采用cheerio模块解析html

            $('.page a').each(function (index, item) {

                    var link = "http://www.xgyw.cc" + $(item).attr("href");
                   console.log(link);
                   saveOnePageImages(link);


            });

        }
    })
}







//该函数的作用：在本地存储所爬取到的图片资源
function saveOnePageImages(url3) {
    superagent.get(url3).end( function (err,res) {
        console.log("begin------saveOnePageImages");
        if(res){
            var $ = cheerio.load(res.text); //采用cheerio模块解析html
            $('.img  img').each(function (index, item) {


                    var img_src ="http://www.xgyw.cc"+ $(this).attr('src'); //获取图片的url
                    //var img_filename = img_src.slice(img_src.length-11);
                    var img_filename = $(this).attr('alt').slice(14)+img_src.slice(img_src.length-7);
                     Array_img_src.push(img_src);
                    DownRequest(Array_img_src);
            })
        }
    })

}



function DownRequest(Array_img_src) {
    if (Array_img_src.length >0) {

        num++;
        count++;


        // if(count<=20){

            var img_src = Array_img_src.shift();

            var tt = img_src.slice(img_src.length-7);
            console.log(img_src +"-------------------"+count);

            request.head(img_src,function(err,res,body){
                if(err){
                    console.log(err);
                }
                count--;
                DownRequest(Array_img_src)
            });
            request(img_src).on("error",function (err) {
                console.log(err);
            }).pipe(fs.createWriteStream('./image3/' + tt));     //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。



            //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
        }

    // }

}














