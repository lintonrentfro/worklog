/*
 First Time Startup
 */
// wl.first_time_startup();

/*
 Normal Startup
 */
// Session.set("home","active");

/*
 Global Template Nav Helpers
 */
Handlebars.registerHelper("home", function() {
    if(Session.get("home")) {
        return Session.get("home");
    };
});
Handlebars.registerHelper("page1", function() {
    if(Session.get("page1")) {
        return Session.get("page1");
    };
});
Handlebars.registerHelper("page2", function() {
    if(Session.get("page2")) {
        return Session.get("page2");
    };
});
Handlebars.registerHelper("page3", function() {
    if(Session.get("page3")) {
        return Session.get("page3");
    };
});

/*
 Global Login Helpers
 */
Handlebars.registerHelper("is_logged_in", function() {
    if(Session.get("user")) {
        return Session.get("user");
    };
});
Handlebars.registerHelper("is_admin", function() {
    if(Session.get("user")) {
        if(Session.get("user").username == "admin") {
            return true;
        };
    };
});

/*
 Global Key/Value Helper
 */
Handlebars.registerHelper('key_value', function(context, options) {
    var result = [];
    _.each(context, function(value, key, list) {
        result.push({key:key, value:value});
    });
    return result;
});

/*
 Nav
 */
Template.nav.day_started = function() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var ymd = year + '-' + month + '-' + day;
    var todays_log = daily_logs.findOne(
        {
            day : ymd
        }
    );
    if(todays_log) {
        // console.log("found today's log ...");
        return 1;
    } else {
        // console.log("starting today's log ...");
        // daily_logs.insert(
        //     {
        //         day : ymd
        //     }
        // );
        return 0;
    };
};
Template.nav.events({
    "click #home" : function() {
        /*
            DEV SHORTCUT - NOT TO BE USED IN LIVE VERSION
        */
        wl.set_route("page3");
        var this_user = workers.findOne({username:"admin",password:"coffee"});
        Session.set("user",this_user);
    },
    "click #page1" : function() {
        // date testing; this all works

        // var now = new Date();
        // var year = now.getFullYear();
        // var month = now.getMonth() + 1;
        // var day = now.getDate();
        // var ymd = year + '-' + month + '-' + day;
        // var todays_log = daily_logs.findOne(
        //     {
        //         day : ymd
        //     }
        // );
        // if(todays_log) {
        //     console.log("found today's log ...");
        // } else {
        //     console.log("starting today's log ...");
        //     daily_logs.insert(
        //         {
        //             day : ymd
        //         }
        //     );
        // };
        wl.set_route("page1");
    },
    "click #page2" : function() {
        // get today's Y:M:D
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var ymd = year + '-' + month + '-' + day;

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
        var fake_log_db_id = 123456789;

        // add helper attribute for recently (7 days) changed work items
        var now = new Date();
        for(var i=0; obj.work_items.length>i; i++) {
            var then = obj.work_items[i].last_modified;
            var ms_difference = Math.abs(now.getTime() - then.getTime());
            var day_difference = ms_difference / (1000 * 3600 * 24);
            if(day_difference < wl.settings.days_tasks_are_considered_updated) {
                var changes = "recent_changes";
            } else {
                var changes = "";
            };
            obj.work_items[i].recently_changed = "recent_changes";
        };

        // sort tasks by position
        function sort_by_position(a,b) {
            if (a.position < b.position)
                return -1;
            if (a.position > b.position)
                return 1;
            return 0;
        };
        for(var i=0; obj.work_items.length>i; i++) {
            var these_tasks = obj.work_items[i].tasks;
            // console.log(these_tasks);
            obj.work_items[i].tasks.sort(sort_by_position);
        };

        // add the log obj db _id and the work_item array key to the tasks
        // as a handlebars helper to make updating attributes easier
        for(var i=0; obj.work_items.length>i; i++) {
            var these_tasks = obj.work_items[i].tasks;
            for(var ii=0; these_tasks.length>ii; ii++) {
                obj.work_items[i].tasks[ii].parent_log_item_id = fake_log_db_id;
                obj.work_items[i].tasks[ii].parent_work_item_key = i;
            };
        };

        // view obj and save it
        Session.set("todays_log",obj);
        console.log(obj);

        // route to page2
        wl.set_route("page2");
    },
    "click #page3" : function() {
        wl.set_route("page3");
    },
    "click #login" : function() {
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        if(!username || !password) {
            Session.set("error_form_login","error");
        };
        if(username && password) {
            if(workers.findOne({username:username})) {
                if(workers.findOne({username:username,password:password})){
                    var this_user = workers.findOne({username:username,password:password});
                    Session.set("user",this_user);
                    Session.set("error_form_login",null);
                } else {
                    Session.set("error_form_login","error");
                };
            } else {
                Session.set("error_form_login","error");
            };
        };
        return false;
    },
    "click #logout" : function() {
        Session.set("user",null);
        wl.set_route("home");
        return false;
    }
});

