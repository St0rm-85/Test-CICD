import React, {useState, useEffect, useRef} from 'react';
import GlobalGeoFilters from './GlobalFilters';
import {Typography, Box, Tabs, Tab} from '@material-ui/core';
import TabPanel from '../TabPanel';
// import CampaignGeoLocations from './Campaign/GeoLocations';
import 'typeface-roboto';
import EditFilter from '../Common/EditFilter.js';
import DeleteFilter from '../Common/DeleteFilter';

import { Link } from "react-router-dom";
import { getEnvironmentCampaignIds } from '../../CommonFunctions';
import {getCampaignFilters, getUrlVars, getCampaignLocationList, getCampaigns, materialTableCarouselFilters} from '../../ApiUtility/ApiUtility';


// https://prod.cameraplus.co/CameraPlus/retailer/campaign/list?retailer_id=0&active=0&app_type=LIV_HD_CAM
// https://prod.cameraplus.co/CameraPlus/retailer/campaign/delete?campaign_id=858



function Global (){
    const [isCreateFilterDialogOpen, setIsCreateFilterDialogOpen] = useState(false);
    const [isDeleteFilterDialogOpen, setIsDeleteFilterDialogOpen] = useState(false);
    const [isCreateGeoLocationsDialogOpen, setIsCreateGeoLocationsDialogOpen] = useState(false);
    const [itemsToSelect, setItemsToSelect] = useState([]);
    const [editOpen, setEditOpen] = useState(false);
    const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
    const [campaignLocationLinks, setCampaignLocationLinks] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState({});
    const [campaignFilters, setCampaignFilters] = useState([]);
    const [campaign, setCampaign] = useState({name: "Global", campaign_id: getEnvironmentCampaignIds().global});
    const [value, setValue] = useState(0);

    const tableRef = useRef();

    const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};

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

    const refreshData = e => tableRef.current.onQueryChange();

    useEffect(()=>{
        updateCampaignLocationList();
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
                refreshData={refreshData}
                frame_type={"global"}
            />
            <DeleteFilter 
                open={isDeleteFilterDialogOpen}
                setIsDeleteOpen={setIsDeleteFilterDialogOpen}
                handleDeleteClose={e => setIsDeleteFilterDialogOpen(false)}
                selectedFilter={selectedFilter} 
                setSelectedFilter={setSelectedFilter}
                refreshData={refreshData}
                campaign={campaign}
            />
            <Box style={{width:'100%'}}>
                <Box style={{textAlign: "left"}} pl={2}>
                    <Link style={{color: 'black'}} to={"/other-setups/non-sponsor"}>
                        <Typography style={{display: "inline-block", verticalAlign:"middle"}} variant="h6">
                            Global Filters
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
                </Tabs>
                <TabPanel value={value} index={0}>
                    <GlobalGeoFilters
                        open={isLinksDialogOpen} 
                        setIsLinksDialogOpen={setIsLinksDialogOpen}
                        campaignLocationLinks={campaignLocationLinks}
                        tableRef={tableRef}
                        setSelectedFilter={setSelectedFilter}
                        setEditOpen={setEditOpen}
                        editOpen={editOpen}
                        selectedFilter={selectedFilter} 
                        campaignFilters={campaignFilters}
                        setIsCreateFilterDialogOpen={setIsCreateFilterDialogOpen}
                        setSelectedFilter={setSelectedFilter}
                        itemsToSelect={materialTableCarouselFilters}
                        setIsDeleteFilterDialogOpen={setIsDeleteFilterDialogOpen}
                        handleViewLinksClick={handleViewLinksClick}
                    />
                </TabPanel>
            </Box>
        </>
    )
  }

  export default Global;