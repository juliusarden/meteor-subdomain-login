const defaultOptions = { expiresAfterDays: 30, cookieName: 'meteor_subdomain_token' }

export default function initSubdomainPersistentLogin({
  domains,
  expiresAfterDays = defaultOptions.expiresAfterDays,
  cookieName = defaultOptions.cookieName,
}) {
  if (!domains || domains.length === 0) {
    console.error('subdomain-login requires at least 1 domain. Please check your settings.json file');
  }
  if (window.Accounts) {
    console.error('subdomain-login package has been loaded after account-base package. You need to move the import juliusarden:subdomain-login above accounts-base in your .meteor/packages');
  }
  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const setCookieToken = (token, domain, expirationDate) => {
    const expires = expirationDate.toUTCString();
    document.cookie = `${cookieName}=${token}; expires=${expires}; domain=${domain}; path=/; secure;`;
    console.log(`${cookieName}=${token}; expires=${expires}; domain=${domain}; path=/; secure;`);
  };

  const setToken = (loginToken, expires) => {
    domains.map((domain) => setCookieToken(loginToken, domain, expires));
  };

  const removeToken = () => setToken(null, new Date('1970-01-01'));

  // parse cookie string and look for the login token
  const getToken = () => {
    if (document.cookie.length > 0) {
      const cookies = document.cookie.split(';');
      for (let i; i < cookies.length; i++) {
        const cookie = (cookies[i] && cookies[i].split('=')) || [];
        if (cookie.length > 1 && cookie[0].trim() === cookieName) {
          return cookie[1].trim();
        }
      }
      return undefined;
    }
  };

  // --------------------------------------------------------------------------
  // Monkey Patching
  // --------------------------------------------------------------------------

  // override the getter, so in a different subdomain it will get the token
  // from a cookie first when a logintoken in localstorage is not found
  const originalGetItem = window.localStorage.getItem;
  window.localStorage.getItem = (key) => { // eslint-disable-line no-param-reassign
    const original = originalGetItem.call(window.localStorage, key);
    if (key === 'Meteor.loginToken') {
      // in case there is no login token in local storage, try get it from a cookie
      if (!original) return getToken();
    }

    return original;
  };

  // override window.localStorage methods and resetToken accordingly
  const originalSetItem = window.localStorage.setItem;
  window.localStorage.setItem = (key, value) => { // eslint-disable-line no-param-reassign
    if (key === 'Meteor.loginToken') {
      const loginTokenExpires = window.localStorage.getItem('Meteor.loginTokenExpires');

      let date;
      if (loginTokenExpires) {
        date = new Date(loginTokenExpires);
      } else {
        date = new Date();
        date.setDate(date.getDate() + expiresAfterDays);
      }

      setToken(value, date);
    }

    originalSetItem.call(window.localStorage, key, value);
  };

  const originalRemoveItem = window.localStorage.removeItem;
  window.localStorage.removeItem = (key) => { // eslint-disable-line no-param-reassign
    if (key === 'Meteor.loginToken') removeToken();
    originalRemoveItem.call(window.localStorage, key);
  };
}