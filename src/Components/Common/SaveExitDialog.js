import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import CircularProgress from '@material-ui/core/CircularProgress';
import {deleteCampaign} from '../../ApiUtility/ApiUtility';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
    textAlign: "center"
  },
}));

function SaveBeforeExit(props) {
  const [wasCampaignDeleted, setWasCampaignDeleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const classes = useStyles();
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    props.setIsSaveBeforeExitOpen(false);
    props.setAreSettingsUpdated(false);
    props.setErr({});
    props.handleEditClose();
  };

  const handleSaveThenClose = async e => {
    setIsSaving(true);
    props.handleSave().then(e => {
        setTimeout(e => {
            props.setIsSaveBeforeExitOpen(false);
            props.setAreSettingsUpdated(false);
            props.setValue(0);
            props.setUploadedSticker(false);
            props.setErr({});
            props.handleEditClose();
            setIsSaving(false);
        }, 1000);
    })
  }

  return (
    <Dialog style={{textAlign: 'center'}} disableBackdropClick
      onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}
    >
      <DialogTitle id="simple-dialog-title">
        {wasCampaignDeleted ? 'Campaign Was Successfully Deleted' : 'Would You Like to Save?'}
      </DialogTitle>
      <div className={wasCampaignDeleted ? `${classes.root} hidden` : `${classes.root}`}>
        <div style={{marginTop: '0px'}} >{isSaving &&  <CircularProgress size={24} />}</div>
        <Button variant="contained" color="primary" onClick={handleSaveThenClose}>
          Yes
        </Button>
        <Button 
          variant="contained" color="secondary"
          onClick={handleClose}
        >
          No
        </Button>
      </div>
      <div className={wasCampaignDeleted ? `${classes.root}` : `${classes.root} hidden`}>
        <Button variant="contained" onClick={handleClose}>
          Ok
        </Button>
      </div>
    </Dialog>
  );
}

export default SaveBeforeExit;