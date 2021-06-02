import React, {useState, useEffect, useRef} from 'react';
import MaterialTable, {MTableBody} from 'material-table';
import {Link, Typography, Box, Tabs, Tab} from '@material-ui/core';
import ViewLinks from '../ViewLinks';
import {Create, Delete} from '@material-ui/icons';
import {Redirect} from "react-router-dom";

let queryFilter = [];
let filterBy = null;

function CampaignGeoFilters(props){
    const tableRef = useRef();
    

    const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};

    useEffect(()=>{
        return e => queryFilter = [];
    }, []);
    
    return(
        <>
        <ViewLinks 
            open={props.open}
            campaign_id={props.campaign_id}
            setIsLinksDialogOpen={props.setIsLinksDialogOpen}
            campaignLocationLinks={props.campaignLocationLinks}
            setSelectedFilter={props.setSelectedFilter}
            selectedFilter={props.selectedFilter} 
            refreshData={props.refreshData}
        />
        <MaterialTable
            title="GeoFilters"
            options={{
                filtering: true
            }}
            components={{
                Body: props => <MTableBody {...props} onFilterChanged={(columnId, value) => {
                    let nextFilterBy = value.filter(x => x !== filterBy);
                    filterBy = nextFilterBy[0];
                    queryFilter = [filterBy];
                    props.onFilterChanged(columnId, [filterBy]);
                }}/>
            }}
            columns={[
                { title: 'Id', field: 'frame_id', filtering: false, ...table_styling},
                { title: 'Filter Name', field: 'name', filtering: false, ...table_styling},
                { title: 'Status', field: 'active_status', ...table_styling, defaultFilter: queryFilter,
                    lookup: { 0: 'Inactive', 1: 'Active', 2: 'Scheduled Inactive', 3: 'Scheduled Active' }
                },
                { title: 'Linked', field: 'optin_algorithm', filtering: false, ...table_styling, 
                    render: rowData => (
                        <Link 
                            data-frame-id={rowData.frame_id} 
                            data-name={rowData.name} 
                            onClick={props.handleViewLinksClick}
                            style={{cursor: "pointer"}}
                        >View Links</Link>
                    )
                },
                { title: 'Links Count', field: 'location_count', filtering: false, ...table_styling},
                {
                    title: 'Actions', filtering: false,
                    render: rowData => (
                        <Typography>
                            <Link 
                                style={{cursor: 'pointer'}}
                                onClick={e => {
                                    props.setSelectedFilter(rowData);
                                    props.setEditOpen(true)
                                }}
                            >
                                <Create style={{color: "black"}}/>
                                    <span 
                                        style={{verticalAlign: "bottom",lineHeight: '36px'}}>
                                        Edit
                                    </span>
                            </Link>&nbsp;&nbsp;
                            <Link 
                                href="/delete_filter"
                                onClick={event => {
                                    
                                    event.preventDefault();
                                    props.setSelectedFilter(rowData);
                                    props.setIsDeleteOpen(true);
                                }}
                            >
                                <Delete 
                                    style={{color: "black"}}
                                    onClick={e => props.setIsDeleteOpen(true)}
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
                    tooltip: 'Add Campaign Geo Filter',
                    isFreeAction: true,
                    onClick: (event) => {
                        // props.setSelectedFilter(rowData);
                        props.setEditOpen(true)
                    }
                }
            ]}
            data={props.campaignFilters}
        />
        </>
    )
}

export default CampaignGeoFilters;