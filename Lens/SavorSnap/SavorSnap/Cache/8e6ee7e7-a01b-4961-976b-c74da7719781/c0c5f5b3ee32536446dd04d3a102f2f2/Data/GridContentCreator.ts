// GridContentCreator.ts 
import { SceneObject, ObjectPrefab, Texture } from 'LensStudio';
// GridContentCreator.ts 
import { SceneObject, ObjectPrefab, Texture } from 'LensStudio'; // These will be treated as 'any'
// ... rest of your code ...import * as network from 'LensStudio:Network';
import * as rmm from 'LensStudio:RemoteMediaModule';
// Make sure to use the correct import based on whether SIK is packed or unpacked:
// import { SpectaclesInteractionKitRoot } from 'SpectaclesInteractionKit' // For unpacked
import { SpectaclesInteractionKitRoot } from 'SpectaclesInteractionKit.lspkg'; // For packed 

interface Recipe {
  name: string;
  imageUrl: string;
}

@component
export class GridContentCreator extends BaseScriptComponent {

  @input
  itemPrefab: ObjectPrefab;
  @input
  remoteServiceModule: network.RemoteServiceModule;
  @input
  remoteMediaModule: rmm.RemoteMediaModule;
  @input
  spectaclesInteractionKitRoot: SpectaclesInteractionKitRoot; // Add SIK Root input

  // 20 Recipe Objects
  recipes: Recipe[] = [
    // ... (same recipe data as before) ... 
  ];

  onAwake() {
    if (!this.itemPrefab) {
      throw new Error('ItemPrefab is not wired in SceneObject: ' + this.getSceneObject().name);
    }

    // Get grid layout from SIK Root 
    const gridLayout = this.spectaclesInteractionKitRoot.grid;
    if (!gridLayout) {
      throw new Error('Grid Layout not found in SpectaclesInteractionKitRoot');
    }

    for (let i = 0; i < this.recipes.length; i++) {
      const item = this.itemPrefab.instantiate(this.getSceneObject());
      gridLayout.addItem(item); // Add item to grid layout

      const recipe = this.recipes[i];

      const nameText = item.getComponent("Component.Text");
      if (nameText) {
        nameText.text = recipe.name;
      }

      const image = item.getComponent("Component.Image");
      if (image && recipe.imageUrl) {
        this.loadImageFromURL(image, recipe.imageUrl);
      }

      item.enabled = true;
    }
  }

  loadImageFromURL(imageComponent: SceneObject, url: string) {
    const resource = this.remoteServiceModule.makeResourceFromUrl(url);

    this.remoteMediaModule.loadResourceAsImageTexture(resource, 
      (texture: Texture) => {
        imageComponent.mainPass.baseTex = texture;
      },
      (errorMessage: string) => {
        print(`Error loading image: ${errorMessage}`);
      }
    );
  }
}