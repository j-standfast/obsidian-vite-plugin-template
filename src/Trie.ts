export class TrieNode<T> extends Map<string, TrieNode<T>> {
	private _key: string | null;
	private _parent: TrieNode<T> | null;
	data: T[];

	constructor(
		key: string | null,
		data: T[] = [],
		parent: TrieNode<T> | null = null
	) {
		super();
		if (key === null && parent !== null) {
			throw new Error(
				"key === null allowed only if parent === null (root node)"
			);
		}
		this._key = key;
		this._parent = parent;
		this.data = data;
	}

	get key(): string | null {
		return this._key;
	}

  get parent(): TrieNode<T> | null {
		return this._parent;
	}

	hasData(): boolean {
		return this.data.length > 0;
	}

	isLeaf(): boolean {
		return this.size === 0;
	}

	get children(): IterableIterator<TrieNode<T>> {
		return this.values();
	}

	get path(): string[] {
		if (this.key === null) return [];
		const parentPath = this.parent?.path ?? [];
		return [...parentPath, this.key];
	}
}

export interface DeleteDataResult<T> {
	deletedData: T[];
	deletedNode: TrieNode<T> | null;
	lastFoundNode: TrieNode<T>;
}

export type DeleteDataTarget<T> = T | T[] | ((datum: T) => boolean);

export class Trie<T> {
	root: TrieNode<T>;
	matchPos: TrieNode<T>;
	separator: string;

	constructor(
		rootKey: string = "",
		rootData: T[] = [],
		options: { separator: string } = { separator: " " }
	) {
		this.separator = options.separator;
		this.root = new TrieNode(rootKey, rootData, null);
		this.matchPos = this.root;
	}

	getKeyParts(pathKey: string): string[] {
		return pathKey.split(this.separator);
	}

	getOrInsertKey(node: TrieNode<T>, keyPart: string): TrieNode<T> {
		const child = node.get(keyPart) ?? new TrieNode<T>(keyPart, [], node);
		node.set(keyPart, child);
		return child;
	}

	resetMatchPos() {
		this.matchPos = this.root;
	}

	insert(path: string, value: T) {
		// console.log("Trie |insert", { this: this, keys, value });
		const pathKeys = this.getKeyParts(path);
		let curr: TrieNode<T> = this.root;
		for (let i = 0; i < pathKeys.length; i++) {
			const key = pathKeys[i];
			curr = this.getOrInsertKey(curr, key);
		}
		curr.data.push(value);
  }

	findNode(key: string): { node: TrieNode<T>; success: boolean } {
		const pathKeys = this.getKeyParts(key);
		let prev: TrieNode<T> = this.root;
		let curr: TrieNode<T> | undefined = prev;

		for (let i = 0; i < pathKeys.length; i++) {
			const key = pathKeys[i];
			curr = prev.get(key);
			if (!curr) break;
			prev = curr;
		}

		return { node: curr ?? prev, success: curr !== undefined };
	}

	keyExists(pathKey: string): boolean {
		const { node, success } = this.findNode(pathKey);
		return success;
  }
  
  prune(node: TrieNode<T>): boolean {
    if (node.data.length > 0) return false;
    if (node.size > 0) return false;
    if (!node.parent) return false;
    if (!node.key) throw new Error("key is null for non-root node");
    const parent = node.parent;
    if (!parent.has(node.key)) throw new Error("parent does not have this node's key");
    if (parent.get(node.key) !== node) throw new Error("parent has this node's key but does not point to expected child node");
    parent.delete(node.key);
    return true;
  }

	deleteData(path: string, target: T): DeleteDataResult<T>;
	deleteData(path: string, target: T[]): DeleteDataResult<T>;
	deleteData(path: string, target: (d: T) => boolean): DeleteDataResult<T>;
	deleteData(path: string, target: DeleteDataTarget<T>): DeleteDataResult<T> {
		const { node, success } = this.findNode(path);
		if (!success)
			return {
				deletedData: [],
				deletedNode: null,
				lastFoundNode: node,
			};

		const callback =
			target instanceof Function
				? target
				: Array.isArray(target)
				? (v: T) => target.includes(v)
				: (v: T) => v === target;

		const prevData = node.data;
		const deletedData: T[] = [];
		node.data = [];

		prevData.forEach((v) => {
			const target = callback(v) ? deletedData : node.data;
			target.push(v);
		});

    const deletedNode = this.prune(node) ? node : null;

    return {
      deletedData,
      deletedNode, 
      lastFoundNode: node,
    }
	}

	traverse(callback: (node: TrieNode<T>) => void) {
		let queue: TrieNode<T>[] = [this.root];
		while (queue.length > 0) {
			const node = queue.shift();
			if (node) {
				callback(node);
				queue.push(...node.values());
			}
		}
	}

	nodeList(): TrieNode<T>[] {
		const nodes: TrieNode<T>[] = [];
		this.traverse((node) => nodes.push(node));
		return nodes;
	}
}

export type TrieMatchResult<T> = {
  node: TrieNode<T>;
	success: true;
} | {
  lastFoundNode: TrieNode<T>;
	success: false;
}

export class TrieMatcher<T> {
	trie: Trie<T>;
	pos: TrieMatchResult<T>;

	constructor(trie: Trie<T>) {
		this.trie = trie;
		this.pos = { node: trie.root, success: true };
	}

	reset() {
		this.pos = { node: this.trie.root, success: true };
	}

  next(key: string): TrieMatchResult<T> {
    if (!this.pos.success) return this.pos;

		const nextNode = this.pos.node.get(key);
		if (!nextNode) {
			return { lastFoundNode: this.pos.node, success: false };
		} else {
			this.pos = { node: nextNode, success: true };
			return { node: this.pos.node, success: true };
		}
  }
  
  find(path: string): TrieMatchResult<T> {
    const pathKeys = this.trie.getKeyParts(path);
    for (const key of pathKeys) {
      this.pos = this.next(key);
      if (!this.pos.success) return this.pos;
    }
    return this.pos;
  }
}

