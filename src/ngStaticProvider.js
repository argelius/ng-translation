
/**
 * @ngdoc module
 * @name ng.static.provider
 *
 * @description
 * ngStatic description
 */

angular.module('ng.static.provider', [ 'ng.static.files-loader' ])
  .provider('ngStatic', ngStaticProvider);

/**
 * @ngdoc function
 * @name ngStaticProvider
 *
 * @description
 */
function ngStaticProvider() {

  //store all files
  var staticFiles;

  //files suffix
  var suffix;

  var baseUrl;

  /**
   * @ngdoc method
   * @description
   * Set static files as a key value pairs
   * @param files
   * @return {ngStaticProvider}
   * @example
   * ngStaticProvider
   *  .staticFiles({
   *    homepage: 'file.json',
   *    login: 'folder/file.json',
   *    search: 'file' <== by default prefix is json
   *  })
   */
  this.staticFiles = function(files) {
    staticFiles = files;
    return this;
  };

  /**
   * @ngdoc method
   * @description
   * Add file to static files object
   * @param file
   * @returns {ngStaticProvider}
   * @example
   * ngStaticProvider
   *  .addStaticFile({
   *    name: filename.json
   *  })
   */
  this.addStaticFile = function(file) {
    staticFiles = (staticFiles) ?
      extend(staticFiles, file) :
      file;
    return this;
  };

  /**
   * @ngdoc method
   * @description
   * Set global suffix to all files
   * @param sfx
   * @returns {ngStaticProvider}
   * @example
   * ngStaticProvider
   *  .setFilesSuffix('-static.json')
   *  .setFiles({
   *    homepage: 'homepage' <== homepage-static.json
   *  })
   */
  this.setFilesSuffix = function(sfx) {
    suffix = sfx;
    return this;
  };

  /**
   * @ngdoc method
   * @description
   * Set base url static file
   * @param url {String}
   * @returns {ngStaticProvider}
   * @example
   *  __ __ __ __ __ __
   * | - dist          |
   * |   - assets      |
   * |     - static    |
   * |__ __ __ __ __ __|
   *
   * ngStaticProvider
   *  .setBaseUrl('dist/assets/static')
   *  .staticFiles({
   *    homepage: 'homepage' <== dist/assets/static/homepage.json
   *  })
   */
  this.setBaseUrl = function(url) {
    baseUrl = new RegExp(/\/$/).test(url) ?
     url.substring(0, url.length-1) :
      url;
    return this;
  };

  /**
   * Alias to setBaseUrl function
   */
  this.setDirectory = this.setBaseUrl;

  /**
   * @description
   * returned api
   */
  this.$get = ['$q', 'staticFilesLoader', function($q, staticFilesLoader) {

    /**
     * @description
     * Store all static files content
     * @var object
     */
    var staticFilesContainer = {};

    /**
     * @description
     * Store all configuration service
     * @var object
     */
    var configuration = {
      baseUrl: baseUrl || '',
      suffix: suffix,
      staticFiles: staticFiles
    };

    /**
     * @ngdoc method
     * @param name
     * @returns specific file || the first(default) file
     * @private
     */
    function $$getFile(name) {
      return staticFilesContainer[name] ||
        staticFilesContainer[Object.keys(staticFilesContainer)[0]];
    }

    /**
     * @ngdoc method
     * @description
     * returns all files / staticFiles object
     * @returns {{}}
     * @private
     */
    function $$getFiles() {
      return staticFilesContainer;
    }

    /**
     * @description
     * bind files array to staticFilesContainer object
     * @param filesArray
     */
    function $$bindFiles(filesArray) {
      forEach(filesArray, function(value, key) {
        extend(staticFilesContainer, value);
      });
    }

    /**
     * @ngdoc method
     * @description
     * load all files and then call bindFiles function
     */
    function $$loadAllFiles() {

      var promises = [];

      forEach(staticFiles, function(value, key) {
        promises.push(staticFilesLoader.get({
          baseUrl: configuration.baseUrl,
          suffix: suffix,
          value: (startWith(value, '/') || endsWith(configuration.baseUrl, '/')) ?
          value : '/' + value,
          key: key
        }));
      });

      return $q.all(promises);
    }

    /**
     * @description
     * init function
     */
    function $$init() {
      return $$loadAllFiles()
        .then($$bindFiles);
    }

    return {
      configuration: configuration,
      get: $$getFile,
      getAll: $$getFiles,
      init: $$init
    }

  }];

}















