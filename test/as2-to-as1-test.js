// as2-to-as1-test.js
//
// Convert Activity Streams JSON 1.0 to ActivityStreams 2.0
//
// Copyright 2018 E14N <https://e14n.com/>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

var vows = require("vows");
var assert = require("assert");
var Step = require("step");
var as2 = require("activitystrea.ms");

var fromAS2 = require("../lib/fromas2");

var convert = function(from, to) {
    var type = (from.type) ? from.type : "<unknown>";
    var batch = {};
    var title = "When we convert a(n) " + type + " object";
    batch[title] = {
        topic: function() {
            Step(
                function() {
                    // Convert to an AS2 module object
                    as2.import(from, this);
                },
                function(err, imported) {
                    if (err) throw err;
                    fromAS2(imported, this);
                },
                this.callback
            );
        },
        "it works": function(err, converted) {
            assert.ifError(err);
            assert.isObject(converted);
            assert.deepEqual(converted, to);
        }
    };
    return batch;
};

vows.describe("AS2 -> AS1 conversion")
    .addBatch(convert(
        {
            id: "https://application.test",
            type: "Application",
            name: "The Test Application"
        },
        {
            id: "https://application.test",
            links: {
                self: {
                    href: "https://application.test"
                }
            },
            objectType: "application",
            displayName: "The Test Application"
        }
    ))
    .addBatch(convert(
        {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Group",
            "name": "Big Beards of Austin",
            "id": "https://bboa.example",
            "icon": {
                "type": "Link",
                "href": "https://bboa.example/logo.png",
                "mediaType": "image/png",
                "name": "Big Beards of Austin logo",
                "width": 128,
                "height": 128
            },
            "summary": "Austinites who have, or are fans of, big beards",
            "published": "2018-04-18T12:58:00Z",
            "updated": "2018-04-25T17:21:00Z"
        },
        {
            id: "https://bboa.example",
            links: {
                self: {
                    href: "https://bboa.example"
                }
            },
            objectType: "group",
            displayName: "Big Beards of Austin",
            summary: "Austinites who have, or are fans of, big beards",
            published: "2018-04-18T12:58:00.000Z",
            updated: "2018-04-25T17:21:00.000Z",
            image: {
                "url": "https://bboa.example/logo.png",
                "width": 128,
                "height": 128
            }
        }
    ))
    .addBatch(convert(
        {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Organization",
            "name": "Giant Co",
            "id": "https://giant.example",
            "image": {
                "type": "Image",
                "name": "Giant Co logo",
                "url": {
                    "type": "Link",
                    "href": "https://giant.example/logo.png",
                    "mediaType": "image/png",
                    "width": 128,
                    "height": 128
                }
            },
            "summary": "Making the future happen but more gigantic",
            "published": "2018-04-18T12:58:00Z",
            "updated": "2018-04-25T17:21:00Z"
        },
        {
            id: "https://giant.example",
            links: {
                self: {
                    href: "https://giant.example"
                }
            },
            objectType: "organization",
            displayName: "Giant Co",
            summary: "Making the future happen but more gigantic",
            published: "2018-04-18T12:58:00.000Z",
            updated: "2018-04-25T17:21:00.000Z",
            image: {
                "url": "https://giant.example/logo.png",
                "width": 128,
                "height": 128
            }
        }
    ))
    .addBatch(convert(
        {
            "@context": [
                "https://www.w3.org/ns/activitystreams",
                {"vcard": "http://www.w3.org/2006/vcard/ns#"}
            ],
            "type": "Person",
            "name": "Donald Laycock",
            "vcard:given-name": "Donald",
            "vcard:family-name": "Laycock",
            "id": "https://person.example/donald-laycock",
            "summary": "An Australian linguist and anthropologist",
            "inbox": "https://person.example/donald-laycock/inbox",
            "outbox": "https://person.example/donald-laycock/outbox",
            "followers": "https://person.example/donald-laycock/followers",
            "following": "https://person.example/donald-laycock/following",
            "liked": "https://person.example/donald-laycock/liked"
        },
        {
            "objectType": "person",
            "displayName": "Donald Laycock",
            "vcard": {
                "given-name": "Donald",
                "family-name": "Laycock"
            },
            "id": "https://person.example/donald-laycock",
            "summary": "An Australian linguist and anthropologist",
            "links": {
                "self": {"href": "https://person.example/donald-laycock"},
                "activity-inbox": {"href": "https://person.example/donald-laycock/inbox"},
                "activity-outbox": {"href": "https://person.example/donald-laycock/outbox"}
            },
            "followers": {
                url: "https://person.example/donald-laycock/followers"
            },
            "following": {
                url: "https://person.example/donald-laycock/following"
            },
            "favorites": {
                url: "https://person.example/donald-laycock/liked"
            }
        }
    ))
    .addBatch(convert(
        {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Service",
            "nameMap": {
                en: "Social Network",
                fr: "Réseau social"
            },
            "id": "http://social.example/",
            "attributedTo": {
                "type": "Organization",
                "name": "Giant Co",
                "id": "https://giant.example"
            }
        },
        {
            "objectType": "service",
            "displayName": "Social Network",
            "id": "http://social.example/",
            "links": {
                "self": {"href": "http://social.example/"}
            },
            "author": {
                "objectType": "organization",
                "displayName": "Giant Co",
                "id": "https://giant.example",
                "links": {
                    "self": {"href": "https://giant.example"}
                }
            }
        }
    ))
    .addBatch(convert(
        {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Article",
            "name": "What a Crazy Day I Had",
            "content": "<div>... you will never believe ...</div>",
            "mediaType": "text/html",
            "attributedTo": "http://sally.example.org",
            "attachment": {
                "type": "Link",
                "href": "http://sally.example.org/images/disaster.jpg",
                "name": "This is a disaster",
                "width": 640,
                "height": 480,
                "mediaType": "image/jpeg",
                "preview": {
                    "type": "Link",
                    "href": "http://sally.example.org/thumbs/disaster.jpg",
                    "width": 80,
                    "height": 60,
                    "mediaType": "image/jpeg"
                }
            }
        },
        {
            "objectType": "article",
            "displayName": "What a Crazy Day I Had",
            "content": "<div>... you will never believe ...</div>",
            "dc": {
                "format": "text/html"
            },
            "author": {
                "id": "http://sally.example.org",
                "links": {
                    "self": {"href": "http://sally.example.org"}
                }
            },
            "attachments": [
                {
                    "url": "http://sally.example.org/images/disaster.jpg",
                    "width": 640,
                    "height": 480,
                    "dc": {
                        "format": "image/jpeg",
                        "title": "This is a disaster"
                    },
                    "as2": {
                        "preview": {
                            "type": "Link",
                            "href": "http://sally.example.org/thumbs/disaster.jpg",
                            "width": 80,
                            "height": 60,
                            "mediaType": "image/jpeg"
                        }
                    }
                }
            ]
        }
    ))
    .addBatch(convert(
        {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Audio",
            "name": "Interview With A Famous Technologist",
            "url": [
                {
                    "type": "Link",
                    "href": "http://example.org/podcast/episode.mp3",
                    "mediaType": "audio/mp3"
                },
                {
                    "type": "Link",
                    "href": "http://example.org/podcast/episode.html",
                    "mediaType": "text/html"
                },
                {
                    "type": "Link",
                    "href": "http://example.org/podcast/episode.atom",
                    "mediaType": "application/atom+xml"
                }
            ]
        },
        {
            "objectType": "audio",
            "displayName": "Interview With A Famous Technologist",
            "links": {
                "alternate": {
                    "href": "http://example.org/podcast/episode.atom",
                    "type": "application/atom+xml"
                }
            },
            "stream": {
                "url": "http://example.org/podcast/episode.mp3",
                "dc": {
                    "format": "audio/mp3"
                }
            },
            "url": "http://example.org/podcast/episode.html"
        }
    ))
    .addBatch(convert(
        {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Document",
            "name": "4Q Sales Forecast",
            "url": [
                {
                    "type": "Link",
                    "href": "http://example.org/4q-sales-forecast.pdf",
                    "mediaType": "application/pdf"
                },
                {
                    "type": "Link",
                    "href": "http://example.org/4q-sales-forecast.html",
                    "mediaType": "text/html"
                }
            ]
        },
        {
            "objectType": "file",
            "displayName": "4Q Sales Forecast",
            "fileUrl": "http://example.org/4q-sales-forecast.pdf",
            "mimeType": "application/pdf",
            "url": "http://example.org/4q-sales-forecast.html"
        }
    ))
    .addBatch(convert(
        {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Event",
            "name": "Going-Away Party for Jim",
            "startTime": "2014-12-31T23:00:00-08:00",
            "endTime": "2015-01-01T06:00:00-08:00"
        },
        {
            "objectType": "event",
            "displayName": "Going-Away Party for Jim",
            "startTime": "2015-01-01T07:00:00.000Z",
            "endTime": "2015-01-01T14:00:00.000Z"
        }
    ))
    .addBatch(convert(
        {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Image",
            "name": "Cat Jumping on Wagon",
            "url": [
                {
                    "type": "Link",
                    "href": "http://example.org/image.jpeg",
                    "mediaType": "image/jpeg"
                },
                {
                    "type": "Link",
                    "href": "http://example.org/image.png",
                    "mediaType": "image/png"
                }
            ]
        },
        {
            "objectType": "image",
            "displayName": "Cat Jumping on Wagon",
            "fileUrl": "http://example.org/image.jpeg",
            "mimeType": "image/jpeg",
            "links": {
                "alternate": {
                    "href": "http://example.org/image.png",
                    "type": "image/png"
                }
            }
        }
    ))
    .export(module);