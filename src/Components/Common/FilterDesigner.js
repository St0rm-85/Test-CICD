import React, {useState, useEffect, Profiler} from 'react';
import Konva from 'konva';
import { Stage, Layer, Image, Text, Label, Tag } from 'react-konva';
import FilterDesignerControls from './FilterDesignerControl';
import axios from 'axios';
import CanvasText from './CanvasText';
import useImage from 'use-image';
import moment from 'moment';
import { readUploadedImage, parseStringToInt, setFrameContentType,
  getXOffset, getYOffset, transformCanvasProps, getEnvironment, 
} from '../../CommonFunctions';
import {getStaticAssetPath} from '../../ApiUtility/ApiUtility';
import '../../App.css';
import ARPreview from './ARPreview';

// ?d=${moment().format()}
const date = moment().format();
let canvasTop;
let canvasLeft;

const StickerImage = (props) => {
  let image_url;
  let scale = window.innerHeight*.6375/1080;
  const {uploadedStickerUrl, selectedFilter, setSelectedFilter} = props;

  const [imageUrl, setImageUrl] = useState("");
  const [imageNode, setImageNode] = useState(null);
  const [stickerHeight, setStickerHeight] = useState();
  const [stickerWidth, setStickerWidth] = useState();
  
  if(props.alignment == "horizontal" && props.filterOrientationType == "vertical") scale *= .75;
  else if(props.alignment == "horizontal") scale *= .75;
  else if(props.alignment == "vertical" && props.filterOrientationType == "horizontal") scale = .88;

  // if(!!props.uploadedStickerUrl) setImageUrl(props.uploadedStickerUrl);
  // else image_url = `${getEnvironment()}.cameraplus.co/CameraPlus/gc/sys/objblob/frame/${props.selectedFilter.frame_id}/pi?d=${date}`;
  
  const [image, status] = useImage(imageUrl, 'Anonymous');


  const handleStickerPosition = (sticker_coordinates) => {
    let {filterOrientationType} = props;
    if(filterOrientationType == "horizontal") scale /= .75;
    let nextSettings = JSON.parse(JSON.stringify(props.canvasProps.upload_images));
    let modCanvasProps = JSON.parse(JSON.stringify(props.canvasProps));
    let x_offset = getXOffset({alignment: props.alignment, canvasProps: modCanvasProps, filterOrientationType}); 
    let y_offset = getYOffset({alignment: props.alignment, canvasProps: modCanvasProps, filterOrientationType});

    nextSettings.positionedImage.x = sticker_coordinates.x - x_offset;
    nextSettings.positionedImage.y = sticker_coordinates.y - y_offset;
    nextSettings.sticker.x = sticker_coordinates.x - x_offset;
    nextSettings.sticker.y = sticker_coordinates.y - y_offset;

    props.updateCanvasProps('upload_images', nextSettings);
  }

  

  useEffect(() => {
    const checkSetHostedSticker = async () => {
      console.log("in check set hosted sticker");
      if(!!uploadedStickerUrl) return;
      let url  = await getStaticAssetPath(selectedFilter.frame_id, "pi");
      setImageUrl(url);
      axios.get(url)
        .then(r => setFrameContentType(selectedFilter, "sticker", setSelectedFilter));
      }
      checkSetHostedSticker();
    }, [selectedFilter.frame_id]);

  useEffect(() => {
    if(!!uploadedStickerUrl) {
      setImageUrl(uploadedStickerUrl);
      setFrameContentType(props.selectedFilter, "sticker", props.setSelectedFilter);
    }
  },[uploadedStickerUrl])

  useEffect(()=> {
    if(!imageNode) return;
    setStickerHeight(imageNode.height * scale);
    setStickerWidth(imageNode.width * scale);
  }, [imageNode]);

  useEffect(()=> {
    if(status == "loaded") setImageNode(image);
  },[status]);

  if(!!props.hide) return <Label/>
  

  return (
    <Image 
      x={parseStringToInt(props.canvasProps.upload_images.positionedImage.x)}
      y={parseStringToInt(props.canvasProps.upload_images.positionedImage.y)}
      height={stickerHeight}
      width={stickerWidth}
      draggable
      image={imageNode}
      onDragEnd={e => {
        handleStickerPosition({x: parseInt(e.target.x()), y: parseInt(e.target.y())});
      }}
    />
  )
};

