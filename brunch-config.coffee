exports.config =
  paths:
    watched: ['static']
  files:
    javascripts:
      joinTo:
        'javascripts/app.js': /^static/
      order:
        before: [
          'static/jquery.js',
          'static/bootstrap.js',
          'static/bootstrap-select.min.js'
        ]

    stylesheets:
      joinTo: 'stylesheets/app.css'

    templates:
      joinTo: 'javascripts/app.js'
#  plugins:
#    afterBrunch: [
#      'npm run dev'
#    ]
