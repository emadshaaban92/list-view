ListView = {};
ListView.publish = function(collection){
    var pubName = "select_" + collection._name;
    Meteor.publish(pubName, function (l, sQ) {
        var limit = l || 15;
        var searchQuery = sQ || "";

        var queryList = [];
        _.each(collection.simpleSchema().objectKeys(), function(key){
            var o = {};
            o[key] = {$regex : searchQuery}
            queryList.push(o)
            
        }); 
        return collection.find({$or : queryList}, {limit: limit});
    
    });
}