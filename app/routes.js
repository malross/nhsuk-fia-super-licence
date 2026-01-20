// External dependencies
const express = require('express')

const router = express.Router()

// Utility functions
function calculateAgeOnDate(birthDateText, futureDateText) {
    const birthDate = new Date(birthDateText) // e.g., '1990-05-15'
    const futureDate = new Date(futureDateText) // e.g., '2026-01-01'

    let age = futureDate.getFullYear() - birthDate.getFullYear()
    const monthDifference = futureDate.getMonth() - birthDate.getMonth()

    // If the birthday hasn't happened yet in the future year, subtract 1
    if (monthDifference < 0 || (monthDifference === 0 && futureDate.getDate() < birthDate.getDate())) {
        age--
    }

    return age
}


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

// Check that the driver is old enough to compete in F1 this year and redirect accordingly
router.post('/age-check-answer', function (req, res) {
    const day = req.session.data['dob']['day']
    const month = req.session.data['dob']['month']
    const year = req.session.data['dob']['year']
    const dateOfBirth = new Date(year + '-' + String(month).padStart(2, "0") + '-' + String(day).padStart(2, "0"))

    if (!(day && month && year)) {
        req.session.data['errors'] = {              // not answered all parts, so show an error
            'missing-day': !day,
            'missing-month': !month,
            'missing-year': !year
        }
        res.redirect('/age-check')
    } else if (isNaN(dateOfBirth)) {
        req.session.data['errors'] = {              // not entered a real date, so show an error
            'invalid-date': true
        }
        res.redirect('/age-check')
    } else if (dateOfBirth.getTime() > Date.now()) {
        req.session.data['errors'] = {              // entered a real date but in the future, so show an error
            'future-date': true
        }
        res.redirect('/age-check')
    } else {
        req.session.data['errors'] = {}             // input's all good, so apply FIA rules

        // TODO: how does the FIA work for mid-season applications? Does this logic just need to include
        // all race dates for the current/coming season and then say when the driver would be able to
        // start their first race?
        const firstRaceOfSeason = '2026-03-08';
        var age = calculateAgeOnDate(dateOfBirth, firstRaceOfSeason)

        if (age >= 18) {
            res.redirect('/super-licence-points')
        } else if (age == 17) {
            res.redirect('/age-exemption')
        } else {
            res.redirect('/ineligible-age')
        }
    }
})

// Process the 17 year old driver's request for an age exemption
router.post('/age-exemption-answer', function (req, res) {
    var requestedExemption = req.session.data['age-exemption']

    req.session.data['errors'] = {}
    if (requestedExemption == "yes") {          // requesting exemption; must explain next steps at end of transaction flow
        res.redirect('/super-licence-points')
    } else if (requestedExemption == "no") {    // not requesting exemption, so no point proceeding
        res.redirect('/ineligible-age')
    } else {                                    // not answered the question, so show error message
        req.session.data['errors'] = {
            'not-answered': true
        }
        res.redirect('/age-exemption')
    }
})

// Make sure one of the championships has been selected
router.post('/select-championship-answer', function (req, res) {
    var championship = req.session.data['championship']

    req.session.data['errors'] = {}
    if (!championship) {                        // not answered the question, so show error message
        req.session.data['errors'] = {
            'not-answered': true
        }
        res.redirect('/select-championship')
    } else {                                    // carry on
        res.redirect('/select-championship-year')
    }
})

// Make sure one of the years has been selected
router.post('/select-championship-year-answer', function (req, res) {
    var year = req.session.data['championship-year']

    req.session.data['errors'] = {}
    if (!year) {                                    // not answered the question, so show error message
        req.session.data['errors'] = {
            'not-answered': true
        }
        res.redirect('/select-championship-year')
    } else {                                        // carry on
        res.redirect('/select-championship-position')
    }
})

// Make sure one of the points-scoring positions has been selected
router.post('/select-championship-position-answer', function (req, res) {
    var position = req.session.data['championship-position']

    req.session.data['errors'] = {}
    if (!position) {                                // not answered the question, so show error message
        req.session.data['errors'] = {
            'not-answered': true
        }
        res.redirect('/select-championship-position')
    } else {                                        // carry on
        res.redirect('/check-championship-results')
    }
})

// Loop back if the driver needs to add another championship result
router.post('/check-championship-results-answer', function (req, res) {
    var addAnother = req.session.data['add-another']

    req.session.data['errors'] = {}
    if (addAnother == "yes") {          // more to add
        res.redirect('/select-championship')
    } else if (addAnother == "no") {    // not requesting exemption, so no point proceeding
        res.redirect('/free-practice')
    } else {                                    // not answered the question, so show error message
        req.session.data['errors'] = {
            'not-answered': true
        }
        res.redirect('/check-championship-results')
    }
})

// Check the driver's entered something sensible for their FP1 session count
router.post('/free-practice-answer', function (req, res) {
    var sessionCount = req.session.data['free-practice-sessions']

    // TODO: learn JavaScript so I can do some more sensible value checking here. Falsyness is catching me out.
    req.session.data['errors'] = {}
    if (sessionCount == 0) {                // done no free practice, so no points /shrug
        res.redirect('/complete')
    } else if (!sessionCount) {             // not answered the question, so show error message
        req.session.data['errors'] = {
            'not-answered': true
        }
        res.redirect('/free-practice')
    } else if (sessionCount >= 1) {         // done free practice, so up to 10 pts max (as of Jan 2026)
        res.redirect('/complete')
    } else {                                // entered a weird value, so show error message
        req.session.data['errors'] = {
            'invalid-value': true
        }
        res.redirect('/free-practice')
    }
})


module.exports = router
