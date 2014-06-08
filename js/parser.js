var lookahead;
var lookaheadptr;
var grammarTree;

function MatchToken(expected) {
	if(lookahead.value == expected) {
		lookahead = nextToken();
		return true;
	} else {
		alert("MatchToken: syntax error");
		return false;
	}
}

function isValidID(id) {
	try {
		if(!(id[0] == '_' || (id[0] >= 'a' && id[0] <= 'z') || (id[0] >= 'A' && id[0] <= 'Z'))) {
			throw "error";
		}
		for(var i = 1; i < id.length; i++) {
			if(!isCharOrNum(id[i])) {
				throw "error";
			}
		}
		return true;
	} catch(err) {
		return false;
	}
}

function parseID() {
	try {
		var id = lookahead.value;
		if(!isValidID(id)) {
			throw "error";
		}
		lookahead = nextToken();
		return id;		
	} catch(err) {
		return false;
	}
}

function parseQualifier() {
	var q = lookahead.value;
	lookahead = nextToken();
	return q;
}

function parseParaType() {
	try {		
		var t;
		if(lookahead.type == "paraType") {
			t = lookahead.value;
			lookahead = nextToken();
		} else if(lookahead.type == "id") {
			t = parseID();
			if(!t) {
				throw "error";
			}
		}
		return t;
	} catch(err) {
		return false;
	}
}

function parsePara() {
	try {
		var paraType = parseParaType();
		if(!paraType) {
			throw "error";
		}
		var isArray = false;
		if(lookahead.value == '[') {
			isArray = true;
			if(!MatchToken('[')) {
				throw "error";
			}
			if(!MatchToken(']')) {
				throw "error";
			}
		}
		var paraName = parseID();
		if(!paraName) {
			throw "error";
		}

		if(lookahead.value == '[') {
			isArray = true;
			if(!MatchToken('[')) {
				throw "error";
			}
			if(!MatchToken(']')) {
				throw "error";
			}
		}

		return {type:"parameter", paraType:paraType, isArray:isArray, name:paraName}	
	} catch(err) {
		return false;
	}
}

function parseVarDef(tokens) {
	try {
		if(tokens.length == 1) {
			throw "error";
		}
		var i = 0;
		var paraType = tokens[i].value;
		
		var isArray = false;
		i += 1;
		if(tokens[i].value == '[' && tokens[i+1].value == ']') {
			isArray = true;
			i += 2;
		} else if(tokens[i].value == '[' && tokens[i+1].value != ']') {
			throw "error";
		}
		var paraName = tokens[i].value;
		i += 1;
		if(i < tokens.length && tokens[i].value == '[' && tokens[i+1].value == ']') {
			isArray = true;
			i += 2;
		} else if(i < tokens.length && tokens[i].value == '[' && tokens[i+1].value != ']') {
			throw "error";
		}
		if(!MatchToken(';')) {
			throw "error";
		}

		return {type:"variable", paraType:paraType, isArray:isArray, name:paraName}	
	} catch(err) {
		return false;
	}
}

function parseFuncCallExpr(tokens) {
	try {
		if(tokens[1].value == '(') {
			//fucnName(expr, expr)
			if(tokens[tokens.length-1].value != ')') {
				throw "error";
			}
			var funcName = tokens[0].value;
			var i = 2;
			var paraList = [];
			while(i < tokens.length-1) {
				var paraPattern = [];
				var isAssignStat = false;
				while(i < tokens.length-1 && tokens[i].value != ',' && tokens[i].value != ')') {
					paraPattern.push(tokens[i]);
					if(tokens[i].value == '=') {
						isAssignStat = true;
					}
					i++;
				}
				if(paraPattern.length <= 0) {
					throw "error";
				}
				var para;
				if(!isAssignStat) {
					para = parseExpr0(paraPattern);
				} else {
					para = parseAssignStat(paraPattern);
				}
				if(!para) {
					throw "error";
				}
				paraList.push(para);
				i++;
			}
			return {type:"callStaticFuncExpr", funcName:funcName, paraList:paraList}
		} else if(tokens[1].value == '.') {
			var objName = tokens[0].value;
			if(tokens[3].value == '(') {
				//obj.funcName(expr, expr)
				var funcName = tokens[2].value;
				if(tokens[tokens.length-1].value != ')') {
					throw "error";
				}
				var i = 4;
				var paraList = [];
				while(i < tokens.length-1) {
					var paraPattern = [];
					var isAssignStat = false;
					while(i < tokens.length-1 && tokens[i].value != ',' && tokens[i].value != ')') {
						paraPattern.push(tokens[i]);
						if(tokens[i].value == '=') {
							isAssignStat = true;
						}
						i++;
					}
					if(paraPattern.length <= 0) {
						throw "error";
					}
					var para;
					if(!isAssignStat) {
						para = parseExpr0(paraPattern);
					} else {
						para = parseAssignStat(paraPattern);
					}
					if(!para) {
						throw "error";
					}
					paraList.push(para);
					i++;
				}
				return {type:"callFuncExpr", objName:objName, funcName:funcName, paraList:paraList}
			} else if(tokens[3].value == '.') {
				var func;
				if(tokens[2].type == "id" && isValidID(tokens[2].value)) {
					var pattern = [];
					for(var i = 2; i < tokens.length; i++) {
						pattern.push(tokens[i]);
					}
					func = parseFuncCallExpr();
					return {type:"mCallFuncExpr", objName:objName, func:func}
				} else {
					throw "error";
				}
			} else {
				throw "error";
			}
		}
	} catch(err) {
		return false;
	}
}

