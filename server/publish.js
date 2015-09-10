ListView = {};
ListView.publish = function(collection, foreignKeys){
    var pubName = "list_" + collection._name;

    var children = [];
    _.each(foreignKeys, function(key){
        var child = {
            find : function(object){
                if(key.hasOwnProperty('relatedName')){
                    var query = {};
                    query[key.relatedName] = object[key.name];
                    return key.collection.find(query);
                }
                return key.collection.find(object[key.name]);
            }
        }
        children.push(child);
    });

    Meteor.publishComposite(pubName, function (l, sQ, fields) {
        var limit = l || 15;
        var searchQuery = sQ || "";

        var queryList = [];
        if(fields.length > 0){
            _.each(fields, function(key){
                var o = {};
                o[key] = {$regex : searchQuery};
                queryList.push(o);
                
            }); 
        }else{
            _.each(collection.simpleSchema().objectKeys(), function(key){
                var o = {};
                o[key] = {$regex : searchQuery}
                queryList.push(o)
                
            }); 
        }
        
        return {
            find : function(){
            return collection.find({$or : queryList}, {limit: limit});
            },
            children : children,
        }
    
    });
}