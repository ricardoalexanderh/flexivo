# Flexivo Portfolio Website - Complete Development Prompting Guide

## Project Overview
Create a modern, single-page graphic design portfolio website called **Flexivo** using React, TypeScript, and Tailwind CSS with sophisticated 3D elements and animations. The site should follow 2024-2025 design trends while maintaining clean aesthetics and professional presentation.

## Technical Requirements

### Core Technologies
- **Build Tool**: Vite for fast development and optimized builds
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS v4.0 (latest features)
- **3D Integration**: React Three Fiber (@react-three/fiber) + Drei (@react-three/drei)
- **Animations**: Motion (formerly Framer Motion) for sophisticated transitions
- **UI Components**: Shadcn/ui for consistent, accessible components
- **Icons**: Lucide React for clean, consistent iconography

### Additional Libraries
- **Smooth Scrolling**: Lenis for buttery smooth scroll experience
- **Image Optimization**: Next.js Image or custom lazy loading
- **Form Handling**: React Hook Form with Zod validation (if contact form needed)
- **State Management**: Zustand (if complex state required)

## Design System & Theme

### Dual Theme System
- **Default Theme**: Clean Black
  - Primary Background: `#0a0a0a` (near black)
  - Secondary Background: `#1a1a1a` (dark gray)
  - Text Primary: `#ffffff` (white)
  - Text Secondary: `#a3a3a3` (light gray)
  - Accent Color: `#3b82f6` (modern blue) or custom brand color

- **Alternative Theme**: Clean White
  - Primary Background: `#ffffff` (white)
  - Secondary Background: `#f8fafc` (light gray)
  - Text Primary: `#0f172a` (dark slate)
  - Text Secondary: `#64748b` (slate gray)
  - Accent Color: Same as dark theme for consistency

### Typography
- **Primary Font**: Inter or Geist (modern, clean sans-serif)
- **Accent Font**: Optional - Grotesk or custom typeface for headings
- **Font Sizes**: Use Tailwind's fluid typography with `text-xs` to `text-6xl`
- **Font Weights**: 300 (light), 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## Site Structure & Navigation

### Simplified Single-Page Layout
```
┌─────────────────────────────────────┐
│ Header (Fixed/Sticky Navigation)    │
├─────────────────────────────────────┤
│ 1. Hero Section                     │
│ 2. Featured Work Section            │
│ 3. Services Section                 │
│ 4. About Section                    │
│ 5. Contact Section (Footer)         │
└─────────────────────────────────────┘
```

### Navigation Structure
- **Logo**: "Flexivo" (left side)
- **Menu**: Work, Services, About, Contact (right side)
- **Theme Toggle**: Sun/Moon icon for theme switching
- **Contact**: Smooth scroll to footer section when clicked
- **Mobile**: Hamburger menu with slide-out/overlay

## Section-by-Section Requirements

### 1. Header/Navigation
```typescript
// Required Features:
- Fixed/sticky positioning with backdrop blur
- Logo with custom typography or icon
- Smooth scroll navigation to sections
- Theme toggle with animated transition
- Mobile-responsive hamburger menu
- Scroll progress indicator (optional)
```

### 2. Hero Section
```typescript
// Design Requirements:
- Full viewport height (100vh)
- Large, bold typography introducing "Flexivo"
- Subtitle describing services/value proposition
- 3D floating elements (geometric shapes, particles)
- Smooth entrance animations
- Call-to-action button to work section
- Mouse-interactive 3D elements

// Content Structure:
- Main Headline: "Crafting Visual Stories" or "Design That Speaks"
- Subtitle: "Graphic design portfolio showcasing creative solutions"
- Primary CTA: "View My Work" (scroll to work section)
- Secondary CTA: "Get In Touch" (scroll to contact)
```

### 3. Featured Work Section
```typescript
// Layout Requirements:
- Grid layout showcasing 4-6 best projects
- Large preview images with hover effects
- Project titles and brief descriptions
- Category tags (Branding, Web Design, Print, etc.)
- "View Project" buttons with smooth transitions
- Masonry or uniform grid layout options

// Interactive Elements:
- Hover animations revealing project details
- Image zoom effects on hover
- Smooth transitions between grid items
- Loading animations for images
- Filter by category (optional)

// Content per Project:
- Hero image/mockup
- Project title
- Brief description (1-2 sentences)
- Tags/categories
- "View Project" link (could open modal or external link)
```

### 4. Services Section
```typescript
// Service Categories:
- Brand Identity Design
- Web Design & Development
- Print Design
- Digital Marketing Materials
- UI/UX Design
- Logo Design

// Visual Treatment:
- Cards or list layout with icons
- Brief descriptions for each service
- Animated counters or statistics
- 3D icons or illustrations for each service
- Hover effects and micro-interactions
```

### 5. About Section
```typescript
// Content Requirements:
- Professional photo or avatar with 3D frame effect
- Personal story/design philosophy (2-3 paragraphs)
- Skills/expertise list with progress bars or icons
- Years of experience, projects completed stats
- Download CV/Resume button
- Personal touch - design process or methodology

// Visual Elements:
- Split layout (image left, content right)
- Animated skill bars or icon grid
- Parallax effects on scroll
- 3D portrait frame or floating elements
```

### 6. Contact Section (Footer)
```typescript
// Contact Information:
- Email address with mailto link
- Phone number (optional)
- Location/timezone
- Contact form (name, email, message)
- Response time expectation

// Social Media Links:
- Behance, Dribbble, Instagram
- LinkedIn, Twitter/X
- GitHub (if applicable)
- Custom icons with hover animations

// Additional Elements:
- "Let's work together" headline
- Quick availability status
- Copyright notice
- Back to top button with smooth scroll
```

