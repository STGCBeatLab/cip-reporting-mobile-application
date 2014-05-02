# mobile-integration-report-writer

This is a stand-alone HTML5 web application which can query 
the API of a CIP Reporting server for a list of reports or forms
which can be authored by the current user credentials.

The application presents a simple user interface that works on
both desktop and mobile devices.  The user interface gives a
button menu to select which form to write.  Most all fields 
within CIP Reporting are supported over the API forms engine.

Upon a selection of a form, the form is rendered and the user is
able to complete the form and submit it.  The form is also client
side validated before being sent to the server.  The server saves
the form using the current user credentials.

To use the application simply extract this archive on the host
or place this archive onto a web server and open the following
URL in an HTML5 capable web browser:

[Path to Files]/apps/mobile-integration-report-writer/index.html

NOTE: If you use the files locally (not on a web server) there
are issues with IE and Firefox.  IE does not allow HTML5 local
storage with local files which causes an error and the application
does not load.  Firefox does not allow loading fonts with local
files which can be changed in the security settings of Firefox
which results in the top menu glyphs not loading.

Ultimately this application will work better when served by a
web server across all browsers.  Google Chrome works great in all
environments.  
