import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {TextField, Box, Toolbar, IconButton, FormControl,
    Typography, CircularProgress, AppBar, FormControlLabel, Checkbox} from '@material-ui/core/';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import {Alert} from '@material-ui/lab';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import { blue } from '@material-ui/core/colors';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";

import {saveSponsor} from '../../ApiUtility/ApiUtility';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
    textAlign: "center"
  },
  appBar: {
    // position: 'relative',
    background: 'rgb(72, 120, 152)'
  },
  title: {
    // marginLeft: theme.spacing(2),
    flex: 1,
  },
  formLabel: {
    display: 'block'
  }
}));

function CreateCampaignDialog(props) {
    const classes = useStyles();
    const [wasSponsorSaved, setWasSponsorSaved] = useState(false);
    const [sponsorName, setSponsorName] = useState(props.selectedSponsor.name);
    const [sponsorId, setSponsorId] = useState(props.selectedSponsor.retailerId);
    const [address, setAddress] = useState(props.selectedSponsor.address);
    const [country, setCountry] = useState("US");
    const [city, setCity] = useState(props.selectedSponsor.city);
    const [state, setState] = useState(props.selectedSponsor.state);
    const [zip, setZip] = useState(props.selectedSponsor.zipCode);
    const [active, setActive] = useState(props.selectedSponsor.active);
    const [enableDemo, setEnableDemo] = useState(props.selectedSponsor.enableDemo);
    const [isSaving, setIsSaving] = useState(false);
    const [errMessage, setErrMessage] = useState(null);
    const [newSponsorId, setNewSponsorId] = useState(null);


    const { onClose, selectedValue, open } = props;

    async function handleSave(e){
        
        try{
            let response = await saveSponsor({
                address, city, country, name:sponsorName, state, zipCode: zip, active, enableDemo,
                retailerId: sponsorId
            });
            if(response.data.response.code == "100"){
                setErrMessage(response.data.response.message);
            }else{
                 // let response = await result.json();
                
                props.closeCreateDialog();
                props.refreshData();
            }
            if(response.data.response.message == "Retailer created successfully") {
                setNewSponsorId(response.data.response.data.id)
            }
            // setWasSponsorCreated(true);
            // setTimeout(()=>{
            //   setNewCampaignId(response.data.response.data.campaign_id);
            //   // window.location.href = `/other-setups/non-sponsor/edit_campaign?campaign_id=${response.data.response.data.campaign_id}`
            // }, 1000);
        }catch(err){
            
        }
    }

    useEffect(()=>{
        setSponsorName(props.selectedSponsor.name);
        setSponsorId(props.selectedSponsor.retailerId);
        setAddress(props.selectedSponsor.address);
        setCity(props.selectedSponsor.city);
        setState(props.selectedSponsor.state);
        setZip(props.selectedSponsor.zipCode);
        setActive(props.selectedSponsor.active);
        setEnableDemo(props.selectedSponsor.enableDemo)
    }, [props.selectedSponsor])

    useEffect(()=>{
        setErrMessage(null);
    }, [sponsorName, sponsorId, address, city, state, zip])

  if(!!newSponsorId) return <Redirect to={`/sponsored/${newSponsorId}`}/>

  return (
    <Dialog style={{textAlign: 'center'}} onClose={props.closeCreateDialog} aria-labelledby="simple-dialog-title" open={open}>
            <AppBar className={classes.appBar} position='relative' >
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={props.closeCreateDialog} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Box style={{width: '60%', textAlign: 'left'}}>
                        <Typography variant="h6">
                            Add A Sponsor
                        </Typography>
                    </Box>
                    <Box>
                        <Button autoFocus color="inherit" onClick={handleSave} style={{float:'right'}}>
                            Save & Close {isSaving && <CircularProgress size={24} style={{position: "absolute"}} />}
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
        <DialogContent>
        <Alert 
          className={!errMessage ? "hidden" : ""} 
          severity="error"
        >
          {errMessage}
        </Alert>
        <form className={classes.root} noValidate autoComplete="off">
            <FormControl>
                <TextField
                    margin="dense"
                    id="name"
                    disabled
                    variant="outlined"
                    label="Sponsor ID"
                    defaultValue={sponsorId}
                    onChange={e => setSponsorId(e.target.value)}
                />
                <TextField
                    margin="dense"
                    id="name"
                    variant="outlined"
                    label="Sponsor Name"
                    defaultValue={sponsorName}
                    fullWidth
                    onChange={e => setSponsorName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    id="address"
                    variant="outlined"
                    label="Address"
                    defaultValue={address}
                    fullWidth
                    onChange={e => setAddress(e.target.value)}
                />
                <Box>
                    <TextField
                        margin="dense"
                        id="country"
                        variant="outlined"
                        label="Country"
                        value="US"
                        disabled
                        halfWidth
                        onChange={e => setCountry(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="city"
                        variant="outlined"
                        label="City"
                        defaultValue={city}
                        halfWidth
                        onChange={e => setCity(e.target.value)}
                    />
                </Box>
                <Box>
                    <TextField
                        margin="dense"
                        id="state"
                        variant="outlined"
                        label="State"
                        defaultValue={state}
                        halfWidth
                        onChange={e => setState(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="zip"
                        variant="outlined"
                        label="Zip"
                        defaultValue={zip}
                        halfWidth
                        onChange={e => setZip(e.target.value)}
                    />
                </Box>
                <Box>
                    <FormControlLabel
                        control={
                        <Checkbox
                            checked={enableDemo == 1}
                            onChange={(e, v) => setEnableDemo(v ? 1 : 0)}
                            name="demo"
                            color="primary"
                        />
                        }
                        label="Demo"
                    />
                    <FormControlLabel
                        control={
                        <Checkbox
                            checked={Number.isInteger(active) && active !== 1}
                            onChange={(e, v) => setActive(!v ? 1 : 0)}
                            name="inactive"
                            color="primary"
                        />
                        }
                        label="Inactive"
                    />
                </Box>
                </FormControl>
            </form>
        </DialogContent>
    </Dialog>
  );
}

export default CreateCampaignDialog;