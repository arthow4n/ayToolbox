angular.module("ayPlaceholder", [])
  .directive("phIt", function () {
  return {
    restrict: "A",
    scope: { argstr: "@phIt" },
    link: function (scope, element, attr) {            
      var fileTypeSupported = /(\.(?:jpg|jpeg|gif|png))(?=\?text=)?/;
      var argsMatcher = /^(?:(\d+)(?:x(\d+)?)?(?:\/((?:[0-9A-Fa-f]{3})?(?:[0-9A-Fa-f]{3})?))?(?:\/((?:[0-9A-Fa-f]{3})?(?:[0-9A-Fa-f]{3})?))?\/?(?:\?text=(.+)?)?)$/;      
      var canvas, argstr, args, fileType, width, height, bgColor, textColor, text, srcUrl;
      scope.$watch("argstr", function () {                        
        if (!angular.isDefined(scope.argstr)) return;
        argstr = scope.argstr;
        
        fileType = argstr.match(fileTypeSupported);
        //slice unwanted "."
        fileType = fileType ? fileType[1].slice(1) : "jpeg";
        //fix "jpg" to "jpeg" for mime type "image/jpeg"
        if (fileType === "jpg") fileType = "jpeg";        
        if (fileType) argstr = argstr.replace(fileTypeSupported, "");
                    
        args = argstr.match(argsMatcher);
        if (!args) {
          console.error("Expected placehold.it-like syntax ( '000x000.png/bgColor/textColor?text=foobar' )");
          return;
        }
                
        width = parseInt(args[1],10);
        height = parseInt(args[2],10) || width;
        bgColor = "#" + ( args[3] || "CCC" );
        textColor = "#" + ( args[4] || "777" );
        text = args[5] || width + "x" + height;
        
        srcUrl = drawPlaceholder();
        if (element.prop("tagName") === "IMG") {
          element.prop("src", srcUrl);
        } else {
          element.css("background-image", "url('" + srcUrl + "')");
        }          
      });      
      function drawPlaceholder () { 
        canvas = canvas || document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;        
        var context = canvas.getContext("2d");        
        
        context.fillStyle = bgColor;
        context.fillRect(0, 0, width, height);      
        context.fillStyle = textColor;
        
        var fontpx = 24;
        if (fontpx > height) fontpx = height - 1;
        if (fontpx > width) fontpx = width - 1;
        context.font = fontpx + "px monospace";
        context.textAlign = "center";
        context.textBaseline = "middle";
        var textSize = context.measureText(text);
        var maxLength = width;
        if ( textSize.width > width && height > width ) {
            maxLength = height;
            context.translate(width/2,height/2);
            context.rotate(-90 * Math.PI / 180);
            context.translate(-width/2,-height/2);
        }
        context.fillText(text, width/2, height/2, maxLength);
        
        return canvas.toDataURL("image/"+fileType);
      }
    }
  };
});