export type Theme = 'light' | 'dark' | 'system';

export function getSystemTheme(): Theme {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function setTheme(theme: Theme) {
  const root = window.document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark');

  root.classList.remove('light', 'dark');
  root.classList.add(isDark ? 'dark' : 'light');

  // Store the theme preference
  localStorage.setItem('theme', theme);

  // Update CSS variables for dark mode
  if (isDark) {
    root.style.setProperty('--bg-primary', '#1a1a1a');
    root.style.setProperty('--text-primary', '#ffffff');
  } else {
    root.style.setProperty('--bg-primary', '#ffffff');
    root.style.setProperty('--text-primary', '#000000');
  }
}

export function getTheme(): Theme {
  const savedTheme = localStorage.getItem('theme') as Theme;
  return savedTheme || 'system';
}

// Initialize theme
if (typeof window !== 'undefined') {
  // Set initial theme
  setTheme(getTheme());

  // Watch for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getTheme() === 'system') {
      setTheme('system');
    }
  });
}