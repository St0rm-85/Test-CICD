import axios from 'axios';
import moment from 'moment';
import {getAPICall, scaleDownloadedCanvasProps, scaleCanvasPropsForUpload, 
    getEnvironment,getEnvironmentCampaignIds, readFileAsDataURL} from '../CommonFunctions';

export function deleteCampaign(campaign_id){
    return getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/retailer/campaign/delete?campaign_id=${campaign_id}`);
}

export function deleteSponsor(sponsor_id){
    return getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/retailer/delete?id=${sponsor_id}`);
}

export async function setGDriveHeader(){
    getAPICall('/gauth')
    .then(r => {
        var o = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(){
            
            var res = o.apply(this, arguments);
            // var err = new Error();
            if(arguments[1].includes("/drive/v3/files/")) this.setRequestHeader('Authorization', `Bearer ${r.data.access_token}`);
            // else if(arguments[1].includes("sys/s3/fs/")) this.setRequestHeader('x-amz-security-token',  token);
            return res;
        }
    })
    .catch(err => console.log("gauth err: ", err))
}

export function getCampaigns(sponsor_id){
    return new Promise((resolve, reject) => {
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/retailer/campaign/list/?retailer_id=${sponsor_id}&active=0&app_type=LIV_HD_CAM`)
        .then(result => {
            resolve (result.data.response.items)
        })
        .catch(error => {
            console.log(error.response);
        });
    })
}

export function createCampaign({name, retailer_id}){
    return getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/retailer/campaign/save`, {
        name,
        retailer_id,
        campaignForApp:"LIV_HD_CAM",
        geoRadius:"1.0",
        startDate:"2016-01-01T00:00:00.000+0000",
        endDate:"2116-12-31T23:59:00.000+0000",
        active:1,
        optin_algorithm:1,
        optin_menu:1
    });
}

export function updateCampaign({name, optin_algorithm, optin_menu, active, campaign_id, job, text_header}){
    const start_date = !job ? null : job.start_date;
    const end_date = !job ? null : job.end_date;  
    return getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/retailer/campaign/save`, {
        name,
        campaignForApp:"LIV_HD_CAM",
        geoRadius:"1.0",
        startDate: start_date || "2016-01-01T00:00:00.000+0000",
        endDate: end_date || "2116-12-31T23:59:00.000+0000",
        campaign_id,
        active,
        optin_algorithm,
        optin_menu,
        job,
        text_header
    });
}

export function saveSponsor({active, address, city, country, enableDemo, name, state, zipCode, retailerId}){
    return getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/retailer/save`, {
        retailerId,
        active,
        address,
        city,
        contract_end: "2016-12-31T23:59:00.000+0000",
        contract_start: "2016-01-01T00:00:00.000+0000",
        country,
        enableDemo,
        name,
        state,
        zipCode
    });
}

export function getCampaignFilters(campaign_id){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/frame/links`, {
            frameAssociations:[
                {
                    entity_type_name: "campaign",
                    entity_id: campaign_id || getEnvironmentCampaignIds().carousel
                }
            ]
        })
        .then(result => {
            resolve(result.data.response.items);
        })
    })
}

export function getCarouselFilters(){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/frame/links`, {
            "frameAssociations": [
                {
                    "entity_type_name": "campaign",
                    "entity_id": getEnvironmentCampaignIds().carousel
                }
            ]
        })
        .then(result => {
            resolve(result.data.response.items);
        })
    })
}

export function saveFilter({name, frame_tags, frame_id, frame_type, job, 
    active, frame_content_type, movable, frameAssociations, optin_algorithm, optin_menu, frame_hint}){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/frame/save`, {
            name,
            frame_tags,
            frame_id,
            frame_type,
            active,
            optin_algorithm,
            optin_menu,
            frameAssociations,
            frame_content_type,
            job,
            frame_hint,
            movable
        }).then(r => resolve(r.data.response.data))
        .catch(err => reject(err));
    });
}

export function getCampaignLocationList(campaign_id){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/retailer/campaign/association/list?campaign_id=${campaign_id}`)
        .then(result =>{
            console.log("result: ", result);
            let campaign_locations = result.data.response.items.map(x => x.location);
            resolve(campaign_locations);
        })
        .catch(err => reject(err));
    })
}

