import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {LocationCity, Flag, Language, ViewCarousel, Face} from '@material-ui/icons/';
import {getEnvironment} from '../CommonFunctions';
import NonSponsorTable from './NonSponsor/NonSponsorTable';
import Carousel from './Carousel/Carousel';
import AR from './AR/AR';
import EditCampaign from './NonSponsor/EditCampaign';
import Global from './Global/Global';
import City from './City/City';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function getSidebarValue(){
  const path = window.location.pathname;
  if(path.includes("city")) return 0;
  else if(path.includes("non-sponsor")) return 1;
  else if(path.includes("global")) return 2;
  else if(path.includes("carousel")) return 3;
  else if(path.includes("ar")) return 4;
  return 0;
}


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
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
      borderBottom: "1px solid white",
      color: 'white !important'
  }
}));

export default function VerticalTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(getSidebarValue());

  const handleChange = (event, newValue) => {
    setValue(newValue);
    // if(newValue == 1) window.location.href = "/other-setups/non-sponsor";
  };

  const handleLinkClick = (e, url) => {
    if(!url) return;
    e.preventDefault()
    window.location.href = url 
  }
  

  return (
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        className={classes.tabs}
        TabIndicatorProps={{style: {background: 'white', color: 'orange'}}}
      >
        <Link to={'/other-setups/city'} className={classes.tab} onClick={()=>{setValue(0)}}><Tab icon={<LocationCity/>} className={classes.tab} label="By City" {...a11yProps(0)} /></Link>
        <Link to={'/other-setups/non-sponsor'} className={classes.tab} onClick={()=>{setValue(1)}}><Tab icon={<Flag/>} className={classes.tab} label="Non-Sponsor" {...a11yProps(1)}></Tab></Link>
        {/* <Tab icon={<Language/>} className={classes.tab} onClick={e => handleLinkClick(e, `${getEnvironment()}.cameraplus.co/v2/portal/cameraplus/index.html?root=non_sponsored&ns=nsCreateAndEditContent&nsCe=ns_ce_global`)}  label="Global" {...a11yProps(2)} /> */}
        <Link to={'/other-setups/global'} className={classes.tab} onClick={e => setValue(2)}><Tab icon={<Language/>} className={classes.tab} label="Global" {...a11yProps(2)} /> </Link>
        <Link id="carousel_link" to={'/other-setups/carousel'} className={classes.tab} onClick={e => setValue(3)} ><Tab icon={<ViewCarousel/>} className={classes.tab} label="Carousel" {...a11yProps(3)} /></Link>
        <Link to={'/other-setups/ar'}  
          className={classes.tab} 
          onClick={e => setValue(4)} 
        >
          <Tab icon={<Face/>} className={classes.tab} label="AR" {...a11yProps(4)} />
        </Link>
        {/* handleLinkClick(e, `${getEnvironment()}.cameraplus.co/v2/portal/cameraplus/index.html?root=non_sponsored&ns=nsCreateAndEditContent&nsCe=ns_ce_global`) */}
      </Tabs>
      <TabPanel value={value} index={0} style={{width: '100%'}}>
        <Switch>
          <div>
            <Route exact path="/other-setups/city">
              <City/>
            </Route>
          </div>
        </Switch>
      </TabPanel>
      <TabPanel value={value} index={1} style={{width: '100%'}}>
        <Switch>
          <div>
            <Route exact path="/other-setups/non-sponsor/edit_campaign">
              <EditCampaign/>
            </Route>
            <Route exact path="/other-setups/non-sponsor/">
              <NonSponsorTable/>
            </Route>
            
          </div>
        </Switch>
      </TabPanel>
      <TabPanel value={value} index={2} style={{width: '100%'}}>
        <Switch>
          <div>
            <Route exact path="/other-setups/global/">
              <Global/>
            </Route>
          </div>
        </Switch>
      </TabPanel>
      <TabPanel value={value} index={3} style={{width: '100%'}}>
        <Switch>
          <div>
            <Route exact path="/other-setups/carousel/">
              <Carousel/>
            </Route>
          </div>
        </Switch>
      </TabPanel>
      <TabPanel value={value} index={4} style={{width: '100%'}}>
        <Switch>
          <div>
            <Route exact path="/other-setups/ar/">
              <AR/>
            </Route>
          </div>
        </Switch>
      </TabPanel>
    </div>
  );
}
