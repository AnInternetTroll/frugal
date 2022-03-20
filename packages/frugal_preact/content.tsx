/* @jsx preact.h */
/* @jsxFrag preact.Fragment */
import * as preact from 'preact';
import * as server from 'preact-render-to-string';
import { HeadProvider } from './Head.tsx';

import * as frugal from '../core/mod.ts';

import { DataProvider } from './dataContext.tsx';

export type PageProps = {
    entrypoint: string;
    cache: frugal.Cache;
    loaderContext: frugal.LoaderContext;
};

export type Page = preact.ComponentType<PageProps>;

export type App = (
    props: AppProps,
) => preact.VNode;

export type AppProps = {
    entrypoint: string;
    loaderContext: frugal.LoaderContext;
    children: preact.ComponentChildren;
    cache: frugal.Cache;
};

export type Document = preact.ComponentType<DocumentProps>;

export type DocumentProps = {
    head: preact.VNode[];
    entrypoint: string;
    loaderContext: frugal.LoaderContext;
    dangerouslySetInnerHTML: { __html: string };
};

type ContentConfig = {
    App: App;
    Document: Document;
};

const DEFAULT_APP: App = ({ children }) => {
    return <>{children}</>;
};

const DEFAULT_DOCUMENT: Document = (
    { head, dangerouslySetInnerHTML }: DocumentProps,
) => {
    return (
        <html>
            <head>
                {head}
            </head>
            <body dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
        </html>
    );
};

export function getContentFrom<REQUEST, DATA>(
    Page: Page,
    { App = DEFAULT_APP, Document = DEFAULT_DOCUMENT }: Partial<ContentConfig> =
        {},
): frugal.GetContent<REQUEST, DATA> {
    return ({
        data,
        pathname,
        entrypoint,
        loaderContext,
        cache,
    }) => {
        let head: preact.VNode[] = [];

        const html = server.render(
            <HeadProvider
                onHeadUpdate={(nextHead) => {
                    head = nextHead;
                }}
            >
                <App
                    entrypoint={entrypoint}
                    loaderContext={loaderContext}
                    cache={cache}
                >
                    <DataProvider
                        context={{ data, pathname, timestamp: Date.now() }}
                    >
                        <Page
                            entrypoint={entrypoint}
                            loaderContext={loaderContext}
                            cache={cache}
                        />
                    </DataProvider>
                </App>
            </HeadProvider>,
        );

        return `<!DOCTYPE html>${
            server.render(
                <Document
                    entrypoint={entrypoint}
                    loaderContext={loaderContext}
                    head={head}
                    dangerouslySetInnerHTML={{ __html: html }}
                />,
            )
        }`;
    };
}
