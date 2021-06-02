import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {TextField, FormControl, InputLabel, Select,
     MenuItem, Box, Checkbox, FormControlLabel} from '@material-ui/core/';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';


const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
    textAlign: "center"
  },
  select:{
      width: '100%'
  }
}));

function RepeatDialog(props) {
    const [repeatType, setRepeatType] = useState();
    const [location, setLocation] = useState();

    const classes = useStyles();
    const { onClose, selectedValue, open } = props;

    const handleClose = () => {
        // onClose(selectedValue);
        props.setIsRepeatOpen(false);
        props.createSchedule();
    };

    const handleTypeChange = (e, v) => {
        let value = v.props.value;
        props.setRepeatEvery(value);
    }

    const handleDayChange = (e,v) => {
        props.setRepeatDaysValue(e.target.value);
    }

    const handleWeekChange = (e, v) => {
        let day_value = e.target.getAttribute("name"); 
        let nextDaysChecked = Object.assign({}, props.daysChecked);
        nextDaysChecked[day_value] = !props.daysChecked[day_value];
        
        
        props.setDaysChecked(nextDaysChecked);
    }

    const showDailyRepeat = () => {
        let i = 1;
        let arr = [];
        while( i < 32 ){
            arr.push(<MenuItem key={i} value={i}>{i}</MenuItem>);
            i += 1;
        }
        return arr;
    }

    const showWeeklyRepeat = () => {
        
        return ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
            .map(x => {
                return <FormControlLabel
                    key={x}
                    control={
                    <Checkbox
                        checked={props.daysChecked[x]}
                        onChange={handleWeekChange}
                        name={x}
                        color="primary"
                    />
                    }
                    label={x}
                />
            });
    }

  return (
    <Dialog style={{textAlign: 'center', width: '100%'}} onClose={handleClose} aria-labelledby="simple-dialog-title" open={props.open}>
        <DialogTitle id="simple-dialog-title">
            Set To Repeat
        </DialogTitle>
        <DialogContent>
            <FormControl style={{width: '100%', minWidth: '400px'}} variant="outlined" className={classes.formControl}>
              <InputLabel id="demo-simple-select-outlined-label">Repeats</InputLabel>
                <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    className={classes.select}
                    value={props.repeatEvery}
                    onChange={handleTypeChange}
                    label="Repeats"
                >
                    <MenuItem value={'noRepeat'}>No Repeat</MenuItem>
                    <MenuItem value={'daily'}>Daily</MenuItem>
                    <MenuItem value={'weekly'}>Weekly</MenuItem>
                    <MenuItem value={'monthly'}>Monthly</MenuItem>
                    <MenuItem value={'yearly'}>Yearly</MenuItem>
                </Select>
                <Box style={{marginTop: '10px'}}>
                    <FormControl 
                        style={{width: '100%'}} 
                        variant="outlined" 
                        className={(props.repeatEvery == "daily" ? " " : " hidden")}
                    >
                        <InputLabel id="daily_repeat">Every</InputLabel>
                            <Select
                                labelId="daily_repeat"
                                id="daily_repeat_select"
                                className={classes.select}
                                value={props.repeatDaysValue}
                                onChange={handleDayChange}
                                label="Repeats"
                            >
                                {showDailyRepeat()}
                            </Select>
                    </FormControl>
                    <Box className={(props.repeatEvery == "weekly" ? " " : " hidden")}>
                        {showWeeklyRepeat()}
                    </Box>
                </Box>
                    
                
            </FormControl>
            <DialogActions id="dialog_actions">
                <Button onClick={handleClose} color="primary">
                    Ok
                </Button>
            </DialogActions>
        </DialogContent>
    </Dialog>
  );
}

export default RepeatDialog;