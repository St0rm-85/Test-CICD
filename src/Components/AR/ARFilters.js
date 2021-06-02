import React, {useState, useEffect} from 'react';
import MaterialTable, {MTableBody} from 'material-table';
import {Link, Typography, Box, Tabs, Tab} from '@material-ui/core';
// import ViewLinks from '../ViewLinks';
import {Create, Delete} from '@material-ui/icons';
import ViewLinks from '../Common/ViewLinks';
import {Redirect} from "react-router-dom";
import { materialTableCampaignLocationList, getCampaignLocationList } from '../../ApiUtility/ApiUtility';
import {applySchedActiveStatus, getStatusFilterStatement, getEnvironment, getAPICall, getEnvironmentCampaignIds} from '../../CommonFunctions';

const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};

const itemsToSelectColumns = [
    { title: 'ID', field: 'location_id', ...table_styling},
    { title: 'Geo Location', field: 'location_name', ...table_styling},
    { title: 'Type', field: 'location_type', ...table_styling}
]

const selectedItemColumns = [
    { title: 'ID', field: 'frame_id', ...table_styling},
    { title: 'Geo Filters', field: 'name', ...table_styling},
    { title: 'Status', field: 'active', ...table_styling, lookup: { 0: 'Inactive', 1: 'Active' }}
]

let queryFilter = [];

function CampaignGeoFilters(props){

    const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};

    const [campaignLocationList, setCampaignLocationList] = useState([]);
    let filterBy = null;


    useEffect(()=>{
        getCampaignLocationList(getEnvironmentCampaignIds().ar).then(setCampaignLocationList)
        .catch(err => err)
        return e => queryFilter = [];
    }, [])

    return(
        <>
        <ViewLinks 
            open={props.open} 
            setIsLinksDialogOpen={props.setIsLinksDialogOpen}
            filterLocationLinks={props.filterLocationLinks}
            campaignLocationLinks={props.campaignLocationLinks}
            setSelectedFilter={props.setSelectedFilter}
            setSelectedItem={props.setSelectedFilter}
            selectedItem={props.selectedFilter}
            selectedItemColumns={selectedItemColumns} 
            itemsToSelectColumns={itemsToSelectColumns}
            campaign_id={getEnvironmentCampaignIds().ar}
            itemsToSelect={campaignLocationList}
            refreshData={e => props.tableRef.current && props.tableRef.current.onQueryChange()}
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
                    props.onFilterChanged(columnId, [filterBy]);
                }}/>
            }}
            tableRef={props.tableRef}
            onSearchChange={(e) => e}
            columns={[
                { title: 'Id', field: 'frame_id', filtering: false, ...table_styling},
                { title: 'Filter Name', field: 'name', filtering: false, ...table_styling},
                { title: 'Status', field: 'active_status',
                 ...table_styling, defaultFilter: queryFilter,
                 lookup: { 0: 'Inactive', 1: 'Active', 2: 'Scheduled Inactive', 3: 'Scheduled Active' }},
                { title: 'Linked', field: 'optin_algorithm', filtering: false, ...table_styling, 
                    render: rowData => (
                        <Link 
                            data-frame-id={rowData.frame_id} 
                            data-name={rowData.name} 
                            onClick={e => props.handleViewLinksClick(rowData)}
                            className={"view-links"}
                        >View Links</Link>
                    )
                },
                { title: 'Links Count', field: 'location_count', filtering: false, ...table_styling},
                {
                    title: 'Actions', filtering: false,
                    render: rowData => (
                        <Typography>
                            <Link 
                                style={{cursor: "pointer"}}
                                onClick={ e => {
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
                                href="/delete_campaign"
                                onClick={event => {
                                    event.preventDefault();
                                    props.setSelectedFilter(rowData);
                                    props.setIsDeleteFilterDialogOpen(true);
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
                    tooltip: 'Add AR Filter',
                    isFreeAction: true,
                    onClick: (e) => props.setEditOpen(true)
                }
            ]}
            data={query =>
                new Promise((resolve, reject) => {
                    let {active, jobFlag} = getStatusFilterStatement(query.filters)
                    queryFilter = query.filters[0].value;
                    let url = `${getEnvironment()}.cameraplus.co/CameraPlus/frame/links`
                    url += '?size=' + query.pageSize
                    url += '&from=' + (query.page * query.pageSize)
                    url += '&keyword=' + query.search;
                    if(query.filters[0]) url += `&active=${active}`;
                    if(query.filters[0]) url += `&jobFlag=${jobFlag}`;
                    // if(query.filters[0]) url += getStatusFilterStatement(query.filters[0].value[0]);
                    getAPICall(url, {
                        // active,
                        // jobFlag,
                        "frameAssociations": [
                            {
                                "entity_type_name": "campaign",
                                "entity_id": getEnvironmentCampaignIds().ar
                            }
                        ]
                    })
                    .then(response => response.data)
                    .then(result => {
                      resolve({
                        data: applySchedActiveStatus(result.response.items),
                        page: query.page || 0,
                        totalCount: result.response.total
                      })
                    })
                })}
        />
        </>
    )
}

export default CampaignGeoFilters;