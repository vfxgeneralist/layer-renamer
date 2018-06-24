// filterExpression.test.js
// LayerRenamer
//
// created by Leonard Pauli, jun 2018
// copyright © Leonard Pauli 2018

import sfo, {log} from 'string-from-object'

import {testTokenizeStr, logAstValue} from '../parser/testUtils'
import {expand} from '../parser/lexemUtils'

import {evaluateStr, exprCtxDefaultGet} from '.'
import lexems from './lexems'


describe('tokenize', ()=> {
	describe('minor', ()=> {
		const {id, text} = lexems

		const l1 = {lexems: [id.strip]}; expand(l1)
		testTokenizeStr({lexem: l1}, 'haa', [['haa', '@.id']])
		testTokenizeStr(exprCtxDefaultGet(), 'haa', [['haa', '@.id']])
		const l2 = {lexems: [text.raw]}; expand(l2)
		testTokenizeStr({lexem: l2}, 'haa', [['haa', '@.text.raw']])
	})

	describe('more', ()=> {
		testTokenizeStr(exprCtxDefaultGet(), 'a.aa', [['a', '@.id'], ['.', '@.dot'], ['aa', '@.id']])
		testTokenizeStr(exprCtxDefaultGet(), '(a.aa + y)', [
			['(', '@.paren.open'], ...[
				['a'], ['.'], ['aa'], [' ', '@.sp'], ['+', '@.id.special'], [' ', '@.sp'], ['y', '@.id'],
			], [')', '@.paren.close'],
		])
		testTokenizeStr(exprCtxDefaultGet(), '"hello\\(d + "y") there"', [
			['"', '@.text.open'], ...[
				['hello', '@.text.raw'], ['\\(', '@.text.expr.open'], ['(', '@.paren.open'], ...[
					['d', '@.id'], [' '], ['+'], [' '],
					['"', '@.text.open'], ['y'], ['"', '@.text.close'],
				], [')', '@.paren.close'], [' there'],
			], ['"', '@.text.close'],
		])
		testTokenizeStr(exprCtxDefaultGet(), 'a+', [['a', '@.id'], ['+', '@.id.special']])
	})
})

describe('evaluate', ()=> {
	// tokenizeNextCore(ctx, '"hel\\(add (55, 3, 7) rr)lo"')
	// ctx.vars.str = 'hello'
	// ctx.vars.add = '+++'
	const tests = {
		'1': [1],
		'2+3': [5],
		' 2 + 3': [void 0, ' 2 + 3'],
		'2 + 3': [5],
		'2*3+4': [10],
		'2+3*4': [14],
		'(2+3)*4': [20],
		'( (3 * (4) + 2) )': [14],
	}
	Object.keys(tests).forEach(k=> it(k, ()=> {
		const {value, restStr} = evaluateStr(k)
		const [valuet, restStrt] = tests[k]
		expect(value).toBe(valuet)
		restStrt !== void 0 && expect(restStr).toBe(restStrt)
	}))
})
