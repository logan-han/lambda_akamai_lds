"use strict";

var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var MailParser = require("mailparser").MailParser;

console.log("Akamai LDS by Email");

var containerReuse = 0;

exports.handler = function(event, context) {
    if (containerReuse > 0) {
        console.log("Container reuse == ", containerReuse);
    }
    containerReuse++;

    var parser = new MailParser();
    var fs = require("fs");
    var config = require("./config.js");

    if (config.debug) {
        console.log("New event: ", JSON.stringify(event));
    }
    if (event.Records === null) {
        context.fail("Error: no records found");
        return;
    } else if (event.Records.length !== 1) {
        context.fail("Error: wrong # of records - we expect exactly one");
        return;
    }
    var message = event.Records[0].ses;
    if (message.mail.messageId === null) {
        context.fail("Error: mail.messageId is missing");
        return;
    } else if (message.mail.source !== "noreply@akamai.com") {
        context.fail("Error: mail sender is not noreply@akamai.com");
        return;
    } else if (message.receipt.action.type !== "Lambda") {
        context.fail("Error: mail action is not Lambda");
        return;
    }

    message.s3Url = "s3://" + config.fromBucket + "/" + message.mail.messageId;
    if (config.debug) {
        console.log("Fetching message from " + message.s3Url);
        console.log("Filename: " + message.mail.commonHeaders.subject);
    }

    s3.getObject({
        Bucket: config.fromBucket,
        Key: message.mail.messageId,
    }, function(err, data) {
        if (err) {
            console.log(err);
            context.fail("Error: Failed to load message from S3");
            return;
        }

        // Two things for Akamai uuencode - they don't add required headers & this node module doesn't capture filename argh
        var rawEmail = new Buffer(data.Body).toString("utf-8");
        var rawEmail = "Content-Type: application/octet-stream\r\n"+"Content-Transfer-Encoding: uuencode\r\n"+rawEmail
        var prefix = message.mail.commonHeaders.subject.split(".")
        parser.on('end', function(parsedmail) {
            if (parsedmail.attachments) {
                    s3.putObject({
                        Bucket: config.toBucket,
                        Key: prefix[0]+"/"+message.mail.commonHeaders.subject,
                        ACL: 'private',
                        Body: parsedmail.attachments[0].content
                    },
                    function(err, data) {
                        if (err) {
                            console.log(err);
                            context.fail("Error: Failed to load message from S3");
                            return;
                        }
                  });
            }
            else context.fail("No attachment found");
        });

        parser.write(rawEmail);
        parser.end();

    });
};
