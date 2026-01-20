// External dependencies
const express = require('express')

const router = express.Router()

// Add your routes here - above the module.exports line

// Check that one of the application types was selected and redirect accordingly
router.post('/apply-or-renew-answer', function (req, res) {
    var applicationType = req.session.data['apply-or-renew']

    req.session.data['errors'] = {}
    if (applicationType == "renew") {           // renewing licence
        res.redirect('/most-recent-f1-season')
    } else if (applicationType == "apply") {    // applying for a new licence
        res.redirect('/grade-a-check')
    } else {                                    // not answered, so show an error
        req.session.data['errors'] = {
            'not-answered': true
        }
        res.redirect('/apply-or-renew')
    }
})
module.exports = router