function parseExpr9(tokens) {
	try {
		if(tokens.length == 1) {
			if(tokens[0].type == "integer") {
				//1
				return {type:"atomExpr", value:tokens[0].value}
			} else if(tokens[0].value == "null" ||
				tokens[0].value == "true" ||
				tokens[0].value == "false") {
				//null true false
				return {type:"ntfExpr", value:tokens[0].value};
			} else if(tokens[0].type == "id") {
				//a
				if(isValidID(tokens[0].value)) {
					return {type:"varExpr", variable:tokens[0].value}
				} else {
					throw "error";
				}
			}
			else {
				throw "error";
			}
		} else if(tokens[0].value == '(' && tokens[tokens.length-1].value == ')') {
			//(expr)
			var exprPattern = [];
			for(var i = 1; i < tokens.length-1; i++) {
				exprPattern.push(tokens[i]);
			}
			if(exprPattern.length <= 0) {
				throw "error";
			}
			var expr = parseExpr1(exprPattern);
			if(!expr) {
				throw "error";
			}
			return {type:"exprInBrackets", expr:expr}
		} else {
			if(tokens[0].type == "id" && isValidID(tokens[0].value)) {
				if(tokens[tokens.length-1].value == ')') {
					//functions
					var func = parseFuncCallExpr(tokens);
					if(!func) {
						throw "error";
					}
					return func;				
				} else if(tokens[1].value == '.') {
					if(!isValidID(tokens[0].value)) {
						throw "error";
					}
					var objName = tokens[0].value;
					if(tokens.length == 3) {
						//obj.attr
						if(!isValidID(tokens[2].value)) {
							throw "error";
						}
						var attrName = tokens[2].value;
						return {type:"objAttrExpr", objName:objName, attrName:attrName}
					} else {
						//obj.xxx.attr
						var pattern = [];
						for(var i = 2; i < tokens.length; i++) {
							pattern.push(tokens[i]);
						}
						if(pattern.length <= 0) {
							throw "error";
						}
						var expr = parseExpr(pattern);
						if(!expr) {
							throw "error";
						}
						return {type:"mObjAttrExpr", objName:objName, expr:expr}
					}
				}
 			} else {
				throw "error";
			}
		}
	} catch(err) {
		return false;
	}
}

function parseExpr8(tokens) {
	try {

		if(tokens[0].type == 'unaryOprt') {
			//~expr !expr ++expr --expr
			var oprt = tokens[0].value;
			if(oprt == "++" || oprt == "--") {
				if(!isValidID(tokens[1].value)) {
					throw "error";
				}
			} 
			var exprPattern = [];
			for(var i = 1; i < tokens.length; i++) {
				exprPattern.push(tokens[i]);
			}
			if(exprPattern.length <= 0) {
				throw "error";
			}
			var expr = parseExpr9(exprPattern);
			if(!expr) {
				throw "error";
			}
			return {type:"forwardUnaryOprtExpr", oprt:oprt, expr:expr}

		} else if(tokens[tokens.length-1].value == '++' 
			|| tokens[tokens.length-1].value == '--') {
			//expr++ expr--
			var oprt = tokens[tokens.length-1].value;
			if(!isValidID(tokens[0].value)) {
				throw "error";
			}
			var exprPattern = [];
			for(var i = 0; i < tokens.length-1; i++) {
				exprPattern.push(tokens[i]);
			}
			if(exprPattern.length <= 0) {
				throw "error";
			}
			var expr = parseExpr9(exprPattern);
			if(!expr) {
				throw "error";
			}
			return {type:"backUnaryOprtExpr", oprt:oprt, expr:expr}
		} else {
			var expr = parseExpr9(tokens);
			if(!expr) {
				throw "error";
			}
			return expr;
		}
	} catch(err) {
		return false;
	}
}

function parseExpr7(tokens) {
	try {
		var flag = false;
		var brackets = [];
		var i;
		for(i = 0; i < tokens.length; i++) {
			if(tokens[i].value == '(') {
				brackets.push('(');
			} else if(tokens[i].value == '[') {
				brackets.push('[')
			} else if(tokens[i].value == ')') {
				if(brackets.length <= 0 || brackets[brackets.length-1] != '(') {
					throw "error";
				}
				brackets.pop();
			} else if(tokens[i].value == ']') {
				if(brackets.length <= 0 || brackets[brackets.length-1] != '[') {
					throw "error";
				}
				brackets.pop();
			} else if(tokens[i].value == '*' || tokens[i].value == '/' || tokens[i].value == '%') {
				if(brackets.length == 0) {					
					flag = true;
					break;
				}
			}
		}
		if(flag) {
			// expr oprt expr;
			// oprt: * / %
			var left = [];
			var right = [];
			var oprt;
			for(var j = 0; j < i; j++) {
				left.push(tokens[j]);
			}
			oprt = tokens[i].value;
			for(var j = i+1; j < tokens.length; j++) {
				right.push(tokens[j]);
			}
			if(left.length <= 0 || right.length <= 0) {
				throw "error";
			} 
			var leftexpr = parseExpr8(left);
			var rightexpr = parseExpr8(right);
			if(!leftexpr || !rightexpr) {
				throw "error";
			}
			return {type:"expr", oprt:oprt, left:leftexpr, right:rightexpr}
		} else {
			var expr = parseExpr8(tokens);
			if(!expr) {
				throw error;
			}
			return expr;
		}
	} catch(err) {
		return false;
	}
}

