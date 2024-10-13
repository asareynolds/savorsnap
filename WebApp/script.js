const imageUpload = document.getElementById('imageUpload');
const snapButton = document.getElementById('snapButton');
const recipeResults = document.getElementById('recipeResults');
const recipeList = document.getElementById('recipeList');
const recipeDetails = document.getElementById('recipeDetails');
const recipeName = document.getElementById('recipeName');
const recipeImage = document.getElementById('recipeImage');
const cookingTime = document.getElementById('cookingTime');
const instructions = document.getElementById('instructions');
const backButton = document.getElementById('backButton');

// Example Recipe Data (replace with API data later)
const recipes = [
  { 
    name: "Spaghetti Carbonara", 
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Espaguetis_carbonara.jpg/800px-Espaguetis_carbonara.jpg",
    cookingTime: "30 minutes",
    instructions: [
      "Cook spaghetti according to package directions.",
      "Fry pancetta until crispy.",
      "Whisk eggs, cheese, and pepper.",
      "Toss spaghetti with pancetta and egg mixture."
    ]
  },
  { 
    name: "Chicken Tikka Masala", 
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Chicken_Tikka_Masala_%28cropped%29.jpg/800px-Chicken_Tikka_Masala_%28cropped%29.jpg",
    cookingTime: "45 minutes",
    instructions: [
      "Marinate chicken in yogurt and spices.",
      "Grill or bake chicken until cooked through.",
      "Prepare tikka masala sauce.",
      "Combine chicken and sauce, simmer for a few minutes.",
      "Serve with rice or naan."
    ]
  },
  { 
    name: "Vegan Chili", 
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Vegan_Chili.jpg/800px-Vegan_Chili.jpg",
    cookingTime: "1 hour",
    instructions: [
      "Sauté onions, garlic, and peppers.",
      "Add beans, tomatoes, and spices.",
      "Simmer for at least 30 minutes.",
      "Serve with toppings like avocado, cilantro, and vegan sour cream."
    ]
  },
  // ... Add 17 more recipes here ... 
];

snapButton.addEventListener('click', () => {
  // 1. Image Recognition (placeholder - replace with real image recognition)
  // Note:  For Spectacles, you'll use the Spectacles APIs for image recognition.
  //        This placeholder simulates the recognition result.
  const recognizedFood = "Spaghetti"; // Example - replace with actual recognition result

  // 2. Filter and Display Recipes 
  const matchedRecipes = recipes.filter(recipe => recipe.name.includes(recognizedFood)); 
  displayRecipes(matchedRecipes);
});

function displayRecipes(recipes) {
  recipeList.innerHTML = ''; // Clear previous results
  recipeResults.style.display = 'block'; 

  recipes.forEach(recipe => {
    const listItem = document.createElement('li');
    listItem.textContent = recipe.name;
    listItem.addEventListener('click', () => {
      displayRecipeDetails(recipe);
    });
    recipeList.appendChild(listItem);
  });
}

function displayRecipeDetails(recipe) {
  recipeName.textContent = recipe.name;
  recipeImage.src = recipe.imageUrl;
  cookingTime.textContent = `Cooking Time: ${recipe.cookingTime}`;

  instructions.innerHTML = '';
  recipe.instructions.forEach(step => {
    const listItem = document.createElement('li');
    listItem.textContent = step;
    instructions.appendChild(listItem);
  });

  recipeDetails.style.display = 'block'; 
  recipeResults.style.display = 'none'; // Hide the recipe list 
}

// Back button functionality
backButton.addEventListener('click', () => {
  recipeDetails.style.display = 'none';
  recipeResults.style.display = 'block';
});