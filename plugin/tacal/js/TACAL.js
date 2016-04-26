/**
 * Project: TACAL
 * File: TACAL.js
 * Author: Nathan Healea
 * Created: 3/29/16
 * Credited: CodePen.io username Mark
 * Url: http://codepen.io/xmark/pen/WQaXdv
 */

/**
 * Constructor for TACAL
 * @param id
 * @constructor
 */
var TACAL = function (args) {
    /* * * Pre-defined Variables * * */
    // Days of week, starting on Sunday
    this.DaysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Months, stating on January
    this.Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Default options
    this.default = {
        id: 'cal',
        css: {
            current: 'current',
            not: 'not-current',
            event: 'event'

        }
    };

    // Set the current month, year
    var d = new Date();

    this.currMonth = d.getMonth();
    this.currYear = d.getFullYear();
    this.currDay = d.getDate();
    this.currWeeks = this.getWeeksInMonth();

    this.show = null;

    // holds an 2d array for the calendar.
    // this allows us to add more information to be display in the calendar.
    this.calendar = this.init();

    /* * * Variables * * */
    // Store div id
    this.id = null;

    this.event = null;


    // sets variables;
    this.setVariables(args);

    // add dates to calendar.
    this.addDate(this.currYear, this.currMonth);
    this.addEvent();
    /*if (args != null && args.event != null) {
     this.addEvent(args.event);
     }*/
};

/**
 * Hold a single day information
 * @param args
 * @constructor
 */
var DAY = function (args) {

    // Hold the date id
    this.id = null;

    // Holds the date
    this.date = null;

    // Holds the month
    this.month = null;

    // hold the year
    this.year = null;

    // is it the current month
    this.current = null;

    this.event = null;

    // set the date, month, year if passed arguments.
    if (args != null) {
        var keys = Object.keys(args);
        for (var i in keys) {
            if (this.hasOwnProperty(keys[i])) {
                this[keys[i]] = args[keys[i]];
            }
        }

        var month = ((this.month < 10) ? '0' + this.month : this.month);
        var date = ((this.date < 10) ? '0' + this.date : this.date);

        this.id = this.year + '-' + month + '-' + date;

    }
};

/**
 * Sets option for TACAL
 * @param options
 */
TACAL.prototype.setVariables = function (options) {
    if (options == null) {
        options = this.default;
    }
    var keys = Object.keys(options);

    for (var i in keys) {
        if (this.hasOwnProperty(keys[i])) {
            this[keys[i]] = options[keys[i]];
        }
    }
};

/**
 * Calculates the number of weeks in a month
 * @param y
 * @param m
 * @returns {number}
 */
TACAL.prototype.getWeeksInMonth = function () {
    var year = this.currYear;
    var month_number = this.currMonth;
    var firstOfMonth = new Date(year, month_number, 1);
    var lastOfMonth = new Date(year, month_number + 1, 0);
    var used = firstOfMonth.getDay() + lastOfMonth.getDate();
    return Math.ceil(used / 7);
};

/**
 * Return an array 5 X 7 fill with null
 * 5 weeks for the month
 * 7 days in a week
 * @returns {Array}
 */
TACAL.prototype.init = function () {
    var cal = new Array(this.currWeeks);
    for (var i = 0; i < this.currWeeks; i++) {
        cal[i] = new Array(7).fill(null);
    }
    return cal;
};

/**
 * Goes to the next month
 */
TACAL.prototype.nextMonth = function () {

    // Determines if date need to roll over
    if (this.currMonth == 11) {
        this.currMonth = 0;
        this.currYear = this.currYear + 1;
    }
    else {
        this.currMonth = this.currMonth + 1;
    }

    // Gets then number of weeks in the new month
    this.currWeeks = this.getWeeksInMonth();

    // Initialize the new calender
    this.calendar = this.init();

    // Adds dates to the calender
    this.addDate(this.currYear, this.currMonth);

    // Adds events to the calender
    this.addEvent();

    // displays the calender
    this.fullMonth();

};

/**
 * Goes to the previous month
 */
TACAL.prototype.previousMonth = function () {

    // Determines if date need to roll over
    if (this.currMonth == 0) {
        this.currMonth = 11;
        this.currYear = this.currYear - 1;
    }
    else {
        this.currMonth = this.currMonth - 1;
    }
    // Gets then number of weeks in the new month
    this.currWeeks = this.getWeeksInMonth();

    // Initialize the new calender
    this.calendar = this.init();

    // Adds dates to the calender
    this.addDate(this.currYear, this.currMonth);

    // Adds events to the calender
    this.addEvent();

    // displays the calender
    this.fullMonth();
};

/**
 * Show full Month
 */