export function getFonts(){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/sys/s3/fs/list/files/fonts?sort=0`)
        .then(result =>{
            let fonts = [];
            let head = document.head || document.getElementsByTagName('head')[0];
            result.data.response.items.forEach(x => {
                let name_ = x.name.split('.');
                fonts.push(name_[0]);
                let css = `@font-face { font-family: ${name_[0]};src: url('${getEnvironment().replace("http:", "https:")}.cameraplus.co/CameraPlus/sys/s3/fs/files/fonts/${x.name}') format('truetype')}`;

                let style = document.createElement('style');
                style.type = 'text/css';
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }
                head.appendChild(style);
            })
            resolve(fonts);
        })
    })
}

export function getCanvasProps(filter_id){
    return new Promise(function (resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/gc/sys/objblob/frame/${filter_id}/canvas_props?dt=${moment().format()}`)
        .then(r =>{
            let scaled_canvas_props = scaleDownloadedCanvasProps(r.data);
            resolve(scaled_canvas_props);
        } )
        .catch(err => reject(err));
    })
}

//Needs attention
export function saveCanvasProps(filter_id, data){
    return new Promise(function (resolve, reject){
        let data_cloned = JSON.parse(JSON.stringify(data));
        let props = scaleCanvasPropsForUpload(data_cloned);
        let tb_props = {frame: props.frame, ...props.photo_layer, sticker: props.upload_images.sticker, variables: props.variables}
        let one = getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/gc/sys/objblob/frame/${filter_id}/canvas_props`, props);
        let two = getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/gc/sys/objblob/frame/${filter_id}/tb_props`, tb_props);
        Promise.all([one, two])
        .then(r => {
            saveLastModified(filter_id);
            resolve(r.data)
        })
        .catch(err => reject(err));
    })
}


export function getLocationLinks(frame_id){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/frame/location/list`, {
            frame_id: frame_id,
            "frameAssociations":[
                {"entity_type_name":"location"}
            ]
        })
        .then(result => resolve(result.data.response.items))
    });
}

export function saveCampaignLocationAssociation(campaign_id, location_id){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/retailer/campaign/association/save`, [{campaign_id, location_id}])
        .then(result => resolve(result.data))
        .catch(err => reject(err));
    });
};

export function deleteCampaignLocationAssociation(campaign_id, location_id){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/retailer/campaign/association/delete?campaign_id=${campaign_id}&location_id=${location_id}`)
        .then(result => resolve(result.data))
        .catch(err => reject(err));
    });
    
}

export function saveLocation(data){
    // {"city_name":"New York","city_code":"New York","state_name":"New York","state_code":"NY","country_name":"United States","country_code":"US","location_type":"city","location_name":"New York"}
    // {"zipcode":"92604","city_name":"Irvine","city_code":"Irvine","state_name":"California","state_code":"CA","country_name":"United States","country_code":"US","location_type":"zipcode","location_name":"92604"}
    // {"country_name":"United States","country_code":"US","location_type":"country","location_name":"United States"}
    // {"state_name":"California","state_code":"CA","country_name":"United States","country_code":"US","location_type":"state","location_name":"California"}
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/location/save`, data)
        .then(r => resolve(r.data.response.data))
        .catch(err => reject(err))
    })
}

export function getLocationList(type){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/location/list`, {location_type: type})
        .then(r => resolve(r))
        .catch(err => reject(err))
    })
}

export async function testFormDataCall(binary){
    getAPICall(`/gauth?testDownload=true`)
}

export async function saveFilterImages(filter_id, images){
    console.log("in saveFilterImages")
    return new Promise(async function(resolve, reject){
        console.log("images: ", images);
        await Promise.allSettled(images
            .map((x, i) => getAPICall(`/upload?testUpload=true&path=gc%2Fsys%2Fobjblob%2Fframe%2F${filter_id}%2F${x.key}&content_type=image%2Fpng`, 
                {file: images[i].file.split("base64,")[1] || images[i].file }
            )));
        resolve();
    })
}

export async function saveThumbnailImage(filter_id, campaign_id, retailer_id, image){
    return new Promise(async function(resolve, reject){
        if(image.constructor != Array) image = [image];
        let calls = image.map(x => {
            let [base_64_prepend, image_data] = x.split("base64,");
            let content_type = base_64_prepend.includes("gif") ? "gif" : "png";
            return getAPICall(`/upload?testUpload=true&path=sys/s3/fs/retailers/${retailer_id}/${campaign_id}/frames/${filter_id}_thumb.${content_type}&content_type=image/${content_type}`, 
                {file: image_data}
            );
        })
        try {
            await Promise.allSettled(calls);
            resolve();
        }catch(err){
            reject();
        }
    })
}

export function saveAREffects(retailerId, campaignId, formData){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/sys/s3/fs/retailers/${retailerId}/${campaignId}/frames`, formData)
        .then(result => {
            resolve(result.status);
        })
        .catch(err => reject(err));
    })
    
}

