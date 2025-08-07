import React from 'react';

const MainLayout = ({ children }) => (
  <div>
    {/* Header hoặc Navbar có thể đặt ở đây */}
    {children}
    {/* Footer nếu cần */}
  </div>
);

export default MainLayout; 