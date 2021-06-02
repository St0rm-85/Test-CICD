import React, {useState, useEffect, useRef} from 'react';
import MaterialTable, {MTableBody} from 'material-table';
import {Typography, Box} from '@material-ui/core';
import {Create, Delete} from '@material-ui/icons';
import EditSponsor from './EditSponsor';
import DeleteSponsorDialog from './DeleteSponsor';
import {
    BrowserRouter as Router,
    Switch,
    Link,
    Route
  } from "react-router-dom";

import {getCampaigns} from '../../ApiUtility/ApiUtility';
import {getStatusFilterStatement, getEnvironment, getAPICall} from '../../CommonFunctions';

// https://prod.cameraplus.co/CameraPlus/retailer/campaign/list?retailer_id=0&active=0&app_type=LIV_HD_CAM
// https://prod.cameraplus.co/CameraPlus/retailer/campaign/delete?campaign_id=858

const table_styling = {headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}};

function SponsorTable (){
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSponsorId, setSelectedSponsorId] = useState();
    const [selectedSponsor, setSelectedSponsor] = useState({active: 1});
    const tableRef = useRef();

    let filterBy  = null;

    const closeCreateDialog = () => {
        setIsCreateDialogOpen(false);
        setSelectedSponsor({active: 1});
        setSelectedSponsorId();
    }

    const refreshData = () =>{
        
        tableRef.current.onQueryChange();
    }

    return (
        <div style={{width: "95%", margin: "2.5% auto"}}>
            <DeleteSponsorDialog
                open={isDeleteDialogOpen}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                selectedSponsorId={selectedSponsorId}
                setSelectedSponsorId={setSelectedSponsorId}
                refreshData={refreshData}
            /> 
            <EditSponsor
                open={isCreateDialogOpen}
                setIsCreateDialogOpen={setIsCreateDialogOpen}
                closeCreateDialog={closeCreateDialog}
                selectedSponsor={selectedSponsor}
                refreshData={refreshData}
            />
            <MaterialTable
                title="Sponsors"
                tableRef= { tableRef }
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
                columns={[
                    { title: 'Id', field: 'retailerId', filtering: false, ...table_styling
                    },
                    { title: 'Sponsor Name', field: 'name', filtering: false, ...table_styling
                    },
                    { title: 'Status', field: 'active', lookup: { 0: 'Inactive', 1: 'Active' },
                        ...table_styling,
                        // render: rowData => (
                        //     <span>{rowData.active == 0 ? "Active" : "Inactive"}</span>
                        // )
                    },
                    {
                        title: 'Actions', filtering: false,
                        render: rowData => (
                            <>
                            <Typography>
                                <Link onClick={e => {
                                    setSelectedSponsor(rowData);
                                    setIsCreateDialogOpen(true);
                                }}>
                                    <Create style={{color: "black"}}/>
                                        <span 
                                            style={{verticalAlign: "bottom",lineHeight: '36px', cursor: "pointer"}}>
                                            Edit
                                        </span>
                                </Link>&nbsp;&nbsp;
                                <Link 
                                    href="/delete_campaign"
                                    onClick={event => {
                                        event.preventDefault();
                                        setSelectedSponsorId(rowData.retailerId)
                                        setIsDeleteDialogOpen(true);
                                    }}
                                >
                                    <Delete 
                                        style={{color: "black"}}
                                    />
                                        <span 
                                            style={{verticalAlign: "bottom",lineHeight: '36px'}}>
                                            Delete
                                        </span>
                                </Link>&nbsp;&nbsp;
                                <Link to={`/sponsored/${rowData.retailerId}?sponsor_name=${rowData.name}`}
                                    style={{float: 'right'}}
                                >
                                        <span 
                                            style={{verticalAlign: "bottom",lineHeight: '36px', cursor: "pointer"}}>
                                            Details >>
                                        </span>
                                </Link>
                            </Typography>
                                <Route  path={"/other-setups/non-sponsor/edit_campaign?campaign_id="+rowData.campaign_id}>
                                    Here route
                                </Route>
                            </>
                        ),
                        headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold'}
                    },
                ]}
                actions={[
                    {
                      icon: 'add',
                      tooltip: 'Add New Sponsor',
                      isFreeAction: true,
                      onClick: (event) => setIsCreateDialogOpen(true)
                    }
                ]}
                data={query =>
                     new Promise((resolve, reject) => {
                        
                        let {active} = getStatusFilterStatement(query.filters)
                        let url = `${getEnvironment()}.cameraplus.co/CameraPlus/retailer/v2/list`
                        url += '?size=' + query.pageSize
                        url += '&from=' + (query.page * query.pageSize)
                        url += '&keyword=' + query.search;
                        if(query.filters[0]) url += `&active=${typeof active == "undefined" ? "" : active}`;
                        getAPICall(url)
                        .then(response => response.data)
                        .then(result => {
                            
                            resolve({
                                data: result.response.items,
                                page: query.page || 0,
                                totalCount: result.response.total
                            })
                        })
                    })
                  }
            />
        </div>
    )
  }

  export default SponsorTable;