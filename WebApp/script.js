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
let capturedImageBase64 = null;

async function takePicture() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    document.body.appendChild(video);
    video.srcObject = stream;
    await video.play();

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    capturedImageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

    document.body.removeChild(video);
    stream.getTracks().forEach(track => track.stop());

    return capturedImageBase64;
  } catch (error) {
    console.error("Error accessing camera:", error);
    alert("Unable to access camera. Please check your browser permissions.");
  }
}

snapButton.addEventListener('click', async () => {
  const base64Image = await takePicture();
  if (base64Image) {
    callImageUploadAPI(base64Image);
  }
});

function callImageUploadAPI(base64Image) {
  const apiUrl = "https://api.savorsnap.one/imageUpload";

  fetch(apiUrl, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({image: base64Image})
  })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const ingredients = data.ingredients;
        callRecipeAPI(ingredients);
      })
      .catch(error => {
        console.error("Error uploading image or processing response:", error);
        alert("An error occurred. Please try again later.");
      });
}

function callRecipeAPI(ingredients) {
  const apiUrl = "https://api.savorsnap.one/genRecipe";

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
  recipeList.innerHTML = '';
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
  recipeImage.src = recipe.imageUrl; // Assuming the API provides an image URL
  cookingTime.textContent = `Cooking Time: ${recipe.prep_time_minutes} minutes`;

  instructions.innerHTML = '';
  recipe.instruction_steps.forEach(step => {
    const listItem = document.createElement('li');
    listItem.textContent = step;
    instructions.appendChild(listItem);
  });

  recipeDetails.style.display = 'block';
  recipeResults.style.display = 'none';
}

backButton.addEventListener('click', () => {
  recipeDetails.style.display = 'none';
  recipeResults.style.display = 'block';
}); 