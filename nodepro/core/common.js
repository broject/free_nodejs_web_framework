/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


module.exports = {
    self: this,
    empty_function: function () { },
    htmlEscape: function (html) {
        return String(html)
            .replace(/&(?!\w+;)/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },
    xss: function (obj) {
        if (obj instanceof Array) {
            for (var i = 0; i < obj.length; i++) {
                obj[i] = this.xss(obj[i]);
            }
        } else {
            if (typeof obj === 'string') {
                return this.htmlEscape(obj);
            } else {
                for (var key in obj) {
                    // key != '_id' for mongoose doc
                    if (typeof obj[key] === 'object'
                        && !(typeof obj[key] === 'string')
                        && !(typeof obj[key] === 'function')
                        && key !== '_id' && key !== 'ID') {
                        obj[key] = this.xss(obj[key]);
                    } else if (typeof obj[key] === 'string') {
                        obj[key] = this.htmlEscape(obj[key]);
                    }
                }
            }
        }
        return obj;
    },
    utc_full: function () {
        return new Date().toJSON();
    },
    utc_clean: function () {
        var isod = this.utc_full();
        var utcd = isod.replace(/T/, ' ').replace(/Z/, '');
        return utcd;
    },
    utc_datetime: function () {
        var isod = this.utc_full();
        var utcd = isod.replace(/T/, ' ').replace(/\..+/, '');
        return utcd;
    },
    local_datetime: function (d, f) {
        var date = (d !== undefined) ? new Date(d) : new Date();
        var hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;
        var min = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;
        var sec = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;
        var day = date.getDate();
        day = (day < 10 ? "0" : "") + day;
        if (f === 'd') {
            return year + "-" + month + "-" + day;
        } else {
            if (f === 't') {
                return hour + ":" + min + ":" + sec;
            }
        }
        return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
    },
    ip: function (socket) {
        return socket.remoteAddress;
    },
    port: function (socket) {
        return socket.remotePort;
    },
    isInt: function (value) {
        return (!isNaN(value) && (function (x) {
            return (x | 0) === x;
        })(parseFloat(value)));
    },
    isEmpty: function (s) {
        return (s === undefined || s === null || (typeof s === 'string' && s.length === 0));
    },
    indexOfRight: function (s, c) {
        var i = s !== undefined ? s.length : -1;
        var p = i, ret = true;
        if (i > 0) {
            while (s[--p] !== c) {
                if (p === 0) {
                    ret = false;
                    break;
                }
            }
        }
        return (ret ? p : -1);
    },
    ltrim: function (s, c) {
        var i = s !== undefined ? 0 : -1;
        var p = i;
        if (i > -1) {
            while (s[i++] === c) {
                p = i;
            }
        }
        return s.substr(p);
    },
    rtrim: function (s, c) {
        var i = s !== undefined ? s.length : -1;
        var p = i;
        if (i > 0) {
            while (s[--i] === c) {
                p = i;
            }
        }
        return s.substr(0, p);
    },
    trim: function (s, c) {
        return this.ltrim(this.rtrim(s, c), c);
    },
    cast_string: (JSON.stringify !== undefined ? JSON.stringify : function (obj) {
        var arr = [];
        var func = this.toJstr;
        if (obj instanceof Array) {
            for (var i = 0; i < obj.length; i++) {
                var sitem = func(obj[i]);
                arr.push(sitem);
            }
            return "[" + arr.join(",") + "]";
        } else {
            Object.getOwnPropertyNames(obj).forEach(function (prop, idx, array) {
                var val = obj[prop];
                var next = prop + ":" + (typeof val === 'object' ? func(val) : val);
                arr.push(next);
            });
            return "{" + arr.join(",") + "}";
        }
    }),
    cast_array: function (arr) {
        if (!Array.isArray(arr)) {
            var one = arr;
            arr = [];
            arr.push(one);
        }
        return arr;
    },
    clean_array: function (v_segments) {
        var c_segments = [];
        for (var i = 0, l = v_segments.length; i < l;) {
            var s = this.trim(v_segments[i], ' ');
            if (s === '' || s.length === 0) {
                v_segments.splice(i, 1);
                l = v_segments.length;
                if (i > 0) {
                    i--;
                }
            } else {
                i++;
            }
        }
        return v_segments;
    },
    clone: function (jarg) {
        if (typeof jarg === 'string')
            return JSON.stringify(JSON.parse(jarg));
        else
            return JSON.parse(JSON.stringify(jobj));
    }
};