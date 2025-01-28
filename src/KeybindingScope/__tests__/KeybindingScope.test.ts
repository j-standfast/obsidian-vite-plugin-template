import { KBScope } from '../KeybindingScope';
import type { KBKeymapEventListener, KBKeyEventContext } from '../KeybindingScope';

describe('KBScope', () => {
    let scope: KBScope;

    beforeEach(() => {
        scope = new KBScope();
    });

    describe('register', () => {
        it('should register a keybinding with modifiers and key', () => {
            const mockListener: KBKeymapEventListener = jest.fn();
            const handler = scope.register(['Mod'], 'A', mockListener);

            expect(handler.scope).toBe(scope);
            expect(handler.wrappedKBFunc).toBe(mockListener);
        });
    });

    describe('keyEventContextToKeysig', () => {
        it('should combine modifiers and key with + separator', () => {
            const result = scope.keyEventContextToKeysig({
                modifiers: 'Mod',
                key: 'A'
            });

            expect(result).toBe('Mod+A');
        });
    });

    describe('makeKBKeymapListener', () => {
        it('should wrap the listener with proper context conversion', () => {
            const mockListener: KBKeymapEventListener = jest.fn();
            const wrappedListener = scope.makeKBKeymapListener(mockListener);

            const mockEvent = new KeyboardEvent('keydown', { code: 'KeyA' });
            const mockContext = {
                key: 'A',
                modifiers: 'Mod',
                vkey: 'A'
            };

            wrappedListener(mockEvent, mockContext);

            expect(mockListener).toHaveBeenCalledWith(
                mockEvent,
                expect.objectContaining({
                    key: 'A',
                    modifiers: 'Mod',
                    code: 'KeyA',
                    keysig: 'Mod+A',
                    codesig: 'Mod+A',
                    vkey: 'A'
                })
            );
        });
    });
});