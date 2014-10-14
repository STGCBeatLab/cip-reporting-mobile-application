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
  CIPAPI.reportstore = {};

  var log = log4javascript.getLogger("CIPAPI.reportstore");

  // Store a report  
  CIPAPI.reportstore.storeReport = function(reportData) {
    var storageKey = 'CIPAPI.reportstore.' + CIPAPI.credentials.getCredentialHash();
    
    var reportStore = null;
    try {
      reportStore = JSON.parse(localStorage.getItem(storageKey));
      if (!Array.isArray(reportStore)) reportStore = new Array();
    } catch(e) {
      reportStore = new Array();
    }

    reportStore.push(reportData);
    localStorage.setItem(storageKey, JSON.stringify(reportStore));

    log.debug("Stored new report");
    
    // Let the world know...
    $(document).trigger('cipapi-reportstore-add');
    $(document).trigger('cipapi-reportstore-change');
  }

  // Get the number of stored reports  
  CIPAPI.reportstore.getNumberOfStoredReports = function() {
    var storageKey = 'CIPAPI.reportstore.' + CIPAPI.credentials.getCredentialHash();
    
    var reportStore = null;
    try {
      reportStore = JSON.parse(localStorage.getItem(storageKey));
      if (!Array.isArray(reportStore)) reportStore = new Array();
    } catch(e) {
      reportStore = new Array();
    }
    
    if (reportStore.length > 0) {
      log.debug("Total stored reports: " + reportStore.length);
    }
    
    return reportStore.length;
  }

  // Try and send any stored reports
  CIPAPI.reportstore.sendReports = function() {
    // Do not send if we have no reports to send
    if (CIPAPI.reportstore.getNumberOfStoredReports() == 0) {
      return;
    }

    // Do not send if we do not have verified credentials
    if (!CIPAPI.credentials.areValid()) {
      log.debug("No validated credentials");
      return;
    }
    
    // Only send if the REST engine is idle
    if (!CIPAPI.rest.isIdle()) {
      log.debug("REST engine is not idle");
      return;
    }
    
    var storageKey = 'CIPAPI.reportstore.' + CIPAPI.credentials.getCredentialHash();

    function sendNextReport() {
      // Go get the store
      var reportStore = null;
      try {
        reportStore = JSON.parse(localStorage.getItem(storageKey));
        if (!Array.isArray(reportStore)) reportStore = new Array();
      } catch(e) {
        reportStore = new Array();
      }
      
      // Make sure there is still work to do
      if (reportStore.length == 0) {
        log.debug("No more reports to send");
        return;
      }

      // Compose into form data
      var formData = new FormData();
      $.each(reportStore[0].serializedData, function(key, val) {
        log.debug('Adding form value: ' + key + ' -> ' + val);
        formData.append(key, val);
      });

      // Add in images which were serialized
      $.each(reportStore[0].serializedImages, function(index, stored) {
        log.debug('Adding image: ' + stored.fileName + ' (' + stored.mimeType + ')');
        formData.append("file[]", CIPAPI.forms.b64toBlob(stored.b64Content, stored.mimeType), stored.fileName);
      });
      
      // Fire away
      CIPAPI.rest.post({
        url: reportStore[0].destinationURL,
        data: formData,
        success: function(response) {
          log.debug("Report sent");
          
          // Remove the report from the report store
          reportStore.shift();
          localStorage.setItem(storageKey, JSON.stringify(reportStore));
          
          // Let the world know...
          $(document).trigger('cipapi-reportstore-remove');
          $(document).trigger('cipapi-reportstore-change');
          
          // And do it again... or NOT
          if (reportStore.length > 0) {
            sendNextReport();
          } else {
            $(document).trigger('cipapi-reportstore-empty');
          }
        }
      });
    }
    
    sendNextReport(); // Kick it off!
  }
  
})(window);
