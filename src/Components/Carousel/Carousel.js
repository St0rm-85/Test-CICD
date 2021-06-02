import React, {useState, useEffect, useRef} from 'react';
import CarouselGeoFilters from './CarouselFilters';
import CarouselRankings from './Rankings';
import {Typography, Box, Tabs, Tab, TextField, Button, CircularProgress} from '@material-ui/core';
import TabPanel from '../TabPanel';
// import CampaignGeoLocations from './Campaign/GeoLocations';
import 'typeface-roboto';
import EditFilter from '../Common/EditFilter.js';
import DeleteFilter from '../Common/DeleteFilter';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom";
import GeoLocations from '../Common/GeoLocations/GeoLocations';

import {getEnvironmentCampaignIds} from '../../CommonFunctions';

import { 
    getCampaignLocationList, 
    materialTableCarouselFilters, 
    getCarouselDetails,
    updateCampaign
} from '../../ApiUtility/ApiUtility';


// https://prod.cameraplus.co/CameraPlus/retailer/campaign/list?retailer_id=0&active=0&app_type=LIV_HD_CAM
// https://prod.cameraplus.co/CameraPlus/retailer/campaign/delete?campaign_id=858

const useStyles = makeStyles({
    saveButton: {
        float: 'right',
        right: '25px'
    }
});


function Carousel (){
    const classes = useStyles();
    const [isCreateFilterDialogOpen, setIsCreateFilterDialogOpen] = useState(false);
    const [carouselDetails, setCarouselDetails] = useState({});
    const [textHeader, setTextHeader] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteFilterDialogOpen, setIsDeleteFilterDialogOpen] = useState(false);
    const [isCreateGeoLocationsDialogOpen, setIsCreateGeoLocationsDialogOpen] = useState(false);
    const [itemsToSelect, setItemsToSelect] = useState([]);
    const [editOpen, setEditOpen] = useState(false);
    const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
    const [campaignLocationLinks, setCampaignLocationLinks] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState({});
    const [campaignFilters, setCampaignFilters] = useState([]);
    const [campaign, setCampaign] = useState({name: "Carousel", campaign_id: getEnvironmentCampaignIds().carousel});
    const [value, setValue] = useState(0);

    const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};


    const tableRef = useRef();
    

    function handleChange(e, i){
        setValue(i);
    }

    function handleViewLinksClick(frame){
        setSelectedFilter(frame);
        
        setIsLinksDialogOpen(true);
    }

    const handleEditClose = e => {
        setSelectedFilter({});
        setEditOpen(false);
    }

    const updateCampaignLocationList = () => {
        getCampaignLocationList(campaign.campaign_id).then((fetchedCampaignLocations) => {
            setCampaignLocationLinks(fetchedCampaignLocations);
        });
    }

    const updateCarouselDisplayName = () => {
        setIsSaving(true);
        let nextCarouselDetails = JSON.parse(JSON.stringify(carouselDetails));
        nextCarouselDetails.text_header = textHeader;
        updateCampaign(nextCarouselDetails)
        .then(r => setIsSaving(false))
        .catch(err => err) 
    }

    useEffect(()=>{
        updateCampaignLocationList();
        getCarouselDetails().then(r => {
            
            setCarouselDetails(r);
            setTextHeader(r.text_header);
        });
    }, [])


    return (
        <>
            <EditFilter
                editOpen={editOpen}
                handleEditClose={handleEditClose}
                selectedFilter={selectedFilter} 
                setSelectedFilter={setSelectedFilter}
                campaign={campaign}
                retailer={{retailer_id:0}}
                refreshData={e => tableRef.current.onQueryChange()}
                frameAssociations={[{"entity_type_name":"campaign","entity_id":campaign.campaign_id}]}
            />
            <DeleteFilter 
                open={isDeleteFilterDialogOpen}
                setIsDeleteOpen={setIsDeleteFilterDialogOpen}
                handleDeleteClose={e => setIsDeleteFilterDialogOpen(false)}
                selectedFilter={selectedFilter} 
                setSelectedFilter={setSelectedFilter}
                refreshData={e => tableRef.current.onQueryChange()}
                campaign={campaign}
            />
            <Box style={{width:'100%'}}>
                <Box style={{textAlign: "left"}} pl={2}>
                    <Link style={{color: 'black'}} to={"/other-setups/non-sponsor"}>
                        <Typography style={{display: "inline-block", verticalAlign:"middle"}} variant="h6">
                            Carousel Filters
                        </Typography>
                    </Link>
                    <Button id="save_carousel_name" className={classes.saveButton} variant="contained" color="inherit" onClick={updateCarouselDisplayName}>
                        save {isSaving && <CircularProgress size={24} style={{position: "absolute"}} />}
                    </Button>
                    <TextField style={{float: 'right', marginRight:"45px"}} 
                        label="Menu Display Name" 
                        id="menu_display_name"
                        variant="outlined"
                        defaultValue={textHeader} 
                        value={textHeader}
                        onChange={e => setTextHeader(e.target.value)}
                    />
                </Box>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    <Tab id="geo_filters" label="Geo Filters" /> 
                    <Tab id="rankings" label="Ranking" />
                    <Tab id="geo_locations" label="Geo Locations" />
                </Tabs>
                <TabPanel value={value} index={0}>
                    <CarouselGeoFilters
                        open={isLinksDialogOpen} 
                        setIsLinksDialogOpen={setIsLinksDialogOpen}
                        campaignLocationLinks={campaignLocationLinks}
                        tableRef={tableRef}
                        setSelectedFilter={setSelectedFilter}
                        setEditOpen={setEditOpen}
                        selectedFilter={selectedFilter} 
                        campaignFilters={campaignFilters}
                        setIsCreateFilterDialogOpen={setIsCreateFilterDialogOpen}
                        setSelectedFilter={setSelectedFilter}
                        itemsToSelect={materialTableCarouselFilters}
                        setIsDeleteFilterDialogOpen={setIsDeleteFilterDialogOpen}
                        handleViewLinksClick={handleViewLinksClick}
                    />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <CarouselRankings/>
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <GeoLocations 
                        open={isLinksDialogOpen} 
                        setIsLinksDialogOpen={setIsLinksDialogOpen}
                        handleViewLinksClick={handleViewLinksClick}
                        campaign_id={campaign.campaign_id}
                        updateCampaignLocationList={updateCampaignLocationList}
                        campaignLocationLinks={campaignLocationLinks}
                        setIsCreateGeoLocationsDialogOpen={setIsCreateGeoLocationsDialogOpen}
                        isCreateGeoLocationsDialogOpen={isCreateGeoLocationsDialogOpen}
                        selectedFilter={selectedFilter} 
                        setSelectedFilter={setSelectedFilter}
                        itemsToSelect={materialTableCarouselFilters}
                    />
                </TabPanel>
            </Box>
        </>
    )
  }

  export default Carousel;