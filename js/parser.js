var lookahead;
var lookaheadptr;

function MatchToken(expected) {
	if(lookahead.value == expected) {
		lookahead = nextToken();
	} else {
		console.log("Syntax Error:\n" + lookahead.value + " and " + expected + " does not match");
	}
}

function parseID() {
	lookahead = nextToken();
}

function parseQualifer() {

}

function parseConstructFunc() {

}

function parseFunc() {

}

function parseVariable() {

}

function parseClass() {
	var qualifiers = [];
	while(lookahead.type == "qualifiers") {
		qualifiers.push(parseQualifier());
	}
	MatchToken("class");
	var className = parseID();
	var fathers = [];
	if(lookahead.type == "extends") {
		MatchToken("extends");
		while(lookahead.type == "id") {
			fathers.push(parseID());
		}
	}
	var interfaces = [];
	if(lookahead.type == "implement") {
		MatchToken("implement");
		while(lookahead.type == "id"){
			interfaces.push(parseID());
		}
	}
	MatchToken("{");
	var cfuncs = [];
	var vars = [];
	var funcs = [];
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
		declaration = parseClass();
	} else if(lookahead.type == "paraType") {
		declaration = parseVariable();
	} else {
		console.log("syntax error");
	}
	return declaration;
}

function parseProgram() {
	var classes = [];
	var globalvars = [];
	while(lookahead != null) {
		var d = parseDeclaration();
		if(declaration && declaration.type == "class") {
			classes.push(d);
		} else if(declaration && declaration.type == "variable") {
			globalvars.push(d);
		}
	}
	return{type: "program", classes:classes, globalvars:globalvars}
}

function Parser() {
	lookaheadptr = -1;
	lookahead = nextToken();
	parseProgram();
}