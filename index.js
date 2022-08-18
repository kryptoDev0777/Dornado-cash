import Vue from 'vue'
import Vuex from 'vuex'
import Meta from 'vue-meta'
import ClientOnly from 'vue-client-only'
import NoSsr from 'vue-no-ssr'
import { createRouter } from './router.js'
import NuxtChild from './components/nuxt-child.js'
import NuxtError from '..\\layouts\\error.vue'
import Nuxt from './components/nuxt.js'
import App from './App.js'
import { setContext, getLocation, getRouteData, normalizeError } from './utils'
import { createStore } from './store.js'

/* Plugins */

import nuxt_plugin_provider_b7451418 from 'nuxt_plugin_provider_b7451418' // Source: .\\provider.js (mode: 'all')
import nuxt_plugin_buefy_7a92d844 from 'nuxt_plugin_buefy_7a92d844' // Source: .\\buefy.js (mode: 'all')
import nuxt_plugin_moment_6c72d705 from 'nuxt_plugin_moment_6c72d705' // Source: .\\moment.js (mode: 'all')
import nuxt_plugin_ipfs_5e2ea50d from 'nuxt_plugin_ipfs_5e2ea50d' // Source: ..\\plugins\\ipfs.js (mode: 'all')
import nuxt_plugin_clipboard_2706179f from 'nuxt_plugin_clipboard_2706179f' // Source: ..\\plugins\\clipboard (mode: 'client')
import nuxt_plugin_detectIPFS_5a40ef24 from 'nuxt_plugin_detectIPFS_5a40ef24' // Source: ..\\plugins\\detectIPFS (mode: 'client')
import nuxt_plugin_localStorage_3e0f79e7 from 'nuxt_plugin_localStorage_3e0f79e7' // Source: ..\\plugins\\localStorage (mode: 'client')
import nuxt_plugin_preventMultitabs_c3ed89d4 from 'nuxt_plugin_preventMultitabs_c3ed89d4' // Source: ..\\plugins\\preventMultitabs (mode: 'client')
import nuxt_plugin_idb_6e036920 from 'nuxt_plugin_idb_6e036920' // Source: ..\\plugins\\idb (mode: 'client')
import nuxt_plugin_vidle_f95a885a from 'nuxt_plugin_vidle_f95a885a' // Source: ..\\plugins\\vidle (mode: 'client')
import nuxt_plugin_sessionStorage_24cff2c8 from 'nuxt_plugin_sessionStorage_24cff2c8' // Source: ..\\plugins\\sessionStorage (mode: 'client')
import nuxt_plugin_numbro_321f0f50 from 'nuxt_plugin_numbro_321f0f50' // Source: ..\\plugins\\numbro\\numbro (mode: 'all')
import nuxt_plugin_i18n_1fba523a from 'nuxt_plugin_i18n_1fba523a' // Source: ..\\plugins\\i18n.js (mode: 'all')

// Component: <ClientOnly>
Vue.component(ClientOnly.name, ClientOnly)

// TODO: Remove in Nuxt 3: <NoSsr>
Vue.component(NoSsr.name, {
  ...NoSsr,
  render (h, ctx) {
    if (process.client && !NoSsr._warned) {
      NoSsr._warned = true

      console.warn('<no-ssr> has been deprecated and will be removed in Nuxt 3, please use <client-only> instead')
    }
    return NoSsr.render(h, ctx)
  }
})

// Component: <NuxtChild>
Vue.component(NuxtChild.name, NuxtChild)
Vue.component('NChild', NuxtChild)

// Component NuxtLink is imported in server.js or client.js

// Component: <Nuxt>
Vue.component(Nuxt.name, Nuxt)

Object.defineProperty(Vue.prototype, '$nuxt', {
  get() {
    return this.$root.$options.$nuxt
  },
  configurable: true
})

Vue.use(Meta, {"keyName":"head","attribute":"data-n-head","ssrAttribute":"data-n-head-ssr","tagIDKeyName":"hid"})

const defaultTransition = {"name":"page","mode":"out-in","appear":true,"appearClass":"appear","appearActiveClass":"appear-active","appearToClass":"appear-to"}

const originalRegisterModule = Vuex.Store.prototype.registerModule
const baseStoreOptions = { preserveState: process.client }

