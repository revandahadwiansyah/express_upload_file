const aspect = require('aspectratio');
const sharp = require('sharp');
const pixels = require('image-pixels')
const fs = require('fs');
const filterImages = {width: 128, height: 128};

exports.createThumbnails = function (file) {
    return new Promise(async (resolve, reject) => {
        let oriPath = `${__dirname}/../public/images/${file.filename}`;
        try {
            var {data, width, height} = await pixels(file.originalname);

            if (parseInt(width) < filterImages.width && parseInt(height) < filterImages.height) {
                fs.copyFile(oriPath, `${__dirname}/../public/images/thumbnails_${file.filename}`, (err) => {
                    if (err)
                        resolve({status: false, msg: err, err: err});
                });
            } else {
                //set 32//
                let imgRatio32 = await imageRatio(oriPath, parseInt(32));
//            console.log('width32:', width)
//            console.log('height32:', height)
//            console.log('imgRatio32:', imgRatio32)
                sharp(oriPath).resize(32, imgRatio32.newHeight).toFile(`${__dirname}/../public/images/thumbnails32_${file.filename}`, (err, resizeImage) => {
                    if (err) {
                        console.log(err);
                        resolve({status: false, msg: err, err: err});
                    }

                    console.log(resizeImage);
                });

                //set 64//
                let imgRatio64 = await imageRatio(oriPath, parseInt(64));
//            console.log('width64:', width)
//            console.log('height64:', height)
//            console.log('imgRatio64:', imgRatio64)
                sharp(oriPath).resize(64, imgRatio64.newHeight).toFile(`${__dirname}/../public/images/thumbnails64_${file.filename}`, (err, resizeImage) => {
                    if (err) {
                        console.log(err);
                        resolve({status: false, msg: err, err: err});
                    }

                    console.log(resizeImage);
                })
            }
            resolve({status: true});
        } catch (e) {
            resolve({status: false, msg: e, err: e});
        }
    });
};

exports.ratioImages = imageRatio;

function imageRatio(path, preSet = 32) {
    return new Promise(async (resolve, reject) => {
        var {data, width, height} = await pixels(path);
        let newWidth = parseInt(preSet);
        let newHeight = parseInt((parseInt(height) / parseInt(width)) * preSet);
        let response = {
            width: width,
            height: height,
            newWidth: newWidth,
            newHeight: newHeight
        }
        return resolve(response);
    });
}