TACAL.prototype.fullMonth = function () {
    //this.showFullMonth(this.currYear, this.currMonth);
    this.showFullMonth();
    var cal = this;
    getId(this.id + 'Next').onclick = function () {
        cal.nextMonth();
        cal.displayVars('onClick Next');
    };
    getId(this.id + 'Prev').onclick = function () {
        cal.previousMonth();
        cal.displayVars('onClick Prev');
    }
};

/**
 * Displays the calendar with the selected months days
 */
TACAL.prototype.showFullMonth = function () {

    // --> Start calendar wrapper
    var html = '';
    html += '<div class="calendar-wrapper">';

    /*html += '<button id="' + this.id + 'Prev" class="btnPrev" type="button">Prev</button>';
     html += '<button id="' + this.id + 'Next" class="btnNext" type="button">Next</button>';
     html += '<div>';*/

    // --> Start table
    html += '<table>';

    // --> Start header
    html += '<thead>';

    // --> Start row
    html += '<tr>';
    html += '<td id="' + this.id + 'Prev" class="btnPrev" type="button">&#60;</td>';

    // --> Write selected month and year
    html += '<td colspan="5">' + this.Months[this.currMonth] + ' ' + this.currYear + '</td>';

    html += '<td id="' + this.id + 'Next" class="btnNext" type="button">&#62;</td>';
    html += '</tr>';
    // <--  End row

    html += '</theader>';
    // <-- End header

    // --> Start body
    html += '<tbody>';

    // displaying days of the week
    // --> Start row
    html += '<tr class="days">';
    for (var i = 0; i < this.DaysOfWeek.length; i++) {
        // --> Write the days of the week
        html += '<td>' + this.DaysOfWeek[i] + '</td>';
    }
    html += '</tr>';
    // <-- End row

    for (var row = 0; row < this.calendar.length; row++) {
        // --> Start table row
        html += '<tr>';
        for (var col = 0; col < this.calendar[row].length; col++) {

            // Render date based on stored information.
            html += this.renderDate(this.calendar[row][col], 1);
        }

    }


    html += '</tr>';
    // <-- End table row
    html += '</tbody>';
    // <-- End body

    html += '</table>';
    // <-- End table

    html += '</div>';
    // <-- End calendar wrapper

    // Write HTML to the div
    document.getElementById(this.id).innerHTML = html;
};

/**
 * Displays the number of number of months in a linear view
 * @param numMonths
 */
TACAL.prototype.linearMonth = function (begin, end) {
    var monthsCal = [];
    var count = 0;
    var ms = {
        month: null,
        year: null,
        calendar: null
    };

    if (begin == null && end == null) {

        ms = {
            month: this.currMonth,
            year: this.currYear,
            calendar: this.calendar
        };
        monthsCal[count] = ms;
        this.showLinerMonth(monthsCal);
        return;
    }

    if (begin.getFullYear() == end.getFullYear()) {
        for (var m = begin.getMonth(); m <= end.getMonth(); m++) {

            this.currMonth = m;
            this.currYear = begin.getFullYear();

            // Gets then number of weeks in the new month
            this.currWeeks = this.getWeeksInMonth();

            // Initialize the new calender
            this.calendar = this.init();

            // Adds dates to the calender
            this.addDate(this.currYear, this.currMonth);

            // Adds events to the calender
            this.addEvent();

            ms = {
                month: m,
                year: begin.getFullYear(),
                calendar: this.calendar
            };

            monthsCal[count] = ms;
            count++;
        }
        this.showLinerMonth(monthsCal);
    }
    else if (begin.getFullYear() < end.getFullYear()) {
        var m = begin.getMonth();
        var year = begin.getFullYear();
        var exit = false;
        do {
            this.currMonth = m;
            this.currYear = year;

            // Gets then number of weeks in the new month
            this.currWeeks = this.getWeeksInMonth();

            // Initialize the new calender
            this.calendar = this.init();

            // Adds dates to the calender
            this.addDate(this.currYear, this.currMonth);

            // Adds events to the calender
            this.addEvent();

            // Add calendar to container
            ms = {
                month: m,
                year: year,
                calendar: this.calendar
            };

            // places contain in array
            monthsCal[count] = ms;
            count++;

            if (m == 11) {
                m = 0;
                year++;
            }
            else {
                m++;
            }

            if (year == end.getFullYear() && m == end.getMonth()) {
                exit = true;
            }


        } while (exit == false);
        this.showLinerMonth(monthsCal);
    }


    console.log(monthsCal);


};

/**
 * Displays the calendar in a linear view
 */
