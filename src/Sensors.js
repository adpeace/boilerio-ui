/*
 * Sensors are mostly separate in both the back and frontend so we
 * keep retrieval/handling of them separate from the main App class.
*/

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent,
    Table, TableHead, TableBody, TableRow, TableCell,
    makeStyles } from '@material-ui/core';
import axios from 'axios';

export default function SensorsCard(props) {
    const classes = makeStyles(theme => ({
        card: {
            marginTop: 10,
        },
        cardContent: {
            margin: 0,
        },
        cardHeader: {
            paddingBottom: 0,
        },
    }))();

    const [sensors, setSensors] = useState([]);
    const [sensorReadings, setSensorReadings] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                /* get sensors, then for each get the last readings */
                const result = await axios.get('api/sensor');
                setSensors(result.data);

                const readings = await Promise.all(result.data.map(async sensor => {
                        const lastResults = await axios.get('api/sensor/' + sensor.sensor_id + '/readings');
                        return lastResults.data.map(x => ({"sensor_id": sensor.sensor_id, ...x}));
                }));
                setSensorReadings([].concat.apply([], readings));
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, [props.refresh])

    const getReading = function(sensor_id, metric_type) {
        const match = sensorReadings.filter(reading => {
                return (reading.sensor_id === sensor_id) &&
                       (reading.metric_type === metric_type);
            });
        if (match.length === 1)
            return Math.round(match[0].value * 10) / 10;
        else
            return '---';
    }

    return (
        <Card className={classes.card}>
            <CardHeader title="Temperature readings" />
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Sensor</TableCell>
                            <TableCell align="right">Reading</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            sensors.map(sensor =>
                                (
                                    <TableRow key={sensor.sensor_id}>
                                        <TableCell>{sensor.name}</TableCell>
                                        <TableCell align="right">
                                            {getReading(sensor.sensor_id, 'temperature')}&deg;C
                                        </TableCell>
                                    </TableRow>
                                )
                            )
                        }
                    </TableBody>
                </Table>
        </Card>
    )
 }
