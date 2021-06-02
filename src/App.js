import React, { useState, useEffect } from 'react';
import NavBar from "./Components/NavBar";
import ResponsiveDrawer from './Components/ResponsiveDrawer';
import Sponsor from './Components/Sponsor/Sponsor';
import NonSponsorTable from './Components/NonSponsor/NonSponsorTable';
import EditCampaign from './Components/NonSponsor/EditCampaign';
import {Box, Button} from '@material-ui/core';
import "@aws-amplify/ui/dist/style.css"
import { getEnvironment } from './CommonFunctions';
import { Auth, Hub } from 'aws-amplify';
import {setGDriveHeader, testFormDataCall} from './ApiUtility/ApiUtility';
import {  AmplifySignOut } from '@aws-amplify/ui-react';
import {Provider} from 'jotai';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';

const getPre = () => {
  if(window.location.host== "cameraplus.studio") return "https://tools.cameraplus.co";
  else return "http://qa.cameraplus.co";
}

const App = () => {
  
  const [user, setUser] = useState(null);
  console.log("test change");

  useEffect(() => {
    Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
        case 'cognitoHostedUI':
          getUser().then(userData => setUser(userData));
          break;
        case 'signOut':
          setUser(null);
          break;
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data);
          break;
      }
    });

    getUser().then(userData => {
      if(!!userData){
        setUser(userData);
        setGDriveHeader();
        testFormDataCall();
      }
    });
  }, []);

  function getUser() {
    return Auth.currentAuthenticatedUser()
      .then(userData =>  userData)
      .catch(() => console.log('Not signed in'));
  }

useEffect(() => {
    localStorage.removeItem("scheduled_start_date");
    localStorage.removeItem("scheduled_end_date");
    localStorage.removeItem("scheduled_start_time");
    localStorage.removeItem("scheduled_end_time");
    localStorage.removeItem("scheduled_time_zone");
  },[])
console.log("process.env: ", process.env);
  // setTimeout(() => {
    if(!user && process.env.NODE_ENV == "development"){
      let username = process.env.REACT_APP_USER;
      let password = process.env.REACT_APP_PASSWORD;
      Auth.signIn({ username, password });
    }
  // }, 1000)

  return  ( user ? 
  <Provider>
    <div className="App">
        
        {/* <Router basename="/portal/v2/cameraplus/"> */}
          <Router basename="/">
          <Box><NavBar/></Box>
          <Route exact path="/geo-settings/">
            <Box style={{marginTop: '50px'}}>
              Geo Settings is only available in Version 1. 
              <Box style={{marginTop: "10px"}}>
                <Button 
                  onClick={e => window.open(`${getPre()}/portal/cameraplus/index.html`, '_blank')}
                  variant="contained" color="primary"
                >
                  Open Version 1
                </Button>
              </Box>
            </Box>
          </Route>
          <Route exact path="/sponsored/">
            <Box>
              <Sponsor/>
            </Box>
          </Route>
          <Route exact path="/sponsored/:sponsor_id" render={props => 
            (<Box>
              <NonSponsorTable {...props}/>
            </Box>)
          }/>
          <Route exact path="/sponsored/:sponsor_id/campaigns" render={props => 
            (<Box style={{marginTop: "10px"}}>
              <EditCampaign {...props}/>
            </Box>)
          }/>
          <Route exact path="/other-setups/">
            <Box>
              <ResponsiveDrawer/>
              {/* <NonSponsorTable/> */}
            </Box>
          </Route>
          <Route exact path="/other-setups/city/">
            <Box>
              <ResponsiveDrawer/>
              {/* <NonSponsorTable/> */}
            </Box>
          </Route>
          <Route exact path="/other-setups/non-sponsor">
            <ResponsiveDrawer/>
            {/* <NonSponsorTable/> */}
          </Route>
          <Route path="/other-setups/non-sponsor/edit_campaign">
            <ResponsiveDrawer/>
            {/* <EditCampaign/> */}
          </Route>
          <Route path="/other-setups/global">
            <ResponsiveDrawer/>
            {/* <EditCampaign/> */}
          </Route>
          <Route path="/other-setups/carousel">
            <ResponsiveDrawer/>
            {/* <EditCampaign/> */}
          </Route>
          <Route path="/other-setups/ar">
            <ResponsiveDrawer/>
            {/* <EditCampaign/> */}
          </Route>
          <Route exact path="/places/">
            <Box style={{marginTop: '50px'}}>
              Places is only available in Version 1. 
              <Box style={{marginTop: "10px"}}>
                <Button 
                  onClick={e => window.open(`${getPre()}/portal/cameraplus/index.html?root=places`, '_blank')}
                  variant="contained" color="primary"
                >
                  Open Version 1
                </Button>
              </Box>
            </Box>
          </Route>
          <Route exact path="/admin/">
            <Box style={{marginTop: '50px'}}>
              Admin is only available in Version 1. 
              <Box style={{marginTop: "10px"}}>
                <Button 
                  onClick={e => window.open(`${getPre()}/portal/cameraplus/index.html?root=admin`, '_blank')}
                  variant="contained" color="primary"
                >
                  Open Version 1
                </Button>
              </Box>
            </Box>
          </Route>

        </Router>
        <Button onClick={() => Auth.signOut()}> Sign Out </Button>
      </div>
    </Provider>
     : (
       <Button onClick={() => Auth.federatedSignIn()}>Please Sign In</Button>  
       )
  )
}



export default App;
