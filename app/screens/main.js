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

  $(document).on('cipapi-handle-main', function(event, info) {
    var html = '' +  
      '<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">' +
      '  <h1 class="view-description"></h1>' + 
      '  <div class="navbar-header">' +
      '    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">' +
      '      <span class="sr-only">Toggle navigation</span>' +
      '      <span class="icon-bar"></span>' +
      '      <span class="icon-bar"></span>' +
      '      <span class="icon-bar"></span>' +
      '    </button>' +
      '  </div>' +
      '  <div class="navbar-collapse collapse">' +
      '    <ul class="nav navbar-nav navbar-right">' +
      '      <li><a href="#logout">Log Out</a></li>' +
      '    </ul>' +
      '  </div>' +
      '</div>' +
      '<div id="main-content-area"><form class="form-cip-reporting" role="form"></form></div>';
    
    $('div#container').html(html);

    renderMainScreen(info);
  });
  
  // Do some reports and stuff!
  $(document).on('cipapi-update-main', function(event, info) {
    renderMainScreen(info);
  });

  // Monitor for config changes and update button lists when displayed
  $(document).on('cipapi-config-set', function(event, info) {
    if ($('div#main-content-area form div.form-button-list').length > 0) {
      // Clean up and re-draw buttons
      $('div#main-content-area form > *').remove();
      renderButtons(CIPAPI.config.apiForms);
    }
  });

  // Monitor for REST errors and display an error message
  $(document).on('cipapi-rest-error', function(event, info) {
    bootbox.hideAll();
    bootbox.alert('Communications Error - Please Try Again');
  });
  
  // Helper to render the main screen from initial navigation and hash tag updates
  function renderMainScreen(info) {
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
    // Navigate to the button list if all else fails
    else {
      CIPAPI.router.goTo('main', { action: 'list' });
    }
  }
  
  function renderButtons(buttonCollection) {
    $('div#main-content-area form').append('<div class="form-button-list"></div>');
    
    $.each(buttonCollection, function(key, val) {
      $('div#main-content-area form div').append('<p><button type="button" data-form="' + key + '" class="btn btn-primary btn-lg">' + val + '</button></p>');
    });
    
    $('div#main-content-area form div p button').each(function() {
      var btn = $(this);
      btn.click(function() {
        var btn = $(this);
        CIPAPI.router.goTo('main', { action: 'form', form: btn.attr('data-form') });
      });
    });
  }
  
  // Apply formatting magic for datetime fields
  function bindDateCleanup(selector, pattern) {
    $(selector).each(function() {
      var control = $(this);
      control.blur(function() {
        var theDate = Date.parse(this.value);
        if (null !== theDate) {
          this.value = theDate.toString(pattern);
        }
      });
    });
  }

  function equalizeElementSizes(selector) {
    var widest = 0;

    $(selector).each(function() {
      var elem = $(this);
      widest = Math.max(widest, elem.width());
    });

    $(selector).each(function() {
      var elem = $(this);
      elem.width(widest);
    });
  }
  
  function renderForm(formName) {
    CIPAPI.rest.GET({
      url: '/api/versions/current/integrations/' + escape(formName),
      success: function(response) {
		    var formData = window.FormData ? new FormData() : false;
        var formDefinition = response.data.item[0].data;

        formDefinition.form.push({
               'type': 'submit',
              'title': 'Save Report',
          'htmlClass': 'cipform_save_report'
        });

        formDefinition.onSubmit = function(errors, values) {
          if (!errors) {
            bootbox.alert('Saving...');
            
            // If formData object exists, we may have attachments injected into this sealed proxy object (modern browsers support ajax file upload this way).
            // if this exists, then we will submit it, not the value array.  If it does not exist, then we submit the value array old school.  However, the
            // value array holds the fields we want to post ultimately so we have to merge them into the formData object if defined.
            if (formData) {
              $.each(values, function(key, val) {
                formData.append(key, val);
              });
            }
            
            CIPAPI.rest.post({
              url: '/api/versions/current/integrations/' + escape(formName),
              data: formData ? formData : values,
              success: function(response) {
                // Change the alert to notify the report is saved, take down the alert in a moment, and navigate back to the list
                $('div.bootbox-body').html('Report Saved');
                setTimeout(function() { bootbox.hideAll(); }, 1000);
                CIPAPI.router.goTo('main', { action: 'list' });
              }
            });
          }
        }
        
        $('form.form-cip-reporting').jsonForm(formDefinition);
        
        // Before form validation and submit we must perform some actions
        //
        // Fire the date filters on all date fields by forcing the blur event on them
        // because rich HTML5 date fields never fire the onblur leaving the validation
        // patterm to fail if the device doesn't happen to use the idential pattern.
        //
        // For rich text editing we have to initialize and also hook onto the submit button
        // and move the content back into the text area for validation and delivery.
        $('div.cipform_richtext_custom_field textarea').summernote({ height: 300 });
        $('form.form-cip-reporting :submit').click(function() { 
          // Force the onblur event onto date fields for magic cleanup
          $('form.form-cip-reporting input[type=datetime]').blur();
          $('form.form-cip-reporting input[type=time]').blur();
          $('form.form-cip-reporting input[type=date]').blur();
        
          // Take content from rich text editor back to the hidden textarea
          $('div.cipform_richtext_custom_field textarea').each(function() {
            var e = $(this);
            this.innerHTML = e.code();
          });
        });

        // Bind the date cleanup library to all date fields
        bindDateCleanup('form.form-cip-reporting input[type=datetime]', 'yyyy-MM-dd HH:mm:ss');
        bindDateCleanup('form.form-cip-reporting input[type=time]',     'HH:mm:ss');
        bindDateCleanup('form.form-cip-reporting input[type=date]',     'yyyy-MM-dd');
        
        // Set the width of multi-select and radio group options to be equal so that if the CSS
        // floats the items they will line up like table cells
        equalizeElementSizes('div.cipform_multi_custom_field label.checkbox');
        equalizeElementSizes('div.cipform_check_m_custom_field label.checkbox');
        equalizeElementSizes('div.cipform_check_s_custom_field label.checkbox');
        equalizeElementSizes('div.cipform_check_a_custom_field label.checkbox');
        equalizeElementSizes('div.cipform_radio_custom_field label.radio');
        
        // Setup AJAX image upload handlers if browser is capable, else hide any file upload inputs
        if (formData) {
          $('form.form-cip-reporting input[type=file]').each(function() {
            // Put a media gallery into place
            var container = $(this).closest('div.form-group');
            container.append('<div class="form-cip-media-thumbnails"></div><div style="clear: both;"></div>');
            
            this.addEventListener("change", function (evt) {
              var len = this.files.length;

              for (var i=0; i<len; i++) {
                var file = this.files[i];

                if (window.FileReader) {
                  var reader = new FileReader();
                  reader.onloadend = function (e) {
                    var div = $('<div data-toggle="tooltip" data-placement="bottom" class="form-cip-media-container" style="width: ' + CIPAPI.config.thumbMaxWidth + '; height: ' + CIPAPI.config.thumbMaxHeight + ';"></div>');
                    var img = $('<img data-scale="best-fit" />');
                    img.attr('src', file.type.match(/image.*/) ? e.target.result : 'attachment.png');
                    container.find('div.form-cip-media-thumbnails').append(div.append(img));
                    img.imageScale();
                    div.tooltip({ title: file.name });
                  };
                  reader.readAsDataURL(file);
                }
                
                formData.append("file[]", file);
              }
            });
          });
        } else {
          // Remove file upload controls, they will not work...
          $('form.form-cip-reporting input[type=file]').closest('div.form-group').remove();
        }
      }
    });
  }
  
})(window);
