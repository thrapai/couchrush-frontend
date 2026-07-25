import CloseRounded from '@mui/icons-material/CloseRounded';
import ExpandLessRounded from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import KeyboardDoubleArrowLeftRounded from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRounded from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import { Box, Typography } from '@mui/material';
import type { CurrentUserResponse } from '@couchrush/api-client';
import { useTranslation } from '@couchrush/i18n';
import { couchRushFonts } from '@couchrush/theme';
import { PortalSidebar, type PortalSidebarItem, type PortalSidebarSection } from '@couchrush/ui';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminNavigationSections, hasAnyPermission } from '../config/adminNavigation';
import { UserMenu } from './UserMenu';

interface AdminSidebarProps {
  user: CurrentUserResponse;
  permissions: string[];
  collapsed?: boolean;
  onToggleDesktop?: () => void;
  onLogout?: () => Promise<void>;
  onNavigate?: () => void;
  onClose?: () => void;
}

export function AdminSidebar({
  user,
  permissions,
  collapsed = false,
  onToggleDesktop,
  onLogout,
  onNavigate,
  onClose,
}: AdminSidebarProps) {
  const { t } = useTranslation(['admin', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const sections = useMemo<PortalSidebarSection[]>(
    () =>
      adminNavigationSections
        .map((section) => ({
          id: section.id,
          label: t(section.labelKey),
          items: section.items
            .filter((item) => hasAnyPermission(permissions, item.requiredAnyPermissions))
            .map((item) => ({
              id: item.id,
              label: t(item.labelKey),
              icon: item.icon,
              href: item.to,
              description: item.descriptionKey ? t(item.descriptionKey) : undefined,
              disabled: item.comingSoon || !item.to,
              disabledBadgeLabel: item.comingSoon ? t('admin.navigation.soon') : undefined,
            })),
        }))
        .filter((section) => section.items.length > 0),
    [permissions, t],
  );

  const selectedItemId = useMemo(() => {
    const selectedItem = adminNavigationSections
      .flatMap((section) => section.items)
      .find((item) => item.to === location.pathname);

    return selectedItem?.id;
  }, [location.pathname]);

  function handleItemSelect(item: PortalSidebarItem) {
    const adminItem = adminNavigationSections
      .flatMap((section) => section.items)
      .find((navigationItem) => navigationItem.id === item.id);

    if (!adminItem?.to || adminItem.comingSoon) {
      return;
    }

    navigate(adminItem.to);
    onNavigate?.();
  }

  return (
    <PortalSidebar
      sections={sections}
      selectedItemId={selectedItemId}
      collapsed={collapsed}
      collapsedPinnedItemIds={['overview', 'users', 'roles-permissions']}
      brand={
        <Typography
          variant="h5"
          sx={{
            fontFamily: couchRushFonts.display,
            letterSpacing: 0,
            lineHeight: 1,
            fontSize: { xs: '1.4rem', md: '1.6rem' },
            whiteSpace: 'nowrap',
          }}
        >
          CouchRush
        </Typography>
      }
      collapsedLogo={<Box component="img" src="/logo.png" alt={t('common:common.brand.logoAlt')} sx={{ display: 'block', width: 32, height: 'auto' }} />}
      openIcon={<KeyboardDoubleArrowRightRounded sx={{ fontSize: 26 }} />}
      closeIcon={<KeyboardDoubleArrowLeftRounded sx={{ fontSize: 26 }} />}
      mobileCloseIcon={<CloseRounded />}
      moreIcon={<MoreHorizRounded fontSize="small" />}
      expandSectionIcon={<ExpandMoreRounded fontSize="small" color="disabled" />}
      collapseSectionIcon={<ExpandLessRounded fontSize="small" color="disabled" />}
      footer={<UserMenu user={user} onLogout={onLogout ?? (async () => {})} collapsed={collapsed} />}
      labels={{
        openSidebar: t('admin.shell.openSidebar'),
        collapseSidebar: t('admin.shell.collapseSidebar'),
        closeNavigation: t('admin.shell.closeNavigation'),
        more: t('admin.shell.more'),
      }}
      onToggleCollapsed={onToggleDesktop}
      onClose={onClose}
      onItemSelect={handleItemSelect}
    />
  );
}
