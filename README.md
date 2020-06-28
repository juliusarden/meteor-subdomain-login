# Meteor Subdomain Login

## Usage
Please add juliusarden:subdomain-login into your ./meteor/packages before accounts-base in order for it to work on first page visit.


On your settings, set the **domains (required)** and other optional fields
```
// settings.json
{
  ...
  "subdomainLogin": {
    "domains": **["<<YOUR_DOMAIN_HERE>>", "<<YOUR_OTHER_DOMAIN>>"]**,
    "expiresAfterDays": 30,
    "cookieName": "subdomain_token",
    "secure" = true,
    "debug" = false,
  },
}
```



## Credit
Inspired by [jfrolich meteor subdomain persistent login](https://github.com/jfrolich/meteor-subdomain-persistent-login)