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

// Check that the driver has their International Grade A licence and redirect accordingly
router.post('/grade-a-check-answer', function (req, res) {
    var gradeALicence = req.session.data['grade-a']

    req.session.data['errors'] = {}
    if (gradeALicence == "yes") {           // got licence, can continue
        res.redirect('/age-check')
    } else if (gradeALicence == "no") {     // not got licence, so ineligible
        res.redirect('/ineligible-grade-a')
    } else {                                // not answered, so show error
        req.session.data['errors'] = {
            'not-answered': true
        }
        res.redirect('/grade-a-check')
    }
})


module.exports = router
