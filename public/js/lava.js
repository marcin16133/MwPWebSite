//-----------------------------------------------------------------------
// Copyright (c) 2013 Terry Phillips
// Lava JS - http://lava.codeplex.com
// This license can be found here: http://lava.codeplex.com/license
//-----------------------------------------------------------------------
(function (window) {
    //'use strict';

    var Lava = {};
    Lava.isReady = false;
    Lava.dataBindName = 'data-bind';
    Lava.dataTemplateName = 'data-template';
    var attributeMaps = {};

    var unSyncableTypes = ['function', 'computed'];
var complexLavaProperties = ['bindings', 'computedProperties'];

var isSyncableType = function (type) {
    if(unSyncableTypes.indexOf(type) == -1) {
        return true;
    }
    return false;
};

var isComplexProperty = function (property) {
    if (complexLavaProperties.indexOf(property) > -1) {
        return true;
    }
    return false;
};

var showElement = function (element) {
    element.lava_shown = true;
    element.style.display = element.lava_display || '';
};

var hideElement = function (element) {
    element.lava_shown = false;
    element.lava_display = element.style.display;
    element.style.display = 'none';
};

// Determines the type of the object passed in
Lava.typeOf = function (a) {
    if (typeof a === 'undefined') {
        return 'undefined';
    }
    if (a === null) {
        return 'null';
    }
    if (a.type === 'computed') {
        return 'computed';
    }
    if (Object.prototype.toString.call(a) === '[object Array]') {
        return 'array';
    }
    if (Object.prototype.toString.call(a) === '[object Object]') {
        return 'object';
    }
    return typeof a;
};

// Merges a source object into a target object
Lava.extend = function (target, source) {
    var _t = target || {};
    var _s = source || {};

    for (var name in _s) {
        if (_s.hasOwnProperty(name)) {
            var t = _t[name];
            var s = _s[name];

            if (_t === s) {
                continue;
            }
            if (typeof t === 'undefined') {
                _t[name] = _s[name];
            }
        }
    }
};

// Syncs all of the objects properties with the properties of the object passed in
Lava.sync = function (target, source) {
    for (var property in target) {
        if (target.hasOwnProperty(property)) {
            var targetPropType = Lava.typeOf(target[property]);
            var sourcePropType = Lava.typeOf(source[property]);

            if (!isSyncableType(targetPropType) || !isSyncableType(sourcePropType)) {
                continue;
            }
            if (isComplexProperty(property) || isComplexProperty(sourcePropType)) {
                continue;
            }

            if (targetPropType === 'object' && sourcePropType === 'object') {
                Lava.sync(target[property], source[property]);
            }
            else {
                if (property[0] !== '_') {
                    // copy property value
                    target[property] = source[property];
                }
            }
        }
    }
};

// Returns an object without Lava specific properties
Lava.simplify = function (complex, simple) {
    var complex = complex || {};
    var simple = simple || {};

    for (var property in complex) {
        if (complex.hasOwnProperty(property)) {
            var complexPropType = Lava.typeOf(complex[property]);

            if (complexPropType == 'function' || isComplexProperty(property)) {
                continue;
            }

            if (complexPropType === 'object') {
                simple[property] = Lava.simplify(complex[property], simple[property]);
            }
            else {
                if (property[0] !== '_') {
                    if (complexPropType == 'computed') {
                        simple[property] = complex[property].f.call(complex[property].context);
                    }
                    else {
                        simple[property] = complex[property];
                    }
                }
            }
        }
    }
    return simple;
};

// Defers execution of a function until the DOM is ready
Lava.ready = function (f) {
    if (Lava.isReady) {
        f();
    }
    else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', function () {
            Lava.isReady = true;
            f();
        });
    }
    else {
        if (/in/.test(document.readyState)) {
            setTimeout(function () { Lava.ready(f); }, 9);
        }
        else {
            Lava.isReady = true;
            f.call(this);
        }
    }
    return this;
};

