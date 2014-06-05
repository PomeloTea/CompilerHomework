var lookahead;
var lookaheadptr;
var grammarTree;

function MatchToken(expected) {
	if(lookahead.value == expected) {
		lookahead = nextToken();
		return true;
	} else {
		alert("MatchToken: syntax error -- " + expected);
		return false;
	}
}

function parseID() {
	try {
		var id = lookahead.value;
		if(id[0] >= '0' && id[0] <= '9') {
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

function parseBlock() {
	try {
		if(!MatchToken('{')){
			throw "error";
		}
		if(!MatchToken('}')) {
			throw "error";
		}
		return true;
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
			} else {
				throw "error";
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