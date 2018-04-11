"use strict";

let fs = require("fs");
let watermark = require("image-watermark");
//let path = require("path");
let crypto = require("crypto");
//let async = require("async");


/////////////////////////////////////////// Настройки /////////////////////////////////////////////

const regexpImg = /\.(?:jp(?:e?g|e|2)|png)$/; // Регулярное выражение для отбора файлов изображений 

let options = {
  "text": "hvac-store.com",
  "override-image": true
};


let imgdirs = ["/web/ig/img/p/1/0/8/4/" ,"/web/ig/img/magic360/" , "/web/ig/img/p/1/0/8/5/"];

let maxStream = 50; // количество потоков 


///////////////////////////////// косяки /////////////////////////////////////
var dirNum = 0;
// данные парамтеры нужно передавать в callback



/////////////////////////////////////////// Перебор каталогов /////////////////////////////////////////////
let dirslength = imgdirs.length; //Запоминаем длинну массива директорий
console.log("dirslength: " + dirslength);



// Запускаем перебр каталогов послеловательно
let imgdirFirst = imgdirs[dirNum];
enumerationAllDir(imgdirFirst); //Запуск



function enumerationAllDir(dir_enumeration) {

  console.log("Start folder " + dir_enumeration);
  // Спсисок файлов дирректории
  let files = fs.readdirSync(dir_enumeration).reduce((p, c) => {
    if (fs.statSync(dir_enumeration + c).isFile()) { // отбираем каталоги
      if (regexpImg.exec(c)) { // отбираем файлы
        p.push(c);
      }
    }
    return p;
  }, []);


  console.log(files);

  enumeration(files, dir_enumeration, 0, function(err) { // Передаем внутрь массив файлов и каталог расположения 
    console.log("Start enumeration" + dir_enumeration);
    if (err) console.log(err);
    dirNum++;
    if (dirNum < dirslength) { // проверка на конец массива
      enumerationAllDir(imgdirs[dirNum]);
    }
  });
}




/////////////////////////////////////////// Перебор файлов /////////////////////////////////////////////



function enumeration(files, imgFiledir, imgNum, callback2) { // Последовательный перебор значения
  //let imgNum = 0;
  const fileslength = files.length; //Запоминаем длинну массива файлов конкретной директории
  const fullImgPach = imgFiledir + files[imgNum];
  const finalcallback = callback2;

  console.log("fileslength: " + fileslength + " step - " + imgNum);



  enumerationFile(fullImgPach, function (err) {
    
    if (err) console.log(err);

    imgNum++;

    if (imgNum < fileslength) {
      console.log("Statrt iteration " + imgNum + " of folder " + imgFiledir);
      enumeration(files, imgFiledir, imgNum, callback2); // Возможно излишня нагрузка на систему передавать несколько раз один массив.

    } else {
      console.log("finish folser " + imgFiledir);
      // console.log(err);
      finalcallback();
    }

  }); 


  
}



function enumerationFile(fullimgpach, callback) {
  checkHashfile(fullimgpach, (err, data) => { // Проверка конкретного значения и перзапуск петли
    console.log("start callback img_enumeration - checkHashfile  " + fullimgpach + ". data: " + data);
    if (!data) {
      // Ставим водный знак на конкретный файл
      console.log("start  watermark - " + fullimgpach);
      watermark.embedWatermarkWithCb(fullimgpach, options, function (err) {
        if (err) console.log(err);
        if (!err) {
          makeHashfile(fullimgpach); //Создаем Hash файл
          console.log("Successful " + fullimgpach);
        }
        console.log("Finish enumerationFile and  Hash " + fullimgpach);
        callback(); // Завершили обработку данного файла 
      });
    } else {
      console.log("Finish enumerationFile " + fullimgpach);
      callback(); // Завершили обработку данного файла 
      //setTimeout(callback, 1000);

    }
  });
}


/////////////////////////////////////////// функции над файлами /////////////////////////////////////////////

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
        //console.log(hashimg);
        //console.log(HashFile);
        if (hashimg === HashFile) {
          console.log("HashFileName - true " + img);
          return callback(null, true);
        } else {
          console.log("HashFileName - false " + img);
          return callback(null, false);
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
    fs.writeFile(HashFileName, `${hash.read()}`);
  });

  fd.pipe(hash);
}