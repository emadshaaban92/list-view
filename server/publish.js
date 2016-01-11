ListView = {};
ListView.publications = {};
ListView.registerPublication = function(collection, _children, sortKey){
    var pubName = "list_" + collection._name;
    var children = _children || [];
    if(ListView.publications.hasOwnProperty(pubName)){
        var oldChildren = ListView.publications[pubName].children || [];
        var updatedChildren = oldChildren.concat(children);
        ListView.publications[pubName].children = updatedChildren;
        
        ListView.publications[pubName].sortKey = sortKey || ListView.publications[pubName].sortKey;
    }else{
        ListView.publications[pubName] = {
            collection : collection,
            children : children,
            sortKey : sortKey || '_id',
        }
    }
    
}

ListView.publishAll = function(){
    _.each(ListView.publications, function(pub, pubName){
        ListView.publish(pub.collection, pub.children, pubName, pub.sortKey);
    })
}

ListView.publish = function(collection, _children, _pubName, sortKey){
    var pubName = _pubName || "list_" + collection._name;
    var children = [];
    _.each(_children, function(key){
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
                var sortObj = {};
                sortObj[sortKey] = -1;
                return collection.find({$or : queryList}, {limit: limit, sort: sortObj});
            },
            children : children,
        }
    
    });
}