/*
 Settings
*/
Template.settings.error_new_worker_form = function() {
    if(Session.get("error_new_worker_form")) {
        return Session.get("error_new_worker_form");
    };
};
Template.settings.workers = function() {
    function sort_by_username(a,b) {
      if (a.username < b.username)
         return -1;
      if (a.username > b.username)
        return 1;
      return 0;
    };
    var all_workers = workers.find().fetch();
    all_workers.sort(sort_by_username);
    return all_workers;
};
Template.settings.error_new_workitem_form = function() {
    if(Session.get("error_new_workitem_form")) {
        return Session.get("error_new_workitem_form");
    };
};
Template.settings.work_items = function() {
    function sort_by_name(a,b) {
      if (a.name < b.name)
         return -1;
      if (a.name > b.name)
        return 1;
      return 0;
    };
    var all_workitems = work_items.find().fetch();
    all_workitems.sort(sort_by_name);
    return all_workitems;
};
Template.settings.work_item_groups = function() {
    function sort_by_name(a,b) {
      if (a.name < b.name)
         return -1;
      if (a.name > b.name)
        return 1;
      return 0;
    };
    var all_workitem_groups = work_item_groups.find().fetch();
    all_workitem_groups.sort(sort_by_name);
    return all_workitem_groups;
};
Template.settings.task_groups = function() {
    function sort_by_name(a,b) {
      if (a.name < b.name)
         return -1;
      if (a.name > b.name)
        return 1;
      return 0;
    };
    var all_task_groups = task_groups.find().fetch();
    all_task_groups.sort(sort_by_name);
    return all_task_groups;
};
Template.settings.edit_work_item = function() {
    if(Session.get("edit_work_item")) {
        function ascending_order(a,b) {
            if (a.position < b.position) {
                return -1;
            };
            if (a.position > b.position) {
                return 1;
            };
            return 0;
        };
        var id = Session.get("edit_work_item")._id;
        var edit_work_item = work_items.findOne(
            {
                _id : id
            }
        );
        edit_work_item.tasks.sort(ascending_order);
        return edit_work_item;
    };
};
Template.settings.edit_task = function() {
    if(Session.get("edit_task")) {
        return Session.get("edit_task");
    };
};
Template.settings.events({
    "click #add_worker" : function() {
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        if(!username || !password) {
            Session.set("error_new_worker_form","error");
        };
        if(username && password) {
            if(workers.findOne({username:username})) {
                Session.set("error_new_worker_form","error");
            } else {
                workers.insert({username:username,password:password});
                Session.set("error_new_worker_form",null);
                document.getElementById('username').value = "";
                document.getElementById('password').value = "";
                document.getElementById('username').focus();
            };
        };
        return false;
    },
    "click .delete_worker" : function() {
        if(confirm("Are you sure?")) {
            var id = this.value._id;
            workers.remove(
                {
                    "_id" : id
                }
            );
        };
    },
    "click #add_workitem" : function() {
        var name = document.getElementById('name').value;
        if(!name) {
            Session.set("error_new_workitem_form","error");
        };
        if(username) {
            if(work_items.findOne({name:name})) {
                Session.set("error_new_worker_form","error");
            } else {
                var now = new Date();
                work_items.insert(
                    {
                        name : name,
                        last_modified : now,
                        tasks : [],
                        groups : [],
                        active : "yes"
                    }
                );
                Session.set("error_new_workitem_form",null);
                document.getElementById('name').value = "";
                document.getElementById('name').focus();
            };
        };
        return false;
    },
    "click .delete_workitem" : function() {
        if(confirm("Are you sure?")) {
            var id = this.value._id;
            work_items.remove(
                {
                    _id : id
                }
            );
        };
    },
    "click .edit_workitem" : function() {
        console.log(this);
        var id = this.value._id;
        var edit_work_item = work_items.findOne(
            {
                _id : id
            }
        );
        Session.set("edit_work_item",edit_work_item);
    },
    "click .toggle_workitem_active" : function() {
        var id = this.value._id;
        if(this.value.active == "no") {
            var active_status = "yes";
        } else {
            var active_status = "no";
        };
        work_items.update(
            {
                _id : id
            },
            {
                $set : 
                    {
                        active : active_status
                    }
            }
        );
    },
    "click #close_edit_workitem" : function() {
        Session.set("edit_work_item",null);
    },
    "click #update_work_item_name" : function() {
        var name = document.getElementById('name').value;
        if(name) {
            var now = new Date();
            work_items.update(
                {
                    _id : Session.get("edit_work_item")._id
                },
                {
                    $set :
                        {
                            name : name,
                            last_modified : now
                        }
                }
            );
        };
        return false;
    },
    "click .add_work_item_group_to_work_item" : function() {
        var id = Session.get("edit_work_item")._id;
        var group = this.value.name;
        var now = new Date();
        var work_item = work_items.findOne(
            {
                _id : id
            }
        );
        var array_key = work_item.groups.indexOf(group);
        if(array_key != -1) {
            console.log("group already added");
        } else {
            work_items.update(
                {
                    _id : id
                },
                { 
                    $push :
                        {
                            groups : group
                        },
                    $set :
                        {
                            last_modified : now
                        }
                }
            );
        };
    },
    "click .remove_work_item_group_from_work_item" : function() {
        var id = Session.get("edit_work_item")._id;
        var group = this.value;
        var now = new Date();
        work_items.update(
            {
                _id : id
            },
            {
                $pull :
                    {
                        groups : group
                    },
                $set :
                    {
                        last_modified : now
                    }
            }
        );
    },
    "click .add_task_group_to_task" : function() {
        var new_group = this.value.name;
        var id = Session.get("edit_work_item")._id;
        var group = this.value.name;
        var now = new Date();
        var work_item = work_items.findOne(
            {
                _id : id
            }
        );
        var task_key = Session.get("edit_task_key");
        if(work_item.tasks[task_key].group != new_group) {
            var now = new Date();
            var obj = {};
            var field1 = "tasks." + task_key + ".group";
            obj[field1] = new_group;
            var field2 = "last_modified";
            obj[field2] = now;
            work_items.update(
                {
                    _id : id
                },
                {
                    $set : obj
                }
            );
        };
        var new_edit_task = {};
        new_edit_task.name = Session.get("edit_task").name;
        new_edit_task.position = Session.get("edit_task").position;
        new_edit_task.group = new_group;
        new_edit_task.notes = Session.get("edit_task").notes;
        new_edit_task.deadline = Session.get("edit_task").deadline;
        Session.set("edit_task",new_edit_task);
    },
    "click #remove_task_group_from_task" : function() {
        var new_group = "";
        var id = Session.get("edit_work_item")._id;
        var now = new Date();
        var work_item = work_items.findOne(
            {
                _id : id
            }
        );
        var task_key = Session.get("edit_task_key");
        var obj = {};
        var field1 = "tasks." + task_key + ".group";
        obj[field1] = new_group;
        var field2 = "last_modified";
        obj[field2] = now;
        work_items.update(
            {
                _id : id
            },
            {
                $set : obj
            }
        );
        var new_edit_task = {};
        new_edit_task.name = Session.get("edit_task").name;
        new_edit_task.position = Session.get("edit_task").position;
        new_edit_task.group = new_group;
        new_edit_task.notes = Session.get("edit_task").notes;
        new_edit_task.deadline = Session.get("edit_task").deadline;
        Session.set("edit_task",new_edit_task);
    },
    "click #add_task" : function() {
        var position = document.getElementById('position').value;
        var name = document.getElementById('task_name').value;
        var deadline = document.getElementById('deadline').value;
        var notes = document.getElementById('notes').value;
        var id = Session.get("edit_work_item")._id;
        var new_task = 
            {
                position : position,
                name : name,
                deadline : deadline,
                notes : notes
            };
        if(name && position) {
            var now = new Date();
            work_items.update(
                {
                    _id : id
                },
                { 
                    $push :
                        {
                            tasks : new_task
                        }
                }
            );
        };
        return false;
    },
    "click .edit_task" : function() {
        var edit_task = {
            name : this.value.name,
            position : this.value.position,
            task_group : this.value.task_group,
            notes : this.value.notes,
            deadline : this.value.deadline,
            group : this.value.group
        };
        Session.set("edit_task_key",this.key);
        Session.set("edit_task",edit_task);
    },
    "click #close_edit_task" : function() {
        Session.set("edit_task",null);
    },
    "click .delete_task" : function() {
        if(confirm("Are you sure?")) {
            var old_task = 
                {
                    position : this.value.position,
                    name : this.value.name,
                    deadline : this.value.deadline,
                    task_group : this.value.task_group,
                    notes : this.value.notes
                };
            var work_item = Session.get("edit_work_item");
            work_items.update(
                {
                    "_id" : work_item._id
                },
                {
                    $pull : 
                        {
                            tasks : old_task
                        }
                }
            );
        };
    },
    "click #update_task" : function() {
        var current_group_with_spaces = document.getElementById('remove_task_group_from_task').innerHTML;
        var current_group = current_group_with_spaces.trim();
        var now = new Date();
        var task_key = Session.get("edit_task_key");
        var work_item = Session.get("edit_work_item");
        var task_group = work_items.findOne(
            {
                "_id" : work_item._id
            }
        );
        var new_task = 
            {
                position : document.getElementById('new_position').value,
                name : document.getElementById('new_task_name').value,
                deadline : document.getElementById('new_deadline').value,
                notes : document.getElementById('new_notes').value,
                group : current_group
            };
        var obj = {};
        var field = "tasks." + task_key;
        obj[field] = new_task;
        var field2 = "last_modified";
        obj[field2] = now;
        work_items.update(
            {
                "_id" : work_item._id
            },
            {
                $set : obj
            }
        );
        Session.set("edit_task_key",null);
        Session.set("edit_task",null);
        return false;
    },
    "click #add_work_item_group" : function() {
        var name = document.getElementById('work_item_group_name').value;
        if(name) {
            var now = new Date();
            work_item_groups.insert(
                {
                    name : name,
                    last_modified : now
                }
            );
            document.getElementById('work_item_group_name').value = "";
            document.getElementById('work_item_group_name').focus();
        };
        return false;
    },
    "click .delete_work_item_group" : function() {
        if(confirm("Are you sure?")) {
            var id = this.value._id;
            work_item_groups.remove(
                {
                    _id : id
                }
            );
        };
    },
    "click #add_task_group" : function() {
        var name = document.getElementById('task_group_name').value;
        if(name) {
            var now = new Date();
            task_groups.insert(
                {
                    name : name,
                    last_modified : now
                }
            );
            document.getElementById('task_group_name').value = "";
            document.getElementById('task_group_name').focus();
        };
        return false;
    },
    "click .delete_task_group" : function() {
        if(confirm("Are you sure?")) {
            var id = this.value._id;
            task_groups.remove(
                {
                    _id : id
                }
            );
        };
    }
});

Template.page2.todays_log = function() {
    if(Session.get("todays_log")) {
        return Session.get("todays_log");
    };
};
Template.page2.events({
    "click .log_work_item" : function() {
        console.log(this);
    },
    "click .log_task" : function() {
        console.log(this);
    }
});