function parseExpr6(tokens) {
	try {
		var flag = false;
		var brackets = [];
		var i;
		for(i = 0; i < tokens.length; i++) {
			if(tokens[i].value == '(') {
				brackets.push('(');
			} else if(tokens[i].value == '[') {
				brackets.push('[')
			} else if(tokens[i].value == ')') {
				if(brackets.length <= 0 || brackets[brackets.length-1] != '(') {
					throw "error";
				}
				brackets.pop();
			} else if(tokens[i].value == ']') {
				if(brackets.length <= 0 || brackets[brackets.length-1] != '[') {
					throw "error";
				}
				brackets.pop();
			} else if(tokens[i].value == '+' || tokens[i].value == '-') {
				if(brackets.length == 0) {					
					flag = true;
					break;
				}
			}
		}
		if(flag) {
			// expr oprt expr;
			// oprt: + -
			var left = [];
			var right = [];
			var oprt;
			for(var j = 0; j < i; j++) {
				left.push(tokens[j]);
			}
			oprt = tokens[i].value;
			for(var j = i+1; j < tokens.length; j++) {
				right.push(tokens[j]);
			}			
			var leftexpr;
			var noLeftExpr = false;
			if(left.length < 0 || right.length <= 0) {
				throw "error";
			} else if(left.length == 0) {
				noLeftExpr = true;
			} else {
				leftexpr = parseExpr7(left);
			}
			if(!noLeftExpr && !leftexpr) {
				throw "error";
			}
			var rightexpr = parseExpr7(right);
			if(!rightexpr) {
				throw "error";
			}
			return {type:"expr", oprt:oprt, left:leftexpr, right:rightexpr}
		} else {
			var expr = parseExpr7(tokens);
			if(!expr) {
				throw error;
			}
			return expr;
		}
	} catch(err) {
		return false;
	}
}

function parseExpr5(tokens) {
	try {
		var flag = false;
		var brackets = [];
		var i;
		for(i = 0; i < tokens.length; i++) {
			if(tokens[i].value == '(') {
				brackets.push('(');
			} else if(tokens[i].value == ')') {
				if(brackets.length <= 0) {
					throw "error";
				}
				brackets.pop();
			} else if(tokens[i].value == '<=' || tokens[i].value == '>='
				|| tokens[i].value == '<' || tokens[i].value == '>') {
				if(brackets.length == 0) {					
					flag = true;
					break;
				}
			}
		}
		if(flag) {
			// expr <= expr; expr >= expr
			// expr < expr; expr > expr
			var left = [];
			var right = [];
			var oprt;
			for(var j = 0; j < i; j++) {
				left.push(tokens[j]);
			}
			oprt = tokens[i].value;
			for(var j = i+1; j < tokens.length; j++) {
				right.push(tokens[j]);
			}
			if(left.length <= 0 || right.length <= 0) {
				throw "error";
			} 
			var leftexpr = parseExpr6(left);
			var rightexpr = parseExpr6(right);
			if(!leftexpr || !rightexpr) {
				throw "error";
			}
			return {type:"compExpr", oprt:oprt, left:leftexpr, right:rightexpr}
		} else {
			var expr = parseExpr6(tokens);
			if(!expr) {
				throw error;
			}
			return expr;
		}
	} catch(err) {
		return false;
	}
}

function parseExpr4(tokens) {
	try {
		var flag = false;
		var brackets = [];
		var i;
		for(i = 0; i < tokens.length; i++) {
			if(tokens[i].value == '(') {
				brackets.push('(');
			} else if(tokens[i].value == '[') {
				brackets.push('[')
			} else if(tokens[i].value == ')') {
				if(brackets.length <= 0 || brackets[brackets.length-1] != '(') {
					throw "error";
				}
				brackets.pop();
			} else if(tokens[i].value == ']') {
				if(brackets.length <= 0 || brackets[brackets.length-1] != '[') {
					throw "error";
				}
				brackets.pop();
			} else if(tokens[i].value == '==' || tokens[i].value == '!=') {
				if(brackets.length == 0) {					
					flag = true;
					break;
				}
			}
		}
		if(flag) {
			// expr == expr; expr != expr
			var left = [];
			var right = [];
			var oprt;
			for(var j = 0; j < i; j++) {
				left.push(tokens[j]);
			}
			oprt = tokens[i].value;
			for(var j = i+1; j < tokens.length; j++) {
				right.push(tokens[j]);
			}
			if(left.length <= 0 || right.length <= 0) {
				throw "error";
			} 
			var leftexpr = parseExpr5(left);
			var rightexpr = parseExpr5(right);
			if(!leftexpr || !rightexpr) {
				throw "error";
			}
			return {type:"equalExpr", oprt:oprt, left:leftexpr, right:rightexpr}
		} else {
			var expr = parseExpr5(tokens);
			if(!expr) {
				throw error;
			}
			return expr;
		}
	} catch(err) {
		return false;
	}
}

