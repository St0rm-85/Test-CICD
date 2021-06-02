import React, {useRef} from 'react';
import { Stage, Layer, Image, Text, Label, Tag } from 'react-konva';
import {getXOffset, getYOffset} from '../../CommonFunctions';
import moment from 'moment';

export default function TextLayer(props){
  const {filterOrientationType} = props;
  const labelRef = useRef();

  let scale = window.innerHeight*.6375/1080;
    if(props.alignment == "horizontal" && filterOrientationType == "vertical") scale *= .75;
    else if(props.alignment == "horizontal") scale *= .75;
    else if(props.alignment == "vertical" && filterOrientationType == "horizontal") scale = .88;
    if(filterOrientationType == "horizontal") scale /= .75;

  const getTextToDisplay = () => {
    if(["city", "freeformtext"].includes(props.name)) return props.text;
    else return moment().format(props.text);
  }

  const handleDrag = (e) => {
    let scale = window.innerHeight*.6375/1080;
    if(props.alignment == "horizontal" && filterOrientationType == "vertical") scale *= .75;
    else if(props.alignment == "horizontal") scale *= .75;
    else if(props.alignment == "vertical" && filterOrientationType == "horizontal") scale = .88;
    if(filterOrientationType == "horizontal") scale /= .75;
    let nextSettings = Object.assign({}, props.settings);
    let modCanvasProps = JSON.parse(JSON.stringify(props.canvasProps));
    let x_offset = getXOffset({alignment: props.alignment, canvasProps: modCanvasProps, filterOrientationType}); 
    let y_offset = getYOffset({alignment: props.alignment, canvasProps: modCanvasProps, filterOrientationType});

    nextSettings.x = parseInt(e.target.x()) / (scale / (window.innerHeight*.6375/1080)) - (x_offset / (scale / (window.innerHeight*.6375/1080)));
    nextSettings.y = parseInt(e.target.y()) / (scale / (window.innerHeight*.6375/1080)) - (y_offset / (scale / (window.innerHeight*.6375/1080)));
    // // .75;
    // 
    // 
    
    // nextSettings.textSize *= 1 / (scale / (window.innerWidth*.673/1080));
    // nextSettings.length *= 1 / (scale / (window.innerWidth*.673/1080));
    // nextSettings.positionedImage.x = sticker_coordinates.x / (scale / (window.innerWidth*.673/1080)) - (x_offset / (scale / (window.innerWidth*.673/1080)));
    // nextSettings.positionedImage.y = sticker_coordinates.y / (scale / (window.innerWidth*.673/1080)) - (y_offset / (scale / (window.innerWidth*.673/1080)));
    // nextSettings.sticker.x = sticker_coordinates.x / (scale / (window.innerWidth*.673/1080)) - (x_offset / (scale / (window.innerWidth*.673/1080)));
    // nextSettings.sticker.y = sticker_coordinates.y / (scale / (window.innerWidth*.673/1080)) - (y_offset / (scale / (window.innerWidth*.673/1080)));

    props.updateCanvasProps(props.name, nextSettings);
  }

  

  if(JSON.parse(props.settings.display) && !props.hide){
      return (
          <Label
            x={parseInt(props.settings.x) || 0}
            y={parseInt(props.settings.y) || 0}
            ref={labelRef}
            width={parseInt(props.settings.length)}
            draggable={true}
            onDragEnd={handleDrag}
            style={{border: "1px solid black"}}
          >
            <Tag 
              strokeWidth={1} // border width
              stroke="black"
              width={parseInt(props.settings.length) || 0}
            />
            <Text
              text={getTextToDisplay()}
              shadowColor={"#" + props.settings.shadowColor}
              shadowBlur={props.settings.shadowBlur}
              shadowOpacity={props.settings.shadowOpacity}
              shadowOffsetX={props.settings.shadowOffsetX}
              shadowOffsetY={props.settings.shadowOffsetY}
              strokeWidth={parseInt(props.settings.strokeWidth)}
              stroke={"#" + props.settings.strokeColor}
              fontFamily={props.settings.textFont}
              fontSize={parseInt(props.settings.textSize) * scale * .75 || 0}
              fill={"#" + props.settings.textColor}
              width={parseInt(props.settings.length) || 0}
              align={props.settings.alignment}
            />
          </Label>
      )
  }else{
      return <Label/>
  }
  };