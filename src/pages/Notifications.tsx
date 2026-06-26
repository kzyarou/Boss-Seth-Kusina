import React, { useEffect } from 'react';
import { Bell, Heart, MessageCircle, Star, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
export function Notifications() {
  const { notifications, markNotificationsRead, markAllAsRead, currentUser } =
  useAppContext();
  useEffect(() => {
    return () => {
      markNotificationsRead();
    };
  }, []);
  if (!currentUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">
          Mag-login ka muna para makita ang notifs, boss.
        </h2>
      </div>);

  }
  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500 fill-current" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500 fill-current" />;
      case 'feature':
        return <Star className="w-5 h-5 text-amber-500 fill-current" />;
      default:
        return <Info className="w-5 h-5 text-stone-500" />;
    }
  };
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-stone-900">
          Mga Notipikasyon
        </h1>
        {notifications.some((n) => !n.read) &&
        <button
          onClick={markAllAsRead}
          className="text-sm font-semibold text-primary-600 hover:text-primary-700">
          
            Markahan lahat na nabasa na
          </button>
        }
      </div>

      {notifications.length > 0 ?
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          {notifications.map((notification) =>
        <div
          key={notification.id}
          className={`p-4 sm:p-6 flex items-start gap-4 transition-colors hover:bg-stone-50 ${!notification.read ? 'bg-primary-50/30' : ''}`}>
          
              <div className="mt-1 bg-white p-2 rounded-full shadow-sm border border-stone-100 shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p
              className={`text-stone-800 ${!notification.read ? 'font-semibold' : ''}`}>
              
                  {notification.text}
                </p>
                <span className="text-sm text-stone-500 mt-1 block">
                  {notification.timestamp}
                </span>
              </div>
              {!notification.read &&
          <div className="w-2.5 h-2.5 bg-primary-500 rounded-full mt-2 shrink-0" />
          }
            </div>
        )}
        </div> :

      <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <Bell className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-stone-900 mb-2">
            Wala pang notif, boss
          </h3>
          <p className="text-stone-500">
            Pag may pumansin sa luto mo, dito lalabas yun.
          </p>
        </div>
      }
    </div>);

}