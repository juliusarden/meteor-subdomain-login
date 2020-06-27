Package.describe({
  name: 'juliusarden:subdomain-login',
  version: '0.0.2',
  summary: 'Persistent Login across subdomains using cookies',
  git: 'https://github.com/juliusarden/meteor-subdomain-login',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.10.1');
  api.use('ecmascript');
  api.use('localstorage');
  api.mainModule('subdomain-login.js', 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('juliusarden:subdomain-login');
  api.mainModule('subdomain-login-tests.js');
});
