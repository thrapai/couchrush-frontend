import EmojiEventsRounded from '@mui/icons-material/EmojiEventsRounded';
import SportsEsportsRounded from '@mui/icons-material/SportsEsportsRounded';
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  answerGridSx,
  hostScreenSx,
  playerAnswerButtonSx,
  questionPanelSx,
  scoreboardValueSx,
} from '@couchrush/theme';
import { ShowcaseSection } from '../components/ShowcaseSection';

const answers = ['Donkey Kong', 'Pac-Man', 'Space Invaders', 'Galaga'];

export function GamePreviewsSection() {
  return (
    <ShowcaseSection
      id="game-previews"
      title="Game-Specific Previews"
      description="Static previews that exercise every exported game helper from the shared theme package."
    >
      <Stack spacing={3} data-testid="game-preview-section">
        <Box sx={hostScreenSx}>
          <Paper sx={questionPanelSx}>
            <Stack spacing={3}>
              <Typography variant="overline">Host question screen</Typography>
              <Typography variant="display">Which arcade icon eats power pellets?</Typography>
              <Box sx={answerGridSx}>
                {answers.map((answer) => (
                  <Button key={answer} variant="outlined" sx={playerAnswerButtonSx}>
                    {answer}
                  </Button>
                ))}
              </Box>
            </Stack>
          </Paper>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="overline">Mobile player controls</Typography>
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {answers.slice(0, 3).map((answer) => (
                <Button key={answer} fullWidth sx={playerAnswerButtonSx}>
                  {answer}
                </Button>
              ))}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="overline">Scoreboard</Typography>
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {[
                ['Neon Ninjas', '1,280'],
                ['Pixel Patrol', '1,190'],
                ['Turbo Trivia', '1,015'],
              ].map(([name, score]) => (
                <Box
                  key={name}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
                >
                  <Typography variant="h6">{name}</Typography>
                  <Typography sx={scoreboardValueSx}>{score}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="overline">Round winner panel</Typography>
            <EmojiEventsRounded color="primary" sx={{ fontSize: 56, mt: 2 }} />
            <Typography variant="h2" sx={{ mt: 2 }}>
              Pixel Patrol
            </Typography>
            <Typography sx={scoreboardValueSx}>+450</Typography>
            <Typography color="text.secondary">Fastest streak with all answers locked in.</Typography>
          </Paper>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <SportsEsportsRounded color="secondary" sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h3">Large Score Display</Typography>
              <Typography sx={scoreboardValueSx}>9,999</Typography>
            </Box>
          </Box>
        </Paper>
      </Stack>
    </ShowcaseSection>
  );
}
