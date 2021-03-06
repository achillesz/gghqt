var hxSuggest =  function(inputObj,url,options) {
    this.input = hxSuggest.util.$(inputObj);
    this.url = url;
    this.setDefault(options);
    this.gaper = this.options.gaper;
    this.maxRow = this.options.maxRow;
    this.scriptId = this.options.scriptId;
    this.contrainer = this.options.contrainer;
    //检索计时器
    this.timer = null;
    //DOM缓存
    this.fragment = document.createDocumentFragment();
    //记录旧值
    this.oldValue = hxSuggest.util.trim(this.input.value).toUpperCase();
    //定义键盘事件步数
    this.step = 0;
    //初始化悬浮面板
    this.drawPanel();
    //提交的值
    this.temp = '';
    this.defaultData =  [{code:'113003',name:"重工转债",short:'ZGZZ',type:'沪市', stocktype:'5', market:2},
        {code:'113002',name:"工行转债",short:'GHZZ',type:'沪市', stocktype:'5', market:2}]
}

//原型类
hxSuggest.prototype = {
    //设定默认值
    setDefault:function(options){
        this.options = {
            //查找间隙
            gaper:100,
            //最大显示条数
            maxRow:10,
            //加载script的固定ID标示
            scriptId:'hxSuggest_ids',
            //加载容器
            contrainer:document.body
        };
        hxSuggest.util.Extend(this.options,options||{});
    },
    //绘制悬浮面板
    drawPanel:function(){
        //存放内容
        this.conPanel = document.createElement('div');
        this.conPanel.className = 'searchPanel';
        hxSuggest.util.css(this.conPanel,{
            border:'1px solid #9A9B9D',
            width:'202px',
            background:'#FFF',
            position:'absolute',
            display:'none',
            zIndex:'999'
        });
        //存放阴影
        this.shadePanel = document.createElement('div');
        hxSuggest.util.css(this.shadePanel,{
            width:'204px',
            background:'#8D8D8D',
            position:'absolute',
            opacity:'0.6',
            display:'none',
            zIndex:'998'
        });
        //存放iframe隔离层
        this.framePanel = document.createElement('iframe');
        hxSuggest.util.css(this.framePanel,{
            width:'207px',
            position:'absolute',
            opacity:'0',
            display:'none',
            zIndex:'997'
        });
        this.fragment.appendChild(this.framePanel);
        this.fragment.appendChild(this.shadePanel);
        this.fragment.appendChild(this.conPanel);
        this.contrainer.appendChild(this.fragment);
        this.addEvent();
    },
    //绑定事件
    addEvent:function(){
        var _this = this;
        this.input.onfocus = (function() {
            return function() {
                var value = hxSuggest.util.trim(_this.input.value);
                if(value == '请输入指数/股票') _this.input.value = '';
                _this.openSearch();
            }
        })();
        this.input.onblur = (function(){
            return function() {
                clearInterval(_this.timer);
                _this.oldValue = '';
                _this.step = 0;
                if(_this.temp!='') {
                    _this.input.value = _this.temp;
                    document.getElementById('compare').className = 'search-sub1 fl';
                }
                else{
                    document.getElementById('compare').className = 'search-sub fl';
                }
                _this.hide();
            }
        })();
        //绑定键盘事件
        hxSuggest.util.bind(document,'keydown',function(e){
            _this.keyEvent(e);
        });
    },
    //开启检索
    openSearch:function() {
        var _this = this;
        this.timer = setInterval(function(){
            var value = hxSuggest.util.trim(_this.input.value).toUpperCase();
            if(value!='' && value!=_this.oldValue) {
                _this.oldValue = value;
                _this.returnValue(value);
            }
            if(value=='') {
                _this.oldValue = value;
                _this.conPanel.innerHTML = '';
                _this.setValue(_this.defaultData);
                //   _this.returnValue(value);
                //_this.hide();
            }
        },this.gaper);
    },
    //隐藏面板
    hide:function() {
        this.conPanel.style.display = 'none';
        this.shadePanel.style.display = 'none';
        this.framePanel.style.display = 'none';
    },
    //显示面板
    show:function() {
        if(this.conPanel.style.display == 'none') {
            this.conPanel.style.display = '';
            this.shadePanel.style.display = '';
            this.framePanel.style.display = '';
        }
        var t = hxSuggest.util.top(this.input)+hxSuggest.util.height(this.input);
        var l = hxSuggest.util.left(this.input);
        var h = hxSuggest.util.height(this.conPanel);
        hxSuggest.util.top(this.conPanel,t);
        hxSuggest.util.left(this.conPanel,l);

        hxSuggest.util.top(this.shadePanel,t+2);
        hxSuggest.util.left(this.shadePanel,l+2);
        hxSuggest.util.height(this.shadePanel,h);

        hxSuggest.util.top(this.framePanel,t);
        hxSuggest.util.left(this.framePanel,l);
        hxSuggest.util.height(this.framePanel,h);
    },
    //获取值
    returnValue:function(value) {
        if(hxSuggest.util.$(this.scriptId) && hxSuggest.util.$(this.scriptId)!=null) {
            var obj = hxSuggest.util.$(this.scriptId);
            obj.parentNode.removeChild(obj);
        }
        //包装url
        var _this = this;
        var url = this.url+"?key="+value;
        hxSuggest.util.loadScript(url,this.scriptId,function(){

            if(hxSuggest_JsonData && hxSuggest.util.isArray(hxSuggest_JsonData)) {
                _this.conPanel.innerHTML = '';
                _this.setValue(hxSuggest_JsonData);
            }
            else {
                _this.hide();
            }
        });
    },
    //加载内容
    setValue:function(d) {
        var str = '<table cellpadding="0" cellspacing="0" width="100%" style="font-size:12px;font-family:宋体; cursor:default;">';
        if(d.length==0) {
            document.getElementById('compare').className = 'search-sub fl';
            str += '<tr><td style="padding:5px 0 5px 8px;">没有可匹配的股票名称或代码</td></tr>';
            this.temp = '';
        }
        else {
            var len = Math.min(d.length,this.maxRow);
            for(var i=0;i<len;i++) {
                if(i==0) str+='<tr style="background:#ECECEC">';
                else str+='<tr style="background:">';
                str+='<td style="padding:5px 0 5px 10px;">'+this.redDeal(d[i].code)+'</td>';
                if(d[i].name.length>5) str+='<td><span title="'+d[i].name+'">'+this.redDeal(d[i].name.substr(0,5))+'</span></td>';
                else str+='<td>'+this.redDeal(d[i].name)+'</td>';
                str+='<td>'+this.redDeal(d[i].short)+'</td>';
                str+='<td style="color:#858585;">'+d[i].type+'</td>';
                str+='</tr>';
            }
        }
        str+='</table>';
        this.conPanel.innerHTML = str;
        //绑定鼠标over事件
        if(d.length>0) {
            var trlist = this.conPanel.getElementsByTagName('tr');
            this.step = 0;
            this.temp = hxSuggest.util.text(trlist[0].getElementsByTagName('td')[0]);
            var len = trlist.length;
            var _this = this;
            for(var i=0;i<len;i++) {
                trlist[i].onmouseover = (function(i){
                    return function() {
                        _this.selectRow(i);
                    }
                })(i);
            }
        }
        this.show();
    },
    //选中数据行
    selectRow:function(i){
        var trlist = this.conPanel.getElementsByTagName('tr');
        var len = trlist.length;
        for(var j=0;j<len;j++) {
            if(i==j) {
                trlist[j].style.background = '#ECECEC';
                this.step = j;
                this.temp = hxSuggest.util.text(trlist[i].getElementsByTagName('td')[0]);
            }
            else {
                trlist[j].style.background='';
            }
        }
    },
    //键盘事件
    keyEvent:function(e) {
        var e = e?e:window.event;
        if(typeof this.conPanel =='undefined' &&  this.conPanel.display == 'none') return;
        if(e.keyCode == 38) {
            //向上
            var len = this.conPanel.getElementsByTagName('tr').length;
            if(len>1) {
                this.step = (this.step==0)?(len-1):(this.step-1);
                this.selectRow(this.step);
            }
        }
        if(e.keyCode == 40) {
            //向下
            var len = this.conPanel.getElementsByTagName('tr').length;
            if(len>1) {
                this.step = (this.step==len-1)?0:(this.step+1);
                this.selectRow(this.step);
            }
        }
        if(e.keyCode == 13 && document.activeElement == this.input) {
            alert(this.temp);
        }
    },
    //标红处理
    redDeal:function(str) {
        var key = hxSuggest.util.trim(this.input.value).toUpperCase();
        str = str.replace(key,'<span style="color:#FF0000">'+key+'</span>');
        return str;
    }
};



