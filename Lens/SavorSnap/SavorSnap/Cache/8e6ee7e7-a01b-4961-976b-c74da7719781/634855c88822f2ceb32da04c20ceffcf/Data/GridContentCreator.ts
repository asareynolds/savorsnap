import { SceneObject, ObjectPrefab } from 'LensStudio';

interface Recipe {
  name: string;
  // imageUrl: string;  // Comment out the image URL for now 
}

@component
export class GridContentCreator extends BaseScriptComponent {

  @input
  itemPrefab: ObjectPrefab;
  @input
  itemsCount: number = 10; 

  // Define your list of recipes here (20 recipes)
  recipes: Recipe[] = [
    { name: "Spaghetti Carbonara" }, // imageUrl: "https://example.com/carbonara.jpg" },
    { name: "Chicken Tikka Masala" }, // imageUrl: "https://example.com/tikka.jpg" },
    { name: "Vegan Chili" }, //imageUrl: "https://example.com/chili.jpg" },
    { name: "Margherita Pizza" }, //imageUrl: "https://example.com/pizza.jpg" },
    { name: "Pad Thai" }, //imageUrl: "https://example.com/padthai.jpg" },
    { name: "Tacos al Pastor" }, //imageUrl: "https://example.com/tacos.jpg" },
    { name: "Sushi Rolls" }, //imageUrl: "https://example.com/sushi.jpg" },
    { name: "Cheeseburger" }, //imageUrl: "https://example.com/cheeseburger.jpg" },
    { name: "Fish and Chips" }, //imageUrl: "https://example.com/fishandchips.jpg" },
    { name: "Grilled Salmon" }, //imageUrl: "https://example.com/salmon.jpg" },
    { name: "Caesar Salad" }, //imageUrl: "https://example.com/caesar.jpg" },
    { name: "Chocolate Cake" }, //imageUrl: "https://example.com/cake.jpg" },
    { name: "Apple Pie" }, //imageUrl: "https://example.com/applepie.jpg" },
    { name: "Pancakes" }, //imageUrl: "https://example.com/pancakes.jpg" },
    { name: "French Toast" }, //imageUrl: "https://example.com/frenchtoast.jpg" },
    { name: "Smoothie" }, //imageUrl: "https://example.com/smoothie.jpg" },
    { name: "Mac and Cheese" }, //imageUrl: "https://example.com/macandcheese.jpg" },
    { name: "Chicken Alfredo" }, //imageUrl: "https://example.com/alfredo.jpg" },
    { name: "Beef Stir-Fry" }, //imageUrl: "https://example.com/stirfry.jpg" },
    { name: "Lasagna" } //imageUrl: "https://example.com/lasagna.jpg" }
  ];

  onAwake() {
    if (!this.itemPrefab) {
      throw new Error('ItemPrefab is not wired in SceneObject:' + 
                      this.getSceneObject().name);
    }

    const yStart = 0;
    const yOffset = -5.4;

    // Use the length of the recipes array to determine how many items to create
    for (let i = 0; i < this.recipes.length; i++) {
      const item = this.itemPrefab.instantiate(this.getSceneObject());
      const screenTransform = item.getComponent('Component.ScreenTransform');
      screenTransform.offsets.setCenter(new vec2(0, yStart + yOffset * i));

      // Access the recipe data for this item
      const recipe = this.recipes[i]; 

      // Assuming your prefab has a Text component and an Image component
      const nameText = item.getComponent("Component.Text");
      if (nameText) {
        nameText.text = recipe.name; 
      }

      const image = item.getComponent("Component.Image");
      if (image) {
        // You'll need to implement a way to load images from URLs
        // See previous examples using RemoteServiceModule and RemoteMediaModule
        // loadImageFromURL(image, recipe.imageUrl); 
      }

      item.enabled = true;
    }
  }
}