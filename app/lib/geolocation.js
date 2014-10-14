/*
 * CIP Reporting API Client Application
 *
 * Copyright (c) 2013 CIP Reporting
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms are permitted
 * provided that the above copyright notice and this paragraph are
 * duplicated in all such forms and that any documentation,
 * advertising materials, and other materials related to such
 * distribution and use acknowledge that the software was developed
 * by CIP Reporting.  The name of CIP Reporting may not be used to 
 * endorse or promote products derived from this software without 
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND WITHOUT ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 *
 */
(function(window, undefined) {

  if (typeof CIPAPI == 'undefined') CIPAPI = {};
  CIPAPI.geolocation = {};

  var log = log4javascript.getLogger("CIPAPI.geolocation");

  // Defaults...
  CIPAPI.geolocation.latitude         = '0';
  CIPAPI.geolocation.longitude        = '0';
  CIPAPI.geolocation.altitude         = '0';
  CIPAPI.geolocation.accuracy         = '0';
  CIPAPI.geolocation.altitudeAccuracy = '0';
  CIPAPI.geolocation.heading          = '0';
  CIPAPI.geolocation.speed            = '0';
  CIPAPI.geolocation.timestamp        = '0';
  
  // onSuccess - Accepts a Position object, which contains the current GPS coordinates
  var onSuccess = function(position) {
    CIPAPI.geolocation.latitude         = position.coords.latitude;
    CIPAPI.geolocation.longitude        = position.coords.longitude;
    CIPAPI.geolocation.altitude         = position.coords.altitude;
    CIPAPI.geolocation.accuracy         = position.coords.accuracy;
    CIPAPI.geolocation.altitudeAccuracy = position.coords.altitudeAccuracy;
    CIPAPI.geolocation.heading          = position.coords.heading;
    CIPAPI.geolocation.speed            = position.coords.speed;
    CIPAPI.geolocation.timestamp        = position.timestamp;
    
    log.debug("Position Updated: " + CIPAPI.geolocation.latitude + " / " + CIPAPI.geolocation.longitude);
    
    $(document).trigger('cipapi-geolocation-updated', position.coords);
  };

  // onError - Receives a PositionError object
  function onError(error) {
    log.error("Code " + error.code + ": " + error.message);
  }

  // Only hook in after core initialization
  $(document).on('cipapi-init', function() {
    if (window.cordova) {
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
  });
  
})(window);
