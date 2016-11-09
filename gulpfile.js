var express = require('express'),
    args = require('yargs').argv,
    app = express(),
    path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    gulp = require('gulp'),
    handlebars = require('gulp-compile-handlebars'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    inlineCss = require('gulp-inline-css'),
    inject = require('gulp-inject-string');

var i = 0;
var newTemp = false;

// Checks if gulp is runned with new or start args
if (args.new == undefined && args.start == undefined && args.partial == undefined) {
    console.log('Please use gulp --start template-folder-name or gulp --new template-folder-name or gulp --partial partial_name');
    process.exit();
} else {
    // Default template to start args
    template = args.start;
    
    if (args.new == true || args.partial == true) {
        console.log('Please use gulp --start template-folder-name or gulp --new template-folder-name or gulp --partial partial_name');
        process.exit(); 
    }
}


/******
 **
 * Gulp general tasks
 * 
 *
 */
gulp.task('build_css', function () {
    
    //reset i
    i = 0;

    gulp.src(['./templates/' + template + '/style.scss'])
        .pipe(sass())
        .pipe(gulp.dest('./dist/' + template + '/'))
        .on('end', function () {
            gulp.start(['build_html0']);
        });

}).task('watch', function () {

    // Watch and build css and html
    gulp.watch(['./partials/**', './templates/**'], ['build_css', 'build_html0']);

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
            newTemp = true;

            mkdirp('./templates/' + args.new + '/', function () {
                mkdirp('./templates/' + args.new + '/scss/', function () {
                    fs.writeFile('./templates/' + args.new + '/scss/partials.scss', '', function(){
                        fs.writeFile('./templates/' + args.new + '/style.scss', '@import \'../../templates/'+template+'/scss/partials.scss\';', function(){
                            fs.writeFile('./templates/' + args.new + '/data.json', '{\r\n\t"versions":\r\n\t\t[\r\n\t\t\t{\r\n\t\t\t\t\r\n\t\t\t}\r\n\t\t]\r\n}', function(){
                                fs.writeFile('./templates/' + args.new + '/index.hbs', '{{>html_start}}\r\n{{>html_end}}', function(){
                                    
                                    // Create distribution empty file
                                    mkdirp('./dist/' + args.new + '/', function () {
                                        fs.writeFile('./dist/' + args.new + '/style.css', 'body{background-color:#fff;}', function(){
                                            fs.writeFile('./dist/' + args.new + '/v0.html', '');
                                            console.log('Template was created! Use "gulp --start '+template+'" to preview the template.');
                                            process.exit();
                                        });
                                    });
                                    
                                });
                            });
                        });
                    });
                });
            });
            
        } else {
            console.log('Template folder name already exists!');
            process.exit();
        }
    } else {
        
        if (args.partial !== undefined) {
            // Check if partial exists
            if (!fs.existsSync('./partials/' + args.partial)) {
                mkdirp('./partials/' + args.partial + '/', function () {
                    fs.writeFile('./partials/' + args.partial + '/'+args.partial+'.hbs', '', function(){
                        fs.writeFile('./partials/' + args.partial + '/'+args.partial+'.scss', '', function(){
                            fs.writeFile('./partials/' + args.partial + '/'+args.partial+'.json', '', function(){
                                console.log('Partial ' + args.partial + ' was successfully created!');
                                process.exit(); 
                            });
                        });
                    });
                });
            }else{
                console.log('A partial with this name already exists!');
                process.exit();       
            }
        }else{
        
            console.log('Template folder name was not found!');
            process.exit();
            
        }
        
    }
} else {

    // Existent template name
    template = args.start;
    
    var jh = require('./json_helpers');
    var totalPartials = jh.getJsonPartials(template).length;
    
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
            .pipe(inject.after('<body>','<style>'+fs.readFileSync('dist/' + template + '/style.css')+'</style>'))
            .pipe(rename('v' + i + '.html'))
            .pipe(gulp.dest('dist/' + template))
            .on('end', function () {
                if (i < totalPartials - 1) {
                    i++;
                    gulp.start(['build_html' + i]);
                }else{
                    gulp.start(['inline_css']);
                }
            });
    }

    gulp.task('inline_css', function () {

        var distHtmlFiles = [];
        for(var i = 0; i < totalPartials; i++){
            distHtmlFiles.push('dist/' + template + '/v'+i+'.html');
        }
        return gulp.src(distHtmlFiles)
            .pipe(inlineCss({
                applyStyleTags: true,
                applyLinkTags: true,
                removeStyleTags: false,
                removeLinkTags: false
            }))
            .pipe(gulp.dest('dist/' + template));
    });

    for (var x = 0; x < jh.getJsonPartials(template).length; x++) {
        gulp.task('build_html' + x, buildHtml);
    }
    
    // Start build and watch tasks
    gulp.start(['build_css', 'build_html0', 'watch']);
}

/******
 **
 * Start server on port :1111
 * and serve the static index.html file
 *
 */

if(!newTemp){

    app.use(express.static(__dirname + '/'));
    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname + '/dist/' + template + '/v0.html'));
    }).get('*', function (req, res) {
        res.sendFile(path.join(__dirname + '/dist/' + template + req.originalUrl + '.html'));
    }).listen(7000, function () {
        console.log('Server running at http://localhost:7000/v0');
    });
    
}