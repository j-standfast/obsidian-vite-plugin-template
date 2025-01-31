export function normalizeFilePath(path: string): string {
	if (!path) return "";
	// Convert Windows backslashes to forward slashes
	return path.replace(/\\/g, "/");
}
