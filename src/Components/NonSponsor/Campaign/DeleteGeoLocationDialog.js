import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { blue } from '@material-ui/core/colors';

import {deleteCampaignLocationAssociation} from '../../../ApiUtility/ApiUtility';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
    textAlign: "center"
  },
}));

function DeleteGeoLocationDialog(props) {
  const [wasLocationDeleted, setWasLocationDeleted] = useState(false);

  const classes = useStyles();
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    // onClose(selectedValue);
    if(wasLocationDeleted) props.refreshData();
    props.setIsDeleteDialogOpen(false);
    setTimeout(()=>{
        setWasLocationDeleted(false);
    }, 1000);
  };

  const handleDeleteClick = async e => {
    try{
      let response = await deleteCampaignLocationAssociation(props.campaign_id, props.location_id);
      setWasLocationDeleted(true);
    }catch(err){
      
    }
    // props.refreshData();
  }

  return (
    <Dialog style={{textAlign: 'center'}} 
    // onClick={async e => {
    //   try{
    //     props.refreshData()
    //   }catch(err){
    //     
    //   }
    //   }} 
      onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">
        {wasLocationDeleted ? 'Location Was Successfully Deleted' : 'Are you sure you want to delete this location?'}
      </DialogTitle>
      <div className={wasLocationDeleted ? `${classes.root} hidden` : `${classes.root}`}>
        <Button variant="contained" color="primary" onClick={handleDeleteClick}>
          Yes
        </Button>
        <Button 
          variant="contained" color="secondary"
          onClick={event => props.setIsDeleteDialogOpen(false)}
        >
          No
        </Button>
      </div>
      <div className={wasLocationDeleted ? `${classes.root}` : `${classes.root} hidden`}>
        <Button variant="contained" onClick={handleClose}>
          Ok
        </Button>
      </div>
    </Dialog>
  );
}

export default DeleteGeoLocationDialog;