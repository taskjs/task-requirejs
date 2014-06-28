var Execution = require('execution');
var _ = require('lodash');
var Record = require('record');
var path =  require('path');

module.exports = Execution.extend({
    // The type of option could be HTML5 input types: file, directory, number, range, select,
    // url, email, tel, color, date, time, month, time, week, datetime(datetime-local),
    // string(text), boolean(checkbox), array, regexp, function and object.
    options: {
        baseUrl: {
            label: 'Base URL',
            default: './',
            placeholder: 'All modules are located relative to this path',
            type: 'directory'
        },
        mainFile: {
            label: 'Main file',
            type: 'file'
        },
        mainConfigFile: {
            label: 'Main config file',
            type: 'file',
            placeholder: 'Specify the file of the configuration for optimization'
        },
        amdClean : {
            label: 'Strip define',
            default: false,
            placeholder: "Strip all definitions in generated source"
        },
        miniLoader : {
            label: 'Use mini loader',
            default: false,
            placeholder : 'Use the lighweight almond shim instead of RequireJS, smaller filesize but can only load bundled resources and cannot request additional modules'
        },

        includeLoader: {
            label: 'Include loader',
            default : false,
            type : 'boolean'
        },

        logLevel : {
            label: 'Logging level',
            default: 0,
            type: 'select',
            options: [
                {value: 0, label: 'TRACE'},
                {value: 1, label: 'INFO'},
                {value: 2, label: 'WARN'},
                {value: 3, label: 'ERROR'},
                {value: 4, label: 'SILENT'}
            ]
        },
        wrap : {
            label: 'Wraps in an anonymous function',
            default : false,
            placeholder : 'Wraps the output in an anonymous function to avoid require and define functions being added to the global scope, this often makes sense when using the almond option.'
        },
        optimize : {
            label: 'Logging level',
            default: 'uglify',
            type: 'select',
            options: [
                'uglify',
                'uglify2',
                'closure',
                'closure.keepLines',
                'none'
            ]
        },
        preserveLicenseComments : {
            label: 'Preserve license comments',
            default: true,
            type: 'boolean'
        },
        name: {
            label: 'Module name',
            type: 'string'
        },
        exclude: {
            label: 'Exclude',
            type: 'array',
            placeholder: 'Deep excludes a module and it\'s dependencies from the build'
        },
        stubModules: {
            label: 'Stub modules',
            type: 'array',
            default: [],
            placeholder: 'Specify modules to stub out in the optimized file'
        },
        paths: {
            label: 'Paths for modules',
            type: 'object',
            default: {}
        }
    },
    run: function (inputs, options, logger, settings) {
        return this._run(inputs, options, logger, settings);
    },
    execute: function (resolve, reject) {
        var options = this.options;
        var inputs = this.inputs;
        var logger = this.logger;

        if(inputs.length > 1){
            logger.warn('Only single file input are supported');
        }

        var inputFile = inputs[0].path;
        this.compile(inputFile, options, function(compiledCode){

            var record = new Record({
                contents: compiledCode
            });

            resolve([record]);
        });

    },
    compile: function (inputFile, options, callback) {
        var logger = this.logger;
        var requirejs = require('requirejs');
        var compiledCode = '';

        if(!options.mainConfigFile){
            options.mainConfigFile = options.mainFile;
        }

        // See more config at https://github.com/jrburke/r.js/blob/master/build/example.build.js
        if (!options.name) {
            options.name = (options.mainFile || inputFile).replace(/\.js$/, '');
        }

        if(!options.out){
            options.out = function (text) {
                // Do what you want with the optimized text here.
                compiledCode = text;
            }
        }

        if (options.amdClean){
            options.onBuildWrite = function(name, path, contents){
                // Remove requirejs plugin module like requirejs-tmpl
                if( options.stubModules.indexOf(name) !== -1 ) return '';
                // May throw error
                return require('amdclean').clean(contents);
            };
            options.skipSemiColonInsertion = true;
            options.stubModules.push('requireLib');
        }

        if (options.includeLoader || options.miniLoader){

            var impl;
            if (options.miniLoader) {
                logger.log('Include mini loader almond.js');
                impl = path.relative(
                    path.resolve(options.baseUrl),
                    path.resolve(__dirname, '../node_modules/almond/almond')
                );
            } else {
                logger.log('Include original loader require.js');
                impl = path.relative(
                    path.resolve(options.baseUrl),
                    path.resolve(__dirname, '../node_modules/requirejs/require')
                );
            }

            options.name = 'requireLib';
            options.mainConfigFile = options.mainConfigFile || inputFile;
            options.paths.requireLib = impl;
            options.include.push( path.relative(
                path.resolve(options.baseUrl),
                path.resolve(options.mainFile || inputFile)
            ));
        } else {
            // without loader
            // https://github.com/jrburke/r.js/blob/master/build/tests/lib/amdefine/build.js
            options.name = path.relative(
                path.resolve(options.baseUrl),
                path.resolve(options.mainFile || inputFile)
            ).replace(/\.js$/, '')
        }

        // logger.log(options)

        requirejs.optimize(options, function (result) {
            // Log requirejs optimizer process ended
            logger.log('RequireJS optimizer finished', inputFile);
            callback(compiledCode);
        });
    }
})
