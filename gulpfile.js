// Include gulp
const gulp = require('gulp');

// Include Our Plugins
const del = require('del');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const ts = require('gulp-typescript');
const war = require('gulp-war');
const zip = require('gulp-zip');
const SystemBuilder = require('systemjs-builder');
const args = require('yargs').argv;

var isProd = args.env === 'prod';
var isTest = args.env === 'test';
var builder = new SystemBuilder();

// clean the contents of the distribution directory
gulp.task('clean', function () {
    return del(['dist/**/*', 'scripts/**/*']);
});

// copy assets
gulp.task('copy:assets', ['clean', 'compile'], function() {
    builder.loadConfig('./systemjs.config.js')
        .then(function() {
            return builder.buildStatic('app', 'dist/bundle.js', {
                minify: isProd || isTest,
                mangle: isProd || isTest,
                rollup: isProd || isTest
            });
        });

    return gulp.src([
        'node_modules/es6-shim/es6-shim.min.js',
        'node_modules/zone.js/dist/zone.js',
        'node_modules/reflect-metadata/Reflect.js',
        'node_modules/systemjs/dist/system.src.js',

        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/tether/dist/js/tether.min.js',
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
        'node_modules/angular2-jwt/angular2-jwt.js',
        
        'node_modules/tether/dist/css/tether.min.css',
        'node_modules/bootstrap/dist/css/bootstrap.min.css',
        'WEB-INF/jboss-web.xml',
        'styles/*.css',
        'images/**/*',
        'app/**/*.html',
        'index.html'
    ], {"base": "."})
    .pipe(gulp.dest('dist'))
});

// copy assets
gulp.task('copy:config', ['clean'], function() {
    var configFile = 'config/dev.json';
    if (isTest) {
        configFile = 'config/test.json';
    }
    if (isProd) {
        configFile = 'config/prod.json';
    }
    return gulp.src(configFile)
        .pipe(rename('config.json'))
        .pipe(gulp.dest('dist/scripts'))
});

// compile typescript
gulp.task('compile', ['clean'], function() {
    var project = ts.createProject('tsconfig.json');
    return project.src()
        .pipe(ts(project))
        .pipe(gulp.dest('scripts'));
});

// replace base in index to target war name
gulp.task('replace:index', ['compile', 'copy:assets', 'copy:config'], function() {
    var config = require('./dist/scripts/config.json');
    return gulp.src('dist/index.html')
        .pipe(replace(
            '<base href="/">',
            '<base href="/campus/">'
        ))
        .pipe(replace(
            'https://adfs.saxsys.de/adfs/oauth2/authorize',
            config['adfs.auth.url']
        ))
        .pipe(replace(
            '&client_id=campusapp',
            '&client_id=' + config['client.id']
        ))
        .pipe(replace(
            'https://nb299.saxsys.de:8443/adfs-saml',
            config['resource']
        ))
        .pipe(replace(
            'https://nb299.saxsys.de:8443/campus',
            config['redirect.url']
        ))
        .pipe(replace(
            '<script src="systemjs.config.js"></script>',
            ''
        ))
        .pipe(replace(
            '<script> System.import(\'app\').catch(function (err) {console.error(err);});</script>',
            ''
        ))
        .pipe(replace(
            '</body>',
            '<script src="bundle.js"></script></body>'
        ))
        .pipe(gulp.dest('dist'));
});

// build war
gulp.task('war', ['compile', 'copy:assets', 'copy:config', 'replace:index'], function () {
    gulp.src(['dist/**/*'])
        .pipe(war({
            welcome: 'index.html',
            displayName: 'Campus Angular2 WAR'
        }))
        .pipe(zip('campus.war'))
        .pipe(gulp.dest('dist'));
});