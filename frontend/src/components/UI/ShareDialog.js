import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ShareDialog = ({ open, onClose, article }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Share Article</DialogTitle>
      <DialogContent>
        Share: {article?.title}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;