import React, {useState, useEffect, useRef} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Tabs, Tab, Button, Box, CircularProgress} from '@material-ui/core/';
import TabPanel from '../TabPanel';
import MaterialTable from 'material-table';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { blue } from '@material-ui/core/colors';
import {getEnvironmentCampaignIds} from '../../CommonFunctions';
import {getLocationLinks, saveFrameAssociations, getLocationAssociations, updateGeolocationLinks} from '../../ApiUtility/ApiUtility';

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
    textAlign: "center"
  },
    inlineTable:{
        display:"inline-block",
        verticalAlign: "top"
    },
    saveClose: {
        display: "inline-block",
        position: "absolute",
        right: "30px"
    },
    buttonProgress: {
        position: "absolute"
    }
}));

function ViewLinks(props) {
    const [wasCampaignDeleted, setWasCampaignDeleted] = useState(false);
    const [locationLinks, setLocationLinks] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [locationAssociations, setLocationAssociations] = useState([]); 
    const [value, setValue] = useState(0);
    const itemsToSelectTableRef = useRef();
    // const [itemsToSelect, setItemsToSelect] = useState([]);

    const classes = useStyles();
    const { onClose, selectedValue, open, selectedItem} = props;

    const itemsToSelect = (() => {
        if(selectedItem)
        if(typeof props.itemsToSelect == "object") return applyChecked(false, props.itemsToSelect);
        else if(typeof props.itemsToSelect == "function") return q => props.itemsToSelect(q, applyChecked, props.campaignId || getEnvironmentCampaignIds().carousel);
        else return [];
    })();
    const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};

    const handleClose = () => {
        // onClose(selectedValue);
        props.setIsLinksDialogOpen(false);
        props.setSelectedItem({});
    };

    function handleChange(e, i){
        setValue(i);
    }

    async function handleSave(){
        let frame_id = props.selectedItem.frame_id;
        let campaign_id = props.campaign_id;
        setIsSaving(true);
        if(!!props.selectedItem.location_id){
            let frames = locationAssociations.map(x => x.frame_id);
            updateGeolocationLinks({campaign_id: props.campaignId || getEnvironmentCampaignIds().carousel, location_id: props.selectedItem.location_id, frames})
        }else{
            let location_ids = locationLinks.map(l => l.location_id);
            await saveFrameAssociations({frame_id, campaign_id, selectedLocations: location_ids});
        }
        
        setTimeout(()=>{
            setIsSaving(false);
            if(props.refreshData) props.refreshData();
        }, 1000);
        // {"campaign_id":258,"location_id":39,"frames":[1401,1339,1033,950,945,937]}
    }

    function applyChecked(query, locationData){
        if(Object.entries(selectedItem).length === 0 || (locationLinks.length > locationData.length && !query)) return [];
        let i = !query ? 0 : query.pageSize * query.page;
        let searchForFrameAssociation = x => locationAssociations.some(l => l.frame_id == x.frame_id);
        let searchForLocationAssociation = x => locationLinks.some(l => l.location_id == x.location_id);
        let searchBy = !query ? searchForLocationAssociation : searchForFrameAssociation;
        let nextCampaignLinks = locationData.slice(0);
        nextCampaignLinks.forEach(x => {
            x.tableData={id: i}
            if (searchBy(x)) x.tableData.checked = true;
            i += 1;
            return x;
        });
        return nextCampaignLinks;
    }

    function handleAssociationsChange(selected_frames, item){
        // if(!item && locationLinks.length > 0) selected_frames = [];
        if(!item){
            setLocationAssociations(selected_frames);
            setLocationLinks(selected_frames);
            return;
        }
        let nextLocationAssociations;
        let filterLocationByFrames = () => locationAssociations.filter(x => x.frame_id !== item.frame_id);
        let filterLocationByLocations = () => locationLinks.filter(x => x.location_id !== item.location_id);
        let filterBy = !!item.frame_id ? filterLocationByFrames : filterLocationByLocations;
        if(!item.tableData.checked) nextLocationAssociations = filterBy();
        else{
            nextLocationAssociations = !!item.frame_id ? locationAssociations.slice(0) : locationLinks.slice(0);
            nextLocationAssociations.push(item);
        } 
        
        if(!!item.frame_id) setLocationAssociations(nextLocationAssociations)
        else setLocationLinks(nextLocationAssociations);

        // setSelectedLocations(location_links);
        // setLocationLinks(campaignLocationLinks);
    }

    useEffect(()=>{
        if(Object.keys(selectedItem).length === 1){
            setLocationLinks({length: 20000});
            // setLocationAssociations([]);
            return;
        }
        const location_association_data = {
            "frameAssociations":[
                {"entity_type_name":"location","entity_id":selectedItem.location_id},
                {"entity_type_name":"campaign","entity_id": props.campaignId || getEnvironmentCampaignIds().carousel}
            ]
        }
        getLocationAssociations(location_association_data).then((locationAssociationsResult) => {
            setLocationAssociations(locationAssociationsResult);
        });
        if(selectedItem.frame_id){
            getLocationLinks(selectedItem.frame_id).then((locationLinksResult)=>{
                setLocationLinks(locationLinksResult);
            });
        }
    }, [selectedItem])

    // useEffect(() => {
    //     console.log("items to select change: ", props.itemsToSelect);
    //     if(typeof props.itemsToSelect == "object") setItemsToSelect(applyChecked(false, props.itemsToSelect));
    //     else if(typeof props.itemsToSelect == "function") setItemsToSelect(q => props.itemsToSelect(q, applyChecked, props.campaignId || getEnvironmentCampaignIds().carousel));
    //     else setItemsToSelect([]);
    // }, [props.itemsToSelect, locationLinks, selectedItem]);

    useEffect(()=>{
        if(itemsToSelectTableRef.current && typeof itemsToSelect == "function") itemsToSelectTableRef.current.onQueryChange();
    }, [locationAssociations]);

  return (
    <Dialog style={{textAlign: 'center'}} maxWidth="lg" minWidth="lg" onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">
        {selectedItem.name}
        <Box className={classes.saveClose}>
            <Button onClick={handleClose}>Close</Button>
            <Button variant="contained"  onClick={handleSave}>
                Save {isSaving && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        ID - {selectedItem.frame_id}
        <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            centered
        >
            <Tab label="By Geo-Filters" />
            <Tab label="By Geo-Location" />
        </Tabs>
        <TabPanel value={value} index={0}>
            <div className={classes.inlineTable}>
                <MaterialTable
                    title={props.subject}
                    options={{search: false}}
                    columns={props.selectedItemColumns}
                    data={[selectedItem]}
                />
            </div>
            <div className={classes.inlineTable} style={{padding: '30px'}}>
                <img src={require("../../Images/send_right.png")}/>
            </div>
            <div className={classes.inlineTable}>
                <MaterialTable
                    title={props.object}
                    tableRef={itemsToSelectTableRef}
                    options={{selection: true}}
                    columns={props.itemsToSelectColumns}
                    data={itemsToSelect}
                    onSelectionChange={handleAssociationsChange}
                />
            </div>
        </TabPanel>
        <TabPanel value={value} index={1}>
            <div className={classes.inlineTable}>
                <MaterialTable
                    title={props.object}
                    options={{selection: true}}
                    columns={props.itemsToSelectColumns}
                    data={itemsToSelect}
                    onSelectionChange={handleAssociationsChange}
                />
            </div>
            <div className={classes.inlineTable} style={{padding: '30px'}}>
                <img src={require("../../Images/send_right.png")}/>
            </div>
            <div className={classes.inlineTable}>
                <MaterialTable
                    title={props.subject}
                    options={{search: false}}
                    columns={props.selectedItemColumns}
                    data={[selectedItem]}
                />
            </div>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default ViewLinks;