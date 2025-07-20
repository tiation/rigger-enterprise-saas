'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Award,
  Calendar,
  MapPin,
  Bell,
  User,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

interface WorkerDashboard {
  activeJobs: number;
  totalEarnings: number;
  hoursWorked: number;
  jobsCompleted: number;
}

interface JobAlert {
  id: string;
  title: string;
  company: string;
  location: string;
  payRate: string;
  matchScore: number;
  postedAt: string;
}

export default function WorkerIntranetHome() {
  const [stats, setStats] = useState<WorkerDashboard>({
    activeJobs: 0,
    totalEarnings: 0,
    hoursWorked: 0,
    jobsCompleted: 0
  });

  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        activeJobs: 2,
        totalEarnings: 3240,
        hoursWorked: 186,
        jobsCompleted: 12
      });

      setJobAlerts([
        {
          id: '1',
          title: 'Senior Rigger - Mining Project',
          company: 'BHP Mining Operations',
          location: 'Pilbara, WA',
          payRate: '$48/hr',
          matchScore: 95,
          postedAt: '2 hours ago'
        },
        {
          id: '2',
          title: 'Lead Scaffolder - CBD Tower',
          company: 'Urban Construction Ltd',
          location: 'Perth CBD, WA',
          payRate: '$45/hr',
          matchScore: 88,
          postedAt: '4 hours ago'
        }
      ]);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: Briefcase,
      color: 'from-blue-500 to-blue-600',
      change: '+1 this week'
    },
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      change: '+$420 this week'
    },
    {
      title: 'Hours Worked',
      value: stats.hoursWorked,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      change: '+12 this week'
    },
    {
      title: 'Jobs Completed',
      value: stats.jobsCompleted,
      icon: CheckCircle,
      color: 'from-orange-500 to-orange-600',
      change: '+2 this month'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, Jake!</h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your work</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Jake Thompson</p>
                  <p className="text-sm text-gray-600">Senior Rigger</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-green-600 font-medium">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Alerts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Job Matches</h2>
                    <p className="text-sm text-gray-600">Perfect matches based on your skills</p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  {jobAlerts.length} new
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {jobAlerts.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-gray-600 text-sm">{job.company}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {job.matchScore}% match
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {job.payRate}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {job.postedAt}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions & Schedule */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <motion.button
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Browse Jobs</p>
                      <p className="text-sm text-gray-600">Find new opportunities</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Update Profile</p>
                      <p className="text-sm text-gray-600">Keep skills current</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Award className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Certifications</p>
                      <p className="text-sm text-gray-600">Manage credentials</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* This Week's Schedule */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">This Week</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Mon-Wed</p>
                      <p className="text-sm text-gray-600">BHP Site A</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-blue-600">24 hrs</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Thu-Fri</p>
                      <p className="text-sm text-gray-600">CBD Tower Project</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">16 hrs</span>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">Total: 40 hours scheduled</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}