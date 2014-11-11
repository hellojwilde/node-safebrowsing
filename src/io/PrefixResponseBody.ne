expression -> next lf (reset | (list lf):+)

next -> "n:" number
reset -> "r:pleasereset"
list -> "i:" name lf listdata
listdata -> (redirect_url | adddel_head | subdel_head):*
redirect_url -> "u:" url
adddel_head -> "ad:" chunklist
subdel_head -> "sd:" chunklist
chunklist -> (range | number) ("," chunklist):?

lf -> "\n"
number -> ([0-9]):+
range -> number "-" number
name -> ([0-9a-z\-]):+
url -> ([A-Za-z0-9/\_\.\-%]):+