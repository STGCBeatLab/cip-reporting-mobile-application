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
  
  // Do we have a working credential set
  CIPAPI.credentials.areValid = function() {
    return null !== host && null !== user && null !== pass;
  }

  // Capture new credentials from login screen
  CIPAPI.credentials.set = function(credentials) {
    host = credentials.host;
    user = credentials.user;
    pass = credentials.pass;
    
    if (credentials.save) {
      localStorage.setItem("host", host);
      localStorage.setItem("user", user);
      localStorage.setItem("pass", pass);

      log.debug("Credentials set and saved");
    } else {
      localStorage.removeItem("host");
      localStorage.removeItem("user");
      localStorage.removeItem("pass");

      log.debug("Credentials set temporarily");
    }
      
    $(document).trigger('cipapi-credentials-set');
  }
  
  // Fetch credentials
  CIPAPI.credentials.get = function() {
    return { host: host, user: user, pass: pass };
  }

  // Clear credentials (logout)
  CIPAPI.credentials.reset = function() {
    host = null;
    user = null;
    pass = null;
    
    localStorage.removeItem("host");
    localStorage.removeItem("user");
    localStorage.removeItem("pass");

    log.debug("Credentials removed");
    $(document).trigger('cipapi-credentials-reset');
  }
  
})(window);

