// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート
const AWS = require('aws-sdk');

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};
AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3.SECRET_KEY,
    region: process.env.S3_REGION
});

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);

// View EngineにEJSを指定。
server.set('view engine', 'ejs');
// "/"へのGETリクエストでindex.ejsを表示する。拡張子（.ejs）は省略されていることに注意。
server.get("/", function(req, res, next){
    res.render("index", {});
});




// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// -----------------------------------------------------------------------------
// ルーター設定
server.post('/webhook', line.middleware(line_config), (req, res, next) => {
    // 先行してLINE側にステータスコード200でレスポンスする。
    res.sendStatus(200);
    console.log(req.body);

    // すべてのイベント処理のプロミスを格納する配列。
    let events_processed = [];

    // イベントオブジェクトを順次処理。
    req.body.events.forEach((event) => {
        var s3 = new AWS.S3();
        var params1 = {Bucket: process.env.S3_BUCKET, Key: 'testKey1', Body: 'Hello!'};
        s3.putObject(params1).done(function(resp) {
            console.log("Successfully uploaded data to myBucket/testKey1");
        });
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text"){
            // ユーザーからのテキストメッセージが「こんにちは」だった場合のみ反応。
            if (event.message.text == "こんにちは"){
                // replyMessage()で返信し、そのプロミスをevents_processedに追加。
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "これはこれは！こんにちは〜"
                }));
            }
            if (event.message.text == "おつかれ"){
                // replyMessage()で返信し、そのプロミスをevents_processedに追加。
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "拙者、今日もなにもしてないけど、お疲れ！！"
                }));
            }
        }
        if (event.type == "message" && event.message.type == "image"){
            events_processed.push(bot.replyMessage(event.replyToken, {
                type: "text",
                text: "画像ですな！"
            }));
        }
        if (event.type == "message" && event.message.type == "file"){
            // events_processed.push(bot.replyMessage(event.replyToken, require("./confirm-button.json")));
            events_processed.push(bot.replyMessage(event.replyToken, {
                type: "text",
                text: "いい音ですので保存しておきますぞ！"
            }));
            var contentId = event.message.id;
            bot.getMessageContent(contentId)
                .then((stream) => {
                    stream.on('data', (chunk) => {
                        console.log('data');
                        console.log(chunk);
                        content.push(new Buffer(chunk));
                    }).on('error', (err) => {
                        reject(err);
                    }).on('end', function(){
                        console.log('end');
                        console.log(content);
                        resolve(Buffer.concat(content));
                    });
                });
        }
    });

    // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );
});
