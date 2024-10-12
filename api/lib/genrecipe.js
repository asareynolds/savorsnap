const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

const { gemini_api_key } = require('../config.json');

const genAI = new GoogleGenerativeAI(gemini_api_key);

const recipesSchema = {
    description: "Following the specified JSON format, create 20 recipes that use some or all of the provided ingredients.  For each recipe, list the necessary ingredients, list any allergy considerations (briefly, listing single allergic items like 'gluten' or 'dairy'). List the cuisine type as well, and estimate a prep time. Finally, list all of the instructions necessary to make the item, broken down by step.",
    type: "object",
    properties: {
        recipes: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: {
                        type: "string"
                    },
                    ingredients: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    },
                    allergies: {
                        type: "string"
                    },
                    cuisine_type: {
                        type: "string"
                    },
                    prep_time_minutes: {
                        type: "integer"
                    },
                    instruction_steps: {
                        type: "array",
                        items: {
                            type: "string"
                        }
                    }
                },
                required: [
                    "name",
                    "ingredients",
                    "allergies",
                    "cuisine_type",
                    "prep_time_minutes",
                    "instruction_steps"
                ]
            }
        }
    }
};
const recipeModel = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-002",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: recipesSchema,
    },
  });

const getRecipies = async (ingredients) => {
    try {
        const result = await recipeModel.generateContent([
            `Following the specified JSON format, create 20 recipes that use some or all of the provided ingredients.  For each recipe, list the necessary ingredients, list any allergy considerations (briefly, listing single allergic items like 'gluten' or 'dairy'). List the cuisine type as well, and estimate a prep time. Finally, list all of the instructions necessary to make the item, broken down by step. Here is a set of ingredients, generate 20 varied and delicious recipes. Ingredients are: ${ingredients.join(", ")}`,
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
