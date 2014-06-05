settings = new Meteor.Collection("settings");
settings.allow({
    insert: function (userId, doc) {
        return true;
    },
    update: function(userId, doc) {
        return true;
    },
    remove: function(userId, doc) {
        return true;
    }
});

workers = new Meteor.Collection("workers");
workers.allow({
    insert: function (userId, doc) {
        return true;
    },
    update: function(userId, doc) {
        return true;
    },
    remove: function(userId, doc) {
        return true;
    }
});

work_items = new Meteor.Collection("work_items");
work_items.allow({
    insert: function (userId, doc) {
        return true;
    },
    update: function(userId, doc) {
        return true;
    },
    remove: function(userId, doc) {
        return true;
    }
});

work_item_groups = new Meteor.Collection("work_item_groups");
work_item_groups.allow({
    insert: function (userId, doc) {
        return true;
    },
    update: function(userId, doc) {
        return true;
    },
    remove: function(userId, doc) {
        return true;
    }
});

task_groups = new Meteor.Collection("task_groups");
task_groups.allow({
    insert: function (userId, doc) {
        return true;
    },
    update: function(userId, doc) {
        return true;
    },
    remove: function(userId, doc) {
        return true;
    }
});