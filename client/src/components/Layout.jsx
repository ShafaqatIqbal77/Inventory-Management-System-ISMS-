import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Container,
  Nav,
  Navbar,
  Offcanvas,
} from 'react-bootstrap';
import {
  FiBarChart2,
  FiBox,
  FiHome,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiShoppingCart,
  FiTruck,
  FiUsers,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const navigationByRole = {
  admin: [
    { label: 'Dashboard', to: '/dashboard', icon: FiHome },
    { label: 'Products', to: '/products', icon: FiPackage },
    { label: 'Suppliers', to: '/suppliers', icon: FiTruck },
    { label: 'Customers', to: '/customers', icon: FiUsers },
    { label: 'Stock In', to: '/stock-in', icon: FiBox },
    { label: 'Sales', to: '/sales/new', icon: FiShoppingCart },
    { label: 'Reports', to: '/reports', icon: FiBarChart2 },
  ],
  manager: [
    { label: 'Dashboard', to: '/dashboard', icon: FiHome },
    { label: 'Products', to: '/products', icon: FiPackage },
    { label: 'Suppliers', to: '/suppliers', icon: FiTruck },
    { label: 'Customers', to: '/customers', icon: FiUsers },
    { label: 'Stock In', to: '/stock-in', icon: FiBox },
    { label: 'Sales', to: '/sales/new', icon: FiShoppingCart },
    { label: 'Reports', to: '/reports', icon: FiBarChart2 },
  ],
  salesman: [
    { label: 'Dashboard', to: '/dashboard', icon: FiHome },
    { label: 'Products', to: '/products', icon: FiPackage },
    { label: 'Customers', to: '/customers', icon: FiUsers },
    { label: 'Sales', to: '/sales/new', icon: FiShoppingCart },
    { label: 'Reports', to: '/reports', icon: FiBarChart2 },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = navigationByRole[user?.role] || navigationByRole.salesman;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebar = (
    <div className="sidebar d-flex flex-column gap-2 p-3">
      <div className="brand-wrap mb-4">
        <div className="brand-badge">IP</div>
        <div>
          <div className="fw-bold">IPMS</div>
          <small className="text-muted">Inventory System</small>
        </div>
      </div>

      <Nav className="flex-column gap-1">
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link-sidebar ${isActive ? 'active' : ''}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </Nav>
    </div>
  );

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar d-none d-lg-block">{sidebar}</aside>
      <Offcanvas show={sidebarOpen} onHide={() => setSidebarOpen(false)} placement="start" className="d-lg-none">
        {sidebar}
      </Offcanvas>

      <div className="main-panel flex-grow-1">
        <Navbar bg="white" className="topbar border-bottom shadow-sm px-3 px-lg-4">
          <Container fluid className="gx-0">
            <div className="d-flex align-items-center gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                className="d-lg-none"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu size={18} />
              </Button>
              <Navbar.Brand className="fw-semibold m-0">Operations Dashboard</Navbar.Brand>
            </div>

            <div className="d-flex align-items-center gap-3 ms-auto">
              <div className="user-badge-wrap text-end">
                <div className="fw-semibold small text-dark">{user?.name}</div>
                <Badge bg="light" text="dark" className="text-uppercase">
                  {user?.role}
                </Badge>
              </div>
              <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                <FiLogOut size={14} className="me-1" />
                Logout
              </Button>
            </div>
          </Container>
        </Navbar>

        <main className="page-content px-3 px-lg-4 py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
