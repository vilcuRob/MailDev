var fs = require('fs'),
    mkdirp = require('mkdirp'),
    lodash = require('lodash');

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}

var import_css = true;

module.exports = (function () {

    return {

        // Gets all the JSON from the partials
        // Used inside a particular index.hbs template
        getJsonPartials: function (template) {

            if (fileExists('./templates/' + template + '/index.hbs')) {

                var partial = [];
                var partials = '';
                var importcss= '';

                // Get all partials used in the index.hbs file
                var indexHbs = fs.readFileSync('./templates/' + template + '/index.hbs', 'utf-8').replace(/ /g, '');
                // Read all the partials used inside hbs template
                var indexHbs = indexHbs.split('{{>');
                
                
                // Partial.push all the partial names used
                for (var i = 1; i < indexHbs.length; i++) {
                    var partialName = indexHbs[i].split('}}')[0];
                    
                    partial.push(partialName);
                    // Css import all partials used in the template
                    importcss += '@import \'../../partials/'+partialName+'/'+partialName+'.scss\';\r\n';
                }
                
                if(import_css){
                    // Create partials.scss @import file with all the partials used
                    mkdirp('./templates/' + template + '/scss/', function () {
                        fs.writeFile('./templates/' + template + '/scss/partials.scss', importcss);
                    });
                    // Import css only once at the start
                    import_css = false;
                    console.log('');
                    console.log('Css partials successfully imported. If you add more partials, please restart your gulp task!');
                    console.log('');
                }
                
                // Read the json files of all the partials used
                for (var i = 0; i < partial.length; i++) {
                    partials += fs.readFileSync('./partials/' + partial[i] + '/' + partial[i] + '.json', 'utf-8') + ',';
                }

                // Return an object containing all partials used
                var partials = JSON.parse('{' + partials.substring(0, partials.length - 1) + '}');
                
                // Get template data.json 
                var dataJson = JSON.parse(fs.readFileSync('./templates/' + template + '/data.json', 'utf-8'));

                // Merges the partials Json with the template data.json
                // And assigns the data.json as the one that overrides the partial's json data
                var templateData = new Array;
                for (var i = 0; i < dataJson.versions.length; i++) {
                    var data = {};
                    lodash.merge(data, partials, dataJson.versions[i]);
                    templateData.push(data);
                }

                // Return object containing final 
                // json to generate distribution
                return templateData;

            } else {

                return {};
            }
        },

        getPartialsArrayPath: function () {

            var template_path = './partials/';
            var files = fs.readdirSync(template_path);
            var partial_paths = [];
            for (var i = 0; i < files.length; i++) {
                
                // Ignore files that contain . 
                // Get only directories
                if(files[i].indexOf('.') <= 0){
                
                    partial_paths.push('./partials/' + files[i] + '/');
                    
                }
            }
            return partial_paths;

        }

    };

})();