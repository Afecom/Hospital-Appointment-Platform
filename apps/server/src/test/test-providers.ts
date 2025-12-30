export const MOCK_DATABASE_PROVIDER = {
    provide: Symbol.for('DatabaseService'),
    useValue: {},
};

export const MOCK_CLOUDINARY_PROVIDER = {
    provide: 'CLOUDINARY',
    useValue: {
        uploader: {
            upload_stream: (_opts: any, cb: any) => ({ end: () => cb(null, { public_id: 'ok' }) }),
            destroy: async (_id: string) => ({ result: 'ok' }),
        },
    },
};

// NOTE: Tests reference the runtime class token `DatabaseService`. When providing
// a mock in specs we can either reference the class or this symbol; many specs
// will import the class and provide it directly. This file provides convenient
// mock providers to reuse across specs.
