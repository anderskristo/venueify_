;(function () {
'use strict'

var Venue = {}
window.Venue = Venue

Venue.Config = {
  lfmHost     : 'http://ws.audioscrobbler.com/2.0/?method=geo.getevents&limit=20&location=',
  lfmKey      : '&api_key=6518e64bd342d4fee8ae6a478b71becb',
  lfmCb       : '&format=json&callback=?'
}

Venue.init = function () {
  Venue.updateCity()
}

Venue.map = function (data) {
  var lfmData = []  
  if (data.error) {
    alert(data.message)
  }
  $.each(data.events.event, function (index, item) {
    var locLat = item.venue.location['geo:point']['geo:lat']
    var locLong = item.venue.location['geo:point']['geo:long']
    lfmData.push({
      lat: parseFloat(locLat),
      long: parseFloat(locLong),
      artist: item.artists.artist,
      title: item.title,
      headliner: item.artists.headliner,
      date: item.startDate,
      venue: item.venue.name,
      city: item.venue.location.city,
      lastfm: item.url
    })
  })

  var cityGeo = lfmData[0] // Flytta till staden
  var myLatlng = new google.maps.LatLng(cityGeo.lat, cityGeo.long)
  var mapOptions = {
    zoom: 14,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions)
  var marker
  var infoBubble

  $.each(lfmData, function (index, item) {
    console.log(item)
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(item.lat, item.long),
      map: map,
      animation: google.maps.Animation.DROP,
      icon: '../assets/images/marker.png'
    })

    google.maps.event.addListener(marker, 'click', function () {
      if(infoBubble) {
        infoBubble.close()
      }
      if(item.artist instanceof Array) {
        var contentArtists = '<div class="bubble"><h4>' + item.title +
        '</h4><div class="info"><div class="loc"><span class="icon-location"></span><p>' + item.venue + ', ' + item.city +
        '</p></div><div class="date"><span class="icon-calendar"></span><p>' + item.date + '</p></div><div class="lfm"><span class="icon-lastfm"></span><a href="'+ item.lastfm +'" target="_BLANK">Event on LastFM</a></div></div>Attending artists:</br><div class="artists">' +
        item.artist.join('</br>') + '</div></br><div class="more"></div></br>'

        infoBubble = new InfoBubble ({
          map: map,
          position: new google.maps.LatLng(item.lat, item.long),
          content: contentArtists,
          shadowStyle: 0,
          backgroundColor: '#2c3e50',
          borderColor: '#15253C',
          borderWidth: 5,
          borderRadius: 5,
          minWidth: 300,
          maxWidth: 300
        })
        infoBubble.open(map, this)
      } else {
        var contentArtist = '<div class="bubble"><h4>' + item.title +
        '</h4><div class="info"><div class="loc"><span class="icon-location"></span><p>' + item.venue + ', ' + item.city +
        '</p></div><div class="date"><span class="icon-calendar"></span><p>' + item.date + '</p></div><div class="lfm"><span class="icon-lastfm"></span><a href="'+ item.lastfm +'" target="_BLANK">Event on LastFM</a></div></div>Attending artists:</br><div class="artists">' + item.artist + '</div></br><div class="more"></div></br>'

        infoBubble = new InfoBubble ({
          map: map,
          position: new google.maps.LatLng(item.lat, item.long),
          content: contentArtist,
          shadowStyle: 0,
          backgroundColor: '#2c3e50',
          borderColor: '#15253C',
          borderWidth: 5,
          borderRadius: 5,
          minWidth: 300,
          maxWidth: 300
        })
        infoBubble.open(map, this)
      }
    })
  })

} // map

google.maps.event.addDomListener(window, 'load', Venue.map)

Venue.search = function (location) {
  var config = Venue.Config
  var url = config.lfmHost + location + config.lfmKey + config.lfmCb
  $.getJSON(url, Venue.map)
}

Venue.updateCity = function () {
  $('form#search button').click(function () {
    var location = $('input#search-city').val()
    Venue.search(location)
    return false
  })
}

Venue.App = {
  search: Venue.search,
  init: Venue.init
}

})()

$(function () {
  Venue.App.init()
  Venue.App.search('Stockholm')
})
