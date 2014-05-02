(function() {

    function getContent(url, callback) {
        var req = new XMLHttpRequest;
        req.open("GET", url, true);
        req.onreadystatechange = function() {
            if (req.readyState != 4 || req.status != 200) return;

            callback(req.responseText);
        };
        req.send();
    }

    function log() {
        try {
            console.log.apply(console, arguments);
        } catch(e) {

        }
    }

    function include(callback) {

        var finished = 0,
            all = 0;

        function checkFinish() {
             if (finished === all) {
                log('Loaded all', all);
                callback();
            }
        }

        function scan(element) {
            var includes = element.querySelectorAll('include[src]');

            Array.prototype.forEach.call(includes, function(tag) {
                var src = tag.getAttribute('src'),
                    className = tag.getAttribute('class'),
                    parent = tag.parentNode;

                all++;

                //log('Will load', src, 'into', tag);

                getContent(src, function(text) {
                    finished++;

                    //log('Loaded', text.length, 'bytes from', src);

                    var container = document.createElement('div');
                    container.innerHTML = '<!-- INCLUDE ' + src + '-->\n' + text;

                    Array.prototype.forEach.call(container.childNodes, function(node) {
                        var nodeClass;
                        parent.insertBefore(node, tag);
                        //log('Attached', node, 'to', parent);
                        if (node.nodeType !== Node.COMMENT_NODE) {
                            if (className) {
                                nodeClass = node.getAttribute('class');
                                node.setAttribute('class', nodeClass + ' ' + className);
                            }
                            scan(node);
                        }
                    });

                    //log('Removing', tag);
                    parent.removeChild(tag);

                    checkFinish();
                })
            });
        }

        scan(document);


    }


    window.includer = {run: include};
})();
