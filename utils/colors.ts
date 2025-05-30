// Color palette for WhatsApp Invoice Generator

export const colors = {
  // Primary colors
  primary: {
    900: '#312e81', // indigo-900
    800: '#3730a3', // indigo-800
    700: '#4338ca', // indigo-700
    600: '#4f46e5', // indigo-600
    500: '#6366f1', // indigo-500
  },
  
  // Secondary colors
  secondary: {
    900: '#701a75', // pink-900
    800: '#9d174d', // pink-800
    700: '#be185d', // pink-700
    600: '#db2777', // pink-600
    500: '#ec4899', // pink-500
  },
  
  // Accent colors
  accent: {
    900: '#064e3b', // emerald-900
    800: '#065f46', // emerald-800
    700: '#047857', // emerald-700
    600: '#059669', // emerald-600
    500: '#10b981', // emerald-500
    400: '#34d399', // emerald-400
    300: '#6ee7b7', // emerald-300
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(to right bottom, #312e81, #4338ca)',
    secondary: 'linear-gradient(to right bottom, #701a75, #be185d)',
    accent: 'linear-gradient(to right, #10b981, #34d399)',
    background: 'linear-gradient(to bottom right, #312e81, #4338ca, #be185d)',
    card: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
  },
  
  // Neutral colors
  neutral: {
    900: '#111827', // gray-900
    800: '#1f2937', // gray-800
    700: '#374151', // gray-700
    600: '#4b5563', // gray-600
    500: '#6b7280', // gray-500
    400: '#9ca3af', // gray-400
    300: '#d1d5db', // gray-300
    200: '#e5e7eb', // gray-200
    100: '#f3f4f6', // gray-100
    50: '#f9fafb',  // gray-50
  },
  
  // Status colors
  status: {
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444',   // red-500
    info: '#3b82f6',    // blue-500
  },
  
  // Utility
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  
  // CSS variables for tailwind
  cssVariables: {
    '--color-primary': '#4338ca',
    '--color-secondary': '#be185d',
    '--color-accent': '#10b981',
  }
};

// Tailwind class combinations for common UI elements
export const tailwindClasses = {
  // Buttons
  buttonPrimary: 'bg-gradient-to-r from-indigo-700 to-indigo-600 text-white font-semibold px-5 py-2 rounded-lg hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1',
  buttonSecondary: 'bg-white text-indigo-800 font-semibold px-5 py-2 rounded-lg hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1',
  buttonOutline: 'border border-white text-white px-5 py-2 rounded-lg hover:bg-white hover:text-indigo-800 transition duration-300',
  buttonAccent: 'bg-gradient-to-r from-green-400 to-teal-300 text-gray-900 font-semibold px-5 py-2 rounded-lg hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1',
  
  // Cards
  card: 'bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:transform hover:-translate-y-1 transition duration-300',
  cardHighlight: 'bg-gradient-to-r from-indigo-800 to-purple-700 rounded-2xl p-6 relative overflow-hidden',
  
  // Text
  heading: 'text-2xl md:text-3xl font-bold text-white mb-4',
  headingGradient: 'text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-300',
  paragraph: 'text-gray-200 mb-4',
  
  // Inputs
  input: 'bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent',
  
  // Layout
  container: 'container mx-auto px-6 py-8',
  section: 'mb-12',
};

// Export default for convenience
export default colors;