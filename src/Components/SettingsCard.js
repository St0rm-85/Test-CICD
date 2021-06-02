import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    maxWidth: "100%",
    marginBottom: "20px",
    borderTop: "1px",
    textAlign: "left"
  },
  media: {
    height: 140,
  },
});

export default function SettingsCard(props) {
  
    const classes = useStyles();

    return (
        <Card className={classes.root}>
        <CardContent>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
                {props.title}
            </Typography>
            {props.children}
        </CardContent>
        </Card>
    );
}