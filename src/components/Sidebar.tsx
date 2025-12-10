import React from 'react';
import { NavLink } from 'react-router-dom';
import { usePermissions } from '../hooks/useRedux';
import { 
  Home, 
  Plus, 
  Mail, 
  FileText, 
  Smartphone, 
  TestTube, 
  Users,
  Shield,
  Key,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  GitBranch,
  UserCheck,
  MessageSquare,
  Radio
} from 'lucide-react';
import { Boxes } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { hasPermission } = usePermissions();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, permission: 'read' },
    { path: '/templates/create', label: 'Notification Template Creation', icon: Plus, permission: 'create' },
    { path: '/templates/push-sms', label: 'New Push/SMS Template', icon: Smartphone, permission: 'create' },
    { path: '/alerts-dashboard', label: 'Alert Onboard', icon: FileText, permission: 'read' },
    { path: '/workflows', label: 'Workflows', icon: GitBranch, permission: 'read' },
    { path: '/workflows/builder', label: 'Workflow Builder', icon: GitBranch, permission: 'create' },
    { path: '/workflows/view', label: 'Workflow Demo', icon: GitBranch, permission: 'read' },
    { path: '/workflows/mapping', label: 'Workflow Mapping', icon: GitBranch, permission: 'create' },
    { path: '/approvals', label: 'Pending Approvals', icon: UserCheck, permission: 'read' },
    { path: '/workflows/admin', label: 'Workflow Dashboard', icon: GitBranch, permission: 'read' },
    { path: '/activities', label: 'Activities Dashboard', icon: Boxes, permission: 'read' },
    { path: '/workflows/actions', label: 'Workflow Actions', icon: GitBranch, permission: 'read' },
    { path: '/tasks', label: 'Task Management', icon: FileText, permission: 'read' },
    { path: '/tests', label: 'Notification Test', icon: TestTube, permission: 'read' },
    { path: '/rbac/users', label: 'RBAC > Users', icon: Users, permission: 'read' },
    { path: '/rbac/roles', label: 'RBAC > Roles', icon: Shield, permission: 'read' },
    { path: '/rbac/permissions', label: 'RBAC > Permissions', icon: Key, permission: 'read' },
    { path: '/message-specs', label: 'Message Spec', icon: MessageSquare, permission: 'read' },
    { path: '/impact-assessments', label: 'Impact Assessments', icon: FileText, permission: 'read' },
    { path: '/build-validation', label: 'Build Validation', icon: GitBranch, permission: 'read' },
    { path: '/broadcast-alerts', label: 'Broadcast Alerts', icon: Radio, permission: 'read' },
  ];

  const filteredNavItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <div className={`bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full shadow-sm`}>
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-wf-red via-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
                <AlertTriangle className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  Alerts Studio
                </h1>
                <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                  Wells Fargo
                </p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-slate-400" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-slate-400" />
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950 dark:to-blue-950/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-4 border-blue-600 dark:border-blue-400 pl-2'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
            {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;