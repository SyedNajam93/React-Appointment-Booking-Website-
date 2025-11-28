
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from './utils';
import { 
  Calendar, Home, Clock, User, Settings, Menu, X, 
  Users, Briefcase, MapPin, BarChart3, Moon, Sun,
  LogOut, ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const clientNavItems = [
  { name: 'Home', icon: Home, page: 'Home' },
  { name: 'Book Appointment', icon: Calendar, page: 'BookAppointment' },
  { name: 'My Appointments', icon: Clock, page: 'MyAppointments' },
  { name: 'Profile', icon: User, page: 'Profile' },
];

const adminNavItems = [
  { name: 'Dashboard', icon: BarChart3, page: 'AdminDashboard' },
  { name: 'Appointments', icon: Calendar, page: 'AdminAppointments' },
  { name: 'Customers', icon: Users, page: 'AdminCustomers' },
  { name: 'Services', icon: Briefcase, page: 'AdminServices' },
  { name: 'Staff', icon: User, page: 'AdminStaff' },
  { name: 'Locations', icon: MapPin, page: 'AdminLocations' },
  { name: 'Settings', icon: Settings, page: 'AdminSettings' },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isAdminPage = currentPageName?.startsWith('Admin');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (e) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const navItems = isAdminPage ? adminNavItems : clientNavItems;

  if (currentPageName === 'Home' || currentPageName === 'BookAppointment' || currentPageName === 'Confirmation') {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <style>{`
          :root {
            --primary: 220 90% 56%;
            --primary-foreground: 0 0% 100%;
            --background: 0 0% 100%;
            --foreground: 222 47% 11%;
            --muted: 210 40% 96%;
            --muted-foreground: 215 16% 47%;
            --accent: 210 40% 96%;
            --accent-foreground: 222 47% 11%;
            --border: 214 32% 91%;
            --ring: 220 90% 56%;
          }
          .dark {
            --background: 222 47% 11%;
            --foreground: 210 40% 98%;
            --muted: 217 33% 17%;
            --muted-foreground: 215 20% 65%;
            --accent: 217 33% 17%;
            --accent-foreground: 210 40% 98%;
            --border: 217 33% 17%;
          }
        `}</style>
        
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">BookFlow</span>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link to={createPageUrl('Home')} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Home
                </Link>
                <Link to={createPageUrl('BookAppointment')} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Book Now
                </Link>
                {user && (
                  <Link to={createPageUrl('MyAppointments')} className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                    My Appointments
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                  className="rounded-full"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                {loading ? null : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                          {user.full_name?.charAt(0) || user.email?.charAt(0)}
                        </div>
                        <span className="hidden sm:inline text-sm">{user.full_name || user.email}</span>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate(createPageUrl('MyAppointments'))}>
                        <Clock className="w-4 h-4 mr-2" />
                        My Appointments
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(createPageUrl('Profile'))}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      {user.role === 'admin' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(createPageUrl('AdminDashboard'))}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Admin Dashboard
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    onClick={() => base44.auth.redirectToLogin()}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  >
                    Sign In
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-4">
              <div className="px-4 space-y-2">
                <Link 
                  to={createPageUrl('Home')} 
                  className="block px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to={createPageUrl('BookAppointment')} 
                  className="block px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Book Now
                </Link>
                {user && (
                  <Link 
                    to={createPageUrl('MyAppointments')} 
                    className="block px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Appointments
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>

        <main className="pt-16 min-h-screen bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </div>
    );
  }

  // Admin or authenticated pages layout
  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <style>{`
        :root {
          --primary: 220 90% 56%;
          --primary-foreground: 0 0% 100%;
          --background: 0 0% 100%;
          --foreground: 222 47% 11%;
          --muted: 210 40% 96%;
          --muted-foreground: 215 16% 47%;
          --accent: 210 40% 96%;
          --accent-foreground: 222 47% 11%;
          --border: 214 32% 91%;
          --ring: 220 90% 56%;
        }
        .dark {
          --background: 222 47% 11%;
          --foreground: 210 40% 98%;
          --muted: 217 33% 17%;
          --muted-foreground: 215 20% 65%;
          --accent: 217 33% 17%;
          --accent-foreground: 210 40% 98%;
          --border: 217 33% 17%;
        }
      `}</style>

      <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 lg:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
              <Link to={createPageUrl(isAdminPage ? 'AdminDashboard' : 'Home')} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">BookFlow</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    currentPageName === item.page
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              {isAdminPage && (
                <Link
                  to={createPageUrl('Home')}
                  className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Home className="w-4 h-4" />
                  Back to Site
                </Link>
              )}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                {user && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between h-full px-4 lg:px-8">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div className="flex-1" />

              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user.full_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                    {user.full_name?.charAt(0) || user.email?.charAt(0)}
                  </div>
                </div>
              )}
            </div>
          </header>

          <main className="p-4 lg:p-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </div>

      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}
