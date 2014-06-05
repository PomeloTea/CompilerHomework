void function () {
    this.Integer = function (n) {
        if (typeof n != "number") n = 0;
        else n = Math.floor(n)
        this.valueOf = function () { return n; };
        this.toString = function () { return n.toString(); };
    };

    var _instance;

    this._ = function () {
        var typeRules = [
                function (o, c) { return c == Object; },
                function (o, c) { return (typeof o == "string" && c == String); },
                function (o, c) { return (typeof o == "number" && (c == Number || (parseInt(o) == o && c == Integer))); },
                function (o, c) { return (typeof o == "boolean" && c == Boolean); }
            ],
            typeContainRules = [
                function (c1, c2) { return (c1 == Object); },
                function (c1, c2) { return (c1 == Number && c2 == Integer); }
            ];

        _instance = instance;

        return function () {
            var overloadList = [],
                typesList = [];

            if (arguments.length) overload.apply(null, arguments);

            fn._ = overload;
            fn.toString = function () { return "[Vejis Method]" + (overloadList[0] ? " \n" + overloadList[0] : ""); };

            return fn;

            function fn() {
                var overload;
                if (overload = getOverload(arguments)) {
                    var returnValue = overload.apply(this, arguments);
                    return returnValue;
                }
                throw new Error("No overload for the arguments given is found.");
            }

            function overload() {
                var len = arguments.length - 1;
                if (len < 0) throw new Error("Method overloading needs at least 1 argument.")

                var types = [], i;
                for (i = 0; i < len; i++) {
                    var type = arguments[i];
                    if (typeof type != "function") throw new Error("The arguments type needs to be class(function).");
                    types.push(type);
                }

                var overload = arguments[i];
                if (typeof overload != "function") throw new Error("The overload needs to be function.");

                if (existOverload(types)) throw new Error("The overload or a overload that can't be distinguished from this has already existed.");

                overloadList.push(overload);
                typesList.push(types);
            }

            function getOverload(args) {
                for (var i = 0; i < typesList.length; i++) {
                    var otypes = typesList[i];
                    var olen = otypes.length;
                    if (olen != args.length) continue;
                    for (var j = 0; j < olen; j++)
                        if (!instance(args[j], otypes[j])) break;
                    if (j == olen) return overloadList[i];
                }
                return null;
            }

            function existOverload(types) {
                for (var i = 0; i < typesList.length; i++) {
                    var otypes = typesList[i];
                    var olen = otypes.length;
                    if (olen != types.length) continue;
                    for (var j = 0; j < olen; j++) {
                        var otype = otypes[j];
                        var type = types[j];
                        if (otype != type && !isRelated(otype, type)) break;
                    }
                    if (j == olen) return true;
                }
                return false;
            }
        };

        function instance(o, c) {
            if (o instanceof c) return true;
            for (var i = 0; i < typeRules.length; i++)
                if (typeRules[i](o, c)) return true;
            return false;
        }

        function isRelated(c1, c2) {
            for (var i = 0; i < typeContainRules.length; i++) {
                var typeContainRule = typeContainRules[i];
                if (typeContainRule(c1, c2) || typeContainRule(c2, c1)) return true;
            }
            return false;
        }

        function ifContains(c1, c2) {
            for (var i = 0; i < typeContainRules.length; i++)
                if (typeContainRules[i](c1, c2)) return true;
            return false;
        }
    } ();

    this.class_ = _(Function, function (cls) {
        return Class;

        function Class() {
            if (arguments.callee != this.constructor)
                throw new Error('Operator "new" missing.');

            var fn = _(),
                hasInit = false;

            Class._ = function () {
                hasInit = true;
                fn._.apply(null, arguments);
            };

            cls.call(this);

            if (!hasInit)
                fn._(function () { });

            fn.apply(this, arguments);
        }
    });
} ();

var map = function (arr, callback, pThis) {
    var len = arr.length;
    var rlt = new Array(len);
    for (var i = 0; i < len; i++) {
        if (i in arr) rlt[i] = callback.call(pThis, arr[i], i, arr); 
    }
    return rlt;
};
/**
 * 函数参数重载方法 overload，对函数参数进行模式匹配。默认的dispatcher支持*和...以及?，"*"表示一个任意类型的参数，"..."表示多个任意类型的参数，"?"一般用在",?..."表示0个或任意多个参数
 * @method overload
 * @static
 * @optional {dispatcher} 用来匹配参数负责派发的函数
 * @param {func_maps} 根据匹配接受调用的函数列表
 * @return {function} 已重载化的函数
 */
var FunctionH = {
    overload: function (dispatcher, func_maps) {
        if (!(dispatcher instanceof Function)) {
            func_maps = dispatcher;
            dispatcher = function (args) {
                var ret = [];
                return map(args, function (o) { return typeof o}).join();
            }
        } 

        return function () {
            var key = dispatcher([].slice.apply(arguments));
            for (var i in func_maps) {
                var pattern  = new RegExp("^" + i.replace("*", "[^,]*").replace("...", ".*") + "$");
                if (pattern.test(key)) {
                    return func_maps[i].apply(this, arguments);
                } 
            }
        }
    }
};