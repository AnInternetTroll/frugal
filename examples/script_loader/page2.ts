import type * as frugal from '../../packages/core/mod.ts';
import type { Generated } from '../../packages/loader_script/mod.ts';

import './foo.script.ts';

type Path = { slug: string };

type Data = {
    title: string;
    content: string;
};

export function getPathList(): Path[] {
    return [{ slug: 'article-1' }, { slug: 'article-2' }];
}

export function getStaticData(
    { path }: frugal.GetStaticDataContext<Path>,
): frugal.DataResult<Data> {
    if (path.slug === 'article-1') {
        return {
            data:{
                title: 'first article !',
                content: 'this is the first article',
            }
        };
    }
    return {
        data: {
            title: 'another article',
            content: 'this is another article',
        }
    };
}

export const pattern = '/page2/:slug.html';

export const self = new URL(import.meta.url);

export function getContent(
    { data, loaderContext, descriptor }: frugal.GetContentParams<Path, Data>,
) {
    const bodyScriptSrc =
        loaderContext.get<Generated>('script')?.[String(descriptor)]?.['body'];

    return `<html>
    <body>
        <h1>${data.title}</h1>
        <p>${data.content}</p>    
        <script type="module" src="${bodyScriptSrc}"></script>
    </body>
</html>
`;
}
