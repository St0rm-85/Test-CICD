import moment from 'moment-timezone';
import 'moment-jdateformatparser';
import {API} from 'aws-amplify';
import axios from 'axios';
import {useRef, useEffect} from 'react';

export function getAPICall(url, data, headers){
    let apiName = 'setupapi';
    let path = url.split(".cameraplus.co")[1] || url;
    let myInit = {body:data}
    let needsAmplify = window.location.origin.includes("localhost") || window.location.origin.includes("cameraplus.studio");
    if(!needsAmplify && !data) return axios.get(url);
    else if(!needsAmplify && !!data) return axios.post(url, data);
    else if(needsAmplify && !data) return API.get(apiName, path).then(r => ({data: r}));
    else if(needsAmplify && !!data) return API.post(apiName, path, myInit).then(r => ({data: r}));
}

export function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();
  
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export function getEnvironment(withSSL){
  let {location: {host}} = window;
  let pre = !!withSSL ? "https" : "http";
  if(host == "cameraplus.studio") return `https://prod`;
  else return `${pre}://qa`;
}

export function getEnvironmentCampaignIds() {
  let {location: {host}} = window;
  if(host == "cameraplus.studio") return {carousel: 615, global: 571, ar: 719}
  else return {carousel: 258, global: 237, ar: 276}
}

export const parseStringToInt = v => v == "" ? 0 : parseInt(v); 

export function applySchedActiveStatus(data){
  data.forEach(x => {
    if(!x.job) x.active_status = x.active;
    else x.active_status = x.active + 2;
  })
  return data;
}

export function getStatusFilterStatement(filters){
  if(!filters[0]) return {};
  let value = filters[0].value[0];
  // 0 = inactive, 1 = active, 2 = scheduled inactive, 3 = scheduled active
  if(value == 0) return {active: 0, jobFlag: 0};
  if(value == 1) return {active: 1, jobFlag: 0};
  if(value == 2) return {active: 0, jobFlag: 1};
  if(value == 3) return {active: 1, jobFlag: 1};
  return {active: "", jobFlag: ""};
}

export function verifyDates(start, end, job={start_cron_expression:""}, startDateValidation=true){
  if(job.start_cron_expression == "") return true;
  if(!job.start_cron_expression.includes("*") && !!startDateValidation) verifyStart(start);
  if(start > end){
    throw {
      type: ["start_date", "end_date", "start_time", "end_time"], 
      message: "Start Date Must be Less Than End Date"
    }
  }
  else return true;
}

export function verifyStart(start){
  if(start < moment().format()){
    throw {
      type: ["start_date", "start_time"], message: "Start Date Must Be Greater Than Current Date"
    }
  }
  else return true;
}

export function getRepeatEveryValue({job}){
    if(!job) return "";
    if(job.start_cron_expression.includes("/")) return "daily";
    if(job.start_cron_expression.includes("? *")) return "weekly";
    if(job.start_cron_expression.includes("* ?")) return "monthly";
    if(job.start_cron_expression.split(" ").length == 6) return "yearly";
    return "noRepeat"
  }
  
export function getRepeatDayValue({job}){
  if(!job) return null;
  let index = job.start_cron_expression.indexOf("/") + 1;
  if(index == 0) return null;
  return parseInt(job.start_cron_expression.substr(index, 2));
}

export function getRepeatWeeklyValue({job}){
  if(!job) return { Mon: false, Tues: false, Wed: false, Thur: false, Fri: false, Sat: false, Sun: false };
  let day_map = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];
  let days = job.start_cron_expression.split(" ").slice(-1)[0].split(",");
  return day_map.map((x, i) => days.includes(i + 1 + "") ? {[x]:true} : {[x]: false}).reduce((a, c) => Object.assign(a, c), {})
}

