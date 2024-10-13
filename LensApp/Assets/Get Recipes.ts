@component
export class GetRecipes extends BaseScriptComponent {
  @input remoteServiceModule: RemoteServiceModule;
  @input
  myText: Text

    onAwake() {
        this.sudoWebSocket();
    }
    async sudoWebSocket() {
        await this.checkForRecipes();

        //// Wait 1 second before sending the next request
        //await this.wait(1000);
    }
    async checkForRecipes() {
        let httpRequest = RemoteServiceHttpRequest.create();
        httpRequest.method = RemoteServiceHttpRequest.HttpRequestMethod.Get;
        httpRequest.url = "https://api.savorsnap.one/spectaclesSync";
        httpRequest.setHeader("accept", "application/json");

        await this.remoteServiceModule.performHttpRequest(httpRequest, (response) => {
        if (response.statusCode == 200) {
            print("Success! Body: " + response.body);
            this.myText.text = response.body;
        } else {
            print(
            "Error code:" + response.statusCode + "\n Body: " + response.body
            );
        }
        });
    }

    // Custom wait function
    //wait(ms: number): Promise<void> {
    //    return new Promise(resolve => setTimeout(resolve, ms));
    //}  
} 