@{%
	const lexer = moo.compile({
	  ws:      { match: /[ \t\r\n]+/, lineBreaks: true },
	  number:  /[0-9]+/,
	  keyword: /title|labels|bar|stack/,
	  quote:   '"',
	  lbrack:  '[',
	  rbrack:  ']',
	  comma:   ',',
	  dot:     '.',
	  word:    /[\w]+/,
	});
	const merge = d => d[0].reduce((o, cur) => {
		if ('type' in cur) {
			o[cur['type']] = o[cur['type']] ?? []; 
			o[cur['type']].push(cur);
			return o;
		} else {
			return { ...o, ...cur };
		}
	}, {});
	const unpack = d => d[0];
	const token = ([{value}]) => (value);
%}

@lexer lexer

main ->
	part:+ {% merge %}

part -> 
	expr {% unpack %}

expr ->
	def_title 		{% unpack %}
	| def_labels 	{% unpack %}
	| def_stack 	{% unpack %}
	| def_bar 		{% unpack %}
	| def_line 		{% unpack %}

def_title ->
	"title" %ws string 			{% d => ({title: d[2]}) %}

def_labels ->
	"labels" %ws array 			{% d => ({labels: d[2]}) %}
	
def_stack ->
	"stack" %ws string array 	{% d => ({type: 'stack', name: d[2], datasets: d[3]}) %}

def_bar ->
	"bar" %ws string array		{% d => ({type: 'bar', name: d[2], dataset: d[3]}) %}

def_line ->
	"line" %ws string array		{% d => ({type: 'line', name: d[2], dataset: d[3]}) %}

array -> 
	lbrack array_element:* rbrack {% d => d[1] %}

array_element -> 
	number comma:? 		{% d => parseFloat(d[0]) %}
	| string comma:? 	{% d => d[0] %}

string ->
	word						{% unpack %}
	| quote string_part:+ quote	{% d => d[1].join(" ") %}

string_part ->
	word		{% unpack %}
	| number	{% unpack %}

lbrack -> %lbrack %ws:?	{% token %}
rbrack -> %rbrack %ws:?	{% token %}
quote -> %quote %ws:?	{% token %}
comma -> %comma %ws:?	{% token %}
word -> %word %ws:?		{% token %}
number -> %number %ws:?	{% token %}