TACAL.prototype.showLinerMonth = function (monthsCal) {

    var html = '';

    // --> Start calendar wrapper
    html += '<div class="calendar-wrapper linear">';

    // --> Start table
    html += '<table>';

    // --> Start header
    html += '<thead>';

    // --> Start row
    html += '<tr>';

    html += '<td>Month</td>';

    for (var days = 1; days < 32; days++) {
        html += '<td>' + days + '</td>';
    }

    html += '</tr>';
    // <--  End row

    html += '</theader>';
    // <-- End header

    // --> Start body
    html += '<tbody>';

    // --> Start table row
    html += '<tr>';

    // Showing the name of the month

    for (var month = 0; month < monthsCal.length; month++) {
        html += '<td>' + this.Months[monthsCal[month].month] + '</td>';
        var numDays = 1;
        for (var row = 0; row < monthsCal[month].calendar.length; row++) {
            for (var col = 0; col < monthsCal[month].calendar[row].length; col++) {
                if (monthsCal[month].calendar[row][col].current == true) {
                    // Render date based on stored information.
                    html += this.renderDate(monthsCal[month].calendar[row][col], 0);
                    numDays++;
                }
            }
        }

        if (numDays < 32) {
            for (var d = numDays; d < 32; d++) {
                html += '<td class="not-current"></td>';
            }
        }


        html += '</tr>';
        // <-- End table row
    }

    html += '</tbody>';
    // <-- End body

    html += '</table>';
    // <-- End table

    html += '</div>';
    // <-- End calendar wrapper

    // Write HTML to the div
    document.getElementById(this.id).innerHTML = html;
};

/**
 * Take a given year and month and fills in calendar with correct days.
 * @param y (year)
 * @param m (month)
 */
TACAL.prototype.addDate = function (y, m) {

    // Day of the week (ex: 0 = sun)
    var day = 0;
    // Indexer for the week we are adding dates to
    var week = 0;
    // Holds the current date being added (for current month)
    var date = 1;
    // Starting day of the current month
    var firstDayOfCurrentMonth = new Date(y, m, 1).getDay();
    // Last day of the current month
    var lastDayOfCurrentMonth = new Date(y, m + 1, 0).getDay();
    // Number of days in the current month (ex: july = 31)
    var numberOfDays = new Date(y, m + 1, 0).getDate();
    // Last day of the previous month
    var lastDayOfPreviousMonth = 0 ? new Date(y - 1, 11, 0).getDate() : new Date(y, m, 0).getDate();
    // Number of previous month
    var lastMonth = (( m - 1 < 0) ? 11 : m - 1);
    // Previous month year
    var lastMonthYear = (( m - 1 < 0) ? y - 1 : y );
    // Number of next month
    var nextMonth = (( m + 1 > 11) ? 0 : m + 1);
    // Previous month year
    var nextMonthYear = (( m + 1 > 11) ? y + 1 : y );

    /*   if(m == 1){
     if(((y % 4 == 0) && (y % 100 != 0)) || (y % 400 == 0)){
     numberOfDays == 28;
     }
     else{
     numberOfDays == 29;
     }
     }*/
    /*
     Filling dates of previous month
     if the first day of the selected month
     is not on Sunday.
     */
    if (firstDayOfCurrentMonth != 0) {
        var lastMonthsDates = lastDayOfPreviousMonth - firstDayOfCurrentMonth + 1;
        for (var i = 0; i < firstDayOfCurrentMonth; i++) {
            this.calendar[week][day] = new DAY({
                date: lastMonthsDates,
                month: lastMonth,
                year: lastMonthYear,
                current: false
            });
            lastMonthsDates++;
            day++;
        }
    }

    // Filling dates of the selected month
    do {
        do {
            this.calendar[week][day] = new DAY({date: date, month: this.currMonth, year: this.currYear, current: true});
            date++;
            day++;
        } while (( day < 7) && ( date < numberOfDays + 1));

        if (day == 7) {
            day = 0;
            week++;
        }

    } while (( week < this.currWeeks) && ( date < numberOfDays + 1));

    /*
     Filling dates of next month
     if the last day of the selected month
     is not on Saturday.
     */
    if (lastDayOfCurrentMonth != 6 && day < 7) {
        var nextMonthsDates = 1;
        do {
            this.calendar[week][day] = new DAY({
                date: nextMonthsDates,
                month: nextMonth,
                year: nextMonthYear,
                current: false
            });
            nextMonthsDates++;
            day++;

        } while (day < 7);
    }
};

/**
 * Add events to the calender giving mating dates.
 */
TACAL.prototype.addEvent = function () {
    if (this.event != null) {
        var isAdded = false;
        for (var e in this.event) {
            if (this.event[e].hasOwnProperty('date')) {
                for (var w in this.calendar) {
                    for (var d in this.calendar[w]) {
                        if (this.calendar[w][d].id.localeCompare(this.event[e].date) == 0) {
                            this.calendar[w][d].event = this.event[e];
                            isAdded = true;
                            break;
                        }
                    }
                    if (isAdded == true) {
                        isAdded = false;
                        break;
                    }
                }
            }

        }
    }

};

