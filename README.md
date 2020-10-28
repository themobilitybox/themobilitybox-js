# @themobilitybox/themobilitybox

JavaScript Library to Access [The Mobilitybox](https://themobilitybox.com).

## Install

```
$ npm install @themobilitybox/themobilitybox
```

## Usage

```js
// Use your API key to validate the requests
const { Mobilitybox } = require('@themobilitybox/themobilitybox');
const api = new Mobilitybox("YOUR_API_KEY");

api.find_stations_by_name("Alexanderplatz", function (stations) {
  stations.forEach(function(station) {
    console.log(station.name);
  });
});
```