export function getRepeatDayNames({job}){
  let day_map = {1: 'Sun', 2: 'Mon', 3: 'Tues', 4: 'Wed', 5: 'Thurs', 6: 'Fri', 7: 'Sat'}
  let days = job.start_cron_expression.split(" ").slice(-1)[0].split(",").map(x => day_map[x]);
  return days.join();
}

  export function readUploadedImage(file){
    return new Promise(function(resolve, reject){
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        // convert image file to base64 string
       resolve(reader.result);
      }, false);
  
      // if (file) {
        reader.readAsDataURL(file);
    //   }
    })
  }

  export function formatGoogleLocationData(locationType, locationDetails){
    let data;
    if(locationType == 'cities'){
      data = {
        "city_name":locationDetails[0].long_name,
        "city_code":locationDetails[0].short_name,
        "state_name":locationDetails[2].long_name,
        "state_code":locationDetails[2].short_name,
        "country_name":locationDetails[3].long_name,
        "country_code":locationDetails[3].short_name,
        "location_type":"city",
        "location_name":locationDetails[0].long_name
      }
    }else if(locationType == 'zipCodes'){
      data = {
        "zipcode":locationDetails[0].long_name,
        "city_name":locationDetails[1].long_name,
        "city_code":locationDetails[1].short_name,
        "state_name":locationDetails[3].long_name,
        "state_code":locationDetails[3].short_name,
        "country_name":locationDetails[4].long_name,
        "country_code":locationDetails[4].short_name,
        "location_type":"zipcode",
        "location_name":locationDetails[0].long_name
      }
    }else if(locationType == 'countries'){
      data = {
        "country_name":locationDetails[0].long_name,
        "country_code":locationDetails[0].short_name,
        "location_type":"country",
        "location_name":locationDetails[0].long_name
      }
    }else if(locationType == 'states'){
      data = {
        "state_name":locationDetails[0].long_name,
        "state_code":locationDetails[0].short_name,
        "country_name":locationDetails[1].long_name,
        "country_code":locationDetails[1].short_name,
        "location_type":"state",
        "location_name":locationDetails[0].long_name
      }
    }
    return data;
  }

  export function turnBase64ToImg(base64){
    console.log("base64: ", base64);
    return new Promise((resolve, reject) => {
      let image = new Image();
        image.onload = function() {
          console.log("in onload");
          resolve(image);
        };
        image.src = base64;
    })
  }

  export async function imageToDataUri(img, width, height, needsOffset) {
    console.log("in image to data uri")
    console.log("img: ", img);
    if(!(img instanceof Image) && !(img instanceof HTMLCanvasElement)) img = await turnBase64ToImg(img); 
    console.log("after image to base 64")
    // create an off-screen canvas
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        offset = needsOffset ? -200 : 0;

    // set its dimension to target size
    canvas.width = width;
    canvas.height = height;

    console.log("image to base 64");
    // draw source image into the off-screen canvas:
    ctx.drawImage(img, offset, 0, width, height);
    // ctx.drawImage(img, 120, 0, width, height, 0, 0, width, height);
    // var image = new Image();
    // image.src = canvas.toDataURL();
    // encode image to data-uri with base64 version of compressed image
    console.log("canvas to dataurl: ", canvas.toDataURL());
    return canvas.toDataURL();
}

export function getCanvasElementsToHide(selectedFilter){
  let elements = ["city",  "freeform", "date", "time"];
  if(selectedFilter.movable == 1) elements = ["date", "time"];
  // else if() elements.push("sticker");
  return ["date", "time"];
}

