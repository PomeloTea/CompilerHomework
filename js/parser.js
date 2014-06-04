var lookahead;
var lookaheadptr;

function MatchToken(expected) {
	if(lookahead.value == expected) {
		lookahead = nextToken();
	} else {
		alert("syntax error");
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

function parseConstructFunc() {

}

function parseFunc() {

}

function parseVariable() {
	//修饰词
	var qualifiers = [];
	while(lookahead.type == "qualifiers") {
		qualifiers.push(parseQualifier());
	}

	//变量类型
	var paraType;
	var isArray = false;
	var value;	
	var size;
	if(lookahead.type == "paraType" || lookahead.type == "id") {
		paraType = parseParaType();
	}

	if(lookahead.value == "[") {
		MatchToken("[");
		MatchToken("]");
		isArray = true;
	}
	//变量名
	var paraName = parseID();

	if(lookahead.value == "[") {
		MatchToken("[");
		MatchToken("]");
		isArray = true;
	}

	//如果赋值
	if(lookahead.value == "=") {
		MatchToken("=");
		if(!isArray) {
			value = parseID();
		} else {
			size = 0;
			value = [];
			if(lookahead.value == '{') {
				MatchToken('{');
				if(lookahead.type == 'id') {
					value.push(parseID());
					size += 1;
					while(lookahead.value == ",") {
						MatchToken(",");
						value.push(parseID());
						size += 1;
					}
				}
				MatchToken('}');
			} else {
				MatchToken("new");
				if(lookahead.value == paraType) {
					MatchToken(paraType);
					MatchToken('(');
					var t = parseInt(lookahead.value);
					if(t.toString() == lookahead.value) {
						size = t;
					} else {
						alert("syntax error");
					}
					MatchToken(')');
				}
			}
		}
	}

	MatchToken(";");
	return{type:"variable", paraType:paraType, name:paraName, value:value, size:size}
}

function parseClass() {
	//类修饰词
	var qualifiers = [];
	while(lookahead.type == "qualifiers") {
		qualifiers.push(parseQualifier());
	}
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
	var funcs = [];		//函数
	while(lookahead.value != "}") {
		/*if(lookahead.type == "id") {
			cfuncs.push(parseConstructFunc());
		} else {
			var t = lookaheadptr - 1;
			while(!(lookahead.value == "(" || lookahead.value == ";" || lookahead.value == "=")) {
				lookahead = nextToken();
			}
			if(lookahead.value == "(") {
				lookaheadptr = t;
				lookahead = nextToken();
				funcs.push(parseFunc());
			} else {
				lookaheadptr = t;
				lookahead = nextToken();
				vars.push(parseVariable());
			}
		}*/
		lookahead = nextToken();
	}

	MatchToken("}");
	return {type:"class", qualifiers:qualifiers, name:className, fathers:fathers, interfaces:interfaces, cfucns:cfuncs, fields:vars, methods:funcs}
}

function parseDeclaration() {
	var declaration;
	if(lookahead.type == "class") {
		//类的定义
		declaration = parseClass();
	} else if(lookahead.type == "paraType") {
		//全局变量
		declaration = parseVariable();
	} else {
		alert("syntax error");
	}
	return declaration;
}

function parseProgram() {
	var classes = [];
	var globalvars = [];
	//while(lookahead != null) {
		console.log(lookahead);
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
	parseProgram();
}