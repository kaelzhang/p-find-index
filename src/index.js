const AggregateError = require('aggregate-error')
const PCancelable = require('p-cancelable')

const _find = (iterable, matcher, {
  leftMost = true
} = {}) => new PCancelable(
  (raw_resolve, raw_reject, onCancel) => {
    let done = false

    const match_results = []
    const errors = []
    const completed = new Set()

    let start = 0
    let counter = 0
    let max_index = - 1

    const cancelPending = () => {
      for (const promise of iterable) {
        if (
          promise
          && !completed.has(promise)
          && typeof promise.cancel === 'function'
        ) {
          promise.cancel()
        }
      }
    }

    onCancel(cancelPending)

    const resolve = value => {
      done = true
      raw_resolve(value)
      match_results.length = 0

      cancelPending()
    }

    const reject = error => {
      done = true
      raw_reject(error)
      match_results.length = 0

      // We won't reject if there are still pending promises,
      // so we need not cancel pending promises here.
    }

    const checkResults = () => {
      const {length} = match_results
      let j = start

      for (; j < length; j ++) {
        // Make sure the previous promises are all fulfilled
        if (!(j in match_results)) {
          break
        }

        const {
          matched,
          value
        } = match_results[j]

        if (matched) {
          // There is a leftmost match
          resolve(value)
          return
        }

        // The previous promises are not matched,
        // so increase the start pointer
        start = j + 1

        if (j === max_index) {
          // There are no matches
          if (errors.length) {
            // No matches due to errors
            reject(new AggregateError(errors))
            return
          }

          // No errors, all fulfilled but no matches
          resolve()
        }
      }
    }

    const run = async (promise, i) => {
      try {
        const value = await promise

        if (done) {
          return
        }

        const matched = matcher(value)

        match_results[i] = {
          matched,
          value
        }

        if (matched && (!leftMost || i === start)) {
          resolve(value)
          return
        }

        checkResults()
      } catch (error) {
        match_results[i] = {
          matched: false
        }

        errors.push(error)
        checkResults()
      } finally {
        completed.add(promise)
      }
    }

    for (const promise of iterable) {
      run(promise, counter ++)
    }

    max_index = counter - 1
  }
)

const find = (...args) => _find(...args).value
const findIndex = (...args) => _find(...args).index

module.exports = {
  find,
  findIndex,
  AggregateError
}
