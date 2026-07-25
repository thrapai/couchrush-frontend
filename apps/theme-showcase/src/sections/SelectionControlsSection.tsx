import {
  Badge,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { ShowcaseSection } from '../components/ShowcaseSection';

export function SelectionControlsSection() {
  const [checked, setChecked] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [teamMode, setTeamMode] = useState('solo');

  return (
    <ShowcaseSection
      id="selection-controls"
      title="Selection Controls"
      description="Checkboxes, radios, switches, chips, and badges with local state."
    >
      <Stack spacing={3}>
        <FormGroup row sx={{ gap: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} />}
            label="Ready to publish"
          />
          <FormControlLabel control={<Checkbox checked />} label="Checked" />
          <FormControlLabel control={<Checkbox indeterminate />} label="Indeterminate" />
          <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
        </FormGroup>

        <RadioGroup row value={teamMode} onChange={(event) => setTeamMode(event.target.value)} aria-label="team mode">
          <FormControlLabel value="solo" control={<Radio />} label="Solo" />
          <FormControlLabel value="teams" control={<Radio />} label="Teams" />
          <FormControlLabel value="audience" control={<Radio />} label="Audience" />
        </RadioGroup>

        <FormGroup row sx={{ gap: 2 }}>
          <FormControlLabel
            control={<Switch checked={notifications} onChange={(event) => setNotifications(event.target.checked)} />}
            label="Enable host announcements"
          />
          <FormControlLabel control={<Switch disabled checked />} label="Locked switch" />
        </FormGroup>

        <Box>
          <Typography variant="h5" gutterBottom>
            Chips and badges
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
            <Chip label="Filled" />
            <Chip label="Outlined" variant="outlined" />
            <Chip label="Clickable" onClick={() => undefined} />
            <Chip label="Deletable" onDelete={() => undefined} />
            <Chip label="Avatar" avatar={<Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'primary.main' }} />} />
            <Chip label="Primary" color="primary" />
            <Chip label="Secondary" color="secondary" />
            <Chip label="Success" color="success" />
            <Chip label="Warning" color="warning" />
            <Chip label="Error" color="error" />
            <Chip label="Info" color="info" />
            <Chip label="Disabled" disabled />
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge badgeContent={4} color="primary">
              <Chip label="Numeric badge" />
            </Badge>
            <Badge variant="dot" color="secondary">
              <Chip label="Dot badge" />
            </Badge>
            <Badge badgeContent={128} max={99} color="error">
              <Chip label="Max count badge" />
            </Badge>
          </Box>
        </Box>
      </Stack>
    </ShowcaseSection>
  );
}
