const dotenv = require("dotenv").config();
const { client, Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});
const database_id = process.env.PEOPLE_DB;

module.exports = GetPeople = async () => {

  const myDownload = {

    path: "databases/" + database_id + "/query",

    method: "POST",
  };

  const { results } = await notion.request(myDownload);

  const people = results.map((page) => {
    let ids = [];
    for (let i = 0; i < page.properties.Timereports.relation.length; i++) {
      ids.push(page.properties.Timereports.relation[i].id)
    }
    return {
      TimeReportsId: ids,
      PersonId: page.id,
      Name: page.properties.Name.title[0].text.content,
      Role: page.properties.Role.select.name,
      Email: page.properties.Email.email,
      WorkedHours: page.properties.TotalHours.rollup.number,
      Url: page.url,
    }
  });

  return people;
};