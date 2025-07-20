'use client'

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home,
  Search,
  Calendar,
  Award,
  DollarSign,
  FileText,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  HardHat
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Find Jobs', href: '/jobs', icon: Search },
  { name: 'My Schedule', href: '/schedule', icon: Calendar },
  { name: 'Certifications', href: '/certifications', icon: Award },
  { name: 'Earnings', href: '/earnings', icon: DollarSign },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const bottomNavigation = [
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
  { name: 'Sign Out', href: '/logout', icon: LogOut },
];

export default function WorkerSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-slate-900 text-white flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <HardHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">RiggerHub</h2>
                <p className="text-xs text-slate-400">Worker Portal</p>
              </div>
            </motion.div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="h-4 w-4 text-slate-400" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-orange-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }
              `}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="font-medium"
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Worker Profile */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 border-t border-slate-700"
        >
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">JT</span>
              </div>
              <div>
                <p className="font-medium text-white text-sm">Jake Thompson</p>
                <p className="text-xs text-slate-400">Senior Rigger • Available</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Profile: 95% complete</span>
              <span className="text-orange-400">★ 4.8 rating</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-1">
                <div className="bg-orange-500 h-1 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        {bottomNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <item.icon className="h-5 w-5 text-slate-400" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="font-medium"
              >
                {item.name}
              </motion.span>
            )}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}