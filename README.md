# ISS Horizon Explorer

## 1. High-Level Project Summary

ISS Horizon Explorer is an immersive 3D web application that makes space education accessible to everyone. Users can explore Earth from space and participate in real NASA missions that help people on Earth.

1. What We Developed:
A 3D web application with two main features:
- Explore Mode: Interactive Earth exploration with real NASA events through its 25-year history from 2001-2025
- Mission Mode: ISS mission simulation with photography challenges where user can try to capture real-life events on Earth from ISS

2. How It Addresses the Challenge
- Cupola Experience: Simulates the "window to the world" view from the ISS cupola, showing how astronauts observe Earth and help with disaster relief
- Weightlessness Simulation: Provides zero-gravity physics experience similar to NBL training, making spacewalk preparation accessible to everyone
- Earth Observation Education: Uses real NASA imagery to show how ISS observations help with disaster response, climate monitoring, and scientific research
- Interactive Learning: Turns cupola photography into fun mission challenges that teach Earth science concepts

3. Why It's Important
- Global Impact: Inspires future scientists and engineers by making space experiences accessible to everyone
- Educational Value: Makes space science easy to understand for students of all ages
- Scientific Literacy: Shows how space technology helps people on Earth
- Innovation: Creates new ways to teach space science and technology

## 2. Detailed Project Description

1. What Exactly Does It Do:
ISS Horizon Explorer provides two main experiences:

Explore Mode:
- Interactive 3D Earth Model: Users can rotate and explore Earth from space, just like astronauts see it
- Historical Timeline: Access to 15+ years of real NASA Earth observations (2001-2015) with scientific explanations
- Event Discovery: Click on Earth to learn about major events captured by ISS astronauts with real scientific data
- Real Information: Each event includes genuine NASA imagery, scientific explanations, and educational highlights

Mission Mode:
- Cupola Experience: Simulates the "window to the world" - the seven-windowed dome module where astronauts observe Earth
- Weightlessness Simulation: Provides zero-gravity physics experience similar to NBL training, making spacewalk preparation accessible to everyone
- Photography Missions: Complete real photography challenges that show how space observations help people on Earth

2. How Does It Work:
The application uses modern web technologies to create an immersive 3D space experience:
- 3D Rendering Engine: Three.js with React Three Fiber provides high-performance 3D graphics
- Physics Simulation: Custom zero-gravity physics system that simulates microgravity conditions
- NASA Data Integration: Real NASA imagery and scientific data are integrated into the 3D environment
- Interactive Systems: Event detection, mission tracking, and user interface systems work together to create engaging experiences

3. What Benefits Does It Have:
- Educational Value: Provides authentic, NASA-verified content for learning about Earth and space
- Accessibility: Runs on any modern web browser without requiring special hardware
- Engagement: Combines entertainment with education to maintain user interest
- Scalability: Can be easily expanded with additional missions, events, and features

4. What Do We Hope to Achieve:
Our goals align with the challenge objectives:
- Educational Impact: Help students and the public understand the cupola and NBL experiences through interactive simulation
- Humanitarian Awareness: Show how ISS observations help people on Earth through disaster relief, climate monitoring, and scientific research
- Accessibility: Make space experiences accessible to anyone with a web browser
- STEM Engagement: Inspire future scientists and engineers by making space exploration engaging and meaningful

5. Tools and Technologies Used:
Frontend Technologies:
- Language: TypeScript for type safety and maintainability
- Framework: React 19, React Three Fiber, React Three Drei for 3D web development
- UI Framework: Tailwind CSS for responsive design

Development Tools:
- Vite: Fast build tool and development server
- ESLint: Code linting and quality assurance
- Node.js: JavaScript runtime environment

## 3. NASA Data

1. Data Sources Used:
- Earth Texture Map: https://visibleearth.nasa.gov/collection/1484/blue-marble
- ISS 3D Model: https://solarsystem.nasa.gov/gltf_embed/2378/
- NASA Image Assets: https://images-assets.nasa.gov
- NASA Earth Observatory: https://eol.jsc.nasa.gov

2. How We Used NASA Data:

In Explore Mode:
- Earth Texture Map: Real NASA Blue Marble imagery creates the Earth model, showing users the exact view astronauts see from space
- ISS 3D Model: Official NASA 3D model provides accurate simulation of ISS architecture
- Event Documentation: Each Earth event includes real NASA imagery with scientific context

In Mission Mode:
- Humanitarian Impact: Each mission shows how ISS observations support disaster response, climate monitoring, and scientific research that helps people on Earth

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