var express = require('express'),
    args = require('yargs').argv,
    app = express(),
    path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    gulp = require('gulp'),
    handlebars = require('gulp-compile-handlebars'),
    rename = require('gulp-rename'),
    sass   = require('gulp-sass'),
    inlineCss = require('gulp-inline-css'),
    concat = require('gulp-concat');


var i = 0;
var ii = 0;

// Checks if gulp is runned with new or start args
if (args.new == undefined && args.start == undefined) {
    console.log('Please use gulp --start template-folder-name or gulp --new template-folder-name')
    process.exit();
} else {
    // Default template to start args
    template = args.start;
}

/******
**
* Gulp general tasks
* 
*
*/
gulp.task('build_css', function () {

    gulp.src(['./templates/'+template+'/style.scss'])
        .pipe(sass())
        .pipe(gulp.dest('./dist/'+template+'/'))
        .on('end', function() {
           gulp.start(['build_html0']);
        });
   
}).task('watch', function () {
    
    // Watch and build html
    gulp.watch(['./partials/*/*.hbs','./partials/*/*.json', './templates/*/*.hbs', './templates/*/*.json'],['build_html0']);
   
    // Watch and build css
    gulp.watch(['./partials/*/*.scss', './templates/*/*.scss'],['build_css']);
    
}).task('default', function () {});

/******
**
* Check if template directory exists
* and if not creates a new folder structure
*
*/
if (!fs.existsSync('./templates/' + args.start)) {
    if (args.new !== undefined) {
        if (!fs.existsSync('./templates/' + args.new)) {

            // New template name
            template = args.new;
            
            mkdirp('./templates/' + args.new + '/', function () {
                fs.writeFile('./templates/' + args.new + '/style.scss', '');
                fs.writeFile('./templates/' + args.new + '/data.json', '{\r\n\t"versions":\r\n\t\t[\r\n\t\t\t{\r\n\t\t\t\t\r\n\t\t\t}\r\n\t\t]\r\n}');
                fs.writeFile('./templates/' + args.new + '/index.hbs', ''); 
            });
  
        } else {
            console.log('Template folder name already exists!');
            process.exit();
        }
    } else {
        console.log('Template folder name was not found!');
        process.exit();
    }
} else {

    // Existent template name
    template = args.start;
    // Start build and watch tasks
    gulp.start(['build_css', 'watch']);
}

var jh = require('./json_helpers');
var totalPartials = jh.getJsonPartials(template).length;

// Create empty html files so that the gulp task
// inline_css would not fail
mkdirp('./dist/' + template + '/', function () {
    for(t = 0; t < totalPartials; t++){
        fs.writeFile('./dist/' + template + '/v'+t+'.html', ''); 
    }
});

var buildHtml = function () {

    templateData = jh.getJsonPartials(template)[i];

    // Gulp HBS compiler options    
    options = {
        ignorePartials: false,
        // Partials paths batch array
        batch: jh.getPartialsArrayPath(),
        helpers: require('./hbs_helpers')
    }

    return gulp.src('templates/' + template + '/index.hbs')
        .pipe(handlebars(templateData, options))
        .pipe(rename('v'+i+'.html'))
        .pipe(gulp.dest('dist/'+template))
        .on('end', function() {
            if(i < totalPartials - 1){
                i++;
                gulp.start(['build_html'+i]);
            }else{
                gulp.start(['inline_css']);
            }
        });
}

gulp.task('inline_css', function () {
    
    return gulp.src(['dist/' + template + '/v0.html', 'dist/' + template + '/v1.html', 'dist/' + template + '/v2.html'])
        .pipe(inlineCss({
            	applyStyleTags: false,
            	applyLinkTags: false,
            	removeStyleTags: false,
            	removeLinkTags: false
        }))
        .pipe(gulp.dest('dist/'+template));
});


for(var x = 0; x < jh.getJsonPartials(template).length; x++){
    gulp.task('build_html'+x, buildHtml);
}


/******
**
* Start server on port :1111
* and serve the static index.html file
*
*/

app.use(express.static(__dirname + '/'));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/' + template +'/v0.html'));
}).get('*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/' + template + req.originalUrl + '.html'));
}).listen(1111, function () {
    console.log('Server running at http://localhost:1111');
});