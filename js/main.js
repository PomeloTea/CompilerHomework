var content = [];

$(document).ready(function() {
	$("#files").change(function(event) {
        var files = event.target.files;
        var f = files[0];
        var reader = new FileReader();
        reader.onload = (function(file) {
            return function(e) {
            	content[file.name] = e.target.result;
                Lexer(file.name);
                Parser();
            }
        })(f);
        reader.readAsText(f);
    });

});