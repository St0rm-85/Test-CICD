import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Tabs, Tab, Button, Box, CircularProgress} from '@material-ui/core/';
import TabPanel from '../TabPanel';
import MaterialTable from 'material-table';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { blue } from '@material-ui/core/colors';

import {getLocationLinks, saveFrameAssociations} from '../../ApiUtility/ApiUtility';

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
    
    const [value, setValue] = useState(0);

    const classes = useStyles();
    const { onClose, selectedValue, open, selectedFilter, campaignLocationLinks } = props;

    const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};

    const handleClose = () => {
        // onClose(selectedValue);
        props.setIsLinksDialogOpen(false);
        props.setSelectedFilter({});
        props.refreshData();
    };

    function handleChange(e, i){
        setValue(i);
    }

    async function handleSave(){
        let frame_id = props.selectedFilter.frame_id;
        let campaign_id = props.campaign_id;
        setIsSaving(true);
        await saveFrameAssociations({frame_id, campaign_id, selectedLocations});
        setTimeout(()=>{
            setIsSaving(false);
        }, 1000);
    }

    function applyChecked(campaignLocationLinks){
        if(!selectedFilter.frame_id || locationLinks.length > campaignLocationLinks.length) return [];
        let i = 0;
        let nextCampaignLinks = campaignLocationLinks.slice(0);
        nextCampaignLinks.forEach(x => {
            x.tableData={id: i}
            if (locationLinks.some(l => l.location_id == x.location_id)) x.tableData.checked = true;
            i += 1;
            return x;
        });
        return nextCampaignLinks;
    }

    function handleAssociationsChange(campaignLocationLinks){
        let location_links = campaignLocationLinks.filter(x => x.tableData.checked)
            .map(x => x.location_id);
        setSelectedLocations(location_links);
        setLocationLinks(campaignLocationLinks);
    }

    useEffect(()=>{
        if(!selectedFilter.frame_id) return setLocationLinks({length:20000});
        getLocationLinks(selectedFilter.frame_id).then((locationLinksResult)=>{
            setLocationLinks(locationLinksResult);
        });
    }, [selectedFilter])

    // 
  return (
    <Dialog style={{textAlign: 'center'}} maxWidth="lg" minWidth="lg" onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">
        {selectedFilter.name}
        <Box className={classes.saveClose}>
            <Button onClick={handleClose}>Close</Button>
            <Button variant="contained"  onClick={handleSave}>
                Save {isSaving && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        ID - {selectedFilter.frame_id}
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
                    title="Geo Filters"
                    options={{search: false}}
                    columns={[
                        { title: 'ID', field: 'frame_id', ...table_styling},
                        { title: 'Geo Filters', field: 'name', ...table_styling},
                        { title: 'Status', field: 'active', ...table_styling, lookup: { 0: 'Inactive', 1: 'Active' }}
                    ]}
                    data={[selectedFilter]}
                />
            </div>
            <div className={classes.inlineTable} style={{padding: '30px'}}>
                <img src={require("../../Images/send_right.png")}/>
            </div>
            <div className={classes.inlineTable}>
                <MaterialTable
                    title="Geo Locations"
                    options={{selection: true}}
                    columns={[
                        { title: 'ID', field: 'location_id', ...table_styling},
                        { title: 'Geo Location', field: 'location_name', ...table_styling},
                        { title: 'Type', field: 'location_type', ...table_styling}
                    ]}
                    data={applyChecked(campaignLocationLinks)}
                    onSelectionChange={handleAssociationsChange}
                />
            </div>
        </TabPanel>
        <TabPanel value={value} index={1}>
            <div className={classes.inlineTable}>
                <MaterialTable
                    title="Geo Locations"
                    options={{search: false}}
                    columns={[
                        { title: 'ID', field: 'location_id', ...table_styling},
                        { title: 'Geo Location', field: 'location_name', ...table_styling},
                        { title: 'Type', field: 'location_type', ...table_styling}
                    ]}
                    data={campaignLocationLinks}
                />
            </div>
            <div className={classes.inlineTable} style={{padding: '30px'}}>
                <img src="/send_right.png"/>
            </div>
            <div className={classes.inlineTable}>
                <MaterialTable
                    title="Geo Filters"
                    options={{search: false, selection: true}}
                    columns={[
                        { title: 'ID', field: 'frame_id', ...table_styling},
                        { title: 'Geo Filters', field: 'name', ...table_styling},
                        { title: 'Status', field: 'active', ...table_styling, lookup: { 0: 'Inactive', 1: 'Active' }}
                    ]}
                    data={[selectedFilter]}
                />
            </div>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default ViewLinks;