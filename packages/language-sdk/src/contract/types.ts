import type { SkillId } from './skills.ts';

/** BCP 47 tag of an interface locale, chosen by the app; the SDK never hardcodes one. */
export type Locale = string;
/** `getMessages` returns a null-prototype snapshot. Use `Object.hasOwn(messages, key)`, not `.hasOwnProperty(key)`. */
export type Messages = Readonly<Record<string, string>>;
export type Direction = 'ltr' | 'rtl';
export type JsonValue = string | number | boolean | null | readonly JsonValue[] | { readonly [key: string]: JsonValue };

export interface LanguageManifest {
  /** ISO 639 code, `^[a-z]{2,3}$`. */
  readonly code: string;
  /** Canonical BCP 47 tag. */
  readonly bcp47: string;
  readonly nativeName: string;
  readonly glyph: string;
  /** Language name per interface locale (canonical BCP 47 keys). */
  readonly names: Readonly<Record<Locale, string>>;
  /** ISO 15924 script codes, e.g. `Latn`. */
  readonly scripts: readonly string[];
  readonly direction: Direction;
  /** Module semver. */
  readonly version: string;
}

export interface Level {
  readonly code: string;
  readonly order: number;
  /** Band frameworks only. */
  readonly minScore?: number;
  readonly maxScore?: number;
}

export interface LevelFramework {
  readonly code: string;
  readonly kind: 'ordinal' | 'band';
  /** True when levels correspond to an external certification exam. */
  readonly certification: boolean;
  readonly levels: readonly Level[];
}

export interface Course {
  readonly code: string;
  readonly framework: string;
  /** Level codes of `framework`, ascending. */
  readonly levels: readonly string[];
}

export interface Skill {
  readonly id: SkillId;
}

export interface VocabField {
  readonly id: string;
  readonly required?: boolean;
}

export interface AnswerResult {
  readonly correct: boolean;
  /** 0..1 */
  readonly score?: number;
}

/** Methods must not rely on `this`: the registry stores a validated copy of this object. */
export interface TextTools {
  normalize(text: string): string;
  compareAnswer(input: string, accepted: readonly string[]): AnswerResult;
  tokenize?(text: string): string[];
}

export interface SpeechVoice {
  readonly name: string;
  readonly lang: string;
  readonly localService?: boolean;
  readonly default?: boolean;
}

export interface SpeechConfig {
  /** BCP 47 tags accepted for TTS/STT. */
  readonly tags: readonly string[];
  voiceFilter?(voice: SpeechVoice): boolean;
}

export interface Placement {
  readonly course: string;
  /** Level codes of `course` a placement test may assign. */
  readonly levels: readonly string[];
}

/**
 * First-party, build-time bundled module. The registry validates it and keeps a frozen snapshot;
 * unknown keys are dropped and the caller's object is never mutated.
 */
export interface LanguageModule {
  /** Supported SDK range, `^MAJOR.MINOR.PATCH[-prerelease]`. */
  readonly sdk: string;
  readonly manifest: LanguageManifest;
  readonly levelFrameworks: readonly LevelFramework[];
  readonly courses: readonly Course[];
  readonly skills: readonly Skill[];
  readonly vocabFields?: readonly VocabField[];
  readonly textTools: TextTools;
  readonly speech?: SpeechConfig;
  readonly exerciseTypes?: readonly string[];
  readonly features?: Readonly<Record<string, boolean>>;
  readonly placement?: Placement;
  /** Lazily loaded course content; must resolve to a defined value. Called with the original module as `this`. */
  readonly content?: () => Promise<unknown>;
  /** Canonical BCP 47 keys; each loader resolves to a plain object of strings. */
  readonly i18n?: Readonly<Record<Locale, () => Promise<Messages>>>;
  /** Opaque until the tutor phase. */
  readonly tutor?: Readonly<Record<string, JsonValue>>;
  /** Opaque until the dictionary phase. */
  readonly dictionary?: Readonly<Record<string, JsonValue>>;
}
