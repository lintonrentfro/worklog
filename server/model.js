Meteor.publish("settings", function() {
	return settings.find();
});
Meteor.publish("workers", function() {
	return workers.find();
});
Meteor.publish("work_items", function() {
	return work_items.find();
});
Meteor.publish("work_item_groups", function() {
	return work_item_groups.find();
});
Meteor.publish("task_groups", function() {
	return task_groups.find();
});
Meteor.publish("daily_logs", function() {
	return daily_logs.find();
});

// Meteor.methods({
//     getlog: function(obj) {
//         if(obj.queryType == "by_date") {
//         	return "it's by date";
//         };
//         if(obj.queryType == "by_user") {
//         	return "it's by user";
//         };
//     }
// });