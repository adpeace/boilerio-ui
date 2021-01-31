import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@material-ui/core';
import { Table, TableRow, TableHead, TableBody, TableCell, Button } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Tab, Tabs, TextField } from '@material-ui/core';
import { format } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';

import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers';

import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';


function ScheduleRow(props) {
    return (
        <TableRow>
            <TableCell>{props.time}</TableCell>
            <TableCell>{props.temp}&deg;C</TableCell>
            <TableCell padding="none">
                <IconButton onClick={props.deleteClick} aria-label="delete">
                    <DeleteIcon />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}

export default function HeatingSchedule(props) {
    const [day, setDay] = useState(0);
    const [newTime, setNewTime] = useState(new Date())
    const [newTemp, setNewTemp] = useState(0);

    const classes = makeStyles(theme => ({
        card: {
            marginTop: 10,
        },
        cardHeader: {
            paddingBottom: 0,
        },
    }))();
    const DayTab = withStyles(theme => ({
        root: {
            minWidth: 40,
        },
    }))(Tab);

    function tabClick(ev, newValue) {
        setDay(newValue);
    }

    function deleteClickGen(dow, time, zone) {
        return (ev) => {
            if (props.deleteEntry(dow, time, zone)) {
                props.reload();
            }
        }
    }

    function handleNewTemp(ev) {
        ev.persist();
        setNewTemp(ev.target.value);
    }

    function newEntryClick(ev) {
        if (props.newEntry(day, format(newTime, 'HH:mm'), newTemp, props.zoneId))
            props.reload();
    }

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Card className={classes.card}>
                <CardHeader className={classes.cardHeader} title={props.name}/>
                <CardContent>
                    <Tabs variant="scrollable" scrollButtons="auto" value={day} indicatorColor="primary" textColor="primary" onChange={tabClick}>
                    {
                        [{l: 'Mo', v:0}, {l: 'Tu', v:1}, {l:'We', v:2}, {l:'Th', v:3},
                        {l: 'Fr', v:4}, {l: 'Sa', v:5}, {l:'Su', v:6}].map(weekday =>
                            <DayTab key={"day_" + weekday.v} label={weekday.l} value={weekday.v} />
                        )
                    }
                    </Tabs>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Time</TableCell>
                                <TableCell>Target</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                props.schedule.filter(entry => (entry.day === day))
                                    .map(entry => {
                                    return (
                                        <ScheduleRow
                                            key={"schedule_entry_" + entry.time}
                                            time={entry.time}
                                            temp={entry.temp}
                                            deleteClick={deleteClickGen(entry.day, entry.time, props.zoneId)}
                                        />
                                    )
                                })
                            }
                            <TableRow key="edit">
                                <TableCell>
                                    <KeyboardTimePicker
                                        id="time-picker"
                                        label="Time picker"
                                        value={newTime} onChange={setNewTime}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change time',
                                        }}
                                        />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        label="Temperature (&deg;C)"
                                        type="number"
                                        value={newTemp} onChange={handleNewTemp}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </TableCell>
                                <TableCell padding="none">
                                    <IconButton onClick={newEntryClick} color="primary">
                                        <AddIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </MuiPickersUtilsProvider>
    )
}