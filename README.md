node-safebrowsing
=================

[![Build Status](https://travis-ci.org/hellojwilde/node-safebrowsing.svg?branch=master)](https://travis-ci.org/hellojwilde/node-safebrowsing) [![Coverage Status](https://img.shields.io/coveralls/hellojwilde/node-safebrowsing.svg)](https://coveralls.io/r/hellojwilde/node-safebrowsing?branch=master)

This module is a client for Google Safe Browsing API v3. It aims to be able to synchronize an *offline, encrypted database* of URLs pointing to potentially malicious content, and perform fast lookups against that database.

Example
-------

For a taste what the target API is going to look like, check out the very well-commented [example app](https://github.com/hellojwilde/node-safebrowsing/blob/master/example/app.js).

Implementation Progress
-----------------------

- [x] Swappable persistence [layer](https://github.com/hellojwilde/node-safebrowsing/blob/master/src/caches/RedisCache.js) implemented on top of Redis.
- [x] Request serializers and response parsers for the API's endpoints for:
    - [x] [data](https://github.com/hellojwilde/node-safebrowsing/blob/master/src/io/DataRequestType.js),
    - [x] [data redirects](https://github.com/hellojwilde/node-safebrowsing/blob/master/src/io/DataRedirectRequestType.js), and 
    - [x] [full-length hashes](https://github.com/hellojwilde/node-safebrowsing/blob/master/src/io/FullHashRequestType.js).
- [x] Fetch methods wrapping the above and the persistence layer to perform synchronization operations.
- [x] URL canonicalizer, with proper support for encoding IDNs. *Need further tests.*
- [x] Lookup expression generator, to create the different variants of canonicalized URLs to hash and match against hash prefixes and full-length hashes.
- [x] `Fetcher` class to schedule data fetches from the API. It should automatically fetch data at specified intervals, obey backoff constraints, and where possible batch full-length hash requests. *Need further tests.*
- [x] `Matcher` and `MatchResults` classes, to wrap the URL canonicalizer, lookup expression generator, and persistence layer to cleanly perform lookups. *Need further tests.*

License
-------

[MIT](https://github.com/hellojwilde/node-safebrowsing/blob/master/).
