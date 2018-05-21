window.onload = function () {
    App.init();
}

var App = (function () {

    var _divRes;

    function init() {
        _divRes = GetElm('response');
        var site = GetCookie('site');
        if (site !== null) {
            GetElm('url').value = site.URL;
            GetElm('postData').value = site.PostData;
        }
        GetElm('url').focus();
    }

    function ShowLoader(val) {
        if (val) {
            GetElm('loader').style.visibility = 'visible';
        }
        else {
            GetElm('loader').style.visibility = 'hidden';
        }
    }

    function GetElm(id) {
        return document.getElementById(id);
    }

    function NewElm(tag) {
        return document.createElement(tag);
    }

    function GetInput() {
        var url = GetElm('url').value;
        var postData = GetElm('postData').value;
        var data = { URL: url, PostData: postData };
        SetCookie(data);
        return data;
    }

    function Get() {
        var input = GetInput();
        var rnd = 'RND=' + (Math.random() * Math.pow(10, 18));
        var parser = NewElm('a');
        parser.href = input.URL;
        var url = parser.search === '' ? input.URL + '?' + rnd : input.URL + '&' + rnd;
        Request('get', url, null, function (response) {
            ParseData(response);
        });
    }

    function SetCookie(pData) {
        var data = JSON.stringify(pData);
        document.cookie = 'site=' + encodeURIComponent(data);
    }

    function Post() {
        var input = GetInput();
        Request('post', input.URL, input.PostData, function (response) {
            ParseData(response);
        });
    }

    function Request(pMethod, pURL, pData, pCallBack) {
        ShowLoader(true);
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            ShowLoader(false);
            _divRes.innerHTML = '';
            if (xhr.status === 200) {
                if (xhr.responseText !== '') {
                    var data = null;
                    try {
                        data = JSON.parse(xhr.responseText);
                        pCallBack(data);
                    }
                    catch (error) {
                        _divRes.innerHTML = '';
                        var pre = NewElm('pre');
                        pre.innerHTML = xhr.responseText;
                        _divRes.appendChild(pre);
                    }
                }
                else {
                    pCallBack(JSON.parse(xhr.getResponseHeader('ResponseData')));
                }
            }
            else {
                _divRes.innerHTML = xhr.status + ' ' + xhr.statusText;
            }
        }
        xhr.open(pMethod, pURL);
        xhr.send(pData);


    }

    function Head() {
        var input = GetInput();
        Request('head', input.URL, input.PostData, function (response) {
            ParseData(response);
        });
    }

    function ParseData(pText) {
        var divCount = GetElm('divCount');
        if (pText !== null) {
            if (pText.constructor === Array) {
                divCount.innerHTML = 'Count: ' + pText.length;
                FillTable(pText);
            }
            else {
                divCount.innerHTML = '';
                FillObject(pText);
            }
        }
    }

    function FillObject(pData) {
        var cols = Object.keys(pData);
        var table = NewTable();
        _divRes.appendChild(table);
        var rowNum = 1;
        cols.forEach(function (col) {
            var row = table.insertRow();
            var cell = row.insertCell();
            cell.innerHTML = rowNum;
            rowNum++;
            cell = row.insertCell();
            cell.className = 'jprop';
            cell.innerHTML = col;
            cell = row.insertCell();
            var pre = NewElm('pre');
            pre.innerHTML = pData[col];
            cell.appendChild(pre);
            cell.className = 'jdata';
        });
    }

    function NewTable() {
        var table = NewElm('table');
        return table;
    }

    function FillTable(pData) {
        var table = NewTable();
        _divRes.appendChild(table);
        CreateHeader(table, pData);
        CreateRows(table, pData);
    }

    function CreateHeader(pTable, pData) {
        if (pData.length > 0) {
            var cols = Object.keys(pData[0]);
            var row = pTable.insertRow();
            var th = NewElm('th');
            row.appendChild(th);
            for (var i = 0; i < cols.length; i++) {
                th = NewElm('th');
                th.innerHTML = cols[i];
                row.appendChild(th);
            }
        }
    }

    function CreateRows(table, response) {
        for (var i = 0; i < response.length; i++) {
            var cols = Object.keys(response[0]);
            var row = table.insertRow();
            var cell = row.insertCell();
            cell.className = 'gvRowNum';
            var rowIndex = i + 1;
            cell.innerHTML = rowIndex;
            var res = response[i];
            for (var j = 0; j < cols.length; j++) {
                var cell = row.insertCell();
                var pre = NewElm('pre');
                pre.innerHTML = res[cols[j]];
                cell.appendChild(pre);
            }
        }
    }

    function GetCookie(pKey) {
        var val = null;
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var elm = cookies[i];
            var chrIndx = elm.indexOf('=');
            var key = elm.substring(0, chrIndx);
            if (key === pKey) {
                val = elm.substring(chrIndx + 1);
                break;
            }
        }
        return JSON.parse(decodeURIComponent(val));
    }

    return {
        init: init,
        Get: Get,
        Post: Post,
        Head: Head
    }
})();