import React, {useState, useEffect} from 'react';
import {Typography, Button, Table, TableBody, TableCell, Box, TextField,
    TableContainer, TableHead, TableRow, Paper, Link, List, ListItem, ListItemText, CircularProgress} from '@material-ui/core';
import {Alert, Autocomplete} from '@material-ui/lab';
import {Close} from '@material-ui/icons';
import {useDropzone} from 'react-dropzone';
import { imageToDataUri } from '../../CommonFunctions';
import { saveARJSON, loadFilterImage, deleteAREffect, getArEffects, getArBinaries, getGDriveThumbnail } from '../../ApiUtility/ApiUtility';

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

export default function ARUpload(props) {


    const [ar1Url, setAr1Url] = useState("");
    const [arBeautUrl, setArBeautUrl] = useState("");
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState("");
    const [arEffects, setArEffects] = useState([]);
    const [arBinaries, setArBinaries] = useState([]);


    //handle both sticker and filter types 
    const onDrop = (file, type) => {
        let nextAREffects = props.uploadedAREffects.slice(0);
        nextAREffects[type-1] = file[0];
        
        props.setUploadedAREffects(nextAREffects);
    };

    const {getRootProps: getRootPropsArEffect, getInputProps: getInputPropsArEffect} = useDropzone({onDrop: f => onDrop(f, "1")});
    const {getRootProps: getRootPropsArBeaut, getInputProps: getInputPropsArBeaut} = useDropzone({onDrop: f => onDrop(f, "arb")});

    const handleCloseDialog = e => {
        setImageDialogOpen(false);
        setDialogType("");
    }

    const handleClick = x => {
        setImageDialogOpen(true);
        setDialogType(x);
    }

    const handleDelete = () => {
        props.selectedArBinaries.forEach(x => deleteAREffect(props.retailer.retailer_id, props.campaign.campaign_id, props.selectedFilter.frame_id, x.name));  
        saveARJSON(props.retailer.retailer_id, props.campaign.campaign_id, props.selectedFilter.frame_id, {scenes: []})
        .then(x => props.setSelectedArBinaries([]));
    }
    
    const handleTriggerHintChange = (e, v) => {
        let nextSelectedFilter = Object.assign({}, props.selectedFilter);
        nextSelectedFilter.frame_hint = e.target.value;
        props.setSelectedFilter(nextSelectedFilter);
    }

    const handleARChange = async (e,v) => {
        props.setIsARLoading(true);
        if(!v){
            props.setSelectedArBinaries([]);
            props.setSelectedDeepArVersion(null);
        } 
        else getArBinaries(v.id).then(async r => {
            let thumbnailIndex = r.data.findIndex(x => x.type == "thumbnail");
            console.log("thumbnailIndex: ", thumbnailIndex);
            if(thumbnailIndex){
                let thumbnail = r.data.splice(thumbnailIndex, 1)[0];
                let {id, name} = thumbnail;
                let url = `https://www.googleapis.com/drive/v3/files/${id}?supportsAllDrives=true&includeItemsFromAllDrives=true&alt=media`;
                let image_url = await getGDriveThumbnail(url);

                if(name.includes(".gif")) {
                    let base64 = await imageToDataUri(image_url, 320, 320);
                    image_url = [base64, image_url];
                }
                props.setUploadedThumbnail(image_url);
            }
            props.setSelectedArBinaries(r.data);
            props.setSelectedDeepArVersion(v.deepArVersion);
            
        });
    }

    const verifyDeepArVersion = (version) => {
        let versionRegex = new RegExp(/^(\d+\.)?(\d+\.)?(\*|\d+)$/);
        if(versionRegex.test(version)) return version;
        return false;
    }

    useEffect(()=>{
        getArEffects().then(r => setArEffects(r.data))
    }, [])
    

  return (
    <>
    <TableContainer component={Paper} style={{width:'100%'}}>
        <Alert className={!props.imageUploadErr ? "hidden" : ""} variant="outlined" severity="error">
            {props.imageUploadErr}
        </Alert>
    <Table aria-label="simple table">
        <TableHead>
            <TableRow>
            <TableCell>Asset</TableCell>
            {/* <TableCell align="right">Upload</TableCell> */}
            <TableCell align="right">Delete</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            <TableRow key="AR1">
                {/* <TableCell component="th" scope="row">
                    <Typography variant="body2" style={styles.label} gutterBottom></Typography>
                </TableCell> */}
                <TableCell align="right">
                    { !props.selectedArBinaries[0] || !!props.selectedArBinaries[0].id ?
                        (<Autocomplete
                            id="ar-asset-select"
                            options={arEffects}
                            onChange={handleARChange}
                            getOptionLabel={(option) => option.name}
                            getOptionDisabled={option => !verifyDeepArVersion(option.deepArVersion)}
                            renderOption={(option) => {
                                let {name, deepArVersion} = option;
                                return (
                                    <div style={{fontSize:"12px"}}>
                                        {`${name} - ${verifyDeepArVersion(deepArVersion) || "Invalid Version Number"}`}
                                    </div>
                                )
                            }}
                            size="small"
                            style={{ fontSize: '12px' }}
                            renderInput={(params) => {
                                return <TextField style={{fontSize: '12px'}} {...params} label="Face Filter" variant="outlined" />}
                            }
                        />)
                        :
                        (<List dense={true}>
                            {
                                props.selectedArBinaries.map(x => {
                                    return (<ListItem>
                                    <ListItemText
                                        style={{wordBreak: 'break-word'}}
                                        primary={x.name}
                                    />
                                    </ListItem>)
                                })
                            }
                        </List>)
                        
                    }
                    {/* <div {...getRootPropsArEffect({ refKey: 'innerRef' })}>
                        <input {...getInputPropsArEffect()}/>
                        <Button variant="contained" color="primary" style={styles.uploadButton}>
                            Upload Image 
                        </Button>
                    </div> */}
                </TableCell>
                <TableCell align="right">
                    <Link style={{cursor: "pointer"}} onClick={e => handleDelete()} 
                    className={!props.selectedArBinaries[0] || !!props.selectedArBinaries[0].id ? "hidden" : ""}
                    >
                        Delete
                    </Link>
                    {props.isARLoading && <CircularProgress size={24}/>}
                </TableCell>
            </TableRow>
            <TableRow key="ARB">
                <TableCell component="th" scope="row">
                    <TextField id="trigger_hint" label="Trigger Hint" variant="outlined" 
                        defaultValue={props.selectedFilter.frame_hint} onBlur={handleTriggerHintChange} />
                </TableCell>
                {/* <TableCell align="right">
                    <div {...getRootPropsArBeaut({ refKey: 'innerRef' })}>
                        <input {...getInputPropsArBeaut()}/>
                        <Button variant="contained" color="primary" style={styles.uploadButton}>
                            Upload Image 
                        </Button>
                    </div>
                </TableCell> */}
                <TableCell align="right">
                    <Link style={{cursor: "pointer"}} onClick={e => handleDelete("arb")} 
                        className={!!arBeautUrl ? "" : "hidden"}
                    >
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
