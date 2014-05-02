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
  CIPAPI.config = {};

  var log = log4javascript.getLogger("CIPAPI.config");

  var isLoaded = false;

  var defaultConfig = {};
  
  CIPAPI.config.setDefaults = function(config) {
    // Deep copies for all
    defaultConfig = jQuery.extend(true, {}, config);
    CIPAPI.config = jQuery.extend(true, {}, defaultConfig);
  }
  
  function loadConfig() {
    if (undefined !== CIPAPI.config.overrideIntegration) {
      log.debug("Loading config from server");
      CIPAPI.rest.GET({ 
        allow404: true, 
        url: '/api/versions/current/integrations/' + CIPAPI.config.overrideIntegration, 
        success: function(response) { 
          $.extend(CIPAPI.config, response.data.item[0].data);
          log.debug("Config merged");
        },
        complete: function() {
          isLoaded = true;
          $(document).trigger('cipapi-config-set');
          CIPAPI.router.validateMetadata();
        }
      });
    } else {
      isLoaded = true;
      $(document).trigger('cipapi-config-set');
    }
  }

  // Execute my veto power
  $(document).on('cipapi-metadata-validate', function(evt, validation) {
    log.debug("VETO: " + (isLoaded ? 'NO' : 'YES'));
    if (!isLoaded) {
      validation.validated = false;
    }
  });
  
  // Attempt to reload configuration every 5 minutes unless another interval is specified (recommend cipapi-timing-never to disable completely)
  $(document).on('cipapi-timer-tick', function(event, info) {
    var desiredTick = undefined === CIPAPI.config.reloadConfigInterval ? 'cipapi-timing-5min' : CIPAPI.config.reloadConfigInterval;
    if (desiredTick == info) {
      loadConfig();
    }
  });
  
  // Attempt to load configuration override on initialization if not disabled
  $(document).on('cipapi-init', loadConfig);

  // When credentials change reload current configuration override if not disabled
  $(document).on('cipapi-credentials-set', function() {
    CIPAPI.config = jQuery.extend(true, {}, defaultConfig);
    isLoaded = false;
    loadConfig();
  });
  
})(window);
