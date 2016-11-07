# MailDev
Develop cross-browser e-mail templates using inline css (scss), handlebars (hbs) and gulp

<b>To create a new template use</b> <br /> 
<code>gulp --new template_name</code>

<b>To run an existing template use</b> <br /> 
<code>gulp --start template_name</code>
<br /><br /> <br /> <br /> 

### How it works
<h1>Templates folder</h1>
- Contains the main templates for your emails
- The folder has a data.json file, index.hbs and style.scss + scss directory to store imports or variables

The data.json file inside the templates will override the partials json files (think of partials json as global data and template data.json as local data). To re-write the json from the partials, you need to access the partial object three starting from the partial name.

## Multiple versions<br />
To add multiple versions to one template, add new objects inside the "versions" array of the data.json template file. For example if you create 3 empty objects inside the template json file, the script will generate 3 html files inside dist/ folder (v0.html, v1.html, v2.html) - To access and see this files live, use http://localhost:7000/v1 or /v2 and so on.
