Template.ListView.events({
  'click .load-more': function (event, instance) {
    event.preventDefault();

    var limit = instance.limit.get();

    // increase limit  and update it
    limit += instance.increase;
    instance.limit.set(limit);

    return false;
    
  },
  'input .search-box' : function(event, instance){
    var value = $(event.target).val();
    instance.searchQuery = value;
    instance.limit.set(0);
    instance.limit.set(instance.startLimit);
  }
});



Template.ListView.helpers({
  // the objects cursor
  objects: function () {
    console.log(Template.instance().limit.get());
    return Template.instance().objects();
  },
  // are there more objects to show?
  hasMoreObjects: function () {
    return Template.instance().objects().count() >= Template.instance().limit.get();
  },
  field : function(object, name){
    return object[name];
  },
  fields : function(){
    if(Template.instance().data.fields != undefined){
      return Template.instance().data.fields.split(",");
    }
    if(Template.instance().data.exclude != undefined){
      var exclude = Template.instance().data.exclude.split(",");
      return _.filter(Template.instance().data.collection.simpleSchema().objectKeys(), function(key){
        return  exclude.indexOf(key) == -1;
      });
    }
    return Template.instance().data.collection.simpleSchema().objectKeys();
  },
  getFieldLable : function(name){
    return Template.instance().data.collection.simpleSchema()._schema[name].label;
  },
  rowClass : function(){
    if(Template.instance().data.settings.rowClass == undefined){
      return "";
    }
    return Template.instance().data.settings.rowClass(this);
  },
  tableClass : function(){
    if (Template.instance().data.settings.tableClass == undefined){
       return "table table-stripped table-hover";
    }
    return Template.instance().data.settings.tableClass();
  },
  fieldClass : function(object, fieldName){
    if(Template.instance().data.settings.fieldClass == undefined){
      return "";
    }
    return Template.instance().data.settings.fieldClass(object, fieldName);
  }
});

Template.ListView.created = function () {

  // 1. Initialization
  var instance = this;

  var pubName = "select_" + instance.data.collection._name;

  
  instance.startLimit = instance.data.limit || 15;
  instance.increase = instance.data.increase || 5;

  // initialize the reactive variables
  instance.loaded = new ReactiveVar(0);
  instance.limit = new ReactiveVar(instance.startLimit);
  instance.searchQuery = "";

  instance.autorun(function () {

    // get the limit
    var limit = instance.limit.get();
    var searchQuery = instance.searchQuery;

    console.log("Asking for "+limit+" objects…")

    // subscribe to the objects publication
    var subscription = instance.subscribe(pubName, limit, searchQuery);

    // if subscription is ready, set limit to newLimit
    if (subscription.ready()) {
      console.log("> Received "+limit+" objects. \n\n")
      instance.loaded.set(limit);
    } else {
      console.log("> Subscription is not ready yet. \n\n");
    }
  });

  instance.objects = function() {
    var queryList = [];
    _.each(instance.data.collection.simpleSchema().objectKeys(), function(key){
        var o = {};
        o[key] = {$regex : instance.searchQuery}
        queryList.push(o)
        
    });    
   return instance.data.collection.find({$or : queryList}, {limit: instance.loaded.get()});
  }

  instance.autorun(function(){
    var objects_count = instance.objects().length;
    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
  });

  // ...
}