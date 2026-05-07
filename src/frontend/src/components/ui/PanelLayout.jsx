import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../context/AuthContext";//
import { GraduationCap, Moon, Sun, LogOut, Menu, X } from 'lucide-react';

const PanelLayout = ({ title, userName, navItems, children, logoColor = "var(--primary-blue)" }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth(); //
  const handleLogout = () => {
    logout();      // 1. Önce token'ları temizle
    navigate("/"); // 2. App.jsx'teki anasayfa rotasına (LoginHomePage) yönlendir
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="panel-wrapper">
      <header className="panel-header">
        <div className="panel-header-left">
          {/* Sidebar'ı tetikleyen buton */}
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={24} />
          </button>

          <div className="panel-logo-box">
            <GraduationCap size={28} color={logoColor} />
          </div>
          <div>
            <h1 className="panel-title">{title}</h1>
            <p className="panel-subtitle">{t('dashboard.welcomeMessage', { name: userName })}</p>
          </div>
        </div>

        <div className="panel-header-right">
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className="lang-switcher">
            <select value={i18n.language} onChange={toggleLanguage} className="lang-select">
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            <span>{t('auth.logoutButton', 'Çıkış Yap')}</span>
          </button>
        </div>
      </header>

      <div className="panel-layout-body">
        {/* SOLDAKİ BOŞ BAR */}
        <aside className={`empty-left-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-placeholder">
            {/* Burası şu an boş, sidebar açıkken görünür */}
          </div>
        </aside>

        <div className="panel-content-wrapper">
          {/* Yatay Navigasyon Barı */}
          <div className="panel-nav-container">
            <nav className="panel-nav">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={index}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) => `panel-nav-link ${isActive ? 'active' : ''}`}
                  >
                    <div className="nav-link-content">
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <main className="panel-main-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default PanelLayout;
