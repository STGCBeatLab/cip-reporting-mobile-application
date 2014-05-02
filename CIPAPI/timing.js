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
  CIPAPI.timing = {};

  var log = log4javascript.getLogger("CIPAPI.timing");

  var startTime = Math.round(new Date().getTime() / 1000);
  
  // On application initialization setup a time notification system
  $(document).on('cipapi-init', function(event) {
    setInterval(function() {
      var thisTime = Math.round(new Date().getTime() / 1000);
      var delta = thisTime - startTime;
      
      $(document).trigger('cipapi-timing-1sec');
      if (0 == delta % 5)      { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-5sec');   }
      if (0 == delta % 10)     { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-10sec');  }
      if (0 == delta % 15)     { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-15sec');  }
      if (0 == delta % 30)     { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-30sec');  }
      if (0 == delta % 60)     { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-1min');   }
      if (0 == delta % 300)    { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-5min');   }
      if (0 == delta % 600)    { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-10min');  }
      if (0 == delta % 900)    { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-15min');  }
      if (0 == delta % 1800)   { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-30min');  }
      if (0 == delta % 3600)   { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-1hour');  }
      if (0 == delta % 7200)   { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-2hour');  }
      if (0 == delta % 14400)  { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-4hour');  }
      if (0 == delta % 28800)  { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-8hour');  }
      if (0 == delta % 57600)  { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-12hour'); }
      if (0 == delta % 115200) { $(document).trigger('cipapi-timer-tick', 'cipapi-timing-1day');   }
    }, 1000);
  });
  
})(window);

