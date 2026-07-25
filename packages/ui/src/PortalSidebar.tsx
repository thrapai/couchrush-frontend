import {
  Box,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
} from '@mui/material';
import type { MouseEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';

const SIDEBAR_TRANSITION = 'all 220ms cubic-bezier(0.2, 0, 0, 1)';
const HEADER_HEIGHT = 64;
const RAIL_ITEM_WIDTH = 56;
const NAV_ITEM_HEIGHT = 50;
const NAV_ICON_COLUMN_WIDTH = 56;

export interface PortalSidebarItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  description?: string;
  disabled?: boolean;
  disabledBadgeLabel?: string;
}

export interface PortalSidebarSection {
  id: string;
  label: string;
  items: PortalSidebarItem[];
}

export interface PortalSidebarProps {
  sections: PortalSidebarSection[];
  selectedItemId?: string;
  collapsed?: boolean;
  collapsedPinnedItemIds?: string[];
  brand: ReactNode;
  collapsedLogo: ReactNode;
  openIcon: ReactNode;
  closeIcon: ReactNode;
  mobileCloseIcon?: ReactNode;
  moreIcon: ReactNode;
  expandSectionIcon?: ReactNode;
  collapseSectionIcon?: ReactNode;
  footer?: ReactNode;
  labels?: {
    openSidebar?: string;
    collapseSidebar?: string;
    closeNavigation?: string;
    more?: string;
  };
  onToggleCollapsed?: () => void;
  onClose?: () => void;
  onItemSelect?: (item: PortalSidebarItem) => void;
}

