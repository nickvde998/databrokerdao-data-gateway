const coords = require('../util/coords');

const DELIMITER = '!#!';

function createLuftDatenSensorListing(payload) {
  // Temporarily move about 1/3 of the sensors which are not located in belgium to china
  if (!coords.inBelgium(payload)) {
    if (Math.random() <= 0.33) {
      const coord = coords.getRandomCoordInChina();
      payload.lat = coord.lat;
      payload.lon = coord.lon;
      console.log(`SENSOR located in china (${payload.lon},${payload.lat})`);
    } else {
      console.log(`SENSOR located at (${payload.lon},${payload.lat})`);
    }
  } else {
    console.log(`SENSOR located in belgium (${payload.lon},${payload.lat})`);
  }

  let type;
  let name;
  let priceInDtx;
  let stakeInDtx;

  // 1 DTX should be about 1 week's worth of data
  // .5e-6 DTX should be about 1 second's worth of data
  // 400 DTX should be an average stake amount
  if (false && typeof payload.pressure !== 'undefined') {
    type = 'pressure';
    name = `Luftdaten Press ${payload.sensor_id}`;
    delete payload.temperature;
    delete payload.humidity;
    priceInDtx = 0.45 * 10 ** -6;
    stakeInDtx = 400;
  } else if (typeof payload.temperature !== 'undefined') {
    if (Math.round(Math.random()) === 1) {
      type = 'temperature';
      name = `Luftdaten Temp ${payload.sensor_id}`;
      delete payload.humidity;
    } else {
      type = 'humidity';
      name = `Luftdaten Hum ${payload.sensor_id}`;
      delete payload.temperature;
    }
    priceInDtx = 0.55 * 10 ** -6;
    stakeInDtx = 500;
  } else if (typeof payload.P1 !== 'undefined') {
    if (Math.round(Math.random()) === 1) {
      type = 'PM25';
      name = `Luftdaten PM2.5 ${payload.sensor_id}`;
      delete payload.P1;
    } else {
      type = 'PM10';
      name = `Luftdaten PM10 ${payload.sensor_id}`;
      delete payload.P2;
    }
    priceInDtx = 0.5 * 10 ** -6;
    stakeInDtx = 450;
  } else {
    console.log('Could not find appropriate sensor type', payload);
    return null;
  }

  let sensor = {
    price: wDTX(priceInDtx).toString(),
    stakeamount: wDTX(stakeInDtx).toString(),
    metadata: {
      name: name,
      sensorid: `luftdaten${DELIMITER}${payload.sensor_id}${DELIMITER}${
        payload.sensor_type
      }`,
      geo: {
        lat: parseFloat(payload.lat),
        lng: parseFloat(payload.lon)
      },
      type: type,
      example: JSON.stringify(payload),
      updateinterval: 86400000,
      sensortype: 'STREAM'
    }
  };

  if (typeof sensor.metadata.sensorid === 'undefined') {
    return null;
  }

  return sensor;
}

function wDTX(dtx) {
  return dtx * 10 ** 18;
}

function createCityBikeNycSensorListing(name, payload, example) {
  return {
    price: '40',
    stakeamount: '1000',
    metadata: {
      name: `Citi Bike NYC ${payload.station_id}`,
      sensorid: `${name}${DELIMITER}${payload.station_id}${DELIMITER}station`,
      geo: {
        type: 'Point',
        coordinates: [parseFloat(payload.lon), parseFloat(payload.lat)]
      },
      type: 'station',
      example: JSON.stringify(example),
      updateinterval: 86400000
    }
  };
}

module.exports = {
  createLuftDatenSensorListing,
  createCityBikeNycSensorListing
};
