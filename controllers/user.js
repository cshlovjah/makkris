/**
 * Created by cshlovjah on 14.07.16.
 */
var db = require('../libs/mongodriver');
var _ = require('underscore');
var log = require('../libs/log')(module);
var ObjectID = require('mongodb').ObjectID;
var Account = require('../models/account');
var Utilz = require('../libs/Utilz')
var utilz = new Utilz();

exports.findUserAll = function (req, res) {
    log.info('Retrieving all user\'s');
    var collection = db.get().collection('accounts');
        collection.find({}, {
            "username": true,
            "_id": true,
            "group": true,
            "boxId": true,
            "fio": true,
            "description": true,
            "status": true
        }).toArray(function (err, items) {
            res.send(items);
        });

};

exports.findUserById = function (req, res) {
    var id = req.params.id;
    log.info('Retrieving user: ' + id);
    var collection = db.get().collection('accounts');
        collection.findOne({'_id': new ObjectID(id)}, {
            "username": true,
            "_id": true,
            "group": true,
            "boxId": true,
            "fio": true,
            "description": true,
            "status": true,
            "createDate": true,
            "updateDate": true
        }, function (err, item) {
            res.send(item);
        });
};

exports.addUser = function (req, res) {
    var user = req.body;
    log.info('Adding user: ' + JSON.stringify(user));
    Account.register(new Account({
        username: req.body.username,
        group: req.body.group,
        boxId: req.body.boxId,
        fio: req.body.fio,
        status: req.body.status,
        description: req.body.description,
        createDate: utilz.nowDate()
    }), req.body.password, function (err, account) {
        if (err) {
            res.json({error: "Sorry. That username already exists. Try again."})
        } else {
            res.json({ok: 1, n: 1});
        }

    });
}

exports.updateUser = function (req, res) {
    var id = new ObjectID(req.params.id);
    var user = req.body;
    log.info('Updating user: ' + id);

    log.info(JSON.stringify(user));
    Account.findById({_id: id}, function (err, p) {
        if (!p) {
            log.info("Could not load Document");
          
            //return next(new Error('Could not load Document'));
            res.json({'error': { 'error': err ,'message': 'Document not found'}});
        }
        else {

            p.setPassword(req.body.password, function (err, user) {
                if (err) {
                    log.info(err);
                    res.json({'error': { 'error': err ,'message': 'Password not set'}});
                } else {
                    var conditions = {_id: new ObjectID(id)}
                        , update = {
                        username: req.body.username,
                        fio: req.body.fio,
                        group: req.body.group,
                        boxId: req.body.boxId,
                        status: req.body.status,
                        description: req.body.description,
                        updateDate: utilz.nowDate(),
                        hash: user.hash,
                        salt: user.salt
                    };

                    Account.update(conditions, update, function (err, place) {
                        
                        if (err) {
                            log.info(err);
                        }
                        res.json(place)
                    });
                }
            });
        }
    });
}

exports.updateOnePropertyUser = function ( req, res) {
    var id = req.params.id;
    log.info(req.body);


    var account = {};
    _.each(req.body, function(num, key){
        if (req.body[key] != undefined) {
            account[key] = req.body[key]
        }
    });
    account.updateDate = utilz.nowDate(),
    log.info("Пользователь: " + JSON.stringify(account));
    var idString = new ObjectID(id);

    var collection = db.get().collection('accounts');
    collection.update({'_id': idString}, {
        $set: account
    }, function (err, result) {
        if (err) {
            log.info(err);
            log.info(result);
            res.json(err);
        } else {
            res.json(result);
        }
    });

   
}

exports.deleteUser = function (req, res) {
    var id = req.params.id;
    log.info('Deleting user: ' + id);
    var collection = db.get().collection('accounts');
        collection.remove({'_id': new ObjectID(id)}, {safe: true}, function (err, result) {
            if (err) {
                res.send({'error': 'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
}