export function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r, g, b) {
  if(!r && !g && !b) return false;
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


//************** These are the original functions */
// export function getXOffset({alignment: user_alignment, canvasProps, filterOrientationType}){
// //props alignment here broken 
  
//   const {settings: {type, alignment}} = canvasProps;
//   let scale = 1; 
//     if(user_alignment == "horizontal" && filterOrientationType == "vertical") scale = .75;
//     else if(user_alignment == "vertical" && filterOrientationType == "horizontal") scale = 1/.75;
//   if(type == 0 || type == 1) return 0;
//   else if(type == 3 && user_alignment == 'vertical') return 0 - ((window.innerWidth*.893 - window.innerWidth*.673) / (2 / alignment));
//   else if(type == 2 && user_alignment == 'horizontal') return 0 + ((window.innerWidth*.893 * scale - window.innerWidth*.673 * scale) / (2 / alignment));
//   return 0;
// }

// export function getYOffset({alignment: user_alignment, canvasProps, filterOrientationType}){
//   const {settings: {type, orienation}} = canvasProps;
//   let scale = 1; 
//     if(user_alignment == "horizontal" && filterOrientationType == "vertical") scale = .75;
//     else if(user_alignment == "vertical" && filterOrientationType == "horizontal") scale = 1/.75;
//   if(type == 0 || type == 1) return 0;
//   else if(type == 3 && user_alignment == 'vertical') return ((window.innerWidth*.893 - window.innerWidth*.673) / (2 / orienation));
//   else if(type == 2 && user_alignment == 'horizontal') return -1 * ((window.innerWidth*.893 * scale - window.innerWidth*.673 * scale) / (2 / orienation));
//   return 0;
// }

const adjustForInfinity = v => isFinite(v) ? v : 0;

export function getXOffset({alignment: user_alignment, canvasProps, filterOrientationType}){
    const {settings: {type, alignment}} = canvasProps;
    let scale = 1; 
    if(type == 0 || type == 1) return 0;
    else if(type == 3 && user_alignment == 'vertical') return 0 - adjustForInfinity((2 / alignment));
    else if(type == 2 && user_alignment == 'horizontal') return 0 + ((window.innerWidth*.893 - window.innerWidth*.673) / (2 / alignment));
    return 0;
  }
  
  export function getYOffset({alignment: user_alignment, canvasProps, filterOrientationType}){
    const {settings: {type, orienation}} = canvasProps;
    let scale = 1; 
    if(type == 0 || type == 1) return 0;
    else if(type == 3 && user_alignment == 'vertical') return 1 * adjustForInfinity((2 / orienation));
    else if(type == 2 && user_alignment == 'horizontal') return -1 * ((window.innerWidth*.893 - window.innerWidth*.673) / (2 / orienation));
    return 0;
  }

export function transformCanvasProps(canvasProps, filterOrientationType, alignment, x_factor, y_factor, d){
  let direction = d == "back" ? -1 : 1;
  let scale = 1;
  if(alignment == "horizontal" && filterOrientationType == "vertical") scale *= .75; 
  if(alignment == "vertical" && filterOrientationType == "horizontal") scale *= 1/.75;

  let variables = ["city", "date", "freeformtext", "time"];
  variables.forEach(v => {
    canvasProps.variables[v].x *= scale;
    canvasProps.variables[v].y *= scale;
    canvasProps.variables[v].x += x_factor;
    canvasProps.variables[v].y += y_factor;
    // canvasProps.variables[v].y -= parseInt(canvasProps.variables[v].textSize) * .75 / 2;
    canvasProps.variables[v].length *= scale;
    canvasProps.variables[v].textSize *= scale;
  })

  // if(!!canvasProps.upload_images.sticker){
  //   canvasProps.upload_images.sticker.x /= (canvas_width / dest_canvas_width);
  //   canvasProps.upload_images.sticker.y /= (canvas_width / dest_canvas_width) * scale;
  // }
  canvasProps.upload_images.positionedImage.x *= scale;
  canvasProps.upload_images.positionedImage.x += (x_factor * direction);
  canvasProps.upload_images.positionedImage.y *= scale;
  canvasProps.upload_images.positionedImage.y += (y_factor * direction);

  if(!canvasProps.upload_images.sticker){
    canvasProps.upload_images.sticker = canvasProps.upload_images.positionedImage;
  }else {
    canvasProps.upload_images.sticker.x *= scale;
    canvasProps.upload_images.sticker.x += (x_factor * direction);
    canvasProps.upload_images.sticker.y *= scale;
    canvasProps.upload_images.sticker.y += (y_factor * direction);
  }


  return canvasProps;
}

//scaleCanvasProps, scaleDownloadedCanvasProps, and scaleCanvasPropsForUploaded can be optimized and merged
export function scaleCanvasProps(canvasProps, factor){
  let variables = ["city", "date", "freeformtext", "time"];
  variables.forEach(v => {
    canvasProps.variables[v].x *= factor;
    canvasProps.variables[v].y *= factor;
    // canvasProps.variables[v].y -= parseInt(canvasProps.variables[v].textSize) * .75 / 2;
    canvasProps.variables[v].length *= factor;
  })
  canvasProps.upload_images.positionedImage.x *= factor;
  canvasProps.upload_images.positionedImage.y *= factor;

  if(!canvasProps.upload_images){
    canvasProps.upload_images = canvasProps.upload_images.positionedImage
  }else{
    canvasProps.upload_images.sticker.x *= factor;
    canvasProps.upload_images.sticker.y *= factor;
  }
  return canvasProps;
}

export function scaleDownloadedCanvasProps(canvasProps){
  let canvas_width = window.innerHeight*.6375;
  let dest_canvas_width = 1080;
  let scale = canvasProps.settings.type == 3 || canvasProps.settings.type == 1 ? .56 : 1;
  let variables = ["city", "date", "freeformtext", "time"];
  if(canvasProps.variables.date.format.includes("d") || canvasProps.variables.date.format.includes("y")){
    canvasProps.variables.date.format = moment().toMomentFormatString(canvasProps.variables.date.format);
  }
  variables.forEach(v => {
    canvasProps.variables[v].length *= canvas_width / dest_canvas_width;
    canvasProps.variables[v].x *= (canvas_width / dest_canvas_width);
    if(canvasProps.variables[v].alignment == "center") canvasProps.variables[v].x -= canvasProps.variables[v].length/2;
    if(canvasProps.variables[v].alignment == "right") canvasProps.variables[v].x -= canvasProps.variables[v].length;
    canvasProps.variables[v].y *= (canvas_width / dest_canvas_width) * scale;
    canvasProps.variables[v].y -= parseInt(canvasProps.variables[v].textSize) * .25 / 2 * scale;
  })
  canvasProps.upload_images.positionedImage.x *= (canvas_width / dest_canvas_width);
  canvasProps.upload_images.positionedImage.y *= (canvas_width / dest_canvas_width) * scale;

  if(!!canvasProps.upload_images.sticker){
    canvasProps.upload_images.sticker.x *= (canvas_width / dest_canvas_width);
    canvasProps.upload_images.sticker.y *= (canvas_width / dest_canvas_width) * scale;
  }else if(!!canvasProps.upload_images.positionedImage && !canvasProps.upload_images.sticker){
    // canvasProps.upload_images.sticker.x = canvasProps.upload_images.positionedImage.x;
    // canvasProps.upload_images.sticker.y = canvasProps.upload_images.positionedImage.y;
  }
  return canvasProps;
}

export function scaleCanvasPropsForUpload(canvasProps){
  let canvas_width = window.innerHeight*.6375;
  let dest_canvas_width = 1080;
  let scale = canvasProps.settings.type == 3 || canvasProps.settings.type == 1 ? .56 : 1;
  canvasProps.variables.date.format = moment().toJDFString(canvasProps.variables.date.format);
  let variables = ["city", "date", "freeformtext", "time"];
  variables.forEach(v => {
    canvasProps.variables[v].length /= canvas_width / dest_canvas_width;
    canvasProps.variables[v].x /= (canvas_width / dest_canvas_width);
    if(canvasProps.variables[v].alignment == "center") canvasProps.variables[v].x += canvasProps.variables[v].length/2;
    if(canvasProps.variables[v].alignment == "right") canvasProps.variables[v].x += canvasProps.variables[v].length;
    canvasProps.variables[v].y /= (canvas_width / dest_canvas_width) * scale;
    canvasProps.variables[v].y += parseInt(canvasProps.variables[v].textSize) * .75 / 2 * scale;

    let x_string = Math.floor(canvasProps.variables[v].x) + "";
    let y_string = Math.floor(canvasProps.variables[v].y) + "";
    let length_string = Math.floor(canvasProps.variables[v].length) + "";
    canvasProps.variables[v].x = x_string;
    canvasProps.variables[v].y = y_string;
    canvasProps.variables[v].length = length_string;
  })
  canvasProps.upload_images.positionedImage.x /= (canvas_width / dest_canvas_width);
  canvasProps.upload_images.positionedImage.y /= (canvas_width / dest_canvas_width) * scale;

  if(!!canvasProps.upload_images.sticker){
    canvasProps.upload_images.sticker.x /= (canvas_width / dest_canvas_width);
    canvasProps.upload_images.sticker.y /= (canvas_width / dest_canvas_width) * scale;
  }
  canvasProps.upload_images.positionedImage.x = "" + parseInt(canvasProps.upload_images.positionedImage.x);
  canvasProps.upload_images.positionedImage.y = "" + parseInt(canvasProps.upload_images.positionedImage.y);
  
  if(!canvasProps.upload_images.sticker){
    canvasProps.upload_images.sticker = canvasProps.upload_images.positionedImage;
  }else{
    canvasProps.upload_images.sticker.x = "" + parseInt(canvasProps.upload_images.sticker.x);
    canvasProps.upload_images.sticker.y = "" + parseInt(canvasProps.upload_images.sticker.y);
  }
  return canvasProps;
}

export function setFrameContentType(selectedFilter, content_type, setSelectedFilter){
  let nextSelectedFilter = JSON.parse(JSON.stringify(selectedFilter));
  nextSelectedFilter.frame_content_type = content_type;
  setSelectedFilter(nextSelectedFilter);
}

export function readFileAsDataURL(file) {
  console.log("in read file as data url: ", file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", function () {
      // convert image file to base64 string
      console.log("in load");
      resolve(reader.result.split("base64,")[1]);
    }, false);
  
    if (file) {
      reader.readAsDataURL(file);
    }
  })
}