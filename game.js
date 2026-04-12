const { useState, useEffect, useCallback, useRef, useMemo } = React;
const T = { WALL: 0, FLOOR: 1, STAIRS: 2, TRAP: 3, CHEST: 4, SECRET: 5, PIT: 6, FIRE: 7, FOUNTAIN: 8, ICE: 10, LAVA: 11, WATER: 12, VOID: 13, SHOP: 14, PORTAL: 15, BARRIER: 16, FEATURE: 17, LORE: 18, NPC: 19, ECHO: 20, LOCKED: 21, CRACKED: 22 };
const MW = 50, MH = 36, VR = 5;
const rng = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const uid = () => Math.random().toString(36).slice(2, 8);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function xpFor(l) {
  return 30 + l * 25 + Math.floor(l * l * 0.35);
}
const FLOOR_CONFIGS = (() => {
  const P = [
    { bg: "#13110d", wall: "#55503a", floor: "#2d2820", accent: "#c9a84c", haz: T.TRAP },
    { bg: "#14120a", wall: "#504832", floor: "#2a2418", accent: "#bba040", haz: T.PIT },
    { bg: "#110f0b", wall: "#4a4430", floor: "#28221a", accent: "#aa9838", haz: T.PIT },
    { bg: "#16130c", wall: "#5a5040", floor: "#302a20", accent: "#d0a848", haz: T.TRAP },
    { bg: "#12100a", wall: "#4e4836", floor: "#2c261e", accent: "#c0a044", haz: T.PIT },
    { bg: "#151008", wall: "#584e3a", floor: "#2e2818", accent: "#ccaa4c", haz: T.TRAP },
    { bg: "#100e0a", wall: "#464030", floor: "#262018", accent: "#b89c3c", haz: T.FIRE },
    { bg: "#141108", wall: "#524a38", floor: "#2a2416", accent: "#c4a440", haz: T.PIT },
    { bg: "#0f0d0a", wall: "#4c4634", floor: "#28221a", accent: "#b8a03a", haz: T.TRAP },
    { bg: "#181410", wall: "#5e5644", floor: "#342e24", accent: "#d8b050", haz: T.FIRE },
    { bg: "#0a1a0e", wall: "#2a4a2e", floor: "#1a2e1a", accent: "#44cc66", haz: T.WATER },
    { bg: "#0c1c10", wall: "#2e4e32", floor: "#1c3020", accent: "#48d06a", haz: T.WATER },
    { bg: "#081808", wall: "#264428", floor: "#182c18", accent: "#3ec060", haz: T.TRAP },
    { bg: "#0e1e12", wall: "#325236", floor: "#1e3222", accent: "#50d470", haz: T.WATER },
    { bg: "#0a1a0c", wall: "#2c482c", floor: "#1a2e1c", accent: "#42c864", haz: T.PIT },
    { bg: "#0c1c0e", wall: "#304e30", floor: "#1c3020", accent: "#4ace68", haz: T.WATER },
    { bg: "#08180a", wall: "#28462a", floor: "#182c1a", accent: "#3cc45e", haz: T.TRAP },
    { bg: "#0e1e10", wall: "#345234", floor: "#203222", accent: "#52d672", haz: T.WATER },
    { bg: "#0a1c0e", wall: "#2e4c2e", floor: "#1c301e", accent: "#46ca66", haz: T.PIT },
    { bg: "#101e14", wall: "#385638", floor: "#223626", accent: "#58da78", haz: T.WATER },
    { bg: "#1a1008", wall: "#5a4020", floor: "#2a1e10", accent: "#ffaa22", haz: T.PIT },
    { bg: "#1c1208", wall: "#5e4424", floor: "#2c2012", accent: "#ffb030", haz: T.PIT },
    { bg: "#181006", wall: "#56401e", floor: "#281e10", accent: "#ffa820", haz: T.FIRE },
    { bg: "#1e140a", wall: "#624828", floor: "#2e2214", accent: "#ffb438", haz: T.PIT },
    { bg: "#1a100a", wall: "#584222", floor: "#2a2012", accent: "#ffac28", haz: T.FIRE },
    { bg: "#1c1208", wall: "#5c4424", floor: "#2c2014", accent: "#ffae2c", haz: T.PIT },
    { bg: "#160e06", wall: "#523c1c", floor: "#261c0e", accent: "#ffa41e", haz: T.FIRE },
    { bg: "#1e1408", wall: "#604826", floor: "#302214", accent: "#ffb636", haz: T.PIT },
    { bg: "#18100a", wall: "#564020", floor: "#281e10", accent: "#ffa824", haz: T.FIRE },
    { bg: "#20160c", wall: "#664c2a", floor: "#322618", accent: "#ffba40", haz: T.LAVA },
    { bg: "#0e0e1e", wall: "#3a3a5a", floor: "#1a1a2e", accent: "#8888ff", haz: T.VOID },
    { bg: "#10101e", wall: "#3c3c5c", floor: "#1c1c30", accent: "#9090ff", haz: T.TRAP },
    { bg: "#0c0c1c", wall: "#383858", floor: "#18182c", accent: "#8080ff", haz: T.VOID },
    { bg: "#121220", wall: "#3e3e5e", floor: "#1e1e32", accent: "#9898ff", haz: T.TRAP },
    { bg: "#0e0e1e", wall: "#3a3a5a", floor: "#1a1a2e", accent: "#8888ff", haz: T.VOID },
    { bg: "#101020", wall: "#3c3c5e", floor: "#1c1c30", accent: "#8c8cff", haz: T.TRAP },
    { bg: "#0c0c1a", wall: "#363656", floor: "#16162a", accent: "#7c7cff", haz: T.VOID },
    { bg: "#121222", wall: "#404060", floor: "#202034", accent: "#9c9cff", haz: T.VOID },
    { bg: "#0e0e1c", wall: "#383858", floor: "#18182c", accent: "#8484ff", haz: T.TRAP },
    { bg: "#141424", wall: "#424264", floor: "#222238", accent: "#a4a4ff", haz: T.VOID },
    { bg: "#1e0a0a", wall: "#5a2210", floor: "#2e1408", accent: "#ff4422", haz: T.LAVA },
    { bg: "#200c0c", wall: "#5e2614", floor: "#30160a", accent: "#ff4e2a", haz: T.LAVA },
    { bg: "#1c0808", wall: "#56200e", floor: "#2c1208", accent: "#ff3e1e", haz: T.FIRE },
    { bg: "#220e0e", wall: "#622818", floor: "#32180c", accent: "#ff5632", haz: T.LAVA },
    { bg: "#1e0a0a", wall: "#5a2412", floor: "#2e1408", accent: "#ff4826", haz: T.LAVA },
    { bg: "#200c0a", wall: "#5c2614", floor: "#30160a", accent: "#ff502c", haz: T.FIRE },
    { bg: "#1a0808", wall: "#541e0e", floor: "#2a1206", accent: "#ff3a1c", haz: T.LAVA },
    { bg: "#220e0c", wall: "#602a18", floor: "#321a0c", accent: "#ff5834", haz: T.LAVA },
    { bg: "#1c0a0a", wall: "#582212", floor: "#2c1408", accent: "#ff4424", haz: T.FIRE },
    { bg: "#241010", wall: "#642c1a", floor: "#341c0e", accent: "#ff6038", haz: T.LAVA },
    { bg: "#0a1018", wall: "#3a5a6a", floor: "#1a2a34", accent: "#66ddff", haz: T.ICE },
    { bg: "#0c121a", wall: "#3c5c6c", floor: "#1c2c36", accent: "#6ee0ff", haz: T.ICE },
    { bg: "#080e16", wall: "#385868", floor: "#182832", accent: "#60d8ff", haz: T.ICE },
    { bg: "#0e141c", wall: "#3e5e6e", floor: "#1e2e38", accent: "#74e4ff", haz: T.ICE },
    { bg: "#0a1018", wall: "#3a5a6a", floor: "#1a2a34", accent: "#68dcff", haz: T.ICE },
    { bg: "#0c121a", wall: "#3c5c6e", floor: "#1c2c36", accent: "#6ee2ff", haz: T.ICE },
    { bg: "#080e14", wall: "#365866", floor: "#162830", accent: "#5ed6ff", haz: T.ICE },
    { bg: "#0e141e", wall: "#406070", floor: "#20303a", accent: "#78e6ff", haz: T.ICE },
    { bg: "#0a1018", wall: "#3a5a6a", floor: "#1a2a34", accent: "#66deff", haz: T.ICE },
    { bg: "#101620", wall: "#426272", floor: "#22323c", accent: "#7ceaff", haz: T.ICE },
    { bg: "#10081a", wall: "#3a2a4a", floor: "#1e1028", accent: "#bb66ff", haz: T.VOID },
    { bg: "#120a1c", wall: "#3c2c4c", floor: "#20122a", accent: "#c06eff", haz: T.VOID },
    { bg: "#0e0618", wall: "#382848", floor: "#1c0e26", accent: "#b660ff", haz: T.VOID },
    { bg: "#140c1e", wall: "#3e2e4e", floor: "#22142c", accent: "#c474ff", haz: T.VOID },
    { bg: "#10081a", wall: "#3a2a4a", floor: "#1e1028", accent: "#bc68ff", haz: T.VOID },
    { bg: "#120a1c", wall: "#3c2c4e", floor: "#20122a", accent: "#c270ff", haz: T.VOID },
    { bg: "#0e0616", wall: "#362646", floor: "#1a0e24", accent: "#b25eff", haz: T.VOID },
    { bg: "#140c20", wall: "#403050", floor: "#24162e", accent: "#c878ff", haz: T.VOID },
    { bg: "#10081a", wall: "#3a2a4a", floor: "#1e1028", accent: "#be6aff", haz: T.VOID },
    { bg: "#160e22", wall: "#423252", floor: "#261830", accent: "#cc7eff", haz: T.VOID },
    { bg: "#1a0e08", wall: "#5a3a1a", floor: "#2e1e0e", accent: "#ff8800", haz: T.LAVA },
    { bg: "#1c100a", wall: "#5c3c1c", floor: "#302010", accent: "#ff9010", haz: T.FIRE },
    { bg: "#180c06", wall: "#583818", floor: "#2c1c0c", accent: "#ff8200", haz: T.LAVA },
    { bg: "#1e120c", wall: "#5e3e1e", floor: "#322212", accent: "#ff9818", haz: T.LAVA },
    { bg: "#1a0e08", wall: "#5a3a1a", floor: "#2e1e0e", accent: "#ff8a04", haz: T.FIRE },
    { bg: "#1c100a", wall: "#5c3e1c", floor: "#302010", accent: "#ff9212", haz: T.LAVA },
    { bg: "#160c06", wall: "#563616", floor: "#2a1a0c", accent: "#ff7e00", haz: T.FIRE },
    { bg: "#1e120e", wall: "#60401e", floor: "#342414", accent: "#ff9c1c", haz: T.LAVA },
    { bg: "#1a0e08", wall: "#5a3a1a", floor: "#2e1e0e", accent: "#ff8c08", haz: T.LAVA },
    { bg: "#201410", wall: "#624220", floor: "#362616", accent: "#ffa224", haz: T.LAVA },
    { bg: "#081410", wall: "#2a4a3a", floor: "#122a20", accent: "#22ffaa", haz: T.VOID },
    { bg: "#0a1612", wall: "#2c4c3c", floor: "#142c22", accent: "#2affb0", haz: T.VOID },
    { bg: "#06120e", wall: "#284838", floor: "#10281e", accent: "#1effa4", haz: T.VOID },
    { bg: "#0c1814", wall: "#2e4e3e", floor: "#162e24", accent: "#30ffb6", haz: T.VOID },
    { bg: "#081410", wall: "#2a4a3a", floor: "#122a20", accent: "#24ffac", haz: T.VOID },
    { bg: "#0a1612", wall: "#2c4c3e", floor: "#142c22", accent: "#2cffb2", haz: T.VOID },
    { bg: "#06100e", wall: "#264636", floor: "#0e261c", accent: "#1cff9e", haz: T.VOID },
    { bg: "#0c1816", wall: "#305040", floor: "#183026", accent: "#34ffba", haz: T.VOID },
    { bg: "#081410", wall: "#2a4a3a", floor: "#122a20", accent: "#26ffae", haz: T.VOID },
    { bg: "#0e1a18", wall: "#325242", floor: "#1a3228", accent: "#38ffc0", haz: T.VOID },
    { bg: "#12100a", wall: "#4a4020", floor: "#2a2410", accent: "#ffd700", haz: T.FIRE },
    { bg: "#14120c", wall: "#4c4222", floor: "#2c2612", accent: "#ffda10", haz: T.VOID },
    { bg: "#100e08", wall: "#483e1e", floor: "#28220e", accent: "#ffd400", haz: T.FIRE },
    { bg: "#16140e", wall: "#4e4424", floor: "#2e2814", accent: "#ffde18", haz: T.VOID },
    { bg: "#12100a", wall: "#4a4020", floor: "#2a2410", accent: "#ffd604", haz: T.LAVA },
    { bg: "#14120c", wall: "#4c4224", floor: "#2c2612", accent: "#ffdc14", haz: T.VOID },
    { bg: "#0e0c08", wall: "#463c1c", floor: "#26200c", accent: "#ffd000", haz: T.FIRE },
    { bg: "#16140e", wall: "#504626", floor: "#302a16", accent: "#ffe020", haz: T.VOID },
    { bg: "#12100a", wall: "#4a4020", floor: "#2a2410", accent: "#ffd808", haz: T.LAVA },
    { bg: "#181612", wall: "#524828", floor: "#322c18", accent: "#ffe428", haz: T.VOID }
  ];
  const N = ["Dusty Entrance", "Bone Gallery", "Collapsed Hall", "Rat Warrens", "Silent Tombs", "Pillared Crypt", "Sunken Vault", "Echoing Chamber", "Ancient Archive", "Warden's Domain", "Dripping Tunnels", "Moss Grottos", "Flooded Passage", "Fungal Cavern", "Bile Channels", "Sludge Pits", "Spawn Pools", "Rotting Cistern", "Venom Lair", "Hydra's Nest", "Abandoned Shaft", "Crystal Vein", "Collapsed Tunnel", "Ore Deposit", "Lava Fissure", "Stone Bridge", "Mushroom Cave", "Quake Zone", "Deep Excavation", "Titan's Forge", "Restless Graves", "Wailing Corridor", "Death's Antechamber", "Spirit Sanctum", "Phantom Hall", "Cursed Chapel", "Lich Laboratory", "Bone Throne", "Shadow Cloister", "Malachar's Keep", "Ember Plains", "Char Pits", "Flame Corridor", "Magma Falls", "Scorched Arena", "Ash Wastes", "Infernal Gate", "Burning Maze", "Fire Sanctum", "Ignatius' Throne", "Frost Entry", "Ice Caverns", "Blizzard Pass", "Frozen Lake", "Crystal Tundra", "Avalanche Hall", "Permafrost Tomb", "Glacier Core", "Howling Peak", "Glacius' Domain", "Void Threshold", "Shadow Rift", "Dark Expanse", "Null Chamber", "Entropy Hall", "Singularity", "Abyss Maw", "Void Nexus", "Dark Matter", "Nihilex's Realm", "Scale Passage", "Hoard Antechamber", "Drake Nests", "Wyrm Tunnels", "Fire Pits", "Bone Graveyard", "Elder Roost", "Sky Bridge", "Crown Chamber", "Tiamat's Sanctum", "Warped Entry", "Reality Fracture", "Dream Corridor", "Eye Chamber", "Tentacle Hall", "Mind Maze", "Star Gate", "Madness Court", "Whisper Void", "Azathoth's Dream", "Dark Approach", "Shadow Court", "Obsidian Hall", "Throne Passage", "Crown Gallery", "Soul Forge", "Eclipse Chamber", "Doom Spire", "Final Descent", "Erebus' Throne"];
  const I = ["\u{1F3DB}\uFE0F", "\u{1F480}", "\u{1F3DA}\uFE0F", "\u{1F400}", "\u{1F56F}\uFE0F", "\u{1F3DB}\uFE0F", "\u{1F510}", "\u{1F514}", "\u{1F4DC}", "\u2694\uFE0F", "\u{1F4A7}", "\u{1F344}", "\u{1F30A}", "\u{1F7E2}", "\u{1F9EA}", "\u{1FAE7}", "\u{1F95A}", "\u{1FAB1}", "\u{1F40D}", "\u{1F40A}", "\u26CF\uFE0F", "\u{1F48E}", "\u{1FAA8}", "\u2699\uFE0F", "\u{1F30B}", "\u{1F309}", "\u{1F344}", "\u{1F4A5}", "\u{1F573}\uFE0F", "\u{1F528}", "\u26B0\uFE0F", "\u{1F631}", "\u{1F480}", "\u{1F47B}", "\u{1F3DA}\uFE0F", "\u26EA", "\u{1F9EA}", "\u{1F9B4}", "\u{1F311}", "\u2620\uFE0F", "\u{1F525}", "\u{1F30B}", "\u{1F525}", "\u{1F30A}", "\u2694\uFE0F", "\u{1F3DC}\uFE0F", "\u{1F47F}", "\u{1F525}", "\u{1F525}", "\u{1F608}", "\u2744\uFE0F", "\u{1F9CA}", "\u{1F328}\uFE0F", "\u{1F3D4}\uFE0F", "\u{1F48E}", "\u{1F3D4}\uFE0F", "\u{1FAA6}", "\u{1F9CA}", "\u{1F32C}\uFE0F", "\u2744\uFE0F", "\u{1F300}", "\u{1F573}\uFE0F", "\u{1F311}", "\u2B1B", "\u{1F300}", "\u{1F4AB}", "\u{1F444}", "\u{1F300}", "\u26AB", "\u{1F311}", "\u{1F432}", "\u{1F4B0}", "\u{1F95A}", "\u{1F40D}", "\u{1F525}", "\u{1F9B4}", "\u{1F985}", "\u{1F309}", "\u{1F451}", "\u{1F409}", "\u{1F441}\uFE0F", "\u{1F52E}", "\u{1F4AD}", "\u{1F441}\uFE0F", "\u{1F419}", "\u{1F9E9}", "\u2B50", "\u{1FAE0}", "\u{1F32B}\uFE0F", "\u{1F441}\uFE0F", "\u{1F5E1}\uFE0F", "\u{1F3F0}", "\u2B1B", "\u{1F6AA}", "\u{1F451}", "\u{1F525}", "\u{1F311}", "\u{1F5FC}", "\u2B07\uFE0F", "\u{1F451}"];
  return Array.from({ length: 100 }, (_, i) => ({ floor: i + 1, name: N[i], icon: I[i], tier: Math.floor(i / 10) + 1, ...P[i] }));
})();
const SANC_CONFIG = { bg: "#0a1220", wall: "#2a4458", floor: "#162838", accent: "#66bbee", haz: T.FLOOR, name: "Sanctuary", icon: "\u{1F3D5}\uFE0F" };
const getFC = (f) => FLOOR_CONFIGS[f - 1] || FLOOR_CONFIGS[0];
const getTier = (f) => Math.floor((f - 1) / 10) + 1;
const WP = { warrior: ["Rusty", "Iron", "Steel", "Forged", "Tempered", "Hardened", "Infernal", "Glacial", "Void", "Draconic", "Eldritch", "Abyssal", "Radiant", "Astral", "Celestial", "Cursed", "Blessed", "Ancient", "Mythic", "Divine"], mage: ["Apprentice", "Oak", "Crystal", "Enchanted", "Arcane", "Runic", "Infernal", "Glacial", "Void", "Draconic", "Eldritch", "Astral", "Radiant", "Celestial", "Cursed", "Blessed", "Ancient", "Mythic", "Divine", "Cosmic"], thief: ["Rusty", "Keen", "Serrated", "Venom", "Shadow", "Silent", "Infernal", "Glacial", "Void", "Draconic", "Eldritch", "Spectral", "Radiant", "Astral", "Cursed", "Blessed", "Ancient", "Mythic", "Divine", "Phantom"] };
const WS = { warrior: [["Sword", "\u{1F5E1}\uFE0F"], ["Mace", "\u{1F528}"], ["Blade", "\u2694\uFE0F"], ["Axe", "\u{1FA93}"], ["Halberd", "\u2694\uFE0F"], ["Hammer", "\u{1F528}"], ["Claymore", "\u{1F5E1}\uFE0F"], ["Greatsword", "\u2694\uFE0F"], ["Warblade", "\u{1F5E1}\uFE0F"], ["Kingsbane", "\u{1F451}"]], mage: [["Wand", "\u{1FA84}"], ["Staff", "\u{1FAB5}"], ["Rod", "\u{1FA84}"], ["Orb", "\u{1F52E}"], ["Scepter", "\u{1FA84}"], ["Tome", "\u{1F4D6}"], ["Focus", "\u{1F52E}"], ["Grimoire", "\u{1F4D6}"], ["Codex", "\u{1F4DC}"], ["Catalyst", "\u2B50"]], thief: [["Dagger", "\u{1F52A}"], ["Stiletto", "\u{1F5E1}\uFE0F"], ["Shiv", "\u{1F52A}"], ["Blade", "\u{1F5E1}\uFE0F"], ["Kris", "\u{1F52A}"], ["Fang", "\u{1F40D}"], ["Claw", "\u{1F43E}"], ["Tanto", "\u{1F5E1}\uFE0F"], ["Kukri", "\u{1F52A}"], ["Dirk", "\u{1F5E1}\uFE0F"]] };
const AP = { warrior: ["Leather", "Studded", "Chain", "Banded", "Plate", "Reinforced", "Infernal", "Glacial", "Void", "Draconic", "Eldritch", "Astral", "Radiant", "Celestial", "Cursed", "Blessed", "Ancient", "Mythic", "Divine", "Titanic"], mage: ["Cloth", "Linen", "Silk", "Woven", "Enchanted", "Runic", "Infernal", "Glacial", "Void", "Draconic", "Eldritch", "Astral", "Radiant", "Celestial", "Cursed", "Blessed", "Ancient", "Mythic", "Divine", "Cosmic"], thief: ["Cloth", "Leather", "Studded", "Shadow", "Night", "Stealth", "Infernal", "Glacial", "Void", "Draconic", "Eldritch", "Spectral", "Radiant", "Astral", "Cursed", "Blessed", "Ancient", "Mythic", "Divine", "Phantom"] };
const AS = { warrior: [["Vest", "\u{1F94B}"], ["Mail", "\u26D3\uFE0F"], ["Armor", "\u{1F6E1}\uFE0F"], ["Plate", "\u{1F6E1}\uFE0F"], ["Cuirass", "\u{1F6E1}\uFE0F"], ["Aegis", "\u{1F6E1}\uFE0F"], ["Fortress", "\u{1F3F0}"], ["Bastion", "\u{1F6E1}\uFE0F"], ["Guard", "\u{1F6E1}\uFE0F"], ["Crown", "\u{1F451}"]], mage: [["Robes", "\u{1F458}"], ["Vestment", "\u{1F458}"], ["Mantle", "\u2728"], ["Robe", "\u{1F458}"], ["Shroud", "\u{1F300}"], ["Regalia", "\u2728"], ["Cowl", "\u{1F9D9}"], ["Garb", "\u{1F458}"], ["Raiment", "\u2728"], ["Halo", "\u{1F607}"]], thief: [["Vest", "\u{1F94B}"], ["Tunic", "\u{1F94B}"], ["Cloak", "\u{1F311}"], ["Garb", "\u{1F319}"], ["Shroud", "\u{1F311}"], ["Suit", "\u{1F574}\uFE0F"], ["Wrap", "\u{1F311}"], ["Cowl", "\u{1F9B9}"], ["Mantle", "\u{1F47B}"], ["Veil", "\u{1F32B}\uFE0F"]] };
function genFloorWeapon(f, cls) {
  const pi = Math.min(Math.floor((f - 1) / 5), 19);
  const si = Math.min(Math.floor((f - 1) / 10), 9);
  const [suf, icon] = WS[cls][si];
  const atk = 2 + Math.floor(f * 0.55);
  return { id: `fw${f}`, name: `${WP[cls][pi]} ${suf}`, icon, type: "weapon", atk, intB: cls === "mage" ? 2 + Math.floor(f * 0.4) : void 0, dexB: cls === "thief" ? 1 + Math.floor(f * 0.3) : void 0, tier: getTier(f), val: 8 + f * 6, lvl: f, floor: f };
}
function genFloorArmor(f, cls) {
  const pi = Math.min(Math.floor((f - 1) / 5), 19);
  const si = Math.min(Math.floor((f - 1) / 10), 9);
  const [suf, icon] = AS[cls][si];
  const def = cls === "warrior" ? 2 + Math.floor(f * 0.5) : cls === "thief" ? 2 + Math.floor(f * 0.35) : 1 + Math.floor(f * 0.22);
  return { id: `fa${f}`, name: `${AP[cls][pi]} ${suf}`, icon, type: "armor", def, mpB: cls === "mage" ? 15 + Math.floor(f * 1.5) : void 0, dexB: cls === "thief" ? 1 + Math.floor(f * 0.18) : void 0, tier: getTier(f), val: 10 + f * 6, lvl: f, floor: f };
}
const CONS = [
  { id: "c1", name: "HP Potion", icon: "\u2764\uFE0F", type: "consumable", effect: "hp", val: 8, amt: 35, lvl: 1 },
  { id: "c2", name: "MP Potion", icon: "\u{1F499}", type: "consumable", effect: "mp", val: 8, amt: 30, lvl: 1 },
  { id: "c3", name: "Antidote", icon: "\u{1F49A}", type: "consumable", effect: "cure", val: 5, amt: 0, lvl: 1 },
  { id: "c4", name: "Torch", icon: "\u{1F526}", type: "consumable", effect: "vision", val: 4, amt: 1, lvl: 15 },
  { id: "c5", name: "Bomb", icon: "\u{1F4A3}", type: "consumable", effect: "damage", val: 14, amt: 50, lvl: 10 },
  { id: "c6", name: "Greater HP", icon: "\u2764\uFE0F\u200D\u{1F525}", type: "consumable", effect: "hp", val: 25, amt: 80, lvl: 20 },
  { id: "c7", name: "Greater MP", icon: "\u{1F48E}", type: "consumable", effect: "mp", val: 25, amt: 60, lvl: 20 },
  { id: "c8", name: "Mega Bomb", icon: "\u{1F9E8}", type: "consumable", effect: "damage", val: 40, amt: 120, lvl: 40 },
  { id: "c9", name: "Elixir", icon: "\u2728", type: "consumable", effect: "full", val: 55, amt: 0, lvl: 50 },
  { id: "c10", name: "Phoenix Down", icon: "\u{1F525}", type: "consumable", effect: "revive", val: 100, amt: 0, lvl: 70 },
  // #7: New consumables
  { id: "c11", name: "Speed Potion", icon: "\u{1F4A8}", type: "consumable", effect: "speed", val: 12, amt: 3, lvl: 8 },
  { id: "c12", name: "Shield Scroll", icon: "\u{1F4DC}", type: "consumable", effect: "shield", val: 18, amt: 5, lvl: 15 },
  { id: "c13", name: "Warp Stone", icon: "\u{1F300}", type: "consumable", effect: "warp", val: 30, amt: 0, lvl: 25 },
  { id: "c14", name: "Key", icon: "\u{1F511}", type: "consumable", effect: "key", val: 20, amt: 0, lvl: 5 }
];
function getChestLoot(f) {
  let p = CONS.filter((c) => c.lvl <= f + 10 && c.lvl >= f - 40);
  if (p.length < 3) p = CONS.filter((c) => c.lvl <= f + 10).slice(-3);
  if (p.length === 0) p = [CONS[CONS.length - 1]];
  const weights = p.map((c) => Math.pow(1.5, (c.lvl - 1) / 10) * (1 + f / 30));
  const totalW = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * totalW;
  for (let i = 0; i < p.length; i++) {
    r -= weights[i];
    if (r <= 0) return { ...p[i], id: uid() };
  }
  return { ...p[p.length - 1], id: uid() };
}
const SHOP_NAMES = ["Old Merchant", "Wandering Trader", "Cave Dealer", "Spirit Vendor", "Infernal Broker", "Frost Peddler", "Void Merchant", "Dragon Hoarder", "Eldritch Dealer", "Shadow Broker"];
function genShopStock(floor, cls) {
  const tier = getTier(floor);
  const items = [];
  const available = CONS.filter((c) => c.lvl <= floor + 15);
  for (const c of available) {
    const stock = c.lvl <= floor ? rng(2, 4) : rng(1, 2);
    items.push({ ...c, id: uid(), buyPrice: Math.floor(c.val * 3), cat: "consumable", stock, sold: 0 });
  }
  const wFloor = Math.max(1, floor - rng(1, 3));
  const aFloor = Math.max(1, floor - rng(1, 3));
  const shopW = genFloorWeapon(wFloor, cls);
  const shopA = genFloorArmor(aFloor, cls);
  items.push({ ...shopW, id: uid(), buyPrice: Math.floor(shopW.val * 4), cat: "weapon", stock: 1, sold: 0 });
  items.push({ ...shopA, id: uid(), buyPrice: Math.floor(shopA.val * 4), cat: "armor", stock: 1, sold: 0 });
  if (floor < 95) {
    const pW = genFloorWeapon(floor + rng(2, 5), cls);
    const pA = genFloorArmor(floor + rng(2, 5), cls);
    items.push({ ...pW, id: uid(), buyPrice: Math.floor(pW.val * 6), cat: "weapon", stock: 1, sold: 0, premium: true });
    items.push({ ...pA, id: uid(), buyPrice: Math.floor(pA.val * 6), cat: "armor", stock: 1, sold: 0, premium: true });
  }
  const statPotPrice = 100 + floor * 8;
  items.push({ id: uid(), name: "STR Tonic", icon: "\u{1F4AA}", type: "consumable", effect: "perm_str", buyPrice: statPotPrice, cat: "consumable", stock: 1, sold: 0 });
  items.push({ id: uid(), name: "DEX Tonic", icon: "\u{1F3C3}", type: "consumable", effect: "perm_dex", buyPrice: statPotPrice, cat: "consumable", stock: 1, sold: 0 });
  items.push({ id: uid(), name: "INT Tonic", icon: "\u{1F9E0}", type: "consumable", effect: "perm_int", buyPrice: statPotPrice, cat: "consumable", stock: 1, sold: 0 });
  return { items, name: SHOP_NAMES[tier - 1] || "Merchant", icon: ["\u{1F9D9}", "\u{1F9DD}", "\u26CF\uFE0F", "\u{1F47B}", "\u{1F608}", "\u{1F9CA}", "\u{1F300}", "\u{1F432}", "\u{1F441}\uFE0F", "\u{1F451}"][tier - 1] || "\u{1F9D9}", tier };
}
const TIER_ELEM = ["physical", "poison", "earth", "dark", "fire", "ice", "void", "fire", "dark", "dark"];
const ELEM_WEAK = { fire: { ice: 1.5, void: 0.8 }, ice: { fire: 1.5, void: 0.8 }, dark: { physical: 1.3 }, physical: { dark: 1.3, void: 1.2 }, void: { physical: 1.4, fire: 0.8, ice: 0.8 }, lightning: { ice: 1.4, earth: 0.7 }, poison: { earth: 1.3 }, earth: { fire: 0.8, lightning: 1.3 } };
const ENEMY_TYPE = {
  Rat: "beast",
  Bat: "beast",
  Croc: "beast",
  Hydra: "beast",
  Yeti: "beast",
  Wendigo: "beast",
  "Ice Drgn": "beast",
  Wyvern: "beast",
  "Elder Drg": "beast",
  "Drg Lord": "beast",
  Dragonkin: "beast",
  "Fire Drk": "beast",
  Spider: "rogue",
  Shadow: "rogue",
  "Shd Guard": "rogue",
  Ghost: "mage",
  "Sewer Hag": "mage",
  Necro: "mage",
  Banshee: "mage",
  "Void Wlk": "mage",
  "Drk Mage": "mage",
  Archlich: "mage",
  "Star Spwn": "mage",
  Beholder: "mage"
};
const CRIT_BY_TYPE = { beast: 0.05, rogue: 0.15, mage: 0.03 };
const BIOME_OBJ = [["\u{1F480}", "\u26B1\uFE0F", "\u{1F56F}\uFE0F"], ["\u{1F344}", "\u{1FAA8}", "\u{1F33F}"], ["\u{1FAA8}", "\u26CF\uFE0F", "\u{1F48E}"], ["\u{1F56F}\uFE0F", "\u26B0\uFE0F", "\u{1F4D6}"], ["\u{1F525}", "\u{1FAA8}", "\u2692\uFE0F"], ["\u{1F9CA}", "\u2744\uFE0F", "\u{1FAA8}"], ["\u{1F300}", "\u{1F48E}", "\u{1F573}\uFE0F"], ["\u{1F9B4}", "\u{1F95A}", "\u{1F4B0}"], ["\u{1F441}\uFE0F", "\u{1F419}", "\u{1FAE7}"], ["\u{1F311}", "\u2B1B", "\u{1F573}\uFE0F"]];
const BIOME_SCATTER = [["\u{1F9B4}", "\u{1F578}\uFE0F"], ["\u{1F4A7}", "\xB7"], ["\u2699\uFE0F", "\xB7"], ["\u{1F4DC}", "\xB7"], ["\u{1F4A5}", "\xB7"], ["\u2728", "\u2744\uFE0F"], ["\u2726", "\xB7"], ["\u{1FA99}", "\xB7"], ["\xB7", "\xB7"], ["\xB7", "\xB7"]];
const BIOME_CENTER = ["\u{1F5FF}", "\u{1F30A}", "\u26CF\uFE0F", "\u26EA", "\u{1F30B}", "\u{1F3D4}\uFE0F", "\u267E\uFE0F", "\u{1F409}", "\u{1F52E}", "\u{1F451}"];
const BIOME_WALL = ["\u2593", "\u2592", "\u2591", "\u256C", "\u2593", "\u2588", "\u2591", "\u2593", "\u256B", "\u2588"];
const TRAIL_PARTICLES = ["#c9a84c", "#44cc66", "#ffaa22", "#8888ff", "#ff4422", "#66ddff", "#bb66ff", "#ff8800", "#22ffaa", "#ffd700"];
const BIOME_WEATHER = [
  { type: "dust", color: "#c9a84c33", count: 12 },
  { type: "drip", color: "#44cc6644", count: 18 },
  { type: "dust", color: "#ffaa2233", count: 10 },
  { type: "mist", color: "#8888ff22", count: 15 },
  { type: "ash", color: "#ff442244", count: 20 },
  { type: "snow", color: "#66ddff44", count: 25 },
  { type: "void", color: "#bb66ff33", count: 12 },
  { type: "ash", color: "#ff880033", count: 16 },
  { type: "stars", color: "#22ffaa44", count: 20 },
  { type: "mist", color: "#ffd70022", count: 10 }
];
const BIOME_FEATURE = [
  { icon: "\u26B0\uFE0F", name: "Sarcophagus", eff: "gold_or_fight" },
  { icon: "\u{1F344}", name: "Glowing Mushroom", eff: "heal_or_poison" },
  { icon: "\u{1F48E}", name: "Luminite Vein", eff: "gold" },
  { icon: "\u{1F4D6}", name: "Ancient Tome", eff: "xp" },
  { icon: "\u2692\uFE0F", name: "Ruined Anvil", eff: "buff_atk" },
  { icon: "\u{1F9CA}", name: "Frozen Corpse", eff: "item" },
  { icon: "\u{1F300}", name: "Reality Tear", eff: "teleport" },
  { icon: "\u{1F95A}", name: "Warm Egg", eff: "gold_or_fight" },
  { icon: "\u{1F441}\uFE0F", name: "Pulsing Eye", eff: "reveal" },
  { icon: "\u{1F311}", name: "Shadow Pool", eff: "mp_full" }
];
const CORR_HAZ = [["\u{1F578}\uFE0F", "web"], ["\u{1F33F}", "roots"], ["\u{1FAA8}", "rocks"], ["\xB7", ""], ["\u{1F525}", "flames"], ["\u{1F9CA}", "ice"], ["\xB7", ""], ["\u{1F9B4}", "bones"], ["\xB7", ""], ["\xB7", ""]];
const ROOM_THEMES = ["armory", "library", "shrine", "prison", "treasury", "lab", "crypt", "garden"];
const LANDMARKS = [
  { icon: "\u{1F5FF}", name: "Ancient Statue", eff: "def", amt: 1, msg: "+1 DEF. The stone acknowledges you." },
  { icon: "\u26E9\uFE0F", name: "Shrine", eff: "hp", amt: 0, msg: "Fully healed. The gods remember." },
  { icon: "\u{1F3DB}\uFE0F", name: "Altar", eff: "xp", amt: 0, msg: "Wisdom flows through you." },
  { icon: "\u{1FA91}", name: "Throne", eff: "str", amt: 1, msg: "+1 STR. Power recognizes power." }
];
const MB = [
  [{ n: "Rat", i: "\u{1F400}", h: 16, a: 5, d: 1, x: 8, g: 3 }, { n: "Bat", i: "\u{1F987}", h: 12, a: 6, d: 0, x: 6, g: 2 }, { n: "Skeleton", i: "\u{1F480}", h: 26, a: 9, d: 4, x: 15, g: 7 }, { n: "Zombie", i: "\u{1F9DF}", h: 32, a: 8, d: 5, x: 16, g: 6 }, { n: "Ghost", i: "\u{1F47B}", h: 20, a: 12, d: 2, x: 18, g: 9 }],
  [{ n: "Slime", i: "\u{1F7E2}", h: 24, a: 8, d: 3, x: 10, g: 4 }, { n: "Spider", i: "\u{1F577}\uFE0F", h: 18, a: 11, d: 2, x: 11, g: 5 }, { n: "Croc", i: "\u{1F40A}", h: 38, a: 14, d: 6, x: 20, g: 10 }, { n: "Sewer Hag", i: "\u{1F9D9}", h: 28, a: 16, d: 3, x: 24, g: 13 }, { n: "Hydra", i: "\u{1F40D}", h: 48, a: 18, d: 7, x: 32, g: 16 }],
  [{ n: "Kobold", i: "\u{1F47A}", h: 22, a: 12, d: 4, x: 14, g: 8 }, { n: "Golem", i: "\u{1FAA8}", h: 55, a: 13, d: 16, x: 26, g: 11 }, { n: "Mole", i: "\u{1F439}", h: 32, a: 15, d: 5, x: 18, g: 9 }, { n: "Troll", i: "\u{1F479}", h: 70, a: 20, d: 10, x: 38, g: 19 }, { n: "Basilisk", i: "\u{1F98E}", h: 48, a: 22, d: 8, x: 36, g: 20 }],
  [{ n: "Wraith", i: "\u{1F464}", h: 38, a: 18, d: 4, x: 26, g: 13 }, { n: "Banshee", i: "\u{1F631}", h: 32, a: 22, d: 3, x: 30, g: 15 }, { n: "Death Knt", i: "\u2694\uFE0F", h: 65, a: 24, d: 14, x: 42, g: 22 }, { n: "Necro", i: "\u2620\uFE0F", h: 48, a: 26, d: 6, x: 48, g: 26 }, { n: "Bone Drk", i: "\u{1F9B4}", h: 85, a: 28, d: 12, x: 56, g: 32 }],
  [{ n: "Imp", i: "\u{1F608}", h: 28, a: 20, d: 5, x: 22, g: 11 }, { n: "Fire Elem", i: "\u{1F525}", h: 50, a: 26, d: 8, x: 36, g: 17 }, { n: "Hellhound", i: "\u{1F415}", h: 45, a: 24, d: 10, x: 33, g: 15 }, { n: "Pit Fiend", i: "\u{1F47F}", h: 80, a: 30, d: 14, x: 52, g: 28 }, { n: "Balor", i: "\u{1F987}", h: 95, a: 34, d: 16, x: 62, g: 38 }],
  [{ n: "Ice Wraith", i: "\u{1F976}", h: 42, a: 22, d: 8, x: 28, g: 15 }, { n: "Frost Gnt", i: "\u{1F3D4}\uFE0F", h: 85, a: 28, d: 16, x: 48, g: 26 }, { n: "Yeti", i: "\u{1F98D}", h: 65, a: 26, d: 12, x: 40, g: 20 }, { n: "Ice Drgn", i: "\u{1F409}", h: 105, a: 32, d: 18, x: 62, g: 36 }, { n: "Wendigo", i: "\u{1F4A8}", h: 55, a: 30, d: 6, x: 46, g: 24 }],
  [{ n: "Shadow", i: "\u{1F311}", h: 48, a: 26, d: 6, x: 34, g: 18 }, { n: "Void Wlk", i: "\u{1F573}\uFE0F", h: 62, a: 30, d: 10, x: 46, g: 24 }, { n: "Flayer", i: "\u{1F419}", h: 72, a: 34, d: 8, x: 55, g: 30 }, { n: "Beholder", i: "\u{1F441}\uFE0F", h: 82, a: 36, d: 12, x: 62, g: 36 }, { n: "Devourer", i: "\u{1F636}\u200D\u{1F32B}\uFE0F", h: 96, a: 38, d: 14, x: 70, g: 40 }],
  [{ n: "Dragonkin", i: "\u{1F98E}", h: 66, a: 30, d: 14, x: 48, g: 26 }, { n: "Wyvern", i: "\u{1F985}", h: 82, a: 34, d: 12, x: 56, g: 30 }, { n: "Fire Drk", i: "\u{1F432}", h: 96, a: 38, d: 18, x: 68, g: 38 }, { n: "Elder Drg", i: "\u{1F409}", h: 135, a: 42, d: 22, x: 82, g: 52 }, { n: "Drg Lord", i: "\u{1F451}", h: 155, a: 46, d: 24, x: 92, g: 62 }],
  [{ n: "Gibberer", i: "\u{1FAE0}", h: 58, a: 32, d: 8, x: 46, g: 24 }, { n: "Star Spwn", i: "\u2B50", h: 78, a: 38, d: 14, x: 60, g: 34 }, { n: "Aboleth", i: "\u{1F40B}", h: 96, a: 40, d: 16, x: 70, g: 40 }, { n: "Shoggoth", i: "\u{1FAE7}", h: 116, a: 44, d: 18, x: 82, g: 48 }, { n: "Deep One", i: "\u{1F991}", h: 88, a: 42, d: 12, x: 72, g: 42 }],
  [{ n: "Shd Guard", i: "\u{1F5E1}\uFE0F", h: 88, a: 38, d: 18, x: 62, g: 36 }, { n: "Drk Mage", i: "\u{1F9D9}\u200D\u2642\uFE0F", h: 72, a: 46, d: 10, x: 70, g: 40 }, { n: "Chaos Knt", i: "\u265F\uFE0F", h: 116, a: 44, d: 22, x: 82, g: 50 }, { n: "Archlich", i: "\u{1F480}", h: 136, a: 50, d: 16, x: 92, g: 58 }, { n: "Fallen", i: "\u{1F607}", h: 156, a: 52, d: 24, x: 108, g: 68 }]
];
function getEnemy(f) {
  const t = getTier(f) - 1;
  const pool = MB[t] || MB[0];
  const pos = (f - 1) % 10;
  const s = 1 + pos * 0.18 + t * 0.12;
  const dm = 1 + t * 0.18;
  const b = pool[rng(0, pool.length - 1)];
  const goldBonus = Math.floor(f * 0.5);
  const elem = TIER_ELEM[t] || "physical";
  const etype = ENEMY_TYPE[b.n] || "warrior";
  const critRate = CRIT_BY_TYPE[etype] || 0.08;
  const base = { name: b.n, icon: b.i, hp: Math.floor(b.h * s * dm * 1.3), maxHp: Math.floor(b.h * s * dm * 1.3), atk: Math.floor(b.a * s * dm * 1.2), def: Math.floor(b.d * s * dm * 1.25), xp: Math.floor(b.x * s * dm), gold: Math.floor(b.g * s * dm) + goldBonus, id: uid(), elem, etype, critRate };
  if (Math.random() < 0.05) {
    base.name = `\u2605 ${base.name}`;
    base.hp = Math.floor(base.hp * 1.5);
    base.maxHp = base.hp;
    base.atk = Math.floor(base.atk * 1.4);
    base.def = Math.floor(base.def * 1.3);
    base.xp = Math.floor(base.xp * 2);
    base.gold = Math.floor(base.gold * 2);
    base.isChampion = true;
  }
  return base;
}
const BD = [{ n: "Crypt Warden", i: "\u{1F6E1}\uFE0F", h: 100, a: 18, d: 12, x: 70, g: 50, sub: "Guardian of the Forgotten" }, { n: "Sewer King", i: "\u{1F40A}", h: 140, a: 24, d: 14, x: 100, g: 70, sub: "Sovereign of Filth" }, { n: "Stone Titan", i: "\u{1F5FF}", h: 190, a: 30, d: 22, x: 140, g: 95, sub: "Heart of the Mountain" }, { n: "Lich Lord", i: "\u2620\uFE0F", h: 250, a: 36, d: 16, x: 185, g: 120, sub: "Undying Archon" }, { n: "Infernal Duke", i: "\u{1F608}", h: 320, a: 44, d: 20, x: 240, g: 155, sub: "Prince of Cinders" }, { n: "Frost Emperor", i: "\u2744\uFE0F", h: 400, a: 50, d: 26, x: 300, g: 195, sub: "Eternal Winter" }, { n: "Void Sovereign", i: "\u{1F300}", h: 500, a: 56, d: 22, x: 370, g: 240, sub: "The Unmaker" }, { n: "Ancient Wyrm", i: "\u{1F409}", h: 620, a: 64, d: 32, x: 450, g: 300, sub: "First of Dragonkind" }, { n: "Elder God", i: "\u{1F441}\uFE0F", h: 760, a: 72, d: 28, x: 550, g: 370, sub: "Dreaming Horror" }, { n: "Shadow King", i: "\u{1F451}", h: 920, a: 82, d: 36, x: 680, g: 460, sub: "Lord of Darkness" }];
const MBD = [{ n: "Gravemaw", i: "\u{1F480}", h: 200, a: 28, d: 18, x: 160, g: 110, title: "Devourer of Souls", aura: "#c9a84c" }, { n: "Toxicor", i: "\u{1F40D}", h: 340, a: 40, d: 20, x: 280, g: 175, title: "Plague Incarnate", aura: "#44cc66" }, { n: "Gorath", i: "\u{1F5FF}", h: 500, a: 50, d: 30, x: 420, g: 260, title: "Living Mountain", aura: "#ffaa22" }, { n: "Malachar", i: "\u2620\uFE0F", h: 680, a: 60, d: 24, x: 580, g: 360, title: "Death's Herald", aura: "#8888ff" }, { n: "Ignatius Rex", i: "\u{1F525}", h: 880, a: 72, d: 32, x: 760, g: 480, title: "Lord of Cinders", aura: "#ff4422" }, { n: "Glacius", i: "\u2744\uFE0F", h: 1100, a: 82, d: 38, x: 960, g: 600, title: "Heart of Winter", aura: "#66ddff" }, { n: "Nihilex", i: "\u{1F311}", h: 1400, a: 94, d: 34, x: 1200, g: 750, title: "Entropy Incarnate", aura: "#bb66ff" }, { n: "Tiamat", i: "\u{1F432}", h: 1750, a: 108, d: 42, x: 1500, g: 920, title: "Mother of Dragons", aura: "#ff8800" }, { n: "Azathoth", i: "\u{1F441}\uFE0F", h: 2100, a: 118, d: 38, x: 1800, g: 1100, title: "The Blind Dreamer", aura: "#22ffaa" }, { n: "Erebus", i: "\u{1F451}", h: 2800, a: 135, d: 48, x: 2500, g: 1500, title: "King of Shadow \u2014 FINAL", aura: "#ffd700" }];
function getFloorBoss(f) {
  const b = BD[getTier(f) - 1];
  const s = 1 + (f - 1) % 10 * 0.15;
  const hpMult = getTier(f) >= 6 ? 1.8 : 1.4;
  return { ...b, name: b.n, icon: b.i, subtitle: b.sub, hp: Math.floor(b.h * s * hpMult), maxHp: Math.floor(b.h * s * hpMult), atk: Math.floor(b.a * s * 1.2), def: Math.floor(b.d * s * 1.25), xp: Math.floor(b.x * s), gold: Math.floor(b.g * s), id: uid(), isBoss: true, bossFloor: f };
}
function getMegaBoss(f) {
  const b = MBD[Math.floor((f - 1) / 10)];
  if (!b) return getFloorBoss(f);
  return { ...b, name: b.n, icon: b.i, hp: Math.floor(b.h * 1.3), maxHp: Math.floor(b.h * 1.3), atk: Math.floor(b.a * 1.15), def: b.d, xp: b.x, gold: b.g, id: uid(), isBoss: true, isMega: true, bossFloor: f };
}
const BOSS_DIALOGUE = {
  "Gravemaw": "More bones for the pile.",
  "Toxicor": "Drink deep. Everyone does, eventually.",
  "Gorath": "The mountain remembers what you've forgotten.",
  "Malachar": "I preserve. You destroy. We are not the same.",
  "Ignatius Rex": "I tried to forge beauty. Now I only forge ash.",
  "Glacius": "Don't move. You're perfect just as you are.",
  "Nihilex": "You are already less than you were.",
  "Tiamat": "I did this for them. You wouldn't understand.",
  "Azathoth": "...dreaming...you're in the dream now...",
  "Erebus": "You came. So did I, once."
};
const BOSS_EPITAPH = {
  "Gravemaw": "The dead rest again.",
  "Toxicor": "The water clears, slowly.",
  "Gorath": "The mountain sighs.",
  "Malachar": "The books close themselves.",
  "Ignatius Rex": "The fire finally goes out.",
  "Glacius": "Time begins again.",
  "Nihilex": "The void closes. For now.",
  "Tiamat": "Her people fall. As she knew they would.",
  "Azathoth": "It wakes. It screams. Then silence.",
  "Erebus": "He looks at you. Almost grateful."
};
const TIER_INTROS = ["The air smells of old stone and older death.", "Water drips from above. It doesn't smell right.", "Pickaxes lie broken. The mountain won.", "Hymns echo from nowhere. The dead still pray.", "Heat rises through the floor. Something is still burning.", "Your breath crystallizes. Time stopped here.", "The corridors don't connect the way they should.", "Claw marks on the walls. These weren't always tunnels.", "You can't tell if you're awake.", "This deep didn't exist before him."];
const SANC_PLAQUES = ["The Hollow Kingdom endured for three hundred years.", "The water once ran clear to the surface.", "Ten thousand miners worked these halls.", "The cathedral held the largest library in the known world.", "Master Smith Ignatius forged the Crown of Dawn here.", "The ice gardens were said to be the most beautiful place underground.", "The research labs were sealed by royal decree. Someone unsealed them.", "Queen Tiamat loved her people. That was the problem.", "The forbidden archive held one rule: never read aloud."];
const SANC_NPC = ["You survived the crypts. Most don't.", "Toxicor's poison will fade now. The water won't heal, but it'll stop killing.", "The mines go deeper than anyone mapped. Be careful.", "Malachar's undead don't rest. Even here, I hear them.", "The forge fires are out. But the embers remember.", "Everything frozen down there was alive once. Remember that.", "The void researchers thought they were studying it. It was studying them.", "The drakes mourn their queen. They'll fight harder now.", "Don't trust what you see below. Azathoth's dreams are contagious."];
const LORE_ENTRIES = [
  ["An expedition journal: 'Day 1. The entrance is clear. Erebus leads us deeper.'", "Scratched into the wall: 'The rats weren't always this big.'", "A faded map. Someone marked this room 'SAFE.' The ink is brown."],
  ["Engineer's log: 'Toxicor reversed the water flow. Nothing drains anymore.'", "A child's toy, preserved in sludge. Someone lived here.", "Carved into pipe: 'The mushrooms glow because they feed on the sick.'"],
  ["A miner's last entry: 'The deeper ores listen. I swear they listen.'", "Luminite sample, still warm. It hums when you hold it.", "Foreman's log: 'Gorath was a statue. Then it wasn't.'"],
  ["Prayer book, pages stuck with blood: 'Malachar promised us eternity.'", "A preserved body. It's smiling. The preservation is perfect.", "Cathedral record: 'The hymns continue without singers.'"],
  ["Blacksmith's journal: 'Ignatius stopped sleeping. Says the metal speaks.'", "A half-forged crown, still glowing. The craftsmanship is flawless.", "Warning etched in steel: 'He didn't start the fire. He BECAME it.'"],
  ["Research note: 'Glacius froze time itself. The garden is proof.'", "An ice flower, impossibly delicate. It hasn't melted in decades.", "Personal letter, never sent: 'I can see my breath. It's been three years.'"],
  ["Lab journal: 'Experiment 7. The void looked back.'", "A mirror that shows yesterday. Or tomorrow. Hard to tell.", "Warning sign: 'REALITY UNSTABLE BEYOND THIS POINT'"],
  ["Drake keeper's log: 'Tiamat changed them to save them. They don't remember being human.'", "A scale the size of a shield. It's warm and smells of cinnamon.", "Lullaby carved in Draconic. The translation is heartbreaking."],
  ["Researcher's final note: 'Azathoth isn't sleeping. It's DREAMING us.'", "A clock running backward. The hands move when you're not looking.", "Someone's journal \u2014 your handwriting. You don't remember writing it."],
  ["Erebus' diary: 'The Heart promised it would stop the pain.'", "A throne room sketch. Erebus drew himself small. The Heart, enormous.", "Final page: 'I didn't want to be king. I wanted to go home.'"]
];
const NPC_DATA = [
  [{ icon: "\u{1F464}", name: "Survivor", line: "Turn back. There's nothing down here worth finding." }],
  [{ icon: "\u{1F527}", name: "Engineer", line: "Toxicor reversed the water. Everything flows wrong now." }],
  [{ icon: "\u{1F47B}", name: "Ghost Miner", line: "The deeper ores listen. Don't tap the walls." }],
  [{ icon: "\u{1F4D6}", name: "Undead Scribe", line: "Malachar says he's preserving knowledge. He's preserving US." }],
  [{ icon: "\u{1F467}", name: "Ignatius' Daughter", line: "Please. End my father's suffering. He's still in there." }],
  [{ icon: "\u{1F9CA}", name: "Frozen Scholar", line: "I've been here... how long? The ice won't let me count." }],
  [{ icon: "\u{1F4DC}", name: "Your Journal", line: "'If you're reading this, you've gone too deep. Come back.' \u2014 You" }],
  [{ icon: "\u{1F409}", name: "Dying Drake", line: "She did it for us... we were human once... remember..." }],
  [{ icon: "\u{1F52C}", name: "Looping Researcher", line: "Day 1. The experiment begins. Day 1. The experiment begins. Day 1." }],
  [{ icon: "\u{1F441}\uFE0F", name: "Erebus' Memory", line: "I was so afraid. I'm still afraid. Are you afraid too?" }]
];
const ECHO_LINES = ["I was afraid.", "The Heart promised it would stop.", "I didn't want to be alone.", "Do you hear it too?", "I can still remember sunlight.", "They trusted me.", "It wasn't supposed to be like this.", "I'm sorry.", "You remind me of someone I was."];
const BESTIARY_FLAVOR = { Rat: "Once pets of the court. Now they feast on their former masters.", Bat: "They fled the surface when the darkness began.", Skeleton: "The kingdom's soldiers, still marching.", Zombie: "They remember nothing. That's the mercy.", Ghost: "Trapped between the world they knew and the one that replaced it.", Slime: "The sewers' immune system, attacking everything foreign.", Spider: "They grew large on a diet of despair.", Kobold: "Miners who dug too greedily and too deep.", Golem: "Built to protect. Forgot who from.", Wraith: "Scholars who read the forbidden texts aloud.", Shadow: "What's left when a void walker loses their mind.", Imp: "Drawn to the fire like moths. Unlike moths, they survived.", "Ice Wraith": "Frozen mid-scream. The cold preserved everything except hope.", Dragonkin: "Tiamat's children. They don't know they were human.", Gibberer: "It saw something in the void. Now it can't stop talking about it.", "Shd Guard": "Erebus' personal guard. They chose this.", Fallen: "Angels that descended to help. The darkness was stronger." };
const CLASSES = { warrior: { name: "Warrior", icon: "\u2694\uFE0F", hp: 130, mp: 25, str: 15, dex: 8, int: 5, def: 13, desc: "Heavy armor. Devastating strikes.", skills: ["Power Strike", "Shield Wall", "Cleave", "War Cry", "Berserk"], passive: "Iron Will: +10% HP from armor" }, mage: { name: "Mage", icon: "\u{1F52E}", hp: 65, mp: 110, str: 4, dex: 6, int: 17, def: 4, desc: "Master of arcane destruction.", skills: ["Fireball", "Ice Shard", "Arcane Shield", "Chain Bolt", "Meteor"], passive: "Arcane Surge: +15% spell damage" }, thief: { name: "Thief", icon: "\u{1F5E1}\uFE0F", hp: 85, mp: 55, str: 9, dex: 17, int: 8, def: 6, desc: "Swift. Cunning. Lethal.", skills: ["Backstab", "Smoke Bomb", "Steal", "Assassinate", "Shadow Step"], passive: "Shadow Step: +20% dodge chance" } };
const PERKS = [
  [{ name: "Vitality", desc: "+15% max HP", eff: "hp_pct", amt: 15 }, { name: "Tough Skin", desc: "+3 base DEF", eff: "def", amt: 3 }],
  [{ name: "Power", desc: "+3 STR", eff: "str", amt: 3 }, { name: "Precision", desc: "+3 DEX", eff: "dex", amt: 3 }],
  [{ name: "Wisdom", desc: "+3 INT", eff: "int", amt: 3 }, { name: "Endurance", desc: "+20 max MP", eff: "mp", amt: 20 }],
  [{ name: "Critical Eye", desc: "+5% crit chance", eff: "crit", amt: 5 }, { name: "Gold Sense", desc: "+50% gold drops", eff: "gold", amt: 50 }],
  [{ name: "Undying", desc: "Survive lethal hit once", eff: "undying", amt: 1 }, { name: "Mastery", desc: "+5 all stats", eff: "allstats", amt: 5 }]
];
const MORAL_CHOICES = [
  { prompt: "A wounded enemy begs for mercy.", a: { label: "Spare", eff: "xp", amt: 20, msg: "Mercy given. +20 XP." }, b: { label: "Strike", eff: "gold", amt: 50, msg: "Cold efficiency. +50 gold." } },
  { prompt: "A shrine glows with forbidden power.", a: { label: "Pray", eff: "hp", amt: 0, msg: "Fully healed by faith." }, b: { label: "Drain", eff: "str", amt: 2, msg: "+2 STR. The shrine goes dark." } },
  { prompt: "A child's ghost points to a hidden cache.", a: { label: "Follow", eff: "loot", amt: 0, msg: "Found treasure!" }, b: { label: "Free it", eff: "xp", amt: 40, msg: "The ghost smiles and fades. +40 XP." } },
  { prompt: "Poisoned water blocks the path.", a: { label: "Drink", eff: "risk", amt: 0, msg: "Survived... barely." }, b: { label: "Go around", eff: "safe", amt: 0, msg: "The longer path. Time well spent." } },
  { prompt: "An altar demands a blood offering.", a: { label: "Offer", eff: "sacrifice", amt: 0, msg: "Power at a price." }, b: { label: "Refuse", eff: "def", amt: 1, msg: "+1 DEF. Willpower strengthened." } }
];
const FLOOR_EVENTS = [
  { msg: "A cool breeze refreshes you.", eff: "mp", amt: 5 },
  { msg: "You find a coin glinting in the dust.", eff: "gold", amt: 15 },
  { msg: "A rat scurries past, dropping something.", eff: "loot", amt: 0 },
  { msg: "Strange runes glow briefly on the wall.", eff: "xp", amt: 10 },
  { msg: "You step on a pressure plate \u2014 nothing happens. Lucky.", eff: "none", amt: 0 },
  { msg: "An echo of laughter fades into silence.", eff: "none", amt: 0 },
  { msg: "A warm draft carries the scent of cinnamon.", eff: "hp", amt: 8 },
  { msg: "The ground trembles slightly.", eff: "none", amt: 0 }
];
const SPECIALIZATIONS = {
  warrior: [{ name: "Berserker", desc: "+20% ATK, -10% DEF", eff: "berserker" }, { name: "Guardian", desc: "+20% DEF, +50 HP", eff: "guardian" }],
  mage: [{ name: "Elementalist", desc: "+25% spell damage", eff: "elementalist" }, { name: "Arcanist", desc: "+40 MP, spells cost 15% less", eff: "arcanist" }],
  thief: [{ name: "Assassin", desc: "+30% crit damage", eff: "assassin" }, { name: "Shadow", desc: "+25% dodge, +3 vision", eff: "shadow" }]
};
const ACHIEVEMENTS = [
  { id: "a1", name: "First Blood", desc: "Defeat your first enemy", c: (s) => s.kills >= 1 },
  { id: "a2", name: "Dungeon Diver", desc: "Reach Floor 25", c: (s) => s.floor >= 25 },
  { id: "a3", name: "Centurion", desc: "Defeat 100 enemies", c: (s) => s.kills >= 100 },
  { id: "a4", name: "Dragon Slayer", desc: "Beat Tiamat", c: (s) => s.megaK >= 8 },
  { id: "a5", name: "Shadow Breaker", desc: "Defeat Erebus", c: (s) => s.erebus },
  { id: "a6", name: "Treasure Hunter", desc: "Open 50 chests", c: (s) => s.chests >= 50 },
  { id: "a7", name: "Millionaire", desc: "Earn 100,000 gold total", c: (s) => s.totG >= 1e5 },
  { id: "a8", name: "Marathon", desc: "Walk 5,000 steps", c: (s) => s.steps >= 5e3 }
];
const BOUNTY_TARGETS = ["Rat", "Spider", "Kobold", "Golem", "Wraith", "Imp", "Ice Wraith", "Shadow", "Dragonkin", "Gibberer"];
const OBJ = [
  // Early game
  { id: 1, text: "Reach Floor 5", c: (s) => s.floor >= 5, cat: "explore", xp: 20 },
  { id: 2, text: "Defeat 10 enemies", c: (s) => s.kills >= 10, cat: "combat", xp: 15 },
  { id: 3, text: "Open 5 chests", c: (s) => s.chests >= 5, cat: "explore", xp: 15 },
  { id: 4, text: "Reach Level 5", c: (s) => s.level >= 5, cat: "progress", xp: 20 },
  { id: 5, text: "Collect 200 gold total", c: (s) => s.totG >= 200, cat: "wealth", xp: 10 },
  // Mid-early
  { id: 6, text: "Reach Floor 10", c: (s) => s.floor >= 10, cat: "explore", xp: 30 },
  { id: 7, text: "Beat your first Mega Boss", c: (s) => s.megaK >= 1, cat: "combat", xp: 50 },
  { id: 8, text: "Defeat 50 enemies", c: (s) => s.kills >= 50, cat: "combat", xp: 30 },
  { id: 9, text: "Reach Level 10", c: (s) => s.level >= 10, cat: "progress", xp: 40 },
  { id: 10, text: "Open 20 chests", c: (s) => s.chests >= 20, cat: "explore", xp: 25 },
  // Mid game
  { id: 11, text: "Reach Floor 25", c: (s) => s.floor >= 25, cat: "explore", xp: 50 },
  { id: 12, text: "Collect 2,000 gold total", c: (s) => s.totG >= 2e3, cat: "wealth", xp: 35 },
  { id: 13, text: "Defeat 100 enemies", c: (s) => s.kills >= 100, cat: "combat", xp: 50 },
  { id: 14, text: "Beat 3 Mega Bosses", c: (s) => s.megaK >= 3, cat: "combat", xp: 60 },
  { id: 15, text: "Reach Level 20", c: (s) => s.level >= 20, cat: "progress", xp: 50 },
  { id: 16, text: "Walk 500 steps", c: (s) => s.steps >= 500, cat: "explore", xp: 20 },
  // Late-mid
  { id: 17, text: "Reach Floor 50", c: (s) => s.floor >= 50, cat: "explore", xp: 80 },
  { id: 18, text: "Beat 5 Mega Bosses", c: (s) => s.megaK >= 5, cat: "combat", xp: 80 },
  { id: 19, text: "Defeat 250 enemies", c: (s) => s.kills >= 250, cat: "combat", xp: 60 },
  { id: 20, text: "Collect 10,000 gold total", c: (s) => s.totG >= 1e4, cat: "wealth", xp: 70 },
  { id: 21, text: "Reach Level 30", c: (s) => s.level >= 30, cat: "progress", xp: 70 },
  // Late game
  { id: 22, text: "Reach Floor 75", c: (s) => s.floor >= 75, cat: "explore", xp: 100 },
  { id: 23, text: "Defeat 500 enemies", c: (s) => s.kills >= 500, cat: "combat", xp: 80 },
  { id: 24, text: "Walk 2,000 steps", c: (s) => s.steps >= 2e3, cat: "explore", xp: 50 },
  { id: 25, text: "Beat all 10 Mega Bosses", c: (s) => s.megaK >= 10, cat: "combat", xp: 150 },
  // Endgame
  { id: 26, text: "Reach Floor 100", c: (s) => s.floor >= 100, cat: "explore", xp: 120 },
  { id: 27, text: "Defeat Erebus, King of Shadow", c: (s) => s.erebus, cat: "combat", xp: 300 },
  { id: 28, text: "Collect 50,000 gold total", c: (s) => s.totG >= 5e4, cat: "wealth", xp: 100 },
  { id: 29, text: "Reach Level 50", c: (s) => s.level >= 50, cat: "progress", xp: 150 },
  { id: 30, text: "Defeat 1,000 enemies", c: (s) => s.kills >= 1e3, cat: "combat", xp: 120 },
  // Class-specific
  { id: 31, text: "Warrior: Reach 500 HP", c: (s) => s.cls === "warrior" && s.maxHp >= 500, cat: "progress", xp: 60 },
  { id: 32, text: "Mage: Reach 200 MP", c: (s) => s.cls === "mage" && s.maxMp >= 200, cat: "progress", xp: 60 },
  { id: 33, text: "Thief: Reach 50 DEX", c: (s) => s.cls === "thief" && s.dex >= 50, cat: "progress", xp: 60 }
];
function dimStat(s) {
  if (s <= 50) return s;
  if (s <= 80) return 50 + Math.floor((s - 50) * 0.75);
  return 72 + Math.floor((s - 80) * 0.5);
}
function calcStats(p) {
  let atk = p.str, def = p.baseDef, mp = p.baseMaxMp;
  if (p.equipped.weapon) {
    atk += p.equipped.weapon.atk;
    if (p.equipped.weapon.dexB) atk += p.equipped.weapon.dexB;
    if (p.equipped.weapon.intB) atk += p.equipped.weapon.intB;
  }
  if (p.equipped.armor) {
    def += p.equipped.armor.def;
    if (p.equipped.armor.mpB) mp += p.equipped.armor.mpB;
    if (p.equipped.armor.dexB) def += Math.floor(p.equipped.armor.dexB * 0.5);
  }
  if (p.equipped.accessory) {
    const acc = p.equipped.accessory;
    if (acc.atkB) atk += acc.atkB;
    if (acc.defB) def += acc.defB;
    if (acc.mpB) mp += acc.mpB;
  }
  if (p.cls === "warrior") def = Math.floor(def * 1.1);
  if (p.cls === "mage") atk = Math.floor(atk * 1.15);
  return { atk, def, maxMp: mp };
}
function rollDmg(base, variance) {
  const r1 = Math.random() * variance * 2 - variance;
  const r2 = Math.random() * variance * 2 - variance;
  return Math.max(1, Math.floor(base + (r1 + r2) / 2));
}
function calcEnemyDmg(enemy, pStats, shields) {
  const reduction = pStats.def / (pStats.def + enemy.atk + 40);
  const baseDmg = enemy.atk * (1 - reduction);
  const v = Math.max(2, Math.floor(enemy.atk * 0.12));
  let dmg = rollDmg(baseDmg, v);
  if (shields.sw) dmg = Math.floor(dmg * 0.5);
  if (shields.as) dmg = Math.floor(dmg * 0.5);
  const crit = Math.random() < (enemy.critRate || 0.08);
  if (crit) dmg = Math.floor(dmg * 1.5);
  return { dmg: Math.max(1, dmg), crit };
}
function getBestEquip(p, arm = []) {
  const allGear = [...p.inv, ...arm];
  const ws = allGear.filter((i) => i.type === "weapon");
  const ar = allGear.filter((i) => i.type === "armor");
  let bW = p.equipped.weapon, bA = p.equipped.armor;
  const wS = (w) => (w?.atk || 0) + (w?.dexB || 0) + (w?.intB || 0);
  const aS = (a) => (a?.def || 0) + Math.floor((a?.mpB || 0) * 0.1) + Math.floor((a?.dexB || 0) * 0.5);
  for (const w of ws) if (wS(w) > wS(bW)) bW = w;
  for (const a of ar) if (aS(a) > aS(bA)) bA = a;
  return { weapon: bW, armor: bA };
}
function genDungeon(f, isSanc = false) {
  const fc = isSanc ? SANC_CONFIG : getFC(f);
  const isMega = !isSanc && f % 10 === 0;
  const map = Array.from({ length: MH }, () => Array(MW).fill(T.WALL));
  const rooms = [];
  const rev = Array.from({ length: MH }, () => Array(MW).fill(false));
  const rc = isSanc ? rng(3, 5) : isMega ? rng(7, 10) : rng(10, 16);
  for (let a = 0; a < 200; a++) {
    if (rooms.length >= rc) break;
    const rw = rng(isSanc ? 5 : 4, isSanc ? 10 : 10 + Math.floor(f / 25)), rh = rng(isSanc ? 4 : 3, isSanc ? 8 : 8 + Math.floor(f / 30)), rx = rng(1, MW - rw - 2), ry = rng(1, MH - rh - 2);
    let ok = true;
    for (const r of rooms) if (rx < r.x + r.w + 2 && rx + rw + 2 > r.x && ry < r.y + r.h + 2 && ry + rh + 2 > r.y) {
      ok = false;
      break;
    }
    if (!ok) continue;
    for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) map[y][x] = T.FLOOR;
    rooms.push({ x: rx, y: ry, w: rw, h: rh, cx: Math.floor(rx + rw / 2), cy: Math.floor(ry + rh / 2) });
  }
  if (rooms.length < 2) {
    const fb = [{ x: 5, y: 5, w: 8, h: 6, cx: 9, cy: 8 }, { x: 25, y: 18, w: 8, h: 6, cx: 29, cy: 21 }];
    fb.forEach((r) => {
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) map[y][x] = T.FLOOR;
      rooms.push(r);
    });
  }
  for (let i = 0; i < rooms.length - 1; i++) {
    let { cx: x1, cy: y1 } = rooms[i], { cx: x2, cy: y2 } = rooms[i + 1];
    while (x1 !== x2) {
      if (map[y1][x1] === T.WALL) map[y1][x1] = T.FLOOR;
      x1 += x1 < x2 ? 1 : -1;
    }
    while (y1 !== y2) {
      if (map[y1][x1] === T.WALL) map[y1][x1] = T.FLOOR;
      y1 += y1 < y2 ? 1 : -1;
    }
    if (map[y1][x1] === T.WALL) map[y1][x1] = T.FLOOR;
  }
  if (rooms.length > 4) {
    for (let e = 0; e < rng(2, 3); e++) {
      const a = rng(0, rooms.length - 1);
      let b = rng(0, rooms.length - 1);
      while (b === a || Math.abs(b - a) <= 1) b = rng(0, rooms.length - 1);
      let { cx: x1, cy: y1 } = rooms[a], { cx: x2, cy: y2 } = rooms[b];
      while (x1 !== x2) {
        if (map[y1][x1] === T.WALL) map[y1][x1] = T.FLOOR;
        x1 += x1 < x2 ? 1 : -1;
      }
      while (y1 !== y2) {
        if (map[y1][x1] === T.WALL) map[y1][x1] = T.FLOOR;
        y1 += y1 < y2 ? 1 : -1;
      }
      if (map[y1][x1] === T.WALL) map[y1][x1] = T.FLOOR;
    }
  }
  const decor = /* @__PURE__ */ new Map();
  if (!isSanc) {
    rooms.forEach((r, ri) => {
      if (ri === 0 || ri === rooms.length - 1 || Math.random() > 0.2) return;
      const ext = rng(2, 3);
      const side = rng(0, 3);
      let sx, sy, sw, sh;
      if (side === 0) {
        sx = r.x + r.w;
        sy = r.y;
        sw = ext;
        sh = Math.floor(r.h / 2);
      } else if (side === 1) {
        sx = r.x - ext;
        sy = r.y + Math.floor(r.h / 2);
        sw = ext;
        sh = Math.floor(r.h / 2);
      } else if (side === 2) {
        sx = r.x;
        sy = r.y + r.h;
        sw = Math.floor(r.w / 2);
        sh = ext;
      } else {
        sx = r.x + Math.floor(r.w / 2);
        sy = r.y - ext;
        sw = Math.floor(r.w / 2);
        sh = ext;
      }
      for (let y = sy; y < sy + sh; y++) for (let x = sx; x < sx + sw; x++) {
        if (x > 0 && x < MW - 1 && y > 0 && y < MH - 1) map[y][x] = T.FLOOR;
      }
    });
    rooms.forEach((r, ri) => {
      if (ri === 0 || ri === rooms.length - 1) return;
      if (r.w >= 8 && r.h >= 6) {
        for (let py = r.y + 2; py < r.y + r.h - 2; py += 3) for (let px = r.x + 2; px < r.x + r.w - 2; px += 3) {
          if (map[py] && map[py][px] === T.FLOOR && Math.random() < 0.6) {
            const adjF = [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dx, dy]) => map[py + dy] && map[py + dy][px + dx] === T.FLOOR).length;
            if (adjF <= 2) {
              const horiz = map[py] && map[py][px - 1] === T.FLOOR && map[py][px + 1] === T.FLOOR;
              const vert = map[py - 1] && map[py - 1][px] === T.FLOOR && map[py + 1] && map[py + 1][px] === T.FLOOR;
              if (horiz || vert) continue;
            }
            map[py][px] = T.WALL;
            decor.set(`${px},${py}`, { icon: "\u{1FAA8}", type: "pillar" });
          }
        }
      }
    });
    const crackCandidates = [];
    for (let y = 2; y < MH - 2; y++) for (let x = 2; x < MW - 2; x++) {
      if (map[y][x] !== T.WALL) continue;
      const adjFloor = [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dx, dy]) => map[y + dy] && map[y + dy][x + dx] === T.FLOOR).length;
      if (adjFloor >= 1 && adjFloor <= 2) crackCandidates.push({ x, y });
    }
    const crackCount = Math.min(crackCandidates.length, rng(3, 6));
    for (let i = 0; i < crackCount && crackCandidates.length > 0; i++) {
      const idx = rng(0, crackCandidates.length - 1);
      map[crackCandidates[idx].y][crackCandidates[idx].x] = T.CRACKED;
      crackCandidates.splice(idx, 1);
    }
    const themeCount = rng(2, Math.min(4, rooms.length - 2));
    for (let i = 0; i < themeCount; i++) {
      const ri2 = rng(1, Math.max(1, rooms.length - 2));
      const r = rooms[ri2];
      if (!r) continue;
      const theme = ROOM_THEMES[rng(0, ROOM_THEMES.length - 1)];
      const themeIcons = { armory: "\u2694\uFE0F", library: "\u{1F4DA}", shrine: "\u26E9\uFE0F", prison: "\u26D3\uFE0F", treasury: "\u{1F4B0}", lab: "\u{1F9EA}", crypt: "\u26B0\uFE0F", garden: "\u{1F33F}" };
      const icon = themeIcons[theme] || "\u{1F3DB}\uFE0F";
      for (let td = 0; td < rng(1, 2); td++) {
        for (let a = 0; a < 15; a++) {
          const px = rng(r.x + 1, r.x + r.w - 2), py = rng(r.y + 1, r.y + r.h - 2);
          if (map[py] && map[py][px] === T.FLOOR && !decor.has(`${px},${py}`)) {
            decor.set(`${px},${py}`, { icon, type: "theme", theme });
            break;
          }
        }
      }
    }
    const lmCount = rng(1, 2);
    for (let i = 0; i < lmCount; i++) {
      const lm = LANDMARKS[rng(0, LANDMARKS.length - 1)];
      const ri3 = rng(1, Math.max(1, rooms.length - 2));
      const r = rooms[ri3];
      if (!r) continue;
      for (let a = 0; a < 20; a++) {
        const px = rng(r.x + 1, r.x + r.w - 2), py = rng(r.y + 1, r.y + r.h - 2);
        if (map[py] && map[py][px] === T.FLOOR && !decor.has(`${px},${py}`)) {
          map[py][px] = T.FEATURE;
          decor.set(`${px},${py}`, { icon: lm.icon, name: lm.name, eff: lm.eff, amt: lm.amt, msg: lm.msg, type: "feature" });
          break;
        }
      }
    }
    if (f % 5 === 0 && f % 10 !== 0 && rooms.length > 3) {
      const switchRoom = rng(1, Math.max(1, rooms.length - 3));
      const sr = rooms[switchRoom];
      const rewardRoom = rng(switchRoom + 1, Math.max(switchRoom + 1, rooms.length - 2));
      const rr = rooms[rewardRoom];
      if (sr && rr) {
        for (let a = 0; a < 20; a++) {
          const px = rng(sr.x + 1, sr.x + sr.w - 2), py = rng(sr.y + 1, sr.y + sr.h - 2);
          if (map[py] && map[py][px] === T.FLOOR && !decor.has(`${px},${py}`)) {
            let targetX = -1, targetY = -1;
            for (let b = 0; b < 30; b++) {
              const tx = rng(rr.x, rr.x + rr.w - 1), ty = rng(rr.y, rr.y + rr.h - 1);
              if (map[ty] && map[ty][tx] === T.WALL) {
                targetX = tx;
                targetY = ty;
                break;
              }
            }
            if (targetX >= 0) {
              map[py][px] = T.FEATURE;
              decor.set(`${px},${py}`, { icon: "\u{1F518}", name: "Ancient Switch", eff: "puzzle", type: "feature", targetX, targetY });
            }
            break;
          }
        }
      }
    }
  }
  const plc = (ri, t) => {
    const r = rooms[ri];
    if (!r) return null;
    for (let a = 0; a < 30; a++) {
      const px = rng(r.x + 1, r.x + r.w - 2), py = rng(r.y + 1, r.y + r.h - 2);
      if (map[py] && map[py][px] === T.FLOOR) {
        map[py][px] = t;
        return { x: px, y: py };
      }
    }
    return null;
  };
  const bri = rooms.length - 1;
  const bossPos = { x: rooms[bri].cx, y: rooms[bri].cy };
  let stairsPos = null;
  if (isSanc || f < 100) {
    stairsPos = plc(bri, T.STAIRS);
    if (!stairsPos && rooms[bri]) {
      const sx = rooms[bri].cx + 1;
      if (map[rooms[bri].cy]) {
        map[rooms[bri].cy][sx] = T.STAIRS;
        stairsPos = { x: sx, y: rooms[bri].cy };
      }
    }
  }
  if (isSanc) {
    plc(0, T.FOUNTAIN);
    if (rooms.length > 1) plc(1, T.FOUNTAIN);
    plc(rooms.length > 1 ? 1 : 0, T.SHOP);
  } else {
    for (let i = 0; i < rng(5, 8 + Math.floor(f / 4)); i++) plc(rng(1, Math.max(1, bri - 1)), T.CHEST);
    for (let i = 0; i < rng(3, 5 + Math.floor(f / 5)); i++) plc(rng(1, Math.max(1, bri - 1)), T.TRAP);
    for (let i = 0; i < rng(0, 2); i++) plc(rng(1, Math.max(1, bri - 1)), T.FOUNTAIN);
    for (let i = 0; i < rng(1, Math.floor(f / 8) + 3); i++) plc(rng(1, Math.max(1, bri - 1)), fc.haz);
    if (rooms.length > 3) {
      const corridors = [];
      const deadEnds = [];
      for (let y = 2; y < MH - 2; y++) for (let x = 2; x < MW - 2; x++) {
        if (map[y][x] !== T.FLOOR) continue;
        if (bossPos && Math.abs(x - bossPos.x) + Math.abs(y - bossPos.y) < 4) continue;
        if (stairsPos && Math.abs(x - stairsPos.x) + Math.abs(y - stairsPos.y) < 3) continue;
        if (x === rooms[0].cx && y === rooms[0].cy) continue;
        const adj = [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dx, dy]) => map[y + dy] && map[y + dy][x + dx] === T.FLOOR).length;
        if (adj === 1) deadEnds.push({ x, y });
        else if (adj === 2) corridors.push({ x, y });
      }
      const candidates = deadEnds.length > 0 ? deadEnds : corridors;
      if (candidates.length > 0) {
        const pick = candidates[rng(0, candidates.length - 1)];
        map[pick.y][pick.x] = T.BARRIER;
      }
    }
    if (rooms.length > 3) {
      const wallAdj = [];
      for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
        if (map[y][x] !== T.WALL) continue;
        const adjFloor = [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([dx, dy]) => map[y + dy] && map[y + dy][x + dx] === T.FLOOR);
        if (adjFloor && Math.abs(x - rooms[0].cx) + Math.abs(y - rooms[0].cy) > 5) wallAdj.push({ x, y });
      }
      const secretCount = rng(1, 3);
      for (let s = 0; s < secretCount && wallAdj.length > 0; s++) {
        const idx = rng(0, wallAdj.length - 1);
        map[wallAdj[idx].y][wallAdj[idx].x] = T.SECRET;
        wallAdj.splice(idx, 1);
      }
    }
  }
  const start = { x: rooms[0].cx, y: rooms[0].cy };
  map[start.y][start.x] = T.FLOOR;
  if (!isSanc) {
    const ti = Math.min(Math.floor((f - 1) / 10), 9);
    const objs = BIOME_OBJ[ti];
    const scats = BIOME_SCATTER[ti];
    const center = BIOME_CENTER[ti];
    const wallEdges = [];
    for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
      if (map[y][x] !== T.FLOOR) continue;
      const adjWall = [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([dx, dy]) => map[y + dy] && map[y + dy][x + dx] === T.WALL);
      if (adjWall && !(x === start.x && y === start.y) && !(bossPos && x === bossPos.x && y === bossPos.y) && !(stairsPos && x === stairsPos.x && y === stairsPos.y)) wallEdges.push({ x, y });
    }
    const objCount = Math.min(wallEdges.length, rng(8, 15));
    for (let i = 0; i < objCount && wallEdges.length > 0; i++) {
      const idx = rng(0, wallEdges.length - 1);
      const p = wallEdges[idx];
      wallEdges.splice(idx, 1);
      const adjF2 = [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dx, dy]) => map[p.y + dy] && map[p.y + dy][p.x + dx] === T.FLOOR).length;
      if (adjF2 <= 2) {
        const hCorr = map[p.y] && map[p.y][p.x - 1] === T.FLOOR && map[p.y][p.x + 1] === T.FLOOR;
        const vCorr = map[p.y - 1] && map[p.y - 1][p.x] === T.FLOOR && map[p.y + 1] && map[p.y + 1][p.x] === T.FLOOR;
        if (hCorr || vCorr) continue;
      }
      map[p.y][p.x] = T.WALL;
      decor.set(`${p.x},${p.y}`, { icon: objs[rng(0, objs.length - 1)], type: "obj" });
    }
    const floorTiles = [];
    for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
      if (map[y][x] === T.FLOOR && !(x === start.x && y === start.y)) floorTiles.push({ x, y });
    }
    const scatCount = Math.min(floorTiles.length, rng(10, 20));
    for (let i = 0; i < scatCount; i++) {
      const idx = rng(0, floorTiles.length - 1);
      const p = floorTiles[idx];
      decor.set(`${p.x},${p.y}`, { icon: scats[rng(0, scats.length - 1)], type: "scatter" });
    }
    rooms.forEach((r, ri) => {
      if (ri === 0 || ri === bri) return;
      if (r.w >= 7 && r.h >= 5) {
        const cx = r.cx, cy = r.cy;
        if (map[cy][cx] === T.FLOOR) {
          map[cy][cx] = T.WALL;
          decor.set(`${cx},${cy}`, { icon: center, type: "center" });
        }
      }
    });
    const feat = BIOME_FEATURE[ti];
    const featCount = rng(1, 2);
    for (let fi = 0; fi < featCount; fi++) {
      const ri = rng(1, Math.max(1, bri - 1));
      const r = rooms[ri];
      if (!r) continue;
      for (let a = 0; a < 20; a++) {
        const px = rng(r.x + 1, r.x + r.w - 2), py = rng(r.y + 1, r.y + r.h - 2);
        if (map[py] && map[py][px] === T.FLOOR && !decor.has(`${px},${py}`)) {
          map[py][px] = T.FEATURE;
          decor.set(`${px},${py}`, { icon: feat.icon, name: feat.name, eff: feat.eff, type: "feature" });
          break;
        }
      }
    }
    const hazIcon = CORR_HAZ[ti][0];
    const hazType = CORR_HAZ[ti][1];
    if (hazIcon !== "\xB7" && hazType) {
      for (let y = 2; y < MH - 2; y++) for (let x = 2; x < MW - 2; x++) {
        if (map[y][x] !== T.FLOOR || decor.has(`${x},${y}`)) continue;
        const adj = [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dx, dy]) => map[y + dy] && map[y + dy][x + dx] === T.FLOOR).length;
        if (adj === 2 && Math.random() < 0.12) decor.set(`${x},${y}`, { icon: hazIcon, type: "corridor", hazType });
      }
    }
    if (rooms[bri]) {
      const br2 = rooms[bri];
      [[br2.x, br2.y], [br2.x + br2.w - 1, br2.y], [br2.x, br2.y + br2.h - 1], [br2.x + br2.w - 1, br2.y + br2.h - 1]].forEach(([tx, ty]) => {
        if (tx > 0 && tx < MW - 1 && ty > 0 && ty < MH - 1 && map[ty][tx] === T.FLOOR) {
          decor.set(`${tx},${ty}`, { icon: "\u{1F525}", type: "torch" });
        }
      });
    }
    if (f >= 5) {
      const lockCount = rng(0, 2);
      let placed = 0;
      for (let y = 2; y < MH - 2 && placed < lockCount; y++) for (let x = 2; x < MW - 2 && placed < lockCount; x++) {
        if (map[y][x] !== T.FLOOR) continue;
        const adj = [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dx, dy]) => map[y + dy] && (map[y + dy][x + dx] === T.FLOOR || map[y + dy][x + dx] === T.TRAP)).length;
        if (adj === 2 && Math.random() < 0.02 && !decor.has(`${x},${y}`)) {
          map[y][x] = T.LOCKED;
          const q = [{ x: start.x, y: start.y }];
          const vis = /* @__PURE__ */ new Set();
          vis.add(start.x + "," + start.y);
          let reachStairs = !stairsPos;
          while (q.length > 0) {
            const p = q.shift();
            if (stairsPos && p.x === stairsPos.x && p.y === stairsPos.y) {
              reachStairs = true;
              break;
            }
            for (const [dx2, dy2] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
              const nx2 = p.x + dx2, ny2 = p.y + dy2;
              const k2 = nx2 + "," + ny2;
              if (nx2 >= 0 && nx2 < MW && ny2 >= 0 && ny2 < MH && !vis.has(k2) && map[ny2][nx2] !== T.WALL && map[ny2][nx2] !== T.SECRET && map[ny2][nx2] !== T.LOCKED) {
                vis.add(k2);
                q.push({ x: nx2, y: ny2 });
              }
            }
          }
          if (reachStairs) {
            placed++;
          } else {
            map[y][x] = T.FLOOR;
          }
        }
      }
    }
    rooms.forEach((r, ri) => {
      if (ri === 0 || ri === bri) return;
      let hasItem = false;
      for (let ry = r.y; ry < r.y + r.h && !hasItem; ry++) for (let rx = r.x; rx < r.x + r.w && !hasItem; rx++) {
        const t = map[ry] && map[ry][rx];
        if (t === T.CHEST || t === T.FOUNTAIN || t === T.FEATURE || t === T.LORE || t === T.NPC || t === T.SHOP) hasItem = true;
      }
      if (!hasItem && Math.random() < 0.3) {
        const cx = rng(r.x + 1, r.x + r.w - 2), cy = rng(r.y + 1, r.y + r.h - 2);
        if (map[cy] && map[cy][cx] === T.FLOOR) decor.set(`${cx},${cy}`, { type: "cache", gold: rng(5 + f, 15 + f * 3) });
      }
    });
    if (Math.random() < 0.1) {
      const mri = rng(1, Math.max(1, rooms.length - 2));
      const mr = rooms[mri];
      if (mr) {
        for (let a = 0; a < 20; a++) {
          const px = rng(mr.x + 1, mr.x + mr.w - 2), py = rng(mr.y + 1, mr.y + mr.h - 2);
          if (map[py] && map[py][px] === T.FLOOR && !decor.has(`${px},${py}`)) {
            map[py][px] = T.SHOP;
            break;
          }
        }
      }
    }
    const loreCount = rng(2, 3);
    const loreEntries = LORE_ENTRIES[ti] || [];
    for (let li = 0; li < loreCount && li < loreEntries.length; li++) {
      const ri2 = rng(1, Math.max(1, rooms.length - 2));
      const r2 = rooms[ri2];
      if (!r2) continue;
      for (let a = 0; a < 20; a++) {
        const px = rng(r2.x + 1, r2.x + r2.w - 2), py = rng(r2.y + 1, r2.y + r2.h - 2);
        if (map[py] && map[py][px] === T.FLOOR && !decor.has(`${px},${py}`)) {
          map[py][px] = T.LORE;
          decor.set(`${px},${py}`, { type: "lore", text: loreEntries[li], tier: ti + 1, idx: li });
          break;
        }
      }
    }
    const posInTier = (f - 1) % 10;
    if (NPC_DATA[ti] && (posInTier === 2 || posInTier === 4 || posInTier === 6)) {
      const npc = NPC_DATA[ti][0];
      const ri3 = rng(1, Math.max(1, rooms.length - 2));
      const r3 = rooms[ri3];
      if (r3) {
        for (let a = 0; a < 20; a++) {
          const px = rng(r3.x + 1, r3.x + r3.w - 2), py = rng(r3.y + 1, r3.y + r3.h - 2);
          if (map[py] && map[py][px] === T.FLOOR && !decor.has(`${px},${py}`)) {
            map[py][px] = T.NPC;
            decor.set(`${px},${py}`, { type: "npc", ...npc });
            break;
          }
        }
      }
    }
    if (f >= 91 && f <= 99 && ECHO_LINES[f - 91]) {
      const ri4 = rng(1, Math.max(1, rooms.length - 2));
      const r4 = rooms[ri4];
      if (r4) {
        for (let a = 0; a < 20; a++) {
          const px = rng(r4.x + 1, r4.x + r4.w - 2), py = rng(r4.y + 1, r4.y + r4.h - 2);
          if (map[py] && map[py][px] === T.FLOOR && !decor.has(`${px},${py}`)) {
            map[py][px] = T.ECHO;
            decor.set(`${px},${py}`, { type: "echo", text: ECHO_LINES[f - 91] });
            break;
          }
        }
      }
    }
  }
  if (stairsPos && !isSanc) {
    const q = [{ x: start.x, y: start.y }];
    const vis = /* @__PURE__ */ new Set();
    vis.add(start.x + "," + start.y);
    let ok = false;
    while (q.length > 0) {
      const p = q.shift();
      if (p.x === stairsPos.x && p.y === stairsPos.y) {
        ok = true;
        break;
      }
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nx = p.x + dx, ny = p.y + dy;
        const k = nx + "," + ny;
        if (nx >= 0 && nx < MW && ny >= 0 && ny < MH && !vis.has(k) && map[ny][nx] !== T.WALL && map[ny][nx] !== T.SECRET) {
          vis.add(k);
          q.push({ x: nx, y: ny });
        }
      }
    }
    if (!ok) {
      const toFix = [];
      for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
        if (map[y][x] === T.WALL && decor.has(`${x},${y}`)) {
          const d2 = decor.get(`${x},${y}`);
          if (d2.type === "pillar" || d2.type === "obj") toFix.push({ x, y });
        }
      }
      for (const p of toFix) {
        map[p.y][p.x] = T.FLOOR;
        decor.delete(`${p.x},${p.y}`);
        const q2 = [{ x: start.x, y: start.y }];
        const v2 = /* @__PURE__ */ new Set();
        v2.add(start.x + "," + start.y);
        let ok2 = false;
        while (q2.length > 0) {
          const p2 = q2.shift();
          if (p2.x === stairsPos.x && p2.y === stairsPos.y) {
            ok2 = true;
            break;
          }
          for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            const nx = p2.x + dx, ny = p2.y + dy;
            const k = nx + "," + ny;
            if (nx >= 0 && nx < MW && ny >= 0 && ny < MH && !v2.has(k) && map[ny][nx] !== T.WALL && map[ny][nx] !== T.SECRET) {
              v2.add(k);
              q2.push({ x: nx, y: ny });
            }
          }
        }
        if (ok2) break;
      }
    }
  }
  return { map, rooms, revealed: rev, start, stairsPos, bossPos, bri, fc, isMega, isSanc, decor };
}
function genSubArea(f) {
  const fc = getFC(f);
  const map = Array.from({ length: MH }, () => Array(MW).fill(T.WALL));
  const rooms = [];
  const ox = Math.floor(MW / 4), oy = Math.floor(MH / 4);
  const sw = Math.floor(MW / 2), sh = Math.floor(MH / 2);
  const type = rng(1, 3);
  const numRooms = type === 2 ? 2 : rng(3, 5);
  for (let a = 0; a < 80; a++) {
    if (rooms.length >= numRooms) break;
    const rw = rng(4, 7), rh = rng(3, 5), rx = ox + rng(1, sw - rw - 2), ry = oy + rng(1, sh - rh - 2);
    let ok = true;
    for (const r of rooms) if (rx < r.x + r.w + 2 && rx + rw + 2 > r.x && ry < r.y + r.h + 2 && ry + rh + 2 > r.y) {
      ok = false;
      break;
    }
    if (!ok) continue;
    for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) if (y >= 0 && y < MH && x >= 0 && x < MW) map[y][x] = T.FLOOR;
    rooms.push({ x: rx, y: ry, w: rw, h: rh, cx: Math.floor(rx + rw / 2), cy: Math.floor(ry + rh / 2) });
  }
  if (rooms.length < 2) {
    const r1 = { x: ox + 2, y: oy + 2, w: 6, h: 4, cx: ox + 5, cy: oy + 4 };
    const r2 = { x: ox + 12, y: oy + 8, w: 6, h: 4, cx: ox + 15, cy: oy + 10 };
    [r1, r2].forEach((r) => {
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (y >= 0 && y < MH && x >= 0 && x < MW) map[y][x] = T.FLOOR;
      rooms.push(r);
    });
  }
  for (let i = 0; i < rooms.length - 1; i++) {
    let { cx: x1, cy: y1 } = rooms[i], { cx: x2, cy: y2 } = rooms[i + 1];
    while (x1 !== x2) {
      if (y1 >= 0 && y1 < MH && x1 >= 0 && x1 < MW && map[y1][x1] === T.WALL) map[y1][x1] = T.FLOOR;
      x1 += x1 < x2 ? 1 : -1;
    }
    while (y1 !== y2) {
      if (y1 >= 0 && y1 < MH && x1 >= 0 && x1 < MW && map[y1][x1] === T.WALL) map[y1][x1] = T.FLOOR;
      y1 += y1 < y2 ? 1 : -1;
    }
    if (y1 >= 0 && y1 < MH && x1 >= 0 && x1 < MW && map[y1][x1] === T.WALL) map[y1][x1] = T.FLOOR;
  }
  const plc = (ri, t) => {
    const r = rooms[ri];
    if (!r) return null;
    for (let a = 0; a < 20; a++) {
      const px = rng(r.x + 1, r.x + r.w - 2), py = rng(r.y + 1, r.y + r.h - 2);
      if (py >= 0 && py < MH && px >= 0 && px < MW && map[py][px] === T.FLOOR) {
        map[py][px] = t;
        return { x: px, y: py };
      }
    }
    return null;
  };
  const lri = rooms.length - 1;
  plc(lri, T.PORTAL);
  let hasMini = false, miniPos = null;
  const typeNames = ["", "Treasure Vault", "Mini-Boss Lair", "Trap Gauntlet"];
  if (type === 1) {
    for (let i = 0; i < rng(4, 6); i++) plc(lri, T.CHEST);
    if (rooms.length > 2) for (let i = 0; i < rng(1, 3); i++) plc(rng(1, lri - 1), T.CHEST);
    plc(lri, T.FOUNTAIN);
  } else if (type === 2) {
    hasMini = true;
    const lr = rooms[lri];
    let mx = lr.cx, my = lr.cy;
    if (map[my][mx] !== T.FLOOR) {
      for (let a = 0; a < 30; a++) {
        const px = rng(lr.x + 1, lr.x + lr.w - 2), py = rng(lr.y + 1, lr.y + lr.h - 2);
        if (py >= 0 && py < MH && px >= 0 && px < MW && map[py][px] === T.FLOOR) {
          mx = px;
          my = py;
          break;
        }
      }
    }
    miniPos = { x: mx, y: my };
    plc(lri, T.CHEST);
    plc(lri, T.CHEST);
  } else {
    for (let ri = 0; ri < lri; ri++) {
      for (let i = 0; i < rng(3, 5); i++) plc(ri, T.TRAP);
    }
    for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
      if (map[y][x] !== T.FLOOR) continue;
      const adj = [[0, -1], [0, 1], [-1, 0], [1, 0]].filter(([dx, dy]) => map[y + dy] && map[y + dy][x + dx] === T.FLOOR).length;
      if (adj === 2 && Math.random() < 0.25) map[y][x] = T.TRAP;
    }
    for (let i = 0; i < rng(3, 5); i++) plc(lri, T.CHEST);
    plc(lri, T.FOUNTAIN);
  }
  const rev = Array.from({ length: MH }, () => Array(MW).fill(false));
  const start = { x: rooms[0].cx, y: rooms[0].cy };
  map[start.y][start.x] = T.FLOOR;
  return { map, rooms, revealed: rev, start, miniPos, hasMini, fc: { ...fc, name: typeNames[type], icon: "\u{1F52E}" }, isSub: true, subType: type, bossPos: miniPos, bri: lri, decor: /* @__PURE__ */ new Map() };
}
function getMiniBoss(f) {
  const t = getTier(f);
  const names = ["Vault Guardian", "Shadow Sentinel", "Cursed Watcher", "Rune Golem", "Treasure Fiend", "Frost Keeper", "Void Lurker", "Drake Warden", "Eye Stalker", "Dark Champion"];
  const icons = ["\u{1F6E1}\uFE0F", "\u{1F464}", "\u{1F441}\uFE0F", "\u{1FAA8}", "\u{1F608}", "\u2744\uFE0F", "\u{1F300}", "\u{1F432}", "\u{1F441}\uFE0F", "\u2694\uFE0F"];
  const i = Math.min(t - 1, 9);
  const s = 1 + (f - 1) % 10 * 0.12;
  return { name: names[i], icon: icons[i], hp: Math.floor(120 * s * t * 0.6), maxHp: Math.floor(120 * s * t * 0.6), atk: Math.floor(20 * s * t * 0.5), def: Math.floor(12 * s * t * 0.4), xp: Math.floor(80 * s * t), gold: Math.floor(60 * s * t), id: uid(), isBoss: true, isMini: true, bossFloor: f, subtitle: "Sub-area Guardian" };
}
function getBarrierGuardian(f) {
  const t = getTier(f);
  const names = ["Barrier Shade", "Seal Wraith", "Gate Keeper", "Ward Golem", "Flame Ward", "Ice Shard", "Void Wisp", "Scale Guard", "Rune Eye", "Dark Seal"];
  const icons = ["\u{1F464}", "\u{1F47B}", "\u{1F6AA}", "\u{1FAA8}", "\u{1F525}", "\u2744\uFE0F", "\u{1F300}", "\u{1F432}", "\u{1F441}\uFE0F", "\u{1F311}"];
  const i = Math.min(t - 1, 9);
  const s = 1 + (f - 1) % 10 * 0.1;
  return { name: names[i], icon: icons[i], hp: Math.floor(60 * s * t * 0.5), maxHp: Math.floor(60 * s * t * 0.5), atk: Math.floor(14 * s * t * 0.4), def: Math.floor(8 * s * t * 0.35), xp: Math.floor(40 * s * t), gold: Math.floor(30 * s * t), id: uid(), isBoss: true, isBarrier: true, bossFloor: f, subtitle: "Barrier Guardian" };
}
function revA(rev, px, py, r) {
  const n = [...rev];
  const touched = /* @__PURE__ */ new Set();
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const nx = px + dx, ny = py + dy;
    if (nx >= 0 && nx < MW && ny >= 0 && ny < MH && dx * dx + dy * dy <= r * r + 1) {
      if (!touched.has(ny)) {
        touched.add(ny);
        n[ny] = [...n[ny]];
      }
      n[ny][nx] = true;
    }
  }
  return n;
}
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html{height:100%;height:100dvh;}
body{height:100%;height:100dvh;overflow:hidden;background:#0c0c14;overscroll-behavior:none;}
#root{width:100%;height:100%;height:100dvh;}
@media(orientation:portrait){#root::after{content:"Rotate your device to landscape";position:fixed;inset:0;background:#0c0c14;color:#d4a843;display:flex;align-items:center;justify-content:center;font-size:18px;font-family:'Cinzel',serif;letter-spacing:3px;text-align:center;padding:40px;z-index:99999;}}
@keyframes pp{0%,100%{transform:scale(1);filter:drop-shadow(0 0 4px var(--ac,#d4a843))drop-shadow(0 0 10px rgba(212,168,67,.25));}50%{transform:scale(1.12);filter:drop-shadow(0 0 8px var(--ac,#d4a843))drop-shadow(0 0 18px rgba(212,168,67,.5));}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
@keyframes slideRight{from{transform:translateX(-100%);}to{transform:translateX(0);}}
@keyframes bossIn{0%{transform:scale(.15)rotate(-15deg);opacity:0;filter:blur(16px);}40%{transform:scale(1.3)rotate(3deg);opacity:1;filter:blur(0)drop-shadow(0 0 30px var(--ba,#f44));}70%{transform:scale(.95);}100%{transform:scale(1);filter:drop-shadow(0 0 20px var(--ba,#f44));}}
@keyframes megaGlow{0%,100%{filter:drop-shadow(0 0 15px var(--ba,#f44))drop-shadow(0 0 30px var(--ba,#f4444));}50%{filter:drop-shadow(0 0 25px var(--ba,#f44))drop-shadow(0 0 50px var(--ba,#f4466));}}
@keyframes shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-4px);}75%{transform:translateX(4px);}}
@keyframes glow{0%,100%{opacity:.6;}50%{opacity:1;}}
@keyframes sancP{0%,100%{box-shadow:inset 0 0 30px rgba(100,180,240,.05);}50%{box-shadow:inset 0 0 60px rgba(100,180,240,.12);}}
@keyframes recB{0%,100%{box-shadow:0 0 4px #4c64;}50%{box-shadow:0 0 10px #4c68;}}
.scr::-webkit-scrollbar{width:3px;}.scr::-webkit-scrollbar-thumb{background:#333;border-radius:2px;}
@media(hover:hover){button:hover{filter:brightness(1.3);transition:filter .15s;}}
@keyframes dmgFlash{0%{opacity:.5;}100%{opacity:0;}}
@keyframes healFlash{0%{opacity:.3;}100%{opacity:0;}}
@keyframes lvlBurst{0%{transform:scale(0);opacity:1;}50%{transform:scale(2.5);opacity:.6;}100%{transform:scale(4);opacity:0;}}
@keyframes lootPop{0%{transform:translateY(0) scale(1);opacity:1;}100%{transform:translateY(-20px) scale(1.5);opacity:0;}}
@keyframes particle{0%{opacity:1;transform:translate(0,0) scale(1);}100%{opacity:0;transform:translate(var(--px,10px),var(--py,-15px)) scale(0);}}
@keyframes playerBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-2px);}}
@keyframes playerGlowW{0%,100%{box-shadow:0 0 6px #fa84,inset 0 0 4px #fa83;}50%{box-shadow:0 0 12px #fa86,inset 0 0 8px #fa84;}}
@keyframes playerGlowM{0%,100%{box-shadow:0 0 6px #88f4,inset 0 0 4px #88f3;}50%{box-shadow:0 0 14px #88f6,inset 0 0 10px #88f4;}}
@keyframes playerGlowT{0%,100%{box-shadow:0 0 5px #4f84,inset 0 0 3px #4f83;}50%{box-shadow:0 0 10px #4f86,inset 0 0 6px #4f84;}}
@keyframes enemyHit{0%{filter:brightness(3);}100%{filter:brightness(1);}}
@keyframes enemyIdle{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}
@keyframes pLunge{0%{transform:translateX(0);}40%{transform:translateX(40px);}100%{transform:translateX(0);}}
@keyframes pCast{0%{transform:scale(1);}30%{transform:scale(1.15);}60%{transform:scale(1) translateY(-8px);}100%{transform:scale(1) translateY(0);}}
@keyframes eLunge{0%{transform:translateX(0);}40%{transform:translateX(-40px);}100%{transform:translateX(0);}}
@keyframes eDeath{0%{transform:scale(1) rotate(0);opacity:1;filter:none;}100%{transform:scale(0) rotate(20deg);opacity:0;filter:grayscale(1);}}
@keyframes floatUp{0%{opacity:1;transform:translateY(0);}100%{opacity:0;transform:translateY(-30px);}}
@keyframes lavaPulse{0%,100%{color:#f30;text-shadow:0 0 3px #f304;}50%{color:#f60;text-shadow:0 0 6px #f606;}}
@keyframes waterShimmer{0%,100%{opacity:.7;}50%{opacity:1;}}
@keyframes voidRotate{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
@keyframes torchFlicker{0%,100%{opacity:.8;text-shadow:0 0 4px #f804;}30%{opacity:1;text-shadow:0 0 8px #fa06;}60%{opacity:.7;text-shadow:0 0 3px #f803;}}
@keyframes chestOpen{0%{transform:scale(1);}30%{transform:scale(1.4) translateY(-3px);}60%{transform:scale(1.2);}100%{transform:scale(1);}}
@keyframes weatherFall{0%{transform:translateY(-10vh) translateX(0);opacity:0;}10%{opacity:1;}90%{opacity:1;}100%{transform:translateY(110vh) translateX(20px);opacity:0;}}
@keyframes weatherDrift{0%{transform:translate(0,0);opacity:.3;}50%{opacity:.6;}100%{transform:translate(30px,100vh);opacity:0;}}
@keyframes weatherFloat{0%{transform:translateY(0);opacity:0;}20%{opacity:.5;}80%{opacity:.5;}100%{transform:translateY(-40px);opacity:0;}}
@keyframes weatherPulse{0%,100%{opacity:.1;transform:scale(1);}50%{opacity:.4;transform:scale(1.3);}}
`;
const SFX = (() => {
  try {
    let ctx = null;
    let muted = false;
    let masterVol = 1;
    const getCtx = () => {
      if (!ctx) try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
      }
      return ctx;
    };
    const play = (freq, dur, type = "square", vol = 0.12, decay = true) => {
      try {
        if (muted) return;
        const c = getCtx();
        if (!c) return;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.value = vol * masterVol;
        if (decay) g.gain.exponentialRampToValueAtTime(1e-3, c.currentTime + dur);
        o.connect(g);
        g.connect(c.destination);
        o.start(c.currentTime);
        o.stop(c.currentTime + dur);
      } catch (e) {
      }
    };
    const noise = (dur, vol = 0.06) => {
      try {
        if (muted) return;
        const c = getCtx();
        if (!c) return;
        const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * vol * masterVol;
        const s = c.createBufferSource();
        const g = c.createGain();
        g.gain.value = 1;
        g.gain.exponentialRampToValueAtTime(1e-3, c.currentTime + dur);
        s.buffer = buf;
        s.connect(g);
        g.connect(c.destination);
        s.start();
      } catch (e) {
      }
    };
    return {
      setMute: (m) => {
        muted = m;
      },
      setVolume: (v) => {
        masterVol = v;
      },
      step: () => play(80, 0.06, "sine", 0.04),
      hit: () => {
        play(220, 0.08, "square", 0.1);
        play(110, 0.12, "sawtooth", 0.06);
      },
      crit: () => {
        play(330, 0.06, "square", 0.12);
        play(440, 0.1, "square", 0.08);
        setTimeout(() => play(550, 0.08, "square", 0.06), 60);
      },
      enemyHit: () => {
        play(150, 0.1, "sawtooth", 0.08);
        noise(0.08, 0.08);
      },
      miss: () => play(100, 0.15, "sine", 0.04),
      heal: () => {
        play(523, 0.12, "sine", 0.08);
        setTimeout(() => play(659, 0.12, "sine", 0.08), 80);
        setTimeout(() => play(784, 0.2, "sine", 0.06), 160);
      },
      levelUp: () => {
        [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => play(f, 0.2, "sine", 0.1), i * 100));
      },
      death: () => {
        [300, 250, 200, 150, 100].forEach((f, i) => setTimeout(() => play(f, 0.3, "sawtooth", 0.08), i * 120));
      },
      chest: () => {
        play(880, 0.08, "sine", 0.06);
        setTimeout(() => play(1100, 0.12, "sine", 0.08), 80);
      },
      boss: () => {
        [150, 100, 150, 100, 200].forEach((f, i) => setTimeout(() => play(f, 0.2, "square", 0.1), i * 150));
        noise(0.6, 0.05);
      },
      buy: () => {
        play(660, 0.08, "sine", 0.06);
        play(880, 0.12, "sine", 0.06);
      },
      flee: () => {
        play(400, 0.06, "sine", 0.06);
        play(300, 0.08, "sine", 0.04);
      },
      sanctuary: () => {
        [440, 554, 659, 880].forEach((f, i) => setTimeout(() => play(f, 0.3, "sine", 0.07), i * 200));
      },
      fountain: () => {
        play(600, 0.15, "sine", 0.06);
        setTimeout(() => play(800, 0.2, "sine", 0.05), 100);
      },
      equip: () => {
        play(300, 0.06, "square", 0.06);
        play(450, 0.1, "square", 0.06);
      },
      trap: () => {
        noise(0.15, 0.12);
        play(100, 0.2, "sawtooth", 0.08);
      },
      error: () => play(150, 0.2, "square", 0.06),
      // #57: Dramatic boss entrance — descending brass
      bossEntrance: () => {
        [200, 150, 100].forEach((f, i) => setTimeout(() => play(f, 0.3, "sawtooth", 0.12), i * 180));
        noise(0.4, 0.06);
      },
      // #58: Missing SFX
      portal: () => {
        [440, 660, 880, 660].forEach((f, i) => setTimeout(() => play(f, 0.15, "sine", 0.06), i * 80));
      },
      hazard: () => {
        play(180, 0.12, "sawtooth", 0.06);
        noise(0.06, 0.06);
      },
      menuOpen: () => play(440, 0.04, "sine", 0.04),
      menuClose: () => play(330, 0.04, "sine", 0.03),
      questComplete: () => {
        [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => play(f, 0.15, "sine", 0.08), i * 80));
      },
      sell: () => {
        play(800, 0.06, "sine", 0.05);
        play(600, 0.08, "sine", 0.04);
      },
      // #59: Victory fanfare — ascending triumph
      victory: () => {
        [262, 330, 392, 523, 659].forEach((f, i) => setTimeout(() => play(f, 0.2, "sine", 0.09), i * 120));
      },
      // #61: Low HP heartbeat pulse
      heartbeat: () => {
        play(60, 0.15, "sine", 0.08);
        setTimeout(() => play(60, 0.12, "sine", 0.06), 200);
      }
    };
  } catch (e) {
    const noop = () => {
    };
    return { setMute: noop, step: noop, hit: noop, crit: noop, enemyHit: noop, miss: noop, heal: noop, levelUp: noop, death: noop, chest: noop, boss: noop, buy: noop, flee: noop, sanctuary: noop, fountain: noop, equip: noop, trap: noop, error: noop, bossEntrance: noop, portal: noop, hazard: noop, menuOpen: noop, menuClose: noop, questComplete: noop, sell: noop, victory: noop, heartbeat: noop };
  }
})();
const BGM = (() => {
  try {
    let stopAll2 = function() {
      nodes.forEach((n) => {
        try {
          n.stop();
        } catch (e) {
        }
        try {
          n.disconnect();
        } catch (e) {
        }
      });
      gainNodes.forEach((g) => {
        try {
          g.disconnect();
        } catch (e) {
        }
      });
      nodes = [];
      gainNodes = [];
      if (loopTimer) {
        clearInterval(loopTimer);
        loopTimer = null;
      }
      if (bassTimer) {
        clearInterval(bassTimer);
        bassTimer = null;
      }
    }, playTier2 = function(tier, isSanc, cfgOverride) {
      const c = getCtx();
      if (!c) return;
      stopAll2();
      const cfg = cfgOverride || (isSanc ? SANC : TIERS[Math.min(tier - 1, 9)]);
      if (!cfg) return;
      [0, 6].forEach((det) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = cfg.wave;
        o.frequency.value = cfg.notes[0];
        o.detune.value = det;
        g.gain.value = cfg.vol * 0.5;
        o.connect(g);
        g.connect(c.destination);
        o.start();
        nodes.push(o);
        gainNodes.push(g);
      });
      let arpIdx = 0;
      loopTimer = setInterval(() => {
        try {
          const note = cfg.notes[arpIdx % cfg.notes.length];
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = "sine";
          const octave = arpIdx % 8 < 4 ? 1 : 2;
          o.frequency.value = note * octave;
          const vel = cfg.vol * (cfg.swing && arpIdx % 2 === 0 ? 1.2 : 0.7);
          g.gain.value = vel;
          g.gain.exponentialRampToValueAtTime(1e-3, c.currentTime + cfg.tempo * 0.8);
          o.connect(g);
          g.connect(c.destination);
          o.start();
          o.stop(c.currentTime + cfg.tempo * 0.8);
          arpIdx++;
        } catch (e) {
        }
      }, cfg.tempo * 1e3);
      bassTimer = setInterval(() => {
        try {
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = "sine";
          o.frequency.value = cfg.bass;
          g.gain.value = cfg.vol * 1.5;
          g.gain.exponentialRampToValueAtTime(1e-3, c.currentTime + cfg.tempo * 3);
          o.connect(g);
          g.connect(c.destination);
          o.start();
          o.stop(c.currentTime + cfg.tempo * 3);
        } catch (e) {
        }
      }, cfg.tempo * 4e3);
    };
    var stopAll = stopAll2, playTier = playTier2;
    let ctx = null, playing = false, curTier = -1, nodes = [], gainNodes = [], loopTimer = null, bassTimer = null;
    const getCtx = () => {
      if (!ctx) try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
      }
      return ctx;
    };
    const TIERS = [
      { notes: [131, 165, 196, 262], bass: 65, wave: "sine", tempo: 0.45, vol: 0.025, swing: true },
      // 1: Crypt
      { notes: [147, 175, 220, 294], bass: 73, wave: "sine", tempo: 0.35, vol: 0.022, swing: false },
      // 2: Sewer
      { notes: [110, 165, 220, 330], bass: 55, wave: "triangle", tempo: 0.3, vol: 0.025, swing: true },
      // 3: Mine
      { notes: [123, 147, 185, 247], bass: 62, wave: "sine", tempo: 0.4, vol: 0.02, swing: false },
      // 4: Undead
      { notes: [147, 185, 220, 294], bass: 73, wave: "sawtooth", tempo: 0.25, vol: 0.018, swing: true },
      // 5: Infernal
      { notes: [196, 247, 294, 392], bass: 98, wave: "sine", tempo: 0.5, vol: 0.02, swing: false },
      // 6: Frost
      { notes: [131, 156, 196, 262], bass: 65, wave: "triangle", tempo: 0.4, vol: 0.018, swing: true },
      // 7: Void
      { notes: [165, 196, 247, 330], bass: 82, wave: "sine", tempo: 0.3, vol: 0.022, swing: true },
      // 8: Dragon
      { notes: [139, 165, 208, 277], bass: 69, wave: "triangle", tempo: 0.45, vol: 0.018, swing: false },
      // 9: Eldritch
      { notes: [110, 131, 165, 220], bass: 55, wave: "sawtooth", tempo: 0.32, vol: 0.015, swing: true }
      // 10: Shadow
    ];
    const SANC = { notes: [262, 330, 392, 523], bass: 131, wave: "sine", tempo: 0.7, vol: 0.018, swing: false };
    const COMBAT = { notes: [220, 262, 330, 440], bass: 110, wave: "square", tempo: 0.18, vol: 0.02, swing: true };
    const BOSS_COMBAT = { notes: [165, 196, 262, 330], bass: 82, wave: "sawtooth", tempo: 0.2, vol: 0.022, swing: true };
    const TITLE = { notes: [131, 165, 196, 262], bass: 65, wave: "sine", tempo: 0.8, vol: 0.015, swing: false };
    const resumeCtx = () => {
      const c = getCtx();
      if (c && c.state === "suspended") c.resume().catch(() => {
      });
    };
    if (typeof document !== "undefined") {
      ["click", "touchstart", "keydown"].forEach((evt) => document.addEventListener(evt, resumeCtx, { once: true, passive: true }));
    }
    return {
      play: (tier, isSanc, mode) => {
        const key = mode === "combat" ? -2 : mode === "bossCombat" ? -3 : mode === "title" ? -4 : isSanc ? -1 : tier;
        if (key === curTier && playing) return;
        curTier = key;
        playing = true;
        resumeCtx();
        if (mode === "combat") playTier2(0, false, COMBAT);
        else if (mode === "bossCombat") playTier2(0, false, BOSS_COMBAT);
        else if (mode === "title") playTier2(0, false, TITLE);
        else playTier2(tier, isSanc);
      },
      stop: () => {
        stopAll2();
        playing = false;
        curTier = -1;
      },
      isPlaying: () => playing
    };
  } catch (e) {
    return { play: () => {
    }, stop: () => {
    }, isPlaying: () => false };
  }
})();
const Bar = ({ cur, max, color, label, h = 10 }) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, width: "100%" } }, label && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#666", minWidth: 18, fontFamily: "'JetBrains Mono',monospace" } }, label), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: h, background: "#14141e", borderRadius: h, overflow: "hidden", border: "1px solid #222230", position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${clamp(cur / max * 100, 0, 100)}%`, height: "100%", borderRadius: h, background: `linear-gradient(90deg,${color},${color}99)`, transition: "width .3s" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.min(8, h - 2), color: "#fffc", fontFamily: "'JetBrains Mono',monospace", textShadow: "0 1px 2px #000" } }, cur, "/", max)));
const tR = (tile, fc, vis, inFov, tier) => {
  if (!vis) return { ch: "\xB7", color: "#080808", o: 0.1 };
  const o = inFov ? 1 : 0.25;
  const wc = tier ? BIOME_WALL[Math.min(tier - 1, 9)] : "\u2588";
  const m = { [T.WALL]: { ch: wc, color: fc.wall }, [T.FLOOR]: { ch: "\xB7", color: fc.floor + "99" }, [T.STAIRS]: { ch: "\u25BC", color: "#0e7", g: "0 0 4px #0e75" }, [T.TRAP]: { ch: "\xB7", color: fc.floor + "99" }, [T.CHEST]: { ch: "\u25C6", color: "#fa0", g: "0 0 4px #fa04" }, [T.SECRET]: { ch: wc, color: fc.wall }, [T.PIT]: { ch: "\u25CB", color: "#500" }, [T.FIRE]: { ch: "\u2248", color: "#f40", g: "0 0 3px #f404" }, [T.FOUNTAIN]: { ch: "\u2666", color: "#48f", g: "0 0 4px #48f4" }, [T.ICE]: { ch: "\u25AA", color: "#8df" }, [T.LAVA]: { ch: "\u2248", color: "#f30", g: "0 0 3px #f304" }, [T.WATER]: { ch: "~", color: "#26a" }, [T.VOID]: { ch: "\u221E", color: "#84c", g: "0 0 3px #84c4" }, [T.SHOP]: { ch: "$", color: "#fa0", g: "0 0 5px #fa06" }, [T.PORTAL]: { ch: "\u2295", color: "#d4f", g: "0 0 6px #d4f6" }, [T.BARRIER]: { ch: "\u2593", color: "#f84", g: "0 0 4px #f844" }, [T.FEATURE]: { ch: "\u2726", color: "#d4a843", g: "0 0 4px #d4a84344" }, [T.LORE]: { ch: "\u{1F4DC}", color: "#c9a84c", g: "0 0 4px #c9a84c44" }, [T.NPC]: { ch: "\u{1F9D9}", color: "#8cf", g: "0 0 4px #8cf4" }, [T.ECHO]: { ch: "\u{1F4AC}", color: "#ffd700", g: "0 0 6px #ffd70044" }, [T.LOCKED]: { ch: "\u{1F512}", color: "#fa0", g: "0 0 4px #fa04" }, [T.CRACKED]: { ch: "\u2592", color: "#887755", g: "0 0 2px #88775544" } };
  return { ...m[tile] || { ch: "?", color: "#333" }, o };
};
function PlayerChar({ sz, cls, equipped, poisoned, facing, hitReact, bob = true }) {
  const pC = { warrior: { body: "#d4843a", head: "#ffe088", glow: "#fa8", anim: "playerGlowW" }, mage: { body: "#6868cc", head: "#c8c0ff", glow: "#88f", anim: "playerGlowM" }, thief: { body: "#2a8a4a", head: "#90e8a0", glow: "#4f8", anim: "playerGlowT" } }[cls] || { body: "#888", head: "#ccc", glow: "#aaa", anim: "playerGlowW" };
  const headSz = Math.round(sz * 0.45);
  const bodySz = Math.round(sz * 0.65);
  const armorTier = equipped?.armor?.tier || 1;
  const armorColor = armorTier >= 8 ? "#c8a830" : armorTier >= 6 ? "#7888aa" : armorTier >= 4 ? "#606878" : pC.body;
  const bodyCol = `linear-gradient(180deg,${armorColor},${armorColor}88)`;
  const wTier = equipped?.weapon?.tier || 1;
  const wColor = wTier >= 8 ? "#ffd700" : wTier >= 5 ? "#c8c8cc" : "linear-gradient(180deg,#ccc,#888)";
  const faceX = facing === "left" ? -1 : 1;
  const hitCol = hitReact === "damage" ? "brightness(2) hue-rotate(-30deg)" : hitReact === "heal" ? "brightness(1.5) hue-rotate(90deg)" : "none";
  const bobSpeed = cls === "warrior" ? "1.5s" : cls === "mage" ? "1.0s" : "0.8s";
  return /* @__PURE__ */ React.createElement("div", { style: { width: sz, height: sz, position: "relative", animation: bob ? `playerBob ${bobSpeed} ease-in-out infinite, ${pC.anim} 2.5s ease-in-out infinite` : `${pC.anim} 2.5s ease-in-out infinite`, borderRadius: "20%", transform: `scaleX(${faceX})`, filter: hitCol, transition: "filter .15s" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: bodySz, height: Math.round(sz * 0.55), borderRadius: `${Math.round(sz * 0.15)}px ${Math.round(sz * 0.15)}px ${Math.round(sz * 0.1)}px ${Math.round(sz * 0.1)}px`, background: bodyCol } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: headSz, height: headSz, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%,${pC.head},${pC.body})`, border: `1px solid ${pC.head}88` } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: Math.round(headSz * 0.35), left: "50%", transform: "translateX(-50%)", display: "flex", gap: Math.max(1, Math.round(headSz * 0.2)) } }, /* @__PURE__ */ React.createElement("div", { style: { width: Math.max(1, Math.round(headSz * 0.15)), height: Math.max(1, Math.round(headSz * 0.15)), borderRadius: "50%", background: "#111" } }), /* @__PURE__ */ React.createElement("div", { style: { width: Math.max(1, Math.round(headSz * 0.15)), height: Math.max(1, Math.round(headSz * 0.15)), borderRadius: "50%", background: "#111" } })), cls === "warrior" && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", right: -1, top: Math.round(sz * 0.15), width: Math.max(2, Math.round(sz * 0.12)), height: Math.round(sz * 0.65), background: wColor, borderRadius: 1, boxShadow: wTier >= 5 ? `0 0 3px ${wTier >= 8 ? "#fa0" : "#8884"}` : void 0 } }), cls === "mage" && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", right: -3, top: Math.round(sz * 0.1), width: Math.max(2, Math.round(sz * 0.1)), height: Math.round(sz * 0.7), background: wTier >= 5 ? "linear-gradient(180deg,#c0a0ff,#8060cc)" : "linear-gradient(180deg,#a080e0,#604080)", borderRadius: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: -2, left: "50%", transform: "translateX(-50%)", width: Math.max(3, Math.round(sz * 0.15)), height: Math.max(3, Math.round(sz * 0.15)), borderRadius: "50%", background: wTier >= 5 ? "#e0c0ff" : "#b090e0", boxShadow: `0 0 4px ${pC.glow}88` } })), cls === "thief" && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", right: -1, top: Math.round(sz * 0.25), width: Math.max(2, Math.round(sz * 0.08)), height: Math.round(sz * 0.5), background: wColor, borderRadius: 1, transform: "rotate(-20deg)" } }), cls === "mage" && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: -2, left: "50%", transform: "translateX(-50%)", width: headSz + 2, height: Math.round(headSz * 0.4), borderRadius: `${Math.round(headSz * 0.5)}px ${Math.round(headSz * 0.5)}px 0 0`, background: "linear-gradient(180deg,#6060cc,#4040aa)", border: "1px solid #8888ff44", borderBottom: "none" } }), cls === "thief" && sz > 16 && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: Math.round(headSz * 0.55), left: "50%", transform: "translateX(-50%)", width: headSz - 2, height: Math.max(2, Math.round(headSz * 0.2)), background: "#1a1a1a", borderRadius: 2, opacity: 0.7 } }), poisoned && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: -3, right: -3, width: Math.max(4, Math.round(sz * 0.2)), height: Math.max(4, Math.round(sz * 0.2)), borderRadius: "50%", background: "#0f0", boxShadow: "0 0 4px #0f06", animation: "glow 1s infinite" } }));
}
function DPad({ accent, onDir, combatActive }) {
  const timerRef = useRef(null);
  const onDirRef = useRef(onDir);
  const [active, setActive] = useState(null);
  useEffect(() => {
    onDirRef.current = onDir;
  }, [onDir]);
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  useEffect(() => {
    if (combatActive) {
      stopTimer();
      setActive(null);
    }
  }, [combatActive, stopTimer]);
  useEffect(() => () => stopTimer(), [stopTimer]);
  const startMove = useCallback((dx, dy, dir) => {
    stopTimer();
    setActive(dir);
    onDirRef.current?.(dx, dy);
    timerRef.current = setInterval(() => {
      onDirRef.current?.(dx, dy);
    }, 120);
  }, [stopTimer]);
  const endMove = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    stopTimer();
    setActive(null);
  }, [stopTimer]);
  const bs = 42;
  const btnBase = { width: bs, height: bs, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", touchAction: "none", userSelect: "none", WebkitUserSelect: "none", border: "none", outline: "none" };
  const arrow = (dx, dy, dir, ch) => {
    const isActive = active === dir;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        style: { ...btnBase, background: isActive ? `${accent}22` : "rgba(20,20,30,.5)", color: isActive ? accent : "#555", textShadow: isActive ? `0 0 8px ${accent}66` : "none", border: `1px solid ${isActive ? accent + "55" : "#ffffff11"}` },
        onTouchStart: (e) => {
          e.preventDefault();
          e.stopPropagation();
          startMove(dx, dy, dir);
        },
        onTouchEnd: endMove,
        onTouchCancel: endMove,
        onMouseDown: (e) => {
          e.preventDefault();
          startMove(dx, dy, dir);
        },
        onMouseUp: endMove,
        onMouseLeave: endMove
      },
      ch
    );
  };
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: `${bs}px ${bs}px ${bs}px`, gridTemplateRows: `${bs}px ${bs}px ${bs}px`, gap: 3 } }, /* @__PURE__ */ React.createElement("div", null), arrow(0, -1, "up", "\u25B2"), /* @__PURE__ */ React.createElement("div", null), arrow(-1, 0, "left", "\u25C0"), /* @__PURE__ */ React.createElement("div", { style: { width: bs, height: bs, borderRadius: 10, background: "rgba(14,14,22,.3)", border: `1px solid ${accent}15`, display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: `radial-gradient(circle,${accent}88,${accent}33)`, boxShadow: `0 0 4px ${accent}44` } })), arrow(1, 0, "right", "\u25B6"), /* @__PURE__ */ React.createElement("div", null), arrow(0, 1, "down", "\u25BC"), /* @__PURE__ */ React.createElement("div", null));
}
function Game() {
  const [screen, setScreen] = useState("title");
  const [storyPage, setStoryPage] = useState(0);
  const [menu, setMenu] = useState(null);
  const [combat, setCombat] = useState(null);
  const [combatAnim, setCombatAnim] = useState(null);
  const [cLog, setCLog] = useState([]);
  const [eLog, setELog] = useState([]);
  const logRef = useRef(null);
  const cLogRef = useRef(null);
  const playerRef = useRef(null);
  const [shaking, setShaking] = useState(false);
  const [vfx, setVfx] = useState({ flash: null, particles: [], enemyHit: false });
  const [floatNums, setFloatNums] = useState([]);
  const showFloat = useCallback((text, color = "#f44") => {
    const id = uid();
    setFloatNums((p) => [...p, { id, text, color }]);
    setTimeout(() => setFloatNums((p) => p.filter((f) => f.id !== id)), 1e3);
  }, []);
  const addParticles = useCallback((count, color, spread = 20) => {
    const ps = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * spread;
      ps.push({ id: uid(), px: Math.cos(a) * d, py: Math.sin(a) * d - 10, color, dur: 0.4 + Math.random() * 0.3 });
    }
    setVfx((v) => ({ ...v, particles: [...v.particles, ...ps] }));
    setTimeout(() => setVfx((v) => ({ ...v, particles: v.particles.filter((p) => !ps.find((pp) => pp.id === p.id)) })), 800);
  }, []);
  const flash = useCallback((type) => {
    setVfx((v) => ({ ...v, flash: type }));
    setTimeout(() => setVfx((v) => ({ ...v, flash: null })), 300);
  }, []);
  const enemyFlash = useCallback(() => {
    setVfx((v) => ({ ...v, enemyHit: true }));
    setTimeout(() => setVfx((v) => ({ ...v, enemyHit: false })), 200);
  }, []);
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem("dos_settings");
      return s ? { ...{ difficulty: "normal", tileSize: 13, minimap: true, music: true, sfx: true }, ...JSON.parse(s) } : { difficulty: "normal", tileSize: 13, minimap: true, music: true, sfx: true };
    } catch (e) {
      return { difficulty: "normal", tileSize: 13, minimap: true, music: true, sfx: true };
    }
  });
  const [player, setPlayer] = useState(null);
  const [dun, setDun] = useState(null);
  const [wand, setWand] = useState([]);
  const [bossAlive, setBossAlive] = useState(true);
  const [inSanc, setInSanc] = useState(false);
  const [lastSanc, setLastSanc] = useState(0);
  const [stats, setStats] = useState({ kills: 0, chests: 0, totG: 0, megaK: 0, erebus: false, steps: 0, seen: {} });
  const [save, setSave] = useState(() => {
    try {
      const slots = [];
      for (let i = 1; i <= 3; i++) {
        const s = localStorage.getItem(`dos_slot${i}`);
        if (s) slots[i] = JSON.parse(s);
      }
      return slots;
    } catch (e) {
      return [];
    }
  });
  const [activeSlot, setActiveSlot] = useState(1);
  const [pendingDeath, setPendingDeath] = useState(false);
  const [floorTrans, setFloorTrans] = useState(null);
  const [shop, setShop] = useState(null);
  const [sancShop, setSancShop] = useState(null);
  const [cInv, setCInv] = useState(false);
  const [armory, setArmory] = useState([]);
  const [subArea, setSubArea] = useState(null);
  const [lastDir, setLastDir] = useState("right");
  const [mapHitReact, setMapHitReact] = useState(null);
  const mapReact = useCallback((type) => {
    setMapHitReact(type);
    setTimeout(() => setMapHitReact(null), 200);
  }, []);
  const [trail, setTrail] = useState([]);
  const [loreLog, setLoreLog] = useState([]);
  const [charName, setCharName] = useState("");
  const [statPoints, setStatPoints] = useState(0);
  const [passives, setPassives] = useState([]);
  const [moralChoice, setMoralChoice] = useState(null);
  const [specialization, setSpecialization] = useState(null);
  const [ngPlus, setNgPlus] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [killStreak, setKillStreak] = useState(0);
  const [bounty, setBounty] = useState(null);
  const [achievements, setAchievements] = useState(() => {
    try {
      const a = localStorage.getItem("dos_achievements");
      return a ? JSON.parse(a) : [];
    } catch (e) {
      return [];
    }
  });
  const touchStart = useRef(null);
  const [keybinds, setKeybinds] = useState(() => {
    try {
      const k = localStorage.getItem("dos_keybinds");
      return k ? JSON.parse(k) : { inv: "i", stats: "c", quests: "q", armory: "r" };
    } catch (e) {
      return { inv: "i", stats: "c", quests: "q", armory: "r" };
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("dos_settings", JSON.stringify(settings));
    } catch (e) {
    }
  }, [settings]);
  useEffect(() => {
    try {
      localStorage.setItem("dos_keybinds", JSON.stringify(keybinds));
    } catch (e) {
    }
  }, [keybinds]);
  useEffect(() => {
    if (screen !== "game" || !player) return;
    const iv = setInterval(() => setGameTime((t) => t + 1), 1e3);
    return () => clearInterval(iv);
  }, [screen, player]);
  useEffect(() => {
    try {
      localStorage.setItem("dos_achievements", JSON.stringify(achievements));
    } catch (e) {
    }
  }, [achievements]);
  const [isLand, setIsLand] = useState(() => typeof window !== "undefined" && window.innerWidth > window.innerHeight);
  const [isDesk, setIsDesk] = useState(() => typeof window !== "undefined" && !("ontouchstart" in window) && window.innerWidth >= 1024);
  const [winSize, setWinSize] = useState(() => typeof window !== "undefined" ? { w: window.innerWidth, h: window.innerHeight } : { w: 1024, h: 768 });
  useEffect(() => {
    const h = () => {
      setIsLand(window.innerWidth > window.innerHeight);
      setIsDesk(!("ontouchstart" in window) && window.innerWidth >= 1024);
      setWinSize({ w: window.innerWidth, h: window.innerHeight });
    };
    const oh = () => setTimeout(h, 150);
    window.addEventListener("resize", h);
    window.addEventListener("orientationchange", oh);
    return () => {
      window.removeEventListener("resize", h);
      window.removeEventListener("orientationchange", oh);
    };
  }, []);
  useEffect(() => {
    SFX.setMute(!settings.sfx);
  }, [settings.sfx]);
  useEffect(() => {
    SFX.setVolume(settings.volume || 1);
  }, [settings.volume]);
  useEffect(() => {
    const id = "dos-css";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = CSS;
      document.head.appendChild(el);
    }
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, []);
  const log = useCallback((m, ty = "info") => setELog((p) => [...p.slice(-80), { m: `[F${playerRef.current?.floor || "?"}] ${m}`, ty, ts: Date.now() }]), []);
  const shk = useCallback(() => {
    setShaking(true);
    flash("damage");
    SFX.enemyHit();
    setTimeout(() => setShaking(false), 250);
    try {
      if (settings.haptic !== false && navigator.vibrate) navigator.vibrate(50);
    } catch (e) {
    }
  }, [flash, settings.haptic]);
  const handleDeath = useCallback(() => {
    SFX.death();
    if (lastSanc > 0) setScreen("respawn");
    else setScreen("gameOver");
  }, [lastSanc]);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);
  useEffect(() => {
    if (pendingDeath) {
      setPendingDeath(false);
      handleDeath();
    }
  }, [pendingDeath, handleDeath]);
  const startGame = useCallback((cls) => {
    const base = CLASSES[cls];
    const d = genDungeon(1);
    const starterW = genFloorWeapon(1, cls);
    starterW.id = "sw0";
    starterW.name = { warrior: "Training Sword", mage: "Apprentice Wand", thief: "Worn Dagger" }[cls];
    const starterA = genFloorArmor(1, cls);
    starterA.id = "sa0";
    starterA.name = { warrior: "Leather Vest", mage: "Cloth Robes", thief: "Cloth Vest" }[cls];
    const pName = charName.trim() || base.name;
    const p = { cls, name: pName, icon: base.icon, hp: base.hp, maxHp: base.hp, mp: base.mp, maxMp: base.mp, baseMaxMp: base.mp, str: base.str, dex: base.dex, int: base.int, baseDef: base.def, level: 1, xp: 0, floor: 1, gold: 0, x: d.start.x, y: d.start.y, inv: [{ ...CONS[0], id: uid() }, { ...CONS[0], id: uid() }, { ...CONS[1], id: uid() }], equipped: { weapon: starterW, armor: starterA, accessory: null }, skills: base.skills, unlocked: [base.skills[0]], vr: VR, torchB: 0, poisoned: false, warCryB: 0 };
    d.revealed = revA(d.revealed, d.start.x, d.start.y, VR);
    setPlayer(p);
    setDun(d);
    setBossAlive(true);
    setInSanc(false);
    setLastSanc(0);
    setWand(spawnW(d, 1));
    setStats({ kills: 0, chests: 0, totG: 0, megaK: 0, erebus: false, steps: 0, seen: {} });
    setPendingDeath(false);
    setCompletedQuests(/* @__PURE__ */ new Set());
    setArmory([]);
    setSubArea(null);
    setSancShop(null);
    setStatPoints(0);
    setPassives([]);
    setLoreLog([]);
    setTrail([]);
    setMoralChoice(null);
    setSpecialization(null);
    setELog([{ m: `${pName} enters. Floor 1 \u2014 ${d.fc.name} ${d.fc.icon}`, ty: "system", ts: Date.now() }]);
    setCombat(null);
    setMenu(null);
    setScreen("game");
  }, [charName]);
  function spawnW(d, f) {
    if (d.isSanc) return [];
    const e = [];
    const occupied = /* @__PURE__ */ new Set();
    occupied.add(`${d.start.x},${d.start.y}`);
    if (d.bossPos) occupied.add(`${d.bossPos.x},${d.bossPos.y}`);
    const bri = d.bri || d.rooms.length - 1;
    const baseMin = 4 + Math.floor(f / 8);
    const baseMax = 7 + Math.floor(f / 3);
    const diffMult = settings.difficulty === "easy" ? 0.8 : settings.difficulty === "hard" ? 1.2 : 1;
    let count = rng(baseMin, baseMax);
    count = Math.max(4, Math.floor(count * diffMult));
    const eligibleRooms = [];
    for (let ri = 1; ri < Math.max(1, bri); ri++) {
      if (d.rooms[ri]) eligibleRooms.push(ri);
    }
    if (eligibleRooms.length === 0) return e;
    let roomIdx = 0;
    for (let i = 0; i < count; i++) {
      const ri = eligibleRooms[roomIdx % eligibleRooms.length];
      roomIdx++;
      const r = d.rooms[ri];
      if (!r) continue;
      for (let a = 0; a < 15; a++) {
        const ex = rng(r.x, r.x + r.w - 1), ey = rng(r.y, r.y + r.h - 1);
        const key = `${ex},${ey}`;
        if (d.map[ey] && d.map[ey][ex] === T.FLOOR && !occupied.has(key)) {
          occupied.add(key);
          e.push({ ...getEnemy(f), x: ex, y: ey });
          break;
        }
      }
    }
    return e;
  }
  const moveW = useCallback(() => {
    if (!dun) return;
    const pr = playerRef.current;
    setWand((prev) => {
      const occupied = new Set(prev.map((e) => `${e.x},${e.y}`));
      return prev.map((e) => {
        if (Math.random() > 0.35) return e;
        const px = pr?.x ?? -1, py = pr?.y ?? -1;
        const dist = Math.abs(e.x - px) + Math.abs(e.y - py);
        let dx, dy;
        if (dist <= 4 && dist > 0 && px >= 0) {
          const xd = px - e.x, yd = py - e.y;
          if (Math.abs(xd) >= Math.abs(yd)) {
            dx = xd > 0 ? 1 : -1;
            dy = 0;
          } else {
            dx = 0;
            dy = yd > 0 ? 1 : -1;
          }
          const nx1 = e.x + dx, ny1 = e.y + dy;
          const k1 = `${nx1},${ny1}`;
          if (nx1 >= 0 && nx1 < MW && ny1 >= 0 && ny1 < MH && dun.map[ny1] && dun.map[ny1][nx1] === T.FLOOR && !occupied.has(k1)) {
            occupied.delete(`${e.x},${e.y}`);
            occupied.add(k1);
            return { ...e, x: nx1, y: ny1 };
          }
          if (Math.abs(xd) >= Math.abs(yd)) {
            dx = 0;
            dy = yd > 0 ? 1 : yd < 0 ? -1 : 0;
          } else {
            dx = xd > 0 ? 1 : xd < 0 ? -1 : 0;
            dy = 0;
          }
          if (dx === 0 && dy === 0) return e;
        } else {
          const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
          [dx, dy] = dirs[rng(0, 3)];
        }
        const nx = e.x + dx, ny = e.y + dy;
        const key = `${nx},${ny}`;
        if (nx >= 0 && nx < MW && ny >= 0 && ny < MH && dun.map[ny] && dun.map[ny][nx] === T.FLOOR && !occupied.has(key)) {
          occupied.delete(`${e.x},${e.y}`);
          occupied.add(key);
          return { ...e, x: nx, y: ny };
        }
        return e;
      });
    });
  }, [dun]);
  const enterSanctuary = useCallback((af) => {
    const d = genDungeon(af, true);
    d.revealed = revA(d.revealed, d.start.x, d.start.y, VR + 2);
    setDun(d);
    setPlayer((p) => {
      const hpR = Math.max(p.hp, Math.floor(p.maxHp * 0.6));
      const mpR = Math.max(p.mp, Math.floor(p.maxMp * 0.6));
      return { ...p, x: d.start.x, y: d.start.y, hp: Math.min(p.maxHp, hpR), mp: Math.min(p.maxMp, mpR), poisoned: false };
    });
    setWand([]);
    setBossAlive(false);
    setInSanc(true);
    setLastSanc(af);
    SFX.sanctuary();
    flash("heal");
    log("\u{1F3D5}\uFE0F SANCTUARY \u2014 HP & MP restored 60%! Use fountains for full heal.", "heal");
    const tierIdx = Math.floor((af - 1) / 10);
    if (SANC_PLAQUES[tierIdx]) log(`\u{1F4DC} "${SANC_PLAQUES[tierIdx]}"`, "lore");
    if (SANC_NPC[tierIdx]) log(`\u{1F9D9} "${SANC_NPC[tierIdx]}"`, "system");
    const bt = BOUNTY_TARGETS[Math.min(tierIdx, BOUNTY_TARGETS.length - 1)];
    const breq = rng(3, 6);
    const brew = rng(50 + af * 5, 100 + af * 10);
    setBounty({ target: bt, required: breq, current: 0, reward: brew });
    log(`\u{1F4CB} Bounty: Kill ${breq} ${bt}s for ${brew}g`, "system");
    log("\u{1F489} Sanctuary: Stat potions available in shop.", "system");
  }, [log, flash]);
  const nextFloor = useCallback(() => {
    if (inSanc) {
      const nf2 = player.floor + 1;
      if (nf2 > 100) {
        setScreen("victory");
        return;
      }
      const fc3 = getFC(nf2);
      const tierStart2 = (nf2 - 1) % 10 === 0;
      const tierIdx2 = Math.floor((nf2 - 1) / 10);
      const intro2 = tierStart2 && TIER_INTROS[tierIdx2] ? TIER_INTROS[tierIdx2] : null;
      setFloorTrans({ name: fc3.name, icon: fc3.icon, floor: nf2, tierName: tierStart2 ? ["The Forsaken Crypts", "The Sunken Sewers", "The Collapsed Mines", "The Undead Sanctum", "The Infernal Furnace", "The Frozen Reach", "The Void Threshold", "The Dragon Halls", "The Eldritch Dream", "Erebus' Throne"][tierIdx2] : null, intro: intro2 });
      setTimeout(() => setFloorTrans(null), intro2 ? 2200 : 1200);
      const d2 = genDungeon(nf2);
      d2.revealed = revA(d2.revealed, d2.start.x, d2.start.y, player.vr + player.torchB);
      setDun(d2);
      setPlayer((p) => ({ ...p, floor: nf2, x: d2.start.x, y: d2.start.y }));
      setWand(spawnW(d2, nf2));
      setBossAlive(true);
      setInSanc(false);
      setSancShop(null);
      log(`Floor ${nf2} \u2014 ${fc3.name} ${fc3.icon}`, "system");
      if (nf2 % 10 === 0) log("\u26A0\uFE0F MEGA BOSS!", "danger");
      if (intro2) log(`"${intro2}"`, "lore");
      return;
    }
    if (player.floor % 10 === 0) {
      enterSanctuary(player.floor);
      return;
    }
    const nf = player.floor + 1;
    if (nf > 100) {
      setScreen("victory");
      return;
    }
    const fc2 = getFC(nf);
    const tierStart = (nf - 1) % 10 === 0;
    const tierIdx = Math.floor((nf - 1) / 10);
    const intro = tierStart && TIER_INTROS[tierIdx] ? TIER_INTROS[tierIdx] : null;
    setFloorTrans({ name: fc2.name, icon: fc2.icon, floor: nf, tierName: tierStart ? ["The Forsaken Crypts", "The Sunken Sewers", "The Collapsed Mines", "The Undead Sanctum", "The Infernal Furnace", "The Frozen Reach", "The Void Threshold", "The Dragon Halls", "The Eldritch Dream", "Erebus' Throne"][tierIdx] : null, intro });
    setTimeout(() => setFloorTrans(null), intro ? 2200 : 1200);
    const d = genDungeon(nf);
    d.revealed = revA(d.revealed, d.start.x, d.start.y, player.vr + player.torchB);
    setDun(d);
    setPlayer((p) => ({ ...p, floor: nf, x: d.start.x, y: d.start.y }));
    setWand(spawnW(d, nf));
    setBossAlive(true);
    log(`Floor ${nf} \u2014 ${fc2.name} ${fc2.icon}`, "system");
    if (nf % 10 === 0) log("\u26A0\uFE0F MEGA BOSS!", "danger");
    if (intro) log(`"${intro}"`, "lore");
    if (nf % 10 !== 0 && nf % 5 !== 0 && Math.random() < 0.15) {
      const mc = MORAL_CHOICES[rng(0, MORAL_CHOICES.length - 1)];
      setTimeout(() => setMoralChoice(mc), 800);
    }
  }, [player, inSanc, enterSanctuary, log]);
  const respawn = useCallback(() => {
    if (lastSanc <= 0) return;
    setSancShop(null);
    enterSanctuary(lastSanc);
    setPlayer((p) => ({ ...p, floor: lastSanc, gold: Math.floor(p.gold * 0.75), xp: Math.floor(p.xp * 0.7) }));
    setCombat(null);
    setMenu(null);
    setKillStreak(0);
    log("Respawned. -25% gold, -30% XP.", "system");
    setScreen("game");
  }, [lastSanc, enterSanctuary, log]);
  const equipBest = useCallback(() => {
    const best = getBestEquip(player, armory);
    const toArmory = [];
    const fromArmory = [];
    setPlayer((p) => {
      let np = { ...p, inv: [...p.inv] };
      if (best.weapon && best.weapon.id !== np.equipped.weapon?.id) {
        const old = np.equipped.weapon;
        const inInv = np.inv.some((i) => i.id === best.weapon.id);
        if (inInv) np.inv = np.inv.filter((i) => i.id !== best.weapon.id);
        else fromArmory.push(best.weapon.id);
        if (old) toArmory.push(old);
        np.equipped = { ...np.equipped, weapon: best.weapon };
        log(`\u2B06\uFE0F ${best.weapon.icon} ${best.weapon.name}`, "info");
      }
      if (best.armor && best.armor.id !== np.equipped.armor?.id) {
        const old = np.equipped.armor;
        const inInv = np.inv.some((i) => i.id === best.armor.id);
        if (inInv) np.inv = np.inv.filter((i) => i.id !== best.armor.id);
        else fromArmory.push(best.armor.id);
        if (old) toArmory.push(old);
        np.equipped = { ...np.equipped, armor: best.armor };
        np.maxMp = np.baseMaxMp + (best.armor.mpB || 0);
        np.mp = Math.min(np.mp, np.maxMp);
        log(`\u2B06\uFE0F ${best.armor.icon} ${best.armor.name}`, "info");
      }
      return np;
    });
    setArmory((a) => {
      let na = [...a, ...toArmory];
      na = na.filter((i) => !fromArmory.includes(i.id));
      return na;
    });
  }, [player, armory, log]);
  const useItem = useCallback((item, inC = false) => {
    if (item.type === "consumable") {
      setPlayer((p) => {
        const ni = [...p.inv];
        const idx = ni.findIndex((i) => i.id === item.id);
        if (idx === -1) return p;
        ni.splice(idx, 1);
        let np = { ...p, inv: ni };
        if (item.effect === "hp") {
          const pct = item.amt >= 80 ? Math.floor(np.maxHp * 0.35) : Math.floor(np.maxHp * 0.2);
          const heal = Math.max(item.amt, pct);
          np.hp = Math.min(np.maxHp, np.hp + heal);
          log(`+${heal}HP (${Math.round(heal / np.maxHp * 100)}%)`, "heal");
        }
        if (item.effect === "mp") {
          const pct = item.amt >= 60 ? Math.floor(np.maxMp * 0.35) : Math.floor(np.maxMp * 0.2);
          const heal = Math.max(item.amt, pct);
          np.mp = Math.min(np.maxMp, np.mp + heal);
          log(`+${heal}MP (${Math.round(heal / np.maxMp * 100)}%)`, "heal");
        }
        if (item.effect === "cure") {
          np.poisoned = false;
          log("Cured!", "heal");
        }
        if (item.effect === "vision") {
          np.torchB = Math.min(np.torchB + item.amt, 3);
          log(`Vision ${np.vr + np.torchB}/${np.vr + 3}`, "info");
        }
        if (item.effect === "full" || item.effect === "revive") {
          np.hp = np.maxHp;
          np.mp = np.maxMp;
          np.poisoned = false;
          log("Full restore!", "heal");
        }
        if (item.effect === "speed") {
          np.dex = np.dex + item.amt;
          np.speedB = (np.speedB || 0) + item.amt;
          log(`+${item.amt} DEX (temporary)!`, "info");
        }
        if (item.effect === "shield") {
          np.def = np.def + item.amt;
          np.shieldB = (np.shieldB || 0) + item.amt;
          log(`+${item.amt} DEF (temporary)!`, "info");
        }
        if (item.effect === "perm_str") {
          np.str++;
          log("+1 STR (permanent)!", "levelup");
        }
        if (item.effect === "perm_dex") {
          np.dex++;
          log("+1 DEX (permanent)!", "levelup");
        }
        if (item.effect === "perm_int") {
          np.int++;
          log("+1 INT (permanent)!", "levelup");
        }
        return np;
      });
      if (["hp", "mp", "cure", "full", "revive", "speed", "shield"].includes(item.effect)) {
        SFX.heal();
        flash("heal");
      }
      if (item.effect === "warp") {
        if (lastSanc > 0) {
          SFX.portal();
          log("Warped to sanctuary!", "system");
          enterSanctuary(lastSanc);
          setPlayer((p) => ({ ...p, floor: lastSanc }));
        } else {
          log("No sanctuary discovered yet!", "danger");
          setPlayer((p) => ({ ...p, inv: [...p.inv, { ...item, id: uid() }] }));
        }
      }
      if (item.effect === "key") {
        log("Use keys on locked doors (\u{1F512}).", "info");
        setPlayer((p) => ({ ...p, inv: [...p.inv, { ...item, id: uid() }] }));
      }
      if (inC && item.effect === "damage") {
        SFX.hit();
        addParticles(5, "#fa0");
        const pr = playerRef.current || player;
        const primStat = pr.cls === "mage" ? pr.int : pr.cls === "thief" ? pr.dex : pr.str;
        const bDmg = Math.max(item.amt, item.amt + Math.floor((pr.floor || 1) * 2) + Math.floor(primStat * 0.5));
        setCombat((c) => {
          if (!c) return c;
          const nh = c.enemy.hp - bDmg;
          setCLog((pr2) => [...pr2, `\u{1F4A3} ${bDmg}dmg!`]);
          if (nh <= 0) return { ...c, enemy: { ...c.enemy, hp: 0 }, phase: "won" };
          return { ...c, enemy: { ...c.enemy, hp: nh } };
        });
      }
    }
  }, [log, flash, addParticles, lastSanc, enterSanctuary]);
  const startCombat = useCallback((enemy) => {
    const dm = settings.difficulty === "easy" ? 0.8 : settings.difficulty === "hard" ? 1.35 : 1;
    const ngM = 1 + ngPlus * 0.1;
    const scaled = { ...enemy, hp: Math.floor(enemy.hp * dm * ngM), maxHp: Math.floor(enemy.maxHp * dm * ngM), atk: Math.floor(enemy.atk * dm * ngM) };
    setCombatAnim(null);
    setCInv(false);
    setMenu(null);
    const hasDlg = scaled.isMega && BOSS_DIALOGUE[scaled.name];
    setCombat({ enemy: { ...scaled, burn: 0, freeze: 0, stun: 0 }, phase: hasDlg ? "dialogue" : "player", turn: 1, dialogue: hasDlg ? BOSS_DIALOGUE[scaled.name] : null, lastSkill: null });
    setCLog([`${scaled.isMega ? "\u26A0\uFE0F MEGA BOSS \u2014 " : ""}${scaled.isBoss && !scaled.isMega ? "\u{1F479} BOSS: " : ""}${scaled.isChampion ? "\u2605 CHAMPION: " : ""}${scaled.icon} ${scaled.name}!${scaled.title ? " \u2014 " + scaled.title : ""}${scaled.subtitle ? " \u2014 " + scaled.subtitle : ""}`]);
    log(`${scaled.isBoss ? "BOSS: " : ""}${scaled.name}!`, "danger");
    setStats((p) => ({ ...p, seen: { ...p.seen, [scaled.name]: { icon: scaled.icon, kills: p.seen?.[scaled.name]?.kills || 0 } } }));
    if (scaled.isMega) {
      SFX.bossEntrance();
    } else if (scaled.isBoss) {
      SFX.boss();
    }
    if (hasDlg) setTimeout(() => setCombat((c) => c && c.phase === "dialogue" ? { ...c, phase: "player" } : c), 2500);
  }, [log, settings.difficulty, ngPlus]);
  const calcPlayerDmg = (raw, eDef, variance) => {
    const red = eDef / (eDef + raw + 40);
    const base = raw * (1 - red);
    return rollDmg(base, variance);
  };
  const pAtk = useCallback((skill = null) => {
    if (!combat || combat.phase !== "player") return;
    const st = calcStats(player);
    const eDef = combat.enemy.def;
    let dmg, msg = "", isCrit = false, isCleave = false;
    if (skill) {
      if (skill === "Smoke Bomb") {
        if (combat.enemy.isBoss) {
          setCLog((p) => [...p, "Can't flee bosses!"]);
          return;
        }
        if (player.mp < 6) {
          setCLog((p) => [...p, "Not enough MP!"]);
          return;
        }
        setPlayer((p) => ({ ...p, mp: p.mp - 6 }));
        setCLog((p) => [...p, "\u{1F4A8} Escaped!"]);
        setTimeout(() => {
          setCombat(null);
          log("Escaped!", "info");
        }, 500);
        return;
      }
      const mpScale = 1 + Math.floor((player.floor - 1) / 10) * 0.1;
      const mc = (base) => Math.ceil(base * mpScale);
      const dInt = dimStat(player.int);
      const dDex = dimStat(player.dex);
      const sm = {
        "Power Strike": { d: () => calcPlayerDmg(st.atk * 1.6, eDef, st.atk * 0.25), mp: mc(8), m: "\u2694\uFE0F Power Strike!" },
        "Cleave": { d: () => calcPlayerDmg(st.atk * 1.3, eDef, st.atk * 0.2), mp: mc(12), m: "\u{1F4A5} Cleave!", cleave: true },
        "War Cry": { d: () => {
          if ((player.warCryB || 0) >= 10) {
            setCLog((p) => [...p, "War Cry maxed!"]);
            return 0;
          }
          const bonus = Math.min(2, 10 - (player.warCryB || 0));
          setPlayer((p) => ({ ...p, str: p.str + bonus, warCryB: (p.warCryB || 0) + bonus }));
          return 0;
        }, mp: mc(10), m: `\u{1F4E2} +STR!`, no: true },
        "Berserk": { d: () => calcPlayerDmg(st.atk * 2.2, eDef, st.atk * 0.3), mp: mc(20), m: "\u{1F525} BERSERK!" },
        "Fireball": { d: () => calcPlayerDmg(dInt * 2, eDef * 0.6, dInt * 0.3), mp: mc(15), m: "\u{1F525} Fireball!" },
        "Ice Shard": { d: () => calcPlayerDmg(dInt * 1.6, eDef * 0.5, dInt * 0.25), mp: mc(10), m: "\u2744\uFE0F Ice Shard!" },
        "Chain Bolt": { d: () => calcPlayerDmg(dInt * 1.8, eDef * 0.5, dInt * 0.3), mp: mc(22), m: "\u26A1 Chain Bolt!" },
        "Meteor": { d: () => calcPlayerDmg(dInt * 2.8, eDef * 0.6, dInt * 0.4), mp: mc(35), m: "\u2604\uFE0F METEOR!" },
        "Backstab": { d: () => calcPlayerDmg(st.atk + dDex * 1.2, eDef, dDex * 0.3), mp: mc(10), m: "\u{1F5E1}\uFE0F Backstab!" },
        "Assassinate": { d: () => calcPlayerDmg(st.atk * 1.5 + dDex * 1.8, eDef, dDex * 0.4), mp: mc(25), m: "\u{1F480} Assassinate!" },
        "Shadow Step": { d: () => calcPlayerDmg(st.atk + dDex * 1.5, eDef * 0.6, dDex * 0.3), mp: mc(18), m: "\u{1F464} Shadow Step!" },
        "Shield Wall": { d: () => 0, mp: mc(5), m: "\u{1F6E1}\uFE0F Shield Wall!", sp: "sw" },
        "Arcane Shield": { d: () => 0, mp: mc(8), m: "\u{1F52E} Arcane Shield!", sp: "as" },
        "Steal": { d: () => {
          if (Math.random() < 0.4 + player.dex * 0.01) {
            if (Math.random() < 0.3) {
              const l = getChestLoot(player.floor);
              setPlayer((p) => ({ ...p, inv: [...p.inv, l] }));
              setCLog((p) => [...p, `\u{1F911} Stole ${l.icon} ${l.name}!`]);
            } else {
              const g = rng(5 + player.floor, 20 + player.floor * 3);
              setPlayer((p) => ({ ...p, gold: p.gold + g }));
              setCLog((p) => [...p, `\u{1F911} +${g}g!`]);
            }
          } else setCLog((p) => [...p, "Miss!"]);
          return 0;
        }, mp: mc(5), m: "", no: true }
      };
      const s = sm[skill];
      if (!s) return;
      if (player.mp < s.mp) {
        setCLog((p) => [...p, "Not enough MP!"]);
        return;
      }
      setPlayer((p) => ({ ...p, mp: p.mp - s.mp }));
      if (s.sp === "sw") {
        setCLog((p) => [...p, s.m]);
        setCombat((c) => ({ ...c, phase: "enemy", sw: true }));
        return;
      }
      if (s.sp === "as") {
        setCLog((p) => [...p, s.m]);
        setCombat((c) => ({ ...c, phase: "enemy", as: true }));
        return;
      }
      dmg = Math.max(1, Math.floor(s.d()));
      msg = s.m;
      if (s.no) {
        if (msg) setCLog((p) => [...p, msg]);
        setCombat((c) => ({ ...c, phase: "enemy" }));
        return;
      }
      if (s.cleave) isCleave = true;
      SFX.hit();
    } else {
      const baseAtk = player.cls === "mage" ? st.atk + Math.floor(dimStat(player.int) * 0.8) : st.atk;
      isCrit = Math.random() < player.dex * 0.015 + 0.06;
      dmg = calcPlayerDmg(baseAtk, eDef, Math.max(2, baseAtk * 0.2));
      if (isCrit) {
        dmg = Math.floor(dmg * 1.9);
        msg = "\u{1F4A5} CRIT! ";
        SFX.crit();
      } else {
        SFX.hit();
      }
    }
    dmg = Math.max(1, dmg);
    dmg = Math.max(dmg, Math.floor(combat.enemy.maxHp * 0.05));
    const SKILL_ELEM = { "Fireball": "fire", "Ice Shard": "ice", "Meteor": "fire", "Chain Bolt": "lightning", "Backstab": "physical", "Assassinate": "physical", "Shadow Step": "physical", "Power Strike": "physical", "Cleave": "physical", "Berserk": "physical" };
    const atkElem = skill ? SKILL_ELEM[skill] || "physical" : "physical";
    const eElem = combat.enemy.elem || "physical";
    const weakMult = ELEM_WEAK[atkElem] && ELEM_WEAK[atkElem][eElem] || 1;
    if (weakMult > 1) {
      dmg = Math.floor(dmg * weakMult);
      msg += `(${atkElem} \u25B8 ${eElem}!) `;
    }
    const COMBOS = {
      "Ice Shard\u2192Fireball": { mult: 1.5, name: "Steam Burst" },
      "Backstab\u2192Assassinate": { mult: 1.3, name: "Death Strike" },
      "Power Strike\u2192Cleave": { mult: 1.25, name: "Whirlwind" },
      "Fireball\u2192Meteor": { mult: 1.4, name: "Inferno" },
      "Ice Shard\u2192Chain Bolt": { mult: 1.35, name: "Shatter Bolt" }
    };
    if (skill && combat.lastSkill) {
      const comboKey = `${combat.lastSkill}\u2192${skill}`;
      if (COMBOS[comboKey]) {
        const cb = COMBOS[comboKey];
        dmg = Math.floor(dmg * cb.mult);
        msg += `\u{1F517} ${cb.name}! `;
        setCLog((p) => [...p, `\u{1F517} COMBO: ${cb.name}!`]);
      }
    }
    let inflictBurn = 0, inflictFreeze = 0, inflictStun = 0;
    if (atkElem === "fire" && Math.random() < 0.15) inflictBurn = 3;
    if (atkElem === "ice" && Math.random() < 0.12) inflictFreeze = 1;
    if (isCrit && atkElem === "physical" && Math.random() < 0.2) inflictStun = 1;
    let statusMsg = "";
    if (inflictBurn) statusMsg += " \u{1F525}Burn!";
    if (inflictFreeze) statusMsg += " \u2744\uFE0FFreeze!";
    if (inflictStun) statusMsg += " \u26A1Stun!";
    const animType = skill && ["Fireball", "Ice Shard", "Chain Bolt", "Meteor", "Arcane Shield"].includes(skill) ? "pCast" : "pLunge";
    setCombatAnim(animType);
    setTimeout(() => setCombatAnim(null), 300);
    setCLog((p) => [...p, `${msg}${dmg}dmg!${statusMsg}`]);
    addParticles(isCrit ? 8 : 4, atkElem === "fire" ? "#f80" : atkElem === "ice" ? "#8df" : atkElem === "lightning" ? "#ff0" : "#f44");
    enemyFlash();
    if (isCleave && wand.length > 0) {
      const splashDmg = Math.floor(dmg * 0.5);
      const target = wand[rng(0, wand.length - 1)];
      if (target && target.id !== combat.enemy.id) {
        const snh = target.hp - splashDmg;
        if (snh <= 0) {
          setWand((p) => p.filter((w) => w.id !== target.id));
          setStats((p) => ({ ...p, kills: p.kills + 1 }));
          setCLog((p) => [...p, `\u{1F4A5} Cleave kills ${target.icon} ${target.name}!`]);
        } else {
          setWand((p) => p.map((w) => w.id === target.id ? { ...w, hp: snh } : w));
          setCLog((p) => [...p, `\u{1F4A5} Cleave hits ${target.icon} ${target.name} for ${splashDmg}!`]);
        }
      }
    }
    const nh = combat.enemy.hp - dmg;
    const statusUpd = {};
    if (inflictBurn) statusUpd.burn = (combat.enemy.burn || 0) + inflictBurn;
    if (inflictFreeze) statusUpd.freeze = (combat.enemy.freeze || 0) + inflictFreeze;
    if (inflictStun) statusUpd.stun = (combat.enemy.stun || 0) + inflictStun;
    if (nh <= 0) {
      setCombatAnim("eDeath");
      setCombat((c) => ({ ...c, enemy: { ...c.enemy, hp: 0, ...statusUpd }, phase: "dying", lastSkill: skill || null }));
      setTimeout(() => {
        setCombatAnim(null);
        setCombat((c) => c && c.phase === "dying" ? { ...c, phase: "won" } : c);
      }, 600);
    } else setCombat((c) => ({ ...c, enemy: { ...c.enemy, hp: nh, ...statusUpd }, phase: "enemy", lastSkill: skill || null }));
  }, [combat, player, wand, log, enemyFlash, addParticles]);
  useEffect(() => {
    if (!combat || combat.phase !== "enemy") return;
    const t = setTimeout(() => {
      const p = playerRef.current;
      if (!p) return;
      const st = calcStats(p);
      const en = combat.enemy;
      let burnDmg = 0;
      if (en.burn > 0) {
        burnDmg = Math.max(2, Math.floor(en.maxHp * 0.03));
        setCLog((pr) => [...pr, `\u{1F525} ${en.name} burns! -${burnDmg}HP`]);
        const bnh = en.hp - burnDmg;
        if (bnh <= 0) {
          setCombatAnim("eDeath");
          setCombat((c) => ({ ...c, enemy: { ...c.enemy, hp: 0, burn: 0 }, phase: "dying" }));
          setTimeout(() => {
            setCombatAnim(null);
            setCombat((c) => c && c.phase === "dying" ? { ...c, phase: "won" } : c);
          }, 600);
          return;
        }
        setCombat((c) => ({ ...c, enemy: { ...c.enemy, hp: bnh, burn: en.burn - 1 } }));
      }
      if (en.freeze > 0) {
        setCLog((pr) => [...pr, `\u2744\uFE0F ${en.name} is frozen! Skipped turn.`]);
        setCombat((c) => ({ ...c, enemy: { ...c.enemy, freeze: en.freeze - 1 }, phase: "player", turn: c.turn + 1, sw: false, as: false }));
        return;
      }
      if (en.stun > 0 && Math.random() < 0.5) {
        setCLog((pr) => [...pr, `\u26A1 ${en.name} is stunned! Skipped turn.`]);
        setCombat((c) => ({ ...c, enemy: { ...c.enemy, stun: en.stun - 1 }, phase: "player", turn: c.turn + 1, sw: false, as: false }));
        return;
      }
      if (en.stun > 0) setCombat((c) => ({ ...c, enemy: { ...c.enemy, stun: en.stun - 1 } }));
      let poisonDmg = 0;
      if (p.poisoned) {
        poisonDmg = Math.max(2, Math.floor(p.maxHp * 0.02));
        setCLog((pr) => [...pr, `\u2620\uFE0F Poison -${poisonDmg}HP`]);
      }
      if (Math.random() < p.dex * 0.012) {
        SFX.miss();
        setCLog((pr) => [...pr, `${en.icon} misses!`]);
        setPlayer((pp) => ({ ...pp, hp: Math.max(1, pp.hp - poisonDmg) }));
        setCombat((c) => ({ ...c, phase: "player", turn: c.turn + 1, sw: false, as: false }));
        return;
      }
      const { dmg, crit } = calcEnemyDmg(en, st, { sw: !!combat.sw, as: !!combat.as });
      const didPoison = !p.poisoned && Math.random() < 0.15;
      setCombatAnim("eLunge");
      setTimeout(() => setCombatAnim(null), 300);
      if (crit) SFX.crit();
      shk();
      setCLog((pr) => [...pr, `${en.icon} ${dmg}dmg!${crit ? " \u{1F4A5}CRIT!" : ""}${didPoison ? " \u2620\uFE0F Poisoned!" : ""}`]);
      const nh = p.hp - dmg - poisonDmg;
      if (nh <= 0) {
        const phoenix = p.inv.find((i) => i.effect === "revive");
        if (phoenix) {
          setPlayer((pp) => ({ ...pp, hp: pp.maxHp, mp: pp.maxMp, poisoned: false, inv: pp.inv.filter((i) => i.id !== phoenix.id) }));
          setCLog((pr) => [...pr, "\u{1F525} Phoenix Down! Revived!"]);
          SFX.heal();
          flash("heal");
          setCombat((c) => ({ ...c, phase: "player", turn: c.turn + 1, sw: false, as: false }));
          return;
        }
        setPlayer((pp) => ({ ...pp, hp: 0 }));
        setCombat((c) => ({ ...c, phase: "lost" }));
      } else {
        setPlayer((pp) => ({ ...pp, hp: nh, poisoned: pp.poisoned || didPoison }));
        setCombat((c) => ({ ...c, phase: "player", turn: c.turn + 1, sw: false, as: false }));
      }
    }, 650);
    return () => clearTimeout(t);
  }, [combat?.phase]);
  const flee = useCallback(() => {
    if (combat?.enemy?.isBoss) {
      setCLog((p) => [...p, "Can't flee!"]);
      SFX.error();
      return;
    }
    const chance = Math.min(0.75, 0.4 + player.dex * 5e-3 - player.floor * 3e-3);
    if (Math.random() < chance) {
      setCombat(null);
      SFX.flee();
      log("Fled!", "info");
    } else {
      setCLog((p) => [...p, "Failed!"]);
      SFX.miss();
      setCombat((c) => ({ ...c, phase: "enemy" }));
    }
  }, [combat, player, log]);
  const claimWin = useCallback(() => {
    if (!combat) return;
    const e = combat.enemy;
    const dm = settings.difficulty === "easy" ? 1 : settings.difficulty === "hard" ? 1.2 : 1;
    const xpG = Math.floor(e.xp * dm);
    const drops = [];
    if (e.isMega) {
      for (let i = 0; i < rng(2, 3); i++) drops.push(getChestLoot(player.floor));
      const bonusPool = CONS.filter((c) => c.lvl <= player.floor + 20 && c.val >= 25);
      if (bonusPool.length > 0) drops.push({ ...bonusPool[rng(0, bonusPool.length - 1)], id: uid() });
    } else if (e.isBoss) {
      for (let i = 0; i < rng(1, 2); i++) drops.push(getChestLoot(player.floor));
    } else if (e.isChampion) {
      drops.push(getChestLoot(player.floor));
      if (Math.random() < 0.5) drops.push(getChestLoot(player.floor));
    } else {
      const r = Math.random();
      if (r < 0.7) drops.push(getChestLoot(player.floor));
      else if (r < 0.9) {
      } else {
        drops.push(getChestLoot(player.floor));
        drops.push(getChestLoot(player.floor));
      }
    }
    const bossGear = [];
    setPlayer((p) => {
      let np = { ...p, xp: p.xp + xpG, gold: p.gold + e.gold };
      const startLvl = np.level;
      while (np.xp >= xpFor(np.level)) {
        np.xp -= xpFor(np.level);
        np.level++;
        np.maxHp += np.cls === "warrior" ? 10 : np.cls === "mage" ? 6 : 7;
        np.hp = np.maxHp;
        np.baseMaxMp += np.cls === "mage" ? 12 : np.cls === "thief" ? 6 : 3;
        np.maxMp = np.baseMaxMp + (np.equipped.armor?.mpB || 0);
        np.mp = np.maxMp;
        np.str += np.cls === "warrior" ? 2 : 1;
        np.dex += np.cls === "thief" ? 2 : 1;
        np.int += np.cls === "mage" ? 2 : 1;
        np.baseDef += np.cls === "warrior" ? 2 : 1;
        [1, 4, 8, 14, 22].forEach((th, i) => {
          if (np.level >= th && np.skills[i] && !np.unlocked.includes(np.skills[i])) np.unlocked = [...np.unlocked, np.skills[i]];
        });
      }
      const lvlsGained = np.level - startLvl;
      if (lvlsGained > 0) setStatPoints((sp) => sp + lvlsGained * 2);
      if (lvlsGained > 0) {
        for (let l = startLvl + 1; l <= np.level; l++) {
          if (l % 10 === 0 && l <= 50) {
            const pi = Math.floor(l / 10) - 1;
            if (pi >= 0 && pi < PERKS.length) log(`\u{1F31F} Perk available! Open Stats menu.`, "levelup");
          }
        }
      }
      if (lvlsGained > 0) {
        SFX.levelUp();
        flash("heal");
        log(`\u2B06\uFE0F LEVEL ${np.level}${lvlsGained > 1 ? ` (+${lvlsGained})` : ""}`, "levelup");
      }
      if (e.isBoss && !e.isBarrier && !e.isMini) {
        const bf = e.bossFloor || player.floor;
        const uw = genFloorWeapon(bf, np.cls);
        const ua = genFloorArmor(bf, np.cls);
        const hasW = np.inv.some((i) => i.id === uw.id) || np.equipped.weapon && np.equipped.weapon.id === uw.id || armory.some((i) => i.id === uw.id);
        const hasA = np.inv.some((i) => i.id === ua.id) || np.equipped.armor && np.equipped.armor.id === ua.id || armory.some((i) => i.id === ua.id);
        if (!hasW) {
          bossGear.push(uw);
          log(`\u{1F5E1}\uFE0F ${uw.icon} ${uw.name} (F${bf})!`, "loot");
        }
        if (!hasA) {
          bossGear.push(ua);
          log(`\u{1F6E1}\uFE0F ${ua.icon} ${ua.name} (F${bf})!`, "loot");
        }
      }
      np.inv = [...np.inv, ...drops];
      const cons = np.inv.filter((i) => i.type === "consumable");
      if (cons.length > 50) {
        cons.sort((a, b) => a.val - b.val);
        const excess = cons.length - 50;
        let soldGold = 0;
        for (let i = 0; i < excess; i++) {
          soldGold += Math.floor(cons[i].val / 2);
          np.inv = np.inv.filter((x) => x.id !== cons[i].id);
        }
        np.gold += soldGold;
        if (excess > 0) log(`Inv full! Auto-sold ${excess} items +${soldGold}g`, "info");
      }
      return np;
    });
    if (bossGear.length) setArmory((a) => [...a, ...bossGear]);
    if (e.isBoss && !e.isBarrier && !e.isMini) {
      setBossAlive(false);
      log("\u{1F6AA} Boss defeated! Stairs are now open.", "system");
    }
    if (e.isMini) setDun((d) => ({ ...d, hasMini: false, bossPos: null }));
    setWand((p) => p.filter((w) => w.id !== e.id));
    setStats((p) => ({ ...p, kills: p.kills + 1, totG: p.totG + e.gold, megaK: p.megaK + (e.isMega ? 1 : 0), erebus: p.erebus || e.name === "Erebus", seen: { ...p.seen, [e.name]: { icon: e.icon, kills: (p.seen?.[e.name]?.kills || 0) + 1 } } }));
    setKillStreak((ks) => {
      const nks = ks + 1;
      if (nks >= 3) {
        const bonus = Math.floor(xpG * 0.1 * Math.min(nks, 10));
        setPlayer((p) => ({ ...p, xp: p.xp + bonus }));
        if (nks % 3 === 0) log(`\u{1F525} Kill streak x${nks}! +${bonus} bonus XP`, "levelup");
      }
      return nks;
    });
    if (bounty && e.name.includes(bounty.target)) {
      setBounty((b) => {
        if (!b) return b;
        const nb = { ...b, current: b.current + 1 };
        if (nb.current >= nb.required) {
          log(`\u{1F4CB} Bounty complete! +${nb.reward}g`, "loot");
          setPlayer((p) => ({ ...p, gold: p.gold + nb.reward }));
          showFloat(`+${nb.reward}g`, "#d4a843");
          return null;
        }
        return nb;
      });
    }
    log(`${e.isBoss ? "\u{1F3C6}" : "\u2694\uFE0F"} ${e.name}! +${xpG}xp +${e.gold}g`, "victory");
    if (drops.length > 0) log(`Drop: ${drops.map((d) => `${d.icon} ${d.name}`).join(", ")}`, "loot");
    else log("No drops.", "info");
    if (e.isBarrier && e.barrierX !== void 0) {
      setTile(e.barrierY, e.barrierX, T.PORTAL);
      log("\u{1F52E} A portal appears!", "loot");
      SFX.chest();
    }
    setCombat(null);
  }, [combat, player, settings, armory, log]);
  const setTile = useCallback((y, x, t) => setDun((d) => {
    const nm = [...d.map];
    nm[y] = [...nm[y]];
    nm[y][x] = t;
    return { ...d, map: nm };
  }), []);
  const move = useCallback((dx, dy) => {
    if (!player || !dun || combat || menu || shop) return;
    const nx = player.x + dx, ny = player.y + dy;
    if (nx < 0 || nx >= MW || ny < 0 || ny >= MH) return;
    const tile = dun.map[ny][nx];
    if (tile === T.WALL || tile === T.SECRET) {
      if (tile === T.WALL && Math.random() < 0.02 && player.int > 25) {
        setTile(ny, nx, T.FLOOR);
        SFX.chest();
        flash("loot");
        log("\u{1F52E} Hidden passage revealed!", "loot");
      }
      return;
    }
    if (tile === T.CRACKED) {
      if (player.str > 20 && Math.random() < 0.3 + player.str * 5e-3) {
        setTile(ny, nx, T.FLOOR);
        SFX.trap();
        shk();
        log("\u{1F4A5} Cracked wall shattered!", "loot");
        if (Math.random() < 0.4) {
          const g = rng(10 + player.floor * 2, 30 + player.floor * 4);
          setPlayer((p) => ({ ...p, gold: p.gold + g }));
          showFloat(`+${g}g`, "#d4a843");
          log(`Found ${g}g behind the wall!`, "loot");
        }
      } else {
        log("\u2592 Cracked wall... needs more force.", "system");
      }
      return;
    }
    if (tile === T.LOCKED) {
      const keyItem = player.inv.find((i) => i.effect === "key");
      if (keyItem) {
        setPlayer((p) => ({ ...p, inv: p.inv.filter((i) => i.id !== keyItem.id) }));
        setTile(ny, nx, T.FLOOR);
        SFX.chest();
        flash("loot");
        log("\u{1F511} Unlocked!", "loot");
        const g = rng(20 + player.floor * 3, 50 + player.floor * 5);
        setPlayer((p) => ({ ...p, gold: p.gold + g }));
        showFloat(`+${g}g`, "#d4a843");
      } else {
        log("\u{1F512} Locked! Need a key.", "danger");
        SFX.error();
      }
      return;
    }
    if (tile === T.PIT) {
      const d = rng(5 + player.floor, 15 + player.floor * 2);
      const willDie = player.hp - d <= 0;
      setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - d) }));
      log(`Pit! -${d}HP`, "danger");
      shk();
      mapReact("damage");
      showFloat(`-${d}`);
      if (willDie) setPendingDeath(true);
      return;
    }
    setPlayer((p) => ({ ...p, x: nx, y: ny }));
    setStats((p) => ({ ...p, steps: p.steps + 1 }));
    SFX.step();
    if (dx < 0) setLastDir("left");
    else if (dx > 0) setLastDir("right");
    setTrail((t) => [{ x: player.x, y: player.y }, ...t].slice(0, 5));
    const trailCol = TRAIL_PARTICLES[Math.min(getTier(player.floor) - 1, 9)];
    addParticles(1, trailCol + "88");
    setDun((d) => ({ ...d, revealed: revA(d.revealed, nx, ny, player.vr + player.torchB) }));
    let lethal = false;
    if (tile === T.TRAP) {
      const baseDmg = rng(4 + player.floor * 2, 10 + player.floor * 3);
      const trapMult = dun.subType === 3 ? 2 : 1;
      const d = baseDmg * trapMult;
      if (Math.random() < player.dex * 0.025) log("Disarmed a trap!", "info");
      else {
        SFX.trap();
        const willDie = player.hp - d <= 0;
        setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - d) }));
        log(`Trap! -${d}HP${trapMult > 1 ? " (gauntlet)" : ""}`, "danger");
        shk();
        mapReact("damage");
        showFloat(`-${d}`);
        if (willDie) {
          setPendingDeath(true);
          lethal = true;
        }
        if (!willDie && Math.random() < 0.25) {
          const loot = getChestLoot(player.floor);
          setPlayer((p) => ({ ...p, inv: [...p.inv, loot] }));
          log(`Found ${loot.icon} ${loot.name} in the wreckage!`, "loot");
        }
      }
      setTile(ny, nx, T.FLOOR);
    }
    if (tile === T.CHEST) {
      SFX.chest();
      flash("loot");
      addParticles(6, "#fa0");
      const isSubChest = !!subArea;
      const loot = getChestLoot(player.floor);
      const g = rng(5 + player.floor * 2, 12 + player.floor * 5) * (isSubChest ? 2 : 1);
      let bonusMsg = "";
      if (isSubChest && Math.random() < 0.4) {
        const statBonus = ["str", "dex", "int"][rng(0, 2)];
        const statName = statBonus.toUpperCase();
        setPlayer((p) => ({ ...p, [statBonus]: p[statBonus] + 1 }));
        bonusMsg = ` +1 ${statName} (Rune Fragment)!`;
      }
      setPlayer((p) => {
        let np = { ...p, inv: [...p.inv, loot], gold: p.gold + g };
        const cons = np.inv.filter((i) => i.type === "consumable");
        if (cons.length > 50) {
          cons.sort((a, b) => a.val - b.val);
          const ex = cons.length - 50;
          let sg = 0;
          for (let i = 0; i < ex; i++) {
            sg += Math.floor(cons[i].val / 2);
            np.inv = np.inv.filter((x) => x.id !== cons[i].id);
          }
          np.gold += sg;
          if (ex > 0) log(`Inv full! Auto-sold ${ex} items +${sg}g`, "info");
        }
        return np;
      });
      setStats((p) => ({ ...p, chests: p.chests + 1, totG: p.totG + g }));
      log(`Chest! ${loot.icon} ${loot.name} +${g}g${bonusMsg}`, "loot");
      showFloat(`+${g}g`, "#d4a843");
      setTile(ny, nx, T.FLOOR);
    }
    if (tile === T.FIRE || tile === T.LAVA) {
      const d = rng(3 + player.floor, 10 + player.floor * 2);
      const willDie = player.hp - d <= 0;
      setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - d) }));
      log(`${tile === T.LAVA ? "Lava" : "Fire"}! -${d}HP`, "danger");
      shk();
      mapReact("damage");
      showFloat(`-${d}`, "#f80");
      if (willDie) {
        setPendingDeath(true);
        lethal = true;
      }
    }
    if (tile === T.ICE && Math.random() < 0.3) {
      const d = rng(2, 6);
      setPlayer((p) => ({ ...p, hp: Math.max(1, p.hp - d) }));
      log(`Slipped! -${d}HP`, "danger");
      SFX.hazard();
    }
    if (tile === T.WATER) {
      const d = rng(1, 3 + Math.floor(player.floor * 0.3));
      setPlayer((p) => ({ ...p, hp: Math.max(1, p.hp - d), mp: Math.max(0, p.mp - 2) }));
      log(`Wading! -${d}HP -2MP`, "danger");
      SFX.hazard();
    }
    if (tile === T.VOID) {
      const d = rng(5 + player.floor, 15 + player.floor);
      const willDie = player.hp - d <= 0;
      setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - d), mp: Math.max(0, p.mp - 5) }));
      log(`Void! -${d}HP`, "danger");
      SFX.hazard();
      if (willDie) {
        setPendingDeath(true);
        lethal = true;
      }
    }
    if (lethal) return;
    if (tile === T.FOUNTAIN) {
      SFX.fountain();
      flash("heal");
      mapReact("heal");
      const h = rng(20, 40 + player.floor), m = rng(10, 25);
      setPlayer((p) => ({ ...p, hp: Math.min(p.maxHp, p.hp + h), mp: Math.min(p.maxMp, p.mp + m) }));
      log(`Fountain! +${h}HP +${m}MP`, "heal");
      showFloat(`+${h}HP`, "#4c6");
      setTile(ny, nx, T.FLOOR);
    }
    if (tile === T.FEATURE) {
      const fdc = dun.decor && dun.decor.get ? dun.decor.get(`${nx},${ny}`) : null;
      if (fdc) {
        SFX.chest();
        flash("loot");
        log(`\u2726 ${fdc.name}!`, "loot");
        if (fdc.eff === "gold_or_fight") {
          if (Math.random() < 0.5) {
            const g = rng(20 + player.floor * 3, 50 + player.floor * 5);
            setPlayer((p) => ({ ...p, gold: p.gold + g }));
            showFloat(`+${g}g`, "#d4a843");
            log(`Found ${g} gold!`, "loot");
          } else {
            const e = getEnemy(player.floor);
            log(`Ambush!`, "danger");
            startCombat(e);
            setTile(ny, nx, T.FLOOR);
            return;
          }
        } else if (fdc.eff === "heal_or_poison") {
          const h = rng(10, 25);
          setPlayer((p) => ({ ...p, hp: Math.min(p.maxHp, p.hp + h), poisoned: Math.random() < 0.1 ? true : p.poisoned }));
          showFloat(`+${h}HP`, "#4c6");
        } else if (fdc.eff === "gold") {
          const g = rng(15 + player.floor * 2, 40 + player.floor * 4);
          setPlayer((p) => ({ ...p, gold: p.gold + g }));
          showFloat(`+${g}g`, "#d4a843");
        } else if (fdc.eff === "xp") {
          const x = rng(10 + player.floor, 30 + player.floor * 2);
          setPlayer((p) => ({ ...p, xp: p.xp + x }));
          showFloat(`+${x}XP`, "#c4c");
        } else if (fdc.eff === "buff_atk") {
          setPlayer((p) => ({ ...p, str: p.str + 1 }));
          showFloat("+1 STR", "#fa8");
          log(fdc.msg || "+1 STR (permanent)!", "levelup");
        } else if (fdc.eff === "def") {
          setPlayer((p) => ({ ...p, baseDef: p.baseDef + (fdc.amt || 1) }));
          showFloat("+1 DEF", "#8ac");
          log(fdc.msg || "+1 DEF!", "levelup");
        } else if (fdc.eff === "hp" && fdc.amt === 0) {
          setPlayer((p) => ({ ...p, hp: p.maxHp, mp: p.maxMp }));
          showFloat("Restored!", "#4c6");
          log(fdc.msg || "Fully healed!", "heal");
        } else if (fdc.eff === "str") {
          setPlayer((p) => ({ ...p, str: p.str + (fdc.amt || 1) }));
          showFloat("+1 STR", "#fa8");
          log(fdc.msg || "+1 STR!", "levelup");
        } else if (fdc.eff === "item") {
          const loot = getChestLoot(player.floor);
          setPlayer((p) => ({ ...p, inv: [...p.inv, loot] }));
          log(`Found ${loot.icon} ${loot.name}!`, "loot");
        } else if (fdc.eff === "teleport") {
          const ri = rng(0, Math.max(0, dun.rooms.length - 1));
          const r = dun.rooms[ri];
          if (r) setPlayer((p) => ({ ...p, x: r.cx, y: r.cy }));
          log("Teleported!", "system");
        } else if (fdc.eff === "puzzle" && fdc.targetX >= 0 && fdc.targetY >= 0) {
          setTile(fdc.targetY, fdc.targetX, T.CHEST);
          SFX.portal();
          shk();
          log("\u{1F518} Click! Something opened nearby...", "loot");
        } else if (fdc.eff === "reveal") {
          setDun((d) => {
            const nr = d.map.map((row, y) => row.map((_, x) => true));
            return { ...d, revealed: nr };
          });
          log("Map revealed!", "loot");
        } else if (fdc.eff === "mp_full") {
          setPlayer((p) => ({ ...p, mp: p.maxMp, maxHp: Math.floor(p.maxHp * 0.9) }));
          showFloat("MP Full!", "#88f");
          log("Full MP \u2014 but max HP reduced 10%!", "danger");
        }
        setTile(ny, nx, T.FLOOR);
      }
    }
    {
      const cdc = dun.decor && dun.decor.get ? dun.decor.get(`${nx},${ny}`) : null;
      if (cdc && cdc.type === "corridor" && cdc.hazType) {
        if (cdc.hazType === "web" && Math.random() < 0.3) log("\u{1F578}\uFE0F Cobwebs slow you...", "system");
        if (cdc.hazType === "rocks" && Math.random() < 0.2) {
          const d = rng(2, 4);
          setPlayer((p) => ({ ...p, hp: Math.max(1, p.hp - d) }));
          log(`\u{1FAA8} Loose rocks! -${d}HP`, "danger");
        }
        if (cdc.hazType === "flames" && Math.random() < 0.3) {
          const d = rng(3, 6);
          setPlayer((p) => ({ ...p, hp: Math.max(1, p.hp - d) }));
          log(`\u{1F525} Wall flames! -${d}HP`, "danger");
        }
        if (cdc.hazType === "ice" && Math.random() < 0.25) {
          log("\u{1F9CA} You slide!", "system");
        }
        if (cdc.hazType === "bones" && Math.random() < 0.1) log("\u{1F9B4} Something crunches...", "system");
      }
    }
    {
      const cacheD = dun.decor && dun.decor.get ? dun.decor.get(`${nx},${ny}`) : null;
      if (cacheD && cacheD.type === "cache" && cacheD.gold) {
        SFX.chest();
        flash("loot");
        const g = cacheD.gold;
        setPlayer((p) => ({ ...p, gold: p.gold + g }));
        showFloat(`+${g}g`, "#d4a843");
        log(`Hidden cache! +${g}g`, "loot");
        if (dun.decor.delete) dun.decor.delete(`${nx},${ny}`);
      }
    }
    if (tile === T.LORE) {
      const ldc = dun.decor && dun.decor.get ? dun.decor.get(`${nx},${ny}`) : null;
      if (ldc && ldc.text) {
        SFX.chest();
        log(`\u{1F4DC} ${ldc.text}`, "lore");
        setLoreLog((p) => {
          if (p.some((e) => e.text === ldc.text)) return p;
          return [...p, { text: ldc.text, tier: ldc.tier || getTier(player.floor), floor: player.floor }];
        });
        setTile(ny, nx, T.FLOOR);
      }
    }
    if (tile === T.NPC) {
      const ndc = dun.decor && dun.decor.get ? dun.decor.get(`${nx},${ny}`) : null;
      if (ndc) {
        SFX.sanctuary();
        log(`${ndc.icon} ${ndc.name}: "${ndc.line}"`, "lore");
        if (Math.random() < 0.3) {
          const g = rng(10, 30 + player.floor * 2);
          setPlayer((p) => ({ ...p, gold: p.gold + g }));
          log(`${ndc.name} gave you ${g} gold.`, "loot");
          showFloat(`+${g}g`, "#d4a843");
        }
        setTile(ny, nx, T.FLOOR);
      }
    }
    if (tile === T.ECHO) {
      const edc = dun.decor && dun.decor.get ? dun.decor.get(`${nx},${ny}`) : null;
      if (edc && edc.text) {
        SFX.boss();
        log(`\u{1F441}\uFE0F Erebus: "${edc.text}"`, "lore");
        shk();
        setTile(ny, nx, T.FLOOR);
      }
    }
    if (tile === T.SHOP) {
      SFX.buy();
      const s = sancShop || genShopStock(player.floor, player.cls);
      if (!sancShop) setSancShop(s);
      setShop(s);
      log(`${s.icon} ${s.name}: "Browse my wares!"`, "system");
      return;
    }
    if (tile === T.BARRIER) {
      const guardian = getBarrierGuardian(player.floor);
      SFX.boss();
      log(`\u26A0\uFE0F ${guardian.name} blocks the way!`, "danger");
      startCombat({ ...guardian, barrierX: nx, barrierY: ny });
      return;
    }
    if (tile === T.PORTAL) {
      if (subArea) {
        let pd = { ...subArea.parentDun, map: subArea.parentDun.map.map((r) => [...r]) };
        if (subArea.entrancePos) {
          pd.map[subArea.entrancePos.y][subArea.entrancePos.x] = T.FLOOR;
        }
        setDun(pd);
        setPlayer((p) => ({ ...p, x: subArea.parentPos.x, y: subArea.parentPos.y }));
        setWand(subArea.parentWand || []);
        setSubArea(null);
        SFX.portal();
        flash("heal");
        log("\u{1F52E} Returned \u2014 portal sealed behind you.", "system");
        return;
      } else {
        const sub = genSubArea(player.floor);
        sub.revealed = revA(sub.revealed, sub.start.x, sub.start.y, player.vr + player.torchB);
        const parentWand = [...wand];
        setSubArea({ parentDun: dun, parentPos: { x: player.x, y: player.y }, parentWand, entrancePos: { x: nx, y: ny } });
        setDun(sub);
        setPlayer((p) => ({ ...p, x: sub.start.x, y: sub.start.y }));
        const subEnemies = [];
        const seCount = sub.subType === 2 ? 1 : rng(2, 4);
        for (let i = 0; i < seCount; i++) {
          const e = getEnemy(player.floor);
          const se = { ...e, name: `${sub.subType === 1 ? "Vault" : "Shadow"} ${e.name}`, hp: Math.floor(e.hp * 1.3), maxHp: Math.floor(e.hp * 1.3), atk: Math.floor(e.atk * 1.2), xp: Math.floor(e.xp * 1.5), gold: Math.floor(e.gold * 2) };
          for (let a = 0; a < 30; a++) {
            const px = rng(1, MW - 2), py = rng(1, MH - 2);
            if (sub.map[py] && sub.map[py][px] === T.FLOOR && !(px === sub.start.x && py === sub.start.y)) {
              se.x = px;
              se.y = py;
              subEnemies.push(se);
              break;
            }
          }
        }
        setWand(subEnemies);
        SFX.portal();
        flash("loot");
        log(`\u{1F52E} Entered ${sub.fc.name}!`, "system");
        return;
      }
    }
    if (tile === T.STAIRS) {
      if (subArea) {
        log("Find the portal \u2295 to exit!", "system");
        return;
      }
      if (!inSanc && bossAlive) {
        const boss = player.floor % 10 === 0 ? getMegaBoss(player.floor) : getFloorBoss(player.floor);
        startCombat(boss);
        return;
      }
      nextFloor();
      return;
    }
    if (subArea && dun.hasMini && dun.bossPos && nx === dun.bossPos.x && ny === dun.bossPos.y) {
      const mini = getMiniBoss(player.floor);
      startCombat(mini);
      return;
    }
    if (!inSanc && !subArea && bossAlive && dun.bossPos && nx === dun.bossPos.x && ny === dun.bossPos.y) {
      const boss = player.floor % 10 === 0 ? getMegaBoss(player.floor) : getFloorBoss(player.floor);
      startCombat(boss);
      return;
    }
    const hit = wand.find((e) => e.x === nx && e.y === ny);
    if (hit) {
      startCombat(hit);
      return;
    }
    if (player.int > 15) {
      for (const [sx, sy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
        const ax = nx + sx, ay = ny + sy;
        if (ax >= 0 && ax < MW && ay >= 0 && ay < MH && dun.map[ay][ax] === T.SECRET && Math.random() < 0.15 + player.int * 5e-3) {
          setTile(ay, ax, T.FLOOR);
          SFX.chest();
          flash("loot");
          addParticles(4, "#d4f");
          const g = rng(10 + player.floor * 2, 30 + player.floor * 4);
          setPlayer((p) => ({ ...p, gold: p.gold + g }));
          log(`\u{1F52E} Secret passage! +${g}g`, "loot");
          break;
        }
      }
    }
    const mpRegen = player.cls === "mage" ? 2 : 1;
    if (player.mp < player.maxMp) setPlayer((p) => ({ ...p, mp: Math.min(p.maxMp, p.mp + mpRegen) }));
    if (player.poisoned) setPlayer((p) => ({ ...p, hp: Math.max(1, p.hp - 2) }));
    if (!inSanc) moveW();
    if (!inSanc && !subArea && Math.random() < 0.03) {
      const ev = FLOOR_EVENTS[rng(0, FLOOR_EVENTS.length - 1)];
      log(`\u2728 ${ev.msg}`, "system");
      if (ev.eff === "hp") setPlayer((p) => ({ ...p, hp: Math.min(p.maxHp, p.hp + ev.amt) }));
      else if (ev.eff === "mp") setPlayer((p) => ({ ...p, mp: Math.min(p.maxMp, p.mp + ev.amt) }));
      else if (ev.eff === "gold") setPlayer((p) => ({ ...p, gold: p.gold + ev.amt + player.floor }));
      else if (ev.eff === "xp") setPlayer((p) => ({ ...p, xp: p.xp + ev.amt + player.floor }));
      else if (ev.eff === "loot") {
        const loot = getChestLoot(player.floor);
        setPlayer((p) => ({ ...p, inv: [...p.inv, loot] }));
        log(`Found ${loot.icon} ${loot.name}!`, "loot");
      }
    }
  }, [player, dun, combat, menu, shop, wand, bossAlive, inSanc, subArea, sancShop, nextFloor, startCombat, moveW, log, shk, setTile, flash, addParticles, showFloat, mapReact]);
  const [completedQuests, setCompletedQuests] = useState(() => /* @__PURE__ */ new Set());
  const saveGame = useCallback((slot) => {
    const sl = slot || activeSlot;
    const saveDun = subArea ? { ...subArea.parentDun } : { ...dun };
    const saveWand = subArea ? subArea.parentWand || [] : wand;
    const savePlayer = subArea ? { ...player, x: subArea.parentPos.x, y: subArea.parentPos.y } : player;
    const data = { player: savePlayer, dun: saveDun, wand: saveWand, stats, eLog, bossAlive, inSanc, lastSanc, completedQuests: [...completedQuests], armory, ts: Date.now() };
    if (subArea) {
      setDun(subArea.parentDun);
      setPlayer((p) => ({ ...p, x: subArea.parentPos.x, y: subArea.parentPos.y }));
      setWand(subArea.parentWand || []);
      setSubArea(null);
      log("Returned from hidden area (save)", "system");
    }
    setSave((prev) => {
      const ns = [...prev];
      ns[sl] = data;
      return ns;
    });
    try {
      localStorage.setItem(`dos_slot${sl}`, JSON.stringify(data));
    } catch (e) {
    }
    log(`Saved to slot ${sl}!`, "system");
  }, [player, dun, wand, stats, eLog, bossAlive, inSanc, lastSanc, completedQuests, armory, activeSlot, subArea, log]);
  const loadGame = useCallback((slot) => {
    const sl = slot || activeSlot;
    const s = save[sl] || (() => {
      try {
        const d = localStorage.getItem(`dos_slot${sl}`);
        return d ? JSON.parse(d) : null;
      } catch (e) {
        return null;
      }
    })();
    if (!s) return;
    setActiveSlot(sl);
    setPlayer(s.player);
    setDun(s.dun);
    setWand(s.wand);
    setStats(s.stats);
    setELog(s.eLog || []);
    setBossAlive(s.bossAlive);
    setInSanc(s.inSanc);
    setLastSanc(s.lastSanc);
    if (s.completedQuests) setCompletedQuests(new Set(s.completedQuests));
    if (s.armory) setArmory(s.armory);
    setSubArea(null);
    setCombat(null);
    setMenu(null);
    setPendingDeath(false);
    setCInv(false);
    setSancShop(null);
    log("Loaded!", "system");
  }, [save, activeSlot, log]);
  useEffect(() => {
    const h = (e) => {
      if (screen !== "game") return;
      const k = e.key.toLowerCase();
      if (shop) {
        if (e.key === "Escape") setShop(null);
        return;
      }
      if (combat) {
        if (combat.phase === "won" && (e.key === "Enter" || e.key === " ")) claimWin();
        if (combat.phase === "lost" && (e.key === "Enter" || e.key === " ")) handleDeath();
        if (combat.phase === "player") {
          if (k === "a") pAtk();
          else if (k === "f") flee();
          else if (k === "i") setCInv((c) => !c);
          else if (k >= "1" && k <= "5") {
            const si = parseInt(k) - 1;
            if (player.unlocked[si]) pAtk(player.unlocked[si]);
          }
        }
        return;
      }
      if (menu) {
        if (e.key === "Escape") setMenu(null);
        return;
      }
      const moveKeys = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };
      if (moveKeys[e.key]) {
        e.preventDefault();
        move(...moveKeys[e.key]);
        return;
      }
      const isMove = "wasd".includes(k) || e.key.startsWith("Arrow");
      if (!isMove) {
        if (k === keybinds.inv) setMenu((x) => x === "inv" ? null : "inv");
        else if (k === keybinds.stats) setMenu((x) => x === "stats" ? null : "stats");
        else if (k === keybinds.quests) setMenu((x) => x === "obj" ? null : "obj");
        else if (k === keybinds.armory) setMenu((x) => x === "armory" ? null : "armory");
      }
      if (e.key === "Escape") setMenu(null);
      if (e.key === "F9") {
        e.preventDefault();
        saveGame();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [screen, combat, menu, shop, move, claimWin, handleDeath, keybinds, saveGame, pAtk, flee]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [eLog]);
  useEffect(() => {
    if (cLogRef.current) cLogRef.current.scrollTop = cLogRef.current.scrollHeight;
  }, [cLog]);
  const prevMenu = useRef(null);
  useEffect(() => {
    if (menu && !prevMenu.current) SFX.menuOpen();
    else if (!menu && prevMenu.current) SFX.menuClose();
    prevMenu.current = menu;
  }, [menu]);
  useEffect(() => {
    if (combat?.phase === "won") SFX.victory();
  }, [combat?.phase]);
  const qCheckRef = useRef(0);
  useEffect(() => {
    if (!player) return;
    const st = { ...stats, floor: player.floor, level: player.level, cls: player.cls, maxHp: player.maxHp, maxMp: player.maxMp, dex: player.dex };
    let xpGain = 0;
    const newIds = [];
    OBJ.forEach((o) => {
      if (!completedQuests.has(o.id) && o.c(st)) {
        newIds.push(o.id);
        xpGain += o.xp;
        log(`\u{1F4DC} Quest complete: ${o.text} +${o.xp}xp`, "levelup");
      }
    });
    if (newIds.length > 0 && newIds.length !== qCheckRef.current) {
      qCheckRef.current = newIds.length;
      SFX.questComplete();
      setCompletedQuests((prev) => {
        const ns = new Set(prev);
        newIds.forEach((id) => ns.add(id));
        return ns;
      });
      setPlayer((p) => ({ ...p, xp: p.xp + xpGain }));
    }
    ACHIEVEMENTS.forEach((a) => {
      if (!achievements.includes(a.id) && a.c(st)) {
        setAchievements((p) => [...p, a.id]);
        log(`\u{1F3C6} Achievement: ${a.name}!`, "levelup");
      }
    });
  }, [stats.kills, stats.chests, player?.floor, player?.level]);
  useEffect(() => {
    if (player && dun && screen === "game" && !subArea) {
      const data = { player, dun: { ...dun }, wand, stats, eLog, bossAlive, inSanc, lastSanc, completedQuests: [...completedQuests], armory, ts: Date.now() };
      setSave((prev) => {
        const ns = [...prev];
        ns[activeSlot] = data;
        return ns;
      });
      try {
        localStorage.setItem(`dos_slot${activeSlot}`, JSON.stringify(data));
      } catch (e) {
      }
    }
    ;
  }, [player?.floor, inSanc, stats.kills, bossAlive]);
  const computed = useMemo(() => player ? calcStats(player) : null, [player]);
  useEffect(() => {
    if (!settings.music) {
      BGM.stop();
      return;
    }
    if (screen === "title" || screen === "story") {
      BGM.play(0, false, "title");
      return;
    }
    if (screen === "game" && player) {
      if (combat) {
        BGM.play(0, false, combat.enemy?.isBoss ? "bossCombat" : "combat");
        return;
      }
      if (subArea) BGM.play(getTier(player.floor), false);
      else BGM.play(getTier(player.floor), inSanc);
      return;
    }
    BGM.stop();
  }, [screen, player?.floor, inSanc, subArea, settings.music, !!combat]);
  useEffect(() => {
    if (!player || !settings.sfx || combat) return;
    if (player.hp > 0 && player.hp / player.maxHp < 0.25) {
      const iv = setInterval(() => SFX.heartbeat(), 1800);
      return () => clearInterval(iv);
    }
  }, [player?.hp, player?.maxHp, settings.sfx, !!combat]);
  const fc = dun?.fc || (inSanc ? SANC_CONFIG : FLOOR_CONFIGS[0]);
  const logCol = (t) => ({ danger: "#e54", heal: "#4c6", loot: "#ea3", victory: "#d4a843", levelup: "#c4c", system: "#58c", lore: "#c9a84c" })[t] || "#667";
  const recW = useMemo(() => {
    if (!player) return null;
    const b = getBestEquip(player, armory);
    return b.weapon && b.weapon.id !== player.equipped.weapon?.id ? b.weapon : null;
  }, [player, armory]);
  const recA = useMemo(() => {
    if (!player) return null;
    const b = getBestEquip(player, armory);
    return b.armor && b.armor.id !== player.equipped.armor?.id ? b.armor : null;
  }, [player, armory]);
  const hasRec = recW || recA;
  const enemyMap = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    wand.forEach((e) => m.set(`${e.x},${e.y}`, e));
    return m;
  }, [wand]);
  const trailSet = useMemo(() => {
    const s = /* @__PURE__ */ new Set();
    trail.forEach((t, i) => s.add(`${t.x},${t.y}:${i}`));
    return { set: s, map: new Map(trail.map((t, i) => [`${t.x},${t.y}`, i])) };
  }, [trail]);
  const weatherParts = useMemo(() => {
    if (!player) return [];
    const ti = Math.min(getTier(player.floor) - 1, 9);
    const w = BIOME_WEATHER[ti];
    if (!w || inSanc) return [];
    const parts = [];
    const animMap = { dust: "weatherDrift", drip: "weatherFall", ash: "weatherFall", snow: "weatherDrift", mist: "weatherFloat", void: "weatherPulse", stars: "weatherPulse" };
    const anim = animMap[w.type] || "weatherFall";
    const seed = player.floor * 137;
    for (let i = 0; i < w.count; i++) {
      const x = (seed + i * 31) % 97;
      const y = (seed + i * 47) % 83;
      const dur = 3 + (seed + i * 13) % 5;
      const delay = (seed + i * 7) % 30 / 10;
      parts.push({ id: i, x, y, dur, delay, anim, sz: w.type === "snow" || w.type === "stars" ? 3 : w.type === "mist" ? 8 : 2 });
    }
    return parts;
  }, [player?.floor, inSanc]);
  const viewDX0 = isDesk ? 18 : 11;
  const viewDY0 = isDesk ? 12 : 8;
  const cols0 = viewDX0 * 2 + 1;
  const rows0 = viewDY0 * 2 + 1;
  const ts0 = isDesk ? Math.max(16, Math.min(52, Math.floor(Math.min(winSize.w * 0.92 / cols0, winSize.h * 0.92 / rows0)) - 2)) : settings.tileSize;
  const uiS0 = isDesk ? Math.max(1, Math.min(2.5, ts0 / 16)) : 1;
  const mmS = isDesk ? Math.max(3, Math.floor(uiS0 * 3)) : 2.2;
  const miniDots = useMemo(() => {
    if (!settings.minimap || !dun) return [];
    const dots = [];
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      if (!dun.revealed[y] || !dun.revealed[y][x]) continue;
      let c = "#181818";
      const t = dun.map[y][x];
      if (t === T.FLOOR || t === T.TRAP) c = fc.floor;
      else if (t === T.STAIRS) c = "#0d8";
      else if (t === T.CHEST) c = "#ea0";
      else if (t === T.FOUNTAIN) c = "#48f";
      else if (t === T.SHOP) c = "#fa0";
      else if (t === T.PORTAL) c = "#d4f";
      else if (t === T.BARRIER) c = "#f84";
      else if (t === T.FEATURE) c = "#d4a843";
      else if (t === T.LORE) c = "#c9a84c";
      else if (t === T.NPC) c = "#8cf";
      else if (t === T.ECHO) c = "#ffd700";
      else if (t === T.LOCKED) c = "#fa0";
      else if (t === T.CRACKED) c = "#887755";
      else if (t === T.WALL) c = fc.wall;
      if (player && x === player.x && y === player.y) c = "#ffd700";
      dots.push(/* @__PURE__ */ React.createElement("div", { key: `${x}-${y}`, style: { position: "absolute", left: x * mmS, top: y * mmS, width: mmS, height: mmS, background: c } }));
    }
    if (bossAlive && dun.bossPos) {
      dots.push(/* @__PURE__ */ React.createElement("div", { key: "boss", style: { position: "absolute", left: dun.bossPos.x * mmS - 1, top: dun.bossPos.y * mmS - 1, width: mmS + 2, height: mmS + 2, background: "#f22", borderRadius: "50%", animation: "glow 1s infinite", zIndex: 2 } }));
    }
    return dots;
  }, [dun, player?.x, player?.y, settings.minimap, mmS, fc, bossAlive]);
  const btnS = { padding: "7px 12px", background: "#111119", border: "1px solid #2a2a3a", color: "#888", borderRadius: 7, fontSize: 10, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", touchAction: "manipulation" };
  const fullScreen = (bg, ch) => /* @__PURE__ */ React.createElement("div", { style: { width: "100vw", height: "100dvh", overflow: "hidden", background: "#000" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", marginLeft: "env(safe-area-inset-left,0px)", marginRight: "env(safe-area-inset-right,0px)", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", userSelect: "none", padding: 24 } }, ch));
  const LORE_TIPS = ["The Hollow Kingdom mined Luminite for 300 years before they dug too deep.", "Erebus was once the kingdom's most brilliant sorcerer.", "The Heart of Shadow was waiting on Floor 100 \u2014 as if it had always been waiting.", "Queen Tiamat traded her people's humanity to save their lives.", "The ice gardens of Floor 51-60 were once the most beautiful place underground.", "Malachar, the undead priest, still believes he is preserving knowledge.", "The void research labs on Floor 61-70 were sealed by royal decree.", "Ignatius Rex cannot stop the fire. He IS the fire.", "Azathoth sleeps. The entire tier is its nightmare.", "Ten lieutenants guard the Depths. Each was once human."];
  const loreTip = useMemo(() => LORE_TIPS[Math.floor(Math.random() * LORE_TIPS.length)], [screen]);
  const hasWon = useMemo(() => {
    try {
      return localStorage.getItem("dos_victory") === "1";
    } catch (e) {
      return false;
    }
  }, [screen]);
  if (screen === "title") return fullScreen(hasWon ? "radial-gradient(ellipse at 50% 35%,#2a2410,#1a1408 40%,#0c0c14 65%)" : "radial-gradient(ellipse at 50% 35%,#1e1a10,#0c0c14 65%)", /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, color: "#d4a843", textShadow: "0 0 30px #d4a84333", letterSpacing: 4, textAlign: "center", lineHeight: 1.2, fontFamily: "'Cinzel',serif" } }, "DEPTHS OF", /* @__PURE__ */ React.createElement("br", null), "SHADOW"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", letterSpacing: 5, marginTop: 10, fontFamily: "'JetBrains Mono',monospace" } }, "A DUNGEON CRAWLER"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#555", marginTop: 14, textAlign: "center", fontStyle: "italic", maxWidth: 300, lineHeight: 1.5, fontFamily: "'JetBrains Mono',monospace" } }, loreTip), /* @__PURE__ */ React.createElement("div", { style: { width: "60%", height: 1, background: "linear-gradient(90deg,transparent,#d4a84344,transparent)", margin: "18px 0" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 240 } }, /* @__PURE__ */ React.createElement("button", { style: { padding: "14px 0", background: "#1a1508", border: "1px solid #8b691466", color: "#d4a843", borderRadius: 8, fontSize: 14, letterSpacing: 3, fontFamily: "'Cinzel',serif", cursor: "pointer" }, onClick: () => setScreen("story") }, "NEW GAME"), [1, 2, 3].map((sl) => {
    const s = save[sl];
    return s ? /* @__PURE__ */ React.createElement("div", { key: sl, style: { display: "flex", gap: 4 } }, /* @__PURE__ */ React.createElement("button", { style: { flex: 1, padding: "10px 0", background: "#111119", border: "1px solid #2a2a3a", color: "#888", borderRadius: 8, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", cursor: "pointer", textAlign: "center" }, onClick: () => {
      setActiveSlot(sl);
      loadGame(sl);
      setScreen("game");
    } }, "SLOT ", sl, " \u2014 ", s.player?.name, " F", s.player?.floor, " Lv", s.player?.level, " \u{1F4B0}", s.player?.gold), /* @__PURE__ */ React.createElement("button", { style: { padding: "10px 8px", background: "#111119", border: "1px solid #2a2a3a", color: "#644", borderRadius: 8, fontSize: 10, cursor: "pointer" }, onClick: (e) => {
      e.stopPropagation();
      if (confirm(`Delete slot ${sl}?`)) {
        setSave((p) => {
          const ns = [...p];
          delete ns[sl];
          return ns;
        });
        try {
          localStorage.removeItem(`dos_slot${sl}`);
        } catch (e2) {
        }
      }
    } }, "\u2715")) : null;
  }))));
  const STORY_PAGES = [
    { icon: "\u{1F3F0}", title: "The Hollow Kingdom", text: "For three hundred years, the Hollow Kingdom thrived underground, mining Luminite \u2014 a magical ore of extraordinary power. The deeper they dug, the more potent the crystals. And the more dangerous the things they woke." },
    { icon: "\u{1F451}", title: "The Fall of Erebus", text: "Fifty years ago, court sorcerer Erebus led an expedition to Floor 100, seeking the Heart of Shadow \u2014 a Luminite crystal of unimaginable power. He found it. It consumed him. His corruption spread upward, floor by floor. The kingdom fell." },
    { icon: "\u2694\uFE0F", title: "Your Mission", text: "The seal is weakening. Shadow creatures leak into the surface. The survivors send one last champion into the Depths \u2014 not to mine, but to descend all 100 floors and destroy Erebus before his darkness swallows the world above. That champion is you." }
  ];
  if (screen === "story") {
    const pg = STORY_PAGES[storyPage] || STORY_PAGES[0];
    const isLast = storyPage >= STORY_PAGES.length - 1;
    return fullScreen("radial-gradient(ellipse at 50% 30%,#1e1a10,#0c0c14 70%)", /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 40, marginBottom: 12 } }, pg.icon), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, color: "#d4a843", letterSpacing: 3, fontFamily: "'Cinzel',serif", textAlign: "center", marginBottom: 16 } }, pg.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#999", lineHeight: 1.8, textAlign: "center", maxWidth: 380, fontFamily: "'JetBrains Mono',monospace" } }, pg.text), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 8 } }, STORY_PAGES.map((_, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { width: 8, height: 8, borderRadius: "50%", background: i === storyPage ? "#d4a843" : "#333" } }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, marginTop: 24 } }, /* @__PURE__ */ React.createElement("button", { style: { padding: "10px 24px", background: "#1a1508", border: "1px solid #d4a84444", color: "#d4a843", borderRadius: 8, fontSize: 12, letterSpacing: 2, fontFamily: "'Cinzel',serif", cursor: "pointer" }, onClick: () => {
      if (isLast) {
        setStoryPage(0);
        setScreen("classSelect");
      } else setStoryPage((p) => p + 1);
    } }, isLast ? "BEGIN" : "NEXT \u2192"), /* @__PURE__ */ React.createElement("button", { style: { padding: "10px 16px", background: "transparent", border: "1px solid #3333", color: "#555", borderRadius: 8, fontSize: 10, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace" }, onClick: () => {
      setStoryPage(0);
      setScreen("classSelect");
    } }, "Skip"))));
  }
  if (screen === "classSelect") return /* @__PURE__ */ React.createElement("div", { style: { width: "100vw", height: "100dvh", overflow: "hidden", background: "#000" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", marginLeft: "env(safe-area-inset-left,0px)", marginRight: "env(safe-area-inset-right,0px)", overflow: "auto", background: "#0c0c14", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 16px", userSelect: "none" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#d4a843", letterSpacing: 4, marginBottom: 8, fontFamily: "'Cinzel',serif" } }, "CHOOSE CLASS"), /* @__PURE__ */ React.createElement("input", { type: "text", value: charName, onChange: (e) => setCharName(e.target.value.slice(0, 16)), placeholder: "Enter name (optional)", style: { width: "100%", maxWidth: 280, padding: "8px 12px", background: "#111119", border: "1px solid #2a2a3a", borderRadius: 8, color: "#d4a843", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", textAlign: "center", marginBottom: 10, outline: "none" } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#555", marginBottom: 16 } }, "Saving to Slot ", activeSlot), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 340 } }, Object.entries(CLASSES).map(([k, c]) => {
    const backstory = { warrior: "The Last Knight. Sent by the remnants of the kingdom's military. Fights out of duty.", mage: "The Scholar's Apprentice. Your master joined Erebus' expedition and never returned.", thief: "The Survivor. An orphan of the collapse. No one sent you \u2014 no one else would go." }[k];
    return /* @__PURE__ */ React.createElement("button", { key: k, onClick: () => startGame(k), style: { padding: 14, textAlign: "left", display: "flex", gap: 12, alignItems: "center", background: "#111119", border: "1px solid #2a2a3a", borderRadius: 10, cursor: "pointer", color: "#c8c8d0", fontFamily: "'JetBrains Mono',monospace" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 30, width: 40, textAlign: "center" } }, c.icon), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#d4a843", fontFamily: "'Cinzel',serif" } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#777", lineHeight: 1.4 } }, c.desc), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#6a6a5a", marginTop: 2, fontStyle: "italic", lineHeight: 1.4 } }, backstory), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#4a4a5a", marginTop: 4 } }, "HP:", c.hp, " MP:", c.mp, " STR:", c.str, " DEX:", c.dex, " INT:", c.int)));
  })), /* @__PURE__ */ React.createElement("button", { style: { marginTop: 18, ...btnS }, onClick: () => setScreen("title") }, "\u2190 Back")));
  if (screen === "respawn") return fullScreen("radial-gradient(ellipse at center,#0a1828,#0c0c14 65%)", /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 40 } }, "\u{1F3D5}\uFE0F"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, color: "#66bbee", letterSpacing: 3, fontFamily: "'Cinzel',serif" } }, "SANCTUARY RESPAWN"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#999", marginTop: 10, textAlign: "center", lineHeight: 1.6, fontStyle: "italic", maxWidth: 320 } }, "Something pulled you back. The fight isn't over."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#888", marginTop: 8, textAlign: "center", lineHeight: 1.8, fontFamily: "'JetBrains Mono',monospace" } }, "Fell on Floor ", player?.floor, ".", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#c84" } }, "-25% gold, -30% XP")), /* @__PURE__ */ React.createElement("button", { style: { marginTop: 24, padding: "12px 28px", background: "#0a1828", border: "1px solid #6be4", color: "#6be", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "'Cinzel',serif", letterSpacing: 2 }, onClick: respawn }, "RESPAWN")));
  if (screen === "gameOver") return fullScreen("radial-gradient(ellipse at center,#2a0808,#0c0c14 65%)", /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 44 } }, "\u{1F480}"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, color: "#c33", letterSpacing: 4, fontFamily: "'Cinzel',serif" } }, "YOU DIED"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#888", marginTop: 10, textAlign: "center", lineHeight: 1.6, fontStyle: "italic", maxWidth: 320 } }, "The shadow grows deeper. But the seal holds \u2014 for now."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", marginTop: 8, fontFamily: "'JetBrains Mono',monospace" } }, "F", player?.floor, " \xB7 Lv", player?.level, " \xB7 ", stats.kills, " kills"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#444", marginTop: 6, textAlign: "center", maxWidth: 280 } }, eLog.slice(-3).filter((e) => e.ty === "danger").map((e) => e.m).join(" \u2192 ") || "Fell to the darkness."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#555", marginTop: 4 } }, "Time: ", Math.floor(gameTime / 60), "m ", gameTime % 60, "s"), /* @__PURE__ */ React.createElement("button", { style: { marginTop: 24, padding: "12px 28px", background: "#1a0808", border: "1px solid #a336", color: "#c44", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "'Cinzel',serif" }, onClick: () => setScreen("classSelect") }, "Try Again"), save[activeSlot] && /* @__PURE__ */ React.createElement("button", { style: { marginTop: 8, ...btnS }, onClick: () => {
    loadGame();
    setScreen("game");
  } }, "Load Slot ", activeSlot)));
  if (screen === "victory") return fullScreen("radial-gradient(ellipse at center,#1a1a08,#0c0c14 65%)", /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 48 } }, "\u{1F451}"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, color: "#d4a843", letterSpacing: 4, fontFamily: "'Cinzel',serif", marginTop: 8 } }, "VICTORY"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#999", marginTop: 8, textAlign: "center", lineHeight: 1.8, fontStyle: "italic", maxWidth: 320 } }, "The Heart of Shadow pulses before you. It offers everything.", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#d4a843" } }, "You walk away.")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#aaa", marginTop: 12, textAlign: "center", lineHeight: 1.8, fontStyle: "italic", maxWidth: 340 } }, player?.cls === "warrior" ? "The Warrior sheathes their blade. The kingdom has no more need of soldiers. For the first time, that feels like peace." : player?.cls === "mage" ? "The Mage closes the forbidden tome. Some knowledge is better left in the dark. They finally understand what their master could not." : "The Thief pockets one small Luminite shard \u2014 enough to sell, enough to survive. Old habits. They smile. The surface has never looked so bright."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#777", marginTop: 8, textAlign: "center", fontStyle: "italic" } }, settings.difficulty === "hard" ? "They walked through fire and shadow, and the fire learned to flinch." : settings.difficulty === "easy" ? "The path was gentle. The darkness was not." : "The Depths remember their name."), /* @__PURE__ */ React.createElement("div", { style: { width: "80%", maxWidth: 280, height: 1, background: "linear-gradient(90deg,transparent,#d4a84344,transparent)", margin: "14px 0" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px", fontSize: 10, fontFamily: "'JetBrains Mono',monospace" } }, [["Name", player?.name], ["Level", player?.level], ["Difficulty", settings.difficulty], ["Enemies", stats.kills], ["Steps", stats.steps], ["Gold", stats.totG]].map(([l, v]) => /* @__PURE__ */ React.createElement("div", { key: l, style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#666" } }, l), /* @__PURE__ */ React.createElement("span", { style: { color: "#d4a843" } }, v)))), /* @__PURE__ */ React.createElement("button", { style: { marginTop: 16, ...btnS, borderColor: "#d4a8434", color: "#d4a843", padding: "12px 28px" }, onClick: () => {
    try {
      localStorage.setItem("dos_victory", "1");
    } catch (e) {
    }
    setScreen("title");
  } }, "Return to Title"), /* @__PURE__ */ React.createElement("button", { style: { marginTop: 6, ...btnS, borderColor: "#fa06", color: "#fa0", padding: "10px 24px", fontSize: 10 }, onClick: () => {
    try {
      localStorage.setItem("dos_victory", "1");
    } catch (e) {
    }
    const ng = ngPlus + 1;
    setNgPlus(ng);
    setCharName(player?.name || "");
    setScreen("classSelect");
    log(`\u{1F31F} New Game+ (cycle ${ng}) \u2014 enemies are ${10 + ng * 10}% stronger!`, "system");
  } }, "\u{1F31F} New Game+ (Cycle ", ngPlus + 1, ")")));
  if (!player || !dun) return null;
  const vr = player.vr + player.torchB;
  const viewDX = viewDX0;
  const viewDY = viewDY0;
  const ts = ts0;
  const uiS = uiS0;
  const mapRows = [];
  const br = !inSanc && !subArea && dun.rooms ? dun.rooms[dun.bri || dun.rooms.length - 1] : null;
  const curTier = getTier(player.floor);
  for (let dy = -viewDY; dy <= viewDY; dy++) {
    const row = [];
    for (let dx = -viewDX; dx <= viewDX; dx++) {
      const mx = player.x + dx, my = player.y + dy;
      const isP = dx === 0 && dy === 0;
      const inB = mx >= 0 && mx < MW && my >= 0 && my < MH;
      const vis = inB && dun.revealed[my] && dun.revealed[my][mx];
      const dist2 = dx * dx + dy * dy;
      const inFov = dist2 <= vr * vr;
      const enemy = enemyMap.get(`${mx},${my}`);
      const isBoss = !inSanc && !subArea && bossAlive && dun.bossPos && mx === dun.bossPos.x && my === dun.bossPos.y;
      const isMini = subArea && dun.hasMini && dun.bossPos && mx === dun.bossPos.x && my === dun.bossPos.y;
      const tile = inB ? dun.map[my][mx] : T.WALL;
      const s = tR(tile, fc, vis, inFov, curTier);
      if (vis && inFov) {
        const dist = Math.sqrt(dist2);
        s.o = dist <= 1 ? 1 : Math.max(0.5, 1 - dist / vr * 0.5);
      } else if (vis) {
        s.o = 0.2;
      }
      if (tile === T.WALL && vis && inB) {
        const adjF = [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([dx2, dy2]) => {
          const ax = mx + dx2, ay = my + dy2;
          return ax >= 0 && ax < MW && ay >= 0 && ay < MH && dun.map[ay][ax] !== T.WALL && dun.map[ay][ax] !== T.SECRET;
        });
        if (adjF) s.color = fc.wall + "dd";
      }
      const dc = inB && dun.decor && dun.decor.get ? dun.decor.get(`${mx},${my}`) : null;
      const inBossRoom = br && mx >= br.x && mx < br.x + br.w && my >= br.y && my < br.y + br.h;
      if (inBossRoom && tile === T.FLOOR && vis) {
        s.color = bossAlive ? "#4a2828" : "#2a3828";
        s.g = bossAlive ? "0 0 2px #a002" : void 0;
      }
      if (isP) {
        const sz = Math.max(ts - 2, 8);
        row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { margin: "auto" } }, /* @__PURE__ */ React.createElement(PlayerChar, { sz, cls: player?.cls || "warrior", equipped: player?.equipped, poisoned: player?.poisoned, facing: lastDir, hitReact: mapHitReact }))));
      } else if (enemy && vis && inFov) row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0, fontSize: ts - 3, color: enemy.isChampion ? "#fa0" : "#f44", textShadow: enemy.isChampion ? "0 0 6px #fa08, 0 0 12px #fa04" : "0 0 4px #f006" } }, enemy.icon));
      else if (isMini && vis && inFov) row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0, fontSize: ts - 1, color: "#d4f", textShadow: "0 0 8px #d4f8", animation: "glow 1.2s infinite" } }, "\u{1F479}"));
      else if (isBoss && vis && inFov) row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0, fontSize: ts - 1, color: player.floor % 10 === 0 ? "#f26" : "#f64", textShadow: `0 0 8px ${player.floor % 10 === 0 ? "#f268" : "#f648"}`, animation: "glow 1.2s infinite" } }, player.floor % 10 === 0 ? "\u{1F451}" : "\u{1F479}"));
      else if (dc && vis && inFov && (dc.type === "obj" || dc.type === "center" || dc.type === "pillar")) row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0, fontSize: ts - 2, opacity: s.o, lineHeight: 1 } }, dc.icon));
      else if (dc && vis && inFov && dc.type === "feature") row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0, fontSize: ts - 2, opacity: s.o, lineHeight: 1, textShadow: "0 0 4px #d4a84366" } }, dc.icon));
      else if (dc && vis && inFov && dc.type === "theme") row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0, fontSize: ts - 3, opacity: s.o * 0.6, lineHeight: 1 } }, dc.icon));
      else if (dc && vis && inFov && dc.type === "torch") row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0, fontSize: ts - 3, opacity: s.o, lineHeight: 1, animation: "torchFlicker 1.2s infinite" } }, dc.icon));
      else if (dc && vis && inFov && dc.type === "corridor" && dc.icon !== "\xB7") row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0, fontSize: ts - 4, opacity: s.o * 0.4, lineHeight: 1 } }, dc.icon));
      else if (dc && dc.type === "scatter" && vis && inFov && dc.icon !== "\xB7") row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0, fontSize: ts, color: s.color, opacity: s.o * 0.5, textShadow: s.g, lineHeight: 1, fontFamily: "'JetBrains Mono',monospace", position: "relative" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: ts - 4, position: "absolute", top: 0, left: 0, right: 0, opacity: 0.3 } }, dc.icon), s.ch));
      else {
        const tAnim = tile === T.LAVA ? "lavaPulse 2s infinite" : tile === T.WATER ? "waterShimmer 3s infinite" : tile === T.VOID && inFov ? "voidRotate 8s linear infinite" : void 0;
        const trailIdx = trailSet.map.get(`${mx},${my}`);
        const hasTrail = trailIdx !== void 0 && vis && inFov && tile === T.FLOOR && !isP;
        const tTitle = isDesk && inFov ? { [T.STAIRS]: "Stairs", [T.CHEST]: "Chest", [T.FOUNTAIN]: "Fountain", [T.SHOP]: "Shop", [T.PORTAL]: "Portal", [T.BARRIER]: "Barrier", [T.FEATURE]: "Feature", [T.LORE]: "Lore", [T.NPC]: "NPC", [T.ECHO]: "Echo", [T.LOCKED]: "Locked", [T.CRACKED]: "Cracked wall", [T.TRAP]: "Trap", [T.PIT]: "Pit", [T.FIRE]: "Fire", [T.LAVA]: "Lava", [T.ICE]: "Ice", [T.WATER]: "Water", [T.VOID]: "Void" }[tile] : void 0;
        row.push(/* @__PURE__ */ React.createElement("td", { key: dx, title: tTitle, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0, fontSize: ts, color: hasTrail ? fc.accent + "44" : s.color, opacity: s.o, textShadow: s.g, lineHeight: 1, fontFamily: "'JetBrains Mono',monospace", animation: tAnim, position: hasTrail ? "relative" : void 0 } }, hasTrail ? "\xB7" : s.ch));
      }
    }
    mapRows.push(/* @__PURE__ */ React.createElement("tr", { key: dy }, row));
  }
  return /* @__PURE__ */ React.createElement("div", { style: { width: "100vw", height: "100dvh", overflow: "hidden", background: "#000", position: "relative", userSelect: "none" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 0, bottom: 0, left: "env(safe-area-inset-left,0px)", right: "env(safe-area-inset-right,0px)", overflow: "hidden", background: fc.bg, color: "#c8c8d0", fontFamily: "'JetBrains Mono',monospace", filter: settings.colorblind ? "contrast(1.3) saturate(1.4)" : "none" } }, /* @__PURE__ */ React.createElement("style", null, `:root{--ac:${fc.accent};}`), /* @__PURE__ */ React.createElement(
    "div",
    {
      style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", animation: shaking ? "shake .2s" : inSanc ? "sancP 4s infinite" : "none" },
      onTouchStart: (e) => {
        if (combat || menu || shop || moralChoice) return;
        const t = e.touches[0];
        touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
      },
      onTouchEnd: (e) => {
        if (!touchStart.current || combat || menu || shop || moralChoice) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStart.current.x, dy = t.clientY - touchStart.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const elapsed = Date.now() - touchStart.current.time;
        touchStart.current = null;
        if (dist < 30 || elapsed > 500) return;
        if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0);
        else move(0, dy > 0 ? 1 : -1);
      }
    },
    /* @__PURE__ */ React.createElement("table", { key: `${player.x},${player.y}`, style: { borderCollapse: "collapse", animation: "fadeUp .06s ease" }, onClick: (e) => {
      if (combat || menu || shop || moralChoice) return;
      const td = e.target.closest("td");
      if (!td) return;
      const tr = td.parentNode;
      const table = tr.parentNode;
      const ci = Array.from(tr.children).indexOf(td);
      const ri = Array.from(table.children).indexOf(tr);
      const halfW = Math.floor((player.vr + player.torchB) * 2 + 1) / 2;
      const halfH = halfW;
      const dx2 = ci - Math.floor(halfW);
      const dy2 = ri - Math.floor(halfH);
      if (dx2 === 0 && dy2 === 0) return;
      if (Math.abs(dx2) >= Math.abs(dy2)) move(dx2 > 0 ? 1 : -1, 0);
      else move(0, dy2 > 0 ? 1 : -1);
    } }, /* @__PURE__ */ React.createElement("tbody", null, mapRows))
  ), vfx.flash && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", animation: "dmgFlash .3s forwards", background: vfx.flash === "damage" ? "rgba(255,40,40,.15)" : vfx.flash === "heal" ? "rgba(40,255,100,.12)" : "rgba(255,200,40,.12)" } }), vfx.particles.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "50%", left: "50%", zIndex: 4, pointerEvents: "none" } }, vfx.particles.map((p) => /* @__PURE__ */ React.createElement("div", { key: p.id, style: { position: "absolute", width: 6, height: 6, borderRadius: "50%", background: p.color, boxShadow: `0 0 4px ${p.color}`, animation: `particle ${p.dur}s ease-out forwards`, "--px": `${p.px}px`, "--py": `${p.py}px` } }))), floatNums.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "50%", left: "50%", zIndex: 5, pointerEvents: "none" } }, floatNums.map((f) => /* @__PURE__ */ React.createElement("div", { key: f.id, style: { position: "absolute", fontSize: 14, fontWeight: "bold", color: f.color, fontFamily: "'JetBrains Mono',monospace", textShadow: "0 1px 4px #000", animation: "floatUp 1s ease-out forwards", whiteSpace: "nowrap" } }, f.text))), weatherParts.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" } }, weatherParts.map((p) => {
    const ti = Math.min(getTier(player.floor) - 1, 9);
    const w = BIOME_WEATHER[ti];
    return /* @__PURE__ */ React.createElement("div", { key: p.id, style: { position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: p.sz, height: p.sz, borderRadius: "50%", background: w.color, animation: `${p.anim} ${p.dur}s ${p.delay}s linear infinite` } });
  })), moralChoice && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.7)", backdropFilter: "blur(2px)" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#111119", border: "1px solid #d4a84344", borderRadius: 12, padding: 20, maxWidth: 300, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#d4a843", marginBottom: 12, fontStyle: "italic", lineHeight: 1.6 } }, moralChoice.prompt), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, [moralChoice.a, moralChoice.b].map((opt, i) => /* @__PURE__ */ React.createElement("button", { key: i, style: { ...btnS, flex: 1, padding: "10px 8px", fontSize: 11, color: i === 0 ? "#4c8" : "#c84", borderColor: i === 0 ? "#4c86" : "#c846" }, onClick: () => {
    log(`\u2696\uFE0F ${opt.msg}`, "lore");
    if (opt.eff === "xp") setPlayer((p) => ({ ...p, xp: p.xp + opt.amt }));
    else if (opt.eff === "gold") setPlayer((p) => ({ ...p, gold: p.gold + opt.amt }));
    else if (opt.eff === "hp") setPlayer((p) => ({ ...p, hp: p.maxHp, mp: p.maxMp }));
    else if (opt.eff === "str") setPlayer((p) => ({ ...p, str: p.str + opt.amt }));
    else if (opt.eff === "def") setPlayer((p) => ({ ...p, baseDef: p.baseDef + opt.amt }));
    else if (opt.eff === "loot") {
      const g = rng(20 + player.floor * 3, 60 + player.floor * 5);
      setPlayer((p) => ({ ...p, gold: p.gold + g }));
      showFloat(`+${g}g`, "#d4a843");
    } else if (opt.eff === "risk") {
      const d = rng(5, Math.floor(player.maxHp * 0.2));
      setPlayer((p) => ({ ...p, hp: Math.max(1, p.hp - d), str: p.str + 1 }));
      log(`-${d} HP but +1 STR`, "danger");
    } else if (opt.eff === "sacrifice") {
      const d = Math.floor(player.maxHp * 0.15);
      setPlayer((p) => ({ ...p, hp: Math.max(1, p.hp - d), int: p.int + 2 }));
      log(`-${d} HP but +2 INT`, "danger");
    } else if (opt.eff === "safe") log("Wisdom in caution.", "system");
    SFX.questComplete();
    setMoralChoice(null);
  } }, opt.label))))), !specialization && player.level >= 15 && SPECIALIZATIONS[player.cls] && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.7)", backdropFilter: "blur(2px)" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#111119", border: "1px solid #fa06", borderRadius: 12, padding: 20, maxWidth: 320, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: "#fa0", letterSpacing: 2, marginBottom: 4, fontFamily: "'Cinzel',serif" } }, "SPECIALIZE"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 12 } }, "Choose your path at Level 15"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, SPECIALIZATIONS[player.cls].map((sp) => /* @__PURE__ */ React.createElement("button", { key: sp.name, style: { ...btnS, flex: 1, padding: "12px 8px", fontSize: 11, color: "#fa0", borderColor: "#fa06", textAlign: "center" }, onClick: () => {
    setSpecialization(sp);
    if (sp.eff === "berserker") setPlayer((p) => ({ ...p, str: p.str + Math.floor(p.str * 0.2) }));
    else if (sp.eff === "guardian") setPlayer((p) => ({ ...p, baseDef: p.baseDef + Math.floor(p.baseDef * 0.2), maxHp: p.maxHp + 50, hp: p.hp + 50 }));
    else if (sp.eff === "elementalist") setPlayer((p) => ({ ...p, int: p.int + Math.floor(p.int * 0.25) }));
    else if (sp.eff === "arcanist") setPlayer((p) => ({ ...p, baseMaxMp: p.baseMaxMp + 40, maxMp: p.maxMp + 40, mp: p.mp + 40 }));
    else if (sp.eff === "assassin") setPlayer((p) => ({ ...p, dex: p.dex + Math.floor(p.dex * 0.15), str: p.str + 3 }));
    else if (sp.eff === "shadow") setPlayer((p) => ({ ...p, dex: p.dex + Math.floor(p.dex * 0.25), vr: p.vr + 3 }));
    log(`\u{1F31F} Specialized: ${sp.name}! ${sp.desc}`, "levelup");
    SFX.levelUp();
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: "bold" } }, sp.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#888", marginTop: 4 } }, sp.desc)))))), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: isDesk ? 12 : 4, left: isDesk ? 12 : 4, zIndex: 10, display: "flex", alignItems: "center", gap: isDesk ? 8 : 5, pointerEvents: "none" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: isDesk ? Math.round(10 * uiS) : 8, color: fc.accent, textShadow: `0 0 6px ${fc.accent}44` } }, fc.icon, " F", player.floor), /* @__PURE__ */ React.createElement("div", { style: { width: isDesk ? Math.round(110 * uiS) : 90 } }, /* @__PURE__ */ React.createElement(Bar, { cur: player.hp, max: player.maxHp, color: "#c33", h: isDesk ? Math.round(11 * uiS) : 8 })), player.mp < player.maxMp && /* @__PURE__ */ React.createElement("div", { style: { width: isDesk ? Math.round(80 * uiS) : 60 } }, /* @__PURE__ */ React.createElement(Bar, { cur: player.mp, max: player.maxMp, color: "#36c", h: isDesk ? Math.round(9 * uiS) : 6 })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: isDesk ? Math.round(9 * uiS) : 7, color: "#555" } }, "Lv", player.level)), isDesk && dun && !combat && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: 16, left: 16, zIndex: 8, fontSize: 9, color: "#444", pointerEvents: "none" } }, (() => {
    let total = 0, seen = 0;
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      if (dun.map[y][x] !== T.WALL) {
        total++;
        if (dun.revealed[y] && dun.revealed[y][x]) seen++;
      }
    }
    return `Explored: ${total > 0 ? Math.round(seen / total * 100) : 0}%`;
  })()), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: isDesk ? 16 : 6, right: isDesk ? 16 : 6, zIndex: 20 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setMenu((m) => m ? null : "stats"), style: { width: isDesk ? Math.round(40 * uiS) : 42, height: isDesk ? Math.round(40 * uiS) : 42, borderRadius: 10, background: "rgba(14,14,22,.65)", border: `1px solid ${fc.accent}33`, color: menu ? fc.accent : "#888", fontSize: isDesk ? Math.round(18 * uiS) : 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)", touchAction: "manipulation", position: "relative" } }, menu ? "\u2715" : "\u2630", hasRec && !menu && /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", top: 3, right: 3, width: 7, height: 7, borderRadius: "50%", background: "#4c6", animation: "recB 1.5s infinite" } }))), settings.minimap && !menu && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: isDesk ? Math.round(56 * uiS) : 48, right: isDesk ? 16 : 6, zIndex: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { width: MW * mmS + 2, height: MH * mmS + 2, background: "rgba(6,6,12,.55)", border: `1px solid ${fc.wall}33`, borderRadius: 4, overflow: "hidden", position: "relative" } }, miniDots)), inSanc && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", padding: "3px 12px", background: "rgba(30,60,80,.35)", border: "1px solid #48a3", borderRadius: 8, fontSize: 9, color: "#6bd", zIndex: 10, backdropFilter: "blur(4px)" } }, "\u{1F3D5}\uFE0F SANCTUARY"), subArea && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", padding: "3px 12px", background: "rgba(80,30,80,.35)", border: "1px solid #d4f3", borderRadius: 8, fontSize: 9, color: "#d8f", zIndex: 10, backdropFilter: "blur(4px)" } }, "\u{1F52E} ", dun?.fc?.name || "Hidden Area"), !inSanc && !subArea && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", padding: "3px 10px", background: `rgba(20,20,30,.4)`, border: `1px solid ${fc.accent}22`, borderRadius: 8, fontSize: 9, color: bossAlive ? "#d46" : fc.accent, zIndex: 10, backdropFilter: "blur(4px)" } }, bossAlive ? player.floor % 10 === 0 ? "\u{1F451} " : "\u{1F479} " : fc.icon + " ", fc.name), floorTrans && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.8)", animation: "fadeUp .3s ease", pointerEvents: "none" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 36 } }, floorTrans.icon), floorTrans.tierName && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#d4a843", letterSpacing: 4, fontFamily: "'Cinzel',serif", marginTop: 12, textTransform: "uppercase" } }, floorTrans.tierName), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, color: floorTrans.tierName ? "#fff" : "#d4a843", letterSpacing: 3, fontFamily: "'Cinzel',serif", marginTop: floorTrans.tierName ? 4 : 8 } }, "Floor ", floorTrans.floor), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#888", marginTop: 4, fontFamily: "'JetBrains Mono',monospace" } }, floorTrans.name), floorTrans.intro && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#999", marginTop: 12, fontStyle: "italic", textAlign: "center", maxWidth: 320, lineHeight: 1.6, fontFamily: "'Cinzel',serif" } }, '"', floorTrans.intro, '"'), floorTrans.floor % 10 === 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#f44", letterSpacing: 3, marginTop: 10, animation: "glow 1s infinite" } }, "\u26A0\uFE0F MEGA BOSS AWAITS")), /* @__PURE__ */ React.createElement("div", { ref: logRef, className: "scr", style: { position: "absolute", bottom: isDesk ? 16 : 140, left: isDesk ? 16 : 6, maxWidth: isDesk ? Math.round(280 * uiS) : 180, maxHeight: isDesk ? Math.round(50 * uiS) : 32, overflowY: "auto", zIndex: 8, pointerEvents: "none" } }, eLog.slice(isDesk ? -5 : -3).map((e, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { fontSize: isDesk ? Math.round(10 * uiS) : 7, color: logCol(e.ty), opacity: i === Math.min(eLog.length - 1, isDesk ? 4 : 2) ? 1 : 0.4, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: "0 1px 4px #000" } }, e.m))), !isDesk && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: 6, right: 6, zIndex: 15 } }, /* @__PURE__ */ React.createElement(DPad, { accent: fc.accent, onDir: move, combatActive: !!combat || !!shop || !!menu || !!floorTrans })), !combat && !menu && !shop && (() => {
    const hpPot = player.inv.find((i) => i.effect === "hp");
    const mpPot = player.inv.find((i) => i.effect === "mp");
    const hpCount = player.inv.filter((i) => i.effect === "hp").length;
    const mpCount = player.inv.filter((i) => i.effect === "mp").length;
    if (!hpPot && !mpPot) return null;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: isDesk ? 16 : 140, right: isDesk ? 16 : 6, zIndex: 12, display: "flex", gap: 4 } }, hpPot && /* @__PURE__ */ React.createElement("button", { style: { width: 36, height: 36, borderRadius: 8, background: "rgba(14,14,22,.7)", border: "1px solid #c3344", color: "#c33", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", backdropFilter: "blur(2px)" }, onClick: () => useItem(hpPot, false) }, "\u2764\uFE0F", /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", bottom: -2, right: -2, fontSize: 8, color: "#888", background: "#111", borderRadius: 4, padding: "0 3px" } }, hpCount)), mpPot && /* @__PURE__ */ React.createElement("button", { style: { width: 36, height: 36, borderRadius: 8, background: "rgba(14,14,22,.7)", border: "1px solid #36c4", color: "#36c", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", backdropFilter: "blur(2px)" }, onClick: () => useItem(mpPot, false) }, "\u{1F499}", /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", bottom: -2, right: -2, fontSize: 8, color: "#888", background: "#111", borderRadius: 4, padding: "0 3px" } }, mpCount)));
  })(), menu && /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", background: "#060810", animation: "fadeUp .15s" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 0, borderBottom: `1px solid ${fc.accent}22`, background: "rgba(12,12,20,.98)", overflowX: "auto", flexShrink: 0 }, className: "scr" }, [["stats", "\u{1F4CA}"], ["inv", "\u{1F392}"], ["armory", "\u{1F3DB}\uFE0F"], ["obj", "\u{1F4DC}"], ["guide", "\u{1F4D6}"], ["lorelog", "\u{1F4DC}"], ["bestiary", "\u{1F4D5}"], ["achieve", "\u{1F3C6}"], ["log", "\u{1F4CB}"], ["settings", "\u2699\uFE0F"]].map(([k, icon]) => /* @__PURE__ */ React.createElement("button", { key: k, onClick: () => setMenu(k), style: { padding: isDesk ? "10px 16px" : "8px 10px", background: menu === k ? `${fc.accent}15` : "transparent", borderBottom: menu === k ? `2px solid ${fc.accent}` : "2px solid transparent", color: menu === k ? fc.accent : "#555", fontSize: isDesk ? 14 : 16, cursor: "pointer", border: "none", outline: "none", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap", flexShrink: 0 } }, icon)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("button", { onClick: () => setMenu(null), style: { padding: "8px 14px", background: "transparent", border: "none", color: "#888", fontSize: 18, cursor: "pointer" } }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "scr", style: { flex: 1, overflowY: "auto", padding: isDesk ? "24px 28px" : "16px 14px" }, onClick: (e) => e.stopPropagation() }, menu === "stats" && (() => {
    const eqW = player.equipped.weapon;
    const eqA = player.equipped.armor;
    const pct = Math.round(player.xp / xpFor(player.level) * 100);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#d4a843", letterSpacing: 2, textAlign: "center", marginBottom: 4, fontFamily: "'Cinzel',serif" } }, player.icon, " ", player.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#666", textAlign: "center", marginBottom: 14 } }, "Level ", player.level, " ", player.cls.charAt(0).toUpperCase() + player.cls.slice(1), " \xB7 Floor ", player.floor, "/100 \xB7 Tier ", getTier(player.floor)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 } }, /* @__PURE__ */ React.createElement(Bar, { cur: player.hp, max: player.maxHp, color: "#c33", label: "HP", h: 14 }), /* @__PURE__ */ React.createElement(Bar, { cur: player.mp, max: player.maxMp, color: "#36c", label: "MP", h: 14 }), /* @__PURE__ */ React.createElement(Bar, { cur: player.xp, max: xpFor(player.level), color: "#74a", label: "XP", h: 10 }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#555", textAlign: "right" } }, pct, "% to Level ", player.level + 1)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: fc.accent, letterSpacing: 2, marginBottom: 6, borderBottom: `1px solid ${fc.accent}22`, paddingBottom: 4 } }, "ATTRIBUTES"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 12px", fontSize: 12, marginBottom: 14 } }, [["STR", player.str, "#d94", "\u2694\uFE0F"], ["DEX", player.dex, "#4c8", "\u{1F3F9}"], ["INT", player.int, "#a8e", "\u{1F52E}"], ["ATK", computed?.atk, "#e84", "\u{1F4A5}"], ["DEF", computed?.def, "#8ac", "\u{1F6E1}\uFE0F"], ["VIS", `${player.vr + player.torchB}/${player.vr + 3}`, "#8df", "\u{1F441}"], ["Gold", player.gold, "#d4a843", "\u{1F4B0}"]].map(([l, v, c, ic]) => /* @__PURE__ */ React.createElement("div", { key: l, style: { background: "#0e0e1a", borderRadius: 8, padding: "8px 10px", border: "1px solid #1e1e2e", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: "#555", marginBottom: 2 } }, ic, " ", l), /* @__PURE__ */ React.createElement("div", { style: { color: c, fontSize: 14, fontWeight: "bold" } }, v)))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#c64", letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #c6422", paddingBottom: 4 } }, "EQUIPPED"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 14, fontSize: 11 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#0e0e1a", borderRadius: 6, border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("span", null, "\u{1F5E1}\uFE0F"), /* @__PURE__ */ React.createElement("span", { style: { color: eqW ? "#ddd" : "#444", flex: 1 } }, eqW ? `${eqW.icon} ${eqW.name}` : "None"), eqW && /* @__PURE__ */ React.createElement("span", { style: { color: "#c64", fontSize: 9 } }, "+", eqW.atk, "ATK")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#0e0e1a", borderRadius: 6, border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("span", null, "\u{1F6E1}\uFE0F"), /* @__PURE__ */ React.createElement("span", { style: { color: eqA ? "#ddd" : "#444", flex: 1 } }, eqA ? `${eqA.icon} ${eqA.name}` : "None"), eqA && /* @__PURE__ */ React.createElement("span", { style: { color: "#68c", fontSize: 9 } }, "+", eqA.def, "DEF"))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#6a7", letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #6a72", paddingBottom: 4 } }, "SKILLS"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 } }, player.unlocked.map((s) => /* @__PURE__ */ React.createElement("span", { key: s, style: { padding: "4px 10px", background: "#0a140e", border: "1px solid #4c63", borderRadius: 6, fontSize: 10, color: "#8c8" } }, "\u2726 ", s)), player.skills.filter((s) => !player.unlocked.includes(s)).map((s, idx) => {
      const unlockLvls = [1, 4, 8, 14, 22];
      const si = player.skills.indexOf(s);
      return /* @__PURE__ */ React.createElement("span", { key: s, style: { padding: "4px 10px", background: "#0c0c16", border: "1px solid #1e1e2e", borderRadius: 6, fontSize: 10, color: "#333" } }, "\u{1F512} ", s, " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#444" } }, "Lv", unlockLvls[si] || "?"));
    })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #2224", paddingBottom: 4 } }, "JOURNEY"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 14px", fontSize: 10 } }, [["Enemies slain", stats.kills], ["Chests opened", stats.chests], ["Steps walked", stats.steps], ["Mega bosses", stats.megaK], ["Total gold earned", stats.totG], ["Respawn point", lastSanc > 0 ? `F${lastSanc}` : "None"]].map(([l, v]) => /* @__PURE__ */ React.createElement("div", { key: l, style: { display: "flex", justifyContent: "space-between", padding: "3px 0" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#444" } }, l), /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, v)))), statPoints > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#c4c", letterSpacing: 2, marginTop: 14, marginBottom: 6, borderBottom: "1px solid #c4c2", paddingBottom: 4 } }, "ALLOCATE POINTS (", statPoints, ")"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" } }, [["STR", "str", "#d94"], ["DEX", "dex", "#4c8"], ["INT", "int", "#a8e"], ["DEF", "baseDef", "#8ac"]].map(([label, key, color]) => /* @__PURE__ */ React.createElement("button", { key, style: { ...btnS, fontSize: 10, padding: "6px 12px", color, borderColor: color + "66" }, onClick: () => {
      setPlayer((p) => ({ ...p, [key]: p[key] + 1 }));
      setStatPoints((sp) => sp - 1);
      log(`+1 ${label}!`, "levelup");
    } }, "+1 ", label)))), (() => {
      const availablePerks = [];
      for (let l = 10; l <= 50; l += 10) {
        const pi = l / 10 - 1;
        if (player.level >= l && pi < PERKS.length && !passives.some((p) => p.level === l)) availablePerks.push({ level: l, options: PERKS[pi] });
      }
      if (availablePerks.length === 0) return null;
      return /* @__PURE__ */ React.createElement(React.Fragment, null, availablePerks.map((ap) => /* @__PURE__ */ React.createElement("div", { key: ap.level }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#fa0", letterSpacing: 2, marginTop: 14, marginBottom: 6, borderBottom: "1px solid #fa02", paddingBottom: 4 } }, "\u{1F31F} PERK \u2014 Level ", ap.level), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, ap.options.map((opt) => /* @__PURE__ */ React.createElement("button", { key: opt.name, style: { ...btnS, flex: 1, fontSize: 10, padding: "8px 6px", color: "#fa0", borderColor: "#fa06", textAlign: "center" }, onClick: () => {
        setPassives((p) => [...p, { ...opt, level: ap.level }]);
        if (opt.eff === "str") setPlayer((p) => ({ ...p, str: p.str + opt.amt }));
        else if (opt.eff === "dex") setPlayer((p) => ({ ...p, dex: p.dex + opt.amt }));
        else if (opt.eff === "int") setPlayer((p) => ({ ...p, int: p.int + opt.amt }));
        else if (opt.eff === "def") setPlayer((p) => ({ ...p, baseDef: p.baseDef + opt.amt }));
        else if (opt.eff === "mp") setPlayer((p) => ({ ...p, baseMaxMp: p.baseMaxMp + opt.amt, maxMp: p.maxMp + opt.amt, mp: p.mp + opt.amt }));
        else if (opt.eff === "hp_pct") setPlayer((p) => {
          const bonus = Math.floor(p.maxHp * opt.amt / 100);
          return { ...p, maxHp: p.maxHp + bonus, hp: p.hp + bonus };
        });
        else if (opt.eff === "allstats") setPlayer((p) => ({ ...p, str: p.str + opt.amt, dex: p.dex + opt.amt, int: p.int + opt.amt, baseDef: p.baseDef + opt.amt }));
        log(`\u{1F31F} Perk: ${opt.name}!`, "levelup");
        SFX.levelUp();
      } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: "bold" } }, opt.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: "#888", marginTop: 2 } }, opt.desc)))))));
    })(), CLASSES[player.cls]?.passive && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#6a6a5a", marginTop: 14, fontStyle: "italic" } }, "\u{1F6E1}\uFE0F Passive: ", CLASSES[player.cls].passive), passives.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#fa0", letterSpacing: 2, marginTop: 10, marginBottom: 4 } }, "PERKS"), passives.map((p) => /* @__PURE__ */ React.createElement("div", { key: p.level, style: { fontSize: 9, color: "#888", padding: "2px 0" } }, "Lv", p.level, ": ", p.name, " \u2014 ", p.desc))), player.equipped.accessory && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#0e0e1a", borderRadius: 6, border: "1px solid #1e1e2e", marginTop: 8, fontSize: 11 } }, /* @__PURE__ */ React.createElement("span", null, "\u{1F48D}"), /* @__PURE__ */ React.createElement("span", { style: { color: "#ddd", flex: 1 } }, player.equipped.accessory.icon, " ", player.equipped.accessory.name), /* @__PURE__ */ React.createElement("span", { style: { color: "#c9a84c", fontSize: 9 } }, player.equipped.accessory.desc || "")));
  })(), menu === "inv" && (() => {
    const cons = player.inv.filter((i) => i.type === "consumable");
    const stacks = {};
    cons.forEach((c) => {
      const k = c.name;
      if (!stacks[k]) stacks[k] = { ...c, count: 0, ids: [] };
      stacks[k].count++;
      stacks[k].ids.push(c.id);
    });
    const stackList = Object.values(stacks);
    const sortOrder = { hp: 0, mp: 1, cure: 2, full: 3, revive: 4, damage: 5, vision: 6, speed: 7, shield: 8, warp: 9, key: 10, perm_str: 11, perm_dex: 12, perm_int: 13 };
    stackList.sort((a, b) => (sortOrder[a.effect] ?? 99) - (sortOrder[b.effect] ?? 99));
    const totalSellVal = cons.reduce((s, c) => s + Math.floor(c.val / 2), 0);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, color: "#d4a843", letterSpacing: 2, textAlign: "center", marginBottom: 10, fontFamily: "'Cinzel',serif" } }, "INVENTORY ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "#666" } }, "(", cons.length, ")")), stackList.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, borderBottom: "1px solid #46c2", paddingBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "#4a8", letterSpacing: 2 } }, "CONSUMABLES"), cons.length > 3 && /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 8, padding: "2px 8px", color: "#d4a843", borderColor: "#d4a84344" }, onClick: () => {
      setPlayer((p) => ({ ...p, inv: p.inv.filter((i) => i.type !== "consumable"), gold: p.gold + totalSellVal }));
      SFX.sell();
      log(`Sold all consumables +${totalSellVal}g`, "info");
    } }, "Sell All (", totalSellVal, "g)")), stackList.map((stack) => /* @__PURE__ */ React.createElement("div", { key: stack.name, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: "#0c0c16", borderRadius: 8, border: "1px solid #1e1e2e", marginBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#ccc" } }, stack.icon, " ", stack.name), stack.count > 1 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: fc.accent, marginLeft: 5, fontWeight: "bold" } }, "\xD7", stack.count), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#555", fontSize: 9 } }, { hp: "Restores HP", mp: "Restores MP", cure: "Cures poison", vision: "Extends vision range", damage: "Deals damage in combat", full: "Full HP & MP restore", revive: "Auto-revive on death", speed: "Temporary +DEX", shield: "Temporary +DEF", warp: "Teleport to sanctuary", key: "Opens locked doors", perm_str: "+1 STR permanent", perm_dex: "+1 DEX permanent", perm_int: "+1 INT permanent" }[stack.effect] || stack.effect, stack.amt > 0 ? ` (+${stack.amt})` : "")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, alignItems: "center" } }, /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 9, padding: "3px 10px", color: "#4a8" }, onClick: () => {
      const item = player.inv.find((i) => i.name === stack.name);
      if (item) useItem(item);
    } }, "Use"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 9, padding: "3px 8px", color: "#d4a843" }, onClick: () => {
      const item = player.inv.find((i) => i.name === stack.name);
      if (item) {
        const v = Math.floor(item.val / 2);
        setPlayer((p) => ({ ...p, inv: p.inv.filter((i) => i.id !== item.id), gold: p.gold + v }));
        log(`Sold ${item.name} ${v}g`, "info");
      }
    } }, "Sell 1"), stack.count > 1 && /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 8, padding: "3px 6px", color: "#c64" }, onClick: () => {
      const ids = player.inv.filter((i) => i.name === stack.name).map((i) => i.id);
      const val = ids.reduce((s, id) => {
        const it = player.inv.find((i) => i.id === id);
        return s + Math.floor((it?.val || 0) / 2);
      }, 0);
      setPlayer((p) => ({ ...p, inv: p.inv.filter((i) => !ids.includes(i.id)), gold: p.gold + val }));
      log(`Sold ${ids.length}\xD7 ${stack.name} +${val}g`, "info");
    } }, "Sell All"))))), cons.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: "#333", textAlign: "center", padding: 20, fontSize: 12 } }, "No consumables \u2014 gear is stored in the Armory"));
  })(), menu === "obj" && (() => {
    const st = { ...stats, floor: player.floor, level: player.level, cls: player.cls, maxHp: player.maxHp, maxMp: player.maxMp, dex: player.dex };
    const done = OBJ.filter((o) => o.c(st)).length;
    const cats = [["explore", "\u{1F5FA}\uFE0F Exploration"], ["combat", "\u2694\uFE0F Combat"], ["progress", "\u{1F4C8} Progression"], ["wealth", "\u{1F4B0} Wealth"]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#d4a843", letterSpacing: 2, textAlign: "center", marginBottom: 4, fontFamily: "'Cinzel',serif" } }, "QUESTS"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", textAlign: "center", marginBottom: 14 } }, done, "/", OBJ.length, " completed"), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", marginBottom: 14 } }, /* @__PURE__ */ React.createElement(Bar, { cur: done, max: OBJ.length, color: "#d4a843", label: "", h: 6 })), cats.map(([cat, label]) => {
      const items = OBJ.filter((o) => o.cat === cat);
      const catDone = items.filter((o) => o.c(st)).length;
      return /* @__PURE__ */ React.createElement("div", { key: cat, style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, borderBottom: "1px solid #2224", paddingBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "#888", letterSpacing: 1 } }, label), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "#555" } }, catDone, "/", items.length)), items.map((o) => {
        const ok = o.c(st);
        return /* @__PURE__ */ React.createElement("div", { key: o.id, style: { display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", marginBottom: 2, borderRadius: 6, background: ok ? "rgba(68,204,102,.05)" : "transparent" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, width: 20, textAlign: "center" } }, ok ? "\u2705" : "\u2B1C"), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontSize: 11, color: ok ? "#4c6" : "#777", textDecoration: ok ? "line-through" : "none" } }, o.text), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: ok ? "#4c6" : "#444" } }, "+", o.xp, "xp"));
      }));
    }));
  })(), menu === "lorelog" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#c9a84c", letterSpacing: 2, textAlign: "center", marginBottom: 10, fontFamily: "'Cinzel',serif" } }, "\u{1F4DC} LORE LOG"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", textAlign: "center", marginBottom: 10 } }, loreLog.length, "/30 entries discovered"), loreLog.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#444", textAlign: "center", padding: 20 } }, "No lore discovered yet. Look for \u{1F4DC} tiles on the map."), Array.from({ length: 10 }).map((_, ti) => {
    const tierEntries = loreLog.filter((e) => e.tier === ti + 1);
    if (tierEntries.length === 0) return null;
    return /* @__PURE__ */ React.createElement("div", { key: ti, style: { marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: fc.accent, letterSpacing: 2, borderBottom: `1px solid ${fc.accent}22`, paddingBottom: 3, marginBottom: 4 } }, "TIER ", ti + 1, " \u2014 ", tierEntries.length, "/3"), tierEntries.map((e, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { fontSize: 10, color: "#999", fontStyle: "italic", padding: "4px 0", lineHeight: 1.5 } }, '"', e.text, '"')));
  })), menu === "bestiary" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#f44", letterSpacing: 2, textAlign: "center", marginBottom: 10, fontFamily: "'Cinzel',serif" } }, "\u{1F4D5} BESTIARY"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", textAlign: "center", marginBottom: 10 } }, "Enemies encountered: ", Object.keys(stats.seen || {}).length), Object.entries(stats.seen || {}).map(([name, data]) => /* @__PURE__ */ React.createElement("div", { key: name, style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: "rgba(20,20,30,.3)", borderRadius: 6, marginBottom: 3 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16 } }, data.icon), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#ccc" } }, name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#666" } }, BESTIARY_FLAVOR[name] || "A denizen of the depths."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: "#444" } }, "Killed: ", data.kills || 0)))), Object.keys(stats.seen || {}).length === 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#444", textAlign: "center", padding: 20 } }, "No enemies encountered yet.")), menu === "achieve" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#fa0", letterSpacing: 2, textAlign: "center", marginBottom: 10, fontFamily: "'Cinzel',serif" } }, "\u{1F3C6} ACHIEVEMENTS"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", textAlign: "center", marginBottom: 6 } }, achievements.length, "/", ACHIEVEMENTS.length, " unlocked"), ACHIEVEMENTS.map((a) => {
    const done = achievements.includes(a.id);
    return /* @__PURE__ */ React.createElement("div", { key: a.id, style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: done ? "rgba(30,30,10,.3)" : "rgba(20,20,30,.3)", borderRadius: 6, marginBottom: 3 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14 } }, done ? "\u{1F3C6}" : "\u{1F512}"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: done ? "#fa0" : "#444" } }, a.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: done ? "#888" : "#333" } }, a.desc)));
  }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#555", letterSpacing: 2, marginTop: 14, marginBottom: 6, borderBottom: "1px solid #2224", paddingBottom: 4 } }, "SESSION"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#777" } }, "Time: ", Math.floor(gameTime / 3600), "h ", Math.floor(gameTime % 3600 / 60), "m ", gameTime % 60, "s"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#777" } }, "Kill Streak: ", killStreak), ngPlus > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#fa0" } }, "NG+ Cycle: ", ngPlus, " (+", ngPlus * 10, "% enemy power)"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#555", letterSpacing: 2, marginTop: 14, marginBottom: 6, borderBottom: "1px solid #2224", paddingBottom: 4 } }, "MASTERY"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#777" } }, "Highest Floor: ", player.floor, "/100"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#777" } }, "Tier ", getTier(player.floor), "/10 \u2014 ", Math.round(player.floor), "% complete"), bounty && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#555", letterSpacing: 2, marginTop: 14, marginBottom: 6, borderBottom: "1px solid #2224", paddingBottom: 4 } }, "BOUNTY"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#d4a843" } }, "Kill ", bounty.required, " ", bounty.target, "s \u2014 ", bounty.current, "/", bounty.required, " \u2014 Reward: ", bounty.reward, "g")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#555", letterSpacing: 2, marginTop: 14, marginBottom: 6, borderBottom: "1px solid #2224", paddingBottom: 4 } }, "RUN STATISTICS"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 14px", fontSize: 10 } }, [["DPS", computed ? Math.round(computed.atk * 1.2) : "?"], ["Gold/Floor", player.floor > 0 ? Math.round(stats.totG / player.floor) : 0], ["Kills/Floor", player.floor > 0 ? (stats.kills / player.floor).toFixed(1) : 0], ["Steps/Floor", player.floor > 0 ? Math.round(stats.steps / player.floor) : 0], ["Lore Found", loreLog.length + "/30"], ["Bestiary", Object.keys(stats.seen || {}).length + " types"]].map(([l, v]) => /* @__PURE__ */ React.createElement("div", { key: l, style: { display: "flex", justifyContent: "space-between", padding: "2px 0" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#444" } }, l), /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, v)))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#555", letterSpacing: 2, marginTop: 14, marginBottom: 6, borderBottom: "1px solid #2224", paddingBottom: 4 } }, "ACTIONS"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 1, fontSize: 9, padding: "8px 4px", color: "#6be", borderColor: "#6be4", textAlign: "center" }, onClick: () => {
    if (!dun) return;
    setPlayer((p) => ({ ...p, x: dun.start.x, y: dun.start.y }));
    setMenu(null);
    SFX.portal();
    log("\u{1F52E} Teleported to floor entrance.", "system");
  } }, "\u{1F52E} Return to Start"), lastSanc > 0 && player.floor < lastSanc && /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 1, fontSize: 9, padding: "8px 4px", color: "#d4a843", borderColor: "#d4a84344", textAlign: "center" }, onClick: () => {
    setMenu(null);
    enterSanctuary(lastSanc);
    setPlayer((p) => ({ ...p, floor: lastSanc }));
    SFX.portal();
    log(`\u23ED\uFE0F Skipped to Sanctuary F${lastSanc}.`, "system");
  } }, "\u23ED\uFE0F Skip to F", lastSanc))), menu === "log" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#d4a843", letterSpacing: 2, textAlign: "center", marginBottom: 14, fontFamily: "'Cinzel',serif" } }, "EVENT LOG"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", textAlign: "center", marginBottom: 10 } }, eLog.length, " entries"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 1 } }, eLog.slice(-60).map((e, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { fontSize: 11, color: logCol(e.ty), padding: "3px 6px", borderRadius: 4, background: i % 2 === 0 ? "rgba(20,20,30,.3)" : "transparent", lineHeight: 1.5 } }, e.m))), eLog.length > 60 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#444", textAlign: "center", marginTop: 8 } }, "Showing last 60 entries")), menu === "armory" && (() => {
    const eqW = player.equipped.weapon;
    const eqA = player.equipped.armor;
    const stacks = {};
    armory.forEach((item) => {
      const k = item.name;
      if (!stacks[k]) stacks[k] = { ...item, count: 0, ids: [] };
      stacks[k].count++;
      stacks[k].ids.push(item.id);
    });
    const weapons = Object.values(stacks).filter((s) => s.type === "weapon").sort((a, b) => (b.atk || 0) - (a.atk || 0));
    const armors = Object.values(stacks).filter((s) => s.type === "armor").sort((a, b) => (b.def || 0) - (a.def || 0));
    const totalVal = armory.reduce((s, i) => s + Math.floor((i.val || 0) / 2), 0);
    const equipFromArmory = (item) => {
      const old = item.type === "weapon" ? eqW : eqA;
      setArmory((a) => {
        let na = a.filter((i) => i.id !== item.id);
        if (old) na = [...na, old];
        return na;
      });
      setPlayer((p) => {
        const np = { ...p, equipped: { ...p.equipped, [item.type]: item } };
        if (item.type === "armor") {
          np.maxMp = np.baseMaxMp + (item.mpB || 0);
          np.mp = Math.min(np.mp, np.maxMp);
        }
        return np;
      });
      SFX.equip();
      log(`Equipped ${item.icon} ${item.name}`, "info");
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#d4a843", letterSpacing: 2, textAlign: "center", marginBottom: 4, fontFamily: "'Cinzel',serif" } }, "ARMORY"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", textAlign: "center", marginBottom: 10 } }, armory.length, " items stored"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: fc.accent, letterSpacing: 2, marginBottom: 6, borderBottom: `1px solid ${fc.accent}22`, paddingBottom: 4 } }, "EQUIPPED"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", padding: "8px 10px", background: "#0e0e1a", borderRadius: 8, border: "1px solid #2a2a3a", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, "\u{1F5E1}\uFE0F"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, fontSize: 11 } }, eqW ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { color: "#ddd" } }, eqW.icon, " ", eqW.name), eqW.floor && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7, color: "#555", marginLeft: 3 } }, "F", eqW.floor), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#c64", fontSize: 9 } }, "+", eqW.atk, "ATK", eqW.intB ? ` +${eqW.intB}INT` : "", eqW.dexB ? ` +${eqW.dexB}DEX` : "")) : /* @__PURE__ */ React.createElement("span", { style: { color: "#444" } }, "None"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", padding: "8px 10px", background: "#0e0e1a", borderRadius: 8, border: "1px solid #2a2a3a", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, "\u{1F6E1}\uFE0F"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, fontSize: 11 } }, eqA ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { color: "#ddd" } }, eqA.icon, " ", eqA.name), eqA.floor && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7, color: "#555", marginLeft: 3 } }, "F", eqA.floor), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#68c", fontSize: 9 } }, "+", eqA.def, "DEF", eqA.mpB ? ` +${eqA.mpB}MP` : "", eqA.dexB ? ` +${eqA.dexB}DEX` : "")) : /* @__PURE__ */ React.createElement("span", { style: { color: "#444" } }, "None")))), hasRec && /* @__PURE__ */ React.createElement("button", { style: { ...btnS, width: "100%", marginBottom: 12, padding: "10px 0", textAlign: "center", borderColor: "#4c66", color: "#4c6", background: "#0a1a0e", fontSize: 11, animation: "recB 2s infinite" }, onClick: equipBest }, "\u2B06\uFE0F EQUIP BEST", recW ? ` \u{1F5E1}\uFE0F${recW.name}` : "", recA ? ` \u{1F6E1}\uFE0F${recA.name}` : ""), armory.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 1, textAlign: "center", color: "#d4a843", borderColor: "#d4a84344" }, onClick: () => {
      setArmory([]);
      setPlayer((p) => ({ ...p, gold: p.gold + totalVal }));
      SFX.sell();
      log(`Sold all armory items +${totalVal}g`, "info");
    } }, "Sell All (", totalVal, "g)")), (eqW || eqA) && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, marginBottom: 8 } }, eqW && (() => {
      const cost = Math.floor((eqW.val || 50) * 1.5);
      return /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 1, fontSize: 9, padding: "6px 4px", color: "#c64", borderColor: "#c6444", textAlign: "center" }, onClick: () => {
        if (player.gold < cost) {
          log("Not enough gold!", "danger");
          return;
        }
        setPlayer((p) => ({ ...p, gold: p.gold - cost, equipped: { ...p.equipped, weapon: { ...p.equipped.weapon, atk: p.equipped.weapon.atk + 2, val: (p.equipped.weapon.val || 50) + 20, name: p.equipped.weapon.name.replace(/\+\d+/, "") + ` +${(p.equipped.weapon.upgrades || 0) + 1}`, upgrades: (p.equipped.weapon.upgrades || 0) + 1 } } }));
        SFX.equip();
        log(`\u2B06\uFE0F Upgraded ${eqW.name}! +2 ATK`, "levelup");
      } }, "\u2B06\uFE0F Upgrade Wpn (", cost, "g)");
    })(), eqA && (() => {
      const cost = Math.floor((eqA.val || 50) * 1.5);
      return /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 1, fontSize: 9, padding: "6px 4px", color: "#68c", borderColor: "#68c4", textAlign: "center" }, onClick: () => {
        if (player.gold < cost) {
          log("Not enough gold!", "danger");
          return;
        }
        setPlayer((p) => ({ ...p, gold: p.gold - cost, equipped: { ...p.equipped, armor: { ...p.equipped.armor, def: p.equipped.armor.def + 2, val: (p.equipped.armor.val || 50) + 20, name: p.equipped.armor.name.replace(/\+\d+/, "") + ` +${(p.equipped.armor.upgrades || 0) + 1}`, upgrades: (p.equipped.armor.upgrades || 0) + 1 } } }));
        SFX.equip();
        log(`\u2B06\uFE0F Upgraded ${eqA.name}! +2 DEF`, "levelup");
      } }, "\u2B06\uFE0F Upgrade Arm (", cost, "g)");
    })()), armory.length >= 3 && /* @__PURE__ */ React.createElement("button", { style: { ...btnS, width: "100%", marginBottom: 8, padding: "8px 0", textAlign: "center", color: "#fa0", borderColor: "#fa04", fontSize: 10 }, onClick: () => {
      const salvageVal = armory.reduce((s, i) => s + Math.floor((i.val || 10) * 0.4), 0);
      const statGain = Math.floor(armory.length / 3);
      setArmory([]);
      setPlayer((p) => ({ ...p, gold: p.gold + salvageVal, str: p.str + statGain }));
      SFX.sell();
      log(`\u{1F528} Salvaged ${armory.length} items \u2192 ${salvageVal}g +${statGain} STR`, "loot");
    } }, "\u{1F528} Salvage All \u2192 ~", Math.floor(armory.reduce((s, i) => s + (i.val || 10) * 0.4, 0)), "g +", Math.floor(armory.length / 3), " STR"), weapons.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#c64", letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #c6422", paddingBottom: 4 } }, "WEAPONS (", weapons.length, ")"), weapons.map((s) => {
      const isR = recW && s.name === recW.name;
      return /* @__PURE__ */ React.createElement("div", { key: s.name, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: isR ? "#0c1a0e" : "#0c0c16", borderRadius: 8, border: `1px solid ${isR ? "#4c63" : "#1e1e2e"}`, marginBottom: 3 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { color: isR ? "#8d8" : "#ccc" } }, s.icon, " ", s.name), s.count > 1 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "#c64", marginLeft: 5 } }, "\xD7", s.count), isR && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#4c6", marginLeft: 4 } }, "\u2B06\uFE0F"), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#555", fontSize: 9 } }, "+", s.atk, "ATK", s.intB ? ` +${s.intB}INT` : "", s.dexB ? ` +${s.dexB}DEX` : "")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 3 } }, /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 9, padding: "3px 8px", color: isR ? "#4c6" : "#4a8", borderColor: isR ? "#4c64" : "#2a2a3a" }, onClick: () => {
        const item = armory.find((i) => i.name === s.name && i.type === "weapon");
        if (item) equipFromArmory(item);
      } }, "Equip"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 9, padding: "3px 8px", color: "#d4a843" }, onClick: () => {
        const item = armory.find((i) => i.name === s.name);
        if (item) {
          const v = Math.floor(item.val / 2);
          setArmory((a) => a.filter((i) => i.id !== item.id));
          setPlayer((p) => ({ ...p, gold: p.gold + v }));
          log(`Sold ${item.name} ${v}g`, "info");
        }
      } }, "Sell")));
    })), armors.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#68c", letterSpacing: 2, marginTop: 8, marginBottom: 6, borderBottom: "1px solid #68c2", paddingBottom: 4 } }, "ARMOR (", armors.length, ")"), armors.map((s) => {
      const isR = recA && s.name === recA.name;
      return /* @__PURE__ */ React.createElement("div", { key: s.name, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: isR ? "#0c1a0e" : "#0c0c16", borderRadius: 8, border: `1px solid ${isR ? "#4c63" : "#1e1e2e"}`, marginBottom: 3 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { color: isR ? "#8d8" : "#ccc" } }, s.icon, " ", s.name), s.count > 1 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "#68c", marginLeft: 5 } }, "\xD7", s.count), isR && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#4c6", marginLeft: 4 } }, "\u2B06\uFE0F"), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#555", fontSize: 9 } }, "+", s.def, "DEF", s.mpB ? ` +${s.mpB}MP` : "", s.dexB ? ` +${s.dexB}DEX` : "")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 3 } }, /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 9, padding: "3px 8px", color: isR ? "#4c6" : "#4a8", borderColor: isR ? "#4c64" : "#2a2a3a" }, onClick: () => {
        const item = armory.find((i) => i.name === s.name && i.type === "armor");
        if (item) equipFromArmory(item);
      } }, "Equip"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 9, padding: "3px 8px", color: "#d4a843" }, onClick: () => {
        const item = armory.find((i) => i.name === s.name);
        if (item) {
          const v = Math.floor(item.val / 2);
          setArmory((a) => a.filter((i) => i.id !== item.id));
          setPlayer((p) => ({ ...p, gold: p.gold + v }));
          log(`Sold ${item.name} ${v}g`, "info");
        }
      } }, "Sell")));
    })), armory.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: "#333", textAlign: "center", padding: 20, fontSize: 12 } }, "Armory empty \u2014 boss drops & shop gear appear here"));
  })(), menu === "guide" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#d4a843", letterSpacing: 2, textAlign: "center", marginBottom: 14, fontFamily: "'Cinzel',serif" } }, "GUIDE"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: fc.accent, letterSpacing: 2, marginBottom: 6, borderBottom: `1px solid ${fc.accent}22`, paddingBottom: 4 } }, "MAP LEGEND"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", marginBottom: 14 } }, [["#ffd700", "You (player)", "\u25CF"], ["#0d8", "\u25BC Stairs (exit)", "\u25BC"], ["#ea0", "\u25C6 Chest (loot)", "\u25C6"], ["#48f", "\u2666 Fountain (heal)", "\u2666"], ["#fa0", "$ Shop (buy/sell)", "$"], ["#d4f", "\u2295 Portal (sub-area)", "\u2295"], ["#f84", "\u2593 Barrier (fight)", "\u2593"], ["#d4a843", "\u2726 Feature (interact)", "\u2726"], ["#c9a84c", "\u{1F4DC} Lore (story)", "\u{1F4DC}"], ["#8cf", "\u{1F9D9} NPC (talk)", "\u{1F9D9}"], ["#ffd700", "\u{1F4AC} Echo (F91-99)", "\u{1F4AC}"], ["#fa0", "\u{1F512} Locked door (key)", "\u{1F512}"], ["#887755", "\u2592 Cracked wall (STR)", "\u2592"], ["#f44", "Enemy", "\u{1F47E}"], ["#fa0", "\u2605 Champion", "\u2605"], ["#555", "\u2588 Wall", "\u2588"], ["#500", "\u25CB Pit (damage)", "\u25CB"], ["#f40", "\u2248 Fire/Lava", "\u2248"], ["#8df", "\u25AA Ice (slip)", "\u25AA"], ["#26a", "~ Water (slow)", "~"], ["#84c", "\u221E Void (damage)", "\u221E"]].map(([c, l, ch]) => /* @__PURE__ */ React.createElement("div", { key: l, style: { display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", background: "#0c0c16", borderRadius: 5, border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("span", { style: { color: c, fontSize: 12, width: 14, textAlign: "center", fontFamily: "'JetBrains Mono',monospace" } }, ch), /* @__PURE__ */ React.createElement("span", { style: { color: "#888", fontSize: 9 } }, l)))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: fc.accent, letterSpacing: 2, marginBottom: 6, borderBottom: `1px solid ${fc.accent}22`, paddingBottom: 4 } }, "CONTROLS"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#777", lineHeight: 1.8, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", null, "WASD / Arrow keys \u2014 Move"), /* @__PURE__ */ React.createElement("div", null, keybinds.inv.toUpperCase(), " \u2014 Inventory \xB7 ", keybinds.stats.toUpperCase(), " \u2014 Stats \xB7 ", keybinds.quests.toUpperCase(), " \u2014 Quests \xB7 ", keybinds.armory.toUpperCase(), " \u2014 Armory"), /* @__PURE__ */ React.createElement("div", null, "F9 \u2014 Quick save \xB7 Esc \u2014 Close menu"), /* @__PURE__ */ React.createElement("div", null, "Enter/Space \u2014 Confirm in combat")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: fc.accent, letterSpacing: 2, marginBottom: 6, borderBottom: `1px solid ${fc.accent}22`, paddingBottom: 4 } }, "COMBAT TIPS"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#777", lineHeight: 1.8, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", null, "DEF reduces damage by DEF/(DEF+ATK+40) \u2014 never fully blocks"), /* @__PURE__ */ React.createElement("div", null, "Poison ticks 2% max HP per turn in combat"), /* @__PURE__ */ React.createElement("div", null, "Flee chance: 40% base + DEX\xD70.5% \u2212 Floor\xD70.3% (max 75%)"), /* @__PURE__ */ React.createElement("div", null, "Shield Wall / Arcane Shield halves damage for 1 enemy turn"), /* @__PURE__ */ React.createElement("div", null, "Skills cost more MP on higher tiers (\xD71.0 to \xD71.9)"), /* @__PURE__ */ React.createElement("div", null, "Crits: 6% + DEX\xD71.5% chance, \xD71.9 damage")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: fc.accent, letterSpacing: 2, marginBottom: 6, borderBottom: `1px solid ${fc.accent}22`, paddingBottom: 4 } }, "MECHANICS"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#777", lineHeight: 1.8, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", null, "Boss gear goes to the Armory \u2014 equip from there"), /* @__PURE__ */ React.createElement("div", null, "Every 10th floor has a Mega Boss + Sanctuary after"), /* @__PURE__ */ React.createElement("div", null, "Portals \u2295 lead to hidden sub-areas (vault, boss, gauntlet)"), /* @__PURE__ */ React.createElement("div", null, "Sanctuaries have shops, fountains, and respawn points"), /* @__PURE__ */ React.createElement("div", null, "Death returns you to last sanctuary (\u221225% gold, \u221230% XP)"), /* @__PURE__ */ React.createElement("div", null, "Secret walls \u2588 reveal near INT-based characters"), /* @__PURE__ */ React.createElement("div", null, "\u2605 Champions: rare enemies with 1.5\xD7 stats, 2\xD7 rewards")), player && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: fc.accent, letterSpacing: 2, marginBottom: 6, borderBottom: `1px solid ${fc.accent}22`, paddingBottom: 4 } }, "CLASS: ", player.cls.toUpperCase()), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 } }, player.skills.map((s, i) => {
    const unlockLvls = [1, 4, 8, 14, 22];
    const unlocked = player.unlocked.includes(s);
    return /* @__PURE__ */ React.createElement("div", { key: s, style: { display: "flex", justifyContent: "space-between", padding: "4px 8px", background: unlocked ? "#0a140e" : "#0c0c16", borderRadius: 6, border: `1px solid ${unlocked ? "#4c63" : "#1e1e2e"}` } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: unlocked ? "#8c8" : "#444" } }, unlocked ? "\u2726" : "\u{1F512}", " ", s), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "#555" } }, "Lv", unlockLvls[i] || "?"));
  })))), menu === "settings" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#d4a843", letterSpacing: 2, textAlign: "center", marginBottom: 14, fontFamily: "'Cinzel',serif" } }, "SETTINGS"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14, fontSize: 11 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#0e0e1a", borderRadius: 8, padding: "12px 14px", border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#888", fontSize: 10, letterSpacing: 1, marginBottom: 8 } }, "\u2694\uFE0F DIFFICULTY ", player.floor > 1 ? "(locked)" : ""), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, ["easy", "normal", "hard"].map((d) => /* @__PURE__ */ React.createElement("button", { key: d, style: { ...btnS, flex: 1, padding: "8px 0", borderColor: settings.difficulty === d ? fc.accent + "88" : "#2a2a3a", color: settings.difficulty === d ? fc.accent : "#555", textTransform: "uppercase", background: settings.difficulty === d ? "rgba(200,168,67,.08)" : "#111119", opacity: player.floor > 1 && settings.difficulty !== d ? 0.4 : 1 }, onClick: () => {
    if (player.floor > 1) {
      log("Difficulty locked after Floor 1!", "danger");
      return;
    }
    setSettings((s) => ({ ...s, difficulty: d }));
  } }, d))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: "#444", marginTop: 6 } }, settings.difficulty === "easy" ? "Less XP, forgiving combat" : settings.difficulty === "hard" ? "More XP, brutal combat" : "Balanced experience")), /* @__PURE__ */ React.createElement("div", { style: { background: "#0e0e1a", borderRadius: 8, padding: "12px 14px", border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#888", fontSize: 10, letterSpacing: 1, marginBottom: 8 } }, "\u{1F5A5}\uFE0F DISPLAY"), !isDesk && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { color: "#666", fontSize: 10, marginBottom: 6 } }, "Tile Size"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 10 } }, [{ l: "Small", v: 11 }, { l: "Medium", v: 13 }, { l: "Large", v: 15 }].map((s) => /* @__PURE__ */ React.createElement("button", { key: s.l, style: { ...btnS, flex: 1, padding: "8px 0", borderColor: settings.tileSize === s.v ? fc.accent + "88" : "#2a2a3a", color: settings.tileSize === s.v ? fc.accent : "#555", background: settings.tileSize === s.v ? "rgba(200,168,67,.08)" : "#111119" }, onClick: () => setSettings((st) => ({ ...st, tileSize: s.v })) }, s.l)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#666" } }, "Minimap"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, padding: "6px 16px", borderColor: settings.minimap ? "#4a66" : "#2a2a3a", color: settings.minimap ? "#4a6" : "#555", background: settings.minimap ? "rgba(68,170,102,.08)" : "#111119" }, onClick: () => setSettings((s) => ({ ...s, minimap: !s.minimap })) }, settings.minimap ? "ON" : "OFF")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#666" } }, "Music"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, padding: "6px 16px", borderColor: settings.music ? "#4a66" : "#2a2a3a", color: settings.music ? "#4a6" : "#555", background: settings.music ? "rgba(68,170,102,.08)" : "#111119" }, onClick: () => setSettings((s) => ({ ...s, music: !s.music })) }, settings.music ? "ON" : "OFF")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#666" } }, "Sound FX"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, padding: "6px 16px", borderColor: settings.sfx ? "#4a66" : "#2a2a3a", color: settings.sfx ? "#4a6" : "#555", background: settings.sfx ? "rgba(68,170,102,.08)" : "#111119" }, onClick: () => setSettings((s) => ({ ...s, sfx: !s.sfx })) }, settings.sfx ? "ON" : "OFF")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#666" } }, "Volume"), /* @__PURE__ */ React.createElement("input", { type: "range", min: "0", max: "100", value: Math.round((settings.volume || 1) * 100), onChange: (e) => {
    const v = parseInt(e.target.value) / 100;
    setSettings((s) => ({ ...s, volume: v }));
  }, style: { width: 100, accentColor: fc.accent } }), /* @__PURE__ */ React.createElement("span", { style: { color: "#555", fontSize: 9, width: 28, textAlign: "right" } }, Math.round((settings.volume || 1) * 100), "%")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#666" } }, "Haptic"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, padding: "6px 16px", borderColor: settings.haptic !== false ? "#4a66" : "#2a2a3a", color: settings.haptic !== false ? "#4a6" : "#555", background: settings.haptic !== false ? "rgba(68,170,102,.08)" : "#111119" }, onClick: () => setSettings((s) => ({ ...s, haptic: s.haptic === false ? true : false })) }, settings.haptic !== false ? "ON" : "OFF")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#666" } }, "High Contrast"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, padding: "6px 16px", borderColor: settings.colorblind ? "#4a66" : "#2a2a3a", color: settings.colorblind ? "#4a6" : "#555", background: settings.colorblind ? "rgba(68,170,102,.08)" : "#111119" }, onClick: () => setSettings((s) => ({ ...s, colorblind: !s.colorblind })) }, settings.colorblind ? "ON" : "OFF"))), /* @__PURE__ */ React.createElement("div", { style: { background: "#0e0e1a", borderRadius: 8, padding: "12px 14px", border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#888", fontSize: 10, letterSpacing: 1, marginBottom: 8 } }, "\u{1F3AE} CONTROLS"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", lineHeight: 1.8, marginBottom: isDesk ? 8 : 0 } }, isDesk ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, "WASD / Arrows"), " \u2014 Move"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, "Escape"), " \u2014 Close menu / shop"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, "Enter / Space"), " \u2014 Confirm")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, "D-pad"), " \u2014 Move (bottom-right)"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, "\u2630 Menu"), " \u2014 Panels"))), isDesk && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#666", letterSpacing: 1, marginBottom: 6 } }, "KEYBINDS (click to change)"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 } }, [["inv", "Inventory"], ["stats", "Stats"], ["quests", "Quests"], ["armory", "Armory"]].map(([k, label]) => /* @__PURE__ */ React.createElement("div", { key: k, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", background: "#111119", borderRadius: 6, border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "#666" } }, label), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 10, padding: "2px 10px", color: fc.accent, borderColor: fc.accent + "44", minWidth: 28, textAlign: "center", textTransform: "uppercase" }, onClick: (ev) => {
    ev.target.textContent = "...";
    ev.target.style.color = "#fa0";
    const handler = (e2) => {
      e2.preventDefault();
      e2.stopPropagation();
      const nk = e2.key.toLowerCase();
      if (nk !== "escape" && nk.length === 1 && nk >= "a" && nk <= "z" && !"wasd".includes(nk)) {
        setKeybinds((kb) => ({ ...kb, [k]: nk }));
      }
      ev.target.textContent = nk !== "escape" && nk.length === 1 && nk >= "a" && nk <= "z" && !"wasd".includes(nk) ? nk : keybinds[k];
      ev.target.style.color = fc.accent;
      window.removeEventListener("keydown", handler, true);
    };
    window.addEventListener("keydown", handler, true);
  } }, keybinds[k])))))), /* @__PURE__ */ React.createElement("div", { style: { background: "#0e0e1a", borderRadius: 8, padding: "12px 14px", border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#888", fontSize: 10, letterSpacing: 1, marginBottom: 8 } }, "\u{1F4BE} SAVE DATA \u2014 Slot ", activeSlot), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, marginBottom: 8 } }, [1, 2, 3].map((sl) => /* @__PURE__ */ React.createElement("button", { key: sl, style: { ...btnS, flex: 1, padding: "6px 0", textAlign: "center", fontSize: 9, borderColor: activeSlot === sl ? fc.accent + "66" : "#2a2a3a", color: activeSlot === sl ? fc.accent : "#555", background: activeSlot === sl ? "rgba(200,168,67,.06)" : "#111119" }, onClick: () => setActiveSlot(sl) }, "Slot ", sl, save[sl] ? ` \xB7 F${save[sl].player?.floor}` : ""))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 1, padding: "10px 0", borderColor: "#46c6", color: "#58c", textAlign: "center" }, onClick: () => saveGame() }, "\u{1F4BE} Save"), save[activeSlot] && /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 1, padding: "10px 0", borderColor: "#4a66", color: "#4a6", textAlign: "center" }, onClick: () => loadGame() }, "\u{1F4C2} Load")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: "#444", marginTop: 6 } }, "Auto-saves to active slot on floor change & combat")), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, borderColor: "#c336", color: "#c44", padding: "10px 0", textAlign: "center" }, onClick: () => {
    if (confirm("Save before quitting?")) {
      saveGame();
    }
    setScreen("title");
    setMenu(null);
  } }, "\u{1F6AA} Quit to Title"))))), shop && (() => {
    const conItems = shop.items.filter((i) => i.cat === "consumable");
    const gearItems = shop.items.filter((i) => i.cat === "weapon" || i.cat === "armor");
    const buyItem = (item) => {
      if (item.sold >= item.stock) {
        log("Sold out!", "danger");
        return;
      }
      if (player.gold < item.buyPrice) {
        log("Not enough gold!", "danger");
        return;
      }
      if (item.buyPrice > 500 && !confirm(`Buy ${item.name} for ${item.buyPrice}g?`)) return;
      const bought = { ...item, id: uid() };
      delete bought.buyPrice;
      delete bought.cat;
      delete bought.premium;
      delete bought.stock;
      delete bought.sold;
      if (bought.type === "weapon" || bought.type === "armor") {
        setPlayer((p) => ({ ...p, gold: p.gold - item.buyPrice }));
        setArmory((a) => [...a, bought]);
      } else {
        setPlayer((p) => ({ ...p, gold: p.gold - item.buyPrice, inv: [...p.inv, bought] }));
      }
      setShop((s) => {
        const ns = { ...s, items: s.items.map((i) => i.id === item.id ? { ...i, sold: i.sold + 1 } : i) };
        setSancShop(ns);
        return ns;
      });
      SFX.buy();
      log(`Bought ${item.icon} ${item.name} for ${item.buyPrice}g${bought.type !== "consumable" ? " \u2192 Armory" : ""}`, "loot");
    };
    return /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 55, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at center,#0a1828cc,rgba(8,8,14,.98) 60%)", backdropFilter: "blur(6px)", animation: "fadeUp .15s" } }, /* @__PURE__ */ React.createElement("div", { className: "scr", style: { width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", background: "rgba(12,16,24,.95)", border: "1px solid #2a4a5a", borderRadius: 12, padding: "18px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 36 } }, shop.icon), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#fa0", letterSpacing: 3, fontFamily: "'Cinzel',serif" } }, shop.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", marginTop: 4 } }, "Tier ", shop.tier, " Sanctuary \xB7 ", /* @__PURE__ */ React.createElement("span", { style: { color: "#d4a843" } }, "\u{1F4B0} ", player.gold, " gold"))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#c64", letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #c6422", paddingBottom: 4 } }, "WEAPONS & ARMOR"), gearItems.map((item) => {
      const canBuy = player.gold >= item.buyPrice && item.sold < item.stock;
      const soldOut = item.sold >= item.stock;
      const cur = item.type === "weapon" ? player.equipped.weapon : player.equipped.armor;
      const diff = item.type === "weapon" ? (item.atk || 0) - (cur?.atk || 0) : (item.def || 0) - (cur?.def || 0);
      const diffLabel = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "=";
      const diffColor = diff > 0 ? "#4c6" : diff < 0 ? "#c44" : "#555";
      return /* @__PURE__ */ React.createElement("div", { key: item.id, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: soldOut ? "#0a0a12" : item.premium ? "#12101a" : "#0c0e16", borderRadius: 8, border: `1px solid ${soldOut ? "#1a1a22" : item.premium ? "#a8642" : "#1e2e3e"}`, marginBottom: 4, opacity: soldOut ? 0.5 : 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { color: item.premium ? "#fa0" : "#ccc" } }, item.icon, " ", item.name), item.premium && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7, color: "#fa0", marginLeft: 4 } }, "\u2605 PREMIUM"), item.floor && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7, color: "#555", marginLeft: 3 } }, "F", item.floor), !soldOut && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: diffColor, marginLeft: 4, fontWeight: "bold" } }, diffLabel), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#555", fontSize: 9 } }, item.type === "weapon" ? `+${item.atk}ATK${item.intB ? ` +${item.intB}INT` : ""}${item.dexB ? ` +${item.dexB}DEX` : ""}` : item.type === "armor" ? `+${item.def}DEF${item.mpB ? ` +${item.mpB}MP` : ""}${item.dexB ? ` +${item.dexB}DEX` : ""}` : "")), soldOut ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "#555", padding: "5px 10px" } }, "SOLD OUT") : /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 10, padding: "5px 14px", color: canBuy ? "#fa0" : "#444", borderColor: canBuy ? "#fa06" : "#222" }, onClick: () => buyItem(item), disabled: !canBuy }, "\u{1F4B0}", item.buyPrice));
    }), /* @__PURE__ */ React.createElement("div", { style: { height: 10 } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#4a8", letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #4a82", paddingBottom: 4 } }, "CONSUMABLES"), conItems.map((item) => {
      const canBuy = player.gold >= item.buyPrice && item.sold < item.stock;
      const soldOut = item.sold >= item.stock;
      const remaining = item.stock - item.sold;
      return /* @__PURE__ */ React.createElement("div", { key: item.id, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: soldOut ? "#0a0a12" : "#0c0e16", borderRadius: 8, border: "1px solid #1e2e3e", marginBottom: 3, opacity: soldOut ? 0.5 : 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#ccc" } }, item.icon, " ", item.name), !soldOut && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#555", marginLeft: 6 } }, "\xD7", remaining), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#555", fontSize: 9 } }, item.effect, item.amt > 0 ? ` (+${item.amt})` : "")), soldOut ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "#555", padding: "4px 8px" } }, "SOLD OUT") : /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 10, padding: "4px 12px", color: canBuy ? "#fa0" : "#444", borderColor: canBuy ? "#fa06" : "#222" }, onClick: () => buyItem(item), disabled: !canBuy }, "\u{1F4B0}", item.buyPrice));
    }), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, width: "100%", marginTop: 14, textAlign: "center", fontSize: 12, padding: "10px 0", color: "#6be", borderColor: "#6be4" }, onClick: () => {
      setShop(null);
      log("Come back anytime!", "system");
    } }, "Leave Shop")));
  })(), combat && (() => {
    const e = combat.enemy;
    const aura = e.aura || fc.accent;
    const consItems = player.inv.filter((i) => i.type === "consumable");
    const biomeBg = inSanc ? "radial-gradient(ellipse at 50% 60%,#0a1828,#060810)" : `radial-gradient(ellipse at 50% 60%,${fc.bg},#060810 80%)`;
    const groundColor = fc.floor || "#1a1a1a";
    const pcl = player?.cls || "warrior";
    const isPlayerTurn = combat.phase === "player";
    const isEnemyTurn = combat.phase === "enemy";
    return /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", background: "#060810", animation: "fadeUp .15s", "--ba": aura } }, /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 auto", minHeight: 0, position: "relative", overflow: "hidden", background: biomeBg } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: `linear-gradient(to top,${groundColor}cc,transparent)`, pointerEvents: "none" } }), e.isMega && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 0, left: 0, right: 0, height: 60, background: `radial-gradient(ellipse at 50% 100%,${aura}22,transparent 70%)`, pointerEvents: "none" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", fontSize: 10, letterSpacing: 3, color: isPlayerTurn ? "#4c6" : isEnemyTurn ? "#d84" : combat.phase === "won" ? "#d4a843" : combat.phase === "dialogue" ? aura : "#c33", fontFamily: "'Cinzel',serif", zIndex: 2, textShadow: "0 1px 6px #000a" } }, isPlayerTurn ? "YOUR TURN" : isEnemyTurn ? "ENEMY TURN" : combat.phase === "won" ? "VICTORY" : combat.phase === "dialogue" ? "" : "DEFEATED"), combat.phase === "dialogue" && combat.dialogue && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", zIndex: 3, textAlign: "center", animation: "fadeUp .5s ease" } }, /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(0,0,0,.75)", border: `1px solid ${aura}44`, borderRadius: 12, padding: "12px 20px", maxWidth: 300, backdropFilter: "blur(6px)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: aura, letterSpacing: 2, marginBottom: 6, fontFamily: "'Cinzel',serif" } }, e.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#ddd", fontStyle: "italic", lineHeight: 1.6, fontFamily: "'Cinzel',serif" } }, '"', combat.dialogue, '"'))), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: "15%", bottom: "22%", display: "flex", flexDirection: "column", alignItems: "center", animation: combatAnim === "pLunge" ? "pLunge .3s ease" : combatAnim === "pCast" ? "pCast .3s ease" : isEnemyTurn ? "shake .3s" : combat.phase === "lost" ? "eDeath .8s ease forwards" : "none", zIndex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 80, marginBottom: 6 } }, /* @__PURE__ */ React.createElement(Bar, { cur: player.hp, max: player.maxHp, color: "#4a6", h: 8 }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 7, color: "#888", textAlign: "center", marginTop: 1 } }, player.hp, "/", player.maxHp)), /* @__PURE__ */ React.createElement(PlayerChar, { sz: 48, cls: pcl, equipped: player?.equipped, poisoned: player?.poisoned, facing: "right", hitReact: isEnemyTurn ? "damage" : null, bob: true }), (combat.sw || combat.as) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: "#6be", marginTop: 2, animation: "glow 1s infinite" } }, "\u{1F6E1}\uFE0F")), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", right: "15%", bottom: "22%", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, animation: combatAnim === "eLunge" ? "eLunge .3s ease" : combatAnim === "eDeath" ? "eDeath .6s ease forwards" : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 90, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 2 } }, e.isMega && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7, color: aura, letterSpacing: 1 } }, "\u26A0\uFE0F MEGA"), e.isBoss && !e.isMega && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7, color: aura, letterSpacing: 1 } }, "BOSS"), e.isChampion && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7, color: "#fa0", letterSpacing: 1 } }, "\u2605"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: e.isMega ? aura : e.isBoss ? "#d64" : "#c54", fontFamily: "'Cinzel',serif" } }, e.name)), /* @__PURE__ */ React.createElement(Bar, { cur: e.hp, max: e.maxHp, color: e.isMega ? aura : "#c44", h: 8 }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 7, color: "#888", textAlign: "center", marginTop: 1 } }, e.hp, "/", e.maxHp)), /* @__PURE__ */ React.createElement("div", { style: {
      fontSize: e.isMega ? 56 : e.isBoss ? 48 : 40,
      filter: e.hp <= 0 ? "grayscale(1) brightness(.3)" : vfx.enemyHit ? "brightness(3)" : "none",
      transition: "filter .2s",
      animation: combat.turn === 1 ? e.isMega || e.isBoss ? "bossIn .7s cubic-bezier(.34,1.56,.64,1)" : "fadeUp .3s" : `enemyIdle 2s ease-in-out infinite${e.isMega ? ", megaGlow 3s infinite" : ""}`
    } }, e.icon), (e.title || e.subtitle) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: "#665", fontStyle: "italic", marginTop: 2 } }, e.title || e.subtitle), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: "#555", marginTop: 1 } }, "ATK:", e.atk, " DEF:", e.def, e.elem && e.elem !== "physical" ? ` \xB7 ${e.elem}` : ""), (e.burn > 0 || e.freeze > 0 || e.stun > 0) && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, marginTop: 2, justifyContent: "center" } }, e.burn > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#f80" } }, "\u{1F525}", e.burn), e.freeze > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#8df" } }, "\u2744\uFE0F", e.freeze), e.stun > 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#ff0" } }, "\u26A1", e.stun)), isPlayerTurn && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 7, marginTop: 3, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,.4)", color: e.freeze > 0 ? "#8df" : e.stun > 0 ? "#ff0" : e.hp / e.maxHp < 0.3 ? "#f44" : "#d84", textAlign: "center" } }, e.freeze > 0 ? "\u2744\uFE0F Frozen" : e.stun > 0 ? "\u26A1 Dazed" : e.hp / e.maxHp < 0.3 ? "\u{1F4A2} Enraged" : e.critRate >= 0.12 ? "\u{1F3AF} Aiming" : "\u2694\uFE0F Attack")), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", fontSize: 8, color: "#444" } }, "Turn ", combat.turn)), /* @__PURE__ */ React.createElement("div", { style: { flex: "0 0 auto", background: "rgba(8,8,14,.95)", borderTop: `1px solid ${aura}22`, padding: "6px 12px", maxHeight: "52vh", overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { ref: cLogRef, className: "scr", style: { maxHeight: 50, overflowY: "auto", marginBottom: 6 } }, cLog.slice(-3).map((m, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { fontSize: 10, color: i === Math.min(cLog.length - 1, 2) ? "#ddd" : "#555", lineHeight: 1.4 } }, m))), isPlayerTurn && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 5 } }, /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 2, padding: "10px 0", fontSize: 13, borderColor: "#c446", color: "#c44", textAlign: "center" }, onClick: () => pAtk() }, "\u2694\uFE0F Attack ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#555" } }, "[A]")), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 1, padding: "10px 0", fontSize: 12, textAlign: "center" }, onClick: flee }, "\u{1F3C3} Flee ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#555" } }, "[F]")), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 1, padding: "10px 0", fontSize: 12, textAlign: "center", borderColor: "#4a86", color: "#6be" }, onClick: () => setCInv((c) => !c) }, cInv ? "\u2715" : "\u{1F392}", " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#555" } }, "[I]"))), e.maxHp < player.maxHp * 0.4 && !e.isBoss && /* @__PURE__ */ React.createElement("button", { style: { ...btnS, padding: "6px 0", fontSize: 9, textAlign: "center", borderColor: "#4c64", color: "#4c6" }, onClick: () => {
      const autoLoop = () => {
        setCombat((c) => {
          if (!c || c.phase !== "player" || c.enemy.hp <= 0) return c;
          setTimeout(() => pAtk(), 150);
          return c;
        });
      };
      autoLoop();
    } }, "\u26A1 Auto-Battle (weak enemy)"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 3, flexWrap: "wrap" } }, player.unlocked.map((s, si) => /* @__PURE__ */ React.createElement("button", { key: s, style: { ...btnS, fontSize: 9, padding: "5px 8px", borderColor: "#64a5", color: "#97c" }, onClick: () => pAtk(s) }, s, " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7, color: "#444" } }, "[", si + 1, "]")))), cInv && (() => {
      const stacks = {};
      consItems.forEach((c) => {
        const k = c.name;
        if (!stacks[k]) stacks[k] = { ...c, count: 0 };
        stacks[k].count++;
      });
      const stackList = Object.values(stacks);
      return /* @__PURE__ */ React.createElement("div", { className: "scr", style: { maxHeight: 100, overflowY: "auto", background: "rgba(8,8,14,.9)", border: "1px solid #2a4a5a", borderRadius: 8, padding: 6 } }, stackList.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: "#444", fontSize: 10, textAlign: "center" } }, "No consumables"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 3 } }, stackList.map((stack) => /* @__PURE__ */ React.createElement("button", { key: stack.name, style: { ...btnS, fontSize: 9, padding: "5px 8px", borderColor: "#4a83", color: "#8cc" }, onClick: () => {
        const item = consItems.find((i) => i.name === stack.name);
        if (item) {
          useItem(item, true);
          if (consItems.length <= 1) setCInv(false);
        }
      } }, stack.icon, " ", stack.name, stack.count > 1 ? ` \xD7${stack.count}` : "", stack.effect === "hp" || stack.effect === "mp" ? ` +${stack.amt}` : ""))));
    })()), isEnemyTurn && /* @__PURE__ */ React.createElement("div", { style: { color: "#d84", fontSize: 13, padding: 8, textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { animation: "glow .7s infinite" } }, e.icon, " Attacking...")), combat.phase === "dialogue" && /* @__PURE__ */ React.createElement("div", { style: { color: aura, fontSize: 12, padding: 8, textAlign: "center", fontFamily: "'Cinzel',serif", letterSpacing: 2 } }, "..."), combat.phase === "dying" && /* @__PURE__ */ React.createElement("div", { style: { color: "#d4a843", fontSize: 12, padding: 8, textAlign: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { animation: "glow .5s infinite" } }, "\u{1F480} ...")), combat.phase === "won" && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { color: e.isMega ? aura : "#4c6", fontSize: 15, marginBottom: 4, fontFamily: "'Cinzel',serif" } }, e.isMega ? "\u{1F3C6} MEGA BOSS SLAIN!" : e.isBoss ? "\u{1F3C6} BOSS SLAIN!" : e.isChampion ? "\u2605 CHAMPION SLAIN!" : "Victory!"), e.isMega && BOSS_EPITAPH[e.name] && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#999", fontStyle: "italic", marginBottom: 6, lineHeight: 1.5 } }, '"', BOSS_EPITAPH[e.name], '"'), e.isBoss && !e.isBarrier && !e.isMini && (() => {
      const bf = e.bossFloor || player.floor;
      const nw = genFloorWeapon(bf, player.cls);
      const na = genFloorArmor(bf, player.cls);
      const cw = player.equipped.weapon;
      const ca = player.equipped.armor;
      return /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#c64" } }, nw.icon, " ", nw.name, " +", nw.atk, "ATK", cw ? ` (${nw.atk > cw.atk ? "\u2191" : ""}${nw.atk !== cw.atk ? Math.abs(nw.atk - cw.atk) : "="})` : ""), /* @__PURE__ */ React.createElement("span", { style: { color: "#68c" } }, na.icon, " ", na.name, " +", na.def, "DEF", ca ? ` (${na.def > ca.def ? "\u2191" : ""}${na.def !== ca.def ? Math.abs(na.def - ca.def) : "="})` : "")));
    })(), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#888", marginBottom: 6 } }, "+", e.xp, "xp +", e.gold, "g"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, padding: "10px 28px", fontSize: 13, borderColor: `${aura}66`, color: aura }, onClick: claimWin }, "Collect [Enter]")), combat.phase === "lost" && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#c33", fontSize: 14, marginBottom: 6 } }, "Defeated..."), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, padding: "10px 20px", fontSize: 12 }, onClick: handleDeath }, lastSanc > 0 ? "Respawn" : "Continue"))));
  })()));
}
