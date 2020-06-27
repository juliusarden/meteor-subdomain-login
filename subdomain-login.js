import initSubdomainPersistentLogin from './lib/init';

if (process.env.SUBDOMAIN_LOGIN_SETTINGS) {
  initSubdomainPersistentLogin(JSON.parse(process.env.SUBDOMAIN_LOGIN_SETTINGS));
} else if (Meteor.settings.public.subdomainLogin) {
  initSubdomainPersistentLogin(Meteor.settings.public.subdomainLogin);
}
