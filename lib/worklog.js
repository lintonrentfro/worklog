wl = {
	getKeyByValue : function(arr,val) {
	    for(var i=0;arr.length > i;i++){
	        if(arr[i].name == val) {
	            return i;
	        };
	    };
	},
	settings : function() {
		// var settings = settings.findOne();
		var settings = {};
		settings.days_tasks_are_considered_updated = 7;
		return settings;
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
	}
};