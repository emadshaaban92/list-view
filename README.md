# DESCRIPTION
Simple Widget to generate a List View for your Meteor Collection based on Simple Schema.
It's inspired from the example in this [Blog Post](https://www.discovermeteor.com/blog/template-level-subscriptions/), Thanks [@SachaG](https://github.com/SachaG) .



# Usage
* First you must create your collection and have it shared between client and server.
* Then you must attach a Schema to your collection.
* Make sure you have removed the auto-publish package.
* Pub/Sub Logic is done for you, all you need is to add this line to your server code.

        ListView.publish(Collection);

Where Collection is your Meteor Collection Object.

* Then add this to your template

        {{> ListView collection=data  }}

Where data is a template helper which returns the Meteor Collection Object.

## Example
Say you have a collection for Customers.

```javascript
Customers = new Mongo.Collection("customers");
```
You have to define a schema for your customer object like this.

    Customers.attachSchema(new SimpleSchema({
      name: {
        type: String,
        label: "Name",
        max: 200
      },
      phoneNumber: {
        type: String,
        label: "Phone Number",
        optional : true,
      },
      address: {
        type: String,
        label: "Address",
        optional : true
      }
    }));

Use the ListView publish function to make customers available in client code.

    if (Meteor.isServer) {
      Meteor.startup(function () {
        // code to run on server at startup
        ListView.publish(Customers);
      });
    }

In your client code make a new helper whiche returns the collection object to make it available in template.

    if (Meteor.isClient) {
      Template.listViewExample.helpers({
         data : function(){
            return Customers;
          }
      });
    }

In your template code use the ListView template where you want and pass it the collection object.

    <template name="listViewExample">
      {{> ListView collection=data  }}
    </template>


