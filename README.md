# Unified Work Order Management App

A modern Angular application for managing work orders, built with Angular Material design system.

## Features

- **Modern UI Design**: Clean, responsive interface based on Material Design
- **Dark/Light Theme Support**: User-selectable themes that persist across sessions
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Modular Architecture**: Well-organized component structure
- **Standalone Components**: Using Angular's standalone components for better modularity

## Architecture

The application follows a feature-based architecture:

```
src/
├── app/
│   ├── auth/                 # Authentication features
│   ├── core/                 # Core functionality and services
│   ├── features/             # Major application features
│   │   └── dashboards/       # Dashboard components and features
│   ├── shared/               # Shared components, services, and models
│   └── app.component.ts      # Root component
```

## Tech Stack

- Angular 17+
- Angular Material
- RxJS
- TypeScript
- SCSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   ng serve
   ```
4. Navigate to `http://localhost:4200/`

## Design Guidelines

- **Color Palette**: The application uses a primary color palette based on teal (#0f3531) and accent color of orange (#cf6329)
- **Typography**: Roboto is used as the primary font
- **Spacing**: Consistent 8px spacing system
- **Elevation**: Material design elevation system for shadows and depth

## Best Practices

- Responsive design with mobile-first approach
- Proper component encapsulation
- Performance optimization
- Accessibility support
- Consistent error handling

## License

MIT
