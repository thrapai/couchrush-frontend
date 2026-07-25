import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useState } from 'react';
import { ShowcaseSection } from '../components/ShowcaseSection';

export function DialogsSection() {
  const [standardOpen, setStandardOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [destructiveOpen, setDestructiveOpen] = useState(false);

  return (
    <ShowcaseSection
      id="dialogs"
      title="Dialogs"
      description="Working standard, confirmation, and destructive-action dialogs."
    >
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button onClick={() => setStandardOpen(true)}>Open standard dialog</Button>
        <Button onClick={() => setConfirmOpen(true)}>Open confirmation dialog</Button>
        <Button color="error" onClick={() => setDestructiveOpen(true)}>
          Open destructive dialog
        </Button>
      </Box>

      <Dialog open={standardOpen} onClose={() => setStandardOpen(false)}>
        <DialogTitle>Round Details</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Preview the active round settings before sending players into the next question.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setStandardOpen(false)}>
            Close
          </Button>
          <Button onClick={() => setStandardOpen(false)}>Continue</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Publish Round</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will make the selected question set available to all connected players.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setConfirmOpen(false)}>Publish</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={destructiveOpen} onClose={() => setDestructiveOpen(false)}>
        <DialogTitle>Delete Round</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deleting this round removes scores, answer history, and queued follow-up prompts.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setDestructiveOpen(false)}>
            Keep round
          </Button>
          <Button color="error" onClick={() => setDestructiveOpen(false)}>
            Delete round
          </Button>
        </DialogActions>
      </Dialog>
    </ShowcaseSection>
  );
}
