
	function toggleLiveResizing () {
		$.each( $.layout.config.borderPanes, function (i, pane) {
			var o = myLayout.options[ pane ];
			o.livePaneResizing = !o.livePaneResizing;
		});
	};
	
	var myLayout;

	$(document).ready(function () {
		// this layout could be created with NO OPTIONS - but showing some here just as a sample...
		// myLayout = $('body').layout(); -- no page borders possible if 'body' layout; use 'container' div
		myLayout = $('#container').layout({
			//minSize:					100	// ALL panes
		  north__size:			70
		,	west__size:				.5
		,	west__childOptions:	{
				minSize:				25	
			,	south__size:		.5
			}

		,	center__size:				.5
		,	center__childOptions:	{
				minSize:				25	
			,	south__size:		.5
			}
		, south__size:				35
		//	reference only - these options are NOT required because 'true' is the default
		,	closable:					true	// pane can open & close
		,	resizable:				true	// when open, pane can be resized 
		,	slidable:					true	// when closed, pane can 'slide' open over other panes - closes on mouse-out
		,	livePaneResizing:	true

		//	some resizing/toggling settings
		,	north__resizable:			false	
		,	north__closable:			false	
		,	north__slidable:			false	// OVERRIDE the pane-default of 'slidable=true'
		,	south__resizable:			false	
		,	south__closable:			false	
		,	south__slidable:			false	

		,	north__togglerLength_closed: '100%'	// toggle-button is full-width of resizer-bar
		//,	north__spacing_closed:		20		// big resizer-bar when open (zero height)

		// OVERRIDE the pane-default of 'resizable=true'
		,	north__spacing_open:		5
		,	south__spacing_open:		5		// no resizer-bar when open (zero height)
		,	west__spacing_closed:		20		// big resizer-bar when open (zero height)

		//	pane-size constraints
		// ,	west__minSize:			100
		,	west__maxSize:			.75 // 75% of layout width

		//	some pane animation settings
		,	west__animatePaneSizing:	false
		,	west__fxSpeed_size:			"fast"	// 'fast' animation when resizing west-pane
		,	west__fxSpeed_open:			1000	 //1-second animation when opening west-pane
		,	west__fxSettings_open:		{ easing: "easeOutBounce" } // 'bounce' effect when opening
		,	west__fxName_close:			"none"	// NO animation when closing west-pane

		//	enable showOverflow on west-pane so CSS popups will overlap north pane
		,	west__showOverflowOnHover:	true

		//	enable state management
		,	stateManagement__enabled:	true // automatic cookie load & save enabled by default

		//,	showDebugMessages:			true // log and/or display messages from debugging & testing code
		});
		// button binding
		myLayout
			// add event to the 'Close' button in the East pane dynamically...
			.bindButton('#btnCloseWest', 'close', 'west')
	
			// 'Reset State' button requires updated functionality in rc29.15+
		if ($.layout.revision && $.layout.revision >= 0.032915)
			$('#btnReset').show();
 	});