export function deleteAREffect(retailerId, campaignId, filter_id, name){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/sys/s3/fs/delete/retailers/${retailerId}/${campaignId}/frames/${filter_id}_${name}`)
            .then(r => resolve(r.data))
            .catch(err => reject(err));
    })
}

export function saveARJSON(retailerId, campaignId, filter_id, json){
    console.log("args: ", arguments)
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/sys/s3/fs/retailers/${retailerId}/${campaignId}/frames/${filter_id}_scene_info.json`, json)
        .then(result => {
            resolve(result.status);
        })
        .catch(err => reject(err));
    })
}

export function getARJSON(retailerId, campaignId, filter_id){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/sys/s3/fs/retailers/${retailerId}/${campaignId}/frames/${filter_id}_scene_info.json`)
        .then(result => {
            console.log("result: ", result);
            let data = {deep_ar_version: result.data.deep_ar_version, scenes: []}
            result.data.scenes.forEach((b, i) => {
                console.log("b: ", b);
                getAPICall(`/upload?getPresigned=true&path=retailers/${retailerId}/${campaignId}/frames/${filter_id}_${b}`).then(x => {
                    console.log("x: ", x);
                    data.scenes.push({url: x.data.url, name: b});
                    if(data.scenes.length == result.data.scenes.length) resolve(data);
                })
                // ({name: b})
            })
            // resolve(result.data);
        })
        .catch(err => reject(err));
    })
}

export async function getStaticAssetPath(filter_id, type){
    console.log("in get static asset");
    return new Promise(async function(resolve, reject){
        let r = await getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/gc/sys/objinst/frame/${filter_id}/info`);
        if(r.data.response.code == 404) return "";
        let asset_result = await getAPICall(`/upload?getPresigned=true&path=BLOBS/${r.data.response.data.dir_name}/${filter_id}_${type}`)      
        resolve(asset_result.data.url);
    })
}

export function saveTemplateImage({retailer_id=0, campaign_id=0, frame_id, dataURL}){
    if(campaign_id == 237 || campaign_id == 571) campaign_id = 0;
    return new Promise(function(resolve, reject){
        getAPICall(`/upload?testUpload=true&path=sys/s3/fs/retailers/${retailer_id}/${campaign_id}/frames/${frame_id}_tb.png&content_type=image/png`, 
            {file: dataURL})
        // axios({
        //     method: 'POST',
        //     url: `${getEnvironment()}.cameraplus.co/CameraPlus/sys/s3/fs/retailers/${retailer_id}/${campaign_id}/frames/${frame_id}_tb.png`, 
        //     data: dataURL,
        //     headers: {"Content-Encoding": "base64", "Content-Type": "image/png"}
        // })
        .then(r => resolve(r.status))
        .catch(err => reject(err));
    })   
}

export async function loadFilterImage({filter_id, type, campaign_id=0, retailer_id = 0}){
    if(campaign_id == 237 || campaign_id == 571) campaign_id = 0;
    return new Promise(async function (resolve, reject){
        console.log("load filter image ti: ", type)
        let filter_url;
        if (type !== "template" && !type.includes("ti")) filter_url  = await getStaticAssetPath(filter_id, type);
        else if(type == "ti-png"){
            let result = await getAPICall(`/upload?getPresigned=true&path=sys/s3/fs/retailers/${retailer_id}/${campaign_id}/frames/${filter_id}_thumb.png`)
            filter_url = result.data.url;
        }else if(type == "ti-gif"){
            let result = await getAPICall(`/upload?getPresigned=true&path=sys/s3/fs/retailers/${retailer_id}/${campaign_id}/frames/${filter_id}_thumb.gif`)
            filter_url = result.data.url;
        }else if(type == "template") {
            let result = await getAPICall(`/upload?getPresigned=true&path=sys/s3/fs/retailers/${retailer_id}/${campaign_id}/frames/${filter_id}_tb.png`)
            filter_url = result.data.url;
        }
    
            axios.get(filter_url)
            .then(r => resolve(filter_url))
            .catch(err => reject(""));
        })
}

export function deleteFilter(filter_id){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/frame/delete?id=${filter_id}`)
            .then(r => resolve(r.data))
            .catch(err => reject(err));
    })
}

export function deleteFilterImage({filter_id, type, retailerId, campaignId}){
    return new Promise( function(resolve, reject){
        if(type == "ti"){
            Promise.allSettled([
                getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/sys/s3/fs/delete/retailers/${retailerId}/${campaignId}/frames/${filter_id}_thumb.png`),
                getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/sys/s3/fs/delete/retailers/${retailerId}/${campaignId}/frames/${filter_id}_thumb.gif`)
            ])
            .then(r => resolve(r))
            .catch(err => reject(err));
        }else{
            getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/gc/sys/objblob/frame/${filter_id}/${type}/delete?_=${moment().format()}`)
            .then(r => resolve(r.data))
            .catch(err => reject(err));
        }
       
    })
}

