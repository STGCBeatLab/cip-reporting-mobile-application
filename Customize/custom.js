// JavaScript Document 
$(function(){
      $("#CustomHeader").load("./Customize/CustomHeader.html");
	  $("#CustomFooter").load("./Customize/CustomFooter.html"); 
	  $("#EUP") .load("./Customize/EUPModal.html");
});
    
$('input, textarea')
.on('focus', function (e) {
    $('header, footer').css('position', 'absolute');
})
.on('blur', function (e) {
    $('header, footer').css('position', 'fixed');
    //force page redraw to fix incorrectly positioned fixed elements
    setTimeout( function() {
        window.scrollTo( $.mobile.window.scrollLeft(), $.mobile.window.scrollTop() );
    }, 20 );
});