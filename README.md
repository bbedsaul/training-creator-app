# Training Mind Map App

A React Native app for organizing training courses using interactive mind maps. Built with Expo and featuring hierarchical course management with visual mind mapping capabilities.

## 🎯 Features

### 📚 Training Course Management
- **Course List View**: Main dashboard showing all training courses
- **Course Cards**: Display course details, difficulty, duration, and progress
- **Smart Creation**: Intelligent object creation following course hierarchy

### 🗺️ Interactive Mind Maps
- **Visual Course Structure**: Course → Modules → Stickies → Tasks hierarchy
- **Drag & Drop**: Move nodes around the canvas to organize content
- **Pan & Zoom**: Navigate large course structures with gesture controls
- **Connection Lines**: Visual lines showing parent-child relationships

### 🎨 Modern UI/UX
- **iOS Design Language**: Follows Apple's Human Interface Guidelines
- **Smooth Animations**: Built with React Native Reanimated v3
- **Responsive Design**: Optimized for mobile devices
- **Custom Modals**: Native-feeling selection and creation interfaces

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Bun package manager
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/training-mindmap-app.git
cd training-mindmap-app
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run start
```

4. Run on iOS/Android:
```bash
# iOS
bun run ios

# Android
bun run android
```

## 📱 App Structure

### Main Screens
- **CourseListScreen**: Training course dashboard (home screen)
- **MindMapScreen**: Interactive mind map for individual courses
- **CourseDetailScreen**: Detailed course information
- **ModuleDetailScreen**: Module-specific content
- **StickyDetailScreen**: Sticky note details

### Core Components
- **MindMapCanvas**: Interactive canvas with pan/zoom/drag capabilities
- **DraggableNode**: Individual draggable course elements
- **ConnectionLines**: Visual connections between related nodes

## 🏗️ Technical Architecture

### State Management
- **Zustand**: Lightweight state management with persistence
- **AsyncStorage**: Local data persistence
- **Hierarchical Data**: Courses → Modules → Stickies → Tasks

### Navigation
- **React Navigation v6**: Native stack navigation
- **Type-safe Routes**: TypeScript route parameter definitions
- **Modal Presentations**: Native modal sheets

### Gestures & Animations
- **React Native Gesture Handler v2**: Modern gesture system
- **React Native Reanimated v3**: Smooth 60fps animations
- **Pan Gestures**: Canvas navigation and node dragging
- **Pinch Gestures**: Zoom in/out functionality

### UI Framework
- **NativeWind**: Tailwind CSS for React Native
- **Expo Vector Icons**: Consistent iconography
- **React Native SVG**: Vector graphics for connection lines

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── MindMapCanvas.tsx
│   ├── DraggableNode.tsx
│   └── ConnectionLines.tsx
├── screens/            # Main app screens
│   ├── CourseListScreen.tsx
│   ├── MindMapScreen.tsx
│   └── ...
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── state/             # State management
│   └── courseStore.ts
├── types/             # TypeScript definitions
│   └── index.ts
├── utils/             # Utility functions
└── api/              # API integrations
```

## 🎯 Key Features Explained

### Smart Creation System
The app intelligently determines what type of content to create next:
1. **Course First**: Creates courses when none exist
2. **Module Next**: Creates modules for courses without them
3. **Sticky Next**: Creates stickies for modules without them
4. **Task Last**: Creates tasks for stickies without them

### Mind Map Navigation
- **Long Press**: Create new content at cursor position
- **+ Button**: Smart creation of next logical content type
- **Drag Nodes**: Reorganize content visually
- **Pan Canvas**: Navigate around large mind maps
- **Pinch Zoom**: Zoom in/out for detail work

### Data Flow
1. **Course List**: Browse all training courses
2. **Select Course**: Choose "Mind Map" to edit structure
3. **Visual Editing**: Use gestures to organize content
4. **Hierarchical Creation**: Build complete course structures
5. **Back to List**: Return to course overview

## 🔧 Development

### Available Scripts
- `bun run start`: Start Expo development server
- `bun run ios`: Run on iOS simulator
- `bun run android`: Run on Android emulator
- `bun run web`: Run in web browser
- `bun run test`: Run test suite

### Environment Variables
The project includes pre-configured API keys for:
- OpenAI API
- Anthropic API
- Grok API
- Google API
- ElevenLabs API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- UI inspired by Apple's Human Interface Guidelines
- Icons from [Expo Vector Icons](https://icons.expo.fyi/)
- Animations powered by [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)