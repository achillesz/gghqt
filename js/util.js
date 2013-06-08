/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-3-6
 * Time: 上午9:26
 * To change this template use File | Settings | File Templates.
 */
var EventUtil = {
	$:function(obj){
		return (typeof obj == 'string') ? document.getElementById(obj) : (typeof obj == "object" ? obj : null);
	},
	getClass:function(className,tag,parent){
		var parent = parent || document;
		if(!(parent = EventUtil.$(parent))) return false;
		tag = tag || '*';
		var tags = parent.getElementsByTagName(tag);
		className = className.replace(/\-/g,'\\-');
		var matchingElements = new Array();
		var regex = new RegExp("(^|\\s)" + className + "(\\s|$)");
		var element;
		for(var i = 0,len = tags.length; i < len; i++){
			element = tags[i];
			if(regex.test(element.className)){
				matchingElements.push(element);
			}
		}
		return matchingElements;
	},
	getURLParameter:function(name) {
		return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]);
	},
	uinq:function(arr){
		var a = [],
			o = {},
			i,
			v,
			len = arr.length;
		if (len < 2) {
			return arr;
		}

		for (i = 0; i < len; i++) {
			v = arr[i];
			if (o[v] !== 1) {
				a.push(v);
				o[v] = 1;
			}
		}
		return a;
	},
	getEvent: function(event) {
		return event ? event: window.event;
	},
	getTarget: function(event) {
		return target = event.target || event.srcElement;
	},
	getRelatedTarget: function(event) {
		if (event.relatedTarget) {
			return event.relatedTarget;
		}
		else if (event.type != 'mouseover' && event.toElement) {
			return event.toElement;
		}
		else if (event.type == 'mouseover' && event.fromElement) {
			return event.fromElement;
		}
		else {
			return null;
		}
	},
	addHandler: function(element, type, handler) {
		if (element.addEventListener) {
			element.addEventListener(type, handler, false);
		}
		else if (element.attachEvent) {
			element['e' + type + handler] = handler;
			element[type + handler] = function(){
				element['e' + type + handler](window.event);
			}
			element.attachEvent('on' + type,element[type + handler]);
		}
		else {
			element['on' + type] = handler;
		}
	},
	removeHandler: function(element, type, handler) {
		if (element.removeEventListener) {
			element.removeEventListener(type, handler, false);
		}
		else if (element.detachEvent) {
			element.detachEvent('on' + type, handler);
		}
		else {
			element['on' + type] = null;
		}
	},
	preventDefault: function(event) {
		if (event.preventDefault) {
			event.preventDefault();
		}
		else {
			event.returnValue = false;
		}
	},
	stopPropagation: function(event) {
		if (event.stopPropagation) {
			event.stopPropagation();
		}
		else {
			event.cancelBubble = true;
		}
	},
	getClientCorrds: function(event) {
		return {
			x: event.clientX,
			y: event.clientY
		}
	},
	getScreenCorrds: function(event) {
		return {
			x: event.screenX,
			y: event.screenY
		};
	},
	getCharCode: function(event) {
		if (typeof event.charCode == 'number') {
			return event.charCode;
		}
		else {
			return event.keyCode
		}
	},
	css:function(){
		var _this = this;
		if(window.getComputedStyle){
			this.css = function(){
				var result,tempString;
				if(arguments.length == 0) return;
				var elem = _this.$(arguments[0]);
				if(!elem) return;
				if(arguments.length == 1){
					result = window.getComputedStyle(elem,'');
					for(allStyle in result){
						tempString +='' + allStyle + ': \n' + result[allStyle] + '; '
					}
					var result = tempString;
				}
				if(arguments.length == 2 && typeof (arguments[1]) =='string'){
					result = window.getComputedStyle(elem,'')[arguments[1]];
				}
				if(arguments.length == 3 && typeof (arguments[2]) =='string'){
					result =  window.getComputedStyle[arguments[1]]= arguments[2];
				}
				if(arguments.length == 2 && Object.prototype.toString.call(arguments[1]) == "[object Object]"){
					for(attr in arguments[1]){
						elem.style[attr] = arguments[1][attr]
					}
				}
				return result;
			}
		}
		else{
			this.css = function(){
				var result,tempString;
				if(arguments.length == 0) return;
				var elem = _this.$(arguments[0]);
				if(arguments.length == 1 && elem){
					result = elem.currentStyle;
					for(allStyle in result){
						tempString +='' + allStyle + ': \n' + result[allStyle] + '; '
					}
					result = tempString;
				}
				if(arguments.length == 2 && typeof (arguments[1]) =='string'){
					result = elem.currentStyle[arguments[1]];
				}
				if(arguments.length == 3 && typeof (arguments[2]) =='string'){
					result = elem.currentStyle[arguments[1]]= arguments[2];
				}
				if(arguments.length == 2 && Object.prototype.toString.call(arguments[1]) == "[object Object]"){
					for(attr in arguments[1]){
						elem.style[attr] = arguments[1][attr]
					}
				}
				return result;
			}
		}
		return this.css.apply(this,arguments);
	}//css end
};

