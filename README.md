# Introduction

The code present in this repository is a fork of https://github.com/megamanics/replacor.git.

Multiple changes were performed to accommodate multiple pages.

# Requirements to execute script
- Confluence API TOKEN (classic)
- Node 24.8.0

# Setup

```
npm install
```

# Search and Replace CLI

```
./searchreplace.js  -h
Usage: search.js [options]

CLI to search Confluence Pages

Options:
-V, --version                   output the version number
-q, --query <query>             CQL query to search for, eg: space = XXX
-u, --user  <user>              user eg: your_email@domain.com
-t, --token <token>             your_user_api_token with scope read:content-details:confluence,write:content:confluence. If possible use a classic token to avoid problems when using in older APIs.
-d, --domain <domainurl>        eg: https://<domain_name>.atlassian.net
-s, --search <CQL Search term>  eg: term to search in CQL
--debug                         add extra debugging output
-r, --replace  <string>         replacement string eg: gitlab -> github
-f, --find  <string>            string to search and replace eg: gitlab
--dryrun                        dry run only
-h, --help                      display help for command
```

## Some CLI parameters details

### -q --query <query>

The _-q_ parameter is used to give a narrow search scope. 
For example restrict search to a certain space, or asset type.

Example to narrow search to space Documentation (key is DOC) and only  to search in pages.
```
space = DOC and type = page
```
### -s, --search <CQL Search term>

The _-s_ parameter is used to give the specific text to search.
Attention to escaping special characters.
It is preferred to give this parameter in a URL encoded form. 

Example to search a URL "example-1.com".

```
example%5C-1.com
```



## Examples of execution

### Search only

Having the following environment variables:
QUERY_X=example%5C-1.com
QUERY_Y=space%20%3D%20DEV%20and%20type%20%3D%20page%20
CONFLUENCE_DOMAIN=https://mydomain.atlassian.net
CONFLUENCE_USER=mysuser@mydomain.com
CONFLUENCE_TOKEN=ATATT3XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIND_STR=example-1.com

```
./searchreplace.js  -q $QUERY_Y -u $CONFLUENCE_USER -t $CONFLUENCE_TOKEN -d $CONFLUENCE_DOMAIN -s $QUERY_X -f $FIND_STR                                                             
```

Will process all results and return something similar to:

┌─────────┬─────────────┬────────┬──────────────────────────────────────────────┬─────────────────────────────────────────────────────┬───────────────────────┐
│ (index) │ id          │ type   │ url                                          │ title                                               │ space                 │
├─────────┼─────────────┼────────┼──────────────────────────────────────────────┼─────────────────────────────────────────────────────┼───────────────────────┤
│ 0       │ '111111111' │ 'page' │ 'https://mydomain.atlassian.net/wiki/x/QYCQ' │ 'Title one - Best one before two'                   │ '/rest/api/space/DEV' │
│ 1       │ '222222222' │ 'page' │ 'https://mydomain.atlassian.net/wiki/x/x4Dg' │ 'Second title - Not the first one. Maybe the ONE'   │ '/rest/api/space/DEV' │
└─────────┴─────────────┴────────┴──────────────────────────────────────────────┴─────────────────────────────────────────────────────┴───────────────────────┘

### Search and Replace

It is enough to add the _-r_ flag to activate the replace.

Having the following environment variables:
QUERY_X=example%5C-1.com
QUERY_Y=space%20%3D%20DEV%20and%20type%20%3D%20page%20
CONFLUENCE_DOMAIN=https://mydomain.atlassian.net
CONFLUENCE_USER=mysuser@mydomain.com
CONFLUENCE_TOKEN=ATATT3XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIND_STR=example-1.com
SUBS_STR=new.example.com

```
./searchreplace.js  -q $QUERY_Y -u $CONFLUENCE_USER -t $CONFLUENCE_TOKEN -d $CONFLUENCE_DOMAIN -s $QUERY_X -f $FIND_STR -r $SUBS_STR                                                             
```

Will process all results and return something similar to:

┌─────────┬─────────────┬────────┬──────────────────────────────────────────────┬─────────────────────────────────────────────────────┬───────────────────────┐
│ (index) │ id          │ type   │ url                                          │ title                                               │ space                 │
├─────────┼─────────────┼────────┼──────────────────────────────────────────────┼─────────────────────────────────────────────────────┼───────────────────────┤
│ 0       │ '111111111' │ 'page' │ 'https://mydomain.atlassian.net/wiki/x/QYCQ' │ 'Title one - Best one before two'                   │ '/rest/api/space/DEV' │
│ 1       │ '222222222' │ 'page' │ 'https://mydomain.atlassian.net/wiki/x/x4Dg' │ 'Second title - Not the first one. Maybe the ONE'   │ '/rest/api/space/DEV' │
└─────────┴─────────────┴────────┴──────────────────────────────────────────────┴─────────────────────────────────────────────────────┴───────────────────────┘



# Reference

https://developer.atlassian.com/server/confluence/advanced-searching-using-cql
https://developer.atlassian.com/server/confluence/performing-text-searches-using-cql
