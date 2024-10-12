const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

const { gemini_api_key } = require('../config.json');

const genAI = new GoogleGenerativeAI(gemini_api_key);

const recipesSchema = {
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
const recipeModel = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-002",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: recipesSchema,
    },
  });

const getRecipies = async (imageUri) => {
    try {
        const result = await recipeModel.generateContent([
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
    getRecipies,
};
