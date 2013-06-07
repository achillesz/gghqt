

function tab(name,cursel,n){
	for(var i=1;i<=n;i++){
		var menu=document.getElementById(name+i);
		var con=document.getElementById("con_"+name+"_"+i);
		//menu.className=i==cursel?"s":"";
		con.style.display=i==cursel?"block":"none";
	}
}
//iframe
function setIframe(i,e,h,f){
	var i = document.getElementById(i);
	i.src = e;
	i.style.display = "block";
	i.style.height = h + "px";
	//i.onload = function(){ alert($(this).contents().find("body").height())}
	document.getElementById(f).style.display = "none";
}
function reIframe(i,f){
	document.getElementById(i).style.display = "none";
	document.getElementById(f).style.display = "block";
}

//截取url,获取肌票代码
//var strurl = (window.location.href).split("/");
//var indexcode = strurl[4].split(".")[0];
var indexcode = hqxx_code;

//操作对象
var zsg  = document.getElementById("zs_stock_topbn");
var yx   = $(".yx ul");
var userA = document.getElementById("hexunMember_isloginedSetup_span_display_username");

//时间戳
var time = new Date().getTime();

function toDecimal(x) {
	var f = parseFloat(x);  
	if (isNaN(f)){  
		return;  
	}  
	f = Math.round(x*100)/100;  
	return f;  
}
function toDecimal2(x) {  
	var f = parseFloat(x);
	if (isNaN(f)){
		return false;
	}  
	var f = Math.round(x*100)/100;
	var s = f.toString();
	var rs = s.indexOf('.'); 
	if (rs < 0){
		rs = s.length;
		s += '.';
	}
	while (s.length <= rs + 2){
		s += '0';  
	}
	return s;
}
function getCurrentDate(){
	var day = new Date();
	var Year = 0;
	var Month = 0;
	var Day = 0;
	var CurrentDate = "";
	Year  = day.getUTCFullYear();
	Month = day.getUTCMonth()+1;
	Day   = day.getDate();
	CurrentDate += Year + "-";
	if (Month >= 10 ){
		CurrentDate += Month + "-";
	}else{
		CurrentDate += "0" + Month + "-";
	}
	if (Day >= 10 ){
		CurrentDate += Day;
	}else{
		CurrentDate += "0" + Day;
	}
	return CurrentDate;
}

//交易日
function trading(){
	var tagDate = new Date();
	var tagDay  = tagDate.getDay(); 
	var tagHour = tagDate.getHours();
	var tagMin  = tagDate.getMinutes(); 
	if(tagDay !=6 && tagDay !=0){
		if (tagHour >=9 && tagHour <15){
			if (tagHour ==9 && tagMin <15){
				$("#q_state").html("未交易");
			}else	if(tagHour ==11 && tagMin >30 || tagHour ==12){
				$("#q_state").html("午间休市");
			}else{
				$("#q_state").html("交易中");
				//定时刷新及请求股票数据
				setInterval("hqxxData('" + hqxx_code + "')",6000);
				setInterval("xgzqData('" + xgzq_Hcode + "','" + xgzq_Acode + "')",6000);
			}
		}
	}
}

//交易状态
function tradingState(){
	$.ajax({ 
	  type: "GET",
	  url: "http://webstock.quote.hermes.hexun.com/a/secu_ex",
	  dataType: "jsonp",
	  success : function(data){
			var hostDate = (data.TradeDateTime[0][0].split(" "))[0];
			var localDate = getCurrentDate();
			if (hostDate == localDate){
				trading();
			}else{
				$("#q_state").html("未交易");
			}
		}	
	}); 
}


