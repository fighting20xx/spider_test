/**
 * Created by Administrator on 2017/8/4.
 */
var http = require('http');
var superagent = require('superagent');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var i = 0;
var url = "https://www.meitulu.com/item/4941.html";
//初始url


analyzeOneURL(url);

function analyzeOneURL(URL) {
    //采用http模块向服务器发起一次get请求
    superagent.get(URL).end( function (err,res) {
        if(res) {
            var $ = cheerio.load(res.text); //采用cheerio模块解析html
            getNavigationURL($);
            forEachTheme(URL);    //存储每篇文章的图片及图片标题
        }
    })
}



function getNavigationURL($) {
    console.log("11111111111111111");
    console.log($('ul.img a').attr("href"));
    var item_arry = $('ul.img a').each(function (index, item) {
        storeToRepertory($(item).attr("href"));
    });

    // $("ul.img a").attr("href").each(function (index,item) {
    //     storeToRepertory(item);
    // });

    if (notYetURL.length){
        var nextURL = notYetURL.shift();
        doneURL[nextURL]=true;
        console.log(nextURL+"4444444444444444444444444444444444444444444");
        analyzeOneURL(nextURL);
    }
}


var doneURL ={};
var notYetURL = [];
function storeToRepertory(url) {
    if(doneURL[url]){

    }else {
        notYetURL.push(url);
    }
}



var ThemeUrlObject = {};
var number = 0;

function forEachTheme(URL2) {

    superagent.get(URL2).end( function (err,res) {
        if(res) {
            console.log("begin------forEachTheme");

            var $ = cheerio.load(res.text); //采用cheerio模块解析html
            number++;
            $('#pages a').each(function (index, item) {
                var link = "https://www.meitulu.com" + $(item).attr("href");
                ThemeUrlObject[link] = true;
                console.log(link);
                saveOnePageImages(link);
            });
            if (number < 5) {
                var the3backTofront = "https://www.meitulu.com" + $("#pages a:nth-child(10)").attr("href");
                forEachTheme(the3backTofront)
            } else if (number == 4) {
                var keys = Object.keys(ThemeUrlObject);
                for (var i; i < keys.length; i++) {
                    console.log(keys[i]);
                    saveOnePageImages(keys[i]);
                }
            }
            ;
        }
    })
}

var count = 0;
//该函数的作用：在本地存储所爬取到的图片资源
function saveOnePageImages(url3) {
    superagent.get(url3).end( function (err,res) {
        console.log("begin------saveOnePageImages");
        if(res){
            var $ = cheerio.load(res.text); //采用cheerio模块解析html
            $('.content  img').each(function (index, item) {
                count++;

                var img_src = $(this).attr('src'); //获取图片的url
                //var img_filename = img_src.slice(img_src.length-11);
                var img_filename = $(this).attr('alt')+img_src.slice(img_src.length-4);
                //var img_filename = count+".jpg";
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
    })

}















