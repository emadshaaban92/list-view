Package.describe({
  name: 'emadshaaban:list-view',
  version: '0.0.6',
  // Brief, one-line summary of the package.
  summary: 'Simple List View Widget',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/emadshaaban92/list-view',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use('underscore');
  api.use('jquery');
  api.use('templating');
  api.use('reactive-var');
  api.use('twbs:bootstrap@3.3.5');
  api.use('aldeed:collection2@2.5.0');
  api.use('sacha:spin@2.3.1');


  api.imply('aldeed:collection2@2.5.0');
  

  api.addFiles('client/templates/list_view.html', ['client']);
  api.addFiles('client/templates/list_view.js', ['client']);
  api.addFiles('server/publish.js' , ['server']);

  api.export('ListView');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('emadshaaban:list-view');
  api.addFiles('list-view-tests.js');
});
