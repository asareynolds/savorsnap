import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';

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

  @input
  parentObject: SceneObject;

  // Timer properties
  private startTime: number = 10 * 1000; // 10 seconds in milliseconds (configurable)
  private elapsedTime: number = 0;
  private isRunning: boolean = false;
  protected mainUpdateEvent: SceneEvent;

  onAwake() {
    this.timerText.text = "Start Countdown";
    this.playImage.enabled = true;
    this.stopImage.enabled = false;

    this.mainUpdateEvent = this.createEvent('UpdateEvent');
    this.mainUpdateEvent.bind(() => {
      this.onUpdate();
    });
  }

  onUpdate() {
    this.updateTimer();
  }

  startTimer() {
    print("Starting Timer");
    this.stopImage.enabled = true;
    this.playImage.enabled = false;

    this.isRunning = true;
    this.startTime = Date.now(); // Start the timer now
  }

  deleteTimer() {
    this.parentObject.destroy();
  }

  updateTimer() {
    if (!this.isRunning) {
      return;
    }

    const elapsed = Date.now() - this.startTime;
    const remainingTime = Math.max(0, 10 * 1000 - elapsed); // Calculate remaining time in milliseconds

    this.timerText.text = this.formatTime(remainingTime / 1000);

    if (remainingTime <= 0) {
      this.isRunning = false;
      this.stopImage.enabled = false;
      this.playImage.enabled = true;
      print("Timer finished");
    }
  }

  formatTime(timeInSeconds: number): string {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds * 1000) % 1000);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }
}
