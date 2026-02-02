# SageFlow Frontend

A comprehensive mental health and habit tracking platform designed for students, with support for parents, teachers, and therapists.

## 🚀 Features

- **Mental Health Tracking**: Monitor mood, stress levels, and emotional well-being
- **Habit Building**: Build positive routines with gamified tracking
- **Academic Profiling**: Understand learning patterns and optimize study habits
- **Collaborative Support**: Connect with parents, teachers, and therapists
- **Progress Insights**: Visualize growth and celebrate achievements
- **Multi-User Support**: Dedicated interfaces for students, educators, and guardians

## 🛠️ Tech Stack

- **React 18** with TypeScript for type-safe development
- **Vite** for fast build tooling and development experience
- **Tailwind CSS** for utility-first styling with custom design system
- **React Router** for client-side routing
- **Lucide React** for beautiful, consistent icons

## 🎨 Design System

### Color Palette
- **Primary**: `#4A90E2` - Headers, key interactive elements
- **Positive**: `#50C878` - Success states, progress indicators
- **Action**: `#FFA630` - Primary buttons, CTAs
- **Alert**: `#FF6B6B` - Error states, warnings
- **Accent**: `#9B5DE5` - Secondary buttons, decorative elements

### Typography
- **Headings**: Montserrat (Bold/SemiBold)
- **Body/Inputs**: Open Sans (Regular)
- **Size Hierarchy**: H1 (28px), H2 (22px), Body (16px), Labels (14px)

### Layout & Components
- **Grid**: 12-column layout with 24px gutters
- **Spacing**: 24px section padding, 16px element spacing
- **Shapes**: Cards (12px), Buttons (8px), Inputs (6px) rounded corners
- **Shadows**: Soft drop shadow (X:0, Y:4, Blur:12, Opacity:15%)

## 📁 Project Structure

```
src/
├── pages/           # Page components
│   ├── LandingPage.tsx
│   ├── StudentSignup.tsx
│   ├── TeacherSignup.tsx
│   └── GuardianSignup.tsx
├── components/      # Reusable UI components
├── App.tsx         # Main app component with routing
├── main.tsx        # React entry point
└── index.css       # Global styles and Tailwind imports
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sageflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📱 Pages

### 1. Landing Page (`/`)
- Hero section with value proposition
- Feature highlights
- Call-to-action sections
- Footer with navigation

### 2. Student Signup (`/signup/student`)
- 3-step registration process
- Personal information collection
- Account security setup
- Personalization and goal setting

### 3. Teacher Signup (`/signup/teacher`)
- Professional information
- Teaching profile and experience
- Account security and preferences
- Professional standards agreement

### 4. Guardian Signup (`/signup/guardian`)
- Guardian information
- Student details management
- Monitoring preferences
- Communication settings

## 🔧 Configuration

### Tailwind CSS
Custom configuration includes:
- Extended color palette matching design system
- Custom typography scales
- Component-specific utilities
- Responsive breakpoints

### TypeScript
- Strict mode enabled
- Path aliases configured (`@/*` points to `src/*`)
- React-specific configurations

### Vite
- React plugin for JSX support
- Path resolution aliases
- Development server configuration

## 🎯 Key Features

### Multi-Step Forms
All signup forms use a 3-step process for better user experience:
1. **Basic Information** - Personal/professional details
2. **Profile Setup** - Role-specific information
3. **Account Security** - Password and preferences

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Touch-friendly form controls
- Adaptive typography

### Accessibility
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- High contrast color schemes

## 🔒 Security & Privacy

- Password strength requirements
- Secure form handling
- Privacy policy integration
- Terms of service agreements
- Professional standards compliance

## 🚧 Development Notes

### State Management
- Local state with React hooks
- Form state management
- Step-by-step navigation
- Input validation

### Component Architecture
- Reusable UI components
- Consistent styling patterns
- Responsive design principles
- Accessibility considerations

### Future Enhancements
- Form validation library integration
- State management solution (Redux/Zustand)
- API integration
- Authentication system
- Dashboard interfaces

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or support, please contact the development team or create an issue in the repository.

---

**SageFlow** - Empowering students to build healthy habits and mental wellness through data-driven insights and collaborative support.