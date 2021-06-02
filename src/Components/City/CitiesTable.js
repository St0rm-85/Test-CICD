import React, {useState, useEffect} from 'react';
import MaterialTable from 'material-table';
import {Link, Typography, Box, Tabs, Tab} from '@material-ui/core';
// import ViewLinks from '../ViewLinks';
import {Create, Delete} from '@material-ui/icons';
import ViewLinks from '../Common/ViewLinks';
import {Redirect} from "react-router-dom";
import { materialTableCampaignLocationList, getCampaignLocationList } from '../../ApiUtility/ApiUtility';
import {getEnvironment, getAPICall} from '../../CommonFunctions';

const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};


function CitiesTable(props){

    

    return(
        <MaterialTable
            title="Cities"
            tableRef={props.tableRef}
            columns={[
                { title: 'Id', field: 'location_id', ...table_styling},
                { title: 'City', field: 'city_name', ...table_styling},
                { title: 'State', field: 'state_name', ...table_styling},
                {
                    title: 'Action',
                    render: rowData => (
                        <Typography>
                            <Link 
                                style={{cursor: "pointer"}}
                                onClick={ e => {
                                    rowData.name = `${rowData.city_name}, ${rowData.state_name}`
                                    props.setLocation(rowData);
                                    props.cityFiltersTableRef.current.onQueryChange();
                                }}
                            >
                                <Create style={{color: "black"}}/>
                                    <span 
                                        style={{verticalAlign: "bottom",lineHeight: '36px'}}>
                                        Edit Geo Filters
                                    </span>
                            </Link>&nbsp;&nbsp;
                        </Typography>
                    ),
                    headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold'}
                },
            ]}
            actions={[
                {
                    icon: 'add',
                    tooltip: 'Add City Specific Frames',
                    isFreeAction: true,
                    onClick: (e) => props.setEditOpen(true)
                }
            ]}
            data={query =>
                new Promise((resolve, reject) => {
                    
                    let url = `${getEnvironment()}.cameraplus.co/CameraPlus/location/list`
                    url += '?size=' + query.pageSize
                    url += '&from=' + (query.page * query.pageSize)
                    url += '&keyword=' + query.search;
                    getAPICall(url, {
                        "location_type": "city",
                        "location_name": query.search
                    })
                    .then(response => response.data)
                    .then(result => {
                        
                      resolve({
                        data: result.response.items,
                        page: query.page || 0,
                        totalCount: result.response.total
                      })
                    })
                })}
        />
    )
}

export default CitiesTable;