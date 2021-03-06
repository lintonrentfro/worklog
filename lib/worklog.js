wl = {
    logit : function(time, user, wi, action) {
        applog.insert(
            {
                time : time,
                user : user,
                wi : wi,
                action : action
            }
        );
    },
	getKeyByValue : function(arr,val) {
	    for(var i=0;arr.length > i;i++){
	        if(arr[i].name == val) {
	            return i;
	        };
	    };
	},
    settings : function() {
        var obj = {};
        obj.days_wi_changes_count_as_recent = 7;
        obj.daily_log_view_refresh_interval = 1000;
        return obj;
    },
	set_route : function(route) {
		wl.clear_route(function(){
			switch (route) {
				case "home" :
					Session.set("home","active");
					break;
				case "reports" :
					Session.set("reports","active");
					break;
				case "daily_log" :
					Session.set("daily_log","active");
					break;
				case "settings" :
					Session.set("settings","active");
					break;
			};
		});
	},
	clear_route : function(callback) {
		Session.set("home",null);
		Session.set("reports",null);
		Session.set("daily_log",null);
		Session.set("settings",null);
		Session.set("edit_work_item",null);
		Session.set("edit_task",null);
        Session.set("daily_log_xml",null);
        Session.set("daily_log_csv",null);
        Session.set("printable_daily_log",null);
        Session.set("wi_name_sort",null);
        Session.set("wi_deadline_sort",null);
		callback();
	},
	first_time_startup : function() {
		workers.insert(
            {
                "username" : "admin",
                "password" : "coffee"
            }
        );
        console.log("admin account created");
	},
	refresh_live_log : function() {
		// this code recalculates the .lateness attributes of all tasks so
		// these class names can be used in the view
		if(Session.get("daily_log")) {
			if(Session.get("todays_log")) {
                var log_obj = daily_logs.findOne({_id:Session.get("todays_log")._id});


                // add the work item array key for each work item as it appears in the daily_logs collection
                for(var i=0; log_obj.work_items.length>i; i++) {
                    log_obj.work_items[i].wi_key_in_db = i;
                };
        
                for(var i=0; log_obj.work_items.length>i; i++) {
                    var these_tasks = log_obj.work_items[i].tasks;
                    for(var ii=0; these_tasks.length>ii; ii++) {
                        log_obj.work_items[i].tasks[ii].task_key_in_db = ii;
                    };
                };

                // add helper attribute for recently changed work items
                // cutoff for what counts as recently changed in manually defined here as 3 days
                var now = new Date();
                for(var i=0; log_obj.work_items.length>i; i++) {
                    var then = log_obj.work_items[i].last_modified;
                    var ms_difference = Math.abs(now.getTime() - then.getTime());
                    var day_difference = ms_difference / (1000 * 3600 * 24);
                    if(day_difference < wl.settings().days_wi_changes_count_as_recent) {
                        var changes = "recent_changes";
                    } else {
                        var changes = null;
                    };
                    log_obj.work_items[i].recently_changed = changes;
                };

                // sort tasks by position
                function sort_by_position(a,b) {
                    return a.position - b.position;
                };
                for(var i=0; log_obj.work_items.length>i; i++) {
                    var these_tasks = log_obj.work_items[i].tasks;
                    log_obj.work_items[i].tasks.sort(sort_by_position);
                };

                // add the log log_obj db _id and the work_item array key to the tasks
                // as a handlebars helper to make updating attributes easier
                for(var i=0; log_obj.work_items.length>i; i++) {
                    var these_tasks = log_obj.work_items[i].tasks;
                    for(var ii=0; these_tasks.length>ii; ii++) {
                        log_obj.work_items[i].tasks[ii].parent_log_item_id = log_obj._id;
                        log_obj.work_items[i].tasks[ii].parent_work_item_key = i;
                    };
                };

                // by default, all wi are hidden because no wi groups have been selected
                for(var i=0; log_obj.work_items.length>i; i++) {
                    log_obj.work_items[i].visible = "hidden";
                };
                
                // by default, all tasks are hidden because no tasks groups have been selected
                for(var i=0; log_obj.work_items.length>i; i++) {
                    for(var ii=0; log_obj.work_items[i].tasks.length>ii; ii++) {
                        log_obj.work_items[i].tasks[ii].visible = "hidden";
                    };
                };

                // load the work item and task filters
                var view_filters = Session.get("view_filters");

                // if the work item filter is not set, create an empty array for it
                if(!view_filters.group_filters || view_filters.group_filters.length == 0) {
                    view_filters.group_filters = [];
                };

                // if the task filter is not set, create an empty array for it
                if(!view_filters.task_filters || view_filters.task_filters.length == 0) {
                    view_filters.task_filters = [];
                };

                // based on current active work item filters, set each work item as hidden or shown
                for(var i=0; log_obj.work_items.length>i; i++) {
                    for(var ii=0; view_filters.group_filters.length>ii; ii++) {
                        if(log_obj.work_items[i].groups.indexOf(view_filters.group_filters[ii]) == -1 ) {
                            log_obj.work_items[i].visible = "hidden";
                        } else {
                            log_obj.work_items[i].visible = "";
                            break;
                        };
                    };
                };

                // based on current active task filters, set each task as hidden or shown
                for(var i=0; log_obj.work_items.length>i; i++) {
                    for(var ii=0; log_obj.work_items[i].tasks.length>ii; ii++) {
                        for(var iii=0; view_filters.task_filters.length>iii; iii++) {
                            if(view_filters.task_filters[iii] == log_obj.work_items[i].tasks[ii].group) {
                                log_obj.work_items[i].tasks[ii].visible = "";
                                break;
                            } else {
                                log_obj.work_items[i].tasks[ii].visible = "hidden";
                            };
                        };
                    };
                };

				var now = new Date();
				var d_year = log_obj.day.slice(0,4);
				var d_month = log_obj.day.slice(5,7) - 1;
				var d_day = log_obj.day.slice(8,10);
				for(var i=0; log_obj.work_items.length>i; i++) {
					for(var ii=0; log_obj.work_items[i].tasks.length>ii; ii++) {
						if(log_obj.work_items[i].tasks[ii].deadline != "") {
							var original = log_obj.work_items[i].tasks[ii].deadline;
							var d_hour = original.slice(0, original.length - 3);
							var d_minutes = original.substr(original.length - 2);
							var deadline = new Date(d_year,d_month,d_day,d_hour,d_minutes,0);
							if(deadline < now) {
								log_obj.work_items[i].tasks[ii].lateness = "task_late";
                                // console.log("task late");
							} else {
								var minutes__until_deadline = (deadline - now) / (1000 * 60);
								if(minutes__until_deadline < 30) {
									log_obj.work_items[i].tasks[ii].lateness = "task_final_half_hour";
                                    // console.log("task final half hour");
								};
							};
						} else {
                            log_obj.work_items[i].tasks[ii].lateness = "";
                            // console.log("task ok");
                        };

                        // format completed time of tasks to always have 2 digit minute values
                        if(log_obj.work_items[i].tasks[ii].completed_time) {
                            var hours = log_obj.work_items[i].tasks[ii].completed_time.getHours();
                            var minutes = log_obj.work_items[i].tasks[ii].completed_time.getMinutes();
                            if(minutes < 10) {
                                var formatted_time = hours + ":0" + minutes;
                            } else {
                                var formatted_time = hours + ":" + minutes;
                            };
                            log_obj.work_items[i].tasks[ii].completed_time = formatted_time;
                        };
					};
				};

                // if work items are being sorted by name, sort the log_obj work items accordingly
                if(Session.get("wi_name_sort")) {
                    if(Session.get("wi_name_sort") == "descending") {
                        function sort_descending(a,b) {
                            if (a.name < b.name)
                                return -1;
                            if (a.name > b.name)
                                return 1;
                            return 0;
                        };
                        log_obj.work_items.sort(sort_descending);
                    };
                    if(Session.get("wi_name_sort") == "ascending") {
                        function sort_ascending(a,b) {
                            if (a.name > b.name)
                                return -1;
                            if (a.name < b.name)
                                return 1;
                            return 0;
                        };
                        log_obj.work_items.sort(sort_ascending);
                    };
                };

                // if work items are being sorted by deadline, sort the log_obj work items accordingly
                if(Session.get("wi_deadline_sort")) {
                    if(Session.get("wi_deadline_sort") == "descending") {
                        function sort_descending(a,b) {
                            if (a.deadline < b.deadline)
                                return -1;
                            if (a.deadline > b.deadline)
                                return 1;
                            return 0;
                        };
                        log_obj.work_items.sort(sort_descending);
                    };
                    if(Session.get("wi_deadline_sort") == "ascending") {
                        function sort_ascending(a,b) {
                            if (a.deadline > b.deadline)
                                return -1;
                            if (a.deadline < b.deadline)
                                return 1;
                            return 0;
                        };
                        log_obj.work_items.sort(sort_ascending);
                    };
                };
                
				Session.set("todays_log",log_obj);
			};
		};
	},
	load_daily_log : function(ymd) {
        // retrieve the log obj
        var log_obj = daily_logs.findOne(
            {
                day : ymd
            }
        );
        
        // add the task array key for each task as it appears in the daily_logs collection
        for(var i=0; log_obj.work_items.length>i; i++) {
            var these_tasks = log_obj.work_items[i].tasks;
            for(var ii=0; these_tasks.length>ii; ii++) {
                log_obj.work_items[i].tasks[ii].task_key_in_db = ii;
            };
        };

        // add the work item array key for each work item as it appears in the daily_logs collection
        for(var i=0; log_obj.work_items.length>i; i++) {
            log_obj.work_items[i].wi_key_in_db = i;
        };

        // add helper attribute for recently changed work items
        // cutoff for what counts as recently changed in manually defined here as 3 days
        var now = new Date();
        for(var i=0; log_obj.work_items.length>i; i++) {
            var then = log_obj.work_items[i].last_modified;
            var ms_difference = Math.abs(now.getTime() - then.getTime());
            var day_difference = ms_difference / (1000 * 3600 * 24);
            if(day_difference < 3) {
                var changes = "recent_changes";
            } else {
                var changes = null;
            };
            log_obj.work_items[i].recently_changed = changes;
        };

        // sort tasks by position
        function sort_by_position(a,b) {
            return a.position - b.position;
        };
        for(var i=0; log_obj.work_items.length>i; i++) {
            var these_tasks = log_obj.work_items[i].tasks;
            log_obj.work_items[i].tasks.sort(sort_by_position);
        };

        // add the log log_obj db _id and the work_item array key to the tasks
        // as a handlebars helper to make updating attributes easier
        for(var i=0; log_obj.work_items.length>i; i++) {
            var these_tasks = log_obj.work_items[i].tasks;
            for(var ii=0; these_tasks.length>ii; ii++) {
                log_obj.work_items[i].tasks[ii].parent_log_item_id = log_obj._id;
                log_obj.work_items[i].tasks[ii].parent_work_item_key = i;
            };
        };

        // by default, all wi are hidden because no wi groups have been selected
        for(var i=0; log_obj.work_items.length>i; i++) {
            log_obj.work_items[i].visible = "hidden";
        };
        
        // by default, all tasks are hidden because no tasks groups have been selected
        for(var i=0; log_obj.work_items.length>i; i++) {
            for(var ii=0; log_obj.work_items[i].tasks.length>ii; ii++) {
                log_obj.work_items[i].tasks[ii].visible = "hidden";
            };
        };

        // set wi and tsk filters to empty log_obj
        var filters = {};
        Session.set("view_filters",filters);

        // create the initial wi_groups template log_obj
        function sort_by_name(a,b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        };
        var wi_groups = work_item_groups.find().fetch();
        wi_groups.sort(sort_by_name);
        for(var i=0; wi_groups.length>i; i++) {
            wi_groups[i].visual = "wi_group_not_selected";
        };
        Session.set("wi_groups",wi_groups);

        // create the initial task_groups template log_obj
        function sort_by_name(a,b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        };
        var tsk_groups = task_groups.find().fetch();
        tsk_groups.sort(sort_by_name);
        for(var i=0; tsk_groups.length>i; i++) {
            tsk_groups[i].visual = "task_group_not_selected";
        };
        Session.set("task_groups",tsk_groups);

        // save log_obj as new daily log
        Session.set("todays_log",log_obj);

        // load the daily log view
        wl.set_route("daily_log");
	},
	start_new_daily_log : function(ymd) {
		//
		// create a new empty daily log based on the wi and task settings
		//

		// all active work items
        var all_work_items = work_items.find({active:"yes"}).fetch();

        // function to sort by name
        function sort_by_name(a,b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        };

        // sort all work items by name
        all_work_items.sort(sort_by_name);

        // create new log obj
        var obj = {};
        obj.day = ymd;
        obj.last_modified = now;
        obj.work_items = [];
        for(var i=0; all_work_items.length>i; i++) {
            obj.work_items[i] = all_work_items[i];
        };

        // 

        // add a .notes attribute for each work item
        for(var i=0; all_work_items.length>i; i++) {
            obj.work_items[i].notes = "";
        };

        // store that new log obj
        daily_logs.insert(obj);

        // retrieve that new log obj
        var log_obj = daily_logs.findOne(
            {
                day : ymd
            }
        );

        // add helper attribute for recently changed work items
        // cutoff for what counts as recently changed in manually defined here as 3 days
        var now = new Date();
        for(var i=0; log_obj.work_items.length>i; i++) {
            var then = log_obj.work_items[i].last_modified;
            var ms_difference = Math.abs(now.getTime() - then.getTime());
            var day_difference = ms_difference / (1000 * 3600 * 24);
            if(day_difference < 3) {
                var changes = "recent_changes";
            } else {
                var changes = null;
            };
            log_obj.work_items[i].recently_changed = changes;
        };

        // sort tasks by position
        function sort_by_position(a,b) {
            return a.position - b.position;
        };
        for(var i=0; log_obj.work_items.length>i; i++) {
            var these_tasks = log_obj.work_items[i].tasks;
            log_obj.work_items[i].tasks.sort(sort_by_position);
        };

        // add the log log_obj db _id and the work_item array key to the tasks
        // as a handlebars helper to make updating attributes easier
        for(var i=0; log_obj.work_items.length>i; i++) {
            var these_tasks = log_obj.work_items[i].tasks;
            for(var ii=0; these_tasks.length>ii; ii++) {
                log_obj.work_items[i].tasks[ii].parent_log_item_id = log_obj._id;
                log_obj.work_items[i].tasks[ii].parent_work_item_key = i;
            };
        };

        // by default, all wi are hidden because no wi groups have been selected
        for(var i=0; log_obj.work_items.length>i; i++) {
            log_obj.work_items[i].visible = "hidden";
        };
        
        // by default, all tasks are hidden because no tasks groups have been selected
        for(var i=0; log_obj.work_items.length>i; i++) {
            for(var ii=0; log_obj.work_items[i].tasks.length>ii; ii++) {
                log_obj.work_items[i].tasks[ii].visible = "hidden";
            };
        };

        // set wi and tsk filters to empty log_obj
        var filters = {};
        Session.set("view_filters",filters);

        // create the initial wi_groups template log_obj
        function sort_by_name(a,b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        };
        var wi_groups = work_item_groups.find().fetch();
        wi_groups.sort(sort_by_name);
        for(var i=0; wi_groups.length>i; i++) {
            wi_groups[i].visual = "wi_group_not_selected";
        };
        Session.set("wi_groups",wi_groups);

        // create the initial task_groups template log_obj
        function sort_by_name(a,b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        };
        var tsk_groups = task_groups.find().fetch();
        tsk_groups.sort(sort_by_name);
        for(var i=0; tsk_groups.length>i; i++) {
            tsk_groups[i].visual = "task_group_not_selected";
        };
        Session.set("task_groups",tsk_groups);

        // save log_obj as new daily log
        Session.set("todays_log",log_obj);

        // route to daily_log
        wl.set_route("daily_log");

        console.log(log_obj);
	},
    daily_log_csv_report : function(logs) {
        // this function takes an array of daily log objs
        // and returns a csv string designed to
        // contain a snapshot of that day's log
        // in a tabular format
        var csv = "";
        csv += "Day,Work Item,Active,Task,Task Group,Deadline,Completed Time,Completed By, No Work\n";
        for(var l=0;logs.length>l;l++) {
            for(var i=0;logs[l].work_items.length>i;i++) {
                for(var ii=0;logs[l].work_items[i].tasks.length>ii;ii++) {
                    csv += logs[l].day + "," + logs[l].work_items[i].name + "," + logs[l].work_items[i].active + "," + logs[l].work_items[i].tasks[ii].name + "," + logs[l].work_items[i].tasks[ii].group + ",";
                    if(logs[l].work_items[i].tasks[ii].deadline) {
                        csv += logs[l].work_items[i].tasks[ii].deadline + ",";
                    } else {
                        csv += ",";
                    };
                    if(logs[l].work_items[i].tasks[ii].completed_time) {
                        var hours = logs[l].work_items[i].tasks[ii].completed_time.getHours();
                        var raw_minutes = logs[l].work_items[i].tasks[ii].completed_time.getMinutes();
                        if(raw_minutes < 10) {
                            var minutes = "0" + raw_minutes;
                        } else {
                            var minutes = raw_minutes;
                        };
                        var time = hours + ":" + minutes;
                        csv += time + ",";
                    } else {
                        csv += ",";
                    };
                    if(logs[l].work_items[i].tasks[ii].completed_by) {
                        var user = logs[l].work_items[i].tasks[ii].completed_by;
                        csv += user + ",";
                    } else {
                        csv += ",";
                    };
                    if(logs[l].work_items[i].no_work_today) {
                        if(logs[l].work_items[i].no_work_today == "no_work_today") {
                            csv += "no work" + "\n";
                        };
                    } else {
                        csv += "\n";
                    };
                };
            };
        };
        if(logs.length == 0){
            csv += "-- no data found --";
        };
        return csv;
    },
    daily_log_printable_report : function(this_log) {
        // this function takes a single daily log obj
        // and creates a html report that is
        // easy for a human to read or print

        // sort the work items by name
        function sort_by_name(a,b) {
          if (a.name < b.name)
             return -1;
          if (a.name > b.name)
            return 1;
          return 0;
        };
        this_log.work_items.sort(sort_by_name);

        // sort all the tasks by position
        function sort_by_position(a,b) {
          if (a.position < b.position)
             return -1;
          if (a.position > b.position)
            return 1;
          return 0;
        };
        for(var i=0;this_log.work_items.length>i;i++) {
            this_log.work_items[i].tasks.sort(sort_by_position);
        };

        // generate report html
        var str = "<h1>Daily Log Report</h1>";
        str += "<p>Day: " + this_log.day + "<br>Notes: " + this_log.notes + "</p>";
        str += "<h2>Work Item Details</h2>";
        for(var i=0;this_log.work_items.length>i;i++) {
            // only include active work items
            if(this_log.work_items[i].active == "yes") {
                str += "<p><b>" + this_log.work_items[i].name + "</b><br>";
                if(this_log.work_items[i].notes) {
                    str += "Notes: " + this_log.work_items[i].notes + "<br>";
                };
                for(var ii=0;this_log.work_items[i].tasks.length>ii;ii++) {
                    str += this_log.work_items[i].tasks[ii].name + ": ";
                    if(this_log.work_items[i].tasks[ii].completed_by) {
                        var hours = this_log.work_items[i].tasks[ii].completed_time.getHours();
                        var raw_minutes = this_log.work_items[i].tasks[ii].completed_time.getMinutes();
                        if(raw_minutes < 10) {
                            var minutes = "0" + raw_minutes;
                        } else {
                            var minutes = raw_minutes;
                        };
                        var time = hours + ":" + minutes;
                        str += this_log.work_items[i].tasks[ii].completed_by + " @ " + time + "<br>";
                    } else {
                        str += "<br>";
                    };
                };
                str += "</p>";
            };
        };
        return str;
    }
};