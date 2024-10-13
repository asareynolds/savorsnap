import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';

//import { Text } from 'SnapLensStudio/Components/UI/Text/Text';

@component
export class TimerScript extends BaseScriptComponent {
@input
toggleButton: PinchButton;

@input
deleteButton: PinchButton;

@input
timerText: Text;

@input
playImage: Image;

@input
stopImage: Image;


  // Timer properties
  private startTime: number = 100;
  private elapsedTime: number = 0;
  private timerInterval: number | null = null;
  private isRunning: boolean = false;

  // UI elements
//  private toggleButton: ToggleButton | null = null;

  onAwake() {
    this.timerText.text = "Hello World!";
    this.playImage.enabled = true;
    this.stopImage.enabled = false;
    // Get references to UI elements
//    this.toggleButton = this.sceneObject.
//    .getChildByName('ToggleButton').getComponent(ToggleButton);
//    this.deleteButton = this.sceneObject.getChildByName('DeleteButton').getComponent(PinchButton);
//    this.timerText = this.sceneObject.getChildByName('TimerText').getComponent(Text);

    // Bind button events
  //   this.toggleButton.onStateChanged.add((state) => {
  //     if (state) {
  //       this.startTimer();
  //     } else {
  //       this.pauseTimer();
  //     }
  //   });
  //   this.deleteButton.onButtonPinched.add(() => this.deleteTimer());
  // }

  // startTimer() {
  //   if (!this.isRunning) {
  //     this.startTime = Date.now() - this.elapsedTime;
  //     this.timerInterval = setInterval(() => this.updateTimer(), 10); // Update every 10ms
  //     this.isRunning = true;
  //   }
  // }

  // pauseTimer() {
  //   if (this.isRunning) {
  //     clearInterval(this.timerInterval!);
  //     this.elapsedTime = Date.now() - this.startTime;
  //     this.isRunning = false;
  //   }
  // }

  // deleteTimer() {
  //   clearInterval(this.timerInterval!);
  //   this.startTime = 0;
  //   this.elapsedTime = 0;
  //   this.isRunning = false;
  //   this.updateTimer(); // Reset the display
  //   this.toggleButton!.state = false; // Reset toggle button state
  // }
  }

  updateTimer() {
    if (this.isRunning) {
      this.elapsedTime = Date.now() - this.startTime;
    }

    const timeInSeconds = this.elapsedTime / 1000;
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds * 1000) % 1000);

    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    this.timerText.text = formattedTime;
  }
}