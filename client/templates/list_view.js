var routeChanged =  new ReactiveVar(0);
var n = 0;

Template.ListView.events({
  'click .load-more': function (event, instance) {
    event.preventDefault();

    var limit = instance.limit.get();

    console.log(instance);
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
    var data = Template.instance().data;
    if(data.fields != undefined){
      return data.fields.split(",");
    }
    if(data.settings.hasOwnProperty('fields')){
      return _.map(data.settings.fields, function(field){
        return field.name;
      });
    }
    if(!data.collection.hasOwnProperty('simpleSchema')){
      console.log("You must either include fields in your settings or use simple schema for your collection");
      return [];
    }
    if(data.exclude != undefined){
      var exclude = data.exclude.split(",");
      return _.filter(data.collection.simpleSchema().objectKeys(), function(key){
        return  exclude.indexOf(key) == -1;
      });
    }
    return data.collection.simpleSchema().objectKeys();
  },
  getFieldLable : function(name){
    var data = Template.instance().data;
    //console.log(data);
    if(data.settings.hasOwnProperty('fields')){
      var fields = _.filter(data.settings.fields, function(field){
        return field.name == name;
      });
      if(fields.length > 0){
        return fields[0].label;
      }else{
        return "";
      }
    }
    return data.collection.simpleSchema()._schema[name].label;
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
  },
  virtualColumns : function(){
    if(Template.instance().data.settings.virtualColumns == undefined){
      return [];
    }
    return Template.instance().data.settings.virtualColumns;
  }
});

Template.ListView.created = function () {

  // 1. Initialization
  var instance = this;
  var pubName = "list_" + instance.data.collection._name;

    
  instance.startLimit = instance.data.limit || 15;
  instance.increase = instance.data.increase || 5;

  // initialize the reactive variables
  instance.loaded = new ReactiveVar(0);
  instance.limit = new ReactiveVar(instance.startLimit);
  instance.searchQuery = "";


  instance.autorun(function () {
    var pubName = "list_" + instance.data.collection._name;

    console.log(instance);
    console.log(Template.instance());
    console.log(pubName);

    //check for route changing
    console.log(routeChanged.get());
    console.log(" Change = " + n);

    // get the limit
    var limit = instance.limit.get();
    
    var searchQuery = instance.searchQuery;
    var fields = [];
    if(instance.data.settings.hasOwnProperty('fields')){
      _.each(instance.data.settings.fields, function(field){
        fields.push(field.name);
      });
    }


    console.log("Asking for "+limit+" objects…")

    // subscribe to the objects publication
    var subscription = instance.subscribe(pubName, limit, searchQuery, fields);

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
      if(instance.data.settings.hasOwnProperty('fields')){
        _.each(instance.data.settings.fields, function(field){
          var o = {};
          o[field.name] = {$regex : instance.searchQuery};
          queryList.push(o);
        });
      }else{
          _.each(instance.data.collection.simpleSchema().objectKeys(), function(key){
              var o = {};
              o[key] = {$regex : instance.searchQuery}
              queryList.push(o)
              
          });
      }
     var sortKey = instance.data.settings.sortKey || '_id';
     var sortObj = {};
     sortObj[sortKey] = -1;
     return instance.data.collection.find({$or : queryList}, {limit: instance.loaded.get(), sort: sortObj});
    }

  instance.autorun(function(){
      var objects_count = instance.objects().length;
      window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
    });
  

  // ...
}


Router.onAfterAction(function() {
    setTimeout(function(){ 
      n += 1;
      routeChanged.set(n);
      $('.search-box').val("");
      $('.search-box').trigger('input');
    }, 1);
});