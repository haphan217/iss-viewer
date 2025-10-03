export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DisasterEvent {
  id: string;
  title: string;
  description: string;
  coordinates: Coordinates;
  severity: "low" | "medium" | "high" | "critical";
  type: "earthquake" | "flood" | "wildfire" | "hurricane" | "volcano";
  timestamp: string;
}

export const mockDisasterData: DisasterEvent[] = [
  {
    id: "1",
    title: "California Wildfire",
    description: "Major wildfire affecting northern California",
    coordinates: { latitude: 38.5, longitude: -122.5 },
    severity: "high",
    type: "wildfire",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    title: "Japan Earthquake",
    description: "7.2 magnitude earthquake in central Japan",
    coordinates: { latitude: 35.7, longitude: 139.7 },
    severity: "critical",
    type: "earthquake",
    timestamp: "2024-01-14T15:45:00Z",
  },
  {
    id: "3",
    title: "Amazon Flooding",
    description: "Severe flooding in the Amazon basin",
    coordinates: { latitude: -3.1, longitude: -60.0 },
    severity: "medium",
    type: "flood",
    timestamp: "2024-01-13T08:20:00Z",
  },
];