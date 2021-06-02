import 'date-fns';
import React, {useState, useEffect} from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import { makeStyles } from '@material-ui/core/styles';
import {Typography, InputLabel, Select, MenuItem, FormControl} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import RepeatDialog from './RepeatDialog';
import { Alert } from '@material-ui/lab';
import {getRepeatEveryValue, getRepeatDayValue, getRepeatWeeklyValue} from '../../../CommonFunctions';
import moment from 'moment-timezone';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import 'typeface-roboto';
import timezones from "../../../data/timezones";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const getLocalStorageDate = (props, type, time) =>{
  if(time) type = type.replace("date", "time");
  let date = localStorage.getItem(`scheduled_${type}`);
  if(date) return moment(date);
  else if(["start_date", "start_time"].includes(type)) return moment().tz(getZone(props)).set({hour: 0, minute: 0, second: 0});
  else if(["end_date", "end_time"].includes(type)) return moment().tz(getZone(props)).set({hour: 23, minute: 59, second: 59});
} 

function getDateTime(props, date_type, time){
  let date = !props.item.job ? moment() : props.item.job[date_type]
  let offset = (moment(date).utcOffset()/60 * -1);
  if(!props.item.job) return getLocalStorageDate(props, date_type, time)
  else if(time) return moment(props.item.job[date_type]).tz(props.item.job.timezone);
  else {
    offset += (moment(props.item.job[date_type]).tz(props.item.job.timezone).utcOffset()/60);
    return moment(props.item.job[date_type]).add(offset, 'hours').tz(props.item.job.timezone);
  }
}

function getZone(props){
  let last_zone = localStorage.getItem("scheduled_time_zone");
  if(!props.item.job && !last_zone) return "US/Pacific";
  else if(!props.item.job && last_zone) return last_zone;
  else return props.item.job.timezone;
}

