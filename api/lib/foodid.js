const { GoogleAIFileManager } = require("@google/generative-ai/server");
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

const { gemini_api_key } = require('../config.json');

const genAI = new GoogleGenerativeAI(gemini_api_key);
const fileManager = new GoogleAIFileManager(gemini_api_key);

const ingredientsSchema = {
    description: "List of identified ingredients, don't be too specific, e.g. 'tomato' instead of 'cherry tomato' or any brand names.",
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.STRING,
      /*properties: {
        recipeName: {
          type: SchemaType.STRING,
          description: "Name of the recipe",
          nullable: false,
        },
      },*/
      //required: ["recipeName"],
    },
};
const foodIdmodel = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-002",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: ingredientsSchema,
    },
  });

const uploadImage = async (imagePath) => {
    try {
        const uploadResult = await fileManager.uploadFile(
            imagePath,
            {
                mimeType: "image/png",
                displayName: `Food ID ${Date.now()}`,
            },
        );
        // View the response.
        console.log(
            `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`,
        );
        return uploadResult.file.uri;
    } catch (error) {
        console.error("Error in uploadImage:", error.message);
        throw error; // Re-throw the error to be caught by the caller
    }
}
const getIngredients = async (imageUri) => {
    try {
        const result = await foodIdmodel.generateContent([
            "List of identified ingredients in this image, don't be too specific, e.g. 'tomato' instead of 'cherry tomato' or any brand names.",
            {
                fileData: {
                    fileUri: imageUri,
                    mimeType: "image/png",
                },
            },
        ]);
        return result.response.text();
    } catch (error) {
        console.error("Error in getIngredients:", error.message);
        throw error; // Re-throw the error to be caught by the caller
    }
}

module.exports = {
    uploadImage,
    getIngredients,
};
