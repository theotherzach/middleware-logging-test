import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import { browserHistory } from 'react-router'
import makeRootReducer from './reducers'
import { updateLocation } from './location'

export default (initialState = {}) => {
  // ======================================================
  // Middleware Configuration
  // ======================================================
  const middleware = [thunk, function ({getState}) {
    return (next) => (action) => {
      let KEY_OF_INTEREST = "counter"
      let KEYS_PROPER_VALUE = 0
      let originalState = getState()
      console.timeStamp(`${KEY_OF_INTEREST} original state: ${originalState[KEY_OF_INTEREST]}`)
      console.log("originalState: ", originalState)
      console.log("will dispatch ", action)
      let returnValue = next(action)
      console.log("nextState: ", getState())
      console.assert(KEYS_PROPER_VALUE === getState()[KEY_OF_INTEREST],
        `${KEY_OF_INTEREST} value is not ${KEYS_PROPER_VALUE}`)
      console.timeStamp(`${KEY_OF_INTEREST}: ${originalState[KEY_OF_INTEREST]}`)
      console.log("originalState: ", originalState)
      return returnValue
    }
  }]

  // ======================================================
  // Store Enhancers
  // ======================================================
  const enhancers = []

  let composeEnhancers = compose

  if (__DEV__) {
    const composeWithDevToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    if (typeof composeWithDevToolsExtension === 'function') {
      composeEnhancers = composeWithDevToolsExtension
    }
  }

  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = createStore(
    makeRootReducer(),
    initialState,
    composeEnhancers(
      applyMiddleware(...middleware),
      ...enhancers
    )
  )
  store.asyncReducers = {}

  // To unsubscribe, invoke `store.unsubscribeHistory()` anytime
  store.unsubscribeHistory = browserHistory.listen(updateLocation(store))

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const reducers = require('./reducers').default
      store.replaceReducer(reducers(store.asyncReducers))
    })
  }

  return store
}
