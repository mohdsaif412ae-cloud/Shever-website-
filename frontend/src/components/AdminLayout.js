import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  FolderKanban,
  Home,
  Phone,
  Image,
  Settings,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Services', path: '/admin/services', icon: Wrench },
    { name: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { name: 'Home Content', path: '/admin/home-content', icon: Home },
    { name: 'Contact Info', path: '/admin/contact-info', icon: Phone },
    { name: 'Gallery', path: '/admin/gallery', icon: Image },
    { name: 'Site Settings', path: '/admin/site-settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-muted" data-testid="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar w-64 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-8">Shever Admin</h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`admin-nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  className={`admin-nav-link flex items-center gap-3 ${
                    isActive ? 'active' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              data-testid="admin-logout-button"
              className="admin-nav-link flex items-center gap-3 w-full text-left mt-8"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
