import Vue from 'vue'
import Buefy from 'buefy'

Vue.use(Buefy, {
  "css": false,
  "materialDesignIcons": false,
  "materialDesignIconsHRef": "https://cdn.jsdelivr.net/npm/@mdi/font@5.8.55/css/materialdesignicons.min.css",
  "async": true,
  "defaultIconPack": "trnd",
  "defaultModalCanCancel": [
    "escape",
    "button",
    "outside"
  ],
  "defaultProgrammaticPromise": true,
  "customIconPacks": {
    "trnd": {
      "sizes": {
        "default": "trnd-24px",
        "is-small": null,
        "is-medium": "trnd-36px",
        "is-large": "trnd-48px"
      },
      "iconPrefix": "trnd-"
    }
  }
})