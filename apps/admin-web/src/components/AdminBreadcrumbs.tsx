import NavigateNextRounded from '@mui/icons-material/NavigateNextRounded';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { AdminBreadcrumb } from '../config/adminNavigation';

interface AdminBreadcrumbsProps {
  items: AdminBreadcrumb[];
}

export function AdminBreadcrumbs({ items }: AdminBreadcrumbsProps) {
  return (
    <Breadcrumbs separator={<NavigateNextRounded fontSize="small" />} aria-label="Breadcrumbs">
      {items.map((item, index) =>
        item.to && index < items.length - 1 ? (
          <Link key={`${item.label}-${index}`} component={RouterLink} underline="hover" color="inherit" to={item.to}>
            {item.label}
          </Link>
        ) : (
          <Typography key={`${item.label}-${index}`} color="text.secondary">
            {item.label}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  );
}
