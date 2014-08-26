dh = {
    // turn a ymd string like "2014-08-22" into a Date obj
	ymd_to_obj : function(ymd) {
        var year = ymd.substring(0,4);
        var month = ymd.substring(5,7) - 1;
        var day = ymd.substring(8,10);
        var date_obj = new Date(year,month,day);
        return date_obj;
    },
    minus_x_days : function(old,days) {
        // convert the date obj to milliseconds since 1970 value
        var ms = old.valueOf();

        // subtract 1 day of milliseconds
        var previous_day_in_ms = ms - (86400000 * days);

        // create new date obj for the previous day
        var previous_date_obj = new Date(previous_day_in_ms);

        return previous_date_obj;
    },
    plus_x_days : function(old,days) {
        // convert the date obj to milliseconds since 1970 value
        var ms = old.valueOf();

        // subtract 1 day of milliseconds
        var previous_day_in_ms = ms + (86400000 * days);

        // create new date obj for the previous day
        var previous_date_obj = new Date(previous_day_in_ms);

        return previous_date_obj;
    },
    obj_to_ymd : function(obj) {
        var year = obj.getFullYear();
        var month = obj.getMonth() + 1;
        if(month < 10) {
            month = "0" + month.toString();
        };
        var day = obj.getDate();
        if(day < 10) {
            day = "0" + day.toString();
        };
        var ymd = year + '-' + month + '-' + day;
        return ymd;
    }
};