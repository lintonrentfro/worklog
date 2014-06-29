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
				case "page2" :
					Session.set("page2","active");
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
		Session.set("page2",null);
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
		if(Session.get("page2")) {
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
	}
};