import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

import _09fb71f2 from '..\\pages\\451.vue'
import _8c29ad38 from '..\\pages\\account.vue'
import _474349b4 from '..\\pages\\compliance.vue'
import _4d3463fb from '..\\pages\\governance.vue'
import _20bf9027 from '..\\pages\\governance\\index.vue'
import _1ee6bf77 from '..\\pages\\governance\\create.vue'
import _0771704f from '..\\pages\\governance\\_id.vue'
import _02e1ad6e from '..\\pages\\index.vue'

// TODO: remove in Nuxt 3
const emptyFn = () => {}
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onComplete = emptyFn, onAbort) {
  return originalPush.call(this, location, onComplete, onAbort)
}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: decodeURI('/'),
  linkActiveClass: '',
  linkExactActiveClass: 'is-active',
  scrollBehavior,

  routes: [{
    path: "/451",
    component: _09fb71f2,
    name: "451"
  }, {
    path: "/account",
    component: _8c29ad38,
    name: "account"
  }, {
    path: "/compliance",
    component: _474349b4,
    name: "compliance"
  }, {
    path: "/governance",
    component: _4d3463fb,
    children: [{
      path: "",
      component: _20bf9027,
      name: "governance"
    }, {
      path: "create",
      component: _1ee6bf77,
      name: "governance-create"
    }, {
      path: ":id",
      component: _0771704f,
      name: "governance-id"
    }]
  }, {
    path: "/",
    component: _02e1ad6e,
    name: "index"
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
