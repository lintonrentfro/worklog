/*
 First Time Startup
 */
// wl.first_time_startup();

/*
 Normal Startup
 */
Session.set("home","active");


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
Template.nav.error_form_login = function() {
    if(Session.get("error_form_login")) {
        return Session.get("error_form_login");
    };
};
Template.nav.events({
    "click #home" : function() {
        wl.set_route("home");
    },
    "click #page1" : function() {
        wl.set_route("page1");
    },
    "click #page2" : function() {
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
                        tasks : []
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
                    "_id" : id
                }
            );
        };
    },
    "click .edit_workitem" : function() {
        // console.log(this);
        var id = this.value._id;
        var edit_work_item = work_items.findOne(
            {
                _id : id
            }
        );
        Session.set("edit_work_item",edit_work_item);
    },
    "click #close_edit_workitem" : function() {
        Session.set("edit_work_item",null);
    },
    "click #update_workitem_name" : function() {
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
            deadline : this.value.deadline
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
        var task_key = Session.get("edit_task_key");
        var work_item = Session.get("edit_work_item");
        var new_task = 
            {
                position : document.getElementById('new_position').value,
                name : document.getElementById('new_task_name').value,
                deadline : document.getElementById('new_deadline').value,
                notes : document.getElementById('new_notes').value
            };
        var obj = {};
        var field = "tasks." + task_key;
        obj[field] = new_task;
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
