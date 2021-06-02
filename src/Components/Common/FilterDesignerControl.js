import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import {Image, ExpandMore, ExpandLess, LocationCity, Apps, Face, 
  Today, QueryBuilder, TextFields, Rotate90DegreesCcw} from '@material-ui/icons/';
import ThumbnailUpload from './ThumbnailUpload';
import TextSettings from './TextSettings';
import ImageUpload from './ImageUpload';
import ARUpload from './ARUpload';
import PreviewDialog from './PreviewDialog';
import 'typeface-roboto';

import { getEnvironment } from '../../CommonFunctions';
import { FormControl, FormLabel, RadioGroup, Radio, FormControlLabel } from '@material-ui/core/'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    display: 'inline-block'
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  drawer: {
    width: 360,
    flexShrink: 0
  },
  drawerPaper: {
    width: 360,
    height: window.innerHeight - 140,
    overflow: 'scroll', 
    marginTop: 140,
  },
}));

export default function NestedList(props) {
  

    const classes = useStyles();
    const [thumbnailOpen, setThumbnailOpen] = useState(false);
    const [imageOpen, setImageOpen] = useState(false);
    const [arLensOpen, setArLensOpen] = useState(false);
    const [orientationOpen, setOrientationOpen] = useState(false);
    const [cityOpen, setCityOpen] = useState(false);
    const [dateOpen, setDateOpen] = useState(false);
    const [timeOpen, setTimeOpen] = useState(false);
    const [freeformOpen, setFreeformOpen] = useState(false);
    const [filterPreviewOpen, setFilterPreviewOpen] = useState(false);

    const [radioValue, setRadioValue] = useState("" + props.canvasProps.settings.type);
    const [radioOrientationValue, setRadioOrientationValue] = useState("" + props.canvasProps.settings.orienation);
    const [radioAlignmentValue, setRadioAlignmentValue] = useState("" + props.canvasProps.settings.alignment);

    const handleRadioChange = (e, v) => {
      let type = e.target.getAttribute("name");
      let nextSettings = props.canvasProps.settings;
      if(type == "type"){
        setRadioValue(v);
        nextSettings.type = v;
        if(v == '0'){
          nextSettings.orienation = '0'; nextSettings.alignment = '0';
          setRadioOrientationValue('0'); setRadioAlignmentValue('0'); 
          props.setAlignment("vertical");
        }else if(v == '1'){
          nextSettings.orienation = '0'; nextSettings.alignment = '0';
          setRadioOrientationValue('0'); setRadioAlignmentValue('0'); 
          props.setAlignment("horizontal");
        }else if(v == '3') props.setAlignment('horizontal');
        else props.setAlignment("vertical");
      }else if(type == "orienation"){
        setRadioOrientationValue(v);
        nextSettings.orienation = v;
      }else{
        setRadioAlignmentValue(v);
        nextSettings.alignment = v;
      }
      props.updateCanvasProps('settings', nextSettings);
    }


    const handleClick = (id) => {
      props.setEyeDropperActive(false);
      const map = {
        thumbnail: [thumbnailOpen, setThumbnailOpen],
        image: [imageOpen, setImageOpen], 
        ar: [arLensOpen, setArLensOpen],
        orientation: [orientationOpen, setOrientationOpen],
        city: [cityOpen, setCityOpen],
        date: [dateOpen, setDateOpen],
        time: [timeOpen, setTimeOpen],
        free_form: [freeformOpen, setFreeformOpen]
      }
      Object.keys(map).forEach(x => x == id ? map[x][1](!map[x][0]) : map[x][1](false));
    };

    const handleOpenPreview = () => {
      setFilterPreviewOpen(true);
      if([0,2].some(x => x == props.canvasProps.settings.type)) props.setAlignment("vertical");
      else  props.setAlignment("horizontal");
    }

    console.log("props: ", props);

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
      // onClick={ e => props.setEyeDropperActive(false)}
    >
      <Button onClick={handleOpenPreview} variant="outlined" color="primary">
          Preview
        </Button>
        <FormControlLabel
          value="start"
          style={{width: "70%"}}
          control={<Switch color="primary" onChange={(e, v) => props.setBackground(v ? "lightgray" : "white")} />}
          label="Gray Background"
          labelPlacement="start"
        />
        <PreviewDialog
          background={props.background}
          stageRef={props.stageRef}
          canvasProps={props.canvasProps}
          handleCloseDialog={e => setFilterPreviewOpen(false)}
          alignment={props.alignment}
          setAlignment={props.setAlignment}
          dialogOpen={filterPreviewOpen}
        />
      <List
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Settings
          </ListSubheader>
        }
        className={classes.root}
      >
        <ListItem button onClick={e => handleClick('thumbnail')} >
          <ListItemIcon >
            <Apps />
          </ListItemIcon>
          <ListItemText primary="Thumbnail" />
          {thumbnailOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={thumbnailOpen} timeout="auto" unmountOnExit>
          <ThumbnailUpload 
            selectedFilter={props.selectedFilter}
            setSelectedFilter={props.setSelectedFilter}
            campaign={props.campaign}
            uploadedThumbnail={props.uploadedThumbnail}
            setUploadedThumbnail={props.setUploadedThumbnail}
            imageUploadErr={props.imageUploadErr}
          />
        </Collapse>
        <ListItem button 
          className={props.campaign.name == "AR" ? "hidden" : ""} 
          onClick={e => handleClick('image')} >
          <ListItemIcon >
            <Image />
          </ListItemIcon>
          <ListItemText primary="Image" />
          {imageOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={imageOpen} timeout="auto" unmountOnExit>
          <ImageUpload
            selectedFilter={props.selectedFilter}
            setSelectedFilter={props.setSelectedFilter}
            campaign={props.campaign}
            canvasProps={props.canvasProps}
            updateCanvasProps={props.updateCanvasProps}
            uploadedSticker={props.uploadedSticker}
            setUploadedSticker={props.setUploadedSticker}
            uploadedThumbnail={props.uploadedThumbnail}
            setUploadedThumbnail={props.setUploadedThumbnail}
            uploadedBackground={props.uploadedBackground}
            setUploadedBackground={props.setUploadedBackground}
            imageUploadErr={props.imageUploadErr}
          />
        </Collapse>
        <ListItem button onClick={e => handleClick('ar')} 
          className={props.campaign.name !== "AR" && "hidden"} 
        >
          <ListItemIcon >
            <Face />
          </ListItemIcon>
          <ListItemText primary="AR Lens" />
          {arLensOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={arLensOpen} timeout="auto" unmountOnExit>
          <ARUpload 
            selectedFilter={props.selectedFilter}
            setSelectedFilter={props.setSelectedFilter}
            isARLoading={props.isARLoading}
            setIsARLoading={props.setIsARLoading}
            retailer={props.retailer}
            campaign={props.campaign}
            selectedArBinaries={props.selectedArBinaries}
            setSelectedArBinaries={props.setSelectedArBinaries}
            setSelectedDeepArVersion={props.setSelectedDeepArVersion}
            setUploadedThumbnail={props.setUploadedThumbnail}
            imageUploadErr={props.imageUploadErr}
          />
        </Collapse>
        <ListItem button onClick={e => handleClick('orientation')} >
          <ListItemIcon>
            <Rotate90DegreesCcw />
          </ListItemIcon>
          <ListItemText primary="Vertical/Horizontal Settings" />
          {orientationOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={orientationOpen} timeout="auto" unmountOnExit>
          <FormControl style={{marginLeft: "50px"}} component="fieldset">
              <FormLabel component="legend">Selected Orientation</FormLabel>
              <RadioGroup style={{marginLeft: "50px"}} aria-label="orientation" name="type"
                  value={""+props.canvasProps.settings.type} onChange={handleRadioChange}>
                  <FormControlLabel value={'0'} control={<Radio disabled={props.filterOrientationType == "horizontal"} />} label="Vertical" />
                  <FormControlLabel value={'3'} control={<Radio disabled={props.filterOrientationType == "vertical"} />} label="Horizontal/Vertical" />
                  <FormControlLabel value={'2'} control={<Radio disabled={props.filterOrientationType == "horizontal"} />} label="Vertical/Horizontal" />
                  <FormControlLabel value={'1'} control={<Radio disabled={props.filterOrientationType == "vertical"} />} label="Horizontal" />
              </RadioGroup>
          </FormControl>
          <Collapse in={['3', '2'].includes(radioValue)} timeout="auto" unmountOnExit>
            <FormControl style={{marginLeft: "15px", display: 'inline-block'}} component="fieldset">
                <FormLabel component="legend">Orientation</FormLabel>
                <RadioGroup style={{marginLeft: "50px"}} aria-label="orientation" name="orienation" 
                    value={radioOrientationValue} onChange={handleRadioChange}>
                    <FormControlLabel value={'0'} control={<Radio />} label="Top" />
                    <FormControlLabel value={'1'} control={<Radio />} label="Middle" />
                    <FormControlLabel value={'2'} control={<Radio />} label="Bottom" />
                </RadioGroup>
            </FormControl>
            <FormControl style={{marginLeft: "15px", display: 'inline-block', width: '30%'}} component="fieldset">
                <FormLabel component="legend">Alignment</FormLabel>
                <RadioGroup style={{marginLeft: "50px"}} aria-label="orientation" name="orientation-alignment2" 
                    value={radioAlignmentValue} onChange={handleRadioChange}>
                    <FormControlLabel value={'0'} control={<Radio />} label="Left" />
                    <FormControlLabel value={'1'} control={<Radio />} label="Center" />
                    <FormControlLabel value={'2'} control={<Radio />} label="Right" />
                </RadioGroup>
            </FormControl>
        </Collapse>
        </Collapse>
        <ListItem button onClick={e => handleClick('city')} >
          <ListItemIcon>
            <LocationCity />
          </ListItemIcon>
          <ListItemText primary="City" />
          {cityOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={cityOpen} timeout="auto" unmountOnExit>
          <TextSettings 
            eyeDropperColor={props.eyeDropperColor}
            setEyeDropperActive={props.setEyeDropperActive}
            eyeDropperActive={props.eyeDropperActive}
            settings={props.canvasProps.variables.city}
            textToDisplay={"City"}
            onTextChange={props.setCityText}
            updateCanvasProps={props.updateCanvasProps}
            fonts={props.fonts}
          />
        </Collapse>
        <ListItem button onClick={e => handleClick('date')} >
          <ListItemIcon>
            <Today />
          </ListItemIcon>
          <ListItemText primary="Date" />
          {dateOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={dateOpen} timeout="auto" unmountOnExit>
        <TextSettings 
            eyeDropperColor={props.eyeDropperColor}
            setEyeDropperActive={props.setEyeDropperActive}
            eyeDropperActive={props.eyeDropperActive}
            settings={props.canvasProps.variables.date}
            textToDisplay={"Date"}
            updateCanvasProps={props.updateCanvasProps}
            fonts={props.fonts}
          />
        </Collapse>
        <ListItem button onClick={e => handleClick('time')} >
          <ListItemIcon>
            <QueryBuilder />
          </ListItemIcon>
          <ListItemText primary="Time" />
          {timeOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={timeOpen} timeout="auto" unmountOnExit>
        <TextSettings 
            eyeDropperColor={props.eyeDropperColor}
            setEyeDropperActive={props.setEyeDropperActive}
            eyeDropperActive={props.eyeDropperActive}
            settings={props.canvasProps.variables.time}
            textToDisplay={"Time"}
            updateCanvasProps={props.updateCanvasProps}
            fonts={props.fonts}
          />
        </Collapse>
        <ListItem button onClick={e => handleClick('free_form')} >
          <ListItemIcon>
            <TextFields />
          </ListItemIcon>
          <ListItemText primary="Free Form Text" />
          {freeformOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={freeformOpen} timeout="auto" unmountOnExit>
        <TextSettings 
            eyeDropperColor={props.eyeDropperColor}
            setEyeDropperActive={props.setEyeDropperActive}
            eyeDropperActive={props.eyeDropperActive}
            settings={props.canvasProps.variables.freeformtext}
            // onTextChange={props.setFreeformtext}
            textToDisplay={
              // props.canvasProps.variables.freeformtext.text || 
              "Free Form Text"}
            updateCanvasProps={props.updateCanvasProps}
            fonts={props.fonts}
          />
        </Collapse>
      </List>
    </Drawer>
  );
}
