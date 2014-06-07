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

function generateExprList(expr, str) {
	var exprCode = "";
	if(expr.length > 0) {
		for(var i in expr) {
			exprCode += generateStat(expr[i]) + str + " ";
		}
		exprCode = exprCode.substr(0, exprCode.length - 1 - str.length);
	}
	return exprCode;
}

function generateAssignExpr(expr) {
	var exprCode = "";
	if(expr.varType != undefined) {
		exprCode += "var ";
	}
	exprCode += expr.varName;
	if(expr.pos != undefined) {
		exprCode += "[" + generateStat(expr.pos) + "]";
	}
	exprCode += " = " + generateStat(expr.expr);
	return exprCode;
}

function generateValueSetExpr(expr) {
	var exprCode = "[";
	exprCode += generateExprList(expr.valueSet, ',');
	exprCode += "]";
	return exprCode;
}

function generateNewArrayExpr(expr) {
	var exprCode = "new Array(";
	exprCode += generateStat(expr.size);
	exprCode += ")";
	return exprCode;
}

function generateNewObjectExpr(expr) {
	var exprCode = "new " + expr.className + "(";
	exprCode += generateExprList(expr.paraList, ',');
	exprCode += ")";
	return exprCode;
}

function generateStat(stat) {
	switch(stat.type) {
		case "assignExpr":
			return generateAssignExpr(stat);
		case "valueSetExpr":
			return generateValueSetExpr(stat);
		case "newArrayExpr":
			return generateNewArrayExpr(stat);
		case "newObjectExpr":
			return generateNewObjectExpr(stat);
		case "atomExpr":
			return stat.value;
		case "varExpr":
			return stat.variable;
		case "forwardUnaryOprtExpr":
			return stat.oprt + generateStat(stat.expr);
		case "backUnaryOprtExpr":
			return generateStat(stat.expr) + stat.oprt;
		case "objAttrExpr":
			return stat.objName + '.' + stat.attrName;
		case "callFuncExpr":
			return stat.objName + '.' + stat.funcName + '(' + generateExprList(stat.paraList, ',') + ')';
		default:
			return "ha";
	}
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
		mainCode += addTab(1);
		mainCode += generateStat(method.stats[i]);
		mainCode += ";\n";
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