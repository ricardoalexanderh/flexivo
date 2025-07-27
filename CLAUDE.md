# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flexivo is a modern, single-page graphic design portfolio website built with React 18+, TypeScript, and Vite. The project features sophisticated 3D elements using React Three Fiber, smooth animations with Motion (Framer Motion), and a dual theme system (clean black/white) with Tailwind CSS.

## Development Commands

### Core Development Commands
- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production (runs TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on the codebase

### TypeScript Compilation
- Use `tsc -b` for TypeScript compilation (included in build command)
- Project uses TypeScript references with `tsconfig.app.json` and `tsconfig.node.json`

## Architecture & Project Structure

### Tech Stack
- **Build Tool**: Vite for fast development and optimized builds
- **Framework**: React 19+ with TypeScript in strict mode
- **Styling**: Tailwind CSS with custom theme configuration
- **3D Graphics**: React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei`)
- **Animations**: Motion (formerly Framer Motion) for sophisticated transitions
- **Smooth Scrolling**: Lenis for buttery smooth scroll experience
- **Icons**: Lucide React + React Icons
- **3D Library**: Three.js

### Component Architecture
The main application is structured as a single-page portfolio in `src/flexivo-portfolio.tsx` with:
- Complex 3D particle systems and interactive elements
- Modular section-based layout (Hero, Work, Services, About, Contact)
- Theme switching system with dark/light modes
- Responsive design with mobile-first approach

### Key Files
- `src/main.tsx` - Application entry point
- `src/flexivo-portfolio.tsx` - Main portfolio component with all sections
- `src/index.css` - Global styles and Tailwind imports
- Multiple portfolio variations exist as backup copies

## Theme System

### Dual Theme Configuration
Custom Tailwind colors defined in `tailwind.config.js`:
- **Dark Theme**: `clean-black` (#0a0a0a), `clean-gray` (#1a1a1a)
- **Light Theme**: `clean-white` (#ffffff), `clean-light` (#f8fafc)
- **Typography**: Inter font family with custom color variants
- **Theme Toggle**: Uses `darkMode: 'class'` for CSS class-based switching

## 3D Development Guidelines

### React Three Fiber Implementation
- Complex particle systems with infinity curves and blooming effects
- Performance optimization with `Suspense` boundaries
- Mouse interaction with 3D elements
- Color-coded particle systems using blue/purple palettes
- Frame-based animations using `useFrame` hook

### Performance Considerations
- Use React.Suspense for 3D components
- Implement proper cleanup and disposal for Three.js objects
- Consider mobile fallbacks for complex 3D scenes
- Lazy loading for 3D components when needed

## Development Guidelines

### Code Style & Patterns
- TypeScript strict mode enabled
- Functional components with hooks
- Motion/Framer Motion for page and component animations
- Responsive design using Tailwind breakpoints
- Component-based architecture with clear separation of concerns

### 3D Animation Patterns
- Use `useFrame` for continuous animations
- Implement particle systems with instancedMesh for performance
- Color interpolation based on theme state
- Mouse interaction through raycasting and pointer events

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Simplified 3D elements for mobile devices
- Touch-friendly navigation and interactions
- Performance optimizations for different device capabilities

## Project-Specific Guidelines

### Portfolio Content Structure
The application follows the guidelines in `guidelines.md` which defines:
- Design system with dual themes
- Section-by-section requirements (Hero, Work, Services, About, Contact)
- 3D implementation specifications
- Performance and accessibility requirements

### Accessibility Requirements
- WCAG 2.2 compliance focus
- Keyboard navigation support
- Screen reader compatibility
- Reduced motion support (`prefers-reduced-motion`)
- Color contrast requirements for both themes

### Performance Optimization
- Image optimization with WebP/AVIF support
- Lazy loading implementation
- 3D performance optimization with LOD (Level of Detail)
- Bundle optimization through Vite's build process

## Testing & Quality

When making changes:
1. Always run `npm run lint` to check for ESLint issues
2. Ensure TypeScript compilation passes with `tsc -b`
3. Test both light and dark themes
4. Verify 3D elements render correctly and perform well
5. Check responsive behavior across different screen sizes
6. Validate accessibility features are maintained