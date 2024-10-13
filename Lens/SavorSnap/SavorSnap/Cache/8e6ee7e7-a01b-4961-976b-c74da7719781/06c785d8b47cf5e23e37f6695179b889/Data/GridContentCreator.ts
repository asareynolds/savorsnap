// GridContentCreator.js
//@input Component.ObjectPrefab itemPrefab
//@input Asset.RemoteServiceModule remoteServiceModule
//@input Asset.RemoteMediaModule remoteMediaModule

// 20 Recipe Objects
const recipes = [
  { name: "Spaghetti Carbonara", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Espaguetis_carbonara.jpg/800px-Espaguetis_carbonara.jpg" },
  { name: "Chicken Tikka Masala", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Chicken_Tikka_Masala_%28cropped%29.jpg/800px-Chicken_Tikka_Masala_%28cropped%29.jpg" },
  { name: "Vegan Chili", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Vegan_Chili.jpg/800px-Vegan_Chili.jpg" },
  { name: "Margherita Pizza", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Pizza_Margherita_stu_spivack.jpg/800px-Pizza_Margherita_stu_spivack.jpg" },
  { name: "Pad Thai", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Pad_thai.jpg/800px-Pad_thai.jpg" },
  { name: "Tacos al Pastor", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Tacos_al_pastor.jpg/800px-Tacos_al_pastor.jpg" },
  { name: "Sushi Rolls", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Various_sushi_rolls.jpg/800px-Various_sushi_rolls.jpg" },
  { name: "Cheeseburger", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/NCI_Visuals_Food_Hamburger.jpg/800px-NCI_Visuals_Food_Hamburger.jpg" },
  { name: "Fish and Chips", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Fish_and_chips_02.jpg/800px-Fish_and_chips_02.jpg" },
  { name: "Grilled Salmon", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/GrilledSalmon.jpg/800px-GrilledSalmon.jpg" },
  { name: "Caesar Salad", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Caesar_salad_1.jpg/800px-Caesar_salad_1.jpg" },
  { name: "Chocolate Cake", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Sachertorte.jpg/800px-Sachertorte.jpg" },
  { name: "Apple Pie", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Apple_pie.jpg/800px-Apple_pie.jpg" },
  { name: "Pancakes", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Pancakes_with_butter_and_syrup.jpg/800px-Pancakes_with_butter_and_syrup.jpg" },
  { name: "French Toast", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/French_toast_with_butter_and_maple_syrup.jpg/800px-French_toast_with_butter_and_maple_syrup.jpg" },
  { name: "Smoothie", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/BlueberrySmoothie.jpg/800px-BlueberrySmoothie.jpg" },
  { name: "Mac and Cheese", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Macaroni_and_cheese_in_a_blue_bowl.jpg/800px-Macaroni_and_cheese_in_a_blue_bowl.jpg" },
  { name: "Chicken Alfredo", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Fettuccine_Alfredo.jpg/800px-Fettuccine_Alfredo.jpg" },
  { name: "Beef Stir-Fry", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Beef_chow_fun.jpg/800px-Beef_chow_fun.jpg" },
  { name: "Lasagna", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Lasagna_-_stonesoup.jpg/800px-Lasagna_-_stonesoup.jpg" }
];

function onAwake() {
  if (!script.itemPrefab) {
    throw new Error('ItemPrefab is not wired in SceneObject: ' + script.getSceneObject().name);
  }

  const yStart = 0;
  const yOffset = -5.4;

  for (let i = 0; i < recipes.length; i++) {
    const item = script.itemPrefab.instantiate(script.getSceneObject());
    const screenTransform = item.getComponent('Component.ScreenTransform');
    screenTransform.offsets.setCenter(new vec2(0, yStart + yOffset * i));

    const recipe = recipes[i];

    const nameText = item.getComponent("Component.Text");
    if (nameText) {
      nameText.text = recipe.name;
    }

    // Image loading using Remote Media Module
    const image = item.getComponent("Component.Image");
    if (image && recipe.imageUrl) {
      loadImageFromURL(image, recipe.imageUrl);
    }

    item.enabled = true;
  }
}

// Image Loading Function 
function loadImageFromURL(imageComponent, url) {
  const resource = script.remoteServiceModule.makeResourceFromUrl(url);

  script.remoteMediaModule.loadResourceAsImageTexture(resource,
    (texture) => {
      // Set the texture to the Image component
      imageComponent.mainPass.baseTex = texture;
    },
    (errorMessage) => {
      print(`Error loading image: ${errorMessage}`);
    }
  );
}

script.createEvent("OnAwakeEvent").bind(onAwake);