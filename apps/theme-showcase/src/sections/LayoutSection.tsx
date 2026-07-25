import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Collapse,
  Container,
  Divider,
  Grid,
  MobileStepper,
  Pagination,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { ShowcaseSection } from '../components/ShowcaseSection';

const steps = ['Choose round', 'Review media', 'Go live'];

export function LayoutSection() {
  const [accordionExpanded, setAccordionExpanded] = useState(true);
  const [collapseOpen, setCollapseOpen] = useState(true);
  const [paginationPage, setPaginationPage] = useState(2);
  const [mobileStep, setMobileStep] = useState(1);

  return (
    <ShowcaseSection
      id="layout"
      title="Layout and Disclosure"
      description="Box, container, stack, grid, divider, accordions, collapse, pagination, and steppers."
    >
      <Stack spacing={3}>
        <Container maxWidth="lg" disableGutters>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Box and Container</Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'surface', borderRadius: 2 }}>
                  <Typography variant="body2">Responsive box inside a container.</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Stack</Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Paper sx={{ p: 1.5 }}>Prompt</Paper>
                  <Paper sx={{ p: 1.5 }}>Answers</Paper>
                  <Paper sx={{ p: 1.5 }}>Results</Paper>
                </Stack>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Grid</Typography>
                <Grid container spacing={1.5} sx={{ mt: 1 }}>
                  {['A', 'B', 'C', 'D'].map((tile) => (
                    <Grid key={tile} size={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>{tile}</Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        <Divider />

        <Accordion expanded={accordionExpanded} onChange={(_, expanded) => setAccordionExpanded(expanded)}>
          <AccordionSummary expandIcon={<ExpandMoreRounded />}>
            <Typography variant="subtitle1">Accordion summary</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary">
              Use accordions for dense setup screens where advanced settings can stay tucked away.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Collapse
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Typography
              component="button"
              onClick={() => setCollapseOpen((open) => !open)}
              sx={{
                all: 'unset',
                cursor: 'pointer',
                fontWeight: 700,
                color: 'primary.main',
              }}
            >
              Toggle reveal panel
            </Typography>
            <Collapse in={collapseOpen}>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'surface', borderRadius: 2 }}>
                <Typography variant="body2">Collapsed content stays keyboard reachable when expanded.</Typography>
              </Box>
            </Collapse>
          </Paper>
        </Box>

        <Stack spacing={2}>
          <Pagination
            count={8}
            page={paginationPage}
            onChange={(_, value) => setPaginationPage(value)}
            color="primary"
          />

          <Stepper activeStep={1} alternativeLabel>
            {steps.map((step) => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Stepper activeStep={1} orientation="vertical">
            {steps.map((step) => (
              <Step key={step}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <MobileStepper
            variant="dots"
            steps={steps.length}
            position="static"
            activeStep={mobileStep}
            nextButton={
              <Typography
                component="button"
                disabled={mobileStep === steps.length - 1}
                onClick={() => setMobileStep((step) => Math.min(step + 1, steps.length - 1))}
                sx={{ all: 'unset', cursor: 'pointer', color: 'primary.main', fontWeight: 700 }}
              >
                Next
              </Typography>
            }
            backButton={
              <Typography
                component="button"
                disabled={mobileStep === 0}
                onClick={() => setMobileStep((step) => Math.max(step - 1, 0))}
                sx={{ all: 'unset', cursor: 'pointer', color: 'primary.main', fontWeight: 700 }}
              >
                Back
              </Typography>
            }
          />
        </Stack>
      </Stack>
    </ShowcaseSection>
  );
}
