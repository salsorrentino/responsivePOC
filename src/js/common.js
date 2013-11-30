//The build will inline common dependencies into this file.

//For any third party dependencies, like jQuery, place them in the lib folder.

//Configure loading modules from the lib directory,
//except for 'app' ones, which are in a sibling
//directory.

require.config({
    //baseUrl: "/js",
    paths: {
        jquery: 'lib/jquery-1.10.2.min',
        jquerytools: 'lib/jquery.tools.min',
        jquerymobile: 'lib/jquery.mobile-1.4.0-rc.1.min',
        pathjs: 'lib/path',
        can: 'lib/can.min',
        text: 'lib/require/text',
        object: 'lib/widget/object',
        widget: 'lib/widget',
        responsive: 'lib/responsive',
        require: 'lib/require/require',
        moment: 'lib/moment'
    },
      shim:{
          'jquery': {
              exports: "$"
          },
          'pathjs': {
              exports: "Path"
          },
          'can': {
              deps: [ 'jquery' ]
          },
          'jquerytools': {
              deps: [ 'jquery' ]
          },
          'jquerymobile': {
              deps: [ 'jquery' ]
          }
      }
});