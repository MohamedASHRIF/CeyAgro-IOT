export declare class SnsService {
    private readonly sns;
    private readonly logger;
    constructor();
    subscribeEmail(email: string): Promise<void>;
    sendSubscriptionEmail(email: string, name: string): Promise<void>;
    sendLoginSuccessEmail(email: string, name: string): Promise<void>;
}
