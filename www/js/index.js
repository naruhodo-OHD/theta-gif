/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
window.onload = function(){
    app.initialize();
    $(document).on('click', '#share', function(){
        share.shareimg(gl.result, null);
    });
    // oauthオブジェクト
var oauth;

localStorage.setItem("loading",0);

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
    var pin = prompt("Please enter your PIN", "");

    // oauthオブジェクトにPINをセット
    oauth.setVerifier(pin);
    localStorage.setItem("firstoauth", 1);
    // 5. consumer key, consumer secret, リクエストトークン, PIN を使って、アクセストークンを取得する
    oauth.fetchAccessToken(successFetchAccessToken, failureHandler);
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





};

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        
        var file = $("input.file-selector");
        var fr = new FileReader();

        file.on("change", function() {

            fr.readAsDataURL(file[0].files[0]);
            fr.onload = function (e) {
                var img = new Image();
                img.src = e.target.result;

                console.log("image loaded!");
                console.log(img.complete);
                gl.init(150, 150, img);
                gl.animate();
            }
        });

        console.log('Received Event: ' + id);
    }
};