//工具类
hxSuggest.util = {
    //取元素
    $:function(element) {
        var el;
        if(typeof element == 'string') el = document.getElementById(element);
        else el = element;
        if(!el) return null;
        else return el;
    },
    //扩展
    Extend:function(destination,source) {
        for (var property in source) {
            destination[property] = source[property];
        }
    },
    //去除空白字符
    trim:function(str){
        return str.replace(/^\s+|\s+$/g,'');
    },
    //转为驼峰型
    camelCase:function(str){
        return str.replace(/-\D/g, function(match){
            return match.charAt(1).toUpperCase();
        });
    },
    //判断一个对象是否为数组
    isArray:function(value) {
        return Object.prototype.toString.apply(value) === '[object Array]';
    },
    //定位
    pos:function(el) {
        if(el.parentNode === null || el.style.display == 'none') return false;
        var parent = null,pos = [],box;
        if (el.getBoundingClientRect) {
            box = el.getBoundingClientRect();
            var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
            return {
                x: box.left + scrollLeft,
                y: box.top + scrollTop
            };
        }
        else
        if (document.getBoxObjectFor) {
            box = document.getBoxObjectFor(el);
            var borderLeft = (el.style.borderLeftWidth) ? parseInt(el.style.borderLeftWidth) : 0;
            var borderTop = (el.style.borderTopWidth) ? parseInt(el.style.borderTopWidth) : 0;
            pos = [box.x - borderLeft, box.y - borderTop];
        }
        else {
            pos = [el.offsetLeft, el.offsetTop];
            parent = el.offsetParent;
            if (parent != el) {
                while (parent) {
                    pos[0] += parent.offsetLeft;
                    pos[1] += parent.offsetTop;
                    parent = parent.offsetParent;
                }
            }
            if(!window.opera || (navigator.userAgent.indexOf('Safari') < 0 && e.style.position == 'absolute')) {
                pos[0]-= document.body.offsetLeft;
                pos[1]-= document.body.offsetTop;
            }
        }
        if(el.parentNode) {
            parent = el.parentNode;
        }
        else {
            parent = null;
        }
        while(parent && parent.tagName.toUpperCase() != 'BODY' && parentName.toUpperCase() !='HTML'){
            pos[0]-=parent.scrollLeft;
            pos[1]-=parent.scrollTop;
            if(parent.parentNode) {
                parent = parent.parentNode;
            }
            else parent = null;
        }
        return {x:pos[0],y:pos[1]};
    },
    //设置、获取元素宽
    width:function(el,value) {
        if(typeof value == 'undefined') {
            return el.offsetWidth;
        }
        else return this.css(el,'width',value+'px');
    },
    //设置、获取元素高
    height:function(el,value) {
        if(typeof value == 'undefined') {
            return el.offsetHeight;
        }
        else return this.css(el,'height',value+'px');
    },
    //设置、获取元素左边距
    left:function(el,value) {
        if(typeof value == 'undefined') {
            return this.pos(el).x;
        }
        else return this.css(el,'left',value+'px');
    },
    //设置、获取元素上边距
    top:function(el,value) {
        if(typeof value == 'undefined') {
            return this.pos(el).y;
        }
        else return this.css(el,'top',value+'px');
    },
    //CSS添加及获取
    css:function(ele,name,value) {
        if(typeof name == 'undefined' && typeof value == 'undefined') {
            return ele.style.cssText;
        }
        else if(typeof name == 'string' && typeof value == 'undefined') {
            if(name=='float') name = (window.ActiveXObject)?'styleFloat':'cssFloat';
            if (name == 'opacity' && window.ActiveXObject && ele.style.filter)
                return parseFloat(ele.style.filter.replace(/alpha\(opacity=/, '').replace(/\)/, '')) / 100;
            else {
                name = this.camelCase(name);
                return ele.style[name];
            }
        }
        else if (typeof name == 'object' && typeof value == 'undefined') {
            var params = name;
            for (var n in params) {
                var param;
                if(n=='float') n = (window.ActiveXObject)?'styleFloat':'cssFloat';
                if (n == 'opacity' && window.ActiveXObject) {
                    ele.style.filter = 'alpha(opacity=' + parseInt(parseFloat(params[n]) * 100) + ')';
                }
                else {
                    param = this.camelCase(n);
                    ele.style[param] = params[n];
                }
            }
        }
        else
        if (typeof name == 'string' && typeof value != 'undefined') {
            if(name=='float') name = (window.ActiveXObject)?'styleFloat':'cssFloat';
            if (name == 'opacity' && window.ActiveXObject)
                ele.style.filter = 'alpha(opacity=' + parseInt(parseFloat(value) * 100) + ')';
            else {
                name = this.camelCase(name);
                ele.style[name] = value;
            }
        }
    },
    //动态加载script
    loadScript:function(url,id,callback) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        if(id!='') script.id= id;
        if(script.readyState) {
            script.onreadystatechange = function() {
                if(script.readyState == 'loaded' || script.readyState == 'complete') {
                    callback();
                }
            }
        }
        else {
            script.onload = function() {callback();};
        }
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    },
    //事件绑定
    bind:function(ele,name,fn) {
        if(ele.attachEvent) {
            ele['e'+name+fn] = fn;
            ele[name+fn] = function() {
                ele['e'+name+fn](window.event);
            }
            ele.attachEvent('on'+name,ele[name+fn]);
        }
        else ele.addEventListener(name,fn,false);
    },
    //事件解绑
    unbind:function(ele,name,fn){
        if(ele.detachEvent) {
            ele.detachEvent('on'+name,ele[name+fn]);
            ele[name+fn] = null;
        }
        else ele.removeEventListener(name,fn,false);
    },
    //属性添加
    prop:function(ele,name, value) {
        if (typeof(value) == 'undefined' && ele[name]) {
            return ele[name];
        } else {
            ele[name] = value;
        }
    },
    //文本节点赋值
    text:function(ele,value) {
        return this.prop(ele,typeof ele.innerText != 'undefined' ? 'innerText' : 'textContent', value);
    }
};
