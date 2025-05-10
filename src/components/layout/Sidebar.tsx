
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ChartBar, 
  Users, 
  Settings, 
  FileText, 
  BarChart2, 
  Award,
  X
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: ChartBar, forRoles: ['admin', 'staff'] },
    { name: 'Leaderboard', href: '/leaderboard', icon: Award, forRoles: ['admin', 'staff'] },
    { name: 'SA Tracker', href: '/sa-tracker', icon: FileText, forRoles: ['admin', 'staff'] },
    { name: 'Staff Performance', href: '/staff-performance', icon: BarChart2, forRoles: ['admin'] },
    { name: 'KPI Rules', href: '/kpi-rules', icon: Settings, forRoles: ['admin'] },
    { name: 'Staff List', href: '/staff-list', icon: Users, forRoles: ['admin'] },
    { name: 'My Performance', href: '/my-performance', icon: ChartBar, forRoles: ['staff'] },
  ];

  // Filter navigation items based on user role
  const filteredNav = navigation.filter(item => 
    user && item.forRoles.includes(user.role)
  );

  return (
    <>
      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity ease-linear duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="fixed inset-y-0 left-0 flex flex-col z-40 max-w-xs w-full bg-company-primary transition-transform ease-in-out duration-300 transform">
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-company-secondary">
            <span className="text-xl font-bold text-white">KPI Tracker</span>
            <button 
              className="h-10 w-10 rounded-full flex items-center justify-center text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
              <span className="sr-only">Close sidebar</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pt-5 pb-4 px-2">
            <nav className="flex-1 px-2 space-y-1">
              {filteredNav.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive 
                        ? 'bg-company-secondary text-white' 
                        : 'text-gray-300 hover:bg-company-secondary hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon 
                      className={`mr-3 h-6 w-6 ${
                        isActive ? 'text-company-accent' : 'text-gray-400 group-hover:text-gray-300'
                      }`} 
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex-shrink-0 flex p-4">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <div className="ml-1">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs font-medium text-gray-300 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-company-primary">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-company-secondary">
              <span className="text-xl font-bold text-white">KPI Tracker</span>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto pt-5">
              <nav className="flex-1 px-2 space-y-1">
                {filteredNav.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive 
                          ? 'bg-company-secondary text-white' 
                          : 'text-gray-300 hover:bg-company-secondary hover:text-white'
                      }`}
                    >
                      <item.icon 
                        className={`mr-3 h-5 w-5 ${
                          isActive ? 'text-company-accent' : 'text-gray-400 group-hover:text-gray-300'
                        }`} 
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex-shrink-0 flex border-t border-company-secondary p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div>
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs font-medium text-gray-300 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