export function saveFrameAssociations({campaign_id, frame_id, selectedLocations: locations}){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/frame/association/save`, {
            campaign_id,
            frame_id,
            locations
        }).then(r => resolve(r))
        .catch(err => reject(err));
    })
}

export function updateGeolocationLinks({campaign_id, location_id, frames}){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/frame/association/save`, {
            campaign_id,
            location_id,
            frames
        })
        .then(r => resolve(r.data.response))
        .catch(err => reject(err));
    })
}

export function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}


export function saveLastModified(frame_id){
    return getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/frame/lastmodified/save?id=${frame_id}`);
}

export function materialTableCarouselFilters (query, applyChecked, campaignId){
    return new Promise((resolve, reject) => {
        let url = `${getEnvironment()}.cameraplus.co/CameraPlus/frame/links`
        url += '?size=' + query.pageSize
        url += '&from=' + (query.page * query.pageSize)
        url += '&keyword=' + query.search;
        getAPICall(url, {
            "frameAssociations": [
                {
                    "entity_type_name": "campaign",
                    "entity_id": campaignId || getEnvironmentCampaignIds().carousel
                }
            ]
        })
        .then(response => response.data)
        .then(result => {
            console.log("carouselfilters", applyChecked(query, result.response.items));
            resolve({
                data: applyChecked(query, result.response.items),
                page: query.page || 0,
                totalCount: result.response.total
            })
        })
    }
)}

export function getCarouselDetails(){
    return new Promise((resolve, reject)=> {
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/retailer/campaign/list` +
                    "?retailer_id=0&active=0&app_type=LIV_HD_CAM&keyword=LIV_HD_CAM_CAROUSEL")
        .then(r => resolve(r.data.response.items[0]))
        .catch(err => reject(err));
    })
}

export function materialTableCampaignLocationList(query, applyChecked, campaign_id){
    // let campaign_locations = result.data.response.items.map(x=> x.location);
    //         resolve(campaign_locations);
    return new Promise((resolve, reject) => {
        let url = `${getEnvironment()}.cameraplus.co/CameraPlus/retailer/campaign/association/list?campaign_id=${campaign_id}`
        url += '&size=' + query.pageSize
        url += '&from=' + (query.page * query.pageSize)
        url += '&keyword=' + query.search;
        getAPICall(url)
        .then(response => response.data)
        .then(result => {
            resolve({
                data: applyChecked(query, result.response.items.map(x=> x.location)),
                page: query.page || 0,
                totalCount: result.response.total
            })
        })
    })
}

export function materialTableSponsorList(query, applyChecked, campaign_id){
    // let campaign_locations = result.data.response.items.map(x=> x.location);
    //         resolve(campaign_locations);
    return new Promise((resolve, reject) => {
        let url = `${getEnvironment()}.cameraplus.co/CameraPlus/retailer/v2/list`
        url += '&size=' + query.pageSize
        url += '&from=' + (query.page * query.pageSize)
        url += '&keyword=' + query.search;
        getAPICall(url, {withDelete: false, withInActive: true})
        .then(response => response.data)
        .then(result => {
            resolve({
                data: applyChecked(query, result.response.items.map(x=> x.location)),
                page: query.page || 0,
                totalCount: result.response.total
            })
        })
    })
}


export function getLocationAssociations(data){
    return new Promise(function(resolve, reject){
        getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/frame/list`, data).then(r => {
            resolve(r.data.response.items);
        })
        .catch(err=> reject(err));
    });
}

export function getGDriveThumbnail(url){
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
                resolve(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    })
}


export function saveRanks(data){
    return getAPICall(`${getEnvironment()}.cameraplus.co/CameraPlus/frame/rank/update`, data)
}

export function getArEffects(){
    return axios.get('https://script.google.com/macros/s/AKfycbzS5rIs_OnjFRhjU-udkwhKkMPvxxOTC-Vt84br3GrCGU-oO8PEhr85ag/exec');
}

export function getArBinaries(effectId){
    return axios.get(
        `https://script.google.com/macros/s/AKfycbxXodexrymIWMNPOIQn07zxOtZNrnBAFZP9XQmYYOVpipqoRq8swkqyBvFGcYh715Bo_g/exec?effectId=${effectId}&getThumbnail=true`
    );
}