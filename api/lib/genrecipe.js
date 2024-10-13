const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

const { gemini_api_key } = require('../config.json');

const genAI = new GoogleGenerativeAI(gemini_api_key);

const recipesSchema = {
    description: "Following the specified JSON format, create 10 different recipes that use some or all of the provided ingredients.  For each recipe, list the necessary ingredients, list any allergy considerations (briefly, listing single allergic items like 'gluten' or 'dairy'). List the cuisine type as well, and estimate a prep time. List a visual description to caption an image of the food. Finally, list all of the detailed instructions necessary to make the item, broken down by step. Each step in the array must have a string of instructions. Optionally, if the step requires a timer add a time_minutes integer to the step. The steps should be detailed, 6-10 steps is normal. When listing ingredients, always list exact measurements.",
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
                    visual_description_caption: {
                        type: "string"
                    },          
                    instruction_steps: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                step: {
                                    type: "string"
                                },
                                timer_seconds: {
                                    type: "integer"
                                },  
                            },
                            required: [
                                "step"
                            ]
                        }
                    }
                },
                required: [
                    "name",
                    "ingredients",
                    "allergies",
                    "cuisine_type",
                    "prep_time_minutes",
                    "instruction_steps",
                    "visual_description_caption"
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
            `Following the specified JSON format, create 10 different recipes that use some or all of the provided ingredients.  For each recipe, list the necessary ingredients, list any allergy considerations (briefly, listing single allergic items like 'gluten' or 'dairy'). List the cuisine type as well, and estimate a prep time. List a visual description to caption an image of the food. Finally, list all of the detailed instructions necessary to make the item, broken down by step. Each step in the array must have a string of instructions. Optionally, if the step requires a timer add a time_minutes integer to the step. The steps should be detailed, 6-10 steps is normal. When listing ingredients, always list exact measurements. Ingredients are: ${ingredients.join(", ")}`,
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
