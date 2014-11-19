var dateFormat = require("./date.format");

module.exports = {
  getIndentation: function(level, indentation) {
    var pad;
    if (indentation) {
      pad = "\n";
      var times = level * indentation
      for (var i = times; i == 0; i--) {
        pad += " "
      }
      // _.times(level * indentation, (function(_this) {
      //   return function() {
      //     return pad += " ";
      //   };
      // })(this));
      return pad;
    } else {
      return "";
    }
  },
  toBsonString: function(json, options) {
    var emptyObject, indentation, level, p, result, v;
    if (options == null) {
      options = {};
    }
    level = options.level || 0;
    if (options.indentation != null) {
      indentation = options.indentation;
    } else {
      indentation = 2;
    }
    result = "";
    emptyObject = true;
    if (result !== "") {
      result += "" + (this.getIndentation(level, indentation));
    }
    if (options.valueOnly) {
      return this.parseValue(json, result, level, indentation, options);
    } else if (json instanceof Array) {
      result += "[";
    } else if (json instanceof Object) {
      result += "{";
    }
    for (p in json) {
      v = json[p];
      emptyObject = false;
      result += this.getIndentation(level + 1, indentation);
      if (!(json instanceof Array)) {
        if (options.html) {
          if (p.match(/[^A-z0-9_]/)) {
            result += "<span class='key'>\"" + ($("<div>").text(p).html()) + "\"</span>: ";
          } else {
            result += "<span class='key'>" + p + "</span>: ";
          }
        } else {
          if (p.match(/^\d|[^A-z0-9_]/)) {
            result += "\"" + (p.replace(/"/g, '\\"')) + "\": ";
          } else {
            result += "" + p + ": ";
          }
        }
      }
      result = this.parseValue(v, result, level, indentation, options);
    }
    if (result.slice(-1) === ",") {
      result = result.slice(0, -1);
    }
    if (!emptyObject) {
      result += this.getIndentation(level, indentation);
    }
    if (json instanceof Array) {
      return result += "]";
    } else if (json instanceof Object) {
      return result += "}";
    }
  },
  parseValue: function(v, result, level, indentation, options) {
    var className, dt, dtf, val;
    if (v === null) {
      if (options.html) {
        result += "<span class='value'>null</span>,";
      } else {
        result += "null,";
      }
    } else if (typeof v === "object") {
      switch (v.constructor.name) {
        case "ObjectID":
          if (options.html) {
            result += "<span class='function'>ObjectId</span>(<span class='string'>\"<span class='_id'>" + (v.toString()) + "</span>\"</span>),";
          } else {
            result += "ObjectId(\"" + (v.toString()) + "\"),";
          }
          break;
        case "Date":
          dt = new Date(v.toString());
          dtf = dateFormat(dt, 'isoUtcDateTime');
          if (dt.getMilliseconds() > 0) {
            dtf = dtf.replace(/Z$/, "." + (dateFormat(dt, 'l')) + "Z");
          }
          if (options.html) {
            result += "<span class='function'>ISODate</span>(<span class='string'>\"" + dtf + "\"</span>),";
          } else {
            result += "ISODate(\"" + dtf + "\"),";
          }
          break;
        case "RegExp":
          if (options.html) {
            result += "<span class='regex'>/" + (v.toString()) + "</span>,";
          } else {
            result += "/" + (v.toString()) + ",";
          }
          break;
        default:
          if (v["$oid"]) {
            if (options.html) {
              result += "<span class='function'>ObjectId</span>(<span class='string'>\"<span class='_id'>" + v["$oid"] + "</span>\"</span>),";
            } else {
              result += "ObjectId(\"" + v["$oid"] + "\"),";
            }
          } else if (v["$date"] != null) {
            dt = new Date(v['$date']);
            dtf = dateFormat(dt, 'isoUtcDateTime');
            if (dt.getMilliseconds() > 0) {
              dtf = dtf.replace(/Z$/, "." + (dateFormat(dt, 'l')) + "Z");
            }
            if (options.html) {
              result += "<span class='function'>ISODate</span>(<span class='string'>\"" + dtf + "\"</span>),";
            } else {
              result += "ISODate(\"" + dtf + "\"),";
            }
          } else if (v["$regex"]) {
            if (options.html) {
              result += "<span class='regex'>/" + v["$regex"] + "/" + v["$options"] + "</span>,";
            } else {
              result += "/" + v["$regex"] + "/" + v["$options"] + ",";
            }
          } else if (v["$timestamp"]) {
            if (options.html) {
              result += "<span class='function'>Timestamp</span>(" + v["$timestamp"]["t"] + ", " + v["$timestamp"]["i"] + "),";
            } else {
              result += "Timestamp(" + v["$timestamp"]["t"] + ", " + v["$timestamp"]["i"] + "),";
            }
          } else if (v["$ref"]) {
            if (options.html) {
              result += "<span class='function'>Dbref</span>(\"<span class='string'>" + v["namespace"] + "</span>\", " + (this.toBsonString(v["oid"], {
                level: level + 1,
                valueOnly: true,
                html: true
              }));
              if (v["db"]) {
                result += ", \"<span class='string'>" + v["db"] + "</span>\"";
              }
              result += "),";
            } else {
              result += "Dbref(\"" + v["$ref"] + "\", " + (this.toBsonString(v["$id"], {
                level: level + 1,
                valueOnly: true,
                html: false
              })) + "),";
            }
          } else {
            result += "" + (this.toBsonString(v, {
              level: level + 1,
              indentation: indentation,
              html: options.html
            })) + ",";
          }
      }
    } else if (v === "<BSON::Binary>") {
      if (options.html) {
        result += "<span class='function'>Binary</span>(<span class='string'>\"[BSON::Binary]\"</span>),";
      } else {
        result += "Binary(\"[BSON::Binary]\"),";
      }
    } else {
      val = JSON.stringify(v);
      if (options.html) {
        val = val.replace(/</g, '&lt;');
        className = 'string';
        if (val === 'false' || val === 'true') {
          className = 'value';
        }
        if (typeof v === 'number') {
          className = 'number';
        }
        result += "<span class='" + className + "'>" + val + "</span>,";
      } else {
        result += "" + val + ",";
      }
    }
    if (options.valueOnly) {
      if (result.slice(-1) === ",") {
        result = result.slice(0, -1);
      }
    }
    return result;
  },
  sanitizeRegex: function(json) {
    var p, regexp_parts, v;
    for (p in json) {
      v = json[p];
      if (v instanceof RegExp) {
        regexp_parts = v.toString().match(/^\/(.*)\/([gim]*)$/);
        json[p] = {
          $regex: regexp_parts[1],
          $options: regexp_parts[2]
        };
      } else if (p === "$oid" && typeof v === "undefined") {
        alert("json[p] = window.dblayer.page_data.document_oids.shift()");
      } else if (p === "$date" && typeof v === "undefined") {
        json[p] = (new Date()).getTime();
      } else if (typeof v === "object") {
        json[p] = this.sanitizeRegex(v);
      }
    }
    return json;
  },
  bsonEval: function(src) {
    var error, json, mask, p, v;
    try {
      mask = {};
      for (p in this) {
        v = this[p];
        mask[v] = void 0;
      }
      mask.ObjectId = function(id) {
        return {
          $oid: id
        };
      };
      mask.Date = function(date) {
        return {
          $date: date
        };
      };
      mask.ISODate = function(date) {
        return {
          $date: (new Date(date)).getTime()
        };
      };
      mask.Timestamp = function(t, i) {
        return {
          $timestamp: {
            "t": t,
            "i": i
          }
        };
      };
      mask.Dbref = function(name, id, db) {
        return {
          namespace: name,
          oid: id,
          db: db
        };
      };
      mask.Binary = function(v) {
        throw "Cannot save documents with Binary values";
      };
      json = (new Function("with(this){ return " + src + " }")).call(mask);
      return this.sanitizeRegex(json);
    } catch (_error) {
      error = _error;
      throw error;
    }
  }
};