import Context from '.';

type ContextX = Omit<Context, 'bot'>;

export type Handler<T = {}> = (context: ContextX & T) => Promise<boolean>;