//行情信息 请求数据
function hqxxData(hqxx_code){
	$.ajax({
	  type: "GET",
	  url: "http://webstock.quote.hermes.hexun.com/gb/a/quotelist",
		data: {code:hqxx_code},
	  dataType: "jsonp",
	  success : function(data){
			$("#q_sname").html("<a href='http://stockdata.stock.hexun.com/"+data.Data[0][0][0]+".shtml'>"+data.Data[0][0][1]+"</a>");
			$("#q_scode").html(data.Data[0][0][0]);
			$("#q_current").html(toDecimal2(data.Data[0][0][3]/100,2));
			$("#q_updownprice").html(data.Data[0][0][27]/100);
			$("#q_upDownRate").html("(" + data.Data[0][0][28]/100 + "%)");
			$("#q_time").html(data.Data[0][0][2].toString().replace(/\d{2}/g,function(o,i){return o+[""," ","-"," ",":",":",""][i/2]}));
			if (data.Data[0][0][28] > 0){
				$("#q_current").attr("class","red");
				$("#q_updownprice").attr("class","red");
				$("#q_upDownRate").attr("class","red");
			} else if (data.Data[0][0][28] < 0){
				$("#q_current").attr("class","green");
				$("#q_updownprice").attr("class","green");
				$("#q_upDownRate").attr("class","green");
			} else if (data.Data[0][0][28] == 0){
				$("#q_current").attr("class","black");
				$("#q_updownprice").attr("class","black");
				$("#q_upDownRate").attr("class","black");
			}
			$("#q_zg").html(toDecimal2(data.Data[0][0][12]/100,2));
			$("#q_zs").html(toDecimal2(data.Data[0][0][10]/100,2));
			$("#q_zt").html(toDecimal2(data.Data[0][0][10]/100*1.1,2));
			$("#q_cjl").html(data.Data[0][0][5]/100);
			$("#q_wp").html(data.Data[0][0][9]/100);
			$("#q_zsz").html(toDecimal(data.Data[0][0][24]/10000000000,2) + "亿");
			$("#q_zd").html(toDecimal2(data.Data[0][0][13]/100,2));
			$("#q_jk").html(toDecimal2(data.Data[0][0][11]/100,2));
			$("#q_dt").html(toDecimal2(((data.Data[0][0][10]/100)*0.9),2));
			$("#q_cje").html(toDecimal(data.Data[0][0][4]/10000,2) + "万");
			$("#q_np").html(data.Data[0][0][8]/100);
			$("#q_syl").html(data.Data[0][0][19]/100);
			$("#q_hs").html(toDecimal2(data.Data[0][0][34]/100,2) + "%");
			$("#q_lb").html(data.Data[0][0][26]/100);
			$("#q_zf").html(toDecimal2(data.Data[0][0][29]/100,2) + "%");
			$("#q_wb").html(toDecimal2(data.Data[0][0][31]/100,2) + "%");
			$("#q_sjl").html(data.Data[0][0][36]/100);
		}	
	}); 
};

//相关证券 请求数据
function xgzqData(xgzq_Hcode,xgzq_Acode){
	$('#xgzq_data1,#xgzq_data2').html("");
	var xgzqhtml1 = '';
	var xgzqhtml2 = '';
	
	//港股
	$.ajax({ 
	  type: "GET",
	  url: "http://webstock.quote.hermes.hexun.com/gb/hk/quotelist_col",
		data: "code="+ xgzq_Hcode +"&col=Code,Name,IncreaseRatio",
	  dataType: "jsonp",
	  success : function(data){
			$.each(data.Data, function(i,Data){
				if (data.Data[i][2] > 0){
					xgzqhtml1 += '<li class="pr10"><a href="http://hkquote.stock.hexun.com/urwh/hkstock/'+ data.Data[i][0] +'.shtml" target="_blank" class="pr5">'+ data.Data[i][1] + '</a><span class="color_900">' + data.Data[i][2]/100 +'%</span>' + '</li>';
				}else if(data.Data[i][2] < 0) {
					xgzqhtml1 += '<li class="pr10"><a href="http://hkquote.stock.hexun.com/urwh/hkstock/'+ data.Data[i][0] +'.shtml" target="_blank" class="pr5">'+ data.Data[i][1] + '</a><span class="color_090">' + data.Data[i][2]/100 +'%</span>' + '</li>';
				}else{
					xgzqhtml1 += '<li class="pr10"><a href="http://hkquote.stock.hexun.com/urwh/hkstock/'+ data.Data[i][0] +'.shtml" target="_blank" class="pr5">'+ data.Data[i][1] + '</a><span>' + data.Data[i][2]/100 +'%</span>' + '</li>';
				}
			})
			$('#xgzq_data1').html(xgzqhtml1);
		}	
	}); 
	
	//A股
	$.ajax({ 
	  type: "GET",
	  url: "http://webstock.quote.hermes.hexun.com/gb/a/quotelist_col",
		data: "code="+ xgzq_Acode +"&col=Code,Name,IncreaseRatio",
	  dataType: "jsonp",
	  success : function(data){
			$.each(data.Data, function(i,Data){
				if (data.Data[i][2] > 0){
					xgzqhtml2 += '<li class="pr10"><a href="http://hkquote.stock.hexun.com/urwh/hkstock/'+ data.Data[i][0] +'.shtml" target="_blank" class="pr5">'+ data.Data[i][1] + '</a><span class="color_900">' + data.Data[i][2]/100 +'%</span>' + '</li>';
				}else if(data.Data[i][2] < 0){
					xgzqhtml2 += '<li class="pr10"><a href="http://hkquote.stock.hexun.com/urwh/hkstock/'+ data.Data[i][0] +'.shtml" target="_blank" class="pr5">'+ data.Data[i][1] + '</a><span class="color_090">' + data.Data[i][2]/100 +'%</span>' + '</li>';
				}else{
					xgzqhtml2 += '<li class="pr10"><a href="http://hkquote.stock.hexun.com/urwh/hkstock/'+ data.Data[i][0] +'.shtml" target="_blank" class="pr5">'+ data.Data[i][1] + '</a><span>' + data.Data[i][2]/100 +'%</span>' + '</li>';
				}
			})
			$('#xgzq_data2').html(xgzqhtml2);
		}	
	}); 

};

