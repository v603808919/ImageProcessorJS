
'use strict';

let fs = require('fs');
let watermark = require('text-watermark');
let dir = require('node-dir');
let path = require('path');
let crypto = require('crypto');
let async = require('async');


//console.log('Start update img');



let options = {
    'text' : 'hvac-store.com',
    'override-image' : true
};

let imgFilePath = __dirname + '/demo/api.png';
let imgFiledir = __dirname + '/demo/';


//Промис функция расчета Хеш (пока не используется)
function fileHash(filename, algorithm = 'md5') {
    return new Promise((resolve, reject) => {
      // Algorithm depends on availability of OpenSSL on platform
      // Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
      let shasum = crypto.createHash(algorithm);
      try {
        let s = fs.ReadStream(filename)
        s.on('data', function (data) {
          shasum.update(data)
        })
        // making digest
        s.on('end', function () {
          const hash = shasum.digest('hex')
          return resolve(hash);
        })
      } catch (error) {
        return reject('calc fail');
      }
    });
  }






// Спсисок файлов дирректории
 const files = fs.readdirSync(imgFiledir).reduce((p, c) => {
  if (fs.statSync(imgFiledir + c).isFile()) {
      p.push(c);
  }
  return p;
}, []); 
// console.log(files);







// проверяем соовтествует ли Hash имеющемуся файлу - boolean
// false - или Шеша нет или он не соответствует
// true - с изобрадением все ок, оно промаркировано.
(function checkHashfile(img) {
  const HashFileName = img + '.hash' ;  

  const imgfd = fs.createReadStream(img);
  const imghash = crypto.createHash("md5");
  imghash.setEncoding("hex");
 
  //console.log(imghash);

  //Проверка существования файла Hash
  fs.readFile(HashFileName, (err, data) => {
    if (err) {
      console.log('no file')
      return false;
      throw (err);
    } else {
      const HashFile = data.toString('utf8');
     
      imgfd.on('data', function (data) {
        imghash.update(data)
      })
      // making digest
      imgfd.on('end', function () {
        const hashimg = imghash.digest('hex');
        console.log(hashimg);
        console.log(HashFile);
        if (hashimg === HashFile) {
            console.log('true');
            return true;
        } else {
            console.log('false');
            return false
        }
        
      })
    
      //fd.pipe(hash);

    }
    
  });


 
})(imgFilePath);





// Создаем Hash файл
function makeHashfile(img) {
   const fd = fs.createReadStream(img);
   const hash = crypto.createHash("md5");
   hash.setEncoding("hex");
   fd.on("end", () => {
       hash.end();
       let HashFileName = img + '.hash' ;
       console.log(HashFileName);
       //fs.appendFileSync(HashFileName, `${hash.read()}`);
       fs.writeFileSync(HashFileName, `${hash.read()}`);
   });
 
   fd.pipe(hash);
 };


 // Ставим водный знак на конкретный файл
/*  watermark.addWatermark(imgFilePath, options, function(err){
  if(err)
      return console.log(err);
  if (!err)
      makeHashfile(imgFilePath); //Создаем Hash файл
  return console.log("Successful - no error");
});  */



console.log('Finish update img');




