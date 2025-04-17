# AR Navigation Feature

## Overview

The AR Navigation feature in the Disaster Alert System provides real-time guidance to help users navigate away from danger zones. It uses the device's camera, motion sensors, and geolocation to create an augmented reality experience that overlays directional guidance on your surroundings.

## Features

- **Real-time AR Guidance**: See directional arrows overlaid on your camera view
- **Waypoint Navigation**: Follow a series of waypoints to reach safety
- **Mobile Browser Compatible**: Works directly in your mobile browser without additional apps
- **Offline Support**: Basic functionality works even with limited connectivity
- **Progress Tracking**: Shows evacuation progress and distance to safety

## How It Works

1. **Camera Access**: The system uses your phone's camera to show your surroundings
2. **Motion Sensors**: Device orientation sensors detect which way you're facing
3. **AR Overlay**: Directional arrows and waypoints are drawn over the camera feed
4. **Location Tracking**: Your position is tracked to update navigation guidance

## Requirements

- **Mobile Device**: Smartphone or tablet with camera
- **Modern Browser**: Recent version of Chrome, Safari, or Firefox
- **Device Sensors**: Accelerometer and compass/gyroscope
- **Permissions**: Camera and location permissions must be granted

## Using the AR Navigator

1. From the dashboard, tap "Open Mobile AR Navigator"
2. Read the instructions and tap "Start AR Navigation"
3. Grant camera and sensor permissions when prompted
4. Hold your phone upright like you're taking a photo
5. Follow the red directional arrow to navigate between waypoints
6. Continue until you reach a safe area

## Troubleshooting

- **Camera Not Working**: Ensure camera permissions are granted in browser settings
- **No Direction Arrow**: Make sure motion/orientation permissions are enabled
- **Inaccurate Direction**: Try calibrating by waving your phone in a figure-8 motion
- **App Not Loading**: Try using a different browser if available

## Browser Compatibility

| Browser          | Compatibility | Notes                                       |
| ---------------- | ------------- | ------------------------------------------- |
| Chrome (Android) | Excellent     | Full support for all features               |
| Safari (iOS 13+) | Good          | Requires permission for orientation sensors |
| Firefox (Mobile) | Good          | May have reduced performance                |
| Other Browsers   | Limited       | Basic functionality only                    |

## Technical Implementation Details

The AR Navigator uses the following browser APIs:

- **MediaDevices API**: For camera access (`getUserMedia`)
- **DeviceOrientation API**: For compass heading
- **Canvas API**: For drawing AR elements over video
- **Geolocation API**: For position tracking

The system calculates bearing and distance between waypoints using the Haversine formula and renders directional guidance in real-time using an animation frame loop.

## Fallback Mode

If your device doesn't support full AR capabilities, the system will automatically fall back to a simplified navigation mode that provides basic directional guidance without camera view.
