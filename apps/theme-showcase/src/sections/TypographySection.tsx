import { Box, Stack, Typography } from '@mui/material';
import { ShowcaseSection } from '../components/ShowcaseSection';

const typographySamples = [
  { variant: 'display', text: 'Electric Arcade Display', component: 'div' },
  { variant: 'score', text: '12,450 PTS', component: 'div' },
  { variant: 'h1', text: 'Championship Round Begins' },
  { variant: 'h2', text: 'Audience Choice Revealed' },
  { variant: 'h3', text: 'Fastest Answer Wins' },
  { variant: 'h4', text: 'Current Leaderboard' },
  { variant: 'h5', text: 'Buzz-in Window' },
  { variant: 'h6', text: 'Host Controls' },
  { variant: 'subtitle1', text: 'Players lock answers before the timer runs out.' },
  { variant: 'subtitle2', text: 'Secondary supporting label' },
  { variant: 'body1', text: 'Body copy for prompts, guidance, and persistent interface text across the game surfaces.' },
  { variant: 'body2', text: 'Compact body text for helper copy and lightweight metadata.' },
  { variant: 'button', text: 'Join next round' },
  { variant: 'caption', text: 'Caption for small contextual information.' },
  { variant: 'overline', text: 'Live session' },
] as const;

export function TypographySection() {
  return (
    <ShowcaseSection
      id="typography"
      title="Typography"
      description="Standard MUI variants plus the custom CouchRush display and score variants."
    >
      <Stack spacing={2}>
        {typographySamples.map((sample) => (
          <Box key={sample.variant} sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {sample.variant}
            </Typography>
            <Typography
              variant={sample.variant}
              component={'component' in sample ? sample.component : 'p'}
            >
              {sample.text}
            </Typography>
          </Box>
        ))}
      </Stack>
    </ShowcaseSection>
  );
}
