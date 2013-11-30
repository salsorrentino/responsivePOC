{
    appDir: '../src',
    baseUrl: 'js',
    // paths: {
    //     app: '../app'
    // },
    optimize: 'uglify',
    skipDirOptimize: true,
    mainConfigFile: '../src/js/common.js',
    paths: {
        // jquery: 'empty:',
        // jquerytools: 'empty:',
        // jquerymobile: 'empty:',
        // can: 'empty:',
        // moment: 'empty:'
    },
    dir: '../WebContent',
    modules: [
        //First set up the common build layer.
        
        {
            //module names are relative to baseUrl
            name: 'common',
            
            //List common dependencies here. Only need to list
            //top level dependencies, "include" will find
            //nested dependencies.

            include: [
                      'text',
                      'responsive/canjswidget',
                      'responsive/page',
                      'responsive/router',
                      'core/nav/header',
                      'core/nav/footer',
                      'core/nav/statefullink',
                      'core/layout/statefulparentmodule',
                      'core/controls/controlgroup',
                      'core/ads/ad',
                      'core/util/formatter',
                      'core/controls/dialog',
                      'core/controls/statefuldialog'
                    ]
        },

        //Now set up a build layer for each page, but exclude
        //the common one. "exclude" will exclude nested
        //the nested, built dependencies from "common". Any
        //"exclude" that includes built modules should be
        //listed before the build layer that wants to exclude it.
        //"include" the appropriate "app/main*" module since by default
        //it will not get added to the build since it is loaded by a nested
        //require in the page*.js files.
        {
            //module names are relative to baseUrl/paths config
            name: 'search',
            include:    [
                            'main',
                            'core/search/searchForm'
                        ],
            exclude: ['common']
        },

        {
            //module names are relative to baseUrl
            name: 'searchResults',
            include:    [
                            'main',
                            'core/search/vehiclelist',
                            'core/search/vehicledetail'
                        ],
            exclude: ['common']
        }

    ]
}
