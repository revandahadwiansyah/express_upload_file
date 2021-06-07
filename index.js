const express = require('express');
const app = express();
const multer = require('multer');
const url = require("url");
const path = require('path');
app.use(express.static(__dirname + '/public/images/'));
app.use('/images', express.static('public'))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 10000},
    fileFilter: function (req, file, cb) {
        // Extention
        const filetypes = ['jpeg', 'jpg', 'png', 'gif'];
        //console.log('filetypes:', filetypes)
        console.log('path:', path.extname(file.originalname).toLowerCase().substring(1))

        // get extention
        let ext = path.extname(file.originalname).toLowerCase().substring(1);
        //console.log('ext:', ext)

        console.log(filetypes.indexOf(ext))
        if (filetypes.indexOf(ext) == -1) {
            cb('Images Only!', false);
        }
        cb(null, true)
    }
}).single("upload_files");


app.get('/', (req, res) => {
    res.send('hello world');
});

app.post("/Services", (req, res) => {
    upload(req, res, (err) => {
        //console.log('err:', err)
        if (err) {
            res.status(400).send(err);
        } else {
            let responses = {
                originalname: req.file.originalname,
                mimetype: req.file.originalname,
                filename: req.file.filename,
                size: req.file.size,
                url: `${req.protocol}://${req.headers.host}/${req.file.originalname}`
            }
            res.send(responses);
        }
    });
});

app.listen(3000, () => {
    console.log('Started on port 3000');
});