function parseExpr3(tokens) {
	try {
		var flag = false;
		var brackets = [];
		var i;
		for(i = 0; i < tokens.length; i++) {
			if(tokens[i].value == '(') {
				brackets.push('(');
			} else if(tokens[i].value == '[') {
				brackets.push('[')
			} else if(tokens[i].value == ')') {
				if(brackets.length <= 0 || brackets[brackets.length-1] != '(') {
					throw "error";
				}
				brackets.pop();
			} else if(tokens[i].value == ']') {
				if(brackets.length <= 0 || brackets[brackets.length-1] != '[') {
					throw "error";
				}
				brackets.pop();
			} else if(tokens[i].value == '&&') {
				if(brackets.length == 0) {					
					flag = true;
					break;
				}
			}
		}
		if(flag) {
			// expr && expr;
			var left = [];
			var right = [];
			var oprt;
			for(var j = 0; j < i; j++) {
				left.push(tokens[j]);
			}
			oprt = tokens[i].value;
			for(var j = i+1; j < tokens.length; j++) {
				right.push(tokens[j]);
			}
			if(left.length <= 0 || right.length <= 0) {
				throw "error";
			} 
			var leftexpr = parseExpr4(left);
			var rightexpr = parseExpr4(right);
			if(!leftexpr || !rightexpr) {
				throw "error";
			}
			return {type:"andExpr", oprt:oprt, left:leftexpr, right:rightexpr}
		} else {
			var expr = parseExpr4(tokens);
			if(!expr) {
				throw error;
			}
			return expr;
		}
	} catch(err) {
		return false;
	}
}

function parseExpr2(tokens) {
	try {
		var flag = false;
		var brackets = [];
		var i;
		for(i = 0; i < tokens.length; i++) {
			if(tokens[i].value == '(') {
				brackets.push('(');
			} else if(tokens[i].value == '[') {
				brackets.push('[')
			} else if(tokens[i].value == ')') {
				if(brackets.length <= 0 || brackets[brackets.length-1] != '(') {
					throw "error";
				}
				brackets.pop();
			} else if(tokens[i].value == ']') {
				if(brackets.length <= 0 || brackets[brackets.length-1] != '[') {
					throw "error";
				}
				brackets.pop();
			} else if(tokens[i].value == '||') {
				if(brackets.length == 0) {					
					flag = true;
					break;
				}
			}
		}
		if(flag) {
			// expr || expr;
			var left = [];
			var right = [];
			var oprt;
			for(var j = 0; j < i; j++) {
				left.push(tokens[j]);
			}
			oprt = tokens[i].value;
			for(var j = i+1; j < tokens.length; j++) {
				right.push(tokens[j]);
			}
			if(left.length <= 0 || right.length <= 0) {
				throw "error";
			} 
			var leftexpr = parseExpr3(left);
			var rightexpr = parseExpr3(right);
			if(!leftexpr || !rightexpr) {
				throw "error";
			}
			return {type:"orExpr", oprt:oprt, left:leftexpr, right:rightexpr}
		} else {
			var expr = parseExpr3(tokens);
			if(!expr) {
				throw error;
			}
			return expr;
		}
	} catch(err) {
		return false;
	}
}

function parseExpr1(tokens) {
	try {
		//检查含有+= -= *= /= %=的表达式，运算符左侧必须只有一个variable
		for(var i = 0; i < tokens.length; i++) {
			if((tokens[i].value == "+=" || tokens[i].value == "-=" 
				|| tokens[i].value == "*=" || tokens[i].value == "/=" || tokens[i].value == "%=")
				&& i != 1) {
				throw "error";
			}
		}
		if(tokens.length > 1 && (tokens[1].value == "+=" || tokens[1].value == "-=" 
			|| tokens[1].value == "*=" || tokens[1].value == "/=" || tokens[1].value == "%=")) {			
			// id oprt expr; 
			// oprt: += -= *= /=
			if(tokens[0].type != "id") {
				throw "error";
			}
			var varName = tokens[0].value;
			var oprt = tokens[1].value;
			var exprPattern = [];
			var expr;
			for(var i = 2; i < tokens.length; i++) {
				exprPattern.push(tokens[i]);
			}
			expr = parseExpr1(exprPattern);
			if(!expr) {
				throw "error";
			}
			return {type:"cal&assignExpr", varName:varName, oprt:oprt, expr:expr}
		} else {
			var expr = parseExpr2(tokens);
			if(!expr) {
				throw error;
			}
			return expr;
		}
	} catch(err) {
		return false;
	}
}

function parseExpr0(tokens) {
	try {
		var flag = false;
		var brackets = [];
		var i;
		for(i = 0; i < tokens.length; i++) {
			if(tokens[i].value == '(') {
				brackets.push('(');
			} else if(tokens[i].value == '[') {
				brackets.push('[')
			} else if(tokens[i].value == ')') {
				if(brackets.length <= 0 || brackets[brackets.length-1] != '(') {
					throw "error";
				}
				brackets.pop();
			} else if(tokens[i].value == ']') {
				if(brackets.length <= 0 || brackets[brackets.length-1] != '[') {
					throw "error";
				}
				brackets.pop();
			} else if(tokens[i].value == ',') {
				if(brackets.length == 0) {					
					flag = true;
					break;
				}
			}
		}
		if(flag) {
			// expr , expr;
			var left = [];
			var right = [];
			var oprt;
			for(var j = 0; j < i; j++) {
				left.push(tokens[j]);
			}
			oprt = tokens[i].value;
			for(var j = i+1; j < tokens.length; j++) {
				right.push(tokens[j]);
			}
			if(left.length <= 0 || right.length <= 0) {
				throw "error";
			} 
			var leftexpr = parseExpr1(left);
			var rightexpr = parseExpr1(right);
			if(!leftexpr || !rightexpr) {
				throw "error";
			}
			return {type:"commaExpr", oprt:oprt, left:leftexpr, right:rightexpr}
		} else {
			var expr = parseExpr1(tokens);
			if(!expr) {
				throw error;
			}
			return expr;
		}
	} catch(err) {
		return false;
	}
}

