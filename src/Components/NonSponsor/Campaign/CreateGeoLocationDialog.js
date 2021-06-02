import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {TextField, FormControl, InputLabel, Select, MenuItem} from '@material-ui/core/';
import {Autocomplete} from '@material-ui/lab/'
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import GoogleMapsPlaces from '../../Common/GoogleMapsAutoComplete';
// import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
// // If you want to use the provided css
// import 'react-google-places-autocomplete/dist/index.min.css';

import {formatGoogleLocationData} from '../../../CommonFunctions';
import {saveCampaignLocationAssociation, getLocationList, saveLocation} from '../../../ApiUtility/ApiUtility';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
    textAlign: "center"
  },
  locationTypeInput: {
    width: "200px",
  }
}));

function AddGeoLocationDialog(props) {

    const [wasLocationAdded, setWasLocationAdded] = useState(false);
    const [locationType, setLocationType] = useState('');
    const [placeList, setPlaceList] = useState([]);
    const [location, setLocation] = useState();
    const [locationDetails, setLocationDetails] = useState(null);

    const classes = useStyles();
    const { onClose, selectedValue, open } = props;

    const handleClose = () => {
        // onClose(selectedValue);
        props.setIsCreateDialogOpen(false);
    };

    const updatePlaceList = () => {
      if(["location", "area", "dma"].includes(locationType)){
        getLocationList(locationType).then(r => setPlaceList(r.data.response.items));
      }
    }

    async function handleCreateClick(e){
      let location_id;
      if(!["location", "area", "dma", "none"].includes(locationType)){
        let data = formatGoogleLocationData(locationType, locationDetails);
        let place_data = await saveLocation(data);
        
        location_id = place_data.location_id;
      }else{
        location_id = location.location_id;
      }
      saveCampaignLocationAssociation(props.campaign_id, location_id).then(x => {
        setWasLocationAdded(true);
        props.updateCampaignLocationList();
        props.setIsCreateDialogOpen(false);
        setTimeout(()=>{
          setLocationType('');
          setWasLocationAdded(false);
        }, 1000)
      });
      
        // try{
        //     let response = await createCampaign(campaignName);
        //     // let response = await result.json();
        //     
        //     setWasCampaignCreated(true);
        //     setTimeout(()=>{
        //     setNewCampaignId(response.data.response.data.campaign_id);
        //     // window.location.href = `/other-setups/non-sponsor/edit_campaign?campaign_id=${response.data.response.data.campaign_id}`
        //     }, 1000);
        // }catch(err){
        //     
        // }
    }

  useEffect(()=>{
    updatePlaceList();
  }, [locationType])

  return (
    <Dialog style={{textAlign: 'center'}} onClick={e => e} onClose={handleClose} aria-labelledby="simple-dialog-title" open={props.open}>
            
        <DialogTitle id="simple-dialog-title">
            Add GeoLocation
        </DialogTitle>
        <DialogContentText className={wasLocationAdded ? "" : "hidden"}>
            {`Location has been added`}
        </DialogContentText>
        <DialogContent>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="demo-simple-select-outlined-label">Type</InputLabel>
              <Select
                className={classes.locationTypeInput}
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={locationType}
                onChange={e => setLocationType(e.target.value)}
                label="Type"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={'cities'}>Cities</MenuItem>
                <MenuItem value={'location'}>Locations</MenuItem>
                <MenuItem value={'area'}>Areas</MenuItem>
                <MenuItem value={'dma'}>DMAs</MenuItem>
                <MenuItem value={'zipCodes'}>Zip Codes</MenuItem>
                <MenuItem value={'countries'}>Countries</MenuItem>
                <MenuItem value={'states'}>States</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" className={classes.formControl}>
              {
                ["location", "area", "dma"].includes(locationType) && <Autocomplete
                  id="place-combo-box"
                  options={placeList}
                  getOptionLabel={(option) => option.venue_name}
                  style={{ width: 300 }}
                  renderInput={(params) => <TextField {...params} label="Place" variant="outlined" />}
                  onChange={(e, v) => setLocation(v)}
                />
              }
              {!["location", "area", "dma", "none"].includes(locationType) && <GoogleMapsPlaces
                setLocationDetails={setLocationDetails}
              />}
            </FormControl>
            <DialogActions
                className={wasLocationAdded ? "hidden" : ""}
                id="dialog_actions"
            >
                <Button onClick={handleClose}>
                    Cancel
                </Button>
                <Button disabled={location == ""} onClick={handleCreateClick} color="primary">
                    Add Location
                </Button>
            </DialogActions>
        </DialogContent>
    </Dialog>
  );
}

export default AddGeoLocationDialog;