const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const router = express.Router();
const Product = require('../app/models/Product');

router.get('/', (req, res, next) => {
    Product.find({})
        .then(products => {
            products = products.map((product) => product.toObject())
            res.render('dashboard', { products })
        })
        .catch(next);
});

const s3 = new AWS.S3({
    accessKeyId: "AKIAY5VNT4DYXOJGHWSW",
    secretAccessKey: "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"
});

const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '')
    }
});

const upload = multer({ storage }).single('image');

router.post('/upload', upload, (req, res) => {
    const product = new Product();
    product.name = req.body.name;
    product.price = req.body.price;
    const params = {
        Bucket: "clould-shop",
        Key: ''+Date.now(),
        Body: req.file.buffer
    }

    s3.upload(params, (error, data) => {
        if(error){
            res.status(500).send(error)
        }
        product.image = data.Location;
        product.save();

        res.redirect('/');
    })

});

router.delete('/delete/:id/:key', (req, res, next) => {
    const params = {
        Bucket: 'clould-shop',
        Key: ""+req.params.key,
    };
    s3.deleteObject(params, function (err, data) {
        return;
    });

    Product.deleteOne({_id: req.params.id})
        .then(()=> res.redirect('/'))
        .catch(next);
});

module.exports = router;