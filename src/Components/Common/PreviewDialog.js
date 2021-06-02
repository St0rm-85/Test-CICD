import React, {useState, useEffect} from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const getVerticalImage = (props) => {
  
  if(!props.stageRef.current) return "";
  return props.stageRef.current.toDataURL();
}

const getHorizontalImage = (props) => {
    let type = props.canvasProps.settings.type;
    if(!props.stageRef.current) return "";
    if(type == 2 || type == 3) return props.stageRef.current.toDataURL();
    return "";
}

const getVerticalImageStyles = (props) => {
    let type = props.canvasProps.settings.type;
    let alignment = props.canvasProps.settings.alignment;
    let orientation = props.canvasProps.settings.orienation;
    let top = '79px';
    let left = '15px';
    if(alignment == 2) left = "-60px";
    else if(alignment == 1) left = "-23px";
    if(orientation == 2) top = "151px";
    else if(orientation == 1) top = '115px';
    if(type == 0 || type == 2) return {height: '290px', position: 'absolute', top: '77px',left: '14px'}
    if(type == 3) return {height: '217px', position: 'absolute', top, left}
}

const getHorizontalImageStyles = (props) => {
    let type = props.canvasProps.settings.type;
    let top = "12px";
    let left = "78px";
    let alignment = props.canvasProps.settings.alignment;
    let orientation = props.canvasProps.settings.orienation;
    if(alignment == 2) left = "150px";
    else if(alignment == 1) left = "116px";
    if(orientation == 2) top = "-57px";
    else if(orientation == 1) top = '-23px';
    if(type == 2) return {height: '290px', position: 'absolute', top, left}
    else return {height: '217px', position: 'absolute', top: '12px', left: '78px'}
}

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);


export default function PreviewDialog(props) {

    const [verticalImage, setVerticalImage] = useState(getVerticalImage(props));
    const [horizontalImage, setHorizontalImage] =  useState(getHorizontalImage(props));

    useEffect(()=>{
        setTimeout(()=>{
            setVerticalImage(getVerticalImage(props));
            setHorizontalImage(getHorizontalImage(props));
        }, 100)
    }, [props.alignment, props.stageRef, props.dialogOpen]);

    return (
        <div>
            <Dialog onClose={props.handleCloseDialog} aria-labelledby="customized-dialog-title" maxWidth="xl" 
                    open={props.dialogOpen} >
                <DialogTitle id="customized-dialog-title" onClose={props.handleCloseDialog}>
                {props.dialogType}
                </DialogTitle>
                <DialogContent style={{minWidth: "600px", textAlign: 'center', padding: "50px"}} dividers>
                    <div className={props.canvasProps.settings.type == 1 && "hidden"}
                        style={{display: 'inline-block', height: '484px', width: '242px', 
                          position: 'relative', overflow: "hidden", background: props.background}}
                    >
                        <img style={getVerticalImageStyles(props)} src={verticalImage} />
                        <img style={{height: '484px', overflow: 'hidden', position: 'absolute', left: '0'}} src={process.env.PUBLIC_URL + "/Vertical_NeutralBG.png"} />
                    </div>
                    <div
                        className={props.canvasProps.settings.type == 0 && "hidden"}
                        style={{display: 'inline-block', height: '243px', width:'483px', marginLeft: '25px', verticalAlign: 'top',
                            position: 'relative', overflow: "hidden", background: props.background}}
                    >
                        <img style={getHorizontalImageStyles(props)} src={horizontalImage} />
                        <img style={{height: '243px', position: 'absolute', zIndex: 10, left: 0}} src={process.env.PUBLIC_URL + "/Horizontal_NeutralBG.png"} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}