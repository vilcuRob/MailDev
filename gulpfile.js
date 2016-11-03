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
    template = '';

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
gulp.task('build_html', function () {
    
    var templatesData_source = JSON.parse(fs.readFileSync('./templates/' + template + '/data.json'));
    var templatesData_common = JSON.parse(fs.readFileSync('./templates_common/data.json'));
    
    var templateData = {};
    Object.assign(templateData, templatesData_source, templatesData_common);

    // Gulp HBS compiler options    
    options = {
        ignorePartials: false,
        batch: ['./templates_common/partials', './templates/' + template + '/partials'],
        helpers: require('./hbs_helpers')
    }
    
    return gulp.src('templates/' + template + '/index.hbs')
        .pipe(handlebars(templateData, options))
        .pipe(rename('index.html'))
        .pipe(inlineCss({
            	applyStyleTags: true,
            	applyLinkTags: true,
            	removeStyleTags: false,
            	removeLinkTags: false
        }))
        .pipe(gulp.dest('dist/'+template))
        .on('end', function() {
           gulp.start(['inline_css']);
        });
    
}).task('build_css', function () {

    gulp.src(['./templates/'+template+'/style.scss'])
        .pipe(sass())
        .pipe(gulp.dest('./dist/'+template+'/'))
        .on('end', function() {
           gulp.start(['build_html']);
        });
   
}).task('inline_css', function () {
    
    return gulp.src('dist/' + template + '/index.html')
        .pipe(inlineCss({
            	applyStyleTags: true,
            	applyLinkTags: true,
            	removeStyleTags: false,
            	removeLinkTags: false
        }))
        .pipe(gulp.dest('dist/'+template));
    
}).task('watch', function () {
    
    // Watch and build html
    gulp.watch(['./templates_common/partials/**', './templates_common/data.json',
                './templates/**/partials/**', './templates/**/data.json', './templates/**/index.hbs'],['build_html']);
   
    // Watch and build css
    gulp.watch(['./templates_common/**/*.scss', './templates/**/*.scss'],['build_css']);
    
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
            
            mkdirp('./dist/' + args.new + '/', function () {
                
            // Empty Index Dist file
            fs.writeFileSync('./dist/' + args.new + '/index.html', '');
            // Empty Style Dist file
            fs.writeFileSync('./dist/' + args.new + '/style.css', '');
            
                mkdirp('./templates/' + args.new + '/partials/', function () {
                    mkdirp('./templates/' + args.new + '/scss/', function () {
                        mkdirp('./templates/' + args.new + '/', function () {
                            mkdirp('./templates/' + args.new + '/', function () {
                                
                            // Json helper file
                            fs.writeFileSync('./templates/' + args.new + '/data.json', '{\r\n"meta_title": "MailDev ' + args.new + '",\r\n"message": "Empty template successfully created inside: MailDev/templates/' + args.new + '",\r\n"css_template_path": "../../dist/' + args.new + '/style.css"\r\n}');

                            // Index helper file
                            fs.writeFileSync('./templates/' + args.new + '/index.hbs', fs.readFileSync('./templates_common/bootstraps/new_index.hbs'));

                            // Partial helper file
                            fs.writeFileSync('./templates/' + args.new + '/partials/local_body.hbs', '<b>{{message}}</b>');

                            // Css helper file
                            fs.writeFileSync('./templates/' + args.new + '/style.scss', fs.readFileSync('./templates_common/bootstraps/new_css.scss'));

                            // Start build and watch tasks
                            gulp.start(['build_css', 'watch']);
                                
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
        console.log('Template folder name was not found!');
        process.exit();
    }
} else {

    // Existent template name
    template = args.start;
    // Start build and watch tasks
    gulp.start(['build_css', 'watch']);
}

/******
**
* Start server on port :1111
* and serve the static index.html file
*
*/

app.use(express.static(__dirname + '/'));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/' + template + '/index.html'));
}).listen(1111, function () {
    console.log('Server running at http://localhost:1111');
});