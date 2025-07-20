'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign,
  User,
  Award,
  MessageSquare,
  Heart,
  MoreVertical
} from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  title: string;
  location: string;
  rating: number;
  hourlyRate: number;
  yearsExp: number;
  avatar?: string;
  skills: string[];
  certifications: string[];
  availability: 'AVAILABLE' | 'BUSY' | 'INACTIVE';
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: '1',
      name: 'Jake Thompson',
      title: 'Senior Rigger & Scaffolder',
      location: 'Perth, WA',
      rating: 4.8,
      hourlyRate: 45,
      yearsExp: 12,
      skills: ['Rigging', 'Scaffolding', 'Safety Management', 'Tower Crane'],
      certifications: ['WorkSafe WA', 'High Risk License', 'First Aid'],
      availability: 'AVAILABLE'
    },
    {
      id: '2',
      name: 'Sarah Mitchell',
      title: 'Lead Scaffolder',
      location: 'Sydney, NSW',
      rating: 4.9,
      hourlyRate: 42,
      yearsExp: 8,
      skills: ['Scaffolding', 'Heights Safety', 'Team Leadership'],
      certifications: ['SafeWork NSW', 'EWP License', 'White Card'],
      availability: 'AVAILABLE'
    },
    {
      id: '3',
      name: 'Mike Chen',
      title: 'Construction Rigger',
      location: 'Melbourne, VIC',
      rating: 4.7,
      hourlyRate: 38,
      yearsExp: 6,
      skills: ['Basic Rigging', 'Crane Operations', 'Steel Erection'],
      certifications: ['WorkSafe VIC', 'Crane License', 'White Card'],
      availability: 'BUSY'
    }
  ]);

  const availabilityColors = {
    AVAILABLE: 'bg-green-100 text-green-800',
    BUSY: 'bg-yellow-100 text-yellow-800',
    INACTIVE: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Workers</h1>
              <p className="text-gray-600 mt-1">Browse and connect with skilled construction workers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border mb-6 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name, skills, or location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>All Locations</option>
              <option>Perth, WA</option>
              <option>Sydney, NSW</option>
              <option>Melbourne, VIC</option>
            </select>
            <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Workers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {workers.map((worker, index) => (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                      <p className="text-sm text-gray-600">{worker.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium text-sm">{worker.rating}</span>
                    </div>
                    <p className="text-xs text-gray-600">Rating</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">${worker.hourlyRate}</span>
                    </div>
                    <p className="text-xs text-gray-600">Per Hour</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">{worker.yearsExp}y</span>
                    </div>
                    <p className="text-xs text-gray-600">Experience</p>
                  </div>
                </div>

                {/* Location & Availability */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{worker.location}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${availabilityColors[worker.availability]}`}>
                    {worker.availability}
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div className="px-6 pb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Top Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {worker.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                  {worker.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      +{worker.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="px-6 pb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Certifications</h4>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">{worker.certifications.length} active</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Contact</span>
                  </motion.button>
                  <motion.button
                    className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <User className="h-4 w-4" />
                    <span>View Profile</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <motion.button
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Load More Workers
          </motion.button>
        </div>
      </div>
    </div>
  );
}