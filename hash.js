const crypto = require('crypto');

/**
 * Función que te devuelve un hash en Sha-256 de la contraseña pasada por parámetro
 * @param String password
 * @return String hash
 */
exports.getHash = function (password){
    const secret = 'HackedByFran';
    return hash = crypto.createHmac('sha256', secret).update(password).digest('hex');
}

