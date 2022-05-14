import {
    PageBuilder,
    PageBuilderConfig,
} from '../../../../packages/core/PageBuilder.ts';
import { Page } from '../../../../packages/core/Page.ts';
import { PageGenerator } from '../../../../packages/core/PageGenerator.ts';
import { fakePageGenerator } from './PageGenerator.ts';
import { fakeStaticPage } from './Page.ts';
import { fakeCache } from './Cache.ts';
import { fakePersistance } from './Persistance.ts';
import { spy } from '../../../../dep/std/mock.ts';

type FakePageBuilderConfig<PATH extends object, DATA, BODY> = {
    page?: Page<PATH, DATA, BODY>;
    hash?: string;
    generator?: PageGenerator<PATH, DATA, BODY>;
    config?: PageBuilderConfig;
    mock?: {
        build?: PageBuilder<PATH, DATA, BODY>['build'];
        buildAll?: PageBuilder<PATH, DATA, BODY>['buildAll'];
    };
};

export function fakePageBuilder<PATH extends object, DATA, BODY>(
    {
        page = fakeStaticPage(),
        hash = '',
        generator = fakePageGenerator(),
        config = {
            cache: fakeCache(),
            persistance: fakePersistance(),
        },
        mock = {},
    }: FakePageBuilderConfig<PATH, DATA, BODY> = {},
) {
    const builder = new PageBuilder<PATH, DATA, BODY>(
        page,
        hash,
        generator,
        config,
    );

    const originalBuild = builder.build;
    builder.build = spy(mock.build ?? originalBuild.bind(builder));

    const originalBuildAll = builder.buildAll;
    builder.buildAll = spy(mock.buildAll ?? originalBuildAll.bind(builder));

    return builder;
}
