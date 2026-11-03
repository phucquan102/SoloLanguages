import type { JsonValue } from '@solo/language-sdk';

export type { JsonValue } from '@solo/language-sdk';

/** Keys must be canonical BCP 47 locale tags. */
export type LocalizedText = Readonly<Record<string, string>>;

/** Runtime schemas additionally enforce the namespace syntax and module ownership. */
export type ContentExtensionKey = `${string}:${string}`;
export type ContentExtensions = Readonly<Record<ContentExtensionKey, JsonValue>>;

export interface Provenance {
  readonly source: {
    readonly file: string;
    readonly declaration: string;
    readonly line?: number;
    readonly item?: string | number;
  };
  readonly license: string;
  readonly attribution: string;
  readonly version: string;
  readonly retrievedAt: string;
}

/** Editorial workflow, in order: ai-draft, dev-checked, native-reviewed, vi-reviewed, approved. */
export type ReviewStatus = 'ai-draft' | 'dev-checked' | 'native-reviewed' | 'vi-reviewed' | 'approved';

export interface Review {
  readonly status: ReviewStatus;
  /** Free-form roles that signed off, e.g. a developer or a native reviewer; may be empty for a draft. */
  readonly reviewerRoles: readonly string[];
  /** ISO 8601 date or date-time of the latest status change. */
  readonly date: string;
}

export interface ContentRecord {
  readonly id: string;
  readonly provenance: Provenance;
  readonly review?: Review;
  readonly extensions?: ContentExtensions;
}

export interface Stage extends ContentRecord {
  readonly courseCode: string;
  readonly order: number;
  readonly frameworkCode?: string;
  readonly levelCode: string | null;
  readonly labels: LocalizedText;
}

export interface VocabExample {
  readonly text: string;
  readonly translations: LocalizedText;
}

export interface Vocab extends ContentRecord {
  readonly headword: string;
  readonly glosses: LocalizedText;
  readonly examples: readonly VocabExample[];
  /** Field identifiers are declared by the owning module. */
  readonly fields: Readonly<Record<string, string>>;
  readonly collocations?: readonly string[];
  readonly notes?: LocalizedText;
  readonly mistakes?: readonly LocalizedText[];
  readonly topic?: string;
  readonly stageId?: string;
  readonly levelCode?: string;
}

/**
 * Text, objective, explanation, tip and mistake notes hold instruction text. Example text,
 * transcription and the wrong/right pair of a mistake hold target-language text.
 */
export type LessonBlock =
  | { readonly kind: 'text'; readonly text: LocalizedText | string }
  | {
    readonly kind: 'example';
    readonly text: string;
    readonly translations?: LocalizedText;
    /** Reading aid such as IPA or a romanization; its notation belongs to the owning module. */
    readonly transcription?: string;
    /** Vocabulary shown by this example; when omitted, curriculum checks match the headword in the text. */
    readonly vocabIds?: readonly string[];
  }
  | { readonly kind: 'objective'; readonly text: LocalizedText }
  | { readonly kind: 'explanation'; readonly text: LocalizedText; readonly pattern?: string }
  | { readonly kind: 'mistake'; readonly wrong: string; readonly right: string; readonly note: LocalizedText }
  | { readonly kind: 'tip'; readonly text: LocalizedText };

export type LessonBlockKind = LessonBlock['kind'];

export interface QuestionBase extends ContentRecord {
  readonly prompt: LocalizedText | string;
  readonly passage?: string;
  readonly explanations?: LocalizedText;
  readonly group?: string;
  /** Display category formerly stored in the free-form kind field. */
  readonly category?: string;
  readonly vocabIds?: readonly string[];
}

export interface ChoiceQuestion extends QuestionBase {
  readonly kind: 'choice';
  readonly options: readonly (string | LocalizedText)[];
  readonly correctIndex: number;
}

/** The owning module grades these answers with its textTools.compareAnswer. */
export interface TypedQuestion extends QuestionBase {
  readonly kind: 'typed';
  readonly acceptedAnswers: readonly string[];
}

export type Question = ChoiceQuestion | TypedQuestion;

export interface Unit extends ContentRecord {
  readonly stageId: string;
  /** Position within the stage; unique per stage. */
  readonly order: number;
  readonly titles: LocalizedText;
  readonly canDo: readonly LocalizedText[];
}

export interface Lesson extends ContentRecord {
  readonly stageId?: string;
  readonly titles?: LocalizedText;
  readonly unitId?: string;
  /** Position within its unit. */
  readonly order?: number;
  readonly skill: string;
  readonly blocks: readonly LessonBlock[];
  readonly questions: readonly Question[];
  /** Vocabulary introduced by this lesson. */
  readonly vocabIds?: readonly string[];
  /** Earlier vocabulary revisited by this lesson. */
  readonly reviewVocabIds?: readonly string[];
}

export interface Quest extends ContentRecord {
  readonly stageId?: string;
  readonly titles: LocalizedText;
  readonly skill: string;
  readonly minutes: number;
  readonly xp: number;
  readonly lessonIds: readonly string[];
  readonly optional: boolean;
}

/** One study day: ordered main quests, optional side quests and the test that closes the day. */
export interface Day extends ContentRecord {
  readonly stageId: string;
  readonly unitId: string;
  /** Day number from 1; unique per stage. */
  readonly day: number;
  readonly mainQuestIds: readonly string[];
  readonly sideQuestIds?: readonly string[];
  readonly testId: string;
}

export type TestKind = 'daily' | 'unit';

/** Question ids may point at questions of any lesson, placement or assessments. */
export interface Test extends ContentRecord {
  readonly kind: TestKind;
  readonly questionIds: readonly string[];
  /** Fraction of correct answers needed to pass, greater than 0 and at most 1. */
  readonly passRatio: number;
  readonly reviewVocabIds?: readonly string[];
}

export interface ContentPack {
  readonly schemaVersion: 1;
  readonly language: string;
  readonly stages: readonly Stage[];
  readonly vocab: readonly Vocab[];
  readonly lessons: readonly Lesson[];
  readonly quests: readonly Quest[];
  readonly units?: readonly Unit[];
  readonly days?: readonly Day[];
  readonly tests?: readonly Test[];
  readonly placement: readonly Question[];
  readonly assessments: readonly Question[];
  /** Namespaced JSON datasets; their internal shapes belong to the owning module. */
  readonly extensions?: ContentExtensions;
}

export interface ContentValidationContext {
  readonly language: string;
  readonly skills: readonly string[];
  readonly levels: Readonly<Record<string, readonly string[]>>;
  readonly courses: Readonly<Record<string, {
    readonly framework: string;
    readonly levels: readonly string[];
  }>>;
}

export type ContentIssuePath = (string | number)[];

export interface ContentValidationIssue {
  readonly path: ContentIssuePath;
  readonly message: string;
}

/** Hook issue paths are relative to the extension value; the validator prefixes them. */
export type ContentExtensionValidator = (value: JsonValue) => readonly ContentValidationIssue[];

export interface ContentValidationOptions {
  readonly extensions?: Readonly<Record<ContentExtensionKey, ContentExtensionValidator>>;
}
