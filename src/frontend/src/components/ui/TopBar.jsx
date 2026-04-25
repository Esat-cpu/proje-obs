import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

const TopBar = ({ leftContent, rightContent }) => {
  return (
    <nav className="topbar">
      <div className="topbar-left">
        {leftContent}
      </div>
      <div className="topbar-right">
        {/* Eğer sağ taraf için özel bir içerik gönderilmediyse varsayılan olarak dil seçiciyi göster */}
        {rightContent || (
          <>
            <ThemeToggle />
            <LanguageSwitcher />
          </>
        )}
      </div>
    </nav>
  );
};

export default TopBar;