function parseExpr(tokens) {
	try {
		if(tokens[0].value == "new") {
			if(tokens.length < 3) {
				throw "error";
			}
			if(tokens[2].value == '[') {
				//new type[expr]
				if(tokens[tokens.length-1].value != ']') {
					throw "error";
				}
				var paraType = tokens[1].value;
				var sizePattern = [];
				for(var i = 3; i < tokens.length-1; i++) {
					sizePattern.push(tokens[i]);
				}
				var size = parseExpr0(sizePattern);
				if(!size) {
					throw "error";
				}
				return {type:"newArrayExpr", paraType:paraType, size:size}
			} else if(tokens[2].value == '(') {
				//new className(expr, expr)
				if(tokens[tokens.length-1].value != ')') {
					throw "error";
				}
				var className = tokens[1].value;
				var i = 3;
				var paraList = [];
				while(i < tokens.length-1) {
					var paraPattern = [];
					while(i < tokens.length-1 && tokens[i].value != ',' && tokens[i].value != ')') {
						paraPattern.push(tokens[i]);
						i++;
					}
					if(paraPattern.length <= 0) {
						throw "error";
					}
					var para = parseExpr0(paraPattern);
					if(!para) {
						throw "error";
					}
					paraList.push(para);
					i++;
				}
				return {type:"newObjectExpr", className:className, paraList:paraList}
			} else {
				throw "error";
			}
			
		} else if(tokens[0].value == "{") {
			//{1, 2, 3, 4}
			var valueSet = [];
			var i = 1;
			while(i < tokens.length-1) {
				var paraPattern = [];
				while(i < tokens.length-1 && tokens[i].value != ',' && tokens[i].value != '}') {
					paraPattern.push(tokens[i]);
					i++;
				}
				if(tokens[i].value == ',' && paraPattern.length <= 0) {
					throw "error";
				}
				var para = parseExpr0(paraPattern);
				if(!para) {
					throw "error";
				}
				valueSet.push(para);
				i++;
			}
			return {type:"valueSetExpr", valueSet:valueSet}
		} else if(tokens.length > 1 && tokens[1].value == '[') {
			//var[i]
			if(!isValidID(tokens[0].value) || tokens[tokens.length-1].value != ']') {
				throw "error";
			}
			var varName = tokens[0].value
			var pattern = [];
			for(var i = 2; i < tokens.length-1; i++) {
				pattern.push(tokens[i]);
			}
			var expr = parseExpr0(pattern);
			if(!expr) {
				throw "error";
			}
			return {type:"varInArrayExpr", varName:varName, pos:expr}
		} else {
			var expr = parseExpr0(tokens);
			if(!expr) {
				throw "error";
			}
			return expr;
		}
	} catch(err) {
		return false
	}
}

