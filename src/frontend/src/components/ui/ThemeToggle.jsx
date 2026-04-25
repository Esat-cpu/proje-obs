import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle-btn"
      title="Temayı Değiştir"
    >
      {theme === 'light' ? <Moon size={24} color="var(--primary-blue)" /> : <Sun size={24} color="var(--primary-blue)" />}
    </button>
  );
};

export default ThemeToggle;