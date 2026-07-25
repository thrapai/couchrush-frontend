import ArticleRounded from '@mui/icons-material/ArticleRounded';
import AssignmentRounded from '@mui/icons-material/AssignmentRounded';
import AutoStoriesRounded from '@mui/icons-material/AutoStoriesRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import GroupsRounded from '@mui/icons-material/GroupsRounded';
import ManageAccountsRounded from '@mui/icons-material/ManageAccountsRounded';
import MeetingRoomRounded from '@mui/icons-material/MeetingRoomRounded';
import QuestionAnswerRounded from '@mui/icons-material/QuestionAnswerRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import SportsEsportsRounded from '@mui/icons-material/SportsEsportsRounded';
import TranslateRounded from '@mui/icons-material/TranslateRounded';
import type { ReactNode } from 'react';

export interface AdminNavItem {
  id: string;
  labelKey: string;
  icon: ReactNode;
  to?: string;
  descriptionKey?: string;
  requiredAnyPermissions?: string[];
  comingSoon?: boolean;
}

export interface AdminNavSection {
  id: string;
  labelKey: string;
  items: AdminNavItem[];
}

export const adminNavigationSections: AdminNavSection[] = [
  {
    id: 'overview',
    labelKey: 'admin.navigation.overview',
    items: [
      {
        id: 'overview',
        labelKey: 'admin.navigation.overview',
        icon: <DashboardRounded fontSize="small" />,
        to: '/admin',
        descriptionKey: 'admin.navigationDescriptions.overview',
      },
    ],
  },
  {
    id: 'users',
    labelKey: 'admin.navigation.users',
    items: [
      {
        id: 'users',
        labelKey: 'admin.navigation.users',
        icon: <GroupsRounded fontSize="small" />,
        to: '/admin/users',
        requiredAnyPermissions: ['users:read'],
        descriptionKey: 'admin.navigationDescriptions.users',
      },
    ],
  },
  {
    id: 'roles-permissions',
    labelKey: 'admin.navigation.rolesPermissions',
    items: [
      {
        id: 'roles-permissions',
        labelKey: 'admin.navigation.rolesPermissions',
        icon: <ManageAccountsRounded fontSize="small" />,
        to: '/admin/access',
        requiredAnyPermissions: ['roles:manage'],
        descriptionKey: 'admin.navigationDescriptions.rolesPermissions',
      },
    ],
  },
  {
    id: 'content',
    labelKey: 'admin.navigation.content',
    items: [
      {
        id: 'games',
        labelKey: 'admin.navigation.games',
        icon: <SportsEsportsRounded fontSize="small" />,
        requiredAnyPermissions: ['games:read'],
        comingSoon: true,
      },
      {
        id: 'question-sets',
        labelKey: 'admin.navigation.questionSets',
        icon: <AutoStoriesRounded fontSize="small" />,
        requiredAnyPermissions: ['games:read'],
        comingSoon: true,
      },
      {
        id: 'questions',
        labelKey: 'admin.navigation.questions',
        icon: <QuestionAnswerRounded fontSize="small" />,
        requiredAnyPermissions: ['games:read'],
        comingSoon: true,
      },
      {
        id: 'translations',
        labelKey: 'admin.navigation.translations',
        icon: <TranslateRounded fontSize="small" />,
        requiredAnyPermissions: ['games:read'],
        comingSoon: true,
      },
    ],
  },
  {
    id: 'operations',
    labelKey: 'admin.navigation.operations',
    items: [
      {
        id: 'rooms',
        labelKey: 'admin.navigation.rooms',
        icon: <MeetingRoomRounded fontSize="small" />,
        requiredAnyPermissions: ['rooms:read'],
        comingSoon: true,
      },
      {
        id: 'game-sessions',
        labelKey: 'admin.navigation.gameSessions',
        icon: <AssignmentRounded fontSize="small" />,
        requiredAnyPermissions: ['sessions:read'],
        comingSoon: true,
      },
    ],
  },
  {
    id: 'system',
    labelKey: 'admin.navigation.system',
    items: [
      {
        id: 'audit-logs',
        labelKey: 'admin.navigation.auditLogs',
        icon: <ArticleRounded fontSize="small" />,
        requiredAnyPermissions: ['audit:read'],
        comingSoon: true,
      },
      {
        id: 'settings',
        labelKey: 'admin.navigation.settings',
        icon: <SettingsRounded fontSize="small" />,
        requiredAnyPermissions: ['settings:manage'],
        comingSoon: true,
      },
    ],
  },
];

export function hasAnyPermission(userPermissions: string[], requiredAnyPermissions?: string[]) {
  if (!requiredAnyPermissions || requiredAnyPermissions.length === 0) {
    return true;
  }

  return requiredAnyPermissions.some((permission) => userPermissions.includes(permission));
}
