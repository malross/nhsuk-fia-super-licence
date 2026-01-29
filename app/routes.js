// External dependencies
const express = require('express')

const router = express.Router()

///////////////////////////////////////////////////////////////////////////////
// Debugging aids (h/t Craig Abbott and Vicky Teinaki RIP)

// Log all session data to the console each time we move page
router.use((req, res, next) => {
    const log = {
        method: req.method,
        url: req.originalUrl,
        data: req.session.data
    }
    console.log(JSON.stringify(log, null, 2))

    next()
})

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


///////////////////////////////////////////////////////////////////////////////
// BRANCHING FOR RENEW VS APPLY

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


///////////////////////////////////////////////////////////////////////////////
// LICENCE RENEWAL

// Redirect based on most recent season of F1, for renewal
router.post('/most-recent-f1-season-answer', function (req, res) {
    var answer = req.session.data['most-recent-season']

    req.session.data['errors'] = {}
    if (answer == "2025" || answer == "2024" || answer == "2023") {         // has recent experience
        res.redirect('/recent-driver')
    } else if (answer == "earlier") {                                       // returning legend?
        res.redirect('/returning-driver')
    } else {                                                                // not answered, so show an error
        req.session.data['errors'] = {
            'not-answered': true
        }
        res.redirect('/most-recent-f1-season')
    }
})

// Check that a recent driver is still eligible (they almost certainly are)
router.post('/recent-driver-answer', function (req, res) {
    var recentlyTested = req.session.data['recent-testing']

    req.session.data['errors'] = {}
    if (recentlyTested == "yes") {              // fine to renew; just need to pay
        res.redirect('/complete')
    } else if (recentlyTested == "no") {        // not yet eiligble
        res.redirect('/ineligible-recent-driver')
    } else {                                    // not answered, so show an error
        req.session.data['errors'] = {
            'not-answered': true
        }
        res.redirect('/recent-driver')
    }
})

// Check that a returning driver is eligible
router.post('/returning-driver-answer', function (req, res) {
    var recentlyTested = req.session.data['recent-testing']

    req.session.data['errors'] = {}
    if (recentlyTested == "yes") {              // fine to renew; just need to pay
        res.redirect('/complete')
    } else if (recentlyTested == "no") {        // not yet eiligble
        res.redirect('/ineligible-returning-driver')
    } else {                                    // not answered, so show an error
        req.session.data['errors'] = {
            'not-answered': true
        }
        res.redirect('/returning-driver')
    }
})


///////////////////////////////////////////////////////////////////////////////
// NEW LICENCE APPLICATION

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
    } else {                                        // add this championship result to the list
        // Create the list if it doesn't exist yet
        if (!req.session.data['championship-result-list']) {
            req.session.data['championship-result-list'] = []
        }

        // Add this new result to the list
        const championshipResult = {
            championship: req.session.data['championship'],
            year: req.session.data['championship-year'],
            position: req.session.data['championship-position'],
            points: "??"   // TODO
        }
        req.session.data['championship-result-list'].push(championshipResult)

        // Show a summary of results so far
        res.redirect('/check-championship-results')
    }
})

// Loop back if the driver needs to add another championship result
router.post('/check-championship-results-answer', function (req, res) {
    var addAnother = req.session.data['add-another']

    req.session.data['errors'] = {}
    if (addAnother == "yes") {                  // user wants to add another result
        req.session.data['championship'] = ""
        req.session.data['championship-year'] = ""
        req.session.data['championship-position'] = ""
        req.session.data['add-another'] = ""

        res.redirect('/select-championship')
    } else if (addAnother == "no") {            // not requesting exemption, so no point proceeding
        res.redirect('/free-practice')
    } else {                                    // not answered the question, so show error message
        req.session.data['errors'] = {
            'not-answered': true
        }
        res.redirect('/check-championship-results')
    }
})

// Removing a championship result
router.get('/confirm-remove-championship-result', function (req, res) {
  const indexToRemove = req.session.data['index']
  
  if (indexToRemove && req.session.data['championship-result-list']) {
    req.session.data['championship-result-list'].splice(indexToRemove, 1)
  }
  
  res.redirect('/check-championship-results')
})

// Check the driver's entered something sensible for their FP1 session count
router.post('/free-practice-answer', function (req, res) {
    var answer = req.session.data['free-practice-sessions']
    var sessionCount = parseInt(answer)

    req.session.data['errors'] = {}
    if (answer === "")
    {
        req.session.data['errors'] = {
            'not-answered': true
        }
        res.redirect('/free-practice')
    }
    else if (isNaN(sessionCount)) {              // not entered a valid number, so show error message
        req.session.data['errors'] = {
            'not-a-number': true
        }
        res.redirect('/free-practice')
    } else if (sessionCount < 0) {          // entered a negative number
        req.session.data['errors'] = {
            'negative-value-answer': true
        }
        res.redirect('/free-practice')
    } else {                                // valid value, even if it's over the max counted
        res.redirect('/check-total-points')
    }
})


module.exports = router
