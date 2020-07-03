const defaultOptions = {
  expiresAfterDays: 30,
  cookieName: 'meteor_subdomain_token',
  secure: true,
  debug: false,
  ignoreLocalStorage: false,
};

export default function initSubdomainPersistentLogin({
  domains,
  expiresAfterDays = defaultOptions.expiresAfterDays,
  cookieName = defaultOptions.cookieName,
  secure = defaultOptions.secure,
  debug = defaultOptions.debug,
  ignoreLocalStorage = defaultOptions.ignoreLocalStorage,
}) {
  if (!domains || domains.length === 0) {
    console.error('subdomain-login requires at least 1 domain. Please check your settings.json file');
    return;
  }
  if (window.Accounts) {
    console.error('subdomain-login package has been loaded after account-base package. You need to move the import juliusarden:subdomain-login above accounts-base in your .meteor/packages');
    return;
  }
  const meteor = Meteor;
  if (!meteor) {
    console.error('Meteor is not available. This is a bug.');
    return;
  }
  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  const setCookieToken = (token, domain, expirationDate) => {
    const expires = expirationDate.toUTCString();
    const cookieString = `${cookieName}=${token}; expires=${expires}; domain=${domain}; path=/;${secure ? ' secure;' : ''}`;
    document.cookie = cookieString;
    if (debug) {
      console.log(`Setting document.cookie = ${cookieString}`);
    }
  };

  const setToken = (loginToken, expires) => {
    domains.map((domain) => setCookieToken(loginToken, domain, expires));
  };

  const removeToken = () => setToken(null, new Date('1970-01-01'));

  // parse cookie string and look for the login token
  const getToken = () => {
    if (document.cookie.length > 0) {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = (cookies[i] && cookies[i].split('=')) || [];
        if (cookie.length > 1 && cookie[0].trim() === cookieName) {
          return cookie[1].trim();
        }
      }
    }
    return undefined;
  };

  // --------------------------------------------------------------------------
  // Monkey Patching
  // --------------------------------------------------------------------------

  // override the getter, so in a different subdomain it will get the token
  // from a cookie first when a logintoken in localstorage is not found
  const originalGetItem = meteor._localStorage.getItem;
  meteor._localStorage.getItem = (key) => { // eslint-disable-line no-param-reassign
    const original = originalGetItem.call(meteor._localStorage, key);
    if (key === 'Meteor.loginToken') {
      if (debug) {
        console.log(`Calling localStorage.getItem(${key}), original=${original}, mask=${getToken()}`);
      }
      if (ignoreLocalStorage) {
        return getToken();
      }
      // in case there is no login token in local storage, try get it from a cookie
      if (!original) return getToken();
    }
    if (debug && key === 'Meteor.loginTokenExpires') {
      console.log(`Calling localStorage.getItem(${key}), original=${original}, mask=${getToken()}`);
    }
    return original;
  };

  // override meteor._localStorage methods and resetToken accordingly
  const originalSetItem = meteor._localStorage.setItem;
  meteor._localStorage.setItem = (key, value) => { // eslint-disable-line no-param-reassign
    if (key === 'Meteor.loginToken') {
      const loginTokenExpires = meteor._localStorage.getItem('Meteor.loginTokenExpires');

      let date;
      if (loginTokenExpires) {
        date = new Date(loginTokenExpires);
      } else {
        date = new Date();
        date.setDate(date.getDate() + expiresAfterDays);
      }

      if (debug) {
        console.log(`Calling localStorage.setItem(${key}, ${value}). Expiry date is set to ${date.toUTCString()}`);
      }
      setToken(value, date);

      // Not setting localStorage if we are using cookie with ignoreLocalStorage = true
      if (ignoreLocalStorage) {
        return;
      }
    }
    originalSetItem.call(meteor._localStorage, key, value);
  };

  const originalRemoveItem = meteor._localStorage.removeItem;
  meteor._localStorage.removeItem = (key) => { // eslint-disable-line no-param-reassign
    if (key === 'Meteor.loginToken') removeToken();
    originalRemoveItem.call(meteor._localStorage, key);
  };
}
