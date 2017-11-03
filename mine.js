(function () {


    var $body;

    var renderedCanvas;
    var drawingCanvas;

    var renderedContext;
    var drawingContext;

    var clearImage;


    var mouseX = null;
    var startY = null;
    var mouseMoveTime = 0;
    var mouseMoving = true;

    var nodes = [];
    var foregroundElts = [];

    $(function () {
        $body = $('body');
        if (!("createTouch" in document)) {
            $(init);
        }
        if (window !== window.top) {
            init();
        }
    });


    /**
     * @return {undefined}
     */
    function init() {
        $body.mousemove(function (event) {
            mouseX = event.clientX;
            startY = event.clientY;
            /** @type {number} */
            mouseMoveTime = Date.now();
            if (!mouseMoving) {
                render();
            }
        });
        $(window).on("blur mouseout", function () {
            /** @type {null} */
            startY = mouseX = null;
        }).on("resize", function () {
            if (renderedCanvas) {
                if (renderedCanvas.parentNode) {
                    renderedCanvas.parentNode.removeChild(renderedCanvas);
                }
            }
            load();
        });
        load();
    }

    /**
     * @return {undefined}
     */
    function load() {
        _registerForegroundElements();
        var bodyWidth = $body.width(), bodyHeight = $body.height();
        // the canvas attached to the page
        renderedCanvas = document.createElement("canvas");
        renderedCanvas.className = "loginFun";
        renderedCanvas.width = bodyWidth;
        renderedCanvas.height = bodyHeight;

        renderedContext = renderedCanvas.getContext("2d");
        $body.append(renderedCanvas);

        // the canvas we draw onto, used as a mask
        drawingCanvas = document.createElement("canvas");
        drawingCanvas.width = bodyWidth;
        drawingCanvas.height = bodyHeight;
        // set the default drawing style
        drawingContext = drawingCanvas.getContext("2d");
        drawingContext.lineCap = "round";
        drawingContext.shadowColor = "#000000";
        drawingContext.shadowBlur = navigator.userAgent.indexOf("Firefox") > -1 ? 0 : 30;


        if (!clearImage) {
            // load the clear image only once
            clearImage = new Image;
            $(clearImage).one("load", render); // one --> on but executed at most once
            $(clearImage).attr("src", _getImageUrl());
        }
    }


    /**
     * Render the mask based on the mouse movements.
     * This method can be called either from the mousemove, or from the
     * requestAnimationFrame.
     */
    function render() {
        var currentTime = Date.now();
        mouseMoving = currentTime <= mouseMoveTime + 50;
        if (mouseX && mouseMoving) {
            // render called from the mousemouse (not the requestAnimationFrame), add a point.
            nodes.unshift({
                time: currentTime,
                x: mouseX,
                y: startY + $body.scrollTop()
            });
        }
        // remove old elements
        for (var i = 0; i < nodes.length;) {
            if (1000 < currentTime - nodes[i].time) {
                nodes.length = i;
            } else {
                i++;
            }
        }
        // if more than one element to render, call render again
        if (0 < nodes.length) {
            window.requestAnimationFrame(render);
        }

        // reset canvas
        drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

        // re-render each node
        for (var i = 1; i < nodes.length; i++) {
            // vector length using pythagore
            var vertexLength = Math.sqrt(Math.pow(nodes[i].x - nodes[i - 1].x, 2) + Math.pow(nodes[i].y - nodes[i - 1].y, 2));
            // set opacity based on time
            var opacity = Math.max(1 - (currentTime - nodes[i].time) / 1000, 0);
            drawingContext.strokeStyle = "rgba(0,0,0," + opacity + ")";
            // linewidth between 25 and 100 based on the proximity of the two points
            drawingContext.lineWidth = 25 + 75 * Math.max(1 - vertexLength / 50, 0);
            // draw vector
            drawingContext.beginPath();
            drawingContext.moveTo(nodes[i - 1].x, nodes[i - 1].y);
            drawingContext.lineTo(nodes[i].x, nodes[i].y);
            drawingContext.stroke();
        }
        var imageWidth = renderedCanvas.width;
        var imageHeight = renderedCanvas.width / clearImage.naturalWidth * clearImage.naturalHeight;
        if (imageHeight < renderedCanvas.height) {
            imageHeight = renderedCanvas.height;
            imageWidth = renderedCanvas.height / clearImage.naturalHeight * clearImage.naturalWidth;
        }
        // redraw the clear image to the canvas, resetting everything
        renderedContext.drawImage(clearImage, 0, 0, imageWidth, imageHeight);
        // draw the nodes/vertex to the canvas. The destination-in means that
        // only content that overlap are kept (intersection) --> only the parts of the clear image
        // where we have drawn something will appear, the rest will become transparent
        // (remember, the body has the blurred image as the background)
        //
        // So in short, the canvas is used as a mask.
        // cf: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
        renderedContext.globalCompositeOperation = "destination-in";
        renderedContext.drawImage(drawingCanvas, 0, 0);
        // reset to default composition style
        renderedContext.globalCompositeOperation = "source-over";

        // finally, clear som areas, if any
        foregroundElts.forEach(function (cr) {
            renderedContext.clearRect(cr.left, cr.top, cr.width, cr.height);
        });
    }


    /**
     * Register header or other stuff that should always be blurred (i.e. you can't draw on),
     * if any. Use the `skip-blur` class for it.
     * @return {undefined}
     */
    function _registerForegroundElements() {
        /** @type {Array} */
        foregroundElts = [];
        $(".skip-blur").each(function (position, elt) {
            var $elt = $(elt);
            if ($elt.is(":visible")) {
                position = $elt.position();
                foregroundElts.push({
                    top: position.top,
                    left: position.left,
                    width: $elt.outerWidth(),
                    height: $elt.outerHeight()
                });
            }
        });
    }

    /**
     * Get the image url from the body:before element
     * @returns the url of the image
     */
    function _getImageUrl() {
        var value = window.getComputedStyle(
            document.querySelector('body'), ':before'
        ).getPropertyValue('background-image');

        var matches = value.match(/url\("(.*)"\)/);
        if (matches.length < 2) {
            throw Error("the body:before is missing a background-image property!");
        }
        return matches[1];
    }

})();
