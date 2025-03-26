"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageTransitionWrapper } from '@/components/page-transition';
import { ChevronDown, User, BarChart2, Map, Calendar, Settings, LogOut, Menu, X, Clock, CheckCircle, XCircle } from 'lucide-react';

// Type definitions
interface UserType {
  email?: string;
  // Add other user properties as needed
}

interface PlanType {
  id: string;
  status: 'active' | 'awaiting' | 'declined';
  selectedAt?: {
    seconds: number;
  };
}

interface PlanFeatures {
  name: string;
  price: string;
  features: string[];
}

interface PlansDirectory {
  [key: string]: PlanFeatures;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  userPlan: PlanType | null;
  logout: () => void;
}

// Component props interfaces
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  logout: () => void;
}

interface PlanStatusProps {
  plan: PlanType | null;
  user: UserType | null;
}

// Sidebar navigation component
const Sidebar = ({ isOpen, toggleSidebar, logout }: SidebarProps) => {
  const navItems = [
    { icon: BarChart2, label: 'Dashboard', href: '/dashboard' },
    { icon: Map, label: 'Projects', href: '/dashboard/projects' },
    { icon: Calendar, label: 'Schedule', href: '/dashboard/schedule' },
    { icon: User, label: 'Teams', href: '/dashboard/teams' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
        initial={{ x: -64 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-xl font-bold text-white">
                <span className="font-light">Field</span>X
              </div>
            </Link>
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={toggleSidebar}
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link href={item.href} key={item.label}>
                <motion.div
                  className={`flex items-center px-3 py-3 text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors group ${
                    item.label === 'Dashboard' ? 'bg-gray-800 text-white' : ''
                  }`}
                  whileHover={{ x: 5 }}
                >
                  <item.icon size={18} className="mr-3" />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-800">
            <motion.button
              onClick={logout}
              className="flex items-center w-full px-3 py-3 text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
              whileHover={{ x: 5 }}
            >
              <LogOut size={18} className="mr-3" />
              <span>Log out</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

const PlanStatus = ({ plan, user }: PlanStatusProps) => {
    if (!plan) {
      return (
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
          <BarChart2 size={48} className="text-gray-500 mb-4" />
          <h3 className="text-xl font-light mb-2">No Plan Selected</h3>
          <p className="text-gray-400 text-sm mb-6">You haven't selected a pricing plan yet.</p>
          <Link href="/apply" className="inline-block">
            <motion.button
              className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-md font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Choose a Plan
            </motion.button>
          </Link>
        </div>
      );
    }
  
    const plans: PlansDirectory = {
      basic: {
        name: 'Basic',
        price: '49€',
        features: [
          'Up to 2 users',
          'Basic FTTH management tools',
          'Unlimited projects',
          'Basic dashboard',
          'Email support',
        ]
      },
      pro: {
        name: 'Pro',
        price: '99€',
        features: [
          'Up to 10 users',
          'Advanced management tools',
          'Unlimited projects',
          'Advanced dashboard',
          'Phone support',
          'AI suggestions',
          'API access',
          'Basic analytics',
        ]
      },
      enterprise: {
        name: 'Enterprise',
        price: '249€',
        features: [
          'Unlimited users',
          'Complete management tools',
          'Unlimited projects',
          'Custom dashboard',
          '24/7 dedicated support',
          'AI suggestions & automation',
          'Advanced API',
          'Advanced analytics',
        ]
      }
    };
  
    const selectedPlan = plans[plan.id];
    
    return (
      <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-light mb-1">{selectedPlan.name} Plan</h3>
            <div className="mb-2">
              <span className="text-3xl font-light">{selectedPlan.price}</span>
              <span className="text-gray-400 text-sm">/ month</span>
            </div>
          </div>
          
          <div 
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              plan.status === 'active' 
                ? 'bg-green-500/20 text-green-400' 
                : plan.status === 'awaiting' 
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
            }`}
            data-plan-status
          >
            {plan.status === 'active' ? (
              <>
                <CheckCircle size={16} className="mr-2" />
                Active
              </>
            ) : plan.status === 'awaiting' ? (
              <>
                <Clock size={16} className="mr-2" />
                Awaiting Approval
              </>
            ) : (
              <>
                <XCircle size={16} className="mr-2" />
                Declined
              </>
            )}
          </div>
        </div>
        
        {plan.status === 'awaiting' && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-md text-sm">
            <p className="text-blue-400">
              Your plan selection is currently awaiting approval from the FieldX team. 
              We typically process requests within 24 hours.
              {user?.email === 'garvanitis@applink.gr' && (
                <span className="block mt-2 italic">
                  As a developer test account, your plan will be auto-approved shortly.
                </span>
              )}
            </p>
          </div>
        )}
        
        <div className="border-t border-gray-800 pt-4">
          <p className="text-sm font-medium text-gray-300 mb-3">Included Features:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedPlan.features.map((feature: string, idx: number) => (
              <div key={idx} className="flex items-start">
                <CheckCircle size={16} className="text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {plan.selectedAt && (
          <div className="mt-6 text-xs text-gray-500">
            Selected on: {new Date(plan.selectedAt.seconds * 1000).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  };
  
export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading, userPlan, logout } = useAuth() as AuthContextType;
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Check if user is logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <PageTransitionWrapper>
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 py-4 px-6 flex items-center justify-between md:pl-64">
          <button
            className="md:hidden text-gray-400 hover:text-white focus:outline-none"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center space-x-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="font-medium">{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <span className="hidden md:inline-block">{user?.email || 'User'}</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} logout={logout} />
        
        {/* Main content */}
        <main className="flex-1 md:ml-64 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-light">Dashboard</h1>
            <p className="text-gray-400 mt-2">Welcome back to your FieldX management dashboard</p>
          </div>
          
          {/* Pricing Plan Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light">Your Subscription</h2>
              {userPlan && (
                <Link href="/apply">
                  <span className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Change Plan
                  </span>
                </Link>
              )}
            </div>
            
            <PlanStatus plan={userPlan} user={user} />
          </div>
          
          {/* Quick Stats */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light">Quick Stats</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Projects</p>
                    <h3 className="text-2xl font-light mt-2">0</h3>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <Map size={20} className="text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Tasks</p>
                    <h3 className="text-2xl font-light mt-2">0</h3>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <Calendar size={20} className="text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Team Members</p>
                    <h3 className="text-2xl font-light mt-2">1</h3>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <User size={20} className="text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Notifications</p>
                    <h3 className="text-2xl font-light mt-2">0</h3>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <BarChart2 size={20} className="text-blue-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Get Started Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light">Get Started</h2>
            </div>
            
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div className="p-6 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Complete your profile setup</p>
                    <p className="text-xs text-gray-500 mt-1">Add your company information and team members</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Map size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Create your first project</p>
                    <p className="text-xs text-gray-500 mt-1">Set up your first FTTH deployment project</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Schedule your first task</p>
                    <p className="text-xs text-gray-500 mt-1">Use the AI scheduler to optimize your field team's work</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageTransitionWrapper>
  );
}