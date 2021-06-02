import React, {useState, useEffect, useRef} from 'react';
import {Card, Typography, Link} from '@material-ui/core';
import {Delete} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import CreateGeoLocationDialog from './CreateGeoLocationDialog';
import DeleteGeoLocationDialog from './DeleteGeoLocationDialog';
import ViewLinks from '../ViewLinks';
import "../../../App.css";

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
    const [isViewLinksOpen, setIsViewLinksOpen] = useState(false);

    function getActiveStatus({active, job}){
        
        
        if(job) return "scheduled";
        if(active == 1) return "active";
        return "inactive";
    }


    const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};

    const selectedItemColumns = [
        { title: 'ID', field: 'location_id', ...table_styling},
        { title: 'Geo Location', field: 'location_name', ...table_styling},
        { title: 'Type', field: 'location_type', ...table_styling}
    ]

    const itemsToSelectColumns = [
        { title: 'ID', field: 'frame_id', ...table_styling},
        { title: 'Geo Filters', field: 'name', ...table_styling},
        { title: 'Status', field: 'active', ...table_styling, lookup: { 0: 'Inactive', 1: 'Active' }}
    ]
    console.log("campaign id geolocations: ", props
    )
    return(
        <Card className={classes.root}>
            <ViewLinks 
                open={props.open} 
                setIsLinksDialogOpen={props.setIsLinksDialogOpen}
                itemsToSelect={props.itemsToSelect}
                setSelectedItem={setSelectedLocation}
                selectedItem={selectedLocation} 
                selectedItemColumns={selectedItemColumns}
                itemsToSelectColumns={itemsToSelectColumns}
                campaignId={props.campaignId || props.campaign_id}
                subject={"Geo Location"}
                object={"Geo Filters"}
            />
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
            />
            <MaterialTable
            title="GeoFilters"
            tableRef={tableRef} 
            options={{
                filtering: true
            }}
            columns={[
                { title: 'Id', field: 'location_id', ...table_styling, filtering: false},
                { title: 'Geo Location', field: 'location_name', ...table_styling, filtering: false},
                { title: 'Type', field: 'location_type', ...table_styling,
                    lookup: {city: 'Cities', location: 'Locations', area: "Areas", dma: "DMAs", zipcode: "Zip Codes", country: "Countries", state: "States"}
                },
                { title: 'Linked', field: 'optin_algorithm', ...table_styling, filtering: false,
                    render: rowData => (
                        <Link 
                            data-frame-id={rowData.frame_id} 
                            data-name={rowData.name} 
                            onClick={e => {
                                
                                props.handleViewLinksClick(rowData);
                                setSelectedLocation(rowData);
                            }}
                            className="view-links"
                        >View Links</Link>
                    )
                },
                {
                    title: 'Actions', 
                    filtering: false,
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
                                    className="delete_geolocation"
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