/*simulateSelect*/
function SimulateSelect(obj){
	this.id = obj;
	this.elem = document.getElementById(this.id);
	this.valueBox = this.elem.getElementsByTagName('div')[0];
	this.btn = this.valueBox.getElementsByTagName('span')[0];
	this.list = this.elem.getElementsByTagName('ul')[0];
	this.lists = this.elem.getElementsByTagName('ul')[0].getElementsByTagName('li');
	this.init();
}
SimulateSelect.prototype = {
	constructor:SimulateSelect,
	init: function(){
		var elem = this.elem;
		var valueBox = this.valueBox;
		var lists = this.lists;
		var list = this.list;
		var that = this;
		var nowList;
		var btn = this.btn;
		var links = this.list.getElementsByTagName('a');
		/*		for(var k = 0,klen = links.length; k < klen -1; k++){
		 EventUtil.addHandler(links[k],'click',function(e){
		 var e = EventUtil.getEvent(e);
		 EventUtil.preventDefault(e);
		 });

		 }*/
		EventUtil.addHandler(btn,'click',function(e){
			that.toggle(list);
			var e = EventUtil.getEvent(e);
			EventUtil.stopPropagation(e);
		});
		for(var i = 0,len = lists.length; i < len; i++){
			lists[i].index = i
			EventUtil.addHandler(lists[i],'click',function(){
				var text = this.children[0];
				var href = this.getElementsByTagName('a')[0].href;
				while(text.children[0]){
					text = text.children[0]
				}
				text = text.firstChild.nodeValue;
				that.valueBox.children[0].innerHTML = text;
				that.valueBox.children[0].href = href;
				this.className = 'simulateSelect-listNow';
				nowList = this;
				this.parentNode.style.display = 'none';
				for(var j = 0; j <len; j++){
					if(nowList != lists[j]){
						lists[j].className = '';
					}
				}
			})
		}
		EventUtil.addHandler(elem,'mouseout',function(e){
			var e = EventUtil.getEvent(e);
			var rel = EventUtil.getRelatedTarget(e);
			var par = rel;
			while(par && par!= elem){
				par = par.parentNode;
			}
			if(par){
				return;
			}
			that.list.style.display = 'none';
		});
	},
	toggle:function(obj){
		var ax = (EventUtil.css(obj,'display') == 'none' ) ? 'block' : 'none';
		obj.style.display = ax;
	}
};
/**/
var model = {
    "hq":{"a":"32.54%","b":'21.14%',"body":[
        {"c1":"成交","c2":"11.79","c3":"现手","c4":"1927"},
        {"c1":"成交","c2":"11.79","c3":"&nbsp;","c4":"1927"},
        {"c1":"成交","c2":"11.79","c3":"&nbsp;","c4":"1927"},
        {"c1":"成交","c2":"11.79","c3":"现手","c4":"1927"},
        {"c1":"成交","c2":"11.79","c3":"现手","c4":"1927"},
        {"c1":"成交","c2":"11.79","c3":"现手","c4":"1927"},
        {"c1":"成交","c2":"11.79","c3":"现手","c4":"1927"},
        {"c1":"成交","c2":"11.79","c3":"现手","c4":"1927"},
        {"c1":"成交","c2":"11.79","c3":"现手","c4":"1927"},
        {"c1":"成交","c2":"11.79","c3":"现手","c4":"1927"},
        {"c1":"成交","c2":"11.79","c3":"现手","c4":"1927"}
    ]},
    "mx":{
        "success":true,
        data:[
            {"c1":"15：00：04","c2":"9.02","c3":"images/theyuan.png","c4":"2492"},
            {"c1":"15：00：04","c2":"9.02","c3":"images/theyuan.png","c4":"2492"},
            {"c1":"15：00：04","c2":"9.02","c3":"images/theyuan.png","c4":"2492"},
            {"c1":"15：00：04","c2":"9.02","c3":"","c4":"2492"},
            {"c1":"15：00：04","c2":"9.02","c3":"","c4":"2492"}
        ]
    },
    "dd":{},
    "fj":{},
    "bk":{},
    "fs":{}
};
var cons = {
    init:function(){
    },
    viewHq:function(){},
    viewMx:function(){},
    viewDd:function(){},
    viewBk:function(){},
    viewFs:function(){}
}

