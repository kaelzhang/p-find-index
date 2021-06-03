const AggregateError = require('aggregate-error')
const PCancelable = require('p-cancelable')

class MatchError extends Error {}

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
          value,
          index
        } = match_results[j]

        if (matched) {
          // There is a leftmost match
          resolve({
            value,
            index
          })
          return
        }

        // The previous promises are not matched,
        // so increase the start pointer
        start = j + 1

        if (j === max_index) {
          // If no matches, there must be errors
          reject(new AggregateError(errors))
        }
      }
    }

    const run = async (
      promise,
      // `iter_index` is the sequence index of an iteratee
      iter_index,
      // For example, for the item 2 in array [1, <empty>, 2]
      // iter_index is 1
      // index is 2
      index
    ) => {
      try {
        const value = await promise

        if (done) {
          return
        }

        const matched = matcher(value)

        if (matched) {
          match_results[iter_index] = {
            matched,
            value,
            index
          }

          if (!leftMost || iter_index === start) {
            resolve({
              value,
              index
            })
            return
          }

          checkResults()
        } else {
          const error = new MatchError('value not satisfy the matcher')
          error.index = index

          throw error
        }
      } catch (error) {
        match_results[iter_index] = {
          matched: false,
          index
        }

        error.index = index
        errors.push(error)

        checkResults()
      } finally {
        completed.add(promise)
      }
    }

    if (Array.isArray(iterable)) {
      iterable.forEach((promise, search_index) => {
        run(promise, counter ++, search_index)
      })
    } else {
      for (const promise of iterable) {
        run(promise, counter, counter ++)
      }
    }

    if (counter === 0) {
      resolve({
        index: - 1
      })
      return
    }

    max_index = counter - 1
  }
)

const find = async (...args) => (await _find(...args)).value
const findIndex = async (...args) => (await _find(...args)).index

module.exports = {
  find,
  findIndex,
  AggregateError,
  MatchError
}
