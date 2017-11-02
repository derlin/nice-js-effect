(function () {


    /**
     * @return {undefined}
     */
    function link() {
        /**
         * @return {undefined}
         */
        function init() {
            $body.mousemove(function (event) {
                mouseX = event.clientX;
                startY = event.clientY;
                /** @type {number} */
                mouseMoveTime = Date.now();
                if (!t) {
                    render();
                }
            });
            $(window).on("blur mouseout", function () {
                /** @type {null} */
                startY = mouseX = null;
            }).on("resize", function () {
                if (img) {
                    if (img.parentNode) {
                        img.parentNode.removeChild(img);
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
            var newWidth;
            var newHeight;
            _registerForegroundElements();
            newWidth = $body.width();
            newHeight = $body.height();
            /** @type {Element} */
            img = document.createElement("canvas");
            /** @type {string} */
            img.className = "loginFun";
            img.width = newWidth;
            img.height = newHeight;
            $body.append(img);
            /** @type {Element} */
            canvas = document.createElement("canvas");
            canvas.width = newWidth;
            canvas.height = newHeight;

            if (img.getContext && img.getContext("2d")) {
                context = img.getContext("2d");
                ctx = canvas.getContext("2d");
                ctx.lineCap = "round";
                ctx.shadowColor = "#000000";
                ctx.shadowBlur = navigator.userAgent.indexOf("Firefox") > -1 ? 0 : 30;
            }
            if (!image) {
                /** @type {Image} */
                image = new Image;
                if (!$body.css("background-image")) {
                    throw Error("element must have a background image");
                }
                $(image).one("load", render); // one --> on but executed at most once
                $(image).attr("src", "clear-bg.jpg");
            }
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
         * @return {undefined}
         */
        function render() {
            var y;
            /** @type {number} */
            var dateNow = Date.now();
            /** @type {boolean} */
            t = dateNow <= mouseMoveTime + 500;
            if (mouseX) {
                if (t) {
                    nodes.unshift({
                        time: dateNow,
                        x: mouseX,
                        y: startY + $body.scrollTop()
                    });
                }
            }
            // remove old elements
            for (var i = 0; i < nodes.length;) {
                if (1000 < dateNow - nodes[i].time) {
                    nodes.length = i;
                } else {
                    i++;
                }
            }
            // if more than one element to render, call render again
            if (0 < nodes.length) {
                self.requestAnimationFrame(render);
            }

            // reset canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // re-render each node
            for (var i = 1; i < nodes.length; i++) {
                // vector length using pythagore
                var vertexLength = Math.sqrt(Math.pow(nodes[i].x - nodes[i - 1].x, 2) + Math.pow(nodes[i].y - nodes[i - 1].y, 2));
                // set opacity based on time
                var opacity = Math.max(1 - (dateNow - nodes[i].time) / 1000, 0);
                ctx.strokeStyle = "rgba(0,0,0," + opacity + ")";
                // linewidth between 25 and 100 based on the proximity of the two points
                ctx.lineWidth = 25 + 75 * Math.max(1 - vertexLength / 50, 0);
                // draw vector
                ctx.beginPath();
                ctx.moveTo(nodes[i - 1].x, nodes[i - 1].y);
                ctx.lineTo(nodes[i].x, nodes[i].y);
                ctx.stroke();
            }
            var imageWidth = img.width;
            /** @type {number} */
            var imageHeight = img.width / image.naturalWidth * image.naturalHeight;
            if (imageHeight < img.height) {
                imageHeight = img.height;
                /** @type {number} */
                imageWidth = img.height / image.naturalHeight * image.naturalWidth;
            }
            // redraw the clear image to the canvas, resetting everything
            context.drawImage(image, 0, 0, imageWidth, imageHeight);
            // draw the nodes/vertex to the canvas. The destination-in means that
            // only content that overlap are kept (intersection) --> only the parts of the clear image
            // where we have drawn something will appear, the rest will become transparent
            // (remember, the body has the blurred image as the background)
            //
            // So in short, the canvas is used as a mask.
            context.globalCompositeOperation = "destination-in";
            context.drawImage(canvas, 0, 0);
            // reset to default composition style
            context.globalCompositeOperation = "source-over";

            // finally, clear som areas, if any
            foregroundElts.forEach(function (cr) {
                context.clearRect(cr.left, cr.top, cr.width, cr.height);
            });
        }

        var $body = $("body");
        var img;
        var canvas;
        var context;
        var ctx;
        var image;
        /** @type {null} */
        var mouseX = null;
        /** @type {null} */
        var startY = null;
        /** @type {Array} */
        var nodes = [];
        /** @type {number} */
        var mouseMoveTime = 0;
        /** @type {boolean} */
        var t = true;
        /** @type {Array} */
        var foregroundElts = [];
        if (!("createTouch" in document)) {
            $(init);
        }
    }

    function js() {
    }

    var self = new js;
    /**
     * @param {?} funcToCall
     * @param {?} millis
     * @return {?}
     */
    js.prototype.setInterval = function (funcToCall, millis) {
        return window.setInterval(funcToCall, millis);
    };
    /**
     * @param {?} timerId
     * @return {undefined}
     */
    js.prototype.clearInterval = function (timerId) {
        window.clearInterval(timerId);
    };
    /**
     * @param {Function} after
     * @param {number} ms
     * @return {?}
     */
    js.prototype.setTimeout = function (after, ms) {
        return window.setTimeout(after, ms);
    };
    /**
     * @param {?} timerId
     * @return {undefined}
     */
    js.prototype.clearTimeout = function (timerId) {
        window.clearTimeout(timerId);
    };
    /**
     * @param {Function} func
     * @return {?}
     */
    js.prototype.requestAnimationFrame = function (func) {
        return window.requestAnimationFrame(func);
    };
    /**
     * @param {?} requestId
     * @return {undefined}
     */
    js.prototype.cancelAnimationFrame = function (requestId) {
        window.cancelAnimationFrame(requestId);
    };
    $(function () {
        link();
    });
    if (window !== window.top) {
        init();
    }
})();
