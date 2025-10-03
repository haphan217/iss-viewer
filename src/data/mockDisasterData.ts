export interface DisasterEvent {
  id: string;
  name: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  timestamp: string;
  status: "active" | "resolved" | "monitoring";
}

export const mockDisasterEvents: DisasterEvent[] = [
  {
    id: "1",
    name: "Hurricane Maria",
    type: "Hurricane",
    severity: "critical",
    coordinates: {
      latitude: 18.2208,
      longitude: -66.5901,
    },
    description: "Category 5 hurricane affecting Puerto Rico",
    timestamp: "2023-09-20T10:00:00Z",
    status: "active",
  },
  {
    id: "2",
    name: "Wildfire California",
    type: "Wildfire",
    severity: "high",
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    description: "Large wildfire spreading in Northern California",
    timestamp: "2023-09-18T14:30:00Z",
    status: "active",
  },
  {
    id: "3",
    name: "Flooding Bangladesh",
    type: "Flood",
    severity: "high",
    coordinates: {
      latitude: 23.6850,
      longitude: 90.3563,
    },
    description: "Severe flooding affecting millions of people",
    timestamp: "2023-09-15T08:15:00Z",
    status: "monitoring",
  },
  {
    id: "4",
    name: "Earthquake Turkey",
    type: "Earthquake",
    severity: "critical",
    coordinates: {
      latitude: 37.0662,
      longitude: 37.3833,
    },
    description: "7.8 magnitude earthquake in southeastern Turkey",
    timestamp: "2023-09-12T04:17:00Z",
    status: "active",
  },
  {
    id: "5",
    name: "Drought Australia",
    type: "Drought",
    severity: "medium",
    coordinates: {
      latitude: -25.2744,
      longitude: 133.7751,
    },
    description: "Prolonged drought affecting agricultural regions",
    timestamp: "2023-09-10T12:00:00Z",
    status: "monitoring",
  },
];