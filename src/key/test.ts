import { Expect, CoExtends } from "@/types";
import { ObsToVscNonmodKey, VscToObsWindowsModifier, ObsToVscWindowsModifier, VscToObsNonmodKey, ObsNonmodToLowercaseKeymapBase, ObsNonmodToUnlowerCaseKeymap } from "./key-mapping";

type tests = [
	Expect<CoExtends<VscToObsNonmodKey<"left">, "ArrowLeft">>,
	Expect<CoExtends<VscToObsNonmodKey<"left">, "ArrowLeft">>,
	Expect<CoExtends<ObsToVscNonmodKey<"ArrowLeft">, "left">>,
	Expect<CoExtends<ObsToVscNonmodKey<"ArrowLeft">, "left">>,
	Expect<CoExtends<ObsToVscWindowsModifier<"Meta">, "Win">>,
	Expect<CoExtends<VscToObsWindowsModifier<"Win">, "Meta">>,
	Expect<CoExtends<ObsToVscWindowsModifier<"Ctrl">, "Ctrl">>,
	Expect<CoExtends<VscToObsWindowsModifier<"Ctrl">, "Ctrl">>,
	Expect<CoExtends<ObsNonmodToLowercaseKeymapBase["A"], "a">>,
	Expect<CoExtends<ObsNonmodToUnlowerCaseKeymapBase["a"], "A">>,
	Expect<CoExtends<ObsNonmodToUnlowerCaseKeymapBase["A"], "a">>,
	Expect<CoExtends<ObsNonmodToUnlowerCaseKeymapBase["A"], "A">>,
	Expect<CoExtends<ObsNonmodToUnlowerCaseKeymap["pagedown"], "PageDown">>,
	Expect<CoExtends<ObsNonmodToUnlowerCaseKeymap["PageDown"], "PageDown">>,
	Expect<CoExtends<ObsNonmodToLowercaseKeymap["PageDown"], "pagedown">>,
	Expect<CoExtends<ObsNonmodToLowercaseKeymap["pagedown"], "pagedown">>,
	Expect<CoExtends<ObsNonmodToLowercaseKeymap["a"], "a">>,
	Expect<CoExtends<ObsNonmodToLowercaseKeymap["A"], "a">>
];
