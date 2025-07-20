'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Clock,
  Plus,
  Search,
  Filter,
  Bell
} from 'lucide-react';

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  workersHired: number;
  avgTimeToHire: string;
}

export default function BusinessPortalHome() {
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalApplications: 0,
    workersHired: 0,
    avgTimeToHire: '0 days'
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        activeJobs: 12,
        totalApplications: 147,
        workersHired: 43,
        avgTimeToHire: '3.2 days'
      });
    }, 1000);
  }, []);

  const statCards = [
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      change: '+2 this week'
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: Users,
      color: 'from-green-500 to-green-600', 
      change: '+23 this week'
    },
    {
      title: 'Workers Hired',
      value: stats.workersHired,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      change: '+5 this month'
    },
    {
      title: 'Avg Time to Hire',
      value: stats.avgTimeToHire,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      change: '-0.5 days'
    }
  ];

  return (
    <div className=\"min-h-screen bg-gray-50\">
      {/* Header */}
      <div className=\"bg-white shadow-sm border-b\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"flex justify-between items-center py-6\">
            <div>
              <h1 className=\"text-3xl font-bold text-gray-900\">
                Business Portal
              </h1>
              <p className=\"text-gray-600 mt-1\">
                Manage your workforce and job postings
              </p>
            </div>
            <div className=\"flex items-center space-x-4\">
              <button className=\"relative p-2 text-gray-400 hover:text-gray-600 transition-colors\">
                <Bell className=\"h-6 w-6\" />
                <span className=\"absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full\"></span>
              </button>
              <motion.button
                className=\"bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-700 transition-colors\"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className=\"h-4 w-4\" />
                <span>Post New Job</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
        {/* Stats Grid */}
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8\">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className=\"bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow\"
            >
              <div className=\"flex items-center justify-between mb-4\">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className=\"h-6 w-6 text-white\" />
                </div>
                <span className=\"text-sm text-green-600 font-medium\">
                  {stat.change}
                </span>
              </div>
              <h3 className=\"text-2xl font-bold text-gray-900 mb-1\">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </h3>
              <p className=\"text-gray-600 text-sm\">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-8\">
          {/* Recent Jobs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className=\"lg:col-span-2 bg-white rounded-xl shadow-sm border\"
          >
            <div className=\"p-6 border-b border-gray-200\">
              <div className=\"flex items-center justify-between\">
                <h2 className=\"text-xl font-semibold text-gray-900\">
                  Recent Job Postings
                </h2>
                <div className=\"flex items-center space-x-2\">
                  <button className=\"p-2 text-gray-400 hover:text-gray-600 transition-colors\">
                    <Search className=\"h-4 w-4\" />
                  </button>
                  <button className=\"p-2 text-gray-400 hover:text-gray-600 transition-colors\">
                    <Filter className=\"h-4 w-4\" />
                  </button>
                </div>
              </div>
            </div>
            <div className=\"p-6\">
              <div className=\"text-center py-12 text-gray-500\">
                <Briefcase className=\"h-12 w-12 mx-auto mb-4 text-gray-300\" />
                <p className=\"text-lg font-medium mb-2\">No jobs posted yet</p>
                <p className=\"text-sm mb-4\">Create your first job posting to start finding workers</p>
                <motion.button
                  className=\"bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors\"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Post Your First Job
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className=\"bg-white rounded-xl shadow-sm border\"
          >
            <div className=\"p-6 border-b border-gray-200\">
              <h2 className=\"text-xl font-semibold text-gray-900\">
                Quick Actions
              </h2>
            </div>
            <div className=\"p-6 space-y-4\">
              <motion.button
                className=\"w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all\"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className=\"flex items-center space-x-3\">
                  <div className=\"p-2 bg-blue-100 rounded-lg\">
                    <Plus className=\"h-4 w-4 text-blue-600\" />
                  </div>
                  <div>
                    <p className=\"font-medium text-gray-900\">Post New Job</p>
                    <p className=\"text-sm text-gray-600\">Find skilled workers</p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                className=\"w-full text-left p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all\"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className=\"flex items-center space-x-3\">
                  <div className=\"p-2 bg-green-100 rounded-lg\">
                    <Users className=\"h-4 w-4 text-green-600\" />
                  </div>
                  <div>
                    <p className=\"font-medium text-gray-900\">Browse Workers</p>
                    <p className=\"text-sm text-gray-600\">View available talent</p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                className=\"w-full text-left p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all\"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className=\"flex items-center space-x-3\">
                  <div className=\"p-2 bg-purple-100 rounded-lg\">
                    <TrendingUp className=\"h-4 w-4 text-purple-600\" />
                  </div>
                  <div>
                    <p className=\"font-medium text-gray-900\">View Analytics</p>
                    <p className=\"text-sm text-gray-600\">Track performance</p>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}