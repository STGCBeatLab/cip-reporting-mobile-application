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
  CIPAPI.main = {};
  
  var log = log4javascript.getLogger("CIPAPI.main");

  // Navigating away from main, have my children clean up after themselves
  $(document).on('cipapi-unbind', function() {
    log.debug("Cleaning up my children");
    $(document).trigger('cipapi-unbind-main');
    $('div#main-content-area > *').remove();
  });
  
  // Hide splash screen when routed
  $(document).on('cipapi-routed', function(event, info) {
    if (window.cordova) {
      navigator.splashscreen.hide();
    }
  });

  // Main screen
  $(document).on('cipapi-handle-main', function(event, info) {
    var logoURL = CIPAPI.config.isPackaged ? './res/logo_mono_grey_thin.png' : '../../res/logo_mono_grey_thin.png';
  
    var html = '' +  
      '<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">' +
      '  <div class="navbar-header">' +
      '    <i id="navbar-network-access">' +
      '      <img id="cipapi-navbar-logo" src="' + logoURL + '" />' +
      '    </i>' +
      '    <i id="navbar-pending-reports" style="display: none;"><span class="glyphicon glyphicon-send"></span> <span id="navbar-pending-count">0</span> Pending</i>' +
      '    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">' +
      '      <span class="sr-only">Toggle navigation</span>' +
      '      <span class="icon-bar"></span>' +
      '      <span class="icon-bar"></span>' +
      '      <span class="icon-bar"></span>' +
      '    </button>' +
      '  </div>' +
      '  <div class="navbar-collapse collapse">' +
      '    <ul class="nav navbar-nav navbar-right">' +
      '      <li><a data-toggle="collapse" data-target=".navbar-collapse" href="#main!action=list"><span class="glyphicon glyphicon-list-alt"></span> Report List</a></li>' +
      '      <li><a data-toggle="collapse" data-target=".navbar-collapse" id="cipapi-server-synchronize" href="javascript: void(0)"><span class="glyphicon glyphicon-refresh"></span> Synchronize</a></li>' +
      '      <li><a data-toggle="collapse" data-target=".navbar-collapse" href="#logout"><span class="glyphicon glyphicon-log-out"></span> Sign Out</a></li>' +
      '      <li><a data-toggle="collapse" data-target=".navbar-collapse" href="#main!action=help"><span class="glyphicon glyphicon-question-sign"></span> Help</a></li>' +
      '    </ul>' +
      '  </div>' +
      '</div>' +
      '<div id="main-content-area"><form class="form-cip-reporting" role="form"></form></div>';
    
    $('div#container').html(html);

    $('a#cipapi-server-synchronize').on('click', function(evt) { $(document).trigger('cipapi-credentials-set'); });
    
    renderMainScreen(info);
    
    // Force an update of the reportstore monitor
    $(document).trigger('cipapi-reportstore-change');

    // Hide splash screen?
    $(document).trigger('cipapi-hide-splash-screen');
  });
  
  // Do some reports and stuff!
  $(document).on('cipapi-update-main', function(event, info) {
    renderMainScreen(info);
  });

  // Disable the back button on Android
  document.addEventListener("backbutton", function (e) { 
    var handler = CIPAPI.router.getCurrentHandler();
    var arguments = CIPAPI.router.getCurrentHandlerArguments();
    
    // Terminate the app on back button when on report list
    if (handler == 'main' && arguments[0].match(/^action=list/)) {
      e.preventDefault();
      navigator.app.exitApp();
      return;
    }
    
    // Terminate the app on login screen anywhere but on help
    if (handler == 'login' && !arguments[0].match(/^action=help/)) {
      e.preventDefault();
      navigator.app.exitApp();
      return;
    }
    
    // Any thing else, go back one page
    window.history.back();
  }, false );
  
  // Monitor for config changes and update button lists when displayed
  $(document).on('cipapi-mobile-forms-set', function(event, info) {
    if ($('div#main-content-area form div.form-button-list').length > 0) {
      // Clean up and re-draw buttons
      $('div#main-content-area form > *').remove();
      renderButtons(CIPAPI.config.apiForms);
    }
    
    // Kick off a report send attempt
    CIPAPI.reportstore.sendReports();
  });

  // Monitor for changes in the report store
  $(document).on('cipapi-reportstore-change', function(event, info) {
    var storedReports = CIPAPI.reportstore.getNumberOfStoredReports();
    
    $('span#navbar-pending-count').html(storedReports);
    
    if (storedReports == 0 && $('i#navbar-pending-reports').is(':visible')) {
      $('i#navbar-pending-reports').fadeOut();
    } else if (storedReports > 0 && !$('i#navbar-pending-reports').is(':visible')) {
      $('i#navbar-pending-reports').fadeIn();
    }
  });
  
  // Passively try and send reports
  $(document).on('cipapi-timer-tick', function(event, info) {
    var desiredTick = undefined === CIPAPI.config.sendReportsInterval ? 'cipapi-timing-1min' : CIPAPI.config.sendReportsInterval;
    if (desiredTick == info) {
      // Kick off a report send attempt
      CIPAPI.reportstore.sendReports();
    }
  });
  
  // Notification when all reports have been sent
  $(document).on('cipapi-reportstore-empty', function(event, info) {
    bootbox.dialog({
      message: "All pending reports have been successfully sent",
        title: "All Reports Sent",
      buttons: {
        success: {
              label: '<span class="glyphicon glyphicon-thumbs-up"></span> Success',
          className: "btn btn-lg btn-primary btn-custom",
        }
      }
    });
  });
  
  // Fired when the REST engine is active
  var activelySpinning = false;
  $(document).on('cipapi-rest-active', function(event, info) {
    $('#cipapi-navbar-logo').addClass('cipapi-logo-spin');

    // Do not re-spin when already spinning which keeps the rotation smooth for a full 360 degrees
    if (activelySpinning) {
      return;
    }
    
    var rotation = function() {
      var logo = $("img.cipapi-logo-spin");
      activelySpinning = logo.length == 1;
      
      logo.rotate({
        angle: 0, 
        animateTo: 360, 
        callback: rotation,
        easing: function(x, t, b, c, d) {
          // t: current time, b: begInnIng value, c: change In value, d: duration
          return c * (t / d) + b;
        }
      });
    }
    rotation();
  });
  
  // Fired when the REST engine is inactive
  $(document).on('cipapi-rest-inactive', function(event, info) {
    $('#cipapi-navbar-logo').removeClass('cipapi-logo-spin');
  });
  
  // Event to hide the splash screen if we are capable
  $(document).on('cipapi-hide-splash-screen', function(event, info) {
    if (!navigator) return;
    if (!navigator.splashscreen) return;
    if (!navigator.splashscreen.hide) return;
    
    navigator.splashscreen.hide();
  });
  
  // Helper to render the main screen from initial navigation and hash tag updates
  function renderMainScreen(info) {
    log.debug("Rendering main screen");
    
    // Clean up
    $('div#main-content-area form > *').remove();

    // Show button list
    if (info.params.action == 'list') {
      renderButtons(CIPAPI.config.apiForms);
    }
    // Show a form
    else if (info.params.action == 'form') {
      renderForm(info.params.form);
    }
    // Show help
    else if (info.params.action == 'help') {
      renderHelp();
    }
    // Navigate to the button list if all else fails
    else {
      CIPAPI.router.goTo('main', { action: 'list' });
    }
  }

  // Show the help screen
  function renderHelp() {
    log.debug("Rendering help");
    $('div#main-content-area form').append('' +
      '<div class="col-xs-12">' +
        CIPAPI.help.getHTML() +
      '</div>');
  }
  
  // Render form list
  function renderButtons(buttonCollection) {
    log.debug("Rendering form button collection");
    
    var header = '' +
      '<div class="col-xs-12">' +
      '  <h2>Submit a Report</h2>' +
      '  <span>To submit a report select and complete one of these available forms:</span>' +
      '</div>';
    $('div#main-content-area form').append(header);
    $('div#main-content-area form').append('<div class="form-button-list"></div>');
    
    $.each(buttonCollection, function(key, val) {
      var span = val.match(/^glyphicon/) ? '<span class="glyphicon ' + val + '"></span> ' : '';
      $('div#main-content-area form div.form-button-list').append('<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3" ><a data-form="' + key + '" class="btn btn-primary btn-lg btn-custom">' + span + key + '</a></div>');
    });
    
    $('div#main-content-area form div div a').each(function() {
      var btn = $(this);
      btn.click(function() {
        var btn = $(this);
        CIPAPI.router.goTo('main', { action: 'form', form: btn.attr('data-form') });
      });
    });
  }
  
  // Render a form
  function renderForm(formName) {
    log.debug("Rendering form button collection");
    
    if (typeof CIPAPI.mobileforms[formName] == 'undefined') {
      log.error("Form does not exist: " + formName);
      return;
    }

    // Make a deep copy
    var formDefinition = jQuery.extend(true, {}, CIPAPI.mobileforms[formName]);

    formDefinition.form.push({
           'type': 'submit',
          'title': 'Save Report',
      'htmlClass': 'cipform-save-report'
    });

    formDefinition.onSubmit = function(errors, values) {
      if (!errors) {
        // If formData object exists, we may have attachments injected into this sealed proxy object (modern browsers support ajax file upload this way).
        // if this exists, then we will submit it, not the value array.  If it does not exist, then we submit the value array old school.  However, the
        // value array holds the fields we want to post ultimately so we have to merge them into the formData object if defined.
        var formData = window.FormData ? new FormData() : false;
        
        if (formData) {
          $.each(values, function(key, val) {
            formData.append(key, val);
          });
        }

        // Store the report for transmission
        CIPAPI.reportstore.storeReport({
                formName: formName,
          serializedData: formData ? formData : values,
          destinationURL: '/api/versions/current/integrations/' + escape(formName)
        });
        
        // Kick off a report send attempt
        CIPAPI.reportstore.sendReports();
      
        // Go somewhere...
        CIPAPI.router.goTo('main', { action: 'list' });
      }
    }

    // Show me some form
    CIPAPI.forms.Render(formDefinition);

    // Need a clearfix between the submit button and form due to float and fixed changes in bootstrap depending on media size.
    // JSON forms doesn't provide a means to inject arbitrary HTML as needed for layout issues so we cram it in after rendering.
    $('<div class="clearfix"></div>').insertBefore($('input.cipform-save-report'));
    
    // Again due to lack of direct HTML control over JSON forms we basically hide the default submit button on the form and
    // inject our own proxy button which clicks by proxy.
    var proxySubmit = '' +
      '<a id="cipform-proxy-submit" class="btn btn-primary btn-lg btn-custom cipform-proxy-submit" href="javascript: void(0)">' +
      '  <span class="glyphicon glyphicon-save"></span>' +
      '  Save Report' +
      '</a>';
    
    $(proxySubmit).insertAfter($('input.cipform-save-report'));
    
    $('a#cipform-proxy-submit').on('click', function(evt) {
      $('input.cipform-save-report').click();
    });
  }

})(window);
