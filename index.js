var fs = require("fs")
var mime = require('mime-types')

function uuidv4() {
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
     var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
     return v.toString(16);
   });
}

module.exports = function (context, req) {

     var file="index.html"
     var folder="log"
     if (req.query.file) {
             file=req.query.file
     }
     if (req.query.folder) {
             folder=req.query.folder
     }
    context.log('file : ', file);
    context.log('folder ', folder);
    
    var azure = require('azure-storage');
    var blobService = azure.createBlobService();

    context.log('Your environment variable AZURE_STORAGE_ACCOUNT has the value: ', process.env.AZURE_STORAGE_ACCOUNT);
    context.log('Your environment variable AZURE_STORAGE_ACCESS_KEY has the value: ', process.env.AZURE_STORAGE_ACCESS_KEY);
    context.log('Your environment variable AZURE_STORAGE_CONNECTION_STRING has the value: ', process.env.AZURE_STORAGE_CONNECTION_STRING);


     file = file.replace(/\//g, "\\");


blobService.getBlobToText(folder, file,function(err, data,blob   ) {

         context.log('GET ' + folder + "\\content\\" +  file);

         context.bindings.outputTable = {
            "partitionKey": "log",
            "rowKey":uuidv4(),
            "method": req.method,
            "file": file,
            "from": req.headers["x-forwarded-for"],
            "useragent": req.headers["user-agent"],
            "referer": req.headers["referer"]
        }

 

    if (!err){
        
        var contentType = mime.lookup(file) 

       context.bindings.outputTable.status = 200

       context.res = {
             status: 200, 
             body: data,
             isRaw: true,
             headers: {
                 'Content-Type': contentType
             }
       };

    }else{

        context.log("Error: " + err)
        context.bindings.outputTable.status = 404

        context.res = {
            status: 404, 
            body: "Not Found.",
            headers: {
            }
        };          
    }
    context.done()

    });

 };