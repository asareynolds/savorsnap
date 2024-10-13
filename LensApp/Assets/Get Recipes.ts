import { ContainerFrame } from "SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame";
import { PinchButton } from "SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton";

@component
export class GetRecipes extends BaseScriptComponent {
    @input remoteServiceModule: RemoteServiceModule;
    @input statusText: Text;
    @input initiateButton: PinchButton;

    @input initiateContainer: ContainerFrame;
    @input recipe: ContainerFrame;

    onAwake() {
        this.createEvent('OnStartEvent').bind(() => {
          this.initiateButtonEvent();
        });
        this.initiateContainer.enabled = true;
        //this.recipe. = false;
    }
    
    async checkForRecipes() {
        let httpRequest = RemoteServiceHttpRequest.create();
        httpRequest.method = RemoteServiceHttpRequest.HttpRequestMethod.Get;
        httpRequest.url = "https://api.eyecook.one/spectaclesSync";
        httpRequest.setHeader("accept", "application/json");

        await this.remoteServiceModule.performHttpRequest(httpRequest, (response) => {
            if (response.statusCode == 200) {
                print("Success! Body: " + response.body);
                return response.body;
            } else {
                print(
                    "Error code:" + response.statusCode + "\n Body: " + response.body
                );
            }
        });
    }

    async initiateButtonEvent() {
        let onButtonPinchedCallback = async () =>{        
            this.statusText.text = "Loading latest recipe...";
            const recipe = await this.checkForRecipes();
            print(recipe);
        };
    
        this.initiateButton.onButtonPinched.add(onButtonPinchedCallback);
    } 

    buildRecipe(recipe) {

    }
} 