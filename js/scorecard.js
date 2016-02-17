/* File: scorecard.js
 * Version: 7103
 *    - No changes performed on this file -
 *
 * Version: 7102
 * Updated: 1/30/2015
 * Features:
 * - added scorecard to this update
 * - shows 30 day's worth of data
 * x does not currently link to edit node when picture is clicked. Working on this...
 */

//set global variable
var requiredWords = 365;

//this is equivilent to docmuent.ready(funtion()){
(function ($) {
	Drupal.behaviors.writing365Scorecard = {
		//takes array and makes it into meaningful data displayed to user. Currently writes directly on DOM elements
		//scorecard: function(array, num_loops, basepath) {
		scorecard: function(context, settings) {
			//show the first initial array
			var array = Drupal.settings.writing365.jsonArray; //passed from Drupal
			var num_loops = Drupal.settings.writing365.num_loops;
			var output = "";
			for (var entries in array[num_loops]) {
				var entrydate = array[num_loops][entries]["Date"];
				var words = array[num_loops][entries]["Words"];
				var nid = array[num_loops][entries]["nid"];
				Drupal.behaviors.writing365Scorecard.printPicture(entrydate, words, entries, settings);
			}
			//attach counter to DOM element. Counter ranges from 0 to 2
			jQuery("#edit-fieldset").data("count", num_loops);
			var counter = jQuery("#edit-fieldset").data("count");
		
			//button to show next 10 results
			jQuery("#leftarrow").click(function () {
				//do not iterate past the last row of the array
				if (counter >= 1) {
					counter--;
					//console.log("Counter is now: " + counter);
					for (var entries in array[counter]) {
						var entrydate = array[counter][entries]["Date"];
						var words = array[counter][entries]["Words"];
						var nid = array[num_loops][entries]["nid"];
						Drupal.behaviors.writing365Scorecard.printPicture(entrydate, words, entries, settings);
					}
				}
			});
			//button to show previous 10 results
			jQuery("#rightarrow").click(function () {
				if (counter < array.length - 1) {
					counter++;
					//console.log("Counter is now: " + counter);
					for (var entries in array[counter]) {
						var entrydate = array[counter][entries]["Date"];
						var words = array[counter][entries]["Words"];
						var nid = array[num_loops][entries]["nid"];
						Drupal.behaviors.writing365Scorecard.printPicture(entrydate, words, entries, settings);
					}
				}
			});
		},

		//checks wordcount and outputs appropriate picture
		printPicture: function (entrydate, words, i, settings) {
			var basepath = Drupal.settings.writing365.basepath;
			var nid = Drupal.settings.writing365.nid;
			var picture;
			var href = "";
			i++; //i chooses the right box to put the picture in
			//if there was an entry on a day, include the url in the picture NOT YET IMPLEMENTED
			if (nid !== undefined) {
				href = 'href="' + basepath + '/node/' + nid + '/edit" ';
			}
			//select and replace DOM element based on the number of words written on that date
			var dest = jQuery("#dow" + i);
			if (words >= requiredWords){
				picture = '<div class="box" id="dow' + i +'"><img ' + href;
				picture += 'src="/sites/all/modules/writing365/images/strike.jpg" ';
				picture += 'title="Great job! You wrote ' + words + ' words on ' + entrydate + '"></div>';
			}
			else if (words < requiredWords && words > 0) {
				picture = '<div class="box" id="dow' + i +'"><img ' + href;
				picture += 'src="/sites/all/modules/writing365/images/spare.jpg" ';
				picture += 'title="You only wrote ' + words + ' words on ' + entrydate + '"></div>';		
			}
			else {
				picture = '<div class="box" id="dow' + i +'"><img ' + href;
				picture += 'src="/sites/all/modules/writing365/images/gutter.jpg" '
				picture += 'title="You did not write any words on ' + entrydate + '"></div>';
			}
			dest.replaceWith(picture);
		},
		
		attach: function(context, settings) {
			//receive the passed variable from Drupal called jsonArray. This is why we use Drupal.behaviors
			if(Drupal.settings.writing365.jsonArray) {
				Drupal.behaviors.writing365Scorecard.scorecard(context, settings);
			}
		}
	};
})(jQuery);

//takes array and makes it into meaningful data displayed to user. Currently writes directly on DOM elements
/*
function scorecard(array) {	
	//show the first initial array
	var output = "";
    for (var entries in array[2]) {
		var entrydate = array[2][entries]["Date"];
		var words = array[2][entries]["Words"];
		printPicture(entrydate, words, entries);
	}
    //attach counter to DOM element. Counter ranges from 0 to 2
    jQuery("#edit-fieldset").data("count", 2);
    var counter = jQuery("#edit-fieldset").data("count");

    //button to show next 10 results
    jQuery("#leftarrow").click(function () {
        //do not iterate past the last row of the array
		if (counter >= 1) {
			counter--;
			//console.log("Counter is now: " + counter);
			for (var entries in array[counter]) {
				var entrydate = array[counter][entries]["Date"];
				var words = array[counter][entries]["Words"];
				printPicture(entrydate, words, entries);
			}
		}
    });
	//button to show previous 10 results
    jQuery("#rightarrow").click(function () {
        if (counter < array.length - 1) {
			counter++;
			//console.log("Counter is now: " + counter);
			for (var entries in array[counter]) {
				var entrydate = array[counter][entries]["Date"];
				var words = array[counter][entries]["Words"];
				printPicture(entrydate, words, entries);
			}
		}
    });
}

//checks wordcount and outputs appropriate picture
function printPicture(entrydate, words, i) {
	var picture;
	//i chooses the right box to put the picture in
	i++;
	//select and replace DOM element based on the number of words written on that date
	var dest = jQuery("#dow" + i);
	if (words >= requiredWords){
		picture = '<div class="box" id="dow' + i +'"><img src="/sites/all/modules/writing365/images/strike.jpg" title="Great job! You wrote ' + words + ' words on ' + entrydate + '"></div>';
	}
	else if (words < requiredWords && words > 0) {
		picture = '<div class="box" id="dow' + i +'"><img src="/sites/all/modules/writing365/images/spare.jpg" title="You only wrote ' + words + ' words on ' + entrydate + '"></div>';		
	}
	else {
		picture = '<div class="box" id="dow' + i +'"><img src="/sites/all/modules/writing365/images/gutter.jpg" title="You did not write any words on ' + entrydate + '"></div>';
	}
	dest.replaceWith(picture);
}*/