@{%
  function getObjectFromMappings(mappings) {
    var obj = {};
    mappings.forEach(function(list) {
      obj[list[0]] = list[1];
    });
    return obj;
  }

  function delimitedObjectList(d) {
    var mappings = d[0].concat(d[1].map(function(item) {
      return item[1][0];
    }));

    return getObjectFromMappings(mappings);
  }
%}

expression -> next lf (reset | lists) {%
  function(d) {
    return getObjectFromMappings([
      d[0],
      d[2][0]
    ]);
  }
%}

next  -> "n:" number          {% function(d) { return ['delay', d[1]]; } %}
reset -> "r:pleasereset"      {% function(d) { return ['reset', true]; } %}
lists -> (list) (lf (list)):* {% 
  function(d) {
    return ['lists', delimitedObjectList(d)];
  }
%}

list         -> "i:" name lf listitems {% function(d) { return [d[1], d[3]]; } %}
listitem     -> redirect_url | adddel_head | subdel_head
listitems    -> listitem (lf listitem):* {% delimitedObjectList %}

redirect_url -> "u:" url        {% function(d) { return ['url', d[1]];} %}
adddel_head  -> "ad:" chunklist {% function(d) { return ['expireAdd', d[1]];} %}
subdel_head  -> "sd:" chunklist {% function(d) { return ['expireSub', d[1]];} %}
chunklist    -> (range | number) ("," (range | number)):* {%
  function(d) {
    return d[0].concat(d[1].map(function(item) {
      return item[1][0];
    }));
  }
%}

lf     -> "\n"
number -> [0-9]:+ {%
  function(d) { 
    return d[0].reduce(function (total, digit) { 
      return total*10 + parseInt(digit, 10); 
    }, 0); 
  } 
%}
range  -> number "-" number     {% function(d) { return [d[0], d[2]]; } %}
name   -> [0-9a-z\-]:+          {% function(d) { return d[0].join(''); } %}
url    -> [A-Za-z0-9/\_\.\-%]:+ {% function(d) { return d[0].join(''); } %}
