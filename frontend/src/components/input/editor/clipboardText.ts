import type {Fragment, Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

const LIST_TYPES = ['bulletList', 'orderedList']

// Plain-text version of a copied selection. ProseMirror's default flattens lists into
// bare lines, so bullet and numbered markers are written out here to keep the structure.
export function sliceToPlainText(slice: Slice): string {
	const lines: string[] = []
	appendBlocks(slice.content, '', lines)
	return lines.join('\n')
}

function appendBlocks(fragment: Fragment, indent: string, lines: string[]) {
	fragment.forEach(node => appendBlock(node, indent, lines))
}

function appendBlock(node: ProseMirrorNode, indent: string, lines: string[]) {
	if (LIST_TYPES.includes(node.type.name)) {
		const start = Number(node.attrs.start ?? 1)
		node.forEach((item, _offset, index) => {
			const marker = node.type.name === 'orderedList' ? `${start + index}. ` : '- '
			appendListItem(item, indent, marker, lines)
		})
		return
	}

	if (node.isTextblock) {
		lines.push(indent + node.textContent)
		return
	}

	if (!node.isLeaf) {
		appendBlocks(node.content, indent, lines)
	}
}

function appendListItem(item: ProseMirrorNode, indent: string, marker: string, lines: string[]) {
	const childIndent = indent + ' '.repeat(marker.length)
	const itemLines: string[] = []
	appendBlocks(item.content, childIndent, itemLines)

	if (itemLines.length === 0) {
		lines.push(indent + marker.trimEnd())
		return
	}

	// The first line of the item carries the marker; continuation lines keep their nested indent.
	itemLines[0] = indent + marker + itemLines[0].slice(childIndent.length)
	lines.push(...itemLines)
}
