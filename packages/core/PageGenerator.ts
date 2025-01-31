import { assert } from '../../dep/std/asserts.ts';
import * as pathUtils from '../../dep/std/path.ts';
import * as http from '../../dep/std/http.ts';

import { Generated } from '../loader_script/ScriptLoader.ts';
import * as log from '../log/mod.ts';

import { LoaderContext } from './LoaderContext.ts';
import { GetDynamicDataContext, Page, Phase, StaticPage } from './Page.ts';

export type PageGeneratorConfig = {
    loaderContext: LoaderContext;
    publicDir: string;
    watch?: boolean;
};

function logger() {
    return log.getLogger('frugal:PageGenerator');
}

type ContentGenerationContext<DATA, PATH> = {
    method: string;
    data: DATA;
    path: PATH;
    phase: Phase;
};

/**
 * Class handling the page generation process.
 */
export class PageGenerator<
    PATH extends Record<string, string> = Record<string, string>,
    DATA = unknown,
> {
    #page: Page<PATH, DATA>;
    #config: PageGeneratorConfig;

    constructor(
        page: Page<PATH, DATA>,
        config: PageGeneratorConfig,
    ) {
        this.#page = page;
        this.#config = config;
    }

    /**
     * Generate the page given a request object.
     *
     * Will throw if the request pathname does not match the page pattern.
     */
    async generate(
        request: Request,
        state: Record<string, unknown>,
    ): Promise<
        { pagePath: string; content: string; headers: Headers } | {
            status: http.Status;
            headers: Headers;
        }
    > {
        const pathname = new URL(request.url).pathname;
        const match = this.#page.match(pathname);
        assert(match !== false);
        const path = match.params;

        logger().debug({
            pattern: this.#page.pattern,
            pathname,
            msg() {
                return `generation of ${this.pattern} as ${this.pathname}`;
            },
        });

        const result = await this.#getData(request, {
            phase: 'generate',
            path,
            state,
        });

        if ('status' in result) {
            const headers = new Headers(result.headers);

            if ('location' in result) {
                headers.set('location', String(result.location));
            }

            return {
                status: result.status,
                headers,
            };
        }

        const pagePath = this.getPagePath(pathname);
        const content = await this.generateContentFromData(
            pathname,
            {
                data: result.data ?? {} as DATA,
                path,
                phase: 'generate',
                method: request.method,
            },
        );

        return { pagePath, content, headers: new Headers(result.headers) };
    }

    /**
     * Generate the content of a page form its data and path
     */
    async generateContentFromData(
        pathname: string,
        { data, path, phase, method }: ContentGenerationContext<
            DATA,
            PATH
        >,
    ): Promise<string> {
        logger().debug({
            op: 'start',
            pattern: this.#page.pattern,
            pathname,
            msg() {
                return `${this.op} ${this.logger!.timerStart}`;
            },
            logger: {
                timerStart:
                    `content generation of ${this.#page.pattern} as ${pathname}`,
            },
        });

        const content = await this.#page.getContent({
            method,
            phase,
            path,
            data,
            pathname,
            loaderContext: this.#config.loaderContext,
        });

        logger().debug({
            op: 'done',
            pattern: this.#page.pattern,
            pathname,
            msg() {
                return `${this.logger!.timerEnd} ${this.op}`;
            },
            logger: {
                timerEnd:
                    `content generation of ${this.#page.pattern} as ${pathname}`,
            },
        });

        if (!this.#config.watch) {
            return content;
        } else {
            const injectWatchScript = this.#config.loaderContext.get<Generated>(
                'inject-watch-script',
            );
            if (injectWatchScript) {
                // browsers are very forgiving, we can simply add the watch
                // script after the whole document
                return `${content}<script>var script = document.createElement('script'); script.type="module"; script.src="${
                    injectWatchScript[String(this.#page.self)][
                        'inject-watch-script'
                    ]
                }"; document.head.appendChild(script);</script>`;
            } else {
                return content;
            }
        }
    }

    getPagePath(pathname: string) {
        return pathname.endsWith('.html')
            ? pathUtils.join(this.#config.publicDir, pathname)
            : pathUtils.join(this.#config.publicDir, pathname, 'index.html');
    }

    #getData(
        request: Request,
        context: GetDynamicDataContext<PATH>,
    ) {
        const handler = this.#page.handlers[request.method];
        if (handler !== undefined) {
            return handler(request, context);
        }

        if (this.#page instanceof StaticPage) {
            if (!this.#config.watch) {
                assert(
                    false,
                    `Can't dynamically generate StaticPage ${this.#page.pattern} for GET method`,
                );
            }
            return this.#page.getStaticData(context);
        }

        return this.#page.getDynamicData(request, context);
    }
}
