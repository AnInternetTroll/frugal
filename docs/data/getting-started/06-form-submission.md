# Form submission

Now that we have a server, we can handle form submission with `handlers`

## Handlers

You can export in a [page descriptor](/docs/api/01-page-descriptor) (both dynamic and static) an extra object `handlers` :

```ts
import type * as frugal from 'https://deno.land/x/frugal/core.ts';

//...

export const handler: frugal.Handlers<Path, Data> = {
    POST: (request, context) => {
        // do something to build data object
        return { data };
    },
};
```

Methods in the `handlers` object will be called in response to a `POST`, `PATCH`, `PUT` or `DELETE` request. The data object will then be fed to the `getContent` function to generate the page that will be served to the client. Think of the `handlers` methods as a `getDynamicData` function for non-`GET` requests.

## POST-Redirect-GET (PRG) pattern

When a client submit a form (via `POST`, `PATCH`, `PUT` or `DELETE`), we want to avoid the situation where the form is submited again if the client refreshes the page. To do so, frugal uses the [PRG pattern](https://en.wikipedia.org/wiki/Post/Redirect/Get). The page generated by the `handlers` will not be immediately served to the client. Instead, when a `POST`/`PATCH`/`PUT`/`DELETE` request comes, the content is generated and stored in session, and the client receive a 303 response with a session cookie that will redirect it to a `GET` request on the same url. On the `GET` request, frugal will detect the session cookie and serve the content stored in the session.

The user get the result of the `POST`/`PATCH`/`PUT`/`DELETE` request on a `GET` request. Refreshing the page will not resubmit the form.

For this pattern to work, frugal needs to persist some data between two requests. On a standard server this can be done using filesystem but in serverless context there is not runtime filesystem to write pages in. To fix that, frugal abstract read and write with a [persistance layer](/docs/api/04-persistance). By default frugal uses a filesystem persistance layer, but you can configure frugal to use a different one :

```ts
export const config: frugal.Config = {
    //...
    server: {
        sessionPersistance: myPersistanceLayer,
    },
};
```

## Example

With handlers you can do form validation and submission server side :

```ts
import type * as frugal from 'https://deno.land/x/frugal/core.ts';
import * as form from './form.ts';
//...

export function getStaticData(): frugal.DataResult<Data> {
    return {
        data: {
            form: form.initialForm(),
        },
    };
}

export const handlers = {
    POST: async (request: Request): Promise<frugal.DataResult<Data>> => {
        const recievedForm = form.fromFormData(await request.formData());
        const validatedForm = await form.validateForm(recievedForm);
        if (validatedForm.isValid) {
            const submittedForm = await form.submitForm(form);
            return {
                data: { form: submittedForm },
            };
        }
        return {
            data: { form: validatedForm },
        };
    },
};

export function getContent({ data }: frugal.GetContentParams<Path, Data>) {
    return `<html>
        <body>
            <form encType='multipart/form-data' method='POST'>
                ${form.render(data.form)}
                <button>Submit</button>
            </form>
        </body>
    </html>`;
}
```

When a user visit the static page, he receive a page that was rendered with `getStaticData`. The form is in its initial state. The user fill the form and submits it. This send a `POST` request with a form-data body, that is handled by the `POST` handler. The handler get back the form from the body of the request and validates it :

- If the form is invalid, the handler sends back the validated form with maybe some error state. `getContent` generates a page with a form containing errors. The user gets back a page with the form validated.
- If the form is valid, the handler submit the form (database persistance ? Sent to an api ?). A page is generated from the submittedForm with maybe some success message. The user gets back a page with a success message.
