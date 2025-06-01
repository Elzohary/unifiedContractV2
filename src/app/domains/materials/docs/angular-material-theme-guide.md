# Angular Material Theme Configuration Guide

## Overview
This guide explains how to properly configure Angular Material theming using CSS variables for the Materials Management System.

## Theme Configuration

### 1. Define Custom Theme (styles.scss)
```scss
@use '@angular/material' as mat;

// Include core styles
@include mat.core();

// Define custom palette
$primary-palette: (
  50: #e3f2fd,
  100: #bbdefb,
  200: #90caf9,
  300: #64b5f6,
  400: #42a5f5,
  500: #2196f3,
  600: #1e88e5,
  700: #1976d2,
  800: #1565c0,
  900: #0d47a1,
  A100: #82b1ff,
  A200: #448aff,
  A400: #2979ff,
  A700: #2962ff,
  contrast: (
    50: rgba(0, 0, 0, 0.87),
    100: rgba(0, 0, 0, 0.87),
    200: rgba(0, 0, 0, 0.87),
    300: rgba(0, 0, 0, 0.87),
    400: rgba(0, 0, 0, 0.87),
    500: white,
    600: white,
    700: white,
    800: white,
    900: white,
    A100: rgba(0, 0, 0, 0.87),
    A200: white,
    A400: white,
    A700: white,
  )
);

$accent-palette: (
  50: #e8f5e9,
  100: #c8e6c9,
  200: #a5d6a7,
  300: #81c784,
  400: #66bb6a,
  500: #4caf50,
  600: #43a047,
  700: #388e3c,
  800: #2e7d32,
  900: #1b5e20,
  A100: #b9f6ca,
  A200: #69f0ae,
  A400: #00e676,
  A700: #00c853,
  contrast: (
    50: rgba(0, 0, 0, 0.87),
    100: rgba(0, 0, 0, 0.87),
    200: rgba(0, 0, 0, 0.87),
    300: rgba(0, 0, 0, 0.87),
    400: rgba(0, 0, 0, 0.87),
    500: rgba(0, 0, 0, 0.87),
    600: white,
    700: white,
    800: white,
    900: white,
    A100: rgba(0, 0, 0, 0.87),
    A200: rgba(0, 0, 0, 0.87),
    A400: rgba(0, 0, 0, 0.87),
    A700: rgba(0, 0, 0, 0.87),
  )
);

// Create theme
$app-primary: mat.define-palette($primary-palette);
$app-accent: mat.define-palette($accent-palette);
$app-warn: mat.define-palette(mat.$red-palette);

$app-theme: mat.define-light-theme((
  color: (
    primary: $app-primary,
    accent: $app-accent,
    warn: $app-warn,
  )
));

// Include theme styles
@include mat.all-component-themes($app-theme);

// Define CSS variables
:root {
  // Primary colors
  --mat-app-primary: #{mat.get-color-from-palette($app-primary, 500)};
  --mat-app-primary-lighter: #{mat.get-color-from-palette($app-primary, 100)};
  --mat-app-primary-darker: #{mat.get-color-from-palette($app-primary, 700)};
  
  // Accent colors  
  --mat-app-accent: #{mat.get-color-from-palette($app-accent, 500)};
  --mat-app-accent-lighter: #{mat.get-color-from-palette($app-accent, 100)};
  --mat-app-accent-darker: #{mat.get-color-from-palette($app-accent, 700)};
  
  // Warn colors
  --mat-app-warn: #{mat.get-color-from-palette($app-warn, 500)};
  --mat-app-warn-lighter: #{mat.get-color-from-palette($app-warn, 100)};
  --mat-app-warn-darker: #{mat.get-color-from-palette($app-warn, 700)};
  
  // Error colors (same as warn)
  --mat-app-error: var(--mat-app-warn);
  --mat-app-error-lighter: var(--mat-app-warn-lighter);
  
  // Background and surface colors
  --mat-app-background: #fafafa;
  --mat-app-surface: #ffffff;
  --mat-app-hover-state: rgba(0, 0, 0, 0.04);
  
  // Text colors
  --mat-app-text-color: rgba(0, 0, 0, 0.87);
  --mat-app-secondary-text: rgba(0, 0, 0, 0.6);
  --mat-app-disabled-text: rgba(0, 0, 0, 0.38);
  
  // Elevation shadows
  --mat-app-elevation-shadow-level-1: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
  --mat-app-elevation-shadow-level-2: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
  --mat-app-elevation-shadow-level-3: 0 3px 3px -2px rgba(0,0,0,.2), 0 3px 4px 0 rgba(0,0,0,.14), 0 1px 8px 0 rgba(0,0,0,.12);
}

// Dark theme
@media (prefers-color-scheme: dark) {
  :root {
    --mat-app-background: #303030;
    --mat-app-surface: #424242;
    --mat-app-hover-state: rgba(255, 255, 255, 0.04);
    --mat-app-text-color: rgba(255, 255, 255, 0.87);
    --mat-app-secondary-text: rgba(255, 255, 255, 0.6);
    --mat-app-disabled-text: rgba(255, 255, 255, 0.38);
  }
  
  // Apply dark theme
  $app-dark-theme: mat.define-dark-theme((
    color: (
      primary: $app-primary,
      accent: $app-accent,
      warn: $app-warn,
    )
  ));
  
  @include mat.all-component-colors($app-dark-theme);
}
```

