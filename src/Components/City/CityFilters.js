import React, {useState, useEffect, useRef} from 'react';
import MaterialTable, {MTableBody} from 'material-table';
import {Link, Typography, Box, Tabs, Tab} from '@material-ui/core';
// import ViewLinks from '../ViewLinks';
import {Create, Delete, ChevronLeft} from '@material-ui/icons';
import {applySchedActiveStatus, getStatusFilterStatement, getEnvironment, getAPICall} from '../../CommonFunctions';

const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};

let queryFilter = [];

function CityFilters(props){   
    let filterBy = null;

    useEffect(() => {
        return e => queryFilter = [];
    }, [])
    
    return(
        <MaterialTable
            title={
            <Link style={{color: 'black', cursor:"pointer"}} onClick={props.resetCityNav}>
                <ChevronLeft style={{verticalAlign:"middle"}} fontSize="large"/>
                <Typography style={{display: "inline-block", verticalAlign:"middle"}} variant="h6">
                    {props.entity_id !== 1 ? 
                    `${props.location.city_name}, ${props.location.state_name}` 
                    : "Generic City Filters"}
                </Typography>
            </Link>
            }
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
            columns={[
                { title: 'Id', field: 'frame_id', filtering: false, ...table_styling},
                { title: 'Filter Name', field: 'name', filtering: false, ...table_styling},
                { title: 'Status', field: 'active_status', ...table_styling, defaultFilter: queryFilter,
                lookup: { 0: 'Inactive', 1: 'Active', 2: 'Scheduled Inactive', 3: 'Scheduled Active' }},
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
                                        style={{verticalAlign: "bottom", lineHeight: '36px'}}>
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
                    tooltip: `Add ${props.entity_id == 1 ? "Generic" : "Specific"} City Geo Filter`,
                    isFreeAction: true,
                    onClick: (e) => props.setEditOpen(true)
                }
            ]}
            data={query =>
                new Promise((resolve, reject) => {
                    
                    let {active, jobFlag} = getStatusFilterStatement(query.filters);
                    queryFilter =  query.filters[0].value;
                    
                    let url = `${getEnvironment()}.cameraplus.co/CameraPlus/frame/list`
                    url += '?size=' + query.pageSize
                    url += '&from=' + (query.page * query.pageSize)
                    url += '&keyword=' + query.search;
                    if(query.filters[0]) url += `&active=${typeof active == "undefined" ? "" : active}`
                    if(query.filters[0]) url += `&jobFlag=${typeof jobFlag == "undefined" ? "" : jobFlag}`;
                    getAPICall(url, {
                        // active,
                        // jobFlag,
                        "frameAssociations": [
                            {
                                "entity_type_name": "location",
                                "entity_id": props.entity_id
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
    )
}

export default CityFilters;