require('dotenv').config();
const express = require('express'),
    api = require('./api'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    multer = require('multer');


const app = express();
app.use(express.static("public"));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const upload = multer({ dest: "uploads/" }),
    OCR = require('./ocr');


// Configuring API routes
app.use('/api', api);

// Leaving it here for now, but we will probably move that to "/api/v1/menu/ocr"
app.post('/v1/convert/ocr', upload.single('file_img'), (req, res) => {
    if (req.file) {
     if (req.file.size < 28116350){
      if (req.file.mimetype.search("image") !== -1){
        var ocrInstance = new OCR();
        ocrInstance.getText(req.file.path, function(err, response){
         if (err){
           res.status(500).json({ERROR : "Error to convert the image!"});
         } else {
          res.status(200).send(response);
         }
        });    
      } else {
        res.status(400).json({ERROR : "Attachment must be png, jpeg or jpg!"}); 
       } 
     } else {
       res.status(400).json({ERROR : "Attachment too long!"});
      } 
    } else {
      res.status(400).json({ERROR : "Empty attachment!"});
     }
 });


app.listen(process.env.PORT,() => console.log(`Server listening at port ${process.env.PORT}`));