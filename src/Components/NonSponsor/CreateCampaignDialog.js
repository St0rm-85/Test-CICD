import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {TextField} from '@material-ui/core/';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import { Alert } from '@material-ui/lab';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";

import {createCampaign} from '../../ApiUtility/ApiUtility';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
    textAlign: "center"
  },
}));

function CreateCampaignDialog(props) {
  const [wasCampaignCreated, setWasCampaignCreated] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [newCampaignId, setNewCampaignId] = useState(null);
  const [errMessage, setErrMessage] = useState(null);

  const classes = useStyles();
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    // onClose(selectedValue);
    props.setIsCreateDialogOpen(false);
  };

  async function handleCreateClick(e){
    try{
        let response = await createCampaign({name: campaignName, retailer_id: props.retailerId});
        // let response = await result.json();
        if(response.data.response.code == 100){
          setErrMessage("Campaign Name Already Exists");
        }else{
          
          setWasCampaignCreated(true);
          setTimeout(()=>{
            setNewCampaignId(response.data.response.data.campaign_id);
            // window.location.href = `/other-setups/non-sponsor/edit_campaign?campaign_id=${response.data.response.data.campaign_id}`
          }, 1000);
        }
    }catch(err){
        
    }
  }

  useEffect(()=> {
    setErrMessage(null);
  }, [campaignName])

  if(!!newCampaignId && props.retailerId){
    return <Redirect to={`/sponsored/${props.retailerId}/campaigns?campaign_id=${newCampaignId}`}/>
  } 
  if(!!newCampaignId) {
    return <Redirect to={`/other-setups/non-sponsor/edit_campaign?campaign_id=${newCampaignId}`}/>
  }

  

  return (
    <Dialog style={{textAlign: 'center'}} onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <Alert 
          className={!errMessage ? "hidden" : ""} 
          severity="error"
        >
          {errMessage}
        </Alert>
        <DialogTitle id="simple-dialog-title">
            {wasCampaignCreated ? 'Campaign Was Successfully Created' : 'Create Campaign' }
        </DialogTitle>
        <DialogContentText className={wasCampaignCreated ? "" : "hidden"}>
            {`"${campaignName}" has been created`}
        </DialogContentText>
        <DialogContent>
            <TextField
                className={wasCampaignCreated ? "hidden" : ""}
                autoFocus
                margin="dense"
                id="name"
                label="Campaign Name"
                type="text"
                fullWidth
                onChange={e => setCampaignName(e.target.value)}
            />
            <DialogActions
                className={wasCampaignCreated ? "hidden" : ""}
                id="dialog_actions"
            >
                <Button onClick={handleClose}>
                    Cancel
                </Button>
                <Button disabled={campaignName == ""} onClick={handleCreateClick} color="primary">
                    Create Campaign
                </Button>
            </DialogActions>
        </DialogContent>
    </Dialog>
  );
}

export default CreateCampaignDialog;