const express = require('express');
const app = express();
const multer = require('multer');
const url = require("url");
const path = require('path');
const DecompressZip = require('decompress-zip')
const unzipper = require('unzipper');
const fs = require('fs');
let latestFiles = [];

app.use(express.static(__dirname + '/public/images/'));
app.use('/images', express.static('public'))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const filetypes = ['zip'];
        let ext = path.extname(file.originalname).toLowerCase().substring(1);
        if (filetypes.indexOf(ext) != -1) {
            cb(null, './public/zip');
        } else {
            cb(null, './public/images');
        }
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 100000},
    fileFilter: function (req, file, cb) {
        //console.log('file:', file)

        // Extention
        const filetypes = ['jpeg', 'jpg', 'png', 'gif', 'zip'];
        //console.log('filetypes:', filetypes)
        //console.log('path:', path.extname(file.originalname).toLowerCase().substring(1))

        // get extention
        let ext = path.extname(file.originalname).toLowerCase().substring(1);
        //console.log('ext:', ext)

        //console.log(filetypes.indexOf(ext))
        if (filetypes.indexOf(ext) == -1) {
            cb('Images Only!', false);
        }
        cb(null, true)
    }
}).single("upload_files");


app.get('/', (req, res) => {
    res.send('hello world');
});

app.post("/Services", async (req, res) => {
    let fileContains = [];
    upload(req, res, async (err) => {
        //console.log('err:', err)
        let filePath = `${__dirname}/public/zip/${req.file.filename}`;
        latestFiles = [];
        if (err) {
            res.status(400).send(err);
        } else {
            let ext = path.extname(req.file.originalname).toLowerCase().substring(1);

            if (ext === 'zip') {
                let unzipping = await unzipFiles(req, filePath);
            } else {
                let newfiles = {
                    url: `${req.protocol}://${req.headers.host}/${req.file.filename}`
                }
                fileContains.push(newfiles);
                latestFiles = fileContains;
            }

            let responses = {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                filename: req.file.filename,
                size: req.file.size,
                ext: ext,
                fileContain: fileContains
            }
            res.send(responses);
        }
    });
});

app.get('/get_files', (req, res) => {
    //console.log('latestFiles:', latestFiles)
    if (!latestFiles.length) {
        res.send({status: false, msg: 'NoFileUploaded'});
    }
    
    let response = {
        status: true,
        files: []
    }
    
    let newFiles = [];
    for (var x in latestFiles) {
        console.log(`${x} => ${latestFiles[x].url}`)
        response.files.push(latestFiles[x].url)
    }
    res.send(response);
});

app.listen(3000, () => {
    console.log('Started on port 3000');
});


function unzipFiles(req, path) {
    let fileContains = [];
    return new Promise(async (resolve, reject) => {
        let unzipper = new DecompressZip(path);
        //console.log('unzipper:', unzipper)

        unzipper.on('error', function (err) {
            console.log('Caught an error:', err);
        });

        unzipper.extract({
            path: `${__dirname}/public/images/`,
            timestamps: true
        });

        unzipper.on('extract', function (log) {
            console.log('Finished extracting', log)
            for (var x in log) {
                let newfiles = {
                    url: `${req.protocol}://${req.headers.host}/${log[x].deflated}`
                }
                //console.log('newfiles:', newfiles)
                latestFiles.push(newfiles);
            }
            //console.log('latestFiles:', latestFiles)
        });

        return resolve({status: true})
    });
}