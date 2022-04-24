import { Asset, Loader } from '../../../../packages/core/loader.ts';

type FakeLoaderConfig<GENERATED, CACHED> = Partial<Loader<GENERATED, CACHED>>;

export function fakeLoader<GENERATED, CACHED>(
    {
        name = '',
        test = () => true,
        generate = () => Promise.resolve({} as GENERATED),
        end = () => {},
    }: FakeLoaderConfig<GENERATED, CACHED> = {},
) {
    return {
        name,
        test,
        generate,
        end,
    };
}

type FakeAssetConfig = Partial<Asset>;

export function fakeAsset({
    loader = '',
    module = '',
    hash = '',
    entrypoint = '',
}: FakeAssetConfig) {
    return { loader, module, hash, entrypoint };
}
