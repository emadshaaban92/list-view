ListView = {};
ListView.publish = function(collection){
    var pubName = "list_" + collection._name;
    Meteor.publish(pubName, function (l, sQ, fields) {
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
        
        return collection.find({$or : queryList}, {limit: limit});
    
    });
}