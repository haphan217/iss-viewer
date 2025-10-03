// Mock data for historical disaster events
// TODO: Replace with real NASA data and API integration

export interface DisasterEvent {
  id: string;
  name: string;
  type: "wildfire" | "hurricane" | "flood" | "earthquake" | "volcano";
  coordinates: {
    latitude: number;
    longitude: number;
  };
  date: string;
  description: string;
  impact: string;
  nasaImageUrl: string;
  nasaImageDescription: string;
  humanitarianBenefit: string;
  orbitPosition: {
    altitude: number; // km
    inclination: number; // degrees
  };
}

export const disasterEvents: DisasterEvent[] = [
  {
    id: "wildfire-california-2020",
    name: "California Wildfires 2020",
    type: "wildfire",
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    date: "2020-08-15",
    description:
      "Massive wildfire outbreak across California, affecting millions of acres",
    impact:
      "Over 4 million acres burned, 33 fatalities, $10+ billion in damages",
    nasaImageUrl:
      "https://eoimages.gsfc.nasa.gov/images/imagerecords/147000/147004/california_fires_2020.jpg",
    nasaImageDescription:
      "NASA satellite imagery showing smoke plumes from California wildfires visible from space",
    humanitarianBenefit:
      "Real-time fire monitoring enabled rapid evacuation planning, saving thousands of lives. Satellite data helped firefighters identify fire fronts and wind patterns, optimizing resource deployment.",
    orbitPosition: {
      altitude: 408,
      inclination: 51.6,
    },
  },
  {
    id: "hurricane-ida-2021",
    name: "Hurricane Ida 2021",
    type: "hurricane",
    coordinates: {
      latitude: 29.9511,
      longitude: -90.0715,
    },
    date: "2021-08-29",
    description: "Category 4 hurricane making landfall in Louisiana",
    impact: "Category 4 strength, 96 fatalities, $75+ billion in damages",
    nasaImageUrl:
      "https://eoimages.gsfc.nasa.gov/images/imagerecords/148000/148001/hurricane_ida_2021.jpg",
    nasaImageDescription:
      "Hurricane Ida as seen from the International Space Station, showing the massive storm system",
    humanitarianBenefit:
      "ISS observations provided critical storm tracking data, enabling accurate landfall predictions 3 days in advance. This allowed for proper evacuation of 1.2 million people from the storm path.",
    orbitPosition: {
      altitude: 408,
      inclination: 51.6,
    },
  },
  {
    id: "flood-pakistan-2022",
    name: "Pakistan Floods 2022",
    type: "flood",
    coordinates: {
      latitude: 30.3753,
      longitude: 69.3451,
    },
    date: "2022-08-01",
    description: "Catastrophic flooding affecting one-third of Pakistan",
    impact:
      "33 million people affected, 1,700+ fatalities, $30+ billion in damages",
    nasaImageUrl:
      "https://eoimages.gsfc.nasa.gov/images/imagerecords/150000/150001/pakistan_floods_2022.jpg",
    nasaImageDescription:
      "Before and after satellite imagery showing the extent of flooding in Pakistan",
    humanitarianBenefit:
      "ISS imagery helped coordinate international relief efforts by identifying the most severely affected areas. Satellite data enabled efficient distribution of aid to 2.3 million displaced people.",
    orbitPosition: {
      altitude: 408,
      inclination: 51.6,
    },
  },
  {
    id: "earthquake-turkey-2023",
    name: "Turkey-Syria Earthquake 2023",
    type: "earthquake",
    coordinates: {
      latitude: 37.0662,
      longitude: 37.3833,
    },
    date: "2023-02-06",
    description: "7.8 magnitude earthquake affecting Turkey and Syria",
    impact: "59,000+ fatalities, 120,000+ injured, $100+ billion in damages",
    nasaImageUrl:
      "https://eoimages.gsfc.nasa.gov/images/imagerecords/151000/151001/turkey_earthquake_2023.jpg",
    nasaImageDescription:
      "Satellite imagery showing ground displacement and damage assessment from the Turkey-Syria earthquake",
    humanitarianBenefit:
      "Rapid damage assessment from ISS imagery helped prioritize rescue operations in the critical first 72 hours. Satellite data identified 1,200+ collapsed buildings and guided emergency response teams.",
    orbitPosition: {
      altitude: 408,
      inclination: 51.6,
    },
  },
  {
    id: "volcano-tonga-2022",
    name: "Hunga Tonga-Hunga Ha'apai Eruption 2022",
    type: "volcano",
    coordinates: {
      latitude: -20.536,
      longitude: -175.382,
    },
    date: "2022-01-15",
    description: "Massive underwater volcanic eruption in Tonga",
    impact:
      "Largest volcanic eruption in 30 years, tsunami waves, ash cloud affecting global climate",
    nasaImageUrl:
      "https://eoimages.gsfc.nasa.gov/images/imagerecords/149000/149001/tonga_volcano_2022.jpg",
    nasaImageDescription:
      "The massive volcanic eruption as captured from the International Space Station",
    humanitarianBenefit:
      "ISS observations provided early warning of the tsunami threat, enabling evacuations across the Pacific. Satellite monitoring helped track the ash cloud's global impact on aviation and climate.",
    orbitPosition: {
      altitude: 408,
      inclination: 51.6,
    },
  },
];

// Helper function to get mission by ID
export const getMissionById = (id: string): DisasterEvent | undefined => {
  return disasterEvents.find((event) => event.id === id);
};

// Helper function to get missions by type
export const getMissionsByType = (
  type: DisasterEvent["type"]
): DisasterEvent[] => {
  return disasterEvents.filter((event) => event.type === type);
};
