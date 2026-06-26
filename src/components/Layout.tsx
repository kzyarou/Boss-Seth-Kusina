import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusSquare,
  Bell,
  User as UserIcon,
  Home,
  Bookmark,
  LayoutDashboard,
  Menu } from
'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AuthModal } from './AuthModal';
export function Layout({ children }: {children: React.ReactNode;}) {
  const { currentUser, notifications } = useAppContext();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const handleProtectedAction = (path: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      navigate(path);
    }
  };
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top Navigation (Desktop & Mobile Header) */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/pasted-image.jpg"
              alt="Boss Seth Kusina"
              className="w-9 h-9 rounded-lg object-cover" />
            
            <span className="font-display font-bold text-xl hidden sm:block text-stone-900">
              Boss Seth Kusina
            </span>
          </Link>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Hanap ka ng luto o sahog..."
                className="w-full bg-stone-100 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-full py-2 pl-10 pr-4 outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter')
                  navigate(`/search?q=${e.currentTarget.value}`);
                }} />
              
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate('/search')}
              className="p-2 text-stone-600 hover:bg-stone-100 rounded-full md:hidden">
              
              <Search className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleProtectedAction('/upload')}
              className="hidden sm:flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full font-medium transition-colors">
              
              <PlusSquare className="w-5 h-5" />
              <span>Mag-Upload</span>
            </button>

            <button
              onClick={() => handleProtectedAction('/notifications')}
              className="relative p-2 text-stone-600 hover:bg-stone-100 rounded-full">
              
              <Bell className="w-6 h-6" />
              {unreadCount > 0 &&
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              }
            </button>

            {currentUser ?
            <div className="flex items-center gap-3">
                {currentUser.role === 'admin' &&
              <Link
                to="/admin"
                className="hidden sm:flex p-2 text-stone-600 hover:bg-stone-100 rounded-full">
                
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
              }
                <Link
                to="/profile"
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-stone-200 hover:border-primary-500 transition-colors">
                
                  <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-full h-full object-cover" />
                
                </Link>
              </div> :

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-stone-900 text-white px-5 py-2 rounded-full font-medium hover:bg-stone-800 transition-colors text-sm sm:text-base">
              
                Pasok
              </button>
            }
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full pb-20 md:pb-8 pt-4 md:pt-8 px-4">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 pb-safe z-40">
        <div className="flex items-center justify-around h-16 px-2">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/' ? 'text-primary-600' : 'text-stone-500'}`}>
            
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">Bahay</span>
          </Link>
          <Link
            to="/categories"
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/categories' ? 'text-primary-600' : 'text-stone-500'}`}>
            
            <Menu className="w-6 h-6" />
            <span className="text-[10px] font-medium">Kategorya</span>
          </Link>
          <button
            onClick={() => handleProtectedAction('/upload')}
            className="flex flex-col items-center justify-center w-full h-full space-y-1 text-stone-500">
            
            <div className="bg-primary-500 text-white p-2 rounded-xl -mt-4 shadow-lg shadow-primary-500/30">
              <PlusSquare className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium mt-1">Upload</span>
          </button>
          <button
            onClick={() => handleProtectedAction('/saved')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/saved' ? 'text-primary-600' : 'text-stone-500'}`}>
            
            <Bookmark className="w-6 h-6" />
            <span className="text-[10px] font-medium">Naka-Save</span>
          </button>
          <button
            onClick={() => handleProtectedAction('/profile')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/profile' ? 'text-primary-600' : 'text-stone-500'}`}>
            
            <UserIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Profayl</span>
          </button>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)} />
      
    </div>);

}