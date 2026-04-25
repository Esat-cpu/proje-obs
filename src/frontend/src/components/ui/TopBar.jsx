import LanguageSwitcher from './LanguageSwitcher';

const TopBar = ({ leftContent, rightContent }) => {
  return (
    <nav style={styles.navbar}>
      <div style={styles.leftSection}>
        {leftContent}
      </div>
      <div style={styles.rightSection}>
        {/* Eğer sağ taraf için özel bir içerik gönderilmediyse varsayılan olarak dil seçiciyi göster */}
        {rightContent || <LanguageSwitcher />}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 28px',
    backgroundColor: '#edf1fb',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  }
};

export default TopBar;
