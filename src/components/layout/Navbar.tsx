
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface NavbarProps {
  setSidebarOpen: (open: boolean) => void;
}

const Navbar = ({ setSidebarOpen }: NavbarProps) => {
  const { logout } = useAuth();

  return (
    <header className="flex-shrink-0 relative h-16 bg-white flex items-center">
      <div className="px-4 sm:px-6 md:px-8 lg:px-0 lg:mx-auto lg:max-w-7xl w-full flex items-center justify-between">
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-company-primary"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="ml-4 md:ml-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">KPI Performance Tracker</h1>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          <Button
            onClick={logout}
            variant="ghost"
            className="ml-3 text-gray-500 hover:text-gray-700"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
