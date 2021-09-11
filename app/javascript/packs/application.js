import Rails from "@rails/ujs"
import "channels"

Rails.start()

const images = require.context('../images', true)
name => images(name, true)
