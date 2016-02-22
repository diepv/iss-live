var http = require('http')
var mongo = require('mongodb');
var Server = mongo.Server;

var ObjectID = require('mongodb').ObjectID,
Binary = require('mongodb').Binary,
GridStore = require('mongodb').GridStore,
Grid = require('mongodb').Grid,
Code = require('mongodb').Code,
BSON = require('mongodb').pure().BSON,
assert = require('assert');

//DATABASE HOOOOOKMEUP
Db = mongo.Db;
BSON = mongo.BSONPure;
var dbname ='issLiveData6';
var server = new Server('localhost',27017,{auto_reconnect:true, safe: true});
var db = new Db(dbname, server, {safe:false});

db.open(function(err,db){
    if(err){
        console.log(err);
    }else{
        console.log("OPENED DATA BASE");
    }
});


exports.chunkNdump = function(req,res){
//1. get the final list of wanted items 
	var haves = getEthosSet(); 
	var avoids  = dontNeed();
	var wanted = wantedNodes(avoids, haves);

	var spawn = require('child_process').spawn;
//			mongoexport -h host -u user -p pass --db database --collection collections --csv --fields id,xid --query '{"xid":{"$ne":0}}' --out rec.csv
//Name
// StatusClass
// StatusIndicator
// StatusColor
// DataValue
// DataTimeStamp
// CalibratedData
// LastModified
	// var mexport = spawn('mongoexport', ['--db issLiveData3 --collection ethos --type=csv --fields Name,StatusClass,StatusIndicator,StatusColor,DataValue,DataTimeStamp,LastModified --query '{"Name":""}' --out test.csv'])

	// db.collection('ethos', function(err,collection){

		// if(!err){
			wanted.forEach(item, index){
				// collection.find({"Name":item}).	
				var mexport = spawn('mongoexport', ['--db issLiveData3 --collection ethos --limit 100 --type=csv --fields Name,StatusClass,StatusIndicator,StatusColor,DataValue,DataTimeStamp,LastModified --query \'{"Name":'+item+'}\' --out test.csv']);
				res.set("Content-Type", 'text/plain');
				mexport.stdout.on('data', function(data){
					if(data){
						console.log("success? ");
						res.send(data.toString());
					}else{
						console.log('poop');
					}

				});
			}


		// }else{
		// 	console.log('err');
		// 	console.log(err);
		// }
	// });


}

var wantedNodes = function(dontwant,have){
	var wanted =[];
	for(var index in have){
		var nodeName = have[index];
		if(dontwant.indexOf(nodeName)>-1){

			//DO NOT ADD
		}else{
			wanted.push(nodeName);
		}
	}
	return wanted;

}


var dontNeed = function()
	var list = ["NODE2000001", "NODE2000002", "NODE2000006", "NODE2000007", "NODE3000012", "NODE3000013", "NODE3000017", "NODE3000019", "USLAB000056", "USLAB000057", "USLAB000060", "USLAB000061"];
	return list;
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