function registerModule (path, rawModule, options = {}) {
  return originalRegisterModule.call(this, path, rawModule, { ...baseStoreOptions, ...options })
}

async function createApp(ssrContext, config = {}) {
  const router = await createRouter(ssrContext)

  const store = createStore(ssrContext)
  // Add this.$router into store actions/mutations
  store.$router = router

  // Create Root instance

  // here we inject the router and store to all child components,
  // making them available everywhere as `this.$router` and `this.$store`.
  const app = {
    head: {"title":"Tornado.cash","meta":[{"charset":"utf-8"},{"http-equiv":"Content-Security-Policy","content":"img-src 'self' data:;font-src data:;style-src 'self' 'unsafe-inline';connect-src *;script-src 'self' 'unsafe-eval' 'unsafe-inline';default-src 'self';object-src 'none';base-uri 'none';upgrade-insecure-requests;child-src blob:;worker-src blob:;"},{"name":"Referer-Policy","content":"no-referrer"},{"name":"viewport","content":"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"},{"name":"theme-color","content":"#000403"},{"hid":"description","name":"description","content":"Non-custodial Ethereum Privacy solution."},{"hid":"og:title","property":"og:title","content":"Tornado.Cash"},{"hid":"og:description","property":"og:description","content":"Non-custodial, trustless, serverless, private transactions on Ethereum network"},{"hid":"og:url","property":"og:url","content":"https:\u002F\u002Ftornado.cash"},{"hid":"og:type","property":"og:type","content":"website"},{"hid":"og:image","property":"og:image","content":"https:\u002F\u002Ftornado.cash\u002Ftw.png"},{"hid":"description","name":"description","content":"Non-custodial, trustless, serverless, private transactions on Ethereum network"},{"hid":"keywords","name":"keywords","content":"Tornado, Ethereum, ERC20, dapp, smart contract, decentralized, metamask, zksnark, zero knowledge"}],"link":[{"rel":"manifest","href":"\u002Fmanifest.json"},{"rel":"shortcut icon","type":"image\u002Fx-icon","href":"\u002Ffavicon\u002Ffavicon.ico"},{"rel":"apple-touch-icon","href":"\u002Ffavicon\u002Fapple-touch-icon.png"}],"style":[],"script":[]},

    store,
    router,
    nuxt: {
      defaultTransition,
      transitions: [defaultTransition],
      setTransitions (transitions) {
        if (!Array.isArray(transitions)) {
          transitions = [transitions]
        }
        transitions = transitions.map((transition) => {
          if (!transition) {
            transition = defaultTransition
          } else if (typeof transition === 'string') {
            transition = Object.assign({}, defaultTransition, { name: transition })
          } else {
            transition = Object.assign({}, defaultTransition, transition)
          }
          return transition
        })
        this.$options.nuxt.transitions = transitions
        return transitions
      },

      err: null,
      dateErr: null,
      error (err) {
        err = err || null
        app.context._errored = Boolean(err)
        err = err ? normalizeError(err) : null
        let nuxt = app.nuxt // to work with @vue/composition-api, see https://github.com/nuxt/nuxt.js/issues/6517#issuecomment-573280207
        if (this) {
          nuxt = this.nuxt || this.$options.nuxt
        }
        nuxt.dateErr = Date.now()
        nuxt.err = err
        // Used in src/server.js
        if (ssrContext) {
          ssrContext.nuxt.error = err
        }
        return err
      }
    },
    ...App
  }

  // Make app available into store via this.app
  store.app = app

  const next = ssrContext ? ssrContext.next : location => app.router.push(location)
  // Resolve route
  let route
  if (ssrContext) {
    route = router.resolve(ssrContext.url).route
  } else {
    const path = getLocation(router.options.base, router.options.mode)
    route = router.resolve(path).route
  }

  // Set context to app.context
  await setContext(app, {
    store,
    route,
    next,
    error: app.nuxt.error.bind(app),
    payload: ssrContext ? ssrContext.payload : undefined,
    req: ssrContext ? ssrContext.req : undefined,
    res: ssrContext ? ssrContext.res : undefined,
    beforeRenderFns: ssrContext ? ssrContext.beforeRenderFns : undefined,
    ssrContext
  })

  function inject(key, value) {
    if (!key) {
      throw new Error('inject(key, value) has no key provided')
    }
    if (value === undefined) {
      throw new Error(`inject('${key}', value) has no value provided`)
    }

    key = '$' + key
    // Add into app
    app[key] = value
    // Add into context
    if (!app.context[key]) {
      app.context[key] = value
    }

    // Add into store
    store[key] = app[key]

    // Check if plugin not already installed
    const installKey = '__nuxt_' + key + '_installed__'
    if (Vue[installKey]) {
      return
    }
    Vue[installKey] = true
    // Call Vue.use() to install the plugin into vm
    Vue.use(() => {
      if (!Object.prototype.hasOwnProperty.call(Vue.prototype, key)) {
        Object.defineProperty(Vue.prototype, key, {
          get () {
            return this.$root.$options[key]
          }
        })
      }
    })
  }

  // Inject runtime config as $config
  inject('config', config)

  if (process.client) {
    // Replace store state before plugins execution
    if (window.__NUXT__ && window.__NUXT__.state) {
      store.replaceState(window.__NUXT__.state)
    }
  }

  // Add enablePreview(previewData = {}) in context for plugins
  if (process.static && process.client) {
    app.context.enablePreview = function (previewData = {}) {
      app.previewData = Object.assign({}, previewData)
      inject('preview', previewData)
    }
  }
  // Plugin execution

  if (typeof nuxt_plugin_provider_b7451418 === 'function') {
    await nuxt_plugin_provider_b7451418(app.context, inject)
  }

  if (typeof nuxt_plugin_buefy_7a92d844 === 'function') {
    await nuxt_plugin_buefy_7a92d844(app.context, inject)
  }

  if (typeof nuxt_plugin_moment_6c72d705 === 'function') {
    await nuxt_plugin_moment_6c72d705(app.context, inject)
  }

  if (typeof nuxt_plugin_ipfs_5e2ea50d === 'function') {
    await nuxt_plugin_ipfs_5e2ea50d(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_clipboard_2706179f === 'function') {
    await nuxt_plugin_clipboard_2706179f(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_detectIPFS_5a40ef24 === 'function') {
    await nuxt_plugin_detectIPFS_5a40ef24(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_localStorage_3e0f79e7 === 'function') {
    await nuxt_plugin_localStorage_3e0f79e7(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_preventMultitabs_c3ed89d4 === 'function') {
    await nuxt_plugin_preventMultitabs_c3ed89d4(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_idb_6e036920 === 'function') {
    await nuxt_plugin_idb_6e036920(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_vidle_f95a885a === 'function') {
    await nuxt_plugin_vidle_f95a885a(app.context, inject)
  }

  if (process.client && typeof nuxt_plugin_sessionStorage_24cff2c8 === 'function') {
    await nuxt_plugin_sessionStorage_24cff2c8(app.context, inject)
  }

  if (typeof nuxt_plugin_numbro_321f0f50 === 'function') {
    await nuxt_plugin_numbro_321f0f50(app.context, inject)
  }

  if (typeof nuxt_plugin_i18n_1fba523a === 'function') {
    await nuxt_plugin_i18n_1fba523a(app.context, inject)
  }

  // Lock enablePreview in context
  if (process.static && process.client) {
    app.context.enablePreview = function () {
      console.warn('You cannot call enablePreview() outside a plugin.')
    }
  }

  // If server-side, wait for async component to be resolved first
  if (process.server && ssrContext && ssrContext.url) {
    await new Promise((resolve, reject) => {
      router.push(ssrContext.url, resolve, (err) => {
        // https://github.com/vuejs/vue-router/blob/v3.4.3/src/util/errors.js
        if (!err._isRouter) return reject(err)
        if (err.type !== 2 /* NavigationFailureType.redirected */) return resolve()

        // navigated to a different route in router guard
        const unregister = router.afterEach(async (to, from) => {
          ssrContext.url = to.fullPath
          app.context.route = await getRouteData(to)
          app.context.params = to.params || {}
          app.context.query = to.query || {}
          unregister()
          resolve()
        })
      })
    })
  }

  return {
    store,
    app,
    router
  }
}

export { createApp, NuxtError }
