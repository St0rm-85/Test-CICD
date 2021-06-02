import React, {useState, useEffect, useRef} from 'react';
import SettingsCard from '../../SettingsCard';
import {Card, CardContent, Typography, FormControlLabel, Checkbox, 
    FormControl, FormLabel, RadioGroup, Radio, Button, Box, Link} from '@material-ui/core';
import {Delete} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import SchedulePicker from "./SchedulePicker";
import moment from 'moment-timezone';
import MaterialTable from 'material-table';
// import ViewLinks from '../../Common/ViewLinks';
import ViewLinks from '../ViewLinks';
import CreateGeoLocationDialog from './CreateGeoLocationDialog';
import DeleteGeoLocationDialog from './DeleteGeoLocationDialog';
import "../../../App.css";

import {deleteCampaignLocationAssociation} from '../../../ApiUtility/ApiUtility';

const useStyles = makeStyles({
    root: {
      maxWidth: "100%",
    },
    media: {
      height: 140,
    },
    formLabel: {
        display: 'block'
    },
    formControl: {
        minWidth: "70%"
    },
    saveButton: {
        postion: 'relative',
        right: '25px'
    },
    saveButtonContainer: {
        textAlign: 'right'
    }
  });

function CampaignGeoLocations(props){

    const classes = useStyles();
    const tableRef = useRef();

    const [selectedLocation, setSelectedLocation] = useState({});
    const [isDeleteGeoLocationsDialogOpen, setIsDeleteGeoLocationsDialogOpen] = useState(false);

    function getActiveStatus({active, job}){
        
        
        if(job) return "scheduled";
        if(active == 1) return "active";
        return "inactive";
    }


    const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};


    return(
        <Card className={classes.root}>
            <CreateGeoLocationDialog
                open={props.isCreateGeoLocationsDialogOpen}
                setIsCreateDialogOpen={props.setIsCreateGeoLocationsDialogOpen}
                updateCampaignLocationList={props.updateCampaignLocationList}
                campaign_id={props.campaign_id}
            />
            <DeleteGeoLocationDialog
                setIsDeleteDialogOpen={setIsDeleteGeoLocationsDialogOpen}
                open={isDeleteGeoLocationsDialogOpen}
                campaign_id={props.campaign_id}
                location_id={selectedLocation.location_id}
                refreshData={props.updateCampaignLocationList}
                campaignFilters={props.campaignFilters}
            />
            <ViewLinks 
                open={props.open}
                campaign_id={props.campaign_id}
                setIsLinksDialogOpen={props.setIsLinksDialogOpen}
                campaignLocationLinks={props.campaignLocationLinks}
                setSelectedFilter={props.setSelectedFilter}
                selectedFilter={props.selectedFilter} 
                refreshData={props.refreshData}
            />
            {/* <ViewLinks 
                open={props.open} 
                setIsLinksDialogOpen={props.setIsLinksDialogOpen}
                itemsToSelect={props.itemsToSelect}
                setSelectedItem={setSelectedLocation}
                selectedItem={selectedLocation} 
                selectedItemColumns={selectedItemColumns}
                itemsToSelectColumns={itemsToSelectColumns}
                subject={"Geo Location"}
                object={"Geo Filters"}
            /> */}
            <MaterialTable
            title="GeoFilters"
            tableRef={tableRef} 
            columns={[
                { title: 'Id', field: 'location_id', ...table_styling},
                { title: 'Geo Location', field: 'location_name', ...table_styling},
                { title: 'Type', field: 'location_type', ...table_styling},
                { title: 'Linked', field: 'optin_algorithm', ...table_styling, 
                    render: rowData => (
                        <Link 
                            data-frame-id={rowData.frame_id} 
                            data-name={rowData.name} 
                            onClick={props.handleViewLinksClick}
                            style={{cursor: "pointer"}}
                        >View Links</Link>
                    )
                },
                {
                    title: 'Actions', 
                    render: rowData => (
                        <Typography>
                            <Link 
                                href="/delete_campaign"
                                onClick={(event, v)=> {
                                    event.preventDefault();
                                    
                                    
                                    // deleteCampaignLocationAssociation()
                                    setSelectedLocation(rowData);
                                    setIsDeleteGeoLocationsDialogOpen(true);
                                }}
                            >
                                <Delete 
                                    style={{color: "black"}}
                                />
                                    <span 
                                        style={{verticalAlign: "bottom",lineHeight: '36px'}}>
                                        Delete
                                    </span>
                            </Link>
                        </Typography>
                    ),
                    headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold'}
                },
            ]}
            actions={[
                {
                    icon: 'add',
                    tooltip: 'Add New Geo Location',
                    isFreeAction: true,
                    onClick: (event) => props.setIsCreateGeoLocationsDialogOpen(true)
                }
            ]}
            data={props.campaignLocationLinks.map(x => {
                if(x.tableData) delete x.tableData.checked;
                return x;
            })
        }
        />
        </Card>
    )
}

export default CampaignGeoLocations;