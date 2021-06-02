import React, {useState, useEffect} from 'react';
import CampaignGeoFilters from './Campaign/GeoFilters';
import Settings from './Campaign/Settings';
import {Typography, Box, Tabs, Tab} from '@material-ui/core';
import TabPanel from '../TabPanel';
import CampaignGeoLocations from './Campaign/GeoLocations';
import GeoLocations from '../Common/GeoLocations/GeoLocations';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import EditFilter from '../Common/EditFilter.js';
import DeleteFilter from '../Common/DeleteFilter';
import 'typeface-roboto';
import {applySchedActiveStatus, getStatusFilterStatement} from '../../CommonFunctions';

import { Link } from "react-router-dom";

import {getCampaignFilters, getUrlVars, getCampaignLocationList, 
    getCampaigns, materialTableCarouselFilters} from '../../ApiUtility/ApiUtility';

// https://prod.cameraplus.co/CameraPlus/retailer/campaign/list?retailer_id=0&active=0&app_type=LIV_HD_CAM
// https://prod.cameraplus.co/CameraPlus/retailer/campaign/delete?campaign_id=858



function EditCampaign (props){
    const [isCreateFilterDialogOpen, setIsCreateFilterDialogOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isCreateGeoLocationsDialogOpen, setIsCreateGeoLocationsDialogOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
    const [campaignLocationLinks, setCampaignLocationLinks] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState({active: 1});
    const [campaignFilters, setCampaignFilters] = useState([]);
    const [campaign, setCampaign] = useState({});
    const [value, setValue] = useState(0);
    const campaign_id = getUrlVars()["campaign_id"];
    const sponsor_id = props.match ? props.match.params.sponsor_id : 0;

    const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};

    function handleChange(e, i){
        setValue(i);
    }

    function handleViewLinksClick(e){
        
        let frame = campaignFilters.find(x => x.frame_id == e.target.getAttribute("data-frame-id"));
        setSelectedFilter(frame)
        setIsLinksDialogOpen(true);
    }

    const handleViewLinksClickGeo = (frame) => {
        
        setSelectedFilter(frame);
        setIsLinksDialogOpen(true);
    }

    const getCampaign = () => {
        getCampaigns(sponsor_id).then((campaigns)=>{
            let campaign = campaigns.find(c => c.campaign_id == campaign_id);
            setCampaign(campaign || {});
        }).catch(err=> console.log("err: ", err));
    }

    const handleEditClose = e => {
        setSelectedFilter({active: 1});
        setEditOpen(false);
    }

    const handleDeleteClose = e => {
        setSelectedFilter({active: 1});
        setIsDeleteOpen(false);
    }

    const updateCampaignLocationList = () => {
        
        getCampaignLocationList(campaign_id).then((fetchedCampaignLocations) => {
            
            setCampaignLocationLinks(fetchedCampaignLocations);
            updateFilters();
        });
    }

    const updateFilters = () => {
        getCampaignFilters(campaign_id).then((fetchedCampaignFilters)=>{
            setCampaignFilters(applySchedActiveStatus(fetchedCampaignFilters));
        });
    }

    useEffect(()=>{
        updateFilters();
        updateCampaignLocationList();
        getCampaign();
    }, []);
    
    return (
        <>
            <EditFilter
                editOpen={editOpen}
                handleEditClose={handleEditClose}
                selectedFilter={selectedFilter} 
                setSelectedFilter={setSelectedFilter}
                campaign={campaign}
                retailer={{retailer_id:0}}
                refreshData={updateFilters}
                frameAssociations={[{"entity_type_name":"campaign","entity_id":campaign.campaign_id}]}
            />
            <DeleteFilter 
                open={isDeleteOpen}
                setIsDeleteOpen={setIsDeleteOpen}
                handleDeleteClose={handleDeleteClose}
                selectedFilter={selectedFilter} 
                setSelectedFilter={setSelectedFilter}
                refreshData={updateFilters}
                campaign={campaign}
            />
            <Box style={{textAlign: "left"}} pl={2}>
                <Link 
                    style={{color: 'black'}} 
                    to={sponsor_id == 0 ? "/other-setups/non-sponsor" : `/sponsored/${sponsor_id}`}
                >
                    <ChevronLeftIcon style={{verticalAlign:"middle"}} fontSize="large"/>
                    <Typography style={{display: "inline-block", verticalAlign:"middle"}} variant="h6">
                        {campaign.name}
                    </Typography>
                </Link>
            </Box>
            <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                centered
            >
                <Tab label="Geo Filters" /> 
                <Tab label="Settings" />
                <Tab label="Geo Locations" />
            </Tabs>
            <TabPanel value={value} index={0}>
                <CampaignGeoFilters
                    open={isLinksDialogOpen}
                    setEditOpen={setEditOpen} 
                    campaign={campaign}
                    campaign_id={campaign_id}
                    setIsLinksDialogOpen={setIsLinksDialogOpen}
                    campaignLocationLinks={campaignLocationLinks}
                    setSelectedFilter={setSelectedFilter}
                    selectedFilter={selectedFilter} 
                    campaignFilters={campaignFilters}
                    setIsCreateFilterDialogOpen={setIsCreateFilterDialogOpen}
                    setIsDeleteOpen={setIsDeleteOpen}
                    handleViewLinksClick={handleViewLinksClick}
                    refreshData={updateFilters}
                />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Settings
                    campaign={campaign}
                    setCampaign={setCampaign}
                    getCampaign={getCampaign}
                />
            </TabPanel>
            <TabPanel value={value} index={2}>
                {/* <CampaignGeoLocations 
                    campaign_id={campaign_id}
                    updateCampaignLocationList={updateCampaignLocationList}
                    campaignLocationLinks={campaignLocationLinks}
                    setIsCreateGeoLocationsDialogOpen={setIsCreateGeoLocationsDialogOpen}
                    isCreateGeoLocationsDialogOpen={isCreateGeoLocationsDialogOpen}
                /> */}
                <GeoLocations 
                    open={isLinksDialogOpen} 
                    setIsLinksDialogOpen={setIsLinksDialogOpen}
                    handleViewLinksClick={handleViewLinksClickGeo}
                    campaign_id={campaign.campaign_id}
                    updateCampaignLocationList={updateCampaignLocationList}
                    campaignLocationLinks={campaignLocationLinks}
                    setIsCreateGeoLocationsDialogOpen={setIsCreateGeoLocationsDialogOpen}
                    isCreateGeoLocationsDialogOpen={isCreateGeoLocationsDialogOpen}
                    selectedFilter={selectedFilter} 
                    setSelectedFilter={setSelectedFilter}
                    itemsToSelect={materialTableCarouselFilters}
                    campaignFilters={campaignFilters}
                    campaignId={campaign_id}
                />
            </TabPanel>
        </>
    )
  }

  export default EditCampaign;