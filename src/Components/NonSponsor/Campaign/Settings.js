import React, {useState, useEffect} from 'react';
import SettingsCard from '../../SettingsCard';
import {Card, CardContent, Typography, FormControlLabel, Checkbox,
    FormControl, FormLabel, RadioGroup, Radio, Button, Box, Link, TextField} from '@material-ui/core';
import {CircularProgress} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SchedulePicker from "./SchedulePicker";
import moment from 'moment-timezone';
import RefreshIcon from '@material-ui/icons/Refresh';
import "../../../App.css";

import {updateCampaign} from '../../../ApiUtility/ApiUtility';
import {getRepeatEveryValue, getRepeatDayValue, getRepeatDayNames, verifyDates} from '../../../CommonFunctions';

const useStyles = makeStyles({
    root: {
      maxWidth: "100%",
    },
    media: {
      height: 140,
    },
    formLabel: {
        display: 'block'
    },
    formControl: {
        minWidth: "70%"
    },
    saveButton: {
        postion: 'relative',
        right: '25px'
    },
    saveButtonContainer: {
        textAlign: 'right'
    },
    buttonProgress: {
        position: 'absolute'
    },
    setToRepeat: {
        display: "inline-block",
        position: "relative",
        cursor: 'pointer'
    }
  });

function CampaignSettings(props){

    const classes = useStyles();
    const [showCarousel, setShowCarousel] = useState(props.campaign.optin_algorithm);
    const [showMenuList, setShowMenuList] = useState(props.campaign.optin_menu);
    const [campaignName, setCampaignName] = useState(props.campaign.name)
    const [radioValue, setRadioValue] = useState(getActiveStatus(props.campaign));
    const [isSaving, setIsSaving] = useState(false);
    const [isRepeatOpen, setIsRepeatOpen] = useState(false);
    const [doStartValidation, setDoStartValidation] = useState(true);
    const [err, setErr] = useState({});


    function handleChange(e){
        let checkbox_name = e.target.getAttribute("name");
        if(checkbox_name == "carousel") setShowCarousel(showCarousel == 1 ? 0 : 1);
        else setShowMenuList(showMenuList == 1 ? 0 : 1);
    }

    function getActiveStatus({active, job}){
        if(job) return "scheduled";
        if(active == 1) return "active";
        return "inactive";
    }

    function handleRadioChange(e){
        let nextCampaign = Object.assign({}, props.campaign);
        setRadioValue(e.target.getAttribute("value"));
        if(e.target.getAttribute("value") == "inactive") nextCampaign.active = 0;
        else if(e.target.getAttribute("value") == "active") nextCampaign.active = 1;
        else nextCampaign.active = 0;
        if(e.target.getAttribute("value") !== "scheduled") delete nextCampaign.job;
        props.setCampaign(nextCampaign);
    }

    async function saveCampaign(){
        try{
            verifyDates(props.campaign.startDate, props.campaign.endDate, props.campaign.job, doStartValidation);
            setIsSaving(true);
            props.campaign.optin_algorithm = showCarousel;
            props.campaign.optin_menu = showMenuList;
            props.campaign.name = campaignName;
            await updateCampaign(props.campaign);
            setTimeout(()=>{
                setIsSaving(false);
            }, 1000);
            props.getCampaign();
        }catch(err){
            setErr(err);
        }
    }

    function getRepeatDescription(){
        let repeat_every_value = getRepeatEveryValue(props.campaign);
        if(repeat_every_value == "daily") repeat_every_value += ` every ${getRepeatDayValue(props.campaign)} day(s)`;
        else if(repeat_every_value == "weekly") repeat_every_value += ` on ${getRepeatDayNames(props.campaign)}`;
        return ` - ${repeat_every_value.charAt(0).toUpperCase() + repeat_every_value.slice(1)}`;
    }

    function getDateTime(){
        if(!props.campaign.job) return moment();
        else return moment().tz(props.campaign.job.timezone, true);
    }

    function getTimezone(){
        if(!props.campaign.job) return "US/Pacific";
        else return props.campaign.job.timezone;
    }

    useEffect(()=> {
        if(!props.campaign.job) return setDoStartValidation(true);
        let {campaign: {job: {start_date, end_date}}} = props;  
        if(moment(start_date) < moment() && moment() < moment(end_date)) setDoStartValidation(false);
        else setDoStartValidation(true);
    }, []);



    return(
        <Card className={classes.root}>
            <Box className={classes.saveButtonContainer}>
                <Button className={classes.saveButton} variant="contained" onClick={saveCampaign}>
                    Save {isSaving && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Button>
            </Box>
            <div style={{textAlign: 'left', marginLeft: '15px'}}>
                <TextField defaultValue={campaignName} 
                    onChange={e => setCampaignName(e.target.value)}
                    id="campaign-name" label="Campaign Name" variant="outlined" 
                />
            </div>
            {/* <Typography variant="h6">Current {getTimezone()} DateTime: {getDateTime().format("MM-DD-YYYY HH:mm")}</Typography> */}
            <CardContent>
                <SettingsCard
                    title="Display Configuration"
                >
                    <FormControlLabel
                        className={classes.formLabel}
                        control={<Checkbox checked={showCarousel} color="primary" onChange={handleChange} name="carousel" />}
                        label="Show in Carousel"
                    />
                    <FormControlLabel
                        className={classes.formLabel}
                        color="primary"
                        control={<Checkbox checked={showMenuList} color="primary" onChange={handleChange} name="menuList" />}
                        label="Show in Menu List"
                    />
                </SettingsCard>
                <SettingsCard
                    title="Schedule Settings"
                >
                    <FormControl className={classes.formControl} component="fieldset">
                        <RadioGroup aria-label="gender" name="scheduleSettings" value={radioValue} onChange={handleRadioChange}>
                            <FormControlLabel color="primary"  value="active" control={<Radio color="primary" />} 
                                label="Active" style={{width: '10%'}}
                            />
                            <FormControlLabel color="primary" value="inactive" control={<Radio color="primary" />} 
                                label="Inactive" style={{width: '10%'}}
                            />
                            <div>
                                <FormControlLabel color="primary" value="scheduled" control={<Radio color="primary" />} 
                                    label="Active on specific dates(will be randomized with other enabled templates)" 
                                />
                                <div onClick={e => setIsRepeatOpen(true)} className={classes.setToRepeat}> 
                                    <Link>
                                        <RefreshIcon style={{verticalAlign: 'text-bottom'}}/> Set to repeat 
                                    </Link>
                                    {getRepeatDescription()}
                                </div>
                            </div>
                        </RadioGroup>
                        <Box className={radioValue == "scheduled" ? "" : "hidden"}>
                            <SchedulePicker
                                setAreSettingsUpdated={e => console.log("update")}
                                err={err}
                                setErr={setErr}
                                radioValue={radioValue}
                                item={props.campaign}
                                setItem={props.setCampaign}
                                isRepeatOpen={isRepeatOpen}
                                setIsRepeatOpen={setIsRepeatOpen}
                            />
                        </Box>
                    </FormControl>
                </SettingsCard>
            </CardContent>
        </Card>
    )
}

export default CampaignSettings;