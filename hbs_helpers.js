module.exports = (function() {
    
    return {
        // Helper to capitalize string
        capitals : function(str){
            return str.toUpperCase();
        },
        // Helper to foreach in array
        each: function(context, options) {
          var ret = "";
          for(var i=0, j=context.length; i<j; i++) {
            ret = ret + options.fn(context[i]);
          }
          return ret;
        }
    };
    
})();