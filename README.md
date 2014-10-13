# cip-reporting-mobile-application

This is an Adobe Phonegap based mobile application which can query
the API of a CIP Reporting server for a list of reports or forms
which can be authored by the current user credentials.

The mobile application fetches all known form definitions from the
CIP Reporting server and is capable of authoring reports offline.
When a connection is available the reports which have been written
will be submitted in the background with notifications.

The mobile application makes use of Phonegap features such as
GPS location and direct camera access.

The recommended use of this project is to submit the GitHub repo
directly to the Adobe Phonegap builder system to produce mobile
packages.  You should probably fork this project and adjust names
and identifiers accordingly for your own packaging.

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
