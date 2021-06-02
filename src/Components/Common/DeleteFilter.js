import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { blue } from '@material-ui/core/colors';

import {deleteFilter} from '../../ApiUtility/ApiUtility';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
    textAlign: "center"
  },
}));

function DeleteFilterDialog(props) {
  
  const [wasFilterDeleted, setWasFilterDeleted] = useState(false);

  const classes = useStyles();
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    // onClose(selectedValue);
    if(wasFilterDeleted) props.refreshData();
    props.setIsDeleteOpen(false);
    setTimeout(()=>{
      setWasFilterDeleted(false);
    }, 1000);
  };

  const handleDeleteClick = async e => {
      
    try{
      let response = await deleteFilter(props.selectedFilter.frame_id);
      setWasFilterDeleted(true);
      props.setSelectedFilter({});
      
    }catch(err){
      
    }
    props.refreshData();
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
        {wasFilterDeleted ? 'Filter Was Successfully Deleted' : 'Are you sure you want to delete this Filter?'}
      </DialogTitle>
      {/* <DialogContent className={wasFilterDeleted ? "" : "hidden"}>Filter Was Successfully Deleted</DialogContent> */}
      <div className={wasFilterDeleted ? `${classes.root} hidden` : `${classes.root}`}>
        <Button id="yes_delete_filter" variant="contained" color="primary" onClick={handleDeleteClick}>
          Yes
        </Button>
        <Button 
          variant="contained" color="secondary"
          onClick={event => props.setIsDeleteOpen(false)}
        >
          No
        </Button>
      </div>
      <div className={wasFilterDeleted ? `${classes.root}` : `${classes.root} hidden`}>
        <Button id="ok_filter_deleted" variant="contained" onClick={handleClose}>
          Ok
        </Button>
      </div>
    </Dialog>
  );
}

export default DeleteFilterDialog;
