import { Trigger } from './trigger/trigger';
import { Action } from './action/action';
import { PieceBase, PieceMetadata } from './piece-metadata';
import { PieceAuthProperty } from './property/authentication';
import { PieceCategory } from '../shared/pieces';
import { EventPayload, ParseEventResponse } from '../shared/engine';
import {
  IQoreConnectionOption,
  IQoreRestConnectionConfig,
  IQoreRestConnectionModifiers,
  TQorePartialEventAction,
} from '../../global/models/qore';

export class Piece<
  PieceAuth extends PieceAuthProperty = PieceAuthProperty,
  ModifierOptions extends Record<string, IQoreConnectionOption> = Record<
    string,
    IQoreConnectionOption
  >,
> implements Omit<PieceBase, 'version' | 'name'>
{
  private readonly _actions: Record<string, Action> = {};
  private readonly _triggers: Record<string, Trigger> = {};

  constructor(
    public readonly displayName: string,
    public readonly logoUrl: string,
    public readonly authors: string[],
    public readonly events: PieceEventProcessors | undefined,
    actions: Action<PieceAuth>[],
    triggers: Trigger<PieceAuth>[],
    public readonly categories: PieceCategory[],
    public readonly auth?: PieceAuth,
    public readonly minimumSupportedRelease?: string,
    public readonly maximumSupportedRelease?: string,
    public readonly description = '',
    public readonly logo: string = '',
    public readonly qoreTriggers: TQorePartialEventAction[] = [],
    public readonly qoreConnectionModifiers: IQoreRestConnectionModifiers<ModifierOptions> = undefined,
    public readonly qoreRest: Partial<IQoreRestConnectionConfig> = undefined
  ) {
    actions.forEach((action) => (this._actions[action.name] = action));
    triggers.forEach((trigger) => (this._triggers[trigger.name] = trigger));
  }

  metadata(): BackwardCompatiblePieceMetadata {
    return {
      displayName: this.displayName,
      logoUrl: this.logoUrl,
      actions: this._actions,
      triggers: this._triggers,
      categories: this.categories,
      description: this.description,
      authors: this.authors,
      auth: this.auth,
      minimumSupportedRelease: this.minimumSupportedRelease,
      maximumSupportedRelease: this.maximumSupportedRelease,
      logo: this.logo,
      qoreTriggers: this.qoreTriggers,
      qoreConnectionModifiers: this.qoreConnectionModifiers,
      qoreRest: this.qoreRest,
    };
  }

  getAction(actionName: string): Action | undefined {
    return this._actions[actionName];
  }

  getTrigger(triggerName: string): Trigger | undefined {
    return this._triggers[triggerName];
  }

  actions() {
    return this._actions;
  }

  triggers() {
    return this._triggers;
  }
}

export const createPiece = <
  PieceAuth extends PieceAuthProperty,
  ModifierOptions extends Record<string, IQoreConnectionOption> = Record<
    string,
    IQoreConnectionOption
  >,
>(
  params: CreatePieceParams<PieceAuth, ModifierOptions>
) => {
  return new Piece(
    params.displayName,
    params.logoUrl,
    params.authors ?? [],
    params.events,
    params.actions,
    params.triggers,
    params.categories ?? [],
    params.auth ?? undefined,
    params.minimumSupportedRelease,
    params.maximumSupportedRelease,
    params.description,
    params.logo,
    params.qoreTriggers ?? [],
    params.qoreConnectionModifiers ?? undefined,
    params.qoreRest ?? undefined
  );
};

type CreatePieceParams<
  PieceAuth extends PieceAuthProperty = PieceAuthProperty,
  ModifierOptions extends Record<string, IQoreConnectionOption> = Record<
    string,
    IQoreConnectionOption
  >,
> = {
  displayName: string;
  logoUrl: string;
  authors: string[];
  description?: string;
  logo?: string;
  auth: PieceAuth | undefined;
  events?: PieceEventProcessors;
  minimumSupportedRelease?: string;
  maximumSupportedRelease?: string;
  actions: Action<PieceAuth>[];
  triggers: Trigger<PieceAuth>[];
  categories?: PieceCategory[];
  qoreTriggers?: TQorePartialEventAction[];
  qoreConnectionModifiers?: IQoreRestConnectionModifiers<ModifierOptions>;
  qoreRest?: Partial<IQoreRestConnectionConfig>;
};

type PieceEventProcessors = {
  parseAndReply: (ctx: { payload: EventPayload }) => ParseEventResponse;
  verify: (ctx: { webhookSecret: string; payload: EventPayload; appWebhookUrl: string }) => boolean;
};

type BackwardCompatiblePieceMetadata = Omit<PieceMetadata, 'name' | 'version' | 'authors'> & {
  authors?: PieceMetadata['authors'];
};
