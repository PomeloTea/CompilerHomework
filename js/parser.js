var lookahead;
var lookaheadptr = 0;

function parseClass() {
	alert("This is parseClass function");
}

function parseVariable() {
	alert("This is parseVariable function");
}

function parseProgram() {
	if(lookahead.type == "class") {
		parseClass();
	} else if(lookahead.type == "paraType") {
		parseVariable();
	} else {
		alert("default");
	}
}

function Parser() {
	lookaheadptr = 0;
	lookahead = nextToken();
	//console.log(lookahead);
	parseProgram();
}