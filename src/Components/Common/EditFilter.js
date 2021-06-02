import React, {useState, useEffect, useRef} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Button, Dialog, TextField, AppBar, Toolbar, IconButton,
   Typography, Grid, Tabs, Tab, CircularProgress, FormControlLabel, Checkbox} from '@material-ui/core/';
import {ToggleButton, ToggleButtonGroup} from '@material-ui/lab/';
import TabPanel from '../TabPanel';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import moment from 'moment';
import ScheduleSettings from './ScheduleSettings';
import FilterDesigner from './FilterDesigner';
import SettingsCard from '../SettingsCard';
import SaveExitDialog from './SaveExitDialog';
import Alert from '@material-ui/lab/Alert';
import axios from 'axios';

import {getCanvasElementsToHide, imageToDataUri, verifyDates, getAPICall, readFileAsDataURL} from '../../CommonFunctions';
import {saveFilter, getCanvasProps, saveCanvasProps, saveFilterImages,
  saveTemplateImage, getFonts, saveAREffects, saveARJSON, getARJSON, testFormDataCall, saveThumbnailImage} from "../../ApiUtility/ApiUtility";
import defaultCanvasProps from '../../data/defaultCanvasProps';


const useStyles = makeStyles((theme) => ({
  appBar: {
    // position: 'relative',
    background: 'rgb(72, 120, 152)'
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  formLabel: {
    display: 'block'
  }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FilterDialog(props) {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [canvasProps, setCanvasProps] = useState({variables: {}, settings:{}});
  const [selectedArBinaries, setSelectedArBinaries] = useState([]);
  const [selectedDeepArVersion, setSelectedDeepArVersion] = useState(null);
  const [uploadedSticker, setUploadedSticker] = useState(false);
  const [uploadedBackground, setUploadedBackground] = useState(false);
  const [uploadedThumbnail, setUploadedThumbnail] = useState(false);
  const [fonts, setFonts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hiddenCanvasElements, setHiddenCanvasElements] = useState([]);
  const [alignment, setAlignment] = useState("vertical");
  const [err, setErr] = useState({});
  const [areSettingsUpdated, setAreSettingsUpdated] = useState(false);
  const [isSaveBeforeExitOpen, setIsSaveBeforeExitOpen] = useState(false);
  const [filterWasSaved, setFilterWasSaved] = useState(false);
  const [doStartValidation, setDoStartValidation] = useState(true);

  const [testFrameID, setTestFrameID] = useState(" ");

  const stageRef = useRef();

  const handleAlignment = (e,v) => {
    setAlignment(v);
  }

  const displaySavedAlert = e => {
    setFilterWasSaved(true);
    setTimeout(()=> {
      setFilterWasSaved(false);
    }, 2000)
  }

  const updateCanvasProps = (type, settings) => {
    setAreSettingsUpdated(true);
    let nextProps = JSON.parse(JSON.stringify(canvasProps));
    if(type == "settings" || type == "upload_images") nextProps[type] = settings;
    else nextProps.variables[type] = settings;
    // transformCanvasProps(nextProps, getXOffset({alignment, canvasProps: nextProps }), getYOffset({alignment, canvasProps: nextProps}), "back");
    setCanvasProps(nextProps);
  }

  const handleChange = (e, v) => setValue(v);

  const handleDisplayChange = (e) => {
    setAreSettingsUpdated(true);
    let checkbox_name = e.target.getAttribute("name");
    let nextFilter = Object.assign({}, props.selectedFilter);
    if(checkbox_name == "carousel") nextFilter.optin_algorithm = (nextFilter.optin_algorithm == 1 ? 0 : 1);
    else nextFilter.optin_menu = (nextFilter.optin_menu == 1 ? 0 : 1);
    props.setSelectedFilter(nextFilter);
  }

  const updateFilterName = (e) => {
    if(filterName == e.target.value) return;
    setAreSettingsUpdated(true);
    if(!props.selectedFilter.frame_id) return setFilterName(e.target.value);
    let nextFilter = Object.assign({}, props.selectedFilter);
    nextFilter.name = e.target.value;
    props.setSelectedFilter(nextFilter);
  }

  const prepareARFormData = async () => {
    return new Promise(async (resolve, reject) => {
      let arUploads = [];
      let obj = {deep_ar_version: selectedDeepArVersion ,scenes: []};
      let arBinaries = selectedArBinaries.map(x => axios.get(`https://www.googleapis.com/drive/v3/files/${x.id}?supportsAllDrives=true&includeItemsFromAllDrives=true&mimeType=application/octet-stream&alt=media`, {responseType:'blob'}))
      let binaries = await axios.all(arBinaries);
      selectedArBinaries.forEach(async (v, i) => {
        obj.scenes.push(v.name);
        let data = await readFileAsDataURL(binaries[i].data);
        arUploads.push(
          getAPICall(`/upload?testUpload=true&path=sys/s3/fs/retailers/${props.retailer.retailer_id}/${props.campaign.campaign_id}/frames/${props.selectedFilter.frame_id}_${v.name}&content_type=application/octet-stream`,
            {file: data}
          )
        );
          // `${props.selectedFilter.frame_id}_${v.name}`, binaries[i].data);
        
      });
      // console.log("formData: ", formData);
      await Promise.allSettled(arUploads);
      // axios.post(
      //   `http://qa.cameraplus.co/CameraPlus/sys/s3/fs/retailers/${props.retailer.retailer_id}/${props.campaign.campaign_id}/frames`,
      //  formData)
      await saveARJSON(props.retailer.retailer_id, props.campaign.campaign_id, props.selectedFilter.frame_id, obj);
      let next_binaries = selectedArBinaries.map(x => {delete x.id; return x})
      setSelectedArBinaries(next_binaries);
      resolve();
    })
  }

  const createFilter = () => {
    let {selectedFilter: {job}} = props;
    let active = typeof props.selectedFilter.active == "undefined" ? 0 : props.selectedFilter.active;
    return new Promise((resolve, reject) => {
      saveFilter({
        "name":filterName,
        "frame_tags":"",
        "frameAssociations": props.frameAssociations,
        "frame_type":props.frame_type || "non-sponsor",
        active,
        job,
        "frame_content_type":"default"
      })
      .then(filter => {
        filter.movable = 1;
        props.setSelectedFilter(filter);
        setCanvasProps(defaultCanvasProps);
        setIsSaving(false);
        setAreSettingsUpdated(false);
        resolve();
      })
      .catch(err => reject(err));
    })
  }

  const handleSave = async () => {
    return new Promise( async (resolve, reject) => {
      let arSelectedFilter = false;
      setIsSaving(true);
      if(!props.selectedFilter.frame_id){
        try{
          verifyDates(props.selectedFilter.startDate, props.selectedFilter.endDate, props.selectedFilter.job, true);
          await createFilter();
          displaySavedAlert();
          props.refreshData()
          resolve();
        }catch(err){
          setIsSaving(false);
          setErr(err);
          resolve();
        }
      }else{
        await saveCanvasProps(props.selectedFilter.frame_id, canvasProps)
        setTimeout(e => {
          setIsSaving(false);
          setAreSettingsUpdated(false);
          props.refreshData();
        }, 1000);
        try{
          verifyDates(props.selectedFilter.startDate, props.selectedFilter.endDate, props.selectedFilter.job, doStartValidation);
          if(selectedArBinaries[0]){
            arSelectedFilter = JSON.parse(JSON.stringify(props.selectedFilter));
            arSelectedFilter.frame_content_type = "deep_ar";
          } 
          await saveFilter(arSelectedFilter || props.selectedFilter)
          //save ar effects
          if(selectedArBinaries[0] && !!selectedArBinaries[0].id) await prepareARFormData();
          resolve();
          displaySavedAlert();
        }catch(err){
          setErr(err);
          resolve();
        }
        uploadImages();
      }
    })
  }

  const uploadImages = async () => {
    if(!stageRef.current) return;
    setHiddenCanvasElements(getCanvasElementsToHide(props.selectedFilter));
    // .current.toDataURL({mimeType: "image/png"}),
    setTimeout(async e => {
      const dataURL = await imageToDataUri(stageRef.current.children[0].canvas._canvas, 1080, 1440)
      console.log("dataURL: ", dataURL);
      // .split("base64,")[1];
      setHiddenCanvasElements([]);
      let networkCalls = [];
      const frame_id = props.selectedFilter.frame_id;
      const campaign_id = props.campaign.campaign_id;
      const retailer_id = props.retailer.retailer_id;
      let imagesForUpload = [];
      if(!!uploadedSticker){
        imagesForUpload.push({key: "sticker", file: uploadedSticker});
        imagesForUpload.push({key: "pi", file: uploadedSticker})
      }
      if(!!uploadedBackground) imagesForUpload.push({key: "bi", file: uploadedBackground}); 
      if(!!uploadedThumbnail) networkCalls.push(saveThumbnailImage(frame_id, campaign_id, retailer_id, uploadedThumbnail)); 
        networkCalls.push(saveTemplateImage({frame_id, campaign_id, dataURL}));
        networkCalls.push(saveFilterImages(frame_id, imagesForUpload));
        console.log("network calls: ", networkCalls);
        Promise.allSettled(networkCalls)
        .then(x => {
          console.log("in setuploaded thumbnail false");
          setUploadedSticker(false); 
          setUploadedBackground(false);
          setUploadedThumbnail(false);
      })
      .catch(err => {
        console.log("in setuploaded thumbnail false");
        setUploadedSticker(false); 
        setUploadedBackground(false);
        setUploadedThumbnail(false);
      })
    }, 1000)
  }

  const closeEditFilter = () => {
    if(isSaving) return;
    if(areSettingsUpdated) setIsSaveBeforeExitOpen(true)
    else{
      setValue(0);
      setUploadedSticker(false);
      setErr({});
      props.handleEditClose();
    }
  }

  useEffect(()=>{
    // &path=%2Fgc%2Fsys%2Fobjblob%2Fframe%2F1644%2Fpi
    getFonts().then(data => setFonts(data));
  }, []);

  useEffect(()=>{
    setFilterName(props.selectedFilter.name);
    getCanvasProps(props.selectedFilter.frame_id).then(r => {
      r.variables.date.format = moment().toMomentFormatString(r.variables.date.format).replace("[]", "'");
      if([0,2].some(x => x == r.settings.type)) setAlignment("vertical")
      else setAlignment("horizontal")
      setCanvasProps(r);
    })
    .catch(err => {
      setCanvasProps(defaultCanvasProps)
    } );
    getARJSON(props.retailer.retailer_id, props.campaign.campaign_id, props.selectedFilter.frame_id)
    .then(r => {
      setSelectedArBinaries(r.scenes)
      setSelectedDeepArVersion(r.deep_ar_version)
    });
  }, [props.selectedFilter.frame_id]);

  useEffect(()=> {
    if(!props.selectedFilter.job) return setDoStartValidation(true);
    let {selectedFilter: {job: {start_date, end_date}}} = props;  
    if(moment(start_date) < moment() && moment() < moment(end_date)) setDoStartValidation(false);
    else setDoStartValidation(true);
  }, [props.editOpen]);

  return (
    <div>
      <SaveExitDialog
        open={isSaveBeforeExitOpen}
        setIsSaveBeforeExitOpen={setIsSaveBeforeExitOpen}
        setAreSettingsUpdated={setAreSettingsUpdated}
        handleSave={handleSave}
        setValue={setValue}
        setUploadedSticker={setUploadedSticker}
        handleEditClose={props.handleEditClose}
        setErr={setErr}
      />
      <Dialog fullScreen open={props.editOpen} onClose={closeEditFilter} 
        TransitionComponent={Transition}>
        <AppBar className={classes.appBar} position="fixed">
          <Toolbar>
            <IconButton id="close_button" edge="start" color="inherit" disabled={isSaving} onClick={closeEditFilter} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}  onClick={testFormDataCall}>
              {props.campaign.name} : {props.selectedFilter.name}
            </Typography>
            <Button id="save_button" autoFocus color="inherit" onClick={handleSave}>
              {!props.selectedFilter.frame_id ? 'create' : 'save'} {isSaving && <CircularProgress size={24} style={{position: "absolute"}} />}
            </Button>
          </Toolbar>
          {filterWasSaved && <Alert severity="success">Filter has been saved</Alert>}
          <Alert 
            className={!err.message ? "hidden" : ""} 
            severity="error"
          >
              {err.message}
          </Alert>
        </AppBar>
        <Grid container p={3} style={{width: '80%', marginTop: '80px', marginLeft: '20px'}}>
          {/* <div className={areSettingsUpdated ? "" : "hidden"}
            onClick={e => setAreSettingsUpdated(false) }
          >Settings Changed</div> */}
            <Grid item xs={4}>
                <Typography variant="subtitle1">
                  <TextField id="outlined-basic"  
                    label="ID" 
                    InputProps={{
                      readOnly: true,
                    }}
                    value={props.selectedFilter.frame_id || " "} 
                    onClick={e => setTestFrameID(123)}
                    onChange={e=>e}
                    // value={testFrameID}
                    variant="outlined" /> 
                </Typography>
            </Grid>
            <Grid item xs={4}>
                <Typography variant="subtitle1">
                  <TextField id="filter_name" label="Name" onBlur={updateFilterName} 
                    defaultValue={filterName} variant="outlined" autoFocus={typeof props.selectedFilter.name  == "undefined"} /> 
                </Typography>
            </Grid>
            <Grid item xs={4}>
              <ToggleButtonGroup
                value={alignment}
                className={value == 0 || [1,0].some(x => x == canvasProps.settings.type) ? "hidden" : ""}
                exclusive
                onChange={handleAlignment}
                aria-label="text alignment"
                id="togglebuttongroup"
              >
                <ToggleButton value="vertical" aria-label="left aligned">
                  Vertical
                </ToggleButton>
                <ToggleButton value="horizontal" aria-label="centered">
                  Horizontal
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
        </Grid>
        <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            centered
        >
            <Tab label="Settings" /> 
            <Tab disabled={!props.selectedFilter.frame_id} label="Design" />
        </Tabs>
        <TabPanel value={value} index={0}>
          {props.selectedFilter.frame_type == "global" && <SettingsCard
            title="Display Configuration"
          >
            <FormControlLabel
                className={classes.formLabel}
                control={<Checkbox checked={props.selectedFilter.optin_algorithm == 1} color="primary" onChange={handleDisplayChange} name="carousel" />}
                label="Show in Carousel"
            />
            <FormControlLabel
                className={classes.formLabel}
                color="primary"
                control={<Checkbox checked={props.selectedFilter.optin_menu == 1} color="primary" onChange={handleDisplayChange} name="menuList" />}
                label="Show in Menu List"
            />
            </SettingsCard>}
            <ScheduleSettings
                setAreSettingsUpdated={setAreSettingsUpdated}
                item={props.selectedFilter}
                setItem={props.setSelectedFilter}
                isRepeatOpen={false}
                err={err}
                setErr={setErr}
                setIsRepeatOpen={e => e}
            />
        </TabPanel>
        <TabPanel value={value} index={1}>
            <FilterDesigner
              err={err}
              editOpen={props.editOpen}
              setAreSettingsUpdated={setAreSettingsUpdated}
              setAlignment={setAlignment}
              alignment={alignment}
              selectedFilter={props.selectedFilter}
              setSelectedFilter={props.setSelectedFilter}
              updateCanvasProps={updateCanvasProps}
              canvasProps={canvasProps}
              campaign={props.campaign}
              retailer={props.retailer}
              selectedArBinaries={selectedArBinaries}
              setSelectedArBinaries={setSelectedArBinaries}
              setSelectedDeepArVersion={setSelectedDeepArVersion}
              uploadedSticker={uploadedSticker}
              setUploadedSticker={setUploadedSticker}
              uploadedBackground={uploadedBackground}
              setUploadedBackground={setUploadedBackground}
              uploadedThumbnail={uploadedThumbnail}
              setUploadedThumbnail={setUploadedThumbnail}
              fonts={fonts}
              stageRef={stageRef}
              hiddenCanvasElements={hiddenCanvasElements}
            />
        </TabPanel>
      </Dialog>
    </div>
  );
}
