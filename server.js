//Base de datos
var MongoClient = require('mongodb').MongoClient;
var urlMongo = 'mongodb://127.0.0.1:27017/data';
var db;
//Capa rest
var restify = require('restify');
//Obtener el hash de una contraseña
const hash = require('./hash.js');


//Inicializar la capa rest
var server = restify.createServer();
server.use(restify.authorizationParser());
server.use(restify.queryParser());
server.use(restify.bodyParser({
    mapParams: true
}));

//Conectarse al servidor 
exports.connectDB = function(){
    return new Promise((resolve, reject) =>{
        if(db) return resolve(db);
        MongoClient.connect(urlMongo, (err, _db) => {
            if (err) return reject(err);
            db = _db;
            resolve(_db);
        });
    });
};

//Base de datos
exports.insert = function(req){
    return new Promise((resolve, reject) =>{ 
        exports.connectDB().then(db =>{
            db.collection('users').insertOne({
                id: req.params.username, 
                username: req.params.username, 
                password: hash.getHash(req.params.password),
                provider: req.params.provider,
                familyName: req.params.givenName,
                middleName: req.params.middleName,
                emails: req.params.emails,
                photos: req.params.photos
            }, (err, result) =>{
                if(err) return reject(err);
                return resolve(result.insertedCount);
            });
        });
    });
};

exports.update = function(req){
    return new Promise((resolve, reject) =>{ 
        exports.connectDB().then(db =>{
            db.collection('users').updateOne({
                id: req.params.id
            }, 
            { $set: {
                id: req.params.username, 
                username: req.params.username, 
                password: req.params.password,
                provider: req.params.provider,
                familyName: req.params.givenName,
                middleName: req.params.middleName,
                emails: req.params.emails,
                photos: req.params.photos
            }}, (err, result) =>{
                if(err) return reject(err);
                return resolve(result.modifiedCount);
            });
        });
    });    
};

exports.destroy = function(req){
    return new Promise((resolve, reject) =>{
        exports.connectDB().then(db =>{
            db.collection('users').deleteOne( {
                id : req.params.username 
            }, (err, result) =>{
                if(err) return reject(err);
                return resolve(result.deletedCount);
            }); 
        });
    });
};

//Routers
server.post('/api/users/insert', function(req, res, next){
    exports.insert(req).then( result =>{
        res.send('OK');
    }).catch (err =>{
        res.send(err.code+' - '+err.message);
    }); 
    return next();
});

server.post('/api/users/update', function(req, res, next){
    exports.update(req).then( result =>{
        if(result === 0)
            res.send('User does not exists');
        else
            res.send('OK');
    }).catch (err =>{
        res.send(err.code+' '+err.messagev);
    }); 
    return next();
});

server.post('/api/users/destroy', function(req, res, next){
    exports.destroy(req).then( result =>{
        if(result === 0)
            res.send('User does not exists');
        else
            res.send('OK');
    }).catch (err =>{
        res.send(err.code+' '+err.messagev);
    }); 
    return next();
});

server.post('/api/users/login', function(req, res, next){
    //buscar el objeto a la base de datos
    exports.connectDB().then(db =>{
        db.collection('users').findOne(
        {
            "id" : req.params.username 
        }, 
        {
            "username" : 1,
            "password" : 1
        }
        , (err, result) =>{
            if(err) res.send('Fallo con el servidor de autenticación');
            else if(result === null) res.send('El usuario no existe');
            else{
                if(hash.getHash(req.params.password) === result.password){
                    res.send(result);
                }
                else res.send('Contraseña incorrecta');
                next(false);
            }
        });
    });
    return next();   
});


//Iniciar la capa Rest
server.listen(8888, function(){
   console.log('Server running at port 8888'); 
});