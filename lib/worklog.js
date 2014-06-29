wl = {
	getKeyByValue : function(arr,val) {
	    for(var i=0;arr.length > i;i++){
	        if(arr[i].name == val) {
	            return i;
	        };
	    };
	},
	set_route : function(route) {
		wl.clear_route(function(){
			switch (route) {
				case "home" :
					Session.set("home","active");
					break;
				case "page1" :
					Session.set("page1","active");
					break;
				case "daily_log" :
					Session.set("daily_log","active");
					break;
				case "page3" :
					Session.set("page3","active");
					break;
			};
		});
	},
	clear_route : function(callback) {
		Session.set("home",null);
		Session.set("page1",null);
		Session.set("daily_log",null);
		Session.set("page3",null);
		Session.set("edit_work_item",null);
		Session.set("edit_task",null);
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
				var log = Session.get("todays_log");
				var now = new Date();
				var d_year = log.day.slice(0,4);
				var d_month = log.day.slice(5,7) - 1;
				var d_day = log.day.slice(8,10);
				for(var i=0; log.work_items.length>i; i++) {
					for(var ii=0; log.work_items[i].tasks.length>ii; ii++) {
						if(log.work_items[i].tasks[ii].deadline != "" && !log.work_items[i].tasks[ii].completed_by) {
							var original = log.work_items[i].tasks[ii].deadline;
							var d_hour = original.slice(0, original.length-3);
							var d_minutes = original.substr(original.length - 2);
							var deadline = new Date(d_year,d_month,d_day,d_hour,d_minutes,0);
							if(deadline < now) {
								log.work_items[i].tasks[ii].lateness = "task_late";
							} else {
								var minutes__until_deadline = (deadline - now) / (1000 * 60);
								if(minutes__until_deadline < 60) {
									log.work_items[i].tasks[ii].lateness = "task_final_hour";
								};
							};
						};
					};
				};
				Session.set("todays_log",log);
			};
		};
	},
	load_daily_log : function(ymd) {
		// take a string of year-month-date (example: "2014-07-22") and load the log for that day
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

        // retrieve the log obj
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
	}
};