function parseAssignStat(tokens) {
	try {
		var varType;
		var varName;
		var isArray = false;
		var inArray = false;
		var isDefined = false;
		var posPattern = [];
		var pos;
		var exprPattern = [];
		var expr;
		var isAssignStat = false;

		//left side of "="
		if(tokens[1].value == "=") {
			//id = expr;
			isDefined = true;
			varName = tokens[0].value;
			for(var i = 2; i < tokens.length; i++) {
				exprPattern.push(tokens[i]);
				if(tokens[i].value == '=') {
					isAssignStat = true;
				}
			}
		} else if(tokens[2].value == "=") {
			//type id = expr;
			varType = tokens[0].value;
			varName = tokens[1].value;
			for(var i = 3; i < tokens.length; i++) {
				exprPattern.push(tokens[i]);
				if(tokens[i].value == '=') {
					isAssignStat = true;
				}
			}
		} else if(tokens[1].value == '[' && tokens[2].value == ']') {
			isArray = true;
			varType = tokens[0].value;
			varName = tokens[3].value;
			if(tokens[5].value == "new") {
				//type[] id = new type[expr];
				if(tokens[6].value != varType) {
					throw "error";
				}
				for(var i = 5; i < tokens.length; i++) {
					exprPattern.push(tokens[i]);
					if(tokens[i].value == '=') {
						isAssignStat = true;
					}
				}
			} else if(tokens[5].value == '{') {
				//type[] id = {a, b, c}
				for(var i = 5; i < tokens.length; i++) {
					exprPattern.push(tokens[i]);
					if(tokens[i].value == '=') {
						isAssignStat = true;
					}
				}
			} else {
				for(var i = 5; i < tokens.length; i++) {
					exprPattern.push(tokens[i]);
					if(tokens[i].value == '=') {
						isAssignStat = true;
					}
				}
			}
 		} else if(tokens[2].value == '[' && tokens[3].value == ']') {
			isArray = true;
			varType = tokens[0].value;
			varName = tokens[1].value;
			if(tokens[5].value == "new") {
				//type id[] = new type[expr];
				if(tokens[6].value != varType) {
					throw "error";
				}
				for(var i = 5; i < tokens.length; i++) {
					exprPattern.push(tokens[i]);
					if(tokens[i].value == '=') {
						isAssignStat = true;
					}
				}
			} else if(tokens[5] == '{') {
				//type id[] = {a, b, c}
				if(tokens[length-1].value != '}') {
					throw "error";
				}
				for(var i = 5; i < tokens.length; i++) {
					exprPattern.push(tokens[i]);
					if(tokens[i].value == '=') {
						isAssignStat = true;
					}
				}
			} else {
				for(var i = 5; i < tokens.length; i++) {
					exprPattern.push(tokens[i]);
					if(tokens[i].value == '=') {
						isAssignStat = true;
					}
				}
			}
 		} else if(tokens[1].value == '[') {
 			//id[expr] = expr;
 			inArray = true;
 			varName = tokens[0].value;
 			var i;
 			for(i = 2; i < tokens.length; i++) {
 				if(tokens[i].value == ']') {
 					break;
 				}
 				posPattern.push(tokens[i]);
				if(tokens[i].value == '=') {
					isAssignStat = true;
				}
 			}
 			if(posPattern.length <= 0) {
 				throw "error";
 			}
 			if(isAssignStat) {
 				pos = parseAssignStat(posPattern);
 			} else {
 				pos = parseExpr(posPattern);
 			}
 			isAssignStat = false;
 			for(i = i + 2; i < tokens.length; i++) {
 				exprPattern.push(tokens[i]);
				if(tokens[i].value == '=') {
					isAssignStat = true;
				}
 			}
 		} else if(tokens[1].value == '.'){
 			//obj.field = expr
 			if(!isValidID(tokens[0].value)) {
 				throw "error";
 			}
 			var objName = tokens[0].value;
 			var pattern = [];
 			for(var j = 2; j < tokens.length; j++) {
 				pattern.push(tokens[j]);
 			}
 			var field = parseAssignStat(pattern);
 			if(!field) {
 				throw "error";
 			}
 			return {type:"fieldAssignExpr", objName:objName, expr:field}
 		} else {
			throw "error";
		}
		if(exprPattern.length <= 0) {
			throw "error";
		}
		if(isAssignStat) {
			expr = parseAssignStat(exprPattern);
		} else {
			expr = parseExpr(exprPattern);
		}
		if(!expr) {
			throw "error";
		}
		return {type:"assignExpr", varType:varType, varName:varName, isDefined:isDefined, isArray:isArray, inArray:inArray, pos:pos, expr:expr}
	} catch(err) {
		return false;
	}
}

function parseSingleExpr(tokens) {
	try {
		if(tokens[0].value == '++' || tokens[0].value == '--') {
			//++expr --expr
			var oprt = tokens[0].value;
			if(!isValidID(tokens[1].value)) {
				throw "error";
			}
			var exprPattern = [];
			for(var i = 1; i < tokens.length; i++) {
				exprPattern.push(tokens[i]);
			}
			if(exprPattern.length <= 0) {
				throw "error";
			}
			var expr = parseExpr9(exprPattern);
			return {type:"forwardUnaryOprtExpr", oprt:oprt, expr:expr}
		} else if(tokens[tokens.length-1].value == '++' 
			|| tokens[tokens.length-1].value == '--') {
			//erpr++ expr--
			var oprt = tokens[tokens.length-1].value;
			var exprPattern = [];
			for(var i = 0; i < tokens.length-1; i++) {
				exprPattern.push(tokens[i]);
			}
			if(exprPattern.length <= 0) {
				throw "error";
			}			
			var expr = parseExpr9(exprPattern);
			return {type:"backUnaryOprtExpr", oprt:oprt, expr:expr}
		} else {
			if(tokens[0].type == "id" && isValidID(tokens[0].value)) {
				// 函数调用, 不接受类似a.length的属性值的调用
				if(tokens[tokens.length-1].value != ')') {
					throw "error";
				}
				var func = parseFuncCallExpr(tokens);
				if(!func) {
					throw "error";
				}
				return func;
			} else {
				throw "error";
			}
		}
	} catch(err) {
		return false;
	}
}

function parseForStat() {
	try {
		if(!MatchToken('for')) {
			throw "error";
		}
		if(!MatchToken('('))  {
			throw "error";
		}
		var tokens = [];
		while(lookahead.value != ';') {
			tokens.push(lookahead);
			lookahead = nextToken();
		}
		var expr1 = parseAssignStat(tokens);
		if(!expr1) {
			throw "error";
		}
		if(!MatchToken(';')) {
			throw "error";
		}

		tokens = [];
		while(lookahead.value != ';') {
			tokens.push(lookahead);
			lookahead = nextToken();
		}
		var expr2 = parseExpr0(tokens);
		if(!expr2) {
			throw "error";
		}
		if(!MatchToken(';')) {
			throw "error";
		}

		tokens = [];
		var brackets = [];
		brackets.push('(');
		while(1) {
			if(lookahead.value == '(') {
				brackets.push('(');
			} else if(lookahead.value == ')') {
				brackets.pop(')');
				if(brackets.length == 0) {
					break;
				}
			}		
			tokens.push(lookahead);
			lookahead = nextToken();
		}
		var expr3;
		if(tokens[0].value == '++' || tokens[0].value == '--'
			|| tokens[tokens.length-1].value == '++' || tokens[tokens.length-1].value == '--') {
			expr3 = parseSingleExpr(tokens);
		} else {
			expr3 = parseAssignStat(tokens);
		}
		if(!expr3) {
			throw "error";
		}
		if(!MatchToken(')')) {
			throw "error";
		}

		var stats;
		if(lookahead.value == '{') {
			stats = parseBlock();
		} else {
			stats = parseStat();
		}
		if(!stats) {
			throw "error";
		}
		return {type:"forStats", expr1:expr1, expr2:expr2, expr3:expr3, stats:stats}
	} catch(err) {
		return false;
	}
}

