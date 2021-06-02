import React, {useState, useEffect} from 'react';
import SettingsCard from '../SettingsCard';
import {FormControlLabel, Checkbox, 
    FormControl, FormLabel, RadioGroup, Radio, Button, Box} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SchedulePicker from "../NonSponsor/Campaign/SchedulePicker";
import RefreshIcon from '@material-ui/icons/Refresh';
import "../../App.css";
import {getRepeatEveryValue, getRepeatDayValue, getRepeatDayNames, verifyDates} from '../../CommonFunctions';

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

export default function ScheduleSettings(props){

    const [radioValue, setRadioValue] = useState(getActiveStatus(props.item));
    const [isSaving, setIsSaving] = useState(false);
    const [isRepeatOpen, setIsRepeatOpen] = useState(false);

    const classes = useStyles();

    function getActiveStatus({active, job}){
        if(job) return "scheduled";
        if(active == 1) return "active";
        return "inactive";
    }

    function handleRadioChange(e){
        props.setAreSettingsUpdated(true);
        let nextItem = Object.assign({}, props.item);
        setRadioValue(e.target.getAttribute("value"));
        if(e.target.getAttribute("value") == "inactive") nextItem.active = 0;
        else if(e.target.getAttribute("value") == "active") nextItem.active = 1;
        else nextItem.active = 0;
        if(e.target.getAttribute("value") !== "scheduled") delete nextItem.job;
        
        props.setItem(nextItem);
    }

    function getRepeatDescription(){
        let repeat_every_value = getRepeatEveryValue(props.item);
        if(repeat_every_value == "daily") repeat_every_value += ` every ${getRepeatDayValue(props.item)} day(s)`;
        else if(repeat_every_value == "weekly") repeat_every_value += ` on ${getRepeatDayNames(props.item)}`;
        return ` - ${repeat_every_value.charAt(0).toUpperCase() + repeat_every_value.slice(1)}`;
    }

    

    return(
        <SettingsCard
            title="Schedule Settings"
        >
            <FormControl className={classes.formControl} component="fieldset">
                <RadioGroup aria-label="gender" name="scheduleSettings" value={radioValue} onChange={handleRadioChange}>
                    <FormControlLabel id="radio_active" color="primary" value="active" control={<Radio color="primary" />} 
                        label="Active" style={{width: '10%'}}
                    />
                    <FormControlLabel id="radio_inactive" color="primary" value="inactive" control={<Radio color="primary" />} 
                        label="Inactive" style={{width: '10%'}} 
                    />
                    <div>
                        <FormControlLabel id="radio_scheduled" color="primary" value="scheduled" control={<Radio color="primary" />} 
                            label="Active on specific dates(will be randomized with other enabled templates)" 
                        />
                        <div onClick={e => setIsRepeatOpen(true)} className={classes.setToRepeat}> 
                            <RefreshIcon style={{verticalAlign: 'text-bottom'}}/> Set to repeat {getRepeatDescription()}
                        </div>
                    </div>
                </RadioGroup>
                <Box className={radioValue == "scheduled" ? "" : "hidden"}>
                    <SchedulePicker
                        setAreSettingsUpdated={props.setAreSettingsUpdated}
                        item={props.item}
                        setItem={props.setItem}
                        err={props.err}
                        setErr={props.setErr}
                        radioValue={radioValue}
                        isRepeatOpen={isRepeatOpen}
                        setIsRepeatOpen={setIsRepeatOpen}
                    />
                </Box>
            </FormControl>
        </SettingsCard>
    )
}