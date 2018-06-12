/**
 * Created by Administrator on 2017/8/7.
 * nodejs 批处理程序
 */

var fs = require('fs');
var util = require('util');
var path = './image2/';

function explorer(path,fn){
    var Arr = [];
    fs.readdir(path, function(err, files){
        //err 为错误 , files 文件名列表包含文件夹与文件
        if(err){
            console.log('error:\n' + err);
            return;
        }

        files.forEach(function(file){

            fs.stat(path + '/' + file, function(err, stat){
                if(err){console.log(err); return;}
                if(stat.isDirectory()){
                    // 如果是文件夹遍历
                    Arr.concat(explorer(path + '/' + file));
                }else{
                    // 读出所有的文件
                    Arr.push('<img src=\"' + path + '' + file+"\">");
                }
            });

        });

    });
    if (typeof fn === 'function'){
        fn(Arr);
    }
    return Arr;
}


explorer(path,function (arr) {
    arr.forEach(function (value, index) {
        console.log(value);
    })
});