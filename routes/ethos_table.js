var http = require('http');
var fs = require('fs');
var phantom = require('phantom');
var mongo = require('mongodb');
var Server = mongo.Server;

//DATABASE HOOOOOKMEUP
Db = mongo.Db;
BSON = mongo.BSONPure;
var dbname ='issLiveData';
var server = new Server('localhost',27017,{auto_reconnect:true, safe: true});
var db = new Db(dbname, server, {safe:false});

db.open(function(err,db){
    if(err){
        console.log(err);
    }else{
        console.log("OPENED DATA BASE");
    }
});
//PROMISE
var Promise = require('promise');
var startTime = Date.now();

var createSession = Promise.denodeify(netSocket);
var controlSession = Promise.denodeify(controlSessionRequest);
var bindSession = Promise.denodeify(bindSessionRequest);
function start(){
    return new Promise(function(resolve,reject){
       createSession().then(function(res){ return controlSession(res);}).then(function(resId){return bindSession(resId);}).done(function(boolStatus){resolve(boolStatus);});
    });

}


exports.update = function(req,res){
    startTime = Date.now();
    console.log('about to start everyting, timestamp: ',startTime);
    start().done(function(done){
        console.log('finished start promise: ',done);
        console.log('finished start promise timestamp:', Date.now());
    });

};

function websocketTest(){
    console.log("in web socket");
    var HOST = "push1.jsc.nasa.gov";

    //var socket = require('socket.io-client')(HOST);
    //socket.connect(function(){})
    //socket.on('connection', function(socketConn){
    //    console.log('connected');
    //    console.log(socketConn);
    //    //socketConn.on('*',function(d){
    //    //    console.log("***");
    //    //    console.log(d);
    //    //});
        var io = require('socket.io')(HOST);
        var ss = require('socket.io-stream');
        var stream = ss.createStream();
        io.on('connection', function(socket) {
            console.log('connected socket');
            ss(socket).on("*", function(stream, data) {
                stream.pipe(fs.createWriteStream('test.txt'));
            });
        });
        //stream.pipe(fs.createWriteStream('file.txt'));

    //});
    //socket.on('event', function(data){});
    //socket.on('disconnect', function(){});

    //var PORT = "80";
// Server
//    var io = require('socket.io').listen(80);
}

function netSocket(){
    return new Promise(function(fulfill, reject){
        console.log("CREATE SESSION, timestamp: ", Date.now());
        console.log("CREATE SESSION, time from start: ", Date.now() - startTime);
        var createSessionRequest = [
            "POST /lightstreamer/create_session.js HTTP/1.1\r\n",
            "Host: push1.jsc.nasa.gov\r\n",
            "Content-Type: application/x-www-form-urlencoded\r\n",
            "Connection: keep-alive\r\n",
            "Content-Length: 138\r\n",
            "\r\n",
            "LS_phase=7901&LS_domain=nasa.gov&LS_polling=true&LS_polling_millis=0&LS_idle_millis=0&LS_client_version=5.0&LS_adapter_set=PROXYTELEMETRY&"
        ];
        var HOST = "push1.jsc.nasa.gov";
        var PORT = 80;
        var net = require('net');
        //net.createConnection();
        var s = new net.Socket();

        s.setEncoding('utf8');
        s.on('connect', function(a){
            //CREATE SESSION AND RETRIEVE SESSION ID
            console.log('socket connect, time from start:', Date.now() - startTime);
            startTime = Date.now();
            createSessionRequest.forEach(function(line,lineIndex){
                var successfulWrite = s.write(line);
            });
            s.on('data', function(d){
                console.log('DATA RECEIVED, time from connection: ', Date.now() - startTime);
                startTime = Date.now();
                var sessionId = '';
                var grabSub = d.substring(d.indexOf("start('") + "start('".length); // returns from start's end to the end of string.
                var indexOfEnd = grabSub.indexOf("\'"); // get the index of the end of the session id, then test to make sure it's not 0.
                if(indexOfEnd > 0){
                    sessionId = grabSub.substring(0,indexOfEnd);
                    console.log('session variable identified: ', sessionId);
                    fulfill(sessionId);
                }else{
                    reject("OH SHIT-CREATE SESSION ERROR");
                    //throw new Error("Create Session Response Bad. No Session ID Recognized. ");
                }
            });
            s.on('error', function(e){
                console.log("ERR FROM CREATE SESSION");
                console.log(e);
            });

            s.on('end',function(){
                console.log('ended create session, timestamp: ', Date.now());
            });

        });

        s.connect({port:PORT,host:HOST});
    });
}

