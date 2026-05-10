import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../context/AuthContext";
import { GraduationCap, LogOut, Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

const PanelLayout = ({ title, userName, navItems, children, logoColor = "var(--primary-blue)" }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth(); 
  const handleLogout = () => {
    logout();     
    navigate("/"); 
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="panel-wrapper">
      <header className="panel-header">
        <div className="panel-header-left">
          {/* Sidebar'ı tetikleyen buton */}
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="panel-logo-box">
            <GraduationCap size={28} color={logoColor} />
          </div>
          <div className="panel-title-group">
            <h1 className="panel-title">{title}</h1>
            <p className="panel-subtitle">
              <span className="desktop-only">{t('dashboard.welcomeMessage', { name: userName })}</span>
              <span className="mobile-only">{userName}</span>
            </p>
          </div>
        </div>

        <div className="panel-header-right">
          <ThemeToggle />
          <LanguageSwitcher />
          <button onClick={handleLogout} className="logout-btn" title={t('auth.logoutButton', 'Çıkış Yap')}>
            <LogOut size={18} />
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
