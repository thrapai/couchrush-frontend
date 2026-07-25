import ArticleRounded from '@mui/icons-material/ArticleRounded';
import AssignmentRounded from '@mui/icons-material/AssignmentRounded';
import AutoStoriesRounded from '@mui/icons-material/AutoStoriesRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import GroupsRounded from '@mui/icons-material/GroupsRounded';
import ManageAccountsRounded from '@mui/icons-material/ManageAccountsRounded';
import MeetingRoomRounded from '@mui/icons-material/MeetingRoomRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import QuestionAnswerRounded from '@mui/icons-material/QuestionAnswerRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import SportsEsportsRounded from '@mui/icons-material/SportsEsportsRounded';
import TranslateRounded from '@mui/icons-material/TranslateRounded';
import type { ReactNode } from 'react';

export interface AdminBreadcrumb {
  label: string;
  to?: string;
}

export interface AdminNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  to?: string;
  description?: string;
  requiredAnyPermissions?: string[];
  comingSoon?: boolean;
}

export interface AdminNavSection {
  label: string;
  items: AdminNavItem[];
}

export interface AdminRouteMeta {
  title: string;
  breadcrumbs: AdminBreadcrumb[];
}

export const adminNavigationSections: AdminNavSection[] = [
  {
    label: 'Overview',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        icon: <DashboardRounded fontSize="small" />,
        to: '/admin',
        description: 'Portal landing page',
      },
    ],
  },
  {
    label: 'Access Management',
    items: [
      {
        id: 'users',
        label: 'Users',
        icon: <GroupsRounded fontSize="small" />,
        to: '/admin/users',
        requiredAnyPermissions: ['users:read'],
        description: 'User directory and access',
      },
      {
        id: 'roles-permissions',
        label: 'Roles & Permissions',
        icon: <ManageAccountsRounded fontSize="small" />,
        to: '/admin/access',
        requiredAnyPermissions: ['roles:manage'],
        description: 'Role assignment controls',
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        id: 'my-profile',
        label: 'My Profile',
        icon: <PersonRounded fontSize="small" />,
        to: '/admin/profile',
        description: 'Your account details',
      },
    ],
  },
  {
    label: 'Content',
    items: [
      {
        id: 'games',
        label: 'Games',
        icon: <SportsEsportsRounded fontSize="small" />,
        requiredAnyPermissions: ['games:read'],
        comingSoon: true,
      },
      {
        id: 'question-sets',
        label: 'Question Sets',
        icon: <AutoStoriesRounded fontSize="small" />,
        requiredAnyPermissions: ['games:read'],
        comingSoon: true,
      },
      {
        id: 'questions',
        label: 'Questions',
        icon: <QuestionAnswerRounded fontSize="small" />,
        requiredAnyPermissions: ['games:read'],
        comingSoon: true,
      },
      {
        id: 'translations',
        label: 'Translations',
        icon: <TranslateRounded fontSize="small" />,
        requiredAnyPermissions: ['games:read'],
        comingSoon: true,
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      {
        id: 'rooms',
        label: 'Rooms',
        icon: <MeetingRoomRounded fontSize="small" />,
        requiredAnyPermissions: ['rooms:read'],
        comingSoon: true,
      },
      {
        id: 'game-sessions',
        label: 'Game Sessions',
        icon: <AssignmentRounded fontSize="small" />,
        requiredAnyPermissions: ['sessions:read'],
        comingSoon: true,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        icon: <ArticleRounded fontSize="small" />,
        requiredAnyPermissions: ['audit:read'],
        comingSoon: true,
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <SettingsRounded fontSize="small" />,
        requiredAnyPermissions: ['settings:manage'],
        comingSoon: true,
      },
    ],
  },
];

const routeMetaByPath: Record<string, AdminRouteMeta> = {
  '/admin': {
    title: 'Overview',
    breadcrumbs: [{ label: 'Admin' }],
  },
  '/admin/users': {
    title: 'Users',
    breadcrumbs: [
      { label: 'Admin', to: '/admin' },
      { label: 'Users' },
    ],
  },
  '/admin/access': {
    title: 'Roles & Permissions',
    breadcrumbs: [
      { label: 'Admin', to: '/admin' },
      { label: 'Roles & Permissions' },
    ],
  },
  '/admin/profile': {
    title: 'My Profile',
    breadcrumbs: [
      { label: 'Admin', to: '/admin' },
      { label: 'My Profile' },
    ],
  },
};

export function hasAnyPermission(userPermissions: string[], requiredAnyPermissions?: string[]) {
  if (!requiredAnyPermissions || requiredAnyPermissions.length === 0) {
    return true;
  }

  return requiredAnyPermissions.some((permission) => userPermissions.includes(permission));
}

export function getAdminRouteMeta(pathname: string): AdminRouteMeta {
  return routeMetaByPath[pathname] ?? routeMetaByPath['/admin'];
}