function parseWhileStat() {
	try {
		if(!MatchToken('while')) {
			throw "error";
		}
		if(!MatchToken('(')) {
			throw "error";
		}
		var tokens = [];
		var brackets = [];
		brackets.push('(');
		var isNotFunc = true;
		var old;
		while(1) {
			if(old && old.type == "id" && lookahead.value == '(') {
				isNotFunc = false;
			}
			if(lookahead.value == '(') {
				brackets.push('(');
			} else if(lookahead.value == ')') {
				brackets.pop(')');
				if(brackets.length == 0) {
					break;
				}
			}		
			tokens.push(lookahead);
			old = lookahead;
			lookahead = nextToken();
		}
		var expr;
		if(isNotFunc) {
			expr = parseExpr0(tokens);
		} else {
			expr = parseFuncCallExpr(tokens);
		}
		if(!expr) {
			throw "error";
		}
		if(!MatchToken(')')) {
			throw "error";
		}
		var stats;
		if(lookahead.value == '{') {
			stats = parseBlock();
		} else {
			stats = parseStat();
		}
		if(!stats) {
			throw "error";
		}
		return {type:"whileStats", expr:expr, stats:stats}
	} catch(err) {
		return false;
	}
}

function parseIfStat() {
	try {
		if(!MatchToken('if')) {
			throw "error";
		}
		if(!MatchToken('(')) {
			throw "error";
		}
		var tokens = [];
		var brackets = [];
		brackets.push('(');
		var isNotFunc = true;
		var old;
		while(1) {
			if(old && old.type == "id" && lookahead.value == '(') {
				isNotFunc = false;
			}
			if(lookahead.value == '(') {
				brackets.push('(');
			} else if(lookahead.value == ')') {
				brackets.pop(')');
				if(brackets.length == 0) {
					break;
				}
			}		
			tokens.push(lookahead);
			old = lookahead;
			lookahead = nextToken();
		}
		var expr;
		if(isNotFunc) {
			expr = parseExpr0(tokens);
		} else {
			expr = parseFuncCallExpr(tokens);
		}
		if(!expr) {
			throw "error";
		}
		if(!MatchToken(')')) {
			throw "error";
		}
		var ifstats;
		if(lookahead.value == '{') {
			ifstats = parseBlock();
		} else {
			ifstats = parseStat();
		}
		if(!ifstats) {
			throw "error";
		}
		var elsestats;
		if(lookahead.value == 'else') {
			if(!MatchToken('else')) {
				throw "error";
			}
			if(lookahead.value == 'if') {
				elsestats = parseIfStat();
			} else if(lookahead.value == '{') {
				elsestats = parseBlock();
			} else {
				elsestats = parseStat();
			}
		}
		return {type:"ifstats", expr:expr, ifstats:ifstats, elsestats:elsestats}
	} catch(err) {
		return false;
	}
}

function parseReturnStat() {
	try {
		if(!MatchToken('return')) {
			throw "error";
		}
		var pattern = [];
		while(lookahead.value != ';') {
			pattern.push(lookahead);
			lookahead = nextToken();
		}
		var retExpr = parseExpr(pattern);
		if(!retExpr) {
			throw "error";
		}
		if(!MatchToken(';')) {
			throw "error";
		}
		return {type:"returnStat", retExpr:retExpr}
	} catch(err) {
		return false;
	}
}

function parseStat() {
	try {
		var stat;
		if(lookahead.value == "for") {
			stat = parseForStat();
		} else if(lookahead.value == "while") {
			stat = parseWhileStat();
		} else if(lookahead.value == "if") {
			stat = parseIfStat();
		} else if(lookahead.value == "return") {
			stat = parseReturnStat();
		} else {			
			var pattern = [];
			var isAssignStat = false;
			while(lookahead.value != ';') {
				pattern.push(lookahead);
				if(lookahead.value == "=") {
					isAssignStat = true;
				}
				lookahead = nextToken();
			}
			if(isAssignStat) {
				stat = parseAssignStat(pattern);
			} else {
				stat = parseSingleExpr(pattern);
			}
			if(!MatchToken(';')) {
				throw "error";
			}
		}
		if(!stat) {
			throw "error";
		}
		return stat;
	} catch(err) {
		return false;
	}
}

function parseBlock() {
	try {
		if(!MatchToken('{')){
			throw "error";
		}
		var stats = [];
		while(lookahead.value != '}') {
			var stat = parseStat();
			if(!stat) {
				throw "error";
			}
			stats.push(stat);
		}
		if(!MatchToken('}')) {
			throw "error";
		}
		return stats;
	} catch(err) {
		return false;
	}
}