//自选股添加人数 请求数据
function addZsSum(){
	var sum = $(zsg).children("em").text();
	$(zsg).children("em").text(parseInt(sum)+1);
	$(zsg).attr("onclick","addIStock(this)");
	$(zsg).attr("class","zs_stock_bn_off");
}
function zxgData(){
	if (userA){
		$.getJSON('js/data/zxgsum.js?code='+indexcode+'&username='+$(userA).text(), function(data){
			$(zsg).children("em").html(data.sum);
			$(zsg).attr("mtype",data.mtype);
			$.each(data.myzxg, function(i,code){
				if (code == indexcode){
					$(zsg).attr("class","zs_stock_bn_off");
					return false;
				} else {
					$(zsg).attr("onclick","addIStock(this);addZsSum()");
					$(zsg).attr("class","zs_stock_bn_on");
				}
			})
		});
	}
	$.getJSON('js/data/zxgsum.js?code='+indexcode, function(data){
		$(zsg).children("em").html(data.sum);
		$(zsg).attr("mtype",data.mtype);
	});
};

//印象 请求数据
function yxData(){
	$.getJSON('js/data/yinxiang.js?code='+indexcode, function(data){
		var yxhtml = '';
		$.each(data, function(i,yxdata){
			if (i > 8){
				$(yx).css({"height":"87px"});
			}
			if (!userA){
				yxhtml += '<li onclick="addIStock(this)" id="yxid_'+ yxdata['yxid'] +'" title="大幅入流 ' + yxdata['sum'] + ' 赞同" class="c'+ Math.ceil(Math.random()*3) +'">'+ yxdata['yxtxt'] +'</li>';
			}else {
				yxhtml += '<li onclick="addYx(this)" id="yxid_'+ yxdata['yxid'] +'" title="大幅入流 ' + yxdata['sum'] + ' 赞同" class="c'+ Math.ceil(Math.random()*3) +'">'+ yxdata['yxtxt'] +'</li>';
			}
		})
		$(yx).html(yxhtml);
	});
};

//最近访问股
function latelyVisit(){
	var cookieCode=getCookieCode();
	var _this=this;
	$.ajax({
		type:"GET",
		dataType:"jsonp",
		url:"http://webstock.quote.hermes.hexun.com/gb/a/quotelist_col?code=sse601238,sse600004&col=code,name,price,increaseratio",
		success:function(data){
			var _data=data.Data;
			var arr=[];
			arr.push("<colgroup><col width='50%'><col width='18%'><col width='18%'><col width='14%'></colgroup>");
			arr.push("<tbody>");
			for(var i=0;i<_data.length;i++){
				arr.push('<tr>');
				arr.push('<td><a href="http://stockdata.stock.hexun.com/'+_data[i][0]+'.shtml" target="_blank">'+_data[i][1]+'</a></td>');
				arr.push('<td class="tr"><span class="pr10 color_900">'+_data[i][2]+'</span></td>');
				arr.push('<td class="tr"><span class="pr10 color_090">'+_data[i][3]+'</span></td>');
				arr.push('<td class="tc"><a href="http://t.hexun.com/g/'+_data[i][0]+'_1.html" target="_blank"><img src="images/ico2.gif" alt="" /></a></td>');
				arr.push('</tr>');
			}
			arr.push("</tbody>");
			$("#latelyVisit").html(arr.join(''));
		}
	});
}
//最近访问股 获取cookie里边存入的cookie代码
function getCookieCode(){
	var arr=[
		"sse601238",
		"sse600004"
	];
	return arr.join(",");
}


//印象添加
function openyx(obj){
	var msgbox3=document.getElementById("msgbox3");
	msgbox3.style.display="block";
	msgbox3.style.left=getPos(obj).l-msgbox3.offsetWidth+'px';
	msgbox3.style.top=getPos(obj).t+obj.offsetHeight+'px';
}
function addYx(obj){
	var yxid = (obj.id).split("_")[1];
	$.getJSON('js/data/yinxiang_add.js?code='+ indexcode + '&yxid='+ yxid);
	openyx(obj);
	$(obj).attr("onclick","openyx(this)");
}



window.onload= function(){
	//$(zsg).attr("code",hqxx_code.replace(/[^0-9]/ig,""))  //自选股按钮添加code属性值
	hqxxData(hqxx_code);
	xgzqData(xgzq_Hcode,xgzq_Acode);
	zxgData();
	yxData();
	latelyVisit();
	$("#q_mgsy").html("--"); //每股收益
	tradingState();
}

