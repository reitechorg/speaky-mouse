export function encodeTreeKey(...parts: string[]): string {
	return parts.map(encodeURIComponent).join('/');
}

export function decodeTreeKey(key: string): string[] {
	return key.split('/').map(decodeURIComponent);
}
