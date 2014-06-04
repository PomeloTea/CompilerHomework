var lexeme = [];
var token = [];
var singleoprt = ['+', '-', '*', '/', '%', '=', '&', '|', '>', '<', '!'];

function isCharOrNum(c) {
	if((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_' || (c >= '0' && c <= '9')) {
		return 1;
	} else {
		return 0;
	}
}

function splitProgram(name) {
	var code = content[name];
	var stack = [];
	var i = 0;
	var t = "";
	while(i < code.length) {
		var c = code[i];
		var len = stack.length;
		if(len == 0) {
			if(isCharOrNum(c)) {
				t += code[i];
				c = code[i+1];
				if(!isCharOrNum(c)) {
					lexeme.push(t);
					t = "";
				}
			} else if(jQuery.inArray(c, singleoprt) != -1){
				t += code[i];
				c = code[i+1];
				if(jQuery.inArray(c, singleoprt) == -1) {
					if(t == "//" || t == "/*") {
						stack.push(t);
						t = "";
						continue;
					}
					lexeme.push(t);
					t = "";
				}
			} else if(c == '"' || c == '\'') {
				lexeme.push(c);
				stack.push(c);
			} else if(c == '\r' || c == '\n' || c == '\t' || c == ' ') {

			} else {
				lexeme.push(c);
			}
		} else if(len == 1) {
			if(stack[len-1] == '"' || stack[len-1] == '\'') {
				if(stack[len-1] == c) {
					lexeme.push(t);
					t = "";
					lexeme.push(c);
					stack.pop();
				} else {
					if(c == '\\') {
						stack.push(c);
					}
					t += c;
				}
			} else if(stack[len-1] == "//") {
				if(c == '\n') {
					stack.pop();
				}
			} else if(stack[len-1] = "/*") {
				if(c == '/' && code[i-1] == '*') {
					stack.pop();
				}
			}
		} else if(len == 2) {
			t += c;
			stack.pop();
		}
		i++;
	}
}

function nextToken() {	
	lookaheadptr++;
	if(lookaheadptr >= lexeme.length) {
		return null;
	}
	var curLexeme = lexeme[lookaheadptr];
	var type;
	switch(curLexeme) {
		case "public" :
		case "private" :
		case "protected" :
		case "abstract" :
		case "static" :
		case "final" :
			type = "qualifier";
			break;
		case "int" :
		case "float" :
		case "double" :
		case "long" :
		case "boolean" :
		case "byte" :
		case "char" :
			type = "paraType";
			break;
		case "~" :
		case "!" :
			type = "unaryOprt";
			break;
		case "++":
		case "--":
			type = "";
			break;
		case "+" :
		case "-" :
		case "*" :
		case "/" :
		case "%" :
		case "&" :
		case "|" :
		case "&&" :
		case "||" :
		case "^" :
		case "<<" :
		case ">>" :
		case "+=" :
		case "-=" :
			type = "binaryOprt";
			break;
		case ">" :
		case ">=" :
		case "<" :
		case "<=" :
		case "==" :
		case "!=" :
			type = "compOptr";
			break;
		case "class" :
			type = "class";
			break;
		case "implement" :
			type = "implement";
			break;
		case "extends" :
			type = "extends";
			break;
		case "void" :
			type = "void";
			break;
		case "{":
			type = "{";
			break;
		case "}":
			type = "}";
		default:
			type = "id";
	}
	return {type: type, value: curLexeme}
}

function Lexer(name) {
	lexeme = [];
	splitProgram(name);
}
