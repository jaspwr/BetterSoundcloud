const imageDataURI = require('image-data-uri');

imageDataURI.encodeFromFile('D:\\temp\\gggggggggggg.PNG')
    // RETURNS image data URI :: 'data:image/png;base64,PNGDATAURI/'
    .then(res => console.log(res))