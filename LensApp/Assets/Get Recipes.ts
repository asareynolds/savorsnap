import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";

declare global {
    var recipeData: any;
    var stepNumber: any;
}

@component
export class GetRecipes extends BaseScriptComponent {
    @input remoteServiceModule: RemoteServiceModule;
    @input remoteMediaModule: RemoteMediaModule;

    @input statusText: Text;
    @input initiateButton: PinchButton;

    @input initiateContainer: SceneObject;
    @input recipe: SceneObject;
    @input stepsCont: SceneObject;

    @input recipeTitle: Text;
    @input recipeIngedients: Text;
    @input recipeTime: Text;
    @input recipeImage: Image;
    @input recipeImageMat: Material;
    @input stepsStartButton: PinchButton;

    @input stepNum: Text;
    @input instruction: Text;
    @input prevButton: PinchButton;
    @input nextButton: PinchButton;

    @input homeButton: PinchButton;

    onAwake() {
        this.createEvent('OnStartEvent').bind(() => {
          this.initiateButtonEvent();
          //this.stepsButtonEvent();
        });
        this.initiateContainer.enabled = true;
        this.recipe.enabled = false;
        this.stepsCont.enabled = false;

        globalThis.recipeData = null;
        globalThis.stepNumber = 1;
    }
    
    async checkForRecipes() {
        let httpRequest = RemoteServiceHttpRequest.create();
        httpRequest.method = RemoteServiceHttpRequest.HttpRequestMethod.Get;
        httpRequest.url = "https://eyecookapi.tgm.one/spectaclesSync";
        httpRequest.setHeader("accept", "application/json");

        return new Promise((resolve, reject) => {
            this.remoteServiceModule.performHttpRequest(httpRequest, (response) => {
                if (response.statusCode == 200) {
                    resolve(JSON.parse(response.body));
                } else {
                    print(
                        "Error code:" + response.statusCode + "\n Body: " + response.body
                    );
                    reject(new Error(`HTTP Error: ${response.statusCode}`));
                }
            });
        });
    }
    async genRecipeImage(description) {
        let httpRequest = RemoteServiceHttpRequest.create();
        httpRequest.method = RemoteServiceHttpRequest.HttpRequestMethod.Post;
        httpRequest.url = "https://eyecookapi.tgm.one/genImage";
        httpRequest.setHeader("accept", "application/json");
        httpRequest.body = JSON.stringify({description: description});

        return new Promise((resolve, reject) => {
            this.remoteServiceModule.performHttpRequest(httpRequest, (response) => {
                if (response.statusCode == 200) {
                    resolve(JSON.parse(response.body));
                } else {
                    print(
                        "Error code:" + response.statusCode + "\n Body: " + response.body
                    );
                    reject(new Error(`HTTP Error: ${response.statusCode}`));
                }
            });
        });
    }

    async initiateButtonEvent() {
        let onButtonPinchedCallback = async () => {        
            this.statusText.text = "Loading latest recipe...";
            try {
                const recipe = await this.checkForRecipes();
                //const imageDesc = recipe.data.recipe[0].visual_description_caption;

                this.buildRecipe(recipe,"https://cafedelites.com/wp-content/uploads/2018/08/Garlic-Butter-Basted-Steak-RECIPE-IMAGE-1.jpg");
            } catch (error) {
                print("Error fetching recipe: " + error.message);
                this.statusText.text = "Failed to load recipe. Please try again.";
            }
        };
    
        this.initiateButton.onButtonPinched.add(onButtonPinchedCallback);
    } 

    buildRecipe(recipe,imageURL){
        print(JSON.stringify(recipe));

        globalThis.recipeData = recipe;
        this.recipe.enabled = true;
        this.initiateContainer.enabled = false;

        this.recipeTitle.text = recipe.data.recipe[0].name;
        this.recipeIngedients.text = "Ingredients:\n"+recipe.data.recipe[0].ingredients.join('\n');
        this.recipeTime.text = JSON.stringify(recipe.data.recipe[0].prep_time_minutes) + " minutes";
        
        this.stepsButtonEvent();

        this.remoteMediaModule.loadResourceAsImageTexture(imageURL,  (texture) => {
            this.recipeImageMat.mainPass.baseTex = texture;
        }, (errorMessage) => {print(errorMessage)});
    }

    stepsButtonEvent() {
        let onButtonPinchedCallback = () => {      
            this.stepsCont.enabled = true;  
            this.recipe.enabled = false;

            globalThis.stepNumber = 1;
            this.stepBuilder();

            this.nextStepEvent();
            this.prevStepEvent();
            this.homeEvent();
        };
    
        this.stepsStartButton.onButtonPinched.add(onButtonPinchedCallback);
    } 

    nextStepEvent() {
        let onButtonPinchedCallback = () => { 
            globalThis.stepNumber+=1;
            this.stepBuilder();
        };
    
        this.nextButton.onButtonPinched.add(onButtonPinchedCallback);
    }
    prevStepEvent() {
        let onButtonPinchedCallback = () => {  
            globalThis.stepNumber-=1;
            this.stepBuilder();
        };
    
        this.prevButton.onButtonPinched.add(onButtonPinchedCallback);
    }

    stepBuilder() {
        this.stepNum.text = "Step " + globalThis.stepNumber;
        this.instruction.text = globalThis.recipeData.data.recipe[0].instruction_steps[globalThis.stepNumber-1].step;

        if (globalThis.stepNumber == 1) {
            this.prevButton.enabled = false;
        }
        else {
            this.prevButton.enabled = true;
        }
        if (globalThis.stepNumber == globalThis.recipeData.data.recipe[0].instruction_steps.length) {
            this.nextButton.enabled = false;
        }
        else {
            this.nextButton.enabled = true;
        }
    }

    homeEvent() {
        let onButtonPinchedCallback = () => {  
            this.recipe.enabled = false;
            this.stepsCont.enabled = false;
            this.initiateContainer.enabled = true;

            globalThis.recipeData = null;
            globalThis.stepNumber = 1;
            
            this.onAwake();
        };
    
        this.homeButton.onButtonPinched.add(onButtonPinchedCallback);
    }
} 