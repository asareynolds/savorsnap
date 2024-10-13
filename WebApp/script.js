const snapButton = document.getElementById('snapButton');
const video = document.getElementById('video');
const recipeResults = document.getElementById('recipeResults');
const recipeList = document.getElementById('recipeList');
const recipeDetails = document.getElementById('recipeDetails');
const recipeName = document.getElementById('recipeName');
const cookingTime = document.getElementById('cookingTime');
const instructions = document.getElementById('instructions');
const backButton = document.getElementById('backButton');
const loadingScreen = document.getElementById('loadingScreen');
const ingredientsList = document.getElementById('ingredientsList');
const allergiesInfo = document.getElementById('allergies');
const cuisineInfo = document.getElementById('cuisine');

let capturedImageBase64 = null;

// Get camera access and display the feed
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    console.error("Error accessing camera:", err);
    alert("Unable to access camera. Please check your browser permissions.");
  });

async function takePicture() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    capturedImageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

    return capturedImageBase64;
  } catch (error) {
    console.error("Error taking picture:", error);
    alert("Unable to capture image.");
  }
}


// async function takePicture() {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     const video = document.createElement('video');
//     document.body.appendChild(video);
//     video.srcObject = stream;
//     await video.play();

//     const canvas = document.createElement('canvas');
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     canvas.getContext('2d').drawImage(video, 0, 0);
//     capturedImageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

//     document.body.removeChild(video);
//     stream.getTracks().forEach(track => track.stop());

//     return capturedImageBase64;
//   } catch (error) {
//     console.error("Error accessing camera:", error);
//     alert("Unable to access camera. Please check your browser permissions.");
//   }
// }

snapButton.addEventListener('click', async () => {
  loadingScreen.style.display = 'flex';

  const base64Image = await takePicture();
  if (base64Image) {
    callImageUploadAPI(base64Image);
  } else {
    loadingScreen.style.display = 'none';
  }
});

function callImageUploadAPI(base64Image) {
  const apiUrl = "https://api.eyecook.one/imageUpload";

  fetch(apiUrl, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image: base64Image })
  })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const ingredients = data.data.ingredients;
        console.log("Ingredients received from /imageUpload:", ingredients);
        callRecipeAPI(ingredients);
      })
      .catch(error => {
        console.error("Error uploading image or processing response:", error);
        alert("An error occurred. Please try again later.");
      });
}

function callRecipeAPI(ingredients) {
  const apiUrl = "https://api.eyecook.one/genRecipe";

  console.log("Ingredients being sent:", ingredients);
  fetch(apiUrl, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ingredients: ingredients })
  })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.result === "success" && data.data.recipes.length > 0) {
          displayRecipes(data.data.recipes);
        } else {
          alert("No recipes found for those ingredients.");
        }
      })
      .catch(error => {
        console.error("Error fetching recipes:", error);
        alert("An error occurred. Please try again later.");
      });
}

function displayRecipes(recipes) {
  recipeList.innerHTML = ''; // Clear previous results
  recipeResults.style.display = 'block';
  loadingScreen.style.display = 'none';

  recipes.forEach(recipe => {
    // Create a list item container for each recipe
    const listItem = document.createElement('li');
    listItem.classList.add('recipe-item'); // Add a class for styling

    listItem.innerHTML = `
  <h3 class="recipe-name">${recipe.name}</h3>
  <div class="recipe-info">
    <div class="info-top">
      <span class="prep-time">Prep: ${recipe.prep_time_minutes} min</span>
      <span class="cuisine">Cuisine: ${recipe.cuisine_type}</span>
    </div>
    ${recipe.allergies ? `<span class="allergies">Allergies: ${recipe.allergies}</span>` : ''}
  </div>
`;

    // Add an event listener to show details when a recipe is clicked
    listItem.addEventListener('click', () => {
      displayRecipeDetails(recipe);
    });

    recipeList.appendChild(listItem);
  });
}

function displayRecipeDetails(recipe) {
  recipeName.textContent = recipe.name;
  cookingTime.textContent = `Cooking Time: ${recipe.prep_time_minutes} minutes`;
  allergiesInfo.textContent = ""; // Clear previous content
  if (recipe.allergies) { 
    allergiesInfo.textContent = `Allergies: ${recipe.allergies}`; 
  }
  cuisineInfo.textContent = `Cuisine: ${recipe.cuisine_type}`;

  // Display ingredients
  ingredientsList.innerHTML = '';
  recipe.ingredients.forEach(ingredient => {
    const ingredientItem = document.createElement('li');
    ingredientItem.textContent = ingredient;
    ingredientsList.appendChild(ingredientItem);
  });

  // Display instructions with optional timers
  instructions.innerHTML = '';
  recipe.instruction_steps.forEach(step => {
    const listItem = document.createElement('li');

    // Check if the step has a timer
    if (step.timer_seconds) {
      const minutes = Math.floor(step.timer_seconds / 60);
      const seconds = step.timer_seconds % 60;
      listItem.textContent = `${step.step} (Timer: ${minutes}m ${seconds}s)`;
    } else {
      listItem.textContent = step.step; 
    }

    instructions.appendChild(listItem);
  });

  recipeDetails.style.display = 'block';
  recipeResults.style.display = 'none';
}

backButton.addEventListener('click', () => {
  recipeDetails.style.display = 'none';
  recipeResults.style.display = 'block';
}); 