## 3D Elements & Animations

### React Three Fiber Implementation
```typescript
// Required 3D Elements:
1. Hero Section:
   - Floating geometric shapes (cubes, spheres, pyramids)
   - Particle systems with mouse interaction
   - Subtle rotation and floating animations
   - Color-changing elements based on theme

2. Work Section:
   - 3D project cards with depth
   - Hover effects with tilt and shadow
   - Smooth transitions between states

3. About Section:
   - 3D portrait frame or floating avatar
   - Interactive skill visualization
   - Rotating logos or icons

// Performance Considerations:
- Lazy load 3D components
- Use LOD (Level of Detail) for complex models
- Implement proper cleanup and disposal
- Mobile-optimized alternatives (simpler 3D or 2D fallbacks)
```

### Motion Animations
```typescript
// Page Load Animations:
- Staggered text reveals
- Elements sliding in from different directions
- Smooth opacity transitions
- Loading skeleton states

// Scroll Animations:
- Parallax effects on background elements
- Elements appearing as they enter viewport
- Progress-based animations
- Smooth section transitions

// Hover/Interaction Animations:
- Button hover states with scale/color changes
- Image hover effects (zoom, overlay)
- Icon animations on hover
- Micro-interactions for feedback
```

## Responsive Design Strategy

### Breakpoint System
```css
/* Mobile First Approach */
- Mobile: 320px - 768px
- Tablet: 769px - 1024px  
- Desktop: 1025px - 1440px
- Large Desktop: 1441px+
```

### Mobile Optimizations
```typescript
// Mobile-Specific Requirements:
- Touch-friendly navigation (44px minimum touch targets)
- Simplified 3D elements (reduced complexity)
- Optimized image sizes and formats
- Faster loading animations
- Swipe gestures for work gallery
- Collapsible sections to reduce scroll length
```

## Performance & Optimization

### Image Optimization
```typescript
// Requirements:
- WebP/AVIF format support with fallbacks
- Responsive images with srcset
- Lazy loading with intersection observer
- Blur-to-clear loading effects
- Optimized file sizes (under 500KB per image)
```

### 3D Performance
```typescript
// Optimization Strategies:
- Use React.Suspense for 3D components
- Implement frustum culling
- Use instanced rendering for repeated elements
- Mobile fallbacks (CSS transforms instead of WebGL)
- Reduced polygon counts for mobile devices
```

## Accessibility Requirements

### WCAG 2.2 Compliance
```typescript
// Essential Features:
- Keyboard navigation support
- Screen reader compatibility
- 4.5:1 color contrast ratios minimum
- Alt text for all images
- Focus indicators for interactive elements
- Reduced motion support (prefers-reduced-motion)
- Semantic HTML structure
```

### Theme Accessibility
```typescript
// Both Themes Must:
- Meet contrast requirements
- Support high contrast mode
- Provide clear focus indicators
- Maintain readability in all states
- Support system theme preferences
```

## Content Guidelines

### Writing Tone
- **Professional yet approachable**
- **Confident but not boastful**
- **Clear and concise communication**
- **Focus on client benefits and results**

### Project Descriptions
```typescript
// Each project should include:
- Challenge/problem solved
- Design approach taken
- Results or impact achieved
- Technologies/tools used
- Client satisfaction or metrics (if available)
```

## Implementation Prompting Template

When requesting the website development, use this structure:

```typescript
"Create a modern, single-page graphic design portfolio website called 'Flexivo' with the following specifications:

TECHNICAL STACK:
- Vite build tool for fast development
- React 18+ with TypeScript
- Tailwind CSS v4.0 with latest features
- React Three Fiber for 3D elements
- Motion (Framer Motion) for animations
- Shadcn/ui components
- Lenis for smooth scrolling

DESIGN REQUIREMENTS:
- Dual theme system: Default clean black, switchable to clean white
- Modern typography (Inter/Geist font)
- Minimalist maximalism aesthetic
- 3D interactive elements throughout
- Sophisticated animations and micro-interactions

LAYOUT STRUCTURE:
- Fixed header with navigation and theme toggle
- Hero section with 3D floating elements
- Featured work grid (4-6 projects)
- Services section with animated icons
- About section with 3D portrait effect
- Contact footer with social links

SPECIAL FEATURES:
- Contact button scrolls to footer
- Smooth scroll navigation
- Mouse-interactive 3D elements
- Responsive design (mobile-first)
- Performance optimized (lazy loading, image optimization)
- WCAG 2.2 accessibility compliant
- Dark/light theme system with smooth transitions

Please implement with working 3D elements, realistic content, and ensure all animations are smooth and purposeful. Focus on creating a portfolio that demonstrates both technical skill and creative vision."
```

## Additional Best Practices

### SEO Optimization
- Meta descriptions and title tags
- Open Graph tags for social sharing
- Structured data markup
- Fast Core Web Vitals scores
- Mobile-friendly design

### Security Considerations
- Input validation for contact forms
- XSS protection
- HTTPS enforcement
- Content Security Policy headers

### Analytics & Tracking
- Google Analytics 4 integration
- Page view and interaction tracking
- Performance monitoring
- User behavior analysis

This comprehensive guide ensures the development of a modern, professional graphic design portfolio that showcases both creative vision and technical expertise while following current industry best practices and design trends.