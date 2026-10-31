const fs = require('fs')
const template = './src/environment/environment.template.ts'
const environment = './src/environment/environment.ts'
const baseURL = process.env.BASE_URL || 'https://qa.ticketingevents.com/v3'
const mediaURL = process.env.MEDIA_URL || 'https://qa.ticketingevents.com/media'

fs.readFile(template, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file: ${template}`, err)
    process.exit(1)
  }

  const configuredEnvironment = data
    .replace(/__BASE_URL__/g, baseURL)
    .replace(/__MEDIA_URL__/g, mediaURL)
  
  fs.writeFile(environment, configuredEnvironment, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing file: ${environment}`, err)
      process.exit(1);
    }
  })
})