function parseFunctions(tokens, qs) {	
	try {
		var i = 0;

		var retType = tokens[i].value;
		var retIsArray = false
		i++;
		if(tokens[i].value == '[' && tokens[i+1].value == ']') {
			retIsArray = true;
			i += 2;
		} else if(tokens[i].value == '[' && tokens[i+1].value != ']') {
			throw "error";
		}
		var funcName = tokens[i].value;

		//参数列表
		var paras = [];
		if(!MatchToken('(')) {
			throw "error";
		}
		if(lookahead.type == 'paraType' || lookahead.type == 'id') {
			var para = parsePara();
			if(!para) {
				throw "error";
			}
			paras.push(para);
		}
		while(lookahead.value == ',') {
			if(!MatchToken(',')) {
				throw "error";
			}
			var para = parsePara();
			if(!para) {
				throw "error";
			}
			paras.push(para);
		}
		if(!MatchToken(')')) {
			throw "error";
		}

		var stats = parseBlock();
		if(!stats) {
			throw "error";
		}
		return {type:"function", qualifiers:qs, name:funcName, retType:retType, retIsArray:retIsArray, paraList:paras, stats:stats}
	} catch(err) {
		return false;
	}
}

function parseConstructFunc(className) {
	try{
		//参数列表
		var paras = [];
		if(!MatchToken('(')) {
			throw "error";
		}
		if(lookahead.type == 'paraType' || lookahead.type == 'id') {
			var para = parsePara();
			if(!para) {
				throw "error";
			}
			paras.push(para);
		}
		while(lookahead.value == ',') {
			if(!MatchToken(',')) {
				throw "error";
			}
			var para = parsePara();
			if(!para) {
				throw "error";
			}
			paras.push(para);
		}
		if(!MatchToken(')')) {
			throw "error";
		}

		var stats = parseBlock();
		if(!stats) {
			throw "error";
		}
		return {type:"constructFunction", name:className, paraList:paras, stats:stats}
	} catch(err) {
		return false;
	}
}

function parseClass(qualifiers) {
	try {
		if(!MatchToken("class")) {
			throw "error";
		}
	
		//类名
		var className = parseID();
		if(!className) {
			throw "error";
		}

		//父类
		var fathers = [];
		if(lookahead.type == "extends") {
			MatchToken("extends");
			while(lookahead.type == "id") {
				fathers.push(parseID());
			}
		}

		//实现接口
		var interfaces = [];
		if(lookahead.type == "implement") {
			MatchToken("implement");
			while(lookahead.type == "id"){
				interfaces.push(parseID());
			}
		}

		if(!MatchToken("{")) {
			throw "error";
		}

		var vars = [];		//变量
		var assigns = [];	//赋值语句
		var cfuncs = [];	//构造函数		
		var funcs = [];		//函数
		while(lookahead.value != "}") {
			//修饰符
			var cqs = [];
			while(lookahead.type == "qualifier") {
				cqs.push(parseQualifier());
			}

			var pattern = [];
			while(lookahead.value != '(' && lookahead.value != '=' && lookahead.value != ';') {
				pattern.push(lookahead);
				lookahead = nextToken();
			}
			if(lookahead.value == '(') {
				if(pattern.length == 1) {
					if(pattern[0].value == className) {
						var cfunc = parseConstructFunc(className);
						if(!cfunc) {
							throw "error";
						}
						cfuncs.push(cfunc);
					} else {
						throw "error";
					}
				} else {
					var func = parseFunctions(pattern, cqs);
					if(!func) {
						throw "error";
					}
					funcs.push(func);
				}
			} else if(lookahead.value == ';') {
				var v = parseVarDef(pattern);
				if(!v) {
					throw "error";
				}
				vars.push(v);
			}
		}

		if(!MatchToken("}")) {
			throw "error";
		}
		return {type:"class", qualifiers:qualifiers, name:className, fathers:fathers, interfaces:interfaces, cfucns:cfuncs, fields:vars, assigns:assigns, methods:funcs}

	} catch(err) {
		return false;
	}
	
}

function parseDeclaration() {
	try {		
		var declaration;

		//修饰词
		var qualifiers = [];
		while(lookahead.type == "qualifier") {
			qualifiers.push(parseQualifier());
		}

		if(lookahead.type == "class") {
			//类的定义
			declaration = parseClass(qualifiers);
			if(!declaration) {
				throw "error";
			}
		} /*else if(lookahead.type == "paraType" || lookahead.type == "id") {
			//全局变量
			var v = parseVariable(qualifiers);
			if(lookahead.value == ";") {
				MatchToken(";");
				declaration = v;
			} else if(lookahead.value == "=") {
				MatchToken("=");
				declaration = parseAssignStat(v);
			}
		}*/ else{
			throw "error";
		}
		return declaration;
	} catch(err) {
		return false;
	}
}

function parseProgram() {
	try {
		var classes = [];
		var globalvars = [];
		//while(lookahead != null) {
			var d = parseDeclaration();
			if(!d) {
				throw "error";
			}
			if(d && d.type == "class") {
				classes.push(d);
			} else if(d && d.type == "variable") {
				globalvars.push(d);
			}
		//}
		return{type: "program", classes:classes, globalvars:globalvars}
	} catch(err) {
		return false;
	}
	
}

function Parser() {
	lookaheadptr = -1;
	lookahead = nextToken();
	try {
		grammarTree = parseProgram();
		if(!grammarTree){
			throw "error";
		}
	} catch(err) {
		alert("syntax error");
		return false;
	}
}