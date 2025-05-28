import { DirectusFrame } from './lib/directus-frame.ts';
import { EditableElement } from './lib/editable-element.ts';
import { EditableStore } from './lib/editable-store.ts';
import { OverlayManager } from './lib/overlay-manager.ts';
import { PageManager } from './lib/page-manager.ts';
import type { EditConfig, EditableElementOptions } from './lib/types/index.ts';

export async function apply({
	directusUrl,
	elements = undefined,
	customClass = undefined,
	onSaved = undefined,
}: {
	directusUrl: string;
	elements?: HTMLElement | HTMLElement[] | null;
} & EditableElementOptions) {
	const directusFrame = new DirectusFrame();
	const connected = directusFrame.connect(directusUrl);
	if (!connected) return;

	const confirmed = await directusFrame.receiveConfirm();
	if (!confirmed) return;

	PageManager.onNavigation((data) => directusFrame.send('navigation', data));
	OverlayManager.addStyles();

	const editableElements = EditableElement.query(elements);
	const scopedItems: EditableElement[] = [];

	editableElements.forEach((element) => {
		const existingItem = EditableStore.getItem(element);
		const item = existingItem ?? new EditableElement(element);

		item.applyOptions({ customClass, onSaved }, !!elements);

		scopedItems.push(item);
		if (!existingItem) EditableStore.addItem(item);
	});

	return {
		remove() {
			EditableStore.removeItems(scopedItems);
		},
		enable() {
			EditableStore.enableItems(scopedItems);
		},
		disable() {
			EditableStore.disableItems(scopedItems);
		},
	};
}

export function remove() {
	EditableStore.removeItems();
}

export function disable() {
	const items = EditableStore.disableItems();
	return {
		enable() {
			EditableStore.enableItems(items);
		},
	};
}

export function setAttr(editConfig: EditConfig) {
	return EditableElement.objectToEditAttr(editConfig);
}
