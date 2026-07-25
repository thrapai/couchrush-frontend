import SearchRounded from '@mui/icons-material/SearchRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import {
  Autocomplete,
  Box,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  NativeSelect,
  Rating,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { ShowcaseSection } from '../components/ShowcaseSection';

const roundOptions = ['Warm-up', 'Speed round', 'Audience play', 'Final showdown'];
const tagOptions = ['Music', 'Sports', 'Science', 'Movies', 'History'];

export function FormInputsSection() {
  const [roundType, setRoundType] = useState('speed');
  const [roundTags, setRoundTags] = useState<string[]>(['Music', 'Science']);
  const [nativeMode, setNativeMode] = useState('auto');
  const [autocompleteValue, setAutocompleteValue] = useState<string | null>('Audience play');
  const [difficulty, setDifficulty] = useState<number[]>([20, 70]);
  const [volume, setVolume] = useState(55);
  const [rating, setRating] = useState<number | null>(4);

  return (
    <ShowcaseSection
      id="form-inputs"
      title="Form Inputs"
      description="Text, select, autocomplete, slider, and rating inputs with accessible labels."
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <TextField label="Question title" defaultValue="Name the arcade classic by its soundtrack." />
            <TextField label="Host email" type="email" defaultValue="host@couchrush.dev" />
            <TextField
              label="Access code"
              type="password"
              defaultValue="arcade-42"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <VisibilityRounded fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField label="Round limit" type="number" defaultValue={12} />
            <TextField label="Prompt notes" multiline minRows={4} defaultValue="Keep the crowd energy up and read the clue twice." />
            <TextField label="Required answer" required defaultValue="Pac-Man" />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <TextField label="Disabled input" disabled defaultValue="Locked while live" />
            <TextField
              label="Read-only scoreboard ID"
              defaultValue="SHOW-2048"
              slotProps={{ input: { readOnly: true } }}
            />
            <TextField
              label="Error example"
              error
              helperText="Round code must be exactly six characters."
              defaultValue="AB12"
            />
            <TextField
              label="Search players"
              helperText="Find a joined player quickly."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel id="round-type-label">Round type</InputLabel>
              <Select
                labelId="round-type-label"
                label="Round type"
                value={roundType}
                onChange={(event) => setRoundType(event.target.value)}
              >
                <MenuItem value="warmup">Warm-up</MenuItem>
                <MenuItem value="speed">Speed round</MenuItem>
                <MenuItem value="final">Final showdown</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="round-tags-label">Round tags</InputLabel>
              <Select
                labelId="round-tags-label"
                label="Round tags"
                multiple
                value={roundTags}
                onChange={(event) => setRoundTags(event.target.value as string[])}
              >
                {tagOptions.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel variant="standard" htmlFor="native-mode">
                Native select
              </InputLabel>
              <NativeSelect
                id="native-mode"
                value={nativeMode}
                onChange={(event) => setNativeMode(event.target.value)}
              >
                <option value="auto">Auto-advance</option>
                <option value="manual">Manual host control</option>
                <option value="review">Review mode</option>
              </NativeSelect>
            </FormControl>

            <Autocomplete
              options={roundOptions}
              value={autocompleteValue}
              onChange={(_, value) => setAutocompleteValue(value)}
              renderInput={(params) => <TextField {...params} label="Autocomplete round preset" />}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            <Box>
              <Typography id="single-slider" gutterBottom>
                Music volume
              </Typography>
              <Slider
                aria-labelledby="single-slider"
                value={volume}
                onChange={(_, value) => setVolume(value as number)}
              />
            </Box>

            <Box>
              <Typography id="range-slider" gutterBottom>
                Difficulty range
              </Typography>
              <Slider
                aria-labelledby="range-slider"
                value={difficulty}
                onChange={(_, value) => setDifficulty(value as number[])}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography component="legend" gutterBottom>
                Player satisfaction
              </Typography>
              <Rating
                value={rating}
                onChange={(_, value) => setRating(value)}
                name="player-satisfaction"
              />
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </ShowcaseSection>
  );
}
