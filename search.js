#!/usr/bin/env node

import dotenv from 'dotenv'
import {Command} from 'commander'
import {diffWordsWithSpace} from "diff";
import colors from "colors";

let user;
let token;
let query;
let domain;
let debug;
let search;
let replace;
let dryrun;
let find;
let searchQuery;
let header;
const hm = [];

function replaceString(content) {
  const regex = new RegExp(find, "g");

  return content.replace(regex, replace);
}

function showDiff(content, replacedContent) {

  if (content != replacedContent) {
    const dff = diffWordsWithSpace(content, replacedContent, {
      ignoreCase: true,
      ignoreWhitespace: true,
    });
    let diffstr = "";

    dff.forEach((part) => {
      const color = part.added ? "green" : part.removed ? "red" : "grey";

      diffstr += colors[color](part?.value);
    });

    return diffstr;
  }
  else {
    return "no changes";
  }
}

async function updateContent(id, version, type, title, content) {
  let putUrl = domain + "/wiki/api/v2/pages/" + id;
  const bodyData = `{
    "id": "${id}",
    "status": "current",
    "title" : "${title}",
    "version": {
      "number": ${version},
      "message": "Automatic search and replace"
    },
    "body": {
      "representation": "storage",
      "value": ${content}
    }
  }`;
  const requestInfo = {
    url: putUrl,
    method: "PUT",
    headers: header,
    body: bodyData
  }
  let changed = false;

  if (debug) {
    console.log("The request will be")
    console.log(requestInfo);
  }

  await fetch(putUrl, requestInfo)
    .then((res) => {
      if (debug) {
        console.log("Response was:")
        console.log(res)
      }

      if (res.ok) {
        return res.json()
      } else {
        throw {
          "mensagem": "Response code was: " + res.status + " for page with id: " + id
        }
      }
    })
    .then((json) => {
      if (debug) {
        console.log(json)
      }

      console.log("Updated successfully page with title: " + title + " and id; " + id)
      changed = true;
    })
    .catch((err) => {
      console.error(err);
    });

  return changed;
}

async function replaceInConfluence() {

  if (find != null && replace != null) {
    console.log("Proceeding to replace.")

    for (const element of hm) {
      const content = element.content;
      const title = element.title;
      const replacedContent = replaceString(content);
      const titleReplaced = replaceString(title);

      if (dryrun || debug) {
        const diffTitle = showDiff(title, titleReplaced);
        const diffContent = showDiff(content, replacedContent);

        console.log("######################### PLANNED CHANGES #####################################")
        console.log("ID: " + element.id + " - Current Title: " + title)
        console.log("Changes to TITLE")
        process.stdout.write(diffTitle) && console.log("");
        console.log("Changes to CONTENT")
        process.stdout.write(diffContent) && console.log("");
      }

      if (title == titleReplaced && content == replacedContent) {
        console.log("No changes where performed for page with ID: " + element.id + " - Title: " + title)
      }
      else if (dryrun) {
        console.log("No changes performed since running in DRYRUN!");
      }
      else {
        await updateContent(element.id, element.version + 1, element.type, titleReplaced, JSON.stringify(replacedContent));
      }
    }
  }
}

function handleSearchResponse(json) {
  let next = '';

  if (debug) {
    console.debug(json)
  }

  next = json._links.next

  if (debug) {
    console.log(json.start)
    console.log(json.limit)
    console.log(json.size)
    console.log(next)
  }

  if (json.results != null) {
    json.results.forEach(result => {
      const regex = new RegExp(find, "g");

      if (debug) {
        console.debug(result)
      }

      if (result.body.storage.value.search(regex) >= 0) {
        hm.push({
          id: result.id,
          type: result.type,
          url: domain + '/wiki' + result._links.tinyui,
          title: result.title,
          space: result._expandable.space,
          content: result.body.storage.value,
          version: result.version.number,
          updated: false
        })
      }
      else {
        if (debug) {
          console.debug("Ignoring result")
        }
      }
    })

    if (json.size) {
      console.debug("Processing results. Starting from: " + json.start)
    }
    else {
      console.table({
        'No results matching query': query
      })
    }
  }
  else {
    console.error(json.message)
  }

  return next;
}

async function searchInConfluence() {
  let doit = false;
  let next = '';

  do {
   await fetch(searchQuery, {
        method: 'GET',
        headers: header
      })
      .then(res => {
        if (debug) {
          console.debug(res)
        }
        return res.json()
      })
      .then(json => {
        next = handleSearchResponse(json);
      })
      .catch(err => {
        console.error(err)
      })

    if (next == null) {
      doit = false
    }
    else {
      searchQuery = domain + '/wiki' + next
      doit = true
    }
  }

  while (doit);
}

function searchReplace() {

  searchInConfluence().then(ignored => {
    console.log("The following results were found")
    console.table(hm, ["id", "type", "url", "title", "space"])

    replaceInConfluence().then(ignored => {
                               console.log("Check the following to see what was changed")
                               console.table(hm, ["id", "type", "url", "title", "space", "updated"])
                           });
  });
}

function prepare() {

  dotenv.config()

  const options = new Command()
    .name('search.js')
    .description('CLI to search Confluence Pages')
    .version('0.0.1')
    .requiredOption('-q, --query <query>', 'CQL query to search for, eg: space = XXX')
    .requiredOption('-u, --user  <user>', 'user eg: your_email@domain.com')
    .requiredOption('-t, --token <token>', 'your_user_api_token with scope read:content-details:confluence,write:content:confluence')
    .requiredOption('-d, --domain <domainurl>', 'eg: https://<domain_name>.atlassian.net')
    .requiredOption('-s, --search <CQL Search term>', 'eg: term to search in CQL')
    .option('--debug', 'add extra debugging output')
    .option("-r, --replace  <string>", "replacement string eg: gitlab -> github")
    .option("-f, --find  <string>", "string to search and replace eg: gitlab")
    .option("--dryrun", "dry run only")
    .parse()
    .opts()

  if (options.debug) {
    console.debug(options)
  }

  query = options.query
  user = user = options.user
  token = options.token
  domain = options.domain
  debug = options.debug
  search = options.search
  replace = options.replace
  find = options.find
  dryrun = options.dryrun
  searchQuery = domain + '/wiki/rest/api/content/search?cql=' + query + ' and siteSearch~"' + search + '"&expand=body.storage,version.number'
  header = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(user + ':' + token)
      .toString('base64')
  }

  console.info({
    searchQuery
  })
}

prepare();
searchReplace();