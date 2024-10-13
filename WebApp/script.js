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

async function callImageGenerationAPI(description) {
  const apiUrl = "https://api.eyecook.one/genImage";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ description: description })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Return the image URL 

  } catch (error) {
    console.error("Error generating image:", error);
    // Handle the error appropriately, e.g., show an error message to the user
    return null; 
  }
}

function displayRecipes(recipes) {
  recipeList.innerHTML = '';
  recipeResults.style.display = 'block';
  loadingScreen.style.display = 'none';

  recipes.forEach((recipe, index) => { // Include index
    const listItem = document.createElement('li');
    listItem.classList.add('recipe-item');
    listItem.id = `recipe-${index}`; // Add a unique ID to each recipe card

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

    listItem.addEventListener('click', async () => { // Make click handler async
      const imageContainer = listItem.querySelector('.image-container');

      // Only generate and display the image if it hasn't been loaded yet
      if (!imageContainer) { 
        await displayRecipeDetails(recipe, listItem); // Pass listItem
      }
    });

    recipeList.appendChild(listItem);
  });
}

async function displayRecipeDetails(recipe, listItem) {
  recipeDetails.innerHTML = ''; // Start fresh for each recipe

  // --- Recipe Name ---
  const recipeNameElement = document.createElement('h3');
  recipeNameElement.textContent = recipe.name;
  recipeDetails.appendChild(recipeNameElement);

  // --- Cooking Time ---
  const cookingTimeElement = document.createElement('p');
  cookingTimeElement.textContent = `Cooking Time: ${recipe.prep_time_minutes} minutes`;
  recipeDetails.appendChild(cookingTimeElement);

  // --- Allergies (conditional) ---
  if (recipe.allergies) {
    const allergiesElement = document.createElement('p');
    allergiesElement.textContent = `Allergies: ${recipe.allergies}`;
    recipeDetails.appendChild(allergiesElement);
  }

  // --- Cuisine ---
  const cuisineElement = document.createElement('p');
  cuisineElement.textContent = `Cuisine: ${recipe.cuisine_type}`;
  recipeDetails.appendChild(cuisineElement);

  // --- Instructions Header ---
  const instructionsHeader = document.createElement('h4');
  instructionsHeader.textContent = "Instructions:";
  recipeDetails.appendChild(instructionsHeader);

  // --- Instructions List ---
  const instructionsList = document.createElement('ol'); 
  recipe.instruction_steps.forEach(step => {
    const instructionItem = document.createElement('li');
    // ... (Your existing logic to handle step.step and step.timer_seconds) ...
    instructionsList.appendChild(instructionItem);
  });
  recipeDetails.appendChild(instructionsList); 
// Image Display Section:

   // 1. Create elements 
   const imageContainer = document.createElement('div');
   imageContainer.classList.add('image-container');
 
   const recipeImage = document.createElement('img');
   recipeImage.alt = recipe.name; // Set alt text for accessibility
   recipeImage.classList.add('recipe-image');
   recipeImage.loading = "lazy"; // Lazy load the image 
 
   const loader = document.createElement('div');
   loader.classList.add('loader');
   loader.style.display = 'block'; // Show the loader initially
 
   // 2. Build the image container
   imageContainer.appendChild(recipeImage);
   imageContainer.appendChild(loader);
 
   // 3. Add the image container to the recipe card
   listItem.insertBefore(imageContainer, listItem.firstChild);
 
   // 4. Fetch and display the image
   try {
     const imageUrl = await callImageGenerationAPI(recipe.visual_description_caption);
 
     if (imageUrl) { 
       // Image URL successfully fetched:
       recipeImage.src = imageUrl; 
 
       // Image Load Event: Hide loader, show image
       recipeImage.addEventListener('load', () => {
         loader.style.display = 'none';
         recipeImage.style.display = 'block';
       });
 
       // Image Error Event: Hide loader, display message
       recipeImage.addEventListener('error', () => {
         loader.style.display = 'none';
         imageContainer.textContent = 'Image not available'; 
       });
 
     } else {
       // Handle cases where API doesn't return a valid URL
       loader.style.display = 'none';
       imageContainer.textContent = 'Image not available'; 
     }
 
   } catch (error) {
     // Handle any errors during the API call
     console.error("Error generating/loading image:", error);
     loader.style.display = 'none'; 
     imageContainer.textContent = 'Image not available'; 
   }

  recipeDetails.style.display = 'block';
  recipeResults.style.display = 'none';
}

backButton.addEventListener('click', () => {
  recipeDetails.style.display = 'none';
  recipeResults.style.display = 'block';
}); 