import React, {useState, useEffect, useRef} from 'react';
import {Typography, Box, Tabs, Tab} from '@material-ui/core';
import {ToggleButton, ToggleButtonGroup} from '@material-ui/lab';
import TabPanel from '../TabPanel';
import 'typeface-roboto';
import EditFilter from '../Common/EditFilter.js';
import DeleteFilter from '../Common/DeleteFilter';
import { Link } from "react-router-dom";
import CitiesTable from './CitiesTable';
import CityFilters from './CityFilters';

import {getCampaignLocationList, materialTableCarouselFilters} from '../../ApiUtility/ApiUtility';


// https://prod.cameraplus.co/CameraPlus/retailer/campaign/list?retailer_id=0&active=0&app_type=LIV_HD_CAM
// https://prod.cameraplus.co/CameraPlus/retailer/campaign/delete?campaign_id=858



function City (){
    const [isCreateFilterDialogOpen, setIsCreateFilterDialogOpen] = useState(false);
    const [isDeleteFilterDialogOpen, setIsDeleteFilterDialogOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState({});

    const [type, setType] = useState("specific");
    const [location, setLocation] = useState({});

    const cityFiltersTableRef = useRef();
    const genericFiltersTableRef = useRef();
    

    const resetCityNav = e => {
        setType("specific");
        setLocation({});
    }

    const handleCityToggle = (e, i) => {
        setType(i);
        if(i == "generic") setLocation({name: "Generic Geo Filter", location_id: 1});
    }

    const refreshData = e => {
        
        
        if(location.location_id == 1) genericFiltersTableRef.current.onQueryChange();
        else cityFiltersTableRef.current.onQueryChange();
    }

    const handleEditClose = e => {
        setSelectedFilter({});
        setEditOpen(false);
    }

    

    return (
        <>
            <EditFilter
                editOpen={editOpen}
                handleEditClose={handleEditClose}
                selectedFilter={selectedFilter} 
                setSelectedFilter={setSelectedFilter}
                campaign={location}
                retailer={{retailer_id:0}}
                refreshData={refreshData}
                frameAssociations={[{"entity_type_name":"location","entity_id":location.location_id}]}
                frame_type={"city-generic"}
            />
            <DeleteFilter 
                open={isDeleteFilterDialogOpen}
                setIsDeleteOpen={setIsDeleteFilterDialogOpen}
                handleDeleteClose={e => setIsDeleteFilterDialogOpen(false)}
                selectedFilter={selectedFilter} 
                setSelectedFilter={setSelectedFilter}
                refreshData={refreshData}
                campaign={location}
            />
            <Box style={{width:'100%'}}>
                <Box style={{textAlign: "left"}} pl={2}>
                    <Link style={{color: 'black'}} to={"/other-setups/non-sponsor"}>
                        {/* <Typography style={{display: "inline-block", verticalAlign:"middle"}} variant="h6">
                            Cities
                        </Typography> */}
                    </Link>
                </Box>
                <ToggleButtonGroup
                    value={type}
                    exclusive
                    onChange={handleCityToggle}
                    aria-label="text alignment"
                    id="togglebuttongroup"
                >
                    <ToggleButton value="specific" aria-label="left aligned">
                        City Specific
                    </ToggleButton>
                    <ToggleButton value="generic" aria-label="centered">
                        City Generic
                    </ToggleButton>
                </ToggleButtonGroup>
                    <Box className={type !== "specific" || !!location.city_id ? "hidden" : ""}>
                        <CitiesTable 
                            setLocation={setLocation}
                            cityFiltersTableRef={cityFiltersTableRef}
                        />
                    </Box>
                    <Box className={!!location.city_id ? "" : "hidden"}>
                        <CityFilters
                            entity_id={location.location_id}
                            location={location}
                            resetCityNav={resetCityNav}
                            tableRef={cityFiltersTableRef}
                            setEditOpen={setEditOpen}
                            setSelectedFilter={setSelectedFilter}
                            setIsDeleteFilterDialogOpen={setIsDeleteFilterDialogOpen}
                        />
                    </Box>
                    <Box className={type !== "generic" ? "hidden" : ""}>
                        <CityFilters
                            entity_id={1}
                            resetCityNav={resetCityNav}
                            setEditOpen={setEditOpen}
                            setSelectedFilter={setSelectedFilter}
                            setIsDeleteFilterDialogOpen={setIsDeleteFilterDialogOpen}
                            tableRef={genericFiltersTableRef}
                        />
                    </Box>
            </Box>
        </>
    )
  }

  export default City;