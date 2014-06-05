var C = class_(function () {
    var x;
    this.y;
 
    //成员函数
    this.m = FunctionH.overload({
	    'number,number': function () {
	        return arguments[0] + arguments[1];
	    },
	    'number,number,number': function () {
	        return arguments[0] * arguments[1] * arguments[2];
	    }
	});
 
    //构造函数重载1
    C._(Integer, Integer, function (i, j) {
        x = i;
        this.y = j;
    });
 
    //构造函数重载2
    C._(String, function (s) {
        x = "String: " + s;
    });
});

function generateParaList(paraList) {

}

function generateStats(stats) {

}

function generateField(field) {
	if(field.type != "variable")
		return "";

	var fieldCode;
	if(field.qualifiers == "private")
		fieldCode = "var ";
	else
		fieldCode = "this.";
	fieldCode += field.paraName;
	if(field.isArray)
		fieldCode += " = []";
	fieldCode += ";\n\n";
	return fieldCode;
}

function generateCfuncs(cfuncs, classname) {
	if(cfuncs.length == 0)
		return "";

	var cfuncsCode = "";
	for(var i = 0; i < cfuncs.length; i++) {
		cfuncsCode += generateCfunc(cfuncs[i], classname);
	}
	return cfuncsCode;
}

function generateCfunc(cfunc, classname) {
	if(cfunc.type != "constructFunc")
		return "";

	/*
	    //构造函数重载1
    C._(Integer, Integer, function (i, j) {
        x = i;
        this.y = j;
    });
 
    //构造函数重载2
    C._(String, function (s) {
        x = "String: " + s;
    });
	*/
	var cfuncCode = classname + "._(";
	generateParaList(cfunc.paraList);
	generateStats(cfunc.stats);
	cfuncCode += "});\n\n";
	return cfuncCode;
}

function generateMethods(methods) {
	/*
	//成员函数
    this.m = FunctionH.overload({
	    'number,number': function () {
	        return arguments[0] + arguments[1];
	    },
	    'number,number,number': function () {
	        return arguments[0] * arguments[1] * arguments[2];
	    }
	});
	*/
	if(methods.length == 0)
		return "";

	var methodsCode = "";
	var mainCode;
	var funcs = {};
	for(var i = 0; i < methods.length; i++) {
		if(methods[i].name == "main") {
			if(methods[i].qualifiers.indexOf("public") != -1 &&
				methods[i].qualifiers.indexOf("static") != -1) {
				mainCode = generateMainMethod(methods[i]);
				continue;
			}
		}
	}
	var codes = {
		methods: methodsCode,
		main: mainCode
	};
	return codes;
}

function generateSimpleMethod(method) {

}

function generateMultipleMethod(methods) {

}

function generateMainMethod(method) {
	var mainCode = "function main(";
	for(var i = 0; i < method.paraList.length - 1; i++) {
		mainCode += method.paraList[i].name + ", ";
	}
	if(method.paraList.length > 0) {
		mainCode += method.paraList[method.paraList.length - 1].name;
	}
	mainCode += ") {\n";
	mainCode += "}\n\n";
	return mainCode;
}

function generateClass(myclass) {
	if(myclass.type != "class")
		return "";

	var classCode = "var ";
	var mainCode;
	if(myclass.name == undefined) {
		alert("error: no class name");
		return "";
	}
	classCode += myclass.name;
	classCode += " = class_(function(){\n\n";
	if(myclass.fields != undefined) {
		for(var i = 0; i < myclass.fields.length; i++) {
			classCode += generateField(myclass.fields[i]);
		}
	}
	if(myclass.cfucns != undefined) {
		classCode += generateCfuncs(myclass.cfucns, myclass.name);
	}
	if(myclass.methods != undefined) {
		var MethodsCode = generateMethods(myclass.methods);
		classCode += MethodsCode.methods;
		mainCode = MethodsCode.main;
	}
	classCode += "});\n\n";
	var codes = {
		classCode: classCode,
		mainCode: mainCode
	};
	return codes;
}

function generateGlobalvar(globalvar) {
	var globalvarCode = "";
	return globalvarCode;
}

function Gnerator(program) {
	if(program.type != "program")
		return "";

	console.log(program);
	var jsCode = "";
	var mainCode;
	if(program.classes != undefined) {
		for(var i = 0; i < program.classes.length; i++) {
			var classCode = generateClass(program.classes[i]);
			jsCode += classCode.classCode;
			mainCode = classCode.mainCode;
		}
	}
	if(program.globalvars != undefined) {
		for(var i = 0; i < program.globalvars.length; i++) {
			jsCode += enerateGlobalvar(program.globalvars[i]);
		}
	}
	if(mainCode != "") {
		jsCode += mainCode;
		jsCode += "main();"
	}
	return jsCode;
}