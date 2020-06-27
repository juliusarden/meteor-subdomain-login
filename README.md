# Meteor Subdomain Login

## Usage
Please add juliusarden:subdomain-login into your ./meteor/packages before accounts-base in order for it to work on first page visit.


On your settings, set the **domains (required)**, expiry (optional) and cookieName (optional)
```
// settings.json
{
  ...
  "subdomainLogin": {
    "domains": "insidesherpa.com",
    "expiresAfterDays": 30,
    "cookieName": "subdomain_token"
  },
}
```



## Credit
Inspired by [jfrolich meteor subdomain persistent login](https://github.com/jfrolich/meteor-subdomain-persistent-login)