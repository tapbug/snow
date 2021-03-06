var _ = require('lodash')
, activities = require('./activities')
, validate = require('./validate')
, bankAccounts = module.exports = {}
, crypto = require('crypto')

bankAccounts.configure = function(app, conn, auth) {
    app.get('/v1/bankAccounts', auth, bankAccounts.index.bind(bankAccounts, conn))
    app.post('/v1/bankAccounts', auth, bankAccounts.add.bind(bankAccounts, conn))
    app.post('/v1/bankAccounts/:id/verify', auth,
        bankAccounts.verify.bind(bankAccounts, conn))
}

bankAccounts.createVerifyCode = function() {
    return crypto.randomBytes(2).toString('hex').toUpperCase()
}

bankAccounts.index = function(conn, req, res, next) {
    if (!req.apiKey.primary) {
        return res.send(401, {
            name: 'MissingApiKeyPermission',
            message: 'Must be primary api key'
        })
    }

    conn.read.query({
        text: [
            'SELECT * FROM bank_account WHERE user_id = $1'
        ].join('\n'),
        values: [req.user]
    }, function(err, dr) {
        if (err) return next(err)
        res.send(200, dr.rows.map(function(row) {
            return _.extend(_.pick(row, 'iban', 'swiftbic'), {
                id: row.bank_account_id,
                displayName: row.display_name,
                accountNumber: row.account_number,
                routingNumber: row.routing_number,
                verified: !!row.verified_at,
                verifying: !!row.verify_started_at
            })
        }))
    })
}

bankAccounts.add = function(conn, req, res, next) {
    if (!validate(req.body, 'bankaccounts_add', res)) return

    if (!req.apiKey.primary) {
        return res.send(401, {
            name: 'MissingApiKeyPermission',
            message: 'Must be primary api key'
        })
    }

    conn.write.query({
        text: [
            'INSERT INTO bank_account (user_id, account_number, iban, swiftbic,',
            'routing_number, verify_code)',
            'VALUES ($1, $2, $3, $4, $5, $6)'
        ].join('\n'),
        values: [
            req.user,
            req.body.accountNumber,
            req.body.iban,
            req.body.swiftbic,
            req.body.routingNumber,
            bankAccounts.createVerifyCode()
        ]
    }, function(err) {
        if (err) return next(err)
        res.send(204)
    })
}

bankAccounts.verify = function(conn, req, res, next) {
    if (!req.apiKey.primary) {
        return res.send(401, {
            name: 'MissingApiKeyPermission',
            message: 'Must be primary api key'
        })
    }

    conn.write.query({
        text: [
            'SELECT',
            '   verify_bank_account($1, $2, $3) success,',
            '   account_number, iban',
            'FROM bank_account',
            'WHERE bank_account_id = $2'
        ].join('\n'),
        values: [
            req.user,
            +req.params.id,
            req.body.code
        ]
    }, function(err, dr) {
        if (err) return next(err)
        var row = dr.rows[0]
        if (!row) {
            return res.send(404, {
                name: 'BankAccountNotFound',
                message: 'Bank account not found'
            })
        }

        if (!row.success) {
            return res.send(400, {
                name: 'WrongBankVerifyCode',
                message: 'Bank account verification failed. Wrong code.'
            })
        }

        activities.log(conn, req.user, 'VerifyBankAccount', {
            accountNumber: row.account_number,
            iban: row.iban
        })

        res.send(204)
    })
}
