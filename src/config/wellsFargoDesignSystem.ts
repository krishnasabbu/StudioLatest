/**
 * Wells Fargo Design System Configuration
 *
 * This file contains the official Wells Fargo brand guidelines including:
 * - Color palette (primary, secondary, semantic colors)
 * - Typography system (font families, sizes, weights, line heights)
 * - Spacing scale (consistent spacing units)
 * - Button styles (primary, secondary, tertiary variants)
 * - Component specifications
 *
 * All values are based on Wells Fargo's official brand guidelines
 * to ensure brand consistency across the application.
 */

export const wellsFargoDesignSystem = {
  // Official Wells Fargo Color Palette
  colors: {
    // Primary Brand Colors
    primary: {
      red: '#D71E28',           // Wells Fargo signature red
      gold: '#FFCD41',          // Wells Fargo gold accent
      burgundy: '#8B1A1A',      // Deep red for depth
    },

    // Neutral Palette for Light Mode
    light: {
      background: '#FFFFFF',
      surface: '#F8F9FA',
      surfaceAlt: '#F3F4F6',
      border: '#D1D5DB',
      borderLight: '#E5E7EB',
      text: {
        primary: '#1F2937',
        secondary: '#4B5563',
        tertiary: '#6B7280',
        disabled: '#9CA3AF',
      },
    },

    // Dark Mode Palette
    dark: {
      background: '#111827',
      surface: '#1F2937',
      surfaceAlt: '#374151',
      border: '#4B5563',
      borderLight: '#374151',
      text: {
        primary: '#F9FAFB',
        secondary: '#E5E7EB',
        tertiary: '#D1D5DB',
        disabled: '#9CA3AF',
      },
    },

    // Semantic Colors
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },

    // State Colors
    states: {
      hover: {
        red: '#B91C1C',
        gold: '#FCD34D',
        surface: '#F3F4F6',
      },
      active: {
        red: '#991B1B',
        surface: '#E5E7EB',
      },
      focus: {
        ring: '#D71E28',
        ringOpacity: '0.5',
      },
    },
  },

  // Typography System
  typography: {
    // Font Families (Wells Fargo uses system fonts for web)
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    },

    // Font Sizes (using a type scale)
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },

    // Font Weights
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },

    // Letter Spacing
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    },
  },

  // Spacing Scale (8px base unit)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.625rem',  // 10px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // Button Specifications
  buttons: {
    // Primary Button (Wells Fargo Red)
    primary: {
      light: {
        background: '#D71E28',
        text: '#FFFFFF',
        border: '#D71E28',
        hover: {
          background: '#B91C1C',
          border: '#B91C1C',
        },
        active: {
          background: '#991B1B',
          border: '#991B1B',
        },
        disabled: {
          background: '#D1D5DB',
          text: '#9CA3AF',
          border: '#D1D5DB',
        },
      },
      dark: {
        background: '#D71E28',
        text: '#FFFFFF',
        border: '#D71E28',
        hover: {
          background: '#EF4444',
          border: '#EF4444',
        },
        active: {
          background: '#B91C1C',
          border: '#B91C1C',
        },
        disabled: {
          background: '#4B5563',
          text: '#9CA3AF',
          border: '#4B5563',
        },
      },
    },

    // Secondary Button (Outlined)
    secondary: {
      light: {
        background: '#FFFFFF',
        text: '#1F2937',
        border: '#D1D5DB',
        hover: {
          background: '#F9FAFB',
          border: '#9CA3AF',
        },
        active: {
          background: '#F3F4F6',
          border: '#6B7280',
        },
        disabled: {
          background: '#FFFFFF',
          text: '#D1D5DB',
          border: '#E5E7EB',
        },
      },
      dark: {
        background: '#374151',
        text: '#F9FAFB',
        border: '#4B5563',
        hover: {
          background: '#4B5563',
          border: '#6B7280',
        },
        active: {
          background: '#1F2937',
          border: '#4B5563',
        },
        disabled: {
          background: '#1F2937',
          text: '#6B7280',
          border: '#374151',
        },
      },
    },

    // Tertiary Button (Ghost)
    tertiary: {
      light: {
        background: 'transparent',
        text: '#D71E28',
        border: 'transparent',
        hover: {
          background: '#FEE2E2',
          border: 'transparent',
        },
        active: {
          background: '#FEE2E2',
          border: 'transparent',
        },
        disabled: {
          background: 'transparent',
          text: '#D1D5DB',
          border: 'transparent',
        },
      },
      dark: {
        background: 'transparent',
        text: '#EF4444',
        border: 'transparent',
        hover: {
          background: '#1F2937',
          border: 'transparent',
        },
        active: {
          background: '#374151',
          border: 'transparent',
        },
        disabled: {
          background: 'transparent',
          text: '#6B7280',
          border: 'transparent',
        },
      },
    },

    // Button Sizes
    sizes: {
      sm: {
        padding: '0.5rem 1rem',      // 8px 16px
        fontSize: '0.875rem',         // 14px
        lineHeight: '1.25rem',        // 20px
        iconSize: '16px',
      },
      md: {
        padding: '0.625rem 1.25rem',  // 10px 20px
        fontSize: '1rem',              // 16px
        lineHeight: '1.5rem',          // 24px
        iconSize: '20px',
      },
      lg: {
        padding: '0.75rem 1.5rem',    // 12px 24px
        fontSize: '1.125rem',          // 18px
        lineHeight: '1.75rem',         // 28px
        iconSize: '24px',
      },
    },
  },

  // Input Field Specifications
  inputs: {
    light: {
      background: '#FFFFFF',
      text: '#1F2937',
      border: '#D1D5DB',
      placeholder: '#9CA3AF',
      focus: {
        border: '#D71E28',
        ring: 'rgba(215, 30, 40, 0.2)',
      },
      disabled: {
        background: '#F3F4F6',
        text: '#9CA3AF',
        border: '#E5E7EB',
      },
      error: {
        border: '#EF4444',
        ring: 'rgba(239, 68, 68, 0.2)',
      },
    },
    dark: {
      background: '#1F2937',
      text: '#F9FAFB',
      border: '#4B5563',
      placeholder: '#9CA3AF',
      focus: {
        border: '#EF4444',
        ring: 'rgba(239, 68, 68, 0.2)',
      },
      disabled: {
        background: '#111827',
        text: '#6B7280',
        border: '#374151',
      },
      error: {
        border: '#EF4444',
        ring: 'rgba(239, 68, 68, 0.2)',
      },
    },
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Export type for TypeScript support
export type WellsFargoDesignSystem = typeof wellsFargoDesignSystem;

// Helper function to get button classes
export function getButtonClasses(
  variant: 'primary' | 'secondary' | 'tertiary',
  size: 'sm' | 'md' | 'lg',
  theme: 'light' | 'dark',
  disabled: boolean = false
): string {
  const ds = wellsFargoDesignSystem;
  const buttonSpec = ds.buttons[variant][theme];
  const sizeSpec = ds.buttons.sizes[size];

  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'font-semibold',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
  ];

  const stateSpec = disabled ? buttonSpec.disabled : buttonSpec;

  return baseClasses.join(' ');
}