// Load data from the server using an HTTP GET request
Lava.get = function (url, success) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                if (success) success.call(this, xhr.responseText);
            }
        }
    };
    xhr.open('GET', url, true);
    xhr.timeout = 10000;
    xhr.setRequestHeader('Content-Type', 'text');
    xhr.send('{}');
};

// Performs an asynchronous HTTP request
Lava.ajax = function (options, context) {
    var context = context || window;
    var settings = {
        type: 'POST',
        url: '/',
        contentType: 'application/json; charset=utf-8',
        data: {},
        success: function () { },
        async: true,
        timeout: 10000
    };

    Lava.extend(options, settings);

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var text = xhr.responseText.replace(/\\\/Date\((-?\d+)\)\\\//g, function (match, p1) {
                    return new Date(parseInt(p1)).toISOString();
                });
                options.success.call(context, JSON.parse(text));
            }
        }
    };
    xhr.open(options.type, options.url, options.async);
    xhr.timeout = options.timeout;
    xhr.setRequestHeader('Content-Type', options.contentType);
    var data = Lava.simplify(options.data);
    xhr.send(JSON.stringify(data));
};

// Converts an object string to JSON
var convertObjectStrToJSON = function (obj) {
    var nonWritable = '"\'',
        strings = [],
        string = '',
        insideQuotes = false,
        oLen = obj.length,
        json = [];

    // replace brackets
    obj = obj.replace(/\[/g, '<').replace(/\]/g, '>');

    for (var a = 0; a < oLen; a++) {
        var c = obj[a];

        // handle strings inside quotes
        if (c === "'") {
            if (!insideQuotes) {
                string = '';
                insideQuotes = true;
                json.push('[' + strings.length + ']');
            }
            else {
                strings.push(string);
                insideQuotes = false;
            }

            continue;
        }

        if (insideQuotes) {
            string += c;
            continue;
        }
        // END handle strings inside quotes

        // write the char to the output stram
        if (nonWritable.indexOf(c) === -1) {
            json.push(c);
        }
    }

    var jsonStr = json.join('');

    // wrap all keys and values with double quotes
    jsonStr = jsonStr.replace(/[^ \{\},:]+/g, function (a) {
        if (!isNaN(parseFloat(a)) && isFinite(a)) return a;
        return '"' + a + '"';
    });

    for (var a = 0; a < strings.length; a++) {
        jsonStr = jsonStr.replace('[' + a + ']', '"' + strings[a] + '"');
    }

    jsonStr = jsonStr.replace(/</g, '[').replace(/>/g, ']');


    // get rid of duplicate quotes
    jsonStr = jsonStr.replace(/\"\"/g, '"');

    return jsonStr;
};

// this method takes in an object expression (e.g. object.property) and resolves it
var resolveObjectExpression = function (expression, context) {
    var objectName = 'window', object = context || window, property = null, propertyIsIndex = false;
    var objectFragments = expression.toString().split('.');

    for (var b = 0; b < objectFragments.length; b++) {
        property = objectFragments[b].trim();
        var tmp = null;
        var leftIdx = property.indexOf('['), rightIdx = property.indexOf(']');
        // handle special array syntax
        if (property.indexOf('[@each]') > -1) {
            objectName = property;
            object = object[property.replace('[@each]', '')];
            if (!object.computedProperties)
                object.computedProperties = [];
        }
        else if (property.indexOf('[i]') == 0) {

        }
        // handle array
        else if (leftIdx > -1 && rightIdx > -1) {
            var array = property.substring(0, leftIdx);
            var index = property.substring(leftIdx + 1, rightIdx);
            tmp = object[array][index];
        }
        else {
            tmp = object[property];
        }

        if (Lava.typeOf(tmp) === 'object') {
            objectName = property;
            object = tmp;
        }
    }

    // check to see if property is unique.  If not, we do not actually have a property in the expression, just an object
    if (objectName === property) {
        property = null;
    }

    // check to see if the property is actually an array index
    if (property && property.indexOf('[') > -1 && property.slice(-1) == ']') {
        objectName = property.substring(0, property.indexOf('['));
        object = object[objectName];
        property = property.substring(property.indexOf('[') + 1, property.length - 1);
        propertyIsIndex = true;
    }

    return { objectName: objectName, object: object, property: property, propertyIsIndex: propertyIsIndex };
};

var resolveAttribute = function (attribute) {
    if (attributeMaps[attribute])
        return attributeMaps[attribute];
    else
        return attribute;
};

var getPathFromPropertyExpression = function (expression) {
    return expression.substring(0, expression.lastIndexOf('.'));
};

var replaceTemplateTags = function (text) {
    var regex = new RegExp(Lava.dataTemplateName, 'g');
    return text.replace(regex, Lava.dataBindName);
};

var resolveAllUnboundExpressions = function (text) {
    var left = text.indexOf('{{'), right = 0;
    var replaces = [];

    while (left > -1) {
        // get the closing brace
        right = text.indexOf('}}', left);

        var expression = text.substring(left + 2, right);
        var result = resolveObjectExpression(expression);
        
        // replace the expression with its value
        var regex = new RegExp('\\{\\{' + expression.replace('[', '\\[').replace(']', '\\]').replace('(', '\\(').replace(')', '\\)') + '\\}\\}', 'g');
        var value = result.object[result.property];
        if (Lava.typeOf(result.object[result.property]) === 'function') {
            value = result.object[result.property]();
        }
        else if (Lava.typeOf(result.object[result.property]) === 'computed') {
            value = result.object[result.property].get();
        }
        

        replaces.push({ regex: regex, value: value });

        // get new index value
        left = text.indexOf('{{', right);
        var i = 0;
    }

    for (var i = 0; i < replaces.length; i++) {
        var replace = replaces[i];
        text = text.replace(replace.regex, replace.value);
    }

    return text;
}

    var routes = {};
var root = window.location.pathname;
var routingEnabled = false;

var cleanUpPath = function (route) {
    var routeLength = route.length;
    // remove trailing slash
    var route = (routeLength > 1 && route[routeLength - 1] === '/') ? route.substring(0, routeLength - 1) : route;
    // remove double slashes
    route = route.replace(/\/\//g, '');
    // remove trailing pound
    var route = (routeLength > 1 && route[routeLength - 1] === '#') ? route.substring(0, routeLength - 1) : route;
    return route;
};

Lava.Routes = {
    add: function (route, action) {
        if (!routingEnabled) {
            // set up the routing system
            window.onload = function (event) {
                initialRoute = window.location.hash.replace('#', '');
                Lava.Routes.go(initialRoute, true);
            };

            window.onpopstate = function (event) {
                if (event.state) {
                    Lava.Routes.go(event.state, true);
                }
            };

            window.onhashchange = function () {
                Lava.Routes.go(window.location.hash.replace('#', ''), true);
            };

            routingEnabled = true;
        }

        routes[route] = { name: route, path: cleanUpPath(root + '#' + route), action: action };
    },
    get: function (route) {
        return routes[route];
    },
    getCurrent: function () {
        return routes[window.location.hash.replace('#', '')];
    },
    go: function (route, ignorePushState) {
        var routeObj = routes[route];
        if (typeof routeObj == 'undefined') {
            return false;
        }
        if (!ignorePushState) {
            window.history.pushState(routeObj.name, routeObj.name, routeObj.path);
        }
        if (routeObj.action) {
            routeObj.action();
        }
    }
}

    // adds getter and setter methods to all properties on an object
var addGetSet = function (obj) {
    for (var n in obj) {
        var newKey = '_' + n;
        var objType = Lava.typeOf(obj[n]);
        if (obj.hasOwnProperty(n) && !Object.getOwnPropertyDescriptor(obj, n).get) {
            if (objType === 'object') {
                addGetSet(obj[n]);
            }
            else if (n != 'computedProperties') {
                // add binding storage to the object
                if (!obj.bindings) obj.bindings = {};
                if (!obj.bindings[n]) obj.bindings[n] = [];
                if (objType === 'array') {
                    // add array specific binding storage
                    if (!obj[n].bindings) obj[n].bindings = {};

                    if (!obj[n].bindings.add) obj[n].bindings.add = [];
                    if (!obj[n].bindings.addAt) obj[n].bindings.addAt = [];
                    if (!obj[n].bindings.remove) obj[n].bindings.remove = [];
                    if (!obj[n].bindings.removeAt) obj[n].bindings.removeAt = [];
                }

                if (Lava.typeOf(obj[n]) === 'computed')
                    if (!obj[n].context)
                        obj[n].context = obj;

                obj[newKey] = obj[n];
                delete obj[n];
                (function (object, key, name, type) {
                    Object.defineProperty(obj, name, {
                        get: function () {
                            if (this.dependOn && this.dependOn.indexOf(name) === -1) {
                                this.dependOn.push(name);
                            }
                            return this[key];
                        },
                        set: function (x) {
                            this[key] = x;
                            set(obj, name, obj[name]);
                        },
                        configurable: true,
                        enumerable: true
                    });
                    // set up array methods
                    if (type === 'array') {
                        obj[name].add = function (value) {
                            obj[name].push(value);
                            set(obj[name], 'add', value);
                            return value;
                        };
                        obj[name].addAt = function (index, value) {
                            obj[name].splice(index, 0, value);
                            set(obj[name], 'addAt', { index: index, value: value });
                            return value;
                        };
                        obj[name].remove = function (value) {
                            set(obj[name], 'remove', value);
                            obj[name].splice(obj[name].indexOf(value), 1);
                            return value;
                        };
                        obj[name].removeAt = function (index) {
                            var item = obj[name].splice(index, 1);
                            set(obj[name], 'removeAt', index);
                            return item.length > 0 ? item[0] : null;
                        };
                        obj[name].empty = function () {
                            var len = obj[name].length;
                            while (len--) {
                                obj[name].removeAt(len);
                            }
                        };
                        obj[name].fill = function (lavaArray) {
                            obj[name].empty();
                            var len = lavaArray.length;
                            for (var i = 0; i < len; i++) {
                                obj[name].add(lavaArray[i]);
                            }
                        };
                    }
                }(this, newKey, n, objType));

                if (!obj.computedProperties)
                    obj.computedProperties = [];
            }
        }
    }
};

// sets the changed value of an object's property to all of its bound properties
var set = function (object, property, value) {
    var propertyBindings = object.bindings[property];
    var len = propertyBindings.length;
    for (var a = 0; a < len; a++) {
        if (propertyBindings[a].func) {
            propertyBindings[a].func(value);
        }
        else {
            propertyBindings[a](value);
        }
    }
};

Lava.bind = function () {
    while (document.querySelectorAll('[' + Lava.dataBindName + ']').length > 0) {      
        var elements = document.querySelectorAll('[' + Lava.dataBindName + ']');

        for (var a = 0; a < elements.length; a++) {
            var element = elements[a];
            // get the binding expression
            var expressions = JSON.parse(convertObjectStrToJSON(element.getAttribute('' + Lava.dataBindName + '')));

            for (var attribute in expressions) {
                if (expressions.hasOwnProperty(attribute)) {
                    var expression = expressions[attribute];

                    if (Lava.typeOf(expression) === 'object') {
                        // this is a complex binding with multiple different properties in the binding expression
                        // current properties that make up a complex binding: bind, mode, format, args
                        // resolve the bind property
                        var resolved = resolveObjectExpression(expression.bind);
                        bindExpression(resolved.objectName, resolved.object, resolved.property, element, attribute, expression, resolved.propertyIsIndex);
                    }
                    else {
                        var resolved = resolveObjectExpression(expression);
                        bindExpression(resolved.objectName, resolved.object, resolved.property, element, attribute, expression, resolved.propertyIsIndex);
                    }
                }
            }
            element.removeAttribute(Lava.dataBindName);
        }
    }
};

var bindExpression = function (objectName, object, property, element, attribute, expression, propertyIsIndex) {
    var attribute = resolveAttribute(attribute);
    var func = null;

    // handle template attribute
    if (attribute === 'template' && property == null) {
        element.innerHTML = replaceTemplateTags(document.getElementById(objectName).innerHTML);
        return;
    }

    // handle functions as properties that return a value
    var isNormalFunc = false;
    if (property.slice(-2) === '()') {
        property = property.substring(0, property.length - 2);
        isNormalFunc = true;
    }

    // choose the func based on the type of attribute we are dealing with
    if (Lava.typeOf(object[property]) === 'function') {
        if (isNormalFunc) {
            func = function (value) {
                if (value) {
                    var v = resolveFormatExpressionProperty(value.call(object), expression);
                    if (element[attribute] != v) 
                        element[attribute] = v;
                }
            };
        }
        else {
            if (expression.args) {
                // resolve argument expressions
                var args = {};
                for (var arg in expression.args) {
                    if (expression.args.hasOwnProperty(arg)) {
                        var tmp = resolveObjectExpression(expression.args[arg]);
                        if (tmp.property) {
                            if (tmp.object.hasOwnProperty(tmp.property)) {
                                args[arg] = tmp.object[tmp.property];
                            }
                            else {
                                args[arg] = tmp.property;
                            }
                        }
                        else {
                            // there is no property in the resolved expression so just set the arg to the object
                            args[arg] = tmp.object;
                        }
                    }
                }

                element.addEventListener(attribute, function (e) {
                    object[property].call(object, e, args);
                }, false);
            }
            else {
                element.addEventListener(attribute, function (e) {
                    object[property].call(object, e);
                }, false);
            }
        }
    }
    else if (Lava.typeOf(object[property]) === 'computed') {
        // overwrite dependencies if array var is used
        //var path = getPathFromPropertyExpression(expression);
        //object[property].dependencies = object[property].dependencies.replace(/\[i\]/g, path);
        bindComputedProperty(object, property, element, attribute, expression);
    }
    else if (attribute.indexOf('style.') === 0) {
        var subAttribute = attribute.replace('style.', '');

        func = function (value) {
            value = resolveFormatExpressionProperty(value, expression);
            if (element.style[subAttribute] != value)
                element.style[subAttribute] = value;
        };
    }
    else if (attribute === 'foreach') {
        var array = object[property];

        if (Lava.typeOf(array) === 'array') {
            var tagName = element.tagName.toLowerCase();
            // we need to wrap the children in a parent element if there is more than one child
            if (element.children.length > 1) {
                if (tagName == 'ul') {
                    element.innerHTML = '<li>' + element.innerHTML + '</li>';
                }
                else if (tagName == 'table') {
                    element.innerHTML = '<tr>' + element.innerHTML + '</tr>';
                }
                else if (tagName == 'tr') {
                    element.innerHTML = '<td>' + element.innerHTML + '</td>';
                }
                else {
                    element.innerHTML = '<div>' + element.innerHTML + '</div>';
                }
            }

            var template = element.innerHTML;

            if (expression.template) {
                // get the template
                var templateElement = document.getElementById(expression.template);
                // create the correct type of tempElement.  This is necessary because if we wrap, for example,
                // tr elements with a div to test, the tr will be ignored.
                var tempElement = document.createElement(tagName);
                tempElement.innerHTML = templateElement.innerHTML;
                if (tempElement.children.length > 1) {
                    if (tagName == 'ul') {
                        templateElement.innerHTML = '<li>' + templateElement.innerHTML + '</li>';
                    }
                    else if (tagName == 'table') {
                        templateElement.innerHTML = '<tr>' + templateElement.innerHTML + '</tr>';
                    }
                    else if (tagName == 'tr') {
                        templateElement.innerHTML = '<td>' + templateElement.innerHTML + '</td>';
                    }
                    else {
                        templateElement.innerHTML = '<div>' + templateElement.innerHTML + '</div>';
                    }
                }

                template = templateElement.innerHTML;
                // get rid of the temporary element
                delete tempElement;
            }

            element.innerHTML = '';
            var html = '';

            for (var a = 0; a < array.length; a++) {
                html += replaceTemplateTags(template.replace(/\[i\]/g, objectName + '.' + property + '[' + a + ']'));
            }
            html = resolveAllUnboundExpressions(html);
            element.innerHTML = html;

            // function to handle adding item to array
            var add = function (value) {
                var index = object[property].length - 1;
                var html = replaceTemplateTags(template.replace(/\[i\]/g, objectName + '.' + property + '[' + index + ']'));
                html = resolveAllUnboundExpressions(html);
                element.insertAdjacentHTML('beforeend', html);
                /*setTimeout(function () {*/ Lava.bind(); /*}, 10);*/
                // take care of computed properties
                var computedProperties = array.computedProperties || [];
                for (var a = 0; a < computedProperties.length; a++) {
                    rebindComputedProperty(computedProperties[a], element);
                }
            };
            object[property].bindings.add.push({ func: add, attribute: attribute });
            // function to handle adding item to array at index
            var addAt = function (value) {
                var html = replaceTemplateTags(template.replace(/\[i\]/g, objectName + '.' + property + '[' + value.index + ']'));
                html = resolveAllUnboundExpressions(html);
                var d = document.createElement('div');
                d.innerHTML = html;
                var newNode = d.firstElementChild;
                if (element.children.length === 0)
                    element.innerHTML = html;
                else
                    element.insertBefore(newNode, element.children[value.index]);
                d = null;
                /*setTimeout(function () {*/ Lava.bind(); /*}, 10);*/
                // take care of computed properties
                var computedProperties = array.computedProperties || [];
                for (var a = 0; a < computedProperties.length; a++) {
                    rebindComputedProperty(computedProperties[a], element);
                }
            };
            object[property].bindings.addAt.push({ func: addAt, attribute: attribute });
            // function to handle removing item from array
            var remove = function (value) {
                var index = array.indexOf(value);
                if (index > -1) {
                    element.removeChild(element.children[index]);
                }
            };
            object[property].bindings.remove.push({ func: remove, attribute: attribute });
            // function to handle removing item from array at index
            var removeAt = function (value) {
                if (value > -1) {
                    element.removeChild(element.children[value]);
                }
            };
            object[property].bindings.removeAt.push({ func: removeAt, attribute: attribute });
        }
    }
    else if (attribute === 'if') {
        func = function (value) {
            var shown = element.lava_shown;
            if (Lava.typeOf(shown) === 'undefined') {
                // the if block has not been processed yet
                if (value)
                    element.lava_shown = true;
                else
                    hideElement(element);
            }
            else if (shown === true && value === false) {
                hideElement(element);
            }
            else if (shown === false && value === true) {
                showElement(element);
            }
        }
    }
    else if (attribute === 'ifnot') {
        func = function (value) {
            value = !value;
            var shown = element.lava_shown;
            if (Lava.typeOf(shown) === 'undefined') {
                // the if block has not been processed yet
                if (value)
                    element.lava_shown = true;
                else
                    hideElement(element);
            }
            else if (shown === true && value === false) {
                hideElement(element);
            }
            else if (shown === false && value === true) {
                showElement(element);
            }
        }
    }
    else if (attribute === 'class') {

    }
    else {
        func = function (value) {
            value = resolveFormatExpressionProperty(value, expression);
            if (element[attribute] !== value)
                element[attribute] = value;
        };
    }

    // set up two-way binding for value attribute
    if (attribute === 'value' && expression.mode != 'oneWay') {
        var elementType = element.tagName.toLowerCase()
        var typeAttr = element.getAttribute('type');
        if(typeAttr) 
            elementType += ':' + typeAttr.toLowerCase();
        if ('input:checkbox input:radio select'.indexOf(elementType) > -1) {
            element.addEventListener('change', function () {
                setTimeout(function () { object[property] = element.value; }, 10);
            }, false);
        }
        else if ('input:text textarea'.indexOf(elementType) > -1) {
            element.addEventListener('keypress', function () {
                setTimeout(function () { object[property] = element.value; }, 10);
            }, false);
        }
    }

    // set up two-way binding for checked
    if (attribute === 'checked') {
        var elementType = element.tagName.toLowerCase() + ':' + element.getAttribute('type').toLowerCase();
        if ('input:checkbox input:radio'.indexOf(elementType) > -1) {
            element.addEventListener('change', function () {
                setTimeout(function () { object[property] = element.checked; }, 10);
            }, false);
        }
    }

    // add the default binding function if present.  This will be null for array type functions
    if (func) {
        if (object.bindings) {
            object.bindings[property].push({ func: func, attribute: attribute });
        }
        func(object[property]);
    }
};

var bindComputedProperty = function (object, property, element, attribute, expression) {
    var computed = object[property],
        context = computed.context,
        arr = [];
    if (computed.dependencies) {
        arr = computed.dependencies.split(',');
    } else {
        context.dependOn = arr;
        computed.f.call(context);
        delete context.dependOn;
    }
    computed.properties = [];
    for (var a = 0; a < arr.length; a++) {
        var expressionObject = resolveObjectExpression(arr[a].trim(), context);
        expressionObject.object.computedProperties.push({ computed: computed, element: element, attribute: attribute, expression: expression });
        computed.properties.push(expressionObject);
        rebindComputedProperty({ computed: computed, element: element, attribute: attribute, expression: expression });
    }
};

var rebindComputedProperty = function (object, currentElement) {
    // add binding functions for each dependency object
    for (var a = 0; a < object.computed.properties.length; a++) {
        (function (obj, element, attribute, computed, expression) {
            var f = null;
            if (attribute.indexOf('style.') === 0) {
                var subAttribute = attribute.replace('style.', '');

                f = function () {
                    // do not apply the computed property when it is not on
                    if (!computed.on) return;
                    var value = resolveFormatExpressionProperty(computed.f.call(computed.context), expression);

                    if (!value)
                        value = '';

                    element.style[subAttribute] = value;
                };
            }
            else {
                f = function () {
                    // do not apply the computed property when it is not on
                    if (!computed.on) return;
                    var value = resolveFormatExpressionProperty(computed.f.call(computed.context), expression);

                    if (!value)
                        value = '';

                    element[attribute] = value
                };
            }
            if (Lava.typeOf(obj.object) === 'array') {
                for (var b = 0; b < obj.object.length; b++) {
                    addBinding(obj.object[b].bindings[obj.property], f, attribute, element);
                }
            }
            else {
                addBinding(obj.object.bindings[obj.property], f, attribute, element);
            }
            computed.trigger = f;
            f();
        })(object.computed.properties[a], object.element, object.attribute, object.computed, object.expression);
    }
};

var addBinding = function (existingBindings, func, attribute, element) {
    // make sure that this binding does not already exist
    var exists = false;
    for (var c = 0; c < existingBindings.length; c++) {
        if (existingBindings[c].attribute === attribute && element == existingBindings[c].element) {
            exists = true;
            break;
        }
    }
    if (!exists)
        existingBindings.push({ func: func, attribute: attribute, element: element });
};

var resolveFormatExpressionProperty = function (value, expression) {
    if (expression.format)
        value = expression.format.replace('{0}', value);
    else if (expression.formatExclusive && value != null && value.toString().length > 0)
        value = expression.formatExclusive.replace('{0}', value);

    return value;
};
    Lava.Object = function (a) {
    var a_copy = {};
    Lava.extend(a_copy, a);
    addGetSet(a);
    a.clone = function (b) {
        var cloned = b || {};
        Lava.extend(cloned, a_copy);
        addGetSet(cloned);
        // apply proper context to all computed properties
        for (var prop in a) {
            if (a.hasOwnProperty(prop)) {
                var property = a[prop];
                if (Lava.typeOf(property) === 'computed') {
                    cloned[prop] = {
                        type: 'computed',
                        dependencies: property.dependencies,
                        f: property.f,
                        on: true,
                        context: cloned
                    };
                }
            }
        }
        cloned.sync = function (c) {
            Lava.sync(cloned, c);
            return cloned;
        }
        return cloned;
    };
    a.extend = function (b) {
        Lava.extend(a, b);
        Lava.extend(a_copy, b);
        addGetSet(a);
    };
    a.sync = function (b) {
        Lava.sync(a, b);
        return a;
    };
    return a;
};

    // takes in a normal javascript array and returns an array consisting of Lava.Object
Lava.Array = function (array, object) {
    if (Lava.typeOf(array) == 'array') {
        var lavaArray = [];
        var arrayLen = array.length;

        for (var i = 0; i < arrayLen; i++) {
            var o = array[i];
            if (o.bindings) {
                // object is already a Lava.Object
                lavaArray.push(o);
            }
            else {
                var type = Lava.typeOf(o);

                if (type === 'array') {
                    // o is an array so we need to call createArray recursively
                    lavaArray.push(Lava.Array(o));
                }
                else if (type === 'object') {
                    // o is already an object so we just need to create a Lava.Object from it
                    if (object) {
                        lavaArray.push(object.clone(o));
                    }
                    else {
                        lavaArray.push(Lava.Object(o));
                    }
                }
                else {
                    // lava is not an array or object so we need to treat it as a single property
                    lavaArray.push(Lava.Object({ value: o }));
                }
            }
        }

        return lavaArray;
    }
    return null;
}

    Lava.Controller = function (a) {
    addGetSet(a);
    a.extend = function (b) {
        Lava.extend(a, b);
        addGetSet(a);
    };
    return a;
};
    /// COMPUTED PROPERTY
// Sets up a computed property that depends on other properties in the root object or a child object
// dependencies: optional parameter for describing properties that this computed property should depend on.
// It can have special syntax but in simple case its comma delimited list of property names that this computed property 
// should depend on.  Every time one of these dependent properties changes, a change request will be sent to the computed 
// property as well.
// f: the function that makes up the computed property
Lava.Computed = function (dependencies, f, context) {
    var hasDependencies = typeof dependencies === "string",
        args = Array.prototype.slice.call(arguments);
    if (!hasDependencies) {
        args.unshift(null);
    }
    
    var computed = {
        type: 'computed',
        dependencies: args[0],
        f: args[1],
        on: true,
        context: args[2]
    };

    computed.get = function () {
        return computed.f.call(computed.context);
    };

    return computed;
};

/// END COMPUTED PROPERTY

    Lava.ready(function () {
        // create attribute maps
        if (document.innerText)
            attributeMaps.text = 'innerText';
        else
            attributeMaps.text = 'textContent';

        attributeMaps.html = 'innerHTML';
        attributeMaps.class = "className";
        attributeMaps.show = 'if';
        attributeMaps.hide = 'ifnot';

        Lava.bind();
    });

    window.Lava = Lava;
})(window);