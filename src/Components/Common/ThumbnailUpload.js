import React, {useState, useEffect} from 'react';
import {Typography, Button, Table, TableBody, TableCell, Box, TextField,
    TableContainer, TableHead, TableRow, Paper, Link, IconButton, RadioGroup, FormControlLabel, Radio} from '@material-ui/core';
import {Alert} from '@material-ui/lab';
import {Close} from '@material-ui/icons';
import {useDropzone} from 'react-dropzone';
import ImageDialog from './ImageDialog';
import moment from 'moment';
import { getEnvironment, readUploadedImage, imageToDataUri, turnBase64ToImg } from '../../CommonFunctions';
import { getStaticAssetPath, loadFilterImage, deleteFilterImage } from '../../ApiUtility/ApiUtility';

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
        padding: '5px 5px',
        cursor: "pointer"
    },
    closeButton: {
        padding: '0px'
    },
    section_container: {
        marginTop: '10px',
        marginBottom: '10px'
    }
}

export default function ThumbnailUpload(props) {


    const [thumbnailUrl, setThumbnailUrl] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState("");


    //handle both sticker and filter types 
    const onDrop = async (file, type) => {
        console.log("file: ", file);
        console.log("type ", type);
        let image_url = await readUploadedImage(file[0]);
        if(file[0].type == "image/gif") {
            let base64 = await imageToDataUri(image_url, 320, 320);
            image_url = [base64, image_url];
        }
        if(type == "thumbnail") props.setUploadedThumbnail(image_url);
    };

    const {getRootProps: getRootPropsThumbnail, getInputProps: getInputPropsThumbnail} = useDropzone({onDrop: f => onDrop(f, "thumbnail")});


    const handleCloseDialog = e => {
        setImageDialogOpen(false);
        setDialogType("");
    }

    const handleClick = x => {
        setImageDialogOpen(true);
        setDialogType(x);
    }

    const handleDelete = type => {
        console.log("in handleDelete")
        let filter_id = props.selectedFilter.frame_id;
        deleteFilterImage({type, filter_id, retailerId: 0, campaignId: props.campaign.campaign_id}).then(r => {
            if(type == "ti") setThumbnailUrl(false);
        }).catch(err => err)
    }

    //change setfilterexists to hold the url if exists and set equal to false if doesn't 
    //change the api calls to load and cache image
    useEffect(() => {
        loadFilterImage({filter_id: props.selectedFilter.frame_id, type: "ti-gif", retailer_id: '0', campaign_id: props.campaign.campaign_id})
        .then(f => setThumbnailUrl(f))
        .catch(err =>{
            loadFilterImage({filter_id: props.selectedFilter.frame_id, type: "ti-png", retailer_id: '0', campaign_id: props.campaign.campaign_id})
            .then(f => setThumbnailUrl(f))
        })
    }, [props.uploadedThumbnail]);

  return (
    <>
    <ImageDialog 
        dialogOpen={imageDialogOpen}  
        dialogType={dialogType}
        handleCloseDialog={handleCloseDialog}
        img_src={thumbnailUrl.constructor == Array ? thumbnailUrl[0] : thumbnailUrl}
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
            <TableRow key="Thumbnail">
                <TableCell component="th" scope="row">
                    <Typography variant="body2" style={styles.label} gutterBottom>Thumbnail</Typography>
                </TableCell>
                <TableCell align="right">
                    <Link onClick={e => handleClick("Thumbnail")} 
                        className={!!thumbnailUrl && !props.uploadedThumbnail ? "" : "hidden"}
                        style={{cursor: "pointer"}}
                    >
                        View
                    </Link>
                    <IconButton className={!props.uploadedThumbnail ? "hidden" : ""} style={styles.closeButton} 
                        aria-label="close" onClick={e => props.setUploadedThumbnail(false)}>
                        <Close />
                    </IconButton>
                </TableCell>
                <TableCell align="right">
                    <div className={!thumbnailUrl || props.uploadedThumbnail ? "" : "hidden"} 
                        {...getRootPropsThumbnail({ refKey: 'innerRef' })}>
                        <input {...getInputPropsThumbnail()}/>
                        <Button variant="contained" color="primary" style={styles.uploadButton}>
                            Upload Image 
                        </Button>
                    </div>
                </TableCell>
                <TableCell align="right">
                    <Link onClick={e => handleDelete("ti")} className={!!thumbnailUrl ? "" : "hidden"} style={{cursor: "pointer"}}>
                        Delete
                    </Link>
                </TableCell>
            </TableRow>

      </TableBody>
    </Table>
  </TableContainer>
  </>
  );
}
