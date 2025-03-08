import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Theme, getTheme, setTheme } from '../lib/theme';

export default function ThemeToggle() {
  const [theme, setThemeState] = React.useState<Theme>(getTheme);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-lg ${
          theme === 'light'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
        title="Светла тема"
      >
        <Sun className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-lg ${
          theme === 'dark'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
        title="Тъмна тема"
      >
        <Moon className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleThemeChange('system')}
        className={`p-2 rounded-lg ${
          theme === 'system'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-600 dark:text-white'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
        title="Системна тема"
      >
        <Monitor className="h-5 w-5" />
      </button>
    </div>
  );
}