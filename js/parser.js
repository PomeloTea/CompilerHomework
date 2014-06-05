var lookahead;
var lookaheadptr;
var grammarTree;

function MatchToken(expected) {
	if(lookahead.value == expected) {
		lookahead = nextToken();
	} else {
		alert("MatchToken: syntax error");
	}
}

function parseID() {
	var id = lookahead.value;
	if(id[0] >= '0' && id[0] <= '9') {
		alert("invalid id");
	}
	lookahead = nextToken();
	return id;
}

function parseQualifier() {
	var q = lookahead.value;
	lookahead = nextToken();
	return q;
}

function parseParaType() {
	var t;
	if(lookahead.type == "paraType") {
		t = lookahead.value;
	} else if(lookahead.type == "id") {
		t = parseID();
	}
	lookahead = nextToken();
	return t;
}

function parsePara() {
	var paraType = parseParaType();
	var isArray = false;
	if(lookahead.value == '[') {
		isArray = true;
		MatchToken('[');
		MatchToken(']');
	}
	var paraName = parseID();
	var isArray = false;
	return {type:"parameter", paraType:paraType, name:paraName}
}

function parseClass(qualifiers) {
	MatchToken("class");
	
	//类名
	var className = parseID();

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

	MatchToken("{");

	var cfuncs = [];	//构造函数
	var vars = [];		//变量
	var assigns = [];	//赋值语句		
	var funcs = [];		//函数
	var cqs = [];
	while(lookahead.value != "}") {
		/*if(lookahead.type == "id") {
			cfuncs.push(parseConstructFunc());
		} else {
			while(lookahead.type == "qualifiers") {
				cqs.push(parseQualifier());
			}
			var curpos = lookaheadptr - 1;
			while(!(lookahead.value == "(" || lookahead.value == ";" || lookahead.value == "=")) {
				lookahead = nextToken();
			}
			back(curpos);
			if(lookahead.value == "(") {
				funcs.push(parseFunc(cqs));
			} else if(lookahead.value == "=") {
				var v = parseVariable(cqs);
				assigns.push(parseAssignStat(v));
			} else {
				vars.push(parseVariable(cqs));
				MatchToken(";");
			}
		}*/
		lookahead = nextToken();
	}

	MatchToken("}");
	return {type:"class", qualifiers:qualifiers, name:className, fathers:fathers, interfaces:interfaces, cfucns:cfuncs, fields:vars, assigns:assigns, methods:funcs}
}

function parseDeclaration() {
	var declaration;

	//修饰词
	var qualifiers = [];
	while(lookahead.type == "qualifiers") {
		qualifiers.push(parseQualifier());
	}

	if(lookahead.type == "class") {
		//类的定义
		declaration = parseClass(qualifiers);
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
		alert("syntax error");
	}
	return declaration;
}

function parseProgram() {
	var classes = [];
	var globalvars = [];
	//while(lookahead != null) {
		var d = parseDeclaration();
		if(d && d.type == "class") {
			classes.push(d);
		} else if(d && d.type == "variable") {
			globalvars.push(d);
		}
	//}
	return{type: "program", classes:classes, globalvars:globalvars}
}

function Parser() {
	lookaheadptr = -1;
	lookahead = nextToken();
	grammarTree = parseProgram();
}