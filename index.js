#!/usr/bin/env node
//const path = require('path')
const crypto = require("crypto");
//require("dotenv").config();
const Airtable = require("airtable-plus");

const {
  AIRTABLE_API_KEY: apiKey,
  AIRTABLE_BASE_ID: baseID,
  AIRTABLE_TABLE_NAME: tableName,
  MAIN_DOMAIN,
} = process.env;

const airtable = new Airtable({ apiKey, baseID, tableName });

let [type, target, slug] = process.argv.slice(2);
slug = slug || crypto.randomBytes(5).toString("hex");

const listItems = (readRes) => {
  readRes.forEach((surl) => {
    console.log(`${surl.fields.slug} - ${surl.fields.target}`);
  });
};

const renderHelpCommands = () => {
  console.log(`
  Usage:\n
  -a <target> <slug>                      Add a ShortLink
  -u <target> <slug>                      Update record with slug
  -l                                      List all ShortLinks
  -f <target>                             Find ShortLink based on target
  `);
};

if (type === "-l") {
  airtable.read().then((readRes) => {
    listItems(readRes);
  });
} else if (type === "-a") {
  airtable
    .create({ target, slug })
    .then(() => {
      console.log(`Created ${MAIN_DOMAIN}/${slug}`);
    })
    .catch((e) => console.error(e));
} else if (type === "-u") {
  airtable
    .updateWhere(`slug = "${slug}"`, {
      target,
    })
    .then(() => console.log(`Updated ${MAIN_DOMAIN}/${slug}`))
    .catch((e) => console.error(e));
} else if (type === "-f") {
  if (!target) {
    renderHelpCommands();
    return;
  }
  airtable
    .read({
      //filterByFormula: `slug = "${target}"`,
      filterByFormula: `SEARCH("${target}", slug)`,
    })
    .then((readRes) => {
      listItems(readRes);
    });
} else {
  renderHelpCommands();
}
