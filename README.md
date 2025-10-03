# ISS Disaster Monitoring System

A 3D visualization system that combines a tunnel-shaped ISS module with a spherical cupola, allowing users to traverse between them using realistic zero-gravity physics.

## Features

### Dual Movement Modes

1. **Orbital Mode (Arrow Keys)**
   - Arrow Keys: Orbit around Earth
   - Mouse Wheel: Zoom in/out
   - TAB: Switch to First-Person mode

2. **First-Person Mode (WASD+QE)**
   - WASD: Move forward/back/left/right
   - QE: Move up/down
   - Mouse: Look around (click and drag)
   - TAB: Switch to Orbital mode

### Physics System

- **Zero-Gravity Simulation**: Acceleration-based movement with drag factor (0.985)
- **Boundary Collision**: Bouncing back when hitting walls with energy loss
- **Smooth Movement**: Realistic physics with momentum and deceleration

### 3D Models

- **Tunnel Module**: Long cylindrical module (18 units deep) with structural details
- **Cupola Sphere**: Spherical observation module with windows
- **Unified ISS**: Seamless connection between tunnel and sphere
- **Earth Model**: Interactive Earth with mission target markers

## Installation

```bash
npm install
npm run dev
```

## Controls

### Orbital View
- **Arrow Keys**: Orbit around Earth
- **Mouse Wheel**: Zoom in/out
- **TAB**: Switch to First-Person mode

### First-Person View
- **WASD**: Move forward/back/left/right
- **QE**: Move up/down
- **Mouse**: Look around (click and drag)
- **TAB**: Switch to Orbital mode

## Mission System

- Select missions from the right panel
- Camera automatically transitions to mission locations
- Click on Earth to interact with active missions
- Real-time disaster monitoring visualization

## Technical Details

- Built with React Three Fiber
- TypeScript for type safety
- Three.js for 3D graphics
- Physics-based movement system
- Modular component architecture

## Architecture

- `UnifiedISSModel`: Combines tunnel and cupola
- `PhysicsController`: Handles zero-gravity movement
- `TunnelModel`: Detailed tunnel geometry
- `CupolaModel`: Spherical observation module
- `EarthModel`: Interactive Earth with mission markers
- `ISSView`: Main scene management