var content = [];
var result;

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

    $('#filelist').on('click', 'a', function(){
        $('.active-file').removeClass('active-file');
        $(this).addClass('active-file');
        var filename = $($(this).children()[0]).html();
        var source = content[filename];
        source = source.replace(/\n/g, "<br/>");
        source = source.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
        $('#source-div').html(source);
        result = result.replace(/\n/g, "<br/>");
        result = result.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
        $('#result-div').html(result);
    });

    $('#myclassDownload-btn').click(function(){
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
            result = Gnerator(grammarTree);
        }
    })(f);
    reader.readAsText(f);
}

//函数功能：将value以type为形式、name为名称，从浏览器下载到本地
function doSave(value, type, name) {
    var blob;
    if (typeof window.Blob == "function") {
        blob = new Blob([value], {
            type: type
        });
    } else {
        var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
        var bb = new BlobBuilder();
        bb.append(value);
        blob = bb.getBlob(type);
    }
    var URL = window.URL || window.webkitURL;
    var bloburl = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    if ('download' in anchor) {
        anchor.style.visibility = "hidden";
        anchor.href = bloburl;
        anchor.download = name;
        document.body.appendChild(anchor);
        var evt = document.createEvent("MouseEvents");
        evt.initEvent("click", true, true);
        anchor.dispatchEvent(evt);
        document.body.removeChild(anchor);
    } else if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, name);
    } else {
        location.href = bloburl;
    }
}
