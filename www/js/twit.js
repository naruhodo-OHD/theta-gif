var twitfnc = function(){
// oauthオブジェクト
var oauth;

localStorage.setItem("loading",0);
firstOAuthFunc();
};
// OAuth関連で最初に行う処理
var firstOAuthFunc = function(){
	var firstoauth = localStorage.getItem("firstoauth");

	if(firstoauth == 1){
		localStorage.setItem("firstoauth",0);
		// 最初にOAuthオブジェクトに喰わせる値たち
		var ck = "QrT8jpso0lFGbfvxKd8gy6ypX";
		var cs = "9vUjT3WahB8ezqjr4aupqanQM6M05gJ0pYEhILMJz1BCblN234";
		var config = {
			consumerKey:ck,
			consumerSecret:cs,
			requestTokenUrl:"https://api.twitter.com/oauth/request_token",
			authorizationUrl:"https://api.twitter.com/oauth/authorize",
			accessTokenUrl:"https://api.twitter.com/oauth/access_token"
		};

		// OAuthのオブジェクトを作成
		oauth = new OAuth(config);

		//保存してあるアクセストークンがあればロードする
		var accessTokenKey = localStorage.getItem("accessTokenKey");
		var accessTokenSecret = localStorage.getItem("accessTokenSecret");
		localStorage.setItem("firstoauth", 1);
		if(accessTokenKey){
			oauth.setAccessToken(accessTokenKey, accessTokenSecret);
		}else{
			// 1. consumer key と consumer secret を使って、リクエストトークンを取得する
			oauth.fetchRequestToken(successFetchRequestToken, failureHandler);
		}

	}else{

		if(window.confirm('Twitterで認証を行ってください')){
			localStorage.setItem("firstoauth", 1);

			firstOAuthFunc();
		}else{
			window.alert('中止されました');
			localStorage.setTimeout("firstoauth", 0);
			return;
		}
	}

};

// 1の処理の成功時のコールバック関数
var successFetchRequestToken = function (authUrl) {
	localStorage.setItem("firstoauth", 0);
	//URLを訂正
	var tmp = authUrl.indexOf("&");
	var authUrl2 = authUrl.substring(0,tmp);


	// 2. リクエストトークンを使い、ユーザにアクセス許可を求めるURLを生成して ブラウザを起動
	// 3. ブラウザで認証を行い、ユーザーにPINが表示される
	window.open(authUrl2, "");
	// 4. アプリで用意したダイアログにPIN を入力してもらう
	timerID = setInterval(function(){
                         if(document.getElementById("pin_str").value.length >= 7){
                         nextpin();
                         clearInterval(timerID);
                         timerID = null;
                         }
                      }, 1000)
	var nextpin = function(){
	var pin = document.getElementById("pin_str").value;
	// oauthオブジェクトにPINをセット
	oauth.setVerifier(pin);
	localStorage.setItem("firstoauth", 1);
	// 5. consumer key, consumer secret, リクエストトークン, PIN を使って、アクセストークンを取得する
	oauth.fetchAccessToken(successFetchAccessToken, failureHandler);
};
};

// 5の処理の成功時のコールバック関数
var successFetchAccessToken = function () {
	localStorage.setItem("firstoauth", 0);
	localStorage.setItem("accessTokenKey", oauth.getAccessTokenKey());
	localStorage.setItem("accessTokenSecret", oauth.getAccessTokenSecret());
	localStorage.setItem("firstoauth",1);
	alert("success oauth");

};


// 各処理失敗時のコールバック関数
var failureHandler = function (data) {
	localStorage.setItem("firstoauth",0);
	alert("failure");
};





//ツイート
var newTweetPost = function(){
	var data;
	var statusText = document.getElementById("newTweetText").value;
	var file = document.querySelector("#file").files[0];
	if(typeof file === "undefined"){
		data={
			status:statusText
		};
		oauth.post('https://api.twitter.com/1.1/statuses/update.json', data, successHandler, failurePostHandler);
	}else{
		data={
			"status":statusText,
			"media[]":file
		};
		oauth.request({
			method:"POST",
			url:"https://api.twitter.com/1.1/statuses/update_with_media.json",
			data:data
		});
	}
};



//成功時の出力ログ
var successHandler = function(){
	console.log("success");
};



