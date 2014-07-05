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
Handlebars.registerHelper("daily_log", function() {
    if(Session.get("daily_log")) {
        return Session.get("daily_log");
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
    if(month < 10) {
        month = "0" + month;
    };
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
        // date testing: this all works

        // var now = new Date();
        // var year = now.getFullYear();
        // var month = now.getMonth() + 1;
        // if(month < 10) {
        //     month = "0" + month.toString();
        // };
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
    "click #daily_log" : function() {

        // calculate today's Y:M:D
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        if(month < 10) {
            month = "0" + month.toString();
        };
        var day = now.getDate();
        if(day < 10) {
            day = "0" + day.toString();
        };
        var ymd = year + '-' + month + '-' + day;

        // get today's log
        var log_for_today = daily_logs.findOne(
            {
                day : ymd
            }
        );

        // if today's log already exists use as by default
        // if it doesn't already exist, don't load any log
        if(!log_for_today) {
            console.log("there's no log for " + ymd);
            wl.set_route("daily_log");
            // wl.start_new_daily_log(ymd);

        } else {
            // console.log("loading existing daily log for " + ymd);
            wl.load_daily_log(ymd);
            // console.log("deleting today's log");
            // wl.set_route("daily_log");
        };
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
        var id = this.value._id;
        var edit_work_item = work_items.findOne(
            {
                _id : id
            }
        );
        Session.set("edit_work_item",edit_work_item);
        document.body.scrollTop = document.documentElement.scrollTop = 0;
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
        console.log("var new_group = " + new_group);
        var id = Session.get("edit_work_item")._id;

        // something wrong here
        // we've got new_group and group defined the same way
        var group = this.value.name;

        // update the work_item "last_modified" and "group" attributes
        var now = new Date();
        var work_item = work_items.findOne(
            {
                _id : id
            }
        );
        var task_key = Session.get("edit_task_key");
        console.log("var task_key = " + task_key);
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
            notes : this.value.notes,
            deadline : this.value.deadline,
            group : this.value.group
        };
        Session.set("edit_task",edit_task);

        // save the array key for this task as stored in mongo
        var tasks = Session.get("edit_work_item").tasks;
        for(var i=0; tasks.length>i; i++) {
            if(tasks[i].name == edit_task.name && tasks[i].position == edit_task.position && tasks[i].group == edit_task.group) {
                Session.set("edit_task_key", i);
            };
        };

        document.body.scrollTop = document.documentElement.scrollTop = 0;
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

Template.daily_log.todays_log = function() {
    if(Session.get("todays_log")) {
        return Session.get("todays_log");
    };
};
Template.daily_log.wi_groups = function() {
    if(Session.get("wi_groups")) {
        return Session.get("wi_groups");
    };
};
Template.daily_log.task_groups = function() {
    if(Session.get("task_groups")) {
        return Session.get("task_groups");
    };
};
Template.daily_log.rendered = function() {
   $('[rel=tooltip]').tooltip();
};
Template.daily_log.events({
    "click .log_work_item" : function() {
        console.log(this);
    },
    "click .log_task" : function() {
        console.log(this);
    },
    "click .filter_wi_group" : function() {
        var wi_group = this.value.name;
        var view_filters = Session.get("view_filters");
        if(view_filters.group_filters) {
            if(view_filters.group_filters.indexOf(wi_group) != -1) {
                var element = view_filters.group_filters.indexOf(wi_group);
                view_filters.group_filters.splice(element,1);
            } else {
                view_filters.group_filters.push(this.value.name);
            };

        } else {
            view_filters.group_filters = [];
            view_filters.group_filters.push(this.value.name);
        };
        Session.set("view_filters",view_filters);
        
        // recalculate todays_log obj in Session
        var log_obj = Session.get("todays_log");
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
        if(view_filters.group_filters.length == 0) {
            for(var i=0; log_obj.work_items.length>i; i++) {
                log_obj.work_items[i].visible = "hidden";
            };
        };
        Session.set("todays_log",log_obj);

        // recalculate the wi_group template obj to include visual indicator of selected status
        var wi_groups = Session.get("wi_groups");
        for(var i=0; wi_groups.length>i; i++) {
            for(var ii=0; view_filters.group_filters.length>ii; ii++) {
                if(wi_groups[i].name != view_filters.group_filters[ii]) {
                    wi_groups[i].visual = "wi_group_not_selected";
                } else {
                    wi_groups[i].visual = "wi_group_selected";
                    break;
                };
            };
        };
        if(view_filters.group_filters.length == 0) {
            for(var i=0; wi_groups.length>i; i++) {
                wi_groups[i].visual = "wi_group_not_selected";
            };
        };
        Session.set("wi_groups",wi_groups);
    },
    "click .filter_task_group" : function() {
        var task_group = this.value.name;
        var view_filters = Session.get("view_filters");
        if(view_filters.task_filters) {
            if(view_filters.task_filters.indexOf(task_group) != -1) {
                var element = view_filters.task_filters.indexOf(task_group);
                view_filters.task_filters.splice(element,1);
            } else {
                view_filters.task_filters.push(this.value.name);
            };

        } else {
            view_filters.task_filters = [];
            view_filters.task_filters.push(this.value.name);
        };
        Session.set("view_filters",view_filters);

        // recalculate todays_log obj in Session
        var log_obj = Session.get("todays_log");
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
        if(view_filters.task_filters.length == 0) {
            for(var i=0; log_obj.work_items.length>i; i++) {
                for(var ii=0; log_obj.work_items[i].tasks.length>ii; ii++) {
                    log_obj.work_items[i].tasks[ii].visible = "hidden";
                };
            };
        };
        Session.set("todays_log",log_obj);

        // recalculate the task_group template obj to include visual indicator of selected status
        var tsk_groups = Session.get("task_groups");
        for(var i=0; tsk_groups.length>i; i++) {
            for(var ii=0; view_filters.task_filters.length>ii; ii++) {
                if(tsk_groups[i].name != view_filters.task_filters[ii]) {
                    tsk_groups[i].visual = "task_group_not_selected";
                } else {
                    tsk_groups[i].visual = "task_group_selected";
                    break;
                };
            };
        };
        if(view_filters.task_filters.length == 0) {
            for(var i=0; tsk_groups.length>i; i++) {
                tsk_groups[i].visual = "task_group_not_selected";
            };
        };
        Session.set("task_groups",tsk_groups);
    },
    "click #toggle_all_wi_groups" : function() {
        var view_filters = Session.get("view_filters");
        var all_wi_group_filters = Session.get("wi_groups");
        
        // if there are no group filters set, add an empty array for them
        // and add all the available wi group filters to it
        if(!view_filters.group_filters || view_filters.group_filters.length == 0) {
            view_filters.group_filters = [];
            for(var i=0; all_wi_group_filters.length>i; i++) {
                view_filters.group_filters.push(all_wi_group_filters[i].name);
            };
        } else {
            // if there were any active group filters, remove them
            view_filters.group_filters = [];
        };
        
        Session.set("view_filters", view_filters);

        // recalculate todays_log obj in Session
        var log_obj = Session.get("todays_log");
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
        if(view_filters.group_filters.length == 0) {
            for(var i=0; log_obj.work_items.length>i; i++) {
                log_obj.work_items[i].visible = "hidden";
            };
        };
        Session.set("todays_log",log_obj);

        // recalculate the wi_group template obj to include visual indicator of selected status
        var wi_groups = Session.get("wi_groups");
        for(var i=0; wi_groups.length>i; i++) {
            for(var ii=0; view_filters.group_filters.length>ii; ii++) {
                if(wi_groups[i].name != view_filters.group_filters[ii]) {
                    wi_groups[i].visual = "wi_group_not_selected";
                } else {
                    wi_groups[i].visual = "wi_group_selected";
                    break;
                };
            };
        };
        if(view_filters.group_filters.length == 0) {
            for(var i=0; wi_groups.length>i; i++) {
                wi_groups[i].visual = "wi_group_not_selected";
            };
        };
        Session.set("wi_groups",wi_groups);
    },
    "click #toggle_all_task_groups" : function() {
        var view_filters = Session.get("view_filters");
        var all_task_group_filters = Session.get("task_groups");
        
        // if there are no task filters set, add an empty array for them
        // and add all the available task group filters to it
        if(!view_filters.task_filters || view_filters.task_filters.length == 0) {
            view_filters.task_filters = [];
            for(var i=0; all_task_group_filters.length>i; i++) {
                view_filters.task_filters.push(all_task_group_filters[i].name);
            };
        } else {
            // if there were any active group filters, remove them
            view_filters.task_filters = [];
        };
        
        Session.set("view_filters", view_filters);

        // recalculate todays_log obj in Session
        var log_obj = Session.get("todays_log");
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
        if(view_filters.task_filters.length == 0) {
            for(var i=0; log_obj.work_items.length>i; i++) {
                for(var ii=0; log_obj.work_items[i].tasks.length>ii; ii++) {
                    log_obj.work_items[i].tasks[ii].visible = "hidden";
                };
            };
        };
        Session.set("todays_log",log_obj);

        // recalculate the task_group template obj to include visual indicator of selected status
        var tsk_groups = Session.get("task_groups");
        for(var i=0; tsk_groups.length>i; i++) {
            for(var ii=0; view_filters.task_filters.length>ii; ii++) {
                if(tsk_groups[i].name != view_filters.task_filters[ii]) {
                    tsk_groups[i].visual = "task_group_not_selected";
                } else {
                    tsk_groups[i].visual = "task_group_selected";
                    break;
                };
            };
        };
        if(view_filters.task_filters.length == 0) {
            for(var i=0; tsk_groups.length>i; i++) {
                tsk_groups[i].visual = "task_group_not_selected";
            };
        };
        Session.set("task_groups",tsk_groups);
    },
    "click #start_todays_log" : function() {
        // calculate today's Y:M:D
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        if(month < 10) {
            month = "0" + month.toString();
        };
        var day = now.getDate();
        if(day < 10) {
            day = "0" + day.toString();
        };
        var ymd = year + '-' + month + '-' + day;

        // get today's log
        var log_for_today = daily_logs.findOne(
            {
                day : ymd
            }
        );

        // make sure today's log does not already exist
        if(!log_for_today) {
            console.log("there's no log for " + ymd);
            console.log("creating one ...");
            wl.start_new_daily_log(ymd);
        } else {
            console.log("today's log found (someone may have just made it)");
            console.log("loading existing daily log for " + ymd);
            wl.load_daily_log(ymd);
        };
    },
    "click #load_log_with_date" : function() {
        var requested_date = document.getElementById('log_date').value;

        // get this log
        var log_requested = daily_logs.findOne(
            {
                day : requested_date
            }
        );

        // if this log exists, load it
        if(log_requested) {
            console.log("found existing log and loading it for: " + requested_date);
            wl.load_daily_log(requested_date);
        } else {
            console.log("couldn't find log for: " + requested_date);
        };
    },
    "click .work_item_task" : function() {
        var this_user = Session.get("user").username;
        var now = new Date();
        var log_id = this.value.parent_log_item_id;
        var work_item_key = this.value.parent_work_item_key;
        var task_key = this.key;

        if(Session.get("todays_log").work_items[work_item_key].tasks[task_key].completed_by) {
            // if the admin is logged in, remove that the task was completed
            if(this_user == "admin") {
                if(confirm("Reset this task to incomplete?")) {
                    var obj = {};
                    var field1 = "work_items." + work_item_key + ".tasks." + task_key + ".completed_by";
                    obj[field1] = "";
                    var field2 = "work_items." + work_item_key + ".tasks." + task_key + ".completed_time";
                    obj[field2] = "";

                    // update the db
                    daily_logs.update(
                        {
                            _id : log_id
                        },
                        {
                            $set : obj
                        }
                    );
                };
            } else {
                alert("Only the application administrator can edit a completed task.");
            };
        } else {
            var obj = {};
            var field1 = "work_items." + work_item_key + ".tasks." + task_key + ".completed_by";
            obj[field1] = this_user;
            var field2 = "work_items." + work_item_key + ".tasks." + task_key + ".completed_time";
            obj[field2] = now;

            // update the db
            daily_logs.update(
                {
                    _id : log_id
                },
                {
                    $set : obj
                }
            );
        };
    }
});

Template.reports.daily_log_csv = function() {
    if(Session.get("daily_log_csv")) {
        return Session.get("daily_log_csv");
    };
};
Template.reports.events({
    "click #show_log_xml_for_date" : function() {
        var requested_date = document.getElementById('log_date').value;
        var log_requested = daily_logs.findOne(
            {
                day : requested_date
            }
        );
        if(log_requested) {
            console.log("found that day");
            var csv = wl.daily_log_csv_report(log_requested);
            Session.set("daily_log_csv",csv);

        } else {
            console.log("nuh uh");
        }
    }
});

// refresh the visual indicators of "lateness" every two seconds when user is viewing a live log
setInterval(wl.refresh_live_log, 700);

