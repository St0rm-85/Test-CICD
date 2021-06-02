import React, {useState, useEffect, useRef} from 'react';
import {getEnvironment, usePrevious} from '../../CommonFunctions';
import axios from 'axios';
import {Auth} from 'aws-amplify';

let deepAR;

const qaKey = 'd7e129fd9c96894f76988274260ede69a3d5f34d8f2dc0c2ef687b0bdc649d1c80c205caffe7797b';
const prodKey = '201c8925e1c1a9e47ae3e8d2906fba33851f3e0b1e15cbd2ade8c29fd3525200c807398deb430584';

export default function ARPreview(props) {
    
    const canvasRef = useRef();
    const prevSelectedBinaries = usePrevious(props.selectedArBinaries);

    const setDeepAREffects = () => {
        if(props.selectedArBinaries.length > 1) props.setIsARLoading(true);
        console.log("selectedbinaries: ", props.selectedArBinaries);
        let gdrive_binary_url = 'https://www.googleapis.com/drive/v3/files/{fileId}?supportsAllDrives=true&includeItemsFromAllDrives=true&mimeType=application/octet-stream&alt=media';
        props.selectedArBinaries.forEach((b, i) => {
            if(b.id) deepAR.switchEffect(0, `slot${i}`, gdrive_binary_url.replace("{fileId}", b.id), () => {
                if(i == props.selectedArBinaries.length-1) props.setIsARLoading(false)
            })
            else {deepAR.switchEffect(0, `slot${i}`, b.url, 
                    () => {
                        if(i == props.selectedArBinaries.length-1) props.setIsARLoading(false)
                    }
                )}
        })
    }
    const clearArBinaries = (count) => {
        let i = 0; 
        while(i < count) {
            deepAR.clearEffect(`slot${i}`);
            i += 1;
            if(i > 20) break;
        }
    }


    useEffect(()=>{
        if(!canvasRef.current || props.campaign.name !== "AR") return;
        deepAR = window.DeepAR({
            canvasWidth: props.canvasWidth || 500,
            canvasHeight: props.canvasHeight || 500,
            // licenseKey: '79fbad87721515553bf1c64464a02eaa027d63baccb3874e83ef53ebc89ca2c95fb405d43ee12be2',
            licenseKey: getEnvironment().includes('qa') ? qaKey : prodKey,
            canvas: canvasRef.current,
            numberOfFaces: 1,
            libPath: '/deepar_lib',
            segmentationInfoZip: 'segmentation.zip',
            onInitialize: function() {
                
              // start video immediately after the initalization, mirror = true
              deepAR.startVideo(true);
            //   deepAR.switchEffect(0, 'slot0', 'http://qa.cameraplus.co/CameraPlus/sys/s3/fs/retailers/0/276/frames/test_file33?id=345890', ()=>console.log("e"))
              setDeepAREffects();
            }
        })

        deepAR.downloadFaceTrackingModel('/deepar_lib/models-68-extreme.bin');
        
        return () => {
            deepAR.stopVideo();
            props.setSelectedDeepArVersion(null);
            props.setSelectedArBinaries([]);
        }
    
    }, [canvasRef]);

    useEffect(()=>{
        setDeepAREffects();
        if(props.selectedArBinaries.length == 0 && prevSelectedBinaries) clearArBinaries(prevSelectedBinaries.length);
    },[props.selectedArBinaries])

    return (
        <div style={{
                position: 'absolute',
                // width: "63.75vh", 
                // height: '85vh'
                width: props.canvasWidth + "px",
                height: props.canvasHeight + "px",
                // float: 'right',
                // right: '25px'
            }}
        >
            <canvas 
                id="deepar-canvas" 
                ref={canvasRef} 
                style={{
                    width: props.canvasWidth + "px",
                    height: props.canvasHeight + "px"
                }} 
            />
        </div>
    );
}