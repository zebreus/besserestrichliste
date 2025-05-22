import type { ComponentType } from 'svelte';
import { mount } from '../../node_modules/svelte/src/internal/client/render.js';

export function render<Props extends Record<string, unknown>>(
	Component: ComponentType | { default: ComponentType },
	options?: { props?: Props }
) {
	const container = document.createElement('div');
	document.body.appendChild(container);
	const Ctor = ((Component as { default?: ComponentType }).default ?? Component) as ComponentType;
	const component = mount(Ctor, { target: container, props: options?.props ?? {} });

	function getByRole(role: string): HTMLElement {
		if (role === 'button') {
			const btn = container.querySelector('button');
			if (!btn) throw new Error('No button element found');
			return btn as HTMLElement;
		}
		throw new Error(`Unsupported role: ${role}`);
	}

	return { container, component, getByRole };
}