const FilterImage = (props) => {

  let image_url;
  let scale = 1; 
  const {uploadedBackgroundUrl, selectedFilter, setSelectedFilter} = props;

  const [imageUrl, setImageUrl] = useState("");
  const [imageNode, setImageNode] = useState(null);

  if(props.alignment == "horizontal" && props.filterOrientationType == "vertical") scale = .75;
  else if(props.alignment == "vertical" && props.filterOrientationType == "horizontal") scale = 1/.75;

  const handleHorizontalImage = () => {
    let type = props.canvasProps.settings.type;
    let nextSettings = props.canvasProps.settings;
    if(type != 1 && type != 3){
      nextSettings.type = 1;
      props.updateCanvasProps("settings", nextSettings);
      props.setAlignment("horizontal");
    }else{
      props.setFilterOrientationType('horizontal');
    }
  }

  const handleVerticalImage = () => {
    let type = props.canvasProps.settings.type;
    let nextSettings = props.canvasProps.settings;
    if(type != 0 && type != 2){
      nextSettings.type = 0;
      props.updateCanvasProps("settings", nextSettings);
      props.setAlignment("vertical");
    }else{
      props.setFilterOrientationType('vertical');
    }
  }

  const getXOffset = (props) => {
    const {canvasProps: {settings: {type, alignment}}} = props;
    if(type == 0 || type == 1) return 0;
    // else if(type == 3 && props.alignment == 'vertical') return 0 - ((window.innerHeight*.85 - window.innerHeight*.6375) / (2 / alignment));
    else if(type == 3 && props.alignment == 'vertical') return 0 - ((window.innerHeight*.85) / (2 / alignment));
    else if(type == 2 && props.alignment == 'horizontal') return 0 + ((window.innerHeight*.85 * scale - window.innerHeight*.6375 * scale) / (2 / alignment));
  }
  
  const getYOffset = (props) => {
    const {canvasProps: {settings: {type, orienation}}} = props;
    if(type == 0 || type == 1) return 0;
    else if(type == 3 && props.alignment == 'vertical') return ((window.innerHeight*.85 - window.innerHeight*.6375) / (2 / orienation));
    else if(type == 2 && props.alignment == 'horizontal') return -1 * ((window.innerHeight*.85 * scale - window.innerHeight*.6375 * scale) / (2 / orienation));
  }

  // if(!!props.uploadedBackgroundUrl) image_url = props.uploadedBackgroundUrl;
  // else image_url = `${getEnvironment()}.cameraplus.co/CameraPlus/gc/sys/objblob/frame/${props.selectedFilter.frame_id}/bi?d=${date}`;


  const [image, status] = useImage(imageUrl, 'Anonymous');


  useEffect(() => {
    const checkSetHostedBackground = async () => {
      if(!!uploadedBackgroundUrl) return;
      let url  = await getStaticAssetPath(selectedFilter.frame_id, "bi");
      setImageUrl(url);
    }
    checkSetHostedBackground();
  }, [selectedFilter.frame_id]);

  useEffect(() => {
    if(!!uploadedBackgroundUrl) {
      setImageUrl(uploadedBackgroundUrl);
    }
  },[uploadedBackgroundUrl])


  useEffect(()=> {
    if(status == "loaded" && image.height == 1080 && image.width == 1440){
      setImageNode(image);
      handleHorizontalImage()
    }else if(status == "loaded" && image.height !== 1440 && image.width !== 1080){
      props.setUploadedBackground(false);
      props.setImageUploadErr("Image must be 1440 X 1080");
      props.setUploadedBackgroundUrl(null);
    }else if(status == "loaded" && image.height == 1440 && image.width == 1080){
      handleVerticalImage();
      setImageNode(image);
    }
  },[status]);

  return (
    <Image 
      x={getXOffset(props)}
      y={getYOffset(props)}
      key={1}
      width={props.orientation_type == 1 || props.orientation_type == 3 ? window.innerHeight*.85/.75*scale : window.innerHeight*.6375 * scale}
      // height={window.innerWidth*.893}
      height={window.innerHeight*.85*scale}
      image={imageNode}
    />
  )
};