function bindSessionRequest(sessionId){
    return new Promise(function(fulfill, reject){
        console.log("STARTING BIND SESSSION, timestamp: ",Date.now());
        content = "LS_session="+sessionId+"&LS_phase=7903&LS_domain=nasa.gov&";

        request = [
            "POST /lightstreamer/bind_session.js HTTP/1.1\r\n",
            "Host: push1.jsc.nasa.gov\r\n",
            "Content-Type: application/x-www-form-urlencoded\r\n",
            "Connection: keep-alive\r\n",
            "Content-Length: "+content.length+"\r\n",
            "\r\n",
            content
        ];

        var HOST = "push1.jsc.nasa.gov";
        var PORT = 80;
        var net = require('net');

        //net.createConnection();
        var s = new net.Socket();
        s.setEncoding('utf8');
        s.on('connect', function(a){
            var batch ='';
            request.forEach(function(line,lineIndex){
                s.write(line);
            });
            var bindSessionTimeTracker = Date.now();
            var bindSessionTime = 0;

            s.on('data', function(data){
                console.log('data size: ',data.length);
                bindSessionTime += (Date.now() - bindSessionTimeTracker);
                bindSessionTimeTracker = Date.now();
                //console.log(data);
                if(data){
                    //TO DO : create buffer for holding data before saving  - save in bulk in order to process data into database properly.
                    batch += data;
                }else{
                    console.log("ERROR in BIND SESSION");
                }

            });
            s.on('error', function(e){
                console.log("ERROR:",e);
            });

            s.on('end',function(){
                console.log("end bind session triggered (prior to while loop), timestamp: ", Date.now());

                var batchString = batch.toString();

                //fs.writeFile('../dataHold', batchString, 'utf8', function(err){
                //    console.log("writing file...");
                //    if(err){
                //        ///STOP RIGHT HERE
                //        console.log("writing file err");
                //        console.log(err);
                //    }else{
                //        console.log('wrote file');
                //    }
                //});
                var batchObject = [];
                //var startData = batchString.indexOf("'{\"Name\":");
                //var initialDataString = batchString.substring(startData);
                var resultArray = batchString.match(/(\'{"Name).*("}\'\);)/g);
                console.log("number of data segments",resultArray.length);
                resultArray.forEach(function(item,itemIndex){
                    //console.log('jsonObject at length-4: ',item[item.length-4]);
                    var jsonObject = item.substring(1,item.length-3);
                    //jsonObject = jsonObject.replace(/'\);/g,'');
                    jsonObject = jsonObject.replace(/','+/g,",");
                    fs.appendFile('dataHold.txt', jsonObject, function (err) {
                        if(err){
                            console.log("..appending, error? : ",err);
                        }else{
                            //console.log('saved to file');
                        }

                    });
                    console.log("itemItndex: ",itemIndex);
                    if(itemIndex==resultArray.length-1){
                        console.log('itemIndex  == ', itemIndex);
                        batchObject += jsonObject;
                    }else{
                        batchObject += jsonObject +",";
                    }

                });
                console.log("batchObject parsed: ",JSON.parse("["+batchObject+"]").length);
                //while there's still something left of the batchString....
                //while(initialDataString.length>0){
                //    //find the next nearest ending.
                //    var nearestEnd = initialDataString.indexOf("}','{");
                //    var nearestEndType2 = initialDataString.indexOf("}');");
                //
                //    //compare which ending is closer.
                //    if(nearestEnd<nearestEndType2){
                //        var dataEntry = initialDataString.substring(1,nearestEnd+1);
                //        batchObject.push(dataEntry);
                //        initialDataString = initialDataString.substring(nearestEnd+3);
                //        var nextDataEntryIndex = initialDataString.indexOf("'{\"Name\":");
                //        if(nextDataEntryIndex<0){
                //            initialDataString ="";
                //        }else{
                //            initialDataString = initialDataString.substring(nextDataEntryIndex);
                //        }
                //    }else{
                //        var endEnd = nearestEndType2;
                //        if(endEnd>-1){
                //            var dataEntry =initialDataString.substring(1,endEnd+1);
                //            //console.log(dataEntry);
                //            batchObject.push(dataEntry);
                //            initialDataString = initialDataString.substring(endEnd+1);
                //            var nextDataEntryIndex = initialDataString.indexOf("'{\"Name\":");
                //            if(nextDataEntryIndex<0){
                //                initialDataString ="";
                //            }else{
                //                initialDataString = initialDataString.substring(nextDataEntryIndex);
                //            }
                //        }else{
                //            initialDataString = "";
                //            console.log('ended funny? data string left:',initialDataString);
                //        }
                //        //we are at the end. initial Data String length set to 0.
                //
                //    }
                //
                //}
                console.log('type of batchObject:',typeof batchObject);
                console.log('finished processing timestamp: ', Date.now());
                //console.log("type of batchobject after json parse:",typeof JSON.parse(batchObject));
                //console.log('timestamp after while loop has ended: ',Date.now());
                //console.log('batch total  time ', bindSessionTime);
                //console.log('batch average time ', bindSessionTime/batchObject.length);
                //saveToDbSimple(JSON.parse(batchObject), function(done){
                //    console.log('done saving');
                //    startTime = Date.now();
                //    console.log('ended bind session, timestamp: ', startTime);
                //    fulfill(true);
                //    //start();
                //});

            });
        });

        s.connect({port:PORT,host:HOST});

    });

}
function controlSessionRequest(sessionId){

    return new Promise(function(fulfill, reject){
        console.log("STARTING CONTROL SESSSION, time from create session start: ",Date.now() - startTime);
        startTime = Date.now();
        //CREATE FUNCTION TO GET DATA BY CONSTOLE SET NAME
        var consoleSet = getEthosSet();
        content = "LS_session="+sessionId+"&LS_table=2&LS_win_phase=49&LS_req_phase=172&LS_op=add&LS_mode=MERGE&LS_id=ISPWebItem&LS_schema="+consoleSet.join("%20")+"&LS_snapshot=true&LS_unique=1&";

        request = [
            "POST /lightstreamer/control.js HTTP/1.1\r\n",
            "Host: push1.jsc.nasa.gov\r\n",
            "Content-Type: application/x-www-form-urlencoded\r\n",
            "Connection: keep-alive\r\n",
            "Content-Length: "+content.length+"\r\n",
            "\r\n",
            content
        ];

        var HOST = "push1.jsc.nasa.gov";
        var PORT = 80;
        var net = require('net');
        //net.createConnection();
        var s = new net.Socket();

        s.setEncoding('utf8');
        s.on('connect', function(a){
            console.log("CONNECTED CONTROL SESSION, time form entering control session: ", Date.now() - startTime);
            request.forEach(function(line,lineIndex){
                s.write(line);
            });

            s.on('data', function(data){
                console.log("DATA FROM CONTROL SESSION, time since connection: ",Date.now() - startTime);
                if(data){
                    console.log("about to fulfill) with sessionId: ",sessionId);
                    fulfill(sessionId);
                }else{
                    reject(e);
                }

            });
        });
        s.on('error', function(e){
            console.log("ERR FROM CONTROL SESSION; ",e);

        });

        s.on('end',function(){
            console.log('ended control session, timestamp: ', Date.now());
        });
        s.connect({port:PORT,host:HOST});
    });
}
/*
 var request = [
 "POST /lightstreamer/create_session.js HTTP/1.1\r\n",
 "Host: push1.jsc.nasa.gov\r\n",
 "Content-Type: application/x-www-form-urlencoded\r\n",
 "Connection: keep-alive\r\n",
 "Content-Length: 138\r\n",
 "\r\n",
 "LS_phase=7901&LS_domain=nasa.gov&LS_polling=true&LS_polling_millis=0&LS_idle_millis=0&LS_client_version=5.0&LS_adapter_set=PROXYTELEMETRY&"
 ]
*/

function saveToDbSimple(document,callback){
    console.log('called saveToDbSimple with documentl ength: ', document.length);
    db.collection("ethos", function(error, collection) {
        if (!error) {
            console.log('no error, going to for each things');
            document.forEach(function(doc,docIndex){
                save(doc,collection);
            });
            console.log('saved all');
            callback(true);
        }else{
            console.log('savetodbsimple error');
            callback(error);
        }
    });

    function save(doc, collection) {
        doc = JSON.parse(doc);
        //console.log('DOC: ', doc);
        var modDoc = {
            Name: doc.Name,
            Data: [{Value: doc.Data[0].Value, TimeStamp: doc.Data[0].TimeStamp}]
        };

        collection.update(modDoc,modDoc, {upsert: true}, function (err, record) {
            //console.log('time to save:', doc);
            if (!err) {
            } else {
                console.log("ERROR SAVING, err: ", err);
            }

        });
    }
}
function saveToDb(document, callback){
    console.log('document.length: ', document.length);
    console.log('save to db timestamp:  ',Date.now());

    db.collection("ethos", function(error, collection){
        if(!error){
                console.log("opened ethos, timestamp: ", Date.now());
                var saveRep = Promise.denodeify(save);
                var promises = [];
                var resolves = [];
                document.forEach(function (doc, docIndex) {
                    promises.push(new Promise(function (fulfill) {
                        //console.log('resolve push fulfill: ',fulfill);
                        resolves.push(fulfill);
                    }));
                });
                for (var dI = 0; dI < document.length - 2; dI++) {
                    resolves[dI](promises[dI + 1]);
                }
                resolves[document.length - 2](save(document.next(), collection));
                promises[0].done(function () {
                    console.log('.sv');
                });

        }
    });

    function save(doc, collection) {
            doc = JSON.parse(doc);
            //console.log('DOC: ', doc);
            collection.save({
                Name: doc.Name,
                Data: [{Value: doc.Data[0].Value, TimeStamp: doc.Data[0].TimeStamp}]
            }, {w: 1}, function (err, record) {
                console.log('time to save:', doc);
                if (!err) {
                    return true;
                } else {
                    console.log("ERROR SAVING, err: ", err);
                    return false;
                }

            });
    }


}

function getEthosSet(){
   var nodeset =
   ["NODE2000001",
  "NODE2000002",
  "NODE2000003",
  "NODE2000006",
  "NODE2000007",
  "NODE3000001",
  "NODE3000002",
  "NODE3000003",
  "NODE3000004",
  "NODE3000005",
  "NODE3000006",
  "NODE3000007",
  "NODE3000008",
  "NODE3000009",
  "NODE3000010",
  "NODE3000011",
  "NODE3000012",
  "NODE3000013",
  "NODE3000017",
  "NODE3000018",
  "NODE3000019",
  "AIRLOCK000049",
  "AIRLOCK000050",
  "AIRLOCK000051",
  "AIRLOCK000052",
  "AIRLOCK000053",
  "AIRLOCK000054",
  "AIRLOCK000055",
  "AIRLOCK000056",
  "AIRLOCK000057",
  "USLAB000053",
  "USLAB000054",
  "USLAB000055",
  "USLAB000056",
  "USLAB000057",
  "USLAB000058",
  "USLAB000059",
  "USLAB000060",
  "USLAB000061",
  "USLAB000062",
  "USLAB000063",
  "USLAB000064",
  "USLAB000065"];

    return nodeset;
}

//       var request = {
//path: "/lightstreamer/create_session.js",
//    hostname: "push1.jsc.nasa.gov",
//    method:'POST',
//    port:'80',
//    headers : {
//    'Content-Type':"application/x-www-form-urlencoded",
//        'Connection':"keep-alive",
//        'Content-Length':"138",
//        'Content':"LS_phase=7901&LS_domain=nasa.gov&LS_polling=true&LS_polling_millis=0&LS_idle_millis=0&LS_client_version=5.0&LS_adapter_set=PROXYTELEMETRY&"
//}
//};