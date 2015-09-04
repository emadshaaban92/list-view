# DESCRIPTION
Simple Widget to generate a List View for your Meteor Collection based on Simple Schema

# DEPENDENCIES


# Usage
* First you must create your collection and have it shared between client and server.
* Then you must attach a Schema to your collection.
* Make sure you have removed the auto-publish package.
* Pub/Sub Logic is done for you, all you need is to add this line to your server code.

        ListView.publish(Collection);

Where Collection is your Meteor Collection Object.

* Then add this to your template

> {{> ListView collection=data  }}

Where data is a template helper which returns the Meteor Collection Object.
