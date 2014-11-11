main  -> next lf (reset | lists) {%
         function(d) {
           var merge = require('merge');
           return merge(d[0], {'lists': d[2][0]})
         }
       %}

next  -> "n:" number      {% function(d) {return {'next': d[1]};} %}
reset -> "r:pleasereset"  {% function(d) {return {'reset': true};} %}
lists -> list {% id %}
       | lists list {%
         function(d) {
           var merge = require('merge'); 
           return merge(d[0], d[1]);
         }
      %}

list  -> "i:" name lf listdata {% 
        function(d) {
          var obj = {};
          obj[d[1]] = d[3];
          return obj;
        } 
      %}
listdata     -> listdataitem          {% id %}
              | listdata listdataitem {% 
                function(d) {
                  var merge = require('merge'); 
                  return merge(d[0], d[1]);
                } 
             %}
listdataitem -> (redirect_url | adddel_head | subdel_head) lf
                {% function(d) {return d[0][0];} %}

redirect_url -> "u:" url                      {% function(d) {return {'url': d[1]}; } %}
adddel_head  -> "ad:" chunklist               {% function(d) {return {'expireAdd': d[1]}; } %}
subdel_head  -> "sd:" chunklist               {% function(d) {return {'expireSub': d[1]}; } %}
chunklist    -> (range | number)              {% id %}
              | chunklist "," (range|number)  {% function(d) {return d[0].concat(d[2]);} %}

lf     -> "\n"
number -> [0-9]                   {% function(d) {return parseInt(d[0], 10);} %}
        | number [0-9]            {% function(d) {return (d[0] * 10) + parseInt(d[1],10);} %}
range  -> number "-" number       {% function(d) {return [d[0], d[2]];} %}
name   -> [0-9a-z\-]              {% id %}
        | name [0-9a-z\-]         {% function(d) {return d[0] + d[1];} %}
url    -> [A-Za-z0-9/\_\.\-%]     {% id %}
        | url [A-Za-z0-9/\_\.\-%] {% function(d) {return d[0] + d[1];} %}