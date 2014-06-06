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

function addTab(n) {
	var tabs = "";
	for(var i = 0; i < n; i++)
		tabs += '\t';
	return tabs;
}

function generateParaList(paraList) {
	var paraListCode = "";
	for(var i = 0; i < paraList.length - 1; i++) {
		paraListCode += paraList[i].name + ", ";
	}
	if(paraList.length > 0) {
		paraListCode += paraList[paraList.length - 1].name;
	}
	return paraListCode;
}

function generateCParaList(paraList) {
	var paraListCode = "";
	for(var i = 0; i < paraList.length; i++) {
		//paraListCode += paraList[i].name + ", ";
	}
	paraListCode += "function(";
	paraListCode += generateParaList(paraList);
	paraListCode += ") {\n";
	return paraListCode;
}

function generateStat(stat, tab) {
	var statCode = addTab(tab);
	if(stat.expr.type != undefined) {
		switch(stat.expr.type) {
			case "valueSetExpr":
				statCode += "var " + stat.varName + " = [";
				for(var i in stat.expr.valueSet) {
					statCode += stat.expr.valueSet[i] + ", ";
				}
				if(stat.expr.valueSet.length > 0)
					statCode = statCode.substr(0, statCode.length - 2);
				statCode += "]";
				break;
			case "newArrayExpr":
				statCode += "var " + stat.varName + " = new Array(";
				statCode += stat.expr.size + ")";
				break;
			case "newObjectExpr":
				statCode += "var " + stat.varName + " = new ";
				statCode += stat.expr.className + "(";
				for(var i in stat.expr.paraList) {
					statCode += stat.expr.paraList[i] + ", ";
				}
				if(stat.expr.paraList.length > 0)
					statCode = statCode.substr(0, statCode.length - 2);
				statCode += ")";
				break;
		}
	} else {
		statCode += stat.varName;
	}
	statCode += ";\n";
	return statCode;
}

function generateField(field, tab) {
	if(field.type != "variable")
		return "";

	var fieldCode;
	//if(field.qualifiers == "private")
	//	fieldCode = "var ";
	//else
	fieldCode = addTab(tab) + "this.";
	fieldCode += field.name;
	if(field.isArray)
		fieldCode += " = []";
	fieldCode += ";\n\n";
	return fieldCode;
}

function generateCfunc(cfunc, tab) {
	if(cfunc.type != "constructFunction")
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
	var cfuncCode = addTab(tab) + cfunc.name + "._(";
	cfuncCode += generateCParaList(cfunc.paraList);
	//generateStats(cfunc.stats);
	cfuncCode += addTab(tab) + "});\n\n";
	return cfuncCode;
}

function generateCfuncs(cfuncs, tab) {
	if(cfuncs.length == 0)
		return "";

	var cfuncsCode = "";
	for(var i = 0; i < cfuncs.length; i++) {
		cfuncsCode += generateCfunc(cfuncs[i], tab);
	}
	return cfuncsCode;
}

function generateSimpleMethod(method) {
}

function generateMultipleMethod(methods) {
}

function generateMainMethod(method) {
	var mainCode = "function main(";
	mainCode += generateParaList(method.paraList);
	mainCode += ") {\n";
	for(var i in method.stats) {
		mainCode += generateStat(method.stats[i], 1);
	}
	mainCode += "}\n\n";
	return mainCode;
}

function generateMethods(methods, tab) {
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

function generateClass(myclass, tab) {
	if(myclass.type != "class")
		return "";

	var classCode = addTab(tab) + "var ";
	var mainCode;
	if(myclass.name == undefined) {
		alert("error: no class name");
		return "";
	}
	classCode += myclass.name;
	classCode += " = class_(function(){\n\n";
	if(myclass.fields != undefined) {
		for(var i = 0; i < myclass.fields.length; i++) {
			classCode += generateField(myclass.fields[i], tab + 1);
		}
	}
	if(myclass.cfucns != undefined) {
		classCode += generateCfuncs(myclass.cfucns, tab + 1);
	}
	if(myclass.methods != undefined) {
		var MethodsCode = generateMethods(myclass.methods, tab + 1);
		classCode += MethodsCode.methods;
		mainCode = MethodsCode.main;
	}
	classCode += addTab(tab) + "});\n\n";
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
			var classCode = generateClass(program.classes[i], 0);
			jsCode += classCode.classCode;
			mainCode = classCode.mainCode;
		}
	}
	if(program.globalvars != undefined) {
		for(var i = 0; i < program.globalvars.length; i++) {
			jsCode += enerateGlobalvar(program.globalvars[i], 0);
		}
	}
	if(mainCode != "") {
		jsCode += mainCode;
		jsCode += "main();"
	}
	return jsCode;
}