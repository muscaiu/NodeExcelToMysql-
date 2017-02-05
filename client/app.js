//file = path.split('\\').pop();

angular.module('ExcelApp', [])

.controller('MainController', function($http) {

    // $http.get('/api/codice').then(function(success, error) {
    //     console.log(success.data);
    // })

    var X = XLSX;
    var XW = {
        /* worker message */
        msg: 'xlsx',
        /* worker scripts */
        rABS: './xlsxworker2.js',
        norABS: './xlsxworker1.js',
        noxfer: './xlsxworker.js'
    };
    var rABS = typeof FileReader !== "undefined" && typeof FileReader.prototype !== "undefined" && typeof FileReader.prototype.readAsBinaryString !== "undefined";

    function fixdata(data) {
        var o = "",
            l = 0,
            w = 10240;
        for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
        return o;
    }

    function ab2str(data) {
        var o = "",
            l = 0,
            w = 10240;
        for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w, l * w + w)));
        o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w)));
        return o;
    }

    function s2ab(s) {
        var b = new ArrayBuffer(s.length * 2),
            v = new Uint16Array(b);
        for (var i = 0; i != s.length; ++i) v[i] = s.charCodeAt(i);
        return [v, b];
    }

    function xw_xfer(data, cb) {
        var worker = new Worker(rABS ? XW.rABS : XW.norABS);
        worker.onmessage = function(e) {
            switch (e.data.t) {
                case 'ready':
                    break;
                case 'e':
                    console.error(e.data.d);
                    break;
                default:
                    xx = ab2str(e.data).replace(/\n/g, "\\n").replace(/\r/g, "\\r");
                    //console.log("done");
                    cb(JSON.parse(xx));
                    break;
            }
        };
        if (rABS) {
            var val = s2ab(data);
            worker.postMessage(val[1], [val[1]]);

        } else {
            worker.postMessage(data, [data]);
        }
    }

    function xw(data, cb) {
        xw_xfer(data, cb);
    }


    function to_json(workbook) {
        var result = {};
        workbook.SheetNames.forEach(function(sheetName) {
            var roa = X.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            if (roa.length > 0) {
                result[sheetName] = roa;
            }
        });
        return result;
    }

    function to_csv(workbook) {
        var result = [];
        workbook.SheetNames.forEach(function(sheetName) {
            var csv = X.utils.sheet_to_csv(workbook.Sheets[sheetName]);
            if (csv.length > 0) {
                result.push("SHEET: " + sheetName);
                result.push("");
                result.push(csv);
            }
        });
        return result.join("\n");
    }

    function process_wb(wb) {
        var output = "";
        output = JSON.stringify(to_json(wb), 2, 2);

        if (out.innerText === undefined) out.textContent = output;
        else out.innerText = output;

        console.log(wb);

        var filename = $('input[type=file]').val().replace(/C:\\fakepath\\/i, '')
        console.log(filename);

        $http.post('/api/data', { wb: wb, filename: filename })
    }

    var xlf = document.getElementById('xlf');

    function handleFile(e) {

        var files = e.target.files;
        var f = files[0]; {
            var reader = new FileReader();
            var name = f.name;
            reader.onload = function(e) {

                var data = e.target.result;

                xw(data, process_wb);
            }
            reader.readAsBinaryString(f);
        }
    }
    if (xlf.addEventListener) {
        xlf.addEventListener('change', handleFile, false);
    }
})