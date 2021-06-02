import React, {useState, useEffect} from 'react';
import MaterialTable, {MTableBody} from 'material-table';
import {Typography, Box} from '@material-ui/core';
import {Create, Delete, ChevronLeft} from '@material-ui/icons';
import DeleteCampaignDialog from './DeleteCampaignDialog';
import CreateCampaignDialog from './CreateCampaignDialog';
import CheckIcon from '@material-ui/icons/Check';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

import {applySchedActiveStatus, getStatusFilterStatement, getEnvironment, getAPICall} from '../../CommonFunctions';
import {getCampaigns, getUrlVars} from '../../ApiUtility/ApiUtility';

// https://prod.cameraplus.co/CameraPlus/retailer/campaign/list?retailer_id=0&active=0&app_type=LIV_HD_CAM
// https://prod.cameraplus.co/CameraPlus/retailer/campaign/delete?campaign_id=858

let queryFilter = [];

function NonSponsorTable (props){
    
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCampaignId, setSelectedCampaignId] = useState();
    const [campaigns, setCampaigns] = useState([]);
    const tableRef = React.createRef();
    const retailerId = props.match ? props.match.params.sponsor_id : 0;
    let filterBy = null;

    useEffect(()=>{
        
        // getCampaigns().then((campaigns)=>{
        //     setCampaigns(campaigns);
        // });
        return e => queryFilter = [];
    }, []);

    const getEditCampaignLink = () => {
        if(retailerId == 0) return "/other-setups/non-sponsor/edit_campaign?campaign_id=";
        else return `/sponsored/${retailerId}/campaigns?campaign_id=`;
    }

    const refreshData = () =>{
        
        tableRef.current.onQueryChange();
    }

    const campaignTableTitle = () => {
        if(!retailerId) return "Campaigns"
        else{
            return (<Box style={{textAlign: "left"}} pl={2}>
                <Link 
                    style={{color: 'black'}} 
                    to={"/sponsored"}
                >
                    <ChevronLeft style={{verticalAlign:"middle"}} fontSize="large"/>
                    <Typography style={{display: "inline-block", verticalAlign:"middle"}} variant="h6">
                       {decodeURIComponent(getUrlVars()["sponsor_name"])} --- Campaigns
                    </Typography>
                </Link>
            </Box>)
        }
    }

    return (
        <>
            <DeleteCampaignDialog
                open={isDeleteDialogOpen}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                selectedCampaignId={selectedCampaignId}
                setSelectedCampaignId={setSelectedCampaignId}
                refreshData={refreshData}
            />
            <CreateCampaignDialog 
                retailerId={retailerId}
                open={isCreateDialogOpen}
                setIsCreateDialogOpen={setIsCreateDialogOpen}
                refreshData={refreshData}
            />
            <MaterialTable
                title={campaignTableTitle()}
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
                    { title: 'Id', field: 'campaign_id', filtering: false,
                        headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
                        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}
                    },
                    { title: 'Campaign Name', field: 'name', filtering: false,
                        headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
                        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}
                    },
                    { title: 'Status', field: 'active_status',
                        headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
                        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'}, 
                        lookup: { 0: 'Inactive', 1: 'Active', 2: 'Scheduled Inactive', 3: 'Scheduled Active' },
                        defaultFilter: queryFilter
                        // render: rowData => (
                        //     <span>{rowData.active == 0 ? "Active" : "Inactive"}</span>
                        // )
                    },
                    { title: 'Show in Carousel', field: 'optin_algorithm', filtering: false,
                        headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
                        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'},
                        render: rowData => (rowData.optin_algorithm == 1 && <CheckIcon style={{color:"green"}} />)
                    },
                    { title: 'Show in Menu List', field: 'optin_menu', filtering: false, 
                        headerStyle: {backgroundColor: '#9cadc3', fontWeight: 'bold', borderRight: '1px solid white'},
                        cellStyle: {borderRight: '.5px solid rgba(224, 224, 224, 1)'},
                        render: rowData => (rowData.optin_menu == 1 && <CheckIcon style={{color:"green"}} />)
                    },
                    {
                        title: 'Actions', filtering: false,
                        render: rowData => (
                            <>
                            <Typography>
                                <Link to={getEditCampaignLink()+rowData.campaign_id}>
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
                                        setSelectedCampaignId(rowData.campaign_id)
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
                      tooltip: 'Add Campaign',
                      isFreeAction: true,
                      onClick: (event) => setIsCreateDialogOpen(true)
                    }
                ]}
                data={query =>
                    new Promise((resolve, reject) => {
                        console.log("query.filters: ", query.filters);
                        console.log("uery.filters[0].value: ", query.filters[0].value);
                        let {active, jobFlag} = getStatusFilterStatement(query.filters);
                        queryFilter =  query.filters[0].value;
                        let url = `${getEnvironment()}.cameraplus.co/CameraPlus/retailer/campaign/list?retailer_id=${retailerId}&app_type=LIV_HD_CAM`
                        url += '&size=' + query.pageSize
                        url += '&from=' + (query.page * query.pageSize)
                        url += '&keyword=' + query.search;
                        if(query.filters[0].value[0]) url += `&active=${active == 0 ? 2 : 1}`
                        else url += '&active=0';
                        if(query.filters[0]) url += `&jobFlag=${typeof jobFlag == "undefined" ? "" : jobFlag}`;
                        getAPICall(url)
                            // .then(response => response.json())
                            .then(result => {
                                
                            resolve({
                                data: applySchedActiveStatus(result.data.response.items),
                                page: query.page || 0,
                                totalCount: result.data.response.total
                            })
                            })
                        })
                  }
            />
        </>
    )
  }

  export default NonSponsorTable;