# ISS Horizon Explorer

## 1. High-Level Project Summary

ISS Horizon Explorer is an immersive 3D web application that simulates the ISS experience, allowing users to explore Earth from space and participate in authentic NASA missions.

1. What We Developed:
A 3D web application with two modes:
- Explore Mode: Interactive Earth exploration with historical event discovery
- Mission Mode: ISS mission simulation with photography challenges

2. How It Addresses the Challenge
- Cupola Experience: Simulates the "window to the world" view from the ISS cupola, allowing users to observe Earth from space and understand how astronaut photography benefits humanity
- Weightlessness Simulation: Provides authentic zero-gravity physics experience similar to NBL training, helping users understand the sensory experience of microgravity
- Earth Observation Education: Uses real NASA imagery to demonstrate how ISS observations support disaster relief, climate monitoring, and scientific research that benefits people on Earth
- Interactive Learning: Gamifies the cupola photography experience through mission-based challenges that teach users about Earth science and space exploration

3. Why It's Important
- Inspires Future Scientists: Engaging introduction to space science
- Supports STEM Education: Powerful tool for teaching Earth science
- Promotes Scientific Literacy: Helps public understand space-based Earth observation

## 2. Detailed Project Description

1. What Exactly Does It Do:
ISS Horizon Explorer provides users with two distinct experiences:

Explore Mode:
- Interactive 3D Earth Model: Users can rotate, zoom, and explore a photorealistic Earth model from space
- Historical Timeline: Browse Earth's appearance and significant events from 2001-2015
- Event Discovery: Click on interactive pins to learn about major Earth events captured by ISS astronauts
- Rich Information: Each event includes authentic NASA imagery, scientific explanations, and educational highlights

Mission Mode:
- Cupola Experience: Simulates the "window to the world" - the seven-windowed dome module where astronauts observe Earth
- Astronaut Photography Missions: Complete real photography challenges that demonstrate how ISS observations benefit humanity

2. How Does It Work:
The application uses web technologies to create an immersive 3D experience:
- 3D Rendering Engine: Three.js with React Three Fiber provides high-performance 3D graphics
- Physics Simulation: Custom zero-gravity physics system simulates floating objects in space
- Data Integration: Real NASA imagery and scientific data are seamlessly integrated into the 3D environment
- Interactive Systems: Event detection, mission tracking, and user interface systems work together to create engaging experiences

3. What Benefits Does It Have:
- Educational Value: Provides authentic, NASA-verified content for learning about Earth and space
- Accessibility: Runs on any modern web browser without requiring specialized hardware
- Engagement: Combines entertainment with education to maintain user interest
- Scalability: Can be easily expanded with additional missions, events, and features

4. What Do We Hope to Achieve:
Our goals align with the challenge objectives:
- Educational Impact: Help students and the public understand the cupola and NBL experiences through interactive simulation
- Humanitarian Awareness: Demonstrate how ISS observations directly benefit people on Earth through disaster relief, climate monitoring, and scientific research
- Accessibility: Make the unique sensory experiences of space accessible to anyone with a web browser
- STEM Engagement: Inspire future scientists and engineers by making space exploration tangible and engaging

5. Tools and Technologies Used:
Frontend Technologies:
- Language: TypeScript
- Framework: React, React Three Fiber, React Three Drei
- UI Framework: Tailwind CSS

Development Tools:
- Vite: Fast build tool and development server
- ESLint: Code linting and quality assurance
- Node.js: JavaScript runtime environment

## 3. NASA Data

1. Data Sources Used:
- Earth Texture Map: https://visibleearth.nasa.gov/collection/1484/blue-marble
- ISS 3D Model: https://solarsystem.nasa.gov/gltf_embed/2378/
- NASA Image Assets: https://images-assets.nasa.gov
  - Authentic ISS photographs from various expeditions (ISS006 through ISS043)
  - High-resolution imagery of Earth events from 2001-2015
  - Scientific documentation accompanying each image
- NASA Earth Observatory: https://eol.jsc.nasa.gov
  - Crew Earth Observations (CEO) database
   - High-resolution imagery from ISS missions
   - Scientific analysis and event documentation

2. How We Used NASA Data:

In Explore Mode:
- Earth Texture Map: It is used to texture the Earth model. It allows us to see the Earth's surface and oceans, and provide correct event locations through their coordinates.
- ISS 3D Model: It is used to simulate the ISS. It allows us to see the ISS architecture.
- Event Documentation: Each Earth event includes authentic NASA imagery with scientific context

In Mission Mode:
- Humanitarian Impact: Each mission demonstrates how ISS observations support disaster response, climate monitoring, and scientific research that benefits people on Earth

3. Specific NASA Events Used:

- Saharan Dust Storm (2001): Documenting atmospheric transport phenomena
- Peruvian Arid Coast (2003): Geological and climate studies
- Rio Grande River System (2003): Water resource management studies
- Galveston Island (2006): Coastal geography and historical documentation
- São Simão Reservoir (2007): The 300,000th ISS Earth image milestone
- Calabria Sunglint (2009): Oceanographic phenomena study
- San Francisco Bay (2010): Urban geography and coastal engineering
- Annular Eclipse Shadow (2012): Celestial event observation
- Ice Floes Breakup (2013): Climate change monitoring
- Okinawa Reefs (2014): Marine ecosystem studies
- Dubai Artificial Islands (2015): Human impact on coastal environments
- Urban Night Photography (2020): Chicago metropolitan area study of urban growth, light pollution, and energy consumption
- Wildfire Disaster Monitoring (2020): NASA astronaut Don Pettit's real-time capture of Los Angeles fires from ISS - supporting firefighting and air quality management  
- Aurora Observation (2022): Aurora Australis study over Southern Ocean - research on solar wind and Earth's magnetic field interaction


---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/iss-horizon-explorer.git

# Navigate to the project directory
cd iss-horizon-explorer

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Building for Production
```bash
npm run build
npm run preview
```

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- NASA for providing the incredible imagery and scientific data that makes this project possible
- The International Space Station crew for their ongoing Earth observation work
- The Three.js and React communities for the amazing 3D web technologies
- All the educators and students who inspire us to make space science accessible