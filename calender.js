var Calender = function(){
	var weekArr = ['日', '一', '二', '三', '四', '五', '六'];
	var now = new Date();
	var config = {
		boxId : '',
		clickFunction : function(date){return; alert(date);}
	};

	var cache = {
		btnMonthPrev: {},
		btnMonthNext: {},
		btnYearPrev: {},
		btnYearNext: {}
	}
	
	//帮助函数，将个位数补全两位
	formatToDoubleDigit = function(n){
		if (n<10){
			n = "0" + n;
		} else{
			n ="" + n;
		}
		return n;
	}

	//帮助函数，将日期字符串转化成数组（20120908 | 2012, 9, 8）
	dateStrToObj = function(dateStr){
		var dateStr = dateStr+'', dateArr =[];
		var year,month,day;
		if (dateStr.length === 8 && /\d{8}/.test(dateStr)){
			year = parseInt(dateStr.slice(0,4), 10);
			month = parseInt(dateStr.slice(4,6), 10);
			day = parseInt(dateStr.slice(-2), 10);
			dateArr = [year, month, day];
		} else if(dateStr.indexOf(',') !== -1){
			dateArr = dateStr.split(',', 3);
			var arrLength = dateArr.length;
			$.each(arrLength, function(n,el){
				if (isNaN(parseInt(el))){
					alert("please input valid dete! \n Just like \"20120901\" or \"2012,9,1\"");
					return false;
				}
			})
			if (arrLength === 2){
				dateArr.unshift(now.getFullYear());
			}
		}
		return dateArr;
	}

	var calenderObj = {};
	calenderObj = {
		init: function(customConfig){
			$.extend(true, config, customConfig);
			this.createDOM();
		},
		//初始化时创建日历的DOM节点
		createDOM: function(){
			var htmlCont = '<div class="calenderTop">' +
							'<a href="javascript:;" class="yearPrev">&lt;&lt;</a><a href="javascript:;" class="monthPrev">&lt;</a>' +
							'<a href="javascript:;" class="monthNext">&gt;</a><a href="javascript:;" class="yearNext">&gt;&gt;</a><span class="monthShow"></span>' +
							'</div>' +
							'<dl class="dateBox">' +
								'<dt class="dateTitle"></dt>' +
								'<dd class="dateCont"></dd>' +
							'</dl>';
			$('#' + config.boxId).append(htmlCont);
			cache.btnMonthPrev = $('#' + config.boxId + ' .monthPrev');
			cache.btnMonthNext = $('#' + config.boxId + ' .monthNext');
			cache.btnYearPrev = $('#' + config.boxId + ' .yearPrev');
			cache.btnYearNext = $('#' + config.boxId + ' .yearNext');
			this.getDateList();
		},

		//根据年份、月份获取日历内容
		getDateList: function(currYear, currMonth) {
			var currYear = currYear || now.getFullYear();
			var currMonth = currMonth || now.getMonth() + 1;
			var maxDay = new Date(currYear, currMonth, 0);
			var nowMonthLong = maxDay.getDate();

			var str = "";
			var strCont = "";

			var startDay = new Date(currYear, currMonth - 1, 1);
			var startWeek = parseInt(startDay.getDay());
			for (i = 0; i < 7; i++) {
				str += '<span>' + weekArr[i] + '</span>';
			}
			for (j = -startWeek + 1; j <= nowMonthLong; j++) {
				if (j <= 0) {
					strCont += '<span class="noCont">&nbsp;</span>';
				} else {
					currMonthTxt = formatToDoubleDigit(currMonth);
					currDayTxt =  formatToDoubleDigit(j);
					strCont += '<span>' + j + '</span>';
				}
			}

			$('#' + config.boxId + ' .dateTitle').html(str);
			$('#' + config.boxId + ' .dateCont').html(strCont);

			cache.btnMonthPrev.unbind("click");
			cache.btnMonthNext.unbind("click");
			cache.btnYearPrev.unbind("click");
			cache.btnYearNext.unbind("click");
			this.updateShow(currYear, currMonth);
		},
		
		//添加附加显示
		updateShow: function(currYear, currMonth) {
			var that = this;
			var nowYear = now.getFullYear();
			var nowMonth = now.getMonth() + 1;
			var dateEle = $('#' + config.boxId + ' .dateCont span').not('.noCont');
			var datePrefix = formatToDoubleDigit(currYear) + formatToDoubleDigit(currMonth);

			//显示前一个月
			var showPrevMonth= function(ev){
				if (ev.data.currMonth > 1) {
				that.getDateList(ev.data.currYear, ev.data.currMonth - 1);
				} else {
				that.getDateList(ev.data.currYear - 1, 12);
				}
				return false;
			}
			//显示后一个月
			var showNextMonth= function(ev){
				if (ev.data.currMonth < 12) {
				that.getDateList(ev.data.currYear, ev.data.currMonth + 1);
				} else {
				that.getDateList(ev.data.currYear + 1, 1);
				}
				return false;
			}
			//显示前一年
			var showPrevYear= function(ev){
				that.getDateList(ev.data.currYear-1, ev.data.currMonth);
				return false;
			}
			//显示后一年
			var showNextYear= function(ev){
				that.getDateList(ev.data.currYear+1, ev.data.currMonth);
				return false;
			}
			
			$('#' + config.boxId + ' .monthShow').html(currMonth + "月 " + currYear);
			dateEle.eq(0).attr('data-date-prefix', datePrefix);

			// 设置当天样式
			if (nowYear == currYear && nowMonth == currMonth) {
				var nowDate = now.getDate();
				dateEle.filter(':contains(' + nowDate + ')').eq(0).attr("class", "nowDate");
			}

			// 设置特殊日期的样式
			if(config.specialDate != undefined){
				$.each(config.specialDate, function(i, currObj){
					var dateArr = dateStrToObj(currObj.date);
					var matchEle;
					if(parseInt(dateArr[0], 10) == currYear && parseInt(dateArr[1], 10) == currMonth){
						matchEle = dateEle.filter(':contains(' + parseInt(dateArr[2]) + ')').eq(0);
						matchEle.addClass("dateActive");
						matchEle.data("description", currObj.description);
					}
					
				})
			}

			//设置hover效果
			dateEle.bind('mouseenter', {date : datePrefix}, function(ev){
				$(this).addClass('dateHover');
				$(this).attr('title', ev.data.date + formatToDoubleDigit($(this).text()));
			});
			dateEle.bind('mouseleave', {date : datePrefix}, function(ev){
				dateEle.removeClass('dateHover');
				if ($(this).attr('class') === ""){
					$(this).removeAttr('class');
				}
			});

			//绑定click事件
			dateEle.bind('click', {datePrefix : datePrefix}, function(ev){
				var date = ev.data.datePrefix + formatToDoubleDigit($(this).text());
				dateEle.removeClass('dateCurr');
				if ($(this).attr('class') === ""){
					$(this).removeAttr('class');
				}
				$(this).addClass('dateCurr');
				config.clickFunction(date, ev);
			});

			//绑定月份切换按钮
			cache.btnMonthPrev.bind('click',{currYear: currYear, currMonth: currMonth}, showPrevMonth);
			cache.btnMonthNext.bind('click',{currYear: currYear, currMonth: currMonth}, showNextMonth);
			//绑定年份切换按钮
			cache.btnYearPrev.bind('click',{currYear: currYear, currMonth: currMonth}, showPrevYear);
			cache.btnYearNext.bind('click',{currYear: currYear, currMonth: currMonth}, showNextYear);
		}

	}
	return calenderObj;
}