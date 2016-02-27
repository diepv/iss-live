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

Db = mongo.Db;
// BSON = mongo.BSONPure;
var server = new Server('localhost',27017,{auto_reconnect:true, safe: true});
var server2 = new Server('localhost',27017,{auto_reconnect:true, safe: true});
var dbname = "issBackUp";	
var db = new Db(dbname, server, {safe:false});

var dbIssName = 'issLiveData3';
var dbIss = new Db(dbIssName, server2, {safe:false});
db.open(function(err,db){
    if(err){
        console.log(err);
    }else{
    	
    }
	});
dbIss.open(function(err,db){
    if(err){
        console.log(err);
    }else{
    	
    }
});

exports.setBackUpDbs = function(req, res){
	//DATABASE HOOOOOKMEUP

	//database collection names should be the module names 
	var haves = getEthosSet(); 
	var avoids  = dontNeed();
	var wantedModules = wantedNodes(avoids, haves);
	
	wantedModules.forEach(function(item,index){
			db.createCollection(item, function(err,c){
				if(err){
					console.log('error creating collection : ',item);
					console.log('msg: ',err);
				}
			});
	});
	// db.close();
	// dbIss.close();
	res.send('done');

}

exports.chunkNdump = function(req,res){
	var version = req.params.version;
	var Promise = require('promise');
//1. get the final list of wanted items 
	var haves = getEthosSet(); 
	var avoids  = dontNeed();
	var wanted = wantedNodes(avoids, haves);

	console.log("STARTING EXPORT OF DATA");
	//1. for each node, we clone the data to its specified database
	var backUpCollection = Promise.denodeify(getDataIntoBackup);
	var collectionToCsv = Promise.denodeify(getDataIntoCSV);
	var removeFromCollection = Promise.denodeify(removeDataFromDatabase);
	var shit = Promise.denodeify(nulled);
	function start(name){
		if(name!==null && name!==undefined){
			backUpCollection(name).then(function(fulfilled){ // then we want to go on to copy that into our csv file
				if(fulfilled[0]!==null && fulfilled[1]!==null){
					return collectionToCsv(fulfilled[0], fulfilled[1]);	
				}else{
					return shit();
				}
					}, function(rejected){}).then(function(fulfilled){
				return removeFromCollection(fulfilled);
					}, function(rejected){ console.log('rejected from collectionToCsv', rejected);}).then(function(fulfilled){
						start(wanted.pop());
					}, function(rejected){console.log("rejected from removal step")});
					// console.log('timestamp:',Date.now())
		}else{
			res.send("DONE");
		}
	}
	
	start(wanted.pop());
	
	// wanted.forEach(function(wantedCol, index){
	// 	var wantedCol = wanted[0];
	// 	console.log('collection being tested: ',wantedCol);
	// 	getDataIntoBackup(wantedCol);
	// });
	//
	function nulled(){
		return new Promise(function(fulfill, re){
		console.log('null everything');
		re('poop');	
		});
		
	}
	
	function getDataIntoBackup(collectionName){
		return new Promise(function(fulfill, reject){
			//database collection names should be the module names 
			var haves = getEthosSet(); 
			var avoids  = dontNeed();
			var wantedModules = wantedNodes(avoids, haves);
			// console.log('db.collection at '+collectionName+" is:", db.collection(collectionName));
	
			var bulkInsert = db.collection(collectionName).initializeUnorderedBulkOp();
			var bulkRemove = dbIss.collection('ethos').initializeUnorderedBulkOp();
			console.log("OPENED DATA BASE issLiveData3");
			//find and copy the data into the other database. 
			dbIss.collection('ethos', function(error, coll){
				coll.find({"Name":collectionName}).limit(1000).toArray(function(err,docs){
					if(!err & docs.length>0){
						docs.forEach(function(document,index){
							 bulkInsert.insert(document);
							 bulkRemove.find({"_id":document._id}).removeOne();
							 // console.log("id of item added & removed: ", document._id);
						});
					
					
						bulkInsert.execute(function(bulkerr, result){
							if(err){
								console.log("BULK INSERT ERROR - collection name: "+collectionName+" line 84, exporter.js");
								reject('error /// '+bulkerr);
							}else{
								fulfill([collectionName, bulkRemove]);
							}
						});
					}else{
						if(err){
							reject('error /// '+err);
						}else{
							fulfill([null,null])
						}
					}
					
				});
			});

			
		});
	}
	function getDataIntoCSV(item, bulkRemove){
		return new Promise(function(fulfill, reject){
		var spawn = require('child_process').spawn;
				var path = require('path');
				//1. copy the documents over to the respective database. 
				var mexport = spawn('mongoexport', ['--db',
				'issLiveData3','--collection','ethos','--limit','1000','--query','{Name:\"'+item+'\"}','--csv','--fields','Name,StatusClass,DataValue,DataTimeStamp','--out','dataOut/'+item+'_'+version+'.csv']);

				var endD;
				 mexport.stdout.on('data', function (data) {
				        if (data) {
									// console.log('data arrived');
				 				 endD += data.toString();
				        } else {
				        }
				    });
              
				 mexport.on('close', function(){
					 // console.log('data: ', endD);
					 fulfill(bulkRemove);
				 });
				 mexport.on('error', function(e){
					 // console.log('error: ',e);
					 reject(e);
				 });
	});
	}
	
	function removeDataFromDatabase(bulkRemove){
		return new Promise(function(fulfill, reject){ 
			
			bulkRemove.execute(function(err,res){
				if(err){
					reject(err);
				}else{
					fulfill(true);
				}
			})

		});
	}

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


var dontNeed = function(){
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
