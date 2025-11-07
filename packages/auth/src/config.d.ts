export declare const auth: import("better-auth").Auth<{
    providers: {
        id: string;
        clientId: string;
        clientSecret: string;
    }[];
    jwt: {
        secret: string;
    };
    session: {
        expiresIn: number;
    };
}>;
