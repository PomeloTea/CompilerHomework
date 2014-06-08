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
	if(paraList) {
		for(var i in paraList) {
			if(paraList[i].isArray)
				paraListCode += "Object, "
			else if(paraList[i].paraType == 'int')
				paraListCode += "Integer, ";
		}
		paraListCode.substr(0, paraListCode.length - 2);
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

function generateAssignExpr(expr, tab, inFor, paras) {
	var exprCode = addTab(tab);
	if(expr.varType != undefined) {
		exprCode += "var ";
	}
	exprCode += expr.varName;
	if(expr.pos != undefined) {
		exprCode += "[" + generateStat(expr.pos, 0, true, paras) + "]";
	}
	exprCode += " = " + generateStat(expr.expr, 0, true, paras);
	if(inFor != true)
		exprCode += ";\n"
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

function generateIfStats(expr, tab, paras) {
	var exprCode = addTab(tab);
	exprCode += "if(" + generateStat(expr.expr, 0, true, paras) + ") {\n";
	for(var i in expr.ifstats) {
		exprCode += generateStat(expr.ifstats[i], tab + 1, false, paras);
	}
	exprCode += addTab(tab) + "}";
	if(expr.elsestats) {
		exprCode += " else {\n";
		for(var i in expr.elsestats) {
			exprCode += generateStat(expr.elsestats[i], tab + 1, false, paras);
		}
		exprCode += addTab(tab) + "}\n";
	} else {
		exprCode += "\n";
	}
	return exprCode;
}

function generateForStats(expr, tab, paras) {
	var exprCode = addTab(tab) + "for(" + 
		generateStat(expr.expr1, 0, true, paras) + '; ' + 
		generateStat(expr.expr2, 0, true, paras) + '; ' + 
		generateStat(expr.expr3, 0, true, paras) + ") {\n";
	for(var i in expr.stats) {
		exprCode += generateStat(expr.stats[i], tab + 1, false, paras);
	}
	exprCode += addTab(tab) + "}\n";
	return exprCode;
}

function generateStaticFuncExpr(stat, tab, inFor, paras) {
	var codes = addTab(tab) + 'this.' + stat.funcName + '(' + 
		generateExprList(stat.paraList, ',') + ')';
	if(inFor != true)
		codes += ";\n";
	return codes;
}

function generateCallFuncExpr(stat, tab, inFor, paras) {
	var codes = addTab(tab) + stat.objName + '.' + stat.funcName + '(' + 
		generateExprList(stat.paraList, ',') + ')';
	if(inFor != true)
		codes += ";\n";
	return codes;
}

function generateStat(stat, tab, inFor, paras) {
	if(stat == undefined)
		return "";
	if(paras != undefined) {
		var index = paras.indexOf(stat.variable);
		if(index != -1) {
			stat.variable = "arguments[" + index + "]";
		}
	}
	switch(stat.type) {
		case "assignExpr":
			return generateAssignExpr(stat, tab, inFor, paras);
		case "valueSetExpr":
			return generateValueSetExpr(stat, paras);
		case "newArrayExpr":
			return generateNewArrayExpr(stat, paras);
		case "newObjectExpr":
			return generateNewObjectExpr(stat, paras);
		case "ifstats":
			return generateIfStats(stat, tab, paras);
		case "forStats":
			return generateForStats(stat, tab, paras);
		case "atomExpr":
			return stat.value;
		case "varExpr":
			return stat.variable;
		case "forwardUnaryOprtExpr":
			return stat.oprt + generateStat(stat.expr, 0, false, paras);
		case "backUnaryOprtExpr":
			return generateStat(stat.expr, 0, false, paras) + stat.oprt;
		case "objAttrExpr":
			return stat.objName + '.' + stat.attrName;
		case "callFuncExpr":
			return generateCallFuncExpr(stat, tab, inFor, paras);
		case "compExpr":
		case "equalExpr":
		case "andExpr":
		case "orExpr":
			return generateStat(stat.left, 0, false, paras) + ' ' + stat.oprt + ' ' + generateStat(stat.right, 0, false, paras);
		case "expr":
			return generateStat(stat.left, 0, false, paras) + stat.oprt + generateStat(stat.right, 0, false, paras);
		case "ntfExpr":
			return stat.value;
		case "fieldAssignExpr":
			return addTab(tab) + stat.objName + '.' + generateStat(stat.expr, 0, false, paras);
		case "callStaticFuncExpr":
			return generateStaticFuncExpr(stat, tab, inFor, paras);
		case "mObjAttrExpr":
			return stat.objName + "." + generateStat(stat.expr, 0, false, paras);
		case "varInArrayExpr":
			return stat.varName + '[' + generateStat(stat.pos, 0, false, paras) + ']';
		case "returnStat":
			return addTab(tab) + "return " + generateStat(stat.retExpr, 0, false, paras) + ";\n";
		case "exprInBrackets":
			return '(' + generateStat(stat.expr, 0, false, paras) + ')';
		default:
			return "1111111111";
	}
}

function generateField(field, tab) {
	if(field.type != "variable")
		return "";

	var fieldCode;
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

	var cfuncCode = addTab(tab) + cfunc.name + "._(";
	cfuncCode += generateCParaList(cfunc.paraList);
	for(var i in cfunc.stats) {
		cfuncCode += generateStat(cfunc.stats[i], tab + 1);
	}
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

function generateSimpleMethod(method, tab) {
	var methodCode = addTab(tab) + "this." + method.name;
	methodCode += " = function(" + generateParaList(method.paraList) + ") {\n";
	for(var i in method.stats) {
		methodCode += generateStat(method.stats[i], tab + 1);
	}
	methodCode += addTab(tab) + "};\n\n";
	return methodCode;
}

function generateMultipleMethod(methods, tab) {
	var methodsCode = addTab(tab) + "this." + methods[0].name + " = FunctionH.overload({\n";
	for(var i in methods) {
		methodsCode += addTab(tab + 1) + "'";
		var paras = [];
		if(methods[i].paraList) {
			for(var j in methods[i].paraList) {
				var type = methods[i].paraList[j].paraType;
				if(type == 'int') {
					methodsCode += 'number, ';
					paras.push(methods[i].paraList[j].name);
				}
				else
					methodsCode += 'undefined';
			}
			methodsCode = methodsCode.substr(0, methodsCode.length - 2);
		}
		methodsCode += "': function() {\n";
		for(var j in methods[i].stats) {
			methodsCode += generateStat(methods[i].stats[j], tab + 2, false, paras);
		}
		methodsCode += addTab(tab + 1) + "},\n";
	}
	methodsCode.substr(0, methodsCode.length - 2);
	methodsCode += addTab(tab) + "});\n\n";
	return methodsCode;
}

function generateMainMethod(method) {
	console.log(method);
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
		} else {
			var methodName = methods[i].name;
			if(funcs[methodName]) {
				funcs[methodName].push(methods[i]);
			} else {
				funcs[methodName] = [methods[i]];
			}
		}
	}
	for(var i in funcs) {
		if(funcs[i].length > 1) {
			methodsCode += generateMultipleMethod(funcs[i], tab);
		} else {
			methodsCode += generateSimpleMethod(funcs[i][0], tab);
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