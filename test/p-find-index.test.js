const test = require('ava')
const delay = require('delay')
const PCancelable = require('p-cancelable')

const {
  find,
  findIndex,
  AggregateError,
  MatchError
} = require('..')

const create = () => [
  delay(10).then(() => 20),
  delay(100).then(() => 100),
  delay(50).then(() => 10),
  delay(60).then(() => 90)
]

const createSparse = () => {
  const array = []

  array[0] = delay(100).then(() => 100)
  array[1] = delay(100).then(() => 100)

  array[3] = delay(50).then(() => 10)
  array[5] = delay(60).then(() => 90)

  return array
}

function* iter () {
  yield delay(100).then(() => 100)
  yield delay(50).then(() => 10)
  yield delay(60).then(() => 90)
}

const matcher = v => v > 50

test('first match not at first index, comes after', async t => {
  t.is(await find(create(), matcher), 100)
  t.is(await find(create(), matcher, {leftMost: false}), 90)

  t.is(await findIndex(create(), matcher), 1)
  t.is(await findIndex(create(), matcher, {leftMost: false}), 3)
  t.is(await findIndex(createSparse(), matcher, {leftMost: false}), 5)
})

test('first match not at first index, comes first', async t => {
  t.is(
    await find(
      [
        delay(100).then(() => 20),
        delay(10).then(() => 100)
      ],
      matcher
    ),
    100
  )
})

test('first match at first index', async t => {
  t.is(await find(iter(), matcher), 100)
  t.is(await find(iter(), matcher, {leftMost: false}), 90)
})

test('empty array', async t => {
  t.is(await find([], matcher))
  t.is(await findIndex([], matcher), - 1)
})

test('not found due to no matches', async t => {
  try {
    await find([
      10
    ], matcher)
  } catch (error) {
    t.true(error instanceof AggregateError)

    for (const err of error) {
      t.true(err instanceof MatchError)
      t.is(err.index, 0)
    }

    return
  }

  t.fail()
})

test('not found due to rejections', async t => {
  try {
    await find([
      Promise.reject(new Error('foo'))
    ], matcher)
  } catch (error) {
    t.true(error instanceof AggregateError)

    for (const err of error) {
      t.is(err.message, 'foo')
    }

    return
  }

  t.fail()
})

test('cancelable', async t => {
  t.is(
    await find([
      new PCancelable((_, reject, onCancel) => {
        let cancelled = false

        onCancel(() => {
          cancelled = true
        })

        delay(100).then(() => {
          if (cancelled) {
            return
          }

          reject('booooooooom!')
        })
      }),
      delay(50).then(() => 100)
    ], matcher),
    100
  )
})