### 2. Usage in Components

```scss
// component.scss
.my-component {
  // Backgrounds
  background-color: var(--mat-app-background);
  
  .surface-element {
    background-color: var(--mat-app-surface);
  }
  
  // Text colors
  color: var(--mat-app-text-color);
  
  .secondary-text {
    color: var(--mat-app-text-color);
    opacity: 0.6;
  }
  
  // Primary colors
  .primary-element {
    background-color: var(--mat-app-primary);
    color: white;
  }
  
  .primary-light-bg {
    background-color: var(--mat-app-primary-lighter);
    color: var(--mat-app-primary);
  }
  
  // Status colors
  .warning {
    color: var(--mat-app-warn);
    background-color: var(--mat-app-warn-lighter);
  }
  
  .error {
    color: var(--mat-app-error);
  }
  
  // Hover states
  .hoverable:hover {
    background-color: var(--mat-app-hover-state);
  }
  
  // Elevation
  .elevated {
    box-shadow: var(--mat-app-elevation-shadow-level-2);
    
    &:hover {
      box-shadow: var(--mat-app-elevation-shadow-level-3);
    }
  }
}
```

## Color Palette Reference

### Primary (Blue)
- **50**: #e3f2fd (Lightest)
- **100**: #bbdefb
- **200**: #90caf9
- **300**: #64b5f6
- **400**: #42a5f5
- **500**: #2196f3 (Default)
- **600**: #1e88e5
- **700**: #1976d2
- **800**: #1565c0
- **900**: #0d47a1 (Darkest)

### Accent (Green)
- **50**: #e8f5e9 (Lightest)
- **100**: #c8e6c9
- **200**: #a5d6a7
- **300**: #81c784
- **400**: #66bb6a
- **500**: #4caf50 (Default)
- **600**: #43a047
- **700**: #388e3c
- **800**: #2e7d32
- **900**: #1b5e20 (Darkest)

### Warn/Error (Red)
- Uses Material's default red palette
- **500**: #f44336 (Default)
- **100**: #ffcdd2 (Light)
- **700**: #d32f2f (Dark)

## Best Practices

### 1. Always Use CSS Variables
```scss
// ❌ Bad
.element {
  color: #1976d2;
  background-color: rgba(0, 0, 0, 0.6);
}

// ✅ Good
.element {
  color: var(--mat-app-primary);
  background-color: var(--mat-app-text-color);
  opacity: 0.6;
}
```

### 2. Opacity for Text Hierarchy
```scss
// Primary text
.primary-text {
  color: var(--mat-app-text-color);
}

// Secondary text
.secondary-text {
  color: var(--mat-app-text-color);
  opacity: 0.6;
}

// Disabled text
.disabled-text {
  color: var(--mat-app-text-color);
  opacity: 0.38;
}
```

### 3. Status Colors
```scss
// Success (use accent/green)
.success {
  color: var(--mat-app-accent);
  background-color: var(--mat-app-accent-lighter);
}

// Warning
.warning {
  color: var(--mat-app-warn);
  background-color: var(--mat-app-warn-lighter);
}

// Error
.error {
  color: var(--mat-app-error);
  background-color: var(--mat-app-error-lighter);
}

// Info (use primary)
.info {
  color: var(--mat-app-primary);
  background-color: var(--mat-app-primary-lighter);
}
```

### 4. Dark Theme Support
Always test components in both light and dark themes:

```scss
// Component that adapts to theme
.adaptive-component {
  background-color: var(--mat-app-surface);
  color: var(--mat-app-text-color);
  border: 1px solid var(--mat-app-text-color);
  border-opacity: 0.12;
}
```

## Migration Checklist

When updating existing components:

- [ ] Replace hardcoded colors with CSS variables
- [ ] Use opacity for text hierarchy instead of different gray values
- [ ] Test in both light and dark themes
- [ ] Update hover states to use `--mat-app-hover-state`
- [ ] Replace box-shadow values with elevation variables
- [ ] Ensure sufficient color contrast for accessibility

## Accessibility

Ensure WCAG AA compliance:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Use Material's built-in contrast colors when available
- Test with browser accessibility tools

## Conclusion

By following this guide and using CSS variables consistently, the Materials Management System will have a modern, cohesive look that automatically adapts to theme changes and maintains consistency across all components. 
