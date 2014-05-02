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
  CIPAPI.settings = {};

  var log = log4javascript.getLogger("CIPAPI.settings");

  var isLoaded = false;
  
  function loadSettings() {
    log.debug("Loading settings");
    CIPAPI.rest.GET({ 
      url: '/api/versions/current/facts/settings', 
      success: function(response) { 
        CIPAPI.settings = response.data.item[0].data;
        $(document).trigger('cipapi-settings-set');
        log.debug("Settings loaded");
        isLoaded = true;
      },
      complete: function() {
        CIPAPI.router.validateMetadata();
      }
    });
  }

  // Execute my veto power
  $(document).on('cipapi-metadata-validate', function(evt, validation) {
    log.debug("VETO: " + (isLoaded ? 'NO' : 'YES'));
    if (!isLoaded) {
      validation.validated = false;
    }
  });
  
  // Attempt to reload settings every 5 minutes unless another interval is specified (recommend cipapi-timing-never to disable completely)
  $(document).on('cipapi-timer-tick', function(event, info) {
    var desiredTick = undefined === CIPAPI.config.reloadSettingsInterval ? 'cipapi-timing-5min' : CIPAPI.config.reloadSettingsInterval;
    if (desiredTick == info) {
      loadSettings();
    }
  });

  // Attempt to load settings on initialization if not disabled
  $(document).on('cipapi-init', loadSettings);
  
  // When credentials change reload current settings if not disabled
  $(document).on('cipapi-credentials-set', function() {
    isLoaded = false;
    CIPAPI.settings = {};
    loadSettings();
  });
  
})(window);
