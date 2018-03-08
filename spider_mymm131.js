/**
 * Created by Administrator on 2017/8/4.
 */
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var superagent = require('superagent');
var i = 0;
var url = "http://www.mm131.com/xinggan/3041.html";
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

            //savedImg($);    //存储每篇文章的图片及图片标题
            forEachTheme(x);

            //下一篇文章的url
            var nextLink="" + $('.updown a').attr('href');
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




function forEachTheme(URL2) {

    superagent.get(URL2).end( function (err,res) {
        if(res) {
            console.log("begin------forEachTheme");

            var $ = cheerio.load(res.text); //采用cheerio模块解析html

            $('a.page-en').each(function (index, item) {
                var link = "http://www.mm131.com/xinggan/" + $(item).attr("href");
               console.log(link);
                saveOnePageImages(link);

            });
            // if (number < 5) {
            //     var the3backTofront = "http://www.mm131.com/" + $("#pages a:nth-child(10)").attr("href");
            //     forEachTheme(the3backTofront)
            // } else if (number == 4) {
            //     var keys = Object.keys(ThemeUrlObject);
            //     for (var i; i < keys.length; i++) {
            //         console.log(keys[i]);
            //         saveOnePageImages(keys[i]);
            //     }
            // }
            // ;
        }
    })
}


//
// //该函数的作用：在本地存储所爬取到的图片资源
// function savedImg($) {
//     $('.content-c a img').each(function (index, item) {
//         // var img_title = $(this).parent().attr('href')   //获取图片的标题
//         // // if(img_title.length>35||img_title==""){
//         // //     img_title="Null";}
//
//
//         var img_src = $(this).attr('src'); //获取图片的url
//         var img_filename = img_src.slice(img_src.length-20)+".jpg";
//         console.log(img_src);
//         //采用request模块，向服务器发起一次请求，获取图片资源
//         request.head(img_src,function(err,res,body){
//             if(err){
//                 console.log(err);
//             }
//         });
//         request(img_src).pipe(fs.createWriteStream('./image/' + img_filename));     //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
//     })
// }
fetchPage(url);      //主程序开始运行




//该函数的作用：在本地存储所爬取到的图片资源
function saveOnePageImages(url3) {
    superagent.get(url3).end( function (err,res) {
        //console.log("begin------saveOnePageImages");
        if(res){
            var $ = cheerio.load(res.text); //采用cheerio模块解析html
            $('.content-pic  img').each(function (index, item) {


                var img_src = $(this).attr('src'); //获取图片的url
                //var img_filename = img_src.slice(img_src.length-11);
                var img_filename = $(this).attr('alt').slice(14)+img_src.slice(img_src.length-4);
                //var img_filename = count+".jpg";
                console.log(img_src);
                //采用request模块，向服务器发起一次请求，获取图片资源
                request.head(img_src,function(err,res,body){
                    if(err){
                        console.log(err);
                    }
                });
                request(img_src).on("error",function () {

                }).pipe(fs.createWriteStream('./aaa/' + img_filename));     //通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
            })
        }
    })

}

















