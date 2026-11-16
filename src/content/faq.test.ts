import { describe, expect, test } from 'vitest'
import { FAQ, HOW_IT_WORKS } from './faq.ts'

describe('help content', () => {
  test('every FAQ entry has a question and an answer', () => {
    expect(FAQ.length).toBeGreaterThan(0)
    for (const item of FAQ) {
      expect(item.q.trim()).not.toBe('')
      expect(item.a.trim()).not.toBe('')
    }
  })

  test('no question appears twice', () => {
    const questions = FAQ.map((item) => item.q.trim().toLowerCase())
    expect(new Set(questions).size).toBe(questions.length)
  })

  test('every how-it-works step has a title and text', () => {
    expect(HOW_IT_WORKS.length).toBeGreaterThan(0)
    for (const step of HOW_IT_WORKS) {
      expect(step.title.trim()).not.toBe('')
      expect(step.text.trim()).not.toBe('')
    }
  })
})
