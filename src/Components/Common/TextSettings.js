import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Button, Dialog, TextField, Checkbox, FormControlLabel, Typography, Box, 
    Select, MenuItem, FormControl, InputLabel, Slider} from '@material-ui/core/';
import { Colorize } from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { ChromePicker } from 'react-color';
import {rgbToHex} from '../../CommonFunctions';
import 'moment-jdateformatparser';
import 'typeface-roboto';

export default function TextSettings(props) {

    const [display, setDisplay] = useState(props.settings.display == 'true');

    const [textToDisplay, setTextToDisplay] = useState(props.textToDisplay);
    const [textFont, setTextFont] = useState(props.settings.textFont);
    const [textColor, setTextColor] = useState(props.settings.textColor);
    const [textSize, setTextSize] = useState(props.settings.textSize);
    const [length, setLength] = useState(props.settings.length);
    const [textSizeMin, setTextSizeMin] = useState(props.settings.textSizeMin);
    const [x, setX] = useState(props.settings.x);
    const [y, setY] = useState(props.settings.y);
    const [fonts, setFonts] = useState([]);

    const [strokeColor, setStrokeColor] = useState(props.settings.strokeColor);
    const [strokeWidth, setStrokeWidth] = useState(props.settings.strokeWidth);
    const [shadowColor, setShadowColor] = useState(props.settings.shadowColor);
    const [shadowBlur, setShadowBlur] = useState(props.settings.shadowBlur);
    const [shadowOffsetX, setShadowOffsetX] = useState(props.settings.shadowOffsetX);
    const [shadowOffsetY, setShadowOffsetY] = useState(props.settings.shadowOffsetY);
    const [shadowOpacity, setShadowOpacity] = useState(props.settings.shadowOpacity);
    const [alignment, setAlignment] = useState(props.settings.alignment);
    
    const [lineBreak, setLineBreak] = useState(props.settings.lineBreak == 'true');

    const [showFontSwatch, setShowFontSwatch] = useState(false);
    const [showShadowSwatch, setShowShadowSwatch] = useState(false);
    const [showStrokeSwatch, setShowStrokeSwatch] = useState(false);
    
    const [format, setFormat] = useState(props.settings.format || "hh:m");

    const [coverDisplay, setCoverDisplay] = useState("inherit");

    const {eyeDropperColor: {r,g,b}} = props;
    const [eyeDropperTarget, setEyeDropperTarget] = useState();
    
    // const handleChange = (e, v) => {
    //     setDisplay("" + v);.toMomentFormatString
    // }
    
    const swatch =  {
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer',
    };

    const swatch_color = { 
        width: '36px',
        height: '14px',
        borderRadius: '2px',
        // background: `${color}`,
    }

    const popover = {
        position: 'absolute',
        zIndex: '2',
    }
    const cover = {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
        display: coverDisplay,
        // pointerEvents: 'none'
        // zIndex: '-1',
        // background: 'lightgray',
        // opacity: '.5'
    }

    const section_container = {
        marginTop: '10px',
        marginBottom: '10px'
    }

    const FormatSelect = (type) => {
        // console.log('props.settings.format :>> ', props.settings.format);
        if(!["Time", "Date"].includes(type)) return;
        const formats = {Time: ['h:mm', 'hh:mm', 'hh:mm A', 'hh:mm a', 'hh:mm:ss', 'HH:mm', 'HH:mm:ss'],
            Date: ["MM/DD/YY", "MM.DD.YY", "MM-DD-YY", "D MMM YYYY", "MMMM D, YYYY", "YYYY", "'YY"]};
        // console.log('formats :>> ', formats);
        return(
            <FormControl variant="outlined" >
                <InputLabel id="format_select">Format</InputLabel>
                <Select
                    labelId="format_select"
                    id="format_select"
                    value={props.settings.format}
                    onChange={e => handleChange('format', e.target.value)}
                    label="Format"
                > {formats[type].map(x => <MenuItem value={x}>{x}</MenuItem>)}
                </Select>
            </FormControl>
        )
    }

    const handleChange = (property, value) => {
        if(!["textColor", "strokeColor", "shadowColor"].includes(property)) props.setEyeDropperActive(false);
        let nextSettings = Object.assign({}, props.settings);
        nextSettings[property] = value;
        if(property !== "display") nextSettings.display = "true";
        props.updateCanvasProps(props.textToDisplay.toLowerCase().replace(/ /g, ''), nextSettings);
    }

    const handleDropperToggle = (target) => {   
        setEyeDropperTarget(target);
        if(props.eyeDropperActive == target) props.setEyeDropperActive(false);
        else props.setEyeDropperActive(target);
    }

    const handleTextChange = (e) => {
        setTextToDisplay(e.target.value)
        handleChange("display", "true");
        if(props.onTextChange) props.onTextChange(e.target.value)
        else handleChange("text", e.target.value);
    }

    const handleColorPickerScroll = e => {
        if(coverDisplay !== "none") {
            setCoverDisplay("none")
            setTimeout(()=> {
                setCoverDisplay("inherit")
            }, 500)
        }
    }

    useEffect(()=>{
        const {eyeDropperColor: {r,g,b}} = props;
        let hex = rgbToHex(r,g,b);
        console.log("hex: ", hex);
        console.log("eyeDropperTarget: ", eyeDropperTarget);
        if(hex) handleChange(eyeDropperTarget, hex.slice(1));
    }, [props.eyeDropperColor]);

  return (
    <div style={{padding: '0 20px'}}>
        {/* <EyeDropper onChange={(rgb, hex)=>console.log("in eyedropper: ", rgb, hex)}/> */}
        <FormControlLabel
            control={
            <Checkbox
                checked={JSON.parse(props.settings.display)}
                onChange={(e,v) => handleChange("display", "" + v)}
                name="checkedB"
                color="primary"
            />
            }
            label="Display"
        />
        <hr></hr>
        <Typography variant="subtitle1">Text</Typography>
        <hr></hr>
        <TextField style={{width: '100%'}} className={["Time", "Date"].includes(props.textToDisplay) ? "hidden": ""} 
            id="text-to-display" onChange={handleTextChange}
            defaultValue={props.settings.text || textToDisplay} label="Text to Test" variant="outlined" />
            {FormatSelect(props.textToDisplay)}
        <Box style={section_container}>
            <Autocomplete
                id="font-select"
                options={props.fonts}
                // getOptionLabel={font => `${font}`}
                renderOption={font => <div style={{fontFamily: font}}>{font}</div>}
                style={{ width: '50%', display: 'inline-block', verticalAlign: 'bottom' }}
                onChange={(e,v) => handleChange("textFont", v)}
                value={props.settings.textFont}
                renderInput={params => {
                    params.InputProps.style = {fontFamily: props.settings.textFont}
                    return(<TextField {...params} label="Font Name" variant="outlined" />)
                }}
            />
            <div style={{display: 'inline-block', width: '50%', textAlign: 'center'}}>
                <Typography variant="subtitle1" gutterBottom>
                    Color
                </Typography>
                <div style={ swatch } onClick={ e => setShowFontSwatch(!showFontSwatch) }>
                    <div style={ {...swatch_color, background: "#" + props.settings.textColor} } />
                </div>
                <div style={{position: 'absolute', zIndex: 10, right:'50px'}} className={showFontSwatch ? "" : "hidden"}>
                    {/* <div style={ popover }> */}
                        <div style={ cover } 
                            onClick={ e => setShowFontSwatch(false) }
                            onWheel={handleColorPickerScroll}
                        />  
                        
                            <ChromePicker 
                                color={ "#" + props.settings.textColor }
                                disableAlpha
                                onChange={ c => {
                                    console.log("c a: ", c);
                                    handleChange("textColor", c.hex.slice(1)) 
                                }}
                            />
                    {/* </div> */}
                </div>
                <Colorize onClick={e=>{handleDropperToggle("textColor")}} 
                    style={{marginLeft: '10px', cursor: 'pointer'}}
                />
                <div id="textColorSample" className={props.eyeDropperActive !== "textColor" ? "hidden" : "inlineBlock"} 
                    style={{border: '1px solid black', width: '25px', height: '25px', background: `rgb(${r}, ${g}, ${b})` }}
                ></div>
            </div>
        </Box>
        <Box style={section_container}>
            <TextField id="text-size" defaultValue={textSize} onChange={e => handleChange("textSize", e.target.value)} 
                style={{width: '50%'}} label="Font Size" variant="outlined" type="number" />
            <TextField id="text-length" defaultValue={length} onChange={e => handleChange("length", e.target.value)} 
                style={{width: '45%', float: 'right'}} label="Length" variant="outlined" type="number" />
        </Box>
        <Box style={section_container}>
            <TextField id="min-text-size" defaultValue={textSizeMin} onChange={e => handleChange("textSizeMin", e.target.value)}  
                style={{width: '50%'}} label="Min Font Size" variant="outlined" type="number" />
            <FormControlLabel style={{marginRight: '0px', float: 'right'}}
                control={
                <Checkbox
                    checked={JSON.parse(props.settings.lineBreak)}
                    onChange={(e,v) => handleChange("lineBreak",  "" + v)}
                    name="addLineBreak"
                    color="primary"
                />
                }
                label="Add Line Break"
            />
        </Box>
        <Typography variant="subtitle1">Position</Typography>
        <hr></hr>
        <Box style={section_container}>
            <TextField id="position-x" value={props.settings.x} onChange={e => handleChange("x", e.target.value)} 
                style={{width: "30%", marginRight: '5%'}} label="X" variant="outlined" type="number" />
            <TextField id="position-y" value={props.settings.y} onChange={e => handleChange("y", e.target.value)} 
                style={{width: "30%", marginRight: '5%'}} label="Y" variant="outlined"  type="number" />
            <FormControl variant="outlined" >
                <InputLabel id="demo-simple-select-outlined-label">Alignment</InputLabel>
                <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    value={props.settings.alignment}
                    onChange={e => handleChange("alignment", e.target.value)}
                    label="Alignment"
                >
                    <MenuItem value={'left'}>Left</MenuItem>
                    <MenuItem value={'center'}>Center</MenuItem>
                    <MenuItem value={'right'}>Right</MenuItem>
                </Select>
            </FormControl>
        </Box>
        <Typography variant="subtitle1">Stroke</Typography>
        <hr></hr>
        <Box style={section_container}>
            <div style={{display: 'inline-block', width: '30%'}}>
                <Typography variant="subtitle1" gutterBottom>
                    Color
                </Typography>
                <div style={ swatch } onClick={ e => setShowStrokeSwatch(!showStrokeSwatch) }>
                    <div style={ {...swatch_color, background: "#" + props.settings.strokeColor} } />
                </div>
                <div style={{position: 'absolute', zIndex: 10}} className={showStrokeSwatch ? "" : "hidden"}>
                    <div style={ popover }>
                        <div style={ cover }
                            onWheel={handleColorPickerScroll}
                            onClick={ e => setShowStrokeSwatch(false) }
                        />
                            <ChromePicker 
                                color={ "#" + props.settings.strokeColor }
                                // onChangeComplete={ handleColorChange }
                                onChange={c => handleChange("strokeColor", c.hex.slice(1))}
                            />
                    </div>
                </div>
                <Colorize onClick={e=>{handleDropperToggle("strokeColor")}} 
                    style={{marginLeft: '10px', cursor: 'pointer'}}
                />
                <div id="strokeColorSample" className={props.eyeDropperActive !== "strokeColor" ? "hidden" : "inlineBlock"} 
                    style={{border: '1px solid black', width: '25px', height: '25px', background: `rgb(${r}, ${g}, ${b})` }}
                ></div>
                
            </div>
            {/* <TextField style={{width: '40%'}} id="stroke-width" defaultValue={props.settings.strokeWidth} 
                onChange={e => handleChange("strokeWidth", e.target.value)} 
                label="Width" variant="outlined" /> */}
            <Slider value={props.settings.strokeWidth} style={{width: '70%'}} 
                min={0} max={5} marks step={1}
                onChange={(e, v) => {
                    handleChange("strokeWidth", parseInt(v));
                }} aria-labelledby="continuous-slider" 
            />
        </Box>
        <Typography variant="subtitle1">Shadow</Typography>
        <hr></hr>
        <Box style={section_container}>
            <div style={{display: 'inline-block', width: '30%', verticalAlign: 'top'}}>
                <Typography variant="subtitle1" gutterBottom>
                    Color
                </Typography>
                <div style={ swatch } onClick={ e => setShowShadowSwatch(!showShadowSwatch) }>
                    <div style={ {...swatch_color, background: "#" + props.settings.shadowColor} } />
                </div>
                <div style={{position: 'absolute', zIndex: 10}} className={showShadowSwatch ? "" : "hidden"}>
                    <div style={ popover }>
                        <div style={ cover }
                            onWheel={handleColorPickerScroll}
                            onClick={ e => setShowShadowSwatch(false) }/>
                            <ChromePicker 
                                color={ "#" + props.settings.shadowColor }
                                // onChangeComplete={ handleColorChange }
                                onChange={c => handleChange("shadowColor", c.hex.slice(1))}
                            />
                    </div>
                </div>
                <Colorize onClick={e=>{handleDropperToggle("shadowColor")}} 
                    style={{marginLeft: '10px', cursor: 'pointer'}}
                />
                <div id="shadowColorSample" className={props.eyeDropperActive !== "shadowColor" ? "hidden" : "inlineBlock"} 
                    style={{border: '1px solid black', width: '25px', height: '25px', background: `rgb(${r}, ${g}, ${b})` }}
                ></div>
                
            </div>
            <div style={{display: 'inline-block', width: '40%'}}>
                <Typography variant="subtitle1" gutterBottom>
                    Blur
                </Typography>
                <Slider value={props.settings.shadowBlur} style={{width: '100%'}} 
                    min={0} max={30}
                    onChange={(e, v) => {
                        handleChange("shadowBlur", parseInt(v));
                    }} aria-labelledby="continuous-slider" />
            </div>
            <div>
                <Typography style={{display: 'inline-block'}} variant="subtitle1" gutterBottom>
                    Offset
                </Typography>
                {/* <Typography style={{display: 'inline-block', float: 'right', marginRight: '20px'}} variant="subtitle1" gutterBottom>
                    Opacity
                </Typography> */}
            </div>
            <TextField id="shadow-offset-x" defaultValue={shadowOffsetX} onChange={e => handleChange("shadowOffsetX", e.target.value)} 
                style={{width: "33%", marginRight: '5%'}} label="X" variant="outlined"  type="number" />
            <TextField id="shadow-offset-y" defaultValue={shadowOffsetY} onChange={e => handleChange("shadowOffsetY", e.target.value)}
                 style={{width: "33%", marginRight: '5%'}} label="Y" variant="outlined"  type="number" />
            <FormControl variant="outlined" >
                <InputLabel id="opacity_select">Opacity</InputLabel>
                <Select
                    labelId="opacity_select"
                    id="opacity_select"
                    defaultValue={shadowOpacity}
                    onChange={e => handleChange("shadowOpacity", e.target.value)}
                    label="Opacity"
                >
                    <MenuItem value={'0'}>0</MenuItem>
                    <MenuItem value={'0.1'}>0.1</MenuItem>
                    <MenuItem value={'0.2'}>0.2</MenuItem>
                    <MenuItem value={'0.3'}>0.3</MenuItem>
                    <MenuItem value={'0.4'}>0.4</MenuItem>
                    <MenuItem value={'0.5'}>0.5</MenuItem>
                    <MenuItem value={'0.6'}>0.6</MenuItem>
                    <MenuItem value={'0.7'}>0.7</MenuItem>
                    <MenuItem value={'0.8'}>0.8</MenuItem>
                    <MenuItem value={'0.9'}>0.9</MenuItem>
                    <MenuItem value={'1'}>1</MenuItem>
                </Select>
            </FormControl>
        </Box>
    </div>
  );
}
