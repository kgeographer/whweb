

$( document ).ready(function() {

  $('a[data-toggle="tooltip"]').tooltip({
      animated: 'fade',
      placement: 'bottom',
      html: true
  });

  // $( "#corp" ).tooltip(
  //   { content: '<img src="images/corporate-record.png" width=400;/>',
  //     position: { at: "top", of: "#content"}
  //   }
  // );
})
