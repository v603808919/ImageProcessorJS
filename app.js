
"use strict";

let fs = require("fs");
let watermark = require("image-watermark");
//let path = require("path");
let crypto = require("crypto");
//let async = require("async");


//const maxOneTimeRequest = 50;

const regexpImg = /\.(?:jp(?:e?g|e|2)|png)$/; // Регулярное выражение для отбора файлов изображений 

let options = {
  "text": "hvac-store.com",
  "override-image": true
};



//let imgFilePath = __dirname + "/demo/api.png";
let imgFiledir = "/modulesjs/ImageProcessorJS/demo/";

// Спсисок файлов дирректории
const files = fs.readdirSync(imgFiledir).reduce((p, c) => {
  if (fs.statSync(imgFiledir + c).isFile()) {   // отбираем каталоги
    if (regexpImg.exec(c)) {    // отбираем файлы
      p.push(c);
    }
  }
  return p;
}, []);


console.log(files);



/* // Перебираем все отобранные файлы
files.forEach(function (item, i, arr) {
  
  let imgFilePath = imgFiledir + item;
  console.log("forEach - " + imgFilePath);
  if (!(checkHashfile(imgFilePath)) ) {
    // Ставим водный знак на конкретный файл
    console.log("start  watermark - " + imgFilePath);
    watermark.addWatermark(imgFilePath, options, function (err) {
      if (err)
        return console.log(err);
      if (!err)
        makeHashfile(imgFilePath); //Создаем Hash файл
      return console.log("Successful - no error " + item);
    });
  }
}); */



const fileslength = files.length; //Запоминаем длинну массива 
console.log("fileslength: " + fileslength);
/*
for (let i = 0; i < fileslength; i = i + maxOneTimeRequest) {

  let maxj = i + maxOneTimeRequest; // вычисляем границы
  if (maxj > fileslength) {
    maxj = fileslength;
  }

  for (let j = i; j < maxj; j++) {
    console.log(j);
    
    let imgFilePath = imgFiledir + files[j];
    console.log("forEach - " + imgFilePath);
  
    checkHashfile(imgFilePath, function(check) {
      if (!check) {
        // Ставим водный знак на конкретный файл
        console.log("start  watermark - " + imgFilePath);
        watermark.embedWatermarkWithCb(imgFilePath, options, function (err) {
          if (err)
            return console.log(err);
          if (!err)
            makeHashfile(imgFilePath); //Создаем Hash файл
          return console.log("Successful - no error " + files[j]);
        });
      }
  
    }) ;

  }

}*/

// Запускаем перебр послеловательно
let imgFilePathFirst = imgFiledir + files[0];
var imgNum = 0;

checkHashfile(imgFilePathFirst, (err, data) => {
  console.log("start callback imgFilePathFirst " + imgNum + ". data: " + data);
  let imgFilePath = imgFiledir + files[imgNum];
  imgNum++;

  if (!data) {
    // Ставим водный знак на конкретный файл
    console.log("start  watermark - " + files[imgNum] );
    watermark.embedWatermarkWithCb(imgFilePath, options, function (err) {
      if (imgNum < fileslength) {  // Если массив еще не кончился
        console.log("Start next loop - " + imgNum);
        //checkHashfile(imgFiledir + files[imgNum]); //коментируем закольцовывание
      }
      if (err)
        return console.log(err);
      if (!err)
        makeHashfile(imgFilePath); //Создаем Hash файл
      return console.log("Successful - no error " + imgFilePath);
    });
  } else { // 
    if (imgNum < fileslength) {  // Если массив еще не кончился
      console.log("WOVM - Start next loop - " + imgNum);
      //checkHashfile(imgFiledir + files[imgNum]); //коментируем закольцовывание
    }

  }

}) ;


/* 
// тест 
checkHashfile(imgFilePathFirst, (err, data) => {
  console.log("start callback err " + err);
  console.log("start callback data " + data);
});
 */


// проверяем соовтествует ли Hash имеющемуся файлу - boolean
// false - или Шеша нет или он не соответствует
// true - с изобрадением все ок, оно промаркировано.
function checkHashfile(img, callback) {
  const HashFileName = img + ".hash";

  const imgfd = fs.createReadStream(img);
  const imghash = crypto.createHash("md5");
  imghash.setEncoding("hex");



  //Проверка существования файла Hash
  fs.readFile(HashFileName, (err, data) => {
    if (err) {
      console.log("no file " + HashFileName);
      //return false;
      //throw (err);
      return callback(err, false);
    } else {
      console.log("file have " + HashFileName);
      const HashFile = data.toString("utf8");

      imgfd.on("data", function (data) {
        imghash.update(data);
      });
      // making digest
      imgfd.on("end", function () {
        const hashimg = imghash.digest("hex");
        console.log(hashimg);
        console.log(HashFile);
        if (hashimg === HashFile) {
          console.log("HashFileName - true " + img);
          //return true;
          return callback(null, true);
        } else {
          console.log("HashFileName - false " + img);
          //return false
          return callback(null,false);
        }

      });

      //fd.pipe(hash);

    }

  });


  console.log("Finish checkHashfile " + HashFileName);



}





// Создаем Hash файл
function makeHashfile(img) {
  console.log("start make Hashfile " + img);
  const fd = fs.createReadStream(img);
  const hash = crypto.createHash("md5");
  hash.setEncoding("hex");
  fd.on("end", () => {
    hash.end();
    let HashFileName = img + ".hash";
    console.log(HashFileName);
    //fs.appendFileSync(HashFileName, `${hash.read()}`);
    fs.writeFileSync(HashFileName, `${hash.read()}`);
  });

  fd.pipe(hash);
}



console.log("Finish update img");