export function PortalSidebar({
  sections,
  selectedItemId,
  collapsed = false,
  collapsedPinnedItemIds = [],
  brand,
  collapsedLogo,
  openIcon,
  closeIcon,
  mobileCloseIcon,
  moreIcon,
  expandSectionIcon,
  collapseSectionIcon,
  footer,
  labels,
  onToggleCollapsed,
  onClose,
  onItemSelect,
}: PortalSidebarProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [moreAnchorEl, setMoreAnchorEl] = useState<HTMLElement | null>(null);
  const [isCollapsedRailHovered, setIsCollapsedRailHovered] = useState(false);
  const visibleSections = useMemo(
    () => sections.filter((section) => section.items.length > 0),
    [sections],
  );
  const collapsedItems = useMemo(() => visibleSections.flatMap((section) => section.items), [visibleSections]);
  const pinnedCollapsedItems = collapsedItems.filter((item) => collapsedPinnedItemIds.includes(item.id));
  const overflowCollapsedItems = collapsedItems.filter((item) => !collapsedPinnedItemIds.includes(item.id));

  function toggleSection(id: string) {
    setCollapsedSections((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function handleItemSelect(item: PortalSidebarItem) {
    if (!item.disabled) {
      onItemSelect?.(item);
    }
  }

  function handleOverflowItemSelect(item: PortalSidebarItem) {
    setMoreAnchorEl(null);
    handleItemSelect(item);
  }

  return (
    <Box
      sx={{
        width: { xs: 'min(320px, 100vw)', md: collapsed ? 88 : 280 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: SIDEBAR_TRANSITION,
      }}
      onMouseEnter={() => {
        if (collapsed) {
          setIsCollapsedRailHovered(true);
        }
      }}
      onMouseLeave={() => setIsCollapsedRailHovered(false)}
    >
      <Box
        sx={{
          px: 1.25,
          py: 1.25,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: HEADER_HEIGHT,
          transition: SIDEBAR_TRANSITION,
        }}
      >
        {collapsed ? (
          <Tooltip title={labels?.openSidebar ?? 'Open sidebar'}>
            <IconButton
              aria-label={labels?.openSidebar ?? 'Open sidebar'}
              onClick={onToggleCollapsed}
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                width: RAIL_ITEM_WIDTH,
                height: NAV_ITEM_HEIGHT,
                borderRadius: 1,
                p: 0,
                transition: SIDEBAR_TRANSITION,
              }}
            >
              <Box sx={{ width: 32, height: 32, display: 'grid', placeItems: 'center' }}>
                {isCollapsedRailHovered ? openIcon : collapsedLogo}
              </Box>
            </IconButton>
          </Tooltip>
        ) : (
          <>
            {brand}
            <Tooltip title={labels?.collapseSidebar ?? 'Collapse sidebar'}>
              <IconButton
                aria-label={labels?.collapseSidebar ?? 'Collapse sidebar'}
                onClick={onToggleCollapsed}
                sx={{
                  display: { xs: 'none', md: 'inline-flex' },
                  width: RAIL_ITEM_WIDTH,
                  height: NAV_ITEM_HEIGHT,
                  borderRadius: 1,
                  p: 0,
                  transition: SIDEBAR_TRANSITION,
                }}
              >
                <Box sx={{ width: 32, height: 32, display: 'grid', placeItems: 'center' }}>{closeIcon}</Box>
              </IconButton>
            </Tooltip>
          </>
        )}
        {onClose && mobileCloseIcon ? (
          <IconButton
            aria-label={labels?.closeNavigation ?? 'Close navigation'}
            onClick={onClose}
            sx={{ display: { md: 'none' }, position: 'absolute', top: 12, right: 12 }}
          >
            {mobileCloseIcon}
          </IconButton>
        ) : null}
      </Box>

      <Stack
        spacing={collapsed ? 0.75 : 1.1}
        sx={{
          px: 1.25,
          py: 1.5,
          overflowY: 'auto',
          flex: 1,
          scrollbarWidth: 'thin',
          scrollbarColor: 'color-mix(in srgb, var(--couchrush-palette-primary-main), transparent 35%) transparent',
          transition: SIDEBAR_TRANSITION,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 999,
            backgroundColor: 'color-mix(in srgb, var(--couchrush-palette-primary-main), transparent 35%)',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'var(--couchrush-palette-primary-main)',
          },
        }}
      >
        {collapsed ? (
          <List disablePadding sx={{ display: 'grid', gap: 0.5, p: 0, m: 0 }}>
            {pinnedCollapsedItems.map((item) => (
              <PortalSidebarNavItem
                key={item.id}
                item={item}
                selected={item.id === selectedItemId}
                collapsed
                onSelect={handleItemSelect}
              />
            ))}
            {overflowCollapsedItems.length > 0 ? (
              <>
                <Tooltip title={labels?.more ?? 'More'}>
                  <ListItemButton
                    onClick={(event) => setMoreAnchorEl(event.currentTarget)}
                    sx={{
                      minHeight: NAV_ITEM_HEIGHT,
                      width: RAIL_ITEM_WIDTH,
                      borderRadius: 1,
                      justifyContent: 'center',
                      px: 0,
                      alignItems: 'center',
                      mx: 'auto',
                      transition: SIDEBAR_TRANSITION,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>{moreIcon}</ListItemIcon>
                  </ListItemButton>
                </Tooltip>
                <Menu anchorEl={moreAnchorEl} open={Boolean(moreAnchorEl)} onClose={() => setMoreAnchorEl(null)} keepMounted>
                  {overflowCollapsedItems.map((item) => (
                    <MenuItem
                      key={item.id}
                      disabled={item.disabled}
                      onClick={() => handleOverflowItemSelect(item)}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} secondary={item.description} />
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : null}
          </List>
        ) : (
          visibleSections.map((section) => {
            if (section.items.length === 1) {
              return (
                <List key={section.id} disablePadding sx={{ display: 'grid', gap: 0.5, p: 0, m: 0 }}>
                  <PortalSidebarNavItem
                    item={section.items[0]}
                    selected={section.items[0].id === selectedItemId}
                    collapsed={false}
                    onSelect={handleItemSelect}
                  />
                </List>
              );
            }

            return (
              <Box key={section.id}>
                <ListItemButton
                  onClick={() => toggleSection(section.id)}
                  sx={{
                    minHeight: 30,
                    px: 1,
                    py: 0.375,
                    borderRadius: 1,
                  }}
                >
                  <ListItemText
                    primary={section.label}
                    slotProps={{
                      primary: {
                        variant: 'overline',
                        color: 'text.secondary',
                      },
                    }}
                  />
                  {collapsedSections[section.id] ? expandSectionIcon : collapseSectionIcon}
                </ListItemButton>
                <Collapse in={!collapsedSections[section.id]} timeout="auto" unmountOnExit={false}>
                  <List disablePadding sx={{ display: 'grid', gap: 0.5, mt: 0.5, p: 0, m: 0 }}>
                    {section.items.map((item) => (
                      <PortalSidebarNavItem
                        key={item.id}
                        item={item}
                        selected={item.id === selectedItemId}
                        collapsed={false}
                        onSelect={handleItemSelect}
                      />
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          })
        )}
      </Stack>

      {footer ? (
        <Box
          sx={{
            px: 1.25,
            py: 1,
            mt: 'auto',
            display: collapsed ? 'flex' : 'block',
            justifyContent: collapsed ? 'center' : undefined,
            transition: SIDEBAR_TRANSITION,
          }}
        >
          {footer}
        </Box>
      ) : null}
    </Box>
  );
}

interface PortalSidebarNavItemProps {
  item: PortalSidebarItem;
  selected: boolean;
  collapsed: boolean;
  onSelect: (item: PortalSidebarItem) => void;
}

function PortalSidebarNavItem({ item, selected, collapsed, onSelect }: PortalSidebarNavItemProps) {
  const isLink = Boolean(item.href && !item.disabled);

  return (
    <Tooltip title={collapsed ? item.label : ''} placement="right" disableHoverListener={!collapsed}>
      <ListItemButton
        component={isLink ? 'a' : 'div'}
        href={isLink ? item.href : undefined}
        selected={selected}
        disabled={item.disabled}
        onClick={(event: MouseEvent<HTMLAnchorElement | HTMLDivElement>) => {
          if (isLink) {
            event.preventDefault();
          }
          onSelect(item);
        }}
        sx={{
          minHeight: NAV_ITEM_HEIGHT,
          width: collapsed ? RAIL_ITEM_WIDTH : '100%',
          borderRadius: 1,
          justifyContent: collapsed ? 'center' : 'flex-start',
          pl: 0,
          pr: collapsed ? 0 : 1.25,
          alignItems: 'center',
          mx: collapsed ? 'auto' : 0,
          transition: SIDEBAR_TRANSITION,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 0 : NAV_ICON_COLUMN_WIDTH,
            width: collapsed ? 'auto' : NAV_ICON_COLUMN_WIDTH,
            justifyContent: 'center',
            transition: SIDEBAR_TRANSITION,
          }}
        >
          {item.icon}
        </ListItemIcon>
        {!collapsed ? (
          <>
            <ListItemText
              primary={item.label}
              secondary={item.description}
              slotProps={{
                primary: {
                  variant: 'body2',
                  noWrap: true,
                },
                secondary: {
                  variant: 'caption',
                  noWrap: true,
                  title: item.description,
                },
              }}
              sx={{
                my: 0,
                minWidth: 0,
                transition: SIDEBAR_TRANSITION,
                '& .MuiListItemText-primary': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
                '& .MuiListItemText-secondary': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              }}
            />
            {item.disabledBadgeLabel ? (
              <Chip size="small" label={item.disabledBadgeLabel} color="default" />
            ) : null}
          </>
        ) : null}
      </ListItemButton>
    </Tooltip>
  );
}
