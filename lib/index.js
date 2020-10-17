'use strict'
const url = require('url')
const { Dropbox } = require('dropbox')
const fetch = require('node-fetch')

// replace dropbox download url for direct link
const dropBoxResultUrlRegularExpression = /www.dropbox.com/
const dropBoxDownloadUrl = 'dl.dropboxusercontent.com'

module.exports = {
  init(providerOptions) {
    // init provider
    const dbx = new Dropbox({ accessToken: providerOptions.accessToken, fetch })

    return {
      upload(file) {
        // upload the file in the provider
        return new Promise((resolve, reject) => {
          dbx.filesUpload({
            path: `/uploads/${file.hash}${file.ext}`,
            contents: file.buffer
          })
            .then(dropboxFile => dbx.sharingCreateSharedLink({ path: dropboxFile.path_display }))
            .then(sharedFile => {
              file.public_id = sharedFile.path
              file.url = sharedFile.url
              return resolve()
            })
            .catch(err => {
              reject(err)
            })
        })
      },
      delete(file) {
        // delete the file in the provider
        return new Promise((resolve, reject) => {
          dbx.filesDeleteV2({ path: `/uploads/${file.hash}${file.ext}` })
            .then(() => resolve())
            .catch(err => reject(err))
        })
      }
    }
  }
}
