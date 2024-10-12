const express = require('express')
var bodyParser = require('body-parser')
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const foodId = require('./foodid.js');

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());
app.listen(80, () => {
    console.log('Accepting requests on port 80');
});
app.set('trust proxy', true)

/*
    POST /imageUpload
*/
app.post('/imageUpload', async(req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const { image } = req.body;
        if (!image) {
            throw new Error('No image data provided');
        }

        console.log('Received image data length:', image.length);

        const imagePath = path.join('./images', `${Date.now()}.png`);

        const imageBuffer = Buffer.from(image, 'base64');

        // Use Sharp to identify the image type and convert to PNG
        const imageInfo = await sharp(imageBuffer).metadata();
        console.log('Image type:', imageInfo.format);

        await sharp(imageBuffer)
            .png()
            .toFile(imagePath);

        const uploadResult = await foodId.uploadImage(imagePath);
        const result = await foodId.getIngredients(uploadResult);

        console.log('Gemini Ingredient Result:', result);

        res.json({
            result: "success",
            data: result
        });
    } catch (error) {
        console.error("Error in /imageUpload route:", error);
        res.status(500).json({
            result: "error",
            message: error.message
        });
    }
});

app.get('/', async(req, res) => {
    res.setHeader('Content-Type', 'application/json');

    console.log("Received request from:", req.ip);

    res.json({
        result: "success"
    });
});