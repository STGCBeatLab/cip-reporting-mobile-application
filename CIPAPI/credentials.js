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
  CIPAPI.credentials = {};

  var log = log4javascript.getLogger("CIPAPI.credentials");

  // Working credentials
  var host = localStorage.getItem("host");
  var user = localStorage.getItem("user");
  var pass = localStorage.getItem("pass");
  var validated = localStorage.getItem("validated") === "true";

  var rememberCredentials = false;
  
  // Verify the current credentials
  CIPAPI.credentials.verify = function() {
    // If previously validated just fire the events
    if (CIPAPI.credentials.areValid()) {
      $(document).trigger('cipapi-credentials-set');
      CIPAPI.router.validateMetadata();
      return;
    }
    
    CIPAPI.rest.GET({ 
      url: '/api/versions', 
      success: function(response) { 
        validated = true;
        if (rememberCredentials) localStorage.setItem("validated", true);
        $(document).trigger('cipapi-credentials-set');
        CIPAPI.router.validateMetadata();
      }
    });
  }

  // Do we have a working credential set
  CIPAPI.credentials.areValid = function() {
    return null !== host && null !== user && null !== pass && validated === true;
  }

  // Capture new credentials from login screen
  CIPAPI.credentials.set = function(credentials) {
    host = credentials.host;
    user = credentials.user;
    pass = credentials.pass;
    validated = false;

    rememberCredentials = credentials.save;
    
    if (rememberCredentials) {
      localStorage.setItem("host", host);
      localStorage.setItem("user", user);
      localStorage.setItem("pass", pass);
      localStorage.setItem("validated", false);

      log.debug("Credentials set and saved");
    } else {
      localStorage.removeItem("host");
      localStorage.removeItem("user");
      localStorage.removeItem("pass");
      localStorage.removeItem("validated");

      log.debug("Credentials set temporarily");
    }
    
    if (pass != '') {
      CIPAPI.credentials.verify();
    }
  }
  
  // Fetch credentials
  CIPAPI.credentials.get = function() {
    return { host: host, user: user, pass: pass, validated: validated };
  }

  // Clear credentials (logout)
  CIPAPI.credentials.reset = function() {
    host = null;
    user = null;
    pass = null;
    validated = false;

    localStorage.removeItem("host");
    localStorage.removeItem("user");
    localStorage.removeItem("pass");
    localStorage.removeItem("validated");
    
    log.debug("Credentials removed");
    $(document).trigger('cipapi-credentials-reset');
  }
  
  // Allow external scripts to pre-load API credentials to be used upon init
  CIPAPI.credentials.preload = function(credentials) {
    host = credentials.host;
    user = credentials.user;
    pass = credentials.pass;
    validated = true;
  }

  // Return a base64 encoded SHA-1 hash for the current credential set
  CIPAPI.credentials.getCredentialHash = function() {
    var credentials = CIPAPI.credentials.get();
    return CryptoJS.SHA1(credentials.host + credentials.user).toString(CryptoJS.enc.Base64);
  }

  // When the initialization event fires validate the credentials or go to login
  $(document).on('cipapi-init', function() { CIPAPI.credentials.verify(); });
  
})(window);
