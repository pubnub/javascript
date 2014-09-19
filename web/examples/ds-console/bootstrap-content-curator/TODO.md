## TODO Items

 - Full transaction i.e. undo and change log!!!!!
 - add UNDO function and ROLLBACK.
 - client tranlog only after up-to-date. (prevent overwrite)
 - tombstone
 - add crypto
 - mandatory OBJECTS stored only (no array/str/num/fun/etc).  Object only.)
 - find broken with multiple keys in search obj.
 - grant(read,write,ttl)
 - localStorage max 5MB... fix?
 - sortby
 - find
 - Show the changes along with the
 - full object in the onUPDATE event.
 - Return Full Object in Array for Find method.
 - domain to transactionID

## Future Additions:

 - CloudBase.IO Integration
 - backbone.js
 - angular.js
 - Iron.Io Integration
 - 

## Martin Webb Upgrades

Stephen - 

I have flattened all my enhancements into a new script - modified the TTD tests for client and receiver and added a test for multiplex - multiple datastores.

All works fine, I think your find the enhancements make an impressive update to what was already a fantastic api.

There are a lot of logic changes to impose the __locked, __singed improvements, as well as tightening down the sync logic.

The script should be quite decent I put a lot of time into testing it - albeit with the TTD tests

I will now hook up your storage API as an external api and test the off-board db. I`ll modify the TTD to take this on-board should all prove useful for the masses that will want to hook up external storage adapters

Your see in the TDD test it now works as

    // OPEN DB CONNECTION
    var db = PUBNUB.sync( 'db6', settings )

    // OPEN STORE 1 & 2
    var ds1 = db.open("store1", config);
    var ds2 = db.open("store2", config);

    obj = ds1.create({name:'item1'});

I also re engineered the off-board db hook ups

    ds2.on.subscribe(e) //receive down-sync events for db
    ds2.on.publish(e)   //publish upstream events 
    ds2.on.sync(e)      //notification of upstream send, message and timestamp

Also note the following properties are now reserved:

    obj1.__id
    obj1.__signed
    obj1.__locked
    obj1.__tombstone

This enhancements are as follows. I have zipped up all the files so its a working solution as per your original.

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// ENHANCEMENTS
// 
// 1. Multiple stores in one data-base
// 2. object signage as oppose to trans_log for improved sync logic
// 3. object locking for improved sync logid
// 4. cold start auto dispatch of bin_log for improved sync logic
// 5. re-flow of CRUD operation flow, local data-store commits first
// 6. improved response for read item - returns null if removed
// 7. improved response for read item - returns undefined if not found
// 8. Added tombstones and required re-logic
// 9. improved sync logic - tombstone deletes are permanant
//10. Added off-board database routing settings.offboard_db: true
//11. Added on.subscribe event for offboard-db
//12. Added publish method for offboard-db
//13. Added intelligent extenders for offboard-db
//14. Added on.sync event for confirmation of upsync
//15. Added settings.auto_sign: false for off-board object signing
//16. Added stop() & start() methods for controlling up/down sync
//17. Improved routing/testing of messages before execution
//18. Modified update method recordToBig test to test final merged object.
//19. Added record exists test, returns fail, false


I'm adding these to an FAQ:
Is key the only attribute that you can use for the find call?
you can use any key/value pair.  { "toast" : "golden" }
Is the return from find a standard Array?
Yes.
What channel are you using for transmitting db changes?
the "name" of the database.
var db = PUBNUB.sync( 'db1', settings );





Bootstrap Content Feeder TODO

add ordering
Reload config dynamic
setup form api key
code snippets
viewer embed code
editor settings
previewer


dev-console link direct


doc: max reflog

desktop notifications
preview area w/HTML support

Security w/ Options
perm-ses, pass, sec, acl
footer/PubNub
multiple display opts
works on all mobile/web
Examples
add CONFirmation for PUSH














