export class Plugin {
	// Add minimal implementation as needed
	constructor() {}
	addCommand() {}
	registerEvent() {}
}

export class Notice {
	constructor(message: string) {
		console.log("Notice:", message);
	}
}

// Add other Obsidian APIs as needed
export const Platform = {
	isMobile: false,
	isDesktop: true,
};
