const compareSnapshotCommand = defaultScreenshotOptions => {
  const height = process.env.HEIGHT || '1280'
  const width = process.env.WIDTH || '720'

  // Disable duplicate screenshot on failure of visual regression test
  Cypress.Screenshot.defaults({
    screenshotOnRunFailure: false
  })
  
  // Force screenshot resolution to keep consistency of test runs across machines
  Cypress.config('viewportHeight', height)
  Cypress.config('viewportWidth', width)

  Cypress.Commands.add(
    'compareSnapshot',
    { prevSubject: 'optional' },
    (subject, name, testThreshold = 0) => {
      const specName = Cypress.spec.name
      const testName = `${specName.replace('.js', '')}-${name}`
      
      // Take a screenshot and copy to baseline if it does not exist
      const objToOperateOn = subject ? cy.get(subject) : cy
      objToOperateOn
        .screenshot(testName, defaultScreenshotOptions)
        .task('copyScreenshot', {
          testName,
        })

      // Compare screenshots
      const options = {
        testName,
        testThreshold,
      }
      cy.task('compareSnapshotsPlugin', options).then((percentage) => {
        if (percentage > testThreshold) {
          throw new Error(`The image difference percentage ${percentage} exceeded the threshold: ${testThreshold}`)
        }
      })
    }
  )
}

module.exports = compareSnapshotCommand
