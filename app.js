
var watermark = require('image-watermark');


console.log('Start update img');


var options = {
    'text' : 'hvac-store.com'
};


watermark.embedWatermarkWithCb('../rdb_watermark_js/demo/api.png', options, function(err) {
	if (!err)
        console.log('Succefully embeded watermark');
    if (err)
		console.log('Err: ' + err);    
});
    
 
    



console.log('Finish update img');



