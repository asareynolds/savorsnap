const express = require('express')
var bodyParser = require('body-parser')
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const foodId = require('./foodid.js');
const genRecipes = require('./genrecipe.js');
const genImage = require('./genimage.js');

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

        // Parse the result string into an array
        const ingredientsArray = JSON.parse(result.replace(/'/g, '"'));

        // Convert the array to a JSON object
        const ingredientsJson = {
            ingredients: ingredientsArray
        };

        res.json({
            result: "success",
            data: ingredientsJson
        });
    } catch (error) {
        console.error("Error in /imageUpload route:", error);
        res.status(500).json({
            result: "error",
            message: error.message
        });
    }
});
app.post('/genRecipe', async(req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        console.log(req.body)
        const { ingredients } = req.body;
        if (!ingredients) {
            throw new Error('No ingredients provided');
        }

        console.log('Received ingredients:', ingredients);

        const result = await genRecipes.getRecipies(ingredients);

        console.log('Gemini Recipe Result:', result);

        // Parse the result string into an array
        const recipesJson = JSON.parse(result.replace(/'/g, '"'));

        res.json({
            result: "success",
            data: recipesJson
        });
    } catch (error) {
        console.error("Error in /genRecipe route:", error);
        res.status(500).json({
            result: "error",
            message: error.message
        });
    }
});
app.post('/genImage', async(req, res) => {
    res.setHeader('Content-Type', 'application/json');

    try {
        const { description } = req.body;
        if (!description) {
            throw new Error('No description provided');
        }

        console.log('Received description:', description);

        const result = await genImage.getImage(description);

        console.log('Image Result:', result);

        res.json({
            result: "success",
            data: result
        });
    } catch (error) {
        console.error("Error in /genImage route:", error);
        res.status(500).json({
            result: "error",
            message: error.message
        });
    }
});

app.get('/spectaclesSync', async(req, res) => {
    res.setHeader('Content-Type', 'application/json');

    console.log("Received request from:", req.ip);

    const filePath = path.join(__dirname, '..', 'sampleRecResponse', 'spectacles_sync.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const output = JSON.parse(data);

    res.json(output);
});
app.get('/', async(req, res) => {
    res.setHeader('Content-Type', 'application/json');

    console.log("Received request from:", req.ip);

    res.json({
        result: "success"
    });
});
