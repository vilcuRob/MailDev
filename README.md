# MailDev
Develop cross-browser e-mail templates using inline css (scss), handlebars (hbs) and gulp

<b>How to start</b> <br /> 
<code>npm install -d</code>

<b>To create a new template use</b> <br /> 
<code>gulp --new template_name</code>

<b>To run an existing template use</b> <br /> 
<code>gulp --start template_name</code>

<b>To create a new partial</b> <br /> 
<code>gulp --partial partial_name</code>
<br /><br />

### How it works
<h1>Templates folder</h1>
- Contains the main templates for your emails
- The folder has a data.json file, index.hbs and style.scss + scss directory to store imports or variables

The data.json file inside the templates will override the partials json files (think of partials json as global data and template data.json as local data). To re-write the json from the partials, you need to access the partial object three starting from the partial name.

## Multiple versions<br />
To add multiple versions to one template, add new objects inside the "versions" array of the data.json template file. For example if you create 3 empty objects inside the template json file, the script will generate 3 html files inside dist/ folder (v0.html, v1.html, v2.html)<br />
<b>To access and see this files live, use <a href="http://localhost:7000/v0">http://localhost:7000/v0</a> or /v1 and so on.</b>

## The partials<br />
- To create a new partial, use: ```gulp --partial partial_name``` Now go inside the root /partials folder and you will see your partial directory (for example /banner). Inside the /banner directory you now 3 files: banner.hbs, banner.json and banner.scss

<br />
1. banner.hbs - should contain your banner markup (for our example just add {{title}} inside it and save it)<br />
2. banner.json - should contain a variable called that holds an json object "banner": { "title":"My Banner Title" }<br />
3. banner.scss - should contain the scss for this specific banner.hbs partial.

<hr />
```
## Its important to follow this structure for your builder to work correctly!
```
<hr />

Back to our template folder inside the index.hbs file if we now include the new banner partial (using {{> banner}} to call it) we will see after gulp compilation is done, a v0.html file inside the dist/ folder that contains "My Banner Title". Because the banner.scss is a dependency to our template now, it will be adeed inside our template/scss/partials.scss file that is included in the style.scss file.

## Issues found so far<br />

1. An element can only have one styles inherited from one class. If two classes are present or 2 instances of the same class are present in the scss file, the inliner compiler will not merge them, it will ignore all of then and just write the last one that it sees.
2. Array's are not mergeable inside the json files. Use fixed values for inheritance overriding.


