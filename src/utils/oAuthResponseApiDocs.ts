import { applyDecorators } from '@nestjs/common';
import { ApiFoundResponse } from '@nestjs/swagger';

export const OAuthResponseApiDocs = () => {
    const examples = [
        'https://example.com/oauth-res?oAuthRes={"message": "Authentication failed. Log in with Google again to retry", "error": "Unauthorized", "statusCode": 401}',
        'https://example.com/oauth-res?oAuthRes={"expiresAt": "2024-05-18T11:38:04.264Z", "token": "I-pbbWsCBvletjzjhTZbpbejebcLaBjdNYza5b7y_J5lcF9RrmqKby44G9WCJcSay3zcHcWgmKiCjyVOd8tCbw", "statusCode": 200}',
    ];

    const descriptionLines = [
        'The URL the user will get redirected to after the request.',
        '',
        'It will include the oAuthRes querystring that is the usual (JSON) response. In case of a successful request (a 2XX response), it will also include the statusCode property.',
        '',
        `Example 1: ${examples[0]}`,
        '',
        `Example 2: ${examples[1]}`,
    ];

    return applyDecorators(
        ApiFoundResponse({
            description:
                'Redirected (only when the querystring resType is redirect)',
            headers: {
                location: {
                    schema: { type: 'string' },
                    required: true,
                    description: descriptionLines.join('<br>'),
                    examples: {
                        failure: {
                            description: 'Failed response',
                            value: examples[0],
                        },
                        success: {
                            description: 'Successful response',
                            value: examples[1],
                        },
                    },
                },
            },
        }),
    );
};
