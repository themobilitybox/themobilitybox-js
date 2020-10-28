const axios = require('axios');

class Mobilitybox {
  constructor(access_token, base_url = "https://api.themobilitybox.com/v1") {
    this.access_token = access_token;
    this.base_url = base_url;
  }

  find_stations_by_name(query, callback){
    axios.get(this.base_url+'/stations/search_by_name.json?query='+query)
      .then(response => callback(response.data.map((station_data)=> new MobilityboxStation(station_data, this))))
  }

  find_stations_by_position(position, callback){
    axios.get(this.base_url+'/stations/search_by_position.json?latitude='+position.latitude+'&longitude='+position.longitude)
      .then(response => callback(response.data.map((station_data)=> new MobilityboxStation(station_data, this))))
  }

  get_attributions(callback){
    axios.get(this.base_url+'/attributions.json')
      .then(response => callback(response.data))
  }

  get_trip(trip_id, callback){
    axios.get(this.base_url+'/trips/'+trip_id+'.json')
      .then(response => callback(new MobilityboxTrip(response.data, this)))
  }
}

class MobilityboxStation {
  constructor(station_data, mobilitybox) {
    this.id = station_data.id;
    this.name = station_data.name;
    this.mobilitybox = mobilitybox;
  }

  get_next_departures(callback, time = Date.now()) {
    axios.get(this.mobilitybox.base_url+'/departures.json?station_id='+this.id+'&time='+time)
      .then(response => callback(response.data.map((station_data)=> new MobilityboxDeparture(station_data, this.mobilitybox))))
  }
}

class MobilityboxDeparture {
  constructor(departure_parameters, mobilitybox) {
    this.mobilitybox = mobilitybox;

    this.id = departure_parameters.trip.id;

    this.departure_time = new MobilityboxEventTime(departure_parameters.departure)
    this.platform = departure_parameters.departure.platform;

    this.headsign = departure_parameters.trip.headsign;
    this.line_name = departure_parameters.trip.line_name;
    this.type = departure_parameters.trip.type;

    this.provider = departure_parameters.trip.provider;

  }
}

class MobilityboxEventTime {
  constructor(event_time_parameters, mobilitybox) {
    if(!event_time_parameters){
      this.scheduled_at = null;
      this.predicted_at = null;
    }else{
      this.scheduled_at = new Date(event_time_parameters.scheduled_at);
      this.predicted_at = new Date(event_time_parameters.predicted_at);
    }
  }

  scheduled_at_formated(){ return (!this.scheduled_at)?"":this._format_time(this.scheduled_at) };
  predicted_at_formated(){ return (!this.predicted_at)?"":this._format_time(this.predicted_at) };
  scheduled_at_date_formated(){ return (!this.scheduled_at)?"":this._format_date(this.scheduled_at) }

  _format_time(time){
    return ""+time.getHours()+':'+("00" + time.getMinutes()).slice (-2)
  }

  _format_date(time){
    return time.toLocaleDateString('de-DE');
  }
}

class MobilityboxTrip {
  constructor(trip_parameters, mobilitybox) {
    this.mobilitybox = mobilitybox;

    this.id = trip_parameters.id;
    this.name = trip_parameters.name;
    this.stops = trip_parameters.stops.map((stop_data)=> new MobilityboxStop(stop_data, this.mobilitybox));
  }

  date_formated(){
    var start_date_formated = this.stops[0].departure.scheduled_at_date_formated();
    var end_date_formated = this.stops[this.stops.length-1].arrival.scheduled_at_date_formated();

    if(start_date_formated === end_date_formated){
      return start_date_formated;
    }else{
      return ""+start_date_formated+" - "+end_date_formated;
    }
  }

  from_station(){
    return this.stops[0].station;
  }

  to_station(){
    return this.stops[this.stops.length-1].station;
  }
}

class MobilityboxStop {
  constructor(stop_parameters, mobilitybox) {
    this.mobilitybox = mobilitybox;

    this.station = new MobilityboxStation(stop_parameters.station);
    this.status = stop_parameters.status;
    this.departure = new MobilityboxEventTime(stop_parameters.departure);
    this.arrival = new MobilityboxEventTime(stop_parameters.arrival);
  }
}

module.exports = {
  Mobilitybox: Mobilitybox,
  MobilityboxDeparture: MobilityboxDeparture,
  MobilityboxStop: MobilityboxStop,
  MobilityboxEventTime: MobilityboxEventTime,
  MobilityboxTrip: MobilityboxEventTime
};