/**
 * Render a given date with the correct information and events
 * @param date
 * @param show
 * @returns {string}
 */
TACAL.prototype.renderDate = function (date) {

    var keys = Object.keys(date);
    var css = '';
    var id = date.id;
    var innerhtml = '';
    var event = '';

    for (var s in this.show) {
        switch (this.show[s]) {
            case 'date':
                innerhtml += '<div class="date">' + date.date + '</div>';
                break;
            case 'event':
                if (keys.indexOf('event') != -1 && date.event != null) {
                    css += 'event';
                }
                break;
            case 'is_wordsalad':
                // check for an event on the day.
                if (keys.indexOf('event') != -1 && date.event != null) {
                    // Applies css: for is_wordsalad of a student post
                    if (date['event'].hasOwnProperty('is_wordsalad')) {
                        if (date['event'].is_wordsalad == 1) {
                            event += '<div class="iswordsalad"></div>';
                        }
                        else if (date['event'].is_wordsalad == 0) {
                            event += '<div class="notwordsalad"></div>';
                        }
                    }

                }
                break;
            case 'wordcount':
                // check for an event on the day.
                if (keys.indexOf('event') != -1 && date.event != null) {

                    // Applies css: for wordcount of student post.
                    if (date['event'].hasOwnProperty('wordcount')) {

                        if (date['event'].wordcount < 349) {
                            event += '<div class="low">' + date['event'].wordcount + '</div>';
                        }
                        else if (date['event'].wordcount >= 349 && date['event'].wordcount < 370) {
                            event += '<div class="medium">' + date['event'].wordcount + '</div>';
                        }
                        else if (date['event'].wordcount >= 370) {
                            event += '<div class="high">' + date['event'].wordcount + '</div>';
                        }

                    }
                }
                break;

            default:
                break;
        }
    }
    // Applies css: not current month
    if (keys.indexOf("current") != -1) {
        if (date[keys[keys.indexOf("current")]] == false) {
            css += 'not-current '
        }
    }

    return '<td class="' + css + '" id="' + id + '">'
        + innerhtml
        + event
        + '</td>';

};

/*TACAL.prototype.renderDate = function (date, show) {

 var keys = Object.keys(date);
 var css = '';
 var id = date.id;
 var innerhtml = date.date;
 var event = '';

 // Applies css: not current month
 if (keys.indexOf("current") != -1) {
 if (date[keys[keys.indexOf("current")]] == false) {
 css += 'not-current '
 }
 }

 // check for an event on the day.
 if (keys.indexOf('event') != -1 && date.event != null) {

 // Applies css: for wordcount of student post.
 if (date['event'].hasOwnProperty('wordcount')) {

 if (date['event'].wordcount < 349) {
 event += '<div class="low">' + date['event'].wordcount + '</div>';
 }
 else if (date['event'].wordcount >= 349 && date['event'].wordcount < 370) {
 event += '<div class="medium">' + date['event'].wordcount + '</div>';
 }
 else if (date['event'].wordcount >= 370) {
 event += '<div class="high">' + date['event'].wordcount + '</div>';
 }

 }

 // Applies css: for is_wordsalad of a student post
 if (date['event'].hasOwnProperty('is_wordsalad')) {
 if (date['event'].is_wordsalad == 1) {
 event += '<div class="iswordsalad"></div>';
 }
 else if (date['event'].is_wordsalad == 0) {
 event += '<div class="notwordsalad"></div>';
 }
 }

 }

 if (show == 1) {
 return '<td class="' + css + '" id="' + id + '">'
 + '<div class="date">' + innerhtml + '</div>'
 + event
 + '</td>';
 }
 return '<td class="' + css + '" id="' + id + '">'
 + event
 + '</td>';


 };*/

// ------  Helper functions ------ //
/**
 * Get element by id
 * @param id
 * @returns {Element}
 */
function getId(id) {
    return document.getElementById(id);
}


// ------  Testing ------ //
/**
 * Displays tacal variables after an given event
 * @param event
 */
TACAL.prototype.displayVars = function (event) {
    console.log('* - - - - - - Display Variables: '
        + event
        + ' - - - - - - *');
    console.log("Div Id: " + this.id);

    console.log("* - - Day Of Week - - *");
    console.log(this.DaysOfWeek);

    console.log("* - - Months - - *");
    console.log(this.Months);

    console.log("Current Month: " + this.currMonth);
    console.log("Current Day: " + this.currDay);
    console.log("Current Year: " + this.currYear);
    console.log("Number of Weeks: " + this.currWeeks);

    console.log("* - - Calendar Days - - *");
    console.log(this.calendar);

    console.log("* - - Events - - *");
    console.log(this.events);

};