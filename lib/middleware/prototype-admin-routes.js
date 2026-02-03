const express = require('express')

const router = express.Router()

const password = process.env.PROTOTYPE_PASSWORD

const { encryptPassword } = require('../utils')

router.get('/password', (req, res) => {
  const returnURL = req.query.returnURL || '/'
  const { error } = req.query
  res.render('password', {
    returnURL,
    error
  })
})

// Check authentication password
router.post('/password', (req, res) => {
  const submittedPassword = req.body.password
  const { returnURL } = req.body

  if (submittedPassword === password) {
    // see lib/middleware/authentication.js for explanation
    res.cookie('authentication', encryptPassword(password), {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: 'None', // Allows GET and POST requests from other domains
      httpOnly: true,
      secure: true
    })
    res.redirect(returnURL)
  } else {
    res.redirect(
      `/prototype-admin/password?error=wrong-password&returnURL=${encodeURIComponent(returnURL)}`
    )
  }
})

router.get('/reset', (req, res) => {
  let { returnPage } = req.query

  // Allow local paths only
  if (!returnPage?.startsWith('/')) {
    returnPage = '/'
  }

  res.render('reset', {
    returnPage
  })
})

router.all('/reset-session-data', (req, res) => {
  let { returnPage } = req.body ?? req.query

  // Allow local paths only
  if (!returnPage?.startsWith('/')) {
    returnPage = '/'
  }

  req.session.data = {}

  res.render('reset-done', {
    returnPage
  })
})

router.get('/colton-herta', (req, res) => {
  res.render('colton-herta')
})

router.post('/use-colton-herta-data', (req, res) => {
  req.session.data = {
    'apply-or-renew': 'apply',
    'grade-a': 'yes',
    'dob': {
      'day': '30',
      'month': '3',
      'year': '2000'
    },
    'championship-result-list': [
      {
        'championship': 'IndyCar Series',
        'year': '2025',
        'position': '7',
        'points': 4
      },
      {
        'championship': 'IndyCar Series',
        'year': '2024',
        'position': '2',
        'points': 30
      },
      {
        'championship': 'IndyCar Series',
        'year': '2023',
        'position': '10',
        'points': 1
      }
    ]
  }

  res.redirect('/check-championship-results')
})

module.exports = router