export default function FilterDialog(props) {

  const orientation_type = props.canvasProps.settings.type;

  const [uploadedStickerUrl, setUploadedStickerUrl] = useState(null);
  const [uploadedBackgroundUrl, setUploadedBackgroundUrl] = useState(null);
  const [uploadedThumbnailUrl, setUploadedThumbnailUrl] = useState(null);
  const [imageUploadErr, setImageUploadErr] = useState(false);
  const [filterOrientationType, setFilterOrientationType] = useState(null);
  const [freeformtext, setFreeformtext] = useState("Free Form Text");
  const [cityText, setCityText] = useState("City");
  const [background, setBackground] = useState("white");
  const [eyeDropperActive, setEyeDropperActive] = useState(false);
  const [eyeDropperColor, setEyeDropperColor] = useState({});
  const [showHoveringSwatch, setShowHoveringSwatch] = useState(false);
  const [isARLoading, setIsARLoading] = useState(false);


  const getModCanvasProps = () => {
    if(!props.canvasProps.settings.type) return props.canvasProps;
    let modCanvasProps = JSON.parse(JSON.stringify(props.canvasProps));
    // return modCanvasProps;
    return transformCanvasProps(modCanvasProps, filterOrientationType, props.alignment,
      getXOffset({alignment: props.alignment, canvasProps: modCanvasProps, filterOrientationType}), 
      getYOffset({alignment: props.alignment, canvasProps: modCanvasProps, filterOrientationType}));
  }

  const eyeDropperOnMove = (e) => {
    if(!eyeDropperActive) return;
    let {top, left} = props.stageRef.current.content.getBoundingClientRect();
    let swatchX = e.evt.pageX;
    let swatchY = e.evt.pageY;
    let {x, y} = props.stageRef.current.getPointerPosition();
    let ctx = props.stageRef.current.content.children[0].getContext('2d');
    let scale = parseFloat(props.stageRef.current.content.children[0].style.width)/props.stageRef.current.content.children[0].width;
    let pxData = ctx.getImageData(x/scale,y/scale,5,5);
    let rgb = {r: pxData.data[0], g: pxData.data[1], b: pxData.data[2]};
    // setEyeDropperColor(rgb);
    document.getElementById("color").style.left = `${swatchX + 15 + canvasLeft - left}px`;
    document.getElementById("color").style.top = `${swatchY + 15 + canvasTop - top}px`;
    document.getElementById("color").style.background = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    document.getElementById(`${eyeDropperActive}Sample`).style.background = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  const eyeDropperOnClick = (e) => {
    if(!eyeDropperActive) return;
    let {x, y} = props.stageRef.current.getPointerPosition();
    let ctx = props.stageRef.current.content.children[0].getContext('2d');
    let scale = parseFloat(props.stageRef.current.content.children[0].style.width)/props.stageRef.current.content.children[0].width;
    let pxData = ctx.getImageData(x/scale,y/scale,5,5);
    let rgb = {r: pxData.data[0], g: pxData.data[1], b: pxData.data[2]};
    console.log("rgb: ", rgb);
    setEyeDropperColor(rgb);
  }
  let {uploadedSticker, uploadedBackground} = props;
  let containerWidth = props.alignment=="horizontal" ? '113.33vh' : "63.75vh";

  useEffect(() => {
    setUploadedStickerUrl(null);
  }, [props.selectedFilter]);

  useEffect(() => {
    canvasTop = props.stageRef.current.content.getBoundingClientRect().top;
    canvasLeft = props.stageRef.current.content.getBoundingClientRect().left;
  }, [props.stageRef])

  useEffect(()=>{
    setEyeDropperActive(false);
  },[props.editOpen]);

    
  return (

    <div>
        {
        showHoveringSwatch && 
          <div id="color" style={{height: '20px', width: '20px', border: '1px solid black', position: 'absolute', zIndex: 1200}}/>
        }
        <FilterDesignerControls 
          eyeDropperColor={eyeDropperColor}
          setEyeDropperColor={setEyeDropperColor}
          eyeDropperActive={eyeDropperActive}
          setEyeDropperActive={setEyeDropperActive}
          background={background}
          setBackground={setBackground}
          selectedFilter={props.selectedFilter}
          setSelectedFilter={props.setSelectedFilter}
          canvasProps={props.canvasProps}
          updateCanvasProps={props.updateCanvasProps}
          filterOrientationType={filterOrientationType}
          campaign={props.campaign}
          retailer={props.retailer}
          isARLoading={isARLoading}
          setIsARLoading={setIsARLoading}
          selectedArBinaries={props.selectedArBinaries}
          setSelectedArBinaries={props.setSelectedArBinaries}
          setSelectedDeepArVersion={props.setSelectedDeepArVersion}
          uploadedSticker={props.uploadedSticker}
          setUploadedSticker={props.setUploadedSticker}
          uploadedBackground={props.uploadedBackground}
          setUploadedBackground={props.setUploadedBackground}
          uploadedThumbnail={props.uploadedThumbnail}
          setUploadedThumbnail={props.setUploadedThumbnail}
          uploadedAREffects={props.uploadedAREffects}
          setUploadedAREffects={props.setUploadedAREffects}
          uploadedARBeaut={props.uploadedARBeaut}
          setUploadedARBeaut={props.setUploadedARBeaut}
          imageUploadErr={imageUploadErr}
          fonts={props.fonts}
          stageRef={props.stageRef}
          alignment={props.alignment}
          setAlignment={props.setAlignment}
          freeformtext={freeformtext} 
          setFreeformtext={setFreeformtext}
          cityText={cityText}
          setCityText={setCityText}
        />
        <div style={{position: "absolute", left: "34vw", width: containerWidth, height: '85vh'}}>
          <ARPreview
            canvasWidth={props.alignment=="horizontal" ? window.innerHeight*.85/.75 : window.innerHeight*.6375}
            canvasHeight={window.innerHeight*.85}
            campaign={props.campaign}
            selectedFilter={props.selectedFilter}
            selectedArBinaries={props.selectedArBinaries}
            setSelectedArBinaries={props.setSelectedArBinaries}
            setSelectedDeepArVersion={props.setSelectedDeepArVersion}
            setIsARLoading={setIsARLoading}
          />
          <Stage style={{border: '1px solid rgb(0, 188, 212)', marginBottom: '100px', background}}
              className={eyeDropperActive ? "pippette_cursor" : ""}
              onMouseMove={eyeDropperOnMove}
              onMouseEnter={e => setShowHoveringSwatch(true)}
              onMouseLeave={e => setShowHoveringSwatch(false)}
              onClick={eyeDropperOnClick}
              // scaleX={0.5}
              // scaleY={0.5}
              width={props.alignment=="horizontal" ? window.innerHeight*.85/.75 : window.innerHeight*.6375} 
              // height={window.innerWidth*.893} 
              // height={window.innerWidth*.673*.75}
              height={window.innerHeight*.85}
              ref={props.stageRef}
            >
              <Layer>
                <FilterImage
                  alignment={props.alignment}
                  filterOrientationType={filterOrientationType}
                  canvasProps={getModCanvasProps()}
                  updateCanvasProps={props.updateCanvasProps}
                  setAlignment={props.setAlignment}
                  setFilterOrientationType={setFilterOrientationType}
                  uploadedBackgroundUrl={uploadedBackground}
                  selectedFilter={props.selectedFilter}
                  setUploadedBackground={props.setUploadedBackground}
                  setImageUploadErr={setImageUploadErr}
                  setUploadedBackgroundUrl={setUploadedBackgroundUrl}
                  orientation_type={orientation_type}
                />
                <StickerImage
                  uploadedStickerUrl={uploadedSticker}
                  alignment={props.alignment}
                  hide={props.hiddenCanvasElements.includes("sticker")}
                  selectedFilter={props.selectedFilter}
                  setSelectedFilter={props.setSelectedFilter}
                  canvasProps={getModCanvasProps()}
                  updateCanvasProps={props.updateCanvasProps}
                  filterOrientationType={filterOrientationType}
                />
                <CanvasText 
                  text={
                    // props.canvasProps.variables.city.text || 
                    cityText}
                  name={"city"}
                  hide={props.hiddenCanvasElements.includes("city")}
                  alignment={props.alignment}
                  settings={getModCanvasProps().variables.city}  
                  canvasProps={props.canvasProps}
                  updateCanvasProps={props.updateCanvasProps}
                  filterOrientationType={filterOrientationType}
                />
                <CanvasText 
                  text={props.canvasProps.variables.date.format}
                  name={"date"}
                  hide={props.hiddenCanvasElements.includes("date")}
                  alignment={props.alignment}
                  settings={getModCanvasProps().variables.date}  
                  canvasProps={props.canvasProps}
                  updateCanvasProps={props.updateCanvasProps}
                  filterOrientationType={filterOrientationType}
                />
                <CanvasText 
                  text={props.canvasProps.variables.time.format}
                  name={"time"}
                  hide={props.hiddenCanvasElements.includes("time")}
                  alignment={props.alignment}
                  settings={getModCanvasProps().variables.time}  
                  canvasProps={props.canvasProps}
                  updateCanvasProps={props.updateCanvasProps}
                  filterOrientationType={filterOrientationType}
                />
                <CanvasText 
                  text={
                    props.canvasProps.variables.freeformtext.text || 
                    freeformtext}
                  name={"freeformtext"}
                  hide={props.hiddenCanvasElements.includes("freeform")}
                  alignment={props.alignment}
                  settings={getModCanvasProps().variables.freeformtext}  
                  canvasProps={props.canvasProps}
                  updateCanvasProps={props.updateCanvasProps}
                  filterOrientationType={filterOrientationType}
                />
              </Layer>
          </Stage>
        </div>
    </div>
  );
}