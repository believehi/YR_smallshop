var webUrl = "http://hgshop.02.t1m.cn/yiru/hshop/";


(function($, app){
	//打开新窗口
	app.openVW = function(id, extras, New) {
		New = New || false;
		$.openWindow({
			id: id,
			url: id,
			extras: extras,
			createNew: New,
			show: {
				autoShow: true,
				aniShow: 'pop-in',
				duration: 300
			},
			waiting: {
				autoShow: false
			}
		});
	};
	
	app.deviceId = function() {
		var uuid = plus.device.uuid;
		return uuid;
	};
	app.getuserinfo = function() {
		var stateText = localStorage.getItem('$sh_userinfo') || "{}";
		return JSON.parse(stateText);
	};
	app.setuserinfo = function(state) {
		state = state || {};
		localStorage.setItem('$sh_userinfo', JSON.stringify(state));
	};
	app.logout = function() {
		localStorage.setItem('$sh_userinfo', "{}");
	};
	app.isLogin = function() {
		var userState = JSON.parse(localStorage.getItem('$sh_userinfo') || "{}");
		if (userState.userId && userState.userId != '' && userState != {}) {
			return true;
		} else {
			return false;
		}
	};
	app.UserLogin = function() {
		if (!app.isLogin()) {
			mui.toast("登录已过期");
			YiRu.openVW('/pages/login/login.html');
			return;
		};
	}
	
	app.checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};
	app.checkCntxt = function(txt) {
		if (txt.length == 0) return true;
		var reg = new RegExp("[\\u4E00-\\u9FFF-a-zA-Z]+", "g");
		return reg.test(txt);
	};
	
	app.checkNick = function(txt) {
		if (txt.length == 0 || txt.length > 12) {
			return false;
		}
		var reg = new RegExp("[\\u4E00-\\u9FFF-_A-Za-z0-9\.\@\#]+", "g");
		if (reg.test(txt)) {
			return true;
		}
		return false;
	};
	
	app.checkPhone = function(phone) {
		phone = phone || '';
		var reg = /^0?(13|15|18|16|14|17|19)[0-9]{9}$/;
		return (reg.test(phone));
	};
	
	app.checkCard = function(card) {
		card = card || '';
		var reg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
		return (reg.test(card));
	};
	
	app.checkNumber = function(Number) {
		if (Number === "" || Number == null) {
			return false;
		}
		if (!isNaN(Number)) {
			return true;
		}
		return false;
	};
	
	//判断是否是ios
	app.ios = function() {
		if (plus.os.name.toLocaleLowerCase() == 'ios') {
			return true;
		} else {
			return false;
		}
	};
	//关闭除指定webview之外的所有webview,current位null则关闭所有
	app.closeAllwebview = function(current) {
		setTimeout(function() {
			var all = plus.webview.all();
			for (var i = 0, len = all.length; i < len; i++) {
				if (current != null) {
					if (all[i].id !== current) {
						plus.webview.close(all[i], "none");
						//all[i].close();
					}
				} else {
					plus.webview.close(all[i], "none");
					//all[i].close();
				}
			}
		}, 300);
	};
	app.viewstyle = function() {
		var _style = {
			//scrollIndicator: 'none',
			//bounce: 'vertical',
			//bounceBackground: '#ffffff'
		};
		return _style;
	};
	// 发送请求
	app.getajax = function(path, callback, dataitem, mask, modth, cache) {
		// path地址 callback回调 dataitem（data参数） mask加载中 modth请求方式  cache
		// console.log("请求参数：" + JSON.stringify(app.PostData(dataitem)))
		cache = cache || {};
		if (cache.key) {
			var cachedata = plus.storage.getItem(path + cache.key);
			if (cachedata != null && cachedata != 'null' && cachedata) {
				var cachejson = JSON.parse(cachedata);
				if (app.TimeDifference(new Date(cachejson.time), new Date()) < cache.num) {
					if (mask) {
						mask.close();
					}
					return callback(cachejson.data);
				}
			}
		}
		mui.ajax(webUrl + path, {
			data: app.PostData(dataitem),
			dataType: 'json',
			type: modth || 'post',
			timeout: 10000,
			success: function(data) {
				// console.log(JSON.stringify(app.PostData(dataitem)))
				// console.log(JSON.stringify(data));
				if (mask) {
					mask.close();
				}
				if (data.code == 410) {
					app.logout();
					app.openVW("/pages/login/login.html");
					setTimeout(function() {
						YiRu.closeAllwebview("/pages/login/login.html");
					}, 300);
					return;
				}
				if (data.code == 200) {
					if (cache.key) {
						plus.storage.setItem(path + cache.key, JSON.stringify({
							data: data,
							time: new Date()
						}));
					}
					return callback(data);
				} else {
					mui.toast(data.info);
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				// mui.toast('网络不给力，请检查网络！');
				if (mask) {
					mask.close();
				}
			}
		});
	};
	//重写退出应用
	app.quitApp = function() {
		$.oldBack = mui.back;
		var backButtonPress = 0;
		$.back = function(event) {
			backButtonPress++;
			if (backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出');
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
	};
	// 加载中...
	app.WaitingStyle = function(s) {
		var _s = {
			color: "#ffffff",
			size: "14px",
			padding: "20px",
			background: "rgba(0,0,0,.5)",
			loading: {
				type: "snow"
			}
		};
		if (s) _s.push(s);
		return _s;
	};
	// 对象转化string
	app.PostData = function(oldData) {
		var post = {};
		post.token = app.getuserinfo().token;
		post.loginMark = app.deviceId();
		if (app.isJsonFormat(oldData)) {
			post.data = JSON.stringify(oldData || {});
		} else {
			post.data = oldData;
		}
		return post;
	};
	app.isJsonFormat = function(str) {
		var obj = str;
		var xy = Object.prototype.toString.call(obj);
		if (xy == "[object Object]" || xy == "[object Array]") {
			return true;
		} else {
			return false;
		}
	};
	// 判断本地有登录信息，没有则跳转到login页面
	app.isUserinfo = function (isui) {
		// console.log(JSON.stringify(isui))
		if(JSON.stringify(isui) == "{}" || isui == null) {
			YiRu.openVW('/pages/login/login.html');
			app.closeAllwebview('/pages/login/login.html')
			mui.toast("登录信息已过期！")
			return false;
		} else {
			return true;
		}
	} 
}(mui, window.YiRu = {}))
