export interface Device {
  name: string;

  temperatureValue: number;

  humidityValue: number;

  location: string;

  isActive: boolean;

  date: Date;

  userId: string;

  topic: string;
}
