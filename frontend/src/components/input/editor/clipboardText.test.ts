import {describe, it, expect} from 'vitest'
import {getSchema} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

import {sliceToPlainText} from './clipboardText'

const schema = getSchema([StarterKit])

function text(value: string) {
	return {type: 'text', text: value}
}

function paragraph(value: string) {
	return {type: 'paragraph', content: [text(value)]}
}

function plainText(content: unknown[]) {
	const doc = schema.nodeFromJSON({type: 'doc', content})
	return sliceToPlainText(doc.slice(0))
}

describe('sliceToPlainText', () => {
	it('writes bullet markers for each list item', () => {
		const result = plainText([
			paragraph('start'),
			{
				type: 'bulletList',
				content: ['this', 'is', 'a', 'list'].map(value => ({
					type: 'listItem',
					content: [paragraph(value)],
				})),
			},
			paragraph('end'),
		])

		expect(result).toBe('start\n- this\n- is\n- a\n- list\nend')
	})

	it('numbers ordered list items', () => {
		const result = plainText([{
			type: 'orderedList',
			attrs: {start: 3},
			content: [
				{type: 'listItem', content: [paragraph('third')]},
				{type: 'listItem', content: [paragraph('fourth')]},
			],
		}])

		expect(result).toBe('3. third\n4. fourth')
	})

	it('indents nested lists under their parent marker', () => {
		const result = plainText([{
			type: 'bulletList',
			content: [{
				type: 'listItem',
				content: [
					paragraph('parent'),
					{
						type: 'bulletList',
						content: [{type: 'listItem', content: [paragraph('child')]}],
					},
				],
			}],
		}])

		expect(result).toBe('- parent\n  - child')
	})
})