export default function SchedulePicker(props) {
  // The first commit of Material-UI
  const [selectedStartDate, setSelectedStartDate] = useState(getDateTime(props, 'start_date').format());
  const [selectedStartTime, setSelectedStartTime] = useState(getDateTime(props, 'start_date', true).format("YYYY-MM-DDTHH:mm:00"));
  const [selectedEndDate, setSelectedEndDate] = useState(getDateTime(props, 'end_date').format());
  const [selectedEndTime, setSelectedEndTime] = useState(getDateTime(props, 'end_date', true).format("YYYY-MM-DDTHH:mm:00"));
  const [timezone, setTimezone] = useState(getZone(props));

  const [repeatEvery, setRepeatEvery] = useState(getRepeatEveryValue(props.item));
  const [repeatDaysValue, setRepeatDaysValue] = useState(getRepeatDayValue(props.item));
  const [daysChecked, setDaysChecked] = useState(getRepeatWeeklyValue(props.item));
  // {
  //     Mon: false, Tues: false, Wed: false, Thur: false, Fri: false, Sat: false, Sun: false
  // });
  
  const classes = useStyles();

  // ss mm hh dd mm *    //or  yyyy
  // 0  1  2  3  4  5			  6

  const createSchedule = () => {
    try{
      let start_cron = getCronExpression(selectedStartDate, selectedStartTime);
      let end_cron = getCronExpression(selectedEndDate, selectedEndTime);
      let next_item = Object.assign({}, props.item);
      let startTime = moment(selectedStartTime);
      let endTime = moment(selectedEndTime);
      next_item.startDate = moment(selectedStartDate).tz(timezone, true)
        .set({hour: startTime.hour(), minute: startTime.minute()})
        .format();
      next_item.endDate = moment(selectedEndDate).tz(timezone, true)
        .set({hour: endTime.hour(), minute: endTime.minute()})
        .format();
      next_item.job = {
        start_date: next_item.startDate,
        end_date: next_item.endDate,
        start_cron_expression: start_cron,
        end_cron_expression: end_cron,
        timezone
      }
      
      props.setItem(next_item);
    }catch(err){
      
    }
    
  }

  const getWeeklyDays = () => {
    const weekly_values = [];
    if(daysChecked["Mon"]) weekly_values.push(2);
    if(daysChecked["Tues"]) weekly_values.push(3);
    if(daysChecked["Wed"]) weekly_values.push(4);
    if(daysChecked["Thur"]) weekly_values.push(5);
    if(daysChecked["Fri"]) weekly_values.push(6);
    if(daysChecked["Sat"]) weekly_values.push(7);
    if(daysChecked["Sun"]) weekly_values.push(1);
    return weekly_values.join();
  }

  const getCronExpression = (date, time) => {
    if(date == "Invalid Date" || time == "Invalid Date") throw {message: "Invalid Date"};
    let [yyyy, MM, dd] = moment(date).format().split("T")[0].split("-");
    let [hh, mm] = moment(time).format().split("T")[1].split(":"); 
    if(repeatEvery == "") return `0 ${mm} ${hh} ${dd} ${MM} ? ${yyyy}`;
    // //Daily 
    if(repeatEvery == "daily") return `0 ${mm} ${hh} 1/${repeatDaysValue} * ?`;
    // //Weekly
    if(repeatEvery == "weekly") return `0 ${mm} ${hh} ? * ${getWeeklyDays()}`;
    // //Monthly
    if(repeatEvery == "monthly") return `0 ${mm} ${hh} ${dd} * ?`;
    // //Yearly
    if(repeatEvery == "yearly") return `0 ${mm} ${hh} ${dd} ${MM} ?`;

    return `0 ${mm} ${hh} ${dd} ${MM} ? ${yyyy}`;
  }

  const handleDateChange = (date, type) => {
    if(date == "Invalid Date") return;
    let localStorageKey = `scheduled_${type}`;
    localStorage.setItem(localStorageKey, date);
    props.setAreSettingsUpdated(true);
    props.setErr({});
    if(type == "start_date") setSelectedStartDate(date)
    else if(type == "start_time") setSelectedStartTime(date)
    else if(type == "end_date") setSelectedEndDate(date);
    else if(type == "end_time") setSelectedEndTime(date);
  };

  const getTimezone = () => {
    if(!props.item.job) return "US/Pacific";
    else return props.item.job.timezone;
}
  const getSimpleDateTime = () => {
    if(!props.item.job) return moment();
    else return moment().tz(props.item.job.timezone);
  }


  useEffect(e => {
    if(props.radioValue == "scheduled" || props.item.job) createSchedule();
    
  }, 
    [
      selectedStartDate, selectedStartTime, selectedEndDate, selectedEndTime, timezone, 
      repeatEvery, repeatDaysValue, daysChecked, props.radioValue
    ]);

    // useEffect(() => {
    //   
    // }, [props.radioValue])

  return (
    <>
    <Typography style={{textAlign: 'center'}} variant="h6">
      Current {getTimezone()} DateTime: {getSimpleDateTime().format("MM-DD-YYYY HH:mm")}
    </Typography>
    <Alert 
        className={!props.err.message ? "hidden" : ""} 
        severity="error"
    >
        {props.err.message}
    </Alert>
    <MuiPickersUtilsProvider maxWidth="sm" utils={DateFnsUtils}>
      <RepeatDialog 
        open={props.isRepeatOpen}
        createSchedule={createSchedule}
        setIsRepeatOpen={props.setIsRepeatOpen}
        repeatEvery={repeatEvery}
        setRepeatEvery={setRepeatEvery}
        repeatDaysValue={repeatDaysValue}
        setRepeatDaysValue={setRepeatDaysValue}
        daysChecked={daysChecked} 
        setDaysChecked={setDaysChecked}
      />
      <Typography variant="subtitle2">Start Date & Time</Typography>
      <Grid container justify="space-around" 
      // onClick={createSchedule}
      >
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          error={props.err.type && props.err.type.includes("start_date")}
          margin="normal"
          id="date-picker-inline-start"
          label="Start Date"
          value={selectedStartDate}
          onChange={d => handleDateChange(d, "start_date")}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
        
        <KeyboardTimePicker
          ampm={false}
          margin="normal"
          id="time-picker-start"
          label="Start Time"
          error={props.err.type && props.err.type.includes("start_time")}
          value={selectedStartTime}
          onChange={t => {
            
            handleDateChange(t, "start_time")
          }}
          onAccept={t => t}
          KeyboardButtonProps={{
            'aria-label': 'change time',
          }}
        />
        <FormControl variant="outlined" className={classes.formControl}>
          <Autocomplete
            id="combo-box-demo"
            options={timezones}
            getOptionLabel={option => `(${option.offsetzone} ${option.offset} ) ${option.name}`}
            style={{ width: 300 }}
            onChange={(e, v) => {setTimezone(v.name); localStorage.setItem("scheduled_time_zone", v.name)}}
            value={timezones.find(t => t.name == timezone)}
            renderInput={params => <TextField {...params} label="Timezone" variant="outlined" />}
          />
        </FormControl>
      </Grid>
      <Typography variant="subtitle2">End Date & Time</Typography>
      <Grid container justify="space-around">
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          error={props.err.type && props.err.type.includes("end_date")}
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline-end"
          label="End Date"
          value={selectedEndDate}
          onChange={d => handleDateChange(d, "end_date")}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
        
        <KeyboardTimePicker
          ampm={false}
          margin="normal"
          id="time-picker-end"
          label="End Time"
          error={props.err.type && props.err.type.includes("end_time")}
          value={selectedEndTime}
          onChange={t => handleDateChange(t, "end_time")}
          KeyboardButtonProps={{
            'aria-label': 'change time',
          }}
        />
        <FormControl variant="outlined" className={classes.formControl}>
          <Autocomplete
            id="combo-box-demo"
            options={timezones}
            getOptionLabel={option => `(${option.offsetzone} ${option.offset}) ${option.name}`}
            style={{ width: 300, visibility: 'hidden' }}
            onChange={(e, v) => {setTimezone(v.name)}}
            value={timezones.find(t => t.name == timezone)}
            renderInput={params => <TextField {...params} label="Timezone" variant="outlined" />}
          />
        </FormControl>
      </Grid>
    </MuiPickersUtilsProvider>
    </>
  );
}