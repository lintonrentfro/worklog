Meteor.publish("settings", function(){
	return settings.find();
});
Meteor.publish("workers", function(){
	return workers.find();
});
Meteor.publish("work_items", function(){
	return work_items.find();
});
Meteor.publish("work_item_groups", function(){
	return work_item_groups.find();
});
Meteor.publish("task_groups", function(){
	return task_groups.find();
});