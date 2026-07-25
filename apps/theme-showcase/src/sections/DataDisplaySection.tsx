import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Checkbox,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { ShowcaseSection } from '../components/ShowcaseSection';

const rows = [
  { id: 1, team: 'Neon Ninjas', score: 1280, streak: 'Hot' },
  { id: 2, team: 'Pixel Patrol', score: 1190, streak: 'Rising' },
  { id: 3, team: 'Turbo Trivia', score: 1015, streak: 'Steady' },
  { id: 4, team: 'Arcade Echo', score: 950, streak: 'Recovering' },
  { id: 5, team: 'Bonus Rounders', score: 900, streak: 'Steady' },
];

export function DataDisplaySection() {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [selectedRows, setSelectedRows] = useState<number[]>([2]);

  const visibleRows = useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage],
  );

  return (
    <ShowcaseSection
      id="data-display"
      title="Data Display"
      description="Cards, surfaces, tables, and state examples using shared component overrides."
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <Card>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}>H</Avatar>}
            title="Host Spotlight"
            subheader="Tonight's live control surface"
          />
          <CardMedia
            sx={{
              height: 160,
              backgroundImage:
                'linear-gradient(135deg, rgba(255,255,255,0.04), transparent), repeating-linear-gradient(135deg, currentColor 0 2px, transparent 2px 18px)',
              backgroundColor: 'surfaceRaised',
              color: 'divider',
            }}
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Card media uses a local placeholder rather than pulling external assets into the showcase.
            </Typography>
          </CardContent>
          <CardActions>
            <Typography variant="caption" color="text.secondary">
              Shared Card, CardHeader, CardContent, CardActions, and CardMedia styling.
            </Typography>
          </CardActions>
        </Card>

        <Stack spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Normal surface</Typography>
            <Typography variant="body2" color="text.secondary">
              Background paper with theme overrides.
            </Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1">Outlined Paper</Typography>
          </Paper>
          <Paper elevation={6} sx={{ p: 2 }}>
            <Typography variant="subtitle1">Elevated Paper</Typography>
          </Paper>
        </Stack>

        <Stack spacing={2}>
          <Paper sx={{ p: 2, backgroundColor: 'surface' }}>
            <Typography variant="subtitle1">Surface token</Typography>
            <Typography variant="body2" color="text.secondary">
              Uses `palette.surface`.
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, backgroundColor: 'surfaceRaised' }}>
            <Typography variant="subtitle1">Raised surface token</Typography>
          </Paper>
          <Paper sx={{ p: 2, background: theme.couchRush.heroGradient }}>
            <Typography variant="subtitle1">Hero gradient surface</Typography>
            <Typography variant="body2" color="text.secondary">
              Pulled from `theme.couchRush.heroGradient`.
            </Typography>
          </Paper>
        </Stack>
      </Box>

      <Box>
        <Typography variant="h5" gutterBottom>
          Tables
        </Typography>
        <TableContainer>
          <Table aria-label="leaderboard table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox checked={selectedRows.length === visibleRows.length} />
                </TableCell>
                <TableCell>Team</TableCell>
                <TableCell sortDirection="asc">Score</TableCell>
                <TableCell>Momentum</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row) => {
                const selected = selectedRows.includes(row.id);
                return (
                  <TableRow hover key={row.id} selected={selected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected}
                        onChange={() =>
                          setSelectedRows((current) =>
                            current.includes(row.id)
                              ? current.filter((id) => id !== row.id)
                              : [...current, row.id],
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>{row.team}</TableCell>
                    <TableCell>{row.score}</TableCell>
                    <TableCell>{row.streak}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[3, 5]}
          />
        </TableContainer>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Empty state table
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Round</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography color="text.secondary">No archived rounds yet.</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Loading state table
          </Typography>
          <Stack spacing={1.5}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" width="20%" />
                <Skeleton variant="rectangular" width="40%" height={24} />
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>
    </ShowcaseSection>
  );
}
