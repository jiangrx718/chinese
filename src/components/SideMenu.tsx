import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SyncOutlined } from '@ant-design/icons';

const SideMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      key: '/',
      icon: <SyncOutlined />,
      label: '首页',
    },
  ];

  return (
    <div className="menu-container">
      {menuItems.map((item) => (
        <div
          key={item.key}
          className={`menu-item ${currentPath === item.key ? 'active' : ''}`}
          onClick={() => navigate(item.key)}
        >
          <span className="menu-icon">{item.icon}</span>
          <span className="menu-text" style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default SideMenu;
