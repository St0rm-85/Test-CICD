import React, { useState } from 'react';
import {AppBar, Tabs, Tab, Box} from '@material-ui/core';
import {Settings, PeopleOutline, Person, Room, Policy} from '@material-ui/icons/';
import { getEnvironment } from '../CommonFunctions'
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import {getAPICall} from '../CommonFunctions';
import TabPanel from './TabPanel';
import EditCampaign from './NonSponsor/EditCampaign';
import NonSponsorTable from './NonSponsor/NonSponsorTable';
import ResponsiveDrawer from './ResponsiveDrawer';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

function getTabValue(){
    const location = window.location.href;
    if(location.includes("geo-settings")) return 0;
    if(location.includes("sponsored")) return 1;
    if(location.includes("other-setups")) return 2;
    if(location.includes("places")) return 3;
    if(location.includes("admin")) return 4;
}

const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
      display: 'flex',
      height: '80vh',
    },
    tabs: {
      borderRight: `1px solid ${theme.palette.divider}`,
      background: '#487898',
      color: 'white !important'
    },
    tab:{
        color: 'white !important'
    }
  }));

function NavBar (props) {
    const classes = useStyles();
    let [value, setValue] = useState(getTabValue());

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleClick = (event, url) => {
        if(!url) return; 
        event.preventDefault();
        window.location.href = url;
    }

    return(
        <>
            <AppBar position="static" style={{ background: '#487898' }}>
                <Grid container>
                    <Grid style={{textAlign: "left"}} item xs={5}>
                        <img 
                            src={`https://qa.cameraplus.co/v2/portal/cameraplus/js/img/MS_Logo_White.png`}
                            style={{    
                                width: "147px",
                                position: "absolute",
                                top: "18px",
                                "paddingRight": "2px"
                            }}
                            // onClick={e =>{ getAPICall(`/gauth?testUpload=true&path=gc%2Fsys%2Fobjblob%2Fframe%2F1647%2Ftest&content_type=image%2Fpng`, 
                            // {"file":"iVBORw0KGgoAAAANSUhEUgAAAPAAAADwAQMAAAAEm3vRAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABlBMVEUAAP////973JksAAAAAWJLR0QB/wIt3gAAAAd0SU1FB+MLEA4lOl+sgV0AAAAeSURBVFjD7cEBDQAAAMKg909tDwcUAAAAAAAAwKcBHRAAAfpQBoQAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTktMTEtMTZUMTQ6Mzc6NTgrMDA6MDDvJ7ItAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE5LTExLTE2VDE0OjM3OjU4KzAwOjAwnnoKkQAAAABJRU5ErkJggg=="}
                            // )}}
                        />
                        <div style={{width:'147px', textAlign: 'right'}}>v2.0</div>
                    </Grid>
                    <Grid item xs={7}>
                            <Tabs
                                variant="standard"
                                value={value}
                                onChange={handleChange}
                                aria-label="nav tabs example"
                                TabIndicatorProps={{style: {background: 'white'}}}
                            >
                                <Link disabled className={classes.tab} to={"/geo-settings"} 
                                // onClick={e => setValue(0)}
                                >
                                    <Tab label="Geo Settings" icon={<Settings />} 
                                        // onClick={e => handleClick(e, `${getEnvironment()}.cameraplus.co/v2/portal/cameraplus/index.html`)} 
                                    />
                                </Link>
                                <Link className={classes.tab} to={"/sponsored"} onClick={e => setValue(1)}>
                                    <Tab label="Sponsored" icon={<PeopleOutline />} onClick={handleClick} />
                                </Link>
                                <Link id="other_setups_link" className={classes.tab} to={"/other-setups/city"} onClick={e => setValue(2)}>
                                    <Tab label="Other Setups" icon={<Person />} onClick={handleClick} />
                                </Link>
                                <Link className={classes.tab} to={"/places"} 
                                // onClick={e => setValue(3)}
                                >
                                    <Tab label="Places" icon={<Room />} 
                                    // onClick={e => handleClick(e, `${getEnvironment()}.cameraplus.co/v2/portal/cameraplus/index.html?root=places`)} 
                                    />
                                </Link>
                                <Link className={classes.tab} to={"/admin"} 
                                // onClick={e => setValue(4)}
                                >
                                    <Tab label="Admin" icon={<Policy />} 
                                    // onClick={e => handleClick(e, `${getEnvironment()}.cameraplus.co/v2/portal/cameraplus/index.html?root=admin`)} 
                                    />
                                </Link>
                            </Tabs>
                    </Grid>
                </Grid>
            </AppBar>
        </>
    )
}

export default NavBar;