import React, { useState } from 'react';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardHeader, CardContent, Tooltip, Collapse,
         CardActions, TextField, Button,
         Grid } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import axios from 'axios';

import './App.css';

function BoilerDisplay(props) {
    const image = props.mode === "On" ? "blackflame.png" :
                  props.mode === "PWM" ? "greyflame.png" :
                  "noflame.png";
    const alt = props.mode === "On" ? "Heating on" :
                props.mode === "PWM" ? "Maintaining temperature" :
                "Heating off";
    return (
        <div className={props.className}>
            <Tooltip title={alt}>
                <img src={image} alt={alt} height="60"/>
            </Tooltip>
        </div>
    );
}

function TemperatureDisplay(props) {
    const classes = makeStyles({
        temperatureDisplay: {
            display: "inline-block",
            width: 160,
            color: props.displaytype === "target" ? "gray" : "black",
        },
    })();

    if (props.temp === null)
        return (<div className={classes.temperatureDisplay}>
            <Typography variant="h4">
                ?
            </Typography>
            <Typography>
                { props.reachin }
            </Typography>
        </div>)

    return (
        <div className={classes.temperatureDisplay}>
            <Typography variant="h4">
                { props.temp }&deg;C
            </Typography>
            <Typography>
                { props.reachin }
            </Typography>
        </div>
    );
}

function ConfigureOverride(props) {
    const [hours, setHours] = useState("");
    const [temp, setTemp] = useState("");

    const setOverrideClick = (ev) => {
        props.submitOverride(temp, hours);
    };

    const handleTempChange = (ev) => {
        ev.persist();
        setTemp(ev.target.value);
    };
    const handleDurationChange = (ev) => {
        ev.persist();
        setHours(ev.target.value);
    };

    return (
        <CardContent>
            <Typography>Configure override</Typography>
            <form>
                <Grid container justify="flex-start" alignItems="center" spacing={1}>
                    <Grid item xs><TextField
                        required name="temperature"
                        type="number"
                        margin="dense"
                        variant="filled" onChange={handleTempChange}
                        label="Target (&deg;C)"
                        /></Grid>
                    <Grid item xs> <TextField
                        required
                        type="number"
                        margin="dense"
                        variant="filled" onChange={handleDurationChange}
                        label="For (hrs)"
                    />
                    </Grid>
                    <Grid item>
                        <Button
                            onClick={setOverrideClick} 
                            color="primary" size="medium" variant="contained">
                            Set
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </CardContent>
    );
}

/**
 * Card for a heating zone.
 *
 * Expected properties:
 * - zoneId (int) ID of the zone
 * - name (string): Name of the zone
 * - timeToTarget (int, optional): Time until target is reach (in seconds)
 * - temp (float): Current temperature
 * - targetOverride (bool): Override in place?
 * - reload: () => (): called when server data changes
 */
export default function ZoneCard(props) {
    const classes = makeStyles(theme => ({
        card: {
            marginTop: 10,
        },
        cardHeader: {
            paddingBottom: 0,
        },
        boilerDisplay: {
            flexGrow: 1,
            textAlign: "right"
        },
        container: {
            display: "flex",
        },
        alertbox: {
            marginBottom: 10,
        }
    }))();

    /* Card expansion to show override */
    const [expanded, setExpanded] = useState(false);
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const clearOverride = async() => {
        try {
            const result = await axios.delete(
                'api/zones/' + props.zoneId + '/override');
            props.reload();
        } catch (error) {
        }
    };

    const submitOverride = async (temp, hours) => {
        const formData = new FormData();
        formData.set('temp', temp);
        formData.set('hours', hours);
        try {
            const result = await axios.post(
                'api/zones/' + props.zoneId + '/override',
                formData);
            props.reload();

            // close the override panel:
            setExpanded(false);
        } catch (error) {
        }
    };

    const reachin_text = props.timeToTarget ? "in " + Math.round(props.timeToTarget / 60) + " mins" : "target";

    return (
        <div>
            <Card className={classes.card}>
                <CardHeader className={ classes.cardHeader }
                  title={props.name}
                />
                <CardContent>
                    {
                        (props.temp === null ||
                            props.boilerState === "Unknown" ||
                            props.boilerState === "Stale")
                            ?
                                <Alert className={classes.alertbox} severity="warning">
                                This zone isn't currently operating.
                                If this problem persists, please check
                                sensor batteries and software.
                                </Alert>
                            : <></>
                      }
                    <div className={classes.container}>
                        <TemperatureDisplay temp={props.temp} reachin="current"/>
                        <TemperatureDisplay displaytype="target" temp={props.target} reachin={reachin_text}/>
                        <BoilerDisplay className={classes.boilerDisplay} mode={props.boilerState} />
                    </div>
                </CardContent>
                <Divider variant="fullWidth" />

                <Collapse in={props.targetOverride}>
                    <CardContent>
                        { props.targetOverride ? (
                            <Typography>
                                Override: {props.targetOverride.temp}&deg;C
                                until {(new Date(props.targetOverride.until)).toLocaleTimeString([],
                                            {hour: '2-digit', minute:'2-digit'})}
                            </Typography>
                          ) : (
                            <Typography>No override set</Typography>
                          ) }
                    </CardContent>
                    <Divider variant="fullWidth" />
                </Collapse>

                <Collapse in={expanded}>
                    <ConfigureOverride
                        submitOverride={submitOverride}/>
                    <Divider variant="fullWidth" />
                </Collapse>

                <CardActions disableSpacing>
                    {
                        props.targetOverride
                        ? ( <></> )
                        : (
                            <Button color="primary" onClick={handleExpandClick}>
                                {expanded ? "Cancel" : "Override"}
                            </Button>
                        )
                    }
                    {
                        props.targetOverride
                        ? (
                            <Button color="primary" onClick={clearOverride}>
                                Cancel Override
                            </Button>
                        )
                        : ( <></> )
                    }
                </CardActions>
            </Card>
        </div>
);
}
