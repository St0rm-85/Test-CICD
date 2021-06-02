import React, {useState, useEffect} from 'react';
import {Typography, Button, Table, TableBody, TableCell, Box, TextField,
    TableContainer, TableHead, TableRow, Paper, Link, IconButton, RadioGroup, FormControlLabel, Radio} from '@material-ui/core';
import {Alert} from '@material-ui/lab';
import {Close} from '@material-ui/icons';
import {useDropzone} from 'react-dropzone';
import ImageDialog from './ImageDialog';
import moment from 'moment';
import { getEnvironment, parseStringToInt, setFrameContentType, readUploadedImage } from '../../CommonFunctions';
import { saveFilterImages, loadFilterImage, deleteFilterImage, getStaticAssetPath } from '../../ApiUtility/ApiUtility';

const styles = {
    container: {
        height: '50px'
    },
    label: {
        marginRight: '10px',
        display: "inline-block"
    },
    uploadButton: {
        fontSize: '10px',
        padding: '5px 5px'
    },
    closeButton: {
        padding: '0px'
    },
    section_container: {
        marginTop: '10px',
        marginBottom: '10px'
    }
}

export default function ImageUpload(props) {

    const [stickerUrl, setStickerUrl] = useState("");
    const [filterUrl, setFilterUrl] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [ARUrl, setARUrl] = useState("");
    const [templateUrl, setTemplateUrl] = useState("");
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState("");


    //handle both sticker and filter types 
    const onDrop = async (file, type) => {
        let image_url = await readUploadedImage(file[0]);
        if(type == "sticker") props.setUploadedSticker(image_url);
        else if(type == "thumbnail") props.setUploadedThumbnail(image_url);
        else props.setUploadedBackground(image_url);
    };

    const {getRootProps: getRootPropsSticker, getInputProps: getInputPropsSticker} = useDropzone({onDrop: f => onDrop(f, "sticker")});
    const {getRootProps: getRootPropsFilter, getInputProps: getInputPropsFilter} = useDropzone({onDrop: f => onDrop(f, "filter")}); 
    const {getRootProps: getRootPropsThumbnail, getInputProps: getInputPropsThumbnail} = useDropzone({onDrop: f => onDrop(f, "thumbnail")});
    const {getRootProps: getRootPropsAR, getInputProps: getInputPropsAR} = useDropzone({onDrop: f => onDrop(f, "ar")});

    const handleStickerPosition = (axis, value) => {
        let nextSettings = props.canvasProps.upload_images;
        nextSettings.positionedImage[axis] = parseStringToInt(value);
        nextSettings.sticker[axis] = parseStringToInt(value);
        props.updateCanvasProps('upload_images', nextSettings);
    }

    const handleFixedMovable = e => {
        let nextSelectedFilter = Object.assign({}, props.selectedFilter);
        nextSelectedFilter.movable = parseInt(e.target.value);
        props.setSelectedFilter(nextSelectedFilter);
    }

    const handleCloseDialog = e => {
        setImageDialogOpen(false);
        setDialogType("");
    }

    const handleClick = x => {
        setImageDialogOpen(true);
        setDialogType(x);
    }

    const handleDelete = type => {
        let filter_id = props.selectedFilter.frame_id;
        deleteFilterImage({type, filter_id, retailerId: 0, campaignId: props.campaign.campaign_id}).then(r => {
            if(type == "pi"){
                setFrameContentType(props.selectedFilter, "default", props.setSelectedFilter);
                setStickerUrl("");
            } 
            else if(type == "bi") setFilterUrl("");
            else if(type == "ti") setThumbnailUrl("");
        }).catch(err => err)
    }

    //change setfilterexists to hold the url if exists and set equal to false if doesn't 
    //change the api calls to load and cache image
    useEffect(() => {
        loadFilterImage({filter_id: props.selectedFilter.frame_id, type: "pi"})
            .then(f => setStickerUrl(f)).catch(err => err)
        loadFilterImage({filter_id: props.selectedFilter.frame_id, type: "bi"})
            .then(f => setFilterUrl(f)).catch(err => err)
        loadFilterImage({filter_id: props.selectedFilter.frame_id, type: "ti", retailer_id: '0', campaign_id: props.campaign.campaign_id})
            .then(f => setThumbnailUrl(f)).catch(err => err)
        loadFilterImage({filter_id: props.selectedFilter.frame_id, type: "template", retailer_id: '0', campaign_id: props.campaign.campaign_id})
            .then(f => setTemplateUrl(f)).catch(err => err)
    }, [props.uploadedBackground, props.uploadedSticker, props.uploadedThumbnail]);

    const getImageUrl = async e => {
        if(dialogType == "Sticker"){
            return await getStaticAssetPath(props.selectedFilter.frame_id, "pi");
        }else if(dialogType == "Filter"){
            return await getStaticAssetPath(props.selectedFilter.frame_id, "bi");
        }
        else{
            return `${getEnvironment()}.cameraplus.co/CameraPlus/sys/s3/fs/retailers/0/${props.campaign.campaign_id || 0}/frames/${props.selectedFilter.frame_id}_tb.png?dt=${moment().format()}`;
        }
    }

    

  return (
    <>
    <ImageDialog 
        dialogOpen={imageDialogOpen}  
        dialogType={dialogType}
        handleCloseDialog={handleCloseDialog}
        img_src={getImageUrl()}
    />
    <TableContainer component={Paper}>
        <Alert className={!props.imageUploadErr ? "hidden" : ""} variant="outlined" severity="error">
            {props.imageUploadErr}
        </Alert>
    <Table aria-label="simple table">
        <TableHead>
            <TableRow>
            <TableCell>Image</TableCell>
            <TableCell align="right">View</TableCell>
            <TableCell align="right">Upload</TableCell>
            <TableCell align="right">Delete</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            <TableRow key="Thumbnail" className="hidden">
                <TableCell component="th" scope="row">
                    <Typography variant="body2" style={styles.label} gutterBottom>Thumbnail</Typography>
                </TableCell>
                <TableCell align="right">
                    <Link onClick={e => handleClick("Thumbnail")} className={!!thumbnailUrl && !props.uploadedThumbnail ? "" : "hidden"}>View</Link>
                    <IconButton className={!props.uploadedThumbnail ? "hidden" : ""} style={styles.closeButton} 
                        aria-label="close" onClick={e => props.setUploadedThumbnail(false)}>
                        <Close />
                    </IconButton>
                </TableCell>
                <TableCell align="right">
                    <div {...getRootPropsThumbnail({ refKey: 'innerRef' })}>
                        <input {...getInputPropsThumbnail()}/>
                        <Button variant="contained" color="primary" style={styles.uploadButton}>
                            Upload Image 
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
            <TableRow key="AR" className="hidden">
                <TableCell component="th" scope="row">
                    <Typography variant="body2" style={styles.label} gutterBottom>AR Effect</Typography>
                </TableCell>
                <TableCell align="right">
                    <Link onClick={e => handleClick("AR")} className={!!ARUrl && !props.uploadedAREffect ? "" : "hidden"}>View</Link>
                    <IconButton className={!props.uploadedAREffect ? "hidden" : ""} style={styles.closeButton} 
                        aria-label="close" onClick={e => props.setUploadedAREffect(false)}>
                        <Close />
                    </IconButton>
                </TableCell>
                <TableCell align="right">
                    <div {...getRootPropsAR({ refKey: 'innerRef' })}>
                        <input {...getInputPropsAR()}/>
                        <Button variant="contained" color="primary" style={styles.uploadButton}>
                            Upload Effect
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
          <TableRow key="Sticker">
            <TableCell component="th" scope="row">
                <Typography variant="body2" style={styles.label} gutterBottom>Sticker</Typography>
            </TableCell>
            <TableCell align="right">
                <Link onClick={e => handleClick("Sticker")} className={!!stickerUrl && !props.uploadedSticker ? "" : "hidden"}>View</Link>
                <IconButton className={!props.uploadedSticker ? "hidden" : ""} style={styles.closeButton} 
                    aria-label="close" onClick={e => {props.setUploadedSticker(false); setFrameContentType(props.selectedFilter, "default", props.setSelectedFilter)}}>
                    <Close />
                </IconButton>
            </TableCell>
            <TableCell align="right">
                <div {...getRootPropsSticker({ refKey: 'innerRef' })}>
                    <input {...getInputPropsSticker()}/>
                    <Button variant="contained" color="primary" style={styles.uploadButton}>
                        Upload Image 
                    </Button>
                </div>
                <RadioGroup id="fixed_movable" aria-label="orientation" name="orienation" 
                    value={props.selectedFilter.movable} onChange={handleFixedMovable}>
                    <FormControlLabel style={{marginRight: '0px'}} 
                        value={0} control={<Radio size="small"/>} label="Fixed" />
                    <FormControlLabel style={{marginRight: '0px'}} 
                        value={1} control={<Radio style={{paddingTop: "0", paddingBottom: "0"}} size="small"/>} label="Movable" />
                </RadioGroup>
            </TableCell>
            <TableCell align="right">
                <Link onClick={e => handleDelete("pi")} className={!!stickerUrl ? "" : "hidden"}>
                    Delete
                </Link>
            </TableCell>
          </TableRow>
          <TableRow key="Filter">
                <TableCell component="th" scope="row">
                    <Typography variant="body2" style={styles.label} gutterBottom>Filter</Typography>
                </TableCell>
                <TableCell align="right">
                    <Link onClick={e => handleClick("Filter")} className={!!filterUrl && !props.uploadedBackground ? "" : "hidden"}>View</Link>
                    <IconButton className={!props.uploadedBackground ? "hidden" : ""} style={styles.closeButton} 
                        aria-label="close" onClick={e => props.setUploadedBackground(false)}>
                        <Close />
                    </IconButton>
                </TableCell>
                <TableCell align="right">
                    <div {...getRootPropsFilter({ refKey: 'innerRef' })}>
                        <input {...getInputPropsFilter()}/>
                        <Button variant="contained" color="primary" style={styles.uploadButton}>
                            Upload Image 
                        </Button>
                    </div>
            </TableCell>
            <TableCell align="right"> 
                <Link onClick={e => handleDelete("bi")} className={!!filterUrl ? "" : "hidden"}>
                    Delete
                </Link>
            </TableCell>
          </TableRow>
          <TableRow key="Template">
              <TableCell component="th" scope="row">
                  <Typography variant="body2" style={styles.label} gutterBottom>Template</Typography>
              </TableCell>
              <TableCell align="right"><Link onClick={e => handleClick("Template")} className={!!templateUrl ? "" : "hidden"}>View</Link></TableCell>
              <TableCell align="right"></TableCell>
              <TableCell align="right"><Link className={!!templateUrl ? "" : "hidden"}>Delete</Link></TableCell>
          </TableRow>
      </TableBody>
    </Table>
  </TableContainer>
  <Typography style={{paddingLeft: '8px'}} variant="body2">Sticker Position</Typography>
        <Box pl={1} style={styles.section_container}>
            <TextField id="position-x" 
                value={props.canvasProps.upload_images.sticker ? props.canvasProps.upload_images.sticker.x 
                    : props.canvasProps.upload_images.positionedImage.x} 
                onChange={e => handleStickerPosition("x", e.target.value)} 
                style={{width: "30%", marginRight: '5%'}} label="X" variant="outlined" />
            <TextField id="position-y" 
                value={props.canvasProps.upload_images.sticker ? props.canvasProps.upload_images.sticker.y
                    : props.canvasProps.upload_images.positionedImage.y} 
                onChange={e => handleStickerPosition("y", e.target.value)} 
                style={{width: "30%", marginRight: '5%'}} label="Y" variant="outlined" />
        </Box>
  </>
  );
}
