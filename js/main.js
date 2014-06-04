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

    if (window.File && window.FileReader && window.FileList && window.Blob) {
    } else {
      alert('本浏览器不支持FILE API，建议使用chrome浏览器，谢谢。');
      return;
    }

    $('#fileinput').change(function(e){
        for(var i = 0; i < e.target.files.length; i++) {
            handleFile(e.target.files[i]);
        }
    });

    $('#filedrop').bind('dragover', function(e){
        e.stopPropagation();
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'copy';
    });

    $('#filedrop').bind('drop', function(e){
        e.stopPropagation();
        e.preventDefault();
        for(var i = 0; i < e.originalEvent.dataTransfer.files.length; i++) {
            handleFile(e.originalEvent.dataTransfer.files[i]);
        }
    });

    $('#filelist').on('click', '.download', function(){
        var filename = $($(this).parent().children()[0]).html();
        filename = filename.substr(0, filename.indexOf('.'));
        doSave("result", "text/latex", filename + "-result.js");
    });

});

var fileTemplate = '<li><a>' +
          '<span class="filename"></span>' +
          '<span class="download glyphicon glyphicon-floppy-save"></span>' +
        '</a></li>';

function handleFile(f) {
    var reader = new FileReader();
    reader.onload = (function(file) {
        return function(e) {
            var filename = file.name;
            while(content[filename] != undefined) {
                filename += ' 副本';
            }
            var fileLi = $(fileTemplate);
            fileLi.find('.filename').html(filename);
            $('#filelist').append(fileLi);
            content[filename] = e.target.result;
            Lexer(filename);
            Parser();
        }
    })(f);
    reader.readAsText(f);
}

